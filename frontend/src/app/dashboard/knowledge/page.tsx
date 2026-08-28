'use client'

import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  Plus,
  Trash2,
  Search,
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
      setDocuments(data)
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
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3 tracking-tight">
            <BookOpen className="h-8 w-8 text-sky-600" />
            Organizational Knowledge & RAG Context
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Store organizational guidelines, terminology, and communication policies injected into AI transformations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white hover:from-sky-500 hover:to-indigo-500 transition-all shadow-md shadow-sky-600/25 active:scale-95"
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
          className="w-full rounded-2xl border border-slate-300 bg-white pl-12 pr-5 py-3.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none shadow-xs font-medium"
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
            className="rounded-2xl bg-sky-50 px-5 py-2.5 text-sm font-bold text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors shadow-xs"
          >
            Add First Policy
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 flex flex-col justify-between shadow-xs hover:border-sky-300 hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-slate-100 text-sky-800 font-mono font-bold px-2.5 py-1 rounded-md border border-slate-200">
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
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{doc.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 font-medium">
                  {doc.content}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                <div className="flex flex-wrap gap-1.5">
                  {doc.tags?.map((t: string, idx: number) => (
                    <span key={idx} className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-xs text-slate-600">
                      #{t}
                    </span>
                  ))}
                </div>
                <span>{new Date(doc.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Document Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Add Organizational Knowledge</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Document Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Government Cyber Advisory Style Guidelines"
                  required
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs font-semibold"
                >
                  <option value="Brand Guidelines">Brand Guidelines</option>
                  <option value="Policy & Compliance">Policy & Compliance</option>
                  <option value="Terminology Dictionary">Terminology Dictionary</option>
                  <option value="Standard Operating Procedure">Standard Operating Procedure</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Content / Directives</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter specific terminology rules, disclaimers, or mandatory styling..."
                  rows={6}
                  required
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 p-4 text-sm text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs font-normal leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="Cybersecurity, Policy, Formatting"
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none shadow-xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-2xl border border-slate-300 px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-sky-600 px-6 py-2.5 font-bold text-white hover:bg-sky-500 shadow-md text-sm"
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
