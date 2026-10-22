
import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep import functions outside the component.
const loadPrivacy = () =>
  import('../../pages/setups/privacy/Privacy')

const loadPrivacyDetail = () =>
  import('../../pages/setups/privacy/detail/Deatil')

// Keep React.lazy() for code splitting.
const Privacy = React.lazy(loadPrivacy)
const PrivacyDetail = React.lazy(loadPrivacyDetail)

// Optional preload function.
// Call this when the user hovers over the Privacy sidebar menu.
export const preloadPrivacyRoutes = () => {
  void Promise.allSettled([
    loadPrivacy(),
    loadPrivacyDetail(),
  ])
}

// Do not display a spinner immediately.
// Fast lazy imports finish before the spinner becomes visible.
const DelayedRouteFallback = () => {
  const [showLoader, setShowLoader] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(true)
    }, 250)

    return () => {
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className="min-h-[180px] flex items-center justify-center">
      {showLoader ? <Spin size="large" /> : null}
    </div>
  )
}

// Reuse the same Suspense configuration for every lazy route.
const withDelayedFallback = (element) => {
  return (
    <Suspense fallback={<DelayedRouteFallback />}>
      {element}
    </Suspense>
  )
}

const PrivacyRoutes = () => {
  const routes = [
    {
      path: '/privacy',
      element: withDelayedFallback(<Privacy />),
    },
    {
      path: '/privacy/detail/:id',
      element: withDelayedFallback(<PrivacyDetail />),
    },
  ]

  return routes
}

export default PrivacyRoutes