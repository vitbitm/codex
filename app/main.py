"""Entry point for the automated website testing API."""
from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models import TestRequest, TestRunListModel, TestRunModel
from .testing import REGISTRY, TestManager, available_tests

app = FastAPI(title="Automated Web Testing Suite", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"]
    ,
    allow_headers=["*"],
)

manager = TestManager(REGISTRY)


@app.get("/api/tests/available")
def get_available_tests():
    return {"tests": available_tests()}


@app.post("/api/tests", response_model=TestRunModel)
def start_tests(payload: TestRequest):
    invalid = [name for name in payload.test_types if name not in REGISTRY]
    if invalid:
        raise HTTPException(status_code=400, detail=f"Unknown test types: {', '.join(invalid)}")
    run = manager.start_run(payload.domain, payload.test_types)
    return TestRunModel.from_run(run)


@app.get("/api/tests", response_model=TestRunListModel)
def list_tests():
    runs = manager.list_runs()
    return TestRunListModel(runs=[TestRunModel.from_run(run) for run in runs])


@app.get("/api/tests/{run_id}", response_model=TestRunModel)
def get_test(run_id: str):
    run = manager.get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return TestRunModel.from_run(run)


@app.get("/")
def read_root():
    return {"message": "Automated Web Testing Suite API", "docs": "/docs"}

