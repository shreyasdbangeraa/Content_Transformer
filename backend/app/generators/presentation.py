import os
import re
from typing import Dict, Any, List
import pptx
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN
from app.config import settings


class PresentationGenerator:
    """
    Generates world-class, professional Microsoft PowerPoint (.pptx) presentations.
    Features:
    - Executive Dark Title/Cover Slide with glowing accents & strategic objective cards
    - Clean Studio Light Content Slides with card containers, numeric badges, and dynamic layouts
    - Cinematic Executive Conclusion / Takeaway Slide
    - Contextual category pill tagging (Problem, Solution, Roadmap, Outcomes, Support)
    - Full markdown formatting support (**bold**, *italic*) and speaker notes
    """

    @staticmethod
    def _parse_bullet_lead(bullet_text: str):
        """Extracts lead-in title and body from a bullet point."""
        bullet = re.sub(r'^[•\-\*]\s*', '', str(bullet_text).strip())
        if bullet.startswith('**') and '**:' in bullet:
            idx = bullet.index('**:')
            lead = bullet[2:idx].strip()
            body = bullet[idx+3:].strip()
            return lead, body
        elif ':' in bullet:
            parts = bullet.split(':', 1)
            if 3 <= len(parts[0].strip()) <= 45 and '\n' not in parts[0]:
                return parts[0].strip().strip('*'), parts[1].strip()
        return None, bullet

    @staticmethod
    def _add_formatted_runs(paragraph, text: str, font_size: int, font_color: RGBColor, is_bold_default: bool = False):
        """Parses markdown bold and italic formatting into native PPTX text runs."""
        parts = re.split(r'(\*\*.*?\*\*|__.*?__|\*.*?\*|`.*?`)', text)
        for part in parts:
            if not part:
                continue
            if (part.startswith('**') and part.endswith('**') and len(part) >= 4) or \
               (part.startswith('__') and part.endswith('__') and len(part) >= 4):
                run = paragraph.add_run()
                run.text = part[2:-2]
                run.font.bold = True
                run.font.size = Pt(font_size)
                run.font.color.rgb = font_color
                run.font.name = 'Calibri'
            elif part.startswith('*') and part.endswith('*') and len(part) >= 2:
                run = paragraph.add_run()
                run.text = part[1:-1]
                run.font.italic = True
                run.font.size = Pt(font_size)
                run.font.color.rgb = font_color
                run.font.name = 'Calibri'
            else:
                run = paragraph.add_run()
                run.text = part
                run.font.bold = is_bold_default
                run.font.size = Pt(font_size)
                run.font.color.rgb = font_color
                run.font.name = 'Calibri'

    @staticmethod
    def _get_category_tag(title: str, idx: int) -> str:
        """Generates an executive category label based on slide semantics."""
        t_lower = title.lower()
        if any(k in t_lower for k in ["problem", "challenge", "gap", "incident", "threat", "pain"]):
            return "PROBLEM ANALYSIS & NEED"
        elif any(k in t_lower for k in ["solution", "approach", "initiative", "mechanism", "strategy", "architecture"]):
            return "STRATEGIC SOLUTION & METHODOLOGY"
        elif any(k in t_lower for k in ["roadmap", "timeline", "episode", "phase", "schedule", "track"]):
            return "EXECUTION ROADMAP & TRACKS"
        elif any(k in t_lower for k in ["outcome", "impact", "result", "metric", "benefit", "deliverable"]):
            return "EXPECTED OUTCOMES & VALUE"
        elif any(k in t_lower for k in ["support", "resource", "budget", "need", "requirement", "ask"]):
            return "RESOURCE ALLOCATION & SUPPORT"
        elif any(k in t_lower for k in ["takeaway", "conclusion", "summary", "closing", "next step"]):
            return "STRATEGIC CONCLUSION & NEXT STEPS"
        return f"SECTION 0{idx + 1} // STRATEGIC BRIEF"

    @classmethod
    def render_pptx(cls, deck_data: Dict[str, Any], output_filename: str) -> str:
        prs = Presentation()
        prs.slide_width = Inches(13.333)  # 16:9 widescreen
        prs.slide_height = Inches(7.5)
        blank_layout = prs.slide_layouts[6]

        # Executive Color Palette
        COLOR_DARK_BG = RGBColor(11, 19, 43)        # Luxury Navy
        COLOR_DARK_CARD = RGBColor(22, 33, 62)      # Deep Navy Card
        COLOR_DARK_BORDER = RGBColor(41, 53, 86)    # Dark Card Border
        COLOR_LIGHT_BG = RGBColor(255, 255, 255)    # Studio White
        COLOR_LIGHT_CARD = RGBColor(248, 250, 252)  # Slate 50
        COLOR_LIGHT_BORDER = RGBColor(226, 232, 240)# Slate 200
        COLOR_PRIMARY = RGBColor(37, 99, 235)       # Electric Royal Blue
        COLOR_ACCENT = RGBColor(2, 132, 199)        # Sky Blue
        COLOR_CYAN = RGBColor(56, 189, 248)         # Cyan Highlight
        COLOR_TEXT_DARK = RGBColor(15, 23, 42)      # Slate 900
        COLOR_TEXT_BODY = RGBColor(51, 65, 85)      # Slate 700
        COLOR_TEXT_MUTED = RGBColor(100, 116, 139)  # Slate 500
        COLOR_TEXT_WHITE = RGBColor(255, 255, 255)
        COLOR_TAG_BG = RGBColor(239, 246, 255)      # Blue 50
        COLOR_TAG_BORDER = RGBColor(191, 219, 254)  # Blue 200

        slides: List[Dict[str, Any]] = deck_data.get("slides", [])
        deck_title = deck_data.get("deck_title", "Executive Strategic Presentation")

        # If no slides array provided, create a fallback single slide
        if not slides:
            slides = [{
                "slide_number": 1,
                "title": deck_title,
                "subtitle": "Source-Grounded Briefing",
                "bullets": ["Executive Briefing generated by conteX AI"],
                "speaker_notes": "Welcome to this briefing."
            }]

        total_slides = len(slides)

        for idx, s in enumerate(slides):
            is_first_slide = (idx == 0)
            is_last_slide = (idx == total_slides - 1 and total_slides >= 3)

            slide = prs.slides.add_slide(blank_layout)

            # -----------------------------------------------------------------
            # 1. SLIDE 1: EXECUTIVE COVER / TITLE SLIDE (Dark Luxury Edition)
            # -----------------------------------------------------------------
            if is_first_slide:
                bg = slide.background
                bg.fill.solid()
                bg.fill.fore_color.rgb = COLOR_DARK_BG

                # Top Accent Gradient Line
                top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.08))
                top_bar.fill.solid()
                top_bar.fill.fore_color.rgb = COLOR_ACCENT
                top_bar.line.fill.background()

                # Left Decorative Vertical Accent Strip
                left_bar = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.9), Inches(1.1), Inches(0.08), Inches(4.8))
                left_bar.fill.solid()
                left_bar.fill.fore_color.rgb = COLOR_PRIMARY
                left_bar.line.fill.background()

                # Category Pill Tag
                tag = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(1.1), Inches(3.6), Inches(0.42))
                tag.fill.solid()
                tag.fill.fore_color.rgb = COLOR_DARK_CARD
                tag.line.color.rgb = COLOR_ACCENT
                tag.line.width = Pt(1)
                tt = tag.text_frame
                tt.margin_left = Inches(0.15)
                tt.margin_top = Inches(0.08)
                tp = tt.paragraphs[0]
                tp.text = "STRATEGIC BRIEFING • SOURCE-GROUNDED"
                tp.font.size = Pt(9.5)
                tp.font.bold = True
                tp.font.color.rgb = COLOR_CYAN
                tp.font.name = 'Calibri'

                # Main Presentation Title & Subtitle
                title_box = slide.shapes.add_textbox(Inches(1.2), Inches(1.7), Inches(11.2), Inches(2.2))
                tf = title_box.text_frame
                tf.word_wrap = True
                tf.margin_left = Inches(0)
                tf.margin_top = Inches(0)

                cover_title = s.get("title") or deck_title
                p_title = tf.paragraphs[0]
                p_title.text = cover_title
                p_title.font.size = Pt(32)
                p_title.font.bold = True
                p_title.font.color.rgb = COLOR_TEXT_WHITE
                p_title.font.name = 'Calibri'

                sub = s.get("subtitle", "")
                if sub:
                    p_sub = tf.add_paragraph()
                    p_sub.text = sub
                    p_sub.font.size = Pt(16)
                    p_sub.font.color.rgb = COLOR_CYAN
                    p_sub.font.name = 'Calibri'
                    p_sub.space_before = Pt(8)

                # Strategic Objectives / Focus Cards (Bottom Panel)
                bullets = s.get("bullets", [])
                if bullets:
                    card_count = min(len(bullets), 3)
                    gap = Inches(0.25)
                    total_w = Inches(11.2)
                    card_w = (total_w - (gap * (card_count - 1))) / card_count
                    card_h = Inches(2.1)
                    top_pos = Inches(4.2)

                    for b_idx in range(card_count):
                        card_left = Inches(1.2) + b_idx * (card_w + gap)
                        b_card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, card_left, top_pos, card_w, card_h)
                        b_card.fill.solid()
                        b_card.fill.fore_color.rgb = COLOR_DARK_CARD
                        b_card.line.color.rgb = COLOR_DARK_BORDER
                        b_card.line.width = Pt(1)

                        b_tf = b_card.text_frame
                        b_tf.word_wrap = True
                        b_tf.margin_left = Inches(0.25)
                        b_tf.margin_right = Inches(0.25)
                        b_tf.margin_top = Inches(0.22)
                        b_tf.margin_bottom = Inches(0.18)

                        p_num = b_tf.paragraphs[0]
                        p_num.text = f"KEY OBJECTIVE 0{b_idx + 1}"
                        p_num.font.size = Pt(9)
                        p_num.font.bold = True
                        p_num.font.color.rgb = COLOR_ACCENT
                        p_num.font.name = 'Calibri'

                        lead, body = cls._parse_bullet_lead(bullets[b_idx])
                        p_body = b_tf.add_paragraph()
                        p_body.space_before = Pt(6)
                        if lead:
                            run_l = p_body.add_run()
                            run_l.text = lead + ": "
                            run_l.font.bold = True
                            run_l.font.size = Pt(11.5)
                            run_l.font.color.rgb = COLOR_TEXT_WHITE
                            run_l.font.name = 'Calibri'
                            run_b = p_body.add_run()
                            run_b.text = body
                            run_b.font.size = Pt(11)
                            run_b.font.color.rgb = RGBColor(203, 213, 225)
                            run_b.font.name = 'Calibri'
                        else:
                            cls._add_formatted_runs(p_body, bullets[b_idx], 11, RGBColor(226, 232, 240), is_bold_default=False)

                # Footer Divider & Metadata
                div = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.2), Inches(6.65), Inches(11.2), Inches(0.02))
                div.fill.solid()
                div.fill.fore_color.rgb = COLOR_DARK_BORDER
                div.line.fill.background()

                f_box = slide.shapes.add_textbox(Inches(1.2), Inches(6.75), Inches(11.2), Inches(0.4))
                ftf = f_box.text_frame
                ftf.word_wrap = True
                ftf.margin_top = Inches(0)
                fp = ftf.paragraphs[0]
                fp.text = "conteX AI • Multi-Agent Intelligence System   |   CONFIDENTIAL • EXECUTIVE REVIEW   |   CRYPTOGRAPHICALLY VERIFIED"
                fp.font.size = Pt(8.5)
                fp.font.color.rgb = COLOR_TEXT_MUTED
                fp.font.name = 'Calibri'

            # -----------------------------------------------------------------
            # 2. SLIDE N: CLOSING TAKEAWAY / NEXT STEPS (Executive Dark Edition)
            # -----------------------------------------------------------------
            elif is_last_slide:
                bg = slide.background
                bg.fill.solid()
                bg.fill.fore_color.rgb = COLOR_DARK_BG

                top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.08))
                top_bar.fill.solid()
                top_bar.fill.fore_color.rgb = COLOR_CYAN
                top_bar.line.fill.background()

                # Pill Tag
                tag = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(0.8), Inches(3.8), Inches(0.42))
                tag.fill.solid()
                tag.fill.fore_color.rgb = COLOR_DARK_CARD
                tag.line.color.rgb = COLOR_CYAN
                tag.line.width = Pt(1)
                tt = tag.text_frame
                tt.margin_left = Inches(0.15)
                tt.margin_top = Inches(0.08)
                tp = tt.paragraphs[0]
                tp.text = "CONCLUSION & ACTION TIMELINE"
                tp.font.size = Pt(9.5)
                tp.font.bold = True
                tp.font.color.rgb = COLOR_CYAN
                tp.font.name = 'Calibri'

                # Grand Title & Subtitle
                t_box = slide.shapes.add_textbox(Inches(1.0), Inches(1.4), Inches(11.333), Inches(1.6))
                tf = t_box.text_frame
                tf.word_wrap = True
                tf.margin_left = Inches(0)
                tf.margin_top = Inches(0)

                p_t = tf.paragraphs[0]
                p_t.text = s.get("title", "Closing Takeaways")
                p_t.font.size = Pt(28)
                p_t.font.bold = True
                p_t.font.color.rgb = COLOR_TEXT_WHITE
                p_t.font.name = 'Calibri'

                sub = s.get("subtitle", "")
                if sub:
                    p_sub = tf.add_paragraph()
                    p_sub.text = sub
                    p_sub.font.size = Pt(15)
                    p_sub.font.color.rgb = COLOR_CYAN
                    p_sub.font.name = 'Calibri'
                    p_sub.space_before = Pt(6)

                # Action / Milestones Cards
                bullets = s.get("bullets", [])
                card_count = min(len(bullets), 3)
                gap = Inches(0.25)
                total_w = Inches(11.333)
                card_w = (total_w - (gap * (card_count - 1))) / card_count if card_count > 0 else Inches(11.333)
                card_h = Inches(2.8)
                top_pos = Inches(3.2)

                for b_idx in range(card_count):
                    card_left = Inches(1.0) + b_idx * (card_w + gap)
                    b_card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, card_left, top_pos, card_w, card_h)
                    b_card.fill.solid()
                    b_card.fill.fore_color.rgb = COLOR_DARK_CARD
                    b_card.line.color.rgb = COLOR_DARK_BORDER
                    b_card.line.width = Pt(1)

                    b_tf = b_card.text_frame
                    b_tf.word_wrap = True
                    b_tf.margin_left = Inches(0.25)
                    b_tf.margin_right = Inches(0.25)
                    b_tf.margin_top = Inches(0.25)

                    p_num = b_tf.paragraphs[0]
                    p_num.text = f"ACTION ITEM 0{b_idx + 1}"
                    p_num.font.size = Pt(9)
                    p_num.font.bold = True
                    p_num.font.color.rgb = COLOR_CYAN
                    p_num.font.name = 'Calibri'

                    lead, body = cls._parse_bullet_lead(bullets[b_idx])
                    p_lead = b_tf.add_paragraph()
                    p_lead.space_before = Pt(8)
                    if lead:
                        p_lead.text = lead
                        p_lead.font.bold = True
                        p_lead.font.size = Pt(14)
                        p_lead.font.color.rgb = COLOR_TEXT_WHITE
                        p_lead.font.name = 'Calibri'

                        p_body = b_tf.add_paragraph()
                        p_body.space_before = Pt(4)
                        p_body.text = body
                        p_body.font.size = Pt(11)
                        p_body.font.color.rgb = RGBColor(203, 213, 225)
                        p_body.font.name = 'Calibri'
                    else:
                        cls._add_formatted_runs(p_lead, bullets[b_idx], 12, COLOR_TEXT_WHITE, is_bold_default=True)

                # Footer
                div = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.0), Inches(6.65), Inches(11.333), Inches(0.02))
                div.fill.solid()
                div.fill.fore_color.rgb = COLOR_DARK_BORDER
                div.line.fill.background()

                f_box = slide.shapes.add_textbox(Inches(1.0), Inches(6.75), Inches(11.333), Inches(0.4))
                ftf = f_box.text_frame
                fp = ftf.paragraphs[0]
                fp.text = f"conteX AI Executive Deck   |   Slide {idx + 1} of {total_slides}   |   Confidential & Source-Grounded"
                fp.font.size = Pt(8.5)
                fp.font.color.rgb = COLOR_TEXT_MUTED
                fp.font.name = 'Calibri'

            # -----------------------------------------------------------------
            # 3. CONTENT SLIDES (Executive Clean Light Studio Edition)
            # -----------------------------------------------------------------
            else:
                bg = slide.background
                bg.fill.solid()
                bg.fill.fore_color.rgb = COLOR_LIGHT_BG

                # Top Accent Bar
                top_bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0), Inches(0), Inches(13.333), Inches(0.06))
                top_bar.fill.solid()
                top_bar.fill.fore_color.rgb = COLOR_PRIMARY
                top_bar.line.fill.background()

                # Dynamic Category Pill Tag
                category_text = cls._get_category_tag(s.get("title", ""), idx)
                tag = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), Inches(0.55), Inches(2.9), Inches(0.36))
                tag.fill.solid()
                tag.fill.fore_color.rgb = COLOR_TAG_BG
                tag.line.color.rgb = COLOR_TAG_BORDER
                tag.line.width = Pt(1)
                tt = tag.text_frame
                tt.margin_left = Inches(0.12)
                tt.margin_top = Inches(0.06)
                tp = tt.paragraphs[0]
                tp.text = category_text
                tp.font.size = Pt(8.5)
                tp.font.bold = True
                tp.font.color.rgb = COLOR_PRIMARY
                tp.font.name = 'Calibri'

                # Watermark / Tag Top Right
                wm = slide.shapes.add_textbox(Inches(8.5), Inches(0.55), Inches(3.833), Inches(0.36))
                wmtf = wm.text_frame
                wmtf.margin_top = Inches(0.06)
                wmp = wmtf.paragraphs[0]
                wmp.text = "conteX AI • Strategic Intelligence"
                wmp.font.size = Pt(8.5)
                wmp.font.color.rgb = COLOR_TEXT_MUTED
                wmp.font.name = 'Calibri'
                wmp.alignment = PP_ALIGN.RIGHT

                # Slide Title & Subtitle
                t_box = slide.shapes.add_textbox(Inches(1.0), Inches(1.0), Inches(11.333), Inches(1.0))
                tf = t_box.text_frame
                tf.word_wrap = True
                tf.margin_left = Inches(0)
                tf.margin_top = Inches(0)

                p_t = tf.paragraphs[0]
                p_t.text = s.get("title", "Key Briefing Point")
                p_t.font.size = Pt(24)
                p_t.font.bold = True
                p_t.font.color.rgb = COLOR_TEXT_DARK
                p_t.font.name = 'Calibri'

                sub = s.get("subtitle", "")
                if sub:
                    p_sub = tf.add_paragraph()
                    p_sub.text = sub
                    p_sub.font.size = Pt(13)
                    p_sub.font.color.rgb = COLOR_TEXT_MUTED
                    p_sub.font.name = 'Calibri'
                    p_sub.space_before = Pt(3)

                # Divider line below header
                hdr_div = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.0), Inches(2.05), Inches(11.333), Inches(0.015))
                hdr_div.fill.solid()
                hdr_div.fill.fore_color.rgb = COLOR_LIGHT_BORDER
                hdr_div.line.fill.background()

                # Dynamic Card Layout for Bullets
                bullets = s.get("bullets", [])
                bullet_count = len(bullets)

                if bullet_count == 4:
                    # 2x2 Grid of Executive Cards
                    grid_w = Inches(5.5)
                    grid_h = Inches(2.05)
                    gap_x = Inches(0.333)
                    gap_y = Inches(0.2)
                    start_top = Inches(2.25)
                    start_left = Inches(1.0)

                    for b_idx, bullet in enumerate(bullets):
                        col = b_idx % 2
                        row = b_idx // 2
                        c_left = start_left + col * (grid_w + gap_x)
                        c_top = start_top + row * (grid_h + gap_y)

                        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, c_top, grid_w, grid_h)
                        card.fill.solid()
                        card.fill.fore_color.rgb = COLOR_LIGHT_CARD
                        card.line.color.rgb = COLOR_LIGHT_BORDER
                        card.line.width = Pt(1)

                        # Accent left edge
                        edge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, c_top, Inches(0.08), grid_h)
                        edge.fill.solid()
                        edge.fill.fore_color.rgb = COLOR_PRIMARY if b_idx % 2 == 0 else COLOR_ACCENT
                        edge.line.fill.background()

                        ctf = card.text_frame
                        ctf.word_wrap = True
                        ctf.margin_left = Inches(0.25)
                        ctf.margin_right = Inches(0.2)
                        ctf.margin_top = Inches(0.2)
                        ctf.margin_bottom = Inches(0.15)

                        # Pill number badge
                        p_badge = ctf.paragraphs[0]
                        p_badge.text = f"ITEM 0{b_idx + 1}"
                        p_badge.font.size = Pt(8.5)
                        p_badge.font.bold = True
                        p_badge.font.color.rgb = COLOR_PRIMARY if b_idx % 2 == 0 else COLOR_ACCENT
                        p_badge.font.name = 'Calibri'

                        lead, body = cls._parse_bullet_lead(bullet)
                        p_lead = ctf.add_paragraph()
                        p_lead.space_before = Pt(4)
                        if lead:
                            p_lead.text = lead
                            p_lead.font.bold = True
                            p_lead.font.size = Pt(13)
                            p_lead.font.color.rgb = COLOR_TEXT_DARK
                            p_lead.font.name = 'Calibri'

                            p_body = ctf.add_paragraph()
                            p_body.space_before = Pt(3)
                            p_body.text = body
                            p_body.font.size = Pt(11)
                            p_body.font.color.rgb = COLOR_TEXT_BODY
                            p_body.font.name = 'Calibri'
                        else:
                            cls._add_formatted_runs(p_lead, bullet, 11.5, COLOR_TEXT_DARK, is_bold_default=False)

                else:
                    # Stacked Horizontal Luxury Cards (1, 2, 3, or 5+ bullets)
                    display_count = min(bullet_count, 4)
                    start_top = Inches(2.25)
                    total_avail_h = Inches(4.35)
                    gap_y = Inches(0.18)
                    card_h = (total_avail_h - (gap_y * (display_count - 1))) / display_count if display_count > 0 else Inches(1.2)

                    for b_idx in range(display_count):
                        c_top = start_top + b_idx * (card_h + gap_y)
                        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), c_top, Inches(11.333), card_h)
                        card.fill.solid()
                        card.fill.fore_color.rgb = COLOR_LIGHT_CARD
                        card.line.color.rgb = COLOR_LIGHT_BORDER
                        card.line.width = Pt(1)

                        # Accent left edge
                        edge = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.0), c_top, Inches(0.08), card_h)
                        edge.fill.solid()
                        edge.fill.fore_color.rgb = COLOR_PRIMARY if b_idx % 2 == 0 else COLOR_ACCENT
                        edge.line.fill.background()

                        # Number pill badge shape
                        pill_w = Inches(0.55)
                        pill_h = Inches(0.36)
                        pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.25), c_top + Inches(0.18), pill_w, pill_h)
                        pill.fill.solid()
                        pill.fill.fore_color.rgb = COLOR_PRIMARY if b_idx % 2 == 0 else COLOR_ACCENT
                        pill.line.fill.background()
                        ptf = pill.text_frame
                        ptf.margin_top = Inches(0.06)
                        pp = ptf.paragraphs[0]
                        pp.text = f"0{b_idx + 1}"
                        pp.font.size = Pt(10)
                        pp.font.bold = True
                        pp.font.color.rgb = COLOR_TEXT_WHITE
                        pp.font.name = 'Calibri'
                        pp.alignment = PP_ALIGN.CENTER

                        # Text container
                        t_left = Inches(1.95)
                        t_width = Inches(10.2)
                        ctf_box = slide.shapes.add_textbox(t_left, c_top + Inches(0.08), t_width, card_h - Inches(0.16))
                        ctf = ctf_box.text_frame
                        ctf.word_wrap = True
                        ctf.margin_left = Inches(0)
                        ctf.margin_right = Inches(0)
                        ctf.margin_top = Inches(0.08)

                        bullet = bullets[b_idx]
                        lead, body = cls._parse_bullet_lead(bullet)
                        p_c = ctf.paragraphs[0]
                        if lead:
                            run_lead = p_c.add_run()
                            run_lead.text = lead + "  —  "
                            run_lead.font.bold = True
                            run_lead.font.size = Pt(13)
                            run_lead.font.color.rgb = COLOR_TEXT_DARK
                            run_lead.font.name = 'Calibri'

                            run_body = p_c.add_run()
                            run_body.text = body
                            run_body.font.size = Pt(12)
                            run_body.font.color.rgb = COLOR_TEXT_BODY
                            run_body.font.name = 'Calibri'
                        else:
                            cls._add_formatted_runs(p_c, bullet, 12, COLOR_TEXT_DARK, is_bold_default=False)

                # Slide Footer
                f_div = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.0), Inches(6.82), Inches(11.333), Inches(0.015))
                f_div.fill.solid()
                f_div.fill.fore_color.rgb = COLOR_LIGHT_BORDER
                f_div.line.fill.background()

                f_box = slide.shapes.add_textbox(Inches(1.0), Inches(6.9), Inches(11.333), Inches(0.35))
                ftf = f_box.text_frame
                ftf.margin_top = Inches(0)
                fp = ftf.paragraphs[0]
                fp.text = f"CONFIDENTIAL   |   conteX AI Verified Grounding   |   Slide {idx + 1} of {total_slides}"
                fp.font.size = Pt(8.5)
                fp.font.color.rgb = COLOR_TEXT_MUTED
                fp.font.name = 'Calibri'

            # Speaker Notes
            notes_slide = slide.notes_slide
            notes_tf = notes_slide.notes_text_frame
            notes_tf.text = s.get("speaker_notes", "").replace("**", "")

        os.makedirs(settings.EXPORT_DIR, exist_ok=True)
        out_path = os.path.join(settings.EXPORT_DIR, output_filename)
        prs.save(out_path)
        return out_path
