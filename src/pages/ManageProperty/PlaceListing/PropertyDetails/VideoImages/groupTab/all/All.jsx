import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Row,
  Col,
  Typography,
  Button,
  message,
  Empty,
  Spin,
} from 'antd'
import {
  DeleteOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'


import PreviewImage from '../../../placeInformation/slideshow/PreviewImage'
import ImageLoading from '../../../../../../../components/Loading/ImageLoading'

const { Title, Text } = Typography

const buildGalleryGroups = galleries => {
  const groupMap = new Map()

    ; (galleries || []).forEach(
      (gallery, galleryIndex) => {
        const album = gallery?.album || null

        const albumKey =
          album?._id || '__photo__'

        const nameEn =
          album?.nameEn?.trim() || 'Photo'

        const nameKh =
          album?.nameKh?.trim() || 'Photo'

        if (!groupMap.has(albumKey)) {
          groupMap.set(albumKey, {
            key: albumKey,
            album,
            albumId: album?._id || null,
            nameEn,
            nameKh,
            galleryIds: [],
            images: [],
          })
        }

        const group =
          groupMap.get(albumKey)

        if (
          gallery?._id &&
          !group.galleryIds.includes(gallery._id)
        ) {
          group.galleryIds.push(gallery._id)
        }

        const files = Array.isArray(
          gallery?.files
        )
          ? gallery.files
          : []

        files
          .filter(
            file =>
              typeof file === 'string' &&
              file.trim()
          )
          .forEach((file, fileIndex) => {
            group.images.push({
              id: `${gallery?._id || galleryIndex}-${fileIndex}`,
              galleryId: gallery?._id,
              albumId: album?._id || null,
              albumKey,
              albumNameEn: nameEn,
              albumNameKh: nameKh,
              url: file,
            })
          })
      }
    )

  return Array.from(groupMap.values())
}

export default function All({
  videos = [],
  gallery = [],
  id,
  access_token,
  getBusinessProperty,
  getFileByName,
}) {
  const [open, setOpen] = useState(false)
  const [
    previewInitialImageUrl,
    setPreviewInitialImageUrl,
  ] = useState('')
  const [
    previewGalleries,
    setPreviewGalleries,
  ] = useState([])

  const [
    deleteImageByUrl,
    setDeleteImageByUrl,
  ] = useState(null)

  const [imgLoading, setImgLoading] =
    useState({})

  const [videoLoading, setVideoLoading] =
    useState({})

  const imgTimersRef = useRef({})
  const videoTimersRef = useRef({})

  const galleryGroups = useMemo(
    () => buildGalleryGroups(gallery),
    [gallery]
  )

  const allImages = useMemo(
    () =>
      galleryGroups.flatMap(
        group => group.images
      ),
    [galleryGroups]
  )

  const normalizedVideos = useMemo(() => {
    if (!Array.isArray(videos)) {
      return []
    }

    return videos.filter(
      video =>
        typeof video === 'string' && video
    )
  }, [videos])

  const startImgSpin = url => {
    if (!url) return

    setImgLoading(previous => ({
      ...previous,
      [url]: true,
    }))

    const oldTimer =
      imgTimersRef.current?.[url]

    if (oldTimer) {
      clearTimeout(oldTimer)
    }

    imgTimersRef.current[url] =
      setTimeout(() => {
        setImgLoading(previous => {
          const next = { ...previous }

          delete next[url]

          return next
        })

        delete imgTimersRef.current[url]
      }, 4000)
  }

  const stopImgSpin = url => {
    if (!url) return

    const timer =
      imgTimersRef.current?.[url]

    if (timer) {
      clearTimeout(timer)
      delete imgTimersRef.current[url]
    }

    setImgLoading(previous => {
      const next = { ...previous }

      delete next[url]

      return next
    })
  }

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
    allImages.forEach(image => {
      startImgSpin(image.url)
    })
  }, [allImages])

  useEffect(() => {
    normalizedVideos.forEach(videoUrl => {
      startVideoSpin(videoUrl)
    })
  }, [normalizedVideos])

  useEffect(() => {
    return () => {
      Object.values(
        imgTimersRef.current || {}
      ).forEach(timer => {
        clearTimeout(timer)
      })

      Object.values(
        videoTimersRef.current || {}
      ).forEach(timer => {
        clearTimeout(timer)
      })

      imgTimersRef.current = {}
      videoTimersRef.current = {}
    }
  }, [])

  const refreshProperty = async () => {
    if (
      typeof getBusinessProperty ===
      'function'
    ) {
      await getBusinessProperty(id, true)
    }
  }

  const onHandleRemoveImage = async item => {
    if (!item?.galleryId || !item?.url) {
      message.error(
        'Could not identify this image.'
      )
      return
    }

    try {
      setDeleteImageByUrl(item.url)

      await PropertyAlbumServices.removeImageGallery(
        {
          _id: id,

          // Property gallery record ID
          albumId: item.galleryId,

          doc: {
            galleryFile: item.url,
          },
          access_token,
        }
      )

      await refreshProperty()

      message.success(
        'Image removed successfully.'
      )
    } catch (error) {
      console.error(error)

      message.error(
        'Could not delete image, please try again.'
      )
    } finally {
      setDeleteImageByUrl(null)
    }
  }

  const onHandlePreview = item => {
    const group =
      galleryGroups.find(
        current =>
          current.key ===
          item.albumKey
      )

    if (!group) return

    // Remember exactly
    // which image user clicked.
    setPreviewInitialImageUrl(
      item.url
    )

    setPreviewGalleries([
      {
        _id:
          group.galleryIds[0],

        category_gallery:
          group.nameEn,

        album:
          group.album,

        files:
          group.images.map(
            image =>
              image.url
          ),
      },
    ])

    setOpen(true)
  }

  const handlePreviewVideo = videoUrl => {
    Swal.fire({
      html: '<div id="all-video-preview"></div>',
      showCloseButton: true,
      showConfirmButton: false,
      width: '70%',
      padding: '12px',
      background: '#fff',
      didOpen: () => {
        const container =
          document.getElementById(
            'all-video-preview'
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

  const renderImageTile = item => (
    <div
      style={{
        position: 'relative',
        borderRadius: 8,
        overflow: 'hidden',
        background: '#f0f0f0',
        border: '1px solid #E1ECF4',
      }}
    >
      <div
        style={{
          width: '100%',
          paddingBottom: '56.25%',
          position: 'relative',
        }}
      >
        <img
          src={item.url}
          alt={item.albumNameEn}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            cursor: 'pointer',
            filter: imgLoading[item.url]
              ? 'blur(1px)'
              : 'none',
          }}
          onClick={() =>
            onHandlePreview(item)
          }
          onLoad={() =>
            stopImgSpin(item.url)
          }
          onError={() =>
            startImgSpin(item.url)
          }
        />

        {imgLoading[item.url] && (
          <ImageLoading />
        )}
      </div>

      <Button
        type='text'
        danger
        icon={<DeleteOutlined />}
        loading={
          deleteImageByUrl === item.url
        }
        onClick={() =>
          onHandleRemoveImage(item)
        }
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          width: 32,
          height: 32,
          padding: 0,
          background:
            'rgba(238,0,0,0.85)',
          borderRadius: '50%',
          color: '#fff',
          zIndex: 10,
        }}
      />

      <Button
        type='link'
        onClick={() =>
          onHandlePreview(item)
        }
        style={{
          position: 'absolute',
          bottom: 8,
          left: 8,
          height: 28,
          padding: '0 14px',
          background:
            'rgba(0,0,0,0.55)',
          color: '#fff',
          borderRadius: 6,
          fontSize: 12,
          zIndex: 10,
        }}
      >
        Preview
      </Button>
    </div>
  )

  const hasMedia =
    normalizedVideos.length > 0 ||
    allImages.length > 0

  return (
    <div className='my-5 px-4'>

      <PreviewImage
        open={open}
        setOpen={
          setOpen
        }
        galleries={
          previewGalleries
        }
        getFileByName={
          getFileByName
        }
        initialImageUrl={
          previewInitialImageUrl
        }
      />

      {!hasMedia && (
        <div
          style={{
            border:
              '1px dashed #d9d9d9',
            borderRadius: 8,
            padding: 24,
            background: '#fafafa',
          }}
        >
          <Empty description='No media' />
        </div>
      )}

      {normalizedVideos.length > 0 && (
        <>
          <Title
            level={5}
            style={{ fontWeight: 500 }}
          >
            Video
          </Title>

          <Row gutter={[16, 16]}>
            {normalizedVideos.map(
              (videoUrl, index) => {
                const loading =
                  videoLoading[videoUrl]

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
                        position:
                          'relative',
                        width: '100%',
                        paddingBottom:
                          '56.25%',
                        background:
                          '#000',
                        borderRadius: 8,
                        overflow: 'hidden',
                        border:
                          '1px solid #E1ECF4',
                      }}
                    >
                      <video
                        src={videoUrl}
                        controls
                        preload='metadata'
                        style={{
                          position:
                            'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          filter: loading
                            ? 'blur(1px)'
                            : 'none',
                        }}
                        onLoadStart={() =>
                          startVideoSpin(
                            videoUrl
                          )
                        }
                        onLoadedData={() =>
                          stopVideoSpin(
                            videoUrl
                          )
                        }
                        onCanPlay={() =>
                          stopVideoSpin(
                            videoUrl
                          )
                        }
                        onError={() =>
                          startVideoSpin(
                            videoUrl
                          )
                        }
                      />

                      {loading && (
                        <div
                          style={{
                            position:
                              'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'center',
                            background:
                              'rgba(255,255,255,0.35)',
                            pointerEvents:
                              'none',
                          }}
                        >
                          <Spin />
                        </div>
                      )}

                      <Button
                        type='link'
                        icon={
                          <PlayCircleOutlined />
                        }
                        onClick={() =>
                          handlePreviewVideo(
                            videoUrl
                          )
                        }
                        style={{
                          position:
                            'absolute',
                          bottom: 8,
                          left: 8,
                          height: 28,
                          padding:
                            '0 12px',
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
              }
            )}
          </Row>
        </>
      )}

      {galleryGroups.map(group => {
        if (!group.images.length) {
          return null
        }

        return (
          <div
            key={group.key}
            style={{ marginTop: 24 }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <Title
                level={5}
                style={{
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                {group.nameEn}
              </Title>

              {group.nameKh !==
                group.nameEn && (
                  <Text type='secondary'>
                    ({group.nameKh})
                  </Text>
                )}

              <Text type='secondary'>
                {group.images.length}{' '}
                {group.images.length === 1
                  ? 'image'
                  : 'images'}
              </Text>
            </div>

            <Row gutter={[16, 16]}>
              {group.images.map(image => (
                <Col
                  key={image.id}
                  xs={24}
                  sm={12}
                  md={8}
                  lg={6}
                >
                  {renderImageTile(image)}
                </Col>
              ))}
            </Row>
          </div>
        )
      })}
    </div>
  )
}