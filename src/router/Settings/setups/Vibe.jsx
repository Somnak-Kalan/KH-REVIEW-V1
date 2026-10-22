import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep import functions outside the component.
const loadActivity = () =>
    import('../../../pages/Settings/setups/vibe/Vibe')

const loadActivityDetail = () =>
    import('../../../pages/Settings/setups/activity/detail/Detail')

// Keep React.lazy() for code splitting.
const Activity = React.lazy(loadActivity)
const ActivityDetail = React.lazy(loadActivityDetail)

// Quietly preload route files when the browser becomes idle.
// Routes remain lazy-loaded, but the files will normally be cached
// before the user opens each screen.
const preloadActivityRoutes = () => {
    void Promise.allSettled([
        loadActivity(),
        loadActivityDetail(),
    ])
}

if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(preloadActivityRoutes, {
            timeout: 1500,
        })
    } else {
        window.setTimeout(preloadActivityRoutes, 300)
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

const ActivityRoutes = () => {
    const routes = [
        {
            path: '/vibe',
            element: withDelayedFallback(<Activity />),
        },

    ]

    return routes
}

export default ActivityRoutes