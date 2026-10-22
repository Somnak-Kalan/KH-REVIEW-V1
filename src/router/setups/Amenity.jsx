import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep import functions outside the component.
const loadAmenity = () =>
  import('../../pages/setups/amenity/Amenity')

const loadAmenityDetail = () =>
  import('../../pages/setups/amenity/detail/Detail')

// Keep React.lazy() for code splitting.
const Amenity = React.lazy(loadAmenity)
const AmenityDetail = React.lazy(loadAmenityDetail)

// Quietly preload route files when the browser becomes idle.
// Routes remain lazy-loaded, but navigation is smoother because
// the files will normally already be cached before the user opens them.
const preloadAmenityRoutes = () => {
  void Promise.allSettled([
    loadAmenity(),
    loadAmenityDetail(),
  ])
}

if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preloadAmenityRoutes, {
      timeout: 1500,
    })
  } else {
    window.setTimeout(preloadAmenityRoutes, 300)
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

// Reuse the same Suspense configuration for every route.
const withDelayedFallback = (element) => {
  return (
    <Suspense fallback={<DelayedRouteFallback />}>
      {element}
    </Suspense>
  )
}

const AmenityRoutes = () => {
  const routes = [
    {
      path: '/amenity',
      element: withDelayedFallback(<Amenity />),
    },
    {
      path: '/amenity/detail/:id',
      element: withDelayedFallback(<AmenityDetail />),
    },
  ]

  return routes
}

export default AmenityRoutes