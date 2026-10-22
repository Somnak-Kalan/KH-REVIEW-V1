import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep lazy import functions outside the component.
const loadUserProfile = () =>
  import('../../../pages/Administrator/profile/Sidebar')

const loadProfileInfo = () =>
  import('../../../pages/Administrator/profile/ProfileInfo')

const loadPassword = () =>
  import('../../../pages/Administrator/profile/Password')

const loadModule = () =>
  import('../../../pages/Administrator/profile/Module')

const loadRole = () =>
  import('../../../pages/Administrator/profile/Role')

// Keep React.lazy() for code splitting.
const UserProfile = React.lazy(loadUserProfile)
const ProfileInfo = React.lazy(loadProfileInfo)
const Password = React.lazy(loadPassword)
const Module = React.lazy(loadModule)
const Role = React.lazy(loadRole)

// Preload the files quietly after the application starts.
// When the user opens Profile, the files are normally already cached.
const preloadUserProfileRoutes = () => {
  loadUserProfile()
  loadProfileInfo()
  loadPassword()
  loadModule()
  loadRole()
}

if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preloadUserProfileRoutes)
  } else {
    window.setTimeout(preloadUserProfileRoutes, 300)
  }
}

// Do not display a loader immediately.
// A fast lazy import will finish before the spinner becomes visible.
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

const UserProfileRoutes = () => {
  const routes = [
    {
      path: '/profile',
      element: (
        <Suspense fallback={<DelayedRouteFallback />}>
          <UserProfile />
        </Suspense>
      ),
      children: [
        {
          path: 'info',
          element: (
            <Suspense fallback={<DelayedRouteFallback />}>
              <ProfileInfo />
            </Suspense>
          ),
        },
        {
          path: 'password',
          element: (
            <Suspense fallback={<DelayedRouteFallback />}>
              <Password />
            </Suspense>
          ),
        },
        {
          path: 'module',
          element: (
            <Suspense fallback={<DelayedRouteFallback />}>
              <Module />
            </Suspense>
          ),
        },
        {
          path: 'role',
          element: (
            <Suspense fallback={<DelayedRouteFallback />}>
              <Role />
            </Suspense>
          ),
        },
      ],
    },
  ]

  return routes
}

export default UserProfileRoutes