import React, {
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { Button, Col, Empty, Row, Select, Spin, message } from 'antd'
import {
    AppstoreOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    FileTextOutlined,
    TableOutlined,
} from '@ant-design/icons'
import Swal from 'sweetalert2'

import TableHeader from '../../../../../../widgets/TableHeader'

import RequestList from '../../../creator-request/RequestList'
import RequestGrid from '../../../creator-request/RequestGrid'
import ViewRequestModal from '../../../creator-request/ViewRequestModal'
import ApproveModal from '../../../creator-request/ApproveModal'
import RejectModal from '../../../creator-request/RejectModal'

import { AuthContext } from '../../../../../../contexts/AuthContext'
import { useCreatorRequestStore } from '../../../../../../Stores/MobilesApp/CreatorRequest/CreatorRequst.store'

const TAB_KEYS = {
    CREATOR_REQUEST: 'creatorRequest',
    REQUEST_BUSINESS_PLACE: 'requestBusinessPlace',
    REQUEST_NON_BUSINESS_PLACE: 'requestNonBusinessPlace',
    CLAIM_BUSINESS_PLACE: 'claimBusinessPlace',
}

const tabOptions = [
    { key: TAB_KEYS.CREATOR_REQUEST, label: 'Creator Request' },
    { key: TAB_KEYS.REQUEST_BUSINESS_PLACE, label: 'Request Business place' },
    { key: TAB_KEYS.REQUEST_NON_BUSINESS_PLACE, label: 'Request Non Business place' },
    { key: TAB_KEYS.CLAIM_BUSINESS_PLACE, label: 'Claim Business place' },
]

const defaultDataMap = {
    creatorRequest: [],
    requestBusinessPlace: [],
    requestNonBusinessPlace: [],
    claimBusinessPlace: [],
}

const extractApiList = (value, fallback = []) => {
    if (Array.isArray(value)) return value

    if (Array.isArray(value?.data)) return value.data
    if (Array.isArray(value?.data?.data)) return value.data.data
    if (Array.isArray(value?.result)) return value.result
    if (Array.isArray(value?.payload)) return value.payload
    if (Array.isArray(value?.rows)) return value.rows
    if (Array.isArray(value?.items)) return value.items
    if (Array.isArray(value?.docs)) return value.docs

    return fallback
}

const extractApiSummary = (value) => {
    return (
        value?.meta?.summary ||
        value?.data?.meta?.summary ||
        value?.summary ||
        value?.data?.summary ||
        null
    )
}

const getFullName = (user) => {
    if (!user) return ''

    const fullName = [user?.firstName, user?.lastName]
        .filter(Boolean)
        .join(' ')
        .trim()

    return fullName || user?.fullName || user?.username || user?.name || ''
}

const normalizeStatus = (status) => {
    const value = String(status || 'pending').toLowerCase().trim()

    if (value === 'approved' || value === 'active') return 'approved'
    if (value === 'rejected' || value === 'reject') return 'rejected'
    if (
        value === 'pending' ||
        value === 'under_review' ||
        value === 'under review'
    ) {
        return 'pending'
    }

    return value || 'pending'
}

const getRequestedBy = (item, fallbackName = '') => {
    const requestedBy = item?.actionAudit?.requestedBy

    if (requestedBy?.systemUser) {
        return getFullName(requestedBy.systemUser) || 'Admin'
    }

    if (requestedBy?.appUser) {
        return (
            requestedBy.appUser?.nickname ||
            requestedBy.appUser?.username ||
            'App User'
        )
    }

    if (item?.createdBy) {
        return getFullName(item.createdBy) || 'Admin'
    }

    if (item?.createdSource === 'app') return 'App User'
    if (item?.createdSource === 'admin') return 'Admin'
    if (item?.createdSource === 'system') return 'Admin'

    return item?.requestByName || item?.requestBy || fallbackName || 'Admin'
}

const normalizeRequestItem = (item = {}, index = 0) => {
    const userObj = item?.user || item?.userId || item?.appUser || {}
    const userSnapshot = item?.userSnapshot || {}
    const socialLinks = item?.socialLinks || {}
    const locationContact = item?.locationContact || {}
    const provinceObj = locationContact?.province || item?.province || {}

    const fullName =
        item?.name ||
        userSnapshot?.fullName ||
        userObj?.fullName ||
        userObj?.nickname ||
        userObj?.name ||
        `${userObj?.firstName || ''} ${userObj?.lastName || ''}`.trim() ||
        userObj?.username ||
        item?.userName ||
        item?.username ||
        'Unknown User'

    const avatar =
        item?.avatar ||
        userSnapshot?.avatar ||
        userObj?.avatar ||
        userObj?.profile ||
        userObj?.profileImage ||
        userObj?.image ||
        item?.profilePicture ||
        ''

    const provinceName =
        item?.location ||
        item?.provinceName ||
        provinceObj?.nameEn ||
        provinceObj?.nameKh ||
        locationContact?.provinceName ||
        locationContact?.provinceId ||
        item?.province ||
        '-'

    const followers =
        userSnapshot?.followersCount ??
        item?.followers ??
        userObj?.followers ??
        userObj?.followerCount ??
        userObj?.totalFollowers ??
        item?.follower ??
        0

    const status = normalizeStatus(item?.status || item?.requestStatus)
    const requestedByName = getRequestedBy(item)

    const requestRole =
        item?.createdSource === 'system' || item?.createdSource === 'admin'
            ? 'Admin'
            : item?.createdSource === 'app'
                ? 'App'
                : requestedByName === 'Admin'
                    ? 'Admin'
                    : 'App'

    const createdAt =
        item?.createdAt ||
        item?.requestedAt ||
        item?.requestDate ||
        item?.created_at ||
        '-'

    const requestedAt =
        item?.requestedAt ||
        item?.actionAudit?.requestedAt ||
        item?.createdAt ||
        item?.created_at ||
        '-'

    const rejectionReason =
        item?.rejectionReason ||
        item?.reason ||
        item?.rejectReason ||
        item?.actionAudit?.rejectedNote ||
        ''

    return {
        ...item,

        id: item?._id || item?.id || index + 1,
        _id: item?._id || item?.id,

        name: fullName,
        userName: fullName,
        avatar,
        avatarText: fullName
            ?.split(' ')
            ?.map((s) => s?.[0] || '')
            ?.join('')
            ?.slice(0, 2)
            ?.toUpperCase(),

        followers,
        location: provinceName,
        province: provinceName,

        status,

        about: item?.about || item?.bio || item?.description || item?.reason || '-',
        contentTypes: Array.isArray(item?.contentTypes)
            ? item.contentTypes
            : item?.contentTypes
                ? [item.contentTypes]
                : [],

        phoneNumber: locationContact?.phone || item?.phoneNumber || '',
        telegramPhone: locationContact?.telegramPhone || item?.telegramPhone || '',

        tiktok: socialLinks?.tiktok || item?.tiktok || '',
        facebook: socialLinks?.facebook || item?.facebook || '',
        instagram: socialLinks?.instagram || item?.instagram || '',
        youtube: socialLinks?.youtube || item?.youtube || '',
        otherLink:
            socialLinks?.otherLink ||
            socialLinks?.portfolioWebsite ||
            item?.otherLink ||
            '',

        requestBy: {
            role: requestRole,
            name: requestedByName,
        },
        requestByName: requestedByName,

        createdAt,
        requestedAt,

        rejectedBy: item?.actionAudit?.rejectedBy?.username,
        approvedBy: item?.actionAudit?.approvedBy?.username,

        reason: rejectionReason,
        rejectionReason,

        currentRole: userObj?.role || userObj?.userType || 'Normal',

        raw: item,
    }
}

const normalizeRequestList = (value, fallback = []) => {
    return extractApiList(value, fallback).map((item, index) =>
        normalizeRequestItem(item, index)
    )
}

const SummaryCard = ({ title, value }) => {
    return (
        <div
            style={{
                border: '1px solid #E5E7EB',
                borderRadius: 18,
                background: '#FFFFFF',
                padding: '15px 24px',
                minHeight: 5,
            }}
        >
            <div
                style={{
                    color: '#6B7280',
                    fontSize: 14,
                    fontWeight: 500,
                    marginBottom: 4,
                }}
            >
                {title}
            </div>

            <div
                style={{
                    color: '#111827',
                    fontSize: 14,
                    fontWeight: 700,
                    lineHeight: 1.1,
                }}
            >
                {value}
            </div>
        </div>
    )
}

const TabCreatorRequestUserProfile = ({
    creatorRequest = defaultDataMap.creatorRequest,
    requestBusinessPlace = defaultDataMap.requestBusinessPlace,
    requestNonBusinessPlace = defaultDataMap.requestNonBusinessPlace,
    claimBusinessPlace = defaultDataMap.claimBusinessPlace,
    loading = false,
    onFilterChange,
    refreshRequests,
}) => {
    const { access_token } = useContext(AuthContext)

    const {
        approveCreatorRequest,
        rejectCreatorRequest,
    } = useCreatorRequestStore()

    const STORAGE_KEYS = {
        activeTab: 'user-profile-request-active-tab',
        statusFilter: 'user-profile-request-status-filter',
        viewMode: 'user-profile-request-view-mode',
    }

    const [selected, setSelected] = useState(null)
    const [openView, setOpenView] = useState(false)
    const [openApprove, setOpenApprove] = useState(false)
    const [openReject, setOpenReject] = useState(false)

    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const [activeTab, setActiveTab] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.activeTab)
        const validKeys = Object.values(TAB_KEYS)

        return validKeys.includes(saved) ? saved : TAB_KEYS.CREATOR_REQUEST
    })

    const [statusFilter, setStatusFilter] = useState(() => {
        const saved = String(localStorage.getItem(STORAGE_KEYS.statusFilter) || '')
            .toLowerCase()
            .trim()

        if (['approved', 'pending', 'rejected'].includes(saved)) {
            return saved
        }

        return ''
    })

    const [viewMode, setViewMode] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEYS.viewMode)

        return saved === 'grid' || saved === 'table' ? saved : 'table'
    })

    const tabRefs = useRef({})

    const [tabIndicatorStyle, setTabIndicatorStyle] = useState({
        left: 0,
        width: 0,
        opacity: 0,
    })

    useLayoutEffect(() => {
        const updateIndicator = () => {
            const activeEl = tabRefs.current[activeTab]

            if (!activeEl) return

            setTabIndicatorStyle({
                left: activeEl.offsetLeft,
                width: activeEl.offsetWidth,
                opacity: 1,
            })
        }

        updateIndicator()
        window.addEventListener('resize', updateIndicator)

        return () => {
            window.removeEventListener('resize', updateIndicator)
        }
    }, [activeTab])

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.activeTab, activeTab)
    }, [activeTab])

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.statusFilter, statusFilter)
    }, [statusFilter])

    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.viewMode, viewMode)
    }, [viewMode])

    useEffect(() => {
        setCurrentPage(1)
    }, [activeTab, statusFilter, viewMode])

    const creatorRequestSummary = useMemo(() => {
        return extractApiSummary(creatorRequest)
    }, [creatorRequest])

    const normalizedCreatorRequest = useMemo(() => {
        return normalizeRequestList(creatorRequest, defaultDataMap.creatorRequest)
    }, [creatorRequest])

    const normalizedRequestBusinessPlace = useMemo(() => {
        return normalizeRequestList(requestBusinessPlace, defaultDataMap.requestBusinessPlace)
    }, [requestBusinessPlace])

    const normalizedRequestNonBusinessPlace = useMemo(() => {
        return normalizeRequestList(requestNonBusinessPlace, defaultDataMap.requestNonBusinessPlace)
    }, [requestNonBusinessPlace])

    const normalizedClaimBusinessPlace = useMemo(() => {
        return normalizeRequestList(claimBusinessPlace, defaultDataMap.claimBusinessPlace)
    }, [claimBusinessPlace])

    const dataMap = useMemo(
        () => ({
            [TAB_KEYS.CREATOR_REQUEST]: normalizedCreatorRequest,
            [TAB_KEYS.REQUEST_BUSINESS_PLACE]: normalizedRequestBusinessPlace,
            [TAB_KEYS.REQUEST_NON_BUSINESS_PLACE]: normalizedRequestNonBusinessPlace,
            [TAB_KEYS.CLAIM_BUSINESS_PLACE]: normalizedClaimBusinessPlace,
        }),
        [
            normalizedCreatorRequest,
            normalizedRequestBusinessPlace,
            normalizedRequestNonBusinessPlace,
            normalizedClaimBusinessPlace,
        ]
    )

    const currentData = useMemo(() => {
        return dataMap[activeTab] || []
    }, [dataMap, activeTab])

    const tableData = useMemo(() => {
        return currentData
    }, [currentData])

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        const end = start + pageSize

        return tableData.slice(start, end)
    }, [tableData, currentPage, pageSize])

    const summary = useMemo(() => {
        if (activeTab === TAB_KEYS.CREATOR_REQUEST && creatorRequestSummary) {
            return {
                all:
                    creatorRequestSummary.totalRequests ??
                    creatorRequestSummary.total ??
                    currentData?.length ??
                    0,
                approved: creatorRequestSummary.approved ?? 0,
                pending: creatorRequestSummary.pending ?? 0,
                rejected: creatorRequestSummary.rejected ?? 0,
            }
        }

        const all = currentData?.length || 0

        const approved = currentData.filter(
            (item) => String(item?.status || '').toLowerCase() === 'approved'
        ).length

        const pending = currentData.filter(
            (item) => String(item?.status || '').toLowerCase() === 'pending'
        ).length

        const rejected = currentData.filter(
            (item) => String(item?.status || '').toLowerCase() === 'rejected'
        ).length

        return {
            all,
            approved,
            pending,
            rejected,
        }
    }, [activeTab, creatorRequestSummary, currentData])

    const emptyTextMap = {
        [TAB_KEYS.CREATOR_REQUEST]: 'No creator request found',
        [TAB_KEYS.REQUEST_BUSINESS_PLACE]: 'No request business place found',
        [TAB_KEYS.REQUEST_NON_BUSINESS_PLACE]: 'No request non business place found',
        [TAB_KEYS.CLAIM_BUSINESS_PLACE]: 'No claim business place found',
    }

    const emitFilterChange = useCallback(
        ({ tab = activeTab, status = statusFilter } = {}) => {
            onFilterChange?.({
                tab,
                status: status || undefined,
            })
        },
        [activeTab, statusFilter, onFilterChange]
    )

    const reloadCurrentData = useCallback(() => {
        if (typeof refreshRequests === 'function') {
            refreshRequests({
                tab: activeTab,
                status: statusFilter || undefined,
            })

            return
        }

        emitFilterChange({
            tab: activeTab,
            status: statusFilter,
        })
    }, [activeTab, statusFilter, refreshRequests, emitFilterChange])

    const handleTabChange = (nextTab) => {
        setActiveTab(nextTab)

        onFilterChange?.({
            tab: nextTab,
            status: statusFilter || undefined,
        })
    }

    const handleStatusChange = (value) => {
        const nextStatus = value || ''

        setStatusFilter(nextStatus)

        onFilterChange?.({
            tab: activeTab,
            status: nextStatus || undefined,
        })
    }

    const handleOpenView = (item) => {
        setSelected(item)
        setOpenView(true)
    }

    const handleOpenApprove = (item) => {
        setSelected(item)
        setOpenView(false)
        setOpenApprove(true)
    }

    const handleOpenReject = (item) => {
        setSelected(item)
        setOpenView(false)
        setOpenReject(true)
    }

    const handleApproveRequest = async (values) => {
        try {
            const targetId =
                values?._id ||
                values?.id ||
                selected?._id ||
                selected?.id

            if (!targetId) {
                message.error('Request id not found')
                return
            }

            await approveCreatorRequest({
                access_token,
                doc: {
                    _id: targetId,
                    body: {
                        note: values?.approveReason || values?.note || '',
                    },
                },
            })

            Swal.fire({
                icon: 'success',
                title: 'Approved Successful!',
                text: 'The information has been Check.',
                showConfirmButton: false,
                timer: 1500,
            })

            setOpenApprove(false)
            setOpenView(false)
            setSelected(null)

            reloadCurrentData()
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Upload Failed!',
                text:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Something went wrong while approve.',
                timer: 1500,
            })
        }
    }

    const handleRejectRequest = async (values) => {
        try {
            const targetId =
                values?._id ||
                values?.id ||
                selected?._id ||
                selected?.id

            if (!targetId) {
                message.error('Request id not found')
                return
            }

            await rejectCreatorRequest({
                access_token,
                doc: {
                    _id: targetId,
                    body: {
                        note: values?.rejectReason || values?.note || '',
                        rejectionReason: values?.rejectReason || values?.note || '',
                    },
                },
            })

            Swal.fire({
                icon: 'success',
                title: 'Rejected Successful!',
                text: 'The information has been Check.',
                showConfirmButton: false,
                timer: 1500,
            })

            setOpenReject(false)
            setOpenView(false)
            setSelected(null)

            reloadCurrentData()
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Upload Failed!',
                text:
                    error?.response?.data?.message ||
                    error?.message ||
                    'Something went wrong while reject.',
                timer: 1500,
            })
        }
    }

    const tablePagination = {
        current: currentPage,
        pageSize,
        total: tableData?.length || 0,
        onChange: (page, size) => {
            setCurrentPage(page)
            setPageSize(size)
        },
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
    }

    return (
        <>
            <div className="my-5">
                <div
                    style={{
                        position: 'relative',
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        columnGap: 32,
                        rowGap: 12,
                        marginBottom: 20,
                        paddingBottom: 0,
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            bottom: -1,
                            left: tabIndicatorStyle.left,
                            width: tabIndicatorStyle.width,
                            height: 3,
                            borderRadius: 999,
                            background: '#1677FF',
                            opacity: tabIndicatorStyle.opacity,
                            transition:
                                'left 0.35s cubic-bezier(0.22, 1, 0.36, 1), width 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease',
                            pointerEvents: 'none',
                        }}
                    />

                    {tabOptions.map((item) => {
                        const isActive = activeTab === item.key

                        return (
                            <button
                                key={item.key}
                                ref={(el) => {
                                    if (el) tabRefs.current[item.key] = el
                                }}
                                type="button"
                                onClick={() => handleTabChange(item.key)}
                                style={{
                                    position: 'relative',
                                    border: 'none',
                                    background: 'transparent',
                                    padding: '0 0 10px',
                                    fontSize: 14,
                                    fontWeight: 700,
                                    color: isActive ? '#1677FF' : '#222222',
                                    cursor: 'pointer',
                                    lineHeight: 1.2,
                                    transition: 'color 0.25s ease, transform 0.2s ease',
                                }}
                                onMouseDown={(e) => {
                                    e.currentTarget.style.transform = 'scale(0.98)'
                                }}
                                onMouseUp={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)'
                                }}
                            >
                                {item.label}
                            </button>
                        )
                    })}
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <Select
                        value={statusFilter}
                        onChange={handleStatusChange}
                        style={{ width: 220 }}
                        options={[
                            { value: '', label: 'All Status' },
                            { value: 'approved', label: 'Approved' },
                            { value: 'pending', label: 'Pending' },
                            { value: 'rejected', label: 'Rejected' },
                        ]}
                    />

                    <div
                        style={{
                            position: 'relative',
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            alignItems: 'center',
                            padding: 4,
                            borderRadius: 16,
                            background: '#F3F4F6',
                            gap: 4,
                            width: 'fit-content',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: 4,
                                left: viewMode === 'table' ? 4 : 'calc(50% + 2px)',
                                width: 'calc(50% - 6px)',
                                height: 'calc(100% - 8px)',
                                borderRadius: 12,
                                background: '#1677FF',
                                boxShadow: '0 6px 18px rgba(22,119,255,0.25)',
                                transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
                                pointerEvents: 'none',
                            }}
                        />

                        <Button
                            type="text"
                            icon={<TableOutlined />}
                            onClick={() => setViewMode('table')}
                            style={{
                                position: 'relative',
                                zIndex: 1,
                                height: 28,
                                minWidth: 80,
                                borderRadius: 12,
                                color: viewMode === 'table' ? '#FFFFFF' : '#6B7280',
                                background: 'transparent',
                                boxShadow: 'none',
                                fontWeight: 500,
                                transition: 'color 0.5s ease',
                            }}
                        >
                            Table
                        </Button>

                        <Button
                            type="text"
                            icon={<AppstoreOutlined />}
                            onClick={() => setViewMode('grid')}
                            style={{
                                position: 'relative',
                                zIndex: 1,
                                height: 28,
                                minWidth: 80,
                                borderRadius: 12,
                                color: viewMode === 'grid' ? '#FFFFFF' : '#6B7280',
                                background: 'transparent',
                                boxShadow: 'none',
                                fontWeight: 500,
                                transition: 'color 0.25s ease',
                            }}
                        >
                            Grid
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-3">
                    <SummaryCard title="All Request" value={summary.all} />
                    <SummaryCard title="Approved" value={summary.approved} />
                    <SummaryCard title="Pending" value={summary.pending} />
                    <SummaryCard title="Rejected" value={summary.rejected} />
                </div>

                <TableHeader total={tableData?.length || 0} label="Total Amount">
                    <div className="relative min-h-[300px]">
                        {loading ? (
                            <div className="flex min-h-[300px] items-center justify-center">
                                <Spin size="large" />
                            </div>
                        ) : tableData?.length === 0 ? (
                            <div className="py-14">
                                <Empty description={emptyTextMap[activeTab]} />
                            </div>
                        ) : viewMode === 'table' ? (
                            <RequestList
                                data={paginatedData}
                                access_token={access_token}
                                pagination={tablePagination}
                                onView={handleOpenView}
                                onApprove={handleOpenApprove}
                                onReject={handleOpenReject}
                            />
                        ) : (
                            <RequestGrid
                                data={paginatedData}
                                access_token={access_token}
                                pagination={tablePagination}
                                onView={handleOpenView}
                                onApprove={handleOpenApprove}
                                onReject={handleOpenReject}
                            />
                        )}
                    </div>
                </TableHeader>
            </div>

            <ViewRequestModal
                open={openView}
                data={selected}
                onCancel={() => setOpenView(false)}
                onApprove={(item) => {
                    setSelected(item)
                    setOpenView(false)
                    setOpenApprove(true)
                }}
                onReject={(item) => {
                    setSelected(item)
                    setOpenView(false)
                    setOpenReject(true)
                }}
            />

            <ApproveModal
                open={openApprove}
                data={selected}
                onCancel={() => setOpenApprove(false)}
                onSubmit={handleApproveRequest}
            />

            <RejectModal
                open={openReject}
                data={selected}
                onCancel={() => setOpenReject(false)}
                onSubmit={handleRejectRequest}
            />
        </>
    )
}

export default TabCreatorRequestUserProfile