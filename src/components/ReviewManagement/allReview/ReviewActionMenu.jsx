// src/components/ReviewManagement/allReview/ReviewActionMenu.jsx

import {
    EyeInvisibleOutlined,
    MoreOutlined,
} from '@ant-design/icons'

import {
    Button,
    Dropdown,
} from 'antd'

import ReviewDetailIcon
    from '../../../assets/icon/user/actionIcon/view.svg'

import EditIcon
    from '../../../assets/icon/user/actionIcon/edit.svg'

import ApproveIcon
    from '../../../assets/icon/user/actionIcon/approve.svg'

const VIEW_ACTION = {
    key: 'view',
    label: 'View review',

    icon: (
        <img
            src={ReviewDetailIcon}
            alt=''
        />
    ),
}

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
        VIEW_ACTION,
        EDIT_ACTION,
        APPROVE_ACTION,
        REJECT_ACTION,
    ],

    active: [
        VIEW_ACTION,
        EDIT_ACTION,
        HIDE_ACTION,
    ],

    hidden: [
        VIEW_ACTION,
    ],

    rejected: [
        VIEW_ACTION,
    ],

    inactive: [
        VIEW_ACTION,
    ],
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

const ReviewActionMenu = ({
    review,
    loading = false,
    placement = 'bottomLeft',
    onView,
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
        ] || [
            VIEW_ACTION,
        ]

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

        if (
            key === 'view'
        ) {
            onView?.(
                review
            )

            return
        }

        onAction?.(
            key,
            review
        )
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
                className='review-action-menu-button'
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
                onClick={(
                    event
                ) => {
                    event.stopPropagation()
                }}
            />
        </Dropdown>
    )
}

export default ReviewActionMenu