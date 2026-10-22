import React from 'react'
import { Card, Row, Col } from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

const Dashboard = ({ data }) => {
  // Compute counts based on the moment data.
  const activeCount = data.filter(
    (item) => item.status.toLowerCase() === 'active'
  ).length
  const inactiveCount = data.filter(
    (item) => item.status.toLowerCase() === 'inactive'
  ).length
  const expiredCount = data.filter(
    (item) => item.status.toLowerCase() === 'expired'
  ).length
  const allCount = data.length

  return (
    <Row gutter={[16, 16]} className='mb-2 mt-1'>
      <Col xs={24} sm={12} md={6}>
        <Card
          variant="borderless"
          size='small'
          style={{
            textAlign: 'center',
            borderLeft: '4px solid blue',
          }}
          className='transition-transform duration-300 hover:scale-105 cursor-pointer'
        >
          <div
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '4px',
            }}
          >
            <AppstoreOutlined style={{ color: 'blue', marginRight: '8px' }} />
            {allCount}
          </div>
          <div style={{ fontSize: '12px' }}>All </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card
          variant="borderless"
          size='small'
          style={{
            textAlign: 'center',
            borderLeft: '4px solid green',
          }}
          className='transition-transform duration-300 hover:scale-105 cursor-pointer'
        >
          <div
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '4px',
            }}
          >
            <CheckCircleOutlined
              style={{ color: 'green', marginRight: '8px' }}
            />
            {activeCount}
          </div>
          <div style={{ fontSize: '12px' }}>Active </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card
          variant="borderless"
          size='small'
          style={{
            textAlign: 'center',
            borderLeft: '4px solid gray',
          }}
          className='transition-transform duration-300 hover:scale-105 cursor-pointer'
        >
          <div
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '4px',
            }}
          >
            <CloseCircleOutlined
              style={{ color: 'gray', marginRight: '8px' }}
            />
            {inactiveCount}
          </div>
          <div style={{ fontSize: '12px' }}>Inactive </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card
          variant="borderless"
          size='small'
          style={{
            textAlign: 'center',
            borderLeft: '4px solid red',
          }}
          className='transition-transform duration-300 hover:scale-105 cursor-pointer'
        >
          <div
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '4px',
            }}
          >
            <ExclamationCircleOutlined
              style={{ color: 'red', marginRight: '8px' }}
            />
            {expiredCount}
          </div>
          <div style={{ fontSize: '12px' }}>Expired </div>
        </Card>
      </Col>
    </Row>
  )
}

export default Dashboard
