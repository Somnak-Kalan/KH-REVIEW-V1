import { useEffect } from 'react'
import {
  Button,
  Form,
  Input,
  Modal,
} from 'antd'
import TextArea from 'antd/es/input/TextArea'
import Swal from 'sweetalert2'

import useVibeStore from '../../../../Stores/settings/setups/vibe.store'

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.data ||
    error?.message ||
    'Something went wrong while adding the vibe.'
  )
}

const AddVibe = ({
  open,
  setOpen,
  access_token,
}) => {
  const [form] = Form.useForm()

  const createLoading = useVibeStore(
    (state) => state.createLoading
  )

  const createVibe = useVibeStore(
    (state) => state.createVibe
  )

  useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [open, form])

  const handleCancel = () => {
    if (createLoading) return

    setOpen(false)
    form.resetFields()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      const doc = {
        nameEn: values.nameEn.trim(),
        nameKh: values.nameKh.trim(),
      }

      await createVibe({
        access_token,
        doc,
      })

      form.resetFields()
      setOpen(false)

      await Swal.fire({
        icon: 'success',
        title: 'Added Successfully!',
        text: 'The vibe has been added successfully.',
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      if (error?.errorFields) return

      console.error('Create vibe error:', error)

      Swal.fire({
        icon: 'error',
        title: 'Add Failed!',
        text: getErrorMessage(error),
      })
    }
  }

  return (
    <Modal
      title='Add Vibe'
      open={open}
      width={520}
      centered
      destroyOnClose
      closable={!createLoading}
      maskClosable={!createLoading}
      keyboard={!createLoading}
      onCancel={handleCancel}
      footer={
        <div className='flex justify-end gap-2'>
          <Button
            disabled={createLoading}
            onClick={handleCancel}
          >
            Cancel
          </Button>

          <Button
            type='primary'
            loading={createLoading}
            onClick={handleSubmit}
            className='min-w-[110px]'
          >
            Add vibe
          </Button>
        </div>
      }
    >
      <Form
        form={form}
        layout='vertical'
        name='add_vibe_form'
        preserve={false}
        className='pt-3'
      >
        <Form.Item
          label='Vibe Name (English)'
          name='nameEn'
          rules={[
            {
              required: true,
              whitespace: true,
              message: 'Vibe name in English is required.',
            },
            {
              max: 100,
              message:
                'Vibe name cannot exceed 100 characters.',
            },
          ]}
        >
          <Input
            allowClear
            maxLength={100}
            placeholder='Enter vibe name in English'
          />
        </Form.Item>

        <Form.Item
          label='Vibe Name (Khmer)'
          name='nameKh'
          rules={[
            {
              required: true,
              whitespace: true,
              message: 'Vibe name in Khmer is required.',
            },
            {
              max: 100,
              message:
                'Vibe name cannot exceed 100 characters.',
            },
          ]}
        >
          <Input
            allowClear
            maxLength={100}
            placeholder='Enter vibe name in Khmer'
          />
        </Form.Item>

      </Form>
    </Modal>
  )
}

export default AddVibe