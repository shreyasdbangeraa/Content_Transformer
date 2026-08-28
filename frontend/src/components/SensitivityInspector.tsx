'use client'

import React, { useState } from 'react'
import { SensitivityReport, SensitiveDataItem } from '@/types'
import { ShieldAlert, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import clsx from 'clsx'

interface SensitivityInspectorProps {
  sensitivity?: SensitivityReport
  onApplyRedaction?: (items: SensitiveDataItem[]) => void
}

export default function SensitivityInspector({ sensitivity, onApplyRedaction }: SensitivityInspectorProps) {
  const [showMasked, setShowMasked] = useState(true)

  if (!sensitivity || sensitivity.detected_count === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 flex items-center gap-3 shadow-xs">
        <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
        <div className="text-xs">
          <span className="font-bold text-slate-800">Zero Sensitive Data Alerts</span>
          <p className="text-slate-500 mt-0.5 font-medium">
            No PII, internal IP addresses, or credentials detected. Content is safe for public distribution.
          </p>
        </div>
      </div>
    )
  }

  const isCritical = sensitivity.level === 'high' || sensitivity.level === 'critical'

  return (
    <div
      className={clsx(
        'rounded-2xl border p-4 sm:p-5 space-y-3.5 shadow-xs',
        isCritical
          ? 'border-amber-300 bg-amber-50/70'
          : 'border-slate-200 bg-white'
      )}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Sensitive Data & PII Redaction Warning
              <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 uppercase">
                {sensitivity.level}
              </span>
            </h4>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              {sensitivity.public_safety_advisory}
            </p>
          </div>
        </div>

        {/* Mask Toggle */}
        <button
          onClick={() => setShowMasked(!showMasked)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
        >
          {showMasked ? (
            <>
              <EyeOff className="h-3.5 w-3.5 text-slate-500" />
              <span>Show Raw Values</span>
            </>
          ) : (
            <>
              <Eye className="h-3.5 w-3.5 text-sky-600" />
              <span>Show Masked Values</span>
            </>
          )}
        </button>
      </div>

      {/* Detected items list */}
      <div className="space-y-2 pt-1">
        {sensitivity.items?.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                {item.type}
              </span>
              <span className="font-mono text-slate-900 font-bold">
                {showMasked ? item.masked_value : item.value}
              </span>
            </div>
            <span className="text-[11px] text-amber-800 font-semibold">
              💡 {item.recommendation}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
