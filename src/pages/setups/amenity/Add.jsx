import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, Form, Input, Modal, Row, Upload } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { useState } from 'react'
import Swal from 'sweetalert2'

//  use zustand store (instead of AmenityServices)
import useAmenityStore from '../../../Stores/setups/amenity.store'

const AddAmenity = (props) => {
  const { open, setOpen, access_token } = props

  const [formStep1] = Form.useForm()
  const [loading, setLoading] = useState(false)

  //  store action
  const { createAmenity } = useAmenityStore()

  // Thumbnail state
  const [thumbFileList, setThumbFileList] = useState([])
  const [thumbImageUrl, setThumbImageUrl] = useState(null)

  // Additional images state
  const [imagesFileList, setImagesFileList] = useState([])

  const getBase64 = (img, callback) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => callback(reader.result))
    reader.readAsDataURL(img)
  }

  const uploadThumbButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload Thumbnail</div>
    </div>
  )

  const handleCancel = () => {
    setOpen(false)
    formStep1.resetFields()
    setThumbFileList([])
    setThumbImageUrl(null)
    setImagesFileList([])
  }

  const onFinish = async () => {
    try {
      setLoading(true)

      //  validate first (safer than getFieldsValue only)
      const values = await formStep1.validateFields()

      const formData = new FormData()
      formData.append('nameEn', values.nameEn)
      formData.append('nameKh', values.nameKh)
      formData.append('description', values.description || '')

      if (thumbFileList.length > 0) {
        formData.append('file', thumbFileList[0]?.originFileObj)
      }

      imagesFileList.forEach((file) => {
        if (file?.originFileObj) formData.append('files', file.originFileObj)
      })

      //  call store (store will auto refetch list)
      const res = await createAmenity({
        access_token,
        doc: formData,
      })

      if (res) {
        setOpen(false)
        formStep1.resetFields()
        setThumbFileList([])
        setThumbImageUrl(null)
        setImagesFileList([])

        Swal.fire({
          icon: 'success',
          title: 'Upload Successful!',
          text: 'The information has been added successfully.',
          showConfirmButton: false,
          timer: 1500,
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed!',
        text: 'Something went wrong while adding.',
        timer: 1500,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title='Add Amenity'
      open={open}
      width={650}
      centered
      closable={true}
      onCancel={handleCancel}
      footer={
        <div
          style={{
            textAlign: 'left',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}
        >
          <Button
            type='primary'
            onClick={onFinish}
            loading={loading}
            style={{ minWidth: '120px', borderRadius: '8px' }}
          >
            Save
          </Button>
        </div>
      }
    >
      <Card className='dark:bg-slate-900 dark:border-slate-700'>
        <Form
          form={formStep1}
          preserve
          layout='vertical'
          name='add_amenity_step1'
        >
          <Row gutter={[8, 2]}>
            <Col xs={24} sm={5} className='flex justify-center items-center mt-4'>
              <Form.Item
                name='thumbnail'
                valuePropName='fileList'
                getValueFromEvent={(e) => e?.fileList}
                preserve
              >
                <Upload
                  name='thumbnail'
                  listType='picture-card'
                  showUploadList={false}
                  beforeUpload={() => false}
                  fileList={thumbFileList}
                  onChange={(info) => {
                    const fileList = info.fileList
                    setThumbFileList(fileList)

                    const latestFile =
                      fileList[fileList.length - 1]?.originFileObj
                    if (latestFile) getBase64(latestFile, (url) => setThumbImageUrl(url))
                  }}
                >
                  {thumbImageUrl ? (
                    <img
                      src={thumbImageUrl}
                      alt='thumbnail'
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                    />
                  ) : (
                    uploadThumbButton
                  )}
                </Upload>
              </Form.Item>
            </Col>

            <Col xs={24} sm={19}>
              <Form.Item
                label='Amenity Name (En)'
                name='nameEn'
                style={{ marginBottom: '0px' }}
                preserve
                rules={[
                  { required: true, message: 'Please enter the amenity name (En)!' },
                ]}
              >
                <Input
                  placeholder='Enter amenity name (En)'
                  className='dark:bg-slate-900 dark:text-white'
                />
              </Form.Item>

              <Form.Item
                label='Amenity Name (Kh)'
                name='nameKh'
                preserve
                rules={[
                  { required: true, message: 'Please enter the amenity name (Kh)!' },
                ]}
              >
                <Input
                  placeholder='Enter amenity name (Kh)'
                  className='dark:bg-slate-900 dark:text-white'
                />
              </Form.Item>
            </Col>

            <Col sm={24}>
              <Form.Item label='Description' name='description' preserve>
                <TextArea
                  rows={4}
                  placeholder='Enter description'
                  className='dark:bg-slate-900 dark:text-white'
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </Modal>
  )
}

export default AddAmenity
