import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep import functions outside the component.
const loadTaskComments = () =>
  import('../../../pages/ManageProperty/PlaceListing/TaskComment/TaskComments')

const loadPropertyPage = () =>
  import('../../../pages/ManageProperty/PlaceListing/Property/Property')

const loadReviewImportPage = () =>
  import('../../../pages/ManageProperty/PlaceListing/reviewImport/Property')

const loadPropertyDetail = () =>
  import(
    '../../../pages/ManageProperty/PlaceListing/PropertyDetails/Tabs'
  )

const loadInfo = () =>
  import(
    '../../../pages/ManageProperty/PlaceListing/PropertyDetails/placeInformation/DashboardCard'
  )

const loadMedia = () =>
  import(
    '../../../pages/ManageProperty/PlaceListing/PropertyDetails/VideoImages/Tabs'
  )

const loadReview = () =>
  import(
    '../../../pages/ManageProperty/PlaceListing/PropertyDetails/reviews/Tabs'
  )

const loadTask = () =>
  import(
    '../../../pages/ManageProperty/PlaceListing/PropertyDetails/tasks/Task'
  )

// Keep React.lazy() for code splitting.
const TaskComments = React.lazy(loadTaskComments)
const PropertyPage = React.lazy(loadPropertyPage)
const ReviewImportPage = React.lazy(loadReviewImportPage)

const PropertyDetail = React.lazy(loadPropertyDetail)
const Info = React.lazy(loadInfo)
const Media = React.lazy(loadMedia)
const Review = React.lazy(loadReview)
const Task = React.lazy(loadTask)

// Quietly preload route files after the application becomes idle.
// Navigation remains lazy-loaded, but route files are normally cached
// before the user opens each page.
const preloadPlaceListingRoutes = () => {
  void Promise.allSettled([
    loadTaskComments(),
    loadPropertyPage(),
    loadReviewImportPage(),
    loadPropertyDetail(),
    loadInfo(),
    loadMedia(),
    loadReview(),
    loadTask(),
  ])
}

if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preloadPlaceListingRoutes, {
      timeout: 1500,
    })
  } else {
    window.setTimeout(preloadPlaceListingRoutes, 300)
  }
}

// Do not show a loader immediately.
// Fast lazy imports finish before the spinner appears.
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

const PlaceListingRoutes = () => {
  const routes = [
    {
      path: '/task-comment',
      element: withDelayedFallback(<TaskComments />),
    },
    {
      path: '/property',
      element: withDelayedFallback(<PropertyPage />),
    },
    {
      path: '/review-import',
      element: withDelayedFallback(<ReviewImportPage />),
    },
    {
      path: '/property/:id',
      element: withDelayedFallback(<PropertyDetail />),
      children: [
        {
          path: 'info',
          element: withDelayedFallback(<Info />),
        },
        {
          path: 'media',
          element: withDelayedFallback(<Media />),
        },
        {
          path: 'review',
          element: withDelayedFallback(<Review />),
        },
        {
          path: 'task',
          element: withDelayedFallback(<Task />),
        },
      ],
    },
  ]

  return routes
}

export default PlaceListingRoutes