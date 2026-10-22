import React from 'react'
import { ShareAltOutlined } from '@ant-design/icons'

import EyeIcon from '../../../../assets/icon/user/eye.svg'
import HeartIcon from '../../../../assets/icon/user/heart.svg'
import CommentIcon from '../../../../assets/icon/user/comment.svg'
import RetweetIcon from '../../../../assets/icon/user/repost.svg'
import SaveIcon from '../../../../assets/icon/user/saveOrange.svg'

const toNumber = (value) => {
    const num = Number(value)
    return Number.isFinite(num) ? num : 0
}

export const getMomentEngagements = (record = {}) => {
    return {
        views: toNumber(record?.views ?? record?.viewCount ?? record?.totalViews ?? record?.engagement?.views),
        likes: toNumber(record?.likes ?? record?.likeCount ?? record?.totalLikes ?? record?.engagement?.likes),
        comments: toNumber(record?.comments ?? record?.commentCount ?? record?.totalComments ?? record?.engagement?.comments),
        shares: toNumber(record?.shares ?? record?.shareCount ?? record?.totalShares ?? record?.engagement?.shares),
        reposts: toNumber(record?.reposts ?? record?.repostCount ?? record?.totalReposts ?? record?.engagement?.reposts),
        saves: toNumber(record?.saves ?? record?.saveCount ?? record?.totalSaves ?? record?.engagement?.saves),
    }
}

const itemStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    whiteSpace: 'nowrap',
    fontSize: 13,
    color: '#1f2937',
    lineHeight: 1,
}

const dividerStyle = {
    width: 1,
    height: 12,
    background: '#d1d5db',
    margin: '0 1px',
    flexShrink: 0,
}

const iconImgStyle = (size) => ({
    width: size,
    height: size,
    objectFit: 'contain',
    display: 'block',
    flexShrink: 0,
})

export const MomentEngagement = ({
    record,
    fontSize = 13,
    gap = 8,
    wrap = false,
    iconSize = 16,
}) => {
    const data = getMomentEngagements(record)

    const items = [
        {
            key: 'views',
            icon: <img src={EyeIcon} alt="views" style={iconImgStyle(iconSize)} />,
            value: data.views,
        },
        {
            key: 'likes',
            icon: <img src={HeartIcon} alt="likes" style={iconImgStyle(iconSize)} />,
            value: data.likes,
        },
        {
            key: 'comments',
            icon: <img src={CommentIcon} alt="comments" style={iconImgStyle(iconSize)} />,
            value: data.comments,
        },
        {
            key: 'shares',
            icon: <ShareAltOutlined style={{ color: '#4b5563', fontSize: iconSize }} />,
            value: data.shares,
        },
        {
            key: 'reposts',
            icon: <img src={RetweetIcon} alt="reposts" style={iconImgStyle(iconSize)} />,
            value: data.reposts,
        },
        {
            key: 'saves',
            icon: <img src={SaveIcon} alt="saves" style={iconImgStyle(iconSize)} />,
            value: data.saves,
        },
    ]

    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                gap,
                flexWrap: wrap ? 'wrap' : 'nowrap',
                whiteSpace: wrap ? 'normal' : 'nowrap',
                minWidth: 0,
                overflow: 'hidden',
            }}
        >
            {items.map((item, index) => (
                <React.Fragment key={item.key}>
                    {index > 0 ? <span style={dividerStyle} /> : null}
                    <span style={{ ...itemStyle, fontSize }}>
                        {item.icon}
                        <span>{item.value}</span>
                    </span>
                </React.Fragment>
            ))}
        </div>
    )
}

export default MomentEngagement