import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Col, Form, Input, Modal, Row, Upload } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'

//  zustand store
import usePrivacyStore from '../../../Stores/setups/privacy.store'

const EditPrivacy = (props) => {
  const { open, setOpen, access_token, propData } = props

  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const [imageUrl, setImageUrl] = useState(null)
  const [fileList, setFileList] = useState([])

  const { updatePrivacy } = usePrivacyStore()

  const getBase64 = (img, callback) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => callback(reader.result))
    reader.readAsDataURL(img)
  }

  const handleCancel = () => {
    setOpen(false)
    form.resetFields()
    setImageUrl(null)
    setFileList([])
  }

  //  Fill form from propData ONLY (no request)
  useEffect(() => {
    if (!open) return
    if (!propData?._id) return

    form.setFieldsValue({
      _id: propData?._id,
      nameEn: propData?.nameEn,
      nameKh: propData?.nameKh,
      description:
        propData?.description && propData?.description !== 'undefined'
          ? propData?.description
          : '',
    })

    // show existing image (original)
    if (propData?.images?.length) {
      setImageUrl(propData?.images?.find((img) => img?.includes('original')) || null)
    } else {
      setImageUrl(null)
    }

    // reset upload list when open edit
    setFileList([])
  }, [open, propData, form])

  const onFinish = async () => {
    setLoading(true)
    try {
      const values = await form.validateFields()

      const formData = new FormData()
      formData.append('_id', values._id)
      formData.append('nameEn', values.nameEn)
      formData.append('nameKh', values.nameKh)
      formData.append('description', values.description || '')

      if (fileList.length > 0) {
        formData.append('file', fileList[0].originFileObj)
      }

      //  store action (auto refetch list inside store)
      const res = await updatePrivacy({
        access_token,
        doc: formData,
      })

      if (res) {
        handleCancel()
        Swal.fire({
          icon: 'success',
          title: 'Upload Successful!',
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
      title='Edit Privacy'
      open={open}
      width={650}
      centered
      closable
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
        <Form form={form} layout='vertical' name='edit_privacy'>
          <Form.Item hidden name='_id'>
            <Input />
          </Form.Item>

          <Row gutter={[8, 2]}>
            <Col
              xs={24}
              sm={5}
              style={{ marginTop: '20px' }}
              className='flex justify-center my-2'
            >
              <Form.Item name='file'>
                <Upload
                  name='avatar'
                  listType='picture-card'
                  showUploadList={false}
                  beforeUpload={() => false}
                  fileList={fileList}
                  onChange={(info) => {
                    const newFileList = info.fileList
                    setFileList(newFileList)

                    const latestFile =
                      newFileList[newFileList.length - 1]?.originFileObj

                    if (latestFile) {
                      getBase64(latestFile, (url) => setImageUrl(url))
                    } else {
                      // if user removes selected file, keep existing imageUrl (don’t force null)
                      // but if you want to clear preview completely, uncomment next line:
                      // setImageUrl(null)
                    }

                    form.setFieldsValue({ file: newFileList })
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt='avatar'
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                    />
                  ) : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>

            <Col xs={24} sm={19}>
              <Form.Item
                label='Privacy Name (En)'
                name='nameEn'
                style={{ marginBottom: '0px' }}
                rules={[
                  { required: true, message: 'Please enter the privacy name (En)!' },
                ]}
              >
                <Input
                  placeholder='Enter privacy name (En)'
                  className='dark:bg-slate-900 dark:text-white dark:border-slate-700'
                />
              </Form.Item>

              <Form.Item
                label='Privacy Name (Kh)'
                name='nameKh'
                style={{ marginBottom: '0px' }}
                rules={[
                  { required: true, message: 'Please enter the privacy name (Kh)!' },
                ]}
              >
                <Input
                  placeholder='Enter privacy name (Kh)'
                  className='dark:bg-slate-900 dark:text-white dark:border-slate-700'
                />
              </Form.Item>
            </Col>

            <Col sm={24}>
              <Form.Item
                style={{ marginBottom: '0px' }}
                label='Description'
                name='description'
              >
                <TextArea
                  rows={4}
                  placeholder='Enter description'
                  className='dark:bg-slate-900 dark:text-white dark:border-slate-700'
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </Modal>
  )
}

export default EditPrivacy
