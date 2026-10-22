import React, { useEffect, useState } from 'react'
import { Col, Form, Input, Modal, Row, Button, Card, Select } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import Swal from 'sweetalert2'

//  zustand stores
import useAlbumStore from '../../../../Stores/setups/album.store'
import useSubCategoryStore from '../../../../Stores/setups/subCategory.store'

const EditAlbum = (props) => {
  const { open, setOpen, access_token, propData } = props
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  //  store
  const { fetchAlbumById, updateAlbum, album } = useAlbumStore()
  const {
    fetchSubCategory,
    subCategories,
    loading: subLoading,
  } = useSubCategoryStore()

  //  fetch sub categories only when modal open (cached)
  useEffect(() => {
    if (!open) return
    if (!access_token) return

    fetchSubCategory({
      access_token,
      search: '',
      force: false, //  use cache
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, access_token])

  //  fetch album detail only when modal open + id exists (cached)
  useEffect(() => {
    if (!open) return
    const _id = propData?._id
    if (!_id || !access_token) return

    fetchAlbumById({
      access_token,
      _id,
      force: true, //  do not re-request if already same
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, propData?._id, access_token])

  //  set form when album is ready
  useEffect(() => {
    if (!open) return
    if (!album?._id) return

    form.setFieldsValue({
      _id: album?._id,
      nameEn: album?.nameEn,
      nameKh: album?.nameKh,

      // if backend returns subCategory as array of ids, keep it
      // if it returns objects, map to _id
      subCategoryId: Array.isArray(album?.subCategory)
        ? album.subCategory.map((x) => (typeof x === 'string' ? x : x?._id)).filter(Boolean)
        : [],
      description: album?.description,
    })
  }, [album, open, form])

  const onFinish = async () => {
    setLoading(true)
    try {
      const values = await form.validateFields()

      const doc = {
        _id: values._id,
        nameEn: values.nameEn,
        nameKh: values.nameKh,
        subCategory: values.subCategoryId, //  array (multiple)
        description: values.description,
      }

      const res = await updateAlbum({ access_token, doc })

      if (res) {
        setOpen(false)
        form.resetFields()

        Swal.fire({
          icon: 'success',
          title: 'Upload Successful!',
          text: 'The information has been updated successfully.',
          showConfirmButton: false,
          timer: 1500,
        })
      }
    } catch (err) {
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

  const handleCancel = () => {
    setOpen(false)
    form.resetFields()
  }

  return (
    <Modal
      title='Edit Album'
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
            style={{ minWidth: '120px', borderRadius: '8px' }}
          >
            update
          </Button>
        </div>
      }
    >
      <Card>
        <Form form={form} layout='vertical' name='edit_album'>
          <Form.Item hidden name='_id'>
            <Input />
          </Form.Item>

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

            {/* <Col xs={24}>
              <Form.Item
                label='SubCategory'
                name='subCategoryId'
                className='m-0 p-0'
                rules={[{ required: true, message: 'Category is required!' }]}
              >
                <Select
                  mode='multiple'
                  showSearch
                  allowClear
                  loading={subLoading}
                  placeholder='Select sub categories'
                  options={(subCategories || []).map((item) => ({
                    value: item._id,
                    label: `${item.nameEn} – ${item.nameKh}`,
                  }))}
                  optionFilterProp='label'
                />
              </Form.Item>
            </Col> */}

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

export default EditAlbum
