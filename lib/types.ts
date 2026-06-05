// Agent types
export type AgentRole = 'analyst' | 'architect' | 'developer' | 'designer' | 'qa' | 'security' | 'uml'

export interface Agent {
  id: string
  name: string
  role: string
  description: string
  capabilities: string[]
  systemPrompt: string
  color: string
  icon: string
}

// Chat types - supports multiple agents
export interface Message {
  id: string
  chatId: number
  role: 'user' | 'assistant'
  content: string
  agentId?: string
  createdAt: Date
}

export interface Chat {
  id: number
  userId: string
  agentIds: string[] // Changed to array for multiple agents
  title?: string
  createdAt: Date
  updatedAt: Date
}

// MVP Context types
export interface MVPContext {
  id: number
  userId: string
  name: string
  description: string
  targetUsers?: string
  features?: string
  restrictions?: string
  successCriteria?: string
  createdAt: Date
  updatedAt: Date
}

// User Story types
export interface UserStory {
  id: number
  mvpContextId: number
  title: string
  description?: string
  acceptanceCriteria?: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed'
  createdAt: Date
  updatedAt: Date
}

// Approval types
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'

export interface Approval {
  id: number
  userId: string
  workflowId?: number
  title: string
  description?: string
  status: ApprovalStatus
  createdAt: Date
  updatedAt: Date
}

// Workflow types
export type WorkflowStatus = 'pending' | 'in_progress' | 'completed' | 'failed'

export interface Workflow {
  id: number
  userId: string
  workflowId: string
  title: string
  description?: string
  status: WorkflowStatus
  progress: number
  createdAt: Date
  updatedAt: Date
}

// User types
export interface User {
  id: string
  email: string
  name: string
  image?: string
}

// Agent status for the active agents panel
export type AgentStatus = 'active' | 'pending' | 'running' | 'idle'

export interface ActiveAgent {
  agent: Agent
  status: AgentStatus
  description?: string
}
