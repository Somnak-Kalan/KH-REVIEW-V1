// src/components/ReviewManagement/allReview/detail/ReviewDetailActionMenu.jsx

import {
    EyeInvisibleOutlined,
    MoreOutlined,
} from '@ant-design/icons'

import {
    Button,
    Dropdown,
} from 'antd'

import EditIcon
    from '../../../../assets/icon/user/actionIcon/edit.svg'

import ApproveIcon
    from '../../../../assets/icon/user/actionIcon/approve.svg'

const EDIT_ACTION = {
    key: 'edit',
    label: 'Edit review',
    icon: (
        <img
            src={EditIcon}
            alt=''
        />
    ),
}

const APPROVE_ACTION = {
    key: 'approve',
    label: 'Approve review',

    icon: (
        <img
            src={ApproveIcon}
            alt=''
        />
    ),
}

const REJECT_ACTION = {
    key: 'reject',
    label: 'Reject review',

    icon: (
        <EyeInvisibleOutlined
            style={{
                color:
                    '#8C8C8C',
            }}
        />
    ),
}

const HIDE_ACTION = {
    key: 'hide',
    label: 'Hide review',

    icon: (
        <EyeInvisibleOutlined
            style={{
                color:
                    '#8C8C8C',
            }}
        />
    ),
}

const ACTIONS_BY_STATUS = {
    pending: [
        EDIT_ACTION,
        APPROVE_ACTION,
        REJECT_ACTION,
    ],

    active: [
        EDIT_ACTION,
        HIDE_ACTION,
    ],

    hidden: [],

    rejected: [],

    inactive: [],
}

const normalizeStatus = (
    status
) => {
    const value =
        String(
            status ||
            'inactive'
        )
            .trim()
            .toLowerCase()

    const aliases = {
        approve:
            'active',

        approved:
            'active',

        show:
            'active',

        hide:
            'hidden',

        hidden:
            'hidden',

        reject:
            'rejected',

        rejected:
            'rejected',
    }

    return (
        aliases[value] ||
        value
    )
}

const ReviewDetailActionMenu = ({
    review,
    loading = false,
    placement = 'bottomRight',
    onAction,
}) => {
    const status =
        normalizeStatus(
            review?.statusKey ||
            review?.status
        )

    const items =
        ACTIONS_BY_STATUS?.[
        status
        ] || []

    const handleMenuClick = ({
        key,
        domEvent,
    }) => {
        domEvent?.stopPropagation?.()

        if (
            loading ||
            !key
        ) {
            return
        }

        onAction?.(
            key,
            review
        )
    }

    const handleButtonClick = (
        event
    ) => {
        event.preventDefault()
        event.stopPropagation()
    }

    if (
        !items.length
    ) {
        return null
    }

    return (
        <Dropdown
            trigger={[
                'click',
            ]}
            placement={
                placement
            }
            overlayClassName='review-action-dropdown'
            autoAdjustOverflow
            disabled={
                loading ||
                !review?._id
            }
            getPopupContainer={(
                triggerNode
            ) => {
                return (
                    triggerNode.closest(
                        '.app-content-popup-boundary'
                    ) ||
                    triggerNode
                        .parentElement ||
                    document.body
                )
            }}
            menu={{
                items,

                onClick:
                    handleMenuClick,
            }}
        >
            <Button
                type='text'
                shape='circle'
                size='small'
                loading={
                    loading
                }
                disabled={
                    loading ||
                    !review?._id
                }
                className='review-action-menu-button flex shrink-0 items-center justify-center'
                icon={
                    <MoreOutlined
                        style={{
                            color:
                                '#8C8C8C',

                            fontSize:
                                16,
                        }}
                    />
                }
                aria-label='Review actions'
                title='Review actions'
                onClick={
                    handleButtonClick
                }
            />
        </Dropdown>
    )
}

export default ReviewDetailActionMenu