export interface TransportRequest {
  url: string
  method: 'GET' | 'POST'
  headers: Record<string, string>
  data?: unknown
  timeout: number
  signal?: AbortSignal
}

export interface TransportResponse {
  statusCode: number
  data: unknown
}

export interface HttpTransport {
  send(request: TransportRequest): Promise<TransportResponse>
}
