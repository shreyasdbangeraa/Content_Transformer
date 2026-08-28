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
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-sky-600" />
            Knowledge Base & Organizational RAG
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Store organizational guidelines, terminology, and communication policies injected into AI transformations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:from-sky-500 hover:to-indigo-500 transition-all shadow-md shadow-sky-600/20"
        >
          <Plus className="h-4 w-4" />
          <span>Add Knowledge Document</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search organizational policies, brand rules, terminology..."
          className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none shadow-2xs font-medium"
        />
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading knowledge documents...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3 bg-white">
          <BookOpen className="h-8 w-8 mx-auto text-slate-400" />
          <p className="text-xs text-slate-500 font-medium">No knowledge documents stored yet.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-lg bg-sky-50 px-3.5 py-1.5 text-xs font-bold text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors shadow-2xs"
          >
            Add First Policy
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] bg-slate-100 text-sky-800 font-mono font-bold px-2 py-0.5 rounded">
                    {doc.doc_type}
                  </span>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{doc.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 font-medium">
                  {doc.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <div className="flex flex-wrap gap-1">
                  {doc.tags?.map((t: string, idx: number) => (
                    <span key={idx} className="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] text-slate-600">
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
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Add Organizational Knowledge</h3>
            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Document Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Government Cyber Advisory Style Guidelines"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none shadow-2xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none shadow-2xs font-semibold"
                >
                  <option value="Brand Guidelines">Brand Guidelines</option>
                  <option value="Policy & Compliance">Policy & Compliance</option>
                  <option value="Terminology Dictionary">Terminology Dictionary</option>
                  <option value="Standard Operating Procedure">Standard Operating Procedure</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Content / Directives</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter specific terminology rules, disclaimers, or mandatory styling..."
                  rows={6}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none shadow-2xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-slate-800 focus:border-sky-500 focus:bg-white focus:outline-none shadow-2xs font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-sky-600 px-5 py-2 font-bold text-white hover:bg-sky-500 shadow-xs"
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
