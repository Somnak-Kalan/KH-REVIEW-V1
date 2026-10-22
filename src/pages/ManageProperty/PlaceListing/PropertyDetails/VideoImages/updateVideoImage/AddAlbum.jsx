import React, { useEffect, useState } from 'react'
import { Col, Form, Input, Modal, Row, Button, Card, Select } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import Swal from 'sweetalert2'
import SubCategoryServices from '../../../../../../services/setup/SubCategory'
import AlbumServices from '../../../../../../services/setup/Album'
const AddAlbum = (props) => {
  const { open, setOpen, access_token, getAlbum } = props
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [subCategory, setSubCategory] = useState([])
  const getSubCategory = async () => {
    try {
      const doc = { search: '' }
      const res = await SubCategoryServices.fetchSubCategory({
        access_token,
        doc,
      })
      if (res) {
        setSubCategory(res)
      }
    } catch { }
  }
  useEffect(() => {
    if (open === true) {
      getSubCategory()
    }
  }, [open])

  const onFinish = async () => {
    setLoading(true)
    try {
      const value = form.getFieldValue()
      const doc = {
        nameEn: value.nameEn,
        nameKh: value.nameKh,
        subCategory: value.subCategoryId,
        description: value.description,
      }
      const res = await AlbumServices.createAlbum({ access_token, doc })
      if (res) {
        setOpen(false)
        setLoading(false)
        form.resetFields()
        getAlbum()
        Swal.fire({
          icon: 'success',
          title: 'Upload Successful!',
          text: 'The information has been add successfully.',
          showConfirmButton: false,
          timer: 1500,
        })
      }
    } catch {
      setLoading(false)
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
                rules={[
                  {
                    required: true,
                    message: 'field require!',
                  },
                ]}
              >
                <Input placeholder='Enter album en' />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label='Album Kh'
                name='nameKh'
                style={{ marginBottom: '0px' }}
                rules={[
                  {
                    required: true,
                    message: 'field require!',
                  },
                ]}
              >
                <Input placeholder='Enter album kh' />
              </Form.Item>
            </Col>
            <Col xs={24}>
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
                  placeholder='Select sub categories'
                  options={subCategory.map((item) => ({
                    value: item._id,
                    label: `${item.nameEn} – ${item.nameKh}`,
                  }))}
                  optionFilterProp='label'
                />
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
