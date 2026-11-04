# Data dictionary (initial conventions)

This document records conventions only; no operational forest division or satellite dataset is included.

| Concept | Required provenance / semantics |
|---|---|
| Source imagery | Provider/collection, asset identifier, acquisition date/time, bands, resolution, and source CRS |
| Spatial geometry | Geometry type, declared SRID, original source CRS, transformation history, source authority |
| Model prediction | Model name/version, input source IDs and dates, output label, confidence, uncertainty |
| Field observation | Observer/source, observation date, verification status, and evidence reference |
| Operational alert | Human-reviewed severity/status, supporting evidence, prediction reference, decision history |

Confidence and uncertainty are not severity. Predictions must not be conflated with field observations. Synthetic fixtures must be conspicuously labeled.
