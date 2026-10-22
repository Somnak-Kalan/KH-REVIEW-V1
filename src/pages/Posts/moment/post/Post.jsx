import React, {
    useContext,
    useEffect,
    useMemo,
    useState,
    useCallback,
    useRef,
    startTransition,
} from 'react'
import { Card, Pagination, Row, Col, Table, Space, Typography, Empty } from 'antd'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../../../contexts/AuthContext'
import { PERMS } from '../../../../constants/permission/perms'
const { Text } = Typography
import StatusCardAction from '../../../../components/Dashboard/StatusCard'
import SearchAction from '../../../../components/Filter/Post/FilterBanner'

import AddPost from './addEdit/Add'
import EditPost from './addEdit/Edit'

import { useMomentStore } from '../../../../Stores/Post/Moment.store'
import { buildMomentFilterDoc } from '../../../../components/post/moment/function/_moment.helpers'
import { getMomentColumns } from '../../../../components/post/moment/function/_moment.columns'
import { MomentCardItem } from '../../../../components/post/moment/function/_moment.card'
import TableHeader from '../../../../widgets/TableHeader'
import ImageLoading from '../../../../components/Loading/ImageLoading'
import {
    MOMENT_STATUS_KEYS,
    MomentStatusTabs,
    getMomentBackendStatus,
} from '../../../../components/post/moment/function/_moment.shared'

const MOMENT_POST_VIEW_MODE_KEY = 'moment_post_view_mode'

const MomentAsPost = (props) => {
    const { open, setOpen, username, buildStatus, onAddMention, onHide, onActive, onApprove, onDelete } = props
    const { access_token, checkPermission } = useContext(AuthContext)
    const navigate = useNavigate()

    const list = useMomentStore((s) => s.listPost)
    const total = useMomentStore((s) => s.totalPost)
    const loading = useMomentStore((s) => s.loading.list)
    const ListMoment = useMomentStore((s) => s.ListMoment)
    const summaryStatus = useMomentStore((s) => s.summaryPost)

    useEffect(() => {
        if (!checkPermission(PERMS.MOMENT_MANAGEMENT)) {
            navigate('/', { replace: true })
        }
    }, [checkPermission, navigate])

    if (!checkPermission(PERMS.MOMENT_MANAGEMENT)) return null

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
    const [dateRange, setDateRange] = useState([])

    useEffect(() => {
        localStorage.setItem(MOMENT_POST_VIEW_MODE_KEY, viewMode)
    }, [viewMode])

    const backendStatus = useMemo(() => {
        return getMomentBackendStatus(filterStatus)
    }, [filterStatus])

    const baseFilterDoc = useMemo(() => {
        return buildMomentFilterDoc({
            page: 1,
            limit: pageSize,
            searchValue,
            filterStatus: buildStatus(backendStatus),
            filterCreatedBy,
            dateRange,
        })
    }, [pageSize, searchValue, backendStatus, filterCreatedBy, dateRange])

    const lastReqKeyRef = useRef('')
    const debounceRef = useRef(null)

    const fetchMomentPosts = useCallback(
        async (page = 1, limit = 10, force = false) => {
            if (!access_token) return

            const doc = {
                ...baseFilterDoc,
                page,
                limit,
                type: 'PhotoPost',
            }

            const key = JSON.stringify(doc)

            if (!force && lastReqKeyRef.current === key) return
            lastReqKeyRef.current = key

            await ListMoment({
                access_token,
                doc,
            })
        },
        [ListMoment, access_token, baseFilterDoc]
    )

    useEffect(() => {
        if (!access_token) return

        const doc = {
            ...baseFilterDoc,
            page: currentPage,
            limit: pageSize,
            type: 'PhotoPost',
        }

        const key = JSON.stringify(doc)

        if (lastReqKeyRef.current === key) return

        if (debounceRef.current) clearTimeout(debounceRef.current)

        debounceRef.current = setTimeout(() => {
            fetchMomentPosts(currentPage, pageSize)
        }, 200)

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [access_token, currentPage, pageSize, baseFilterDoc, fetchMomentPosts])

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
        [currentPage, pageSize, filterStatus, checkPermission, onAddMention, onHide, onActive, onApprove, onDelete]
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
            {open ? (
                <AddPost
                    open={open}
                    setOpen={setOpen}
                    fetchMomentPosts={fetchMomentPosts}
                    username={username}
                />
            ) : null}

            {openEdit ? (
                <EditPost
                    open={openEdit}
                    setOpen={setOpenEdit}
                    propsData={propData}
                    fetchMomentPosts={fetchMomentPosts}
                    username={username}
                />
            ) : null}

            <StatusCardAction summaryStatus={summaryStatus} />

            <Card className="my-2 p-0" style={{ width: '100%' }} styles={{ body: { padding: '12px' } }}>
                <SearchAction
                    isShowStatus={true}
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
                />
            </Card>

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