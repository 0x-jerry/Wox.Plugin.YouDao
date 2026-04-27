import { Result } from '@wox-launcher/wox-plugin'
import { TranslateResult } from './types'

export const appIcon = {
  ImageType: 'relative' as const,
  ImageData: 'images/app.svg',
}

export function buildHelpResult(message: string): Result[] {
  return [
    {
      Title: 'Youdao Translator',
      SubTitle: message,
      Icon: appIcon,
      Preview: {
        PreviewType: 'markdown',
        PreviewData: `# Youdao Translator\n\n${message}`,
        PreviewProperties: {},
      },
    },
  ]
}

export function summarizeResult(result: TranslateResult): {
  preview: string
  copyText: string
  webUrl?: string
} {
  const lines: string[] = []

  if (result.translation && result.translation.length > 0) {
    lines.push('## Translate')
    for (const item of result.translation) {
      lines.push(`- ${item}`)
    }
    lines.push('')
  }

  if (result.basic?.explains && result.basic.explains.length > 0) {
    lines.push('## Detail')
    for (const item of result.basic.explains) {
      lines.push(`- ${item}`)
    }
    lines.push('')
  }

  if (result.web && result.web.length > 0) {
    lines.push('## Web Translate')
    for (const item of result.web) {
      lines.push(`- ${item.key}: ${item.value.join(', ')}`)
    }
    lines.push('')
  }

  const copyText = (result.translation ?? []).join('\n').trim()
  return {
    preview: lines.join('\n').trim() || 'No translation result returned.',
    copyText: copyText || 'No translation result returned.',
    webUrl: result.webdict?.url,
  }
}
