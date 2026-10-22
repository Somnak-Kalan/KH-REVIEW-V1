import React, { useEffect, useState } from 'react'
import { Col, Form, Input, Modal, Row, Button, Card, Select } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import Swal from 'sweetalert2'

//  zustand stores
import useAlbumStore from '../../../../Stores/setups/album.store'
import useSubCategoryStore from '../../../../Stores/setups/subCategory.store'

const AddAlbum = (props) => {
  const { open, setOpen, access_token, getAlbum } = props
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  //  store
  const { createAlbum } = useAlbumStore()
  const {
    fetchSubCategory,
    subCategories,
    loading: subLoading,
  } = useSubCategoryStore()

  //  fetch subCategory only when modal open (and store will cache)
  useEffect(() => {
    if (!open) return
    if (!access_token) return

    fetchSubCategory({
      access_token,
      search: '',
      force: false, //  use cache if already fetched
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, access_token])

  const onFinish = async () => {
    setLoading(true)
    try {
      const values = await form.validateFields()

      const doc = {
        nameEn: values.nameEn,
        nameKh: values.nameKh,
        subCategory: values.subCategoryId, // array (multiple)
        description: values.description,
      }

      const res = await createAlbum({ access_token, doc })

      if (res) {
        setOpen(false)
        form.resetFields()

        // optional: if your parent still uses getAlbum()
        if (typeof getAlbum === 'function') getAlbum()

        Swal.fire({
          icon: 'success',
          title: 'Upload Successful!',
          text: 'The information has been add successfully.',
          showConfirmButton: false,
          timer: 1500,
        })
      }
    } catch (err) {
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

  const handleCancel = () => {
    setOpen(false)
    form.resetFields()
  }

  return (
    <Modal
      title='Add Album'
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
            style={{
              minWidth: '120px',
              borderRadius: '8px',
            }}
          >
            save
          </Button>
        </div>
      }
    >
      <Card>
        <Form form={form} layout='vertical' name='add_album'>
          <Row gutter={[8, 2]}>
            <Col xs={24}>
              <Form.Item
                label='Album En'
                name='nameEn'
                style={{ marginBottom: '0px' }}
                rules={[{ required: true, message: 'field require!' }]}
              >
                <Input placeholder='Enter album en' />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label='Album Kh'
                name='nameKh'
                style={{ marginBottom: '0px' }}
                rules={[{ required: true, message: 'field require!' }]}
              >
                <Input placeholder='Enter album kh' />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item label='Description' name='description'>
                <TextArea rows={4} placeholder='Enter description' />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </Modal>
  )
}

export default AddAlbum
