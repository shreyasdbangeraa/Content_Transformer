'use client'

import React, { useState } from 'react'
import { FactCheck } from '@/types'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import clsx from 'clsx'

interface FactCheckPanelProps {
  factCheck?: FactCheck
}

export default function FactCheckPanel({ factCheck }: FactCheckPanelProps) {
  const [expandedClaim, setExpandedClaim] = useState<string | null>(null)

  if (!factCheck) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-xs">
        <ShieldCheck className="h-10 w-10 mx-auto text-slate-400 mb-3" />
        <p className="font-medium">No verification data available for this output.</p>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="flex items-center gap-1.5 rounded-md bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            VERIFIED
          </span>
        )
      case 'PARTIALLY_SUPPORTED':
        return (
          <span className="flex items-center gap-1.5 rounded-md bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold text-amber-800">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            PARTIALLY SUPPORTED
          </span>
        )
      case 'UNSUPPORTED':
        return (
          <span className="flex items-center gap-1.5 rounded-md bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-700">
            <XCircle className="h-3.5 w-3.5 shrink-0" />
            UNSUPPORTED
          </span>
        )
      default:
        return (
          <span className="flex items-center gap-1.5 rounded-md bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
            <HelpCircle className="h-3.5 w-3.5 shrink-0" />
            {status}
          </span>
        )
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden space-y-5">
      {/* Header Summary */}
      <div className="p-6 sm:p-7 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-sky-600" />
            <h4 className="text-base sm:text-lg font-bold text-slate-900">Source Grounding & Fact Check Engine</h4>
          </div>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Every generated claim is extracted and verified against canonical source documentation.
          </p>
        </div>

        {/* Score Banner */}
        <div className="flex items-center gap-5 bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-xs">
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Grounding Score
            </div>
            <div className="text-2xl font-black text-sky-700 font-mono">
              {factCheck.grounding_score.toFixed(1)}%
            </div>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div className="flex items-center gap-4 text-sm">
            <div className="text-center">
              <div className="text-emerald-700 font-bold text-base">{factCheck.verified_claims}</div>
              <div className="text-xs text-slate-400 font-medium">Verified</div>
            </div>
            {factCheck.unsupported_claims > 0 && (
              <div className="text-center">
                <div className="text-rose-700 font-bold text-base">{factCheck.unsupported_claims}</div>
                <div className="text-xs text-slate-400 font-medium">Unsupported</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Claims List */}
      <div className="px-6 pb-6 space-y-4">
        <div className="text-sm font-bold text-slate-700 uppercase tracking-wider">
          Detected Claims ({factCheck.claims?.length || 0})
        </div>

        {factCheck.claims?.map((claim) => {
          const isExpanded = expandedClaim === claim.claim_id
          return (
            <div
              key={claim.claim_id}
              className={clsx(
                'rounded-2xl border transition-all',
                claim.status === 'VERIFIED'
                  ? 'border-slate-200 bg-slate-50/60 hover:border-emerald-300 hover:bg-white'
                  : claim.status === 'UNSUPPORTED'
                  ? 'border-rose-200 bg-rose-50/50 hover:border-rose-300'
                  : 'border-amber-200 bg-amber-50/50'
              )}
            >
              <div
                onClick={() => setExpandedClaim(isExpanded ? null : claim.claim_id)}
                className="p-5 flex items-start justify-between gap-4 cursor-pointer select-none"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {getStatusBadge(claim.status)}
                    {claim.source_page && (
                      <span className="text-xs font-mono text-sky-800 bg-sky-100 px-2.5 py-0.5 rounded font-bold border border-sky-200">
                        {claim.source_file} • Page {claim.source_page}
                      </span>
                    )}
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed">
                    &ldquo;{claim.text}&rdquo;
                  </p>
                </div>
                <div className="text-slate-400 hover:text-slate-700 transition-colors p-1">
                  {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </div>

              {/* Expanded Match & Reasoning Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-200 bg-white text-sm space-y-3.5">
                  {claim.source_match && (
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Exact Matching Source Excerpt:
                      </span>
                      <blockquote className="border-l-4 border-emerald-500 pl-4 py-2 text-slate-700 bg-slate-50 rounded-r-xl text-sm italic font-medium leading-relaxed">
                        &ldquo;{claim.source_match}&rdquo;
                      </blockquote>
                    </div>
                  )}

                  {claim.reasoning && (
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Verification Rationale:
                      </span>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">{claim.reasoning}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 font-medium">
                    <span>Confidence: {(claim.confidence * 100).toFixed(0)}%</span>
                    <span>Section: {claim.source_section || 'General'}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
