import React, { Suspense } from 'react'

const PromotionAndEvent = React.lazy(
    () => import('../../pages/Posts/banner/Banner')
)
const PromotionAndEventDetail = React.lazy(
    () => import('../../pages/Posts/banner/detail/Detail')
)

//
import Loader from '../../components/Loading/refreshloading/Loader'
//
const PromotionAndEventRoutes = () => {
    const routes = [
        {
            path: '/promotion&event',
            element: (
                <Suspense fallback={<Loader />}>
                    <PromotionAndEvent />
                </Suspense>
            ),
        },
        {
            path: '/promotion&event/detail',
            element: (
                <Suspense fallback={<Loader />}>
                    <PromotionAndEventDetail />
                </Suspense>
            ),
        },
    ]
    return routes
}

export default PromotionAndEventRoutes
