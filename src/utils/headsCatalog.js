// Heads catalog backed by a 92k-entry index scraped from minecraft-heads.com.
// The catalog file is `public/heads-catalog.json` and is fetched lazily on
// first picker open, then cached in module-level state.

let catalogPromise = null

export function loadHeadsCatalog() {
  if (catalogPromise) return catalogPromise
  catalogPromise = fetch(`${import.meta.env.BASE_URL}heads-catalog.json`)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json()
    })
    .catch(err => {
      // Let the next call retry instead of caching a permanent failure
      catalogPromise = null
      throw err
    })
  return catalogPromise
}

// Build the 3D-rendered head URL for a texture hash.
// mc-heads.net accepts the textures.minecraft.net hash and returns a PNG
// with the same angled perspective as the head item ingame.
export function headImageUrl(hash, size = 64) {
  return `https://mc-heads.net/head/${hash}/${size}`
}

// Detect if a slot.texture value is a head URL we rendered above
export function isHeadUrl(value) {
  return typeof value === 'string' && value.includes('mc-heads.net/head/')
}
