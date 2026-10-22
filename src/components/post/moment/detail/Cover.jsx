import React, { useState, useMemo } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { FreeMode, Navigation, Thumbs, Mousewheel } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/free-mode'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'

const Cover = ({ media = [], coverUrl, aspectRatio = '4/3' }) => {
    const [thumbsSwiper, setThumbsSwiper] = useState(null)

    const safeThumbsSwiper =
        thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null

    const hasMedia = Array.isArray(media) && media.length > 0

    const mediaList = useMemo(() => {
        return Array.isArray(media) ? media : []
    }, [media])

    const coverIndex = useMemo(() => {
        const idx = mediaList.findIndex((m) => m?.isCover === true)
        return idx >= 0 ? idx : 0
    }, [mediaList])

    const safeAspectRatio = useMemo(() => {
        if (!aspectRatio || typeof aspectRatio !== 'string') return '4 / 3'
        return aspectRatio.replace('/', ' / ')
    }, [aspectRatio])

    const renderMainSlide = (item, index) => {
        if (!item) return null

        if (item.type === 'video') {
            const poster =
                item.videoCoverUrl ||
                coverUrl ||
                'https://placehold.co/800x450/000000/FFFFFF?text=Video'

            return (
                <div className="relative w-full h-full">
                    <video
                        src={item.url}
                        controls
                        className="w-full h-full object-contain"
                        poster={poster}
                    >
                        Your browser does not support the video tag.
                    </video>

                </div>
            )
        }

        return (
            <div className="relative w-full h-full">
                <img
                    src={item.url}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                        e.target.src =
                            'https://placehold.co/800x450/cccccc/333333?text=No+Image'
                    }}
                />

            </div>
        )
    }
    const renderThumb = (item, index) => {
        if (!item) return null

        if (item.type === 'video') {
            const thumbSrc =
                item.videoCoverUrl ||
                coverUrl ||
                'https://placehold.co/120x80/000000/FFFFFF?text=Video'

            return (
                <div className="relative w-full h-full">
                    <img
                        src={thumbSrc}
                        alt={`Thumb ${index + 1}`}
                        className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <svg
                            className="w-6 h-6 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path d="M6 4l10 6-10 6V4z" />
                        </svg>
                    </div>
                </div>
            )
        }

        return (
            <img
                src={item.url}
                alt={`Thumb ${index + 1}`}
                className="w-full h-full object-contain"
                onError={(e) => {
                    e.target.src =
                        'https://placehold.co/120x80/cccccc/333333?text=Img'
                }}
            />
        )
    }

    if (!hasMedia) {
        return (
            <div className="w-full relative">
                <div className="w-full" style={{ aspectRatio: safeAspectRatio }}>
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm rounded-lg">
                        No media
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full relative">

            {/* PREV */}
            <div className="custom-swiper-button-prev  absolute left-2 sm:left-3 md:left-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer"> <svg className="text-white border border-gray-300 rounded-full hover:bg-gray-700/50 transition-colors duration-300 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" viewBox="0 0 24 24" fill="currentColor" > <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" /> </svg>
            </div>

            {/* NEXT */}
            <div className="custom-swiper-button-next absolute right-2 sm:right-3 md:right-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer"> <svg className="text-white border border-gray-300 rounded-full hover:bg-gray-700/50 transition-colors duration-300 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10" viewBox="0 0 24 24" fill="currentColor" > <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" /> </svg>
            </div>

            {/* MAIN IMAGE */}
            <Swiper
                spaceBetween={10}
                initialSlide={coverIndex}
                navigation={{
                    nextEl: '.custom-swiper-button-next',
                    prevEl: '.custom-swiper-button-prev',
                }}
                loop={true}
                thumbs={{ swiper: safeThumbsSwiper }}
                modules={[FreeMode, Navigation, Thumbs]}
            >
                {mediaList.map((item, index) => (
                    <SwiperSlide key={item._id || index}>
                        <div
                            className="w-full rounded-lg overflow-hidden bg-black flex items-center justify-center"
                            style={{ aspectRatio: safeAspectRatio }}
                        >
                            {renderMainSlide(item, index)}
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* THUMBNAILS */}
            <div className="mt-3">
                <Swiper
                    onSwiper={setThumbsSwiper}
                    spaceBetween={8}
                    slidesPerView={4}
                    freeMode={{
                        enabled: true,
                        momentum: true,
                    }}
                    mousewheel={{
                        forceToAxis: true,
                    }}
                    watchSlidesProgress={true}
                    modules={[FreeMode, Navigation, Thumbs, Mousewheel]}
                    breakpoints={{
                        0: { slidesPerView: 3 },
                        640: { slidesPerView: 3 },
                        1024: { slidesPerView: 4 },
                        1200: { slidesPerView: 5 },
                    }}
                    style={{ width: '100%', cursor: 'grab' }}
                >
                    {mediaList.map((item, index) => (
                        <SwiperSlide
                            key={item._id || `thumb-${index}`}
                            className="cursor-pointer"
                        >
                            <div
                                className="w-full rounded-md overflow-hidden border border-gray-700 bg-black"
                                style={{ aspectRatio: safeAspectRatio }}
                            >
                                {renderThumb(item, index)}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    )
}

export default Cover