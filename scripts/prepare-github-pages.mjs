import { access, readdir, rename, rmdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const clientRoot = fileURLToPath(new URL("../dist/client/", import.meta.url));
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

if (basePath) {
  const nestedOutput = `${clientRoot}/${basePath.replace(/^\/+|\/+$/g, "")}`;

  if (await exists(nestedOutput)) {
    for (const entry of await readdir(nestedOutput)) {
      const destination = `${clientRoot}/${entry}`;
      if (await exists(destination)) {
        throw new Error(`GitHub-Pages-Ausgabe kann ${entry} nicht sicher zusammenführen.`);
      }
      await rename(`${nestedOutput}/${entry}`, destination);
    }
    await rmdir(nestedOutput);
  }
}

await writeFile(`${clientRoot}/.nojekyll`, "");
console.log("GitHub-Pages-Artefakt vorbereitet.");
