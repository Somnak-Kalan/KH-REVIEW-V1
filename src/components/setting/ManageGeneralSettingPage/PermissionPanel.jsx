
import React from 'react'
import { Switch } from 'antd'
import {
    EyeOutlined,
    UserOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons'
import { AiOutlineFileImage, AiOutlineCrown } from 'react-icons/ai'

import SettingSwitchItem from './SettingSwitchItem'

const PermissionGroup = ({
    icon,
    iconClassName,
    title,
    description,

    postChecked,
    videoChecked,
    reviewChecked,
    mentionChecked,

    onTogglePost,
    onToggleVideo,
    onToggleReview,
    onToggleMention,

    loading,

    postLoading,
    videoLoading,
    reviewLoading,
    mentionLoading,
}) => {
    return (
        <div className="permission-group">
            <div className="permission-group-header">
                <div className={`permission-group-icon ${iconClassName}`}>
                    {icon}
                </div>

                <div>
                    <div className="permission-group-title">{title}</div>

                    <div className="permission-group-desc">{description}</div>
                </div>
            </div>

            <div className="permission-grid">
                <SettingSwitchItem
                    icon={<AiOutlineFileImage />}
                    title="Post"
                    description="Allow posting"
                    checked={postChecked}
                    loading={postLoading}
                    disabled={loading}
                    onChange={onTogglePost}
                />

                <SettingSwitchItem
                    icon={<VideoCameraOutlined />}
                    title="Video"
                    description="Allow posting video"
                    checked={videoChecked}
                    loading={videoLoading}
                    disabled={loading}
                    onChange={onToggleVideo}
                />

                <SettingSwitchItem
                    icon={<EyeOutlined />}
                    title="Required Review"
                    checked={reviewChecked}
                    loading={reviewLoading}
                    disabled={loading || !postChecked}
                    blue
                    onChange={onToggleReview}

                />

                <SettingSwitchItem
                    icon={<EyeOutlined />}
                    title="Required Mention"
                    checked={mentionChecked}
                    loading={mentionLoading}
                    disabled={loading || !videoChecked}
                    blue
                    onChange={onToggleMention}
                />
            </div>
        </div>
    )
}

const PermissionPanel = ({
    settings,
    loading,
    loadingMention,
    loadingKeys = {},
    onToggle,
}) => {
    return (
        <div className="moment-setting-content">
            <div className="setting-section-title">Moment Settings</div>

            <div className="mention-row">
                <SwitchItemMention
                    checked={settings.requireMention}
                    loading={loadingMention || loadingKeys.requireMention}
                    disabled={loading}
                    onChange={(checked) => onToggle('requireMention', checked)}
                />
            </div>

            <div className="section-divider" />

            <div className="setting-section-title">
                Moment Posting Permissions
            </div>

            <div className="setting-section-subtitle">
                Control who can post moments and what type of content they can
                create
            </div>

            <PermissionGroup
                icon={<UserOutlined />}
                iconClassName="normal-user"
                title="Normal Users"
                description="Regular app users"
                postChecked={settings.normalUserPost}
                videoChecked={settings.normalUserVideo}
                reviewChecked={settings.normalUserReview}
                mentionChecked={settings.normalUserMention}
                onTogglePost={(checked) => onToggle('normalUserPost', checked)}
                onToggleVideo={(checked) =>
                    onToggle('normalUserVideo', checked)
                }
                onToggleReview={(checked) =>
                    onToggle('normalUserReview', checked)
                }
                onToggleMention={(checked) =>
                    onToggle('normalUserMention', checked)
                }
                loading={loading}
                postLoading={loadingKeys.normalUserPost}
                videoLoading={loadingKeys.normalUserVideo}
                reviewLoading={loadingKeys.normalUserReview}
                mentionLoading={loadingKeys.normalUserMention}
            />

            <PermissionGroup
                icon={<AiOutlineCrown />}
                iconClassName="creator-user"
                title="Creators"
                description="Verified content creators"
                postChecked={settings.creatorPost}
                videoChecked={settings.creatorVideo}
                reviewChecked={settings.creatorReview}
                mentionChecked={settings.creatorMention}
                onTogglePost={(checked) => onToggle('creatorPost', checked)}
                onToggleVideo={(checked) => onToggle('creatorVideo', checked)}
                onToggleReview={(checked) => onToggle('creatorReview', checked)}
                onToggleMention={(checked) =>
                    onToggle('creatorMention', checked)
                }
                loading={loading}
                postLoading={loadingKeys.creatorPost}
                videoLoading={loadingKeys.creatorVideo}
                reviewLoading={loadingKeys.creatorReview}
                mentionLoading={loadingKeys.creatorMention}
            />
        </div>
    )
}

const SwitchItemMention = ({ checked, loading, disabled, onChange }) => {
    return (
        <div className="mention-switch-layout">
            <Switch
                checked={checked}
                loading={loading}
                disabled={disabled || loading}
                onChange={onChange}
                checkedChildren="ON"
                unCheckedChildren="OFF"
            />

            <div>
                <div className="setting-switch-title">
                    Function Required Mention
                </div>

                <div className="setting-switch-description">
                    Require users to add at least one place mention when
                    creating moments. This helps improve content discoverability
                    and engagement.
                </div>
            </div>
        </div>
    )
}

export default PermissionPanel