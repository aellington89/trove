/** djb2 string hash — returns a 32-bit integer. */
export function djb2(str: string): number {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
  }
  return hash
}

/** Deterministic hue (0–359) derived from a title string using djb2 hash. */
export function computeCoverHue(title: string): number {
  return ((djb2(title) % 360) + 360) % 360
}
