import React, {
    useContext,
    useEffect,
    useMemo,
    useState,
    useCallback,
    useRef,
    startTransition,
} from 'react'
import { Card, Pagination, Row, Col, Table, Space, Empty } from 'antd'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../../../../../contexts/AuthContext'
import { PERMS } from '../../../../../../constants/permission/perms'
import SearchAction from '../../../../../../components/Filter/Post/FilterBanner'

import { useUserProfileExtraStore } from '../../../../../../Stores/MobilesApp/User/userProfile.store'
import { getMomentColumns } from '../../../../../../components/post/moment/function/_moment.columns'
import { MomentCardItem } from '../../../../../../components/post/moment/function/_moment.card'
import TableHeader from '../../../../../../widgets/TableHeader'
import ImageLoading from '../../../../../../components/Loading/ImageLoading'
import PostDashboard from '../../../../../../components/MobileApp/UserManagement/Users/userProfile/tabs/Posts/Dashboard'
import {
    MOMENT_STATUS_KEYS,
    MomentStatusTabs,
    getMomentBackendStatus,
} from '../../../../../../components/post/moment/function/_moment.shared'

const MOMENT_POST_VIEW_MODE_KEY = 'moment_post_view_mode'

const MomentAsPost = (props) => {
    const {
        userId,
        accessToken,
        open,
        setOpen,
        username,
        buildStatus,
        onAddMention,
        onHide,
        onActive,
        onApprove,
        onDelete,
    } = props

    const { access_token, checkPermission } = useContext(AuthContext)
    const finalAccessToken = accessToken || access_token
    const navigate = useNavigate()

    const list = useUserProfileExtraStore((s) => s.moments.list)
    const total = useUserProfileExtraStore((s) => s.moments.total)
    const loading = useUserProfileExtraStore((s) => s.moments.loading)
    const fetchUserMoments = useUserProfileExtraStore((s) => s.fetchUserMoments)
    const summaryStatus = useUserProfileExtraStore((s) => s.moments.statusCounts)
    const dashboardStats = useUserProfileExtraStore((s) => s.moments.dashboardStats)

    const [openEdit, setOpenEdit] = useState(false)
    const [propData, setPropData] = useState()

    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem(MOMENT_POST_VIEW_MODE_KEY) || 'table'
    })

    const [searchValue, setSearchValue] = useState('')
    const [filterStatus, setFilterStatus] = useState(MOMENT_STATUS_KEYS.ACTIVE)
    const [filterCreatedBy, setFilterCreatedBy] = useState('all')
    const [filterMomentType, setFilterMomentType] = useState('all')
    const [dateRange, setDateRange] = useState([])

    const lastReqKeyRef = useRef('')
    const debounceRef = useRef(null)

    useEffect(() => {
        if (!checkPermission(PERMS.MOMENT_MANAGEMENT)) {
            navigate('/', { replace: true })
        }
    }, [checkPermission, navigate])

    useEffect(() => {
        localStorage.setItem(MOMENT_POST_VIEW_MODE_KEY, viewMode)
    }, [viewMode])

    const backendStatus = useMemo(() => {
        return getMomentBackendStatus(filterStatus)
    }, [filterStatus])

    const backendMomentType = useMemo(() => {
        if (filterMomentType === 'post') return 'PhotoPost'
        if (filterMomentType === 'video') return 'VideoPost'
        return null
    }, [filterMomentType])

    const fetchMomentPosts = useCallback(
        async (page = 1, size = 10, force = false) => {
            if (!finalAccessToken || !userId) return

            const params = {
                access_token: finalAccessToken,
                userId,
                page,
                size,
                search: searchValue,
                status: buildStatus ? buildStatus(backendStatus) : backendStatus,
                createdBy: filterCreatedBy,
                type: backendMomentType,
                dateRange,
            }

            const key = JSON.stringify(params)

            if (!force && lastReqKeyRef.current === key) return
            lastReqKeyRef.current = key

            await fetchUserMoments(params)
        },
        [
            finalAccessToken,
            userId,
            searchValue,
            backendStatus,
            filterCreatedBy,
            backendMomentType,
            dateRange,
            buildStatus,
            fetchUserMoments,
        ]
    )

    useEffect(() => {
        if (!finalAccessToken || !userId) return

        const key = JSON.stringify({
            userId,
            page: currentPage,
            size: pageSize,
            searchValue,
            backendStatus,
            filterCreatedBy,
            backendMomentType,
            dateRange,
        })

        if (lastReqKeyRef.current === key) return

        if (debounceRef.current) clearTimeout(debounceRef.current)

        debounceRef.current = setTimeout(() => {
            fetchMomentPosts(currentPage, pageSize)
        }, 200)

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [
        finalAccessToken,
        userId,
        currentPage,
        pageSize,
        searchValue,
        backendStatus,
        filterCreatedBy,
        backendMomentType,
        dateRange,
        fetchMomentPosts,
    ])

    if (!checkPermission(PERMS.MOMENT_MANAGEMENT)) return null

    const handleEdit = (record) => {
        setOpenEdit(true)
        setPropData(record)
    }

    const handleView = (record) => {
        navigate('/moment/post/detail/' + record._id)
    }

    const handleTabChange = useCallback((key) => {
        startTransition(() => {
            setCurrentPage(1)
            setFilterStatus(key)
        })
    }, [])

    const columns = useMemo(
        () =>
            getMomentColumns({
                currentPage,
                pageSize,
                filterStatus,
                checkPermission,
                onView: handleView,
                onEdit: handleEdit,
                onDelete: onDelete,
                onAddMention: onAddMention,
                onHide: onHide,
                onActive: onActive,
                onApprove: onApprove,
            }),
        [
            currentPage,
            pageSize,
            filterStatus,
            checkPermission,
            onAddMention,
            onHide,
            onActive,
            onApprove,
            onDelete,
        ]
    )

    const onSwitchView = (value) => setViewMode(value)

    const paginationProps = {
        current: currentPage,
        pageSize,
        total,
        onChange: (page, size) => {
            setCurrentPage(page)
            setPageSize(size)
        },
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
    }

    const isEmpty = !loading && (!list || list.length === 0)

    return (
        <>
            <Card className="my-2 p-0" style={{ width: '100%' }} styles={{ body: { padding: '12px' } }}>
                <SearchAction
                    isShowStatus={true}
                    searchFrom='user_profile'
                    searchName='moments...'
                    viewMode={viewMode}
                    onSwitchView={onSwitchView}
                    reOrder={false}
                    onSearchChange={(v) => {
                        startTransition(() => {
                            setCurrentPage(1)
                            setSearchValue(v || '')
                        })
                    }}
                    onStatusChange={(v) => {
                        startTransition(() => {
                            setCurrentPage(1)
                            setFilterStatus(v || 'all')
                        })
                    }}
                    onCreatedByChange={(v) => {
                        startTransition(() => {
                            setCurrentPage(1)
                            setFilterCreatedBy(v || 'all')
                        })
                    }}
                    onDateRangeChange={(v) => {
                        startTransition(() => {
                            setCurrentPage(1)
                            setDateRange(v || [])
                        })
                    }}
                    onMomentTypeChange={(v) => {
                        startTransition(() => {
                            setCurrentPage(1)
                            setFilterMomentType(v || 'all')
                        })
                    }}
                />
            </Card>

            <div className='mb-2'>
                <PostDashboard stats={dashboardStats} />
            </div>

            <TableHeader
                extra={
                    <Space size={6} style={{ lineHeight: 1, flexWrap: 'wrap' }}>
                        <span className="text-sm font-semibold dark:text-slate-400 text-blue-700">
                            {total || 0}
                        </span>
                        <span className="text-sm text-gray-400 dark:text-slate-400 font-bold">| </span>
                        <span className="ml-3 inline-flex items-center text-gray-400 dark:text-slate-400 font-bold">
                            Total Amount
                        </span>
                    </Space>
                }
                specialKey={true}
                tabsHeader={
                    <MomentStatusTabs
                        activeKey={filterStatus}
                        onChange={handleTabChange}
                        counts={{
                            active: summaryStatus?.active || 0,
                            under_review: summaryStatus?.under_review || 0,
                            hide: summaryStatus?.hide || 0,
                        }}
                    />
                }
            >
                <div style={{ position: 'relative', minHeight: 220 }}>
                    {loading && (
                        <div
                            style={{
                                position: 'absolute',
                                inset: 0,
                                zIndex: 10,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                background: 'rgba(255,255,255,0.6)',
                            }}
                        >
                            <ImageLoading overlay={false} size={60} logoSize={25} />
                        </div>
                    )}

                    {isEmpty ? (
                        <div
                            style={{
                                minHeight: 220,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '24px 12px',
                            }}
                        >
                            <Empty description={`No ${filterStatus === 'under_review' ? 'under review' : filterStatus} posts`} />
                        </div>
                    ) : viewMode === 'table' ? (
                        <Table
                            columns={columns}
                            dataSource={list}
                            bordered={false}
                            size="small"
                            loading={false}
                            pagination={false}
                            scroll={{ x: 'max-content' }}
                            className="custom-table-category"
                            rowKey="_id"
                        />
                    ) : (
                        <Row gutter={[8, 8]}>
                            {list.map((item, index) => (
                                <Col
                                    key={item._id || index}
                                    xs={24}
                                    sm={12}
                                    md={12}
                                    lg={8}
                                    xl={6}
                                    xxl={6}
                                    style={{ display: 'flex' }}
                                >
                                    <MomentCardItem
                                        onAddMention={onAddMention}
                                        item={item}
                                        index={index}
                                        onView={handleView}
                                        onEdit={handleEdit}
                                        onDelete={onDelete}
                                        onHide={onHide}
                                        onActive={onActive}
                                        onApprove={onApprove}
                                    />
                                </Col>
                            ))}
                        </Row>
                    )}

                    {!isEmpty && (
                        <div className="mt-4 flex items-center justify-end">
                            <Pagination {...paginationProps} />
                        </div>
                    )}
                </div>
            </TableHeader>
        </>
    )
}

export default MomentAsPost