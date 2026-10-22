import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react'
import { Modal, Tabs } from 'antd'
import {
  CloseOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons'
import {
  Swiper,
  SwiperSlide,
} from 'swiper/react'
import {
  Navigation,
  Mousewheel,
  FreeMode,
} from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/mousewheel'
import 'swiper/css/free-mode'
import './PreviewImage.css'

// ⬇️ TabPane import removed; no longer needed
// const { TabPane } = Tabs

export default function PreviewImage({
  open,
  setOpen,
  galleries = [],
  getFileByName = p => p,
  onPreview = () => { },
  onDelete = () => { },

  // ✅ NEW
  // The image clicked from AlbumGallery / All page.
  initialImageUrl = '',
}) {
  /* ------------------------------------------------------------------ */
  /* 1. Flatten galleries → items array                                 */
  /* ------------------------------------------------------------------ */

  const items = useMemo(
    () =>
      galleries?.flatMap(g =>
        (g.files || [])
          .filter(
            file =>
              file &&
              file.includes(
                '/original-'
              )
          )
          .map((file, i) => ({
            id: `${g._id}-${i}`,
            url: file,
            album:
              g.category_gallery ||
              'Other',
          }))
      ),
    [galleries, getFileByName]
  )

  /* ------------------------------------------------------------------ */
  /* 2. Build album list (“All” + unique categories)                    */
  /* ------------------------------------------------------------------ */

  const albums = useMemo(() => {
    const cats = galleries.map(
      g =>
        g.category_gallery ||
        'Other'
    )

    return Array.from(
      new Set(['All', ...cats])
    )
  }, [galleries])

  // const slides = /* your data array */;
  const slidesPerView = 3

  const canLoop =
    albums.length > slidesPerView

  /* ------------------------------------------------------------------ */
  /* 3. Tabs state + Swiper refs                                        */
  /* ------------------------------------------------------------------ */

  const [
    activeKey,
    setActiveKey,
  ] = useState('All')

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0)

  const swiperRef = useRef(null)
  const prevRef = useRef(null)
  const nextRef = useRef(null)

  /* ------------------------------------------------------------------ */
  /* 4. Filter items by selected album                                  */
  /* ------------------------------------------------------------------ */

  const filtered = useMemo(
    () =>
      activeKey === 'All'
        ? items
        : items.filter(
          it =>
            it.album ===
            activeKey
        ),
    [items, activeKey]
  )

  /* ------------------------------------------------------------------ */
  /* ✅ 4.1 Find index of image that user clicked                       */
  /* ------------------------------------------------------------------ */

  const clickedImageIndex =
    useMemo(() => {
      if (
        !initialImageUrl ||
        !filtered.length
      ) {
        return 0
      }

      const index =
        filtered.findIndex(
          item =>
            item.url ===
            initialImageUrl
        )

      return index >= 0
        ? index
        : 0
    }, [
      filtered,
      initialImageUrl,
    ])

  /* ------------------------------------------------------------------ */
  /* ✅ 4.2 Move Swiper to clicked image whenever preview opens         */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (
      !open ||
      !filtered.length
    ) {
      return
    }

    setCurrentIndex(
      clickedImageIndex
    )

    const swiper =
      swiperRef.current

    if (!swiper) {
      return
    }

    const timer =
      window.requestAnimationFrame(
        () => {
          if (
            !swiper ||
            swiper.destroyed
          ) {
            return
          }

          swiper.update()

          if (
            swiper.params.loop &&
            typeof swiper.slideToLoop ===
            'function'
          ) {
            swiper.slideToLoop(
              clickedImageIndex,
              0,
              false
            )

            return
          }

          swiper.slideTo(
            clickedImageIndex,
            0,
            false
          )
        }
      )

    return () => {
      window.cancelAnimationFrame(
        timer
      )
    }
  }, [
    open,
    clickedImageIndex,
    filtered.length,
  ])

  /* ------------------------------------------------------------------ */
  /* 5. Build Ant-Design v5 `items` array for Tabs                      */
  /* ------------------------------------------------------------------ */

  const tabItems = useMemo(
    () =>
      albums.map(alb => ({
        key: alb,
        label: alb,
      })),
    [albums]
  )

  /* ------------------------------------------------------------------ */
  /* 6. Render                                                          */
  /* ------------------------------------------------------------------ */

  return (
    <Modal
      open={open}
      title='Preview Image'
      onCancel={() =>
        setOpen(false)
      }
      footer={null}
      width='80%'
      styles={{
        padding: 0,
        overflow: 'hidden',
      }}
      closeIcon={
        <CloseOutlined
          style={{
            fontSize: 18,
          }}
        />
      }
    >
      {/* Tabs */}
      <div
        style={{
          padding: 0,
          background: '#fff',
        }}
      >
        <Tabs
          items={tabItems}
          activeKey={activeKey}
          onChange={k => {
            setActiveKey(k)

            /*
             * Keep your old behavior
             * when manually changing
             * album tabs.
             */
            setCurrentIndex(0)
          }}
          className='tab-image-property-preview'
          style={{
            borderBottom: 'none',
          }}
          animated={false}
          size='large'
          tabBarGutter={16}
        />

        {/* Slide container */}
        <div className='preview-slide-wrapper'>
          {filtered.length ===
            0 ? (
            <div className='no-images-placeholder'>
              No images available.
            </div>
          ) : (
            <>
              <Swiper
                onInit={swiper => {
                  swiper.params.navigation.prevEl =
                    prevRef.current

                  swiper.params.navigation.nextEl =
                    nextRef.current

                  swiper.navigation.init()
                  swiper.navigation.update()

                  /*
                   *  When Swiper is
                   * first initialized,
                   * immediately show
                   * the clicked image.
                   */
                  if (
                    swiper.params
                      .loop &&
                    typeof swiper.slideToLoop ===
                    'function'
                  ) {
                    swiper.slideToLoop(
                      clickedImageIndex,
                      0,
                      false
                    )
                  } else {
                    swiper.slideTo(
                      clickedImageIndex,
                      0,
                      false
                    )
                  }
                }}
                modules={[
                  Navigation,
                  Mousewheel,
                  FreeMode,
                ]}
                navigation={{
                  prevEl:
                    '.custom-swiper-button-prev',

                  nextEl:
                    '.custom-swiper-button-next',
                }}
                mousewheel={{
                  forceToAxis: true,
                }}
                freeMode
                grabCursor
                initialSlide={
                  clickedImageIndex
                }
                onSwiper={sw => {
                  swiperRef.current =
                    sw
                }}
                onSlideChange={sw =>
                  setCurrentIndex(
                    sw.realIndex
                  )
                }
                slidesPerView={1}
                spaceBetween={0}
                loop={canLoop}
                className='h-[70vh]'
              >
                {filtered.map(it => (
                  <SwiperSlide
                    key={it.id}
                    className='slide-pane'
                  >
                    {/* 1) Blurred background */}
                    <div
                      className='slide-background'
                      style={{
                        backgroundImage: `url(${it.url})`,
                      }}
                    />

                    {/* 2) Foreground image */}
                    <div className='slide-foreground-wrapper'>
                      <img
                        src={it.url}
                        alt=''
                        className='slide-img-sharp'
                      />
                    </div>
                  </SwiperSlide>
                ))}

                {/* Custom arrows */}
                <div
                  ref={prevRef}
                  className='custom-swiper-button-prev nav-arrow'
                >
                  <LeftOutlined className='arrow-icon' />
                </div>

                <div
                  ref={nextRef}
                  className='custom-swiper-button-next nav-arrow'
                >
                  <RightOutlined className='arrow-icon' />
                </div>
              </Swiper>

              {/* Edge gradients + counter */}
              <div className='gradient-overlay left' />

              <div className='gradient-overlay right' />

              <div className='preview-count'>
                {`${currentIndex + 1}/${filtered.length}`}
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}