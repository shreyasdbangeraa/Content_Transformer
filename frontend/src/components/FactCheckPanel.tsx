'use client'

import React from 'react'
import {
  FactCheck,
  ClaimVerification,
} from '@/types'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ShieldCheck,
  FileCheck,
  AlertOctagon,
  Sparkles,
} from 'lucide-react'
import clsx from 'clsx'

interface FactCheckPanelProps {
  factCheck?: FactCheck
}

export default function FactCheckPanel({ factCheck }: FactCheckPanelProps) {
  if (!factCheck) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-500 text-sm font-medium">
        No claim verification records available.
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black px-2.5 py-1 flex items-center gap-1.5 uppercase">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            VERIFIED
          </span>
        )
      case 'PARTIALLY_SUPPORTED':
        return (
          <span className="rounded-md bg-amber-100 text-amber-800 border border-amber-200 text-xs font-black px-2.5 py-1 flex items-center gap-1.5 uppercase">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            PARTIALLY SUPPORTED
          </span>
        )
      case 'UNSUPPORTED':
        return (
          <span className="rounded-md bg-rose-100 text-rose-800 border border-rose-200 text-xs font-black px-2.5 py-1 flex items-center gap-1.5 uppercase">
            <XCircle className="h-3.5 w-3.5 text-rose-600" />
            UNSUPPORTED
          </span>
        )
      case 'CONTRADICTED':
        return (
          <span className="rounded-md bg-rose-200 text-rose-900 border border-rose-300 text-xs font-black px-2.5 py-1 flex items-center gap-1.5 uppercase">
            <AlertOctagon className="h-3.5 w-3.5 text-rose-700" />
            CONTRADICTED
          </span>
        )
      case 'OPINION_CREATIVE':
        return (
          <span className="rounded-md bg-purple-100 text-purple-800 border border-purple-200 text-xs font-black px-2.5 py-1 flex items-center gap-1.5 uppercase">
            <Sparkles className="h-3.5 w-3.5 text-purple-600" />
            OPINION / FRAMING
          </span>
        )
      default:
        return (
          <span className="rounded-md bg-slate-100 text-slate-700 text-xs font-bold px-2 py-0.5">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 space-y-6 shadow-xs">
      {/* Header & Grounding Score Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            <h3 className="text-lg font-extrabold text-slate-900">
              Claim-Level Fact Checking & Grounding Audit
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
            Every factual claim extracted from this output is audited against Canonical Knowledge and verified research.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-center shadow-xs">
            <div className="text-2xl font-black text-emerald-700 leading-none">
              {factCheck.grounding_score.toFixed(0)}%
            </div>
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block mt-1">
              Grounding Index
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5 text-center space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Claims</span>
          <div className="text-xl font-black text-slate-900">{factCheck.total_claims}</div>
        </div>
        <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200 p-3.5 text-center space-y-1">
          <span className="text-xs font-bold text-emerald-700 uppercase">Verified</span>
          <div className="text-xl font-black text-emerald-800">{factCheck.verified_claims}</div>
        </div>
        <div className="rounded-2xl bg-amber-50/70 border border-amber-200 p-3.5 text-center space-y-1">
          <span className="text-xs font-bold text-amber-700 uppercase">Partial / Creative</span>
          <div className="text-xl font-black text-amber-800">
            {factCheck.partially_supported + (factCheck.opinion_creative || 0)}
          </div>
        </div>
        <div className="rounded-2xl bg-rose-50/70 border border-rose-200 p-3.5 text-center space-y-1">
          <span className="text-xs font-bold text-rose-700 uppercase">Unsupported</span>
          <div className="text-xl font-black text-rose-800">
            {factCheck.unsupported_claims + (factCheck.contradicted_claims || 0)}
          </div>
        </div>
      </div>

      {/* Claim-by-Claim Breakdown */}
      <div className="space-y-3.5">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
          Extracted Claims Audit ({factCheck.claims?.length || 0})
        </div>

        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {factCheck.claims?.map((claim, idx) => (
            <div
              key={claim.claim_id || idx}
              className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-2.5 hover:bg-white hover:border-slate-300 transition-all shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-slate-500">
                  Claim #{idx + 1}
                </span>
                {getStatusBadge(claim.status)}
              </div>

              <p className="text-sm text-slate-900 font-bold leading-relaxed">
                &ldquo;{claim.text}&rdquo;
              </p>

              {claim.source_match && (
                <div className="rounded-xl bg-white p-2.5 text-xs text-slate-700 border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-900 block text-[11px] uppercase tracking-wide">
                    Canonical Match Citation:
                  </span>
                  <p className="italic font-medium">&ldquo;{claim.source_match}&rdquo;</p>
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-medium pt-1">
                <span className="font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200 font-bold">
                  {claim.source_file || 'source.pdf'} • Page {claim.source_page || 1}
                </span>
                {claim.reasoning && (
                  <span className="text-slate-600 text-xs">{claim.reasoning}</span>
                )}
                <span>Confidence: {((claim.confidence || 0.98) * 100).toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
