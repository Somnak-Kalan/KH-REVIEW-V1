// Dashboard.jsx

import React from 'react'
import { Card, Row, Col } from 'antd'
import {
  AppstoreOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,

} from '@ant-design/icons'

const toNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const Dashboard = ({ summaryStatus = { active: 0, inactive: 0, expired: 0, total: 0 } }) => {

  // ---- Prefer direct keys if your API returns them ----
  const activeCount =
    summaryStatus?.active !== undefined ? toNum(summaryStatus?.active) : 0

  const inactiveCount =
    summaryStatus?.inactive !== undefined ? toNum(summaryStatus?.underReview) : 0

  const expiredCount =
    summaryStatus?.expired !== undefined ? toNum(summaryStatus?.hide) : 0

  // total: use API total if exists, otherwise sum
  const allCount =
    summaryStatus?.total !== undefined
      ? toNum(summaryStatus?.total)
      : activeCount + inactiveCount + expiredCount

  return (
    <Row gutter={[16, 16]} className="mb-2 mt-1">
      <Col xs={24} sm={12} md={6}>
        <Card
          variant="borderless"
          size="small"
          style={{ textAlign: 'center', borderLeft: '4px solid #1890FF' }}
          className="transition-transform duration-300 hover:scale-105 cursor-pointer"
        >
          <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>
            <AppstoreOutlined style={{ color: '#1890FF', marginRight: 8 }} />
            {allCount}
          </div>
          <div style={{ fontSize: 12 }}>All</div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card
          variant="borderless"
          size="small"
          style={{ textAlign: 'center', borderLeft: '4px solid #008000' }}
          className="transition-transform duration-300 hover:scale-105 cursor-pointer"
        >
          <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>
            <CheckCircleOutlined style={{ color: '#008000', marginRight: 8 }} />
            {activeCount}
          </div>
          <div style={{ fontSize: 12 }}>Active</div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card
          variant="borderless"
          size="small"
          style={{ textAlign: 'center', borderLeft: '4px solid #E8C504' }}
          className="transition-transform duration-300 hover:scale-105 cursor-pointer"
        >
          <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>
            <ClockCircleOutlined style={{ color: '#E8C504', marginRight: 8 }} />
            {inactiveCount}
          </div>
          <div style={{ fontSize: 12 }}>Under Review</div>
        </Card>
      </Col>

      <Col xs={24} sm={12} md={6}>
        <Card
          variant="borderless"
          size="small"
          style={{ textAlign: 'center', borderLeft: '4px solid #AD3838' }}
          className="transition-transform duration-300 hover:scale-105 cursor-pointer"
        >
          <div style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>
            <CloseCircleOutlined style={{ color: '#AD3838', marginRight: 8 }} />
            {expiredCount}
          </div>
          <div style={{ fontSize: 12 }}>Hide</div>
        </Card>
      </Col>
    </Row>
  )
}

export default Dashboard
