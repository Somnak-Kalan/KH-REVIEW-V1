
import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep import function outside the component.
const loadHashTags = () =>
    import('../../pages/setups/hashtags/Hashtags')

// Keep React.lazy() for code splitting.
const HashTags = React.lazy(loadHashTags)

// Optional preload function.
// Call this when the user hovers over the Hashtags sidebar menu.
export const preloadHashtagsRoutes = () => {
    void loadHashTags().catch(() => {
        // React.lazy() will try again when the route is opened.
    })
}

// Do not show a spinner immediately.
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

const HashtagsRoutes = () => {
    const routes = [
        {
            path: '/hashtags',
            element: (
                <Suspense fallback={<DelayedRouteFallback />}>
                    <HashTags />
                </Suspense>
            ),
        },
    ]

    return routes
}

export default HashtagsRoutes