"""
NeuraMed — Image Preprocessing Pipeline
Converts PIL Images to normalised PyTorch tensors.
"""

from __future__ import annotations

import torch
import torchvision.transforms as T
from PIL import Image, ImageOps

# ImageNet statistics — used for EfficientNet backbone
_IMAGENET_MEAN = [0.485, 0.456, 0.406]
_IMAGENET_STD  = [0.229, 0.224, 0.225]


def preprocess_image(
    image: Image.Image,
    target_size: tuple = (224, 224),
    augment: bool = False,
) -> torch.Tensor:
    """
    Preprocess a PIL image for CNN inference.

    Steps
    -----
    1. Resize with LANCZOS resampling
    2. AutoContrast enhancement (medical scans often low-contrast)
    3. Convert to tensor, normalise with ImageNet stats
    4. Add batch dimension -> (1, 3, H, W)

    Parameters
    ----------
    image       : PIL.Image — input scan (any mode, converted to RGB)
    target_size : (H, W) matching the model's INPUT_SIZE
    augment     : light test-time augmentation (horizontal flip average)

    Returns
    -------
    torch.Tensor of shape (1, 3, H, W), dtype=float32
    """
    if image.mode != "RGB":
        image = image.convert("RGB")

    # Contrast enhancement — equalise histogram for grayscale medical scans
    # (operates on each channel independently)
    r, g, b = image.split()
    r = ImageOps.autocontrast(r, cutoff=0.5)
    g = ImageOps.autocontrast(g, cutoff=0.5)
    b = ImageOps.autocontrast(b, cutoff=0.5)
    image = Image.merge("RGB", (r, g, b))

    transform = T.Compose([
        T.Resize(target_size, interpolation=T.InterpolationMode.LANCZOS),
        T.ToTensor(),
        T.Normalize(mean=_IMAGENET_MEAN, std=_IMAGENET_STD),
    ])

    tensor = transform(image).unsqueeze(0)  # (1, 3, H, W)

    if augment:
        # Simple TTA: average original + horizontal flip
        flip_tensor = transform(image.transpose(Image.FLIP_LEFT_RIGHT)).unsqueeze(0)
        tensor = (tensor + flip_tensor) / 2.0

    return tensor


def batch_preprocess(
    images: list,
    target_size: tuple = (224, 224),
) -> torch.Tensor:
    """Stack multiple images into a single batch tensor."""
    tensors = [preprocess_image(img, target_size).squeeze(0) for img in images]
    return torch.stack(tensors)  # (N, 3, H, W)
