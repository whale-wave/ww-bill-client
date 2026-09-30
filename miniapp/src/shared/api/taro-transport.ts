import Taro from '@tarojs/taro'
import type { HttpTransport } from './transport'

export const taroTransport: HttpTransport = {
  async send(request) {
    if (request.signal?.aborted)
      throw new Error('请求已取消')

    const task = Taro.request({
      url: request.url,
      method: request.method,
      header: request.headers,
      data: request.data,
      timeout: request.timeout,
    })
    const handleAbort = () => task.abort()
    request.signal?.addEventListener('abort', handleAbort, { once: true })

    try {
      const response = await task
      return { statusCode: response.statusCode, data: response.data }
    }
    finally {
      request.signal?.removeEventListener('abort', handleAbort)
    }
  },
}
