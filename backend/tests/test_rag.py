import pytest
import os
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database.models import Base, KnowledgeDocument, KnowledgeChunk
from app.database.session import init_db, get_db
from app.processors.chunker import RecursiveTextChunker
from app.services.embedding_service import EmbeddingService
from app.services.rag_service import RAGService

# Run DB initialization and column migrations
init_db()

client = TestClient(app)

@pytest.fixture
def db_session():
    db = next(get_db())
    try:
        yield db
    finally:
        db.close()

def test_recursive_chunker():
    sample_text = (
        "NovaTech Cyber Incident Policy. All internal IP addresses must be redacted.\n\n"
        "Section 1: Containment Directives.\n"
        "When an intrusion is identified, network segments must be isolated within 45 minutes.\n"
        "All employee emails and communication logs must be submitted to the Security Operations Center.\n\n"
        "Section 2: C-Suite Reporting.\n"
        "Executive briefings must report financial risk metrics and containment timeline first."
    )
    chunker = RecursiveTextChunker(chunk_size=150, chunk_overlap=30)
    chunks = chunker.chunk_text(sample_text)
    assert len(chunks) >= 2
    assert all("text" in c and "char_count" in c for c in chunks)
    assert chunks[0]["index"] == 0
    assert chunks[1]["index"] == 1

@pytest.mark.asyncio
async def test_embedding_service_dimensions_and_cosine():
    query = "How do we redact employee emails and internal IP addresses?"
    doc_security = "All internal IP addresses such as 10.0.0.0/8 and 192.168.1.0/24 must be masked before public publishing. Employee contact emails should be substituted with general role addresses like soc@novatech.com."
    doc_pizza = "Delicious Italian pizza recipe with mozzarella cheese, tomato sauce, and fresh basil leaves baked in wood oven."

    vq = await EmbeddingService.get_embedding(query)
    vs = await EmbeddingService.get_embedding(doc_security)
    vp = await EmbeddingService.get_embedding(doc_pizza)

    assert len(vq) == 384
    assert len(vs) == 384
    assert len(vp) == 384

    sim_qs = EmbeddingService.cosine_similarity(vq, vs)
    sim_qp = EmbeddingService.cosine_similarity(vq, vp)

    assert sim_qs > sim_qp
    assert sim_qs > 0.20

@pytest.mark.asyncio
async def test_rag_service_ingest_and_search(db_session):
    # 1. Ingest Security Policy
    doc = await RAGService.ingest_document(
        db=db_session,
        title="Enterprise Data Redaction & Security Policy",
        content=(
            "All internal IP addresses such as 10.0.0.0/8 and 192.168.1.0/24 must be masked before public publishing. "
            "Employee contact emails should be substituted with general role addresses like soc@novatech.com."
        ),
        doc_type="Policy",
        tags=["security", "redaction", "pii"]
    )
    assert doc.id is not None
    assert doc.chunk_count >= 1
    assert doc.embedding_status == "INDEXED"

    # 2. Ingest Brand Guidelines
    doc2 = await RAGService.ingest_document(
        db=db_session,
        title="Executive Brand Voice Guidelines",
        content=(
            "Executive summaries should emphasize bottom-line financial metrics, containment timeline, "
            "and business resilience first. Tone must be authoritative and forward-looking."
        ),
        doc_type="Brand Guidelines",
        tags=["voice", "executive", "tone"]
    )
    assert doc2.id is not None

    # 3. Semantic Search for Redaction Query (Relevant)
    search_res = await RAGService.semantic_search(
        db=db_session,
        query="How do we redact employee emails and internal IP addresses?",
        top_k=2,
        min_similarity=0.20
    )
    assert len(search_res) >= 1
    assert "Redaction" in search_res[0]["document_title"] or "Security" in search_res[0]["document_title"]
    assert search_res[0]["similarity"] > 0.20

    # 4. Context retrieval for Relevant Topic
    rag_context = await RAGService.retrieve_context_for_topic(
        db=db_session,
        topic="Ransomware attack mitigation and IP address redaction",
        text_sample="Servers were encrypted on 10.240.12.88 with employee emails exposed",
        top_k=2
    )
    assert len(rag_context["retrieved_chunks"]) >= 1
    assert "ORGANIZATIONAL KNOWLEDGE" in rag_context["rag_prompt_block"]

    # 5. Context retrieval for Unrelated Topic (Must return 0 chunks & empty block)
    unrelated_context = await RAGService.retrieve_context_for_topic(
        db=db_session,
        topic="Traditional Neapolitan Pizza Dough Fermentation",
        text_sample="Flour water yeast salt fermented for 24 hours at room temperature",
        top_k=2
    )
    assert len(unrelated_context["retrieved_chunks"]) == 0
    assert unrelated_context["rag_prompt_block"] == ""
    assert len(unrelated_context["sources_referenced"]) == 0

def test_routes_knowledge_api():
    # 1. Test Seed Default Enterprise Policies
    seed_resp = client.post("/api/knowledge/seed")
    assert seed_resp.status_code == 200
    assert "seeded" in seed_resp.json()["message"].lower()

    # 2. Test List Knowledge
    list_resp = client.get("/api/knowledge")
    assert list_resp.status_code == 200
    docs = list_resp.json()
    assert len(docs) >= 3

    # 3. Test Semantic Search Endpoint
    search_resp = client.post("/api/knowledge/search", json={
        "query": "How to structure executive slide decks and briefings?",
        "top_k": 3,
        "min_similarity": 0.10
    })
    assert search_resp.status_code == 200
    search_data = search_resp.json()
    assert search_data["total_matches"] >= 1

    # 4. Test Inspect Chunks Endpoint
    doc_id = docs[0]["id"]
    chunks_resp = client.get(f"/api/knowledge/{doc_id}/chunks")
    assert chunks_resp.status_code == 200
    chunks_data = chunks_resp.json()
    assert chunks_data["total_chunks"] >= 1
    assert chunks_data["chunks"][0]["has_embedding"] is True
