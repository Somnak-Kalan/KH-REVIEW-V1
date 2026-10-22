
import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep import functions outside the component.
const loadCategory = () =>
  import('../../pages/setups/categories/Category')

const loadCategoryDetail = () =>
  import('../../pages/setups/categories/detail/Detail')

const loadSubCategoryList = () =>
  import('../../pages/setups/categories/detail/SubCategory')

// Keep React.lazy() for code splitting.
const Category = React.lazy(loadCategory)
const CategoryDetail = React.lazy(loadCategoryDetail)
const SubCategoryList = React.lazy(loadSubCategoryList)

// Optional preload function.
// Call this when the user hovers over the Category sidebar menu.
// Do not automatically preload every route in your project at startup.
export const preloadCategoryRoutes = () => {
  void Promise.allSettled([
    loadCategory(),
    loadCategoryDetail(),
    loadSubCategoryList(),
  ])
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

const CategoryRoutes = () => {
  const routes = [
    {
      path: '/category',
      element: withDelayedFallback(<Category />),
    },
    {
      path: '/category/detail/:id',
      element: withDelayedFallback(<CategoryDetail />),
      children: [
        {
          path: 'subcategory',
          element: withDelayedFallback(<SubCategoryList />),
        },
      ],
    },
  ]

  return routes
}

export default CategoryRoutes