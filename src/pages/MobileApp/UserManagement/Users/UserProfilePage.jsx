import React, { useMemo, useState, useEffect, useCallback } from 'react'
import { Card, Result, Spin } from 'antd'
import { useOutletContext, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import ProfileHeaderCard from '../../../../components/MobileApp/UserManagement/Users/userProfile/ProfileHeaderCard'
import ProfileSectionTabs from '../../../../components/MobileApp/UserManagement/Users/userProfile/ProfileSectionTabs'
import ActivityView from '../../../../components/MobileApp/UserManagement/Users/userProfile/tabs/UserActivityView'
import AccountSecurity from '../../../../components/MobileApp/UserManagement/Users/userProfile/tabs/AccountSecurity'
import PostUserProfileDetail from '../../../../components/MobileApp/UserManagement/Users/userProfile/tabs/PostUserProfile'
import TabBusinessPlaceUserProfile from '../../../../components/MobileApp/UserManagement/Users/userProfile/tabs/BusinessPlaces'
import TabCreatorRequestUserProfile from '../../../../components/MobileApp/UserManagement/Users/userProfile/tabs/RequestUserProfile'
import PageHeader from '../../../../components/Action/PageHeader'
import MomentPost from './moment/Moment'
//tabs
import ManagementRestriction from '../../../../components/MobileApp/UserManagement/Users/userProfile/tabs/ManageRestriction/ManageRestriction'
//end tabs

import { guardNormalUser } from '../../../../utils/roleGuard'
import { useAppUserStore } from '../../../../Stores/MobilesApp/User/user.store'
import { useUserProfileExtraStore } from '../../../../Stores/MobilesApp/User/userProfile.store'

import './UserProfilePage.scss'
import {
    momentsStats,
    momentsTimeline,
    placeStats,
    placeTimeline,
} from '../../../../data/mockUserProfile'

const VALID_SECTIONS = [
    'post',
    'user_activity',
    'business_places',
    'requests',
    'account_security',
    'manage_restriction',
]

const formatDateOnly = (value) => {
    if (!value) return '-'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

const formatDateTime = (value) => {
    if (!value) return '-'
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return d.toLocaleString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const normalizeStatus = (status) => {
    const s = String(status || '').toLowerCase()
    if (s === 'active') return 'active'
    if (s === 'inactive') return 'inactive'
    return 'inactive'
}

const normalizeGender = (gender) => {
    const s = String(gender || '').toLowerCase()
    if (s === 'male') return 'Male'
    if (s === 'female') return 'Female'
    if (s === 'other') return 'Other'
    return '-'
}

const formatPhoneNumber = (phone) => {
    if (!phone) return '-'

    const raw = String(phone).replace(/\D/g, '')

    if (raw.startsWith('855') && raw.length >= 11) {
        const local = `0${raw.slice(3)}`

        if (local.length === 9 || local.length === 10) {
            return `(+855) ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
        }

        return `(+855) ${local}`
    }

    if (raw.length === 9 || raw.length === 10) {
        return `${raw.slice(0, 3)} ${raw.slice(3, 6)} ${raw.slice(6)}`
    }

    return phone
}

const getUserType = (item) => {
    if (Number(item?.businessPlace || 0) > 0) return 'Business Owner'
    if (Boolean(item?.creatorStatus)) return 'Content Creator'
    return 'Normal'
}
const getPreparedDeviceType = item => {
    const value = String(
        item?.deviceType ||
        item?.device_type ||
        item?.device ||
        item?.platform ||
        item?.os ||
        item?.deviceInfo?.type ||
        item?.deviceInfo?.platform ||
        item?.deviceInfo?.os ||
        ''
    ).toLowerCase()

    if (value.includes('android')) return 'android'

    if (
        value.includes('apple') ||
        value.includes('ios') ||
        value.includes('iphone') ||
        value.includes('ipad')
    ) {
        return 'apple'
    }

    return ''
}
const buildProfileUser = item => {
    console.log(item, 'wowo');

    if (!item) return null

    const fullName = item?.username || '-'
    const avatar = item?.profilePicture || item?.profile || item?.profilePath || ''
    const phone = item?.phone || ''
    const userType = getUserType(item)

    const likes = Number(item?.engagement?.likes || 0)
    const comments = Number(item?.engagement?.comments || 0)
    const shares = Number(item?.engagement?.shares || 0)
    const saves = Number(item?.engagement?.saves || 0)
    const total = likes + comments + shares + saves

    const googleSocial = item?.social?.google || {}
    const appleSocial = item?.social?.apple || {}
    console.log(appleSocial?.email, 'somnak');


    const googleId = googleSocial?.sub || item?.googleId || ''
    const googleEmail = googleSocial?.email || item?.googleEmail || ''

    const appleId = appleSocial?.sub || item?.appleId || ''
    const appleEmail = appleSocial?.email || item?.appleEmail || ''

    const deviceType = getPreparedDeviceType(item)

    return {
        _id: item?._id,
        id: item?._id,

        fullName,
        nickname: item?.nickname || '',
        avatar,
        avatarLetter: fullName?.charAt(0)?.toUpperCase?.() || 'U',

        phone: formatPhoneNumber(phone),
        email: item?.email || '-',
        emailVerified: Boolean(item?.emailVerified),

        gender: normalizeGender(item?.gender),
        dob: formatDateOnly(item?.dob),
        bio: item?.bio || '-',
        location: item?.location || 'Phnom Penh',

        status: normalizeStatus(item?.status),
        userType,
        role: userType,

        followers: Number(item?.follower || 0),
        followings: Number(item?.following || 0),
        moments: Number(item?.moments || 0),
        businessPlace: Number(item?.businessPlace || 0),

        updatedBy: item?.updatedBy || 'By App',
        createdBy: item?.createdBy || 'By App',
        createdAt: formatDateTime(item?.createdAt),
        updatedAt: item?.updatedAt ? formatDateTime(item?.updatedAt) : '-',
        lastActive: item?.lastActive ? formatDateTime(item?.lastActive) : '-',

        registeredVia: item?.registeredVia || '-',
        verifyStatus: Boolean(item?.verifyStatus),
        isPass: Boolean(item?.isPass),

        creatorRequestStatus: item?.creatorRequestStatus,

        // Login/social data
        social: {
            google: {
                sub: googleId,
                email: googleEmail,
                emailVerified: Boolean(googleSocial?.emailVerified),
            },
            apple: {
                sub: appleId,
                email: appleEmail,
                emailVerified: Boolean(appleSocial?.emailVerified),
                isPrivateEmail: Boolean(appleSocial?.isPrivateEmail),
            },
        },

        googleId,
        googleEmail,
        appleId,
        appleEmail,

        // Device data: Android / Apple only
        deviceType,
        device: deviceType,
        platform: item?.platform || item?.os || '',

        profileName: item?.profileName,
        profilePath: item?.profilePath,
        profilePicture: item?.profilePicture,

        engagement: {
            total,
            likes,
            comments,
            shares,
            saves,
        },
    }
}


const getSavedCreatorRequestStatus = () => {
    const saved = String(
        localStorage.getItem('user-profile-request-status-filter') || ''
    )
        .toLowerCase()
        .trim()

    if (['approved', 'pending', 'rejected'].includes(saved)) {
        return saved
    }
    return ''
}

export default function UserProfilePage() {
    const { id } = useParams()
    const { setDisplayEmitContent } = useOutletContext()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    const storeUser = useAppUserStore((state) => state.user)

    const loading = useAppUserStore((state) => state.loading)
    const error = useAppUserStore((state) => state.error)
    const fetchAppUserById = useAppUserStore((state) => state.fetchAppUserById)

    const creatorRequestList = useUserProfileExtraStore(
        (state) => state.creatorRequests.list
    )
    const creatorRequestLoading = useUserProfileExtraStore(
        (state) => state.creatorRequests.loading
    )
    const fetchCreatorRequestsByUser = useUserProfileExtraStore(
        (state) => state.fetchCreatorRequestsByUser
    )

    const tabFromUrl = searchParams.get('tab')

    const [user, setUser] = useState(null)

    const isContentCreator = useMemo(() => {
        const requestStatus = String(storeUser?.creatorRequestStatus || '')
            .toLowerCase()
            .trim()

        return Boolean(storeUser?.creatorStatus) || requestStatus === 'approved'
    }, [storeUser?.creatorStatus, storeUser?.creatorRequestStatus])

    const defaultSection = isContentCreator ? 'post' : 'user_activity'

    const currentSection =
        !isContentCreator && tabFromUrl === 'post'
            ? defaultSection
            : VALID_SECTIONS.includes(tabFromUrl)
                ? tabFromUrl
                : defaultSection
    const [creatorRequestStatus, setCreatorRequestStatus] = useState(
        getSavedCreatorRequestStatus
    )

    const access_token =
        localStorage.getItem('access_token') ||
        localStorage.getItem('token') ||
        localStorage.getItem('admin_access_token') ||
        ''

    useEffect(() => {
        if (!id || !access_token) return

        fetchAppUserById({
            access_token,
            _id: id,
        })
    }, [id, access_token, fetchAppUserById])

    useEffect(() => {
        if (storeUser) {
            setUser(buildProfileUser(storeUser))
        }
    }, [storeUser])

    useEffect(() => {
        if (!storeUser) return

        const nextDefaultSection = isContentCreator ? 'post' : 'user_activity'

        const isInvalidTab = !tabFromUrl || !VALID_SECTIONS.includes(tabFromUrl)
        const isBlockedPost = tabFromUrl === 'post' && !isContentCreator

        if (isInvalidTab || isBlockedPost) {
            setSearchParams({ tab: nextDefaultSection }, { replace: true })
        }
    }, [storeUser, tabFromUrl, isContentCreator, setSearchParams])
    useEffect(() => {
        if (currentSection !== 'requests') return
        if (!id || !access_token) return

        fetchCreatorRequestsByUser({
            access_token,
            userId: id,
            page: 1,
            size: 10,
            status: creatorRequestStatus || undefined,
        })
    }, [
        currentSection,
        id,
        access_token,
        creatorRequestStatus,
        fetchCreatorRequestsByUser,
    ])

    const gate = useMemo(() => {
        return guardNormalUser(user?.role || 'Normal')
    }, [user?.role])

    const onEdit = useCallback(() => {
        console.log('Edit user clicked')
    }, [])

    const onSetStatus = useCallback((status) => {
        setUser((prev) => ({
            ...prev,
            status,
        }))
    }, [])

    const handleRequestView = useCallback((record) => {
        console.log('View request:', record)
    }, [])

    const handleCreatorRequestFilterChange = useCallback(({ tab, status }) => {
        if (tab !== 'creatorRequest') return

        setCreatorRequestStatus(status || '')
    }, [])

    const handleSectionChange = (nextSection) => {
        setSearchParams({ tab: nextSection })
    }

    if (loading && !user) {
        return (
            <div className="p-6">
                <Card className="rounded-2xl shadow-sm" style={{ border: '1px #0000001A solid' }}>
                    <div className="py-16 flex justify-center">
                        <Spin size="large" />
                    </div>
                </Card>
            </div>
        )
    }

    if (error && !user) {
        return (
            <div className="p-6">
                <Result status="error" title="Failed to load user detail" subTitle="Please try again." />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="p-6">
                <Result status="404" title="User not found" subTitle="No user detail available." />
            </div>
        )
    }

    if (gate.allowed) {
        return (
            <div className="p-6">
                <Result status="403" title="Access blocked" subTitle={gate.reason} />
            </div>
        )
    }

    return (
        <div>
            <ProfileHeaderCard
                user={user}
                setUser={setUser}
                onEdit={onEdit}
                onSetStatus={onSetStatus}
            />

            <ProfileSectionTabs value={currentSection} onChange={handleSectionChange} creatorRequestStatus={storeUser?.creatorRequestStatus} />

            {currentSection === 'user_activity' ? (
                <Card
                    className="mt-3 rounded-2xl shadow-sm"
                    styles={{ body: { padding: '0px 24px' } }}
                    style={{ border: '1px #0000001A solid' }}
                >
                    <ActivityView
                        userId={id}
                        access_token={access_token}
                        placeStats={placeStats}
                        momentsStats={momentsStats}
                        placeTimeline={placeTimeline}
                        momentsTimeline={momentsTimeline}
                    />
                </Card>
            ) : currentSection === 'post' && storeUser?.creatorRequestStatus === 'approved' ? (
                <Card
                    className="mt-3 rounded-2xl shadow-sm"
                    styles={{ body: { padding: '0px 24px' } }}
                    style={{ border: '1px #0000001A solid' }}
                >
                    {/* <PosterProfileDetail /> */}
                    <MomentPost userId={id} accessToken={access_token} />
                </Card>
            ) : currentSection === 'requests' ? (
                <Card
                    className="mt-3 rounded-2xl shadow-sm"
                    styles={{ body: { padding: '0px 24px' } }}
                    style={{ border: '1px #0000001A solid' }}
                >
                    <TabCreatorRequestUserProfile
                        creatorRequest={creatorRequestList}
                        requestBusinessPlace={[]}
                        requestNonBusinessPlace={[]}
                        claimBusinessPlace={[]}
                        loading={creatorRequestLoading}
                        onView={handleRequestView}
                        onFilterChange={handleCreatorRequestFilterChange}
                    />
                </Card>
            ) : currentSection === 'business_places' ? (
                <Card
                    className="mt-3 rounded-2xl shadow-sm"
                    styles={{ body: { padding: '15px 15px' } }}
                    style={{ border: '1px #0000001A solid' }}
                >
                    <TabBusinessPlaceUserProfile />
                </Card>
            ) : currentSection === 'manage_restriction' ? (
                <Card
                    className="mt-3 rounded-2xl shadow-sm"
                    styles={{ body: { padding: '15px 15px' } }}
                    style={{ border: '1px #0000001A solid' }}
                >
                    <ManagementRestriction
                        userId={id}
                        access_token={access_token}
                    />
                </Card>
            ) : (
                <Card
                    className="mt-3 rounded-2xl shadow-sm"
                    style={{ border: '1px #0000001A solid' }}
                >
                    <div className="text-gray-500">
                        <AccountSecurity

                            userId={id}

                            access_token={access_token}

                        />
                    </div>
                </Card>
            )}
        </div>
    )
}