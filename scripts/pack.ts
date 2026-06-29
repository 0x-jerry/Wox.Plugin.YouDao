import { $ } from 'bun'
import path from 'node:path'
import { zipSync } from 'fflate'
import { version } from '../package.json'

const pluginName = 'Wox.Plugin.YouDao.wox'

// build
for await (const line of $`tsdown`.lines()) {
  console.log(line)
}

// update version
await updatePluginManifest()

// create zip
const archive = await createZipFile(path.resolve('dist'))
await Bun.write(pluginName, archive)

console.log('Create wox plugin to:', pluginName)

async function updatePluginManifest() {
  const pluginConfigFile = Bun.file('dist/plugin.json')

  const pluginConfig = await pluginConfigFile.json()

  pluginConfig.Version = version

  await pluginConfigFile.write(JSON.stringify(pluginConfig, null, 2))
}

async function createZipFile(dir: string): Promise<Uint8Array> {
  const files: Record<string, Uint8Array> = {}

  const glob = new Bun.Glob('**/*')
  for await (const filePath of glob.scan(dir)) {
    files[filePath] = await Bun.file(path.join(dir, filePath)).bytes()
  }

  return zipSync(files)
}
