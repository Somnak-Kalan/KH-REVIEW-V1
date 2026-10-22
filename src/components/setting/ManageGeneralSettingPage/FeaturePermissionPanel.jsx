
import React from 'react'
import { EyeOutlined } from '@ant-design/icons'

import PlusUser from '../../../assets/icon/setting/general/PlusUser.svg'
import SettingSwitchItem from './SettingSwitchItem'

const FeaturePermissionPanel = ({
    activeTab,
    settings,
    loading,
    loadingKeys = {},
    onToggle,
}) => {
    return (
        <div className="feature-setting-content">
            <div className="setting-section-title">Feature Permission</div>

            <div className="feature-grid">
                <SettingSwitchItem
                    activeTab={activeTab}
                    icon={
                        <img
                            src={PlusUser}
                            alt=""
                            className="feature-svg-icon"
                        />
                    }
                    iconClassName="feature-purple"
                    title="Request to Become Creator"
                    checked={settings.requestCreator}
                    loading={loadingKeys.requestCreator}
                    disabled={loading}
                    onChange={(checked) => onToggle('requestCreator', checked)}
                />

                <SettingSwitchItem
                    activeTab={activeTab}
                    icon={<EyeOutlined />}
                    iconClassName="feature-blue"
                    title="Moment View Count for Content's Owner and Viewer"
                    checked={settings.ownerViewCount}
                    loading={loadingKeys.ownerViewCount}
                    disabled={loading}
                    onChange={(checked) => onToggle('ownerViewCount', checked)}
                />

                {/* <SettingSwitchItem
                    activeTab={activeTab}
                    icon={<EyeOutlined />}
                    iconClassName="feature-blue"
                    title="Moment View Count for Content Viewer"
                    checked={settings.viewerViewCount}
                    loading={loadingKeys.viewerViewCount}
                    disabled={loading}
                    onChange={(checked) => onToggle('viewerViewCount', checked)}
                /> */}
            </div>
        </div>
    )
}

export default FeaturePermissionPanel