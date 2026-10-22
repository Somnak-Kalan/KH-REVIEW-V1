import React, { useContext } from 'react'
import { Modal, Form, Input, Divider } from 'antd'
import Swal from 'sweetalert2'
import OtherServiceNonBusinessProperty from '../../../../services/ManageProperty/PlaceListing/Other'
import { AuthContext } from '../../../../contexts/AuthContext'

export default function AddRemark({ open, setOpen, id, handleSuccess }) {
  const [form] = Form.useForm()
  const { user, access_token } = useContext(AuthContext)

  const handleSave = async () => {
    try {
      const { remark } = await form.validateFields()
      await OtherServiceNonBusinessProperty.addRemark({
        doc: { text: remark, author: user.username, id },
        access_token,
      })
      Swal.fire({
        icon: 'success',
        title: 'remark saved successfully!',
        timer: 1500,
        showConfirmButton: false,
      })
      form.resetFields()
      setOpen(false)
      if (typeof handleSuccess === 'function') {
        handleSuccess?.({
          success: true,
        })
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setOpen(false)
  }

  return (
    <Modal
      title='Create Remark'
      open={open}
      onCancel={handleCancel}
      onOk={handleSave}
      okText='Save'
      cancelText='Cancel'
      styles={{
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.03)' },
      }}
    >
      <Divider />
      <Form form={form} layout='vertical' initialValues={{ remark: '' }}>
        <Form.Item
          name='remark'
          rules={[{ required: true, message: 'Please enter a remark' }]}
        >
          <Input.TextArea rows={4} placeholder='Enter remark' />
        </Form.Item>
      </Form>
      <Divider />
    </Modal>
  )
}
