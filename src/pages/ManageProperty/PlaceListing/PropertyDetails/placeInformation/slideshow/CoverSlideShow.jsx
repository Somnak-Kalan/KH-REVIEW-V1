import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Spin } from 'antd'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import {
  Navigation,
  Pagination,
} from 'swiper/modules'

import {
  CaretRightOutlined,
  LeftOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  RightOutlined,
} from '@ant-design/icons'

import PreviewImage from './PreviewImage'
import ImageLoading from '../../../../../../components/Loading/ImageLoading'

// Stable default values.
// Do not place array, object, or function defaults directly
// inside the component parameters.
const EMPTY_GALLERIES = []
const identityFile = (value) => value

const useStableStringArray = (values) => {
  const valueRef = useRef([])

  const isSame =
    valueRef.current.length === values.length &&
    valueRef.current.every(
      (item, index) => item === values[index]
    )
  if (!isSame) {
    valueRef.current = values
  }

  return valueRef.current
}

export default function CoverSlideshow({
  galleries = EMPTY_GALLERIES,
  media,
  getFileByName = identityFile,
}) {
  const carouselRef = useRef(null)
  const prevActive = useRef(0)

  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)

  const [imageLoadingMap, setImageLoadingMap] =
    useState({})

  const [imageErrorMap, setImageErrorMap] =
    useState({})

  const [videoLoading, setVideoLoading] =
    useState(false)

  const [startIdx, setStartIdx] = useState(0)

  const safeGalleries = Array.isArray(galleries)
    ? galleries
    : EMPTY_GALLERIES
  const videoSrc = useMemo(() => {
    const rawVideo = media?.video

    if (Array.isArray(rawVideo)) {
      const firstVideo = rawVideo[0]

      if (typeof firstVideo === 'string') {
        return firstVideo
      }

      return (
        firstVideo?.original ||
        firstVideo?.url ||
        firstVideo?.path ||
        ''
      )
    }

    if (typeof rawVideo === 'string') {
      return rawVideo
    }

    return (
      rawVideo?.original ||
      rawVideo?.url ||
      rawVideo?.path ||
      ''
    )
  }, [media?.video])

  const computedImages = safeGalleries
    .flatMap((gallery) => {
      return Array.isArray(gallery?.files)
        ? gallery.files
        : []
    })
    .map((file) => {
      if (typeof file === 'string') {
        return file
      }

      return (
        file?.original ||
        file?.url ||
        file?.path ||
        ''
      )
    })
    .filter((src) => {
      return (
        typeof src === 'string' &&
        src.length > 0 &&
        src.includes('/original-')
      )
    })

  /*
   * Keep the same array reference while its values
   * have not actually changed.
   */
  const images = useStableStringArray(
    computedImages
  )

  const hasVideo = Boolean(videoSrc)

  const totalSlides =
    (hasVideo ? 1 : 0) + images.length

  /*
   * Pass a stable galleries reference to PreviewImage.
   * This also protects PreviewImage from prop-based loops.
   */
  const previewGalleries = useMemo(() => {
    return [
      {
        files: images,
      },
    ]
  }, [images])

  useEffect(() => {
    const nextLoadingMap = {}
    const nextErrorMap = {}

    images.forEach((src) => {
      nextLoadingMap[src] = true
      nextErrorMap[src] = false
    })

    setImageLoadingMap(nextLoadingMap)
    setImageErrorMap(nextErrorMap)
    setVideoLoading(hasVideo)
  }, [images, hasVideo, videoSrc])

  useEffect(() => {
    setActive((previous) => {
      if (totalSlides === 0) {
        return 0
      }

      const lastIndex = totalSlides - 1
      return Math.min(previous, lastIndex)
    })
  }, [totalSlides])

  const windowSize = 5
  const maxStart = Math.max(
    0,
    totalSlides - windowSize
  )

  const FORWARD_OFFSET = 3
  const BACKWARD_OFFSET = 1

  useEffect(() => {
    const offset =
      active > prevActive.current
        ? FORWARD_OFFSET
        : BACKWARD_OFFSET

    let nextStart = active - offset

    nextStart = Math.max(
      0,
      Math.min(nextStart, maxStart)
    )

    setStartIdx((previous) => {
      return previous === nextStart
        ? previous
        : nextStart
    })

    prevActive.current = active
  }, [active, maxStart])

  const handleImageLoaded = (src) => {
    setImageLoadingMap((previous) => {
      if (previous[src] === false) {
        return previous
      }

      return {
        ...previous,
        [src]: false,
      }
    })
  }

  const handleImageError = (src) => {
    setImageLoadingMap((previous) => ({
      ...previous,
      [src]: false,
    }))

    setImageErrorMap((previous) => ({
      ...previous,
      [src]: true,
    }))
  }

  const count = Math.max(
    0,
    Math.min(
      windowSize,
      totalSlides - startIdx
    )
  )

  const dotIndices = Array.from(
    { length: count },
    (_, index) => startIdx + index
  )

  const hasMedia =
    hasVideo || images.length > 0

  return (
    <>
      <PreviewImage
        open={open}
        setOpen={setOpen}
        galleries={previewGalleries}
        getFileByName={getFileByName}
      />

      <div className='relative w-full overflow-hidden rounded-lg'>
        {!hasMedia ? (
          <div
            style={{
              border: '1px solid #F3F3F3',
            }}
            className='flex h-[444px] flex-col items-center justify-center rounded-lg text-gray-500'
          >
            <PictureOutlined
              style={{
                fontSize: 48,
                color: '#9F9F9F',
              }}
            />

            <span
              className='mt-2'
              style={{
                color: '#9F9F9F',
              }}
            >
              There are not yet any media.
            </span>
          </div>
        ) : (
          <div className='flex h-[494px] items-center justify-center rounded-lg border'>
            <Swiper
              onSwiper={(swiper) => {
                carouselRef.current = swiper
              }}
              onSlideChange={(swiper) => {
                setActive(swiper.realIndex)
              }}
              modules={[
                Pagination,
                Navigation,
              ]}
              navigation={{
                nextEl:
                  '.custom-swiper-button-next',
                prevEl:
                  '.custom-swiper-button-prev',
              }}
              className='flex h-full items-center justify-center'
            >
              {hasVideo ? (
                <SwiperSlide key='video'>
                  <div className='relative h-full w-full bg-black'>
                    {videoLoading ? (
                      <div className='absolute inset-0 z-10 flex items-center justify-center bg-black/20'>
                        <Spin size='large' />
                      </div>
                    ) : null}

                    <video
                      src={videoSrc}
                      autoPlay
                      muted
                      loop
                      playsInline
                      onLoadedData={() => {
                        setVideoLoading(false)
                      }}
                      onCanPlay={() => {
                        setVideoLoading(false)
                      }}
                      onError={() => {
                        setVideoLoading(false)
                      }}
                      className='h-full w-full rounded-lg object-cover'
                      style={{
                        opacity: videoLoading
                          ? 0
                          : 1,
                        transition:
                          'opacity 0.3s ease',
                      }}
                    />

                    <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 transition-opacity duration-300 hover:opacity-50'>
                      <PlayCircleOutlined
                        style={{
                          fontSize: 48,
                          color: '#FFF',
                        }}
                      />
                    </div>
                  </div>
                </SwiperSlide>
              ) : null}

              {images.map((src, index) => {
                const isLoading =
                  imageLoadingMap[src] === true

                const isError =
                  imageErrorMap[src] === true

                return (
                  <SwiperSlide
                    key={src || index}
                  >
                    <div className='relative h-full w-full bg-gray-100'>
                      {isLoading &&
                        !isError ? (
                        <div className='absolute inset-0 z-10 flex items-center justify-center bg-white/40'>
                          <ImageLoading
                            overlay={false}
                            size={80}
                            logoSize={40}
                          />
                        </div>
                      ) : null}

                      {isError ? (
                        <div className='flex h-full w-full flex-col items-center justify-center text-gray-400'>
                          <PictureOutlined
                            style={{
                              fontSize: 40,
                            }}
                          />

                          <span className='mt-2'>
                            Image not available
                          </span>
                        </div>
                      ) : (
                        <img
                          src={src}
                          alt={`slide-${index}`}
                          onLoad={() => {
                            handleImageLoaded(src)
                          }}
                          onError={() => {
                            handleImageError(src)
                          }}
                          className='h-full w-full rounded-lg object-cover'
                          style={{
                            opacity: isLoading
                              ? 0
                              : 1,
                            transition:
                              'opacity 0.3s ease',
                          }}
                        />
                      )}

                      <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 transition-opacity duration-300 hover:opacity-50' />
                    </div>
                  </SwiperSlide>
                )
              })}
            </Swiper>

            <div className='absolute bottom-4 left-1/2 z-40 flex -translate-x-1/2 space-x-1'>
              {dotIndices.map((index) => (
                <button
                  type='button'
                  key={index}
                  onClick={() => {
                    carouselRef.current?.slideTo(
                      index
                    )
                  }}
                  className={`h-2 w-2 rounded-full transition-all ${index === active
                    ? 'scale-125 bg-active-business-detail'
                    : 'bg-InActive-business-detail'
                    }`}
                />
              ))}
            </div>

            <div className='custom-swiper-button-prev absolute left-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg bg-black/40 text-white transition hover:bg-black/60'>
              <LeftOutlined
                style={{
                  fontSize: 20,
                }}
              />
            </div>

            <div className='custom-swiper-button-next absolute right-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg bg-black/40 text-white transition hover:bg-black/60'>
              <RightOutlined
                style={{
                  fontSize: 20,
                }}
              />
            </div>

            <button
              type='button'
              onClick={() => {
                setOpen(true)
              }}
              className='absolute bottom-4 left-4 z-20 flex cursor-pointer items-center gap-1 rounded bg-black/40 px-2 py-1 text-sm text-white'
            >
              <span className='font-medium'>
                {totalSlides}
              </span>

              <PictureOutlined
                style={{
                  fontSize: 14,
                }}
              />

              <CaretRightOutlined
                style={{
                  fontSize: 14,
                }}
              />
            </button>
          </div>
        )}
      </div>
    </>
  )
}