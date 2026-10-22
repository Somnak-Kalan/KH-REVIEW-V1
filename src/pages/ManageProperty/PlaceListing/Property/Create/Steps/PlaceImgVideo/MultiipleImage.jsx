import React, { useEffect, useState } from 'react'
import { Upload, Button, Input, Radio, Row, Col, message, Modal } from 'antd'
import { DeleteOutlined, CloudUploadOutlined } from '@ant-design/icons'
import Swal from 'sweetalert2'
import styled from 'styled-components'

const StyledButton = styled(Button)`
  position: absolute;
  top: 5px;
  right: 5px;
  transition:
    background 0.3s ease,
    border-bottom-left-radius 0.3s ease;
  &:hover {
    background: white !important;
    border-bottom-right-radius: 30px;
    transition: 0.4s;
  }
`

export default function MultipleImage({ onImagesChange }) {
  const [categories, setCategories] = useState(['All', 'Add Other Album'])
  const [activeCat, setActiveCat] = useState('All')

  const [imagesByCat, setImagesByCat] = useState({})
  // Normalize File object
  const getFileObject = (file) => file.originFileObj || file

  // Notify parent & local state
  const syncAndNotify = (next) => {
    setImagesByCat(next)
    onImagesChange?.([
      { category_gallery: activeCat, gallery: next[activeCat] || [] },
    ])
  }

  // Radio change handler
  const onCategoryChange = (e) => {
    const val = e.target.value
    setActiveCat(val)
    onImagesChange?.([
      { category_gallery: val, gallery: imagesByCat[val] || [] },
    ])
  }
  useEffect(() => {
    onImagesChange?.([
      { category_gallery: 'All', gallery: imagesByCat['All'] || [] },
    ])
  }, [])
  // Image upload handlers
  const handleImageChange =
    (cat) =>
    ({ fileList }) => {
      syncAndNotify({
        ...imagesByCat,
        [cat]: fileList.filter((f) => f.type?.startsWith('image')),
      })
    }

  const handleImageRemove = (cat, file) => {
    syncAndNotify({
      ...imagesByCat,
      [cat]: (imagesByCat[cat] || []).filter((f) => f.uid !== file.uid),
    })
  }
  const handleImagePreview = (file) => {
    const fileObj = getFileObject(file)
    if (!fileObj.type.startsWith('image')) return
    Swal.fire({
      imageUrl: URL.createObjectURL(fileObj),
      imageWidth: '50%',
      showConfirmButton: false,
      width: '50%',
    })
  }
  // Prevent auto‐upload and validate images
  const beforeUpload = (file) => {
    if (!file.type.startsWith('image')) {
      message.error('Only image files are allowed')
      return Upload.LIST_IGNORE
    }
    return false
  }

  return (
    <div>
      <h2 className='text-lg font-semibold'>Upload Images</h2>
      <p className='text-sm mb-2'>Please select image category</p>
      {/* Category selector with “Add Other Album” */}
      <Radio.Group
        value={activeCat}
        onChange={onCategoryChange}
        style={{ marginBottom: 8 }}
      >
        {categories.map((cat) => (
          <Radio key={cat} value={cat} style={{ marginRight: 16 }}>
            {cat}
          </Radio>
        ))}
      </Radio.Group>
      {/* only show uploader & thumbnails if NOT creating a new album */}
      {activeCat === 'All' && (
        <>
          <Upload.Dragger
            multiple
            accept='image/*'
            listType='picture-card'
            fileList={imagesByCat[activeCat]}
            beforeUpload={beforeUpload}
            onChange={handleImageChange(activeCat)}
            onPreview={handleImagePreview}
            onRemove={(file) => handleImageRemove(activeCat, file)}
            style={{ width: '100%' }}
            iconRender={() => <CloudUploadOutlined style={{ fontSize: 48 }} />}
          >
            <p className='ant-upload-hint'>Click to upload images</p>
          </Upload.Dragger>

          {/* Thumbnails */}
          <Row gutter={[16, 16]} className='mt-4'>
            {(imagesByCat[activeCat] || []).map((file) => {
              const url = URL.createObjectURL(getFileObject(file))
              return (
                <Col key={file.uid} xs={12} sm={8} md={6} lg={4}>
                  <div
                    style={{ position: 'relative', width: '100%', height: 100 }}
                  >
                    <img
                      src={url}
                      alt='preview'
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 8,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleImagePreview(file)}
                    />
                    <StyledButton
                      type='text'
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleImageRemove(activeCat, file)}
                    />
                  </div>
                </Col>
              )
            })}
          </Row>
        </>
      )}
    </div>
  )
}
