/**
 * Loaded on every Node process during `next build` (see next-build.cjs + NODE_OPTIONS).
 * Sets the official ignore flags; also filters [baseline-browser-mapping] lines because
 * some Next.js worker processes still log before those env vars take effect.
 */
process.env.BASELINE_BROWSER_MAPPING_IGNORE_OLD_DATA ??= 'true'
process.env.BROWSERSLIST_IGNORE_OLD_DATA ??= 'true'

const origWarn = console.warn
console.warn = (...args) => {
  const text = args.map((a) => (typeof a === 'string' ? a : '')).join(' ')
  if (text.includes('[baseline-browser-mapping]')) return
  origWarn.apply(console, args)
}
