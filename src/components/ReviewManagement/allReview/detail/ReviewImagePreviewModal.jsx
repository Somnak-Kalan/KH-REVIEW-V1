// // src/components/ReviewManagement/allReview/detail/ReviewImagePreviewModal.jsx

// import {
//     CloseOutlined,
//     LeftOutlined,
//     RightOutlined,
// } from '@ant-design/icons'
// import { Modal } from 'antd'
// import {
//     useEffect,
//     useMemo,
//     useRef,
//     useState,
// } from 'react'
// import {
//     Swiper,
//     SwiperSlide,
// } from 'swiper/react'
// import {
//     Mousewheel,
//     Navigation,
// } from 'swiper/modules'

// import 'swiper/css'
// import 'swiper/css/navigation'
// import './ReviewImagePreviewModal.css'

// const getImageUrl = (image) => {
//     if (!image) return ''

//     if (typeof image === 'string') {
//         return image
//     }

//     return (
//         image?.original ||
//         image?.url ||
//         image?.path ||
//         image?.thumbnail ||
//         image?.thumb ||
//         ''
//     )
// }

// const ReviewImagePreviewModal = ({
//     open,
//     images = [],
//     initialIndex = 0,
//     onClose,
// }) => {
//     const swiperRef = useRef(null)
//     const previousRef = useRef(null)
//     const nextRef = useRef(null)

//     const [currentIndex, setCurrentIndex] =
//         useState(0)

//     const validImages = useMemo(() => {
//         if (!Array.isArray(images)) {
//             return []
//         }

//         return images
//             .map(getImageUrl)
//             .filter(Boolean)
//     }, [images])

//     const safeInitialIndex = useMemo(() => {
//         if (!validImages.length) {
//             return 0
//         }

//         const index =
//             Number(initialIndex) || 0

//         return Math.min(
//             Math.max(index, 0),
//             validImages.length - 1
//         )
//     }, [
//         initialIndex,
//         validImages.length,
//     ])

//     useEffect(() => {
//         if (!open) return

//         setCurrentIndex(
//             safeInitialIndex
//         )

//         const timer =
//             window.setTimeout(() => {
//                 const swiper =
//                     swiperRef.current

//                 if (!swiper) return

//                 swiper.slideTo(
//                     safeInitialIndex,
//                     0
//                 )

//                 swiper.update()
//             }, 0)

//         return () => {
//             window.clearTimeout(timer)
//         }
//     }, [
//         open,
//         safeInitialIndex,
//     ])

//     const handleClose = () => {
//         setCurrentIndex(0)
//         onClose?.()
//     }

//     return (
//         <Modal
//             open={open}
//             title='Preview Image'
//             centered
//             width='95vw'
//             footer={null}
//             destroyOnClose
//             maskClosable
//             closeIcon={
//                 <CloseOutlined
//                     style={{
//                         fontSize: 15,
//                     }}
//                 />
//             }
//             className='review-preview-modal'
//             onCancel={handleClose}
//             styles={{
//                 body: {
//                     padding: 0,
//                     overflow: 'hidden',
//                 },
//             }}
//         >
//             <div className='review-preview-container'>
//                 {!validImages.length ? (
//                     <div className='review-preview-empty'>
//                         No images available.
//                     </div>
//                 ) : (
//                     <>
//                         <Swiper
//                             key={`${open}-${safeInitialIndex}-${validImages.length}`}
//                             initialSlide={
//                                 safeInitialIndex
//                             }
//                             slidesPerView={1}
//                             spaceBetween={0}
//                             loop={false}
//                             grabCursor
//                             mousewheel={{
//                                 forceToAxis: true,
//                                 sensitivity: 1,
//                             }}
//                             modules={[
//                                 Navigation,
//                                 Mousewheel,
//                             ]}
//                             navigation={{
//                                 prevEl:
//                                     previousRef.current,
//                                 nextEl:
//                                     nextRef.current,
//                             }}
//                             onInit={(swiper) => {
//                                 swiper.params.navigation.prevEl =
//                                     previousRef.current

//                                 swiper.params.navigation.nextEl =
//                                     nextRef.current

//                                 swiper.navigation.destroy()
//                                 swiper.navigation.init()
//                                 swiper.navigation.update()
//                             }}
//                             onSwiper={(swiper) => {
//                                 swiperRef.current =
//                                     swiper

//                                 swiper.slideTo(
//                                     safeInitialIndex,
//                                     0
//                                 )
//                             }}
//                             onSlideChange={(swiper) => {
//                                 setCurrentIndex(
//                                     swiper.activeIndex
//                                 )
//                             }}
//                             className='review-preview-swiper'
//                         >
//                             {validImages.map(
//                                 (
//                                     image,
//                                     index
//                                 ) => (
//                                     <SwiperSlide
//                                         key={`${image}-${index}`}
//                                         className='review-preview-slide'
//                                     >
//                                         <div
//                                             className='review-preview-blur'
//                                             style={{
//                                                 backgroundImage: `url("${image}")`,
//                                             }}
//                                         />

//                                         <div className='review-preview-overlay' />

//                                         <div className='review-preview-main-image-wrapper'>
//                                             <img
//                                                 src={
//                                                     image
//                                                 }
//                                                 alt={`Review image ${index + 1}`}
//                                                 className='review-preview-main-image'
//                                                 onError={(
//                                                     event
//                                                 ) => {
//                                                     event.currentTarget.style.display =
//                                                         'none'
//                                                 }}
//                                             />
//                                         </div>
//                                     </SwiperSlide>
//                                 )
//                             )}

//                             {validImages.length >
//                                 1 ? (
//                                 <>
//                                     <button
//                                         ref={
//                                             previousRef
//                                         }
//                                         type='button'
//                                         aria-label='Previous image'
//                                         className='review-preview-arrow review-preview-arrow-left'
//                                     >
//                                         <LeftOutlined />
//                                     </button>

//                                     <button
//                                         ref={
//                                             nextRef
//                                         }
//                                         type='button'
//                                         aria-label='Next image'
//                                         className='review-preview-arrow review-preview-arrow-right'
//                                     >
//                                         <RightOutlined />
//                                     </button>
//                                 </>
//                             ) : null}
//                         </Swiper>

//                         <div className='review-preview-left-gradient' />

//                         <div className='review-preview-right-gradient' />

//                         <div className='review-preview-counter'>
//                             {currentIndex + 1}/
//                             {validImages.length}
//                         </div>
//                     </>
//                 )}
//             </div>
//         </Modal>
//     )
// }

// export default ReviewImagePreviewModal
// src/components/ReviewManagement/allReview/detail/ReviewImagePreviewModal.jsx

import {
    CloseOutlined,
    LeftOutlined,
    RightOutlined,
} from '@ant-design/icons'

import {
    Modal,
} from 'antd'

import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import {
    Swiper,
    SwiperSlide,
} from 'swiper/react'

import {
    Mousewheel,
    Navigation,
} from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'

import './ReviewImagePreviewModal.css'

const ReviewImagePreviewModal = ({
    open,
    images = [],
    initialIndex = 0,
    onClose,
}) => {
    const swiperRef = useRef(null)
    const previousRef = useRef(null)
    const nextRef = useRef(null)

    const [
        currentIndex,
        setCurrentIndex,
    ] = useState(0)

    const validImages = useMemo(() => {
        return Array.isArray(images)
            ? images.filter(Boolean)
            : []
    }, [images])

    const safeIndex = useMemo(() => {
        if (!validImages.length) {
            return 0
        }

        return Math.min(
            Math.max(
                Number(initialIndex) || 0,
                0
            ),
            validImages.length - 1
        )
    }, [
        initialIndex,
        validImages.length,
    ])

    useEffect(() => {
        if (!open) {
            return
        }

        setCurrentIndex(safeIndex)

        const timer =
            window.setTimeout(() => {
                swiperRef.current?.slideTo(
                    safeIndex,
                    0
                )
            }, 0)

        return () => {
            window.clearTimeout(timer)
        }
    }, [
        open,
        safeIndex,
    ])

    return (
        <Modal
            open={open}
            title='Preview Image'
            centered
            width='95vw'
            footer={null}
            destroyOnClose
            closeIcon={<CloseOutlined />}
            className='review-image-preview-modal'
            onCancel={onClose}
            styles={{
                body: {
                    padding: 0,
                    overflow: 'hidden',
                },
            }}
        >
            <div className='review-preview-wrapper'>
                {validImages.length > 0 ? (
                    <>
                        <Swiper
                            key={`${open}-${safeIndex}-${validImages.length}`}
                            initialSlide={safeIndex}
                            slidesPerView={1}
                            spaceBetween={0}
                            loop={false}
                            grabCursor
                            modules={[
                                Navigation,
                                Mousewheel,
                            ]}
                            mousewheel={{
                                forceToAxis: true,
                            }}
                            navigation={{
                                prevEl:
                                    previousRef.current,
                                nextEl:
                                    nextRef.current,
                            }}
                            onBeforeInit={(swiper) => {
                                swiper.params.navigation.prevEl =
                                    previousRef.current

                                swiper.params.navigation.nextEl =
                                    nextRef.current
                            }}
                            onInit={(swiper) => {
                                swiper.navigation.init()
                                swiper.navigation.update()
                            }}
                            onSwiper={(swiper) => {
                                swiperRef.current =
                                    swiper

                                swiper.slideTo(
                                    safeIndex,
                                    0
                                )
                            }}
                            onSlideChange={(swiper) => {
                                setCurrentIndex(
                                    swiper.activeIndex
                                )
                            }}
                            className='review-preview-swiper'
                        >
                            {validImages.map(
                                (image, index) => (
                                    <SwiperSlide
                                        key={`${image}-${index}`}
                                        className='review-preview-slide'
                                    >
                                        <div
                                            className='review-preview-background'
                                            style={{
                                                backgroundImage: `url("${image}")`,
                                            }}
                                        />

                                        <div className='review-preview-foreground'>
                                            <img
                                                src={image}
                                                alt={`Review ${index + 1}`}
                                                className='review-preview-main-image'
                                            />
                                        </div>
                                    </SwiperSlide>
                                )
                            )}

                            {validImages.length > 1 ? (
                                <>
                                    <button
                                        ref={previousRef}
                                        type='button'
                                        className='review-preview-arrow review-preview-arrow-left'
                                    >
                                        <LeftOutlined />
                                    </button>

                                    <button
                                        ref={nextRef}
                                        type='button'
                                        className='review-preview-arrow review-preview-arrow-right'
                                    >
                                        <RightOutlined />
                                    </button>
                                </>
                            ) : null}
                        </Swiper>

                        <div className='review-preview-count'>
                            {currentIndex + 1}/
                            {validImages.length}
                        </div>
                    </>
                ) : (
                    <div className='review-preview-empty'>
                        No images available
                    </div>
                )}
            </div>
        </Modal>
    )
}

export default ReviewImagePreviewModal