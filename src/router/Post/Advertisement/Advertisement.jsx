import React, { Suspense } from 'react'

const AdsAsMoment = React.lazy(
    () => import('../../../pages/Posts/advertisement/adsAsMoment/AdsAsMomentList')
)
const AdsAsmomentDetail = React.lazy(
    () => import('../../../pages/Posts/advertisement/adsAsMoment/detail/Detail')
)
// ads popup
const AdsAsPopup = React.lazy(
    () => import('../../../pages/Posts/advertisement/adsPopup/AdsAsPopupList')
)

//
import Loader from '../../../components/Loading/refreshloading/Loader'
//
const AdvertisementRoutes = () => {
    const routes = [
        {
            path: '/ads-moment',
            element: (
                <Suspense fallback={<Loader />}>
                    <AdsAsMoment />
                </Suspense>
            ),
        },
        {
            path: '/ads-moment/:id',
            element: (
                <Suspense fallback={<Loader />}>
                    <AdsAsmomentDetail />
                </Suspense>
            ),
        },
        // ads popup path
        {
            path: '/ads-popup',
            element: (
                <Suspense fallback={<Loader />}>
                    <AdsAsPopup />
                </Suspense>
            ),
        },
        // end ads popup path
    ]
    return routes
}

export default AdvertisementRoutes
