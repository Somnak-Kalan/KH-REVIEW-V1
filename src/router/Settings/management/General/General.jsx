// export default GeneralRoutes
import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep import function outside the component.
const loadGeneral = () =>
    import('../../../../pages/Settings/mangement/general/General')

// Keep React.lazy() for code splitting.
const General = React.lazy(loadGeneral)

// Quietly preload the shared route file when the browser becomes idle.
// Both /general and /general/:tab use the same component,
// so the file only needs to be preloaded once.
const preloadGeneralRoutes = () => {
    void loadGeneral().catch(() => {
        // React.lazy() will try again when the route is opened.
    })
}

if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(preloadGeneralRoutes, {
            timeout: 1500,
        })
    } else {
        window.setTimeout(preloadGeneralRoutes, 300)
    }
}

// Do not show a loader immediately.
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

// Reuse the same Suspense configuration for both routes.
const withDelayedFallback = (element) => {
    return (
        <Suspense fallback={<DelayedRouteFallback />}>
            {element}
        </Suspense>
    )
}
const GeneralRoutes = () => {
    const routes = [
        {
            path: '/general',
            element: withDelayedFallback(<General />),
        },
        {
            path: '/general/:tab',
            element: withDelayedFallback(<General />),
        },
    ]

    return routes
}

export default GeneralRoutes