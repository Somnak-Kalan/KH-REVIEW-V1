import React, { useState, useEffect } from 'react'
import { Modal, Upload, Form } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import Swal from 'sweetalert2'
const getBase64 = (file, callback) => {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result))
  reader.readAsDataURL(file)
}
import AllPropertyServices from '../../../../../../../../services/ManageProperty/PlaceListing/AllProperty'

const ProfileThumbnailEditor = ({
  thumbnail,
  getFileByName,
  open,
  setOpen,
  _id,
  getBusinessProperty,
  access_token,
}) => {
  const [form] = Form.useForm()
  const [filePreview, setFilePreview] = useState(null)
  const [btn_loading, setBtnLoading] = useState(false)
  useEffect(() => {
    if (open && !filePreview) {
      setFilePreview(thumbnail?.[0])
    }
  }, [open, thumbnail, filePreview])

  const normFile = (e) => {
    // Ant Design uses this to extract file list from Upload
    if (Array.isArray(e)) {
      return e
    }
    return e?.fileList
  }
  const handleSave = async () => {
    setBtnLoading(true)
    try {
      const values = await form.validateFields()

      const fileItem = values?.file?.[0]

      if (!fileItem) {
        console.warn('No valid file selected')
        return
      }
      const formData = new FormData()
      formData.append('images', fileItem)
      const res = await AllPropertyServices.updatePropertyThumbnail({
        _id: _id,
        doc: formData,
        access_token,
      })

      Swal.fire({
        icon: 'success',
        title: 'Updated',
        timer: 1200,
        showConfirmButton: false,
      }).then(() => {
        setOpen(false)
        getBusinessProperty(_id)
        setBtnLoading(false)
      })
    } catch (error) {
      setBtnLoading(false)
      console.error('Upload failed:', error)
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Something went wrong while uploading the image.',
      })
    }
  }

  return (
    <Modal
      open={open}
      title='Edit Thumbnail'
      onCancel={() => setOpen(false)}
      onOk={handleSave}
      okText='Save Change'
      width={600}
      confirmLoading={btn_loading}
    >
      <Form form={form} layout='vertical'>
        <Form.Item
          name='file'
          label='Thumbnail'
          valuePropName='fileList'
          getValueFromEvent={normFile}
        >
          <Upload.Dragger
            name='avatar'
            accept='image/*'
            multiple={false}
            showUploadList={false}
            beforeUpload={() => false}
            onChange={({ file, fileList }) => {
              const latestFile = fileList?.[fileList.length - 1]

              if (latestFile?.originFileObj instanceof Blob) {
                getBase64(latestFile.originFileObj, (url) => {
                  setFilePreview(url)
                  //  Clear Upload so same file can be selected again
                  form.setFieldsValue({ file: [latestFile.originFileObj] })
                })
              } else {
                console.warn('Invalid file object:', latestFile)
              }
            }}
          >
            {filePreview || thumbnail ? (
              <img
                src={filePreview}
                alt='Avatar Preview'
                style={{
                  width: '100%',
                  maxHeight: 300,
                  objectFit: 'cover',
                  borderRadius: 8,
                }}
              />
            ) : (
              <>
                <p className='ant-upload-drag-icon'>
                  <UploadOutlined />
                </p>
                <p className='ant-upload-text'>
                  Click or drag file to this area to upload
                </p>
              </>
            )}
          </Upload.Dragger>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default ProfileThumbnailEditor
