import React, { useContext } from 'react'
import { Modal, Form, Input, Divider } from 'antd'
import Swal from 'sweetalert2'
import OtherServiceNonBusinessProperty from '../../../../services/ManageProperty/PlaceListing/Other'
import { AuthContext } from '../../../../contexts/AuthContext'

export default function AddComment({ open, setOpen, id, handleSuccess }) {
  const [form] = Form.useForm()
  const { user, access_token } = useContext(AuthContext)

  const handleSave = async () => {
    try {
      const { comment } = await form.validateFields()
      // Call your API
      await OtherServiceNonBusinessProperty.addComment({
        doc: { text: comment, author: user?.username, id },
        access_token,
      })
      // Success toast
      Swal.fire({
        icon: 'success',
        title: 'Comment saved successfully!',
        timer: 1500,
        showConfirmButton: false,
      })
      // Reset & close
      form.resetFields()
      setOpen(false)
      if (typeof handleSuccess === 'function') {
        handleSuccess?.({
          success: true,
        })
      }
    } catch (err) {
      // validation failed or API error
      console.error(err)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setOpen(false)
  }

  return (
    <Modal
      title='Create Comment'
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
      <Form form={form} layout='vertical' initialValues={{ comment: '' }}>
        <Form.Item
          name='comment'
          rules={[{ required: true, message: 'Please enter a comment' }]}
        >
          <Input.TextArea rows={4} placeholder='Enter Comment' />
        </Form.Item>
      </Form>
      <Divider />
    </Modal>
  )
}
