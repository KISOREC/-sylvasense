.PHONY: help dev up down test test-backend test-frontend

help:
	@echo "Targets: up, down, dev, test, test-backend, test-frontend"

up:
	docker compose up --build

down:
	docker compose down

dev:
	docker compose up -d db redis

test: test-backend test-frontend

test-backend:
	cd backend && python -m pytest

test-frontend:
	cd frontend && npm test -- --run
