import { pgTable, text, timestamp, integer, boolean, serial } from 'drizzle-orm/pg-core'

// Better Auth tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  idToken: text('idToken'),
  password: text('password'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// App tables
export const chats = pgTable('chat', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  agentIds: text('agentIds').notNull(),
  title: text('title'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const messages = pgTable('message', {
  id: serial('id').primaryKey(),
  chatId: integer('chatId').notNull(),
  role: text('role').notNull(),
  content: text('content').notNull(),
  agentId: text('agentId'),
  createdAt: timestamp('createdAt').defaultNow(),
})

export const mvpContexts = pgTable('mvp_context', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  targetUsers: text('targetUsers'),
  features: text('features'),
  restrictions: text('restrictions'),
  successCriteria: text('successCriteria'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const userStories = pgTable('user_story', {
  id: serial('id').primaryKey(),
  mvpContextId: integer('mvpContextId').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  acceptanceCriteria: text('acceptanceCriteria'),
  priority: text('priority').default('medium'),
  status: text('status').default('pending'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const approvals = pgTable('approval', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  workflowId: integer('workflowId'),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('pending'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

export const workflows = pgTable('workflow', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  workflowId: text('workflowId').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('pending'),
  progress: integer('progress').default(0),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})
