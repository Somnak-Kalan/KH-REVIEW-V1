
import React from 'react'
import { Switch } from 'antd'

const SettingSwitchItem = ({
    icon,
    iconClassName = '',
    title,
    description,
    checked,
    loading,
    disabled,
    onChange,
    blue = false,
    activeTab,
}) => {
    return (
        <div className={`setting-switch-item ${blue ? 'blue' : ''}`}>
            <div className="setting-switch-content">
                <div className="flex items-center">
                    <div
                        className={`${activeTab === 'feature'
                            ? 'permission-group-icon'
                            : ''
                            } ${iconClassName}`}
                    >
                        {icon}
                    </div>

                    <div className="setting-switch-title mx-1">{title}</div>
                </div>

                {description ? (
                    <div className="setting-switch-description">
                        {description}
                    </div>
                ) : null}
            </div>

            <Switch
                checked={checked}
                loading={loading}
                disabled={disabled || loading}
                onChange={onChange}
                checkedChildren="ON"
                unCheckedChildren="OFF"
            />
        </div>
    )
}

export default SettingSwitchItem