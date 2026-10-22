import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep import functions outside the component.
// React.lazy must remain at module scope.
const loadMobileUserList = () =>
  import('../../../pages/MobileApp/UserManagement/Users/UserList')

const loadUserProfilePage = () =>
  import('../../../pages/MobileApp/UserManagement/Users/UserProfilePage')

const MobileUserList = React.lazy(loadMobileUserList)
const UserProfilePage = React.lazy(loadUserProfilePage)

// Preload both files when the browser is idle.
// The first click will usually open immediately without showing fallback.
const preloadMobileAppUsersRoutes = () => {
  loadMobileUserList()
  loadUserProfilePage()
}

if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preloadMobileAppUsersRoutes)
  } else {
    setTimeout(preloadMobileAppUsersRoutes, 300)
  }
}

// Do not show a loader immediately.
// Fast route loading will finish before the spinner appears.
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
    <div className="min-h-[280px] flex items-center justify-center">
      {showLoader ? <Spin size="large" /> : null}
    </div>
  )
}

const MobileAppUsersRoutes = () => {
  const routes = [
    {
      path: '/app',
      children: [
        {
          path: 'user',
          element: (
            <Suspense fallback={<DelayedRouteFallback />}>
              <MobileUserList />
            </Suspense>
          ),
        },
        {
          path: 'user/profile/:id',
          element: (
            <Suspense fallback={<DelayedRouteFallback />}>
              <UserProfilePage />
            </Suspense>
          ),
        },
      ],
    },
  ]

  return routes
}

export default MobileAppUsersRoutes