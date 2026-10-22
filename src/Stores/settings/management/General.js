import { create } from 'zustand'
import GeneralService from '../../../services/settings/Mangement/General'

const DEFAULT_SETTINGS = {
    requireMention: false,
    requireReviewMoment: false,

    normalUserPost: true,
    normalUserVideo: true,
    normalUserReview: false,
    normalUserMention: false,

    creatorPost: true,
    creatorVideo: true,
    creatorReview: false,
    creatorMention: false,

    requestCreator: true,
    ownerViewCount: true,
    viewerViewCount: true,
}

const API_SETTING_MAP = {
    requireMention: {
        key: 'moment.requiredMention',
        group: 'moment',
        type: 'boolean',
        aliases: ['requireMention', 'requiredMention'],
    },

    requireReviewMoment: {
        key: 'moment.requiredReviewMoment',
        group: 'moment',
        type: 'boolean',
        aliases: [
            'moment.requiredReview',
            'requireReviewMoment',
            'requiredReviewMoment',
        ],
    },

    normalUserPost: {
        key: 'posting.normalUserPost',
        group: 'posting',
        type: 'boolean',
        aliases: ['normalUserPost', 'moment.posting.normalUser.allowPost'],
    },

    normalUserVideo: {
        key: 'posting.normalUserVideo',
        group: 'posting',
        type: 'boolean',
        aliases: ['normalUserVideo', 'moment.posting.normalUser.allowVideo'],
    },

    normalUserReview: {
        key: 'posting.normalUserReview',
        group: 'posting',
        type: 'boolean',
        aliases: [
            'normalUserReview',
            'posting.normalUserReview',
            'posting.normalUser.requiredReview',
            'moment.posting.normalUser.requiredReview',
        ],
    },

    normalUserMention: {
        key: 'posting.normalUserMention',
        group: 'posting',
        type: 'boolean',
        aliases: [
            'normalUserMention',
            'posting.normalUserMention',
            'posting.normalUser.requiredMention',
            'moment.posting.normalUser.requiredMention',
        ],
    },

    creatorPost: {
        key: 'posting.creatorPost',
        group: 'posting',
        type: 'boolean',
        aliases: ['creatorPost', 'moment.posting.creator.allowPost'],
    },

    creatorVideo: {
        key: 'posting.creatorVideo',
        group: 'posting',
        type: 'boolean',
        aliases: ['creatorVideo', 'moment.posting.creator.allowVideo'],
    },

    creatorReview: {
        key: 'posting.creatorReview',
        group: 'posting',
        type: 'boolean',
        aliases: [
            'creatorReview',
            'posting.creatorReview',
            'posting.creator.requiredReview',
            'moment.posting.creator.requiredReview',
        ],
    },

    creatorMention: {
        key: 'posting.creatorMention',
        group: 'posting',
        type: 'boolean',
        aliases: [
            'creatorMention',
            'posting.creatorMention',
            'posting.creator.requiredMention',
            'moment.posting.creator.requiredMention',
        ],
    },

    requestCreator: {
        key: 'feature.requestCreator',
        group: 'feature',
        type: 'boolean',
        aliases: [
            'requestCreator',
            'feature.requestCreator',
            'feature.requestToBecomeCreator',
        ],
    },

    ownerViewCount: {
        key: 'feature.ownerViewCount',
        group: 'feature',
        type: 'boolean',
        aliases: [
            'ownerViewCount',
            'feature.ownerViewCount',
            'feature.momentViewCountOwner',
        ],
    },

    viewerViewCount: {
        key: 'feature.viewerViewCount',
        group: 'feature',
        type: 'boolean',
        aliases: [
            'viewerViewCount',
            'feature.viewerViewCount',
            'feature.momentViewCountViewer',
        ],
    },
}

const KEY_TO_LOCAL_KEY = Object.entries(API_SETTING_MAP).reduce(
    (result, [localKey, config]) => {
        result[config.key] = localKey

        if (Array.isArray(config.aliases)) {
            config.aliases.forEach((alias) => {
                result[alias] = localKey
            })
        }

        return result
    },
    {}
)

const toBoolean = (value, fallback = false) => {
    if (value === undefined || value === null) return fallback
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value === 1

    if (typeof value === 'string') {
        const lowerValue = value.toLowerCase()

        if (lowerValue === 'true') return true
        if (lowerValue === 'false') return false
        if (lowerValue === '1') return true
        if (lowerValue === '0') return false
        if (lowerValue === 'on') return true
        if (lowerValue === 'off') return false
    }

    return Boolean(value)
}

const getDeepValue = (object, path) => {
    if (!object || !path) return undefined

    return path.split('.').reduce((result, key) => {
        if (result === undefined || result === null) return undefined
        return result[key]
    }, object)
}

const getPayloadCandidates = (payload) => {
    return [
        payload,
        payload?.data,
        payload?.data?.data,
        payload?.settings,
        payload?.data?.settings,
        payload?.data?.data?.settings,
        payload?.posting,
        payload?.data?.posting,
        payload?.data?.data?.posting,
    ].filter(Boolean)
}

const readRowsFromPayload = (payload) => {
    const candidates = getPayloadCandidates(payload)
    const rows = []
    const seen = new Set()

    const addRow = (row) => {
        if (!row || typeof row !== 'object' || Array.isArray(row)) return

        const apiKey = row?.key || row?.setting_key || row?.name
        if (!apiKey) return

        const uniqueKey = row?._id || row?.id || apiKey

        if (seen.has(uniqueKey)) return
        seen.add(uniqueKey)

        rows.push(row)
    }

    const collectRows = (value) => {
        if (!value) return

        if (Array.isArray(value)) {
            value.forEach((item) => collectRows(item))
            return
        }

        if (typeof value === 'object') {
            if (value?.key || value?.setting_key || value?.name) {
                addRow(value)
                return
            }

            Object.values(value).forEach((child) => {
                if (
                    Array.isArray(child) ||
                    (child && typeof child === 'object')
                ) {
                    collectRows(child)
                }
            })
        }
    }

    candidates.forEach((candidate) => collectRows(candidate))

    return rows
}

const readObjectsFromPayload = (payload) => {
    return getPayloadCandidates(payload).filter(
        (candidate) =>
            candidate &&
            typeof candidate === 'object' &&
            !Array.isArray(candidate)
    )
}

const normalizeSettingsFromResponses = (...responses) => {
    const nextSettings = {}

    responses.forEach((response) => {
        const rows = readRowsFromPayload(response)

        rows.forEach((row) => {
            const apiKey = row?.key || row?.setting_key || row?.name

            if (!apiKey) return

            const localKey = KEY_TO_LOCAL_KEY[apiKey]

            if (!localKey) return

            const rawValue =
                row?.value ??
                row?.enable ??
                row?.enabled ??
                row?.status ??
                row?.isEnabled

            nextSettings[localKey] = toBoolean(
                rawValue,
                DEFAULT_SETTINGS[localKey]
            )
        })

        const objects = readObjectsFromPayload(response)

        objects.forEach((object) => {
            Object.entries(API_SETTING_MAP).forEach(([localKey, config]) => {
                const possibleKeys = [
                    localKey,
                    config.key,
                    ...(config.aliases || []),
                ]

                for (const key of possibleKeys) {
                    const value =
                        object[key] !== undefined
                            ? object[key]
                            : getDeepValue(object, key)

                    if (value !== undefined) {
                        nextSettings[localKey] = toBoolean(
                            value,
                            DEFAULT_SETTINGS[localKey]
                        )
                        break
                    }
                }
            })
        })
    })

    return nextSettings
}

const getLoadingKeyPatch = (localKey, value) => {
    const patch = {
        loadingKeys: {
            [localKey]: value,
        },
    }

    if (localKey === 'requireMention') {
        patch.loadingMention = value
    }

    if (
        localKey === 'requireReviewMoment' ||
        localKey === 'normalUserReview' ||
        localKey === 'creatorReview'
    ) {
        patch.loadingReview = value
    }

    return patch
}

export const useGeneralStore = create((set, get) => ({
    // ====== STATE ======
    settings: DEFAULT_SETTINGS,

    loading: false,
    loadingFetch: false,
    loadingMention: false,
    loadingReview: false,
    loadingKeys: {},

    error: null,
    lastResponse: null,

    // ====== HELPERS ======
    clearError: () => set({ error: null }),

    resetGeneralState: () =>
        set({
            settings: DEFAULT_SETTINGS,
            loading: false,
            loadingFetch: false,
            loadingMention: false,
            loadingReview: false,
            loadingKeys: {},
            error: null,
            lastResponse: null,
        }),

    setLocalSettings: (next) =>
        set((state) => ({
            settings: {
                ...state.settings,
                ...next,
            },
        })),

    // ====== FETCH GENERAL SETTINGS ======
    fetchGeneralSettings: async (payload) => {
        try {
            set({
                loading: true,
                loadingFetch: true,
                error: null,
            })

            const [settingsRes, postingRes] = await Promise.all([
                GeneralService.getSettings(payload),
                GeneralService.getPostingSettings(payload),
            ])

            const apiSettings = normalizeSettingsFromResponses(
                settingsRes,
                postingRes
            )



            set((state) => ({
                settings: {
                    ...state.settings,
                    ...apiSettings,
                },
                lastResponse: {
                    settingsRes,
                    postingRes,
                },
                loading: false,
                loadingFetch: false,
            }))

            return {
                settingsRes,
                postingRes,
            }
        } catch (error) {
            set({
                loading: false,
                loadingFetch: false,
                error,
            })

            throw error
        }
    },

    // ====== UPDATE ONE SETTING ======
    updateGeneralSetting: async ({ access_token, localKey, value }) => {
        const config = API_SETTING_MAP[localKey]
        if (!config) {
            throw new Error(`Unknown setting key: ${localKey}`)
        }

        const previousValue = get().settings[localKey]

        try {
            set((state) => {
                const loadingPatch = getLoadingKeyPatch(localKey, true)

                return {
                    settings: {
                        ...state.settings,
                        [localKey]: value,
                    },
                    loading: true,
                    loadingMention:
                        loadingPatch.loadingMention ?? state.loadingMention,
                    loadingReview:
                        loadingPatch.loadingReview ?? state.loadingReview,
                    loadingKeys: {
                        ...state.loadingKeys,
                        [localKey]: true,
                    },
                    error: null,
                }
            })

            const res = await GeneralService.updateSingleSetting({
                access_token,
                key: config.key,
                value,
                group: config.group,
                type: config.type,
            })

            const apiSettings = normalizeSettingsFromResponses(res)

            set((state) => ({
                settings: {
                    ...state.settings,
                    [localKey]: value,
                    ...apiSettings,
                },
                lastResponse: res,
                loading: false,
                loadingMention:
                    localKey === 'requireMention'
                        ? false
                        : state.loadingMention,
                loadingReview:
                    localKey === 'requireReviewMoment' ||
                        localKey === 'normalUserReview' ||
                        localKey === 'creatorReview'
                        ? false
                        : state.loadingReview,
                loadingKeys: {
                    ...state.loadingKeys,
                    [localKey]: false,
                },
            }))

            return res
        } catch (error) {
            set((state) => ({
                settings: {
                    ...state.settings,
                    [localKey]: previousValue,
                },
                loading: false,
                loadingMention:
                    localKey === 'requireMention'
                        ? false
                        : state.loadingMention,
                loadingReview:
                    localKey === 'requireReviewMoment' ||
                        localKey === 'normalUserReview' ||
                        localKey === 'creatorReview'
                        ? false
                        : state.loadingReview,
                loadingKeys: {
                    ...state.loadingKeys,
                    [localKey]: false,
                },
                error,
            }))

            throw error
        }
    },
}))

export default useGeneralStore