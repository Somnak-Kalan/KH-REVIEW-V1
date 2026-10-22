
import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep import function outside the component.
const loadCreatorRequestWebView = () =>
    import('../../../webview/pages/MobileApp/CreatorRequest')

// Keep React.lazy() for code splitting.
const CreatorRequestWebView = React.lazy(loadCreatorRequestWebView)

// Optional preload function.
// Call this before opening the WebView route when needed.
export const preloadCreatorRequestWebViewRoutes = () => {
    void loadCreatorRequestWebView().catch(() => {
        // React.lazy() will try again when the route is opened.
    })
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

const CreatorRequestWebViewRoutes = () => {
    const routes = [
        {
            path: '/webview/creator-request',
            element: (
                <Suspense fallback={<DelayedRouteFallback />}>
                    <CreatorRequestWebView />
                </Suspense>
            ),
        },
    ]

    return routes
}

export default CreatorRequestWebViewRoutes