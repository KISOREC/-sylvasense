# AI model modules

Each model family owns its preprocessing assumptions, input/output contract, tests, and evaluation evidence. Shared inference orchestration belongs in `inference/`; reproducible training in `training/`; model evaluation and limitations in `evaluation/`; immutable model metadata in `model_registry/`.

Model outputs are predictions, not field-verified observations. Record model version, imagery dates, confidence, and uncertainty. Never interpret an anomaly by itself as proof of illegal activity.
