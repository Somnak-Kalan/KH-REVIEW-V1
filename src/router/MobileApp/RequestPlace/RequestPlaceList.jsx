// import React, { Suspense } from 'react'
// const LazyRequestListPlace = React.lazy(
//   () => import('../../../pages/MobileApp/RequestPlace/PlaceListTab')
// )

// import Loader from '../../../components/Loading/refreshloading/Loader'
// const RequestListPlaceRoutes = () => {
//   const routes = [
//     {
//       path: '/request-list-place',
//       element: (
//         <Suspense fallback={<Loader />}>
//           <LazyRequestListPlace />
//         </Suspense>
//       ),
//     },
//   ]
//   return routes
// }

// export default RequestListPlaceRoutes
import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep import function outside the component.
const loadRequestListPlace = () =>
  import('../../../pages/MobileApp/RequestPlace/PlaceListTab')

// Keep React.lazy() for code splitting.
const LazyRequestListPlace = React.lazy(loadRequestListPlace)

// Quietly preload the route file when the browser is idle.
// The route remains lazy-loaded, but it will normally be cached
// before the user clicks the menu.
const preloadRequestListPlaceRoute = () => {
  void loadRequestListPlace().catch(() => {
    // React.lazy() will try again when the route is opened.
  })
}

if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preloadRequestListPlaceRoute, {
      timeout: 1500,
    })
  } else {
    window.setTimeout(preloadRequestListPlaceRoute, 300)
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

const RequestListPlaceRoutes = () => {
  const routes = [
    {
      path: '/request-list-place',
      element: (
        <Suspense fallback={<DelayedRouteFallback />}>
          <LazyRequestListPlace />
        </Suspense>
      ),
    },
  ]

  return routes
}

export default RequestListPlaceRoutes