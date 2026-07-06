import {
  ConnectedAccount,
  ScheduledPost,
  Message,
  Conversation,
  AnalyticsSnapshot,
  MediaAsset,
  AccessToken
} from '../types/models';

export interface PublishingProvider {
  platform: 'facebook' | 'instagram';
  publishPost(account: ConnectedAccount, post: ScheduledPost): Promise<{ success: boolean; platformPostId?: string; error?: string }>;
  validatePost(post: ScheduledPost): Promise<{ isValid: boolean; errors?: string[] }>;
}

export interface MessagingProvider {
  platform: 'instagram' | 'messenger' | 'whatsapp';
  sendMessage(account: ConnectedAccount, conversation: Conversation, message: Message): Promise<{ success: boolean; platformMessageId?: string; error?: string }>;
  normalizeIncomingEvent(event: any): Promise<{ conversation: Partial<Conversation>; message: Partial<Message> }>;
}

export interface AnalyticsProvider {
  platform: 'facebook' | 'instagram' | 'messenger' | 'whatsapp';
  fetchMetrics(account: ConnectedAccount, startDate: Date, endDate: Date): Promise<AnalyticsSnapshot>;
}

export interface WebhookProvider {
  verifySignature(signature: string, rawBody: string, secret: string): boolean;
  processWebhookEvent(payload: any): Promise<{ eventType: string; data: any }>;
}

export interface OAuthProvider {
  getAuthUrl(redirectUri: string, scopes: string[]): string;
  exchangeCodeForTokens(code: string, redirectUri: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date }>;
  refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date }>;
}

export interface MediaProvider {
  processMedia(asset: MediaAsset, targetPlatform: 'facebook' | 'instagram'): Promise<{ processedUrl: string; sizeBytes: number; format: string }>;
}

export interface AIProvider {
  generateText(prompt: string, systemInstructions?: string): Promise<string>;
  analyzeIntent(text: string): Promise<{ intent: string; confidence: number; entities: Record<string, string> }>;
  summarizeConversation(messages: Message[]): Promise<string>;
  analyzeSentiment(text: string): Promise<'positive' | 'neutral' | 'negative'>;
}

export interface StorageProvider {
  uploadFile(file: any, path: string): Promise<string>;
  deleteFile(path: string): Promise<void>;
  getSignedUrl(path: string, expiresSeconds: number): Promise<string>;
}

export interface NotificationProvider {
  sendSystemNotification(userId: string, title: string, body: string): Promise<void>;
  sendEmailNotification(email: string, subject: string, bodyHtml: string): Promise<void>;
}
