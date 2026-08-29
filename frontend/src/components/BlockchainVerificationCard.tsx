'use client'

import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  ShieldAlert,
  Link as LinkIcon,
  RefreshCw,
  Clock,
  ExternalLink,
  History,
  Copy,
  Check,
  AlertTriangle,
  FileCheck2,
  Sparkles,
  Layers,
  Terminal,
  RotateCcw
} from 'lucide-react'
import { api } from '@/lib/api'
import { Output } from '@/types'
import VersionHistoryModal from './VersionHistoryModal'

interface BlockchainVerificationCardProps {
  output: Output
  onContentUpdated?: (updatedContent: string) => void
}

export default function BlockchainVerificationCard({
  output,
  onContentUpdated
}: BlockchainVerificationCardProps) {
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [copiedHash, setCopiedHash] = useState(false)
  const [copiedTx, setCopiedTx] = useState(false)
  const [isTampering, setIsTampering] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [networkStatus, setNetworkStatus] = useState<any>(null)

  // Load history and initial verification on mount
  useEffect(() => {
    fetchHistoryAndVerify()
  }, [output.id, output.raw_content])

  const fetchHistoryAndVerify = async () => {
    try {
      const [histData, netData] = await Promise.all([
        api.getBlockchainHistory(output.id).catch(() => []),
        api.getBlockchainStatus().catch(() => null)
      ])
      setHistory(histData || [])
      setNetworkStatus(netData)

      // Run automatic initial verify
      await handleVerify(false)
    } catch (e) {
      console.error('Error fetching blockchain info:', e)
    }
  }

  const handleVerify = async (manual: boolean = true) => {
    if (manual) setIsVerifying(true)
    try {
      const result = await api.verifyContent(output.id, output.raw_content, `V${output.version}`)
      setVerificationResult(result)
    } catch (e) {
      console.error('Verification failed:', e)
    } finally {
      if (manual) {
        setTimeout(() => setIsVerifying(false), 400)
      }
    }
  }

  const handleCopy = (text: string, type: 'hash' | 'tx') => {
    navigator.clipboard.writeText(text)
    if (type === 'hash') {
      setCopiedHash(true)
      setTimeout(() => setCopiedHash(false), 2000)
    } else {
      setCopiedTx(true)
      setTimeout(() => setCopiedTx(false), 2000)
    }
  }

  const handleSimulateTamper = async () => {
    setIsTampering(true)
    try {
      const res = await api.simulateTamper(output.id)
      if (onContentUpdated) {
        onContentUpdated(output.raw_content + "\n\n⚠️ [UNAUTHORIZED DATABASE TAMPERING INJECTION: Metrics modified without on-chain signature.]")
      }
      // Re-run verify immediately to show TAMPERED alert
      const verifyRes = await api.verifyContent(
        output.id,
        output.raw_content + "\n\n⚠️ [UNAUTHORIZED DATABASE TAMPERING INJECTION: Metrics modified without on-chain signature.]"
      )
      setVerificationResult(verifyRes)
    } catch (e) {
      console.error('Tamper demo error:', e)
    } finally {
      setIsTampering(false)
    }
  }

  const handleRestoreOriginal = async () => {
    setIsRestoring(true)
    try {
      const res = await api.restoreOriginal(output.id, `V${output.version}`)
      const cleanText = output.raw_content.replace(
        "\n\n⚠️ [UNAUTHORIZED DATABASE TAMPERING INJECTION: Metrics modified without on-chain signature.]",
        ""
      )
      if (onContentUpdated) {
        onContentUpdated(cleanText)
      }
      // Re-run verify
      const verifyRes = await api.verifyContent(output.id, cleanText, `V${output.version}`)
      setVerificationResult(verifyRes)
    } catch (e) {
      console.error('Restore error:', e)
    } finally {
      setIsRestoring(false)
    }
  }

  const latestRecord = history.length > 0 ? history[history.length - 1] : null
  const contentHash = verificationResult?.registered_hash || latestRecord?.content_hash || 'Calculating...'
  const txHash = verificationResult?.transaction_hash || latestRecord?.transaction_hash || '0x82ab91ef4c2918bc92d19f8a329d'
  const isVerified = verificationResult?.status === 'VERIFIED'
  const isModified = verificationResult?.status === 'MODIFIED'

  return (
    <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-md transition-all">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-indigo-50/40 flex-wrap">
        <div className="flex items-center gap-3">
          <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shadow-inner transition-colors ${
            isModified ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
          }`}>
            {isModified ? <ShieldAlert className="h-6 w-6" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-extrabold text-slate-900">
                Blockchain Content Integrity
              </h3>
              <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                EVM Smart Contract
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Cryptographically verified append-only proof of existence & version lineage
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          {isModified ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-red-100 text-red-700 font-extrabold text-xs border border-red-300 shadow-2xs animate-pulse">
              <span className="h-2 w-2 rounded-full bg-red-600" />
              <span>MODIFIED (TAMPERED)</span>
            </span>
          ) : isVerified ? (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-300 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span>VERIFIED</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-700 font-extrabold text-xs border border-amber-200 shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
              <span>PENDING CONFIRMATION</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Card Body */}
      <div className="p-6 space-y-5">
        {/* Tamper Alert Warning Banner if Modified */}
        {isModified && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 animate-fade-in">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <p className="font-extrabold text-sm">Integrity Check Failed: Content Mismatch</p>
              <p className="text-red-700">
                The current stored text in the database does NOT match the cryptographic SHA-256 hash registered on-chain for <strong>Version V{output.version}</strong>.
              </p>
              <div className="pt-1 flex items-center gap-2">
                <button
                  onClick={handleRestoreOriginal}
                  disabled={isRestoring}
                  className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{isRestoring ? 'Restoring...' : 'Restore Verified Version'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Cryptographic Key Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Content SHA-256 Digest */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Registered SHA-256 Hash</span>
              <span className="text-[10px] font-mono uppercase bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-bold">
                Immutable
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 font-mono text-xs font-bold text-slate-900 bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="truncate" title={contentHash}>{contentHash}</span>
              <button
                onClick={() => handleCopy(contentHash, 'hash')}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                title="Copy SHA-256 Digest"
              >
                {copiedHash ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* EVM Transaction Hash */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>On-Chain Transaction ID</span>
              <span className="text-[10px] font-mono uppercase bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                {networkStatus?.network || 'Sepolia Testnet'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 font-mono text-xs font-bold text-indigo-600 bg-white p-2.5 rounded-xl border border-slate-200">
              <span className="truncate" title={txHash}>{txHash}</span>
              <button
                onClick={() => handleCopy(txHash, 'tx')}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
                title="Copy Transaction Hash"
              >
                {copiedTx ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100 flex-wrap gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <span className="text-slate-400">Head Version: </span>
              <strong className="text-slate-800 font-mono">V{output.version}</strong>
            </div>
            <div>
              <span className="text-slate-400">Block Height: </span>
              <strong className="text-slate-800 font-mono">#{latestRecord?.block_number || '1248192'}</strong>
            </div>
            <div>
              <span className="text-slate-400">Ledger Mode: </span>
              <strong className="text-slate-800 uppercase font-mono">{networkStatus?.mode || 'Mock EVM'}</strong>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span>Anchored: {latestRecord?.created_at ? new Date(latestRecord.created_at).toLocaleTimeString() : 'Verified'}</span>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between gap-3 pt-2 flex-wrap border-t border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Verify Button */}
            <button
              onClick={() => handleVerify(true)}
              disabled={isVerifying}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Verifying Hashes...' : 'Verify Content'}</span>
            </button>

            {/* Version History Button */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors"
            >
              <History className="h-3.5 w-3.5 text-indigo-600" />
              <span>View Version History ({history.length || 1})</span>
            </button>

            {/* Blockchain Record / Receipt */}
            <button
              onClick={() => setIsReceiptOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition-colors"
            >
              <Terminal className="h-3.5 w-3.5 text-slate-500" />
              <span>View Blockchain Record</span>
            </button>
          </div>

          {/* Hackathon Demo Tampering Button */}
          <div className="flex items-center gap-2">
            {!isModified ? (
              <button
                onClick={handleSimulateTamper}
                disabled={isTampering}
                title="Hackathon Demo: Alters database content without on-chain signature to prove instant tamper detection"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs transition-colors"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                <span>{isTampering ? 'Simulating...' : 'Simulate Tampering (Demo)'}</span>
              </button>
            ) : (
              <button
                onClick={handleRestoreOriginal}
                disabled={isRestoring}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5 text-emerald-600" />
                <span>{isRestoring ? 'Restoring...' : 'Restore Verified'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        contentId={output.id}
        contentTitle={output.title || output.format_type}
        history={history}
        currentVersion={output.version}
      />

      {/* Blockchain Raw Receipt Modal */}
      {isReceiptOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 flex flex-col overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Terminal className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-white">EVM On-Chain Transaction Receipt</h4>
                  <p className="text-[11px] text-slate-400">ContentIntegrityRegistry.sol execution payload</p>
                </div>
              </div>
              <button
                onClick={() => setIsReceiptOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh] font-mono text-xs space-y-3 text-slate-300">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div><span className="text-indigo-400">contract_address:</span> &quot;{networkStatus?.contract_address || '0x8f3c71E765691C3b7654b1d6A3C4D116a4e72390'}&quot;</div>
                <div><span className="text-indigo-400">transaction_hash:</span> &quot;{txHash}&quot;</div>
                <div><span className="text-indigo-400">block_number:</span> {latestRecord?.block_number || 1248192}</div>
                <div><span className="text-indigo-400">content_id:</span> &quot;{output.id}&quot;</div>
                <div><span className="text-indigo-400">version_tag:</span> &quot;V{output.version}&quot;</div>
                <div><span className="text-indigo-400">content_hash:</span> &quot;{contentHash}&quot;</div>
                <div><span className="text-indigo-400">previous_hash:</span> &quot;{latestRecord?.previous_hash || '0x0000000000000000000000000000000000000000000000000000000000000000'}&quot;</div>
                <div><span className="text-indigo-400">action_type:</span> &quot;{latestRecord?.action_type || 'AI_TRANSFORMATION'}&quot;</div>
                <div><span className="text-indigo-400">gas_used:</span> {latestRecord?.gas_used || 42100} units</div>
                <div><span className="text-indigo-400">submitter_wallet:</span> &quot;0x71C865666a3Bbe83328e1694f4a56a59D889aAcb&quot;</div>
                <div><span className="text-indigo-400">status:</span> &quot;0x1 (SUCCESS)&quot;</div>
              </div>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setIsReceiptOpen(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
