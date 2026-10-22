import React, { useEffect, useState, useMemo } from 'react'
import { Form, Input, Radio, Select, Row, Col, Collapse, Card } from 'antd'
const { Panel } = Collapse
const { TextArea } = Input
const { Option } = Select
import Schedule from './PlaceInfo/Schedule'
import Other from './PlaceInfo/Other'
import useCategoryStore from '../../../../../../../../Stores/setups/category.store'
import { useActivityStore } from '../../../../../../../../Stores/setups/activity.store'
import { useTypeStore } from '../../../../../../../../Stores/setups/type.store'
// import AddKeyWord from '../../../../other/AddKeyWord'
import AddWebsiteSocial from '../../../../other/AddWebsiteSocial'
import AddReference from '../../../../other/AddReference'
import AddPhoneNumber from '../../../../other/AddPhone'
import KeywordSelectField from '../../../../../other/KeywordSelectField'
const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length <= maxLength ? text : text.slice(0, maxLength) + '...'
}
const normalizeKey = (str = '') => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase()
}

//  schedule fallback here too (extra safety)
const DAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const buildDefaultSchedule = (openTimes) => {
  const open = openTimes?.[0] || '08:00'
  const close = openTimes?.[1] || '17:00'
  const days = DAY_KEYS.reduce((acc, d) => {
    acc[d] = {
      enabled: true,
      intervals: [{ start: open, end: close }],
    }
    return acc
  }, {})
  return { is24x7: false, days, checkInOut: [] }
}

const isScheduleEmpty = (schedule) => {
  if (!schedule || !schedule.days) return true
  const anyIntervals = Object.values(schedule.days).some(
    (d) => Array.isArray(d?.intervals) && d.intervals.length > 0
  )
  return !anyIntervals
}
const getKeywordId = (item) => {
  if (!item) {
    return ''
  }

  if (typeof item === 'string') {
    return item
  }

  return (
    item?._id ||
    item?.id ||
    item?.value ||
    ''
  )
}

const getExistingKeywordIds = (
  placeData = {}
) => {

  const rawKeywords =
    placeData?.keyword ??
    placeData?.keywords ??
    placeData?.keywordIds ??
    []

  const list =
    Array.isArray(rawKeywords)
      ? rawKeywords
      : rawKeywords
        ? [rawKeywords]
        : []

  return Array.from(
    new Set(
      list
        .map(
          getKeywordId
        )
        .filter(
          Boolean
        )
    )
  )
}
export default function PlaceInfoForm(props) {
  const {
    form,
    access_token,
    socialMedia,
    nonBusinessData,
    referenceLink,
    openDay,
    openTimes,
    scheduleForm,
    keyCat,
    setKeyCat,
    scheduleData,
  } = props


  const [categoryOptions, setCategoryOptions] = useState([])
  const [filterSubCategory, setFilterSucategory] = useState([])
  const [typeOfPlace, setTypeOfPlace] = useState([])
  const [activityOptions, setActivityOptions] = useState([])


  const phone1 = Form.useWatch('phone1', form)
  const phone2 = Form.useWatch('phone2', form)
  const linksValue = Form.useWatch('links', form) || []
  const [typeOfFood, setTypeOfFood] = useState([])
  const { fetchCategory, fetchCategoryById } = useCategoryStore()
  const { fetchActivity } = useActivityStore()
  const { fetchType } = useTypeStore()
  const phoneNumbers = [phone1, phone2].filter((num) => num)
  let phoneHeader =
    phoneNumbers.length > 0
      ? `Phone Number${phoneNumbers.length > 1 ? 's' : ''}: ${phoneNumbers.join(', ')}`
      : 'Add Phone Number'
  phoneHeader = truncateText(phoneHeader, 35)

  let linksHeader = 'Add Website / Social Media Links' + `: ${linksValue.join(', ')}`
  linksHeader = truncateText(linksHeader, 90)
  const mainCategoryId = nonBusinessData?.mainCategory?._id
  const existingKeywordIds =
    useMemo(
      () => {
        return getExistingKeywordIds(
          nonBusinessData
        )
      },
      [
        nonBusinessData,
      ]
    )
  const getCategoryById = async (id) => {
    try {
      const res = await fetchCategoryById({
        _id: id,
        access_token,
      })

      const detail =
        res?.data?.data ||
        res?.data?.doc ||
        res?.data?.result ||
        res?.data?.category ||
        res?.data ||
        res?.doc ||
        res?.result ||
        res?.category ||
        res ||
        null

      return detail
    } catch (error) {
      console.error('getCategoryById error:', error)
      return null
    }
  }

  useEffect(() => {
    const loadEditCategory = async () => {
      if (!mainCategoryId) return

      const mainCategoryLabel = `${nonBusinessData?.mainCategory?.nameKh || ''} – ${nonBusinessData?.mainCategory?.nameEn || ''}`

      const english = mainCategoryLabel
        .replace(/[\u1780-\u17FF]+/g, '')
        .replace(/[–-]/g, '')
        .trim()

      setKeyCat(english)

      const detail = await getCategoryById(mainCategoryId)
      setFilterSucategory(Array.isArray(detail?.subCategories) ? detail.subCategories : [])
    }

    loadEditCategory()
  }, [mainCategoryId])
  useEffect(() => {
    if (!nonBusinessData) {
      return
    }

    form.setFieldsValue({
      keyword:
        existingKeywordIds,
    })
  }, [
    form,
    nonBusinessData,
    existingKeywordIds,
  ])
  const getCategory = async () => {
    try {
      const doc = { search: '' }
      const res = await fetchCategory({ doc, access_token })

      const list =
        Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.docs)
              ? res.docs
              : Array.isArray(res?.result)
                ? res.result
                : Array.isArray(res?.categories)
                  ? res.categories
                  : []

      setCategoryOptions(list)
    } catch (err) {
      setCategoryOptions([])
    }
  }
  //
  const filterChangeCategory = async (value, option) => {
    if (!value) {
      setKeyCat('')
      setFilterSucategory([])
      form.setFieldsValue({ subCategory: [] })
      return
    }

    const english = (option?.label || '')
      .replace(/[\u1780-\u17FF]+/g, '')
      .replace(/[–-]/g, '')
      .trim()

    setKeyCat(english)

    const detail = await getCategoryById(value)
    setFilterSucategory(Array.isArray(detail?.subCategories) ? detail.subCategories : [])

    form.setFieldsValue({ subCategory: [] })
  }
  const getActivity = async () => {
    try {
      const res = await fetchActivity({ access_token, search: '' })

      const list =
        Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.docs)
              ? res.docs
              : Array.isArray(res?.result)
                ? res.result
                : Array.isArray(res?.activities)
                  ? res.activities
                  : Array.isArray(res?.activity)
                    ? res.activity
                    : []

      setActivityOptions(list)
    } catch (error) {
      console.error('getActivity error:', error)
      setActivityOptions([])
    }
  }

  const getTypeOfPlace = async () => {
    try {
      const res = await fetchType({
        access_token,
        search: '',
        type: 'Place',
      })
      setTypeOfPlace(res?.data || [])
    } catch (error) {
      console.error('getTypeOfPlace error:', error)
      setTypeOfPlace([])
    }
  }

  const getTypeOfFood = async () => {
    try {
      const res = await fetchType({
        access_token,
        search: '',
        type: 'Food',
      })
      setTypeOfFood(res?.data || [])
    } catch (error) {
      console.error('getTypeOfFood error:', error)
      setTypeOfFood([])
    }
  }

  useEffect(() => {
    if (!access_token) return

    getCategory()
    getTypeOfPlace()
    getTypeOfFood()
  }, [access_token])
  useEffect(() => {
    getActivity()
  }, [])

  //  fallback schedule for Schedule component
  const safeScheduleData = useMemo(() => {
    if (!scheduleData || isScheduleEmpty(scheduleData)) {
      return buildDefaultSchedule(openTimes)
    }
    return scheduleData
  }, [scheduleData, openTimes])

  return (
    <>
      {/* <AddKeyWord open={open} setOpen={setOpen} /> */}

      <Card>
        <Form form={form} layout="vertical" initialValues={{ ownership: 'Private' }} className="space-y-2">
          <Form.Item
            hidden
            style={{ marginBottom: '0px' }}
            label="id"
            name="_id"
            rules={[{ required: true, message: 'field required' }]}
          >
            <Input placeholder="Enter id" />
          </Form.Item>

          <Form.Item
            hidden
            style={{ marginBottom: '0px' }}
            label="placeId"
            name="placeId"
            rules={[{ required: true, message: 'field required' }]}
          >
            <Input placeholder="Enter placeId" />
          </Form.Item>

          <Row gutter={[8, 8]}>
            <Col xs={24} md={12}>
              <Form.Item
                style={{ marginBottom: '0px' }}
                label="Place Name (Khmer)"
                name="nameKh"
                rules={[{ required: true, message: 'field required' }]}
              >
                <Input placeholder="Enter place name" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                style={{ marginBottom: '0px' }}
                label="Place Name (English)"
                name="nameEn"
                rules={[{ required: true, message: 'field required' }]}
              >
                <Input placeholder="Enter place name" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                style={{ marginBottom: '0px' }}
                label="Ownership"
                name="ownership"
                rules={[{ required: true, message: 'field required' }]}
              >
                <Radio.Group>
                  <Radio value="Private">Private</Radio>
                  <Radio value="Public">Public</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <AddPhoneNumber form={form} />
            </Col>
          </Row>
        </Form>
      </Card>

      <Row gutter={[8, 8]} className="my-2">
        <Col xs={24}>
          <AddWebsiteSocial socialMedia={socialMedia} form={form} />
        </Col>
      </Row>

      <Form form={form} layout="vertical" className="space-y-2">
        <Card className="my-2">
          <Row gutter={[8, 8]}>
            <Col xs={24} md={12}>
              <Form.Item label="Main Category" name="mainCategory" rules={[{ required: true, message: 'field required' }]}>
                <Select
                  allowClear
                  showSearch
                  placeholder="Select a Category"
                  style={{ width: '100%' }}
                  onChange={filterChangeCategory}
                  optionFilterProp="label"
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.trim().toLowerCase())
                  }
                  options={
                    Array.isArray(categoryOptions)
                      ? categoryOptions.map((el) => ({
                        label: `${el.nameKh} – ${el.nameEn}`,
                        value: el._id,
                      }))
                      : []
                  }
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                style={{ marginBottom: '0px' }}
                label={`Select Sub Category`}
                name="subCategory"
                rules={[{ required: true, message: 'field required' }]}
              >
                <Select
                  allowClear
                  mode="multiple"
                  showSearch
                  placeholder="Choose Sub sub category"
                  optionFilterProp="children"
                >
                  {Array.isArray(filterSubCategory)
                    ? filterSubCategory?.map((cat) => (
                      <Option key={cat._id} value={cat?._id}>
                        {`${cat.nameKh} - ${cat.nameEn}`}
                      </Option>
                    ))
                    : []}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>

      <Row gutter={[8, 8]}>
        {
          normalizeKey(keyCat) === 'accommodation' && (
            <Col
              xs={24}
              md={normalizeKey(keyCat) === 'accommodation' ? 12 : 24}
            >
              <Form.Item label='Star' name='star'>
                <Radio.Group>
                  <Radio value={1}>1</Radio>
                  <Radio value={2}>2</Radio>
                  <Radio value={3}>3</Radio>
                  <Radio value={4}>4</Radio>
                  <Radio value={5}>5</Radio>
                  <Radio value={0}>No star</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
          )
        }
        {
          normalizeKey(keyCat) !== 'accommodation' && (
            <Col
              xs={24}
              md={normalizeKey(keyCat) === 'accommodation' ? 24 : 24}
            >
              <Form form={form} layout="vertical">
                <Other
                  typeOfPlace={typeOfPlace}
                  typeOfFood={typeOfFood}
                  keyCat={keyCat}
                  setKeyCat={setKeyCat}
                  form={form}
                />
              </Form>
            </Col>

          )
        }
        <Col
          xs={24}
          md={normalizeKey(keyCat) === 'accommodation' ? 12 : 24}
        >
          <Schedule
            keyCat={keyCat}
            setKeyCat={setKeyCat}
            openDays={openDay}
            openTimes={openTimes}
            form={form}
          />
        </Col>
        {
          normalizeKey(keyCat) === 'accommodation' && (
            <Col
              xs={24}
              md={normalizeKey(keyCat) === 'accommodation' ? 24 : 24}
            >
              <Form form={form} layout="vertical">
                <Other
                  typeOfPlace={typeOfPlace}
                  typeOfFood={typeOfFood}
                  keyCat={keyCat}
                  setKeyCat={setKeyCat}
                  form={form}
                />
              </Form>
            </Col>

          )
        }
      </Row>
      <div className="my-2">
        <AddReference form={form} referenceLink={referenceLink} />
      </div>

      <Form form={form} layout="vertical" className="space-y-2 mt-2">
        <Card>
          <Row gutter={[8, 8]}>
            <Col xs={24} sm={normalizeKey(keyCat) === 'dailyservices' ? 24 : 24} md={normalizeKey(keyCat) === 'dailyservices' ? 24 : 12}>
              <KeywordSelectField
                form={form}
                access_token={access_token}
              />
            </Col>

            <Col xs={24} sm={24} md={12} style={{ marginTop: '6px' }}>
              <Form.Item
                name="activity"
                label={
                  <>
                    <span>{`Activity `} </span>{' '}
                  </>
                }
                hidden={keyCat === 'Rental'}
              >
                <Select
                  allowClear
                  showSearch
                  mode="multiple"
                  placeholder="Select activity"
                  optionFilterProp="label"
                  filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                  options={activityOptions?.map((act) => ({
                    value: act._id,
                    label: `${act.nameKh} – ${act.nameEn}`,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item style={{ marginBottom: '0px' }} label="Description Khmer" name="descriptionKh">
                <TextArea rows={2} placeholder="Enter description in Khmer" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item style={{ marginBottom: '0px' }} label="Description English" name="descriptionEn">
                <TextArea rows={2} placeholder="Enter description in English" />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </>
  )
}
