// src/components/ShortLinkOpener.jsx
import React, { useState, useMemo, useEffect } from 'react'
import { Form, Input } from 'antd'
import { EnvironmentOutlined } from '@ant-design/icons'

export default function ShortLinkOpener(props) {
  const { displayGoogleMap } = props
  /* ───────────────────── state ───────────────────── */
  const [latLng, setLatLng] = useState('') // manual “lat,lng”
  const [googlePlaceLink, setGooglePlaceLink] = useState()
  const [placeName, setPlaceName] = useState('')
  useEffect(() => {
    setGooglePlaceLink(displayGoogleMap)
  }, [displayGoogleMap])

  /* ───────────────────── helpers ───────────────────── */
  // Extract place name from /place/<NAME>/… (used for nicer map labels)
  const extractPlaceName = (url) => {
    const nameMatch = url.match(/\/place\/([^/]+)/)
    if (!nameMatch) return ''
    return decodeURIComponent(nameMatch[1].replace(/\+/g, ' '))
  }
  useEffect(() => {
    if (!googlePlaceLink) return
    const [lat, lng] = extractLatLng(googlePlaceLink)
    const name = extractPlaceName(googlePlaceLink)
    setPlaceName(name) // 👈 set the readable name here
    if (lat && lng) {
      const coord = `${lat},${lng}`
      setLatLng(coord)
    }
  }, [googlePlaceLink])

  // Extract latitude & longitude from a variety of Google‑Maps URLs.
  // Prefer !3d/!4d (actual POI coords) over the camera @lat,lng.
  const extractLatLng = (url) => {
    if (!url) return []
    // pattern 1 (preferred): …!3d11.5470732!4d104.8638227…
    const dMatch = url.match(/!3d([\d.-]+)!4d([\d.-]+)/)
    if (dMatch) return [dMatch[1], dMatch[2]]

    // pattern 2: …/@11.5760526,104.9217653,…
    const atMatch = url.match(/@([\d.-]+),([\d.-]+)/)
    if (atMatch) return [atMatch[1], atMatch[2]]

    return []
  }

  // Whenever the place‑link changes, pull coordinates (and keep field in sync)
  useEffect(() => {
    if (!googlePlaceLink) return
    const [lat, lng] = extractLatLng(googlePlaceLink)
    if (lat && lng) {
      const coord = `${lat},${lng}`
      setLatLng(coord)
    }
  }, [googlePlaceLink])

  const embedGooglePlaceLink = useMemo(() => {
    if (!googlePlaceLink) return ''

    const label = extractPlaceName(googlePlaceLink)
    const [lat, lng] = extractLatLng(googlePlaceLink)

    // 1️⃣ Preferred – search by name so the bubble shows the place title
    // if (label) {
    //   return `https://maps.google.com/maps?q=${encodeURIComponent(label)}&z=17&output=embed`
    // }

    // 2️⃣ Fallback – pin by coordinates (no guarantee of name display)
    if (lat && lng) {
      return `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`
    }

    // 3️⃣ Last resort – original URL with output=embed (may be blocked)
    return (
      googlePlaceLink.trim() +
      (googlePlaceLink.includes('?') ? '&' : '?') +
      'output=embed'
    )
  }, [googlePlaceLink])

  /* ───────────────────── render ───────────────────── */

  return (
    <>
      {placeName && (
        <div style={{ marginTop: 8, fontWeight: 500, color: '#333' }}>
          📍 {placeName}
        </div>
      )}
      {embedGooglePlaceLink && (
        <div style={{ marginTop: 16, width: '100%', height: 300 }}>
          <iframe
            title='Map Preview'
            src={embedGooglePlaceLink}
            width='100%'
            height='100%'
            style={{ border: 0, borderRadius: 8 }}
            loading='lazy'
            allowFullScreen
            referrerPolicy='no-referrer-when-downgrade'

          />
        </div>
      )}
    </>
  )
}
