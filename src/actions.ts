import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { ActionContext, Context, PublicAPI, ResultAction } from '@wox-launcher/wox-plugin'
import { PluginSettings } from './types'
import { summarizeResult } from './ui'
import { translateAPI } from './youdao'

const execFileAsync = promisify(execFile)

async function openExternalUrl(url: string): Promise<void> {
  if (process.platform === 'darwin') {
    await execFileAsync('open', [url])
    return
  }

  if (process.platform === 'win32') {
    await execFileAsync('rundll32', ['url.dll,FileProtocolHandler', url])
    return
  }

  await execFileAsync('xdg-open', [url])
}

function buildPostTranslateActions(
  api: PublicAPI,
  copyContent: string,
  url?: string,
): ResultAction[] {
  const actions: ResultAction[] = [
    {
      Name: 'Copy',
      IsDefault: true,
      Action: async (ctx: Context) => {
        await api.Copy(ctx, { type: 'text', text: copyContent })
        await api.Notify(ctx, 'Copied to clipboard')
      },
    },
  ]

  if (url) {
    actions.push({
      Name: 'Open in Browser',
      ContextData: { url },
      Action: async (_ctx, actionContext) => {
        await openExternalUrl(actionContext.ContextData.url)
      },
    })
  }

  return actions
}

export async function getTranslateAction(
  api: PublicAPI,
  content: string,
  fromLanguage: string,
  toLanguage: string,
  settings: PluginSettings,
): Promise<ResultAction[]> {
  return [
    {
      Name: 'Translate',
      IsDefault: true,
      PreventHideAfterAction: true,
      Action: async (ctx: Context, actionContext: ActionContext) => {
        await api.UpdateResult(ctx, {
          Id: actionContext.ResultId,
          Preview: {
            PreviewType: 'text',
            PreviewData: 'Translating...',
            PreviewProperties: {},
          },
        })

        try {
          const translated = await translateAPI(content, fromLanguage, toLanguage, settings)
          if (translated.errorCode && translated.errorCode !== '0') {
            await api.UpdateResult(ctx, {
              Id: actionContext.ResultId,
              Preview: {
                PreviewType: 'text',
                PreviewData: `API error code: ${translated.errorCode}`,
                PreviewProperties: {},
              },
            })
            return
          }

          const { preview, copyText, webUrl } = summarizeResult(translated)
          await api.UpdateResult(ctx, {
            Id: actionContext.ResultId,
            Title: 'Translated',
            SubTitle: `${fromLanguage} -> ${toLanguage}`,
            Preview: {
              PreviewType: 'markdown',
              PreviewData: preview,
              PreviewProperties: {},
            },
            Actions: buildPostTranslateActions(api, copyText, webUrl),
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          await api.UpdateResult(ctx, {
            Id: actionContext.ResultId,
            Preview: {
              PreviewType: 'text',
              PreviewData: `Translate failed: ${message}`,
              PreviewProperties: {},
            },
          })
        }
      },
    },
  ]
}
