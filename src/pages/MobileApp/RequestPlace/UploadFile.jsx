import React, { useRef, useState } from 'react'
import { Col, Form, Row } from 'antd'
import { CloseCircleOutlined, CloudUploadOutlined } from '@ant-design/icons'
import Swal from 'sweetalert2' // Import SweetAlert2

const EditService = (props) => {
  const { upload1, upload2 } = props
  const [form] = Form.useForm()
  const [imagesSection1, setImagesSection1] = useState([])
  const [imagesSection2, setImagesSection2] = useState([])
  const fileInputRef1 = useRef(null)
  const fileInputRef2 = useRef(null)

  const handleImageChangeSection = (e, setImageState) => {
    const files = Array.from(e.target.files)
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        setImageState((prevImages) => [...prevImages, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImageSection = (imageToRemove, setImageState) => {
    setImageState((prevImages) =>
      prevImages.filter((image) => image !== imageToRemove)
    )
  }

  const handleImagePreview = (imageUrl) => {
    Swal.fire({
      title: '',
      imageUrl,
      imageAlt: 'Uploaded Image',
      showCloseButton: true,
      confirmButtonText: 'Close',
      showConfirmButton: false,
    })
  }

  return (
    <Form
      form={form}
      layout='vertical'
      name='edit_service'
      initialValues={{
        status: 'Active',
      }}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={12}>
          <Form.Item label={upload1} name='file1'>
            <div className='flex flex-col items-center w-full'>
              <label
                htmlFor='image-upload-1'
                className='flex items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50'
              >
                <span className='text-gray-500'>
                  <CloudUploadOutlined
                    style={{ fontSize: '48px', color: '#1890ff' }}
                  />
                </span>
              </label>
              <input
                ref={fileInputRef1}
                style={{ display: 'none' }}
                id='image-upload-1'
                type='file'
                accept='image/*'
                multiple
                onChange={(e) => handleImageChangeSection(e, setImagesSection1)}
              />
            </div>
            <div className='my-2'>
              {imagesSection1.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {imagesSection1.map((image, index) => (
                    <div key={index} className='relative border rounded-lg'>
                      <img
                        src={image}
                        alt={`Preview ${index}`}
                        className='object-cover w-16 h-16 rounded-lg cursor-pointer'
                        onClick={() => handleImagePreview(image)}
                      />
                      <button
                        className='absolute top-0 right-0 text-white'
                        onClick={() =>
                          handleRemoveImageSection(image, setImagesSection1)
                        }
                      >
                        <CloseCircleOutlined
                          style={{
                            fontSize: '20px',
                            background: 'red',
                            borderRadius: '50%',
                          }}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Form.Item>
        </Col>

        {/* Second Upload Section */}
        <Col xs={24} xl={12}>
          <Form.Item label={upload2} name='file2'>
            <div className='flex flex-col items-center w-full'>
              <label
                htmlFor='image-upload-2'
                className='flex items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50'
              >
                <span className='text-gray-500'>
                  <CloudUploadOutlined
                    style={{ fontSize: '48px', color: '#1890ff' }}
                  />
                </span>
              </label>
              <input
                ref={fileInputRef2}
                style={{ display: 'none' }}
                id='image-upload-2'
                type='file'
                accept='image/*'
                multiple
                onChange={(e) => handleImageChangeSection(e, setImagesSection2)}
              />
            </div>
            <div className='my-2'>
              {imagesSection2.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                  {imagesSection2.map((image, index) => (
                    <div key={index} className='relative border rounded-lg'>
                      <img
                        src={image}
                        alt={`Preview ${index}`}
                        className='object-cover w-16 h-16 rounded-lg cursor-pointer'
                        onClick={() => handleImagePreview(image)}
                      />
                      <button
                        className='absolute top-0 right-0 text-white'
                        onClick={() =>
                          handleRemoveImageSection(image, setImagesSection2)
                        }
                      >
                        <CloseCircleOutlined
                          style={{
                            fontSize: '20px',
                            background: 'red',
                            borderRadius: '50%',
                          }}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}

export default EditService
