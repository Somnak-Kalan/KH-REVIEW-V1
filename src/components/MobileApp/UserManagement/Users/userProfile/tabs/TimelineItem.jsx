import React from 'react'
import dayjs from 'dayjs'
import SaveImgIcon from '../../../../../../assets/icon/user/saveOrange.svg'
import ReviewImgIcon from '../../../../../../assets/icon/user/review.svg'
import CommentImgIcon from '../../../../../../assets/icon/user/comment.svg'
import RepostImgIcon from '../../../../../../assets/icon/user/repost.svg'
import { Image, Tag } from 'antd'
import {
    EyeOutlined,
    ShareAltOutlined,
    HeartOutlined,
    DislikeOutlined,
} from '@ant-design/icons'

function normalizeActionType(value) {
    const type = String(value || '').toLowerCase().trim()

    if (type === 'viewed' || type === 'views' || type === 'view') return 'view'
    if (type === 'liked' || type === 'likes' || type === 'like') return 'like'
    if (type === 'saved' || type === 'saves' || type === 'save') return 'save'
    if (type === 'shared' || type === 'shares' || type === 'share') return 'share'
    if (type === 'reposted' || type === 'reposts' || type === 'repost') return 'repost'
    if (type === 'comments' || type === 'commented' || type === 'comment') return 'comment'
    if (type === 'reviews' || type === 'reviewed' || type === 'review') return 'review'

    return type || 'view'
}

const formatTimelineTime = (value) => {
    if (!value) return '-'

    const date = dayjs(value)

    if (!date.isValid()) return value

    return date.format('D, MMM [at] h:mmA')
}
function getActionLabel(type) {
    switch (normalizeActionType(type)) {
        case 'view':
            return 'Viewed'
        case 'like':
            return 'Liked'
        case 'save':
            return 'Saved'
        case 'share':
            return 'Shared'
        case 'repost':
            return 'Reposted'
        case 'comment':
            return 'Commented'
        case 'review':
            return 'Reviewed'
        default:
            return 'Interacted'
    }
}

function iconByType(type) {
    switch (normalizeActionType(type)) {
        case 'view':
            return <EyeOutlined className="ti-icon ti-view" />
        case 'review':
            return <Image src={ReviewImgIcon} preview={false} />
        case 'share':
            return <ShareAltOutlined className="ti-icon ti-share" />
        case 'save':
            return <Image src={SaveImgIcon} preview={false} />
        case 'comment':
            return <Image src={CommentImgIcon} preview={false} />
        case 'like':
            return <HeartOutlined className="ti-icon ti-like" />
        case 'repost':
            return <Image src={RepostImgIcon} preview={false} />
        default:
            return <EyeOutlined className="ti-icon ti-view" />
    }
}

function colorStyle(type) {
    switch (normalizeActionType(type)) {
        case 'view':
            return '#2696FF21'
        case 'review':
            return '#E2712121'
        case 'share':
            return '#3D475C21'
        case 'save':
            return '#E2712121'
        case 'comment':
            return '#00BE3921'
        case 'like':
            return '#FFE2E2'
        case 'repost':
            return '#4A4A5121'
        default:
            return ''
    }
}

const linkButtonStyle = {
    border: 0,
    background: 'transparent',
    padding: 0,
    margin: 0,
    color: '#1677ff',
    cursor: 'pointer',
    fontWeight: 500,
}

const momentCountStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 1,
}

const momentRightSideStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 8,
    color: '#94a3b8',
    fontSize: 10,
}

const momentStatsRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
}

const rightStyle = {
    right: 12,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    fontSize: 10,
}

const momentDateTextStyle = {
    color: '#94a3b8',
    whiteSpace: 'nowrap',
    fontSize: 12,
}

function toNumber(value) {
    const num = Number(value)
    return Number.isFinite(num) ? num : 0
}

function getMomentLikes(item) {
    return toNumber(
        item?.likes ??
        item?.likeCount ??
        item?.totalLikes ??
        item?.love ??
        item?.loveCount ??
        item?.totalLove ??
        item?.comment?.likeCount
    )
}

function getMomentUnlikes(item) {
    return toNumber(
        item?.unlikes ??
        item?.unlikeCount ??
        item?.totalUnlikes ??
        item?.dislikes ??
        item?.dislikeCount ??
        item?.totalDislikes ??
        item?.comment?.dislikeCount
    )
}

function getPlaceName(item) {
    if (typeof item?.place === 'string') return item.place

    return (
        item?.placeName ||
        item?.place_name ||
        item?.place?.nameEn ||
        item?.place?.name ||
        item?.place?.title ||
        item?.placeInfo?.name ||
        item?.placeInfo?.title ||
        item?.target?.name ||
        item?.target?.title ||
        ''
    )
}

function getTitlePlaceFromQuote(title) {
    const text = String(title || '')
    const match = text.match(/[“"']([^”"']+)[”"']/)

    return match?.[1] || ''
}

function getUserName(item) {
    return (
        item?.userName ||
        item?.username ||
        item?.ownerName ||
        item?.creatorName ||
        item?.createdByName ||
        item?.moment?.author?.username ||
        item?.moment?.author?.name ||
        item?.user?.name ||
        item?.user?.username ||
        item?.owner?.name ||
        item?.owner?.username ||
        item?.creator?.name ||
        item?.creator?.username ||
        item?.createdBy?.name ||
        item?.createdBy?.username ||
        ''
    )
}

function getUserNameFromTitle(title) {
    const text = String(title || '')
    const match = text.match(/\bon\s+(.+?)['’]s\s+moment/i)

    return match?.[1] || ''
}

function buildTitleFromApi(item) {
    const type = normalizeActionType(
        item?.actionType ||
        item?.type ||
        item?.action ||
        item?.activityType ||
        item?.eventType
    )

    const actionLabel = getActionLabel(type)
    const targetType = String(item?.targetType || '').toLowerCase()
    const authorName = getUserName(item)

    if (targetType === 'moment' || item?.moment) {
        if (authorName) return `${actionLabel} on ${authorName}'s moment`
        return `${actionLabel} a moment`
    }

    if (targetType === 'place' || item?.place) {
        const placeName = getPlaceName(item)
        if (placeName) return `${actionLabel} “${placeName}”`
        return `${actionLabel} a place`
    }

    return `${actionLabel} activity`
}

export default function TimelineItem({
    item,
    mode = 'place',
    onOpenPlace,
    onOpenUser,
    onOpenMoment,
}) {
    const itemType = normalizeActionType(
        item?.actionType ||
        item?.type ||
        item?.action ||
        item?.activityType ||
        item?.eventType
    )

    const title = String(item?.title || buildTitleFromApi(item) || '')
    const placeName = getPlaceName(item) || getTitlePlaceFromQuote(title)
    const userName = getUserName(item) || getUserNameFromTitle(title)

    const likeCount = getMomentLikes(item)
    const unlikeCount = getMomentUnlikes(item)

    const hasLikes =
        item?.likes !== undefined ||
        item?.likeCount !== undefined ||
        item?.totalLikes !== undefined ||
        item?.love !== undefined ||
        item?.loveCount !== undefined ||
        item?.totalLove !== undefined ||
        item?.comment?.likeCount !== undefined

    const hasUnlikes =
        item?.unlikes !== undefined ||
        item?.unlikeCount !== undefined ||
        item?.totalUnlikes !== undefined ||
        item?.dislikes !== undefined ||
        item?.dislikeCount !== undefined ||
        item?.totalDislikes !== undefined ||
        item?.comment?.dislikeCount !== undefined

    const showStats = hasLikes || hasUnlikes

    const rawMomentDate = item?.actedAt || item?.createdAt || item?.time

    const momentDate = rawMomentDate
        ? dayjs(rawMomentDate).format('DD. MMM [at] h:mmA')
        : '-'

    const placeDate = formatTimelineTime(
        item?.time || item?.actedAt || item?.createdAt
    )
    const handleOpenPlace = (event) => {
        event.stopPropagation()
        onOpenPlace?.(item)
    }

    const handleOpenUser = (event) => {
        event.stopPropagation()
        onOpenUser?.(item)
    }

    const renderClickablePlace = (name, prefix = '“', suffix = '”') => {
        return (
            <button
                type="button"
                onClick={handleOpenPlace}
                style={linkButtonStyle}
            >
                {prefix}
                {name}
                {suffix}
            </button>
        )
    }

    const renderClickableUser = (name) => {
        return (
            <button
                type="button"
                onClick={handleOpenUser}
                style={linkButtonStyle}
            >
                {name}
            </button>
        )
    }


    const handleOpenMoment = (event) => {
        event.stopPropagation()
        onOpenMoment?.(item)
    }

    const renderClickableMoment = (name) => {
        return (
            <button
                type="button"
                onClick={handleOpenMoment}
                style={linkButtonStyle}
            >
                {name}
            </button>
        )
    }

    const renderTitleWithPlace = (content) => {
        if (!content || !placeName) return content

        const quoteMatch = content.match(/([“"'])([^”"']+)([”"'])/)

        if (quoteMatch) {
            const fullMatch = quoteMatch[0]
            const openQuote = quoteMatch[1]
            const quotedName = quoteMatch[2]
            const closeQuote = quoteMatch[3]
            const startIndex = content.indexOf(fullMatch)

            const before = content.slice(0, startIndex)
            const after = content.slice(startIndex + fullMatch.length)

            return (
                <>
                    {before}
                    {renderClickablePlace(quotedName, openQuote, closeQuote)}
                    {after}
                </>
            )
        }

        const lowerTitle = content.toLowerCase()
        const lowerPlaceName = String(placeName).toLowerCase()
        const placeIndex = lowerTitle.indexOf(lowerPlaceName)

        if (placeIndex >= 0) {
            const before = content.slice(0, placeIndex)
            const realPlaceName = content.slice(
                placeIndex,
                placeIndex + placeName.length
            )
            const after = content.slice(placeIndex + placeName.length)

            return (
                <>
                    {before}
                    {renderClickablePlace(realPlaceName)}
                    {after}
                </>
            )
        }

        return content
    }
    const getMomentTitle = () => {
        return (
            item?.momentTitle ||
            item?.moment?.title ||
            item?.post?.title ||
            item?.target?.title ||
            ''
        )
    }

    const getAuthorName = () => {
        return (
            item?.authorName ||
            item?.moment?.author?.username ||
            item?.moment?.author?.name ||
            item?.userName ||
            item?.username ||
            ''
        )
    }


    const renderTitle = () => {
        const actionLabel = getActionLabel(itemType)
        const targetType = String(item?.targetType || '').toLowerCase()

        const authorName = getAuthorName()
        const momentTitle = getMomentTitle()
        const currentPlaceName = placeName

        if (targetType === 'moment' || item?.moment) {
            return (
                <>
                    {actionLabel} on{' '}
                    {authorName ? renderClickableUser(authorName) : 'user'}
                    {'’s '}
                    {renderClickableMoment('moment')}
                    {momentTitle ? ` ${momentTitle}` : ''}
                </>
            )
        }

        if (targetType === 'place' || item?.place) {
            return (
                <>
                    {actionLabel} place{' '}
                    {currentPlaceName
                        ? renderClickablePlace(currentPlaceName)
                        : ''}
                </>
            )
        }

        if (!title) return title

        let titleContent = title

        if (mode === 'moments' && userName) {
            const userIndex = title.toLowerCase().indexOf(userName.toLowerCase())

            if (userIndex >= 0) {
                const beforeUser = title.slice(0, userIndex)
                const realUserName = title.slice(
                    userIndex,
                    userIndex + userName.length
                )
                const afterUser = title.slice(userIndex + userName.length)

                titleContent = (
                    <>
                        {beforeUser}
                        {renderClickableUser(realUserName)}
                        {renderTitleWithPlace(afterUser)}
                    </>
                )

                return titleContent
            }
        }

        return renderTitleWithPlace(titleContent)
    }


    return (
        <div
            className="ti-row"
            style={{
                flexWrap: mode === 'moments' ? 'wrap' : undefined,
            }}
        >
            {/* <div className="ti-left "> */}
            <div
                className="ti-left"
                style={
                    mode === 'moments'
                        ? {
                            width: '100%',
                            display: 'flex',
                        }
                        : undefined
                }
            >
                <div
                    className="ti-icon-wrap"
                    style={{ background: colorStyle(itemType) }}
                >
                    {iconByType(itemType)}
                </div>

                {/* <div className="ti-content"> */}
                <div
                    className="ti-content"
                    style={
                        mode === 'moments'
                            ? {
                                flex: 1,
                                minWidth: 0,
                            }
                            : undefined
                    }
                >
                    <div className="ti-title">{renderTitle()}</div>


                    {!!item.desc && <div className="ti-desc">{item.desc}</div>}

                    {!!item.images?.length && (
                        <div className="ti-images">
                            {item.images.map((src, idx) => (
                                <Image
                                    key={`${src}-${idx}`}
                                    src={src}
                                    preview={false}
                                    className="ti-thumb"
                                />
                            ))}
                        </div>
                    )}

                    {mode === 'place' ? (
                        <div>
                            <Tag style={styles.tiTagCategory}>{item.category}</Tag>
                            <Tag style={styles.actionTag}>{item.actionTag}</Tag>
                        </div>
                    ) : (
                        <div
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 12,
                                marginTop: 8,
                            }}
                        >
                            <div>
                                <Tag style={styles.tiTagCategory}>{item.category}</Tag>
                                <Tag style={styles.actionTag}>{item.actionTag}</Tag>
                            </div>

                            <div style={rightStyle}>
                                {showStats ? (
                                    <div style={momentStatsRowStyle}>
                                        <span style={momentCountStyle}>
                                            <HeartOutlined /> {likeCount}
                                        </span>

                                        <span style={momentCountStyle}>
                                            <DislikeOutlined /> {unlikeCount}
                                        </span>
                                    </div>
                                ) : null}

                                <div className="ti-time" style={momentDateTextStyle}>
                                    {momentDate}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
            {mode === 'place' ? (
                <div className="ti-right">
                    {item.rating ? (
                        <div className="ti-rating">{item.rating}</div>
                    ) : (
                        <div />
                    )}

                    <div className="ti-time">{placeDate}</div>
                </div>
            ) : null}
        </div>
    )
}

const styles = {
    wrapper: {
        width: '100%',
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        padding: 16,
    },
    filterRow: {
        marginBottom: 12,
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    },
    card: {
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-start',
        minHeight: 56,
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        background: '#ffffff',
        padding: '10px 12px',
    },
    iconCircle: {
        width: 22,
        height: 22,
        minWidth: 22,
        borderRadius: '50%',
        border: '1px solid',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        marginRight: 10,
        marginTop: 2,
    },
    content: {
        flex: 1,
        minWidth: 0,
        paddingRight: 120,
    },
    headerLine: {
        fontSize: 12,
        lineHeight: '18px',
        color: '#111827',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    userName: {
        color: '#1677ff',
        fontWeight: 600,
    },
    ownerName: {
        color: '#1677ff',
        fontWeight: 600,
    },
    actionText: {
        color: '#111827',
        fontWeight: 500,
    },
    normalText: {
        color: '#111827',
        fontWeight: 500,
    },
    description: {
        fontSize: 11,
        lineHeight: '16px',
        color: '#64748b',
        marginTop: 2,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: 760,
    },
    thumbnail: {
        width: 62,
        height: 42,
        objectFit: 'cover',
        borderRadius: 3,
        marginTop: 6,
        display: 'block',
    },
    tagRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginTop: 5,
    },
    tag: {
        fontSize: 10,
        lineHeight: '16px',
        padding: '1px 7px',
        borderRadius: 4,
        color: '#374151',
        background: '#f3f4f6',
        border: '1px solid #e5e7eb',
    },
    tiTagCategory: {
        borderRadius: 8,
        background: 'white',
        color: '#030213',

        marginRight: 2,
        textAlign: 'center'
    },
    actionTag: {
        borderRadius: 8,
        background: '#ECEEF2',
        color: '#030213',

        marginLeft: 2,
        textAlign: 'center'
    },
    rightSide: {
        position: 'absolute',
        right: 12,
        bottom: 10,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        color: '#94a3b8',
        fontSize: 10,
    },
    statsRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
    },
    statItem: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        color: '#94a3b8',
    },
    dateText: {
        color: '#94a3b8',
        whiteSpace: 'nowrap',
    },
    paginationWrap: {
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: 18,
    },
}