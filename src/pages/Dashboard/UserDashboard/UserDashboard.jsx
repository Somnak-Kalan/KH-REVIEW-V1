import React from 'react'
import UserActivityAndTypeComparison from './UserActivityAndTypeComparison'
import UserRegisterType from './UserRegisterType'
import { Card } from 'antd'
export default function UserDashboard() {
  return (
    <>
      <Card className='my-2'>
        <UserRegisterType />
      </Card>
      <Card className='my-2'>
        <UserActivityAndTypeComparison />
      </Card>
    </>
  )
}
