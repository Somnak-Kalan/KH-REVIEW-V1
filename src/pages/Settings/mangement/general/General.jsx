
import React, { useContext, useEffect } from 'react'
import { Card, message, Spin } from 'antd'
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { AuthContext } from '../../../../contexts/AuthContext'
import PageHeader from '../../../../components/Action/PageHeader'
import { useGeneralStore } from '../../../../Stores/settings/management/General'

import SettingTabs from '../../../../components/setting/ManageGeneralSettingPage/SettingTabs'
import PermissionPanel from '../../../../components/setting/ManageGeneralSettingPage/PermissionPanel'
import FeaturePermissionPanel from '../../../../components/setting/ManageGeneralSettingPage/FeaturePermissionPanel'
import './GeneralStyle.scss'

const MomentGeneralSettingPage = () => {
    const outletContext = useOutletContext()
    const { setDisplayEmitContent } = outletContext || {}

    const { access_token } = useContext(AuthContext)

    const location = useLocation()
    const navigate = useNavigate()

    const activeTab = location.pathname.includes('/general/feature')
        ? 'feature'
        : 'moment'

    const settings = useGeneralStore((state) => state.settings)
    const loading = useGeneralStore((state) => state.loading)
    const loadingFetch = useGeneralStore((state) => state.loadingFetch)
    const loadingMention = useGeneralStore((state) => state.loadingMention)
    const loadingReview = useGeneralStore((state) => state.loadingReview)
    const loadingKeys = useGeneralStore((state) => state.loadingKeys)

    const fetchGeneralSettings = useGeneralStore(
        (state) => state.fetchGeneralSettings
    )
    const updateGeneralSetting = useGeneralStore(
        (state) => state.updateGeneralSetting
    )

    useEffect(() => {
        if (location.pathname === '/general') {
            navigate('/general/moment', { replace: true })
        }
    }, [location.pathname, navigate])

    useEffect(() => {
        if (!setDisplayEmitContent) return

        setDisplayEmitContent(
            <div className="rounded-[8px] py-3">
                <PageHeader mainPageName="Post" childName="Moment" />
            </div>
        )
    }, [setDisplayEmitContent])

    useEffect(() => {
        if (!access_token) return

        fetchGeneralSettings({
            access_token,
        }).catch((error) => {
            message.error(
                error?.response?.data?.message ||
                'Failed to load general settings'
            )
        })
    }, [access_token, fetchGeneralSettings])

    const handleToggle = async (key, checked) => {
        try {
            await updateGeneralSetting({
                access_token,
                localKey: key,
                value: checked,
            })

            message.success('Setting updated successfully')
        } catch (error) {
            message.error(
                error?.response?.data?.message || 'Failed to update setting'
            )
        }
    }
    return (
        <div className="moment-setting-page">
            <div className="mt-2">
                <SettingTabs activeKey={activeTab} />
            </div>

            <Card
                className="moment-setting-card"
                styles={{ body: { padding: 0 } }}
            >
                {loadingFetch ? (
                    <div className="moment-loading">
                        <Spin size="large" />
                    </div>
                ) : activeTab === 'moment' ? (
                    <PermissionPanel
                        activeTab={activeTab}
                        settings={settings}
                        loading={loading}
                        loadingMention={loadingMention}
                        loadingReview={loadingReview}
                        loadingKeys={loadingKeys}
                        onToggle={handleToggle}
                    />
                ) : (
                    <FeaturePermissionPanel
                        activeTab={activeTab}
                        settings={settings}
                        loading={loading}
                        loadingKeys={loadingKeys}
                        onToggle={handleToggle}
                    />
                )}
            </Card>
        </div>
    )
}

export default MomentGeneralSettingPage