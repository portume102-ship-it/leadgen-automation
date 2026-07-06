export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
}

export interface Team {
  id: string;
  workspaceId: string;
  name: string;
  createdAt: Date;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface ConnectedAccount {
  id: string;
  workspaceId: string;
  platform: 'facebook' | 'instagram' | 'messenger' | 'whatsapp' | 'other';
  platformAccountId: string;
  name: string;
  status: 'connected' | 'disconnected' | 'expired' | 'needs_reauth';
  connectedAt: Date;
  expiresAt?: Date;
}

export interface FacebookPage {
  id: string;
  connectedAccountId: string;
  pageId: string;
  name: string;
  accessToken: string;
}

export interface InstagramAccount {
  id: string;
  connectedAccountId: string;
  instagramId: string;
  username: string;
  name: string;
}

export interface MessengerInbox {
  id: string;
  connectedAccountId: string;
  pageId: string;
}

export interface WhatsAppAccount {
  id: string;
  connectedAccountId: string;
  phoneNumberId: string;
  wabaId: string;
  verifiedName: string;
}

export interface Conversation {
  id: string;
  workspaceId: string;
  platform: 'instagram' | 'messenger' | 'whatsapp';
  platformConversationId: string;
  status: 'open' | 'pending' | 'closed';
  lastActivityAt: Date;
  tags: string[];
}

export interface Message {
  id: string;
  conversationId: string;
  direction: 'inbound' | 'outbound';
  body: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  messageId: string;
  type: 'image' | 'video' | 'audio' | 'file';
  url: string;
}

export interface MediaAsset {
  id: string;
  workspaceId: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
  sizeBytes: number;
  folderId?: string;
  createdAt: Date;
}

export interface ScheduledPost {
  id: string;
  workspaceId: string;
  campaignId?: string;
  content: string;
  platforms: ('facebook' | 'instagram')[];
  mediaIds: string[];
  scheduledAt: Date;
  status: 'draft' | 'pending_approval' | 'approved' | 'publishing' | 'published' | 'failed';
  errorMessage?: string;
  createdAt: Date;
}

export interface PostHistory {
  id: string;
  scheduledPostId?: string;
  workspaceId: string;
  platform: 'facebook' | 'instagram';
  platformPostId?: string;
  content: string;
  publishedAt: Date;
  status: 'success' | 'failed';
  errorDetails?: string;
}

export interface Workflow {
  id: string;
  workspaceId: string;
  name: string;
  triggerType: 'webhook' | 'event' | 'schedule';
  triggerConfig: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: Date;
  finishedAt?: Date;
  error?: string;
}

export interface WebhookSubscription {
  id: string;
  platform: 'facebook' | 'instagram' | 'messenger' | 'whatsapp';
  callbackUrl: string;
  verifyToken: string;
  events: string[];
  isActive: boolean;
}

export interface OAuthToken {
  id: string;
  connectedAccountId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
}

export interface AccessToken {
  token: string;
  expiresAt?: Date;
}

export interface RefreshToken {
  token: string;
  expiresAt?: Date;
}

export interface Permission {
  id: string;
  roleId: string;
  action: string;
  resource: string;
}

export interface AnalyticsSnapshot {
  id: string;
  connectedAccountId: string;
  timestamp: Date;
  metrics: {
    followersCount: number;
    reach: number;
    engagementRate: number;
    repliesCount: number;
    messagesCount: number;
    growth: number;
    responseTimeSeconds: number;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface AuditLog {
  id: string;
  workspaceId: string;
  userId: string;
  action: string;
  details: string;
  ipAddress?: string;
  createdAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Folder {
  id: string;
  workspaceId: string;
  name: string;
  parentId?: string;
}

export interface Campaign {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  createdAt: Date;
}

export interface Draft {
  id: string;
  workspaceId: string;
  content: string;
  mediaIds: string[];
  updatedAt: Date;
}

export interface Approval {
  id: string;
  scheduledPostId: string;
  approverId: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  decidedAt?: Date;
}
