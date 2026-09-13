# ConteX AI

ConteX AI is an AI-powered information verification and transformation platform that processes uploaded documents and web sources, autonomously researches supporting evidence, and verifies facts across multiple sources. By distilling raw information into an immutable Canonical Knowledge Core, it creates trusted, traceable knowledge and transforms it simultaneously into seven production-ready communication deliverables. Built with claim-level source grounding, automated fact-checking, PII redaction, and human-in-the-loop governance, ConteX AI ensures zero-hallucination enterprise publishing.

---

## 1. Features

ConteX AI is built to bridge the gap between unstructured multi-source inputs and verified, multi-channel syndication. The platform includes the following fully implemented capabilities:

### Document Upload & Ingestion
- **Multi-Modal Document Parsing**: Native extraction for `.pdf` (spatial text and page-coordinate parsing via PyMuPDF), `.docx` (via python-docx), and `.txt`/`.md` files.
- **Web Content Scraping**: Ingests external web pages and articles using an automated crawler with HTML DOM cleaning via BeautifulSoup4 and HTTPX.
- **Prompt Injection Defense**: Untrusted inputs are isolated within XML security boundaries (`<UNTRUSTED_DOCUMENT_CONTENT>`) with protective system directives preventing instruction escape.
- **SSRF Protection**: Hardened URL parser blocks requests to private, loopback, and cloud metadata IP ranges (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `::1/128`, etc.).

### Sensitive Data & Privacy Protection
- **Automated PII & Credential Masking**: Scans and redacts emails, phone numbers, internal IPv4 addresses, internal hostnames, JWT tokens, AWS keys, and confidential credentials before storage and transformation.

### AI-Powered Information Extraction & Canonical Synthesis
- **Canonical Knowledge Core (Single Source of Truth)**: Deconstructs raw sources into structured knowledge objects:
  - **Key Facts**: Individual factual assertions tagged with source file, page number, and confidence score.
  - **Named Entities & Locations**: Extracted organizations, persons, systems, and facilities.
  - **Timeline & Dates**: Chronological event ordering with timestamps and severity ratings.
  - **Empirical Statistics**: Quantified metrics, percentages, and benchmark values.
  - **Risks & Recommendations**: Identified vulnerabilities, severity levels, and prioritized action directives.
  - **Uncertainties & Gaps**: Flagged items with incomplete or provisional data.

### Autonomous Research & Evidence Discovery
- **Document-Agnostic Research Engine**: Analyzes document domain (Cybersecurity, Healthcare, Finance, Education, Legal, Business, Energy, etc.) and derives targeted verification needs.
- **3 Research Modes**:
  - `SOURCE_ONLY`: Strictly air-gapped; bounds all reasoning to the uploaded document.
  - `SOURCE_AND_VERIFY`: Verifies empirical claims and external entities against authoritative sources.
  - `DEEP_RESEARCH`: Performs multi-tier web queries to expand context and discover corroborated evidence.
- **Authoritative Source Tier Classification**: Classifies sources across an 8-Tier Reliability Hierarchy:
  - *Tier 1*: Government Agencies, National CERTs, Regulatory Standards (e.g., CISA, NIST, WHO, SEC).
  - *Tier 2*: Primary Enterprise Portals & Target Entity Disclosures.
  - *Tier 3*: Academic Literature & Peer-Reviewed Research (arXiv, IEEE, PubMed).
  - *Tier 4–8*: Standards bodies, accredited institutions, authoritative journalism, and secondary trade press.
- **Claim Provenance Tracking**: Categorizes assertions into `PRIMARY_DOCUMENT_FACT`, `EXTERNAL_VERIFIED_FACT`, or `INFERENCE`.
- **Cross-Source Conflict Detection**: Automatically identifies discrepancies between the primary document and external findings (e.g., conflicting figures or timeline dates) and flags them for human review.

### Claim-Level Fact Checking & Grounding
- **Source Citation Matching**: Verifies every claim in generated content against exact source page numbers and excerpts.
- **Hallucination Detection**: Flags ungrounded statements, unsupported statistics, or fabricated claims.
- **Grounding Score Calculation**: Produces a percentage-based score reflecting the factual fidelity of each deliverable.

### Multi-Dimensional Quality Scoring
- **8-Metric Quality Radar**: Evaluates each output across:
  - Source Accuracy (Grounding)
  - Completeness
  - Audience Fit
  - Readability (Flesch-Kincaid formula calibrated for professional communication)
  - Tone Consistency
  - Structural Integrity
  - Research Confidence
  - Safety & Sensitivity

### Multi-Format Content Transformation (7 Concurrent Engines)
1. **Executive Summary**: 1-page briefing for leadership (Situation, Findings, Metrics, and Recommendations).
2. **LinkedIn Post**: Engaging thought-leadership post with structured hook, body, call-to-action, hashtags, and banner image.
3. **Strategic / Technical Advisory**: Formal advisory with severity indicators, affected scope, and remediation protocols.
4. **PowerPoint Presentation (.pptx)**: Professional 5-slide widescreen presentation deck with speaker notes, rendered programmatically via `python-pptx`.
5. **X / Twitter Thread**: Numbered, character-constrained social thread optimized for engagement.
6. **Infographic Specification**: Data visualization grid layout with visual prompt definitions.
7. **Video Storyboard Package**: Scene-by-scene script with visual framing cues, narration timings, and subtitle directions.

### Internal RAG Knowledge Base
- **Document Chunking & Vector Search**: Ingests organizational policies, brand guidelines, and reference documents using recursive chunking and 384-dimensional vector embeddings with cosine similarity matching.

### Human-in-the-Loop Studio & Governance
- **Conversational AI Refinement**: Prompt the AI to adapt tone, condense text, or alter style while maintaining source grounding.
- **Multilingual Localization**: Generates and localizes deliverables in English, Hindi, Kannada, Tamil, Telugu, Spanish, German, French, and Japanese.
- **Version History & Diff Tracking**: Maintains full revision history (`v1 -> v2`) with author attribution and diff views.
- **Mandatory Human Approval Gate**: Enforces that content cannot be published or dispatched until explicitly reviewed and approved by an operator.

### Integrity, Audit & Automated Publishing
- **Cryptographic Version Chaining**: Generates SHA-256 digests for each content version and links them in a parent-child hash chain.
- **Blockchain Content Integrity Anchor**: Records version hashes, timestamps, and action types using a smart contract (`ContentIntegrityRegistry.sol` on Ethereum Sepolia Testnet or local EVM mock).
- **Automated n8n Webhook Syndication**: Directly dispatches approved deliverables to n8n webhook workflows for scheduled social distribution.
- **Native Document Export**: Instant client-side download of `.pptx` presentations, `.docx` Word documents, and formatted text.

---

## 2. Technology Stack

| Component | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, React Markdown |
| **Backend** | Python 3.11, FastAPI, Uvicorn, Pydantic v2, SQLAlchemy 2.0 |
| **AI / LLM** | Google Gemini (`gemini-2.5-flash`, `gemini-2.5-pro`), OpenAI (`gpt-4o-mini`), Ollama (Local Offline `llama3`), Hugging Face Hub (`FLUX.1-schnell`), Offline Mock Provider |
| **Document Processing** | `pymupdf` (PyMuPDF 1.24+ for PDF spatial parsing), `python-docx` (DOCX parsing & export), `python-pptx` (PowerPoint generation), `beautifulsoup4` (Web scraping) |
| **Research / Search** | Multi-engine web search (Bing Search, DuckDuckGo via HTTP) and direct entity portal resolution with 8-Tier source reliability classification |
| **Database** | SQLite (zero-configuration local database `content_transformer.db`) with resilient auto-fallback from PostgreSQL / Supabase |
| **Vector Storage** | In-database 384-dimensional vector storage (JSON vector arrays with Python cosine similarity matching; supports local deterministic vectorizer, Gemini, and OpenAI embeddings) |
| **Other (Integrity & Automation)** | Solidity smart contract (`ContentIntegrityRegistry.sol`), SHA-256 cryptographic hash chaining, n8n webhook automation pipeline |

---

## 3. Prerequisites

To run ConteX AI locally, ensure the following software is installed on your system:

- **Python**: Version `3.11` (or 3.11+)
- **Node.js**: Version `18.0.0` or higher (tested on Node.js v18, v20, and v24)
- **Package Managers**: `pip` (Python) and `npm` (Node.js)
- **Database / Vector Database**: **None required!** The application defaults to a self-contained local SQLite database (`content_transformer.db`) with in-database vector search that initializes automatically on first run.
- **External API Keys**: **Optional!** The platform includes a complete, self-contained `mock` AI provider that allows evaluators to test all document parsing, canonical synthesis, 7-format generation, fact-checking, editing, and export features without needing external API keys or credit cards. To use live cloud models, a Google Gemini API key or OpenAI API key can be supplied.

---

## 4. Installation

Follow these step-by-step commands to set up and run the project locally.

### Step 1: Clone the Repository
```bash
git clone https://github.com/shreyasdbangeraa/Content_Transformer.git
cd Content_Transformer
```

### Step 2: Set Up the Backend
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. (Recommended) Create and activate a Python virtual environment:
   - **On Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **On Linux / macOS:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install the required backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Return to the project root directory:
   ```bash
   cd ..
   ```

### Step 3: Set Up the Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install the required frontend dependencies:
   ```bash
   npm install
   ```

3. Return to the project root directory:
   ```bash
   cd ..
   ```

### Step 4: Configure Environment Variables
Copy the example environment configuration file to `.env`:

- **On Windows (PowerShell):**
  ```powershell
  Copy-Item .env.example .env
  ```
- **On Linux / macOS:**
  ```bash
  cp .env.example .env
  ```

*The default configuration uses SQLite and the built-in AI provider, requiring no edits to run.*

### Step 5: Database Initialization
No manual database setup commands are needed. When the backend starts, it automatically initializes the SQLite database schema and performs all required table creations.

---

## 5. Environment Variables

The project configuration is managed through the root `.env` file. Below are the key environment variables:

```env
# =============================================================================
# 1. DATABASE CONFIGURATION (Default: Local SQLite, zero-setup)
# =============================================================================
DATABASE_URL=sqlite:///./content_transformer.db

# Optional Supabase / PostgreSQL credentials (if using remote database)
# SUPABASE_URL=https://your-project-id.supabase.co
# SUPABASE_KEY=your_supabase_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# =============================================================================
# 2. AI PROVIDER CONFIGURATION
# =============================================================================
# Options: "mock" (offline demo, zero-keys), "gemini", "openai", "ollama"
AI_PROVIDER=mock

# Google Gemini API Key (Required only if AI_PROVIDER=gemini)
# Obtain from: https://aistudio.google.com/
GEMINI_API_KEY=

# OpenAI API Key (Required only if AI_PROVIDER=openai)
# Obtain from: https://platform.openai.com/
OPENAI_API_KEY=

# Local Offline LLM via Ollama (Required only if AI_PROVIDER=ollama)
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3

# Hugging Face API Key for FLUX.1 image generation (Optional)
HUGGINGFACE_API_KEY=
HF_IMAGE_MODEL=black-forest-labs/FLUX.1-schnell

# =============================================================================
# 3. BLOCKCHAIN INTEGRITY ANCHORING
# =============================================================================
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_MODE=mock
BLOCKCHAIN_NETWORK=Ethereum Sepolia Testnet
BLOCKCHAIN_CONTRACT_ADDRESS=0x8f3c71E765691C3b7654b1d6A3C4D116a4e72390

# =============================================================================
# 4. AUTOMATION & SOCIAL PUBLISHING (n8n Webhook)
# =============================================================================
N8N_WEBHOOK_URL=https://shreyasdb.app.n8n.cloud/webhook/social-publish
N8N_WEBHOOK_SECRET=your_custom_webhook_secret_here

# =============================================================================
# 5. FRONTEND CONFIGURATION
# =============================================================================
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## 6. Running the Application

You can start both the frontend and backend services simultaneously from the root directory or in separate terminals.

### Option A: Run Both Services Concurrently (Recommended)
From the root directory, run:
```bash
npm run dev
```
*This command uses `concurrently` to start the FastAPI backend on port 8000 and the Next.js frontend on port 3000.*

### Option B: Run in Separate Terminals

**Terminal 1 — Backend (FastAPI):**
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```
- API Base URL: `http://localhost:8000`
- Interactive Swagger Documentation: `http://localhost:8000/docs`

**Terminal 2 — Frontend (Next.js):**
```bash
cd frontend
npm run dev
```
- Web Application: `http://localhost:3000`

---

## 7. SIH Evaluator Demo Walkthrough (2-Minute Test)

For a fast evaluation during judging or demonstration:

1. **Launch the Web App**: Open [http://localhost:3000](http://localhost:3000) in your browser.
2. **Trigger the 1-Click Demo**: Click the **"1-Click SIH NovaTech Demo"** button in the navigation header.
3. **Examine the Canonical Knowledge Core**:
   - Inspect the extracted **Key Facts** with page-level citations.
   - View the detected **Entities**, chronological **Timeline Events**, and **Statistical Metrics**.
   - Review the **Sensitivity Report** highlighting masked PII (emails, IPs, hostnames).
   - Observe the **Cross-Source Conflict** card flagging a detected discrepancy (e.g., 500 vs. 530 impacted systems) with the option to resolve it.
4. **Explore the 7 Generated Deliverables**:
   - Use the deliverable tabs to review the **Executive Summary**, **LinkedIn Post**, **Security Advisory**, **Slide Deck**, **Twitter Thread**, **Infographic**, and **Video Storyboard**.
5. **Inspect the Fact Check & Quality Radar**:
   - Click any verified claim in the **Fact Check Panel** to highlight the exact matching sentence and page citation in the source document.
   - Review the **Quality Radar (0–100)** evaluating Readability, Completeness, and Grounding.
6. **Test Conversational AI Editing**:
   - Click **"Ask AI to Edit"**, select a prompt (e.g., *"Make it shorter and more concise"* or *"Translate to Kannada / Hindi"*), and watch the output update to version `v2` with an audit trail.
7. **Test Governance & Publishing**:
   - Attempt to publish before approval; note that the **Mandatory Approval Gate** blocks unapproved distribution.
   - Click **"Approve Output"**, then click **"Publish (n8n)"** to dispatch the approved payload to the automated publishing pipeline.
8. **Export Native Files**:
   - Click **"Export"** to download the generated `.pptx` PowerPoint presentation or `.docx` Word document.

---

## 8. Running Automated Tests

A comprehensive automated test suite is provided to verify backend routes, security sanitizers, parsers, AI providers, and document generators.

To execute the test suite:
```bash
cd backend
python -m pytest tests/test_backend.py -v
```

The test suite validates:
- API root and health endpoints
- Prompt injection detection and text sanitization
- SSRF URL security filtering
- PII and sensitive data masking
- Multi-tier authoritative source classification
- Document canonical extraction
- Simultaneous generation of all 7 deliverables
- PowerPoint (`.pptx`) and Word (`.docx`) file rendering
- Brand profile management
- Complete end-to-end demo pipeline execution

---

## 9. Project Structure

```text
content_transformation/
├── backend/
│   ├── app/
│   │   ├── ai/               # AI Providers (Gemini, OpenAI, Ollama, Mock, Factory)
│   │   ├── api/              # FastAPI REST endpoints (projects, sources, outputs, publishing, etc.)
│   │   ├── database/         # SQLAlchemy models, resilient session & auto-migrations
│   │   ├── generators/       # Native file rendering (PPTX, DOCX, summaries, advisories)
│   │   ├── processors/       # PDF (PyMuPDF), DOCX, URL scraper with SSRF & prompt defense
│   │   ├── schemas/          # Pydantic v2 request/response data contracts
│   │   ├── services/         # Canonical, Research, Fact-check, Quality, RAG, Blockchain
│   │   ├── utils/            # Cryptographic hasher, image resolvers, text sanitizers
│   │   ├── config.py         # Application settings and environment loader
│   │   └── main.py           # FastAPI application entrypoint & middleware
│   ├── tests/
│   │   └── test_backend.py   # Pytest automated test suite
│   ├── Dockerfile            # Backend container configuration
│   └── requirements.txt      # Python backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js App Router (Landing, Dashboard, Studio workspace)
│   │   ├── components/       # UI components (FactCheck, SlideDeck, RAG, Blockchain, etc.)
│   │   ├── lib/              # API client and utility helpers
│   │   └── types/            # TypeScript data interfaces
│   ├── Dockerfile            # Frontend container configuration
│   ├── package.json          # Node.js dependencies and scripts
│   └── tailwind.config.js    # Tailwind styling configuration
│
├── contracts/
│   └── ContentIntegrityRegistry.sol # Solidity smart contract for SHA-256 hash anchoring
├── docs/
│   ├── ARCHITECTURE.md       # Complete system architecture specification
│   └── SIH_PRESENTATION_SLIDES.md # SIH presentation outline
├── n8n/
│   └── sample_workflow.json  # n8n social syndication workflow template
├── sample-data/              # Sample incident reports for demonstrations
├── .env.example              # Environment configuration template
├── docker-compose.yml        # Multi-container Docker Compose configuration
├── package.json              # Root workspace scripts (npm run dev, test)
└── README.md                 # Project documentation
```

---

## 10. License

This project is licensed under the **MIT License**. Built for the **Smart India Hackathon (SIH) 2026**.