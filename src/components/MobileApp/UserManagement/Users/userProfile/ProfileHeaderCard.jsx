import React, { useState } from 'react'
import { Avatar, Button, Card, Dropdown, Image, message, Tooltip } from 'antd'
import GenderImgIcon from '../../../../../assets/icon/user/gender.svg'
import userImgIcon from '../../../../../assets/icon/user/2user.svg'
import {
    PhoneOutlined,
    EnvironmentOutlined,
    GoogleOutlined,
    AppleOutlined,
    AndroidOutlined,
    MailOutlined,
} from '@ant-design/icons'
import { EditOutlined, EyeOutlined, EllipsisOutlined, EyeInvisibleOutlined, CameraOutlined } from '@ant-design/icons'

import EditUserModal from '../Edit/EditUserModal'
import ConfirmStatusModal from '../Edit/ConfirmStatusModal'
import { useAppUserStore } from '../../../../../Stores/MobilesApp/User/user.store'
import Swal from 'sweetalert2'
//
import AppleIdIcon from '../../../../../assets/other/AppleId.svg'
import GoogleIdIcon from '../../../../../assets/other/Google.svg'
//
const toDisplayStatus = (status) => {
    const s = String(status || '').toLowerCase()
    if (s === 'active') return 'Active'
    if (s === 'inactive') return 'Inactive'
    return 'Inactive'
}

const toValueStatus = (status) => {
    const s = String(status || '').toLowerCase()
    if (s === 'active') return 'Active'
    if (s === 'inactive') return 'Inactive'
    return 'Inactive'
}

const isActiveStatus = (status) => {
    return String(status || '').toLowerCase() === 'active'
}

const normalizePhone = (phone) => {
    if (!phone) return ''

    const digits = phone.replace(/\D/g, '')

    // remove country code
    if (digits.startsWith('8550')) {
        return `855${digits.slice(4)}`
    }

    if (digits.startsWith('0')) {
        return `855${digits.slice(1)}`
    }

    if (digits.startsWith('855')) {
        return digits
    }

    return digits
}

const getDeviceType = user => {

    if (user?.android && user?.android?.emailVerified === true) return 'android'

    if (
        user?.apple && user?.apple?.emailVerified === true
    ) {
        return 'apple'
    }
    return ''
}

const getDeviceIcon = user => {
    const deviceType = getDeviceType(user)
    if (deviceType === 'android') {
        return <AndroidOutlined className="ph-meta-icon" />
    } else if (deviceType === 'apple') {
        return <AppleOutlined className="ph-meta-icon" />
    } else {
        return <AppleOutlined className="ph-meta-icon" />
    }

    return null
}

const getDeviceText = user => {
    const deviceType = getDeviceType(user)
    if (deviceType === 'apple') return user?.apple?.email
    if (deviceType === 'android') return user?.android?.email

    return '-'
}

const getGoogleText = user => {
    return user?.social?.google?.email || '-'
}
const MetaDivider = () => (
    <span
        style={{
            width: 1,
            height: 14,
            background: '#dbe3ef',
            display: 'inline-block',
            margin: '0 10px',
            flexShrink: 0,
        }}
    />
)
export default function ProfileHeaderCard({ user, setUser, onEdit, onSetStatus }) {

    const [openEdit, setOpenEdit] = useState(false)
    const [openConfirm, setOpenConfirm] = useState(false)
    const [pendingStatus, setPendingStatus] = useState(null)
    const [submittingStatus, setSubmittingStatus] = useState(false)

    const updateAppUser = useAppUserStore((state) => state.updateAppUser)
    const [userNameExisting, setUserNameExisting] = useState()
    const access_token =
        localStorage.getItem('access_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('admin_access_token') ||
        ''

    const bioText = user?.bio?.trim?.() ? user.bio : '-'

    const handleEdit = () => {
        setOpenEdit(true)
        onEdit?.()
    }

    const handleSetStatus = (status) => {
        setPendingStatus(status)
        setOpenConfirm(true)
    }

    const currentIsActive = isActiveStatus(user?.status)

    const menuItems = [
        {
            key: 'edit',
            icon: <EditOutlined />,
            label: 'Edit user',
        },
        ...(currentIsActive
            ? [
                {
                    key: 'inactive',
                    icon: <EyeInvisibleOutlined style={{ color: '#e11d48' }} />,
                    label: 'Inactive',
                },
            ]
            : [
                {
                    key: 'active',
                    icon: <EyeOutlined style={{ color: '#22c55e' }} />,
                    label: 'Active',
                },
            ]),
    ]

    const onMenuClick = ({ key }) => {
        if (key === 'edit') handleEdit?.()
        if (key === 'inactive') handleSetStatus?.('inactive')
        if (key === 'active') handleSetStatus?.('active')
    }

    const onSaveEdit = async (values) => {
        if (!user?._id || !access_token) {
            message.error('Missing user id or access token')
            return
        }

        const normalizedPhone = normalizePhone(values?.phone)

        try {
            setSubmittingStatus(true)

            await updateAppUser({
                access_token,
                doc: {
                    _id: user?._id,
                    body: {
                        username: values?.username,
                        nickname: values?.nickname,
                        phone: normalizedPhone,
                        email: values?.email,
                        gender: values?.gender,
                        dob: values?.dob,
                        // location: values?.location,
                        bio: values?.bio,
                    },
                },
            })

            setUser?.((prev) => ({
                ...prev,
                fullName: values?.username ?? prev?.fullName,
                nickname: values?.nickname ?? prev?.nickname,
                phone: normalizedPhone,
                email: values?.email ?? prev?.email,
                gender: values?.gender ?? prev?.gender,
                dob: values?.dob ?? prev?.dob,
                location: values?.location ?? prev?.location,
                bio: values?.bio ?? prev?.bio,
            }))

            Swal.fire({
                icon: 'success',
                title: 'Upload Successful!',
                text: 'The information has been add successfully.',
                showConfirmButton: false,
                timer: 1500,
            })
            setOpenEdit(false)

        } catch (error) {
            setUserNameExisting(error?.response?.data?.error?.message)
            Swal.fire({
                icon: 'error',
                title: 'Upload Failed!',
                text: error?.response?.data?.error?.message ? 'Username already exists' : 'Something went wrong while add.',
                timer: 1500,
            })
        } finally {
            setSubmittingStatus(false)
        }
    }

    const onConfirmStatus = async () => {
        const nextStatus = toValueStatus(pendingStatus)

        if (!user?._id || !access_token) {
            message.error('Missing user id or access token')
            return
        }

        try {
            setSubmittingStatus(true)

            await updateAppUser({
                access_token,
                doc: {
                    _id: user?._id,
                    body: {
                        status: nextStatus,
                    },
                },
            })

            setUser?.((prev) => ({
                ...prev,
                status: nextStatus,
            }))

            Swal.fire({
                icon: 'success',
                title: 'Upload Successful!',
                text: 'The information has been add successfully.',
                showConfirmButton: false,
                timer: 1500,
            })
            onSetStatus?.(nextStatus)
            setOpenConfirm(false)
            setPendingStatus(null)
        } catch (error) {

            Swal.fire({
                icon: 'error',
                title: 'Upload Failed!',
                text: 'Something went wrong while add.',
                timer: 1500,
            })
        } finally {
            setSubmittingStatus(false)
        }
    }

    return (
        <>
            <EditUserModal
                open={openEdit}
                user={user}
                onCancel={() => setOpenEdit(false)}
                onSave={onSaveEdit}
                userNameExisting={userNameExisting}
            />

            <ConfirmStatusModal
                open={openConfirm}
                status={toDisplayStatus(pendingStatus)}
                onCancel={() => {
                    if (submittingStatus) return
                    setOpenConfirm(false)
                }}
                onConfirm={onConfirmStatus}
                loading={submittingStatus}
            />

            <Card className="ph-card" style={{ border: '1px #0000001A solid' }}>
                <div className="ph-grid">
                    {/* Avatar */}
                    <div className="ph-avatar">
                        <Avatar size={62} src={user?.avatar} className="ph-avatar-circle">
                            {user?.avatarLetter || 'U'}
                        </Avatar>
                    </div>

                    {/* Main info */}
                    <div className="ph-main">
                        <div className="ph-name-row">
                            <div className="ph-name">{user?.fullName || '-'}</div>
                            <div className="ph-nickname">
                                {user?.nickname ? `(${user.nickname})` : ''}
                            </div>
                        </div>

                        <div className="ph-pills-row status-user-profile">
                            <div
                                className={`ph-pill-box ${String(user?.creatorRequestStatus || '').toLowerCase() === 'approved'
                                    ? 'ph-pill-creator'
                                    : 'ph-pill-normal'
                                    }`}
                            >
                                {String(user?.creatorRequestStatus || '').toLowerCase() === 'approved' ? (
                                    <CameraOutlined className="ph-pill-icon" />
                                ) : (
                                    <Image preview={false} src={userImgIcon} className="ph-pill-img" />
                                )}

                                <span className="ph-pill-text">
                                    {String(user?.creatorRequestStatus || '').toLowerCase() === 'approved'
                                        ? 'content creator'
                                        : 'Normal'}
                                </span>
                            </div>

                            <div
                                className={`ph-pill-box ${isActiveStatus(user?.status) ? 'ph-pill-active' : 'ph-pill-inactive'
                                    }`}
                            >
                                <span className="ph-pill-text">{toDisplayStatus(user?.status)}</span>
                            </div>
                        </div>

                        <div>
                            <div
                                className="ph-meta-row"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    rowGap: 6,
                                }}
                            >
                                <div className="ph-meta-item">
                                    <Image preview={false} src={GenderImgIcon} />
                                    <span>{user?.gender || '-'}</span>
                                </div>

                                <MetaDivider />

                                <div className="ph-meta-item">
                                    <PhoneOutlined className="ph-meta-icon" />
                                    <span>{user?.phone || '-'}</span>
                                </div>

                                <MetaDivider />

                                <div className="ph-meta-item">
                                    <MailOutlined className="ph-meta-icon" />
                                    <span>{user?.email || '-'}</span>
                                </div>

                                <MetaDivider />

                                <div className="ph-meta-item">
                                    <EnvironmentOutlined className="ph-meta-icon" />
                                    <span>{user?.location || '-'}</span>
                                </div>
                            </div>
                            <div
                                className="ph-meta-row"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    rowGap: 6,
                                    marginTop: 8,
                                }}
                            >
                                {/* Google login/social */}
                                <div className="ph-meta-item">

                                    <img src={GoogleIdIcon} className="ph-meta-icon" />
                                    <span>{getGoogleText(user)}</span>
                                </div>

                                <MetaDivider />

                                {/* Device: Android or Apple only */}
                                <div className="ph-meta-item">
                                    {console.log(user, 'wow user')
                                    }
                                    {getDeviceIcon(user?.social)}
                                    <span>{getDeviceText(user?.social)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right controls */}
                    <div
                        className="ph-right"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            justifyContent: 'flex-start',
                            height: '100%',
                            minHeight: 90,
                        }}
                    >
                        <div className="ph-dots">
                            <Dropdown
                                menu={{ items: menuItems, onClick: onMenuClick }}
                                placement="bottomRight"
                                trigger={['click']}
                            >
                                <Button
                                    className="ph-dots-btn"
                                    shape="circle"
                                    icon={<EllipsisOutlined />}
                                />
                            </Dropdown>
                        </div>

                        <div
                            className="ph-follow-stats"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: 18,
                                marginTop: 10,
                                flexWrap: 'wrap',
                            }}
                        >
                            <div
                                className="ph-follow-stat-item"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    color: '#64748b',
                                    fontSize: 13,
                                    lineHeight: 1,
                                }}
                            >
                                <Image
                                    preview={false}
                                    src={userImgIcon}
                                    width={14}
                                    height={14}
                                    style={{ opacity: 0.7 }}
                                />
                                <span className="ph-follow-label">Followers</span>
                                <span
                                    className="ph-follow-value"
                                    style={{ color: '#0f172a', fontWeight: 500 }}
                                >
                                    {user?.followers || 0}
                                </span>
                            </div>

                            <div
                                className="ph-follow-stat-item"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    color: '#64748b',
                                    fontSize: 13,
                                    lineHeight: 1,
                                }}
                            >
                                <Image
                                    preview={false}
                                    src={userImgIcon}
                                    width={14}
                                    height={14}
                                    style={{ opacity: 0.7 }}
                                />
                                <span className="ph-follow-label">Followings</span>
                                <span
                                    className="ph-follow-value"
                                    style={{ color: '#0f172a', fontWeight: 500 }}
                                >
                                    {user?.followings || 0}
                                </span>
                            </div>

                            {String(user?.creatorRequestStatus || '').toLowerCase() === 'approved' && (
                                <div
                                    className="ph-follow-stat-item"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        color: '#64748b',
                                        fontSize: 13,
                                        lineHeight: 1,
                                    }}
                                >
                                    <CameraOutlined />
                                    <span className="ph-follow-label">Posts</span>
                                    <span
                                        className="ph-follow-value"
                                        style={{ color: '#0f172a', fontWeight: 500 }}
                                    >
                                        {user?.postsCount ?? 0}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div
                    className="w-full"
                    style={{
                        marginTop: 10,
                        width: '100%',
                    }}
                >
                    <div
                        className="ph-bio-date-row"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 16,
                            width: '100%',
                            color: '#64748b',
                            fontSize: 13,
                            lineHeight: 1.6,
                            minWidth: 0,
                        }}
                    >
                        <div
                            className="ph-bio-row"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                minWidth: 0,
                                flex: 1,
                                overflow: 'hidden',
                                paddingLeft: 88,
                            }}
                        >
                            <span
                                style={{
                                    color: '#0f172a',
                                    fontWeight: 500,
                                    flexShrink: 0,
                                    marginRight: 4,
                                }}
                            >
                                Bio:
                            </span>

                            <Tooltip title={bioText}>
                                <span
                                    style={{
                                        display: 'inline-block',
                                        minWidth: 0,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {bioText}
                                </span>
                            </Tooltip>
                        </div>

                        <div
                            className="ph-dates"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: 20,
                                color: '#94a3b8',
                                fontSize: 13,
                                whiteSpace: 'nowrap',
                                flexShrink: 0,
                                marginLeft: 'auto',
                            }}
                        >
                            <span className="ph-date">
                                <span className="ph-date-label">Last active:</span>{' '}
                                {user?.lastActive || '-'}
                            </span>

                            <span className="ph-date">
                                <span className="ph-date-label">Created:</span>{' '}
                                {user?.createdAt || '-'}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </>
    )
}