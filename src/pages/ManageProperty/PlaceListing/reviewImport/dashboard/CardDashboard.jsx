import React from 'react'
import { Card, Row, Col, Tag } from 'antd'
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  EditOutlined,
  WarningOutlined,
} from '@ant-design/icons'

const Dashboard = ({ data }) => {
  // Total count for all properties
  const allCount = data.length

  // Count Business and Non Business properties
  const businessCount = data.filter(
    (item) => item.propertyType?.toLowerCase() === 'business'
  ).length
  const nonBusinessCount = data.filter(
    (item) => item.propertyType?.toLowerCase() === 'non-business'
  ).length

  // Counts by status
  const draftCount = data.filter(
    (item) => item.status?.toLowerCase() === 'draft'
  ).length
  const activeCount = data.filter(
    (item) => item.status?.toLowerCase() === 'active'
  ).length
  const inactiveCount = data.filter(
    (item) => item.status?.toLowerCase() === 'inactive'
  ).length

  // Count Pending properties (for business and non-business)
  const businessPendingCount = data.filter(
    (item) =>
      item.propertyType?.toLowerCase() === 'business' &&
      item.status?.toLowerCase() === 'pending'
  ).length

  const nonBusinessPendingCount = data.filter(
    (item) =>
      item.propertyType?.toLowerCase() === 'non-business' &&
      item.status?.toLowerCase() === 'pending'
  ).length

  return (
    <Card>
      <Row gutter={[8, 8]} className='mb-2 mt-1'>
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            size='small'
            style={{
              textAlign: 'center',
              boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
            }}
            className='transition-transform duration-300 hover:scale-90 cursor-pointer'
          >
            <div style={{ fontSize: '12px' }}>All Property</div>

            <div
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '4px',
              }}
            >
              {allCount}
            </div>
          </Card>
        </Col>
        {/* Business Property */}
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            size='small'
            style={{
              textAlign: 'center',
              boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
            }}
            className='transition-transform duration-300 hover:scale-90 cursor-pointer'
          >
            <div style={{ fontSize: '12px' }}>Business Property</div>

            <div
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '4px',
                color: 'blue',
              }}
            >
              {businessCount}
            </div>
          </Card>
        </Col>
        {/* Non Business Property */}
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            size='small'
            style={{
              textAlign: 'center',
              boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
            }}
            className='transition-transform duration-300 hover:scale-90 cursor-pointer'
          >
            <div style={{ fontSize: '12px' }}>Non Business Property</div>

            <div
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '4px',
                color: 'purple',
              }}
            >
              {nonBusinessCount}
            </div>
          </Card>
        </Col>
        {/* Draft */}
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            size='small'
            style={{
              textAlign: 'center',
              boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
            }}
            className='transition-transform duration-300 hover:scale-90 cursor-pointer'
          >
            <div style={{ fontSize: '12px' }}>Draft</div>

            <div
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '4px',
                color: '#0E3386',
              }}
            >
              {draftCount}
            </div>
          </Card>
        </Col>
        {/* Active Property */}
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            size='small'
            style={{
              textAlign: 'center',
              boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
            }}
            className='transition-transform duration-300 hover:scale-90 cursor-pointer'
          >
            <div style={{ fontSize: '12px' }}>Active Property</div>

            <div
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '4px',
                color: '#00D100',
              }}
            >
              {activeCount}
            </div>
          </Card>
        </Col>
        {/* Inactive Property */}
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            size='small'
            style={{
              textAlign: 'center',
              boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
            }}
            className='transition-transform duration-300 hover:scale-90 cursor-pointer'
          >
            <div style={{ fontSize: '12px' }}>Inactive Property</div>

            <div
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '4px',
                color: '#800020',
              }}
            >
              {inactiveCount}
            </div>
          </Card>
        </Col>
        {/* Business Pending Property */}
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            size='small'
            style={{
              textAlign: 'center',
              boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
            }}
            className='transition-transform duration-300 hover:scale-90 cursor-pointer'
          >
            <div style={{ fontSize: '12px' }}>Business Pending Property</div>

            <div
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '4px',
                color: '#E49B0F',
              }}
            >
              {businessPendingCount}
            </div>
          </Card>
        </Col>
        {/* Non Business Pending Property */}
        <Col xs={24} sm={12} md={6}>
          <Card
            bordered={false}
            size='small'
            style={{
              textAlign: 'center',
              boxShadow: 'rgba(0, 0, 0, 0.16) 0px 1px 4px',
            }}
            className='transition-transform duration-300 hover:scale-90 cursor-pointer'
          >
            <div style={{ fontSize: '12px' }}>
              Non Business Pending Property
            </div>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                marginBottom: '4px',
                color: '#E49B0F',
              }}
            >
              {nonBusinessPendingCount}
            </div>
          </Card>
        </Col>
      </Row>
    </Card>
  )
}

export default Dashboard
