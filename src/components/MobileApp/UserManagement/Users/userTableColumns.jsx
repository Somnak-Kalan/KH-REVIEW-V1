import { Avatar, Tag, Tooltip } from 'antd'
import { HeartOutlined, ShareAltOutlined, UserOutlined, EyeOutlined, CommentOutlined, RetweetOutlined, BookOutlined } from '@ant-design/icons'
import ImgChat from '../../../../assets/icon/user/chat.svg'
import ImgSave from '../../../../assets/icon/user/save.svg'

import EyeIcon from '../../../../assets/icon/user/eye.svg'
import HeartIcon from '../../../../assets/icon/user/heart.svg'
import CommentIcon from '../../../../assets/icon/user/comment.svg'
import RetweetIcon from '../../../../assets/icon/user/repost.svg'
import SaveIcon from '../../../../assets/icon/user/saveOrange.svg'
const statusTag = (status) => {
    if (status === 'Active') {
        return (
            <Tag color="#6AC917" className="rounded-full">
                Active
            </Tag>
        )
    }
    return (
        <Tag color="#AD3838" className="rounded-full">
            Inactive
        </Tag>
    )
}
const iconImgStyle = (size) => ({
    width: size,
    height: size,
    objectFit: 'contain',
    display: 'block',
    flexShrink: 0,
})
const engagementCell = (e) => (
    <div className='flex items-center gap-2 whitespace-nowrap text-xs'>
        <Tooltip title='Views'>
            <span className='inline-flex items-center gap-1 text-blue-500'>
                <img src={EyeIcon} alt="views" style={iconImgStyle(14)} />
                <span className='text-slate-600 dark:text-slate-400'>
                    {e?.views ?? 0}
                </span>
            </span>
        </Tooltip>

        <Tooltip title='Likes'>
            <span className='inline-flex items-center gap-1 border-l border-slate-300 pl-2 text-red-500 dark:border-slate-600'>
                <img src={HeartIcon} alt="views" style={iconImgStyle(14)} />
                <span className='text-slate-600 dark:text-slate-400'>
                    {e?.likes ?? 0}
                </span>
            </span>
        </Tooltip>

        <Tooltip title='Comments'>
            <span className='inline-flex items-center gap-1 border-l border-slate-300 pl-2 text-green-500 dark:border-slate-600'>
                <img src={CommentIcon} alt="views" style={iconImgStyle(14)} />
                <span className='text-slate-600 dark:text-slate-400'>
                    {e?.comments ?? 0}
                </span>
            </span>
        </Tooltip>

        <Tooltip title='Shares'>
            <span className='inline-flex items-center gap-1 border-l border-slate-300 pl-2 text-slate-500 dark:border-slate-600'>
                <ShareAltOutlined style={{ color: '#4b5563', fontSize: 14 }} />
                <span className='text-slate-600 dark:text-slate-400'>
                    {e?.shares ?? 0}
                </span>
            </span>
        </Tooltip>

        <Tooltip title='Reposts'>
            <span className='inline-flex items-center gap-1 border-l border-slate-300 pl-2 text-slate-500 dark:border-slate-600'>
                <img src={RetweetIcon} alt="views" style={iconImgStyle(14)} />
                <span className='text-slate-600 dark:text-slate-400'>
                    {e?.reposts ?? 0}
                </span>
            </span>
        </Tooltip>

        <Tooltip title='Saves'>
            <span className='inline-flex items-center gap-1 border-l border-slate-300 pl-2 text-orange-500 dark:border-slate-600'>
                <img src={SaveIcon} alt="views" style={iconImgStyle(14)} />
                <span className='text-slate-600 dark:text-slate-400'>
                    {e?.saves ?? 0}
                </span>
            </span>
        </Tooltip>
    </div>
)

const formatPhoneNumber = (phone) => {
    if (!phone) return '-'

    const raw = String(phone).replace(/\D/g, '')

    // case: 85516888889  -> (+855) 016 888 889
    if (raw.startsWith('855') && raw.length >= 11) {
        const local = `0${raw.slice(3)}`

        if (local.length === 9) {
            return `(+855) ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
        }

        if (local.length === 10) {
            return `(+855) ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
        }

        return `(+855) ${local}`
    }

    // fallback normal grouping
    if (raw.length === 9) {
        return `${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6)}`
    }

    if (raw.length === 10) {
        return `${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6)}`
    }

    return phone
}

const userProfileCell = (row, onView) => (
    <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => onView?.(row)}
    >
        <Avatar src={row?.avatar} size={34} icon={<UserOutlined />} />
        <div className="leading-4">
            <div className="text-blue-600 cursor-pointer">{row?.name}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
                {formatPhoneNumber(row?.phone)}
            </div>
        </div>
    </div>
)

const base = (onView) => [
    // { title: 'User ID', dataIndex: 'userid', key: 'userid' },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: statusTag,
    },
    {
        title: 'User Profile',
        key: 'profile',
        width: 240,
        render: (_, row) => userProfileCell(row, onView),
    },
    { title: 'Gender', dataIndex: 'gender', key: 'gender', width: 90 },
    { title: 'Date of Birth', dataIndex: 'dob', key: 'dob', width: 130 },
    {
        title: 'Engagement',
        dataIndex: 'engagement',
        key: 'engagement',
        width: 220,
        render: engagementCell,
    },
    {
        title: 'User Type',
        dataIndex: 'userType',
        key: 'userType',

        render: (userType, row) => {
            const typeText = userType || '-'

            const isRestricted =
                row?.isRestricted === true ||
                String(userType || '').toLowerCase().includes('restrict') ||
                String(userType || '').toLowerCase().includes('retrict')

            const cleanType = String(typeText)
                .replace(/\s*\(restrict\)/gi, '')
                .replace(/\s*\(retrict\)/gi, '')

            return (
                <span>
                    {cleanType}
                    {isRestricted && (
                        <span
                            onClick={(e) => {
                                e.stopPropagation()

                                // push to profile manage restriction tab
                                onView?.(row, 'manage_restriction')
                            }}
                            className="text-red-500 ml-1 cursor-pointer">
                            (Restrict)
                        </span>
                    )}
                </span>
            )
        },
    },
]

const meta = [
    { title: 'Updated By', dataIndex: 'updatedBy', key: 'updatedBy', width: 120 },
    { title: 'Created By', dataIndex: 'createdBy', key: 'createdBy', width: 120 },
    { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt', width: 160 },
]

export function getColumnsByTab(tabKey, onView) {
    if (tabKey === 'normal') {
        return [
            ...base(onView),
            { title: 'Followers', dataIndex: 'followers', key: 'followers', width: 120 },
            { title: 'Followings', dataIndex: 'followings', key: 'followings', width: 120 },
            {
                title: 'Business Page',
                dataIndex: 'businessPlace',
                key: 'businessPlace',
                width: 140,
            },
            // { title: 'Moments', dataIndex: 'moments', key: 'moments', width: 110 },
            ...meta,
        ]
    }

    if (tabKey === 'creator') {
        return [
            ...base(onView),
            { title: 'Followers', dataIndex: 'followers', key: 'followers', width: 120 },
            { title: 'Followings', dataIndex: 'followings', key: 'followings', width: 120 },
            { title: 'Moments', dataIndex: 'moments', key: 'moments', width: 110 },
            ...meta,
        ]
    }

    if (tabKey === 'owner') {
        return [
            ...base(onView),
            { title: 'Followings', dataIndex: 'followings', key: 'followings', width: 120 },
            {
                title: 'Business Page',
                dataIndex: 'businessPlace',
                key: 'businessPlace',
                width: 140,
            },
            ...meta,
        ]
    }

    return [
        ...base(onView),
        { title: 'Followers', dataIndex: 'followers', key: 'followers', width: 120 },
        { title: 'Followings', dataIndex: 'followings', key: 'followings', width: 120 },
        { title: 'Moments', dataIndex: 'moments', key: 'moments', width: 110, render: (m) => m || '-' },
        {
            title: 'Business Page',
            dataIndex: 'businessPlace',
            key: 'businessPlace',
            width: 140,
        },
        ...meta,
    ]
}