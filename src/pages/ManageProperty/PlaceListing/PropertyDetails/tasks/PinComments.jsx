import React from 'react';

import {
    Button,
    Row,
    Col,
} from 'antd'
const PinComments = (props) => {
    const {
        specialComments,
        followUpComments,
        checkPermission,
        PERMS,
        handleRemarkClick,
        DeletedIcon,
        MaskGroup
    } = props

    return (
        <>
            {(specialComments.length > 0 || followUpComments.length > 0) && (
                <div
                    className='px-8'
                    style={{ marginBottom: 24, padding: '0px !important' }}
                >
                    <h3
                        style={{
                            marginBottom: 8,
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: 16,
                            fontWeight: 600,
                        }}
                    >
                        <span style={{ marginRight: 8 }}>📌</span> Pinned Tasks
                    </h3>
                    <div
                        style={{
                            display: 'flex',
                            gap: 16,
                            overflowX: 'auto',
                            paddingBottom: 8,
                        }}
                    >

                        {specialComments.map((pinned) => {
                            const dateObj = pinned?.createdAt
                                ? new Date(pinned?.createdAt)
                                : null

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

                            return (
                                <Row key={pinned?._id} style={{ minWidth: 280 }}>
                                    <Col span={24}>
                                        <div>
                                            <div
                                                style={{
                                                    background: '#fff',
                                                    borderRadius: 8,
                                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                                    width: '100%',
                                                    wordBreak: 'break-all',
                                                }}
                                            >

                                                <div
                                                    style={{
                                                        background: '#FFFBE6',
                                                        padding: '6px 8px',
                                                        borderRadius: '8px 8px 0 0',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            color: '#D48806',
                                                            fontWeight: 500,
                                                            fontSize: 12,
                                                        }}
                                                    >
                                                        Special remark
                                                    </span>
                                                    <div
                                                        style={{ display: 'flex', alignItems: 'center' }}
                                                    >
                                                        <span style={{ color: '#999', fontSize: 12 }}>
                                                            {dateString}
                                                        </span>
                                                        <span
                                                            style={{
                                                                color: '#064EA9',
                                                                fontSize: 12,
                                                                marginLeft: 4,
                                                            }}
                                                        >
                                                            {timeString}
                                                        </span>
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
                                                </div>
                                                {/* Pinned text */}
                                                <div
                                                    style={{
                                                        background: '#fff',
                                                        padding: 12,
                                                        fontSize: 14,
                                                        color: '#000',
                                                        textAlign: 'start',
                                                        borderRadius: '0 0 8px 8px',
                                                    }}
                                                >
                                                    {pinned.text}
                                                </div>
                                            </div>
                                            <div
                                                className='my-2'
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'flex-start',
                                                    gap: 8,
                                                }}
                                            >
                                                <Button
                                                    size='small'
                                                    style={{
                                                        background: '#F8F8F8',
                                                        border: 'none',
                                                        color: '#68707B',
                                                    }}
                                                    onClick={() => handleRemarkClick('', pinned)}
                                                >
                                                    Remove mark
                                                </Button>
                                                <Button
                                                    hidden={!checkPermission(PERMS.ASSIGNED_USER)}
                                                    size='small'
                                                    style={{
                                                        background: '#F8F8F8',
                                                        border: 'none',
                                                        color: '#68707B',
                                                    }}
                                                    danger
                                                    onClick={() =>
                                                        Swal.fire({
                                                            title: 'Delete Comment',
                                                            text: 'Are you sure you want to delete this comment?',
                                                            imageUrl: DeletedIcon, // <-- path to your custom PNG
                                                            imageWidth: 45, // adjust as needed
                                                            imageHeight: 45, // adjust as needed
                                                            imageAlt: 'Custom delete icon',
                                                            showCancelButton: true,
                                                            cancelButtonText: 'Cancel',
                                                            confirmButtonText: 'Delete',
                                                            confirmButtonColor: '#d33',
                                                            cancelButtonColor: '#3085d6',
                                                            showCloseButton: true,
                                                            reverseButtons: true,
                                                            didOpen: () => {
                                                                const confirmBtn = Swal.getConfirmButton()
                                                                const cancelBtn = Swal.getCancelButton()
                                                                const showCloseBtn = Swal.getCloseButton()
                                                                if (showCloseBtn) {
                                                                    showCloseBtn.style.color = 'red'
                                                                    showCloseBtn.style.fontSize = '30px'
                                                                }
                                                                if (confirmBtn) {
                                                                    confirmBtn.style.backgroundColor = '#d33'
                                                                    confirmBtn.style.color = '#ffffff'
                                                                    confirmBtn.style.border = 'none'
                                                                    confirmBtn.style.padding = '8px 50px'
                                                                    confirmBtn.style.marginLeft = '2px'

                                                                    confirmBtn.style.borderRadius = '20px'
                                                                    confirmBtn.style.fontSize = '14px'
                                                                    confirmBtn.style.cursor = 'pointer'
                                                                }
                                                                if (cancelBtn) {
                                                                    cancelBtn.style.backgroundColor = '#3085d6'
                                                                    cancelBtn.style.color = '#ffffff'
                                                                    cancelBtn.style.border = 'none'
                                                                    cancelBtn.style.padding = '8px 50px'
                                                                    cancelBtn.style.marginRight = '2px'

                                                                    cancelBtn.style.borderRadius = '20px'
                                                                    cancelBtn.style.fontSize = '14px'
                                                                    cancelBtn.style.cursor = 'pointer'
                                                                }
                                                            },
                                                        }).then((result) => {
                                                            if (result.isConfirmed) {
                                                                setComments((prev) =>
                                                                    removeCommentById(prev, pinned._id)
                                                                )
                                                                const commentId = pinned?._id
                                                                if (commentId !== null) {
                                                                    const doc = { commentId: pinned?._id }
                                                                    const res =
                                                                        TaskPropertyServices?.DeleteCommentProperty(
                                                                            {
                                                                                locationId: placeId,
                                                                                access_token,
                                                                                doc,
                                                                            }
                                                                        )
                                                                    if (res) {
                                                                        getCommentList(placeId)
                                                                        Swal.fire({
                                                                            title: 'Deleted!',
                                                                            text: 'Your comment has been deleted.',
                                                                            icon: 'success',
                                                                            timer: 1500,
                                                                            showConfirmButton: false,
                                                                        })
                                                                    } else {
                                                                        Swal.fire({
                                                                            title: 'Deleted!',
                                                                            text: 'Your comment cannot deleted',
                                                                            icon: 'warn',
                                                                            timer: 1500,
                                                                            showConfirmButton: false,
                                                                        })
                                                                    }
                                                                }
                                                            }
                                                        })
                                                    }
                                                >
                                                    Delete Task
                                                </Button>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            )
                        })}

                        {/* Render Follow Up Cards */}
                        {followUpComments.map((pinned) => {
                            const dateObj = pinned?.createdAt
                                ? new Date(pinned?.createdAt)
                                : null

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

                            return (
                                <Row key={pinned?._id} style={{ minWidth: 280 }}>
                                    <Col span={24}>
                                        <div
                                            style={{
                                                background: '#fff',
                                                borderRadius: 8,
                                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                                                width: '100%',
                                            }}
                                        >

                                            <div
                                                style={{
                                                    background: '#E6F4FF',
                                                    padding: '6px 8px',
                                                    borderRadius: '8px 8px 0 0',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        color: '#096DD9',
                                                        fontWeight: 500,
                                                        fontSize: 12,
                                                    }}
                                                >
                                                    Follow up
                                                </span>

                                                <div>
                                                    <span style={{ color: '#999', fontSize: 12 }}>
                                                        {dateString}
                                                    </span>
                                                    <span
                                                        style={{
                                                            color: '#064EA9',
                                                            fontSize: 12,
                                                            marginLeft: 4,
                                                        }}
                                                    >
                                                        {timeString}
                                                    </span>
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
                                            </div>

                                            <div
                                                style={{
                                                    background: '#fff',
                                                    padding: 12,
                                                    fontSize: 14,
                                                    color: '#000',
                                                    textAlign: 'start',
                                                    borderRadius: '0 0 8px 8px',
                                                }}
                                            >
                                                {pinned.text}
                                            </div>
                                        </div>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'flex-start',
                                                gap: 8,
                                                marginTop: 8,
                                            }}
                                        >
                                            <Button
                                                size='small'
                                                style={{
                                                    background: '#F8F8F8',
                                                    border: 'none',
                                                    color: '#68707B',
                                                }}
                                                onClick={() => handleRemarkClick('', pinned)}
                                            >
                                                Remove Follow Up
                                            </Button>
                                            <Button
                                                size='small'
                                                style={{
                                                    background: '#F8F8F8',
                                                    border: 'none',
                                                    color: '#68707B',
                                                }}
                                                danger
                                                onClick={() =>
                                                    Swal.fire({
                                                        title: 'Delete Comment',
                                                        text: 'Are you sure you want to delete this comment?',
                                                        icon: 'warning',
                                                        showCancelButton: true,
                                                        cancelButtonText: 'Cancel',
                                                        confirmButtonText: 'Delete',
                                                        confirmButtonColor: '#d33',
                                                        cancelButtonColor: '#3085d6',

                                                        reverseButtons: true,
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            setComments((prev) =>
                                                                removeCommentById(prev, pinned._id)
                                                            )
                                                            const commentId = pinned?._id
                                                            if (commentId !== null) {
                                                                const doc = { commentId: pinned?._id }
                                                                const res =
                                                                    TaskPropertyServices?.DeleteCommentProperty({
                                                                        locationId: placeId,
                                                                        access_token,
                                                                        doc,
                                                                    })
                                                                if (res) {
                                                                    getCommentList(placeId)
                                                                    Swal.fire({
                                                                        title: 'Deleted!',
                                                                        text: 'Your comment has been deleted.',
                                                                        icon: 'success',
                                                                        timer: 1500,
                                                                        showConfirmButton: false,
                                                                    })
                                                                } else {
                                                                    Swal.fire({
                                                                        title: 'Deleted!',
                                                                        text: 'Your comment cannot deleted',
                                                                        icon: 'warn',
                                                                        timer: 1500,
                                                                        showConfirmButton: false,
                                                                    })
                                                                }
                                                            }
                                                        }
                                                    })
                                                }
                                            >
                                                Delete Task
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                            )
                        })}
                    </div>
                </div>
            )}
        </>
    );
};
export default PinComments;