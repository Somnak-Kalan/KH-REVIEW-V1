import axios from 'axios'
import Config from '../../../utils/config'

const API_BASE_URL = Config.baseURL

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        Accept: 'application/json',
    },
})

const authHeaders = (access_token) => {
    return access_token
        ? {
            Authorization: `Bearer ${access_token}`,
        }
        : {}
}

const cleanParams = (params = {}) => {
    const result = {}

    Object.entries(params).forEach(([key, value]) => {
        if (
            value !== undefined &&
            value !== null &&
            value !== '' &&
            !(value === 'all' && key !== 'actionType')
        ) {
            result[key] = value
        }
    })

    return result
}

const formatDateParam = (value) => {
    if (!value) return undefined

    if (typeof value?.format === 'function') {
        return value.format('YYYY-MM-DD')
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return undefined

    return date.toISOString().slice(0, 10)
}

const toApiActionTypeParam = (value) => {
    const type = String(value || '').toLowerCase().trim()

    if (!type) return undefined
    if (type === 'all') return 'all'

    if (type === 'view' || type === 'viewed' || type === 'views') return 'view'
    if (type === 'like' || type === 'liked' || type === 'likes') return 'like'
    if (type === 'save' || type === 'saved' || type === 'saves') return 'save'
    if (type === 'share' || type === 'shared' || type === 'shares') return 'share'
    if (type === 'repost' || type === 'reposted' || type === 'reposts') return 'repost'
    if (type === 'comment' || type === 'commented' || type === 'comments') return 'comment'
    if (type === 'review' || type === 'reviewed' || type === 'reviews') return 'review'

    return type
}

const validateApiResponse = (res) => {
    if (typeof res?.data === 'string') {
        const html =
            res.data.trim().startsWith('<!DOCTYPE') ||
            res.data.trim().startsWith('<html')

        if (html) {
            throw new Error(
                'API returned HTML instead of JSON. Please check API base URL, Vite proxy, or backend route.'
            )
        }
    }

    return res.data
}

export const getUserProfileMoments = async ({
    access_token,
    userId,
    page = 1,
    size = 20,
    type,
    status,
    search,
    createdBy,
    dateRange = [],
}) => {
    const [startDate, endDate] = Array.isArray(dateRange) ? dateRange : []

    const res = await api.get(`/app/users/${userId}/moments`, {
        headers: authHeaders(access_token),
        params: cleanParams({
            page,
            size,
            type,
            status,
            search,
            createdBy,
            startDate: formatDateParam(startDate),
            endDate: formatDateParam(endDate),
        }),
    })

    return validateApiResponse(res)
}

export const getUserProfileActivity = async ({
    access_token,
    userId,
    page = 1,
    size = 20,
    type = 'moment',
    action,
    actionType = 'all',
}) => {
    const res = await api.get(`/app/users/${userId}/activity`, {
        headers: authHeaders(access_token),
        params: cleanParams({
            page,
            size,
            type,
            actionType: toApiActionTypeParam(actionType || action),
        }),
    })

    return validateApiResponse(res)
}

export const getCreatorRequestsByUser = async ({
    access_token,
    userId,
    page = 1,
    size = 10,
    status
}) => {

    const res = await api.get('/creator-requests/list', {
        headers: authHeaders(access_token),
        params: cleanParams({
            page,
            size,
            userId,
            status
        }),
    })

    return validateApiResponse(res)
}

export const getUserRestrictions = async ({ access_token, userId }) => {
    const res = await api.get(`/app/users/${userId}/restrictions`, {
        headers: authHeaders(access_token),
    })

    return validateApiResponse(res)
}

export const updateUserRestriction = async ({
    access_token,
    userId,
    capability,
    reason,
    value,
}) => {
    const body = {
        capability,
        value,
    }

    // Do not send empty reason when allow
    if (reason) {
        body.reason = reason
    }

    const res = await api.patch(`/app/users/${userId}/restrictions`, body, {
        headers: {
            ...authHeaders(access_token),
            'Content-Type': 'application/json',
        },
    })

    return validateApiResponse(res)
}