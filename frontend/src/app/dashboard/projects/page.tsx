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
  Sparkles,
  Calendar,
  Building,
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
    <div className="space-y-8 animate-fade-in pb-20 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-slate-200 pb-6">
        <div className="space-y-1.5">
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <FolderKanban className="h-8 w-8 text-indigo-600" />
            Transformation Projects
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium">
            Manage your past and active multi-format intelligence pipelines.
          </p>
        </div>

        <Link
          href="/dashboard/new"
          className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-cyan-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 transition-all self-start sm:self-center"
        >
          <Plus className="h-5 w-5" />
          <span>New Transformation</span>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects by title, domain, or keywords..."
          className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-5 py-3.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none shadow-xs font-medium focus:ring-4 focus:ring-indigo-50 transition-all"
        />
      </div>

      {/* Project Cards Grid */}
      {loading ? (
        <div className="p-16 text-center text-sm font-bold text-slate-500">Loading projects...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-300 p-16 text-center space-y-4 bg-white">
          <FolderKanban className="h-10 w-10 mx-auto text-slate-400" />
          <p className="text-base text-slate-600 font-medium">No matching projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              onClick={() => router.push(`/dashboard/projects/${p.id}`)}
              className="rounded-3xl border border-slate-200 bg-white p-6 space-y-5 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-xs group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs rounded-md bg-indigo-50 text-indigo-800 font-mono font-bold px-2.5 py-1 border border-indigo-200">
                    {p.domain}
                  </span>
                  <button
                    onClick={(e) => handleDelete(p.id, e)}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg p-1.5 transition-colors"
                    title="Delete project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                  {p.title}
                </h3>
                <p className="text-sm text-slate-600 line-clamp-2 font-medium leading-relaxed">
                  {p.description || 'Verified canonical transformation project.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-600" />
                  <span>{p.outputs?.length || 0} Artefacts</span>
                </div>
                <span className="flex items-center gap-1.5 text-indigo-700 font-bold text-sm group-hover:translate-x-1 transition-transform">
                  <span>Open Studio</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
