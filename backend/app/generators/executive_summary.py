from typing import Dict, Any
from app.generators.exclusive_summary import ExclusiveSummaryGenerator
from app.generators.executive_advisory import ExecutiveAdvisoryGenerator

class ExecutiveSummaryGenerator:
    """
    Backwards-compatible wrapper routing to ExclusiveSummaryGenerator.
    """

    @staticmethod
    def render(canonical_data: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
        return ExclusiveSummaryGenerator.render(canonical_data, config)

    @staticmethod
    def render_detailed_3page_summary(
        canonical_data: Dict[str, Any],
        config: Dict[str, Any]
    ) -> Dict[str, Any]:
        return ExclusiveSummaryGenerator.render(canonical_data, config)

__all__ = ["ExclusiveSummaryGenerator", "ExecutiveAdvisoryGenerator", "ExecutiveSummaryGenerator"]
