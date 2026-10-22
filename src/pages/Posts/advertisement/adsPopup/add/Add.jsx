import React, { useEffect, useContext, useRef, useState } from 'react'
import {
  Col,
  Form,
  Input,
  Modal,
  Row,
  Button,
  Select,
  Spin,
  Steps
} from 'antd'
import { AuthContext } from '../../../../../contexts/AuthContext'
import BannerTypeSelection from './BannerTypeSelection'
import CustomAction from './CustomAction'
import ReactQuill from './ReactQuill'
import ImageUpload from './ImageUpload'
import Schedule from './Schedule';
const { Option } = Select
const { Step } = Steps

const AddBanner = ({ open, setOpen, getBannerList, activeTab }) => {
  const [form] = Form.useForm()
  const { access_token } = useContext(AuthContext)

  // Images
  const [enImageLarge, setEnImageLarge] = useState(null)
  const [enImageSmall, setEnImageSmall] = useState(null)
  const [khImageLarge, setKhImageLarge] = useState(null)
  const [khImageSmall, setKhImageSmall] = useState(null)

  // Other states
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState('en')
  const [bannerType, setBannerType] = useState('information_only')
  const [bannerDisplayType, setBannerDisplayType] = useState('image_only') // 'image_only', 'image_text', 'image_fullscreen'
  const [step, setStep] = useState(0)
  const [spinning, setSpinning] = useState(false)

  // Description
  const [descriptionEn, setDescriptionEn] = useState('')
  const [descriptionKh, setDescriptionKh] = useState('')

  // Custom Action
  const [buttonTitle, setButtonTitle] = useState('')
  const [actionType, setActionType] = useState('Navigate to App Screen')
  const [targetAppScreen, setTargetAppScreen] = useState('Explore')
  const [targetWebsite, setTargetWebsite] = useState('')

  // Handlers
  const handleCancel = () => {
    setOpen(false)
    setStep(0)
    form.resetFields()
    setEnImageLarge(null)
    setEnImageSmall(null)
    setKhImageLarge(null)
    setKhImageSmall(null)
    setDescriptionEn('')
    setDescriptionKh('')
    setButtonTitle('')
    setActionType('Navigate to App Screen')
    setTargetAppScreen('Explore')
    setTargetWebsite('')
    setLanguage('en')
  }

  const handleImageChange = (e, setImageState, langLabel, size) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImageState(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = (setImageState) => {
    setImageState(null)
  }

  const renderContentImage = () => (
    <Row gutter={[8, 8]} justify="center">
      <Col xs={24} md={24}>
        <Form.Item style={{ marginBottom: "0px" }} name="display_frequency" label="Display Frequency" rules={[{ required: true }]}>
          <Select placeholder="Please select display frequency">
            <Select.Option value="always">Always</Select.Option>
            <Select.Option value="once_per_session">Once per session</Select.Option>
            <Select.Option value="first_mobile_visit">First mobile visit only</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item style={{ marginBottom: "0px" }} name="status" label="Status" rules={[{ required: true }]}>
          <Select placeholder="Please select status">
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
          </Select>
        </Form.Item>
      </Col>
      <Col xs={24} md={24}>
        <Form.Item label="English Posters" labelCol={{ span: 24 }}>
          <ImageUpload
            label="English Small"
            image={enImageSmall}
            setImage={setEnImageSmall}
            handleImageChange={handleImageChange}
            handleRemoveImage={handleRemoveImage}
            langLabel="en"
            size="Small"
          />
          {/* <ImageUpload
            label="English Large"
            image={enImageLarge}
            setImage={setEnImageLarge}
            handleImageChange={handleImageChange}
            handleRemoveImage={handleRemoveImage}
            langLabel="en"
            size="Large"
          /> */}
        </Form.Item>
      </Col>
      {/* <Col xs={24} md={11}>
        <Form.Item label="Khmer Posters" labelCol={{ span: 24 }}>
          <ImageUpload
            label="Khmer Small"
            image={khImageSmall}
            setImage={setKhImageSmall}
            handleImageChange={handleImageChange}
            handleRemoveImage={handleRemoveImage}
            langLabel="kh"
            size="Small"
          />
          <ImageUpload
            label="Khmer Large"
            image={khImageLarge}
            setImage={setKhImageLarge}
            handleImageChange={handleImageChange}
            handleRemoveImage={handleRemoveImage}
            langLabel="kh"
            size="Large"
          />
        </Form.Item>
      </Col> */}

    </Row>
  )

  const renderContentText = () => (
    <>
      {/* Language Switch */}
      <Row gutter={16}>
        <Col span={24}>
          <div className="flex justify-center rounded-md bg-gray-100" style={{ border: '1px solid #E2EFFF' }}>
            <Button
              type={language === 'en' ? 'default' : 'white'}
              style={language === 'en' ? { border: '1px solid #E2EFFF' } : {}}
              onClick={() => setLanguage('en')}
              className="w-full my-1 mx-1 rounded-lg flex items-center justify-center gap-2"
            >
              🇺🇸 English
            </Button>
            <Button
              type={language === 'kh' ? 'default' : 'white'}
              style={language === 'kh' ? { border: '1px solid #E2EFFF' } : {}}
              onClick={() => setLanguage('kh')}
              className="w-full my-1 mx-1 rounded-lg flex items-center justify-center gap-2"
            >
              🇰🇭 Khmer
            </Button>
          </div>
        </Col>
      </Row>

      {/* Text Inputs */}
      {language === 'en' ? (
        <>
          <Form.Item
            label="Title (English)"
            name="titleEn"
            labelCol={{ span: 24 }}
            rules={[{ required: true, message: 'Please enter the English title!' }]}
          >
            <Input placeholder="Enter advertisement title in English" />
          </Form.Item>
          <Form.Item
            label="Description (English)"
            name="descriptionEn"
            valuePropName="value"
            getValueFromEvent={(content) => content}
            rules={[{ required: true, message: 'Please enter the English description!' }]}
          >
            <ReactQuill language={language} setDescriptionEn={setDescriptionEn} descriptionEn={descriptionEn} placeholder="Enter banner description..." />
          </Form.Item>
        </>
      ) : (
        <>
          <Form.Item
            label="Title (Khmer)"
            name="titleKh"
            labelCol={{ span: 24 }}
            rules={[{ required: true, message: 'Please enter the Khmer title!' }]}
          >
            <Input placeholder="Enter advertisement title in Khmer" />
          </Form.Item>
          <Form.Item
            label="Description (Khmer)"
            name="descriptionKh"
            valuePropName="value"
            getValueFromEvent={(content) => content}
            rules={[{ required: true, message: 'Please enter the Khmer description!' }]}
          >
            <ReactQuill language={language} setDescriptionKh={setDescriptionKh} descriptionKh={descriptionKh} placeholder="Enter banner description..." />
          </Form.Item>
        </>
      )}

      {/* Banner Type & Custom Action */}
      <BannerTypeSelection bannerType={bannerType} setBannerType={setBannerType} />
      {bannerType === 'custom_action' && (
        <CustomAction
          buttonTitle={buttonTitle}
          setButtonTitle={setButtonTitle}
          actionType={actionType}
          setActionType={setActionType}
          targetAppScreen={targetAppScreen}
          setTargetAppScreen={setTargetAppScreen}
          targetWebsite={targetWebsite}
          setTargetWebsite={setTargetWebsite}
        />
      )}
    </>
  )

  const renderContentByType = () => {
    switch (bannerDisplayType) {
      case 'image_only':
        return renderContentImage()
      case 'image_text':
        return (
          <>
            {renderContentImage()}
            {renderContentText()}
          </>
        )
      case 'image_fullscreen':
        return (
          <> {renderContentImage()}</>
        )
      default:
        return null
    }
  }

  const handleNext = () => {
    setSpinning(true)
    setTimeout(() => {
      setStep(step + 1)
      setSpinning(false)
    }, 500)
  }

  const handlePrev = () => setStep(step - 1)

  const handleSave = () => {
    form.validateFields().then(values => {
      console.log('Form Submitted:', values)
      // API call to save banner here
    })
  }

  return (
    <Modal
      title="Create Advertisement"
      open={open}
      width={1000}
      centered
      onCancel={handleCancel}
      footer={
        <>
          {/* {step > 0 && <Button onClick={handlePrev}>Back</Button>}
          {step < 1 ? (
            <Button type="primary" onClick={handleNext}>Next</Button>
          ) : ( */}
          <Button type="primary" loading={loading} onClick={handleSave}>Save</Button>
          {/* )} */}
        </>
      }
    >
      {/* Steps */}
      {/* <Steps current={step} size="small" className="mb-6">
        <Step title="Upload Image" />
        <Step title="Advertisement Details" />
      </Steps> */}
      {/* Select Banner Display Type */}
      <Form form={form} layout="vertical" name="add_advertisement" initialValues={{ status: 'active', display_frequency: 'always', bannerDisplayType: 'image_only' }}>
        <Form.Item label="Advertisement Type" name="bannerDisplayType">
          <Select value={bannerDisplayType} onChange={setBannerDisplayType}>
            <Option value="image_only">Image Only</Option>
            <Option value="image_text">Image with Text</Option>
            <Option value="image_fullscreen">Image Only Full Screen</Option>
          </Select>
        </Form.Item>
        <Schedule />
        {/* Step Content */}
        <Spin spinning={spinning}>
          <div style={{ flex: 1 }}>
            {renderContentByType()}
          </div>
        </Spin>
      </Form>
    </Modal>
  )
}

export default AddBanner

