from dataclasses import dataclass
from datetime import date
from typing import Protocol


@dataclass(frozen=True)
class ChangeDetectionRequest:
    region_id: str
    baseline_date: date
    comparison_date: date
    source_asset_ids: tuple[str, ...]


@dataclass(frozen=True)
class ChangeDetectionResult:
    geometry: dict[str, object]
    confidence: float
    uncertainty: float
    model_version: str


class ChangeDetector(Protocol):
    def detect(self, request: ChangeDetectionRequest) -> list[ChangeDetectionResult]:
        """Return model predictions that require review; never assert illegality."""
        ...
