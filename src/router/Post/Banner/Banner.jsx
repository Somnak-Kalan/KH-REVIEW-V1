import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep import functions outside the component.
const loadBannerPage = () =>
    import('../../../pages/Posts/banner/BannerPageContainer')

const loadBannerDetailPage = () =>
    import('../../../pages/Posts/banner/detail/Detail')

// Keep React.lazy() for code splitting.
const BannerPage = React.lazy(loadBannerPage)
const BannerDetailPage = React.lazy(loadBannerDetailPage)

// Quietly preload banner files when the browser is idle.
// Routes remain lazy-loaded, but files will normally be cached
// before the user opens the pages.
const preloadBannerRoutes = () => {
    void Promise.allSettled([
        loadBannerPage(),
        loadBannerDetailPage(),
    ])
}

if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(preloadBannerRoutes, {
            timeout: 1500,
        })
    } else {
        window.setTimeout(preloadBannerRoutes, 300)
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

const BannerRoutes = () => {
    const routes = [
        {
            path: '/banner',
            element: withDelayedFallback(<BannerPage />),
        },
        {
            path: '/banner/detail/:id',
            element: withDelayedFallback(<BannerDetailPage />),
        },
    ]

    return routes
}

export default BannerRoutes