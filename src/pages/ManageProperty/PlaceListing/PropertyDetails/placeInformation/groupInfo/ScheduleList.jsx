// OpenTime.jsx
import React from 'react'
import { Card, Row, Col, Typography } from 'antd'
import { ClockCircleOutlined, ArrowRightOutlined } from '@ant-design/icons'

const { Text } = Typography
function formatHM(isoOrHM) {
  if (!isoOrHM) return ''

  // Handle "HH:mm" strings
  if (/^\d{2}:\d{2}$/.test(isoOrHM)) {
    const [hourStr, minuteStr] = isoOrHM.split(':')
    let hour = parseInt(hourStr, 10)
    const minute = parseInt(minuteStr, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    if (hour === 0) hour = 12
    else if (hour > 12) hour -= 12
    return `${hour.toString().padStart(2, '0')}:${minuteStr} ${ampm}`
  }

  // Handle ISO strings
  const dt = new Date(isoOrHM)
  if (isNaN(dt.getTime())) return ''
  return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
}

// full day names ordered Mon→Sun
const DAY_ORDER = [
  { key: 'Mon', label: 'Monday' },
  { key: 'Tue', label: 'Tuesday' },
  { key: 'Wed', label: 'Wednesday' },
  { key: 'Thu', label: 'Thursday' },
  { key: 'Fri', label: 'Friday' },
  { key: 'Sat', label: 'Saturday' },
  { key: 'Sun', label: 'Sunday' },
]

export default function OpenTime({ scheduleData, cardStyle }) {

  const { days, is24x7 } = scheduleData || {}

  // split into two columns
  const left = DAY_ORDER.filter((_, i) => i % 2 === 0)
  const right = DAY_ORDER.filter((_, i) => i % 2 === 1)

  const renderDay = ({ key, label }) => {
    if (is24x7) {
      return (
        <div key={key} className='flex items-center mb-2'>
          <Text style={{ width: 90 }}>{label}</Text>
          <Text>24 × 7</Text>
        </div>
      )
    }

    const info = days?.[key]
    const enabled = info?.enabled
    const intervals = info?.intervals || []

    if (!enabled || intervals.length === 0) {
      return (
        <div key={key} className='flex items-center mb-2'>
          <Text style={{ width: 90 }}>{label}</Text>
          <Text type='danger'>Closed</Text>
        </div>
      )
    }

    const { start, end } = intervals[0]

    return (
      <div key={key} className=' block md:flex items-center mb-2 xl:mx-8'>
        <Text style={{ width: 100, fontWeight: 400, color: '#1E1E1E' }}>
          {label}
        </Text>
        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid #E2EFFF',
            borderRadius: 8,
            padding: '4px 12px ',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#333',
              fontSize: 14,
            }}
            className='xl:w-1/2'
          >
            <div>{formatHM(start)}</div>
            <ArrowRightOutlined style={{ margin: '0 8px', color: '#999' }} />
            <div>{formatHM(end)}</div>
          </div>
          <ClockCircleOutlined style={{ color: '#999', fontSize: 16 }} />
        </div>
      </div>
    )
  }

  return (
    <Card
      style={cardStyle}
      styles={{
        header: { borderBottom: 'none' },
        body: { padding: 16 },
      }}
    >
      <Text style={{ fontWeight: 'normal', color: '#635959', padding: '0px' }}>
        Open Time
      </Text>
      <Row>
        <Col xs={24} md={12}>
          {left.map(renderDay)}
        </Col>
        <Col xs={24} md={12}>
          {right.map(renderDay)}
        </Col>
      </Row>
    </Card>
  )
}
