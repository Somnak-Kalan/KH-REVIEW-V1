
import React, { Suspense, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Spin } from 'antd'

// Keep import functions outside the component.
const loadMoments = () =>
  import('../../pages/Posts/moment/Moment')

const loadMomentsDetail = () =>
  import('../../pages/Posts/moment/post/detail/Detail')

const loadMomentsVideoDetail = () =>
  import('../../pages/Posts/moment/video/detail/Detail')

// Keep React.lazy() for code splitting.
const Moments = React.lazy(loadMoments)
const MomentsDetail = React.lazy(loadMomentsDetail)
const MomentsVideoDetail = React.lazy(loadMomentsVideoDetail)

// Quietly preload route files when the browser becomes idle.
// Routes remain code-split, but files will normally be cached
// before the user opens each screen.
const preloadMomentRoutes = () => {
  void Promise.allSettled([
    loadMoments(),
    loadMomentsDetail(),
    loadMomentsVideoDetail(),
  ])
}

if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preloadMomentRoutes, {
      timeout: 1500,
    })
  } else {
    window.setTimeout(preloadMomentRoutes, 300)
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

// Reuse the same Suspense configuration for every lazy route.
const withDelayedFallback = (element) => {
  return (
    <Suspense fallback={<DelayedRouteFallback />}>
      {element}
    </Suspense>
  )
}

const MomentRoutes = () => {
  const routes = [
    {
      path: '/moment',
      element: withDelayedFallback(<Moments />),
      children: [
        // Default: /moment -> /moment/post
        {
          index: true,
          element: <Navigate to="post" replace />,
        },

        // Keep these routes available for your Moment tabs.
        // Do not redirect each route to itself.
        {
          path: 'post',
          element: null,
        },
        {
          path: 'video',
          element: null,
        },
      ],
    },
    {
      path: '/moment/post/detail/:id',
      element: withDelayedFallback(<MomentsDetail />),
    },
    {
      path: '/moment/video/detail/:id',
      element: withDelayedFallback(<MomentsVideoDetail />),
    },
  ]

  return routes
}

export default MomentRoutes