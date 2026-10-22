// DashboardCard.jsx
import React from 'react'
import { Row, Col, Typography, Image } from 'antd'

import { EyeOutlined, SaveOutlined, ShareAltOutlined } from '@ant-design/icons'
import ShareIcon from '../../../../../assets/icon/shareIcon.png'
import ClickIcon from '../../../../../assets/icon/ClickIcon.png'
const { Text, Title } = Typography

const stats = [
  {
    title: 'View',
    count: 1450,
    icon: <EyeOutlined style={{ fontSize: 20, color: '#fff' }} />,
    iconBg: '#627DEA',
    cardBg: '#627DEA0D',
  },
  {
    title: 'Click',
    count: 678,
    icon: (
      <Image
        src={ClickIcon}
        preview={false}
        alt='Save'
        width={20}
        height={20}
        style={{ objectFit: 'contain' }}
      />
    ),
    iconBg: '#F95AB1',
    cardBg: '#F95AB10D',
  },
  {
    title: 'Save',
    count: 580,
    icon: <SaveOutlined style={{ fontSize: 20, color: '#fff' }} />,
    iconBg: '#FB4F4F',
    cardBg: '#FB4F4F0D',
  },
  {
    title: 'Share',
    count: 870,
    icon: (
      <Image
        src={ShareIcon}
        preview={false}
        alt='Save'
        width={20}
        height={20}
        style={{ objectFit: 'contain' }}
      />
    ),
    iconBg: '#F3C11D',
    cardBg: '#F3C11D0D',
  },
]

export default function DashboardCard() {
  return (
    <Row gutter={16}>
      {stats?.map((s) => (
        <Col key={s.title} xs={24} sm={12} md={6} className='my-1'>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: s.cardBg,
              borderRadius: 8,
              padding: '5px 15px',
              height: '100%',
            }}
          >
            <div
              style={{
                background: s.iconBg,
                borderRadius: 6,
                width: 40,
                height: 40,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
              }}
            >
              {s?.title === 'Click'} {s.icon}
            </div>
            <div>
              <Text style={{ color: '#000000', fontSize: 14 }}>{s.title}</Text>
              <Title
                level={4}
                style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}
              >
                {s.count}
              </Title>
            </div>
          </div>
        </Col>
      ))}
    </Row>
  )
}
