export type LeadStatus =
  | 'new'
  | 'whatsapp_sent'
  | 'email_sent'
  | 'replied'
  | 'converted'
  | 'skip'

export interface Lead {
  id: string
  created_at: string
  name: string
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  category: string | null
  website: string | null
  rating: number | null
  review_count: number | null
  source: string
  status: LeadStatus
  whatsapp_sent_at: string | null
  email_sent_at: string | null
  last_contacted_at: string | null
  notes: string | null
  ai_message_whatsapp: string | null
  ai_message_email_subject: string | null
  ai_message_email_body: string | null
}

export const LEAD_STATUSES: LeadStatus[] = [
  'new',
  'whatsapp_sent',
  'email_sent',
  'replied',
  'converted',
  'skip',
]

export const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-gray-800/60 text-gray-300 border border-gray-700/50',
  whatsapp_sent: 'bg-blue-950/40 text-blue-300 border border-blue-800/50',
  email_sent: 'bg-violet-950/40 text-violet-300 border border-violet-850/50',
  replied: 'bg-amber-950/40 text-amber-300 border border-amber-800/50',
  converted: 'bg-green-950/40 text-green-300 border border-green-800/50',
  skip: 'bg-red-950/40 text-red-300 border border-red-800/50',
}
