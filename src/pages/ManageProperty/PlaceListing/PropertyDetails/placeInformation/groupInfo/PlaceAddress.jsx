// PlaceAddress.jsx
import React from 'react'
import { Row, Col, Card, Typography } from 'antd'

const { Text, Title, Paragraph } = Typography
import DisplayMaps from '../../other/DisplayMap'
export default function PlaceAddress(props) {
  const { addressInfo } = props
  // default data matching your mock
  const info = addressInfo
  const cardStyle = {
    borderRadius: 8,
    border: '1px solid #E2EFFF',
    background: '#fff',
  }
  const bodyStyle = { padding: '8px 12px' }
  const labelStyle = { fontSize: 12 }

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/*
         */}
        <Col xs={24} sm={12} md={8}>
          <Card size='small' style={cardStyle} styles={{ body: bodyStyle }}>
            <Text type='secondary' style={labelStyle}>
              Province
            </Text>
            <Paragraph level={5} style={{ margin: 0 }}>
              {info?.address?.location?.provinceKh
                ? info?.address?.location?.provinceKh + ' - '
                : ''}{' '}
              {info?.address?.location?.provinceEn}
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size='small' style={cardStyle} styles={{ body: bodyStyle }}>
            <Text type='secondary' style={labelStyle}>
              District
            </Text>
            <Paragraph level={5} style={{ margin: 0 }}>
              {info?.address?.location?.districtKh
                ? info?.address?.location?.districtKh + ' - '
                : ''}{' '}
              {info?.address?.location?.districtEn}
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size='small' style={cardStyle} styles={{ body: bodyStyle }}>
            <Text type='secondary' style={labelStyle}>
              Commune
            </Text>
            <Paragraph level={5} style={{ margin: 0 }}>
              {info?.address?.location?.communeKh
                ? info?.address?.location?.communeKh + ' - '
                : ''}{' '}
              {info?.address?.location?.communeEn}
            </Paragraph>
          </Card>
        </Col>
        {/*  */}
        {/** Address Details */}
        <Col xs={24}>
          <Card size='small' style={cardStyle} styles={{ body: bodyStyle }}>
            <Text type='secondary' style={labelStyle}>
              Address Details
            </Text>
            <Paragraph style={{ margin: '4px 0 0' }}>
              {info?.address?.addressDetails}
            </Paragraph>
          </Card>
        </Col>

        {/** Google Map Link + embed */}
        <Col xs={24}>
          <Card size='small' style={cardStyle} styles={{ body: bodyStyle }}>
            <Text type='secondary' style={labelStyle}>
              Link Google Map
            </Text>
            <Paragraph copyable style={{ margin: '4px 0', color: '#0070FF' }}>
              {info?.address?.googleMap}
            </Paragraph>
            <DisplayMaps displayGoogleMap={info?.address?.googlePlaceLink} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}
