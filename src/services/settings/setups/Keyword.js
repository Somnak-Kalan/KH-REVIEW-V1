import httpCommon from '../../../utils/http-common'

const KEYWORD_API = '/setup/keyword'

const cleanParams = (params = {}) => {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) => {
            return value !== undefined && value !== null && value !== ''
        })
    )
}

const getAuthorizationHeader = (access_token = '') => {
    const token = String(access_token || '').trim()

    if (!token) return ''

    return token.toLowerCase().startsWith('bearer ')
        ? token
        : `Bearer ${token}`
}

const getHeaders = (access_token = '') => {
    const authorization = getAuthorizationHeader(access_token)

    if (!authorization) return {}

    return {
        Authorization: authorization,
    }
}

// ====== LIST + SEARCH + PAGINATION ======
const getKeywordList = async ({
    access_token = '',
    params = {},
} = {}) => {
    if (!access_token) {
        throw new Error('Access token is required.')
    }

    return httpCommon.get(`${KEYWORD_API}/list`, {
        params: cleanParams(params),
        headers: getHeaders(access_token),
    })
}

// ====== CHECK DUPLICATE KEYWORD ======
const checkKeyword = async ({
    access_token = '',
    payload = {},
} = {}) => {
    if (!access_token) {
        throw new Error('Access token is required.')
    }

    return httpCommon.post(
        `${KEYWORD_API}/check`,
        payload,
        {
            headers: getHeaders(access_token),
        }
    )
}

// ====== CREATE KEYWORD ======
const createKeyword = async ({
    access_token = '',
    payload = {},
} = {}) => {
    if (!access_token) {
        throw new Error('Access token is required.')
    }

    return httpCommon.post(
        `${KEYWORD_API}/create`,
        payload,
        {
            headers: getHeaders(access_token),
        }
    )
}

// ====== UPDATE KEYWORD ======
const updateKeyword = async ({
    access_token = '',
    payload = {},
} = {}) => {
    if (!access_token) {
        throw new Error('Access token is required.')
    }

    if (!payload?._id) {
        throw new Error('Keyword ID is required.')
    }

    return httpCommon.put(
        `${KEYWORD_API}/update`,
        payload,
        {
            headers: getHeaders(access_token),
        }
    )
}

// ====== DELETE KEYWORD ======
const deleteKeyword = async ({
    id,
    access_token = '',
} = {}) => {
    if (!id) {
        throw new Error('Keyword ID is required.')
    }

    if (!access_token) {
        throw new Error('Access token is required.')
    }

    return httpCommon.delete(`${KEYWORD_API}/${id}`, {
        headers: getHeaders(access_token),
    })
}

const KeywordService = {
    getKeywordList,
    checkKeyword,
    createKeyword,
    updateKeyword,
    deleteKeyword,
}

export default KeywordService