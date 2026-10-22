import React, { useState } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  message,
  Steps,
  Card,
  Row,
  Col,
} from 'antd'

const { TextArea } = Input
const { Option } = Select
const { Step } = Steps
// import GoogleMapComponent from './GoogleMap'
import UploadForm from '../UploadFile'

const RequestLocation = (props) => {
  const { open, setOpen } = props
  const [form] = Form.useForm()
  const [requests, setRequests] = useState([
    { id: 1, name: 'Store A', type: 'Department', status: 'Pending' },
    { id: 2, name: 'Tour B', type: 'Tour', status: 'Confirmed' },
    { id: 3, name: 'Restaurant C', type: 'Restaurant', status: 'Rejected' },
  ])
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const handleCancel = () => {
    setOpen(false)
    setCurrentStep(0)
    form.resetFields()
  }

  const handleNext = () => {
    form.validateFields().then(() => setCurrentStep(currentStep + 1))
  }

  const handlePrevious = () => setCurrentStep(currentStep - 1)
  return (
    <div>
      <Modal
        title='New Location Request'
        open={open}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Steps current={currentStep} className='mb-3'>
          <Step title='Requestor Info' />
          <Step title='Location Info' />
          <Step title='Other Info' />
        </Steps>

        <Card>
          {currentStep === 0 && (
            <Form form={form} layout='vertical' onFinish={handleNext}>
              <Form.Item
                name='requestBy'
                label='Request By'
                style={{ marginBottom: '0px' }}
                rules={[
                  {
                    required: true,
                    message: 'field require!',
                  },
                ]}
              >
                <Select allowClear placeholder='Select requestor '>
                  <Option value='Staff'>Staff</Option>
                  <Option value='Supervisor'>Supervisor</Option>
                  <Option value='Owner'>Owner</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name='phoneNumber'
                label='Phone Number'
                style={{ marginBottom: '0px' }}
                rules={[
                  { required: true, message: 'field required!' },
                  {
                    pattern: /^[0-9]+$/,
                    message: 'Phone number must be numeric!',
                  },
                ]}
              >
                <Input placeholder='Enter phone number(with telegram)' />
              </Form.Item>

              <Form.Item
                name='fullName'
                style={{ marginBottom: '0px' }}
                label='Full Name of Requestor'
                rules={[{ required: true, message: 'field required!' }]}
              >
                <Input placeholder='Enter full name' />
              </Form.Item>
            </Form>
          )}
          {currentStep === 1 && (
            <>
              <Form form={form} layout='vertical'>
                <Row gutter={[8, 2]}>
                  <Col lg={12}>
                    <Form.Item
                      name='businessName'
                      label='Location Name'
                      style={{ marginBottom: '0px' }}
                      rules={[
                        {
                          required: true,
                          message: 'Please enter the location name!',
                        },
                      ]}
                    >
                      <Input placeholder='Enter location name' />
                    </Form.Item>
                  </Col>
                  <Col lg={12}>
                    <Form.Item
                      name='businessCategory'
                      label='Category / Type of location'
                      style={{ marginBottom: '0px' }}
                      rules={[
                        {
                          required: true,
                          message: 'field required!',
                        },
                      ]}
                    >
                      <Select placeholder='Select category'>
                        <Option value='Retail'>Retail</Option>
                        <Option value='Restaurant'>Restaurant</Option>
                        <Option value='Tourism'>Tourism</Option>
                        <Option value='Service'>Service</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col lg={12}>
                    <Form.Item
                      name='businessAddress'
                      label='Address'
                      style={{ marginBottom: '0px' }}
                      rules={[
                        {
                          required: true,
                          message: 'field required!',
                        },
                      ]}
                    >
                      <Input placeholder='Enter  address' />
                    </Form.Item>
                  </Col>
                  <Col lg={12}>
                    <Form.Item
                      name='businessPhone'
                      label='Phone Number'
                      style={{ marginBottom: '0px' }}
                      rules={[
                        {
                          required: true,
                          message: 'Please enter the phone number!',
                        },
                        {
                          pattern: /^[0-9]+$/,
                          message: 'Phone number must be numeric!',
                        },
                      ]}
                    >
                      <Input placeholder='Enter business phone number' />
                    </Form.Item>
                  </Col>
                  <Col lg={12}>
                    <Form.Item
                      name='googleMapLink'
                      label='Google Maps Link'
                      rules={[
                        {
                          required: true,
                          message: 'field required!',
                        },
                      ]}
                    >
                      <Input placeholder='Enter the link to Google Maps ' />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name='businessDescription'
                  label='Description'
                  style={{ marginBottom: '0px' }}
                  rules={[
                    {
                      required: true,
                      message: 'Please enter the business description!',
                    },
                  ]}
                >
                  <TextArea
                    rows={4}
                    placeholder='Enter a brief description of the business'
                  />
                </Form.Item>
              </Form>
              {/* <GoogleMapComponent /> */}
            </>
          )}

          {currentStep === 2 && (
            <div>
              {currentStep === 2 && (
                <Form form={form} layout='vertical'>
                  <Form.Item
                    style={{ marginBottom: '0px' }}
                    name='uploadedImage'
                  >
                    <UploadForm upload1='DOC/PDF/IMAGE' upload2='ID CARD' />
                  </Form.Item>

                  <Form.Item
                    style={{ marginBottom: '0px' }}
                    name='facebookLink'
                    label='Facebook Link'
                  >
                    <Input placeholder='Enter Facebook link' />
                  </Form.Item>

                  <Form.Item
                    style={{ marginBottom: '0px' }}
                    name='tiktokLink'
                    label='TikTok Link'
                  >
                    <Input placeholder='Enter TikTok link' />
                  </Form.Item>
                </Form>
              )}
            </div>
          )}
        </Card>

        <div style={{ textAlign: 'right' }} className='mt-3'>
          {currentStep > 0 && (
            <Button style={{ marginRight: 8 }} onClick={handlePrevious}>
              Previous
            </Button>
          )}
          {currentStep < 2 ? (
            <Button type='primary' onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button
              type='primary'
              htmlType='submit'
              onClick={() => setOpen(false)}
              loading={loading}
            >
              Submit
            </Button>
          )}
        </div>
      </Modal>
    </div>
  )
}

export default RequestLocation
