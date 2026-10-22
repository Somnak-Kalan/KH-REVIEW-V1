import React from 'react'
import { Modal, Form, TimePicker, Card, Input } from 'antd'

const { RangePicker: TimeRangePicker } = TimePicker

export default function PlaceInfoModalWrapper({ open, setOpen }) {
  const [form] = Form.useForm()

  const handleFinish = (values) => {
    const [start, end] = values.timeRange || []
    const payload = {
      nameKh: values.nameKh,
      nameEn: values.nameEn,
      openTime: start ? start.format('HH:mm') : '',
      closeTime: end ? end.format('HH:mm') : '',
    }
    console.log('Submitted:', payload)
    setOpen(false)
  }

  return (
    <Modal
      title='Add Keyword'
      open={open}
      onCancel={() => setOpen(false)}
      onOk={() => form.submit()}
      okText='Save'
      cancelText='Cancel'
      width={400}
    >
      <Card>
        <Form form={form} layout='vertical' onFinish={handleFinish}>
          <Form.Item
            style={{ marginBottom: '0px' }}
            name='nameKh'
            label='Name (Khmer)'
            rules={[{ required: true, message: 'Please enter Khmer name!' }]}
          >
            <Input placeholder='Enter Khmer name' />
          </Form.Item>

          <Form.Item
            style={{ marginBottom: '0px' }}
            name='nameEn'
            label='Name (English)'
            rules={[{ required: true, message: 'Please enter English name!' }]}
          >
            <Input placeholder='Enter English name' />
          </Form.Item>
        </Form>
      </Card>
    </Modal>
  )
}
