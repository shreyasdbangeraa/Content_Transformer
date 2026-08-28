# 🛡️ AI Content Transformer

> **One Source. Every Communication Format. AI-Powered.**
> *Smart India Hackathon (SIH) 2026 Edition — Complete Full-Stack Implementation*

---

## 🌟 Overview & Product Vision
**AI Content Transformer** is an enterprise-grade multimodal Generative AI platform that ingests unstructured sources (PDFs, DOCX, Plain Text, Images, and Web URLs), decomposes them once into a **Canonical Structured Knowledge Representation**, and synthesizes multiple high-impact communication deliverables simultaneously.

Every generated claim is verified with **Source Grounding** (page-level citations), **Fact Checking**, **PII / Sensitivity Redaction**, **Multi-dimensional Quality Scoring**, **Conversational AI Refinement**, **Human Approval**, and **n8n Automated Publishing**.

---

## 🏗️ Architecture: The Core Differentiator

```text
               ┌─────────────────────────────────────────┐
               │         SOURCE MATERIAL INGESTION       │
               │   (PDF, DOCX, TXT, OCR, Scraped URLs)   │
               └────────────────────┬────────────────────┘
                                    │
                                    ▼
               ┌─────────────────────────────────────────┐
               │    CANONICAL KNOWLEDGE REPRESENTATION   │
               │ (Persistent Single Source of Factual    │
               │  Truth with Page & Section Citations)   │
               └───────────┬─────────────────┬───────────┘
                           │                 │
              ┌────────────┴───┐             │
              ▼                ▼             ▼
   ┌────────────────────┐ ┌─────────┐ ┌────────────────┐
   │ OPERATOR CONTROLS  │ │ORG RAG  │ │ SENSITIVITY    │
   │ Audience/Tone/Lang │ │KNOWLEDGE│ │ REDACTION MASK │
   └──────────┬─────────┘ └────┬────┘ └───────┬────────┘
              │                │              │
              └────────────────┼──────────────┘
                               │
                               ▼
        ┌────────────────────────────────────────────────┐
        │       MULTI-ARTEFACT TRANSFORMATION ENGINE     │
        └─┬──────┬──────┬──────┬──────┬──────┬──────┬───┘
          │      │      │      │      │      │      │
          ▼      ▼      ▼      ▼      ▼      ▼      ▼
        ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐
        │Exec│ │Link│ │Adv-│ │PPTX│ │X/  │ │Info│ │Vid │
        │Summ│ │edIn│ │is- │ │Deck│ │Post│ │gra-│ │Pkg │
        │ary │ │Post│ │ory │ │    │ │    │ │phic│ │    │
        └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘ └─┬──┘
          │      │      │      │      │      │      │
          └──────┴──────┴──────┼──────┴──────┴──────┘
                               │
                               ▼
               ┌─────────────────────────────────┐
               │     TRUST & VERIFICATION ENGINE │
               │ • Claim-to-Source Page Matching │
               │ • Unsupported Claim Detection   │
               │ • 6-Metric Quality Index (0-100)│
               └───────────────┬─────────────────┘
                               │
                               ▼
               ┌─────────────────────────────────┐
               │    HUMAN-IN-THE-LOOP STUDIO     │
               │ • Conversational AI Refinement  │
               │ • Direct Edit & Version Control │
               │ • Mandatory Approval Gate       │
               └───────────────┬─────────────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
      ┌──────────────────────┐   ┌───────────────────────┐
      │  MULTI-FORMAT EXPORT │   │  n8n WEBHOOK DISPATCH │
      │ (.pptx, .docx, .txt, │   │ (Scheduled Publishing │
      │  .json, clipboard)   │   │  LinkedIn, X, Insta)  │
      └──────────────────────┘   └───────────────────────┘
```

---

## 🚀 Key Features

### 1. Multimodal Document Processing
- Ingests **PDF** (via PyMuPDF with page-level spatial coordinates), **DOCX**, **TXT**, and **Web URLs**.
- Embedded **Prompt Injection Sanitizer** demarcates untrusted content to prevent prompt escaping.
- Built-in **SSRF Protection** blocks private IP ranges and localhost scraping.

### 2. Multi-Format Output Generators
- 👔 **Executive Summary**: 1-page structured briefing for decision makers (Situation, Findings, Metrics, Recommendations).
- 💼 **LinkedIn Post**: Engaging thought-leadership post with structured hook, body, CTA, and hashtags.
- 🛡️ **Technical / Threat Advisory**: Formal security advisory with CVSS score, affected scope, and IoCs.
- 📊 **PowerPoint Presentation (.pptx)**: Professional 5-slide widescreen deck with speaker notes rendered programmatically via `python-pptx`.
- 🐦 **X / Twitter Thread**: Numbered thread formatted for social character constraints.
- 🎨 **Infographic Layout**: Visual statistics layout with Hugging Face `FLUX.1-schnell` prompts.
- 🎬 **Video Storyboard Package**: Scene-by-scene script, narration timings, and subtitle cues.

### 3. Trust, Verification & Grounding
- **Claim-Level Fact Checking**: Matches generated claims against source document page numbers.
- **Unsupported Claim Detection**: Flags fabricated statistics or ungrounded statements.
- **PII & Sensitivity Scanning**: Automatic detection and masking of emails, phone numbers, and internal IP addresses.
- **6-Metric Quality Score**: Grounding (40%), Completeness (20%), Audience Fit (15%), Readability (10%), Tone (10%), Structure (5%).

### 4. Human Control & Conversational AI Refinement
- **Interactive AI Modification**: Ask AI to *"Make it shorter"*, *"Translate to Kannada or Hindi"*, or *"Elevate formality for government regulators"* while strictly preserving source grounding.
- **Version History**: Tracks versions (`v1 -> v2`) and diff changes.
- **Mandatory Approval Gate**: Public publishing requires human sign-off.

### 5. Automated Social Media Publishing (n8n Webhook)
- Direct integration with n8n workflows for scheduled social media distribution (LinkedIn, X, Instagram).
- Includes signature verification and delivery status tracking.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | Python 3.11, FastAPI, Uvicorn, Pydantic v2, SQLAlchemy |
| **Database** | Supabase (PostgreSQL + pgvector) / SQLite zero-config local fallback |
| **AI Providers** | Google Gemini, OpenAI GPT-4o, Hugging Face (FLUX.1), Offline Mock Provider |
| **Document Rendering** | `python-pptx`, `python-docx`, `pymupdf` (PyMuPDF), `beautifulsoup4` |
| **Automation** | n8n Webhook Integration |

---

## ⚡ Quick Start Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Clone & Setup Backend
```bash
cd backend
python -m pip install -r requirements.txt
```

Start the FastAPI server:
```bash
uvicorn app.main:app --reload --port 8000
```
*Backend API runs at: `http://localhost:8000` (Interactive docs at `http://localhost:8000/docs`)*

### 2. Setup & Start Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend application runs at: `http://localhost:3000`*

---

## 🐳 Docker Deployment
Run the complete stack with Docker Compose:
```bash
docker-compose up --build
```

---

## 🧪 Running Automated Tests
Run the comprehensive test suite verifying parsers, AI providers, fact checking, PPTX rendering, DOCX exports, and API endpoints:
```bash
cd backend
python -m pytest tests/test_backend.py -v
```

---

## 🎯 2-Minute SIH Demo Workflow
1. Open `http://localhost:3000`.
2. Click **"1-Click SIH NovaTech Demo"** in the top navigation bar.
3. The platform automatically loads the fictional **NovaTech Systems Ransomware Incident Report** (500 systems affected, 42-min containment).
4. Inspect the **Canonical Knowledge Representation** (Key Facts, Metrics, IoCs, Sensitivity Warnings).
5. Switch between the 5 generated deliverables (**Executive Summary, LinkedIn, Advisory, PPTX Presentation, Infographic**).
6. Inspect the **Fact Check Panel**: Click verified claims to view exact matching source excerpts on Page 1 & 2.
7. Click **"Ask AI to Edit"**: Select *"Translate to Kannada / Hindi"* or *"Make it more concise"* and watch the version update in real-time.
8. Click **"Approve Output"** and **"Publish (n8n)"** to dispatch to the automated publishing workflow.
9. Click **"Export"** to download the rendered `.pptx` presentation or `.docx` document.

---

## 📁 Project Structure

```text
content_transformation/
├── backend/
│   ├── app/
│   │   ├── ai/              # Gemini, OpenAI, HuggingFace FLUX, Mock providers
│   │   ├── api/             # FastAPI REST endpoints
│   │   ├── database/        # Supabase / SQLAlchemy models and session
│   │   ├── generators/      # PPTX, DOCX, Summary, LinkedIn, Advisory generators
│   │   ├── processors/      # PDF, DOCX, URL parsers with SSRF & prompt defense
│   │   ├── schemas/         # Pydantic v2 data contracts
│   │   ├── services/        # Canonical, Quality, Fact-check, Publishing services
│   │   ├── config.py        # Settings
│   │   └── main.py          # FastAPI application entrypoint
│   ├── tests/               # Pytest suite
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js App Router (Landing, Dashboard, Studio, etc.)
│   │   ├── components/      # UI components (Navbar, Sidebar, FactCheck, SlideDeck, etc.)
│   │   ├── lib/             # API client
│   │   └── types/           # TypeScript interfaces
│   ├── Dockerfile
│   ├── package.json
│   └── tailwind.config.js
│
├── docs/
│   ├── ARCHITECTURE.md      # 2-Page Architecture Document
│   └── SIH_PRESENTATION_SLIDES.md # 5-Slide Pitch
├── n8n/
│   └── sample_workflow.json # n8n social media scheduling workflow
├── sample-data/
│   ├── novatech_incident_report.txt
│   └── novatech_incident_report.pdf
├── .env.example
├── docker-compose.yml
└── README.md
```

---

## 📜 License
MIT License • Built for Smart India Hackathon (SIH) 2026.
