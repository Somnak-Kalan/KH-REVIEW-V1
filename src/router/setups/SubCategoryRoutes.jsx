
import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep import functions outside the component.
const loadSubCategory = () =>
  import('../../pages/setups/subCategory/SubCategory')

const loadSubCategoryDetail = () =>
  import('../../pages/setups/subCategory/detail/Detail')

// Keep React.lazy() for code splitting.
const SubCategory = React.lazy(loadSubCategory)
const SubCategoryDetail = React.lazy(loadSubCategoryDetail)

// Optional preload function.
// Call this when the user hovers over the Sub Category sidebar menu.
export const preloadSubCategoryRoutes = () => {
  void Promise.allSettled([
    loadSubCategory(),
    loadSubCategoryDetail(),
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

const SubCategoryRoutes = () => {
  const routes = [
    {
      path: '/sub-category',
      element: withDelayedFallback(<SubCategory />),
    },
    {
      path: '/sub-category/detail/:id',
      element: withDelayedFallback(<SubCategoryDetail />),
    },
  ]

  return routes
}

export default SubCategoryRoutes