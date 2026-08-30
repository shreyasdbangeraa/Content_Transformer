'use client'

import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  FileText,
  Tag,
  Sparkles,
  Layers,
  X,
  Upload,
  Cpu,
  Zap,
  Eye,
  Sliders,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Database,
  Hash
} from 'lucide-react'
import { api } from '@/lib/api'

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [modalTab, setModalTab] = useState<'upload' | 'text'>('upload')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [docType, setDocType] = useState('Brand Guidelines')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Chunk inspection modal
  const [inspectingDoc, setInspectingDoc] = useState<any | null>(null)
  const [inspectChunks, setInspectChunks] = useState<any[]>([])
  const [loadingChunks, setLoadingChunks] = useState(false)

  // Semantic Search Tester state
  const [semanticQuery, setSemanticQuery] = useState('')
  const [semanticFilterType, setSemanticFilterType] = useState('All')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[] | null>(null)

  const loadDocs = async () => {
    try {
      setLoading(true)
      const data = await api.listKnowledge()
      setDocuments(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.warn('Knowledge documents load warning:', err)
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDocs()
  }, [])

  const handleCreateText = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) return
    try {
      setIsSubmitting(true)
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean)
      const doc = await api.addKnowledge({ title, content, doc_type: docType, tags: tagList })
      setDocuments([doc, ...documents])
      setShowAddModal(false)
      setTitle('')
      setContent('')
      setTags('')
    } catch (err: any) {
      alert(`Add failed: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUploadFile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return
    try {
      setIsSubmitting(true)
      const doc = await api.uploadKnowledgeFile(selectedFile, title, docType, tags)
      setDocuments([doc, ...documents])
      setShowAddModal(false)
      setSelectedFile(null)
      setTitle('')
      setTags('')
    } catch (err: any) {
      alert(`Upload & vectorization failed: ${err.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSeedDefaults = async () => {
    try {
      setIsSeeding(true)
      const res = await api.seedKnowledge()
      alert(res.message || 'Seeded successfully!')
      loadDocs()
    } catch (err: any) {
      alert(`Seeding failed: ${err.message}`)
    } finally {
      setIsSeeding(false)
    }
  }

  const handleInspectChunks = async (doc: any) => {
    setInspectingDoc(doc)
    try {
      setLoadingChunks(true)
      const res = await api.getKnowledgeChunks(doc.id)
      setInspectChunks(res.chunks || [])
    } catch (err: any) {
      alert(`Failed to load chunks: ${err.message}`)
    } finally {
      setLoadingChunks(false)
    }
  }

  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!semanticQuery.trim()) return
    try {
      setIsSearching(true)
      const res = await api.searchKnowledge(semanticQuery, 4, 0.15, semanticFilterType === 'All' ? undefined : semanticFilterType)
      setSearchResults(res.matches || [])
    } catch (err: any) {
      alert(`Search failed: ${err.message}`)
    } finally {
      setIsSearching(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this document and all its vector chunks from knowledge base?')) return
    try {
      await api.deleteKnowledge(id)
      setDocuments(documents.filter((d) => d.id !== id))
      if (searchResults) {
        setSearchResults(searchResults.filter((m) => m.document_id !== id))
      }
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`)
    }
  }

  const filtered = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.doc_type?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-10 animate-fade-in pb-20 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="rounded-3xl border border-indigo-200/80 bg-gradient-to-r from-indigo-100/70 via-purple-50/60 to-sky-100/70 p-7 sm:p-9 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-indigo-900 bg-white/90 border border-indigo-200/80 px-3 py-1 rounded-full shadow-2xs font-mono">
              <Database className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
              RAG &amp; Vector Embeddings
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Organizational Knowledge Base
          </h1>
          <p className="text-sm sm:text-base text-slate-700 font-medium max-w-2xl leading-relaxed">
            Ingest corporate policies, brand voice rules, and reference papers into a chunked vector store that dynamically grounds AI transformations.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap relative z-10">
          <button
            onClick={handleSeedDefaults}
            disabled={isSeeding}
            className="flex items-center gap-2 rounded-2xl border border-indigo-300 bg-white/90 px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold text-indigo-950 hover:bg-white hover:border-indigo-400 hover:scale-105 active:scale-95 transition-all shadow-xs"
          >
            {isSeeding ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
                <span>Seeding...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-indigo-600" />
                <span>Seed Enterprise Policies</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-sky-600 px-5 sm:px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/30 hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Add Knowledge</span>
          </button>
        </div>
      </div>

      {/* RAG PIPELINE EXPLAINER CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <div className="h-6 w-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-mono text-[11px] font-black">1</div>
            <span>Document Ingestion</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">PDF, DOCX, TXT extracted &amp; sanitized.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <div className="h-6 w-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-mono text-[11px] font-black">2</div>
            <span>Recursive Chunking</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Boundary-aware ~600 char chunks + overlap.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <div className="h-6 w-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-mono text-[11px] font-black">3</div>
            <span>Vector Embeddings</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">384-dimensional unit vector indexation.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
            <div className="h-6 w-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-mono text-[11px] font-black">4</div>
            <span>Canonical Injection</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Retrieved context grounds AI outputs.</p>
        </div>
      </div>

      {/* SEMANTIC SEARCH & RAG TESTER */}
      <div className="rounded-3xl border border-indigo-200/90 bg-gradient-to-br from-white via-indigo-50/30 to-sky-50/20 p-6 sm:p-8 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase text-indigo-700 bg-indigo-100/80 px-2.5 py-0.5 rounded-full font-mono">
                Live Vector Retrieval
              </span>
              <span className="text-xs text-slate-500 font-medium">Cosine Similarity Matcher</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 mt-1">Test Semantic Knowledge Retrieval</h2>
          </div>
          <p className="text-xs text-slate-500 font-medium max-w-sm">
            Simulate how the AI searches and retrieves organizational guidelines for incoming topics.
          </p>
        </div>

        <form onSubmit={handleSemanticSearch} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={semanticQuery}
                onChange={(e) => setSemanticQuery(e.target.value)}
                placeholder="e.g. How should we report security incidents and redact IP addresses?"
                className="w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none shadow-xs font-medium focus:ring-4 focus:ring-indigo-50 transition-all"
              />
            </div>

            <select
              value={semanticFilterType}
              onChange={(e) => setSemanticFilterType(e.target.value)}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-indigo-500 shadow-xs"
            >
              <option value="All">All Document Types</option>
              <option value="Brand Guidelines">Brand Guidelines</option>
              <option value="Policy">Policy</option>
              <option value="Compliance">Compliance</option>
              <option value="Template">Template</option>
              <option value="Research Paper">Research Paper</option>
            </select>

            <button
              type="submit"
              disabled={isSearching || !semanticQuery.trim()}
              className="flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 text-white px-6 py-3 text-xs sm:text-sm font-bold shadow-md shadow-indigo-600/20 transition-all shrink-0"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Cpu className="h-4 w-4" />
                  <span>Run Semantic Search</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Search Results Display */}
        {searchResults && (
          <div className="space-y-4 pt-3 border-t border-indigo-100/80 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Found {searchResults.length} relevant vector chunks for &ldquo;{semanticQuery}&rdquo;
              </span>
              <button
                onClick={() => setSearchResults(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear Results
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center text-xs font-medium text-slate-500">
                No chunks matched with sufficient similarity score. Try broader terms or seed enterprise policies.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-indigo-200 bg-white space-y-2 shadow-xs hover:border-indigo-400 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-indigo-950 truncate max-w-[200px]">
                        {m.document_title}
                      </span>
                      <span className="shrink-0 text-[11px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-mono">
                        {(m.similarity * 100).toFixed(1)}% Match
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium line-clamp-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {m.content}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                      <span>Chunk #{m.chunk_index + 1}</span>
                      <span>{m.char_count} chars</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FILTER & DOCUMENTS REPOSITORY */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Stored Knowledge Documents ({filtered.length})
            </h2>
          </div>

          {/* Quick Filter */}
          <div className="relative w-full sm:w-72">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter stored documents..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none shadow-2xs font-medium"
            />
          </div>
        </div>

        {/* Documents Grid */}
        {loading ? (
          <div className="p-16 text-center text-sm font-bold text-slate-500">Loading knowledge documents...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-300 p-16 text-center space-y-4 bg-white">
            <BookOpen className="h-10 w-10 mx-auto text-slate-400" />
            <p className="text-base text-slate-600 font-medium">No knowledge documents stored yet.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleSeedDefaults}
                className="rounded-2xl bg-indigo-50 px-5 py-2.5 text-sm font-bold text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-xs"
              >
                Seed Sample Policies
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-500 transition-colors shadow-xs"
              >
                Upload First Document
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((doc) => (
              <div
                key={doc.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 flex flex-col justify-between shadow-xs hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] bg-indigo-50 text-indigo-900 font-mono font-black px-2.5 py-0.5 rounded-full border border-indigo-200">
                      {doc.doc_type}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        {doc.chunk_count || 1} Chunks Vectorized
                      </span>

                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg p-1.5 transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-medium">
                    {doc.content}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex flex-wrap gap-1.5">
                    {doc.tags?.map((tag: string, i: number) => (
                      <span
                        key={i}
                        className="rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-bold font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      onClick={() => handleInspectChunks(doc)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Inspect Vector Chunks</span>
                    </button>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Active'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD KNOWLEDGE MODAL (TABS: UPLOAD FILE vs PASTE TEXT) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-black uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full font-mono">
                  Vector Knowledge Ingestion
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">Add Organizational Policy / Document</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
              <button
                onClick={() => setModalTab('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  modalTab === 'upload'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Upload className="h-4 w-4" />
                <span>Upload Document File (.pdf, .docx, .txt)</span>
              </button>

              <button
                onClick={() => setModalTab('text')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  modalTab === 'text'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Paste Text Directly</span>
              </button>
            </div>

            {modalTab === 'upload' ? (
              <form onSubmit={handleUploadFile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Select File (PDF, DOCX, TXT)</label>
                  <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-6 text-center bg-slate-50 hover:bg-indigo-50/20 transition-all cursor-pointer relative">
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0])
                          if (!title) setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''))
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="h-8 w-8 mx-auto text-indigo-600 mb-2" />
                    <p className="text-sm font-bold text-slate-800">
                      {selectedFile ? selectedFile.name : 'Click to select or drag document file'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">Automatic text extraction, chunking, and vectorization.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Document Title (Optional override)</label>
                  <input
                    type="text"
                    placeholder="e.g. 2026 Enterprise Security Policy"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Document Type</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 font-medium"
                    >
                      <option value="Brand Guidelines">Brand Guidelines</option>
                      <option value="Policy">Policy</option>
                      <option value="Compliance">Compliance</option>
                      <option value="Template">Template</option>
                      <option value="Research Paper">Research Paper</option>
                      <option value="Internal Document">Internal Document</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Tags (comma separated)</label>
                    <input
                      type="text"
                      placeholder="compliance, security, voice"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedFile}
                    className="rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Extracting & Indexing...' : 'Upload & Vectorize'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCreateText} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Document Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Technical Terminology & Brand Voice Guidelines"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Document Type</label>
                    <select
                      value={docType}
                      onChange={(e) => setDocType(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 font-medium"
                    >
                      <option value="Brand Guidelines">Brand Guidelines</option>
                      <option value="Policy">Policy</option>
                      <option value="Compliance">Compliance</option>
                      <option value="Template">Template</option>
                      <option value="Research Paper">Research Paper</option>
                      <option value="Internal Document">Internal Document</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase">Tags (comma separated)</label>
                    <input
                      type="text"
                      placeholder="compliance, security, voice"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Policy Content / Guidelines</label>
                  <textarea
                    rows={6}
                    placeholder="Paste organizational guidelines, tone requirements, terminology rules, or compliance standards..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-4 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500 font-mono"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:from-sky-500 hover:to-indigo-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Indexing Chunks...' : 'Save & Vectorize'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* INSPECT CHUNKS MODAL */}
      {inspectingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-3xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-200 max-h-[85vh] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0">
              <div>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full font-mono">
                  {inspectingDoc.doc_type}
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-1">
                  Vector Chunks: {inspectingDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectingDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {loadingChunks ? (
                <div className="p-12 text-center text-sm font-bold text-slate-500">Loading vector chunks...</div>
              ) : inspectChunks.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">No chunks recorded.</div>
              ) : (
                inspectChunks.map((chunk, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-indigo-900 font-mono flex items-center gap-1">
                        <Hash className="h-3.5 w-3.5 text-indigo-600" />
                        Chunk #{chunk.chunk_index + 1}
                      </span>
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-mono">
                        Vectorized (384-dim)
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap bg-white p-3 rounded-xl border border-slate-100">
                      {chunk.content}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{chunk.word_count} words</span>
                      <span>{chunk.char_count} characters</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-200 shrink-0">
              <button
                onClick={() => setInspectingDoc(null)}
                className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 px-5 py-2.5 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
