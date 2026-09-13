import os
import sys
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="CBD5E1", sz="4", val="single", inside_v=False):
    tblPr = table._tbl.tblPr
    tblBorders = OxmlElement('w:tblBorders')
    for border_name in ['top', 'left', 'bottom', 'right', 'insideH']:
        border = OxmlElement(f'w:{border_name}')
        border.set(qn('w:val'), val)
        border.set(qn('w:sz'), sz)
        border.set(qn('w:space'), '0')
        border.set(qn('w:color'), color)
        tblBorders.append(border)
    insideV = OxmlElement('w:insideV')
    insideV.set(qn('w:val'), 'single' if inside_v else 'none')
    if inside_v:
        insideV.set(qn('w:sz'), sz)
        insideV.set(qn('w:space'), '0')
        insideV.set(qn('w:color'), color)
    tblBorders.append(insideV)
    tblPr.append(tblBorders)

def add_page_number_to_run(run):
    fldChar1 = OxmlElement('w:fldChar')
    fldChar1.set(qn('w:fldCharType'), 'begin')
    instrText = OxmlElement('w:instrText')
    instrText.set(qn('xml:space'), 'preserve')
    instrText.text = "PAGE"
    fldChar2 = OxmlElement('w:fldChar')
    fldChar2.set(qn('w:fldCharType'), 'separate')
    fldChar3 = OxmlElement('w:fldChar')
    fldChar3.set(qn('w:fldCharType'), 'end')
    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar2)
    run._r.append(fldChar3)

def generate_final_doc(output_filename="ConteX_AI_Expected_Solution_Deliverables_Final.docx"):
    doc = Document()

    # A4 Page Setup
    section = doc.sections[0]
    section.page_width = Inches(8.27)
    section.page_height = Inches(11.69)
    section.top_margin = Inches(0.65)
    section.bottom_margin = Inches(0.65)
    section.left_margin = Inches(0.75)
    section.right_margin = Inches(0.75)

    # Header: ConteX AI | SIH Submission
    header = section.header
    hp = header.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    hrun1 = hp.add_run("ConteX AI  |  ")
    hrun1.font.name = 'Calibri'
    hrun1.font.size = Pt(9)
    hrun1.font.bold = True
    hrun1.font.color.rgb = RGBColor(30, 58, 138) # Deep Navy
    hrun2 = hp.add_run("SIH Submission")
    hrun2.font.name = 'Calibri'
    hrun2.font.size = Pt(9)
    hrun2.font.color.rgb = RGBColor(100, 116, 139) # Slate

    # Footer: page number
    footer = section.footer
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    frun1 = fp.add_run("Page ")
    frun1.font.name = 'Calibri'
    frun1.font.size = Pt(9)
    frun1.font.color.rgb = RGBColor(100, 116, 139)
    add_page_number_to_run(frun1)

    # Base typography
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(10)
    normal_style.font.color.rgb = RGBColor(30, 41, 59)

    # =========================================================================
    # TITLE BLOCK
    # =========================================================================
    p_kicker = doc.add_paragraph()
    p_kicker.paragraph_format.space_before = Pt(0)
    p_kicker.paragraph_format.space_after = Pt(2)
    r_kicker = p_kicker.add_run("ConteX AI")
    r_kicker.font.size = Pt(16)
    r_kicker.font.bold = True
    r_kicker.font.color.rgb = RGBColor(30, 58, 138)

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(2)
    p_title.paragraph_format.keep_with_next = True
    r_title = p_title.add_run("Expected Solution / Deliverables for Evaluation")
    r_title.font.size = Pt(13)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(15, 23, 42)

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(6)
    p_sub.paragraph_format.keep_with_next = True
    r_sub = p_sub.add_run("Smart India Hackathon (SIH)")
    r_sub.font.size = Pt(9.5)
    r_sub.font.bold = True
    r_sub.font.color.rgb = RGBColor(100, 116, 139)

    # Short Intro
    p_intro = doc.add_paragraph()
    p_intro.paragraph_format.space_before = Pt(0)
    p_intro.paragraph_format.space_after = Pt(8)
    p_intro.paragraph_format.line_spacing = 1.15
    r_intro = p_intro.add_run(
        "ConteX AI is an AI-powered information verification and transformation platform that helps users "
        "process unstructured information, research supporting evidence, verify claims across sources, and "
        "transform verified knowledge into reusable content. The submitted solution is a functional working "
        "prototype demonstrating the implemented end-to-end workflow."
    )
    r_intro.font.size = Pt(9.5)
    r_intro.font.color.rgb = RGBColor(51, 65, 85)

    # =========================================================================
    # SECTION 1: WORKING SOLUTION
    # =========================================================================
    p_s1 = doc.add_paragraph()
    p_s1.paragraph_format.space_before = Pt(4)
    p_s1.paragraph_format.space_after = Pt(3)
    p_s1.paragraph_format.keep_with_next = True
    r_s1 = p_s1.add_run("1. Working Solution")
    r_s1.font.size = Pt(11)
    r_s1.font.bold = True
    r_s1.font.color.rgb = RGBColor(30, 58, 138)

    p_body1 = doc.add_paragraph()
    p_body1.paragraph_format.space_before = Pt(0)
    p_body1.paragraph_format.space_after = Pt(8)
    p_body1.paragraph_format.line_spacing = 1.15
    p_body1.add_run(
        "ConteX AI accepts unstructured documents and web information as input, uses AI to analyze and extract "
        "key factual assertions, and independently researches supporting evidence to verify critical claims. "
        "The system establishes a single verified, traceable knowledge foundation and transforms that knowledge into "
        "multiple tailored communication deliverables under an accountable human approval model."
    )

    # =========================================================================
    # SECTION 2: CORE FUNCTIONAL DELIVERABLES
    # =========================================================================
    p_s2 = doc.add_paragraph()
    p_s2.paragraph_format.space_before = Pt(4)
    p_s2.paragraph_format.space_after = Pt(4)
    p_s2.paragraph_format.keep_with_next = True
    r_s2 = p_s2.add_run("2. Core Functional Deliverables")
    r_s2.font.size = Pt(11)
    r_s2.font.bold = True
    r_s2.font.color.rgb = RGBColor(30, 58, 138)

    # Card grid table: 3 rows x 2 cols
    cards_data = [
        ("1. Information Ingestion", "Uploads and processes supported files (PDF, Word, Plain Text) and web sources with built-in input sanitization and security controls."),
        ("2. AI Analysis", "Extracts key facts, claims, entities, chronological events, metrics, and risks into a centralized factual representation while redacting sensitive data."),
        ("3. Research & Verification", "Formulates targeted queries, searches external authoritative sources for corroborating evidence, and flags discrepancies across sources."),
        ("4. Verified Knowledge", "Organizes findings into a structured Single Source of Truth, categorizing claims by evidence provenance and linking internal knowledge context."),
        ("5. Content Transformation", "Generates multiple tailored communication formats simultaneously, including executive briefings, presentation slides, advisories, and social content."),
        ("6. Integrity & Governance", "Validates claims with page-level citations, tracks revision versions with cryptographic hashing, and enforces a mandatory human approval gate before use.")
    ]

    tbl_cards = doc.add_table(rows=3, cols=2)
    tbl_cards.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_cards, color="E2E8F0", sz="4", val="single", inside_v=True)

    card_widths = [Inches(3.38), Inches(3.38)]
    for i in range(3):
        for j in range(2):
            idx = i * 2 + j
            title, desc = cards_data[idx]
            cell = tbl_cards.rows[i].cells[j]
            cell.width = card_widths[j]
            set_cell_background(cell, "F8FAFC")
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)

            p_c = cell.paragraphs[0]
            p_c.paragraph_format.space_before = Pt(0)
            p_c.paragraph_format.space_after = Pt(2)
            r_ct = p_c.add_run(title)
            r_ct.font.bold = True
            r_ct.font.size = Pt(9.5)
            r_ct.font.color.rgb = RGBColor(30, 58, 138)

            p_cd = cell.add_paragraph()
            p_cd.paragraph_format.space_before = Pt(0)
            p_cd.paragraph_format.space_after = Pt(0)
            p_cd.paragraph_format.line_spacing = 1.12
            r_cd = p_cd.add_run(desc)
            r_cd.font.size = Pt(8.5)
            r_cd.font.color.rgb = RGBColor(51, 65, 85)

    # =========================================================================
    # SECTION 3: END-TO-END WORKFLOW
    # =========================================================================
    p_s3 = doc.add_paragraph()
    p_s3.paragraph_format.space_before = Pt(10)
    p_s3.paragraph_format.space_after = Pt(4)
    p_s3.paragraph_format.keep_with_next = True
    r_s3 = p_s3.add_run("3. End-to-End Workflow")
    r_s3.font.size = Pt(11)
    r_s3.font.bold = True
    r_s3.font.color.rgb = RGBColor(30, 58, 138)

    # Workflow: 9 distinct stages in a clean 9-step compact process chain
    # We can present it as a clean 3-row x 3-col workflow matrix with sequential arrows
    workflow_steps = [
        ("INPUT", "Upload documents/information"),
        ("ANALYZE", "Extract and understand key info"),
        ("RESEARCH", "Find supporting evidence"),
        ("VERIFY", "Cross-check claims and sources"),
        ("SYNTHESIZE", "Create verified knowledge"),
        ("TRANSFORM", "Generate useful content"),
        ("FACT-CHECK", "Validate generated outputs"),
        ("HUMAN APPROVAL", "Review before final publishing"),
        ("OUTPUT", "Deliver verified, reusable content")
    ]

    tbl_wf = doc.add_table(rows=3, cols=3)
    tbl_wf.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_wf, color="CBD5E1", sz="4", val="single", inside_v=True)

    wf_col_w = [Inches(2.25), Inches(2.25), Inches(2.25)]
    for i in range(3):
        for j in range(3):
            step_idx = i * 3 + j
            step_name, step_desc = workflow_steps[step_idx]
            cell = tbl_wf.rows[i].cells[j]
            cell.width = wf_col_w[j]
            
            # Step header background
            set_cell_background(cell, "F1F5F9" if (i + j) % 2 == 0 else "FFFFFF")
            set_cell_margins(cell, top=70, bottom=70, left=90, right=90)

            p_w = cell.paragraphs[0]
            p_w.paragraph_format.space_before = Pt(0)
            p_w.paragraph_format.space_after = Pt(1)
            
            step_num = step_idx + 1
            r_num = p_w.add_run(f"STEP {step_num}: {step_name}")
            r_num.font.bold = True
            r_num.font.size = Pt(8.5)
            r_num.font.color.rgb = RGBColor(15, 23, 42)

            p_wd = cell.add_paragraph()
            p_wd.paragraph_format.space_before = Pt(0)
            p_wd.paragraph_format.space_after = Pt(0)
            r_wd = p_wd.add_run(step_desc)
            r_wd.font.size = Pt(8)
            r_wd.font.color.rgb = RGBColor(71, 85, 105)

    # Page Break to Page 2
    doc.add_page_break()

    # =========================================================================
    # SECTION 4: DELIVERABLES PROVIDED TO EVALUATORS
    # =========================================================================
    p_s4 = doc.add_paragraph()
    p_s4.paragraph_format.space_before = Pt(0)
    p_s4.paragraph_format.space_after = Pt(4)
    p_s4.paragraph_format.keep_with_next = True
    r_s4 = p_s4.add_run("4. Deliverables Provided to Evaluators")
    r_s4.font.size = Pt(11)
    r_s4.font.bold = True
    r_s4.font.color.rgb = RGBColor(30, 58, 138)

    deliv_data = [
        ("Working Prototype", "Functional ConteX AI application demonstrating the implemented end-to-end workflow"),
        ("Source Code", "Complete project source code repository"),
        ("README", "Setup, configuration, installation, and usage instructions"),
        ("Architecture Document", "Technical system architecture and component design specification"),
        ("Demo Video", "Maximum 2-minute demonstration of the working solution"),
        ("Technical Presentation", "Maximum 5-slide presentation covering problem, solution, implementation, and impact")
    ]

    tbl_del = doc.add_table(rows=len(deliv_data) + 1, cols=2)
    tbl_del.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_del, color="CBD5E1", sz="4", val="single")

    del_widths = [Inches(2.1), Inches(4.67)]
    
    # Header Row
    hdr = tbl_del.rows[0]
    hdr.cells[0].width, hdr.cells[1].width = del_widths[0], del_widths[1]
    set_cell_background(hdr.cells[0], "1E3A8A")
    set_cell_background(hdr.cells[1], "1E3A8A")
    set_cell_margins(hdr.cells[0], top=80, bottom=80, left=110, right=110)
    set_cell_margins(hdr.cells[1], top=80, bottom=80, left=110, right=110)

    p_h0 = hdr.cells[0].paragraphs[0]
    p_h0.paragraph_format.space_before, p_h0.paragraph_format.space_after = Pt(0), Pt(0)
    r_h0 = p_h0.add_run("Deliverable")
    r_h0.font.bold = True
    r_h0.font.size = Pt(9)
    r_h0.font.color.rgb = RGBColor(255, 255, 255)

    p_h1 = hdr.cells[1].paragraphs[0]
    p_h1.paragraph_format.space_before, p_h1.paragraph_format.space_after = Pt(0), Pt(0)
    r_h1 = p_h1.add_run("What It Provides")
    r_h1.font.bold = True
    r_h1.font.size = Pt(9)
    r_h1.font.color.rgb = RGBColor(255, 255, 255)

    for idx, (name, what) in enumerate(deliv_data):
        row = tbl_del.rows[idx + 1]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width, c1.width = del_widths[0], del_widths[1]
        
        bg = "F8FAFC" if idx % 2 == 0 else "FFFFFF"
        set_cell_background(c0, bg)
        set_cell_background(c1, bg)
        set_cell_margins(c0, top=60, bottom=60, left=110, right=110)
        set_cell_margins(c1, top=60, bottom=60, left=110, right=110)

        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_before, p0.paragraph_format.space_after = Pt(0), Pt(0)
        r0 = p0.add_run(name)
        r0.font.bold = True
        r0.font.size = Pt(8.5)
        r0.font.color.rgb = RGBColor(15, 23, 42)

        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_before, p1.paragraph_format.space_after = Pt(0), Pt(0)
        r1 = p1.add_run(what)
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = RGBColor(51, 65, 85)

    # =========================================================================
    # SECTION 5: EVALUATION FOCUS
    # =========================================================================
    p_s5 = doc.add_paragraph()
    p_s5.paragraph_format.space_before = Pt(12)
    p_s5.paragraph_format.space_after = Pt(4)
    p_s5.paragraph_format.keep_with_next = True
    r_s5 = p_s5.add_run("5. What Can Be Evaluated")
    r_s5.font.size = Pt(11)
    r_s5.font.bold = True
    r_s5.font.color.rgb = RGBColor(30, 58, 138)

    eval_bullets = [
        ("End-to-End Functionality", "Complete automated pipeline operating from raw document upload to multi-format generation."),
        ("AI-Powered Information Analysis", "Extraction of key facts, named entities, timelines, and empirical metrics without hallucination."),
        ("Research & Information Verification", "Targeted query formulation, authoritative source retrieval, and identification of conflicting claims."),
        ("Evidence & Source Traceability", "Claim-to-source citation matching with clickable sentence-level excerpts and page numbers."),
        ("Quality of Generated Outputs", "Readability, completeness, structural fidelity, and practical utility of synthesized deliverables."),
        ("Ease of Use", "Intuitive web interface featuring a 1-Click NovaTech Demo for fast 2-minute judge assessment."),
        ("Technical Implementation & Security", "Modular backend architecture, strict data validation schemas, and prompt injection/SSRF protection."),
        ("Real-World Applicability & Scalability", "Practical value for enterprise documentation, intelligence briefs, advisories, and publishing workflows.")
    ]

    for title, desc in eval_bullets:
        p_b = doc.add_paragraph()
        p_b.paragraph_format.space_before = Pt(1.5)
        p_b.paragraph_format.space_after = Pt(1.5)
        p_b.paragraph_format.line_spacing = 1.12
        r_bt = p_b.add_run(f"• {title}: ")
        r_bt.font.bold = True
        r_bt.font.size = Pt(9)
        r_bt.font.color.rgb = RGBColor(15, 23, 42)
        r_bd = p_b.add_run(desc)
        r_bd.font.size = Pt(9)
        r_bd.font.color.rgb = RGBColor(51, 65, 85)

    # =========================================================================
    # SECTION 6: EXPECTED OUTCOME
    # =========================================================================
    p_s6 = doc.add_paragraph()
    p_s6.paragraph_format.space_before = Pt(12)
    p_s6.paragraph_format.space_after = Pt(3)
    p_s6.paragraph_format.keep_with_next = True
    r_s6 = p_s6.add_run("6. Expected Outcome")
    r_s6.font.size = Pt(11)
    r_s6.font.bold = True
    r_s6.font.color.rgb = RGBColor(30, 58, 138)

    p_body6 = doc.add_paragraph()
    p_body6.paragraph_format.space_before = Pt(0)
    p_body6.paragraph_format.space_after = Pt(0)
    p_body6.paragraph_format.line_spacing = 1.15
    p_body6.add_run(
        "ConteX AI provides a unified workflow for moving from raw information to researched evidence, verified "
        "knowledge, and reusable content. By combining AI analysis, research, verification, and controlled content "
        "generation, the platform aims to reduce the manual effort required to understand, validate, and reuse information."
    )

    output_path = os.path.join(r"f:\content_transformation", output_filename)
    doc.save(output_path)
    print(f"SUCCESS: Saved {output_path}")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "ConteX_AI_Expected_Solution_Deliverables_Final.docx"
    generate_final_doc(target)
