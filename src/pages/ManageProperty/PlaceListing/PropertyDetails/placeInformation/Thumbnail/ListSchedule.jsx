import React from 'react'
import { Dropdown, Button, Typography } from 'antd'
import { CalendarOutlined, RightOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import './Thumbnail.css'

dayjs.extend(utc)
dayjs.extend(timezone)

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

export default function ScheduleDropdown({ scheduleList, trigger }) {
  const days = scheduleList?.days || {}

  /* -------- Build items array for Ant-Design v5 dropdown -------- */
  const items = Object.entries(days)
    .filter(([, info]) => info.enabled && info.intervals?.length)
    .map(([dayKey, info]) => {
      const { start, end } = info.intervals[0]
      const from = formatHM(start)
      const to = formatHM(end)
      const label = dayKey.slice(0, 3).replace(/^./, (c) => c.toUpperCase())

      return {
        key: dayKey,
        label: (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              padding: '4px 12px',
            }}
          >
            <Text className='mx-3'>{label}</Text>
            <Text strong>{`${from} – ${to}`}</Text>
          </div>
        ),
      }
    })

  /* -------- Default trigger button -------- */
  const firstInfo = Object.values(days).find(
    (i) => i.enabled && i.intervals?.length
  )
  const defaultLabel = firstInfo
    ? `${formatHM(firstInfo.intervals[0].start)} – ${formatHM(
      firstInfo.intervals[0].end
    )}`
    : ''

  const defaultTrigger = (
    <Button
      type='text'
      icon={<CalendarOutlined />}
      style={{ border: 'none', padding: '0 8px' }}
    >
      {defaultLabel} <RightOutlined />
    </Button>
  )

  return (
    <div className='schedule-thumbnail-dropdown-btn'>
      {/* Ant-Design v5: use menu={{ items }} */}
      <Dropdown
        trigger={['click']}
        placement='bottomLeft'
        menu={{ items, onClick: () => { } }} // onClick optional
      >
        {trigger ?? defaultTrigger}
      </Dropdown>
    </div>
  )
}
