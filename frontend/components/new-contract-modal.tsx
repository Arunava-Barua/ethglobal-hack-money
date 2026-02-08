'use client'

import { useState } from 'react'
import {
  Upload,
  Github,
  Video,
  Wallet,
  Zap,
  Hand,
  CalendarDays,
  Clock,
  Loader2,
  CheckCircle,
  User,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { encodeFunctionData, type Address } from 'viem'
import { useWallet } from '@/components/wallet-provider'
import { STREAMING_TREASURY_ABI } from '@/contract/contractDetails'
import {
  convertRateToPerSecond,
  queryNextStreamId,
} from '@/lib/streaming'
import { useGitHub } from '@/components/github-provider'
import { createProject } from '@/lib/api'

interface NewContractModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  treasuryAddress: string | null
  contractorAddress: string | null
  onContractCreated?: () => void
}

export function NewContractModal({
  open,
  onOpenChange,
  treasuryAddress,
  contractorAddress,
  onContractCreated,
}: NewContractModalProps) {
  const { walletId, userToken, executeChallenge } = useWallet()
  const { installationId } = useGitHub()

  const [freelancerAlias, setFreelancerAlias] = useState('')
  const [githubUsername, setGithubUsername] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [githubRepo, setGithubRepo] = useState('')
  const [googleMeetLink, setGoogleMeetLink] = useState('')
  const [totalBudget, setTotalBudget] = useState('')
  const [streamingRate, setStreamingRate] = useState('')
  const [streamingUnit, setStreamingUnit] = useState('d')
  const [evaluationMode, setEvaluationMode] = useState<'agentic' | 'manual'>('agentic')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // File state
  const [fileName, setFileName] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [taskSpecification, setTaskSpecification] = useState<Record<string, unknown> | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsParsing(true)
    setPdfError(null)
    setTaskSpecification(null)

    try {
      const text = await file.text()
      const parsed = parseMarkdown(text)
      setTaskSpecification(parsed)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to parse file'
      setPdfError(msg)
      console.error('Markdown parse error:', err)
    } finally {
      setIsParsing(false)
    }
  }

  function parseMarkdown(text: string): Record<string, unknown> {
    const lines = text.split('\n')

    let projectTitle = ''
    const descriptionLines: string[] = []
    const milestones: { title: string; tasks: string[] }[] = []
    let currentMilestone: { title: string; tasks: string[] } | null = null
    let foundFirstH2 = false

    for (const line of lines) {
      const trimmed = line.trim()

      // H1: project title
      if (/^# /.test(trimmed) && !projectTitle) {
        projectTitle = trimmed.replace(/^#\s+/, '')
        continue
      }

      // H2: milestone heading
      if (/^## /.test(trimmed)) {
        foundFirstH2 = true
        if (currentMilestone) milestones.push(currentMilestone)
        const title = trimmed.replace(/^##\s+/, '').replace(/^Milestone\s*\d+\s*[:–—-]\s*/i, '')
        currentMilestone = { title, tasks: [] }
        continue
      }

      // Lines between H1 and first H2 are description
      if (projectTitle && !foundFirstH2 && trimmed) {
        descriptionLines.push(trimmed)
        continue
      }

      // Bullet points under a milestone are tasks
      if (currentMilestone && /^[-*]\s/.test(trimmed)) {
        currentMilestone.tasks.push(trimmed.replace(/^[-*]\s+/, ''))
      }
    }

    if (currentMilestone) milestones.push(currentMilestone)

    return {
      projectTitle,
      description: descriptionLines.join(' '),
      milestones,
    }
  }

  const handleSubmit = async () => {
    // Validation
    if (!treasuryAddress) {
      setSubmitError('No treasury found. Please create a treasury first.')
      return
    }
    if (!walletId || !userToken) {
      setSubmitError('Wallet not connected or session expired.')
      return
    }
    if (!walletAddress) {
      setSubmitError('Please enter the freelancer wallet address.')
      return
    }
    const rate = parseFloat(streamingRate)
    if (!rate || rate <= 0) {
      setSubmitError('Please enter a valid streaming rate.')
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitStatus('Converting rate and preparing transaction...')

    try {
      // 1. Convert rate to per-second in wei
      const ratePerSecond = convertRateToPerSecond(rate, streamingUnit)
      console.log('[Stream] ratePerSecond (wei):', ratePerSecond.toString())

      // 2. Get current nextStreamId so we know what our streamId will be
      setSubmitStatus('Reading current stream counter...')
      const currentNextId = await queryNextStreamId(treasuryAddress)
      console.log('[Stream] currentNextStreamId:', currentNextId)

      // 3. Call contractExecution for createStream
      setSubmitStatus('Creating stream transaction...')
      // Encode callData ourselves using viem so Circle just submits raw data
      const callData = encodeFunctionData({
        abi: STREAMING_TREASURY_ABI,
        functionName: 'createStream',
        args: [walletAddress as Address, ratePerSecond],
      })
      console.log('[Stream] callData:', callData)

      const res = await fetch('/api/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'contractExecution',
          userToken,
          walletId,
          contractAddress: treasuryAddress,
          callData,
          feeLevel: 'MEDIUM',
        }),
      })

      const data = await res.json()
      console.log('[Stream] createStream response:', data)

      if (!res.ok) {
        throw new Error(data.message || data.error || 'Failed to create stream transaction')
      }

      const { challengeId } = data
      if (!challengeId) {
        throw new Error('No challengeId returned from API')
      }

      // 4. Execute challenge (user signs via Circle SDK)
      setSubmitStatus('Please sign the transaction...')
      await executeChallenge(challengeId)
      console.log('[Stream] Challenge executed successfully')

      // 5. Poll nextStreamId to confirm creation
      setSubmitStatus('Confirming stream on-chain...')
      let confirmedStreamId = currentNextId
      let retries = 0
      const maxRetries = 12
      while (retries < maxRetries) {
        await new Promise((r) => setTimeout(r, 5000))
        const newNextId = await queryNextStreamId(treasuryAddress)
        console.log(`[Stream poll ${retries + 1}/${maxRetries}] nextStreamId:`, newNextId)
        if (newNextId > currentNextId) {
          confirmedStreamId = currentNextId // the stream we just created
          break
        }
        retries++
      }

      if (retries >= maxRetries) {
        console.warn('[Stream] Polling timed out, using expected streamId:', currentNextId)
      }

      // 6. Build timestamps & tenure
      const startTimestamp = startDate ? Math.floor(new Date(startDate).getTime() / 1000) : 0
      const endTimestamp = endDate ? Math.floor(new Date(endDate).getTime() / 1000) : 0
      const tenureDays =
        startTimestamp && endTimestamp
          ? Math.round((endTimestamp - startTimestamp) / 86400)
          : 0

      // 7. POST project to backend
      setSubmitStatus('Saving project to backend...')
      const backendPayload = {
        freelance_alias: freelancerAlias,
        github_username: githubUsername,
        employee_wallet_address: walletAddress,
        employer_wallet_address: contractorAddress ?? '',
        repo_url: githubRepo,
        milestone_specification: taskSpecification ?? {},
        gmeet_link: googleMeetLink || undefined,
        total_budget: parseFloat(totalBudget) || 0,
        evaluation_mode: evaluationMode,
        start_date: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
        end_date: endDate ? new Date(endDate).toISOString() : new Date().toISOString(),
        total_tenure_days: tenureDays,
        installation_id: installationId ?? '',
        stream_id: confirmedStreamId.toString(),
        treasury_address: treasuryAddress,
      }

      const result = await createProject(backendPayload)
      console.log('[Stream] Project created in backend:', result)

      setSubmitStatus('Stream created successfully!')
      onContractCreated?.()

      // Brief delay to show success, then close
      await new Promise((r) => setTimeout(r, 1500))
      resetForm()
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Stream creation failed'
      setSubmitError(message)
      console.error('[Stream] Error:', err)
    } finally {
      setIsSubmitting(false)
      setSubmitStatus(null)
    }
  }

  const resetForm = () => {
    setFreelancerAlias('')
    setGithubUsername('')
    setWalletAddress('')
    setGithubRepo('')
    setGoogleMeetLink('')
    setTotalBudget('')
    setStreamingRate('')
    setStreamingUnit('d')
    setEvaluationMode('agentic')
    setStartDate('')
    setEndDate('')
    setFileName('')
    setIsParsing(false)
    setTaskSpecification(null)
    setPdfError(null)
    setSubmitError(null)
    setSubmitStatus(null)
  }

  return (
    <Dialog open={open} onOpenChange={isSubmitting ? undefined : onOpenChange} modal={!isSubmitting}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Initiate New Contract</DialogTitle>
          <DialogDescription>
            Set up a new streaming contract with a freelancer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Status Messages */}
          {submitError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {submitError}
            </div>
          )}
          {submitStatus && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              )}
              {submitStatus}
            </div>
          )}

          {/* Freelancer Info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Freelancer Alias</Label>
              <Input
                placeholder="e.g. alex_dev"
                value={freelancerAlias}
                onChange={(e) => setFreelancerAlias(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                GitHub Username
              </Label>
              <Input
                placeholder="e.g. alexdev"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Freelancer Wallet Address</Label>
              <div className="relative">
                <Input
                  placeholder="0x... or ENS name"
                  className="pr-10 font-mono text-sm"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  disabled={isSubmitting}
                />
                <Wallet className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Upload PDF */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Task Specifications (.md)</Label>
            <div className="relative">
              <label className={`flex items-center gap-3 px-4 py-3 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${isSubmitting ? 'pointer-events-none opacity-60' : ''}`}>
                {isParsing ? (
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                ) : taskSpecification ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Upload className="w-5 h-5 text-muted-foreground" />
                )}
                <span className="text-sm text-muted-foreground">
                  {isParsing
                    ? 'Parsing PDF...'
                    : taskSpecification
                    ? `${fileName} — parsed successfully`
                    : fileName || 'Click to upload PROJECT_MILESTONES.md'}
                </span>
                <input
                  type="file"
                  accept=".md"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />
              </label>
            </div>
            {pdfError && (
              <p className="text-xs text-destructive">{pdfError}</p>
            )}
            {taskSpecification && (
              <details className="mt-2">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">
                  View extracted JSON
                </summary>
                <pre className="mt-1 p-3 rounded-lg bg-muted text-xs overflow-auto max-h-40 font-mono">
                  {JSON.stringify(taskSpecification, null, 2)}
                </pre>
              </details>
            )}
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Github className="w-4 h-4" />
                GitHub Repository
              </Label>
              <Input
                placeholder="https://github.com/..."
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Video className="w-4 h-4" />
                Google Meet Link
              </Label>
              <Input
                placeholder="https://meet.google.com/..."
                value={googleMeetLink}
                onChange={(e) => setGoogleMeetLink(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Budget */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Total Budget (USDC)</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Streaming Rate
              </Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="0.00"
                  className="flex-1"
                  value={streamingRate}
                  onChange={(e) => setStreamingRate(e.target.value)}
                  disabled={isSubmitting}
                />
                <Select value={streamingUnit} onValueChange={setStreamingUnit} disabled={isSubmitting}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="h">/ hour</SelectItem>
                    <SelectItem value="d">/ day</SelectItem>
                    <SelectItem value="w">/ week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Evaluation Mode Toggle */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Evaluation Mode</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setEvaluationMode('agentic')}
                disabled={isSubmitting}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                  evaluationMode === 'agentic'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30'
                } ${isSubmitting ? 'opacity-60 pointer-events-none' : ''}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  evaluationMode === 'agentic' ? 'bg-primary/15' : 'bg-muted'
                }`}>
                  <Zap className={`w-5 h-5 ${evaluationMode === 'agentic' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Agentic</p>
                  <p className="text-xs text-muted-foreground">AI-evaluated milestones</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setEvaluationMode('manual')}
                disabled={isSubmitting}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                  evaluationMode === 'manual'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/30'
                } ${isSubmitting ? 'opacity-60 pointer-events-none' : ''}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  evaluationMode === 'manual' ? 'bg-primary/15' : 'bg-muted'
                }`}>
                  <Hand className={`w-5 h-5 ${evaluationMode === 'manual' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">Manual</p>
                  <p className="text-xs text-muted-foreground">Contractor-controlled</p>
                </div>
              </button>
            </div>
          </div>

          {/* Tenure */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Tentative Tenure
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Start Date</span>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">End Date</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              {isSubmitting ? 'Creating Stream...' : 'Initiate Contract'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
