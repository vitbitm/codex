"""Pydantic models for the API."""
from __future__ import annotations

from typing import Dict, List, Optional

from pydantic import BaseModel, Field, validator

from .testing import TestResult


class TestRequest(BaseModel):
    domain: str = Field(..., description="Domain name of the website to analyse")
    test_types: List[str] = Field(..., description="List of test identifiers to run")

    @validator("domain")
    def validate_domain(cls, value: str) -> str:
        if not value:
            raise ValueError("Domain must not be empty")
        if " " in value:
            raise ValueError("Domain must not contain spaces")
        if value.startswith("http://") or value.startswith("https://"):
            value = value.split("//", 1)[1]
        if "/" in value:
            raise ValueError("Provide only the domain, without path components")
        return value.strip().lower()

    @validator("test_types")
    def validate_test_types(cls, value: List[str]) -> List[str]:
        if not value:
            raise ValueError("Select at least one test to run")
        return value


class TestResultModel(BaseModel):
    status: str
    summary: str
    details: Dict[str, str]
    metrics: Dict[str, float]

    @classmethod
    def from_result(cls, result: TestResult) -> "TestResultModel":
        return cls(
            status=result.status,
            summary=result.summary,
            details=result.details,
            metrics=result.metrics,
        )


class TestRunModel(BaseModel):
    id: str
    domain: str
    test_types: List[str]
    status: str
    progress: float
    created_at: str
    error: Optional[str]
    results: Dict[str, TestResultModel]

    @classmethod
    def from_run(cls, run) -> "TestRunModel":  # pragma: no cover - simple mapper
        return cls(
            id=run.id,
            domain=run.domain,
            test_types=run.test_types,
            status=run.status,
            progress=run.progress,
            created_at=run.created_at.isoformat() + "Z",
            error=run.error,
            results={name: TestResultModel.from_result(result) for name, result in run.results.items()},
        )


class TestRunListModel(BaseModel):
    runs: List[TestRunModel]

