import Taro from '@tarojs/taro'
import { presentationFonts } from '@ww-bill/bill-ui'

const registrations = new Map<string, Promise<unknown>>()

/** Register faces in the miniapp runtime; shared presentation only names them. */
export async function loadPresentationFonts(baseUrl: string) {
  const requests = presentationFonts.flatMap(font => font.weights.map(weight => {
    const url = `${baseUrl.replace(/\/$/, '')}/${font.file}`
    const key = `${url}:${weight}`
    let request = registrations.get(key)
    if (!request) {
      request = Taro.loadFontFace({
        family: font.family,
        source: `url(${JSON.stringify(url)})`,
        global: true,
        desc: { style: 'normal', weight: String(weight) },
      }).catch(error => {
        registrations.delete(key)
        throw error
      })
      registrations.set(key, request)
    }
    return request
  }))
  const results = await Promise.allSettled(requests)
  return { loaded: results.filter(result => result.status === 'fulfilled').length, failed: results.filter(result => result.status === 'rejected').length }
}
