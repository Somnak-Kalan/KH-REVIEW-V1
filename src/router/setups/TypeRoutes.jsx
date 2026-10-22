
import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep import functions outside the component.
const loadTypeList = () =>
  import('../../pages/setups/type/Type')

const loadTypeDetail = () =>
  import('../../pages/setups/type/detail/Detail')

// Keep React.lazy() for code splitting.
const TypeList = React.lazy(loadTypeList)
const TypeDetail = React.lazy(loadTypeDetail)

// Optional preload function.
// Call this when the user hovers over the Type sidebar menu.
export const preloadTypeRoutes = () => {
  void Promise.allSettled([
    loadTypeList(),
    loadTypeDetail(),
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

const TypeRoutes = () => {
  const routes = [
    {
      path: '/type',
      element: withDelayedFallback(<TypeList />),
      children: [
        {
          path: 'place',
          element: withDelayedFallback(<TypeList />),
        },
        {
          path: 'food',
          element: withDelayedFallback(<TypeList />),
        },
      ],
    },
    {
      path: '/type/detail/:id',
      element: withDelayedFallback(<TypeDetail />),
    },
  ]

  return routes
}

export default TypeRoutes