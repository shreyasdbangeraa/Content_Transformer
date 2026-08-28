# SIH 2026 Presentation — 5-Slide Technical Pitch
**Project:** AI Content Transformer
**Tagline:** One Source. Every Communication Format. AI-Powered.

---

## Slide 1: The Problem & The Transformation Solution
### The Communication Bottleneck
- **The Challenge:** Organizations receive critical information (incident reports, policy briefs, threat intel) in dense documents and manually spend hours drafting separate executive briefings, social posts, technical advisories, and slide decks.
- **The Pitfalls:** Inconsistent messaging, slow turnaround time, and hallucination risks when using generic chatbots.
- **Our Solution:** An enterprise GenAI platform that decomposes source documents into a **Canonical Structured Knowledge Model** and synthesizes grounded communication deliverables simultaneously.

---

## Slide 2: The Core Architecture Principle
### Don't Query Raw Documents for Every Format
```text
                  ONE RAW SOURCE DOCUMENT
                            │
                            ▼
               DEEP AI CANONICAL ANALYSIS
                            │
                            ▼
               CANONICAL KNOWLEDGE SCHEMA
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
Executive Brief       LinkedIn Post      Threat Advisory
(Decision Makers)   (Social Audience)    (IT & Security)
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
                CLAIM-BY-CLAIM FACT CHECK
```
- **Single Ingest:** Token-efficient, scalable, and eliminates repeated LLM parsing.
- **Audience & Tone Control:** Customizes voice for C-Suite, Regulators, or General Public.

---

## Slide 3: Trust & Verification Engine
### AI Accountability & Source Grounding
- **Claim Extraction & Matching:** Every generated assertion is linked to exact source page numbers (e.g. *Page 1: 500 affected systems isolated in 42 minutes*).
- **Unsupported Claim Detection:** Flags hallucinations and numbers not found in source.
- **Sensitive Data & PII Redaction:** Automated regex & NER scanning for emails, phone numbers, and internal IP subnets with 1-click masking before public posting.
- **Multi-Dimensional Quality Index:** 6-metric composite scoring (Grounding, Completeness, Readability, Audience Fit, Tone, Structure).

---

## Slide 4: Live Demonstration Narrative
### NovaTech Systems Incident (2-Minute Demo)
1. **0:00 - 0:25:** Ingest fictional NovaTech Ransomware Incident Report (PDF/Text).
2. **0:25 - 0:45:** Deep AI Canonical Analysis extracts 500 systems affected, 42-min containment, CVSS 9.4 score, and PII warnings.
3. **0:45 - 1:10:** Select 5 Deliverables (Exec Summary, LinkedIn, Advisory, PPTX Presentation, Infographic) and generate simultaneously.
4. **1:10 - 1:35:** Inspect Fact Check panel: Verify page citations and unsupported claim detection.
5. **1:35 - 1:50:** Conversational AI Edit: *"Make it more concise and translate to Kannada / Hindi"*.
6. **1:50 - 2:00:** Human Operator Approval → Dispatch to n8n webhook for automated LinkedIn / X scheduling.

---

## Slide 5: Business Impact & Technical Roadmap
### Scalability, Governance & Impact
- **Impact Metrics:**
  - 85% reduction in content turnaround time.
  - 100% factual citation traceability.
  - Zero unapproved leaks through mandatory human sign-off.
- **Technology Stack:**
  - **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS.
  - **Backend:** Python 3.11, FastAPI, Supabase (PostgreSQL), python-docx, python-pptx.
  - **AI Providers:** Multi-provider abstraction (Gemini, OpenAI, Hugging Face FLUX.1, Offline Mock Provider).
  - **Automation:** n8n Webhook Integration.
