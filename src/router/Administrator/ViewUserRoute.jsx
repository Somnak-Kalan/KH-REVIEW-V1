import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep import functions outside the component.
const loadViewUserPage = () =>
  import('../../pages/Administrator/users/view/ViewUser')

const loadUserInfo = () =>
  import('../../pages/Administrator/users/view/UserInfor')

const loadUserPassword = () =>
  import('../../pages/Administrator/users/view/UserPassword')

const loadUserPermission = () =>
  import('../../pages/Administrator/users/view/UserPermission')

// Keep React.lazy() for code splitting.
const ViewUserPage = React.lazy(loadViewUserPage)
const UserInfo = React.lazy(loadUserInfo)
const UserPassword = React.lazy(loadUserPassword)
const UserPermission = React.lazy(loadUserPermission)

// Quietly preload files after the main application becomes idle.
// Navigation remains lazy-loaded, but the files will normally be cached
// before the user opens this screen.
const preloadViewUserRoutes = () => {
  void Promise.allSettled([
    loadViewUserPage(),
    loadUserInfo(),
    loadUserPassword(),
    loadUserPermission(),
  ])
}

if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preloadViewUserRoutes, {
      timeout: 1500,
    })
  } else {
    window.setTimeout(preloadViewUserRoutes, 300)
  }
}

// Do not display a loader for very fast lazy imports.
// This prevents the camera-like flash.
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

const ViewUserRoutes = () => {
  const routes = [
    {
      path: '/administrator/user/:userId',
      element: withDelayedFallback(<ViewUserPage />),
      children: [
        {
          path: 'info',
          element: withDelayedFallback(<UserInfo />),
        },
        {
          path: 'permission',
          element: withDelayedFallback(<UserPermission />),
        },
        {
          path: 'password',
          element: withDelayedFallback(<UserPassword />),
        },
      ],
    },
  ]

  return routes
}

export default ViewUserRoutes