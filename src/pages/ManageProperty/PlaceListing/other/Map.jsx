// src/components/ShortLinkOpener.jsx
import React, { useState, useMemo, useEffect } from 'react'
import { Form, Input, Space } from 'antd'
import { EnvironmentOutlined } from '@ant-design/icons'

export default function ShortLinkOpener(props) {
  const { formMap, googleMap, displayGoogleMap } = props

  /* ───────────────────── state ───────────────────── */
  const [shortLink, setShortLink] = useState('') // maps.app.goo.gl, etc.
  const [latLng, setLatLng] = useState('') // manual “lat,lng”
  const [googlePlaceLink, setGooglePlaceLink] = useState()
  const [placeName, setPlaceName] = useState('')

  useEffect(() => {
    setGooglePlaceLink(displayGoogleMap)
    if (displayGoogleMap === undefined) {
      setLatLng('')
      setPlaceName('')
      formMap.setFieldsValue({ coordinates: '' })
    }
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
      formMap.setFieldsValue({ coordinates: coord })
    }
  }, [googlePlaceLink, formMap])

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

  useEffect(() => {
    const googleMap1 = formMap?.getFieldsValue('googleMap')
    setShortLink(googleMap1?.googleMap)
    if (!googleMap) return
    setShortLink(googleMap)
    formMap.setFieldsValue({ googleMap: googleMap })
  }, [googleMap, formMap])

  // Whenever the place‑link changes, pull coordinates (and keep field in sync)
  useEffect(() => {
    if (!googlePlaceLink) return
    const [lat, lng] = extractLatLng(googlePlaceLink)
    if (lat && lng) {
      const coord = `${lat},${lng}`
      setLatLng(coord)
      formMap.setFieldsValue({ coordinates: coord })
    }
  }, [googlePlaceLink, formMap])
  //
  // ShortLinkOpener.jsx  (only the memo needs to change)
  const embedGooglePlaceLink = useMemo(() => {
    /** prefer the long “/place/…” link -------------------- */
    if (googlePlaceLink) {
      const label = extractPlaceName(googlePlaceLink)
      const [lat, lng] = extractLatLng(googlePlaceLink)
      if (lat && lng)
        // 2️⃣ fallback to coordinates inside that link
        return `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`
    }

    /** else fall back to the manual lat,lng field ---------- */
    if (latLng && latLng.includes(',')) {
      const [lat, lng] = latLng.split(',').map((s) => s.trim())
      if (lat && lng) {
        return `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`
      }
    }

    /** nothing usable → return empty string ---------------- */
    return ''
  }, [googlePlaceLink, latLng])

  // }, [googlePlaceLink])
  const onChangeGooglePlaceLink = (value) => {
    setGooglePlaceLink(value)
  }
  const normalizeUrl = (url = '') =>
    url.trim()
      ? /^https?:\/\//i.test(url) // already starts with http/https?
        ? url.trim()
        : 'https://' + url.trim() // add protocol for maps.app.goo.gl …
      : ''
  /* ───────────────────── render ───────────────────── */
  const hasValidUrl = Boolean(embedGooglePlaceLink) // simple flag
  return (
    <>
      {/* <Form layout='vertical' form={formMap}> */}
      {/* 1) short maps.app link */}
      <Form.Item
        style={{ marginBottom: 8 }}
        label='Google Maps short link'
        name='googleMap'
      >
        {/* <Input
          placeholder='Paste maps.app.goo.gl link'
          value={shortLink}
          onChange={(e) => {
            const v = e.target.value
            setShortLink(v)
            formMap.setFieldsValue({ googleMap: v })
          }}
          addonAfter={
            <a
              href={normalizeUrl(shortLink) || '#'}
              target='_blank'
              rel='noopener noreferrer'
              className={
                shortLink
                  ? 'text-blue-400' // clickable and blue when we have a link
                  : 'text-gray-400 pointer-events-none'
              }
            >
              <EnvironmentOutlined style={{ marginRight: 4 }} />
              Open
            </a>
          }
        /> */}
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder='Paste maps.app.goo.gl link'
            value={shortLink}
            onChange={(e) => {
              const v = e.target.value
              setShortLink(v)
              formMap.setFieldsValue({ googleMap: v })
            }}
          />
          <a
            href={normalizeUrl(shortLink) || '#'}
            target='_blank'
            rel='noopener noreferrer'
            className={`flex items-center justify-center px-3 rounded-r-md ${shortLink ? 'text-blue-500 hover:underline' : 'text-gray-400 pointer-events-none'
              }`}
            style={{
              background: '#f5f5f5',
              border: '1px solid #d9d9d9',
              borderLeft: 'none',
              height: 32,
            }}
          >
            <EnvironmentOutlined style={{ marginRight: 4 }} />
            Open
          </a>
        </Space.Compact>

      </Form.Item>
      {/* 2) long “…/place/…/@lat,lng…” link */}
      <Form.Item
        style={{ marginBottom: 8 }}
        label='Google Maps place link'
        name='googlePlaceLink'
        rules={[
          {
            required: true,
            message: 'field required',
          },
        ]}
      >
        <Input
          placeholder='Paste long place link'
          onChange={(e) => onChangeGooglePlaceLink(e.target.value)}
        />
      </Form.Item>

      {/* 3) manual latitude,longitude */}
      <Form.Item
        style={{ marginBottom: 0 }}
        label='Latitude,Longitude'
        name='coordinates'
        rules={[
          {
            required: true,
            message: 'field required',
          },
        ]}
      >
        <Input
          placeholder='11.5760526,104.9217653'
          value={latLng}
          onChange={(e) => setLatLng(e.target.value)}
        />
      </Form.Item>
      {placeName && (
        <div style={{ marginTop: 8, fontWeight: 500, color: '#333' }}>
          📍 {placeName}
        </div>
      )}
      {hasValidUrl && (
        <iframe
          title='Map Preview'
          src={embedGooglePlaceLink}
          width='100%'
          height='100%'
          style={{ marginTop: 16, width: '100%', height: 300 }}
          loading='lazy'
          allowFullScreen // ← already camel-cased
          referrerPolicy='no-referrer-when-downgrade' // ← camel-case the P
        />
      )}
    </>
  )
}
