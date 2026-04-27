import {defineConfig } from 'tsdown'

export default defineConfig({
  platform: "node",
  format: ["commonjs"],
  entry: ["src/index.ts"],
  copy: [
    "images",
    "plugin.json"
  ]
})
