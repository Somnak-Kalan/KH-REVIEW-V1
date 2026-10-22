import { useEffect, useRef, useState } from 'react'
const BANNER_CACHE = new Map() // cacheKey -> { data, pagination, ts }
const BANNER_INFLIGHT = new Map() // cacheKey -> Promise
const TAB_LAST_LOADED_KEY = new Map() // tab -> docKey (global across remount)

// optional TTL
const CACHE_TTL = 5 * 60 * 1000 // 5 min
const now = () => Date.now()

export const useBannerPageData = ({ access_token, listBanner, dayjs }) => {
    const [tabData, setTabData] = useState({
        homeTop: {
            data: [],
            currentPage: 1,
            pageSize: 10,
            total: 0,
            filterStatus: 'all',
            filterCreatedBy: 'all',
            dateRange: [],
            searchQuery: '',
        },
        bannerInMoment: {
            data: [],
            currentPage: 1,
            pageSize: 10,
            total: 0,
            filterStatus: 'all',
            filterCreatedBy: 'all',
            dateRange: [],
            searchQuery: '',
        },
        category: {
            data: [],
            currentPage: 1,
            pageSize: 10,
            total: 0,
            filterStatus: 'all',
            filterCreatedBy: 'all',
            dateRange: [],
            searchQuery: '',
        },
    })

    const [activeTab, setActiveTab] = useState('bannerInMoment')
    const [loading, setLoading] = useState(false)

    // per-mount refs
    const loadedTabsRef = useRef({})
    const inFlightRef = useRef({})
    const lastKeyRef = useRef({})
    const didInitRef = useRef(false)

    // keep latest tabData for doc build
    const tabDataRef = useRef(tabData)
    useEffect(() => {
        tabDataRef.current = tabData
    }, [tabData])

    const normalizeBanner = (item) => {
        const provincesFromTargeting =
            item?.targeting?.provinces?.map((p) => ({
                ...p,
                provinceEn: p.nameEn,
                provinceKh: p.nameKh,
            })) || item.provinces

        const placeFromTargeting = item?.targeting?.place || item.place
        const schedule = item.schedule || item.scheduleDetails

        return {
            ...item,
            titleEn: item?.title?.en ?? item.titleEn,
            titleKh: item?.title?.kh ?? item.titleKh,
            descriptionEn: item?.description?.en ?? item.descriptionEn,
            descriptionKh: item?.description?.kh ?? item.descriptionKh,
            provinces: provincesFromTargeting,
            place: placeFromTargeting,
            created_at: item.createdAt ?? item.created_at,
            created_by: item.createdBy ?? item.created_by,
            startDate: schedule?.startDate ?? item.startDate,
            endDate: schedule?.endDate ?? item.endDate,
            schedule: schedule ?? item.schedule,
        }
    }

    const buildDocAndKey = (tab) => {
        const currentTabState = tabDataRef.current[tab]

        let newTabType = 'Moment'
        if (tab === 'homeTop') newTabType = 'HomeTop'
        else if (tab === 'category') newTabType = 'Category'

        const doc = {
            page: currentTabState.currentPage,
            limit: currentTabState.pageSize,
            keyword: currentTabState.searchQuery || '',
            status: currentTabState.filterStatus !== 'all' ? currentTabState.filterStatus : '',
            createdBy: currentTabState.filterCreatedBy !== 'all' ? currentTabState.filterCreatedBy : '',
            startDate: currentTabState.dateRange?.[0]
                ? dayjs(currentTabState.dateRange[0]).startOf('day').toISOString()
                : '',
            endDate: currentTabState.dateRange?.[1]
                ? dayjs(currentTabState.dateRange[1]).endOf('day').toISOString()
                : '',
            type: newTabType,
        }

        const docKey = JSON.stringify(doc)

        //  IMPORTANT: cacheKey must NOT include access_token
        const cacheKey = `${tab}__${docKey}`

        return { doc, docKey, cacheKey }
    }

    const applyCachedToState = (tab, cached) => {
        if (!cached) return

        const normalized = (cached.data || []).map(normalizeBanner)

        setTabData((prev) => ({
            ...prev,
            [tab]: {
                ...prev[tab],
                data: normalized,
                total: cached.pagination?.total ?? prev[tab].total ?? 0,
                currentPage: cached.pagination?.page ?? prev[tab].currentPage,
                pageSize: cached.pagination?.limit ?? prev[tab].pageSize,
            },
        }))

        loadedTabsRef.current[tab] = true
    }

    const getBannerList = async (tab) => {
        if (!access_token) return

        const { doc, docKey, cacheKey } = buildDocAndKey(tab)

        //  0) GLOBAL guard (survive route changes)
        // If we already loaded SAME docKey for this tab, do nothing.
        if (TAB_LAST_LOADED_KEY.get(tab) === docKey && (BANNER_CACHE.get(cacheKey)?.data?.length ?? 0) > 0) {
            const cached = BANNER_CACHE.get(cacheKey)
            applyCachedToState(tab, cached)
            return
        }

        //  1) per-mount duplicate guard
        if (inFlightRef.current[tab]) return
        if (lastKeyRef.current[tab] === docKey) return

        //  2) cache hit
        const cached = BANNER_CACHE.get(cacheKey)
        if (cached) {
            const expired = CACHE_TTL > 0 && now() - (cached.ts || 0) > CACHE_TTL
            if (!expired) {
                lastKeyRef.current[tab] = docKey
                TAB_LAST_LOADED_KEY.set(tab, docKey)
                applyCachedToState(tab, cached)
                return
            }
            BANNER_CACHE.delete(cacheKey)
        }

        //  3) global inflight dedupe (StrictMode / remount)
        if (BANNER_INFLIGHT.has(cacheKey)) {
            lastKeyRef.current[tab] = docKey
            inFlightRef.current[tab] = true
            setLoading(true)
            try {
                const inflightRes = await BANNER_INFLIGHT.get(cacheKey)
                TAB_LAST_LOADED_KEY.set(tab, docKey)
                applyCachedToState(tab, inflightRes)
            } finally {
                inFlightRef.current[tab] = false
                setLoading(false)
            }
            return
        }

        //  start request
        inFlightRef.current[tab] = true
        lastKeyRef.current[tab] = docKey
        setLoading(true)

        const p = (async () => {
            const res = await listBanner({ access_token, doc })
            const payload = {
                data: res?.data || [],
                pagination: res?.pagination || null,
                ts: now(),
            }
            BANNER_CACHE.set(cacheKey, payload)
            return payload
        })()

        BANNER_INFLIGHT.set(cacheKey, p)

        try {
            const result = await p
            TAB_LAST_LOADED_KEY.set(tab, docKey)
            applyCachedToState(tab, result)
        } catch (error) {
            console.error('Error fetching banner list:', error)
            lastKeyRef.current[tab] = null
        } finally {
            BANNER_INFLIGHT.delete(cacheKey)
            inFlightRef.current[tab] = false
            setLoading(false)
        }
    }

    const prevTabRef = useRef(activeTab)

    useEffect(() => {
        const isFirstMount = !didInitRef.current
        const isTabSwitch = !isFirstMount && prevTabRef.current !== activeTab

        prevTabRef.current = activeTab
        if (isFirstMount) didInitRef.current = true

        if (isFirstMount) {
            if (!loadedTabsRef.current[activeTab]) getBannerList(activeTab)
            return
        }

        if (isTabSwitch) {
            if (!loadedTabsRef.current[activeTab]) getBannerList(activeTab)
            return
        }

        if (!loadedTabsRef.current[activeTab]) return

        const delay = setTimeout(() => {
            getBannerList(activeTab)
        }, 300)

        return () => clearTimeout(delay)
    }, [
        activeTab,
        tabData[activeTab]?.searchQuery,
        tabData[activeTab]?.filterStatus,
        tabData[activeTab]?.filterCreatedBy,
        tabData[activeTab]?.dateRange,
        tabData[activeTab]?.currentPage,
        tabData[activeTab]?.pageSize,
    ])

    const currentTabState = tabData[activeTab]

    const renderStatusTag = (x) => x
    const handleUpdateStatus = async () => { }

    return {
        tabData,
        setTabData,
        activeTab,
        setActiveTab,
        loading,
        getBannerList,
        currentTabState,
        data: currentTabState.data,
        currentPage: currentTabState.currentPage,
        pageSize: currentTabState.pageSize,
        total: currentTabState.total,
        renderStatusTag,
        handleUpdateStatus,
    }
}