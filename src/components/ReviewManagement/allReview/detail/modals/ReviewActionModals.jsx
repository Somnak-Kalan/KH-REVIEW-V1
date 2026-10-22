import {
    Alert,
    Button,
    Input,
    Modal,
} from 'antd'

import {
    CheckCircleFilled,
    CloseOutlined,
    EyeInvisibleOutlined,
    FileDoneOutlined,
} from '@ant-design/icons'

import {
    useEffect,
    useMemo,
    useState,
} from 'react'

const {
    TextArea,
} = Input
const REVIEW_REASON_OPTIONS = [
    {
        value: 'GUIDELINES',
        label: 'Violates community guidelines',
    },
    {
        value: 'SPAM',
        label: 'Spam or excessive promotion',
    },
    {
        value: 'MISLEADING',
        label: 'Misleading or false information',
    },
    {
        value: 'OFFENSIVE',
        label: 'Inappropriate or offensive content',
    },
    {
        value: 'IRRELEVANT',
        label: 'Irrelevant to the mentioned place',
    },
    {
        value: 'LOW_QUALITY',
        label: 'Low-quality or unclear content',
    },
    {
        value: 'DUPLICATE',
        label: 'Duplicate or repetitive content',
    },
    {
        value: 'ADVERTISING',
        label: 'Unauthorized advertising',
    },
]

const REJECT_REASONS = [
    ...REVIEW_REASON_OPTIONS,
]

const HIDE_REASONS = [
    ...REVIEW_REASON_OPTIONS,
]

const REASON_ACTION_CONFIG = {
    reject: {
        title:
            'Reject Review',

        description:
            'This review will be rejected. Select the reason you want to send to the creator.',

        reasonLabel:
            'Reason to reject',

        confirmText:
            'Reject Review',

        targetStatus:
            'rejected',

        reasons:
            REJECT_REASONS,
    },

    hide: {
        title:
            'Hide Review',

        description:
            'This review will be hidden from public view. Select the reason for hiding this review.',

        reasonLabel:
            'Reason to hide',

        confirmText:
            'Hide Review',

        targetStatus:
            'hidden',

        reasons:
            HIDE_REASONS,
    },
}

const getMediaItem = (
    item,
    index
) => {
    if (
        typeof item ===
        'string'
    ) {
        return {
            id:
                item,

            url:
                item,

            removeValue:
                item,
        }
    }

    const url =
        item?.url ||
        item?.original ||
        item?.medium ||
        item?.thumbnail ||
        item?.imageUrl ||
        item?.path ||
        ''

    const removeValue =
        item?.key ||
        item?.url ||
        item?.path ||
        item?.imageUrl ||
        url

    return {
        id:
            item?._id ||
            item?.id ||
            item?.key ||
            url ||
            `media-${index}`,

        url,

        removeValue,
    }
}

const getReviewMedia = (
    review
) => {
    const source =
        review?.images ||
        review?.photos ||
        review?.media ||
        []

    if (
        !Array.isArray(
            source
        )
    ) {
        return []
    }

    return source
        .map(
            getMediaItem
        )
        .filter(
            (
                item
            ) => {
                return Boolean(
                    item?.url &&
                    item?.removeValue
                )
            }
        )
}

const getReviewText = (
    review
) => {
    return String(
        review?.review ??
        review?.comment ??
        review?.content ??
        ''
    )
}

const EditReviewModal = ({
    open,
    review,
    loading = false,
    onClose,
    onSave,
}) => {
    const [
        originalReviewText,
        setOriginalReviewText,
    ] = useState('')

    const [
        reviewText,
        setReviewText,
    ] = useState('')

    const [
        originalPhotos,
        setOriginalPhotos,
    ] = useState([])

    const [
        reviewPhotos,
        setReviewPhotos,
    ] = useState([])

    const [
        validationError,
        setValidationError,
    ] = useState('')

    useEffect(() => {
        if (!open) {
            return
        }

        const nextReviewText =
            getReviewText(
                review
            )

        const nextPhotos =
            getReviewMedia(
                review
            )

        setOriginalReviewText(
            nextReviewText
        )

        setReviewText(
            nextReviewText
        )

        setOriginalPhotos(
            nextPhotos
        )

        setReviewPhotos(
            nextPhotos
        )

        setValidationError('')
    }, [
        open,
        review,
    ])

    const normalizedOriginalText =
        originalReviewText.trim()

    const normalizedCurrentText =
        reviewText.trim()

    const commentChanged =
        normalizedCurrentText !==
        normalizedOriginalText

    const removeMedia =
        useMemo(() => {
            const remainingIds =
                new Set(
                    reviewPhotos.map(
                        (
                            item
                        ) => {
                            return item.id
                        }
                    )
                )

            return originalPhotos
                .filter(
                    (
                        item
                    ) => {
                        return !remainingIds.has(
                            item.id
                        )
                    }
                )
                .map(
                    (
                        item
                    ) => {
                        return item
                            .removeValue
                    }
                )
                .filter(
                    Boolean
                )
        }, [
            originalPhotos,
            reviewPhotos,
        ])

    const hasChanges =
        commentChanged ||
        removeMedia.length > 0

    const handleRemovePhoto = (
        removeIndex
    ) => {
        if (loading) {
            return
        }

        setValidationError('')

        setReviewPhotos(
            (
                previousPhotos
            ) => {
                return previousPhotos.filter(
                    (
                        _,
                        index
                    ) => {
                        return (
                            index !==
                            removeIndex
                        )
                    }
                )
            }
        )
    }

    const handleSave = () => {
        setValidationError('')

        if (!hasChanges) {
            setValidationError(
                'Please change the review comment or remove at least one image.'
            )

            return
        }

        const changes = {}

        /*
         * Comment changed:
         *
         * Non-empty string = replace comment.
         * Empty string = remove comment using null.
         */
        if (
            commentChanged
        ) {
            changes.comment =
                normalizedCurrentText ||
                null
        }

        /*
         * Images removed:
         *
         * Include removeMedia only when
         * at least one image was removed.
         */
        if (
            removeMedia.length >
            0
        ) {
            changes.removeMedia =
                removeMedia
        }

        onSave?.(
            changes
        )
    }

    return (
        <Modal
            open={
                open
            }
            title='Edit Review'
            width={
                620
            }
            centered
            footer={
                null
            }
            destroyOnClose
            maskClosable={
                !loading
            }
            closable={
                !loading
            }
            closeIcon={
                <CloseOutlined />
            }
            onCancel={
                loading
                    ? undefined
                    : onClose
            }
            styles={{
                content: {
                    padding:
                        20,

                    borderRadius:
                        12,
                },

                header: {
                    marginBottom:
                        16,
                },

                body: {
                    padding:
                        0,
                },
            }}
        >
            <label className='mb-2 block text-xs font-medium text-gray-700 dark:text-slate-300'>
                Review
            </label>

            <TextArea
                rows={
                    4
                }
                value={
                    reviewText
                }
                disabled={
                    loading
                }
                maxLength={
                    2000
                }
                showCount
                placeholder='Write review content'
                className='!resize-none'
                onChange={(
                    event
                ) => {
                    setReviewText(
                        event
                            .target
                            .value
                    )

                    setValidationError('')
                }}
            />

            {reviewPhotos.length >
                0 ? (
                <div className='mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3'>
                    {reviewPhotos.map(
                        (
                            photo,
                            index
                        ) => (
                            <div
                                key={
                                    photo.id
                                }
                                className='relative h-[140px] overflow-hidden rounded-md bg-gray-100 dark:bg-slate-800'
                            >
                                <img
                                    src={
                                        photo.url
                                    }
                                    alt={`Review ${index + 1}`}
                                    className='h-full w-full object-cover'
                                    onError={(
                                        event
                                    ) => {
                                        event.currentTarget.style.display =
                                            'none'
                                    }}
                                />

                                <button
                                    type='button'
                                    aria-label={`Remove image ${index + 1}`}
                                    disabled={
                                        loading
                                    }
                                    className='absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border-0 bg-red-500 text-[10px] text-white shadow transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50'
                                    onClick={() => {
                                        handleRemovePhoto(
                                            index
                                        )
                                    }}
                                >
                                    <CloseOutlined />
                                </button>
                            </div>
                        )
                    )}
                </div>
            ) : (
                <div className='mt-4 rounded-md border border-dashed border-gray-200 px-4 py-5 text-center text-[11px] text-gray-400 dark:border-slate-700'>
                    No review photos
                </div>
            )}

            {validationError ? (
                <Alert
                    className='mt-4'
                    type='warning'
                    showIcon
                    message={
                        validationError
                    }
                />
            ) : null}

            <div className='mt-7 flex items-center justify-end gap-2'>
                <Button
                    disabled={
                        loading
                    }
                    onClick={
                        onClose
                    }
                >
                    Cancel
                </Button>

                <Button
                    type='primary'
                    loading={
                        loading
                    }
                    disabled={
                        loading ||
                        !hasChanges
                    }
                    onClick={
                        handleSave
                    }
                >
                    Save Changes
                </Button>
            </div>
        </Modal>
    )
}

const ApproveReviewModal = ({
    open,
    loading = false,
    onClose,
    onApprove,
}) => {
    return (
        <Modal
            open={
                open
            }
            width={
                395
            }
            centered
            footer={
                null
            }
            destroyOnClose
            maskClosable={
                !loading
            }
            closable={
                !loading
            }
            closeIcon={
                <CloseOutlined />
            }
            onCancel={
                loading
                    ? undefined
                    : onClose
            }
            styles={{
                content: {
                    padding:
                        '28px 27px 24px',

                    borderRadius:
                        14,
                },

                body: {
                    padding:
                        0,
                },
            }}
        >
            <div className='pt-1 text-center'>
                <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-[22px] text-blue-500 dark:bg-blue-950/40'>
                    <FileDoneOutlined />
                </div>

                <h3 className='mb-0 mt-5 text-[18px] font-semibold text-gray-950 dark:text-slate-100'>
                    Approve Review
                </h3>

                <p className='mb-5 mt-3 text-sm text-gray-500 dark:text-slate-400'>
                    Are you sure you want to approve this review?
                </p>

                <div className='grid grid-cols-2 gap-2'>
                    <Button
                        block
                        disabled={
                            loading
                        }
                        className='!h-9 !rounded-full !border-0 !bg-gray-100 hover:!bg-gray-200 dark:!bg-slate-800 dark:!text-slate-200'
                        onClick={
                            onClose
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        block
                        type='primary'
                        loading={
                            loading
                        }
                        className='!h-9 !rounded-full'
                        onClick={
                            onApprove
                        }
                    >
                        Approve
                    </Button>
                </div>
            </div>
        </Modal>
    )
}

const ReasonReviewModal = ({
    open,
    action,
    loading = false,
    onClose,
    onConfirm,
}) => {
    const [
        selectedReason,
        setSelectedReason,
    ] = useState('')

    const configuration =
        REASON_ACTION_CONFIG?.[
        action
        ]

    const reasons =
        useMemo(() => {
            return Array.isArray(
                configuration?.reasons
            )
                ? configuration.reasons
                : []
        }, [
            configuration,
        ])

    useEffect(() => {
        if (open) {
            setSelectedReason('')
        }
    }, [
        action,
        open,
    ])

    if (!configuration) {
        return null
    }

    const ActionIcon =
        action === 'hide'
            ? EyeInvisibleOutlined
            : CheckCircleFilled

    const handleConfirm = () => {
        if (!selectedReason) {
            return
        }

        onConfirm?.({
            action,

            targetStatus:
                configuration
                    .targetStatus,

            reason:
                selectedReason,
        })
    }

    return (
        <Modal
            open={
                open
            }
            width={
                520
            }
            centered
            footer={
                null
            }
            destroyOnClose
            maskClosable={
                !loading
            }
            closable={
                !loading
            }
            closeIcon={
                <CloseOutlined />
            }
            onCancel={
                loading
                    ? undefined
                    : onClose
            }
            styles={{
                content: {
                    padding:
                        '18px 20px 16px',

                    borderRadius:
                        11,
                },

                body: {
                    padding:
                        0,
                },
            }}
        >
            <h3 className='m-0 flex items-center gap-2 text-base font-semibold text-gray-950 dark:text-slate-100'>
                <ActionIcon className='text-blue-500' />

                {
                    configuration
                        .title
                }
            </h3>

            <p className='mb-4 mt-2 max-w-[440px] text-[11px] leading-4 text-gray-400 dark:text-slate-400'>
                {
                    configuration
                        .description
                }
            </p>

            <div className='mb-3 text-xs font-semibold text-slate-700 dark:text-slate-300'>
                {
                    configuration
                        .reasonLabel
                }
            </div>

            <div className='flex flex-wrap gap-2'>
                {reasons.map(
                    (
                        reason
                    ) => {
                        const selected =
                            selectedReason ===
                            reason.value

                        return (
                            <button
                                key={
                                    reason.value
                                }
                                type='button'
                                disabled={
                                    loading
                                }
                                className={[
                                    'inline-flex min-h-7 items-center gap-1 rounded-full border px-3 py-1 text-[10px] transition',

                                    selected
                                        ? 'border-blue-500 bg-blue-50 text-blue-500 dark:bg-blue-950/30'
                                        : 'border-gray-200 bg-white text-gray-400 hover:border-blue-300 hover:text-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400',
                                ].join(
                                    ' '
                                )}
                                onClick={() => {
                                    setSelectedReason(
                                        reason.value
                                    )
                                }}
                            >
                                <span>
                                    {
                                        reason.label
                                    }
                                </span>

                                {selected ? (
                                    <CheckCircleFilled className='text-[10px] text-blue-500' />
                                ) : null}
                            </button>
                        )
                    }
                )}
            </div>

            <div className='mt-7 flex items-center justify-end gap-2'>
                <Button
                    disabled={
                        loading
                    }
                    onClick={
                        onClose
                    }
                >
                    Cancel
                </Button>

                <Button
                    type='primary'
                    loading={
                        loading
                    }
                    disabled={
                        loading ||
                        !selectedReason
                    }
                    onClick={
                        handleConfirm
                    }
                >
                    {
                        configuration
                            .confirmText
                    }
                </Button>
            </div>
        </Modal>
    )
}

const ReviewActionModals = ({
    action,
    review,
    loading = false,
    onClose,
    onSaveReview,
    onConfirmAction,
}) => {
    if (!action) {
        return null
    }

    return (
        <>
            <EditReviewModal
                open={
                    action ===
                    'edit'
                }
                review={
                    review
                }
                loading={
                    loading
                }
                onClose={
                    onClose
                }
                onSave={
                    onSaveReview
                }
            />

            <ApproveReviewModal
                open={
                    action ===
                    'approve'
                }
                loading={
                    loading
                }
                onClose={
                    onClose
                }
                onApprove={() => {
                    onConfirmAction?.({
                        action:
                            'approve',

                        targetStatus:
                            'active',

                        reason:
                            '',
                    })
                }}
            />

            <ReasonReviewModal
                open={
                    action ===
                    'reject' ||
                    action ===
                    'hide'
                }
                action={
                    action
                }
                loading={
                    loading
                }
                onClose={
                    onClose
                }
                onConfirm={
                    onConfirmAction
                }
            />
        </>
    )
}

export default ReviewActionModals