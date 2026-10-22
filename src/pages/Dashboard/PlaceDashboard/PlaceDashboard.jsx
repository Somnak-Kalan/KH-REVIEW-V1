import React from 'react'
import PlaceTypeCompare from './PlaceTypeCompare'
import { Card } from 'antd'
import StatusChart from './Status'
export default function PlaceDashboard() {
  return (
    <>
      <Card className='my-2'>
        <PlaceTypeCompare />
      </Card>
      <Card className='my-2'>
        <StatusChart />
      </Card>
    </>
  )
}
