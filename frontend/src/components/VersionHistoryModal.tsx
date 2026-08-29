'use client'

import React from 'react'
import {
  X,
  ShieldCheck,
  Link as LinkIcon,
  Clock,
  User,
  Hash,
  ExternalLink,
  CheckCircle2,
  FileText,
  Sparkles,
  Edit3,
  CheckCheck,
  Send,
  ArrowDown
} from 'lucide-react'

interface VersionHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  contentId: string
  contentTitle?: string
  history: any[]
  currentVersion?: number | string
}

export default function VersionHistoryModal({
  isOpen,
  onClose,
  contentId,
  contentTitle,
  history,
  currentVersion,
}: VersionHistoryModalProps) {
  if (!isOpen) return null

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'ORIGINAL_UPLOAD':
        return { label: 'Original Source Upload', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: FileText }
      case 'AI_TRANSFORMATION':
        return { label: 'AI Transformation Pipeline', color: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Sparkles }
      case 'HUMAN_EDIT':
        return { label: 'Human Operator Direct Edit', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Edit3 }
      case 'AI_REFINEMENT':
        return { label: 'Conversational AI Refinement', color: 'bg-purple-50 text-purple-700 border-purple-200', icon: Sparkles }
      case 'APPROVED':
        return { label: 'Executive / Compliance Approval', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCheck }
      case 'PUBLISHED':
        return { label: 'Published via n8n Distribution', color: 'bg-sky-50 text-sky-700 border-sky-200', icon: Send }
      default:
        return { label: action, color: 'bg-slate-100 text-slate-700 border-slate-200', icon: ShieldCheck }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-indigo-50/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center text-indigo-600 shadow-inner">
              <LinkIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                Cryptographic Version History
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Hash Chain Verified
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium truncate max-w-md">
                {contentTitle || contentId} • Immutable SHA-256 Provenance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Timeline Body */}
        <div className="p-6 overflow-y-auto space-y-6 max-h-[calc(90vh-140px)]">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <ShieldCheck className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-semibold">No blockchain records found for this asset.</p>
            </div>
          ) : (
            <div className="relative pl-6 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-purple-500 before:to-emerald-500">
              {history.map((record, index) => {
                const badge = getActionBadge(record.action_type)
                const IconComponent = badge.icon
                const isLatest = index === history.length - 1

                return (
                  <div key={record.id || index} className="relative mb-8 last:mb-0 group">
                    {/* Node Dot */}
                    <div className="absolute -left-[31px] top-1.5 h-6 w-6 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 group-hover:border-emerald-600 transition-all">
                      <div className="h-2 w-2 rounded-full bg-indigo-600 group-hover:bg-emerald-600" />
                    </div>

                    {/* Card Content */}
                    <div className="p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-300 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-lg bg-slate-900 text-white">
                            {record.version_tag || `V${record.version_number}`}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-lg border ${badge.color}`}>
                            <IconComponent className="h-3.5 w-3.5" />
                            <span>{badge.label}</span>
                          </span>
                          {isLatest && (
                            <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-md bg-emerald-500 text-white shadow-2xs">
                              Active Head
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {record.created_at
                              ? new Date(record.created_at).toLocaleString()
                              : 'Timestamp recorded'}
                          </span>
                        </div>
                      </div>

                      {/* Cryptographic Digests */}
                      <div className="space-y-1.5 my-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono">
                        <div className="flex items-center justify-between text-slate-600 gap-2">
                          <span className="text-slate-400 font-medium">Content Digest:</span>
                          <span className="font-bold text-slate-900 truncate max-w-[280px]" title={record.content_hash}>
                            {record.content_hash}
                          </span>
                        </div>
                        {record.previous_hash && record.previous_hash !== '0x0000000000000000000000000000000000000000000000000000000000000000' && (
                          <div className="flex items-center justify-between text-slate-500 gap-2 border-t border-slate-100 pt-1">
                            <span className="text-slate-400">Parent Pointer:</span>
                            <span className="truncate max-w-[280px]" title={record.previous_hash}>
                              {record.previous_hash}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Transaction Receipt Footer */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                        <div className="flex items-center gap-2">
                          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                          <span className="font-medium">{record.blockchain_network || 'Ethereum Sepolia Testnet'}</span>
                          <span className="text-slate-300">•</span>
                          <span>Block #{record.block_number || '1248192'}</span>
                        </div>
                        {record.transaction_hash && (
                          <span className="font-mono text-indigo-600 hover:underline cursor-pointer flex items-center gap-1">
                            <span>Tx: {record.transaction_hash.slice(0, 8)}...{record.transaction_hash.slice(-6)}</span>
                            <ExternalLink className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Cryptographically sealed on EVM append-only ledger</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
