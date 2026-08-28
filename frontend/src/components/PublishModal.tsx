'use client'

import React, { useState } from 'react'
import { Output } from '@/types'
import {
  Send,
  X,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Linkedin,
  Twitter,
  Instagram,
  Workflow,
  Radio,
  Zap,
} from 'lucide-react'
import { api } from '@/lib/api'
import clsx from 'clsx'

interface PublishModalProps {
  output: Output
  isOpen: boolean
  onClose: () => void
  onPublished: () => void
}

export default function PublishModal({
  output,
  isOpen,
  onClose,
  onPublished,
}: PublishModalProps) {
  const [platform, setPlatform] = useState<'linkedin' | 'twitter' | 'instagram' | 'n8n'>('linkedin')
  const [scheduledAt, setScheduledAt] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  const isApproved = output.status === 'APPROVED' || output.status === 'PUBLISHED'

  const handlePublish = async () => {
    if (!isApproved) {
      alert('Security Policy Enforcement: Deliverable must be explicitly APPROVED by a human operator before publishing.')
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMsg('')
      await api.publishToN8n(output.id, platform, undefined, scheduledAt || undefined)
      setIsSuccess(true)
      onPublished()
      setTimeout(() => {
        setIsSuccess(false)
        onClose()
      }, 2000)
    } catch (err: any) {
      setErrorMsg(err.message || 'Publishing dispatch failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-indigo-100 p-2.5 text-indigo-700">
              <Workflow className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">Publish via n8n Automation</h3>
                <span className="rounded-md bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-extrabold px-2 py-0.5 font-mono">
                  CwDM3Nx2ruQ7lKt0
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Social Media AI Publisher workflow with evidence verification gating
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Approval Check Warning */}
        {!isApproved ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <span className="font-bold">Human Approval Sign-Off Required</span>
              <p>
                Strict security rule: To prevent ungrounded or accidental releases, deliverables must be approved in the studio before webhook dispatch.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 flex items-center gap-2.5 text-xs text-emerald-800 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Human verification & approval confirmed. Ready for certified distribution.</span>
          </div>
        )}

        {/* Platform Selector */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Target Distribution Channel
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { id: 'linkedin', label: 'LinkedIn Post & Banner', icon: Linkedin },
              { id: 'twitter', label: 'X / Twitter Thread', icon: Twitter },
              { id: 'instagram', label: 'Instagram Visual Deck', icon: Instagram },
              { id: 'n8n', label: 'Direct n8n Execution', icon: Zap },
            ].map((p) => {
              const Icon = p.icon
              const isSel = platform === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id as any)}
                  className={clsx(
                    'flex items-center gap-2.5 p-3.5 rounded-2xl border text-xs font-bold transition-all shadow-xs',
                    isSel
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white hover:border-slate-300'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{p.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Schedule Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <span>Schedule Automated Publication (Optional)</span>
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none shadow-xs font-medium"
          />
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
            {errorMsg}
          </div>
        )}

        {/* Success message */}
        {isSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Dispatched to n8n workflow CwDM3Nx2ruQ7lKt0 successfully!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePublish}
            disabled={!isApproved || isSubmitting || isSuccess}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-500 hover:to-sky-500 disabled:opacity-50 transition-all"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isSubmitting ? 'Dispatching...' : 'Dispatch to n8n'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
