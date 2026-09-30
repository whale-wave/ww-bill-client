import type { HttpTransport, TransportRequest } from './transport'
import { taroTransport } from './taro-transport'

declare const BILL_API_BASE_URL: string

interface ApiEnvelope<T> {
  statusCode: number
  message?: string | string[]
  data?: T
}

export interface ApiError extends Error {
  kind: 'configuration' | 'network' | 'http' | 'business'
  statusCode: number
  data?: unknown
}

export interface RequestOptions {
  query?: Record<string, string | number | undefined>
  signal?: AbortSignal
  timeout?: number
}

interface RequestContext {
  getToken: () => string
  onUnauthorized: (token: string) => void
}

let context: RequestContext = {
  getToken: () => '',
  onUnauthorized: () => undefined,
}
let transport: HttpTransport = taroTransport

export function configureRequestContext(nextContext: RequestContext) {
  context = nextContext
}

export function configureTransport(nextTransport: HttpTransport) {
  transport = nextTransport
}

function apiError(kind: ApiError['kind'], statusCode: number, message: string, data?: unknown): ApiError {
  return Object.assign(new Error(message), { kind, statusCode, data })
}

function messageOf(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.trim())
    return value
  if (Array.isArray(value) && value.every(item => typeof item === 'string'))
    return value.join('；')
  return fallback
}

function queryString(query?: RequestOptions['query']): string {
  if (!query)
    return ''
  const pairs = Object.entries(query)
    .filter((entry): entry is [string, string | number] => entry[1] !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
  return pairs.length ? `?${pairs.join('&')}` : ''
}

export async function request<T>(method: TransportRequest['method'], path: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
  if (!BILL_API_BASE_URL)
    throw apiError('configuration', 0, '尚未配置小程序接口地址')

  const token = context.getToken()
  const url = `${BILL_API_BASE_URL.replace(/\/$/, '')}/api${path}${queryString(options.query)}`
  let response: Awaited<ReturnType<HttpTransport['send']>>

  try {
    response = await transport.send({
      url,
      method,
      data,
      timeout: options.timeout ?? 50000,
      signal: options.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Classification-Version': '2',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  }
  catch (error) {
    if (error instanceof Error && error.message === '请求已取消')
      throw error
    throw apiError('network', 0, '网络请求失败，请检查连接', error)
  }

  if (response.statusCode === 401 && token)
    context.onUnauthorized(token)

  const envelope = response.data as Partial<ApiEnvelope<T>> | null
  if (response.statusCode < 200 || response.statusCode >= 300) {
    throw apiError('http', response.statusCode, messageOf(envelope?.message, `请求失败 (${response.statusCode})`), response.data)
  }
  if (!envelope || envelope.statusCode !== 200) {
    const statusCode = typeof envelope?.statusCode === 'number' ? envelope.statusCode : response.statusCode
    if (statusCode === 401 && token)
      context.onUnauthorized(token)
    throw apiError('business', statusCode, messageOf(envelope?.message, '服务端返回了无效数据'), response.data)
  }
  return envelope.data as T
}

export const api = {
  get: <T>(path: string, options?: RequestOptions) => request<T>('GET', path, undefined, options),
  post: <T>(path: string, data: unknown, options?: RequestOptions) => request<T>('POST', path, data, options),
}
