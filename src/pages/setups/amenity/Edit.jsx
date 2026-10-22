import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, Form, Input, Modal, Row, Upload } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'

//  use zustand store instead of AmenityServices
import useAmenityStore from '../../../Stores/setups/amenity.store'

const EditAmenity = (props) => {
  const { open, setOpen, access_token, propData } = props

  const [formStep1] = Form.useForm()
  const [loading, setLoading] = useState(false)

  //  store action
  const { updateAmenity } = useAmenityStore()

  // Thumbnail state
  const [thumbFileList, setThumbFileList] = useState([])
  const [thumbImageUrl, setThumbImageUrl] = useState(null)

  // Additional images state
  const [imagesFileList, setImagesFileList] = useState([])

  // Helper: convert file to base64
  const getBase64 = (file, callback) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => callback(reader.result)
  }

  //  Fill form from propData directly (NO fetchById)
  useEffect(() => {
    if (!open) return
    if (!propData?._id) return

    formStep1.setFieldsValue({
      _id: propData._id,
      nameEn: propData.nameEn,
      nameKh: propData.nameKh,
      description:
        propData?.description !== 'undefined' ? propData.description : '',
    })

    // show current thumbnail from existing images
    if (propData?.images?.length) {
      const url = propData.images.find((img) => img?.includes('original'))
      setThumbImageUrl(url || null)
    } else {
      setThumbImageUrl(null)
    }

    // reset file lists when open edit
    setThumbFileList([])
    setImagesFileList([])
  }, [open, propData, formStep1])

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

      //  validate (better than getFieldsValue)
      const values = await formStep1.validateFields()

      const formData = new FormData()
      formData.append('_id', values._id || propData?._id)
      formData.append('nameEn', values.nameEn)
      formData.append('nameKh', values.nameKh)
      formData.append('description', values.description || '')

      // thumbnail
      if (thumbFileList.length > 0) {
        formData.append('file', thumbFileList[0]?.originFileObj)
      }

      // optional extra files
      imagesFileList.forEach((file) => {
        if (file?.originFileObj) formData.append('files', file.originFileObj)
      })

      //  update via store (store auto refetch list)
      const res = await updateAmenity({
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
          title: 'Update Successful!',
          text: 'The information has been updated successfully.',
          showConfirmButton: false,
          timer: 1500,
        })
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Update Failed!',
        text: 'Something went wrong while updating.',
        timer: 1500,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title='Edit Amenity'
      open={open}
      width={650}
      centered
      closable={true}
      onCancel={handleCancel}
      footer={
        <Button
          type='primary'
          onClick={onFinish}
          loading={loading}
          style={{ minWidth: '120px', borderRadius: '8px' }}
        >
          Save
        </Button>
      }
    >
      <Card className='dark:bg-slate-900 dark:border-slate-700'>
        <Form form={formStep1} preserve layout='vertical' name='edit_amenity_step1'>
          <Form.Item hidden name='_id'>
            <Input />
          </Form.Item>

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
                preserve
                style={{ marginBottom: '0px' }}
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

export default EditAmenity
