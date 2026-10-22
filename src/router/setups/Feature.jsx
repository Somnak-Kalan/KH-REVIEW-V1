
import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep import functions outside the component.
const loadFeatures = () =>
  import('../../pages/setups/features/Feature')

const loadFeatureDetail = () =>
  import('../../pages/setups/features/detail/Detail')

// Keep React.lazy() for code splitting.
const Features = React.lazy(loadFeatures)
const FeatureDetail = React.lazy(loadFeatureDetail)

// Optional preload function.
// Call this when the user hovers over the Feature sidebar menu.
// Do not automatically download every lazy route when the app starts.
export const preloadFeatureRoutes = () => {
  void Promise.allSettled([
    loadFeatures(),
    loadFeatureDetail(),
  ])
}

// Do not display a spinner immediately.
// Fast route loading finishes before the spinner becomes visible.
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

const FeatureRoutes = () => {
  const routes = [
    {
      path: '/feature',
      element: withDelayedFallback(<Features />),
    },
    {
      path: '/feature/detail/:id',
      element: withDelayedFallback(<FeatureDetail />),
    },
  ]

  return routes
}

export default FeatureRoutes