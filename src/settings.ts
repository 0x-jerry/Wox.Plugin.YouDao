import { Context, PublicAPI, Query } from '@wox-launcher/wox-plugin'
import { PluginSettings } from './types'

export function parseLangOverride(query: Query): { fromLanguage?: string; toLanguage?: string } {
  const command = (query.Command ?? '').trim()
  if (!command) {
    return {}
  }

  if (command.includes(':')) {
    const [fromLanguage, toLanguage] = command.split(':', 2).map((v) => v.trim())
    return {
      fromLanguage: fromLanguage || undefined,
      toLanguage: toLanguage || undefined,
    }
  }

  return { toLanguage: command }
}

export async function getSettings(api: PublicAPI, ctx: Context): Promise<PluginSettings> {
  const appKey = await api.GetSetting(ctx, 'appKey')
  const appSecret = await api.GetSetting(ctx, 'appSecret')
  const fromLanguage = (await api.GetSetting(ctx, 'fromLanguage')) || 'auto'
  const toLanguage = (await api.GetSetting(ctx, 'toLanguage')) || 'auto'
  const handleAnnotation = (await api.GetSetting(ctx, 'handleAnnotation')) === 'true'

  return { appKey, appSecret, fromLanguage, toLanguage, handleAnnotation }
}

export function resolveContent(query: Query): string {
  const contentFromSearch = query.Search?.trim() ?? ''
  if (contentFromSearch) {
    return contentFromSearch
  }

  if (query.Type === 'selection' && query.Selection.Type === 'text') {
    return query.Selection.Text.trim()
  }

  return ''
}
