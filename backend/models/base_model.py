"""
NeuraMed — Base CNN Model
EfficientNet-B3 backbone with task-specific classification head.
All 6 imaging modules inherit from this class.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import Optional

import numpy as np
import torch
import torch.nn as nn
import torchvision.models as tv_models

log = logging.getLogger("neuramed.model")

WEIGHTS_DIR = Path(__file__).parent.parent / "weights"


class BaseImagingModel:
    """
    Shared foundation for all NeuraMed imaging modules.

    Each subclass declares:
      - MODULE_NAME    : str          — used for weight-file lookup
      - CLASSES        : list[str]    — ordered class labels
      - INPUT_SIZE     : tuple[int,int]
      - BACKBONE       : str          — torchvision model name
      - URGENCY_MAP    : dict[str,str] — class -> urgency level
    """

    MODULE_NAME: str        = "base"
    CLASSES:     list[str]  = []
    INPUT_SIZE:  tuple      = (224, 224)
    BACKBONE:    str        = "efficientnet_b3"
    URGENCY_MAP: dict       = {}

    def __init__(self, device: str = "cpu"):
        self.device     = torch.device(device)
        self.input_size = self.INPUT_SIZE
        self._model     = self._build_network()
        self._load_weights()
        self._model.eval()

    # -- Architecture ----------------------------------------------------------
    def _build_network(self) -> nn.Module:
        """EfficientNet-B3 with a custom classification head."""
        weights_enum = tv_models.EfficientNet_B3_Weights.IMAGENET1K_V1
        backbone = tv_models.efficientnet_b3(weights=weights_enum)

        # Replace classifier for medical task
        in_features = backbone.classifier[1].in_features
        backbone.classifier = nn.Sequential(
            nn.Dropout(p=0.3, inplace=True),
            nn.Linear(in_features, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(p=0.2),
            nn.Linear(512, len(self.CLASSES)),
        )
        return backbone.to(self.device)

    def _load_weights(self):
        """Load fine-tuned weights if available; otherwise use ImageNet init."""
        weight_path = WEIGHTS_DIR / f"{self.MODULE_NAME}.pth"
        if weight_path.exists():
            try:
                state = torch.load(weight_path, map_location=self.device)
                self._model.load_state_dict(state, strict=False)
                log.info(f"[{self.MODULE_NAME}] loaded fine-tuned weights")
            except Exception as e:
                log.warning(f"[{self.MODULE_NAME}] weight load failed ({e}); using ImageNet init")
        else:
            log.info(f"[{self.MODULE_NAME}] no fine-tuned weights found — using ImageNet backbone")

    # -- Inference -------------------------------------------------------------
    @torch.inference_mode()
    def predict(self, tensor: torch.Tensor) -> dict:
        """
        Run forward pass and return structured prediction.

        Returns
        -------
        {
          "predicted_class": str,
          "confidence":      float,          # 0-100
          "probabilities":   [{class, prob}],
          "urgency":         str,
        }
        """
        tensor = tensor.to(self.device)
        logits = self._model(tensor)                     # (1, num_classes)
        probs  = torch.softmax(logits, dim=1).squeeze()  # (num_classes,)

        probs_np  = probs.cpu().numpy()
        top_idx   = int(np.argmax(probs_np))
        top_class = self.CLASSES[top_idx]
        confidence = float(probs_np[top_idx]) * 100

        prob_list = [
            {"class": c, "probability": round(float(p) * 100, 2)}
            for c, p in zip(self.CLASSES, probs_np)
        ]
        prob_list.sort(key=lambda x: x["probability"], reverse=True)

        return {
            "predicted_class": top_class,
            "confidence":      round(confidence, 2),
            "probabilities":   prob_list,
            "urgency":         self.URGENCY_MAP.get(top_class, "info"),
        }

    # -- Utility ---------------------------------------------------------------
    def __repr__(self):
        return (
            f"{self.__class__.__name__}("
            f"classes={self.CLASSES}, "
            f"input={self.INPUT_SIZE}, "
            f"device={self.device})"
        )
