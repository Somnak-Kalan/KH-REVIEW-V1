import React, { useState, useEffect } from 'react'
import { Upload, Row, Col, Button, Form } from 'antd'
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons'
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

const UploadForm = ({ form, fileList, setFileList }) => {
  useEffect(() => {
    return () => {
      fileList.forEach((file) => {
        if (file.previewUrl) URL.revokeObjectURL(file.previewUrl)
      })
    }
  }, [fileList])

  const handleRemove = (file) => {
    setFileList((prev) => prev.filter((item) => item.uid !== file.uid))
    if (file.previewUrl) URL.revokeObjectURL(file.previewUrl) // Revoke URL
  }

  const handlePreview = (file) => {
    const fileObj = file.originFileObj || file // Ensure it's an object
    if (!fileObj || !fileObj.type) return // Prevent errors

    const isImage = fileObj.type.startsWith('image')
    const isVideo = fileObj.type.startsWith('video')
    if (isImage || isVideo) {
      const url = file.previewUrl || URL.createObjectURL(fileObj)
      if (isImage) {
        Swal.fire({
          imageUrl: url,
          imageWidth: '50%',
          imageHeight: 'auto',
          imageAlt: 'Preview',
          showConfirmButton: false,
          width: '50%',
        })
      } else {
        Swal.fire({
          html: `<video controls style='width: 100%; height: auto; max-height: 80vh; object-fit: contain; display: block; margin: auto;'>
                  <source src='${url}' type='video/mp4'>
                 </video>`,
          showConfirmButton: false,
          width: '50%',
        })
      }
    }
  }
  const handleChange = ({ fileList }) => {
    const updatedFiles = fileList.map((file) => ({
      ...file,
      previewUrl: file.previewUrl || URL.createObjectURL(file.originFileObj),
    }))
    setFileList(updatedFiles)
    form.setFieldsValue({ image: updatedFiles })
  }

  return (
    <div className='mb-3 ant-upload-list'>
      <Form.Item
        name='image'
        rules={[
          {
            required: true,
            message: 'Please upload at least one image or video!',
          },
        ]}
      >
        <Upload.Dragger
          multiple
          listType='picture-card'
          beforeUpload={() => false}
          onChange={handleChange}
          onRemove={handleRemove}
          onPreview={handlePreview}
          fileList={fileList}
        >
          <p className='ant-upload-drag-icon'>
            <UploadOutlined />
          </p>
          <p className='ant-upload-hint'>
            Only image and video files are allowed.
          </p>
        </Upload.Dragger>
      </Form.Item>

      <Row gutter={[16, 16]} style={{ marginTop: '10px' }}>
        {fileList.map((file) => (
          <Col key={file.uid} xs={12} sm={8} md={6} lg={4} xl={4} xxl={4}>
            <div className='upload-item'>
              <div style={{ width: '100%', height: '100%' }}>
                {file.type?.startsWith('image') ? (
                  <img
                    alt='preview'
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'fill',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                    src={file.previewUrl}
                    onClick={() => handlePreview(file)}
                  />
                ) : file.type?.startsWith('video') ? (
                  <video
                    autoPlay
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                    onClick={() => handlePreview(file)}
                  >
                    <source src={file.previewUrl} type={file.type} />
                  </video>
                ) : null}
              </div>
              <StyledButton
                type='text'
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleRemove(file)}
              />
            </div>
          </Col>
        ))}
      </Row>
    </div>
  )
}

export default UploadForm
