'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { chats, messages, mvpContexts, userStories, approvals, workflows, user } from '@/lib/db/schema'
import { and, desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

// Chat actions - now supports multiple agents
export async function createChat(agentIds: string[], title?: string) {
  const userId = await getUserId()
  
  const result = await db.insert(chats).values({
    userId,
    agentIds: agentIds.join(','),
    title: title || `Chat con ${agentIds.length} agente(s)`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning({ id: chats.id })
  
  revalidatePath('/')
  return result[0].id
}

export async function getChats() {
  const userId = await getUserId()
  const result = await db
    .select()
    .from(chats)
    .where(eq(chats.userId, userId))
    .orderBy(desc(chats.updatedAt))
  
  return result.map(chat => ({
    ...chat,
    agentIds: chat.agentIds.split(',')
  }))
}

export async function deleteChat(chatId: number) {
  const userId = await getUserId()
  await db.delete(messages).where(eq(messages.chatId, chatId))
  await db.delete(chats).where(and(eq(chats.id, chatId), eq(chats.userId, userId)))
  revalidatePath('/')
}

// Message actions
export async function getMessages(chatId: number) {
  return db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
    .orderBy(messages.createdAt)
}

export async function addMessage(chatId: number, role: 'user' | 'assistant', content: string, agentId?: string) {
  const result = await db.insert(messages).values({
    chatId,
    role,
    content,
    agentId,
    createdAt: new Date(),
  }).returning({ id: messages.id })
  
  // Update chat title if it's the first user message
  const chatMessages = await db
    .select()
    .from(messages)
    .where(eq(messages.chatId, chatId))
  
  if (chatMessages.length === 1 && role === 'user') {
    await db
      .update(chats)
      .set({ title: content.slice(0, 50), updatedAt: new Date() })
      .where(eq(chats.id, chatId))
  } else {
    await db
      .update(chats)
      .set({ updatedAt: new Date() })
      .where(eq(chats.id, chatId))
  }
  
  revalidatePath('/')
  return result[0].id
}

// MVP Context actions
export async function getMVPContext() {
  const userId = await getUserId()
  const contexts = await db
    .select()
    .from(mvpContexts)
    .where(eq(mvpContexts.userId, userId))
    .orderBy(desc(mvpContexts.updatedAt))
    .limit(1)
  
  return contexts[0] || null
}

export async function saveMVPContext(data: {
  name: string
  description: string
  targetUsers?: string
  features?: string
  restrictions?: string
  successCriteria?: string
}) {
  const userId = await getUserId()
  
  // Check if context exists
  const existing = await db
    .select()
    .from(mvpContexts)
    .where(eq(mvpContexts.userId, userId))
    .limit(1)
  
  if (existing.length > 0) {
    await db
      .update(mvpContexts)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(mvpContexts.id, existing[0].id))
    return existing[0].id
  }
  
  const result = await db.insert(mvpContexts).values({
    userId,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning({ id: mvpContexts.id })
  
  revalidatePath('/')
  return result[0].id
}

// User Story actions
export async function getUserStories(mvpContextId: number) {
  return db
    .select()
    .from(userStories)
    .where(eq(userStories.mvpContextId, mvpContextId))
    .orderBy(desc(userStories.createdAt))
}

export async function createUserStory(data: {
  mvpContextId: number
  title: string
  description?: string
  acceptanceCriteria?: string
  priority?: string
}) {
  const result = await db.insert(userStories).values({
    ...data,
    priority: data.priority || 'medium',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning({ id: userStories.id })
  
  revalidatePath('/')
  return result[0].id
}

export async function updateUserStory(storyId: number, data: {
  title?: string
  description?: string
  acceptanceCriteria?: string
  priority?: string
  status?: string
}) {
  await db
    .update(userStories)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(userStories.id, storyId))
  
  revalidatePath('/')
}

export async function deleteUserStory(storyId: number) {
  await db.delete(userStories).where(eq(userStories.id, storyId))
  revalidatePath('/')
}

// Approval actions
export async function getApprovals() {
  const userId = await getUserId()
  return db
    .select()
    .from(approvals)
    .where(eq(approvals.userId, userId))
    .orderBy(desc(approvals.createdAt))
}

export async function getPendingApprovals() {
  const userId = await getUserId()
  return db
    .select()
    .from(approvals)
    .where(and(eq(approvals.userId, userId), eq(approvals.status, 'pending')))
    .orderBy(desc(approvals.createdAt))
}

export async function createApproval(workflowId: number | null, title: string, description?: string) {
  const userId = await getUserId()
  
  const result = await db.insert(approvals).values({
    userId,
    workflowId,
    title,
    description,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning({ id: approvals.id })
  
  revalidatePath('/')
  return result[0].id
}

export async function resolveApproval(approvalId: number, approved: boolean) {
  const userId = await getUserId()
  
  await db
    .update(approvals)
    .set({
      status: approved ? 'approved' : 'rejected',
      updatedAt: new Date(),
    })
    .where(and(eq(approvals.id, approvalId), eq(approvals.userId, userId)))
  
  revalidatePath('/')
}

// Workflow actions
export async function getWorkflows() {
  const userId = await getUserId()
  return db
    .select()
    .from(workflows)
    .where(eq(workflows.userId, userId))
    .orderBy(desc(workflows.createdAt))
}

export async function createWorkflow(title: string, description?: string) {
  const userId = await getUserId()
  const workflowId = `WF-SDAI-${Math.floor(Math.random() * 1000)}`
  
  const result = await db.insert(workflows).values({
    userId,
    workflowId,
    title,
    description,
    status: 'pending',
    progress: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning({ id: workflows.id })
  
  revalidatePath('/')
  return result[0].id
}

export async function updateWorkflow(workflowId: number, data: {
  status?: string
  progress?: number
  title?: string
  description?: string
}) {
  const userId = await getUserId()
  
  await db
    .update(workflows)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(workflows.id, workflowId), eq(workflows.userId, userId)))
  
  revalidatePath('/')
}

// User profile actions
export async function updateUserProfile(name: string) {
  const userId = await getUserId()

  await db
    .update(user)
    .set({
      name,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId))

  revalidatePath('/')
}
