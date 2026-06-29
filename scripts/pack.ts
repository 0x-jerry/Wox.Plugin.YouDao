import { $ } from 'bun'
import path from 'node:path'
import { zipSync } from 'fflate'

// build
for await (const line of $`tsdown`.lines()) {
  console.log(line)
}

const archive = await createZipFile(path.resolve('dist'))

await Bun.write(`Wox.Plugin.YouDao.wox`, archive)

async function createZipFile(dir: string): Promise<Uint8Array> {
  const files: Record<string, Uint8Array> = {}

  const glob = new Bun.Glob('**/*')
  for await (const filePath of glob.scan(dir)) {
    files[filePath] = await Bun.file(path.join(dir, filePath)).bytes()
  }

  return zipSync(files)
}
