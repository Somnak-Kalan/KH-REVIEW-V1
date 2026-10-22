
import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep import function outside the component.
const loadThemeManagement = () =>
    import('../../../../pages/Settings/mangement/themeManagement/ThemeManagement')

// Keep React.lazy() for code splitting.
const ThemeManagement = React.lazy(loadThemeManagement)

const preloadThemeManagementRoutes = () => {
    void loadThemeManagement().catch(() => {
        // React.lazy() will try again when the route is opened.
    })
}

if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(preloadThemeManagementRoutes, {
            timeout: 1500,
        })
    } else {
        window.setTimeout(preloadThemeManagementRoutes, 300)
    }
}

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

const ThemeManagementRoutes = () => {
    const routes = [
        {
            path: '/theme',
            element: withDelayedFallback(<ThemeManagement />),
        },
        {
            path: '/theme/:tab',
            element: withDelayedFallback(<ThemeManagement />),
        },
    ]

    return routes
}

export default ThemeManagementRoutes