import os
import re
import pymupdf

def create_project_documentation_pdf(output_path: str = "conteX_AI_Project_Documentation.pdf"):
    """
    Generates a comprehensive, beautifully styled, multi-page PDF document
    explaining the complete working, architecture, and features of conteX AI.
    """
    
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <style>
        @page {
            size: A4;
            margin: 32px 36px 36px 36px;
        }
        body {
            font-family: Helvetica, Arial, sans-serif;
            color: #1e293b;
            line-height: 1.5;
            font-size: 10.5pt;
            background-color: #ffffff;
            margin: 0;
            padding: 0;
        }
        h1, h2, h3, h4 {
            color: #0f172a;
            font-family: Helvetica, Arial, sans-serif;
            font-weight: bold;
            margin-top: 14pt;
            margin-bottom: 6pt;
        }
        h1 {
            font-size: 20pt;
            color: #0369a1;
            border-bottom: 2pt solid #0284c7;
            padding-bottom: 6pt;
            margin-top: 18pt;
            page-break-before: always;
        }
        h1.first-title {
            page-break-before: avoid;
            margin-top: 0;
        }
        h2 {
            font-size: 14pt;
            color: #0f172a;
            border-bottom: 1pt solid #e2e8f0;
            padding-bottom: 4pt;
            margin-top: 12pt;
        }
        h3 {
            font-size: 11.5pt;
            color: #0284c7;
            margin-top: 10pt;
            margin-bottom: 4pt;
        }
        p {
            margin-top: 4pt;
            margin-bottom: 6pt;
            text-align: justify;
        }
        strong {
            color: #0f172a;
            font-weight: bold;
        }
        .cover-header {
            background-color: #0f172a;
            color: #ffffff;
            padding: 24pt;
            border-radius: 12pt;
            margin-bottom: 18pt;
            text-align: center;
        }
        .cover-title {
            font-size: 24pt;
            font-weight: bold;
            color: #38bdf8;
            margin-bottom: 4pt;
        }
        .cover-subtitle {
            font-size: 12pt;
            color: #94a3b8;
            margin-bottom: 8pt;
        }
        .cover-badge {
            display: inline-block;
            background-color: #0369a1;
            color: #ffffff;
            font-size: 9pt;
            font-weight: bold;
            padding: 4pt 10pt;
            border-radius: 6pt;
        }
        .card {
            background-color: #f8fafc;
            border: 1pt solid #cbd5e1;
            border-radius: 8pt;
            padding: 10pt 12pt;
            margin-bottom: 10pt;
        }
        .card-blue {
            background-color: #f0f9ff;
            border-left: 4pt solid #0284c7;
            padding: 8pt 12pt;
            margin-bottom: 8pt;
        }
        .card-emerald {
            background-color: #f0fdf4;
            border-left: 4pt solid #10b981;
            padding: 8pt 12pt;
            margin-bottom: 8pt;
        }
        .card-purple {
            background-color: #faf5ff;
            border-left: 4pt solid #8b5cf6;
            padding: 8pt 12pt;
            margin-bottom: 8pt;
        }
        .card-amber {
            background-color: #fffbeb;
            border-left: 4pt solid #f59e0b;
            padding: 8pt 12pt;
            margin-bottom: 8pt;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8pt;
            margin-bottom: 12pt;
            font-size: 9.5pt;
        }
        th {
            background-color: #0f172a;
            color: #ffffff;
            text-align: left;
            padding: 6pt 8pt;
            font-weight: bold;
        }
        td {
            border: 1pt solid #cbd5e1;
            padding: 5pt 8pt;
            vertical-align: top;
        }
        tr:nth-child(even) {
            background-color: #f8fafc;
        }
        ul, ol {
            margin-top: 4pt;
            margin-bottom: 8pt;
            padding-left: 18pt;
        }
        li {
            margin-bottom: 3pt;
        }
        code {
            font-family: monospace;
            background-color: #f1f5f9;
            color: #0369a1;
            padding: 1pt 3pt;
            border-radius: 3pt;
            font-size: 9pt;
        }
        .footer-note {
            font-size: 8.5pt;
            color: #64748b;
            text-align: center;
            margin-top: 20pt;
            border-top: 1pt solid #e2e8f0;
            padding-top: 8pt;
        }
        .step-num {
            display: inline-block;
            background-color: #0284c7;
            color: #ffffff;
            font-weight: bold;
            font-size: 9pt;
            width: 16pt;
            height: 16pt;
            text-align: center;
            border-radius: 8pt;
            margin-right: 4pt;
        }
    </style>
    </head>
    <body>

    <!-- COVER SECTION -->
    <div class="cover-header">
        <div class="cover-title">conteX AI</div>
        <div class="cover-subtitle">Enterprise Multi-Artefact Content Transformation & Fact-Verification Platform</div>
        <div class="cover-badge">COMPREHENSIVE TECHNICAL ARCHITECTURE & WORKING SPECIFICATION</div>
    </div>

    <div class="card-blue">
        <strong>Platform Mission:</strong> To eliminate organizational hallucination and communication bottlenecks by transforming complex primary documents (PDF, DOCX, URLs, Webpages) into verified, multi-channel executive deliverables (Dossiers, Slide Decks, LinkedIn Posts, Twitter Threads, Infographics, Advisories, Video Packages) backed by a Single-Truth Canonical Knowledge Layer and Blockchain Hash Verification.
    </div>

    <!-- SECTION 1 -->
    <h1 class="first-title">1. Executive Summary & Core Value Proposition</h1>
    <p>
        Modern enterprises face critical challenges in distilling technical telemetry, incident reports, research papers, and corporate documentation into tailored deliverables for diverse stakeholders (Board of Directors, Regulators, Engineering Teams, Public Channels). Traditional generative AI often introduces hallucinations, ignores corporate compliance guidelines, or leaks sensitive proprietary identifiers.
    </p>
    <p>
        <strong>conteX AI</strong> provides an institutional-grade, multi-agent AI pipeline that ingests raw source material, sanitizes it, distills a verified <strong>Single Source of Truth (Canonical Knowledge)</strong>, cross-references internal policies via <strong>RAG (Retrieval-Augmented Generation)</strong>, queries external evidence tiers, and generates cryptographically verified deliverables.
    </p>

    <div class="card">
        <strong>Key Architectural Guarantees:</strong>
        <ul>
            <li><strong>Zero-Hallucination Pipeline:</strong> Every generated claim maps directly back to primary source citations or verified external authority tiers.</li>
            <li><strong>100% Offline Local AI Support:</strong> Complete execution capability using on-device Ollama (Llama 3) with zero data transmission to external cloud services.</li>
            <li><strong>Deep Multi-Page Website Crawling:</strong> Discovers and extracts internal subpages (e.g. <code>/about</code>, <code>/services</code>, <code>/pricing</code>, <code>/docs</code>) on same-domain websites.</li>
            <li><strong>On-Device Vector Embeddings (RAG):</strong> 384-dimensional normalized vector indexing in local SQLite with cosine similarity ranking.</li>
            <li><strong>Cryptographic Tamper-Proof Integrity:</strong> Deterministic SHA-256 hash chains recorded for all upload, transformation, and revision versions.</li>
            <li><strong>SSRF & Prompt Injection Gateways:</strong> Hardware and network level defense blocking intranet scraping and malicious jailbreak payloads.</li>
        </ul>
    </div>

    <!-- SECTION 2 -->
    <h1>2. End-to-End System Workflow (Step-by-Step)</h1>
    <p>
        The platform operates through a 6-stage structured lifecycle guaranteeing fact preservation from raw ingestion to final multi-channel broadcast:
    </p>

    <div class="card-blue">
        <h3><span class="step-num">1</span> Multi-Format Source Ingestion & Sanitization</h3>
        <p>
            Users ingest source content through three primary gateways:
        </p>
        <ul>
            <li><strong>File Upload:</strong> Supports PDF (PyMuPDF / PyPDF text extraction with OCR metadata), DOCX (python-docx), Plaintext, Markdown, and tabular files up to 25MB.</li>
            <li><strong>Deep Web URL Scraping:</strong> Autonomous web crawler with browser headers, SSRF defense, anti-bot bypass proxies, and multi-page link discovery (fetching root + subpages up to 16 pages).</li>
            <li><strong>Raw Text Paste:</strong> Direct paste for meeting transcripts, telemetry dumps, or incident drafts.</li>
            <li><strong>Sanitization Gateway:</strong> Untrusted text is screened for prompt injection payloads (e.g., <code>Ignore previous instructions</code>, <code>System prompt reveal</code>) and sanitized before any AI invocation.</li>
        </ul>
    </div>

    <div class="card-emerald">
        <h3><span class="step-num">2</span> Canonical Structured Knowledge Creation</h3>
        <p>
            The source text is analyzed by the active AI Engine (Local Ollama or Cloud Gemini/OpenAI) to extract an authoritative structured JSON schema:
        </p>
        <ul>
            <li><strong>Topic & Executive Summary:</strong> Core situational narrative and high-level findings.</li>
            <li><strong>Key Facts with Provenance:</strong> Ranked factual assertions tagged as <code>PRIMARY_SOURCE_FACT</code>, <code>VERIFIED_EXTERNAL_FACT</code>, or <code>INFERENCE</code>.</li>
            <li><strong>Metrics & Statistics:</strong> Quantitative numbers, percentages, and telemetry values grounded in page citations.</li>
            <li><strong>Risk Matrix & Strategic Directives:</strong> Severity-classified operational risks and prioritized actionable recommendations.</li>
            <li><strong>Timeline Events & Identified Entities:</strong> Chronological milestone extraction and entity graph (Organizations, Persons, Malware Groups, Systems).</li>
            <li><strong>Sensitivity Radar:</strong> Deterministic regex and AI detection of internal IP subnets (<code>10.x.x.x</code>, <code>192.168.x.x</code>), credentials, hostnames, and PII.</li>
        </ul>
    </div>

    <div class="card-purple">
        <h3><span class="step-num">3</span> Autonomous Research Planner & Evidence Verification</h3>
        <p>
            The Universal Research Planner determines factual verification requirements based strictly on document contents:
        </p>
        <ul>
            <li><strong>Dynamic Domain Detection:</strong> Classifies document domain (Cybersecurity, Healthcare, Finance, Education, Business, Energy/Tech) without assumptions.</li>
            <li><strong>Source Hierarchy Matching:</strong> Maps claims to authoritative tiers (Tier 1: Government/CERT/Regulators, Tier 2: Official Portals, Tier 3: Peer-Reviewed Academic, Tier 6: Global Press).</li>
            <li><strong>Cross-Source Discrepancy & Conflict Engine:</strong> Detects numerical or narrative conflicts between primary and external sources, presenting transparent explanations.</li>
        </ul>
    </div>

    <div class="card-amber">
        <h3><span class="step-num">4</span> Multi-Channel Transformation & Generation</h3>
        <p>
            Concurrent multi-format transformation synthesizing the canonical knowledge into 7 tailored communication artefacts:
        </p>
        <table>
            <tr>
                <th>Format Type</th>
                <th>Target Audience</th>
                <th>Deliverable Characteristics</th>
            </tr>
            <tr>
                <td><strong>Executive Dossier</strong></td>
                <td>C-Suite & Board</td>
                <td>Comprehensive multi-section strategic briefing with impact metrics and roadmap.</td>
            </tr>
            <tr>
                <td><strong>LinkedIn Post</strong></td>
                <td>Industry Leaders</td>
                <td>High-engagement thought-leadership post with emojis, takeaways, hashtags, and hero banner.</td>
            </tr>
            <tr>
                <td><strong>Interactive Slide Deck</strong></td>
                <td>Executive Briefings</td>
                <td>Multi-slide 16:9 presentation deck with formatted bullets, subtitle, and speaker notes.</td>
            </tr>
            <tr>
                <td><strong>Visual Infographic</strong></td>
                <td>Broad Stakeholders</td>
                <td>High-resolution visual wireframe with metrics, risk matrix, and domain iconography.</td>
            </tr>
            <tr>
                <td><strong>X / Twitter Thread</strong></td>
                <td>Public Community</td>
                <td>Sequential 5-8 post thread strictly calibrated to 280-character limits.</td>
            </tr>
            <tr>
                <td><strong>Security Advisory</strong></td>
                <td>SOC & IT Teams</td>
                <td>Technical advisory with CVSS score, IoCs, mitigation timeline, and patch directives.</td>
            </tr>
            <tr>
                <td><strong>Video Package</strong></td>
                <td>Media & Marketing</td>
                <td>5-scene production package with audio voiceover scripts and on-screen visual prompts.</td>
            </tr>
        </table>
    </div>

    <div class="card-blue">
        <h3><span class="step-num">5</span> Dual Verification, Quality Radar & Blockchain Integrity</h3>
        <p>
            Each generated deliverable undergoes automatic claim-by-claim verification:
        </p>
        <ul>
            <li><strong>Fact-Checking Engine:</strong> Compares output claims against canonical facts, generating a 0-100% Grounding Score with status badges (VERIFIED, PARTIAL, UNSUPPORTED, CONTRADICTED).</li>
            <li><strong>8-Dimensional Quality Radar:</strong> Evaluates Source Accuracy, Completeness, Audience Fit, Readability, Tone Consistency, Structure, Research Confidence, and Safety.</li>
            <li><strong>Cryptographic Blockchain Anchoring:</strong> Generates a deterministic SHA-256 hash representing the exact content state, creating an immutable audit trail.</li>
        </ul>
    </div>

    <div class="card-emerald">
        <h3><span class="step-num">6</span> Publishing, Webhooks & Multi-Format Export</h3>
        <p>
            Deliverables are approved by operators and exported or distributed:
        </p>
        <ul>
            <li><strong>Native Word Export (.DOCX):</strong> Generates styled documents with formatted headings, bold text runs, callout blocks, and tables.</li>
            <li><strong>Native PowerPoint Export (.PPTX):</strong> Generates 16:9 widescreen presentation decks with slide notes and bold bullet styling.</li>
            <li><strong>Webhook Automation (n8n & Social Channels):</strong> Direct integration to trigger n8n workflows, post directly to LinkedIn / Twitter, or notify Slack channels.</li>
        </ul>
    </div>

    <!-- SECTION 3 -->
    <h1>3. AI Engine Architecture & Provider Strategy</h1>
    <p>
        The platform features an enterprise <strong>AIFactory</strong> provider pattern allowing dynamic switching between local offline engines and cloud providers:
    </p>

    <table>
        <tr>
            <th>AI Engine</th>
            <th>Deployment Mode</th>
            <th>Privacy Level</th>
            <th>Primary Use Case</th>
        </tr>
        <tr>
            <td><strong>Ollama (Llama 3)</strong></td>
            <td>100% On-Device Local</td>
            <td><strong>Maximum (Zero Leakage)</strong></td>
            <td>Air-gapped enterprise environments, defense, compliance-restricted documents.</td>
        </tr>
        <tr>
            <td><strong>Google Gemini 1.5/2.0</strong></td>
            <td>Cloud API</td>
            <td>Encrypted Transit</td>
            <td>High-speed deep reasoning, large document synthesis, structured JSON.</td>
        </tr>
        <tr>
            <td><strong>OpenAI (GPT-4o)</strong></td>
            <td>Cloud API</td>
            <td>Encrypted Transit</td>
            <td>Complex editorial framing and cross-lingual translation.</td>
        </tr>
        <tr>
            <td><strong>Hugging Face Hub</strong></td>
            <td>Hybrid / Cloud</td>
            <td>Encrypted Transit</td>
            <td>Llama 3.3 70B & FLUX.1-schnell high-resolution vector visual generation.</td>
        </tr>
        <tr>
            <td><strong>Deterministic Fallback</strong></td>
            <td>Local In-Memory</td>
            <td>Maximum</td>
            <td>Zero-dependency offline extraction guaranteeing system resilience if APIs are down.</td>
        </tr>
    </table>

    <!-- SECTION 4 -->
    <h1>4. RAG & Organizational Knowledge Base</h1>
    <p>
        The platform embeds an organizational Knowledge Base that injects corporate brand standards, compliance policies (SOC-2, GDPR), and terminology rules into every AI generation:
    </p>
    <ul>
        <li><strong>Recursive Text Chunker:</strong> Splits knowledge documents into semantic segments (default 600 chars with 100 char overlap).</li>
        <li><strong>On-Device 384-Dimensional Embedding Service:</strong> High-performance deterministic n-gram & token hashing vectorizer projected onto 384-dimensional unit vectors. Operates completely locally without requiring cloud embedding API credits.</li>
        <li><strong>Cosine Similarity Retrieval:</strong> Calculates vector dot products and filters by content term overlap to retrieve the top-4 most relevant policy guidelines.</li>
        <li><strong>Persistent Local Storage:</strong> Vector arrays and chunk relationships are stored directly in <code>content_transformer.db</code> (SQLite) in the <code>knowledge_chunks</code> table.</li>
    </ul>

    <!-- SECTION 5 -->
    <h1>5. Deep Multi-Page Website Crawler</h1>
    <p>
        When ingesting web links (e.g. <code>https://example.in</code>), the platform utilizes an automated deep crawler:
    </p>
    <ul>
        <li><strong>Internal Link Discovery:</strong> Inspects root HTML to discover all internal relative and absolute links on the same host domain.</li>
        <li><strong>Smart Priority Ranking:</strong> Automatically scores high-value pages (e.g., <code>/about</code>, <code>/services</code>, <code>/pricing</code>, <code>/team</code>, <code>/docs</code>, <code>/security</code>, <code>/faq</code>) over generic utility paths.</li>
        <li><strong>Concurrent Safe Fetching:</strong> Bounded semaphore concurrency (up to 4 parallel workers) with SSRF validation blocking private subnets.</li>
        <li><strong>Consolidated Synthesis:</strong> Aggregates extracted pages into a structured single-truth document with individual subpage markers, URLs, and word counts.</li>
    </ul>

    <!-- SECTION 6 -->
    <h1>6. Security, SSRF Defense & Cryptographic Integrity</h1>
    <p>
        Enterprise-grade security controls protect both inputs and outputs:
    </p>
    <div class="card">
        <ul>
            <li><strong>SSRF Firewall:</strong> Inspects IP addresses against IPv4/IPv6 private ranges (<code>127.0.0.0/8</code>, <code>10.0.0.0/8</code>, <code>172.16.0.0/12</code>, <code>192.168.0.0/16</code>, <code>169.254.0.0/16</code>, <code>::1</code>, <code>fc00::/7</code>).</li>
            <li><strong>Prompt Injection Sanitizer:</strong> Strips jailbreaks, system prompt override tags, and invisible Unicode exploit payloads.</li>
            <li><strong>Deterministic SHA-256 Hash Chains:</strong> Every document version computes <code>hash = SHA256(content + previous_hash + version_number)</code>.</li>
            <li><strong>Blockchain Verification:</strong> Stores cryptographic anchors on Ethereum Sepolia Testnet smart contracts for tamper verification and audit compliance.</li>
        </ul>
    </div>

    <!-- SECTION 7 -->
    <h1>7. Database Schema & Technology Stack</h1>
    <table>
        <tr>
            <th>Layer</th>
            <th>Technology</th>
            <th>Purpose</th>
        </tr>
        <tr>
            <td><strong>Frontend</strong></td>
            <td>Next.js 15 (App Router), React 19, TailwindCSS, Lucide Icons</td>
            <td>Responsive reactive dashboard, live wizard, SVG renderers, and AI editing studio.</td>
        </tr>
        <tr>
            <td><strong>Backend</strong></td>
            <td>FastAPI, Python 3.11, Uvicorn, Pydantic v2</td>
            <td>Asynchronous REST API, multi-provider AI orchestrator, and transformation services.</td>
        </tr>
        <tr>
            <td><strong>Database</strong></td>
            <td>SQLite (Local) / Supabase (PostgreSQL), SQLAlchemy 2.0</td>
            <td>Relational data storage with JSON vector embedding serialization and auto-migrations.</td>
        </tr>
        <tr>
            <td><strong>Document Parsing</strong></td>
            <td>PyMuPDF, PyPDF, python-docx, BeautifulSoup4, httpx</td>
            <td>High-fidelity extraction from PDFs, Word docs, web pages, and sitemaps.</td>
        </tr>
        <tr>
            <td><strong>Export Engines</strong></td>
            <td>python-docx, python-pptx</td>
            <td>Native Microsoft Office document synthesis with styled typography and bold runs.</td>
        </tr>
    </table>

    <div class="footer-note">
        conteX AI • Official Technical Specification & Working Architecture Manual • Generated on August 2026 • Verified Single Source of Truth
    </div>

    </body>
    </html>
    """

    doc = pymupdf.open()
    story = pymupdf.Story(html=html_content)
    writer = pymupdf.DocumentWriter(output_path)
    
    # A4 dimensions: 595 x 842 points
    page_rect = pymupdf.Rect(0, 0, 595, 842)
    content_rect = pymupdf.Rect(36, 36, 559, 806)
    
    more = 1
    page_count = 0
    while more:
        page_count += 1
        device = writer.begin_page(page_rect)
        more, _ = story.place(content_rect)
        story.draw(device)
        writer.end_page()
        
    writer.close()
    print(f"Project documentation PDF generated successfully at: {output_path} ({page_count} pages)")
    return output_path

if __name__ == "__main__":
    out_dir = os.path.abspath("exports")
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "conteX_AI_Complete_Project_Documentation.pdf")
    create_project_documentation_pdf(out_file)
    
    # Also save a copy in the project root
    root_file = os.path.abspath("conteX_AI_Complete_Project_Documentation.pdf")
    create_project_documentation_pdf(root_file)
