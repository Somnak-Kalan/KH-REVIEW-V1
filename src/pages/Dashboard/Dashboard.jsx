import React, { useState, useEffect, useContext } from 'react'
import { useOutletContext, useNavigate } from 'react-router-dom'
import { Card, Breadcrumb, Tabs } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import { AuthContext } from '../../contexts/AuthContext'
import { NotifyContext } from '../../contexts/NotifyContext'
import CardDashboard from './CardDashboard'
import { useContent } from '../../contexts/ContentContext'
import UserDashboard from './UserDashboard/UserDashboard'
import PlaceDashboard from './PlaceDashboard/PlaceDashboard'
import { PERMS } from '../../constants/permission/perms'

// Inline style objects for smaller cards
const smallCardStyle = {
  padding: '12px',
  margin: '8px',
}
const smallCardBodyStyle = {
  padding: '12px',
}

const Dashboard = () => {
  const { setDisplayEmitContent } = useOutletContext()
  const { setContent } = useContent()
  const { collapsed } = useOutletContext()
  const { setCount } = useContext(NotifyContext)
  const navigate = useNavigate()
  const { username, access_token, checkPermission } = useContext(AuthContext)

  const hasPermission = checkPermission(PERMS.DASHBOARD_SYSTEM)
  useEffect(() => {
    if (!access_token) {
      if (!hasPermission) {
        navigate('/403', { replace: true })
      }
    }
  }, [hasPermission, navigate])

  const [periodData, setPeriodData] = useState([])
  const [activeKey, setActiveKey] = useState('1')

  useEffect(() => {
    document.title = 'Dashboard'
  }, [])

  useEffect(() => {
    setPeriodData([
      {
        name: 'Series A',
        data: [44, 55, 41, 67, 22, 43, 36, 52, 24, 18, 36, 48],
      },
      {
        name: 'Series B',
        data: [13, 23, 20, 8, 13, 27, 18, 22, 10, 16, 24, 22],
      },
      {
        name: 'Series C',
        data: [11, 17, 15, 15, 21, 14, 11, 18, 17, 12, 20, 18],
      },
    ])
  }, [])

  useEffect(() => {
    setDisplayEmitContent(
      <div className='flex justify-between my-3'>
        <div>Dashboard</div>
        <Breadcrumb
          items={[
            { title: <HomeOutlined style={{ cursor: 'pointer' }} /> },
            {
              title: (
                <span className='text-gray-600 font-medium'>dashboard</span>
              ),
            },
          ]}
        />
      </div>
    )
  }, [navigate, setDisplayEmitContent])

  const tabItems = [
    { key: '1', label: 'User Dashboard', children: <UserDashboard /> },
    { key: '2', label: 'Place Dashboard', children: <PlaceDashboard /> },
  ]

  const handleTabChange = (activeKey) => {
    setActiveKey(activeKey)
  }

  //  Prevent rendering before permission is confirmed
  // if (!hasPermission) return null

  return (
    <div className='overflow-hidden'>
      <CardDashboard
        access_token={access_token}
        style={smallCardStyle}
        styles={{ body: smallCardBodyStyle }}
      />
      {/* <Tabs
        defaultActiveKey='1'
        style={{ marginTop: '16px', width: '100%' }}
        items={tabItems}
        onChange={handleTabChange}
        tabBarStyle={{
          background: 'white',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgb(230, 224, 224)',
        }}
      /> */}
    </div>
  )
}

export default Dashboard
