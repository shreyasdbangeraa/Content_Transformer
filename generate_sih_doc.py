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

def generate_document():
    doc = Document()

    # Configure A4 Page Setup with precise professional margins
    section = doc.sections[0]
    section.page_width = Inches(8.27)   # A4 Width (210 mm)
    section.page_height = Inches(11.69) # A4 Height (297 mm)
    section.top_margin = Inches(0.65)
    section.bottom_margin = Inches(0.65)
    section.left_margin = Inches(0.75)
    section.right_margin = Inches(0.75)

    # Configure Header
    header = section.header
    hp = header.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    hrun1 = hp.add_run("ConteX AI  |  ")
    hrun1.font.name = 'Calibri'
    hrun1.font.size = Pt(8.5)
    hrun1.font.bold = True
    hrun1.font.color.rgb = RGBColor(30, 58, 138) # Deep Navy
    hrun2 = hp.add_run("Smart India Hackathon (SIH) Submission")
    hrun2.font.name = 'Calibri'
    hrun2.font.size = Pt(8.5)
    hrun2.font.color.rgb = RGBColor(100, 116, 139) # Slate

    # Configure Footer
    footer = section.footer
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    frun1 = fp.add_run("Expected Solution / Deliverables for Evaluation")
    frun1.font.name = 'Calibri'
    frun1.font.size = Pt(8.5)
    frun1.font.color.rgb = RGBColor(100, 116, 139)
    
    # Right-aligned tab for page number
    frun2 = fp.add_run("\tPage ")
    frun2.font.name = 'Calibri'
    frun2.font.size = Pt(8.5)
    frun2.font.color.rgb = RGBColor(100, 116, 139)
    add_page_number_to_run(frun2)

    # Base typography settings
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(9.5)
    normal_style.font.color.rgb = RGBColor(30, 41, 59) # Slate 800

    # -------------------------------------------------------------
    # DOCUMENT TITLE BLOCK
    # -------------------------------------------------------------
    p_kicker = doc.add_paragraph()
    p_kicker.paragraph_format.space_before = Pt(0)
    p_kicker.paragraph_format.space_after = Pt(2)
    r_kicker = p_kicker.add_run("CONTEX AI")
    r_kicker.font.size = Pt(10.5)
    r_kicker.font.bold = True
    r_kicker.font.color.rgb = RGBColor(30, 58, 138) # Primary Navy

    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(3)
    p_title.paragraph_format.keep_with_next = True
    r_title = p_title.add_run("Expected Solution / Deliverables for Evaluation")
    r_title.font.size = Pt(17.5)
    r_title.font.bold = True
    r_title.font.color.rgb = RGBColor(15, 23, 42) # Slate 900

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(8)
    p_sub.paragraph_format.keep_with_next = True
    r_sub = p_sub.add_run("Smart India Hackathon (SIH)")
    r_sub.font.size = Pt(9.5)
    r_sub.font.bold = True
    r_sub.font.color.rgb = RGBColor(71, 85, 105) # Slate 600

    # Subtle horizontal line divider
    tbl_divider = doc.add_table(rows=1, cols=1)
    tbl_divider.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell_div = tbl_divider.rows[0].cells[0]
    cell_div.width = Inches(6.77)
    set_cell_background(cell_div, "1E3A8A")
    set_cell_margins(cell_div, top=10, bottom=10, left=0, right=0)
    p_div = cell_div.paragraphs[0]
    p_div.paragraph_format.space_before = Pt(0)
    p_div.paragraph_format.space_after = Pt(0)
    r_div = p_div.add_run("")
    r_div.font.size = Pt(1)

    p_gap = doc.add_paragraph()
    p_gap.paragraph_format.space_before = Pt(4)
    p_gap.paragraph_format.space_after = Pt(0)

    # -------------------------------------------------------------
    # SECTION 1: WORKING SOLUTION
    # -------------------------------------------------------------
    p_s1 = doc.add_paragraph()
    p_s1.paragraph_format.space_before = Pt(6)
    p_s1.paragraph_format.space_after = Pt(3)
    p_s1.paragraph_format.keep_with_next = True
    r_s1 = p_s1.add_run("1. Working Solution")
    r_s1.font.size = Pt(11.5)
    r_s1.font.bold = True
    r_s1.font.color.rgb = RGBColor(30, 58, 138)

    p_body1 = doc.add_paragraph()
    p_body1.paragraph_format.space_before = Pt(0)
    p_body1.paragraph_format.space_after = Pt(5)
    p_body1.paragraph_format.line_spacing = 1.12
    p_body1.add_run(
        "ConteX AI is an AI-powered information verification and transformation platform designed to process "
        "unstructured information, research supporting evidence, verify information across sources, and transform "
        "verified information into reusable content. Rather than functioning as a conventional chatbot or direct "
        "prompt wrapper, ConteX AI introduces a decoupled factual knowledge foundation that mitigates hallucinations, "
        "establishes claim-level provenance, and syndicates trusted information across multiple communication formats. "
        "The submitted solution is a fully functional working prototype demonstrating the implemented end-to-end workflow—spanning "
        "multi-modal document ingestion, autonomous multi-tier evidence discovery, cross-source conflict detection, "
        "canonical knowledge synthesis, simultaneous multi-format transformation, cryptographic version anchoring, "
        "and a mandatory human approval governance gate."
    )

    # -------------------------------------------------------------
    # SECTION 2: CORE FUNCTIONAL DELIVERABLES
    # -------------------------------------------------------------
    p_s2 = doc.add_paragraph()
    p_s2.paragraph_format.space_before = Pt(7)
    p_s2.paragraph_format.space_after = Pt(3)
    p_s2.paragraph_format.keep_with_next = True
    r_s2 = p_s2.add_run("2. Core Functional Deliverables")
    r_s2.font.size = Pt(11.5)
    r_s2.font.bold = True
    r_s2.font.color.rgb = RGBColor(30, 58, 138)

    features = [
        ("Document & Information Input", 
         "Accepts heterogeneous multi-modal inputs including unstructured documents (.pdf, .docx, .txt, .md) and live web URLs. "
         "PDFs are parsed with page-coordinate preservation via PyMuPDF; DOCX files are extracted via python-docx; and web pages are "
         "scraped using an automated HTTP crawler with DOM cleaning via BeautifulSoup4. Ingestion is secured by a built-in Prompt "
         "Injection Sanitizer that encapsulates untrusted inputs in XML security boundaries, and an SSRF Shield that blocks private IP "
         "ranges (127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, and cloud metadata 169.254.169.254)."),
        
        ("AI-Powered Analysis",
         "Decomposes raw source text into a structured Canonical Knowledge Core—an immutable Single Source of Truth (SSOT). "
         "The extraction engine identifies atomic key facts with source citations, recognized entities, chronological timelines with "
         "severity ratings, empirical statistics with units, operational risks, prioritized recommendations, and information uncertainties. "
         "Concurrently, deterministic regex scanners detect and mask sensitive PII (emails, phone numbers, internal IPs, hostnames, and API credentials)."),
        
        ("Research & Verification",
         "A document-agnostic research engine dynamically formulates targeted verification queries based on extracted entities and claims. "
         "Supporting three operational modes (SOURCE_ONLY for air-gapped sandboxing, SOURCE_AND_VERIFY for empirical corroboration, and DEEP_RESEARCH "
         "for multi-tier web queries), it gathers live evidence via Bing Search, DuckDuckGo, and direct institutional domain resolution. "
         "Discovered sources are classified across an 8-Tier Reliability Hierarchy (Tier 1: Government/CERT/NIST down to Tier 8: General Web). "
         "Discrepancies between primary and external sources are automatically flagged as Conflict Records for operator resolution."),
        
        ("Verified Knowledge",
         "Organizes all verified findings into structured, traceable canonical knowledge objects. Every claim is tagged with explicit provenance: "
         "PRIMARY_DOCUMENT_FACT (grounded in the source), EXTERNAL_VERIFIED_FACT (corroborated via research), or INFERENCE (derived by AI). "
         "The platform integrates an internal RAG Knowledge Base that recursively chunks and indexes reference documents into 384-dimensional "
         "vector embeddings for semantic similarity retrieval during synthesis."),
        
        ("Content Transformation",
         "Concurrently transforms verified canonical knowledge into seven distinct communication deliverables: (1) Executive Summary (briefing "
         "with situation, findings, metrics, and recommendations), (2) LinkedIn Post (engaging hook, body, CTA, hashtags, and hero banner), "
         "(3) Technical / Threat Advisory (CVSS severity, affected scope, remediation directives), (4) PowerPoint Presentation (native 5-slide widescreen "
         ".pptx with speaker notes rendered via python-pptx), (5) X / Twitter Thread (character-constrained numbered posts), (6) Infographic Layout "
         "(data grid visual specifications), and (7) Video Storyboard Package (scene script, narration, and timings). Supports conversational AI refinement "
         "and multilingual localization across 9 languages."),
        
        ("Integrity & Traceability",
         "Each generated deliverable undergoes automated claim-level fact checking, matching statements to exact source page numbers and excerpts to "
         "calculate a 0–100 Grounding Score, paired with an 8-dimension Quality Radar (Readability, Completeness, Structure, Safety). "
         "Content versions are cryptographically hashed using SHA-256 and linked in a parent-child chain. Version digests, timestamps, and action tags "
         "are anchored to an EVM blockchain smart contract (ContentIntegrityRegistry.sol). A mandatory Human Approval Gate ensures zero unreviewed "
         "publishing before triggering automated n8n webhook syndication.")
    ]

    for title, desc in features:
        p_f = doc.add_paragraph()
        p_f.paragraph_format.space_before = Pt(3)
        p_f.paragraph_format.space_after = Pt(3)
        p_f.paragraph_format.line_spacing = 1.12
        p_f.paragraph_format.keep_with_next = True
        
        r_head = p_f.add_run(f"• {title}: ")
        r_head.font.bold = True
        r_head.font.size = Pt(9.5)
        r_head.font.color.rgb = RGBColor(15, 23, 42)
        
        r_desc = p_f.add_run(desc)
        r_desc.font.size = Pt(9.5)

    # -------------------------------------------------------------
    # SECTION 3: END-TO-END WORKFLOW
    # -------------------------------------------------------------
    p_s3 = doc.add_paragraph()
    p_s3.paragraph_format.space_before = Pt(7)
    p_s3.paragraph_format.space_after = Pt(4)
    p_s3.paragraph_format.keep_with_next = True
    r_s3 = p_s3.add_run("3. End-to-End Workflow")
    r_s3.font.size = Pt(11.5)
    r_s3.font.bold = True
    r_s3.font.color.rgb = RGBColor(30, 58, 138)

    workflow_steps = [
        ("Phase 1: Input & Ingestion", "Uploads documents (PDF, DOCX, TXT) or web URLs; executes SSRF validation and prompt injection defense."),
        ("Phase 2: AI Decomposition", "Deconstructs raw text into atomic key facts, named entities, chronological timelines, metrics, and risks."),
        ("Phase 3: Autonomous Research", "Derives verification needs, queries 8-tier authoritative sources (Gov, CERT, academic), and flags conflicts."),
        ("Phase 4: Canonical Knowledge", "Synthesizes an immutable Single Source of Truth (SSOT) with claim provenance and masked sensitive PII."),
        ("Phase 5: Multi-Format Synthesis", "Concurrently generates 7 target formats: Executive Briefing, LinkedIn, Advisory, PPTX, X, Infographic, Video."),
        ("Phase 6: Quality & Fact Check", "Performs claim-to-page citation matching, calculates Grounding Score (0-100), and audits safety/readability."),
        ("Phase 7: Governance & Approval", "Enforces a mandatory Human Approval Gate; supports conversational AI editing, versioning, and diff tracking."),
        ("Phase 8: Integrity & Syndication", "Anchors SHA-256 hashes to blockchain contract; delivers native exports (.pptx, .docx) and n8n webhooks.")
    ]

    tbl_wf = doc.add_table(rows=len(workflow_steps), cols=2)
    tbl_wf.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_wf, color="E2E8F0", sz="4", val="single")

    col_widths_wf = [Inches(1.85), Inches(4.92)]
    for idx, (stage, detail) in enumerate(workflow_steps):
        row = tbl_wf.rows[idx]
        cell_a, cell_b = row.cells[0], row.cells[1]
        cell_a.width, cell_b.width = col_widths_wf[0], col_widths_wf[1]
        
        bg_color = "F8FAFC" if idx % 2 == 0 else "FFFFFF"
        set_cell_background(cell_a, bg_color)
        set_cell_background(cell_b, bg_color)
        set_cell_margins(cell_a, top=60, bottom=60, left=100, right=100)
        set_cell_margins(cell_b, top=60, bottom=60, left=100, right=100)

        p_a = cell_a.paragraphs[0]
        p_a.paragraph_format.space_before = Pt(0)
        p_a.paragraph_format.space_after = Pt(0)
        r_a = p_a.add_run(stage)
        r_a.font.bold = True
        r_a.font.size = Pt(8.5)
        r_a.font.color.rgb = RGBColor(30, 58, 138)

        p_b = cell_b.paragraphs[0]
        p_b.paragraph_format.space_before = Pt(0)
        p_b.paragraph_format.space_after = Pt(0)
        r_b = p_b.add_run(detail)
        r_b.font.size = Pt(8.5)
        r_b.font.color.rgb = RGBColor(51, 65, 85)

    # -------------------------------------------------------------
    # SECTION 4: DELIVERABLES PROVIDED TO EVALUATORS
    # -------------------------------------------------------------
    p_s4 = doc.add_paragraph()
    p_s4.paragraph_format.space_before = Pt(7)
    p_s4.paragraph_format.space_after = Pt(4)
    p_s4.paragraph_format.keep_with_next = True
    r_s4 = p_s4.add_run("4. Deliverables Provided to Evaluators")
    r_s4.font.size = Pt(11.5)
    r_s4.font.bold = True
    r_s4.font.color.rgb = RGBColor(30, 58, 138)

    eval_deliverables = [
        ("Working Prototype", "Functional ConteX AI application featuring Next.js 15 frontend, FastAPI backend, local SQLite database, in-database vector search, and offline Mock AI provider for zero-config evaluation."),
        ("Source Code", "Complete source code repository provided through the designated GitHub submission link (https://github.com/shreyasdbangeraa/Content_Transformer)."),
        ("README", "Comprehensive documentation including installation commands, prerequisites, environment configuration templates, test commands, and a 2-minute quick-evaluation demo walkthrough."),
        ("Architecture Document", "Technical architecture specification detailing system topology, component interactions, security perimeters, data schemas, and blockchain verification protocols."),
        ("Demo Video", "Maximum 2-minute demonstration video showing end-to-end execution: document upload, canonical analysis, multi-format transformation, fact checking, and publishing."),
        ("Technical Presentation", "Maximum 5-slide presentation deck explaining the problem statement, solution overview, technology stack, implementation details, and enterprise impact.")
    ]

    tbl_del = doc.add_table(rows=len(eval_deliverables) + 1, cols=2)
    tbl_del.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_del, color="CBD5E1", sz="4", val="single")

    col_widths_del = [Inches(1.85), Inches(4.92)]
    
    # Table Header Row
    hdr_row = tbl_del.rows[0]
    hdr_row.cells[0].width, hdr_row.cells[1].width = col_widths_del[0], col_widths_del[1]
    set_cell_background(hdr_row.cells[0], "1E3A8A")
    set_cell_background(hdr_row.cells[1], "1E3A8A")
    set_cell_margins(hdr_row.cells[0], top=80, bottom=80, left=100, right=100)
    set_cell_margins(hdr_row.cells[1], top=80, bottom=80, left=100, right=100)

    p_h0 = hdr_row.cells[0].paragraphs[0]
    p_h0.paragraph_format.space_before, p_h0.paragraph_format.space_after = Pt(0), Pt(0)
    r_h0 = p_h0.add_run("Deliverable")
    r_h0.font.bold = True
    r_h0.font.size = Pt(8.5)
    r_h0.font.color.rgb = RGBColor(255, 255, 255)

    p_h1 = hdr_row.cells[1].paragraphs[0]
    p_h1.paragraph_format.space_before, p_h1.paragraph_format.space_after = Pt(0), Pt(0)
    r_h1 = p_h1.add_run("Description")
    r_h1.font.bold = True
    r_h1.font.size = Pt(8.5)
    r_h1.font.color.rgb = RGBColor(255, 255, 255)

    # Data Rows
    for idx, (deliv, desc) in enumerate(eval_deliverables):
        row = tbl_del.rows[idx + 1]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width, c1.width = col_widths_del[0], col_widths_del[1]
        
        bg_color = "F8FAFC" if idx % 2 == 0 else "FFFFFF"
        set_cell_background(c0, bg_color)
        set_cell_background(c1, bg_color)
        set_cell_margins(c0, top=60, bottom=60, left=100, right=100)
        set_cell_margins(c1, top=60, bottom=60, left=100, right=100)

        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_before, p0.paragraph_format.space_after = Pt(0), Pt(0)
        r0 = p0.add_run(deliv)
        r0.font.bold = True
        r0.font.size = Pt(8.5)
        r0.font.color.rgb = RGBColor(15, 23, 42)

        p1 = c1.paragraphs[0]
        p1.paragraph_format.space_before, p1.paragraph_format.space_after = Pt(0), Pt(0)
        r1 = p1.add_run(desc)
        r1.font.size = Pt(8.5)
        r1.font.color.rgb = RGBColor(51, 65, 85)

    # -------------------------------------------------------------
    # SECTION 5: EVALUATION FOCUS
    # -------------------------------------------------------------
    p_s5 = doc.add_paragraph()
    p_s5.paragraph_format.space_before = Pt(7)
    p_s5.paragraph_format.space_after = Pt(3)
    p_s5.paragraph_format.keep_with_next = True
    r_s5 = p_s5.add_run("5. Evaluation Focus")
    r_s5.font.size = Pt(11.5)
    r_s5.font.bold = True
    r_s5.font.color.rgb = RGBColor(30, 58, 138)

    eval_points = [
        ("Functional Implementation", "Verification of a complete, working end-to-end automated pipeline executing without runtime errors."),
        ("AI-Powered Information Processing", "Extraction precision of factual assertions, entities, dates, metrics, and structured canonical representation."),
        ("Research & Information Verification", "Autonomous generation of targeted search queries, multi-tier evidence ranking, and conflict detection."),
        ("Evidence & Source Traceability", "Claim-to-source page matching verifying factual statements directly against primary document coordinates."),
        ("Quality & Utility of Generated Outputs", "Real-world utility and aesthetic fidelity of executive summaries, native PPTX slide decks, advisories, and social threads."),
        ("Usability of the Application", "Clean, responsive Next.js interface featuring a dedicated '1-Click SIH NovaTech Demo' for rapid judging evaluation."),
        ("Technical Implementation", "High-performance asynchronous FastAPI backend, strict Pydantic v2 schemas, SSRF/prompt injection sanitizers, and comprehensive pytest suite."),
        ("Scalability & Real-World Potential", "Decoupled microservice architecture, dual database capability (PostgreSQL/SQLite), containerization (Docker Compose), and cryptographic auditability.")
    ]

    for item, desc in eval_points:
        p_ep = doc.add_paragraph()
        p_ep.paragraph_format.space_before = Pt(1)
        p_ep.paragraph_format.space_after = Pt(1)
        p_ep.paragraph_format.line_spacing = 1.10
        r_item = p_ep.add_run(f"• {item}: ")
        r_item.font.bold = True
        r_item.font.size = Pt(9)
        r_item.font.color.rgb = RGBColor(15, 23, 42)
        r_desc = p_ep.add_run(desc)
        r_desc.font.size = Pt(9)

    # -------------------------------------------------------------
    # SECTION 6: EXPECTED OUTCOME
    # -------------------------------------------------------------
    p_s6 = doc.add_paragraph()
    p_s6.paragraph_format.space_before = Pt(7)
    p_s6.paragraph_format.space_after = Pt(3)
    p_s6.paragraph_format.keep_with_next = True
    r_s6 = p_s6.add_run("6. Expected Outcome")
    r_s6.font.size = Pt(11.5)
    r_s6.font.bold = True
    r_s6.font.color.rgb = RGBColor(30, 58, 138)

    p_body6 = doc.add_paragraph()
    p_body6.paragraph_format.space_before = Pt(0)
    p_body6.paragraph_format.space_after = Pt(4)
    p_body6.paragraph_format.line_spacing = 1.12
    p_body6.add_run(
        "ConteX AI provides a unified workflow that helps users move from unstructured information to researched evidence, "
        "verified knowledge, and reusable content, reducing the effort required to manually research, validate, organize, "
        "and transform information. By uniting automated fact-checking, multi-tier evidence discovery, cryptographic version "
        "traceability, and multi-format syndication under an accountable human governance framework, ConteX AI delivers a "
        "production-grade foundation for trusted enterprise communication."
    )

    output_path = r"f:\content_transformation\ConteX_AI_Expected_Solution_Deliverables.docx"
    doc.save(output_path)
    print(f"SUCCESS: Document saved successfully at {output_path}")

if __name__ == "__main__":
    generate_document()
