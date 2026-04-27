export interface TranslateWebResult {
  value: string[]
  key: string
}

export interface TranslateResult {
  translation?: string[]
  isWord: boolean
  basic?: { phonetic?: string; explains?: string[] }
  l: string
  web?: TranslateWebResult[]
  webdict?: { url: string }
  errorCode: string
}

export interface PluginSettings {
  appKey: string
  appSecret: string
  fromLanguage: string
  toLanguage: string
  handleAnnotation: boolean
}
