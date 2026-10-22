
import React from 'react'
import { useNavigate } from 'react-router-dom'

import KeyIcon from '../../../assets/icon/setting/general/Key.svg'
import NoteIcon from '../../../assets/icon/setting/general/Note.svg'

const tabs = [
    {
        key: 'moment',
        label: 'Moment Settings',
        icon: <img src={NoteIcon} alt="" className="feature-svg-icon" />,
        path: '/general/moment',
    },
    {
        key: 'feature',
        label: 'Feature Posts',
        icon: <img src={KeyIcon} alt="" className="feature-svg-icon" />,
        path: '/general/feature',
    },
]

const SettingTabs = ({ activeKey }) => {
    const navigate = useNavigate()

    return (
        <div className="moment-tabs-wrap">
            {tabs.map((tab) => (
                <button
                    key={tab.key}
                    type="button"
                    className={`moment-tab-btn ${activeKey === tab.key ? 'active' : ''
                        }`}
                    onClick={() => navigate(tab.path)}
                >
                    <span className="moment-tab-icon">{tab.icon}</span>
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>
    )
}

export default SettingTabs