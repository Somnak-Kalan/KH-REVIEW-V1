import { create } from 'zustand'

import {
    getCreatorRequestsByUser,
    getUserProfileActivity,
    getUserProfileMoments,
    getUserRestrictions,
    updateUserRestriction,
} from '../../../services/MobileApp/User/userProfile'

const getErrorMessage = (error) => {
    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Something went wrong'
    )
}

const getNumber = (value, fallback = 0) => {
    const num = Number(value)
    return Number.isFinite(num) ? num : fallback
}

const extractList = (body) => {
    const candidates = [
        body,
        body?.data,
        body?.result,
        body?.payload,
        body?.rows,
        body?.items,
        body?.docs,
        body?.list,
        body?.results,
    ]

    for (const item of candidates) {
        if (Array.isArray(item)) return item
    }

    for (const item of candidates) {
        if (!item || typeof item !== 'object') continue

        const keys = ['rows', 'items', 'docs', 'list', 'results', 'data']
        for (const key of keys) {
            if (Array.isArray(item?.[key])) return item[key]
        }
    }

    return []
}

const extractTotal = (body, fallback = 0) => {
    const candidates = [body, body?.data, body?.result, body?.payload, body?.meta]

    for (const item of candidates) {
        if (!item || typeof item !== 'object') continue

        const total =
            item.total ??
            item.totalCount ??
            item.count ??
            item.totalDocs ??
            item.totalItems ??
            item.pagination?.total ??
            item.meta?.pagination?.total ??
            item.meta?.total

        if (total !== undefined && total !== null) {
            return getNumber(total, fallback)
        }
    }

    return fallback
}

const extractPagination = (body, fallback = {}) => {
    const candidates = [body, body?.data, body?.result, body?.payload, body?.meta]

    for (const item of candidates) {
        if (!item || typeof item !== 'object') continue

        const pagination = item.pagination || item.meta?.pagination

        if (pagination && typeof pagination === 'object') {
            const total = getNumber(
                pagination.total,
                getNumber(fallback.total, 0)
            )
            const page = getNumber(
                pagination.page,
                getNumber(fallback.page, 1)
            )
            const size = getNumber(
                pagination.size,
                getNumber(fallback.size, 10)
            )
            const totalPages = getNumber(
                pagination.totalPages,
                Math.max(1, Math.ceil(total / Math.max(1, size)))
            )

            return {
                total,
                page,
                size,
                totalPages,
            }
        }
    }

    const total = getNumber(fallback.total, 0)
    const page = getNumber(fallback.page, 1)
    const size = getNumber(fallback.size, 10)

    return {
        total,
        page,
        size,
        totalPages: Math.max(1, Math.ceil(total / Math.max(1, size))),
    }
}

const extractSummary = (body) => {
    const candidates = [body, body?.data, body?.result, body?.payload, body?.meta]

    for (const item of candidates) {
        if (!item || typeof item !== 'object') continue

        const summary =
            item.summary ||
            item.stats ||
            item.totalStats ||
            item.engagement ||
            item.overview

        if (summary && typeof summary === 'object') return summary
    }

    return {}
}

const normalizeStatusKey = (status) => {
    const value = String(status || '').toLowerCase().trim()

    if (value === 'active') return 'active'
    if (
        value === 'under_review' ||
        value === 'under review' ||
        value === 'review' ||
        value === 'pending'
    ) {
        return 'under_review'
    }

    if (value === 'hide' || value === 'hidden' || value === 'inactive') {
        return 'hide'
    }

    return value || 'active'
}

const getValueFromSummary = (summary = {}, keys = []) => {
    for (const key of keys) {
        if (summary?.[key] !== undefined && summary?.[key] !== null) {
            return getNumber(summary[key])
        }
    }

    return 0
}

const buildMomentStatusCounts = (summary = {}, list = []) => {
    const statusSummary =
        summary.status ||
        summary.statusCounts ||
        summary.byStatus ||
        summary.momentStatus ||
        {}

    const counts = {
        active: getNumber(statusSummary.active ?? statusSummary.Active),
        under_review: getNumber(
            statusSummary.under_review ??
            statusSummary.underReview ??
            statusSummary.pending ??
            statusSummary.review
        ),
        hide: getNumber(
            statusSummary.hide ?? statusSummary.hidden ?? statusSummary.inactive
        ),
    }

    if (counts.active || counts.under_review || counts.hide) {
        return counts
    }

    return list.reduce(
        (acc, item) => {
            const key = normalizeStatusKey(item?.status || item?.momentStatus)
            if (key === 'under_review') acc.under_review += 1
            else if (key === 'hide') acc.hide += 1
            else acc.active += 1
            return acc
        },
        {
            active: 0,
            under_review: 0,
            hide: 0,
        }
    )
}

const buildMomentDashboardStats = (summary = {}, list = []) => {
    const fallback = list.reduce(
        (acc, item) => {
            acc.views += getNumber(item?.views ?? item?.viewCount ?? item?.totalViews)
            acc.likes += getNumber(item?.likes ?? item?.likeCount ?? item?.totalLikes)
            acc.saves += getNumber(item?.saves ?? item?.saveCount ?? item?.totalSaves)
            acc.shares += getNumber(item?.shares ?? item?.shareCount ?? item?.totalShares)
            acc.reposts += getNumber(
                item?.reposts ?? item?.repostCount ?? item?.totalReposts
            )
            acc.comments += getNumber(
                item?.comments ?? item?.commentCount ?? item?.totalComments
            )
            return acc
        },
        {
            views: 0,
            likes: 0,
            saves: 0,
            shares: 0,
            reposts: 0,
            comments: 0,
        }
    )

    return [
        {
            key: 'views',
            value:
                getValueFromSummary(summary, [
                    'views',
                    'viewCount',
                    'totalViews',
                    'totalViewed',
                ]) || fallback.views,
            label: 'Total Viewed',
            valueColor: '#1890ff',
            bgColor: '#eaf5ff',
        },
        {
            key: 'likes',
            value:
                getValueFromSummary(summary, [
                    'likes',
                    'likeCount',
                    'totalLikes',
                    'totalLiked',
                ]) || fallback.likes,
            label: 'Total Liked',
            valueColor: '#ff0000',
            bgColor: '#fff0f0',
        },
        {
            key: 'saves',
            value:
                getValueFromSummary(summary, [
                    'saves',
                    'saveCount',
                    'totalSaves',
                    'totalSaved',
                ]) || fallback.saves,
            label: 'Total Saved',
            valueColor: '#fa8c16',
            bgColor: '#fff4ec',
        },
        {
            key: 'shares',
            value:
                getValueFromSummary(summary, [
                    'shares',
                    'shareCount',
                    'totalShares',
                    'totalShared',
                ]) || fallback.shares,
            label: 'Total Shared',
            valueColor: '#334155',
            bgColor: '#f1f2f4',
        },
        {
            key: 'reposts',
            value:
                getValueFromSummary(summary, [
                    'reposts',
                    'repostCount',
                    'totalReposts',
                ]) || fallback.reposts,
            label: 'Total Reposts',
            valueColor: '#334155',
            bgColor: '#f1f2f4',
        },
        {
            key: 'comments',
            value:
                getValueFromSummary(summary, [
                    'comments',
                    'commentCount',
                    'totalComments',
                ]) || fallback.comments,
            label: 'Total Comments',
            valueColor: '#00b96b',
            bgColor: '#eafaf1',
        },
    ]
}

const normalizeActivityType = (value) => {
    const type = String(value || '').toLowerCase().trim()

    if (type.includes('review')) return 'review'
    if (type.includes('share')) return 'share'
    if (type.includes('save')) return 'save'
    if (type.includes('comment')) return 'comment'
    if (type.includes('repost')) return 'repost'
    if (type.includes('like')) return 'like'
    if (type.includes('view')) return 'view'

    return type || 'view'
}

const normalizeActivityItem = (item = {}) => {
    const activityType = normalizeActivityType(
        item.actionType ||
        item.type ||
        item.action ||
        item.activityType ||
        item.eventType
    )

    const commentImageUrl =
        item?.comment?.image?.small?.url ||
        item?.comment?.image?.medium?.url ||
        item?.comment?.image?.large?.url ||
        item?.comment?.image?.original?.url ||
        ''

    return {
        ...item,
        _id: item?._id || item?.id || item?.activityId,
        type: activityType,
        actionType: activityType,
        title:
            item?.title ||
            item?.message ||
            item?.description ||
            item?.activityTitle ||
            '-',
        desc:
            item?.desc ||
            item?.description ||
            item?.caption ||
            item?.content ||
            item?.comment?.text ||
            '',
        createdAt: item?.createdAt || item?.created_at || item?.actedAt || item?.time,
        time: item?.time || item?.actedAt || item?.createdAt || item?.created_at || '-',
        placeName:
            item?.placeName ||
            item?.place?.name ||
            item?.place?.nameEn ||
            item?.placeInfo?.name ||
            item?.target?.name,
        userName:
            item?.userName ||
            item?.username ||
            item?.moment?.author?.username ||
            item?.moment?.author?.name ||
            item?.user?.username ||
            item?.owner?.username ||
            item?.creator?.username,
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

const buildActivityStats = (list = [], mode = 'moment') => {
    const keys =
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

    return keys.map((item) => ({
        ...item,
        value: list.filter(
            (row) => normalizeActivityType(row?.type || row?.actionType) === item.key
        ).length,
    }))
}

const normalizeCreatorRequest = (item = {}) => {
    const user =
        item?.user ||
        item?.appUser ||
        item?.customer ||
        item?.createdByUser ||
        {}

    const contentTypes =
        item?.contentTypes ||
        item?.contentType ||
        item?.categories ||
        item?.category ||
        []

    return {
        ...item,
        _id: item?._id || item?.id,
        userName:
            item?.userName ||
            item?.username ||
            user?.username ||
            user?.name ||
            '-',
        location:
            item?.location ||
            item?.province ||
            user?.location ||
            user?.province ||
            '-',
        followers: getNumber(item?.followers ?? item?.follower ?? user?.followers),
        avatar:
            item?.avatar ||
            item?.profilePicture ||
            item?.profile ||
            user?.profilePicture ||
            user?.profile ||
            '',
        status:
            item?.status ||
            item?.requestStatus ||
            item?.creatorRequestStatus ||
            'Pending',
        about:
            item?.about ||
            item?.bio ||
            item?.reason ||
            item?.description ||
            '-',
        contentTypes: Array.isArray(contentTypes)
            ? contentTypes
            : contentTypes
                ? [contentTypes]
                : [],
        requestBy:
            item?.requestBy ||
            item?.createdBy?.username ||
            item?.requestByUser?.username ||
            'Admin',
        createdAt: item?.createdAt || item?.created_at || item?.requestDate || '-',
    }
}

const normalizeRestrictionItem = (data = {}) => {
    const source = data?.data || data?.result || data?.payload || data || {}

    const getCapability = (key) => {
        const item = source?.[key] || {}

        if (typeof item === 'boolean') {
            return {
                value: item,
                reason: '',
            }
        }

        return {
            value:
                item?.value ??
                item?.allowed ??
                item?.isAllowed ??
                source?.capabilities?.[key] ??
                true,
            reason: item?.reason || item?.restrictReason || '',
            updatedAt: item?.updatedAt || item?.updated_at || '',
        }
    }

    return {
        postMoment: getCapability('postMoment'),
        comment: getCapability('comment'),
        review: getCapability('review'),
    }
}

export const useUserProfileExtraStore = create((set, get) => ({
    moments: {
        list: [],
        total: 0,
        loading: false,
        error: null,
        summary: {},
        dashboardStats: buildMomentDashboardStats({}, []),
        statusCounts: {
            active: 0,
            under_review: 0,
            hide: 0,
        },
    },

    activity: {
        place: {
            list: [],
            total: 0,
            loading: false,
            error: null,
            stats: [],
            pagination: {
                total: 0,
                page: 1,
                size: 10,
                totalPages: 1,
            },
        },
        moment: {
            list: [],
            total: 0,
            loading: false,
            error: null,
            stats: [],
            pagination: {
                total: 0,
                page: 1,
                size: 10,
                totalPages: 1,
            },
        },
    },

    creatorRequests: {
        list: [],
        total: 0,
        loading: false,
        error: null,
    },

    restrictions: {
        data: normalizeRestrictionItem({}),
        loading: false,
        updating: false,
        error: null,
    },

    fetchUserMoments: async (params) => {
        set((state) => ({
            moments: {
                ...state.moments,
                loading: true,
                error: null,
            },
        }))


        try {
            const res = await getUserProfileMoments(params)
            const list = extractList(res)
            const summary = extractSummary(res)
            const normalizedList = Array.isArray(list) ? list : []

            set({
                moments: {
                    list: normalizedList,
                    total: extractTotal(res, normalizedList.length),
                    loading: false,
                    error: null,
                    summary,
                    dashboardStats: buildMomentDashboardStats(summary, normalizedList),
                    statusCounts: buildMomentStatusCounts(summary, normalizedList),
                },
            })

            return res
        } catch (error) {
            const message = getErrorMessage(error)

            set((state) => ({
                moments: {
                    ...state.moments,
                    loading: false,
                    error: message,
                },
            }))

            throw error
        }
    },

    fetchUserActivity: async (params) => {
        const mode = params?.type === 'place' ? 'place' : 'moment'

        set((state) => ({
            activity: {
                ...state.activity,
                [mode]: {
                    ...state.activity[mode],
                    loading: true,
                    error: null,
                },
            },
        }))

        try {
            const res = await getUserProfileActivity(params)
            const list = extractList(res).map(normalizeActivityItem)
            const summary = extractSummary(res)
            const pagination = extractPagination(res, {
                total: extractTotal(res, list.length),
                page: params?.page,
                size: params?.size,
            })

            const statsFromSummary = Array.isArray(summary)
                ? summary
                : summary?.stats || summary?.items || []

            const stats =
                Array.isArray(statsFromSummary) && statsFromSummary.length
                    ? statsFromSummary
                    : summary && typeof summary === 'object' && Object.keys(summary).length
                        ? summary
                        : buildActivityStats(list, mode)

            set((state) => ({
                activity: {
                    ...state.activity,
                    [mode]: {
                        list,
                        total: pagination.total,
                        loading: false,
                        error: null,
                        stats,
                        pagination,
                    },
                },
            }))

            return res
        } catch (error) {
            const message = getErrorMessage(error)

            set((state) => ({
                activity: {
                    ...state.activity,
                    [mode]: {
                        ...state.activity[mode],
                        loading: false,
                        error: message,
                    },
                },
            }))

            throw error
        }
    },

    fetchCreatorRequestsByUser: async (params) => {

        set((state) => ({
            creatorRequests: {
                ...state.creatorRequests,
                loading: true,
                error: null,
            },
        }))

        try {
            const res = await getCreatorRequestsByUser(params)
            const list = extractList(res).map(normalizeCreatorRequest)

            set({
                creatorRequests: {
                    list,
                    total: extractTotal(res, list.length),
                    loading: false,
                    error: null,
                },
            })

            return res
        } catch (error) {
            const message = getErrorMessage(error)

            set((state) => ({
                creatorRequests: {
                    ...state.creatorRequests,
                    loading: false,
                    error: message,
                },
            }))

            throw error
        }
    },

    fetchUserRestrictions: async (params) => {
        set((state) => ({
            restrictions: {
                ...state.restrictions,
                loading: true,
                error: null,
            },
        }))

        try {
            const res = await getUserRestrictions(params)

            set((state) => ({
                restrictions: {
                    ...state.restrictions,
                    data: normalizeRestrictionItem(res),
                    loading: false,
                    error: null,
                },
            }))

            return res
        } catch (error) {
            const message = getErrorMessage(error)

            set((state) => ({
                restrictions: {
                    ...state.restrictions,
                    loading: false,
                    error: message,
                },
            }))

            throw error
        }
    },

    updateRestriction: async (params) => {
        set((state) => ({
            restrictions: {
                ...state.restrictions,
                updating: true,
                error: null,
            },
        }))

        try {
            const res = await updateUserRestriction(params)

            await get().fetchUserRestrictions({
                access_token: params.access_token,
                userId: params.userId,
            })

            set((state) => ({
                restrictions: {
                    ...state.restrictions,
                    updating: false,
                    error: null,
                },
            }))

            return res
        } catch (error) {
            const message = getErrorMessage(error)

            set((state) => ({
                restrictions: {
                    ...state.restrictions,
                    updating: false,
                    error: message,
                },
            }))

            throw error
        }
    },

    resetUserProfileExtra: () => {
        set({
            moments: {
                list: [],
                total: 0,
                loading: false,
                error: null,
                summary: {},
                dashboardStats: buildMomentDashboardStats({}, []),
                statusCounts: {
                    active: 0,
                    under_review: 0,
                    hide: 0,
                },
            },
            activity: {
                place: {
                    list: [],
                    total: 0,
                    loading: false,
                    error: null,
                    stats: [],
                    pagination: {
                        total: 0,
                        page: 1,
                        size: 10,
                        totalPages: 1,
                    },
                },
                moment: {
                    list: [],
                    total: 0,
                    loading: false,
                    error: null,
                    stats: [],
                    pagination: {
                        total: 0,
                        page: 1,
                        size: 10,
                        totalPages: 1,
                    },
                },
            },
            creatorRequests: {
                list: [],
                total: 0,
                loading: false,
                error: null,
            },
            restrictions: {
                data: normalizeRestrictionItem({}),
                loading: false,
                updating: false,
                error: null,
            },
        })
    },
}))