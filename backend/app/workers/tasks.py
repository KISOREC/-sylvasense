from app.core.celery_app import celery_app


@celery_app.task(name="sylvasense.health_check")
def health_check_task() -> str:
    return "ok"
