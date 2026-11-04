from dataclasses import dataclass
from datetime import date
from typing import Protocol


@dataclass(frozen=True)
class AcquisitionRequest:
    region_id: str
    start_date: date
    end_date: date
    collections: tuple[str, ...]


class SatelliteAcquirer(Protocol):
    def search(self, request: AcquisitionRequest) -> list[dict[str, object]]:
        """Return source catalog records; do not synthesize observations."""
        ...
