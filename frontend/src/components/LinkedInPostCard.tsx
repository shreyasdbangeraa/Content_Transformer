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
  Share2,
} from 'lucide-react'
import { Output } from '@/types'
import StructuredContentRenderer from '@/components/StructuredContentRenderer'

interface LinkedInPostCardProps {
  output: Output
}

export default function LinkedInPostCard({ output }: LinkedInPostCardProps) {
  const [copied, setCopied] = useState(false)
  const [likes, setLikes] = useState(42)
  const [hasLiked, setHasLiked] = useState(false)
  const [selectedReaction, setSelectedReaction] = useState<'like' | 'insightful' | 'celebrate' | null>(null)
  const [showFullImageModal, setShowFullImageModal] = useState(false)

  const structured = output.structured_data || {}
  const imageUri = structured.image_url || structured.image_uri
  const modelName = structured.model || 'Hugging Face (Llama-3.3-70B / Mistral)'

  const handleCopy = () => {
    const cleaned = (output.raw_content || '')
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((l) => l.trim())
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
    navigator.clipboard.writeText(cleaned)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleReaction = (type: 'like' | 'insightful' | 'celebrate') => {
    if (selectedReaction === type) {
      setSelectedReaction(null)
      setLikes((prev) => prev - 1)
      setHasLiked(false)
    } else {
      if (!selectedReaction) setLikes((prev) => prev + 1)
      setSelectedReaction(type)
      setHasLiked(true)
    }
  }

  const handleDownloadImage = () => {
    if (!imageUri) return
    const a = document.createElement('a')
    a.href = imageUri
    a.download = `linkedin-asset-${output.id.slice(0, 8)}.svg`
    a.click()
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Model Engine Tag */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          <span>Engine: <strong className="text-indigo-700 font-mono">Hugging Face Model ({modelName})</strong></span>
        </div>
        <span className="text-xs font-mono text-slate-400 font-semibold">
          Format: LinkedIn Thought Leadership
        </span>
      </div>

      {/* LinkedIn Post Feed Card */}
      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-md">
        {/* Author Header */}
        <div className="p-5 sm:p-6 flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/40">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-sky-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-extrabold text-base shadow-sm ring-4 ring-sky-100 shrink-0">
              IN
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm sm:text-base font-extrabold text-slate-900">
                  Enterprise Strategic Intelligence
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500 hidden sm:inline" />
                <span className="text-xs text-slate-400 font-medium">1st</span>
              </div>
              <p className="text-xs text-slate-500 font-medium line-clamp-1">
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
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl transition-colors shadow-2xs"
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
        <div className="p-6 sm:p-8 space-y-4">
          <StructuredContentRenderer content={output.raw_content} />
        </div>

        {/* Optional Media Preview if attached */}
        {imageUri && (
          <div className="relative group bg-slate-950 border-t border-b border-slate-200 overflow-hidden">
            <div className="flex items-center justify-center p-4 sm:p-6 bg-slate-950">
              <img
                src={imageUri}
                alt="LinkedIn Visual Attachment"
                className="w-full max-w-[560px] h-auto object-contain rounded-xl shadow-lg transition-transform duration-300 group-hover:scale-[1.005] cursor-pointer"
                onClick={() => setShowFullImageModal(true)}
              />
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-95 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => setShowFullImageModal(true)}
                className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md transition-all"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Full Size</span>
              </button>
            </div>
          </div>
        )}

        {/* Reactions Counter Bar */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-500 text-white text-[10px] shadow-2xs">
                👍
              </span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] shadow-2xs">
                💡
              </span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] shadow-2xs">
                👏
              </span>
            </div>
            <span className="font-semibold text-slate-700">{likes}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 text-xs font-medium">
            <span>12 comments</span>
            <span>•</span>
            <span>6 reposts</span>
          </div>
        </div>

        {/* Interactive Action Bar */}
        <div className="px-4 py-2 border-t border-slate-200 bg-white grid grid-cols-4 gap-1 text-xs sm:text-sm font-bold text-slate-600">
          <button
            onClick={() => handleReaction('like')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-colors ${
              hasLiked ? 'text-sky-600 bg-sky-50' : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <ThumbsUp className={`h-4 w-4 ${hasLiked ? 'fill-sky-600' : ''}`} />
            <span>Like</span>
          </button>

          <button
            onClick={() => handleReaction('insightful')}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Comment</span>
          </button>

          <button
            onClick={() => handleReaction('celebrate')}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Repeat2 className="h-4 w-4" />
            <span>Repost</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Send className="h-4 w-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Modal for Full Size Visual Attachment Preview */}
      {showFullImageModal && imageUri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative max-w-4xl w-full bg-slate-950 rounded-3xl p-4 shadow-2xl border border-slate-800">
            <button
              onClick={() => setShowFullImageModal(false)}
              className="absolute top-4 right-4 z-10 rounded-full bg-slate-800/90 text-white p-2 hover:bg-slate-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center justify-center p-4">
              <img
                src={imageUri}
                alt="Full Size Visual Asset"
                className="max-h-[80vh] w-auto object-contain rounded-2xl"
              />
            </div>
            <div className="flex items-center justify-between pt-3 px-4 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-400 font-mono">
                Asset Resolution: 1200x1200 High-Res SVG
              </span>
              <button
                onClick={handleDownloadImage}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-xs"
              >
                <Download className="h-4 w-4" />
                <span>Download SVG</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
