// PhoneNumberCollapse.jsx
import React, { useState } from 'react'
import { Form, Input, Row, Col, Collapse } from 'antd'
import { RightOutlined } from '@ant-design/icons'

const { useWatch } = Form // ↔ nicer to pull it out

const truncateText = (text, max) =>
  !text ? '' : text.length <= max ? text : text.slice(0, max) + '…'

const PhoneNumberCollapse = ({ form }) => {
  /* ------------------------------------------------------------ */
  /* watch the two fields that live **inside the same form**       */
  /* ------------------------------------------------------------ */
  const phone1 = useWatch('phone1', form)
  const phone2 = useWatch('phone2', form)
  const [open, setOpen] = useState(false)

  /* header ------------------------------------------------------ */
  const headerText = truncateText(
    phone1 || phone2
      ? `Phone Number${phone2 ? 's' : ''}: ${[phone1, phone2].filter(Boolean).join(', ')}`
      : 'Add Phone Number',
    35
  )

  const Header = ({ active }) => (
    <div style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
      <div
        style={{
          flex: 1,
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
          overflow: 'hidden',
          wordBreak: 'break-word',
        }}
      >
        {headerText}
      </div>
      <RightOutlined rotate={active ? 90 : 0} />
    </div>
  )

  /* new `items` API -------------------------------------------- */
  const items = [
    {
      key: 'phones',
      label: <Header active={open} />,
      children: (
        <Row gutter={[8, 8]}>
          <Col xs={24} md={12}>
            <Form.Item name='phone1' style={{ margin: 0 }}>
              <Input placeholder='Enter Phone Number 1(e.g. 0123456789)' />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name='phone2' style={{ margin: 0 }}>
              <Input placeholder='Enter Phone Number 2(e.g. 0123456789/0123456789/0123456789' />
            </Form.Item>
          </Col>
        </Row>
      ),
    },
  ]

  return (
    <Collapse
      bordered={false}
      items={items}
      activeKey={open ? ['phones'] : []}
      expandIconPosition='end'
      expandIcon={() => null} /* hide default arrow   */
      onChange={(k) => setOpen(k.length > 0)}
      style={{
        marginTop: 0,
        width: '100%',
        background: '#fff',
        border: '1px solid #d9d9d9',
      }}
    />
  )
}

export default PhoneNumberCollapse
