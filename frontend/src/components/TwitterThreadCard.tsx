'use client'

import React, { useState } from 'react'
import {
  Twitter,
  Copy,
  Check,
  Share2,
  Sparkles,
  MessageCircle,
  Repeat,
  Heart,
  ExternalLink,
} from 'lucide-react'
import clsx from 'clsx'

interface TweetItem {
  index: number
  text: string
  char_count?: number
}

interface TwitterThreadCardProps {
  structuredData: {
    mode?: string
    tweet_count?: number
    tweets?: TweetItem[]
  }
  rawContent: string
}

export default function TwitterThreadCard({ structuredData, rawContent }: TwitterThreadCardProps) {
  const [copiedAll, setCopiedAll] = useState(false)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  // Parse tweets from structured data or raw markdown
  let tweets: TweetItem[] = structuredData.tweets || []
  if (!tweets || tweets.length === 0) {
    const rawChunks = rawContent.split(/---|\n\n\n/).filter((t) => t.trim().length > 0)
    tweets = rawChunks.map((chunk, idx) => ({
      index: idx + 1,
      text: chunk.trim(),
      char_count: chunk.trim().length,
    }))
  }

  const handleCopyAll = () => {
    navigator.clipboard.writeText(rawContent)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  const handleCopySingle = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Thread Header Banner */}
      <div className="rounded-3xl border border-sky-200 bg-gradient-to-r from-sky-50 via-indigo-50/50 to-white text-slate-900 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="rounded-md bg-sky-100 border border-sky-200 px-3 py-1 text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Twitter className="h-3.5 w-3.5 text-sky-600" />
                X / TWITTER OPTIMIZED THREAD
              </span>
              <span className="text-xs text-slate-500 font-bold">
                {tweets.length} Posts in Thread
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Sequential High-Engagement Social Thread
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Calibrated for 280-character limit preservation and evidence-grounded hook virality.
            </p>
          </div>

          <button
            onClick={handleCopyAll}
            className="flex items-center gap-2 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white px-5 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-md shadow-sky-600/20 active:scale-95 self-start sm:self-center"
          >
            {copiedAll ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>{copiedAll ? 'Thread Copied' : 'Copy All Tweets'}</span>
          </button>
        </div>
      </div>

      {/* Tweets Thread Timeline */}
      <div className="space-y-4">
        {tweets.map((tweet, idx) => {
          const charCount = tweet.text.length
          const isOverLimit = charCount > 280
          const isCopied = copiedIdx === idx

          return (
            <div
              key={idx}
              className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-xs hover:border-sky-300 hover:shadow-md transition-all space-y-4 relative"
            >
              {/* Top metadata */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-800 border border-sky-200 font-black text-xs">
                    {idx + 1}/{tweets.length}
                  </div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {idx === 0 ? 'Opening Hook Tweet' : idx === tweets.length - 1 ? 'Closing Call-to-Action' : 'Core Evidence Point'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={clsx(
                      'text-xs font-mono font-bold px-2.5 py-1 rounded-md border',
                      isOverLimit
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    )}
                  >
                    {charCount} / 280 chars
                  </span>

                  <button
                    onClick={() => handleCopySingle(tweet.text, idx)}
                    className="p-2 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                    title="Copy Tweet"
                  >
                    {isCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Tweet Body */}
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                {tweet.text}
              </p>

              {/* Social Action Bar Mock */}
              <div className="flex items-center gap-6 pt-3 border-t border-slate-100 text-slate-400 text-xs font-medium">
                <span className="flex items-center gap-1.5 hover:text-sky-500 cursor-pointer">
                  <MessageCircle className="h-4 w-4" /> 24
                </span>
                <span className="flex items-center gap-1.5 hover:text-emerald-500 cursor-pointer">
                  <Repeat className="h-4 w-4" /> 18
                </span>
                <span className="flex items-center gap-1.5 hover:text-rose-500 cursor-pointer">
                  <Heart className="h-4 w-4" /> 142
                </span>
                <span className="flex items-center gap-1.5 hover:text-sky-500 cursor-pointer ml-auto">
                  <Share2 className="h-4 w-4" />
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
