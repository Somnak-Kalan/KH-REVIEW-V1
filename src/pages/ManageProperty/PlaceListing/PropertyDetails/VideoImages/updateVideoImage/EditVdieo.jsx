import React, { useState, useEffect } from 'react'
import { Modal, Upload, Typography, message, Card, Spin } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import Swal from 'sweetalert2'

const { Dragger } = Upload
const { Title, Text } = Typography
import AllPropertyServices from '../../../../../../services/ManageProperty/PlaceListing/AllProperty'

export default function EditVideo({
  open,
  setOpen,
  action,
  access_token,
  getFileByName,
  videos,
  id,
  getBusinessProperty,
}) {
  const [fileList, setFileList] = useState([])
  const [previewVideo, setPreviewVideo] = useState(null)
  const [btn_loading, setBtnLoading] = useState(false)

  //  spin state
  const [videoLoading, setVideoLoading] = useState(false)

  //  prevent spin forever
  const [spinTimeoutId, setSpinTimeoutId] = useState(null)

  const startSpinWithTimeout = () => {
    setVideoLoading(true)

    // clear previous timeout
    if (spinTimeoutId) {
      try {
        clearTimeout(spinTimeoutId)
      } catch { }
    }

    // stop spinner automatically after 4 seconds (avoid forever)
    const t = setTimeout(() => {
      setVideoLoading(false)
    }, 4000)

    setSpinTimeoutId(t)
  }

  const stopSpin = () => {
    setVideoLoading(false)
    if (spinTimeoutId) {
      try {
        clearTimeout(spinTimeoutId)
      } catch { }
      setSpinTimeoutId(null)
    }
  }

  // reset on open
  useEffect(() => {
    if (open) setFileList([])
    const videoUrl = videos
    setPreviewVideo(videoUrl)

    //  if have existing video => spin until it loads
    if (videoUrl) startSpinWithTimeout()
    else {
      //  if no video => show spin shortly, then stop (not forever)
      startSpinWithTimeout()
    }
  }, [open])

  // cleanup timeout on unmount / close
  useEffect(() => {
    if (!open) stopSpin()
    return () => {
      if (spinTimeoutId) {
        try {
          clearTimeout(spinTimeoutId)
        } catch { }
      }
    }
  }, [open])

  const handleSubmit = async () => {
    setBtnLoading(true)
    try {
      const formData = new FormData()
      formData.append('videos', fileList?.[0]?.originFileObj)

      const res = await AllPropertyServices.updatePropertyVideo({
        _id: id,
        doc: formData,
        access_token,
      })
      if (res) {
        Swal.fire({
          icon: 'success',
          title: 'Updated',
          timer: 1200,
          showConfirmButton: false,
        }).then(() => {
          setOpen(false)
          setFileList([])
          setBtnLoading(false)
          // getBusinessProperty(id)
        })
      } else {
        setBtnLoading(false)
      }
    } catch { }
  }

  const dragProps = {
    name: 'file',
    multiple: false,
    accept: 'video/*',
    action,
    fileList,
    maxCount: 1,
    showUploadList: false,
    beforeUpload: (file) =>
      new Promise((resolve) => {
        //  start spin while checking metadata + preparing preview
        startSpinWithTimeout()

        const url = URL.createObjectURL(file)
        const video = document.createElement('video')
        video.preload = 'metadata'
        video.src = url

        video.onloadedmetadata = () => {
          URL.revokeObjectURL(url)
          if (video.duration <= 120) resolve(true)
          else {
            message.error('Video must be 2 minutes or shorter.')
            stopSpin()
            resolve(Upload.LIST_IGNORE)
          }
        }

        video.onerror = () => {
          URL.revokeObjectURL(url)
          message.error('Failed to read video.')
          stopSpin()
          resolve(Upload.LIST_IGNORE)
        }
      }),
    onChange(info) {
      const newList = info.fileList.slice(-1)
      setFileList(newList)

      //  keep spin until <video> loads
      if (newList?.[0]?.originFileObj) startSpinWithTimeout()
    },
  }

  const handleCancel = () => {
    setOpen(false)
    setFileList([])
    setBtnLoading(false)
    stopSpin()
  }

  return (
    <Modal
      title='Upload Video'
      open={open}
      onCancel={() => handleCancel()}
      onOk={() => handleSubmit()}
      okText='Upload'
      cancelText='Cancel'
      width='60%'
      confirmLoading={btn_loading}
    >
      <hr className='my-5' />
      <Card>
        <div style={{ background: '#fff', borderRadius: 8 }}>
          <Title level={5}>Upload Video</Title>
          <Text type='secondary'>
            Upload Video (Video can post only and maximum 2 mn)
          </Text>

          <div>
            <Dragger {...dragProps} style={{ width: 200, height: 100 }}>
              {fileList[0] ? (
                <div style={{ position: 'relative' }}>
                  <video
                    src={
                      fileList[0].url ||
                      URL.createObjectURL(fileList[0].originFileObj)
                    }
                    style={{ width: '100%', height: '20vh', objectFit: 'cover' }}
                    controls
                    onLoadedData={() => stopSpin()}
                    onCanPlay={() => stopSpin()}
                    onError={() => {
                      stopSpin()
                      message.error('Failed to load selected video preview.')
                    }}
                  />
                  {videoLoading && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.35)',
                      }}
                    >
                      <Spin />
                    </div>
                  )}
                </div>
              ) : previewVideo ? (
                <div style={{ position: 'relative' }}>
                  <video
                    src={previewVideo}
                    style={{
                      width: '100%',
                      height: '20vh',
                      objectFit: 'cover',
                    }}
                    controls
                    onLoadedData={() => stopSpin()}
                    onCanPlay={() => stopSpin()}
                    onError={() => {
                      stopSpin()
                      // message.error('Failed to load existing video preview.')
                    }}
                  />
                  {videoLoading && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.35)',
                      }}
                    >
                      <Spin />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div
                    style={{
                      height: '20vh',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 8,
                      position: 'relative',
                    }}
                  >
                    <InboxOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                    <div style={{ marginTop: 8, color: '#888' }}>
                      Upload Video
                    </div>

                    {/*  if no video, show spin shortly (not forever) */}
                    {videoLoading && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 8,
                          background: 'rgba(255,255,255,0.35)',
                        }}
                      >
                        <Spin />
                      </div>
                    )}
                  </div>
                </>
              )}
            </Dragger>
          </div>
        </div>
      </Card>
      <hr className='my-5' />
    </Modal>
  )
}
