// PlaceInformation.jsx
import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Typography, Tag, Space } from 'antd'
import { ClockCircleOutlined, ArrowRightOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import ScheduleList from './ScheduleList'
const { Text, Paragraph } = Typography

export default function PlaceInformation(props) {
  //
  //
  const { information } = props
  const [info, setInfo] = useState()
  const [checkIn, setCheckIn] = useState()
  const [checkOut, setCheckout] = useState()
  const [keywords, setKeywords] = useState([])
  const [is24x7, setIs24x7] = useState(false)
  //


  //
  useEffect(() => {
    setInfo(information)
    setKeywords(information?.keyword)
  }, [information])

  useEffect(() => {
    const is24 = Boolean(information?.schedule?.is24x7)
    setIs24x7(is24)

    if (is24) {
      setCheckIn('')
      setCheckout('')
      return
    }

    const [inRaw, outRaw] = information?.schedule?.checkInOut || []

    const inTime = inRaw ? dayjs(inRaw, 'HH:mm', true) : null
    const outTime = outRaw ? dayjs(outRaw, 'HH:mm', true) : null

    setCheckIn(inTime?.isValid() ? inTime.format('hh:mm A') : '')
    setCheckout(outTime?.isValid() ? outTime.format('hh:mm A') : '')
  }, [information])


  const cardStyle = {
    borderRadius: 8,
    border: '1px solid #E2EFFF',
    background: '#fff',
  }
  const labelStyle = { fontSize: 12 }
  const getNameByLanguage = (
    names = [],
    language
  ) => {
    if (!Array.isArray(names)) {
      return ''
    }
    return (
      names.find(
        (item) => {
          return (
            item?.lang ===
            language
          )
        }
      )?.value?.trim() || ''
    )
  }

  const getKeywordLabel = (
    keyword = {}
  ) => {
    const nameEn =
      keyword?.nameEn ||
      getNameByLanguage(
        keyword?.names,
        'en'
      )

    const nameKh =
      keyword?.nameKh ||
      getNameByLanguage(
        keyword?.names,
        'kh'
      )

    if (
      nameKh &&
      nameEn
    ) {
      return `${nameKh} – ${nameEn}`
    }

    return (
      nameKh ||
      nameEn ||
      '-'
    )
  }
  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* Top row */}
        <Col xs={24} sm={12} md={8}>
          <Card size='small' style={cardStyle}>
            <Text type='secondary' style={labelStyle}>
              Place ID
            </Text>
            <Paragraph level={5} style={{ margin: 0 }}>
              {info?.placeId}
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size='small' style={cardStyle}>
            <Text type='secondary'>Place Name Khmer</Text>
            <Paragraph level={5} style={{ margin: 0 }}>
              {info?.nameKh}
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size='small' style={cardStyle}>
            <Text type='secondary'>Place Name English</Text>
            <Paragraph level={5} style={{ margin: 0 }}>
              {info?.nameEn}
            </Paragraph>
          </Card>
        </Col>
        {/* Second row */}
        <Col xs={24} sm={12} md={8}>
          <Card size='small' style={cardStyle}>
            <Text type='secondary'>Ownership</Text>
            <Paragraph level={5} style={{ margin: 0 }}>
              {info?.ownership}
            </Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size='small' style={cardStyle}>
            <Text type='secondary'>Phone Number</Text>
            <Paragraph level={5} style={{ margin: 0 }}>
              {info?.phone1} {info?.phone2 ? '-' + info?.phone2 : ''}
            </Paragraph>
          </Card>
        </Col>
        {/* {info?.belong_to?.trim()?.toLowerCase() !== 'admin' ||
          (!info?.belong_to?.trim()?.toLowerCase() && ( */}
        <Col xs={24} sm={12} md={8}>
          <Card size='small' style={cardStyle}>
            <Text type='secondary'>Belong To</Text>
            <Paragraph level={5} style={{ margin: 0 }}>
              {info?.belong_to?.trim()?.toLowerCase() !== 'admin' &&
                info?.belong_to}
            </Paragraph>
          </Card>
        </Col>
        {/* ))} */}

        <Col xs={24} sm={12}>
          <Card size='small' style={cardStyle}>
            <Text type='secondary'>Main Category</Text>
            <div style={{ marginTop: 4 }}>
              <Tag color='blue' style={{ border: 'none', fontWeight: 'bold' }}>
                {info?.mainCategory?.nameKh
                  ? info?.mainCategory?.nameKh + ' - '
                  : ''}
                {info?.mainCategory?.nameEn}
              </Tag>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card size='small' style={cardStyle}>
            <Text type='secondary'>Sub Category</Text>
            <div style={{ marginTop: 4 }}>
              {Array.isArray(info?.subCategory)
                ? info?.subCategory.map((subCat, i) => (
                  <Tag
                    key={`${subCat?.nameEn}-${i}`}
                    color='blue'
                    style={{
                      marginBottom: 4,
                      border: 'none',
                      color: '#00B2FF',
                      fontWeight: 'bold',
                    }}
                  >
                    {subCat?.nameKh ? subCat?.nameKh + ' - ' : ''}{' '}
                    {subCat?.nameEn ? subCat?.nameEn : ''}
                  </Tag>
                ))
                : []}
            </div>
          </Card>
        </Col>
        {/* Star and Check-in/out */}
        {info?.mainCategory?.nameEn?.trim()?.toLowerCase() ===
          'accommodation' && (
            <Col xs={24} sm={12}>
              <Card size='small' style={cardStyle}>
                <Text type='secondary'>Star</Text>
                <Paragraph level={5} style={{ margin: 0 }}>
                  {info?.star}
                </Paragraph>
              </Card>
            </Col>
          )}
        {info?.mainCategory?.nameEn?.trim()?.toLowerCase() ===
          'accommodation' && is24x7 === false && (
            <Col xs={24} sm={12}>
              <Card size='small' style={cardStyle} styles={{ body: { padding: '0px' } }}>
                <Text
                  type='secondary'
                  style={{ fontSize: 12, margin: 0, padding: 0 }}
                >
                  Check-in / Check-out
                </Text>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: '1px solid #E6EBF1',
                    borderRadius: 8,
                    padding: '0px 12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      color: '#333',
                      fontSize: 14,
                      padding: 0,
                    }}
                    className='w-2/3'
                  >
                    <div>{checkIn}</div>
                    <ArrowRightOutlined
                      style={{ margin: '0 8px', color: '#999', paddingTop: 8, paddingBottom: 8 }}
                    />
                    <div>{checkOut}</div>
                  </div>
                  <ClockCircleOutlined style={{ color: '#999', fontSize: 16 }} />
                </div>
              </Card>
            </Col>
          )}
        {/* Type Of Place / Food */}
        {['attraction', 'activities'].includes(
          info?.mainCategory?.nameEn?.trim()?.toLowerCase()
        ) ? (
          <Col xs={24} sm={12}>
            <Card size='small' style={cardStyle}>
              <Text type='secondary'>Type Of Place</Text>
              <div style={{ marginTop: 4 }}>
                {info?.typeOfPlace?.map((type, i) => (
                  <Tag
                    key={`${type.nameEn}-${i}`}
                    color='#00B2FF0F'
                    style={{
                      marginBottom: 4,
                      border: 'none',
                      color: '#00B2FF',
                      fontWeight: 'bold',
                    }}
                  >
                    {type?.nameKh ? type?.nameKh + ' - ' : ''} {type?.nameEn}
                  </Tag>
                ))}
              </div>
            </Card>
          </Col>
        ) : (
          info?.mainCategory?.nameEn?.trim()?.toLowerCase() !==
          'accommodation' && (
            <Col xs={24} sm={12}>
              <Card size='small' style={cardStyle}>
                <Text type='secondary'>Type Of Food</Text>
                <div style={{ marginTop: 4 }}>
                  {info?.typeOfFood?.map((type, i) => (
                    <Tag
                      key={`${type.nameEn}-${i}`}
                      color='#00B2FF0F'
                      style={{
                        marginBottom: 4,
                        border: 'none',
                        color: '#00B2FF',
                        fontWeight: 'bold',
                      }}
                    >
                      {type?.nameKh ? type?.nameKh + ' - ' : ''} {type?.nameEn}
                    </Tag>
                  ))}
                </div>
              </Card>
            </Col>
          )
        )}
        {/* Activities */}
        <Col xs={24} sm={12}>
          <Card size='small' style={cardStyle}>
            <Text type='secondary'>Vibes</Text>
            <div style={{ marginTop: 4 }}>
              {info?.vibe?.map((a, i) => (
                <Tag
                  key={`${a.id}-${i}`}
                  color='#688EB20F'
                  style={{
                    marginBottom: 4,
                    border: 'none',
                    color: '#688EB2',
                    fontWeight: 'bold',
                  }}
                >
                  {a?.nameKh} - {a?.nameEn}
                </Tag>
              ))}
            </div>
          </Card>
        </Col>
        {/* Schedule */}
        {info?.mainCategory?.nameEn?.trim()?.toLowerCase() !==
          'accommodation' && (
            <Col xs={24}>
              <ScheduleList
                scheduleData={information?.schedule}
                cardStyle={cardStyle}
              />
            </Col>
          )}
        {/* Keywords */}
        <Col
          xs={24}
          sm={12}
        >
          <Card
            size='small'
            style={
              cardStyle
            }
          >
            <Text
              type='secondary'
            >
              Keyword
            </Text>

            <div
              style={{
                marginTop:
                  4,
              }}
            >
              {Array.isArray(
                keywords
              ) &&
                keywords.length >
                0 ? (
                keywords.map(
                  (
                    keyword,
                    index
                  ) => (
                    <Tag
                      key={
                        keyword?._id ||
                        index
                      }
                      color='#2292650F'
                      style={{
                        marginBottom:
                          4,

                        border:
                          'none',

                        color:
                          '#229265',

                        fontWeight:
                          'bold',
                      }}
                    >
                      {getKeywordLabel(
                        keyword
                      )}
                    </Tag>
                  )
                )
              ) : (
                <Text
                  type='secondary'
                >
                  -
                </Text>
              )}
            </div>
          </Card>
        </Col>
        {/* Activities */}
        <Col xs={24} sm={12}>
          <Card size='small' style={cardStyle}>
            <Text type='secondary'>Activities</Text>
            <div style={{ marginTop: 4 }}>
              {info?.activity?.map((a, i) => (
                <Tag
                  key={`${a.id}-${i}`}
                  color='#688EB20F'
                  style={{
                    marginBottom: 4,
                    border: 'none',
                    color: '#688EB2',
                    fontWeight: 'bold',
                  }}
                >
                  {a?.nameKh} - {a?.nameEn}
                </Tag>
              ))}
            </div>
          </Card>
        </Col>

        {/* Reference Links */}
        <Col xs={24}>
          <Card size='small' style={cardStyle}>
            <Text type='secondary'>Reference Link</Text>
            {info?.referenceLinks?.map((re, i) => (
              <Paragraph
                key={`${re}-${i}`}
                copyable
                style={{ margin: 0, color: '#0070FF' }}
              >
                {re}
              </Paragraph>
            ))}
          </Card>
        </Col>
        {/* Social Media Links */}
        <Col xs={24}>
          <Card size='small' style={cardStyle}>
            <Text type='secondary'>Website / Social Media link</Text>
            {info?.links?.map((link, i) => (
              <Paragraph
                key={`${link}-${i}`}
                copyable
                style={{ margin: 0, color: '#0070FF' }}
              >
                {link}
              </Paragraph>
            ))}
          </Card>
        </Col>
        {/* Descriptions */}
        <Col xs={24}>
          <Card size='small' style={cardStyle}>
            <Text type='secondary'>Description Khmer</Text>
            <Paragraph style={{ margin: 0 }}>{info?.descriptionKh}</Paragraph>
          </Card>
        </Col>
        <Col xs={24}>
          <Card size='small' style={cardStyle}>
            <Text type='secondary'>Description English</Text>
            <Paragraph style={{ marginTop: 4 }}>
              {info?.descriptionEn}
            </Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
