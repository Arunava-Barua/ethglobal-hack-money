const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? ''

const defaultHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...init,
    headers: { ...defaultHeaders, ...init?.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail ?? body.message ?? `Request failed: ${res.status}`)
  }
  return res.json()
}

// ─── Project types (matching backend models) ────────────────────────────────

export interface BackendProject {
  project_id: string
  freelance_alias: string
  github_username: string
  employee_wallet_address: string | null
  employer_wallet_address: string | null
  repo_url: string
  repo_owner: string
  repo_name: string
  milestone_specification: Record<string, unknown>
  gmeet_link: string | null
  total_budget: number
  earned_pending: number
  total_paid: number
  payout_threshold: number
  evaluation_mode: string
  start_date: string
  end_date: string
  total_tenure_days: number
  installation_id: string
  stream_id: string | null
  smart_contract_hash: string | null
  treasury_address: string | null
  status: string
  created_at: string
  updated_at: string
}

export interface ProjectCreatePayload {
  freelance_alias: string
  github_username: string
  employee_wallet_address: string
  employer_wallet_address: string
  repo_url: string
  milestone_specification: Record<string, unknown>
  gmeet_link?: string
  total_budget: number
  payout_threshold?: number
  evaluation_mode: string
  start_date: string
  end_date: string
  total_tenure_days: number
  installation_id: string
  stream_id?: string
  smart_contract_hash?: string
  treasury_address?: string
}

export interface ProjectCreateResponse {
  success: boolean
  project_id: string
  message: string
  webhook_created: boolean
  webhook_id?: number
}

export interface UpdateWebhookPayload {
  project_id: string
  new_webhook_url: string
}

export interface UpdateWebhookResponse {
  success: boolean
  message: string
  webhook_id: number
  old_url: string
  new_url: string
  webhook_details: Record<string, unknown>
}

export interface CommitDetail {
  sha: string
  author: string
  message: string
  timestamp: string
  additions: number
  deletions: number
  changed_files: number
  diff: string
  files_changed: Record<string, unknown>[]
}

export interface PushEvent {
  push_id: string
  project_id: string
  repo: string
  ref: string
  pusher: string
  tracked_developer: string
  commit_shas: string[]
  commits_details: CommitDetail[]
  status: string
  created_at: string
}

export interface PushEventsResponse {
  success: boolean
  project_id: string
  total_events: number
  push_events: PushEvent[]
}

export interface CommitAnalysis {
  project_id: string
  push_id: string
  commits: string[]
  total_commits: number
  author: string
  total_payout_amount: number
  reasoning: string
  confidence: number
  flags: string[]
  commits_summary: string
  analysis_status: string
  created_at: string
  reviewed_at: string | null
  paid_at: string | null
}

export interface AnalysesResponse {
  success: boolean
  project_id: string
  total_analyses: number
  analyses: CommitAnalysis[]
}

// ─── API functions ───────────────────────────────────────────────────────────

export function createProject(payload: ProjectCreatePayload) {
  return request<ProjectCreateResponse>('/api/projects', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function listProjects(params?: {
  status?: string
  user_type?: string
  wallet_address?: string
}) {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.user_type) qs.set('user_type', params.user_type)
  if (params?.wallet_address) qs.set('wallet_address', params.wallet_address)
  const query = qs.toString()
  return request<BackendProject[]>(`/api/projects${query ? `?${query}` : ''}`)
}

export function getProject(projectId: string) {
  return request<BackendProject>(`/api/projects/${projectId}`)
}

export function updateWebhook(payload: UpdateWebhookPayload) {
  return request<UpdateWebhookResponse>('/api/webhook-manager/update', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getProjectAnalyses(projectId: string, limit = 50) {
  return request<AnalysesResponse>(
    `/api/projects/${projectId}/analyses?limit=${limit}`,
  )
}

export function getProjectPushEvents(projectId: string, limit = 50) {
  return request<PushEventsResponse>(
    `/api/projects/${projectId}/push-events?limit=${limit}`,
  )
}
