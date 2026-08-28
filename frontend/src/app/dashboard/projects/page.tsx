'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FolderKanban,
  Plus,
  Search,
  Trash2,
  ArrowRight,
  Layers,
} from 'lucide-react'
import { api } from '@/lib/api'
import { Project } from '@/types'

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await api.listProjects()
      setProjects(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()
  }, [])

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this project?')) return
    try {
      await api.deleteProject(id)
      setProjects(projects.filter((p) => p.id !== id))
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`)
    }
  }

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.domain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban className="h-5 w-5 text-sky-600" />
            Transformation Projects
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Manage your past and active multi-format intelligence pipelines.
          </p>
        </div>

        <Link
          href="/dashboard/new"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:from-sky-500 hover:to-indigo-500 transition-all shadow-md shadow-sky-600/20"
        >
          <Plus className="h-4 w-4" />
          <span>New Transformation</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects by title, domain, or keywords..."
          className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none shadow-2xs font-medium"
        />
      </div>

      {/* Project Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3 bg-white">
          <FolderKanban className="h-8 w-8 mx-auto text-slate-400" />
          <p className="text-xs text-slate-500 font-medium">No matching projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => router.push(`/dashboard/projects/${p.id}`)}
              className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 hover:border-sky-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] rounded bg-sky-50 text-sky-800 font-mono font-bold px-2 py-0.5 border border-sky-200">
                    {p.domain}
                  </span>
                  <button
                    onClick={(e) => handleDelete(p.id, e)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    title="Delete project"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-slate-900 hover:text-sky-700 transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 font-medium">
                  {p.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <div className="flex items-center gap-2">
                  <Layers className="h-3.5 w-3.5 text-sky-600" />
                  <span>{p.outputs_count || 0} Artefacts</span>
                </div>
                <span className="flex items-center gap-1 text-sky-700 font-bold">
                  <span>Open Studio</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
