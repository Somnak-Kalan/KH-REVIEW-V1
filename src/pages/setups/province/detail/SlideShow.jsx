import React, { useMemo, useRef, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import 'swiper/css'
import 'swiper/css/pagination'
import { Pagination } from 'swiper/modules'
import { Button, Spin } from 'antd'
import { LeftOutlined, RightOutlined, EditOutlined } from '@ant-design/icons'
import EditCover from "../EditCover"

const CoverSlideshow = ({
  images = [],
  videos = [],

  id,

  // optional: set fixed height
  heightClass = 'h-[220px] sm:h-[260px] md:h-[320px] lg:h-[420px]',
}) => {
  const swiperRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [openChangeCover, setOpenChangeCover] = useState(false)

  //  spinner state (ONLY for images)
  const [imgLoading, setImgLoading] = useState(() => new Set()) // index set

  const onChangeCover = (value, test) => {
    setOpenChangeCover(true)
  }

  const slides = useMemo(() => {
    const imgSlides = (images || [])
      .filter((src) => src && src.includes('/original-'))
      .map((src) => ({ type: 'image', src }))

    const videoSlides = (videos || [])
      .filter(Boolean)
      .map((src) => ({ type: 'video', src }))

    return [...imgSlides, ...videoSlides]
  }, [images, videos])

  const canNav = slides.length > 1

  const goPrev = () => swiperRef.current?.slidePrev()
  const goNext = () => swiperRef.current?.slideNext()

  if (!slides.length) {
    return (
      <div className={`w-full ${heightClass} bg-gray-100 rounded-xl flex items-center justify-center text-gray-500`}>
        No media
      </div>
    )
  }

  return (
    <>
      <EditCover open={openChangeCover} setOpen={setOpenChangeCover} id={id} />
      <div className="w-full relative">
        {/*  Top-right Change Cover button */}
        <div className="absolute top-3 right-3 z-20">
          <Button
            icon={<EditOutlined />}
            className="rounded-md bg-[#D4A106] cursor-pointer hover:bg-[#D4A106]"
            onClick={() => onChangeCover?.(slides[activeIndex], activeIndex)}
          >
            Change Cover
          </Button>
        </div>

        {/*  Left / Right circle buttons */}
        {canNav && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2
                       w-10 h-10 rounded-full flex items-center justify-center
                       bg-white/30 hover:bg-white/40 backdrop-blur
                       border border-white/40"
              aria-label="Previous slide"
            >
              <LeftOutlined className="text-white" />
            </button>

            <button
              type="button"
              onClick={goNext}
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2
                       w-10 h-10 rounded-full flex items-center justify-center
                       bg-white/30 hover:bg-white/40 backdrop-blur
                       border border-white/40"
              aria-label="Next slide"
            >
              <RightOutlined className="text-white" />
            </button>
          </>
        )}

        <Swiper
          onSwiper={(s) => (swiperRef.current = s)}
          onSlideChange={(s) => setActiveIndex(s.realIndex ?? s.activeIndex ?? 0)}
          spaceBetween={0}
          slidesPerView={1}
          centeredSlides
          loop={false}
          pagination={{ clickable: true }}
          modules={[Pagination]}
          style={{ width: '100%' }}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={`${slide.type}-${index}`}>
              <div className={`w-full ${heightClass} overflow-hidden rounded-xl bg-black relative`}>
                {slide.type === 'image' ? (
                  <>
                    {/*  Spinner overlay while image is loading / retrying */}
                    {imgLoading.has(index) && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
                        <Spin />
                      </div>
                    )}

                    <img
                      src={slide.src}
                      alt={`Cover Slide ${index + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onLoadStart={() => {
                        setImgLoading((prev) => {
                          const next = new Set(prev)
                          next.add(index)
                          return next
                        })
                      }}
                      onLoad={() => {
                        setImgLoading((prev) => {
                          const next = new Set(prev)
                          next.delete(index)
                          return next
                        })
                      }}
                      onError={() => {
                        // keep spinner if offline / failed, and auto-retry when internet is back
                        setImgLoading((prev) => {
                          const next = new Set(prev)
                          next.add(index)
                          return next
                        })

                        const retry = () => {
                          // force reload by busting cache
                          const el = document.querySelector(`img[data-slide-img="${index}"]`)
                          if (el) {
                            const url = new URL(slide.src, window.location.href)
                            url.searchParams.set('_t', String(Date.now()))
                            el.src = url.toString()
                          }
                        }

                        // try again when browser becomes online
                        const onOnline = () => {
                          retry()
                          window.removeEventListener('online', onOnline)
                        }
                        window.addEventListener('online', onOnline)
                      }}
                      data-slide-img={index}
                    />
                  </>
                ) : (
                  <video
                    src={slide.src}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  )
}

export default CoverSlideshow
