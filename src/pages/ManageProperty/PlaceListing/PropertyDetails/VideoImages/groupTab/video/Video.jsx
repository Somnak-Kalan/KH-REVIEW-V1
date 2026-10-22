import React, {
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  Row,
  Col,
  Button,
  Spin,
  Empty,
} from 'antd'
import { PlayCircleOutlined } from '@ant-design/icons'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

export default function Video({ videos = [] }) {
  const [videoLoading, setVideoLoading] =
    useState({})

  const videoTimersRef = useRef({})

  const startVideoSpin = url => {
    if (!url) return

    setVideoLoading(previous => ({
      ...previous,
      [url]: true,
    }))

    const oldTimer =
      videoTimersRef.current?.[url]

    if (oldTimer) {
      clearTimeout(oldTimer)
    }

    videoTimersRef.current[url] =
      setTimeout(() => {
        setVideoLoading(previous => {
          const next = { ...previous }

          delete next[url]

          return next
        })

        delete videoTimersRef.current[url]
      }, 4000)
  }

  const stopVideoSpin = url => {
    if (!url) return

    const timer =
      videoTimersRef.current?.[url]

    if (timer) {
      clearTimeout(timer)
      delete videoTimersRef.current[url]
    }

    setVideoLoading(previous => {
      const next = { ...previous }

      delete next[url]

      return next
    })
  }

  useEffect(() => {
    videos.forEach(url => {
      startVideoSpin(url)
    })

    return () => {
      Object.values(
        videoTimersRef.current || {}
      ).forEach(timer => {
        clearTimeout(timer)
      })

      videoTimersRef.current = {}
    }
  }, [videos])

  const handlePreview = videoUrl => {
    Swal.fire({
      html: '<div id="video-preview-container"></div>',
      showCloseButton: true,
      showConfirmButton: false,
      width: '60%',
      padding: '12px',
      background: '#fff',
      customClass: {
        popup: 'my-swal-popup',
      },
      didOpen: () => {
        const container =
          document.getElementById(
            'video-preview-container'
          )

        if (!container) return

        const video =
          document.createElement('video')

        video.src = videoUrl
        video.controls = true
        video.autoplay = true
        video.style.width = '100%'
        video.style.maxHeight = '70vh'
        video.style.objectFit = 'contain'
        video.style.background = '#000'
        video.style.borderRadius = '8px'

        container.appendChild(video)
      },
    })
  }

  if (!videos.length) {
    return (
      <div className='my-5 px-4'>
        <div
          style={{
            border: '1px dashed #d9d9d9',
            borderRadius: 8,
            padding: 24,
            background: '#fafafa',
          }}
        >
          <Empty description='No video' />
        </div>
      </div>
    )
  }

  return (
    <div className='my-5 px-4'>
      <Row gutter={[16, 16]}>
        {videos.map((videoUrl, index) => {
          const loading =
            videoLoading[videoUrl] === true

          return (
            <Col
              key={`${videoUrl}-${index}`}
              xs={24}
              sm={12}
              md={8}
              lg={6}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingBottom: '56.25%',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: '#000',
                  border: '1px solid #E1ECF4',
                }}
              >
                <video
                  src={videoUrl}
                  controls
                  preload='metadata'
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: loading
                      ? 'blur(1px)'
                      : 'none',
                  }}
                  onLoadStart={() =>
                    startVideoSpin(videoUrl)
                  }
                  onLoadedData={() =>
                    stopVideoSpin(videoUrl)
                  }
                  onCanPlay={() =>
                    stopVideoSpin(videoUrl)
                  }
                  onError={() =>
                    startVideoSpin(videoUrl)
                  }
                />

                {loading && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background:
                        'rgba(255,255,255,0.35)',
                      pointerEvents: 'none',
                    }}
                  >
                    <Spin />
                  </div>
                )}

                <Button
                  type='link'
                  icon={<PlayCircleOutlined />}
                  onClick={() =>
                    handlePreview(videoUrl)
                  }
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    height: 30,
                    padding: '0 12px',
                    background:
                      'rgba(0,0,0,0.6)',
                    color: '#fff',
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                >
                  Preview
                </Button>
              </div>
            </Col>
          )
        })}
      </Row>
    </div>
  )
}