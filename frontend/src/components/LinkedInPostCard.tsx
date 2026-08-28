'use client'

import React, { useState } from 'react'
import {
  ThumbsUp,
  MessageSquare,
  Repeat2,
  Send,
  Globe,
  Sparkles,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Maximize2,
  X,
  Layers,
  Heart,
  Lightbulb,
} from 'lucide-react'
import { Output } from '@/types'
import StructuredContentRenderer from '@/components/StructuredContentRenderer'

interface LinkedInPostCardProps {
  output: Output
}

export default function LinkedInPostCard({ output }: LinkedInPostCardProps) {
  const [copied, setCopied] = useState(false)
  const [likes, setLikes] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [selectedReaction, setSelectedReaction] = useState<'like' | 'insightful' | 'celebrate' | null>(null)
  const [showFullImageModal, setShowFullImageModal] = useState(false)

  const structured = output.structured_data || {}
  const imageUri = structured.image_url || structured.image_uri

  const handleCopy = () => {
    navigator.clipboard.writeText(output.raw_content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReaction = (type: 'like' | 'insightful' | 'celebrate') => {
    if (selectedReaction === type) {
      setSelectedReaction(null)
      setLikes(likes - 1)
      setHasLiked(false)
    } else {
      if (!selectedReaction) setLikes(likes + 1)
      setSelectedReaction(type)
      setHasLiked(true)
    }
  }

  const handleDownloadImage = () => {
    if (!imageUri) return
    const a = document.createElement('a')
    a.href = imageUri
    a.download = `linkedin-infographic-${output.id.slice(0, 8)}.svg`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* LinkedIn Post Feed Card */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-xs">
        {/* Author Header */}
        <div className="p-5 sm:p-6 flex items-start justify-between gap-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-sky-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-extrabold text-base shadow-sm ring-4 ring-sky-100">
              AI
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  Enterprise Strategic Intelligence
                </span>
                <span className="h-2 w-2 rounded-full bg-sky-500" />
                <span className="text-xs text-slate-400 font-medium">1st</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium line-clamp-1">
                Verified Multi-Artefact Intelligence • 100% Grounded in Source Data
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-0.5 font-medium">
                <span>Just now</span>
                <span>•</span>
                <Globe className="h-3.5 w-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied Post</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Post Body Copy */}
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <StructuredContentRenderer content={output.raw_content} />
        </div>

        {/* HIGH-RESOLUTION LINKEDIN INFOGRAPHIC IMAGE */}
        {imageUri && (
          <div className="relative group bg-slate-950 border-b border-slate-200 overflow-hidden">
            {/* Visual Graphic Banner */}
            <div className="flex items-center justify-center p-4 sm:p-6 bg-slate-950">
              <img
                src={imageUri}
                alt="Generated LinkedIn Visual Infographic"
                className="w-full max-w-[640px] h-auto object-contain rounded-2xl shadow-2xl transition-transform duration-300 group-hover:scale-[1.005] cursor-pointer"
                onClick={() => setShowFullImageModal(true)}
              />
            </div>

            {/* Quick Action Floating Overlay */}
            <div className="absolute top-5 right-5 flex items-center gap-2.5 opacity-95 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowFullImageModal(true)}
                className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-900 backdrop-blur-md border border-slate-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md transition-all active:scale-95"
              >
                <Maximize2 className="h-4 w-4" />
                <span>Full Size</span>
              </button>
              <button
                onClick={handleDownloadImage}
                title="Download 1200x1200 Infographic Image"
                className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-all active:scale-95"
              >
                <Download className="h-4 w-4" />
                <span>Download Asset</span>
              </button>
            </div>

            {/* Bottom Caption Pill */}
            <div className="absolute bottom-5 left-5">
              <div className="inline-flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-700 text-slate-300 text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-sky-400" />
                <span>Source-Grounded 1200x1200 Infographic</span>
              </div>
            </div>
          </div>
        )}

        {/* Reactions Counter Bar */}
        <div className="px-6 py-3 flex items-center justify-between text-xs sm:text-sm text-slate-500 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-600 text-white text-[10px]">
              👍
            </span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px]">
              💡
            </span>
            <span className="font-bold text-slate-700 ml-1">
              {likes > 0 ? `${likes} reaction${likes > 1 ? 's' : ''}` : 'Be the first to react'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <span className="text-xs text-sky-700 font-bold bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200">
              Live Preview
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-2.5 grid grid-cols-4 gap-2 text-slate-700 font-bold text-sm">
          <button
            onClick={() => handleReaction('like')}
            className={`flex items-center justify-center gap-2.5 py-2.5 rounded-xl transition-colors ${
              selectedReaction === 'like' ? 'text-sky-700 bg-sky-50' : 'hover:bg-slate-100'
            }`}
          >
            <ThumbsUp className={`h-4 w-4 ${selectedReaction === 'like' ? 'fill-sky-700' : ''}`} />
            <span>Like</span>
          </button>
          <button
            onClick={() => handleReaction('insightful')}
            className={`flex items-center justify-center gap-2.5 py-2.5 rounded-xl transition-colors ${
              selectedReaction === 'insightful' ? 'text-amber-700 bg-amber-50' : 'hover:bg-slate-100'
            }`}
          >
            <Lightbulb className={`h-4 w-4 ${selectedReaction === 'insightful' ? 'fill-amber-500' : ''}`} />
            <span>Insightful</span>
          </button>
          <button className="flex items-center justify-center gap-2.5 py-2.5 rounded-xl hover:bg-slate-100 transition-colors">
            <Repeat2 className="h-4 w-4" />
            <span>Repost</span>
          </button>
          <button className="flex items-center justify-center gap-2.5 py-2.5 rounded-xl hover:bg-slate-100 transition-colors">
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </div>
      </div>

      {/* FULLSIZE IMAGE MODAL */}
      {showFullImageModal && imageUri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <Layers className="h-5 w-5 text-sky-400" />
                <span className="text-sm font-bold text-white">
                  High-Definition 1200x1200 Infographic Asset
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownloadImage}
                  className="flex items-center gap-2 rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-500 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Download SVG</span>
                </button>
                <button
                  onClick={() => setShowFullImageModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center overflow-auto max-h-[75vh]">
              <img
                src={imageUri}
                alt="Fullsize Infographic"
                className="w-full max-w-[720px] h-auto object-contain rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
