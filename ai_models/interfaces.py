from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class Prediction:
    label: str
    confidence: float
    uncertainty: float
    model_name: str
    model_version: str


class ForestModel(Protocol):
    def predict(self, input_asset_id: str) -> list[Prediction]:
        """Predict from a referenced input asset; implementations must preserve provenance."""
        ...
