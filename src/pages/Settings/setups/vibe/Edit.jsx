import { useEffect } from 'react'
import {
  Button,
  Form,
  Input,
  Modal,
  Spin,
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
    'Something went wrong while updating the vibe.'
  )
}

const EditVibe = ({
  open,
  setOpen,
  access_token,
  propData,
}) => {
  const [form] = Form.useForm()

  const detailLoading = useVibeStore(
    (state) => state.detailLoading
  )

  const updateLoading = useVibeStore(
    (state) => state.updateLoading
  )

  const fetchVibeById = useVibeStore(
    (state) => state.fetchVibeById
  )

  const updateVibe = useVibeStore(
    (state) => state.updateVibe
  )

  const clearVibeDetail = useVibeStore(
    (state) => state.clearVibeDetail
  )

  useEffect(() => {
    if (!open || !propData?._id) return

    let isMounted = true

    form.setFieldsValue({
      _id: propData._id,
      nameEn: propData?.nameEn || '',
      nameKh: propData?.nameKh || '',
      description:
        propData?.description &&
          propData.description !== 'undefined'
          ? propData.description
          : '',
    })

    const loadDetail = async () => {
      try {
        const detail = await fetchVibeById({
          access_token,
          _id: propData._id,
        })

        if (!isMounted || !detail) return

        form.setFieldsValue({
          _id: detail?._id || propData._id,
          nameEn: detail?.nameEn || '',
          nameKh: detail?.nameKh || '',
          description:
            detail?.description &&
              detail.description !== 'undefined'
              ? detail.description
              : '',
        })
      } catch (error) {
        console.error('Fetch vibe detail error:', error)
      }
    }

    loadDetail()

    return () => {
      isMounted = false
    }
  }, [
    open,
    propData?._id,
    access_token,
    fetchVibeById,
    form,
  ])

  useEffect(() => {
    if (!open) {
      form.resetFields()
      clearVibeDetail()
    }
  }, [open, form, clearVibeDetail])

  const handleCancel = () => {
    if (updateLoading) return

    setOpen(false)
    form.resetFields()
    clearVibeDetail()
  }

  const handleSubmit = async () => {
    if (!propData?._id) {
      Swal.fire({
        icon: 'error',
        title: 'Data Not Found!',
        text: 'Vibe information was not found.',
      })

      return
    }

    try {
      const values = await form.validateFields()

      const doc = {
        _id: values._id || propData._id,
        nameEn: values.nameEn.trim(),
        nameKh: values.nameKh.trim(),
      }

      await updateVibe({
        access_token,
        doc,
      })

      form.resetFields()
      clearVibeDetail()
      setOpen(false)

      await Swal.fire({
        icon: 'success',
        title: 'Updated Successfully!',
        text: 'The vibe has been updated successfully.',
        showConfirmButton: false,
        timer: 1500,
      })
    } catch (error) {
      if (error?.errorFields) return

      console.error('Update vibe error:', error)

      Swal.fire({
        icon: 'error',
        title: 'Update Failed!',
        text: getErrorMessage(error),
      })
    }
  }

  return (
    <Modal
      title='Edit Vibe'
      open={open}
      width={520}
      centered
      destroyOnClose
      closable={!updateLoading}
      maskClosable={!updateLoading}
      keyboard={!updateLoading}
      onCancel={handleCancel}
      footer={
        <div className='flex justify-end gap-2'>
          <Button
            disabled={updateLoading}
            onClick={handleCancel}
          >
            Cancel
          </Button>

          <Button
            type='primary'
            loading={updateLoading}
            onClick={handleSubmit}
            className='min-w-[120px]'
          >
            Save change
          </Button>
        </div>
      }
    >
      <Spin spinning={detailLoading}>
        <Form
          form={form}
          layout='vertical'
          name='edit_vibe_form'
          preserve={false}
          className='pt-3'
        >
          <Form.Item
            hidden
            name='_id'
          >
            <Input />
          </Form.Item>

          <Form.Item
            label='Vibe Name (English)'
            name='nameEn'
            rules={[
              {
                required: true,
                whitespace: true,
                message:
                  'Vibe name in English is required.',
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
                message:
                  'Vibe name in Khmer is required.',
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
      </Spin>
    </Modal>
  )
}

export default EditVibe