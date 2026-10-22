import React, { Suspense } from 'react'

// filter-copy-id
const FilterCopyProvince = React.lazy(
  () => import('../../pages/setups/other/FilterCopyProvinceId/Steps')
)

import Loader from '../../components/Loading/refreshloading/Loader'
const FilterCopyIdRoutes = () => {
  const routes = [
    {
      path: '/filter-copy-address',
      element: (
        <Suspense fallback={<Loader />}>
          <FilterCopyProvince />
        </Suspense>
      ),
    },
  ]
  return routes
}

export default FilterCopyIdRoutes
