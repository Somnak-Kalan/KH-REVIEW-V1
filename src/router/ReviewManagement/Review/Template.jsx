import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep import functions outside the component.
const loadingTemplate = () =>
    import('../../../pages/ReviewManagement/ReviewTemplate/ReviewTemplateList')

// Keep React.lazy() for code splitting.
const ReviewTemplagePage = React.lazy(loadingTemplate)
const preloadAllReviewRoutes = () => {
    void Promise.allSettled([
        loadingTemplate(),

    ])
}
if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(preloadAllReviewRoutes, {
            timeout: 1500,
        })
    } else {
        window.setTimeout(preloadAllReviewRoutes, 300)
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

const ReviewTemplateRoutes = () => {
    const routes = [
        {
            path: '/reviewTemplate',
            element: withDelayedFallback(<ReviewTemplagePage />),
        },


    ]

    return routes
}

export default ReviewTemplateRoutes