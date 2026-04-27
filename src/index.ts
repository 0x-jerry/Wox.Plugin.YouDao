import {
  Context,
  Plugin,
  PluginInitParams,
  PublicAPI,
  Query,
  Result,
} from '@wox-launcher/wox-plugin'
import { getTranslateAction } from './actions'
import { getSettings, parseLangOverride, resolveContent } from './settings'
import { appIcon, buildHelpResult } from './ui'

let api: PublicAPI

export const plugin: Plugin = {
  init: async (ctx: Context, initParams: PluginInitParams) => {
    api = initParams.API
    await api.Log(ctx, 'Info', 'Init finished')
  },

  query: async (ctx: Context, query: Query): Promise<Result[]> => {
    const settings = await getSettings(api, ctx)
    if (!settings.appKey || !settings.appSecret) {
      return buildHelpResult('Please set both App Key and App Secret in plugin settings.')
    }

    const langOverride = parseLangOverride(query)
    const fromLanguage = langOverride.fromLanguage ?? settings.fromLanguage
    const toLanguage = langOverride.toLanguage ?? settings.toLanguage
    const content = resolveContent(query)

    if (!content) {
      return buildHelpResult('Type text to translate.')
    }

    return [
      {
        Title: 'Youdao Translate',
        SubTitle: `${fromLanguage} -> ${toLanguage}`,
        Icon: appIcon,
        Preview: {
          PreviewType: 'text',
          PreviewData: content,
          PreviewProperties: {},
        },
        Actions: await getTranslateAction(api, content, fromLanguage, toLanguage, settings),
      },
    ]
  },
}
