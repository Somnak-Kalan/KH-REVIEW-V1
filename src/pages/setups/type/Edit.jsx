import React, { useEffect, useState } from 'react'
import { Col, Form, Input, Modal, Row, Button, Card, Upload } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { CloseOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import Swal from 'sweetalert2'
import TypeServices from '../../../services/setup/Type'

//
import useTypeStore from '../../../Stores/setups/type.store'
//
const getBase64 = (img, callback) => {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result))
  reader.readAsDataURL(img)
}
const EditType = (props) => {
  const { open, setOpen, access_token, propData } = props
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState()
  //
  //
  const { fetchTypeById, updateType, type } = useTypeStore()
  //
  const onFinish = async () => {
    setLoading(true)
    try {
      const values = await form.validateFields() // Use await instead of .then()
      const formData = new FormData()
      formData.append('_id', values._id)
      formData.append('nameEn', values.nameEn)
      formData.append('nameKh', values.nameKh)
      formData.append('description', values.description)
      formData.append('file', values.file?.[0]?.originFileObj)
      const doc = formData
      const res = await updateType({ access_token, doc }) // Await the API call
      if (res) {
        setOpen(false)
        setLoading(false)
        form.resetFields()
        setImageUrl(null)
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
        title: 'Upload Failed!',
        text: 'Something went wrong while updating.',
        timer: 1500,
      })
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }


  useEffect(() => {
    if (!open || !propData?._id) return

    fetchTypeById({
      access_token,
      _id: propData._id,
      force: true,
    })
  }, [open, propData?._id, access_token])

  const handleCancel = () => {
    setOpen(false)
    form.resetFields()
    setImageUrl(null)
  }
  useEffect(() => {

    if (!type?._id) return


    form.setFieldsValue({
      _id: type._id,
      nameEn: type.nameEn,
      nameKh: type.nameKh,
      description: type.description,
    })

    if (Array.isArray(type?.images)) {
      const original = type.images.find((img) => img.includes('original'))
      setImageUrl(original)
    }
  }, [type])
  //

  return (
    <Modal
      open={open}
      width={650}
      centered
      closable={false}
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
            style={{
              minWidth: '120px',
              borderRadius: '8px',
            }}
          >
            update
          </Button>
        </div>
      }
    >
      <Card
        title='Edit Type'
        extra={
          <CloseOutlined
            style={{
              fontSize: '18px',
              color: 'red',
              cursor: 'pointer',
            }}
            onClick={handleCancel}
          />
        }
      >
        <Form form={form} layout='vertical' name='edit_form'>
          <Row gutter={[8, 2]}>
            <Form.Item hidden name='_id'>
              <Input />
            </Form.Item>
            <Col xs={24} sm={5} className=' flex justify-center my-5'>
              <Form.Item
                name='file'
                valuePropName='fileList'
                getValueFromEvent={(e) =>
                  Array.isArray(e) ? e : e && e.fileList
                }
              >
                <Upload
                  name="avatar"
                  listType="picture-card"
                  showUploadList={false} // hide default list
                  beforeUpload={() => false} // prevent auto upload
                  onChange={(info) => {
                    const file = info.fileList[info.fileList.length - 1]?.originFileObj
                    if (!file) return
                    getBase64(file, (url) => setImageUrl(url))
                    form.setFieldsValue({ file: info.fileList }) // store in form for submit
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="avatar"
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
                label='Type Name (En)'
                name='nameEn'
                style={{ marginBottom: '0px' }}
                rules={[{ required: true, message: 'file require!' }]}
              >
                <Input placeholder=' enter type name (en)' />
              </Form.Item>
              <Form.Item
                label='Type Name (Kh)'
                name='nameKh'
                style={{ marginBottom: '0px' }}
                rules={[{ required: true, message: 'file require!' }]}
              >
                <Input placeholder=' enter type name (kh)' />
              </Form.Item>
            </Col>
            <Col sm={24}>
              <Form.Item label='Description' name='description'>
                <TextArea rows={4} placeholder='enter description' />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </Modal>
  )
}

export default EditType
