import React, { Suspense, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Spin } from 'antd'

// ------------------- LAZY PAGE IMPORT FUNCTIONS -------------------

// Layout
const loadContentLayout = () =>
  import('@/layouts/Layouts')

// Public pages
const loadLogin = () =>
  import('pages/Authentication/Login')

const loadLogout = () =>
  import('pages/Authentication/Logout')

// Protected single pages
const loadDashboard = () =>
  import('pages/Dashboard/Dashboard')

const loadNotFound = () =>
  import('../pages/NotFound')

const loadForbidden = () =>
  import('../pages/Forbidden')

const loadErrorPage = () =>
  import('../pages/ErrorPage')
import ImageLoading from '../components/Loading/ImageLoading'
// ------------------- LAZY COMPONENTS -------------------

// Layout
const ContentLayout = React.lazy(loadContentLayout)

// Public pages
const Login = React.lazy(loadLogin)
const Logout = React.lazy(loadLogout)

// Protected single pages
const Dashboard = React.lazy(loadDashboard)
const NotFound = React.lazy(loadNotFound)
const Forbidden = React.lazy(loadForbidden)
const ErrorPage = React.lazy(loadErrorPage)

// ------------------- ROUTES -------------------

// *------------------- ROUTES --------------------*//
import ProtectedRoute from './ProtectedRoute'
import AdministratorRoutes from './Administrator/AdministratorRoute'
import ViewUserRoutes from './Administrator/ViewUserRoute'
import MobileUsersRoutes from './MobileApp/UserManagement/User'
import CategoryRoutes from './setups/CategoryRoutes'
import SubCategoryRoutes from './setups/SubCategoryRoutes'
import TypeRoutes from './setups/TypeRoutes'
import MomentRoutes from './Post/Moment'
import HashtagsRoutes from './setups/Hashtags'
import PrivacyRoutes from './setups/Privacy'
import ProvinceRoutes from './setups/Province'
import AmenityRoutes from './setups/Amenity'
// import FeatureRoutes from './setups/Feature'
import RequestListPlaceRoutes from './MobileApp/RequestPlace/RequestPlaceList'
import FilterCopyIdRoutes from './other/FilterCopy'
import SettingsRoutes from './Settings/SettingRoutes'
// *------------------ END ROUTES -------------------*//

// Manage property
import ManagePropertyRoutes from './ManageProperty/PropertyRoutes'

// Manage post routes
import ManagePostRoutes from './Post/Post'

// Mobile app
// -------- User management ----------
import AppManagementRoutes from './MobileApp/AppManagement'

// WebView
import WebViewMangementRoutes from './webview/MainRoutes'

// Settings
// ----- General -----
import ManagementRoutes from './Settings/management/ManagementRoutes'
//============REVIEW MANAGEMENT===============
import MainReviewManagementRoutes from './ReviewManagement/Index'
//=======END REVIEW MANAGEMENT============
// ------------------- PRELOAD CORE ROUTES -------------------

// Preload only the most frequently used protected files.
// Do not automatically preload every route in the project,
// because that would reduce the benefit of React.lazy().
const preloadProtectedCoreRoutes = () => {
  void Promise.allSettled([
    loadContentLayout(),
    loadDashboard(),
  ])
}

if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preloadProtectedCoreRoutes, {
      timeout: 1500,
    })
  } else {
    window.setTimeout(preloadProtectedCoreRoutes, 300)
  }
}

// ------------------- DELAYED FALLBACK -------------------

// Do not display a loader immediately.
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
    <div className='flex min-h-screen items-center justify-center'>
      <div
        style={{
          width: 35,
          height: 35,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ImageLoading overlay={false} size={80} logoSize={30} />
      </div>
    </div>
  )
}

// Reuse the same smooth Suspense configuration for root lazy routes.
const withSuspense = (node) => (
  <Suspense fallback={<DelayedRouteFallback />}>
    {node}
  </Suspense>
)

// ErrorPage is also lazy-loaded, so it needs a Suspense boundary.
const ErrorPages = (node) => withSuspense(node)

// ---------- PUBLIC ROUTES ----------
const publicRoute = () => {
  const routes = [
    {
      path: '/login',
      errorElement: ErrorPages(<ErrorPage />),
      element: withSuspense(<Login />),
    },
    {
      path: '/logout',
      errorElement: ErrorPages(<ErrorPage />),
      element: withSuspense(<Logout />),
    },
    ...WebViewMangementRoutes(),
  ]

  return routes
}

// ---------- AUTH ROUTES ----------
const authRoute = () => {
  const routes = [
    {
      path: '/',
      errorElement: ErrorPages(<ErrorPage />),
      element: (
        <ProtectedRoute>
          {withSuspense(<ContentLayout />)}
        </ProtectedRoute>
      ),

      children: [
        {
          path: '*',
          element: <Navigate to="/404" />,
        },
        {
          path: '/',
          element: <Navigate to="/dashboard" />,
        },
        {
          path: '/404',
          element: withSuspense(<NotFound />),
        },
        {
          path: '/403',
          element: withSuspense(<Forbidden />),
        },
        {
          path: '/dashboard',
          element: withSuspense(<Dashboard />),
        },

        // Mobile app
        ...MobileUsersRoutes(),
        ...RequestListPlaceRoutes(),

        // Administrator
        ...AdministratorRoutes(),
        ...ViewUserRoutes(),
        ...AppManagementRoutes(),

        // =========== SETTING ==============
        // --------------- Setup ------------
        ...ProvinceRoutes(),
        ...CategoryRoutes(),
        ...SubCategoryRoutes(),
        ...TypeRoutes(),
        ...HashtagsRoutes(),
        ...SettingsRoutes(),
        ...AmenityRoutes(),
        ...PrivacyRoutes(),
        ...ManagementRoutes(),
        // =========== END SETTING ==============

        // Other
        ...FilterCopyIdRoutes(),

        // Post
        ...MomentRoutes(),


        // Manage property
        ...ManagePropertyRoutes(),

        // Manage post
        ...ManagePostRoutes(),
        // ===================REVIEW MANAGEMENT ROUTES==========================
        ...MainReviewManagementRoutes()
        // ===================END REVIEW MANAGEMENT ROUTES======================
      ],
    },
  ]

  return routes
}

export { publicRoute, authRoute }