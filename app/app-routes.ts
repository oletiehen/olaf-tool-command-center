const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") ?? "";

function isExternalHref(href: string) {
  return /^(?:[a-z]+:|#)/i.test(href);
}

export function appHref(href: string) {
  if (isExternalHref(href)) return href;

  const suffixIndex = href.search(/[?#]/);
  const rawPath = suffixIndex === -1 ? href : href.slice(0, suffixIndex);
  const suffix = suffixIndex === -1 ? "" : href.slice(suffixIndex);
  const leadingPath = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
  const normalizedPath = leadingPath === "/" ? "/" : `${leadingPath.replace(/\/+$/, "")}/`;

  if (configuredBasePath && normalizedPath.startsWith(`${configuredBasePath}/`)) {
    return `${normalizedPath}${suffix}`;
  }

  return `${configuredBasePath}${normalizedPath}${suffix}`;
}
