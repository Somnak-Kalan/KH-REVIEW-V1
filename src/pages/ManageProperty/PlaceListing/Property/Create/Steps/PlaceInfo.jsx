import React, { useEffect, useState } from 'react'
import { Form, Input, Radio, Select, Row, Col, Collapse, Card } from 'antd'

const { TextArea } = Input
const { Option } = Select
import Schedule from './PlaceInfo/Schedule'
import Other from './PlaceInfo/Other'
// Helper function to truncate text by character count
// import AddKeyWord from '../../../other/AddKeyWord'
import AddWebsiteSocial from '../../../other/AddWebsiteSocial'
import AddPhoneNumber from '../../../other/AddPhone'
import KeywordSelectField from '../../../other/KeywordSelectField'
const truncateText = (text, maxLength) => {
  if (!text) return ''
  return text.length <= maxLength ? text : text.slice(0, maxLength) + '...'
}
const normalizeKey = (str = '') => {
  return str
    .normalize('NFD') // remove accent marks (é → e)
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-z0-9]/gi, '') // remove non-alphanumeric (like spaces, &)
    .toLowerCase()
}
const extractList = (response) => {
  if (Array.isArray(response)) {
    return response
  }

  if (Array.isArray(response?.data)) {
    return response.data
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data
  }

  if (Array.isArray(response?.docs)) {
    return response.docs
  }

  if (Array.isArray(response?.result)) {
    return response.result
  }

  return []
}
import AddReference from '../../../other/AddReference'
import SubCategoryServices from '../../../../../../services/setup/SubCategory'
import { useActivityStore } from '../../../../../../Stores/setups/activity.store'
import TypeServices from '../../../../../../services/setup/Type'
import CategoryServices from '../../../../../../services/setup/Category'
export default function PlaceInfoForm(props) {
  const {
    form,
    access_token,
    socialMedia,
    referenceLink,
    openDay,
    openTimes,
    keyCat,
    setKeyCat,
  } = props
  const { fetchActivity } = useActivityStore()

  const [open, setOpen] = useState(false)
  const ActivityType = [
    { value: 'Temple', label: 'ប្រាសាទ – Temple' },
    { value: 'Palace', label: 'វាំង – Palace' },
    { value: 'Monuments & Statues', label: 'រូបសំណាក – Monuments & Statues' },
    { value: 'Waterfall', label: 'ទឹកធ្លាក់ – Waterfall' },
    { value: 'National Park', label: 'ឧទ្យានជាតិ – National Park' },
    { value: 'Beach', label: 'ឆ្នេរ – Beach' },
  ]
  //
  const [categoryOptions, setCategoryOptions] = useState([])
  //

  const [subCategory, setSubCategory] = useState([])
  const [filterSubCategory, setFilterSucategory] = useState([])
  //activity
  const [activity, setActivity] = useState([])
  const [typeOfPlace, setTypeOfPlace] = useState([])
  const [activityOptions, setActivityOptions] = useState([])
  const [typeOfFood, setTypeOfFood] = useState([])
  //end activity
  // newLink state at the top level
  const [selectedPlaces, setSelectedPlaces] = useState([])
  const handlePlaceChange = (values) => {
    setSelectedPlaces(values)
  }


  // Watch for changes on phone1, phone2, and links fields
  const phone1 = Form.useWatch('phone1', form)
  const phone2 = Form.useWatch('phone2', form)
  const linksValue = Form.useWatch('links', form) || []
  // 2) watch the currently selected ID
  // Create dynamic header based on entered phone numbers
  const phoneNumbers = [phone1, phone2].filter((num) => num)
  let phoneHeader =
    phoneNumbers.length > 0
      ? `Phone Number${phoneNumbers.length > 1 ? 's' : ''}: ${phoneNumbers.join(
        ', '
      )}`
      : 'Add Phone Number'
  phoneHeader = truncateText(phoneHeader, 35)

  // Create dynamic header for links panel based on added links
  let linksHeader =
    'Add Website / Social Media Links' + `: ${linksValue.join(', ')}`
  linksHeader = truncateText(linksHeader, 90)
  const getCategoryById = async (id) => {
    try {
      const doc = { _id: id }
      const data = await CategoryServices.fetchCategoryById({ doc, access_token })
      if (data) {
        setFilterSucategory(data?.subCategories || [])

        return data
      }
    } catch {
      return null
    }
  }
  const filterChangeCategory = (value, option) => {
    if (!value) {
      // 🧹 Handle clear
      setKeyCat('')
      setFilterSucategory([]) // clear subcategory list
      form.setFieldsValue({ subCategory: [] }) // reset subcategory value
      return
    }

    const english = option.label
      .replace(/[\u1780-\u17FF]+/g, '') // remove Khmer letters
      .replace(/[–-]/g, '') // remove dash/– if present
      .trim()

    setKeyCat(english)
    getCategoryById(value)
    form.setFieldsValue({ subCategory: [] })
  }

  const getCategory = async () => {
    try {
      const doc = { search: '' }
      const data = await CategoryServices.fetchCategory({ doc, access_token })
      if (data) {
        setCategoryOptions(data || [])
      }
    } catch { }
  }

  const getSubCategory = async () => {
    try {
      const doc = { search: '' }
      const data = await SubCategoryServices.fetchSubCategory({
        doc,
        access_token,
      })
      if (data) {
        setSubCategory(data)
      }
    } catch { }
  }

  const getActivity = async () => {
    try {
      const doc = {
        search: '',
      }

      const response =
        await fetchActivity({
          doc,
          access_token,
        })

      const list =
        extractList(
          response
        )

      setActivityOptions(
        list
      )
    } catch (error) {
      console.error(
        'Unable to load activities:',
        error
      )

      setActivityOptions(
        []
      )
    }
  }
  const getTypeOfPlace = async () => {
    try {
      const doc = { search: '', type: 'Place' }
      const data = await TypeServices.fetchType({ doc, access_token })
      if (data) {
        setTypeOfPlace(data)
      }
    } catch { }
  }
  const getTypeOfFood = async () => {
    try {
      const doc = { search: '', type: 'Food' }
      const data = await TypeServices.fetchType({ doc, access_token })
      if (data) {
        setTypeOfFood(data)
      }
    } catch { }
  }
  useEffect(() => {
    getCategory()
    getSubCategory()
    getActivity()
    getTypeOfPlace()
    getTypeOfFood()
  }, [form])

  //

  // //check null id category
  return (
    <>
      {/*  */}
      {/* <AddKeyWord open={open} setOpen={setOpen} /> */}
      {/*  */}
      <Card>
        <Form
          form={form}
          layout='vertical'
          initialValues={{ ownership: 'Private' }}
          className='space-y-2'
        >
          {/* 1. First row: Place Names and Ownership */}
          <Row gutter={[8, 8]}>
            <Col xs={24} md={12}>
              <Form.Item
                style={{ marginBottom: '0px' }}
                label='Place Name (Khmer)'
                name='nameKh'
                rules={[{ required: true, message: 'field required' }]}
              >
                <Input placeholder='Enter place name' />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                style={{ marginBottom: '0px' }}
                label='Place Name (English)'
                name='nameEn'
                rules={[{ required: true, message: 'field required' }]}
              >
                <Input placeholder='Enter place name' />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                style={{ marginBottom: '0px' }}
                label='Ownership'
                name='ownership'
                rules={[{ required: true, message: 'field required' }]}
              >
                <Radio.Group>
                  <Radio value='Private'>Private</Radio>
                  <Radio value='Public'>Public</Radio>
                </Radio.Group>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <AddPhoneNumber form={form} />
            </Col>
          </Row>
        </Form>
      </Card>
      <Row gutter={[8, 8]} className='my-2'>
        <Col xs={24} className=''>
          <AddWebsiteSocial socialMedia={socialMedia} form={form} />
        </Col>
      </Row>

      <Form form={form} layout='vertical' className='space-y-2'>
        <Card className='my-2'>
          <Row gutter={[8, 8]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={`Select Main Category `}
                name='mainCategory'
                rules={[{ required: true, message: 'field required' }]}
              >
                <Select
                  allowClear
                  showSearch
                  placeholder='Select a Category'
                  style={{ width: '100%' }}
                  onChange={filterChangeCategory}
                  /* 🔍 tell Select to search the option.label field */
                  optionFilterProp='label'
                  /* optional: refine the matching logic */
                  filterOption={(input, option) =>
                    (option?.label ?? '')
                      .toLowerCase()
                      .includes(input.trim().toLowerCase())
                  }
                  options={
                    Array.isArray(categoryOptions)
                      ? categoryOptions.map((el) => ({
                        label: `${el.nameKh} – ${el.nameEn}`, // visible text
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
                name='subCategory'
                rules={[{ required: true, message: 'field required' }]}
              >
                <Select
                  allowClear
                  showSearch
                  mode='multiple'
                  placeholder='Choose Sub sub category'
                  optionFilterProp='children'
                >
                  {filterSubCategory?.map((cat) => (
                    <Option key={cat._id} value={cat._id}>
                      {`${cat.nameKh} - ${cat.nameEn}`}
                    </Option>
                  ))}
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
      {/* <Row hidden={keyCat === undefined || keyCat === ''}>

        <Col xs={24} md={normalizeKey(keyCat) === 'accommodation' ? 24 : 24}>
          <Form form={form} layout='vertical'>
            <Other
              typeOfPlace={typeOfPlace}
              typeOfFood={typeOfFood}
              keyCat={keyCat}
              setKeyCat={setKeyCat}
              form={form}
            />
          </Form>
        </Col>
        {normalizeKey(keyCat) === 'accommodation' ? (
          <Col xs={24} md={12}>
            <Schedule
              keyCat={keyCat}
              setKeyCat={setKeyCat}
              openDays={openDay}
              openTimes={openTimes}
              // scheduleForm
              form={form}
            />
          </Col>
        ) : (
          <Col xs={24}>
            <Schedule
              keyCat={keyCat}
              setKeyCat={setKeyCat}
              openDays={openDay}
              openTimes={openTimes}
              form={form}
            />
          </Col>
        )}

      </Row> */}

      <div className='my-2'>
        <AddReference form={form} referenceLink={referenceLink} />
      </div>
      <Form
        form={form}
        layout='vertical'
        className='space-y-2 mt-2'
      >
        <Card>
          <Row gutter={[8, 8]}>
            <Col
              xs={24}
              sm={24}
              md={
                normalizeKey(keyCat) ===
                  'dailyservices'
                  ? 24
                  : 12
              }
            >
              <KeywordSelectField
                form={form}
                access_token={access_token}
              />
            </Col>

            <Col
              xs={24}
              sm={24}
              md={12}
              style={{
                marginTop:
                  '6px',
              }}
              hidden={
                normalizeKey(keyCat) ===
                'dailyservices'
              }
            >
              <Form.Item
                name='activity'
                label='Activity'
                hidden={
                  normalizeKey(keyCat) ===
                  'dailyservices'
                }
              >
                <Select
                  allowClear
                  showSearch
                  labelInValue
                  style={{
                    width:
                      '100%',
                  }}
                  mode='multiple'
                  placeholder='Select activity'
                  optionFilterProp='children'
                >
                  {(
                    Array.isArray(
                      activityOptions
                    )
                      ? activityOptions
                      : []
                  ).map(
                    (act) => (
                      <Option
                        key={act._id}
                        value={act._id}
                      >
                        {`${act.nameKh} – ${act.nameEn}`}
                      </Option>
                    )
                  )}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Form.Item
                style={{
                  marginBottom:
                    '0px',
                }}
                label='Description Khmer'
                name='descriptionKh'
              >
                <TextArea
                  rows={2}
                  placeholder='Enter description in Khmer'
                />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                style={{
                  marginBottom:
                    '0px',
                }}
                label='Description English'
                name='descriptionEn'
              >
                <TextArea
                  rows={2}
                  placeholder='Enter description in English'
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>
      </Form>
    </>
  )
}
