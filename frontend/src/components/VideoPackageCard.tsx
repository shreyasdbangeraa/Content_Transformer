'use client'

import React, { useState } from 'react'
import {
  Video,
  Play,
  Clock,
  Type,
  FileText,
  Volume2,
  Film,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react'
import clsx from 'clsx'

interface VideoScene {
  scene_number: number
  duration_seconds: number
  visual_description: string
  on_screen_text: string
  narration: string
  subtitle: string
}

interface VideoPackageCardProps {
  structuredData: {
    title?: string
    target_duration_seconds?: number
    aspect_ratio?: string
    scenes?: VideoScene[]
  }
  rawContent: string
}

export default function VideoPackageCard({ structuredData, rawContent }: VideoPackageCardProps) {
  const [activeSceneIdx, setActiveSceneIdx] = useState<number>(0)
  const [copied, setCopied] = useState(false)

  const scenes = structuredData.scenes || [
    {
      scene_number: 1,
      duration_seconds: 10,
      visual_description: 'Dynamic cinematic title banner displaying key event.',
      on_screen_text: 'STRATEGIC BRIEFING',
      narration: 'In this briefing, we present verified intelligence on key operational events.',
      subtitle: 'Verified intelligence briefing.',
    },
  ]

  const totalDuration = scenes.reduce((acc, s) => acc + (s.duration_seconds || 10), 0)
  const currentScene = scenes[activeSceneIdx] || scenes[0]

  const handleCopyScript = () => {
    navigator.clipboard.writeText(rawContent)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Video Package Header Banner */}
      <div className="rounded-3xl border border-slate-200 bg-slate-900 text-white p-6 sm:p-8 shadow-sm overflow-hidden relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="rounded-md bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <Film className="h-3.5 w-3.5" />
                VIDEO STORYBOARD & NARRATION PACKAGE
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Aspect: <strong className="text-white">{structuredData.aspect_ratio || '16:9'}</strong>
              </span>
            </div>
            <h3 className="text-2xl font-black tracking-tight text-white">
              {structuredData.title || 'Executive Explainer Video Storyboard'}
            </h3>
            <div className="flex items-center gap-4 text-xs sm:text-sm text-slate-300 font-medium pt-1">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-indigo-400" />
                Target Duration: <strong className="text-white">{totalDuration} seconds</strong>
              </span>
              <span>•</span>
              <span>
                Scenes: <strong className="text-white">{scenes.length} scripted beats</strong>
              </span>
            </div>
          </div>

          <button
            onClick={handleCopyScript}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 text-xs sm:text-sm font-bold transition-all shadow-xs self-start sm:self-center"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Script Copied' : 'Copy Full Script'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Storyboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Scene Timeline Navigator */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Scene Progression ({scenes.length} Scenes)
          </div>
          <div className="space-y-2.5">
            {scenes.map((scene, idx) => {
              const isActive = activeSceneIdx === idx
              return (
                <button
                  key={idx}
                  onClick={() => setActiveSceneIdx(idx)}
                  className={clsx(
                    'w-full text-left p-4 rounded-2xl border transition-all text-sm flex items-start gap-3.5',
                    isActive
                      ? 'border-indigo-600 bg-indigo-50/80 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50/80 hover:border-slate-300'
                  )}
                >
                  <div
                    className={clsx(
                      'rounded-xl p-2 font-black text-xs shrink-0 flex items-center justify-center h-8 w-8',
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    )}
                  >
                    #{scene.scene_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900 truncate">
                        {scene.on_screen_text || `Scene ${scene.scene_number}`}
                      </span>
                      <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md shrink-0">
                        {scene.duration_seconds}s
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-1">
                      {scene.narration}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Right: Active Scene Visual Stage */}
        <div className="lg:col-span-8 space-y-5">
          {/* Mock Video Player Canvas */}
          <div className="rounded-3xl border border-slate-900 bg-slate-950 p-6 sm:p-8 text-white relative overflow-hidden min-h-[22rem] flex flex-col justify-between shadow-md">
            {/* Top HUD */}
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3">
              <span className="flex items-center gap-2 font-mono">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                SCENE {currentScene.scene_number} OF {scenes.length}
              </span>
              <span className="font-mono bg-slate-800 text-indigo-300 px-2.5 py-1 rounded-md font-bold">
                ⏱ {currentScene.duration_seconds} SECONDS
              </span>
            </div>

            {/* Middle Stage: Visual Description & Lower Third */}
            <div className="my-6 space-y-4">
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Play className="h-3.5 w-3.5" />
                  Visual Scene Description & Camera Cue:
                </div>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                  {currentScene.visual_description}
                </p>
              </div>

              {currentScene.on_screen_text && (
                <div className="inline-block rounded-xl bg-indigo-600/90 border border-indigo-400/40 px-4 py-2 text-xs sm:text-sm font-black tracking-wider text-white uppercase shadow-sm">
                  ON-SCREEN GRAPHIC: {currentScene.on_screen_text}
                </div>
              )}
            </div>

            {/* Bottom: Voiceover Audio Script & Subtitle */}
            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <div className="rounded-2xl bg-indigo-950/60 border border-indigo-800/50 p-4 space-y-1.5">
                <div className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5 text-indigo-400" />
                  Narration Audio Voiceover:
                </div>
                <p className="text-sm sm:text-base text-white font-semibold italic">
                  &ldquo;{currentScene.narration}&rdquo;
                </p>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2 px-1">
                <Type className="h-3.5 w-3.5 text-slate-500" />
                <span>Subtitle Track: &ldquo;{currentScene.subtitle}&rdquo;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
