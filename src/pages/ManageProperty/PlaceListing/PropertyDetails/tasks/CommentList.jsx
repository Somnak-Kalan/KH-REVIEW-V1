import React from 'react';
import {
    Avatar,
    Dropdown,
} from 'antd'
import AvatarIcon from './AvatarIcon'
import {
    UserOutlined,
} from '@ant-design/icons'
const CommentList = (props) => {
    const {
        form,
        checkPermission, PERMS, comments,
        MaskGroup, loadingCommentId,
        handleMoreClick, setReplyTo,
        handleRemarkClick, setMainComment,
        setAuthor, setIsEditing,
        setEditCommentId
    } = props
    const CommentItem = ({ comment, level = 0 }) => {
        console.log(comment, 'commen');

        if (!comment) return null //  prevent undefined access
        const indentPx = level > 0 ? 40 : 0
        const dateObj = comment?.createdAt ? new Date(comment?.createdAt) : null

        const dateString = dateObj
            ? dateObj.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            })
            : ''
        const timeString = dateObj
            ? dateObj.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            })
            : ''
        // Build the dropdown menu for “More”
        const moreMenuItems = [
            {
                key: 'edit',
                label: 'Edit',
            },
        ]
        if (checkPermission(PERMS.ASSIGNED_USER)) {
            moreMenuItems.push({
                key: 'delete',
                label: 'Delete',
            })
        }

        const moreMenu = {
            items: moreMenuItems,
            onClick: ({ key }) => handleMoreClick(key, comment),
        }
        const getRemarkMenuItems = () => [
            {
                key: 'special',
                label: 'Special remark',
                onClick: () => handleRemarkClick('Special remark', comment),
            },
            {
                key: 'follow',
                label: 'Follow up',
                onClick: () => handleRemarkClick('Follow up', comment),
            },
        ]

        const remarkMenu = {
            items: getRemarkMenuItems(),
        }
        const onHandleReply = (comment) => {
            setReplyTo(comment?._id)

            setMainComment(null)
            setAuthor(comment.author)
            form.setFieldsValue({ comment: '' })
            setIsEditing(true)
            setEditCommentId(null)
        }
        return (
            <div style={{ marginBottom: 16 }}>
                {/* ===== COMMENT BUBBLE ===== */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ marginLeft: indentPx + 12 }}>
                        <AvatarIcon name={comment?.author} />
                    </div>
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: 5,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                            padding: 5,
                            // maxWidth: 500,
                            marginLeft: '0px',
                            position: 'relative',
                        }}
                    >
                        {/* Author & Timestamp */}
                        <div className=' '>
                            {(comment.markAs || comment.markAs) && (
                                <>
                                    <div
                                        style={{ background: '#FFFBE6', borderRadius: 4 }}
                                        className='flex justify-between items-center mb-2'
                                    >
                                        {comment.markAs === 'Special remark' && (
                                            <>
                                                <div className='mx-1'>
                                                    <span
                                                        className=''
                                                        style={{
                                                            color: '#D48806',
                                                            fontSize: 12,
                                                            fontWeight: 500,
                                                        }}
                                                    >
                                                        Special remark
                                                    </span>
                                                </div>
                                                <div className='mx-1'>
                                                    <img
                                                        src={MaskGroup}
                                                        alt='Icon'
                                                        style={{
                                                            display: 'block',
                                                            margin: '0 auto',
                                                            width: '15px',
                                                        }}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    <div
                                        className='flex justify-between items-center mb-2 '
                                        style={{ background: '#E6F4FF' }}
                                    >
                                        {comment.markAs === 'Follow up' && (
                                            <>
                                                <div
                                                    className='mx-1'
                                                    style={{
                                                        // background: '#E6F4FF',
                                                        color: '#096DD9',
                                                        fontSize: 12,
                                                        fontWeight: 500,
                                                    }}
                                                >
                                                    Follow up
                                                </div>
                                                <div>
                                                    <img
                                                        src={MaskGroup}
                                                        alt='Icon'
                                                        style={{
                                                            display: 'inline-block',
                                                            marginLeft: 4,
                                                            width: '14px',
                                                            verticalAlign: 'middle',
                                                        }}
                                                    />
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                            <div className='mx-1'>
                                <div className='flex justify-between'>
                                    <div className='p-0 m-0'>
                                        <span
                                            style={{
                                                color: '#064EA9',
                                                fontSize: 12,
                                                padding: '0px',
                                                fontWeight: 500,
                                            }}
                                        >
                                            {comment.author}
                                        </span>
                                    </div>
                                    <div className='ml-5 mt-1'>
                                        <span
                                            style={{
                                                display: 'flex',
                                                gap: 4,
                                                alignItems: 'center',
                                                fontSize: 12,
                                            }}
                                        >
                                            {/* date in grey */}
                                            <span style={{ color: '#999' }}>{dateString}</span>
                                            {/* time in blue */}
                                            <span style={{ color: '#064EA9' }}>{timeString}</span>
                                        </span>
                                    </div>
                                    {comment?.status === 'updated' && (
                                        <span
                                            style={{ color: '#999', fontSize: 12, marginLeft: 6 }}
                                        >
                                            (edited)
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Content */}
                        <div
                            className='mx-1'
                            style={{
                                marginTop: 8,
                                display: 'flex',
                                fontSize: 12,
                                color: '#000',
                                justifyContent: 'flex-start',
                                wordBreak: 'break-all',
                            }}
                        >
                            {comment?.reply && (
                                <span style={{ color: '#0069E2' }}> {comment.author}, </span>
                            )}
                            {comment.text}
                        </div>
                    </div>
                </div>
                {/* Reply / Remark / More links */}
                <div
                    style={{
                        marginLeft: level > 0 ? indentPx * 2.4 : 55,
                        marginTop: 4,
                        display: 'flex',
                        gap: 16,
                        fontSize: 13,
                    }}
                >
                    <a
                        onClick={() => onHandleReply(comment)}
                        style={{ color: '#5F7086', cursor: 'pointer' }}
                    >
                        Reply
                    </a>

                    {comment.markAs === 'Special remark' ? (
                        <span
                            className='cursor-pointer'
                            onClick={() => handleRemarkClick('', comment)}
                        >
                            {loadingCommentId === comment._id
                                ? 'Removing...'
                                : 'Remove remark'}
                        </span>
                    ) : comment.markAs === 'Follow up' ? (
                        <span
                            className='cursor-pointer'
                            onClick={() => handleRemarkClick('', comment)}
                        >
                            {loadingCommentId === comment._id
                                ? 'Removing...'
                                : 'Remove follow up'}
                        </span>
                    ) : loadingCommentId === comment._id ? (
                        'Add Mark...'
                    ) : loadingCommentId === comment._id ? (
                        'Removing...'
                    ) : (
                        <Dropdown menu={remarkMenu} trigger={['click']}>
                            <a style={{ color: '#5F7086', cursor: 'pointer' }}>Mark as</a>
                        </Dropdown>
                    )}
                    <Dropdown menu={moreMenu} trigger={['click']}>
                        <a style={{ color: '#5F7086', cursor: 'pointer' }}>More</a>
                    </Dropdown>
                </div>
                {/* Render nested replies */}
                {comment?.replies?.length > 0 &&
                    comment.replies.map((r) => (
                        <CommentItem key={r?._id} comment={r} level={1} />
                    ))}
            </div>
        )
    }
    return (
        <>
            {comments.map((c, index) => (
                <div id={`comment-${c.id ?? index}`} key={c.id ?? index}>
                    <CommentItem comment={c} />
                </div>
            ))}
        </>
    )
};
export default CommentList;