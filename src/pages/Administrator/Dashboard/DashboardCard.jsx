import React from 'react'
import { Card, Row, Col } from 'antd'

const Dashboard = (props) => {
  const { userDashboard, roleDashboard, moduleDashboard } = props

  // Compute counts based on the moment data.
  const allUsers = userDashboard?.length
  const allRoles = roleDashboard?.length
  const allModules = moduleDashboard?.length
  return (
    <Row gutter={[16, 16]} className='mb-2 mt-1'>
      <Col xs={24} sm={12} md={12} xl={8}>
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
            {/* <UserAddOutlined style={{ color: 'green', marginRight: '8px' }} /> */}
            {allUsers}
          </div>
          <div style={{ fontSize: '12px' }}>Users</div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={12} xl={8}>
        <Card
          bordered={false}
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
            {/* <CloseCircleOutlined
              style={{ color: 'gray', marginRight: '8px' }}
            /> */}
            {allRoles}
          </div>
          <div style={{ fontSize: '12px' }}>Roles </div>
        </Card>
      </Col>
      <Col xs={24} sm={12} md={12} xl={8}>
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
            {/* <ExclamationCircleOutlined
              style={{ color: 'red', marginRight: '8px' }}
            /> */}
            {allModules}
          </div>
          <div style={{ fontSize: '12px' }}>Modules</div>
        </Card>
      </Col>
    </Row>
  )
}

export default Dashboard
