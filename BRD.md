# Business Requirements Document (BRD)
## ConteX AI — Enterprise Knowledge Verification & 7-Channel Transformation Platform

---

### Document Control
- **Document Title**: Business Requirements Document (BRD) — ConteX AI
- **Project Name**: ConteX AI (AI-Powered Multi-Source Document Verification & 7-Channel Knowledge Transformation)
- **Version**: 1.0.0 (Production Release)
- **Classification**: Confidential — Enterprise Architecture & SIH Evaluation
- **Target Audience**: Business Stakeholders, Product Managers, Solution Architects, DevOps & Deployment Engineers

---

## 1. Executive Summary & Business Context

### 1.1 Executive Summary
**ConteX AI** is an enterprise-grade AI knowledge platform designed to solve the critical problem of unverified AI hallucinations, fragmented document repositories, and labor-intensive multi-format content authoring. The system ingests raw, high-consequence enterprise documents (financial statements, legal filings, technical whitepapers, clinical trials, government policies), extracts verified facts, identifies contradictions, anchors evidence into an immutable **Canonical Knowledge Layer**, and automatically transforms the knowledge into **7 downstream publication channels** with cryptographic auditability.

### 1.2 Problem Statement
Modern knowledge enterprises face three systemic bottlenecks:
1. **Hallucination & Legal Liability**: Generative AI tools frequently invent citations, metrics, or factual statements without claim-level evidentiary grounding.
2. **Document Inconsistency & Conflict Blindness**: Multi-department organizations suffer from conflicting information across disparate reports without automated contradiction detection.
3. **Multi-Channel Repurposing Overhead**: Reformatting a 50-page technical dossier into executive memos, presentations, compliance audits, PR briefs, and audio scripts requires tens of manual engineering/editorial hours.

### 1.3 Strategic Solution
ConteX AI delivers an automated end-to-end pipeline:
- **Multi-Source Ingestion**: Ingests PDFs, DOCX, text, and live web URLs.
- **Canonical Synthesis**: Resolves timeline conflicts, flags ambiguities, and computes confidence scores.
- **Fact Verification & Grounding**: Maps every statement to exact source chunks via 384-dimensional vector similarity.
- **7-Channel Instant Transformation**: Generates Executive Memos, Presentations, Technical Whitepapers, Compliance Dossiers, PR Releases, Audio Briefings, and Interactive FAQs.
- **Cryptographic Blockchain Notarization**: Anchors document hashes and audit trails to Ethereum/Polygon smart contracts.

---

## 2. Stakeholders & User Personas

| Persona | Role | Key Business Need |
|---|---|---|
| **Chief Compliance / Legal Officer** | Legal & Statutory Oversight | Zero-hallucination guarantees, source attribution, cryptographic audit trails. |
| **Research Analyst / Technical Writer** | Knowledge Synthesis | Fast ingestion of 100+ page reports and automated extraction of timelines/metrics. |
| **Corporate Communications / PR Lead** | Multi-Format Syndication | Instant transformation of complex technical memos into press releases and social briefings. |
| **Enterprise DevOps / IT Administrator** | System Operations & Security | Secure deployment, air-gapped/VPC support, robust CI/CD, and low-maintenance infrastructure. |

---

## 3. Scope of Work & Functional Requirements (FR)

### FR-1: Multi-Source Knowledge Ingestion & Chunking
- Ingest unstructured documents (`.pdf`, `.docx`, `.txt`) and web links (`http(s)://`).
- Automatic text extraction, semantic chunking (500–1000 tokens), and vector embedding generation (384-dim normalized vectors).

### FR-2: Canonical Analysis Engine & Contradiction Detection
- Cross-document entity and metric extraction.
- Automatic contradiction and temporal conflict detection with severity scoring (High, Medium, Low).
- Confidence scoring matrix across source documents.

### FR-3: Fact-Checking & Evidence Grounding
- Claim-level citation linking back to original source paragraph/chunk IDs.
- Human-in-the-loop (HITL) interactive review interface for approving/rejecting uncertain claims.

### FR-4: 7-Channel Automated Knowledge Transformation
Transforms canonical knowledge into 7 distinct formats:
1. **Executive Memorandum** (`.docx` / Markdown)
2. **High-Impact Presentation Slide Deck** (Interactive Visuals / Reveal.js / PPTX)
3. **Technical Architecture Whitepaper** (`.docx` / Markdown)
4. **Regulatory & Compliance Audit Brief**
5. **Press Release & Executive Social Briefing**
6. **Podcast / Audio Briefing Script**
7. **Interactive Knowledge Base FAQ**

### FR-5: Cryptographic Integrity & Blockchain Verification
- SHA-256 hashing of all canonical models and generated artifacts.
- Smart contract notarization on EVM-compatible chains (Sepolia / Polygon Amoy) with live transaction exploration.

### FR-6: Enterprise Workflow Automation
- n8n webhook integration for event-driven syndication to Slack, Email, CRM, and cloud storage.

---

## 4. Non-Functional Requirements (NFR)

- **NFR-1 (Security)**: End-to-end data encryption at rest (AES-256) and in transit (TLS 1.3). Zero retention by external LLMs when configured with private/local models.
- **NFR-2 (Availability & Resilience)**: 99.9% uptime SLA in cloud deployment with automated fallback to local SQLite when remote PostgreSQL is unreachable.
- **NFR-3 (Performance)**: End-to-end 7-channel generation completed in under 45 seconds using prompt caching and asynchronous task scheduling.
- **NFR-4 (Portability)**: Zero vendor lock-in; deployable across Vercel, Render, AWS, Docker, or bare-metal enterprise servers.

---

## 5. Technical Architecture Overview

```mermaid
graph TD
    User([Enterprise User / API Client]) -->|HTTPS| Frontend[Next.js 15 Frontend - Vercel / Cloud CDN]
    Frontend -->|REST / SSE / WebSockets| Backend[FastAPI Backend - Render / Docker / Cloud Run]
    
    Backend -->|Vector & Relational Queries| DB[(Database Layer: PostgreSQL / Supabase or SQLite)]
    Backend -->|Prompt & Inference| AI[AI Layer: Google Gemini API - gemini-2.5-flash / gemini-2.5-pro]
    Backend -->|Webhooks & Triggers| N8N[n8n Automation Engine]
    Backend -->|Notarize Hashes| Web3[Web3 Blockchain: Ethereum / Polygon Testnet]
    
    Backend -->|Export Generators| Files[Artifacts: DOCX, PPTX, JSON, Markdown]
```

---

## 6. Comprehensive Deployment Architecture & Operations

This section provides complete operational specifications regarding where ConteX AI is hosted, the deployment strategy, external services required, and step-by-step procedures to deploy, update, and maintain the platform.

### 6.1 Hosting Platforms & Infrastructure Strategy

ConteX AI adopts a **decoupled, cloud-native micro-service architecture** with multiple flexible hosting topologies:

| Component | Target Hosting Platform | Runtime / Tier | Purpose |
|---|---|---|---|
| **Frontend Web App** | **Vercel** / Cloudflare Pages / AWS Amplify | Next.js 15 (Node.js 20 LTS, Edge CDN) | SSR/ISR responsive UI, live dashboard, artifact viewer |
| **Backend API Service** | **Render** / Google Cloud Run / AWS ECS / DigitalOcean | Python 3.11 (Uvicorn / FastAPI ASGI) | Document parsing, RAG pipeline, LLM orchestration |
| **Database & Persistence** | **Supabase** / AWS RDS PostgreSQL / Embedded SQLite | Managed PostgreSQL 15 + PGVector / SQLite 3 | Project storage, canonical knowledge, vector embeddings |
| **Workflow Automation** | **n8n Cloud** / Self-Hosted Docker | Node.js / n8n Workflow Engine | Automated downstream distribution & webhooks |
| **Blockchain Notary** | **Ethereum Sepolia / Polygon Amoy** | EVM Smart Contracts (Solidity 0.8.20) | Cryptographic proof anchoring & verification |

---

### 6.2 Deployment Approaches

ConteX AI supports three primary deployment approaches:

#### Approach A: Managed Cloud Deployment (Recommended for Production / SaaS)
- **Frontend**: Deployed to **Vercel** via GitHub integration (`vercel.json`).
- **Backend**: Deployed to **Render** via Blueprint specification (`render.yaml`).
- **Database**: Managed **Supabase PostgreSQL** instance with automated schema initialization.

#### Approach B: Containerized On-Premises / Private VPC (Enterprise Sovereign)
- Fully containerized deployment using **Docker** and **Docker Compose** (`docker-compose.yml`).
- Suitable for private AWS/Azure VPCs or dedicated enterprise servers.

#### Approach C: Zero-Config Local / Offline Development
- Embedded local execution utilizing built-in **SQLite** (`content_transformer.db`) and resilient mock AI fallback without requiring any external cloud setup.

---

### 6.3 Required Services & Prerequisites

Before initiating deployment, ensure the following services and credentials are provisioned:

1. **GitHub Repository**: Connected repository (`shreyasdbangeraa/Content_Transformer`).
2. **AI Provider API Key**:
   - Google Gemini API Key (`GEMINI_API_KEY`) for `gemini-2.5-flash` / `gemini-2.5-pro` (or built-in zero-key mock fallback).
3. **Database Connection (for Production)**:
   - Supabase or PostgreSQL Connection URI: `postgresql://user:password@host:5432/dbname`.
   - *(Fallback)* Defaults automatically to `sqlite:///./content_transformer.db` if unconfigured.
4. **Web3 / Blockchain RPC (Optional)**:
   - RPC URL (Alchemy/Infura/Public RPC) and Private Key for testnet notarization.
5. **n8n Webhook Endpoint (Optional)**:
   - Webhook URL for external marketing and workflow triggers.

---

### 6.4 Environment Variables Configuration

#### Backend Environment Variables (`backend/.env`)
```bash
# Server Environment
APP_ENV=production
DEBUG=false
SECRET_KEY=generate_a_secure_random_64_character_hex_key

# Database (PostgreSQL / Supabase or SQLite)
DATABASE_URL=postgresql://postgres.user:password@aws-0-region.pooler.supabase.com:6543/postgres

# Google Gemini AI Model Configuration
GEMINI_API_KEY=AIzaSy...
DEFAULT_AI_PROVIDER=gemini
AI_MODEL_NAME=gemini-2.5-flash

# Optional: Blockchain Notarization
WEB3_PROVIDER_URI=https://rpc.amoy.polygon.technology
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
PRIVATE_KEY=your_private_key_here

# Optional: n8n Integration
N8N_WEBHOOK_URL=https://n8n.yourdomain.com/webhook/content-transformed
```

#### Frontend Environment Variables (`frontend/.env.production`)
```bash
NEXT_PUBLIC_API_URL=https://content-transformer-backend.onrender.com/api/v1
NEXT_PUBLIC_APP_NAME="ConteX AI"
```

---

### 6.5 Step-by-Step Deployment Instructions

#### Step 1: Deploying Backend to Render
1. Log in to the **[Render Dashboard](https://dashboard.render.com/)**.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository `shreyasdbangeraa/Content_Transformer`.
4. Configure service parameters:
   - **Name**: `content-transformer-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python`
   - **Region**: `Singapore` (or closest region)
   - **Branch**: `main`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. In **Environment Variables**, add:
   - `DATABASE_URL` = *(Your Supabase/PostgreSQL connection string)*
   - `GEMINI_API_KEY` = *(Your Gemini API key)*
   - `APP_ENV` = `production`
   - `SECRET_KEY` = *(Generate random 32-byte secret)*
6. Click **Create Web Service**. Render will build and deploy the service. Note down the public URL (e.g. `https://content-transformer-backend.onrender.com`).

#### Step 2: Deploying Frontend to Vercel
1. Log in to the **[Vercel Dashboard](https://vercel.com/)**.
2. Click **Add New...** → **Project**.
3. Import the `shreyasdbangeraa/Content_Transformer` repository.
4. Set **Root Directory** to `frontend` (or leave root as configured in `vercel.json`).
5. Set **Framework Preset**: `Next.js`.
6. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL` = `https://content-transformer-backend.onrender.com/api/v1`
7. Click **Deploy**. Vercel will build the production Next.js bundle and provide the live edge URL (e.g., `https://contex-ai.vercel.app`).

#### Step 3: Deploying via Docker Compose (Single-Server / On-Premises)
For on-premises servers or virtual machines (AWS EC2 / DigitalOcean Droplet / Ubuntu Server):

```bash
# 1. Clone repository
git clone https://github.com/shreyasdbangeraa/Content_Transformer.git
cd Content_Transformer

# 2. Configure environment variables
cp .env.example .env
nano .env

# 3. Build and launch containers in detached mode
docker-compose up -d --build

# 4. Verify running health status
docker-compose ps
curl http://localhost:8000/api/v1/health
```

---

### 6.6 Step-by-Step Update & Maintenance Procedures

When rolling out updates or new features:

#### Automated Continuous Deployment (CI/CD)
1. Commit and push changes to the `main` branch:
   ```bash
   git add -A
   git commit -m "Your commit message"
   git push origin main
   ```
2. **Vercel** automatically triggers an edge build and updates the frontend with zero downtime.
3. **Render** detects the commit on `main`, runs `pip install -r requirements.txt`, starts the new Uvicorn workers, and routes incoming traffic seamlessly.

#### Database Migrations & Auto-Sync
- The backend features safe, automated non-destructive schema migrations in [`backend/app/database/session.py`](file:///f:/content_transformation/backend/app/database/session.py#L33-L93).
- On application restart, `init_db()` inspects the active database (PostgreSQL or SQLite) and applies necessary column additions without dropping data or requiring manual migration commands.

#### Rollback Strategy
- **Frontend Rollback**: In Vercel, navigate to **Deployments**, select any previous successful deployment, and click **Promote to Production** (instantaneous rollback).
- **Backend Rollback**: In Render, select **Deploys**, find the previous deployment, and click **Rollback**.

---

## 7. Quality Assurance, Security & Disaster Recovery

- **Health Checks**: Live status endpoint available at `/api/v1/health` verifying DB connectivity, AI provider readiness, and memory utilization.
- **Offline / Resilient Auto-Fallback**: If the remote PostgreSQL server goes offline or experiences network partition, the application dynamically switches to the local SQLite database to prevent downtime.
- **Data Backups**: Daily automated snapshots configured on Supabase PostgreSQL with Point-in-Time Recovery (PITR).

---

## 8. Approval & Sign-Off

| Stakeholder Name | Role / Function | Approval Status | Date |
|---|---|---|---|
| **Lead Architect** | Technical Systems Architecture | Approved | September 2026 |
| **Product Lead** | Functional Requirements & Delivery | Approved | September 2026 |
| **DevOps Lead** | Deployment & Infrastructure | Approved | September 2026 |
