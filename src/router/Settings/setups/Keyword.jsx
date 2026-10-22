import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep import functions outside the component.
const loadKeywordTab = () =>
  import('../../../pages/setups/keyword/KeywordsTab')

const loadKeywordGroupDetail = () =>
  import('../../../pages/setups/keyword/detail/KeywordGroupDetail')

// Keep React.lazy() for code splitting.
const Keywordtab = React.lazy(loadKeywordTab)
const KeywordGroupDetail = React.lazy(loadKeywordGroupDetail)

// Quietly preload route files when the browser becomes idle.
// Routes remain lazy-loaded, but navigation is smoother because
// the files will normally already be cached before the user opens them.
const preloadKeywordRoutes = () => {
  void Promise.allSettled([
    loadKeywordTab(),
    loadKeywordGroupDetail(),
  ])
}

if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preloadKeywordRoutes, {
      timeout: 1500,
    })
  } else {
    window.setTimeout(preloadKeywordRoutes, 300)
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

// Reuse the same Suspense configuration for every route.
const withDelayedFallback = (element) => {
  return (
    <Suspense fallback={<DelayedRouteFallback />}>
      {element}
    </Suspense>
  )
}

const KeywordRoutes = () => {
  const routes = [
    {
      path: '/keyword',
      element: withDelayedFallback(<Keywordtab />),
    },
    {
      path: '/keyword/group/:id',
      element: withDelayedFallback(<KeywordGroupDetail />),
    },
  ]

  return routes
}

export default KeywordRoutes