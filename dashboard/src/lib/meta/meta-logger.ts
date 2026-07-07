// lib/meta/meta-logger.ts
export type LogLevel = 'info' | 'warn' | 'error' | 'debug'
export interface MetaLogEntry {
  level: LogLevel; timestamp: string; source: string; event: string
  requestId?: string; endpoint?: string; method?: string; statusCode?: number
  duration?: number; retryCount?: number; workflowSource?: string
  payload?: Record<string, unknown>; response?: Record<string, unknown>
  headers?: Record<string, string>; error?: string
  graphError?: { message: string; type: string; code: number }
}
function scrubSecrets(obj: Record<string, unknown>): Record<string, unknown> {
  if (!obj || typeof obj !== 'object') return obj
  const scrubbed = { ...obj }
  const secretKeys = ['access_token', 'app_secret', 'password', 'token', 'verify_token', 'webhook_secret']
  for (const key of Object.keys(scrubbed)) {
    if (secretKeys.some(s => key.toLowerCase().includes(s))) scrubbed[key] = '***'
    else if (typeof scrubbed[key] === 'object' && scrubbed[key] !== null) scrubbed[key] = scrubSecrets(scrubbed[key] as Record<string, unknown>)
  }
  return scrubbed
}
function log(entry: MetaLogEntry): void {
  const clean = { ...entry, payload: entry.payload ? scrubSecrets(entry.payload) : undefined, headers: entry.headers ? scrubSecrets(entry.headers as Record<string, unknown>) as Record<string, string> : undefined }
  const prefix = `[MetaLogger:${entry.level.toUpperCase()}]`
  const line = `${prefix} [${entry.source}] ${entry.event}${entry.duration ? ` (${entry.duration}ms)` : ''}${entry.error ? ` ERROR: ${entry.error}` : ''}`
  if (entry.level === 'error') console.error(line, JSON.stringify(clean))
  else if (entry.level === 'warn') console.warn(line, JSON.stringify(clean))
  else console.log(line, JSON.stringify(clean))
}
export const MetaLogger = {
  info: (source: string, event: string, extra?: Partial<MetaLogEntry>) => log({ level: 'info', timestamp: new Date().toISOString(), source, event, ...extra }),
  warn: (source: string, event: string, extra?: Partial<MetaLogEntry>) => log({ level: 'warn', timestamp: new Date().toISOString(), source, event, ...extra }),
  error: (source: string, event: string, extra?: Partial<MetaLogEntry>) => log({ level: 'error', timestamp: new Date().toISOString(), source, event, ...extra }),
  debug: (source: string, event: string, extra?: Partial<MetaLogEntry>) => log({ level: 'debug', timestamp: new Date().toISOString(), source, event, ...extra }),
  request: (source: string, method: string, endpoint: string, payload?: Record<string, unknown>) => log({ level: 'info', timestamp: new Date().toISOString(), source, event: 'API_REQUEST', method, endpoint: endpoint.replace(/access_token=[^&]*/g, 'access_token=***'), payload }),
  response: (source: string, endpoint: string, statusCode: number, duration: number, graphError?: MetaLogEntry['graphError']) => log({ level: graphError ? 'error' : 'info', timestamp: new Date().toISOString(), source, event: 'API_RESPONSE', endpoint: endpoint.replace(/access_token=[^&]*/g, 'access_token=***'), statusCode, duration, graphError }),
}
