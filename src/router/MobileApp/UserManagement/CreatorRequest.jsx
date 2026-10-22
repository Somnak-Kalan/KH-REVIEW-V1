import React, { Suspense, useEffect, useState } from 'react'
import { Spin } from 'antd'

// Keep import function outside the component.
const loadCreatorRequest = () =>
    import(
        '../../../pages/MobileApp/UserManagement/creator-request/CreatorRequestPage'
    )

// Keep React.lazy() for code splitting.
const CreatorRequest = React.lazy(loadCreatorRequest)

const preloadCreatorRequestRoute = () => {
    void loadCreatorRequest()
}

if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(preloadCreatorRequestRoute, {
            timeout: 1500,
        })
    } else {
        window.setTimeout(preloadCreatorRequestRoute, 300)
    }
}

// Do not display a loader immediately.
// Fast lazy imports finish before the spinner appears.
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

const WebAndMobileAppUserRequest = () => {
    const routes = [
        {
            path: '/creator-request',
            element: (
                <Suspense fallback={<DelayedRouteFallback />}>
                    <CreatorRequest />
                </Suspense>
            ),
        },
    ]

    return routes
}

export default WebAndMobileAppUserRequest