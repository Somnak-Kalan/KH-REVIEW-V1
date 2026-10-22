import React, { useContext, useState } from 'react'
import { Col, Form, Modal, Row, Button, Card, message } from 'antd'
import UploadForm from './Upload'
import './Province.css'
import ProvinceServices from '../../../services/setup/Province'
import { AuthContext } from '../../../contexts/AuthContext'
import Swal from 'sweetalert2'

const EditProvince = ({ open, setOpen, id, getProvinceById }) => {
  const [form] = Form.useForm()
  const { access_token } = useContext(AuthContext)

  const [btnLoading, setBtnLoading] = useState(false)
  const [fileList, setFileList] = useState([])

  //  tailwind animation state
  const [entered, setEntered] = useState(false)

  const onFinish = async () => {
    setBtnLoading(true)
    try {
      const values = await form.validateFields()

      const uploadedFiles = values.image || []

      const images = uploadedFiles
        .filter((file) => file.type?.startsWith('image'))
        .map((file) => file.originFileObj)
        .filter(Boolean)

      const videos = uploadedFiles
        .filter((file) => file.type?.startsWith('video'))
        .map((file) => file.originFileObj)
        .filter(Boolean)

      const formData = new FormData()
      images.forEach((image) => formData.append('images', image))
      videos.forEach((video) => formData.append('videos', video))

      // debug
      for (const [k, v] of formData.entries()) {
        if (v instanceof File) console.log(k, { name: v.name, size: v.size, type: v.type })
        else console.log(k, v)
      }

      //  IMPORTANT: send _id separate + formData inside doc
      const res = await ProvinceServices.UpdateProvince({
        access_token,
        doc: { _id: id, formData },
      })

      if (res) {
        form.resetFields()
        setOpen(false)
        setFileList([])
        getProvinceById?.(id)

        Swal.fire({
          icon: 'success',
          title: 'Upload Successful!',
          text: 'The information has been updated successfully.',
          showConfirmButton: false,
          timer: 1500,
        })
      }
    } catch (err) {
      console.error(err)
      message.error(err?.response?.data?.message || 'Upload Failed!')

      Swal.fire({
        icon: 'error',
        title: 'Upload Failed!',
        text: 'Something went wrong while updating.',
        timer: 1500,
      })
    } finally {
      setBtnLoading(false)
    }
  }

  const handleCancel = () => {
    setOpen(false)
    try {
      form.resetFields()
    } catch { }
    setFileList([])
  }

  return (
    <Modal
      title="EditCover"
      open={open}
      width={650}
      centered
      closable={!btnLoading}
      onCancel={handleCancel}
      destroyOnHidden
      maskClosable={false}
      afterOpenChange={(isOpen) => {
        if (isOpen) requestAnimationFrame(() => setEntered(true))
        else setEntered(false)
      }}
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="primary"
            onClick={onFinish}
            loading={btnLoading}
            className="min-w-[120px] !rounded-lg"
          >
            Update
          </Button>
        </div>
      }
    >
      <div
        className={[
          'transition-all duration-300 ease-out',
          entered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-[0.99]',
        ].join(' ')}
      >
        <Card>
          <Form form={form} layout="vertical" name="edit_province">
            <Row gutter={[8, 2]}>
              <Col xs={24} className="text-center">
                <UploadForm form={form} fileList={fileList} setFileList={setFileList} />
              </Col>
            </Row>
          </Form>
        </Card>
      </div>
    </Modal>
  )
}

export default EditProvince
