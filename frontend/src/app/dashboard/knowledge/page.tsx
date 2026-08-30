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
} from 'lucide-react'
import { api } from '@/lib/api'

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [docType, setDocType] = useState('Brand Guidelines')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')

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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) return
    try {
      const tagList = tags.split(',').map((t) => t.trim()).filter(Boolean)
      const doc = await api.addKnowledge({ title, content, doc_type: docType, tags: tagList })
      setDocuments([doc, ...documents])
      setShowAddModal(false)
      setTitle('')
      setContent('')
    } catch (err: any) {
      alert(`Add failed: ${err.message}`)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this document from knowledge base?')) return
    try {
      await api.deleteKnowledge(id)
      setDocuments(documents.filter((d) => d.id !== id))
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`)
    }
  }

  const filtered = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-8 animate-fade-in pb-20 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-200 pb-6">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            Organizational Knowledge &amp; RAG Context
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Store organizational guidelines, terminology, and communication policies injected into AI transformations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-cyan-600 px-6 py-3 text-sm font-bold text-white hover:shadow-lg hover:shadow-indigo-600/25 transition-all shadow-md active:scale-95 self-start sm:self-center"
        >
          <Plus className="h-5 w-5" />
          <span>Add Knowledge Document</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search organizational policies, brand rules, terminology..."
          className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-5 py-3.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none shadow-xs font-medium focus:ring-4 focus:ring-indigo-50 transition-all"
        />
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="p-16 text-center text-sm font-bold text-slate-500">Loading knowledge documents...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-300 p-16 text-center space-y-4 bg-white">
          <BookOpen className="h-10 w-10 mx-auto text-slate-400" />
          <p className="text-base text-slate-600 font-medium">No knowledge documents stored yet.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-2xl bg-indigo-50 px-5 py-2.5 text-sm font-bold text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors shadow-xs"
          >
            Add First Policy
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 space-y-4 flex flex-col justify-between shadow-xs hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-indigo-50 text-indigo-800 font-mono font-bold px-2.5 py-1 rounded-md border border-indigo-200">
                    {doc.doc_type}
                  </span>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg p-1.5 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{doc.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed font-medium">
                  {doc.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {doc.tags?.map((tag: string, i: number) => (
                    <span
                      key={i}
                      className="rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 text-[11px] font-bold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Active'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 className="text-lg font-black text-slate-900">Add Organizational Policy Document</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-xl hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
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
                    <option value="Terminology">Terminology</option>
                    <option value="Template">Template</option>
                    <option value="Compliance">Compliance</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="cybersecurity, compliance, style"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase">Document Content / Policy Text</label>
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
                  className="rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:from-sky-500 hover:to-indigo-500"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
