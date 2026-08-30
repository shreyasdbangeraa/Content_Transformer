import {
  Project,
  Source,
  CanonicalAnalysis,
  Transformation,
  Output,
  DashboardStats,
  PublishingJob,
  OutputVersion,
  BrandProfile,
  ResearchJob,
  ConflictRecord,
} from '@/types'

const rawBase = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api'
const API_BASE = rawBase.endsWith('/api')
  ? rawBase
  : `${rawBase.replace(/\/+$/, '')}/api`

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let errorDetail = 'API request failed'
    try {
      const errJson = await response.json()
      errorDetail = errJson.detail || errJson.message || errorDetail
    } catch {
      errorDetail = await response.text()
    }
    throw new Error(errorDetail)
  }

  return response.json()
}

function getSavedProvider(): string {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('contex_ai_settings')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.aiProvider) return parsed.aiProvider
      }
    } catch {}
  }
  return ''
}

export const api = {
  // Stats & Health
  getStats: () => request<DashboardStats>('/settings/stats'),
  getStatus: () => request<Record<string, any>>('/settings/status'),
  generateFluxImage: (prompt: string) =>
    request<{ prompt: string; image_uri: string }>('/settings/flux-image', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),

  // Projects
  listProjects: () => request<Project[]>('/projects'),
  getProject: (id: string) => request<Project>(`/projects/${id}`),
  createProject: (data: {
    title: string
    description?: string
    domain?: string
    organization_name?: string
    research_mode?: string
    brand_profile_id?: string
  }) =>
    request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  deleteProject: (id: string) =>
    request<{ message: string }>(`/projects/${id}`, { method: 'DELETE' }),
  loadNovaTechDemo: () =>
    request<{ message: string; project_id: string; outputs_count: number; formats_generated: string[] }>(
      '/projects/demo/novatech',
      { method: 'POST' }
    ),

  // Brand Profiles
  listBrandProfiles: () => request<BrandProfile[]>('/brand-profiles'),
  getBrandProfile: (id: string) => request<BrandProfile>(`/brand-profiles/${id}`),
  createBrandProfile: (data: Partial<BrandProfile>) =>
    request<BrandProfile>('/brand-profiles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBrandProfile: (id: string, data: Partial<BrandProfile>) =>
    request<BrandProfile>(`/brand-profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBrandProfile: (id: string) =>
    request<{ message: string }>(`/brand-profiles/${id}`, { method: 'DELETE' }),

  // Research Engine & Conflicts
  getResearchJob: (jobId: string) => request<ResearchJob>(`/research/jobs/${jobId}`),
  listProjectResearchJobs: (projectId: string) =>
    request<ResearchJob[]>(`/research/project/${projectId}`),
  listProjectConflicts: (projectId: string) =>
    request<ConflictRecord[]>(`/research/conflicts/${projectId}`),
  resolveConflict: (conflictId: string, notes?: string) =>
    request<{ message: string; conflict: ConflictRecord }>(
      `/research/conflicts/${conflictId}/resolve?resolution_notes=${encodeURIComponent(notes || 'Resolved by operator')}`,
      { method: 'POST' }
    ),

  // Sources
  uploadSourceFile: async (projectId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await fetch(`${API_BASE}/sources/projects/${projectId}/upload`, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) {
      throw new Error(await response.text())
    }
    return response.json()
  },
  pasteSourceText: (projectId: string, title: string, text: string) =>
    request<Source>(`/sources/projects/${projectId}/text`, {
      method: 'POST',
      body: JSON.stringify({ title, text }),
    }),
  ingestUrl: (projectId: string, url: string) =>
    request<Source>(`/sources/projects/${projectId}/url`, {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),
  scrapeUrl: (projectId: string, url: string) =>
    request<Source>(`/sources/projects/${projectId}/url`, {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),
  analyzeSource: (sourceId: string, provider?: string) => {
    const activeProvider = provider || getSavedProvider()
    const query = activeProvider ? `?provider=${encodeURIComponent(activeProvider)}` : ''
    return request<CanonicalAnalysis>(`/sources/${sourceId}/analyze${query}`, {
      method: 'POST',
    })
  },

  // Transformations
  createTransformation: (
    projectId: string,
    data: {
      canonical_id: string
      target_audience: string
      tone: string
      language: string
      detail_level: string
      communication_objective: string
      content_style: string
      research_mode?: string
      brand_profile_id?: string
      custom_instructions?: string
      requested_formats: string[]
    },
    provider?: string
  ) => {
    const activeProvider = provider || getSavedProvider()
    const query = activeProvider ? `?provider=${encodeURIComponent(activeProvider)}` : ''
    return request<{ transformation: Transformation; outputs_count: number; outputs: Output[] }>(
      `/transformations/projects/${projectId}/transform${query}`,
      {
        method: 'POST',
        body: JSON.stringify({ ...data, project_id: projectId }),
      }
    )
  },

  // Outputs & Verification
  getOutput: (outputId: string) => request<Output>(`/outputs/${outputId}`),
  conversationalEdit: (outputId: string, prompt: string, provider?: string) => {
    const activeProvider = provider || getSavedProvider()
    const query = activeProvider ? `?provider=${encodeURIComponent(activeProvider)}` : ''
    return request<Output>(`/outputs/${outputId}/conversational-edit${query}`, {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    })
  },
  directEdit: (outputId: string, content: string, changeReason?: string) =>
    request<Output>(`/outputs/${outputId}/direct-edit`, {
      method: 'POST',
      body: JSON.stringify({ content, change_reason: changeReason }),
    }),
  approveOutput: (outputId: string, notes?: string) =>
    request<Output>(`/outputs/${outputId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ action: 'APPROVE', notes }),
    }),
  rejectOutput: (outputId: string, notes?: string) =>
    request<Output>(`/outputs/${outputId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ action: 'REJECT', notes }),
    }),
  getVersions: (outputId: string) =>
    request<OutputVersion[]>(`/outputs/${outputId}/versions`),
  getExportUrl: (outputId: string, format: string) =>
    `${API_BASE}/outputs/${outputId}/export/${format}`,

  // Publishing & n8n
  publishToN8n: (
    outputId: string,
    platform: string = 'n8n',
    webhookUrl?: string,
    scheduledAt?: string
  ) =>
    request<PublishingJob>(`/publishing/outputs/${outputId}/publish`, {
      method: 'POST',
      body: JSON.stringify({
        platform,
        webhook_url: webhookUrl,
        scheduled_at: scheduledAt,
      }),
    }),
  listPublishingJobs: () => request<PublishingJob[]>('/publishing/jobs'),
  testN8nWebhook: (webhookUrl?: string) =>
    request<any>('/publishing/test-webhook', {
      method: 'POST',
      body: JSON.stringify({ webhook_url: webhookUrl }),
    }),

  // Knowledge Base & RAG
  listKnowledge: () => request<any[]>('/knowledge'),
  addKnowledge: (data: { title: string; content: string; doc_type?: string; tags?: string[] }) =>
    request<any>('/knowledge', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  uploadKnowledgeFile: async (file: File, title?: string, docType?: string, tags?: string) => {
    const formData = new FormData()
    formData.append('file', file)
    if (title) formData.append('title', title)
    if (docType) formData.append('doc_type', docType)
    if (tags) formData.append('tags', tags)

    const response = await fetch(`${API_BASE}/knowledge/upload`, {
      method: 'POST',
      body: formData,
    })
    if (!response.ok) {
      let errorDetail = 'File upload failed'
      try {
        const errJson = await response.json()
        errorDetail = errJson.detail || errorDetail
      } catch {
        errorDetail = await response.text()
      }
      throw new Error(errorDetail)
    }
    return response.json()
  },
  searchKnowledge: (query: string, topK: number = 5, minSimilarity: number = 0.20, docType?: string) =>
    request<{ query: string; total_matches: number; matches: any[] }>('/knowledge/search', {
      method: 'POST',
      body: JSON.stringify({ query, top_k: topK, min_similarity: minSimilarity, doc_type: docType }),
    }),
  seedKnowledge: () =>
    request<{ message: string; seeded_count: number }>('/knowledge/seed', {
      method: 'POST',
    }),
  getKnowledgeChunks: (docId: string) =>
    request<{ document_id: string; title: string; doc_type: string; total_chunks: number; chunks: any[] }>(
      `/knowledge/${docId}/chunks`
    ),
  deleteKnowledge: (id: string) =>
    request<{ message: string }>(`/knowledge/${id}`, { method: 'DELETE' }),

  // Blockchain Content Integrity & Version Verification
  verifyContent: (contentId: string, currentContent: string, versionTag?: string) =>
    request<any>('/blockchain/verify', {
      method: 'POST',
      body: JSON.stringify({
        content_id: contentId,
        current_content: currentContent,
        version_tag: versionTag,
      }),
    }),
  getBlockchainHistory: (contentId: string) =>
    request<any[]>(`/blockchain/content/${contentId}/history`),
  getLatestBlockchainRecord: (contentId: string) =>
    request<any>(`/blockchain/content/${contentId}/latest`),
  getBlockchainStats: () => request<any>('/blockchain/stats'),
  getBlockchainStatus: () => request<any>('/blockchain/status'),
  simulateTamper: (contentId: string, tamperedText?: string) =>
    request<any>('/blockchain/demo/tamper', {
      method: 'POST',
      body: JSON.stringify({
        content_id: contentId,
        tampered_text: tamperedText,
      }),
    }),
  restoreOriginal: (contentId: string, versionTag?: string) =>
    request<any>('/blockchain/demo/restore', {
      method: 'POST',
      body: JSON.stringify({
        content_id: contentId,
        version_tag: versionTag,
      }),
    }),

  // Local AI / Ollama & AI Provider Settings
  checkOllamaStatus: () =>
    request<{
      online: boolean
      base_url: string
      active_model: string
      has_llama3: boolean
      installed_models: string[]
      message: string
    }>('/settings/ollama-status'),
  setActiveAIProvider: (provider: 'gemini' | 'ollama' | 'openai' | 'mock') =>
    request<{ success: boolean; active_ai_provider: string; message: string }>('/settings/ai-provider', {
      method: 'POST',
      body: JSON.stringify({ provider }),
    }),
}
