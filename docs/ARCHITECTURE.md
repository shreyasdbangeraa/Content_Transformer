# AI Content Transformer — Architecture Specification
**Document Version:** 1.0.0 | **Author:** Lead Full-Stack & AI Architect

---

## 1. Executive Summary & Problem Definition
Traditional GenAI tools operate as naive chatbots that independently prompt large language models with raw, uncurated documents for every desired deliverable. This causes high token costs, severe hallucinations, lack of factual traceability, and zero governance.

**AI Content Transformer** solves this through a unified pipeline:
> **One Raw Source Ingestion → Deep AI Factual Decomposition → Canonical Structured Knowledge Model → Multi-Artefact Parallel Transformation → Source-Grounded Claim Verification → Human Approval → Automated n8n Webhook Publishing.**

---

## 2. End-to-End System Architecture

```text
               ┌─────────────────────────────────────────┐
               │         SOURCE MATERIAL INGESTION       │
               │   (PDF, DOCX, TXT, OCR, Scraped URLs)   │
               └────────────────────┬────────────────────┘
                                    │
                                    ▼
               ┌─────────────────────────────────────────┐
               │       DOCUMENT PROCESSING PIPELINE      │
               │ • Spatial Text & Page-Coordinate Parser │
               │ • SSRF Protection & Prompt Sanitization │
               └────────────────────┬────────────────────┘
                                    │
                                    ▼
               ┌─────────────────────────────────────────┐
               │        DEEP AI CANONICAL ENGINE         │
               │ • Factual Claim & Entity Extraction     │
               │ • Telemetry Metrics & Statistics        │
               │ • PII & Sensitive Identifiers Detection │
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

## 3. Core Subsystems

### 3.1 AI Provider Abstraction
- **Base Interface (`AIProvider`)**: Abstracts `analyze_document`, `generate_artefact`, `fact_check`, `conversational_edit`, and `generate_image`.
- **Implementations**:
  - `GeminiProvider`: Google Gemini 1.5/2.0 API with structured JSON schemas.
  - `OpenAIProvider`: OpenAI GPT-4o-mini structured output mode.
  - `HuggingFaceProvider`: Hugging Face Inference API for `FLUX.1-schnell` and `FLUX.1-dev`.
  - `MockProvider`: Deterministic offline provider pre-loaded with NovaTech Systems Cybersecurity dataset for hackathon and demo reliability.

### 3.2 Canonical Data Model
Every source document is distilled into:
1. `key_facts`: Assertions mapped to specific page numbers and confidence ratings.
2. `statistics`: Numerical values, metrics, and context.
3. `risks & recommendations`: Prioritized strategic directives.
4. `entities`: Systems, IP addresses, actors, and CVEs.
5. `sensitivity`: Detected emails, phone numbers, and internal IP addresses with automated masking rules.

### 3.3 Trust & Fact Checking
1. Extracts discrete claims from generated content.
2. Matches assertions against canonical facts.
3. Classifies each claim into: `VERIFIED`, `PARTIALLY_SUPPORTED`, `UNSUPPORTED`, `CONTRADICTED`, `OPINION_CREATIVE`.
4. Calculates **Quality Score**:
$$\text{Score} = 0.40(\text{Grounding}) + 0.20(\text{Completeness}) + 0.15(\text{Audience}) + 0.10(\text{Readability}) + 0.10(\text{Tone}) + 0.05(\text{Structure})$$

---

## 4. Security & Governance
- **Prompt Injection Defense**: Untrusted documents are demarcated with boundary tags and analyzed purely as data.
- **SSRF Defense**: URL ingestion blocks `localhost`, RFC-1918 private subnets, and metadata endpoints.
- **Human Sign-Off**: Direct API restriction prevents unapproved artefacts from being published to n8n.
