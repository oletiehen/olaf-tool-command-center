import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const vinextPrerenderFile = fileURLToPath(
  new URL("../node_modules/vinext/dist/build/prerender.js", import.meta.url),
);
const patchMarker = "vinext-pages-base-path";
const htmlNeedle = "const htmlRequest = new Request(`http://localhost${urlPath}`, { headers: htmlHeaders });";
const rscNeedle = "const rscRequest = new Request(`http://localhost${urlPath}`, { headers: rscHeaders });";

let source = await readFile(vinextPrerenderFile, "utf8");

if (!source.includes(patchMarker)) {
  if (!source.includes(htmlNeedle) || !source.includes(rscNeedle)) {
    throw new Error(
      "Der vinext-Export-Patch passt nicht zur installierten Version. Bitte den Export vor einer Veröffentlichung erneut prüfen.",
    );
  }

  source = source
    .replace(
      htmlNeedle,
      `// ${patchMarker}: export requests must include basePath and the configured trailing slash.\n` +
        `\t\t\t\tconst publicUrlPath = \`${"${config.basePath ?? \"\"}"}${"${urlPath === \"/\" ? \"/\" : config.trailingSlash && !urlPath.endsWith(\"/\") ? `${urlPath}/` : urlPath}"}\`;\n` +
        `\t\t\t\tconst htmlRequest = new Request(\`http://localhost${"${publicUrlPath}"}\`, { headers: htmlHeaders });`,
    )
    .replace(
      rscNeedle,
      "const rscRequest = new Request(`http://localhost${publicUrlPath}`, { headers: rscHeaders });",
    );

  await writeFile(vinextPrerenderFile, source);
  console.log("vinext static export: Repository-Unterpfad aktiviert.");
}
