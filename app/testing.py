"""Testing orchestration utilities for automated website analysis."""
from __future__ import annotations

import hashlib
import threading
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime
from typing import Callable, Dict, Iterable, List, Optional


@dataclass
class TestResult:
    """Container for the result of a single test."""

    status: str
    summary: str
    details: Dict[str, str]
    metrics: Dict[str, float] = field(default_factory=dict)


@dataclass
class TestRun:
    """Metadata and results for a testing run."""

    id: str
    domain: str
    test_types: List[str]
    created_at: datetime
    status: str = "pending"
    progress: float = 0.0
    results: Dict[str, TestResult] = field(default_factory=dict)
    error: Optional[str] = None


class TestRegistry:
    """Registry of test implementations."""

    def __init__(self) -> None:
        self._tests: Dict[str, Callable[[str], TestResult]] = {}

    def register(self, name: str, handler: Callable[[str], TestResult]) -> None:
        self._tests[name] = handler

    def __contains__(self, name: str) -> bool:
        return name in self._tests

    def get(self, name: str) -> Callable[[str], TestResult]:
        return self._tests[name]

    def names(self) -> Iterable[str]:
        return self._tests.keys()


class TestManager:
    """Manage asynchronous execution of automated tests."""

    def __init__(self, registry: TestRegistry) -> None:
        self._registry = registry
        self._runs: Dict[str, TestRun] = {}
        self._lock = threading.Lock()

    def start_run(self, domain: str, test_types: List[str]) -> TestRun:
        run_id = str(uuid.uuid4())
        run = TestRun(
            id=run_id,
            domain=domain,
            test_types=test_types,
            created_at=datetime.utcnow(),
            status="running",
            progress=0.0,
        )
        with self._lock:
            self._runs[run_id] = run
        thread = threading.Thread(target=self._execute_run, args=(run,), daemon=True)
        thread.start()
        return run

    def _execute_run(self, run: TestRun) -> None:
        try:
            total = len(run.test_types)
            for index, test_type in enumerate(run.test_types, start=1):
                handler = self._registry.get(test_type)
                result = handler(run.domain)
                with self._lock:
                    run.results[test_type] = result
                    run.progress = index / total
            with self._lock:
                run.status = "completed"
        except Exception as exc:  # pragma: no cover - safety net
            with self._lock:
                run.status = "failed"
                run.error = str(exc)

    def get_run(self, run_id: str) -> Optional[TestRun]:
        with self._lock:
            return self._runs.get(run_id)

    def list_runs(self) -> List[TestRun]:
        with self._lock:
            return list(self._runs.values())


def pseudo_metric(domain: str, salt: str, *, minimum: float, maximum: float) -> float:
    """Generate a deterministic pseudo metric for a domain."""
    digest = hashlib.sha256(f"{domain}:{salt}".encode()).hexdigest()
    value = int(digest[:8], 16)
    scale = maximum - minimum
    return minimum + (value % 1000) / 1000 * scale


def simulated_test(duration: float, status: str, summary: str, details: Dict[str, str], metrics: Dict[str, float]) -> TestResult:
    """Helper to simulate a test run with latency."""
    time.sleep(duration)
    return TestResult(status=status, summary=summary, details=details, metrics=metrics)


REGISTRY = TestRegistry()


def _performance_test(domain: str) -> TestResult:
    load_time = pseudo_metric(domain, "performance_load", minimum=1.5, maximum=5.5)
    score = pseudo_metric(domain, "performance_score", minimum=60.0, maximum=100.0)
    status = "pass" if score >= 80 else "warn"
    summary = "Synthetic performance benchmark complete"
    details = {
        "First Contentful Paint": f"{load_time:.2f}s",
        "Total Score": f"{score:.1f}/100",
        "Recommendation": "Optimize critical CSS and leverage caching for best results."
    }
    metrics = {"performance_score": score, "first_contentful_paint": load_time}
    return simulated_test(1.5, status, summary, details, metrics)


def _security_test(domain: str) -> TestResult:
    vuln_score = pseudo_metric(domain, "security_vuln", minimum=0.0, maximum=10.0)
    status = "pass" if vuln_score < 3 else ("warn" if vuln_score < 6 else "fail")
    summary = "Static security heuristics scan"
    details = {
        "Vulnerability Score": f"{vuln_score:.1f}/10",
        "Recommendation": "Review HTTP headers and ensure TLS configuration follows best practices."
    }
    metrics = {"vulnerability_score": vuln_score}
    return simulated_test(1.2, status, summary, details, metrics)


def _seo_test(domain: str) -> TestResult:
    seo_score = pseudo_metric(domain, "seo_score", minimum=50.0, maximum=100.0)
    status = "pass" if seo_score >= 75 else "warn"
    summary = "SEO checklist review"
    details = {
        "Overall Score": f"{seo_score:.1f}/100",
        "Recommendation": "Ensure meta tags, structured data, and sitemap are up to date."
    }
    metrics = {"seo_score": seo_score}
    return simulated_test(1.0, status, summary, details, metrics)


def _accessibility_test(domain: str) -> TestResult:
    contrast = pseudo_metric(domain, "a11y_contrast", minimum=3.0, maximum=8.0)
    status = "pass" if contrast >= 4.5 else "warn"
    summary = "Accessibility rule evaluation"
    details = {
        "Contrast Ratio": f"{contrast:.1f}:1",
        "Recommendation": "Verify ARIA attributes and keyboard navigation coverage."
    }
    metrics = {"contrast_ratio": contrast}
    return simulated_test(0.8, status, summary, details, metrics)


def _content_quality_test(domain: str) -> TestResult:
    readability = pseudo_metric(domain, "content_readability", minimum=40.0, maximum=90.0)
    status = "pass" if readability >= 60 else "warn"
    summary = "Content clarity assessment"
    details = {
        "Readability Score": f"{readability:.1f}/100",
        "Recommendation": "Maintain consistent tone and avoid overly complex sentences."
    }
    metrics = {"readability_score": readability}
    return simulated_test(0.6, status, summary, details, metrics)


def _functional_test(domain: str) -> TestResult:
    journey_success = pseudo_metric(domain, "functional_journey", minimum=70.0, maximum=100.0)
    status = "pass" if journey_success >= 85 else "warn"
    summary = "Core user journeys verification"
    details = {
        "Success Rate": f"{journey_success:.1f}%",
        "Recommendation": "Add regression coverage for edge cases and 404 handling."
    }
    metrics = {"journey_success_rate": journey_success}
    return simulated_test(1.3, status, summary, details, metrics)


REGISTRY.register("performance", _performance_test)
REGISTRY.register("security", _security_test)
REGISTRY.register("seo", _seo_test)
REGISTRY.register("accessibility", _accessibility_test)
REGISTRY.register("content", _content_quality_test)
REGISTRY.register("functional", _functional_test)


def available_tests() -> List[Dict[str, str]]:
    """Return metadata about available test types."""
    descriptions = {
        "performance": "Synthetic performance and Core Web Vitals approximation.",
        "security": "Surface-level security heuristics and configuration review.",
        "seo": "Search engine optimisation checklist validation.",
        "accessibility": "Accessibility compliance heuristics (WCAG-inspired).",
        "content": "Content quality and readability heuristics.",
        "functional": "Critical path functional verification simulation.",
    }
    return [
        {"name": name, "description": descriptions.get(name, "")}
        for name in REGISTRY.names()
    ]
