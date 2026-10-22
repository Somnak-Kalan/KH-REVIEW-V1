import httpCommon from '../../../utils/http-common'

const KEYWORD_GROUP_API = '/setup/keyword-group'
const KEYWORD_API = '/setup/keyword'

const cleanParams = (params = {}) => {
    return Object.fromEntries(
        Object.entries(params).filter(([, value]) => {
            return (
                value !== undefined &&
                value !== null &&
                value !== ''
            )
        })
    )
}

const getAuthorizationHeader = (
    access_token = ''
) => {
    const token =
        String(access_token || '').trim()

    if (!token) return ''

    return token
        .toLowerCase()
        .startsWith('bearer ')
        ? token
        : `Bearer ${token}`
}

const getHeaders = (
    access_token = ''
) => {
    const authorization =
        getAuthorizationHeader(
            access_token
        )

    if (!authorization) return {}

    return {
        Authorization:
            authorization,
    }
}

// ====== LIST GROUPS ======
const getKeywordGroupList = async ({
    access_token = '',
    params = {},
} = {}) => {
    if (!access_token) {
        throw new Error(
            'Access token is required.'
        )
    }

    return httpCommon.get(
        `${KEYWORD_GROUP_API}/list`,
        {
            params:
                cleanParams(params),

            headers:
                getHeaders(
                    access_token
                ),
        }
    )
}

// ====== GROUP DETAIL ======
const getKeywordGroupDetail = async ({
    id,
    access_token = '',
} = {}) => {
    if (!id) {
        throw new Error(
            'Keyword group ID is required.'
        )
    }

    if (!access_token) {
        throw new Error(
            'Access token is required.'
        )
    }

    return httpCommon.get(
        `${KEYWORD_GROUP_API}/${id}`,
        {
            headers:
                getHeaders(
                    access_token
                ),
        }
    )
}

// ====== KEYWORDS INSIDE GROUP ======
const getKeywordGroupKeywords = async ({
    id,
    access_token = '',
    params = {},
} = {}) => {
    if (!id) {
        throw new Error(
            'Keyword group ID is required.'
        )
    }

    if (!access_token) {
        throw new Error(
            'Access token is required.'
        )
    }

    return httpCommon.get(
        `${KEYWORD_GROUP_API}/${id}/keywords`,
        {
            params:
                cleanParams(params),

            headers:
                getHeaders(
                    access_token
                ),
        }
    )
}

// ====== ADD EXISTING UNGROUPED KEYWORDS TO GROUP ======
const addExistingKeywordsToGroup = async ({
    id,
    access_token = '',
    keywordIds = [],
} = {}) => {
    if (!id) {
        throw new Error(
            'Keyword group ID is required.'
        )
    }

    if (!access_token) {
        throw new Error(
            'Access token is required.'
        )
    }

    if (
        !Array.isArray(
            keywordIds
        ) ||
        keywordIds.length === 0
    ) {
        throw new Error(
            'At least one keyword is required.'
        )
    }

    return httpCommon.post(
        `${KEYWORD_GROUP_API}/${id}/keywords`,
        {
            keywordIds,
        },
        {
            headers: {
                ...getHeaders(
                    access_token
                ),

                'Content-Type':
                    'application/json',
            },
        }
    )
}

// ====== CREATE KEYWORD INSIDE GROUP ======
const createKeywordInGroup = async ({
    id,
    access_token = '',
    payload = {},
} = {}) => {
    if (!id) {
        throw new Error(
            'Keyword group ID is required.'
        )
    }

    if (!access_token) {
        throw new Error(
            'Access token is required.'
        )
    }

    if (!payload?.nameEn?.trim()) {
        throw new Error(
            'Keyword English name is required.'
        )
    }

    if (!payload?.nameKh?.trim()) {
        throw new Error(
            'Keyword Khmer name is required.'
        )
    }

    return httpCommon.post(
        `${KEYWORD_GROUP_API}/${id}/keywords/create`,
        {
            nameEn:
                payload.nameEn.trim(),

            nameKh:
                payload.nameKh.trim(),
        },
        {
            headers: {
                ...getHeaders(
                    access_token
                ),

                'Content-Type':
                    'application/json',
            },
        }
    )
}

// ====== CREATE GROUP ======
const createKeywordGroup = async ({
    access_token = '',
    payload = {},
} = {}) => {
    if (!access_token) {
        throw new Error(
            'Access token is required.'
        )
    }

    return httpCommon.post(
        `${KEYWORD_GROUP_API}/create`,
        payload,
        {
            headers:
                getHeaders(
                    access_token
                ),
        }
    )
}

// ====== UPDATE GROUP ======
const updateKeywordGroup = async ({
    access_token = '',
    payload = {},
} = {}) => {
    if (!access_token) {
        throw new Error(
            'Access token is required.'
        )
    }

    if (!payload?._id) {
        throw new Error(
            'Keyword group ID is required.'
        )
    }

    return httpCommon.put(
        `${KEYWORD_GROUP_API}/update`,
        payload,
        {
            headers:
                getHeaders(
                    access_token
                ),
        }
    )
}

// ====== DELETE GROUP ======
const deleteKeywordGroup = async ({
    id,
    access_token = '',
    moveKeywordsToUngrouped = true,
} = {}) => {
    if (!id) {
        throw new Error(
            'Keyword group ID is required.'
        )
    }

    if (!access_token) {
        throw new Error(
            'Access token is required.'
        )
    }

    return httpCommon.delete(
        `${KEYWORD_GROUP_API}/${id}`,
        {
            headers: {
                ...getHeaders(
                    access_token
                ),

                'Content-Type':
                    'application/json',
            },

            data: {
                moveKeywordsToUngrouped:
                    Boolean(
                        moveKeywordsToUngrouped
                    ),
            },
        }
    )
}

// ====== TRANSFER KEYWORDS ======
const transferKeywords = async ({
    access_token = '',
    payload = {},
} = {}) => {
    if (!access_token) {
        throw new Error(
            'Access token is required.'
        )
    }

    if (
        !Array.isArray(
            payload?.keywordIds
        ) ||
        payload.keywordIds.length === 0
    ) {
        throw new Error(
            'At least one keyword is required.'
        )
    }

    if (!payload?.fromGroupId) {
        throw new Error(
            'Source group ID is required.'
        )
    }

    return httpCommon.patch(
        `${KEYWORD_API}/transfer`,
        {
            keywordIds:
                payload.keywordIds,

            fromGroupId:
                payload.fromGroupId,

            targetGroupId:
                payload.targetGroupId ||
                null,
        },
        {
            headers: {
                ...getHeaders(
                    access_token
                ),

                'Content-Type':
                    'application/json',
            },
        }
    )
}

const KeywordGroupService = {
    getKeywordGroupList,
    getKeywordGroupDetail,
    getKeywordGroupKeywords,
    addExistingKeywordsToGroup,
    createKeywordInGroup,
    createKeywordGroup,
    updateKeywordGroup,
    deleteKeywordGroup,
    transferKeywords,
}

export default KeywordGroupService