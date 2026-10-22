import React, { useState, useRef } from 'react'
import { Form, message } from 'antd'
import { CloudUploadOutlined } from '@ant-design/icons'

export default function ImageUploader({ form }) {
  // ← receive form
  const [preview, setPreview] = useState(null) // for the <img>
  const fileInputRef = useRef(null)

  /* ——— handle file pick ——— */
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      setPreview(reader.result) // show picture
      form.setFieldsValue({ image: file }) // write to form ✅
    }
    reader.readAsDataURL(file)

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  /* ——— clear ——— */
  const handleRemoveImage = () => {
    setPreview(null)
    form.setFieldsValue({ image: null }) // ← clear field
  }

  return (
    <Form.Item
      label='Upload Thumbnail (recommended size …)'
      name='image' // field name
      valuePropName='file' // tell Form what we store
      getValueFromEvent={(e) => (e?.file ? e.file : null)} // (keeps Form happy)
      rules={[{ required: true, message: 'field required' }]}

    >
      <div style={{ width: 200 }} className='relative'>
        <label
          htmlFor='image-upload'
          className='flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50'
        >
          {preview ? (
            <img
              src={preview}
              alt='Preview'
              className='object-cover w-full h-full rounded-lg'
            />
          ) : (
            <CloudUploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          )}
        </label>

        <input
          id='image-upload'
          ref={fileInputRef}
          type='file'
          accept='image/*'
          style={{ display: 'none' }}
          onChange={handleImageChange}
        />

        {preview && (
          <button
            type='button'
            onClick={handleRemoveImage}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <i
              className='fa-regular fa-circle-xmark'
              style={{
                fontSize: 20,
                color: 'red',
                borderRadius: 10,
                padding: 4,
              }}
            />
          </button>
        )}
      </div>
    </Form.Item>
  )
}
