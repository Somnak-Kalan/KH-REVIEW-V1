import React, { useState, useMemo, useEffect } from 'react'
import { Form, Row, Col, Switch, TimePicker, Input, Checkbox } from 'antd'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

const { RangePicker: TimeRangePicker } = TimePicker
const safeTime = (value) => {
  if (!value) return null
  const d = dayjs(value, ['h:mm A', 'HH:mm'], true)
  return d.isValid() ? d : null
}

import AddOpenTimeModal from './AddOpenTime'
import { PlusOutlined } from '@ant-design/icons'

export default function Schedule(props) {
  const { keyCat, openDays, form, savedSchedule, openTimes } = props

  const [checkInOutRange, setCheckInOutRange] = useState([])
  const [openTime, setOpenTime] = useState(false)
  const [is24x7, setIs24x7] = useState(false)
  const [checkIn, setCheckIn] = useState()
  const [checkOut, setCheckOut] = useState()
  /* helpers */
  const toDayjs = (str) => {
    if (!str) return null
    const formats = ['HH:mm', 'H:mm', 'HH:mm:ss', 'h:mm A', 'h:mmA']
    for (const fmt of formats) {
      const d = dayjs(str, fmt, true)
      if (d.isValid()) return d
    }
    const iso = dayjs(str)
    return iso.isValid() ? iso : null
  }
  const toDayjsSafe = (value, fallback) => {
    if (!value) return fallback
    const d = dayjs(value, ['h:mmA', 'HH:mm'], true)
    return d.isValid() ? d : fallback
  }

  const makeDefaultInterval = () => [
    toDayjsSafe(openTimes?.[0], dayjs('08:00', 'HH:mm')),
    toDayjsSafe(openTimes?.[1], dayjs('17:00', 'HH:mm')),
  ]


  const [addOpenTimes, setAddOpenTime] = useState([])
  const DAY_ORDER = addOpenTimes.length
    ? addOpenTimes
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const daysToShow = useMemo(() => {
    if (!openDays || typeof openDays !== 'string') return DAY_ORDER
    const [start, end] = openDays.split('-').map((p) => p.trim())
    const s = DAY_ORDER.indexOf(start),
      e = DAY_ORDER.indexOf(end)
    if (s >= 0 && e >= 0) {
      return s <= e
        ? DAY_ORDER.slice(s, e + 1)
        : [...DAY_ORDER.slice(s), ...DAY_ORDER.slice(0, e + 1)]
    }
    return DAY_ORDER
  }, [openDays, addOpenTimes])

  const [defaultOpenTime, setDefaultCloseTime] = useState([])

  const initialSchedule = useMemo(() => {

    const [dOpen, dClose] =
      defaultOpenTime.length === 2 ? defaultOpenTime : makeDefaultInterval()
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].reduce(
      (acc, day) => {
        acc[day] = {
          enabled: daysToShow.includes(day),
          intervals: [{ start: dOpen, end: dClose }],

        }
        return acc
      },
      {}
    )
  }, [daysToShow, defaultOpenTime])

  const [schedule, setSchedule] = useState(initialSchedule)
  useEffect(() => {
    setSchedule(initialSchedule)
  }, [initialSchedule])
  useEffect(() => {
    const is24x7 = form.getFieldValue('is24x7')
    setIs24x7(is24x7)

  }, [form, openTimes])
  const ABBR_TO_DAY = {
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
    Sun: 'Sunday',
  }
  //formate save 
  useEffect(() => {
    const serializedSchedule = Object.entries(schedule).reduce((acc, [day, data]) => {

      acc[day] = {
        ...data,
        intervals: data.intervals.map(({ start, end }) => ({
          start: start ? start.format('HH:mm') : null,
          end: end ? end.format('HH:mm') : null,
        })),
      }
      return acc
    }, {})

    form.setFieldsValue({
      schedule: {
        is24x7,
        days: serializedSchedule,
        checkInOut: [dayjs(form.getFieldValue('checkIn')).format('HH:mm'), dayjs(form.getFieldValue('checkOut')).format('HH:mm')],
      },
    })
  }, [is24x7, schedule, checkInOutRange, form])

  // hydrate from savedSchedule, converting openTime/closeTime → start/end
  useEffect(() => {
    if (!savedSchedule) return
    setIs24x7(Boolean(savedSchedule.is24x7))
    console.log(savedSchedule, 'savedSchedule');

    const transformed = Object.entries(savedSchedule.days).reduce(
      (acc, [day, { enabled, intervals }]) => {
        acc[day] = {
          enabled,
          intervals: intervals.map(({ openTime, closeTime, start, end }) => ({
            start: start ? start.format('HH:mm') : null,
            end: end ? end.format('HH:mm') : null,
          })),
        }
        return acc
      },
      {}
    )
    setSchedule(transformed)
  }, [savedSchedule])

  // 24/7 toggle effect
  useEffect(() => {
    if (is24x7) {
      const fullDay = {
        enabled: true,
        intervals: [
          { start: dayjs('00:00', 'HH:mm'), end: dayjs('23:59', 'HH:mm') },
        ],
      }
      const updated = DAY_ORDER.reduce((acc, day) => {
        acc[day] = fullDay
        return acc
      }, {})
      setSchedule(updated)
    } else {
      setSchedule(initialSchedule)
    }
  }, [is24x7, initialSchedule])

  const handleAddOpenTime = () => setOpenTime(true)

  const handleAddTimeInterval = ({ days, openTime, closeTime }) => {
    if (!openTime || !closeTime || !days.length) return
    const o = toDayjs(openTime),
      c = toDayjs(closeTime)
    if (!o || !c) return
    setAddOpenTime((prev) => Array.from(new Set([...prev, ...days])))
    setSchedule((prev) => {
      const next = { ...prev }
      days.forEach((day) => {
        next[day] = next[day] || { enabled: true, intervals: [] }
        next[day].enabled = true
        next[day].intervals = [
          ...(next[day].intervals || []),
          { start: o, end: c },
        ]
      })
      setDefaultCloseTime([o, c])
      return next
    })
  }

  // Check-in/out sync
  useEffect(() => {
    setCheckInOutRange(checkInOutRange) // keep in state
    form.setFieldsValue({ checkInOut: checkInOutRange })
  }, [checkInOutRange, form])
  const handleCheckInOutChange = (type, value) => {
    const time = value ? toDayjs(value) : null

    if (type === 'checkIn') {
      setCheckIn(time)
      setCheckInOutRange([time, checkOut])
      onHandleChangeCheckInCheckout([time, checkOut])
      form.setFieldsValue({ checkIn: time })
    } else {
      setCheckOut(time)
      setCheckInOutRange([checkIn, time])
      onHandleChangeCheckInCheckout([checkIn, time])
      form.setFieldsValue({ checkOut: time })
    }
  }
  const onHandleChangeCheckInCheckout = ([o, c]) => {
    if (!o || !c) return
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    setCheckInOutRange([o, c])
    setAddOpenTime(days)
    setSchedule((prev) => {
      const next = { ...prev }
      days.forEach((day) => {
        next[day] = next[day] || { enabled: true, intervals: [] }
        next[day].enabled = true
        next[day].intervals = [
          ...(next[day].intervals || []),
          { start: o, end: c },
        ]
      })
      setDefaultCloseTime([o, c])
      return next
    })
  }



  return (
    <div className='my-2 font-sans'>
      <AddOpenTimeModal
        open={openTime}
        setOpen={setOpenTime}
        onSave={handleAddTimeInterval}
      />
      <Form layout='vertical' form={form}>
        <Form.Item name='schedule' noStyle>
          <Input type='hidden' />
        </Form.Item>
        {keyCat?.trim()?.toLowerCase() === 'accommodation' ? (
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                label='Check-in Time'
                name='checkIn'
                rules={[{ required: true, message: 'Please select check-in time' }]}
              >
                <TimePicker
                  format='hh:mm A'
                  style={{ width: '100%' }}
                  value={safeTime(checkIn)}
                  onChange={(value) => handleCheckInOutChange('checkIn', value)}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label='Check-out Time'
                name='checkOut'
                rules={[{ required: true, message: 'Please select check-out time' }]}
              >
                <TimePicker
                  format='hh:mm A'
                  style={{ width: '100%' }}
                  value={safeTime(checkOut)}
                  onChange={(value) => handleCheckInOutChange('checkOut', value)}
                />
              </Form.Item>
            </Col>

          </Row>
        ) : (
          keyCat?.toLowerCase() !== 'accommodation' && (
            <>
              <div className='flex items-center mb-2'>
                <span>
                  Open Time <span className='text-red-500'>*</span>&nbsp;
                </span>
                <Form.Item name='is24x7' valuePropName='checked' noStyle>
                  <Checkbox onChange={(e) => setIs24x7(e.target.checked)}>
                    24/7
                  </Checkbox>
                </Form.Item>
                <button
                  type='button'
                  className='bg-blue-500 rounded-lg text-white px-2'
                  onClick={handleAddOpenTime}
                >
                  <PlusOutlined /> Add Open Time
                </button>
              </div>
              <Row gutter={[8, 8]}>
                {Object.keys(schedule).map((day) => (
                  <Col xs={24} md={12} key={day}>
                    <Row gutter={[8, 8]}>
                      <Col
                        xs={24}
                        sm={8}
                        md={9}
                        lg={7}
                        className="flex items-center"
                      >
                        <Switch
                          checked={!is24x7 && schedule[day].enabled}
                          onChange={(checked) =>
                            setSchedule((prev) => ({
                              ...prev,
                              [day]: { ...prev[day], enabled: checked },
                            }))
                          }
                          className="mr-2"
                        />
                        <span className="font-medium">{ABBR_TO_DAY[day]}</span>
                      </Col>

                      <Col xs={24} sm={14} md={15}>
                        {!is24x7 && schedule[day].enabled ? (
                          schedule[day].intervals.map((interval, idx) => {
                            return (
                              <div key={idx} className="mb-2">
                                <div
                                  className="flex gap-2 border border-gray-300 rounded-lg px-2 py-0"
                                  style={{ alignItems: 'center' }}
                                >
                                  {/* Open Time */}
                                  <TimePicker
                                    format="h:mm A"
                                    style={{ width: '50%', border: 'none' }}
                                    value={toDayjs(interval.start)}
                                    placeholder="Open"
                                    onChange={(value) => {
                                      if (!value) return
                                      setSchedule((prev) => {
                                        const ints = [...prev[day].intervals]
                                        const end = ints[idx].end
                                        ints[idx] = { start: value, end }
                                        return {
                                          ...prev,
                                          [day]: { ...prev[day], intervals: ints },
                                        }
                                      })
                                    }}
                                    className="border-0 shadow-none"
                                  />

                                  <span className="text-gray-400">–</span>

                                  {/* Close Time */}
                                  <TimePicker
                                    format="h:mm A"
                                    style={{ width: '50%', border: 'none' }}
                                    value={toDayjs(interval.end)}
                                    placeholder="Close"
                                    onChange={(value) => {
                                      if (!value) return
                                      setSchedule((prev) => {
                                        const ints = [...prev[day].intervals]
                                        const start = ints[idx].start

                                        // Fix overnight times (e.g., 5 PM → 12 AM)
                                        let adjustedEnd = value
                                        if (start && value.isBefore(start)) {
                                          adjustedEnd = value.add(1, 'day')
                                        }

                                        ints[idx] = { start, end: adjustedEnd }
                                        return {
                                          ...prev,
                                          [day]: { ...prev[day], intervals: ints },
                                        }
                                      })
                                    }}
                                    className="border-0 shadow-none"
                                  />
                                </div>
                              </div>
                            )
                          })
                        ) : (
                          <Input placeholder="Closed" disabled style={{ width: '100%' }} />
                        )}
                      </Col>
                    </Row>
                  </Col>
                ))}
              </Row>


            </>
          )
        )}
      </Form>
    </div>
  )
}
