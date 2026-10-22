
import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep import functions outside the component.
const loadPlacePage = () =>
  import('../../pages/setups/province/Province')

const loadProvinceDetail = () =>
  import('../../pages/setups/province/detail/Detail')

// Keep React.lazy() for code splitting.
const PlacePage = React.lazy(loadPlacePage)
const ProvinceDetail = React.lazy(loadProvinceDetail)

// Optional preload function.
// Call this when the user hovers over the Province sidebar menu.
export const preloadProvinceRoutes = () => {
  void Promise.allSettled([
    loadPlacePage(),
    loadProvinceDetail(),
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

const ProvinceRoutes = () => {
  const routes = [
    {
      path: '/province',
      element: withDelayedFallback(<PlacePage />),
    },
    {
      path: '/province/detail/:id',
      element: withDelayedFallback(<ProvinceDetail />),
    },
  ]

  return routes
}

export default ProvinceRoutes