import React, { useState, useRef } from 'react'
import { Form, message } from 'antd'
import { CloudUploadOutlined } from '@ant-design/icons'

export default function VideoUploader({ form }) {
  // ← receive form
  const [previewUrl, setPreviewUrl] = useState(null)
  const fileInputRef = useRef(null)

  const handleVideoChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const url = URL.createObjectURL(file)
    const probe = document.createElement('video')
    probe.preload = 'metadata'
    probe.src = url
    probe.onloadedmetadata = () => {
      URL.revokeObjectURL(probe.src)
      if (probe.duration > 120) {
        message.error('Video is longer than 2 minutes')
        form.setFieldsValue({ video: null })
        setPreviewUrl(null)
      } else {
        setPreviewUrl(url)
        form.setFieldsValue({ video: file }) // write to form ✅
      }
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    form.setFieldsValue({ video: null })
  }

  return (
    <Form.Item
      label='Upload Video (max 2 min)'
      name='video'
      valuePropName='file'
      getValueFromEvent={(e) => (e?.file ? e.file : null)}
    >
      <div style={{ width: 200 }} className='relative'>
        <label
          htmlFor='video-upload'
          className='flex items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50'
        >
          {previewUrl ? (
            <video
              src={previewUrl}
              autoPlay
              muted
              loop
              controls
              className='object-cover w-full h-full rounded-lg'
            />
          ) : (
            <CloudUploadOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          )}
        </label>

        <input
          id='video-upload'
          ref={fileInputRef}
          type='file'
          accept='video/*'
          style={{ display: 'none' }}
          onChange={handleVideoChange}
        />

        {previewUrl && (
          <button
            type='button'
            onClick={handleRemove}
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
