import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep import functions outside the component.
const loadAlbumPage = () =>
  import('../../../pages/Settings/setups/album/Album')

const loadAlbumDetailPage = () =>
  import('../../../pages/Settings/setups/album/detail/Detail')
const loadAlbumSetDetailPage = () =>
  import('../../../pages/Settings/setups/album/sets/detail/Detail')
const loadAlbumInSetDetailPage = () =>
  import('../../../pages/Settings/setups/album/sets/albumDetail/AlbumDetail')

// Keep React.lazy() for code splitting.
const AlbumPage = React.lazy(loadAlbumPage)
const AlbumDetailPage = React.lazy(loadAlbumDetailPage)
const AlbumSetDetailPage = React.lazy(loadAlbumSetDetailPage)
const AlbumInSetDetailPage = React.lazy(loadAlbumInSetDetailPage)

const preloadAlbumRoutes = () => {
  void Promise.allSettled([
    loadAlbumPage(),
    loadAlbumDetailPage(),
    loadAlbumSetDetailPage(),
    loadAlbumInSetDetailPage(),
  ])
}

if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preloadAlbumRoutes, {
      timeout: 1500,
    })
  } else {
    window.setTimeout(preloadAlbumRoutes, 300)
  }
}

// Do not display a loader immediately.
// Fast lazy imports finish before the spinner becomes visible.
const DelayedRouteFallback = () => {
  const [showLoader, setShowLoader] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowLoader(true)
    }, 250)

    return () => {
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <div className="min-h-[180px] flex items-center justify-center">
      {showLoader ? <Spin size="large" /> : null}
    </div>
  )
}

// Reuse the same   Suspense configuration for every route.
const withDelayedFallback = (element) => {
  return (
    <Suspense fallback={<DelayedRouteFallback />}>
      {element}
    </Suspense>
  )
}

const AlbumRoutes = () => {
  const routes = [
    {
      path: '/album',
      element: withDelayedFallback(<AlbumPage />),
    },
    {
      path: '/album/detail/:id',
      element: withDelayedFallback(<AlbumDetailPage />),
    },
    {
      path: '/album/set/:id',
      element: withDelayedFallback(<AlbumSetDetailPage />),
    },
    {
      path: '/album/set/detail/:id',
      element: withDelayedFallback(<AlbumInSetDetailPage />),
    },
  ]

  return routes
}

export default AlbumRoutes