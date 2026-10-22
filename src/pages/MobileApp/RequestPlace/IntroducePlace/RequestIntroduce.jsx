import React, { useState } from 'react'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Steps,
  Card,
  Row,
  Col,
} from 'antd'

const { TextArea } = Input
const { Option } = Select
const { Step } = Steps
import UploadForm from '../UploadFile'

const RequestLocation = (props) => {
  const { open, setOpen } = props

  const [form] = Form.useForm()
  //

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
        title='Introduce Location'
        open={open}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Steps current={currentStep} className='mb-3'>
          <Step title='Location Info' />
          <Step title='Upload' />
        </Steps>

        <Card>
          {currentStep === 0 && (
            <Form form={form} layout='vertical' onFinish={handleNext}>
              <Row gutter={[8, 2]}>
                <Col xl={12}>
                  <Form.Item
                    name='category'
                    label='Category'
                    style={{ marginBottom: '0px' }}
                    rules={[
                      {
                        required: true,
                        message: 'field require!',
                      },
                    ]}
                  >
                    <Select allowClear placeholder='Select category '>
                      <Option value='Staff'>Department</Option>
                      <Option value='Supervisor'>Restaurant</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xl={12}>
                  <Form.Item
                    name='location'
                    style={{ marginBottom: '0px' }}
                    label='Location'
                    rules={[{ required: true, message: 'field required!' }]}
                  >
                    <Input placeholder='Enter location name' />
                  </Form.Item>
                </Col>
                <Col xl={12}>
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
                    <Input placeholder='Enter phone number' />
                  </Form.Item>
                </Col>
                <Col xl={24}>
                  <Form.Item
                    name='businessDescription'
                    label='Description'
                    style={{ marginBottom: '0px' }}
                    rules={[
                      {
                        required: true,
                        message: 'Please enter the location!',
                      },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder='Enter  description of the location'
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          )}
          {currentStep === 1 && (
            <div>
              <Form form={form} layout='vertical'>
                <Form.Item style={{ marginBottom: '0px' }} name='uploadedImage'>
                  <UploadForm
                    upload1='Image Location'
                    upload2='Video Location'
                  />
                </Form.Item>
              </Form>
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
