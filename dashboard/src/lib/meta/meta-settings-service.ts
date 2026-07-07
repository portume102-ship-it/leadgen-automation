// lib/meta/meta-settings-service.ts
export interface MetaSettings { META_APP_ID: string; META_APP_SECRET: string; META_PAGE_ID: string; META_PAGE_NAME: string; META_PAGE_ACCESS_TOKEN: string; INSTAGRAM_APP_ID: string; INSTAGRAM_USERNAME: string; INSTAGRAM_BUSINESS_ID: string; BUSINESS_PORTFOLIO_ID: string; META_VERIFY_TOKEN: string; META_WEBHOOK_CALLBACK_URL: string; META_OAUTH_REDIRECT_URI: string; META_GRAPH_API_VERSION: string; META_GRAPH_BASE_URL: string; WHATSAPP_PHONE_NUMBER_ID: string; WHATSAPP_BUSINESS_ACCOUNT_ID: string; WHATSAPP_PERMANENT_TOKEN: string }
export const MetaSettingsService = {
  getFromEnv(): Partial<MetaSettings> {
    return { META_APP_ID: process.env.META_APP_ID || '', META_PAGE_ID: process.env.META_PAGE_ID || '', META_PAGE_NAME: process.env.META_PAGE_NAME || '', INSTAGRAM_USERNAME: process.env.INSTAGRAM_USERNAME || '', INSTAGRAM_BUSINESS_ID: process.env.INSTAGRAM_BUSINESS_ID || '', BUSINESS_PORTFOLIO_ID: process.env.BUSINESS_PORTFOLIO_ID || '', META_WEBHOOK_CALLBACK_URL: process.env.META_WEBHOOK_CALLBACK_URL || '', META_OAUTH_REDIRECT_URI: process.env.META_OAUTH_REDIRECT_URI || '', META_GRAPH_API_VERSION: process.env.META_GRAPH_API_VERSION || 'v23.0', META_GRAPH_BASE_URL: process.env.META_GRAPH_BASE_URL || 'https://graph.facebook.com', WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || '', WHATSAPP_BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '' }
  },
  isConfigured(): { ok: boolean; missing: string[] } {
    const required = ['META_APP_ID', 'META_APP_SECRET', 'META_PAGE_ID', 'META_PAGE_ACCESS_TOKEN', 'META_VERIFY_TOKEN']
    const missing = required.filter(k => !process.env[k])
    return { ok: missing.length === 0, missing }
  },
}
