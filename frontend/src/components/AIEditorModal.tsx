'use client'

import React, { useState } from 'react'
import { Output } from '@/types'
import {
  Sparkles,
  Send,
  X,
  Check,
  Edit3,
  RefreshCw,
} from 'lucide-react'
import { api } from '@/lib/api'
import StructuredContentRenderer from '@/components/StructuredContentRenderer'
import clsx from 'clsx'

interface AIEditorModalProps {
  output: Output
  isOpen: boolean
  onClose: () => void
  onUpdated: (updated: Output) => void
}

const PROMPT_SUGGESTIONS = [
  'Make it shorter and more concise for busy executives',
  'Translate to Kannada (ಕನ್ನಡ) preserving verified facts',
  'Translate to Hindi (हिंदी) with formal tone',
  'Elevate formality and urgency for government cyber regulators',
  'Remove unverified claims and emphasize 42-min containment',
]

export default function AIEditorModal({
  output,
  isOpen,
  onClose,
  onUpdated,
}: AIEditorModalProps) {
  const [prompt, setPrompt] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDirectEdit, setIsDirectEdit] = useState(false)
  const [directContent, setDirectContent] = useState(output.raw_content)
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; time: string }>>([])

  if (!isOpen) return null

  const handleConversationalSubmit = async (customPrompt?: string) => {
    const textToSend = customPrompt || prompt
    if (!textToSend.trim()) return

    try {
      setIsProcessing(true)
      const userMsg = { role: 'user' as const, text: textToSend, time: new Date().toLocaleTimeString() }
      setChatHistory((prev) => [...prev, userMsg])
      setPrompt('')

      const updated = await api.conversationalEdit(output.id, textToSend)
      setDirectContent(updated.raw_content)
      onUpdated(updated)

      const botMsg = {
        role: 'assistant' as const,
        text: `Updated to Version ${updated.version}: Source grounding & facts preserved.`,
        time: new Date().toLocaleTimeString(),
      }
      setChatHistory((prev) => [...prev, botMsg])
    } catch (err: any) {
      alert(`AI Edit failed: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDirectSave = async () => {
    try {
      setIsProcessing(true)
      const updated = await api.directEdit(output.id, directContent, 'Manual operator adjustment')
      onUpdated(updated)
      setIsDirectEdit(false)
    } catch (err: any) {
      alert(`Save failed: ${err.message}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="flex h-[90vh] w-full max-w-6xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700 border border-sky-200 shadow-2xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Conversational AI Editor & Versioning Studio
                </h3>
                <span className="rounded bg-sky-100 text-sky-800 px-2 py-0.5 text-xs font-mono font-bold">
                  v{output.version}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Format: <strong className="text-slate-800">{output.format_type.toUpperCase()}</strong> • Grounded in canonical source facts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDirectEdit(!isDirectEdit)}
              className={clsx(
                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors shadow-2xs',
                isDirectEdit
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              )}
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{isDirectEdit ? 'Direct Edit Mode Active' : 'Enable Direct Edit'}</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Left Column: Content Editor / Preview (7 cols) */}
          <div className="lg:col-span-7 flex flex-col border-r border-slate-200 bg-white p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isDirectEdit ? 'Edit Output Text Directly' : 'Live Output Document'}
              </span>
              {isDirectEdit && (
                <button
                  onClick={handleDirectSave}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white hover:bg-emerald-500 transition-all shadow-xs"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Save Manual Edit</span>
                </button>
              )}
            </div>

            {isDirectEdit ? (
              <textarea
                value={directContent}
                onChange={(e) => setDirectContent(e.target.value)}
                className="w-full flex-1 rounded-xl border border-slate-300 bg-slate-50 p-4 text-xs text-slate-800 font-mono focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none min-h-[400px]"
              />
            ) : (
              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50/50 p-5 overflow-y-auto">
                <StructuredContentRenderer content={output.raw_content} />
              </div>
            )}
          </div>

          {/* Right Column: Conversational AI Assistant & History (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50/80 p-5 space-y-4 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                  Ask AI to Refine Output
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  Instruct the AI to shorten, translate, or adapt tone while preserving verified source facts.
                </p>
              </div>

              {/* Quick Prompt Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  Suggested Instructions:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PROMPT_SUGGESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleConversationalSubmit(s)}
                      disabled={isProcessing}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] text-slate-700 font-medium hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 transition-all text-left shadow-2xs disabled:opacity-50"
                    >
                      ⚡ {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Session Messages */}
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {chatHistory.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-400 bg-white/60 font-medium">
                    No revisions in this session yet. Type an instruction below or click a suggestion chip.
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => (
                    <div
                      key={idx}
                      className={clsx(
                        'rounded-xl p-3 text-xs space-y-1 shadow-2xs',
                        msg.role === 'user'
                          ? 'bg-sky-50 border border-sky-200 text-sky-900 ml-4 font-semibold'
                          : 'bg-white border border-slate-200 text-slate-800 mr-4 font-medium'
                      )}
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold">
                        <span>{msg.role === 'user' ? 'You' : 'AI Assistant'}</span>
                        <span>{msg.time}</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Input Bar */}
            <div className="pt-2 border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleConversationalSubmit()
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. 'Make it suitable for government regulators'..."
                  disabled={isProcessing}
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none shadow-2xs font-medium"
                />
                <button
                  type="submit"
                  disabled={isProcessing || !prompt.trim()}
                  className="rounded-xl bg-sky-600 p-2.5 text-white hover:bg-sky-500 disabled:opacity-50 transition-colors shrink-0 shadow-xs"
                >
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
