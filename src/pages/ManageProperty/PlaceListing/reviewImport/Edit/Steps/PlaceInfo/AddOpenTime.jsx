import React, { useState } from 'react'
import { Modal, Button, DatePicker, TimePicker, Card, Row, Col } from 'antd'
export default function AddOpenTimeModal({ open, setOpen, onSave }) {
  const [selectedDays, setSelectedDays] = useState([])
  const [openTime, setOpenTime] = useState(null)
  const [closeTime, setCloseTime] = useState(null)
  const handleDayClick = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleOk = () => {
    if (selectedDays.length === 0 || !openTime || !closeTime) return

    onSave?.({
      days: selectedDays,
      openTime,
      closeTime,
    })

    setSelectedDays([])
    setOpenTime(null)
    setCloseTime(null)
    setOpen(false)
  }

  return (
    <Modal
      title='Add Open Time'
      open={open}
      onOk={handleOk}
      onCancel={() => setOpen(false)}
      okText='Save'
      cancelText='Cancel'
    >
      {/* Select Days */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
            const isSelected = selectedDays.includes(day)
            return (
              <Button
                key={day}
                type={isSelected ? 'primary' : 'default'}
                onClick={() => handleDayClick(day)}
              >
                {day}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Time Pickers */}
      <Card>
        <Row gutter={16}>
          <Col span={12}>
            <TimePicker
              style={{ width: '100%' }}
              format='HH:mm A'
              value={openTime}
              onChange={setOpenTime}
              placeholder='Open Time'
            />
          </Col>
          <Col span={12}>
            <TimePicker
              style={{ width: '100%' }}
              format='HH:mm A'
              value={closeTime}
              onChange={setCloseTime}
              placeholder='Close Time'
            />
          </Col>
        </Row>
      </Card>
    </Modal>
  )
}
