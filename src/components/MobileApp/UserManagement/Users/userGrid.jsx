import React, { useMemo } from 'react'
import { Avatar, Button, Card, Dropdown, Tag, Tooltip, Pagination } from 'antd'
import {
    MoreOutlined,
    EnvironmentOutlined,
    CalendarOutlined,
    HeartOutlined,
    ShareAltOutlined,
    UserOutlined,
} from '@ant-design/icons'
import ImgNormalUser from '../../../../assets/icon/user/normaluser.svg'
import ImgContentCreator from '../../../../assets/icon/user/contentcreator.svg'
import ImgBusinessOwner from '../../../../assets/icon/user/businessowner.svg'
import ImgChat from '../../../../assets/icon/user/chat.svg'
import ImgSave from '../../../../assets/icon/user/save.svg'

export default function UserCardGrid({
    data = [],
    tab = 'all',
    onView,
    pagination,
}) {
    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {(data || []).map((user) => (
                    <UserCard key={user.id} user={user} tab={tab} onView={onView} />
                ))}
            </div>

            {!!pagination?.total && (
                <div className="flex justify-end pt-2">
                    <Pagination
                        current={pagination.current}
                        pageSize={pagination.pageSize}
                        total={pagination.total}
                        onChange={pagination.onChange}
                        showSizeChanger={pagination.showSizeChanger}
                        pageSizeOptions={pagination.pageSizeOptions}
                    />
                </div>
            )}
        </div>
    )
}

function UserCard({ user, tab, onView }) {
    const menuItems = useMemo(
        () => [{ key: 'view', label: 'View' }],
        []
    )

    const handleMenuClick = async ({ key }) => {
        if (key === 'view') onView?.(user)
        if (key === 'copy') {
            try {
                await navigator.clipboard.writeText(user?.id || '')
            } catch { }
        }
    }

    const formatPhoneNumber = (phone) => {
        if (!phone) return '-'

        const raw = String(phone).replace(/\D/g, '')

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

        if (raw.length === 9) {
            return `${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6)}`
        }

        if (raw.length === 10) {
            return `${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6)}`
        }

        return phone
    }

    return (
        <Card
            className="rounded-[18px] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
            styles={{ body: { padding: 16 } }}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar
                        size={42}
                        src={user?.avatar}
                        icon={<UserOutlined />}
                        className="shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                        <div
                            className="font-semibold text-[15px] leading-5 text-slate-900 dark:text-slate-100 truncate cursor-pointer"
                            onClick={() => onView?.(user)}
                        >
                            {user?.name || '-'}
                        </div>

                        <div className="text-[12px] leading-4 text-slate-500 dark:text-slate-400 truncate mt-[2px]">
                            {formatPhoneNumber(user?.phone)}
                        </div>
                    </div>
                </div>

                <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['click']}>
                    <Button
                        type="text"
                        icon={<MoreOutlined />}
                        className="!w-8 !h-8 !min-w-8 text-slate-500 dark:text-slate-400 shrink-0"
                    />
                </Dropdown>
            </div>

            <div className="flex items-center gap-2 mt-3 flex-wrap">
                <TypeTag type={user?.userType} />
                <StatusTag status={user?.status} />
            </div>

            <div className="mt-3">
                <StatsBlock user={user} />
            </div>

            <div className="mt-4">
                <EngagementRow e={user?.engagement} />
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />

            <div className="space-y-2 text-[12px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2 min-w-0">
                    <EnvironmentOutlined className="text-slate-400 shrink-0" />
                    <span className="truncate">{user?.location || 'Phnom Penh'}</span>
                </div>

                <div className="flex items-center gap-2 min-w-0">
                    <CalendarOutlined className="text-slate-400 shrink-0" />
                    <span className="truncate">Created: {user?.createdAt || '-'}</span>
                </div>
            </div>
        </Card>
    )
}

function StatusTag({ status }) {
    const active = status === 'Active'

    return (
        <Tag
            className="!m-0 rounded-full !px-2.5 !py-[2px] text-[11px] border"
            style={{
                background: active ? '#EAF8EF' : '#FDECEC',
                color: active ? '#16A34A' : '#DC2626',
                borderColor: active ? '#B7E4C7' : '#F5B5B5',
                fontWeight: 500,
                lineHeight: 1.2,
            }}
        >
            {active ? 'active' : 'inactive'}
        </Tag>
    )
}

function TypeTag({ type }) {
    const iconCls = 'w-[12px] h-[12px]'

    const map = {
        'Content Creator': {
            label: 'content creator',
            icon: <img src={ImgContentCreator} alt="content creator" className={iconCls} />,
            bg: '#EEF4FF',
            color: '#2563EB',
            border: '#C7D7FE',
        },
        'Business Owner': {
            label: 'business owner',
            icon: <img src={ImgBusinessOwner} alt="business owner" className={iconCls} />,
            bg: '#ECFDF5',
            color: '#16A34A',
            border: '#BBF7D0',
        },
        Normal: {
            label: 'Normal',
            icon: <img src={ImgNormalUser} alt="normal user" className={iconCls} />,
            bg: '#F8FAFC',
            color: '#475569',
            border: '#D8E0EA',
        },
    }

    const current = map[type] || map.Normal

    return (
        <Tag
            className="!m-0 rounded-full !px-2.5 !py-[2px] text-[11px] border inline-flex items-center gap-1"
            style={{
                background: current.bg,
                color: current.color,
                borderColor: current.border,
                fontWeight: 500,
                lineHeight: 1.2,
            }}
        >
            <span className="inline-flex items-center">{current.icon}</span>
            <span>{current.label}</span>
        </Tag>
    )
}

function StatsBlock({ user }) {
    const {
        userType,
        followers = 0,
        followings = 0,
        moments = 0,
        businessPlace = 0,
    } = user

    if (userType === 'Business Owner') {
        return (
            <StatGrid
                a={followers}
                b={followings}
                c={businessPlace}
                cLabel="Business Place"
            />
        )
    }

    if (userType === 'Normal') {
        return (
            <StatGrid
                a={followers}
                b={followings}
                twoCols
            />
        )
    }

    return (
        <StatGrid
            a={followers}
            b={followings}
            c={moments}
            cLabel="Moments"
        />
    )
}

function StatGrid({ a, b, c, cLabel, twoCols = false }) {
    return (
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 px-3 py-3">
            <div className={`grid ${twoCols ? 'grid-cols-2' : 'grid-cols-3'} divide-x divide-slate-200 dark:divide-slate-700`}>
                <StatItem value={a} label="Followers" />
                <StatItem value={b} label="Followings" />
                {!twoCols && <StatItem value={c} label={cLabel} />}
            </div>
        </div>
    )
}

function StatItem({ value, label }) {
    return (
        <div className="text-center px-2">
            <div className="text-[15px] font-semibold leading-5 text-slate-900 dark:text-slate-100">
                {value ?? 0}
            </div>
            <div className="text-[11px] leading-4 text-slate-400 dark:text-slate-500 mt-1 truncate">
                {label}
            </div>
        </div>
    )
}

function EngagementRow({ e }) {
    const likes = Number(e?.likes ?? 0)
    const comments = Number(e?.comments ?? 0)
    const shares = Number(e?.shares ?? 0)
    const saves = Number(e?.saves ?? 0)
    const total = Number(e?.total ?? likes + comments + shares + saves)

    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
            <div className="text-[15px] font-medium leading-5 text-slate-900 dark:text-slate-100">
                {total} total
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-slate-500 dark:text-slate-400 sm:justify-end">
                <Tooltip title="Likes">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        <HeartOutlined style={{ fontSize: 11 }} /> {likes}
                    </span>
                </Tooltip>

                <Tooltip title="Comments">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        <img src={ImgChat} alt="comment" className="w-[11px] h-[11px]" /> {comments}
                    </span>
                </Tooltip>

                <Tooltip title="Shares">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        <ShareAltOutlined style={{ fontSize: 11 }} /> {shares}
                    </span>
                </Tooltip>

                <Tooltip title="Saves">
                    <span className="inline-flex items-center gap-1 whitespace-nowrap">
                        <img src={ImgSave} alt="save" className="w-[11px] h-[11px]" /> {saves}
                    </span>
                </Tooltip>
            </div>
        </div>
    )
}
//  need to show only 10 per page too do now please fix it now no long explain just clear and best way what need fix now