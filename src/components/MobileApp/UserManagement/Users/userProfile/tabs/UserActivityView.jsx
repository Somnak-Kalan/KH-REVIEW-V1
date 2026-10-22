import React, { useEffect, useMemo, useState } from 'react'
import { Empty, List, Pagination, Select, Spin, Tabs } from 'antd'
import TimelineItem from './TimelineItem'
import { useUserProfileExtraStore } from '../../../../../../Stores/MobilesApp/User/userProfile.store'

const normalizeActionType = (value) => {
    const type = String(value || '').toLowerCase().trim()

    if (type === 'viewed' || type === 'views' || type === 'view') return 'view'
    if (type === 'liked' || type === 'likes' || type === 'like') return 'like'
    if (type === 'saved' || type === 'saves' || type === 'save') return 'save'
    if (type === 'shared' || type === 'shares' || type === 'share') return 'share'
    if (type === 'reposted' || type === 'reposts' || type === 'repost') return 'repost'
    if (type === 'comments' || type === 'commented' || type === 'comment') return 'comment'
    if (type === 'reviews' || type === 'reviewed' || type === 'review') return 'review'

    return type || 'view'
}

const getActionLabel = (type) => {
    switch (normalizeActionType(type)) {
        case 'view':
            return 'view'
        case 'like':
            return 'like'
        case 'save':
            return 'save'
        case 'share':
            return 'share'
        case 'repost':
            return 'repost'
        case 'comment':
            return 'comment'
        case 'review':
            return 'reviewe'
        default:
            return 'interact'
    }
}

const getActionLabelTitle = (type) => {
    switch (normalizeActionType(type)) {
        case 'view':
            return 'Viewed'
        case 'like':
            return 'Liked'
        case 'save':
            return 'Saved'
        case 'share':
            return 'Shared'
        case 'repost':
            return 'Reposted'
        case 'comment':
            return 'Commented'
        case 'review':
            return 'Reviewed'
        default:
            return 'Interacted'
    }
}

const toNumber = (value) => {
    const number = Number(value)
    return Number.isFinite(number) ? number : 0
}

const getMomentAuthor = (item = {}) => {
    return (
        item?.moment?.author ||
        item?.post?.author ||
        item?.target?.author ||
        item?.author ||
        {}
    )
}

const getMomentAuthorName = (item = {}) => {
    const author = getMomentAuthor(item)

    return (
        author?.username ||
        author?.name ||
        author?.fullName ||
        item?.authorName ||
        item?.userName ||
        ''
    )
}

const getMomentAuthorId = (item = {}) => {
    const author = getMomentAuthor(item)

    return (
        author?._id ||
        author?.id ||
        item?.authorId ||
        item?.userId ||
        item?.user_id ||
        ''
    )
}

const getActivityDate = (item = {}) => {
    return item?.actedAt || item?.createdAt || item?.updatedAt || item?.time || ''
}

const getCommentImageUrl = (item = {}) => {
    return (
        item?.comment?.image?.small?.url ||
        item?.comment?.image?.medium?.url ||
        item?.comment?.image?.large?.url ||
        item?.comment?.image?.original?.url ||
        ''
    )
}

const buildActivityTitle = (item = {}) => {
    const type = normalizeActionType(
        item?.actionType ||
        item?.type ||
        item?.action ||
        item?.activityType ||
        item?.eventType
    )

    const actionLabel = getActionLabelTitle(type)
    const targetType = String(item?.targetType || '').toLowerCase()
    const authorName = getMomentAuthorName(item)

    if (targetType === 'moment' || item?.moment) {
        const momentTitle = item?.moment?.title
        if (authorName) return `${actionLabel} on ${authorName}'s moment ${momentTitle}`
        return `${actionLabel} a moment`
    }

    if (targetType === 'place' || item?.place) {
        const placeName =
            item?.place?.nameEn ||
            item?.place?.name ||
            item?.placeName ||
            item?.target?.name

        if (placeName) return `${actionLabel} place “${placeName}”`
        return `${actionLabel} a place`
    }

    return item?.title || item?.message || `${actionLabel} activity`
}

const normalizeActivityItem = (item = {}) => {
    const type = normalizeActionType(
        item?.actionType ||
        item?.type ||
        item?.action ||
        item?.activityType ||
        item?.eventType
    )

    const authorName = getMomentAuthorName(item)
    const authorId = getMomentAuthorId(item)
    const commentImageUrl = getCommentImageUrl(item)

    return {
        ...item,
        _id: item?._id || item?.id || item?.activityId,
        type,
        actionType: type,
        title: buildActivityTitle(item),
        desc:
            item?.desc ||
            item?.description ||
            item?.caption ||
            item?.content ||
            item?.comment?.text ||
            '',
        createdAt: getActivityDate(item),
        time: getActivityDate(item),
        userName:
            item?.userName ||
            item?.username ||
            authorName ||
            item?.user?.username ||
            item?.owner?.username ||
            item?.creator?.username ||
            '',
        userId:
            item?.userId ||
            item?.user_id ||
            authorId ||
            item?.user?._id ||
            item?.owner?._id ||
            item?.creator?._id ||
            '',
        targetId:
            item?.targetId ||
            item?.moment?._id ||
            item?.place?._id ||
            item?.target?._id,

        category:
            item?.targetType === 'place'
                ? item.place?.category?.nameEn
                : item?.moment?.type === 'PhotoPost' ? String('Post') : 'Video',
        actionTag: getActionLabel(type),
        likes: item?.likes ?? item?.likeCount ?? item?.comment?.likeCount,
        unlikes:
            item?.unlikes ??
            item?.unlikeCount ??
            item?.dislikes ??
            item?.dislikeCount ??
            item?.comment?.dislikeCount,
        images: item?.images || (commentImageUrl ? [commentImageUrl] : []),
    }
}

const buildStatsFromData = (list = [], mode = 'moment') => {
    const configs =
        mode === 'place'
            ? [
                { key: 'review', label: 'Total Reviewed' },
                { key: 'save', label: 'Total Saved' },
                { key: 'share', label: 'Total Shared' },
                { key: 'view', label: 'Total Viewed' },
            ]
            : [
                { key: 'view', label: 'Total Viewed' },
                { key: 'like', label: 'Total Liked' },
                { key: 'save', label: 'Total Saved' },
                { key: 'share', label: 'Total Shared' },
                { key: 'repost', label: 'Total Reposts' },
                { key: 'comment', label: 'Total Comments' },
            ]

    return configs.map((item) => ({
        ...item,
        value: list.filter(
            (row) => normalizeActionType(row?.type || row?.actionType) === item.key
        ).length,
    }))
}

const normalizeStatsObject = (stats, mode = 'moment') => {
    if (!stats || typeof stats !== 'object' || Array.isArray(stats)) return []

    if (mode === 'place') {
        return [
            {
                key: 'review',
                label: 'Total Reviewed',
                value: toNumber(stats.reviewed ?? stats.review ?? stats.reviews),
            },
            {
                key: 'save',
                label: 'Total Saved',
                value: toNumber(stats.saved ?? stats.save ?? stats.saves),
            },
            {
                key: 'share',
                label: 'Total Shared',
                value: toNumber(stats.shared ?? stats.share ?? stats.shares),
            },
            {
                key: 'view',
                label: 'Total Viewed',
                value: toNumber(stats.viewed ?? stats.view ?? stats.views),
            },
        ]
    }

    return [
        {
            key: 'view',
            label: 'Total Viewed',
            value: toNumber(stats.viewed ?? stats.view ?? stats.views),
        },
        {
            key: 'like',
            label: 'Total Liked',
            value: toNumber(stats.liked ?? stats.like ?? stats.likes),
        },
        {
            key: 'save',
            label: 'Total Saved',
            value: toNumber(stats.saved ?? stats.save ?? stats.saves),
        },
        {
            key: 'share',
            label: 'Total Shared',
            value: toNumber(stats.shared ?? stats.share ?? stats.shares),
        },
        {
            key: 'repost',
            label: 'Total Reposts',
            value: toNumber(stats.reposts ?? stats.repost ?? stats.reposted),
        },
        {
            key: 'comment',
            label: 'Total Comments',
            value: toNumber(stats.comments ?? stats.comment ?? stats.commented),
        },
    ]
}

const normalizeStatsArray = (stats = []) => {
    if (!Array.isArray(stats)) return []

    return stats.map((item) => ({
        ...item,
        key: normalizeActionType(item?.key || item?.type || item?.label),
        value: toNumber(item?.value),
    }))
}

export default function ActivityView({
    userId,
    access_token,
    placeStats,
    momentsStats,
    placeTimeline,
    momentsTimeline,
}) {
    const STORAGE_KEYS = {
        tab: 'activity-view-tab',
        filter: 'activity-view-filter',
        currentPage: 'activity-view-current-page',
        pageSize: 'activity-view-page-size',
    }

    const fetchUserActivity = useUserProfileExtraStore(
        (state) => state.fetchUserActivity
    )
    const placeActivity = useUserProfileExtraStore((state) => state.activity.place)
    const momentActivity = useUserProfileExtraStore((state) => state.activity.moment)

    const [tab, setTab] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.tab)
        return saved === 'place' || saved === 'moments' ? saved : 'place'
    })

    const [filter, setFilter] = useState(() => {
        return localStorage.getItem(STORAGE_KEYS.filter) || 'all'
    })

    const [currentPage, setCurrentPage] = useState(() => {
        const saved = Number(localStorage.getItem(STORAGE_KEYS.currentPage))
        return Number.isFinite(saved) && saved > 0 ? saved : 1
    })

    const [pageSize, setPageSize] = useState(() => {
        const saved = Number(localStorage.getItem(STORAGE_KEYS.pageSize))
        return [10, 20, 50, 100].includes(saved) ? saved : 10
    })

    const hasApi = Boolean(userId && access_token)
    const activeMode = tab === 'place' ? 'place' : 'moment'
    const activeActivity = tab === 'place' ? placeActivity : momentActivity

    useEffect(() => {
        if (!hasApi) return

        fetchUserActivity({
            access_token,
            userId,
            page: currentPage,
            size: pageSize,
            type: activeMode,
            actionType: filter === 'all' ? '' : filter,
        })
    }, [
        hasApi,
        access_token,
        userId,
        currentPage,
        pageSize,
        activeMode,
        filter,
        fetchUserActivity,
    ])

    const data = useMemo(() => {
        if (hasApi) {
            const apiList = Array.isArray(activeActivity?.list)
                ? activeActivity.list
                : []

            return apiList.map(normalizeActivityItem)
        }

        return tab === 'place' ? placeTimeline : momentsTimeline
    }, [hasApi, activeActivity?.list, tab, placeTimeline, momentsTimeline])

    const stats = useMemo(() => {
        if (hasApi) {
            if (Array.isArray(activeActivity?.stats) && activeActivity.stats.length > 0) {
                return normalizeStatsArray(activeActivity.stats)
            }

            if (
                activeActivity?.stats &&
                typeof activeActivity.stats === 'object' &&
                !Array.isArray(activeActivity.stats)
            ) {
                return normalizeStatsObject(activeActivity.stats, activeMode)
            }

            return buildStatsFromData(data, activeMode)
        }

        return tab === 'place' ? placeStats : momentsStats
    }, [hasApi, activeActivity?.stats, activeMode, data, tab, placeStats, momentsStats])

    const filterOptions =
        tab === 'place'
            ? [
                { label: 'All Interaction', value: 'all' },
                { label: 'Review', value: 'review' },
                { label: 'Share', value: 'share' },
                { label: 'Save', value: 'save' },
            ]
            : [
                { label: 'All Interaction', value: 'all' },
                { label: 'Comment', value: 'comment' },
                { label: 'Repost', value: 'repost' },
                { label: 'Share', value: 'share' },
                { label: 'Like', value: 'like' },
                { label: 'Save', value: 'save' },
            ]

    const validFilterValues = useMemo(() => {
        return filterOptions.map((item) => item.value)
    }, [filterOptions])

    useEffect(() => {
        if (!validFilterValues.includes(filter)) {
            setFilter('all')
            setCurrentPage(1)
        }
    }, [filter, validFilterValues])

    const filteredData = useMemo(() => {
        if (hasApi) return data
        if (filter === 'all') return data

        return data.filter(
            (x) => normalizeActionType(x.type || x.actionType) === filter
        )
    }, [hasApi, data, filter])

    const total = hasApi
        ? activeActivity?.pagination?.total || activeActivity?.total || filteredData.length
        : filteredData.length

    const totalPages = hasApi
        ? activeActivity?.pagination?.totalPages || Math.max(1, Math.ceil(total / pageSize))
        : Math.max(1, Math.ceil(total / pageSize))

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1)
        }
    }, [currentPage, totalPages])

    const pageData = useMemo(() => {
        if (hasApi) return filteredData

        const start = (currentPage - 1) * pageSize
        return filteredData.slice(start, start + pageSize)
    }, [hasApi, filteredData, currentPage, pageSize])

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.tab, tab)
    }, [tab])

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.filter, filter)
    }, [filter])

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.currentPage, String(currentPage))
    }, [currentPage])

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.pageSize, String(pageSize))
    }, [pageSize])

    const getStatStyle = (stat) => {
        const key = String(stat?.key || '').toLowerCase()
        const label = String(stat?.label || '').toLowerCase()

        if (key.includes('review') || label.includes('review')) {
            return {
                background: '#fff8eb',
                color: '#faad14',
            }
        }

        if (key.includes('view') || label.includes('view')) {
            return {
                background: '#eaf6ff',
                color: '#1890ff',
            }
        }

        if (key.includes('like') || label.includes('like')) {
            return {
                background: '#fff0f0',
                color: '#ff0000',
            }
        }

        if (key.includes('save') || label.includes('save')) {
            return {
                background: '#fff3ea',
                color: '#fa6f1e',
            }
        }

        if (key.includes('comment') || label.includes('comment')) {
            return {
                background: '#eafff1',
                color: '#00b96b',
            }
        }

        if (key.includes('share') || label.includes('share')) {
            return {
                background: '#f0f1f3',
                color: '#334155',
            }
        }

        if (key.includes('repost') || label.includes('repost')) {
            return {
                background: '#f0f1f3',
                color: '#334155',
            }
        }

        return {
            background: '#f5f5f5',
            color: '#334155',
        }
    }

    const handleOpenMoment = (item) => {
        const momentId =
            item?.momentId ||
            item?.moment_id ||
            item?.moment?._id ||
            item?.moment?.id ||
            item?.post?._id ||
            item?.post?.id ||
            (item?.targetType === 'moment' ? item?.targetId : null) ||
            item?.target?._id ||
            item?.target?.id

        if (!momentId) return

        window.open(
            `${window.location.origin}/moment/post/detail/${momentId}`,
            '_blank',
            'noopener,noreferrer'
        )
    }

    const handleOpenPlace = (item) => {
        const placeId =
            item?.placeId ||
            item?.place_id ||
            item?.place?._id ||
            item?.place?.id ||
            item?.placeInfo?._id ||
            item?.placeInfo?.id ||
            (item?.targetType === 'place' ? item?.targetId : null) ||
            item?.target?._id ||
            item?.target?.id

        if (!placeId) return

        window.open(
            `${window.location.origin}/property/${placeId}/info`,
            '_blank',
            'noopener,noreferrer'
        )
    }

    const handleOpenUser = (item) => {
        const userId =
            item?.userId ||
            item?.user_id ||
            item?.ownerId ||
            item?.owner_id ||
            item?.createdById ||
            item?.created_by_id ||
            item?.creatorId ||
            item?.creator_id ||
            item?.moment?.author?._id ||
            item?.moment?.author?.id ||
            item?.user?._id ||
            item?.user?.id ||
            item?.owner?._id ||
            item?.owner?.id ||
            item?.createdBy?._id ||
            item?.createdBy?.id ||
            item?.creator?._id ||
            item?.creator?.id

        if (!userId) return

        window.open(
            `${window.location.origin}/app/user/profile/${userId}?tab=post`,
            '_blank',
            'noopener,noreferrer'
        )
    }



    const paginationProps = {
        current: currentPage,
        pageSize,
        total,
        onChange: (page, size) => {
            setCurrentPage(page)
            setPageSize(size)
        },
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
    }

    return (
        <div className="mt-4">
            <Tabs
                activeKey={tab}
                styles={{ body: { padding: 0 } }}
                className="compact-tabs"
                onChange={(k) => {
                    setTab(k)
                    setFilter('all')
                    setCurrentPage(1)
                }}
                items={[
                    { key: 'place', label: 'Place' },
                    { key: 'moments', label: 'Moments' },
                ]}
            />

            <div
                style={{
                    width: '100%',
                    overflowX: 'auto',
                    overflowY: 'hidden',
                    marginTop: 18,
                    paddingBottom: 6,
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            tab === 'place'
                                ? 'repeat(4, minmax(180px, 1fr))'
                                : 'repeat(6, minmax(150px, 1fr))',
                        gap: 14,
                        minWidth: tab === 'place' ? 760 : 970,
                    }}
                >
                    {(stats || []).map((s) => {
                        const style = getStatStyle(s)

                        return (
                            <div
                                key={s.key || s.label}
                                style={{
                                    background: style.background,
                                    borderRadius: 8,
                                    height: 60,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid rgba(0, 0, 0, 0.02)',
                                }}
                            >
                                <div
                                    style={{
                                        color: style.color,
                                        fontSize: 16,
                                        fontWeight: 700,
                                        lineHeight: '20px',
                                    }}
                                >
                                    {s.value || 0}
                                </div>

                                <div
                                    style={{
                                        color: '#6b7280',
                                        fontSize: 12,
                                        lineHeight: '16px',
                                        marginTop: 2,
                                    }}
                                >
                                    {s.label}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <Select
                    value={filter}
                    onChange={(v) => {
                        setFilter(v)
                        setCurrentPage(1)
                    }}
                    options={filterOptions}
                    className="w-[220px]"
                />
            </div>

            <div className="mt-3" style={{ position: 'relative', minHeight: 160 }}>
                {activeActivity?.loading && (
                    <div className="py-8 flex justify-center">
                        <Spin />
                    </div>
                )}

                {!activeActivity?.loading && pageData.length === 0 ? (
                    <div className="py-8">
                        <Empty description="No activity found" />
                    </div>
                ) : (
                    <List
                        dataSource={pageData}
                        split={false}
                        renderItem={(item) => (
                            <List.Item className="!px-0 !py-2">
                                <TimelineItem

                                    item={item}
                                    mode={tab === 'place' ? 'place' : 'moments'}
                                    onOpenPlace={handleOpenPlace}
                                    onOpenUser={handleOpenUser}
                                    onOpenMoment={handleOpenMoment}

                                />
                            </List.Item>
                        )}
                    />
                )}

                <div className="mt-4 mb-5 flex items-center justify-end">
                    <Pagination {...paginationProps} />
                </div>
            </div>
        </div>
    )
}