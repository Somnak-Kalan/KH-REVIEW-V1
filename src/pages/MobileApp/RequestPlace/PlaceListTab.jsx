import React, { useState, Suspense, lazy, useEffect, useContext } from 'react'
import { Card, Col, Row, Tabs, Layout, Button, Breadcrumb } from 'antd'
import {
  DashboardOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { Content } from 'antd/es/layout/layout'
import RequestExistingPlace from './ExistingPlace/ExistingList'
import IntroduceNewPlace from './IntroducePlace/IntroduceList'
import { useNavigate, useOutletContext } from 'react-router-dom'
import Search from './Search'
import Dashboard from './dasboard/Dashboard'
import { PERMS } from '../../../constants/permission/perms'
import { AuthContext } from '../../../contexts/AuthContext'
const NewPlace = () => {
  const { access_token, checkPermission } = useContext(AuthContext)

  const { collapsed, setDisplayEmitContent } = useOutletContext()
  const navigate = useNavigate()

  const [selectedTab, setSelectedTab] = useState('1')
  const [personalRequest, setPersonalRequest] = useState(false)
  const [introduceRequest, setIntroduceRequest] = useState(false)
  const [data, setData] = useState([])
  const renderContent = () => {
    switch (selectedTab) {
      case '1':
        return (
          <RequestExistingPlace
            open={personalRequest}
            setOpen={setPersonalRequest}
          />
        )
      case '2':
        return (
          <IntroduceNewPlace
            open={introduceRequest}
            setOpen={setIntroduceRequest}
          />
        )
      case '3':
        return <Dashboard data={data} />
      default:
        return <div>Select a tab to view content</div>
    }
  }

  const tabItems = [
    {
      key: '1',
      label: (
        <>
          <EnvironmentOutlined /> Request Existing Places
        </>
      ),
    },
    {
      key: '2',
      label: (
        <>
          <PlusOutlined /> Introduce New Place
        </>
      ),
    },
    {
      key: '3',
      label: (
        <>
          <div className='space-x-1'>
            <span>
              <DashboardOutlined />
            </span>
            <span>Dashboard</span>
          </div>
        </>
      ),
    },
  ]

  const handleTabChange = (key) => {
    setSelectedTab(key)
  }
  useEffect(() => {
    setDisplayEmitContent(
      <div className='flex justify-between my-2'>
        <div className='font-semibold' style={{ color: '#495057' }}>
          Request List Place
        </div>
        <Breadcrumb
          items={[
            {
              title: <HomeOutlined style={{ cursor: 'pointer' }} />,
            },
            {
              title: 'New Place',
            },
          ]}
        />
      </div>
    )
  }, [navigate])
  return (
    <div>
      <Card className='mb-2 p-1'>
        {/* Tabs Navigation */}
        <Tabs
          onChange={handleTabChange}
          defaultActiveKey='1'
          items={tabItems}
          tabBarExtraContent={
            checkPermission(PERMS.ASSIGNED_USER) ? (
              <Button
                hidden={selectedTab === '3'}
                onClick={() =>
                  selectedTab === '1'
                    ? setPersonalRequest(true)
                    : selectedTab === '2'
                      ? setIntroduceRequest(true)
                      : ''
                }
                type='primary'
              >
                Add
              </Button>
            ) : (
              ''
            )
          }
        />
      </Card>

      <div
        hidden={selectedTab === '3'}
        className='mb-2'
        style={{
          borderRadius: '5px',
          background: 'white',
        }}
      >
        <div className='mb-2 px-5  py-4 bg-white shadow-lg rounded-lg border-l-4 border-blue-500'>
          <div className='sm:flex justify-between items-center'>
            {/* Search field container */}
            <div className='w-full md:w-full 2xl:w-5/6 sm:mx-1 md:mx-0'>
              <Search />
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <Row gutter={16}>
        <Col xs={24}>
          <Layout>
            <Content
              style={{
                // background: '#fff',
                borderRadius: '4px',
                // padding: '20px',
              }}
            >
              <Suspense fallback={<div>Loading content...</div>}>
                {renderContent()}
              </Suspense>
            </Content>
          </Layout>
        </Col>
      </Row>
    </div>
  )
}

export default NewPlace
