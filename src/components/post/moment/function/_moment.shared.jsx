import React from 'react'
import {
    EyeOutlined,
    HeartOutlined,
    CommentOutlined,
    ShareAltOutlined,
    RetweetOutlined,
    BookOutlined,
} from '@ant-design/icons'

export const MOMENT_STATUS_KEYS = {
    ALL: 'all',
    ACTIVE: 'active',
    UNDER_REVIEW: 'under_review',
    HIDE: 'hide',
}

export const MOMENT_STATUS_BACKEND_MAP = {
    all: 'all',
    active: 'active',
    under_review: 'under_review', // change to 'pending' if backend uses pending
    hide: 'hide', // change to 'hidden' if backend uses hidden
}

export const getMomentBackendStatus = (key) => {
    return MOMENT_STATUS_BACKEND_MAP[key] || 'all'
}

export const MOMENT_STATUS_TABS = [
    { key: MOMENT_STATUS_KEYS.ACTIVE, label: 'Active' },
    { key: MOMENT_STATUS_KEYS.UNDER_REVIEW, label: 'Under Review' },
    { key: MOMENT_STATUS_KEYS.HIDE, label: 'Hide' },
]

export const getMomentStatusMeta = (status) => {
    const value = String(status || '').toLowerCase()

    if (value === 'active') {
        return {
            label: 'Active',
            bg: '#73d13d',
            color: '#fff',
        }
    }

    if (value === 'under_review' || value === 'under review' || value === 'review' || value === 'pending') {
        return {
            label: 'Under Review',
            bg: '#faad14',
            color: '#fff',
        }
    }

    if (value === 'hide' || value === 'hidden') {
        return {
            label: 'Hide',
            bg: '#ff4d4f',
            color: '#fff',
        }
    }

    return {
        label: status || '-',
        bg: '#d9d9d9',
        color: '#333',
    }
}

const toNumber = (value) => {
    const num = Number(value)
    return Number.isFinite(num) ? num : 0
}

export const getMomentEngagements = (record = {}) => {
    return {
        views: toNumber(record?.views ?? record?.viewCount ?? record?.totalViews),
        likes: toNumber(record?.likes ?? record?.likeCount ?? record?.totalLikes),
        comments: toNumber(record?.comments ?? record?.commentCount ?? record?.totalComments),
        shares: toNumber(record?.shares ?? record?.shareCount ?? record?.totalShares),
        reposts: toNumber(record?.reposts ?? record?.repostCount ?? record?.totalReposts),
        saves: toNumber(record?.saves ?? record?.saveCount ?? record?.totalSaves),
    }
}

const itemStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
}

export const MomentEngagement = ({ record }) => {
    const data = getMomentEngagements(record)

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                flexWrap: 'wrap',
            }}
        >
            <span style={itemStyle}>
                <EyeOutlined style={{ color: '#1677ff' }} />
                {data.views}
            </span>

            <span style={itemStyle}>
                <HeartOutlined style={{ color: '#ff4d4f' }} />
                {data.likes}
            </span>

            <span style={itemStyle}>
                <CommentOutlined style={{ color: '#52c41a' }} />
                {data.comments}
            </span>

            <span style={itemStyle}>
                <ShareAltOutlined style={{ color: '#2f3b59' }} />
                {data.shares}
            </span>

            <span style={itemStyle}>
                <RetweetOutlined style={{ color: '#595959' }} />
                {data.reposts}
            </span>

            <span style={itemStyle}>
                <BookOutlined style={{ color: '#fa8c16' }} />
                {data.saves}
            </span>
        </div>
    )
}

export const MomentStatusPill = ({ status }) => {
    const meta = getMomentStatusMeta(status)

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px 14px',
                borderRadius: 999,
                background: meta.bg,
                color: meta.color,
                fontSize: 14,
                lineHeight: 1.2,
            }}
        >
            {meta.label}
        </span>
    )
}

export const MomentStatusTabs = ({ activeKey, onChange, counts = {} }) => {
    const tabRefs = React.useRef({})
    const [indicator, setIndicator] = React.useState({
        left: 0,
        width: 0,
        ready: false,
    })

    const getLabel = (item) => {
        const count = counts?.[item.key]

        if (count === undefined || count === null || count === '') {
            return item.label
        }

        return `${item.label} (${count})`
    }

    React.useEffect(() => {
        const updateIndicator = () => {
            const activeEl = tabRefs.current?.[activeKey]
            const parentEl = activeEl?.parentElement

            if (!activeEl || !parentEl) return

            const parentRect = parentEl.getBoundingClientRect()
            const activeRect = activeEl.getBoundingClientRect()

            setIndicator({
                left: activeRect.left - parentRect.left,
                width: activeRect.width,
                ready: true,
            })
        }

        const frame = requestAnimationFrame(updateIndicator)

        window.addEventListener('resize', updateIndicator)

        return () => {
            cancelAnimationFrame(frame)
            window.removeEventListener('resize', updateIndicator)
        }
    }, [activeKey, counts])

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 40,
                padding: '0 0 8px',
                marginLeft: '20px',
                marginTop: '20px',
                position: 'relative',
                borderBottom: '1px solid #f0f0f0',
                width: 'fit-content',
            }}
        >
            {MOMENT_STATUS_TABS.map((item) => {
                const active = activeKey === item.key

                return (
                    <button
                        ref={(el) => {
                            tabRefs.current[item.key] = el
                        }}
                        key={item.key}
                        type="button"
                        onClick={() => onChange?.(item.key)}
                        style={{
                            border: 0,
                            background: 'transparent',
                            cursor: 'pointer',
                            padding: '0 0 8px',
                            fontSize: 14,
                            fontWeight: 600,
                            color: active ? '#1677ff' : '#1f1f1f',
                            transition: 'color 0.25s ease',
                        }}
                    >
                        {getLabel(item)}
                    </button>
                )
            })}

            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    height: 3,
                    width: indicator.width,
                    background: '#1677ff',
                    borderRadius: 999,
                    transform: `translateX(${indicator.left}px)`,
                    opacity: indicator.ready ? 1 : 0,
                    transition:
                        'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), width 0.28s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease',
                }}
            />
        </div>
    )
}