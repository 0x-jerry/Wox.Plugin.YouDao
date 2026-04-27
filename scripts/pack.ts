import { $ } from "bun";

// build
for await (const line of $`tsdown`.lines()) {
  console.log(line)
}

// pack to .wox
