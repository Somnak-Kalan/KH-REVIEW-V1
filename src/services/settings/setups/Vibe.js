import httpCommon from '../../../utils/http-common'

const VIBE_ENDPOINT = '/setup/vibe'

const getAuthConfig = (access_token, extraConfig = {}) => {
    return {
        ...extraConfig,
        headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
            ...(extraConfig?.headers || {}),
        },
    }
}

const VibeService = {
    Create_Vibe: async ({ access_token, doc }) => {
        const response = await httpCommon.post(
            `${VIBE_ENDPOINT}/create`,
            doc,
            getAuthConfig(access_token)
        )

        return response?.data
    },

    Update_Vibe: async ({ access_token, doc }) => {
        const response = await httpCommon.put(
            `${VIBE_ENDPOINT}/update`,
            doc,
            getAuthConfig(access_token)
        )

        return response?.data
    },

    Get_Vibe_List: async ({ access_token, doc = {} }) => {
        const search = String(doc?.search || '').trim()

        const response = await httpCommon.get(
            `${VIBE_ENDPOINT}/list`,
            getAuthConfig(access_token, {
                params: search ? { search } : {},
            })
        )

        return response?.data
    },

    Get_Vibe_By_Id: async ({ access_token, _id }) => {
        const response = await httpCommon.get(
            `${VIBE_ENDPOINT}/${encodeURIComponent(_id)}`,
            getAuthConfig(access_token)
        )

        return response?.data
    },

    Delete_Vibe: async ({ access_token, _id }) => {
        const response = await httpCommon.delete(
            `${VIBE_ENDPOINT}/${encodeURIComponent(_id)}`,
            getAuthConfig(access_token)
        )

        return response?.data
    },
}

export default VibeService