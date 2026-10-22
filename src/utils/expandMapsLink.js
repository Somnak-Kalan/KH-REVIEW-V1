import axios from 'axios'

/**
 * Accepts a maps.app.goo.gl *share* link (or a full Google‑Maps place link)
 * and returns: { lat, lng, name, placeId, longUrl }.
 */
export async function getMapsInfo(url) {
  const longUrl = url.startsWith('https://maps.app.goo.gl/')
    ? await expandShort(url)
    : url

  return parseLongUrl(longUrl)
}

/* ───────────────────── helpers ───────────────────── */
async function expandShort(shortUrl) {
  const api =
    'https://api.allorigins.win/get?url=' + encodeURIComponent(shortUrl)
  const { data } = await axios.get(api) // { contents, status }

  /* 1) Proxy actually followed a 3xx */
  if (data?.status?.url && data.status.url !== shortUrl) {
    return data.status.url
  }

  /* 2) Scrape the HTML/JS bootstrap we got back */
  const html = data.contents

  // a) plain https://www.google.com/maps/place/… (old regex)
  let m = html.match(/https:\/\/www\.google\.com\/maps\/place\/[^"'<\\ ]+/)
  if (m) return decodeURIComponent(m[0])

  // b) NEW: \x2F‑escaped version inside window.WIZ_global_data
  m = html.match(
    /https:\\x2F\\x2Fwww\.google\.com\\x2Fmaps\\x2Fplace\\x2F[^"' ]+/
  )
  if (m) {
    const unescaped = m[0]
      .replace(/\\x2F/g, '/') // \x2F → /
      .replace(/\\x3d/g, '=') // \x3d → =
      .replace(/\\x3f/g, '?') // \x3f → ?
      .replace(/\\x26/g, '&') // \x26 → &
      .replace(/\\x3a/g, ':') // \x3a → :
      .replace(/\\x40/g, '@') // \x40 → @
    return decodeURIComponent(unescaped)
  }

  // c) URL %-encoded inside JS as before
  m = html.match(/https%3A%2F%2Fwww\.google\.com%2Fmaps%2Fplace%2F[^"']+/)
  if (m) return decodeURIComponent(m[0])

  // d) <meta http‑equiv="refresh" content="0; url=…">
  m = html.match(/url=([^">]+)/i)
  if (m) return m[1]

  throw new Error("Couldn't resolve the short Google‑Maps link.")
}

function parseLongUrl(longUrl) {
  // coordinates can appear in two patterns
  const at = longUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  const pinLat = longUrl.match(/!3d([-.\d]+)/)
  const pinLng = longUrl.match(/!4d([-.\d]+)/)

  const lat = at ? +at[1] : pinLat ? +pinLat[1] : null
  const lng = at ? +at[2] : pinLng ? +pinLng[1] : null

  // name between “…/place/<NAME>/@…”
  const n = longUrl.match(/\/place\/([^/@]+)/)
  const name = n ? decodeURIComponent(n[1]).replace(/\+/g, ' ') : ''

  // placeId between “…!1s<PLACEID>…”
  const p = longUrl.match(/!1s([^!]+)/)
  const placeId = p ? p[1] : ''

  return { lat, lng, name, placeId, longUrl }
}
