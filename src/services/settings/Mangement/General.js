import httpCommon from '../../../utils/http-common'

const getHeaders = (accessToken, hasBody = false) => ({
    Authorization: `Bearer ${accessToken}`,
    ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
})

// ============================
// GET all settings
// curl: GET /core/settings
// ============================
const getSettings = async (payload) => {
    try {
        const response = await httpCommon.get('/settings', {
            headers: getHeaders(payload.access_token),
        })

        return response.data
    } catch (error) {
        console.error(
            'Error getting settings:',
            error.response?.data || error.message
        )
        throw error
    }
}

// ============================
// GET posting settings
// curl: GET /core/settings/posting
// ============================
const getPostingSettings = async (payload) => {
    try {
        const response = await httpCommon.get('/settings/posting', {
            headers: getHeaders(payload.access_token),
        })

        return response.data
    } catch (error) {
        console.error(
            'Error getting posting settings:',
            error.response?.data || error.message
        )
        throw error
    }
}

// ============================
// UPDATE settings
// curl: PUT /core/settings
// body: { settings: [...] }
// ============================
const updateSettings = async (payload) => {
    try {
        const response = await httpCommon.put(
            '/settings',
            {
                settings: payload.settings,
            },
            {
                headers: getHeaders(payload.access_token, true),
            }
        )

        return response.data
    } catch (error) {
        console.error(
            'Error updating settings:',
            error.response?.data || error.message
        )
        throw error
    }
}

const updateSingleSetting = async (payload) => {
    return updateSettings({
        access_token: payload.access_token,
        settings: [
            {
                key: payload.key,
                value: payload.value,
                group: payload.group,
                type: payload.type || 'boolean',
            },
        ],
    })
}

const GeneralService = {
    getSettings,
    getPostingSettings,
    updateSettings,
    updateSingleSetting,
}

export default GeneralService