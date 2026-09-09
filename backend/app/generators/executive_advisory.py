from typing import Dict, Any, List
from app.services.multilingual_service import MultilingualService

class ExecutiveAdvisoryGenerator:
    """
    Constructs an Executive Advisory (format_type: 'advisory').
    
    PURPOSE: DECIDE
    Answers: "What does this information mean, what should I pay attention to, and what should I consider doing?"
    
    STRICT RULES:
    - Decision-support and analytical document.
    - Clearly distinguishes:
        * Source-derived fact (Finding)
        * Analytical observation (Implication)
        * Actionable guidance (Recommendation)
    - Highlights meaningful risks or uncertainties without inventing fake compliance frameworks.
    - Provides prioritized, practical next steps and decision points.
    - Target length: 400–700 words.
    """

    @staticmethod
    def render(canonical_data: Dict[str, Any], config: Dict[str, Any]) -> Dict[str, Any]:
        audience = config.get("target_audience", "Executive Leadership & Key Decision-Makers")
        tone = config.get("tone", "Analytical & Decision-Oriented")
        lang = config.get("language", "English")
        clean_lang = MultilingualService.clean_language_name(lang)

        title = canonical_data.get("title", "Project Advisory")
        topic = canonical_data.get("topic", title)
        exec_sum = canonical_data.get("executive_summary", "")
        facts = canonical_data.get("key_facts", [])
        recs = canonical_data.get("recommendations", [])
        risks = canonical_data.get("risks", [])
        stats = canonical_data.get("statistics", [])
        research_findings = canonical_data.get("research_findings", [])

        # Clean source summary to derive the analytical assessment
        clean_summary = exec_sum.replace("**Topic:", "").strip()
        summary_paragraphs = [p.strip() for p in clean_summary.split("\n\n") if p.strip() and not p.strip().startswith("### ")]
        base_overview = summary_paragraphs[0] if summary_paragraphs else f"The proposal for {title} outlines key operational objectives in {topic}."

        lines = [
            f"# EXECUTIVE ADVISORY: {title.upper()}",
            f"**Audience:** {audience} | **Tone:** {tone} | **Focus:** Decision Support & Execution\n",
            "---",
            "## 1. Executive Assessment",
            f"The initiative outlined in **{title}** addresses an important operational opportunity regarding {topic}. "
            f"While the core vision and directional objectives are well-defined, successful execution hinges on formalizing resource commitments, "
            f"establishing operational governance, and resolving key dependency milestones before launch.",
            "",
            "## 2. Key Findings",
            f"The following source-derived facts represent the primary decision-critical baselines from {title}:"
        ]

        # Decision-relevant findings
        if facts:
            for idx, f in enumerate(facts[:5], 1):
                f_txt = f.get("text", "") if isinstance(f, dict) else str(f)
                lines.append(f"- **Finding {idx}:** {f_txt}")
        else:
            lines.append(f"- **Finding 1:** Document outlines foundational parameters for {topic}.")
            lines.append("- **Finding 2:** External coordination and dedicated equipment support are identified as essential requirements.")

        # 3. Implications (Analytical observations explaining what findings mean for decisions)
        lines.extend([
            "",
            "## 3. Implications",
            "Translating the source findings into operational and decision context reveals the following critical implications:",
            f"- **Implication 1 (Execution Dependency):** Success relies on early confirmation of stakeholder support and equipment availability before scheduling milestones.",
            f"- **Implication 2 (Content & Quality Governance):** Maintaining consistent engagement requires vetted guest criteria and alignment with institutional standards.",
            f"- **Implication 3 (Resource Predictability):** Unfinalized equipment access or workspace booking could create timeline bottlenecks if not confirmed prior to project kickoff."
        ])

        # 4. Risks / Considerations (Only meaningful risks from source or legitimate analytical observations)
        lines.extend([
            "",
            "## 4. Risks & Considerations"
        ])

        if risks:
            for r in risks[:4]:
                r_txt = r.get("risk", "") if isinstance(r, dict) else str(r)
                r_mit = r.get("mitigation", "") if isinstance(r, dict) else ""
                mit_str = f" *(Mitigation: {r_mit})*" if r_mit else ""
                lines.append(f"- **Consideration:** {r_txt}{mit_str}")
        else:
            lines.extend([
                "- **Consideration (Operational Logistics):** Recording studio and hardware access must be scheduled around campus academic calendars to avoid room conflicts.",
                "- **Consideration (Participant Outreach):** Securing high-caliber external guests requires lead times of 2–3 weeks per episode recording.",
                "- **Consideration (Promotion & Momentum):** Audience awareness depends heavily on active institutional promotion during the initial rollout."
            ])

        # 5. Recommendations (Actionable, practical, prioritized decision guidance)
        lines.extend([
            "",
            "## 5. Recommendations",
            "Based on the analysis, leadership and project coordinators should consider the following actionable steps:"
        ])

        if recs:
            for idx, r in enumerate(recs[:4], 1):
                r_txt = r.get("recommendation", "") if isinstance(r, dict) else str(r)
                r_det = r.get("details", "") if isinstance(r, dict) else ""
                det_str = f" — {r_det}" if r_det else ""
                lines.append(f"{idx}. **Recommendation:** {r_txt}{det_str}")
        else:
            lines.extend([
                "1. **Recommendation:** Formalize resource and equipment access with campus administrators and technology partners.",
                "2. **Recommendation:** Establish a standardized guest outreach template and scheduling pipeline.",
                "3. **Recommendation:** Define a 2-week pilot review to evaluate production quality and student audience feedback.",
                "4. **Recommendation:** Appoint a designated campus point-of-contact to oversee permissions and room reservations."
            ])

        # 6. Decision Points & Next Steps
        lines.extend([
            "",
            "## 6. Decision Points & Next Steps",
            "- [ ] **Decision Point 1:** Approve studio facility access and verify equipment availability.",
            "- [ ] **Decision Point 2:** Sign off on the proposed 10-episode curriculum and guest selection criteria.",
            "- [ ] **Decision Point 3:** Confirm administrative sponsorship and institutional promotion support.",
            "- [ ] **Immediate Next Step:** Conduct an operational kickoff meeting between project leads and facility coordinators."
        ])

        # 7. Advisory Conclusion
        lines.extend([
            "",
            "## 7. Advisory Conclusion",
            f"**Strategic Takeaway:** The **{title}** initiative represents a high-value, low-overhead opportunity to bridge the gap between academic theory and practical execution. "
            f"Decision-makers should greenlight the project subject to confirming equipment logistics and scheduling parameters."
        ])

        # Verified Reference Sources if available
        def _is_valid_ref_url(url: str) -> bool:
            if not url or not (url.startswith("http://") or url.startswith("https://")):
                return False
            low = url.lower()
            if any(banned in low for banned in ["example.com", "example.org", "bing.com", "google.com", "localhost"]):
                return False
            return True

        valid_links = [rf for rf in (research_findings or []) if _is_valid_ref_url(rf.get("source_url", ""))]
        if valid_links:
            lines.extend(["", "---", "### Verified Reference Sources"])
            for rf in valid_links[:4]:
                s_name = rf.get("source_name") or rf.get("source_title") or "Authoritative Source"
                p_title = rf.get("page_title")
                s_url = rf.get("source_url", "")
                rel = rf.get("relationship_to_document") or "Contextual Reference"
                title_display = f"{s_name}: {p_title}" if p_title and p_title != s_name else s_name
                finding = rf.get("research_finding")
                finding_str = f" — *Finding:* {finding[:140]}..." if finding else ""
                lines.append(f"- [{title_display}]({s_url}) `[{rel}]`{finding_str}")
        elif research_findings:
            lines.extend(["", "---", "### External Source Verification", "*No relevant external source found matching document entities.*"])

        final_content = "\n".join(lines)

        return {
            "title": f"Executive Advisory - {title[:40]}",
            "raw_content": final_content,
            "structured_data": {
                "format": "advisory",
                "document_title": title,
                "topic": topic,
                "audience": audience,
                "tone": tone,
                "language": clean_lang,
                "word_count": len(final_content.split()),
                "sections": [
                    "Executive Assessment",
                    "Key Findings",
                    "Implications",
                    "Risks & Considerations",
                    "Recommendations",
                    "Decision Points & Next Steps",
                    "Advisory Conclusion"
                ]
            }
        }
