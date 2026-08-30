import asyncio
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from app.database.models import KnowledgeDocument, KnowledgeChunk, AuditLog
from app.processors.chunker import RecursiveTextChunker
from app.processors.sanitizer import sanitize_untrusted_text
from app.services.embedding_service import EmbeddingService

class RAGService:
    """End-to-end RAG orchestrator for document ingestion, chunking, vector embedding, and semantic similarity search."""

    @classmethod
    async def ingest_document(
        cls,
        db: Session,
        title: str,
        content: str,
        doc_type: str = "Policy",
        tags: Optional[List[str]] = None,
        file_name: Optional[str] = None
    ) -> KnowledgeDocument:
        """Ingests a document, breaks it into chunks, vectorizes each chunk, and persists to DB."""
        if not content or not content.strip():
            raise ValueError("Document content cannot be empty.")

        clean_content, threats = sanitize_untrusted_text(content)
        tag_list = tags or []

        # 1. Create parent KnowledgeDocument
        doc = KnowledgeDocument(
            title=title.strip() or "Untitled Document",
            doc_type=doc_type or "Policy",
            content=clean_content,
            file_name=file_name,
            tags=tag_list,
            char_count=len(clean_content),
            embedding_status="INDEXING"
        )
        db.add(doc)
        db.flush()

        # 2. Chunk text using RecursiveTextChunker
        chunker = RecursiveTextChunker(chunk_size=600, chunk_overlap=100)
        raw_chunks = chunker.chunk_text(clean_content)

        # Fallback if chunker returns empty
        if not raw_chunks:
            raw_chunks = [{
                "index": 0,
                "text": clean_content[:600],
                "char_count": len(clean_content[:600]),
                "word_count": len(clean_content[:600].split())
            }]

        # 3. Vectorize chunks asynchronously
        chunk_texts = [c["text"] for c in raw_chunks]
        embeddings = await EmbeddingService.get_embeddings_batch(chunk_texts)

        # 4. Save KnowledgeChunk entities
        for chunk_data, emb in zip(raw_chunks, embeddings):
            chunk_record = KnowledgeChunk(
                document_id=doc.id,
                chunk_index=chunk_data["index"],
                content=chunk_data["text"],
                embedding=emb,
                char_count=chunk_data["char_count"],
                word_count=chunk_data["word_count"]
            )
            db.add(chunk_record)

        doc.chunk_count = len(raw_chunks)
        doc.embedding_status = "INDEXED"

        # 5. Audit Log
        audit = AuditLog(
            action="KNOWLEDGE_DOCUMENT_INGESTED",
            actor="Operator",
            details={
                "doc_id": doc.id,
                "title": doc.title,
                "doc_type": doc.doc_type,
                "chunk_count": doc.chunk_count,
                "char_count": doc.char_count
            }
        )
        db.add(audit)

        db.commit()
        db.refresh(doc)
        return doc

    @classmethod
    async def semantic_search(
        cls,
        db: Session,
        query: str,
        top_k: int = 4,
        min_similarity: float = 0.20,
        doc_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Performs vector cosine similarity search across all indexed chunks."""
        if not query or not query.strip():
            return []

        # 1. Vectorize query
        query_vector = await EmbeddingService.get_embedding(query.strip())

        # 2. Query candidates from database
        query_builder = db.query(KnowledgeChunk).join(KnowledgeDocument)
        if doc_type and doc_type != "All":
            query_builder = query_builder.filter(KnowledgeDocument.doc_type == doc_type)

        chunks = query_builder.all()
        if not chunks:
            return []

        # 3. Calculate similarity score for each chunk
        scored_results = []
        for chunk in chunks:
            if not chunk.embedding or not chunk.content:
                continue

            # Verify keyword/concept overlap to eliminate false positives on unrelated topics
            if not EmbeddingService.has_content_overlap(query, chunk.content):
                continue

            sim = EmbeddingService.cosine_similarity(query_vector, chunk.embedding)
            if sim >= min_similarity:
                doc = chunk.document
                scored_results.append({
                    "chunk_id": chunk.id,
                    "document_id": chunk.document_id,
                    "document_title": doc.title if doc else "Unknown",
                    "doc_type": doc.doc_type if doc else "Policy",
                    "chunk_index": chunk.chunk_index,
                    "content": chunk.content,
                    "similarity": round(float(sim), 4),
                    "char_count": chunk.char_count,
                    "tags": doc.tags if doc else []
                })

        # 4. Rank by similarity descending
        scored_results.sort(key=lambda x: x["similarity"], reverse=True)
        return scored_results[:top_k]

    @classmethod
    async def retrieve_context_for_topic(
        cls,
        db: Session,
        topic: str,
        text_sample: str = "",
        top_k: int = 4
    ) -> Dict[str, Any]:
        """Retrieves and formats RAG context to inject into Canonical Knowledge and transformations."""
        search_query = f"{topic} {text_sample[:300]}".strip()
        matches = await cls.semantic_search(db, query=search_query, top_k=top_k, min_similarity=0.16)

        if not matches:
            return {
                "rag_prompt_block": "",
                "retrieved_chunks": [],
                "sources_referenced": []
            }

        prompt_lines = ["\n--- ORGANIZATIONAL KNOWLEDGE & POLICY GUIDELINES (RAG) ---"]
        sources = []
        for idx, m in enumerate(matches, 1):
            prompt_lines.append(
                f"[{idx}] Source: {m['document_title']} ({m['doc_type']}) | Relevance: {int(m['similarity'] * 100)}%\n"
                f"{m['content']}\n"
            )
            sources.append(m['document_title'])

        prompt_lines.append("Ensure all synthesized outputs respect the policies, brand voice, and guidelines above.\n")

        return {
            "rag_prompt_block": "\n".join(prompt_lines),
            "retrieved_chunks": matches,
            "sources_referenced": list(set(sources))
        }

    @classmethod
    async def seed_default_enterprise_knowledge(cls, db: Session) -> List[KnowledgeDocument]:
        """Seeds standard enterprise brand, communication, and compliance guidelines."""
        default_docs = [
            {
                "title": "Corporate Brand Voice & Communication Standards",
                "doc_type": "Brand Guidelines",
                "tags": ["branding", "voice", "tone", "style"],
                "content": (
                    "NovaTech Corporate Communications Policy:\n"
                    "1. Tone of Voice: Clear, authoritative, empathetic, and forward-looking. Avoid excessive jargon unless in technical bulletins.\n"
                    "2. Executive Communications: Emphasize bottom-line impact, financial metrics, containment timelines, and business resilience first.\n"
                    "3. Public Social Media: Use active voice, compelling hooks, structured bulleted takeaways, and verified industry hashtags (#CyberSecurity, #EnterpriseAI, #Leadership).\n"
                    "4. Terminology: Always refer to systems by approved product names. Never speculate on unattributed threat motives without verified evidence."
                )
            },
            {
                "title": "Data Privacy & PII Redaction Policy (SOC-2 / GDPR)",
                "doc_type": "Policy",
                "tags": ["security", "pii", "gdpr", "compliance"],
                "content": (
                    "Security & Redaction Guidelines for Generated Deliverables:\n"
                    "1. Strict Redaction: All internal IP addresses (10.0.0.0/8, 192.168.0.0/16, 172.16.0.0/12), employee email addresses, direct phone lines, and API credentials must be masked before public publishing.\n"
                    "2. Incident Disclosures: When reporting on system outages or security advisories, use generic subnet masks and role-based contact points (e.g., soc@organization.com or media@organization.com).\n"
                    "3. Approval Gate: Public distribution of Tier-1 advisories requires human operator sign-off."
                )
            },
            {
                "title": "Factual Verification & Evidence Grounding Protocol",
                "doc_type": "Compliance",
                "tags": ["fact-checking", "grounding", "citations"],
                "content": (
                    "Evidence Verification Protocol for AI Generation:\n"
                    "1. Primary Source Supremacy: Every claim, statistic, and percentage must map back to a verified page or section of the ingested source document.\n"
                    "2. External Research Corroboration: External claims must cite Tier-1 or Tier-2 authorities (CISA, NIST, SEC, Academic papers).\n"
                    "3. Discrepancy Flagging: If primary source numbers differ from external reports (e.g. server count discrepancies), flag as an explicit conflict rather than silently resolving."
                )
            },
            {
                "title": "Executive Presentation & Slide Deck Structuring",
                "doc_type": "Template",
                "tags": ["presentations", "slides", "executive"],
                "content": (
                    "Executive Slide Deck Standard Framework:\n"
                    "Slide 1: Title & Executive Briefing Context.\n"
                    "Slide 2: Incident Overview, Scope & Root Cause Analysis.\n"
                    "Slide 3: Impact Assessment & Financial / Operational Metrics.\n"
                    "Slide 4: Containment Timeline & Mitigation Directives.\n"
                    "Slide 5: Strategic Recommendations, Next Steps & Governance Actions."
                )
            }
        ]

        created = []
        for d in default_docs:
            existing = db.query(KnowledgeDocument).filter(KnowledgeDocument.title == d["title"]).first()
            if not existing:
                doc = await cls.ingest_document(
                    db=db,
                    title=d["title"],
                    content=d["content"],
                    doc_type=d["doc_type"],
                    tags=d["tags"]
                )
                created.append(doc)

        return created
