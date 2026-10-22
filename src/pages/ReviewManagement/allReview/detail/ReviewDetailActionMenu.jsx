import {
    LeftOutlined,
    RightOutlined,
} from '@ant-design/icons'
import { Modal } from 'antd'
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react'

const ReviewImagePreviewModal = ({
    open,
    images = [],
    initialIndex = 0,
    onClose,
}) => {
    const [currentIndex, setCurrentIndex] =
        useState(0)

    const validImages = useMemo(() => {
        return Array.isArray(images)
            ? images.filter(Boolean)
            : []
    }, [images])

    useEffect(() => {
        if (!open || !validImages.length) {
            return
        }

        const safeIndex = Math.min(
            Math.max(Number(initialIndex) || 0, 0),
            validImages.length - 1
        )

        setCurrentIndex(safeIndex)
    }, [
        initialIndex,
        open,
        validImages.length,
    ])

    const handlePrevious = useCallback(() => {
        if (validImages.length <= 1) return

        setCurrentIndex((previousIndex) => {
            if (previousIndex === 0) {
                return validImages.length - 1
            }

            return previousIndex - 1
        })
    }, [validImages.length])

    const handleNext = useCallback(() => {
        if (validImages.length <= 1) return

        setCurrentIndex((previousIndex) => {
            if (
                previousIndex ===
                validImages.length - 1
            ) {
                return 0
            }

            return previousIndex + 1
        })
    }, [validImages.length])

    useEffect(() => {
        if (!open) return undefined

        const handleKeyboard = (event) => {
            if (event.key === 'ArrowLeft') {
                handlePrevious()
            }

            if (event.key === 'ArrowRight') {
                handleNext()
            }
        }

        window.addEventListener(
            'keydown',
            handleKeyboard
        )

        return () => {
            window.removeEventListener(
                'keydown',
                handleKeyboard
            )
        }
    }, [
        handleNext,
        handlePrevious,
        open,
    ])

    const currentImage =
        validImages[currentIndex] || ''

    return (
        <Modal
            open={open}
            title='Preview Image'
            width='95vw'
            centered
            footer={null}
            destroyOnClose
            onCancel={onClose}
            className='review-image-preview-modal'
            styles={{
                body: {
                    padding: 0,
                },
            }}
        >
            {currentImage ? (
                <div className='relative h-[70vh] min-h-[420px] max-h-[720px] overflow-hidden rounded-xl bg-slate-950'>
                    {/* Blurred background */}
                    <img
                        src={currentImage}
                        alt=''
                        aria-hidden='true'
                        className='pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl'
                    />

                    {/* Dark background overlay */}
                    <div className='pointer-events-none absolute inset-0 bg-black/20' />

                    {/* Main image */}
                    <div className='absolute inset-0 flex items-center justify-center px-14 py-0'>
                        <img
                            src={currentImage}
                            alt={`Review ${currentIndex + 1
                                }`}
                            className='relative z-10 h-full max-h-full w-auto max-w-full object-contain'
                            onError={(event) => {
                                event.currentTarget.style.display =
                                    'none'
                            }}
                        />
                    </div>

                    {validImages.length > 1 ? (
                        <>
                            <button
                                type='button'
                                aria-label='Previous image'
                                className='absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-slate-900/65 text-lg text-white transition hover:bg-slate-900/90'
                                onClick={
                                    handlePrevious
                                }
                            >
                                <LeftOutlined />
                            </button>

                            <button
                                type='button'
                                aria-label='Next image'
                                className='absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md bg-slate-900/65 text-lg text-white transition hover:bg-slate-900/90'
                                onClick={handleNext}
                            >
                                <RightOutlined />
                            </button>
                        </>
                    ) : null}

                    <div className='absolute bottom-2 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/35 px-3 py-1 text-xs font-medium text-white'>
                        {currentIndex + 1}/
                        {validImages.length}
                    </div>
                </div>
            ) : (
                <div className='flex min-h-[420px] items-center justify-center rounded-xl bg-slate-950 text-sm text-slate-300'>
                    Image not found
                </div>
            )}
        </Modal>
    )
}

export default ReviewImagePreviewModal