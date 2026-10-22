import React from 'react'
import EyeIcon from '../../../../assets/icon/user/eye.svg'
import HeartIcon from '../../../../assets/icon/user/heart.svg'
import CommentIcon from '../../../../assets/icon/user/comment.svg'
import RetweetIcon from '../../../../assets/icon/user/repost.svg'
import SaveIcon from '../../../../assets/icon/user/saveOrange.svg'
import AddMoreMentionIcon from '../../../../assets/icon/user/actionIcon/addMoreMention.svg'
import { MomentActionMenu } from './_moment.action'

const toNumber = (value) => {
    const num = Number(value)
    return Number.isFinite(num) ? num : 0
}

export const getMomentDetailEngagements = (record = {}) => {
    return {
        views: toNumber(record?.views ?? record?.viewCount ?? record?.totalViews ?? record?.engagement?.views),
        likes: toNumber(record?.likes ?? record?.likeCount ?? record?.totalLikes ?? record?.engagement?.likes),
        comments: toNumber(record?.comments ?? record?.commentCount ?? record?.totalComments ?? record?.engagement?.comments),
        shares: toNumber(record?.shares ?? record?.shareCount ?? record?.totalShares ?? record?.engagement?.shares),
        reposts: toNumber(record?.reposts ?? record?.repostCount ?? record?.totalReposts ?? record?.engagement?.reposts),
        saves: toNumber(record?.saves ?? record?.saveCount ?? record?.totalSaves ?? record?.engagement?.saves),
    }
}

const iconStyle = (size = 18) => ({
    width: size,
    height: size,
    objectFit: 'contain',
    display: 'block',
    flexShrink: 0,
})

const itemWrapStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    whiteSpace: 'nowrap',
    fontSize: 14,
    color: '#1f2937',
}

const dividerStyle = {
    width: 1,
    height: 18,
    background: '#d9e1ec',
    margin: '0 8px',
    flexShrink: 0,
}

export const MomentDetailEngagement = ({
    record,
    actionRecord,
    onView,
    onApprove,
    onAddMention,
    onHide,
    onEdit,
    onActive,
    onDelete,
    onProfilePage = null,
    detailPage = false
}) => {
    const data = getMomentDetailEngagements(record)

    const total =
        data.views +
        data.likes +
        data.comments +
        data.shares +
        data.reposts +
        data.saves

    const items = [
        {
            key: 'views',
            label: 'Views',
            value: data.views,
            icon: <img src={EyeIcon} alt="views" style={iconStyle(18)} />,
        },
        {
            key: 'likes',
            label: 'Likes',
            value: data.likes,
            icon: <img src={HeartIcon} alt="likes" style={iconStyle(18)} />,
        },
        {
            key: 'comments',
            label: 'Comments',
            value: data.comments,
            icon: <img src={CommentIcon} alt="comments" style={iconStyle(18)} />,
        },
        {
            key: 'shares',
            label: 'Shares',
            value: data.shares,
            icon: <img src={AddMoreMentionIcon} alt="shares" style={iconStyle(18)} />,
        },
        {
            key: 'reposts',
            label: 'Repost',
            value: data.reposts,
            icon: <img src={RetweetIcon} alt="reposts" style={iconStyle(18)} />,
        },
        {
            key: 'saves',
            label: 'Saves',
            value: data.saves,
            icon: <img src={SaveIcon} alt="saves" style={iconStyle(18)} />,
        },
    ]

    return (
        <div
            style={{
                border: '1px solid #d7e6ff',
                borderRadius: 12,
                background: '#fff',
                padding: 16,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                    marginBottom: 14,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        flexWrap: 'wrap',
                    }}
                >
                    <div
                        style={{
                            fontSize: 18,
                            fontWeight: 600,
                            color: '#1f2937',
                        }}
                    >
                        Engagement Breakdown
                    </div>

                    <div
                        style={{
                            background: '#e9f8ee',
                            color: '#16a34a',
                            borderRadius: 8,
                            padding: '8px 14px',
                            display: 'inline-flex',
                            alignItems: 'baseline',
                            gap: 6,
                        }}
                    >
                        <span style={{ fontSize: 14, fontWeight: 700 }}>{total}</span>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>Total Engagement</span>
                    </div>
                </div>

                {actionRecord ? (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            marginTop: -8,
                            marginRight: -8,
                        }}
                    >
                        <MomentActionMenu
                            record={actionRecord}
                            onView={onView}
                            onApprove={onApprove}
                            onAddMention={onAddMention}
                            onHide={onHide}
                            onEdit={onEdit}
                            onActive={onActive}
                            onDelete={onDelete}
                            showWhiteIcon={true}
                            onProfilePage={onProfilePage}
                            detailPage={detailPage}
                        />
                    </div>
                ) : null}
            </div>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    rowGap: 10,
                }}
            >
                {items.map((item, index) => (
                    <React.Fragment key={item.key}>
                        {index > 0 ? <span style={dividerStyle} /> : null}

                        <span style={itemWrapStyle}>
                            {item.icon}
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{item.label}</span>
                            <strong style={{ fontWeight: 600 }}>{item.value}</strong>
                        </span>
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}

export default MomentDetailEngagement