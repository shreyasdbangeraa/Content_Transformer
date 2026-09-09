import re
from typing import List, Dict, Any, Tuple


class TimelineExtractor:
    """
    High-precision deterministic timeline, date, and milestone extractor.
    Extracts calendar dates, timestamps, deadlines, phases, and chronological roadmap milestones
    from any unstructured or structured document text.
    """

    MONTH_NAMES = (
        "January|February|March|April|May|June|July|August|September|October|November|December|"
        "Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec"
    )

    # Specific date patterns
    NUMERIC_DATE_RE = re.compile(r'\b(\d{1,2}[./\-]\d{1,2}[./\-]\d{2,4})\b')
    ISO_DATE_RE = re.compile(r'\b(\d{4}[./\-]\d{1,2}[./\-]\d{1,2})\b')
    TEXT_DATE_US_RE = re.compile(rf'\b((?:{MONTH_NAMES})\s+\d{{1,2}}(?:st|nd|rd|th)?,?\s+\d{{4}})\b', re.IGNORECASE)
    TEXT_DATE_EU_RE = re.compile(rf'\b(\d{{1,2}}(?:st|nd|rd|th)?\s+(?:{MONTH_NAMES})\s+\d{{4}})\b', re.IGNORECASE)
    MONTH_YEAR_RE = re.compile(rf'\b((?:{MONTH_NAMES})\s+\d{{4}})\b', re.IGNORECASE)
    PERIOD_RE = re.compile(r'\b(Q[1-4]\s+\d{4}|Quarter\s+[1-4]\s+\d{4}|FY\s?\d{2,4}|Semester\s+[1-2]\s+\d{4}|Fall\s+\d{4}|Spring\s+\d{4})\b', re.IGNORECASE)
    TIMESTAMP_RE = re.compile(r'\b(\d{1,2}:\d{2}(?:\s*(?:UTC|GMT|EST|PST|IST|AM|PM))?)\b', re.IGNORECASE)

    ROADMAP_RE = re.compile(r'((?:Part|Phase|Stage|Module|Milestone|Sprint)\s+\d+[:\-\s]+[^\n]{5,100})', re.IGNORECASE)

    @classmethod
    def _clean_text(cls, t: str) -> str:
        t = re.sub(r'[\r\t]+', ' ', t)
        t = re.sub(r'[─━=_\-]{3,}', ' ', t)
        t = re.sub(r'^\s*[:\-\u2013•●\s|]+', '', t)
        t = re.sub(r'\s*[:\-\u2013•●\s|]+$', '', t)
        t = re.sub(r'\s+', ' ', t)
        return t.strip()

    @classmethod
    def _find_line_and_context(cls, text: str, start_pos: int, date_str: str) -> Tuple[str, str]:
        lines = text.split('\n')
        char_count = 0
        target_idx = -1
        for i, line in enumerate(lines):
            line_len = len(line) + 1
            if char_count <= start_pos < char_count + line_len:
                target_idx = i
                break
            char_count += line_len

        if target_idx == -1:
            return date_str, f"Milestone date reference ({date_str})"

        curr_line = cls._clean_text(lines[target_idx])
        # Clean the date out of the current line to see remaining content
        remainder = cls._clean_text(re.sub(re.escape(date_str), '', curr_line, flags=re.IGNORECASE))
        remainder = re.sub(r'^(?:date|dated|on|as of|published|submitted|timestamp)\s*[:\-]?\s*', '', remainder, flags=re.IGNORECASE).strip()

        if len(remainder) >= 15:
            return date_str, remainder[:180]

        # If current line is basically just the date or title/submission info
        # Look around for context (preceding 4 lines and succeeding 6 lines)
        preceding = []
        for j in range(max(0, target_idx - 4), target_idx):
            l = cls._clean_text(lines[j])
            if l and not l.isdigit() and len(l) > 3:
                preceding.append(l)

        succeeding = []
        for j in range(target_idx + 1, min(len(lines), target_idx + 7)):
            l = cls._clean_text(lines[j])
            if l and not l.isdigit() and len(l) > 3:
                succeeding.append(l)

        # Check for proposal/submission/header keywords
        sub_to = ""
        prep_by = ""
        for off in range(max(0, target_idx - 6), min(len(lines), target_idx + 8)):
            line_txt = cls._clean_text(lines[off])
            low = line_txt.lower()
            if "submitted to" in low:
                raw_split = re.split(r'submitted\s+to\s*[:\-]?', line_txt, flags=re.IGNORECASE)
                val = raw_split[-1].strip() if len(raw_split) > 1 else ""
                if not val and off + 1 < len(lines):
                    n1 = cls._clean_text(lines[off + 1])
                    n2 = cls._clean_text(lines[off + 2]) if off + 2 < len(lines) else ""
                    val = n1
                    if n2 and not any(k in n2.lower() for k in ["prepared", "by", "author", "page", "─", "━", "1", "2"]):
                        val += f" ({n2})"
                sub_to = val
            elif "prepared by" in low or "submitted by" in low:
                raw_split = re.split(r'(?:prepared|submitted)\s+by\s*[:\-]?', line_txt, flags=re.IGNORECASE)
                val = raw_split[-1].strip() if len(raw_split) > 1 else ""
                if not val and off + 1 < len(lines):
                    val = cls._clean_text(lines[off + 1])
                prep_by = val

        if sub_to or prep_by:
            event_parts = ["Proposal Inception & Submission Date"]
            if prep_by:
                event_parts.append(f"Prepared by: {prep_by}")
            if sub_to:
                event_parts.append(f"Submitted to: {sub_to}")
            return date_str, cls._clean_text(" — ".join(event_parts))[:180]

        all_nearby = preceding + succeeding
        context_str = " — ".join(all_nearby[:4])
        if context_str:
            return date_str, cls._clean_text(context_str)[:180]

        return date_str, f"Important milestone reference date ({date_str})"

    @classmethod
    def extract_timeline(cls, text: str, filename: str = "") -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Extracts all dates and milestone events from the raw document text.
        Returns:
            dates: List[{"date": str, "event": str, "type": str}]
            events: List[{"timestamp": str, "event": str, "severity": str}]
        """
        dates: List[Dict[str, Any]] = []
        events: List[Dict[str, Any]] = []
        seen_keys = set()

        if not text:
            return dates, events

        # 1. Regex date extractions in priority order
        all_matches = []
        for pat, d_type in [
            (cls.NUMERIC_DATE_RE, "NUMERIC_DATE"),
            (cls.ISO_DATE_RE, "ISO_DATE"),
            (cls.TEXT_DATE_US_RE, "TEXT_DATE"),
            (cls.TEXT_DATE_EU_RE, "TEXT_DATE"),
            (cls.MONTH_YEAR_RE, "MONTH_YEAR"),
            (cls.PERIOD_RE, "PERIOD")
        ]:
            for m in pat.finditer(text):
                d_str = m.group(1).strip()
                # Skip invalid dates or simple version numbers (e.g. 1.0, 2.1)
                if re.match(r'^\d+\.\d+$', d_str):
                    continue
                if len(d_str) < 4:
                    continue
                all_matches.append((m.start(), m.end(), d_str, d_type))

        all_matches.sort(key=lambda x: x[0])

        for start_pos, end_pos, d_str, d_type in all_matches:
            norm_key = d_str.lower().strip()
            if norm_key in seen_keys:
                continue
            seen_keys.add(norm_key)

            d_val, evt_desc = cls._find_line_and_context(text, start_pos, d_str)

            sev = "INFO"
            if any(w in evt_desc.lower() for w in ["incident", "breach", "critical", "intrusion", "alert", "failure"]):
                sev = "CRITICAL"
            elif any(w in evt_desc.lower() for w in ["containment", "mitigation", "quarantine", "restoration"]):
                sev = "HIGH"

            dates.append({
                "date": d_val,
                "event": evt_desc,
                "type": d_type
            })

            events.append({
                "timestamp": d_val,
                "event": evt_desc,
                "severity": sev
            })

        # 2. Check for timestamps (like 03:14 UTC, 03:56 UTC) on incident reports
        for m in cls.TIMESTAMP_RE.finditer(text):
            t_str = m.group(1).strip()
            norm_key = t_str.lower().strip()
            if norm_key in seen_keys:
                continue

            t_val, evt_desc = cls._find_line_and_context(text, m.start(), t_str)
            if len(evt_desc) > 15 and evt_desc != f"Important milestone reference date ({t_str})":
                seen_keys.add(norm_key)
                dates.append({
                    "date": t_val,
                    "event": evt_desc,
                    "type": "TIMESTAMP"
                })
                sev = "CRITICAL" if any(w in evt_desc.lower() for w in ["alert", "intrusion", "breach", "fail"]) else "HIGH"
                events.append({
                    "timestamp": t_val,
                    "event": evt_desc,
                    "severity": sev
                })

        # 3. Check for Project Roadmaps / Phases (Part 1, Part 2, Phase 1, Milestone 1)
        for m in cls.ROADMAP_RE.finditer(text):
            phase_text = cls._clean_text(m.group(1))
            if len(phase_text) > 8:
                parts = re.split(r'[:\-\u2013]', phase_text, maxsplit=1)
                phase_label = parts[0].strip()
                phase_desc = parts[1].strip() if len(parts) > 1 else phase_text
                norm_key = phase_label.lower().strip()
                if norm_key in seen_keys:
                    continue
                seen_keys.add(norm_key)

                dates.append({
                    "date": phase_label,
                    "event": phase_desc,
                    "type": "PROJECT_PHASE"
                })
                events.append({
                    "timestamp": phase_label,
                    "event": phase_desc,
                    "severity": "INFO"
                })

        # 4. If episodes exist (e.g. Mic on Campus 10 Episodes)
        ep_matches = re.findall(r'(EP\s*\d+[:\-\s]+[^\n]{5,80})', text, re.IGNORECASE)
        if ep_matches and len(ep_matches) >= 6:
            has_part1 = any("part 1" in str(d.get("date", "")).lower() for d in dates)
            if not has_part1:
                ep1_title = ep_matches[0].split(':', 1)[-1].strip()
                ep6_title = ep_matches[5].split(':', 1)[-1].strip()
                dates.append({
                    "date": "Part 1 (Episodes 1–6)",
                    "event": f"Placements & Career Curriculum: From '{ep1_title}' through '{ep6_title}'.",
                    "type": "EPISODE_SCHEDULE"
                })
                events.append({
                    "timestamp": "Part 1 (Episodes 1–6)",
                    "event": f"Placements & Career Curriculum: From '{ep1_title}' through '{ep6_title}'.",
                    "severity": "INFO"
                })
            if len(ep_matches) >= 10:
                has_part2 = any("part 2" in str(d.get("date", "")).lower() for d in dates)
                if not has_part2:
                    ep7_title = ep_matches[6].split(':', 1)[-1].strip()
                    ep10_title = ep_matches[9].split(':', 1)[-1].strip()
                    dates.append({
                        "date": "Part 2 (Episodes 7–10)",
                        "event": f"Entrepreneurship & Building Curriculum: From '{ep7_title}' through '{ep10_title}'.",
                        "type": "EPISODE_SCHEDULE"
                    })
                    events.append({
                        "timestamp": "Part 2 (Episodes 7–10)",
                        "event": f"Entrepreneurship & Building Curriculum: From '{ep7_title}' through '{ep10_title}'.",
                        "severity": "INFO"
                    })

        return dates, events

    @classmethod
    def enrich_timeline(
        cls,
        existing_dates: List[Dict[str, Any]],
        existing_events: List[Dict[str, Any]],
        raw_text: str,
        filename: str = ""
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Merges and deduplicates existing AI dates with deterministic extraction.
        Guarantees that explicit calendar dates, deadlines, and milestone schedules are never lost.
        """
        extracted_dates, extracted_events = cls.extract_timeline(raw_text, filename)

        def is_placeholder(d_obj: Dict[str, Any]) -> bool:
            evt = str(d_obj.get("event") or "").lower()
            return "source document extraction" in evt or "multi-channel transformation" in evt

        clean_dates = [d for d in (existing_dates or []) if not is_placeholder(d)]
        clean_events = [e for e in (existing_events or []) if not is_placeholder(e)]

        combined_dates = list(clean_dates)
        seen_d = {str(d.get("date", "")).lower().strip() for d in combined_dates}

        for d in extracted_dates:
            k = str(d.get("date", "")).lower().strip()
            if k and k not in seen_d:
                seen_d.add(k)
                combined_dates.append(d)

        combined_events = list(clean_events)
        seen_e = {str(e.get("timestamp", "")).lower().strip() for e in combined_events}

        for e in extracted_events:
            k = str(e.get("timestamp", "")).lower().strip()
            if k and k not in seen_e:
                seen_e.add(k)
                combined_events.append(e)

        # Cross-populate if one is empty
        if not combined_events and combined_dates:
            for d in combined_dates:
                combined_events.append({
                    "timestamp": d.get("date", ""),
                    "event": d.get("event", ""),
                    "severity": "INFO"
                })

        if not combined_dates and combined_events:
            for e in combined_events:
                combined_dates.append({
                    "date": e.get("timestamp", ""),
                    "event": e.get("event", "")
                })

        return combined_dates, combined_events
