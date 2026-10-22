import React, { useEffect, useState } from 'react'
import { Card, Typography, Rate, Space, Button, Divider } from 'antd'
import {
  EditOutlined,
  StarFilled,
  AppstoreOutlined,
  ApartmentOutlined,
  CaretRightOutlined,
  RightOutlined,
} from '@ant-design/icons'
import EditThumbnail from '../groupInfo/GroupUpdate/editPlaceInfo/EditThumbnail'
import ListSchedule from './ListSchedule'
import ActionStatus from './ActionStatus'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import ImageLoading from '../../../../../../components/Loading/ImageLoading'
import GoogleIcon from '../../../../../../assets/icon/google.svg'
dayjs.extend(utc)
dayjs.extend(timezone)

const { Title, Text } = Typography
const formatCount = (number) => {
  if (!number) return '0'

  const value = Number(number)

  if (value >= 1000000000) {
    const result = value / 1000000000

    return `${Number.isInteger(result) ? result : result.toFixed(1)}B`
  }

  if (value >= 1000000) {
    const result = value / 1000000

    return `${Number.isInteger(result) ? result : result.toFixed(1)}M`
  }

  if (value >= 1000) {
    const result = value / 1000

    return `${Number.isInteger(result) ? result : result.toFixed(1)}k`
  }

  return value.toString()
}
const formatTime12Hour = (time) => {
  if (!time) return ''

  const [hour, minute] = time.split(':').map(Number)

  const period = hour >= 12 ? 'PM' : 'AM'

  const formattedHour =
    hour % 12 === 0 ? 12 : hour % 12

  return `${String(formattedHour).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${period}`
}
export default function Thumbnail(props) {
  const {
    thumbnail,
    getFileByName,
    showInfoOnThumbnail,
    scheduleList,
    getBusinessProperty,
    access_token,
    businessProperty,
  } = props

  const [categories, setCategory] = useState([])
  const [openThumb, setOpenThumb] = useState(false)
  const [openSchedule, setOpenSchedule] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  const originalImage = thumbnail?.find((img) => img?.includes('original'))

  useEffect(() => {
    setImageLoading(true)
    setImageError(false)
  }, [originalImage])

  const schedule =
    scheduleList && typeof scheduleList === 'object'
      ? scheduleList
      : { is24x7: false, checkInOut: [], days: {} }


  let openTimeText = '—'


  if (schedule.is24x7) {

    openTimeText = '24/7'


  } else if (
    Array.isArray(schedule.checkInOut) &&
    schedule.checkInOut.length >= 2
  ) {

    // checkInOut priority
    const start = schedule.checkInOut[0]
    const end = schedule.checkInOut[1]

    openTimeText = `${formatTime12Hour(start)}-${formatTime12Hour(end)}`


  } else {

    // fallback to days
    const days = schedule.days || {}

    const dayKey = Object.keys(days)
      .find((day) => days[day]?.enabled)


    const interval =
      dayKey &&
      days[dayKey]?.intervals?.[0]


    if (interval) {

      openTimeText =
        `${formatTime12Hour(interval.start)}-${formatTime12Hour(interval.end)}`

    }

  }


  useEffect(() => {
    const mainLabel =
      showInfoOnThumbnail?.mainCategory?.nameKh ||
      showInfoOnThumbnail?.mainCategory?.nameEn ||
      ''

    const subCat = showInfoOnThumbnail?.subCategory
    let subLabel = ''

    if (Array.isArray(subCat)) {
      subLabel = subCat
        .map((s) => s.nameKh || s.nameEn)
        .filter(Boolean)
        .join(', ')
    } else {
      subLabel = subCat?.nameKh || subCat?.nameEn || ''
    }

    setCategory([
      {
        icon: <AppstoreOutlined />,
        label: mainLabel,
      },
      {
        icon: <ApartmentOutlined />,
        label: subLabel,
      },
    ])
  }, [showInfoOnThumbnail])

  const activitiesArr = showInfoOnThumbnail?.activity
    ? showInfoOnThumbnail.activity.map((a) => a.nameEn)
    : []

  const placesArr =
    showInfoOnThumbnail?.mainCategory?.nameEn?.trim().toLowerCase() === 'attraction' ||
      showInfoOnThumbnail?.mainCategory?.nameEn?.trim().toLowerCase() === 'activities'
      ? showInfoOnThumbnail?.typeOfPlace?.map((p) => p?.nameEn) || []
      : (showInfoOnThumbnail?.mainCategory?.nameEn?.trim().toLowerCase() !== 'accommodation' &&
        showInfoOnThumbnail?.typeOfFood?.map((p) => p?.nameEn)) ||
      []

  const allActivitiesString = activitiesArr.join(', ')
  const allPlacesString = placesArr.join(', ')

  return (
    <>
      <EditThumbnail
        thumbnail={thumbnail}
        open={openThumb}
        setOpen={setOpenThumb}
        getFileByName={getFileByName}
        _id={showInfoOnThumbnail?._id}
        getBusinessProperty={getBusinessProperty}
        access_token={access_token}
      />

      <ActionStatus
        _id={showInfoOnThumbnail?._id}
        status={showInfoOnThumbnail?.status}
        getBusinessProperty={getBusinessProperty}
        access_token={access_token}
      />

      <Card
        hoverable
        className="thumbnail-non-business"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 450,
          background: 'linear-gradient(180deg, #F6EDFF 0%, #FFFFFF 100%)',
          padding: 0,
          border: 'none',
          borderRadius: '5px',
        }}
        styles={{
          body: { flex: 1, overflowY: 'hidden', padding: 5 },
        }}
      >
        <div
          style={{
            position: 'relative',
            height: '55%',
            overflow: 'hidden',
            borderRadius: '5px',
            background: '#f5f5f5',
          }}
        >
          {imageLoading && !imageError && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                background: 'rgba(255,255,255,0.65)',
              }}
            >
              <ImageLoading overlay={false} size={80} logoSize={40} />
            </div>
          )}

          {imageError ? (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#999',
                fontSize: 14,
              }}
            >
              Image not available
            </div>
          ) : (
            <img
              src={originalImage}
              alt={showInfoOnThumbnail?.nameEn}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false)
                setImageError(true)
              }}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '5px',
                display: imageLoading ? 'none' : 'block',
              }}
            />
          )}

          <Button
            onClick={() => setOpenThumb(true)}
            size="small"
            icon={<EditOutlined />}
            style={{
              position: 'absolute',
              bottom: 8,
              left: 8,
              background: '#fff',
              color: 'blue',
              borderRadius: 4,
              fontSize: '12px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
              outline: 'none',
              border: 'none',
              zIndex: 2,
            }}
          >
            Edit Thumbnail
          </Button>
        </div>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            marginTop: '10px',
          }}
        >
          <Title
            level={5}
            style={{
              margin: 0,
              color: '#594E4E',
            }}
            ellipsis={{ rows: 2 }}
          >
            {showInfoOnThumbnail?.nameEn}
          </Title>

          <Text
            style={{
              color: '#594E4E',
              fontWeight: 500,
              fontFamily: "'Battambang', serif",
              display: 'block',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={showInfoOnThumbnail?.nameKh}
          >
            {showInfoOnThumbnail?.nameKh}
          </Text>

          {showInfoOnThumbnail?.mainCategory?.nameEn?.trim()?.toLowerCase() ===
            'accommodation' && (
              <div className="stars-row p-0 m-0">
                <Rate
                  defaultValue={showInfoOnThumbnail?.star}
                  style={{
                    fontSize: 14,
                    padding: 0,
                    margin: 0,
                    color: '#FFCC59',
                  }}
                />
              </div>
            )}

          <div className="rating-summary">

            {/* Local Rating */}
            <StarFilled
              style={{ color: '#FAB02F' }}
            />

            <span className="rating-value">
              {businessProperty?.star || 0}
            </span>


            {/* Local Rating Quantity */}
            <Text
              style={{
                color: '#1a73e8',
                fontWeight: 'bold'
              }}
            >
              {formatCount(
                businessProperty?.ratingQuantity
              )}

              <span
                style={{
                  color: '#0070FF',
                  fontWeight: 'bold',
                  marginLeft: 4
                }}
              >
                បញ្ចេញមតិ
              </span>

            </Text>
            <CaretRightOutlined
              style={{ color: '#999999' }}
            />


            <Divider type="vertical" />


            {/* Google Rating */}
            <div className="google-pill">

              <span className="mx-1">
                <img src={GoogleIcon} alt="Google" />
              </span>


              <StarFilled
                style={{
                  color: '#1976D2'
                }}
              />
              <Text
                style={{
                  marginLeft: 4,
                  color: '#1a73e8',
                  fontWeight: 'bold'
                }}
              >
                {businessProperty?.googleData?.rating || 0}

              </Text>

            </div>

          </div>
          <Space size="small" style={{ marginTop: 0, alignItems: 'center' }}>
            <Text style={{ color: '#737373', fontSize: 12 }}>
              បើកម៉ោង :
            </Text>

            <ListSchedule
              scheduleList={schedule}
              trigger={

                <span style={{ cursor: 'pointer' }}>
                  <Text strong style={{ fontSize: 12 }}>
                    {openTimeText}
                  </Text>

                  {openTimeText && (
                    <RightOutlined
                      style={{
                        color: '#999',
                        fontSize: 12
                      }}
                    />
                  )}

                </span>

              }
            />
          </Space>

          <Space
            size="middle"
            split={<Divider type="vertical" style={{ height: 16 }} />}
            style={{ marginTop: 0 }}
          >
            {categories?.map((c, i) => (
              <Space key={i}>
                <span style={{ color: '#0070FF' }}>{c.icon}</span>
                <Text
                  style={{
                    maxWidth: 100,
                    display: 'inline-block',
                    color: '#0070FF',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={c.label}
                >
                  {c.label}
                </Text>
              </Space>
            ))}
          </Space>

          <div style={{ width: '100%' }}>
            <Text
              style={{
                color: '#688EB2',
                fontSize: 12,
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={`${allPlacesString} | ${allActivitiesString}`}
            >
              {allPlacesString} | {allActivitiesString}
            </Text>
          </div>
        </div>
      </Card>
    </>
  )
}