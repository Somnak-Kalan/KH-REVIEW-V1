import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep import functions outside the component.
const loadAreaList = () =>
    import('../../../pages/Settings/setups/Area/AreaList')

const loadAreaDetail = () =>
    import('../../../pages/Settings/setups/Area/Detail/AreaDetail')

// Keep React.lazy() for code splitting.
const AreaList = React.lazy(loadAreaList)
const AreaDetail = React.lazy(loadAreaDetail)

// Quietly preload route files when the browser becomes idle.
// Routes remain lazy-loaded, but the files will normally be cached
// before the user opens each screen.
const preloadAreaRoutes = () => {
    void Promise.allSettled([
        loadAreaList(),
        loadAreaDetail(),
    ])
}

if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(preloadAreaRoutes, {
            timeout: 1500,
        })
    } else {
        window.setTimeout(preloadAreaRoutes, 300)
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

const AreaRoutes = () => {
    const routes = [
        {
            path: '/area',
            element: withDelayedFallback(<AreaList />),
        },
        {
            path: '/area/detail/:id',
            element: withDelayedFallback(<AreaDetail />),
        },
    ]

    return routes
}

export default AreaRoutes