import React, { useContext, useEffect } from 'react'
import { Breadcrumb, Tabs } from 'antd'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { HomeOutlined } from '@ant-design/icons'
import Address from './copys/Address'
import { PERMS } from '../../../../constants/permission/perms'
import { AuthContext } from '../../../../contexts/AuthContext'
export default function TabsPage() {
  const handleTabChange = (activeKey) => {
    console.log('Active tab:', activeKey)
  }
  const { access_token, checkPermission } = useContext(AuthContext)

  const { setDisplayEmitContent } = useOutletContext()
  const navigate = useNavigate()
  //CHECK PERMISSION
  useEffect(() => {
    if (!checkPermission(PERMS.FILTER_COPY_ADDRESS)) {
      navigate('/', { replace: true })
    }
  }, [checkPermission, navigate])
  if (!checkPermission(PERMS.FILTER_COPY_ADDRESS)) {
    return null
  }
  //END CHECK PERMISSION
  // Each tab is defined as an object in the items array
  const tabItems = [
    {
      label: 'Address',
      key: '1',
      children: (
        <div>
          <Address />
        </div>
      ),
    },
  ]
  useEffect(() => {
    setDisplayEmitContent(
      <div className='flex justify-between my-3'>
        <div className=' flex'>
          <Breadcrumb
            items={[
              { title: <HomeOutlined style={{ cursor: 'pointer' }} /> },
              { title: <span>Setting</span> },
              { title: <span>Filter Copy</span> },
            ]}
          />
        </div>
      </div>
    )
  }, [navigate])

  return (
    <div style={{ padding: 0 }}>
      <Tabs
        tabBarStyle={{
          backgroundColor: 'white',

          paddingTop: '10px',
          paddingBottom: '10px',
          paddingLeft: '25px',
          paddingRight: '25px',
          borderRadius: '8px',
          marginBottom: '4px',
        }}
        defaultActiveKey='1'
        onChange={handleTabChange}
        items={tabItems}
      />
    </div>
  )
}
