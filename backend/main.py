"""
NeuraMed v5.0 — Vision Core Backend
FastAPI server for 6-module medical imaging inference.
Zero data retention: images are processed in-memory and never persisted.
"""

from __future__ import annotations

import io
import logging
import time
from contextlib import asynccontextmanager
from typing import Optional

import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image

from models.alzheimers    import AlzheimersModel
from models.brain_tumor   import BrainTumorModel
from models.covid_xray    import CovidXRayModel
from models.lumbar_spine  import LumbarSpineModel
from models.lung_disease  import LungDiseaseModel
from models.neuroimaging  import NeuroimagingModel
from utils.preprocessing  import preprocess_image
from utils.report         import build_report

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("neuramed.server")

# -- Model registry ------------------------------------------------------------
MODELS: dict[str, object] = {}

MODULE_MAP = {
    "brain_tumor":   BrainTumorModel,
    "alzheimers":    AlzheimersModel,
    "lung_disease":  LungDiseaseModel,
    "lumbar_spine":  LumbarSpineModel,
    "neuroimaging":  NeuroimagingModel,
    "covid_xray":    CovidXRayModel,
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load all 6 CNN models at startup; release on shutdown."""
    log.info("NeuraMed Vision Core — loading 6 imaging modules...")
    device = "cuda" if torch.cuda.is_available() else "cpu"
    log.info(f"Inference device: {device.upper()}")
    for name, cls in MODULE_MAP.items():
        try:
            MODELS[name] = cls(device=device)
            log.info(f"  [OK] {name} loaded")
        except Exception as e:
            log.error(f"  [FAIL] {name} failed to load: {e}")
    log.info(f"Vision Core ready — {len(MODELS)}/6 modules active")
    yield
    MODELS.clear()
    log.info("Vision Core shut down. No data retained.")


# -- App -----------------------------------------------------------------------
app = FastAPI(
    title="NeuraMed Vision Core",
    version="5.0.0",
    description="6-module medical imaging inference API. Zero data retention.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# -- Helpers -------------------------------------------------------------------
def _load_image(data: bytes) -> Image.Image:
    try:
        img = Image.open(io.BytesIO(data)).convert("RGB")
        if img.width < 32 or img.height < 32:
            raise ValueError("Image too small (minimum 32x32)")
        return img
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Invalid image: {e}")


def _run_inference(module: str, image: Image.Image) -> dict:
    if module not in MODELS:
        raise HTTPException(status_code=503, detail=f"Module '{module}' not available")
    t0 = time.perf_counter()
    tensor = preprocess_image(image, target_size=MODELS[module].input_size)
    result = MODELS[module].predict(tensor)
    result["inference_ms"] = round((time.perf_counter() - t0) * 1000, 1)
    return result


# -- Endpoints -----------------------------------------------------------------
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "version": "5.0.0",
        "modules": {k: "active" for k in MODELS},
        "device": "cuda" if torch.cuda.is_available() else "cpu",
    }


@app.get("/modules")
async def list_modules():
    from models.registry import MODULE_META
    return {"modules": MODULE_META}


@app.post("/analyze/{module}")
async def analyze(module: str, file: UploadFile = File(...)):
    """
    Run inference for a specific imaging module.
    Image data is processed in-memory and never written to disk.
    """
    if module not in MODULE_MAP:
        raise HTTPException(
            status_code=404,
            detail=f"Unknown module '{module}'. Available: {list(MODULE_MAP)}"
        )

    raw = await file.read()
    if len(raw) > 50 * 1024 * 1024:  # 50 MB hard cap
        raise HTTPException(status_code=413, detail="File exceeds 50 MB limit")

    image  = _load_image(raw)
    result = _run_inference(module, image)
    report = build_report(module, result)

    # -- Zero-retention guarantee --
    del raw
    del image

    return JSONResponse(content={
        "module":   module,
        "result":   result,
        "report":   report,
        "retained": False,
    })


@app.post("/analyze/batch")
async def analyze_batch(
    brain_tumor:  Optional[UploadFile] = File(None),
    alzheimers:   Optional[UploadFile] = File(None),
    lung_disease: Optional[UploadFile] = File(None),
    lumbar_spine: Optional[UploadFile] = File(None),
    neuroimaging: Optional[UploadFile] = File(None),
    covid_xray:   Optional[UploadFile] = File(None),
):
    """Run multiple modules in a single request (for multi-scan workflows)."""
    uploads = {
        "brain_tumor":  brain_tumor,
        "alzheimers":   alzheimers,
        "lung_disease": lung_disease,
        "lumbar_spine": lumbar_spine,
        "neuroimaging": neuroimaging,
        "covid_xray":   covid_xray,
    }
    results = {}
    for mod, upload in uploads.items():
        if upload is None:
            continue
        raw    = await upload.read()
        image  = _load_image(raw)
        result = _run_inference(mod, image)
        results[mod] = {"result": result, "report": build_report(mod, result)}
        del raw, image

    return JSONResponse(content={"results": results, "retained": False})
