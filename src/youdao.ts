import { createHash } from 'node:crypto'
import { PluginSettings, TranslateResult } from './types'

function generateSign(content: string, salt: number, appKey: string, appSecret: string): string {
  const md5 = createHash('md5')
  md5.update(appKey + content + salt + appSecret)
  return md5.digest('hex').slice(0, 32).toUpperCase()
}

function handleContent(content: string, handleAnnotation: boolean): string {
  const annotations = ['///', '//!', '/*', '*/', '//']
  let output = content

  if (handleAnnotation) {
    for (const annotation of annotations) {
      while (output.includes(annotation)) {
        output = output.replace(annotation, '')
      }
    }
  }

  while (output.includes('\r')) {
    output = output.replace('\r', '')
  }

  const contentList = output.split('\n')
  for (const i in contentList) {
    contentList[i] = contentList[i].trim()
    if (contentList[i] === '') {
      contentList[i] = '\n\n'
    }
  }

  return contentList.join(' ')
}

export async function translateAPI(
  content: string,
  fromLanguage: string,
  toLanguage: string,
  settings: PluginSettings,
): Promise<TranslateResult> {
  const q = Buffer.from(handleContent(content, settings.handleAnnotation)).toString()
  const salt = Date.now()
  const sign = generateSign(q, salt, settings.appKey, settings.appSecret)

  const url = new URL('https://openapi.youdao.com/api')
  const params = new URLSearchParams()
  params.append('q', q)
  params.append('appKey', settings.appKey)
  params.append('from', fromLanguage)
  params.append('to', toLanguage)
  params.append('salt', String(salt))
  params.append('sign', sign)
  url.search = params.toString()

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return (await response.json()) as TranslateResult
}
