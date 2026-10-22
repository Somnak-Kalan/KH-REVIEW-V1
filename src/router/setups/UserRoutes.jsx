// import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep one import function because all routes use the same page file.
const loadUserList = () =>
  import('../../pages/setups/users/UserList')

// Keep React.lazy() for code splitting.
const UserPage = React.lazy(loadUserList)
const UserBusinessTab = React.lazy(loadUserList)
const UserRequestTab = React.lazy(loadUserList)

// Optional preload function.
// Call this when the user hovers over the User sidebar menu.
export const preloadUserRoutes = () => {
  void loadUserList().catch(() => {
    // React.lazy() will try again when the route is opened.
  })
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

const UserRoutes = () => {
  const routes = [
    {
      path: '/user',
      element: withDelayedFallback(<UserPage />),
      children: [
        {
          path: 'list',
          element: withDelayedFallback(<UserBusinessTab />),
        },
        {
          path: 'request',
          element: withDelayedFallback(<UserRequestTab />),
        },
      ],
    },
  ]

  return routes
}

export default UserRoutes