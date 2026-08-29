'use client'

import React, { useState, useEffect } from 'react'
import { Output } from '@/types'
import {
  Edit3,
  Save,
  X,
  Eye,
  FileText,
  RotateCcw,
  CheckCircle2,
  RefreshCw,
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading,
  Quote,
  Sparkles,
} from 'lucide-react'
import { api } from '@/lib/api'
import StructuredContentRenderer from '@/components/StructuredContentRenderer'
import clsx from 'clsx'

interface ManualEditorModalProps {
  output: Output
  isOpen: boolean
  onClose: () => void
  onUpdated: (updated: Output) => void
}

export default function ManualEditorModal({
  output,
  isOpen,
  onClose,
  onUpdated,
}: ManualEditorModalProps) {
  const [content, setContent] = useState(output.raw_content || '')
  const [changeReason, setChangeReason] = useState('Manual operator refinement')
  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'split'>('split')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setContent(output.raw_content || '')
    setChangeReason('Manual operator refinement')
  }, [output])

  if (!isOpen) return null

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const charCount = content.length
  const readTime = Math.ceil(wordCount / 200)

  const handleSave = async () => {
    if (!content.trim()) {
      alert('Content cannot be empty.')
      return
    }

    try {
      setIsSaving(true)
      const updated = await api.directEdit(
        output.id,
        content,
        changeReason.trim() || 'Manual edit by operator'
      )
      onUpdated(updated)
      onClose()
    } catch (err: any) {
      alert(`Failed to save manual edit: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = document.getElementById('manual-editor-textarea') as HTMLTextAreaElement
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const replacement = `${prefix}${selectedText || 'text'}${suffix}`

    const newContent = content.substring(0, start) + replacement + content.substring(end)
    setContent(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText.length || 4))
    }, 0)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 animate-fade-in">
      <div className="flex h-[92vh] w-full max-w-6xl flex-col rounded-3xl border border-slate-200/90 bg-white shadow-2xl overflow-hidden">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/90 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-600/20">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">Manual Content Editor</h3>
                <span className="rounded-full bg-sky-100 text-sky-800 text-[11px] font-extrabold px-2.5 py-0.5 border border-sky-200 uppercase font-mono">
                  {output.format_type.replace('_', ' ')} • v{output.version}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Directly edit text, headings, statistics, and copy. Changes are saved as a new version.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center bg-slate-200/70 p-1 rounded-xl border border-slate-300/60">
              <button
                onClick={() => setActiveTab('editor')}
                className={clsx(
                  'px-3 py-1 text-xs font-bold rounded-lg transition-all',
                  activeTab === 'editor' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Editor Only
              </button>
              <button
                onClick={() => setActiveTab('split')}
                className={clsx(
                  'px-3 py-1 text-xs font-bold rounded-lg transition-all',
                  activeTab === 'split' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Split View
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={clsx(
                  'px-3 py-1 text-xs font-bold rounded-lg transition-all',
                  activeTab === 'preview' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Live Preview
              </button>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-6 py-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-1">
            <button
              onClick={() => insertFormatting('**', '**')}
              title="Bold"
              className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-700 font-bold"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              onClick={() => insertFormatting('*', '*')}
              title="Italic"
              className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-700"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              onClick={() => insertFormatting('### ')}
              title="Heading"
              className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-700"
            >
              <Heading className="h-4 w-4" />
            </button>
            <button
              onClick={() => insertFormatting('- ')}
              title="Bullet List"
              className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-700"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => insertFormatting('1. ')}
              title="Numbered List"
              className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-700"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
            <button
              onClick={() => insertFormatting('> ')}
              title="Quote / Callout"
              className="rounded-lg p-1.5 hover:bg-slate-100 text-slate-700"
            >
              <Quote className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 font-medium">
            <span>{wordCount} words</span>
            <span>•</span>
            <span>{charCount} characters</span>
            <span>•</span>
            <span>~{readTime} min read</span>
          </div>
        </div>

        {/* MAIN WORKSPACE BODY */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-slate-50/50">
          {/* EDITOR PANE */}
          {(activeTab === 'editor' || activeTab === 'split') && (
            <div
              className={clsx(
                'flex flex-col h-full bg-white p-4',
                activeTab === 'split' ? 'md:col-span-6' : 'md:col-span-12'
              )}
            >
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                Markdown / Plaintext Content Editor
              </label>
              <textarea
                id="manual-editor-textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter or refine your content here..."
                className="flex-1 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50/60 p-4 font-mono text-xs sm:text-sm text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none leading-relaxed transition-all shadow-inner"
              />
            </div>
          )}

          {/* LIVE FORMATTED PREVIEW PANE */}
          {(activeTab === 'preview' || activeTab === 'split') && (
            <div
              className={clsx(
                'flex flex-col h-full bg-slate-50 p-4 overflow-y-auto',
                activeTab === 'split' ? 'md:col-span-6' : 'md:col-span-12'
              )}
            >
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-sky-600" />
                <span>Live Formatted Preview</span>
              </label>
              <div className="flex-1 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs overflow-y-auto">
                <StructuredContentRenderer content={content} />
              </div>
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-200/80 bg-slate-50/90 px-6 py-4">
          <div className="flex-1 max-w-md space-y-1">
            <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">
              Change Reason / Version Tag
            </label>
            <input
              type="text"
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="e.g. Updated executive summary metrics, refined headline"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-sky-500 focus:outline-none font-medium shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <button
              onClick={() => setContent(output.raw_content || '')}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors shadow-2xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-cyan-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-sky-600/20 hover:shadow-sky-600/30 active:scale-98 disabled:opacity-50 transition-all"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving Version v{output.version + 1}...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save as v{output.version + 1} & Update</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
