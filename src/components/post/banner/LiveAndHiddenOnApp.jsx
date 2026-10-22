import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Switch, Tag, Tooltip, Button, message } from 'antd'
import { HomeOutlined, PlusOutlined } from '@ant-design/icons'
import { useBannerStore } from '../../../Stores/Post/Banner.store'

const HomeTopSwitch = (props) => {
    const { checkPermission, setOpen, onChange, PERMS, activeTab, access_token } = props

    const { fetchStatusSwitch, switchOffOn } = useBannerStore()

    const [isLive, setIsLive] = useState(false)
    const [loading, setLoading] = useState(false)

    // cache status per tab:
    // { homeTop: true/false, bannerInMoment: true/false, category: true/false }
    const statusCacheRef = useRef({})
    const loadedTabsRef = useRef({})
    const inFlightRef = useRef(false)

    const mapTabToType = (tab) => {
        if (tab === 'homeTop') return 'HomeTop'
        if (tab === 'category') return 'Category'
        return 'Moment' // bannerInMoment
    }

    // FIX ONLY:
    // Map API setting key to your existing frontend tab name.
    const mapSettingKeyToTab = (key) => {
        if (key === 'banner.hide.homeTop') return 'homeTop'
        if (key === 'banner.hide.category') return 'category'
        if (key === 'banner.hide.moment') return 'bannerInMoment'

        return null
    }

    const readCacheToState = useCallback((tab) => {
        const cached = statusCacheRef.current[tab]

        if (typeof cached === 'boolean') {
            setIsLive((prev) => (prev === cached ? prev : cached))
            return true
        }

        return false
    }, [])

    // Fetch ONCE because backend returns all banner visibility settings.
    const fetchBannerStatusOnce = useCallback(async () => {
        if (inFlightRef.current) return

        inFlightRef.current = true

        try {
            setLoading(true)

            const res = await fetchStatusSwitch({ access_token })

            if (!res) return
            const statusArray =
                res?.data?.data ||
                res?.data?.status ||
                res?.data ||
                res?.status ||
                res?.value ||
                []

            // Normalize all API banner settings into your existing tab cache.
            const nextCache = { ...statusCacheRef.current }

            if (Array.isArray(statusArray)) {
                statusArray.forEach((item) => {
                    // New API shape:
                    // {
                    //     key: 'banner.hide.moment',
                    //     value: 'on',
                    // }
                    const tabKey = mapSettingKeyToTab(item?.key)

                    if (!tabKey) return

                    // Keep your existing frontend concept:
                    // value === 'on'  -> Live in App
                    // value === 'off' -> Hidden in App
                    nextCache[tabKey] = item?.value === 'on'

                    loadedTabsRef.current[tabKey] = true
                })
            }

            statusCacheRef.current = nextCache
        } catch (error) {
            console.error('Failed to fetch banner status', error)
            message.error('Failed to load banner visibility status')
        } finally {
            setLoading(false)
            inFlightRef.current = false
        }
    }, [access_token, fetchStatusSwitch])

    // Update status (toggle) — update backend + cache.
    const updateBannerStatus = useCallback(
        async (checked) => {
            const type = mapTabToType(activeTab)
            const status = checked ? 'on' : 'off'

            setLoading(true)

            try {
                await switchOffOn({
                    doc: { type, status },
                    access_token,
                })

                // Update cache so switching tab later does NOT refetch.
                statusCacheRef.current[activeTab] = checked
                loadedTabsRef.current[activeTab] = true

                // Tell parent only when user changes switch, not when fetching.
                if (onChange) {
                    onChange(checked ? 'live' : 'hidden', activeTab)
                }
            } catch (err) {
                console.error('Failed to update banner status', err)
                message.error('Failed to update banner visibility')

                // Revert UI using cache or previous switch value.
                const cached = statusCacheRef.current[activeTab]

                if (typeof cached === 'boolean') {
                    setIsLive(cached)
                } else {
                    setIsLive((prev) => !checked)
                }
            } finally {
                setLoading(false)
            }
        },
        [activeTab, access_token, onChange, switchOffOn]
    )

    const handleToggle = (checked) => {
        // Optimistic UI.
        setIsLive(checked)

        // Update API once.
        updateBannerStatus(checked)
    }

    const getTitle = () => {
        switch (activeTab) {
            case 'homeTop':
                return 'Home Top'

            case 'bannerInMoment':
                return 'Banner In Moment'

            case 'category':
                return 'Category'

            default:
                return ''
        }
    }

    // On tab change:
    // 1. If cache exists, use it without calling API again.
    // 2. Otherwise, fetch all statuses once and apply the matching cache value.
    useEffect(() => {
        // If already cached for this tab, just show it.
        if (readCacheToState(activeTab)) return

        // Not cached: fetch all statuses once, then apply current tab value.
        fetchBannerStatusOnce().then(() => {
            readCacheToState(activeTab)
        })
    }, [activeTab, fetchBannerStatusOnce, readCacheToState])

    return (
        <div
            style={{
                border: '1px solid #e8e8e8',
                borderRadius: '15px',
            }}
            className="py-2 px-2 my-2 bg-white"
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                {/* Left side */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <HomeOutlined style={{ fontSize: '20px' }} />

                    <div>
                        <div
                            style={{
                                fontWeight: 'bold',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                        >
                            <Tag
                                style={{ fontSize: '12px' }}
                                color={isLive ? 'green' : 'red'}
                            >
                                {isLive ? 'Live in App' : 'Hidden in App'}
                            </Tag>

                            <Switch
                                checked={isLive}
                                onChange={handleToggle}
                                loading={loading}
                            />
                        </div>

                        <div
                            style={{
                                color: '#8c8c8c',
                                fontSize: '12px',
                            }}
                            className="mt-1"
                        >
                            Main banner displayed at the top of the {getTitle()}
                        </div>

                        <div
                            style={{
                                color: '#8c8c8c',
                                fontSize: '12px',
                            }}
                        >
                            Maximum 5 banners allowed
                        </div>
                    </div>
                </div>

                {/* Right side */}
                {isLive && (
                    <Tooltip
                        title={
                            checkPermission(PERMS.ASSIGNED_USER)
                                ? 'Add'
                                : 'You don’t have permission'
                        }
                    >
                        <Button
                            disabled={!checkPermission(PERMS.ASSIGNED_USER)}
                            type="primary"
                            style={{ background: '#1677ff' }}
                            className="cursor-pointer text-white"
                            onClick={() => setOpen(true)}
                        >
                            <PlusOutlined /> Add
                        </Button>
                    </Tooltip>
                )}
            </div>
        </div>
    )
}

export default React.memo(HomeTopSwitch)