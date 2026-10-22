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

import { AuthContext } from '../../../../contexts/AuthContext'
import { PERMS } from '../../../../constants/permission/perms'

import StatusCardAction from '../../../../components/Dashboard/StatusCard'
import SearchAction from '../../../../components/Filter/Post/FilterBanner'

import AddPost from './addEdit/Add'
import EditPost from './addEdit/Edit'

import helpFunctions from '../../../../utils/helpFunctions'
import { useMomentStore } from '../../../../Stores/Post/Moment.store'

import { buildMomentFilterDoc } from '../../../../components/post/moment/function/_moment.helpers'
import { getMomentVideoColumns } from '../../../../components/post/moment/function/_moment.columns'
import { MomentVideoCardItem } from '../../../../components/post/moment/function/_moment.card'
import TableHeader from '../../../../widgets/TableHeader'
import ImageLoading from '../../../../components/Loading/ImageLoading'

import {
    MOMENT_STATUS_KEYS,
    MomentStatusTabs,
    getMomentBackendStatus,
} from '../../../../components/post/moment/function/_moment.shared'

const fallbackImages = []
const MOMENT_VIDEO_VIEW_MODE_KEY = 'moment_video_view_mode'

const MomentAsVideo = (props) => {
    const { open, setOpen, username, buildStatus, onAddMention, onApprove, onDelete, onHide, onActive } = props
    const { access_token, checkPermission } = useContext(AuthContext)
    const { getFileImage } = helpFunctions
    const navigate = useNavigate()

    const list = useMomentStore((s) => s.listVideo)
    const total = useMomentStore((s) => s.totalVideo)
    const loading = useMomentStore((s) => s.loading.list)
    const ListMoment = useMomentStore((s) => s.ListMoment)
    const summaryStatus = useMomentStore((s) => s.summaryVideo)

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
        return localStorage.getItem(MOMENT_VIDEO_VIEW_MODE_KEY) || 'table'
    })

    const [searchValue, setSearchValue] = useState('')
    const [filterStatus, setFilterStatus] = useState(MOMENT_STATUS_KEYS.ACTIVE)
    const [filterCreatedBy, setFilterCreatedBy] = useState('all')
    const [dateRange, setDateRange] = useState([])

    useEffect(() => {
        localStorage.setItem(MOMENT_VIDEO_VIEW_MODE_KEY, viewMode)
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

    const lastReqKeyRef = useRef(null)
    const debounceRef = useRef(null)

    const fetchMomentVideos = useCallback(
        async (page = 1, limit = 10, force = false) => {
            if (!access_token) return

            const doc = { ...baseFilterDoc, page, limit, type: 'VideoPost' }
            const key = JSON.stringify(doc)

            if (!force && lastReqKeyRef.current === key) return
            lastReqKeyRef.current = key

            await ListMoment({ access_token, doc })
        },
        [ListMoment, access_token, baseFilterDoc]
    )

    useEffect(() => {
        if (!access_token) return

        const doc = { ...baseFilterDoc, page: currentPage, limit: pageSize, type: 'VideoPost' }
        const key = JSON.stringify(doc)

        if (lastReqKeyRef.current === key) return

        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            fetchMomentVideos(currentPage, pageSize)
        }, 200)

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [access_token, currentPage, pageSize, baseFilterDoc, fetchMomentVideos])

    const handleView = (record) => {
        startTransition(() => {
            navigate(`/moment/video/detail/${record._id}`, { state: { record } })
        })
    }

    const handleEdit = (record) => {
        startTransition(() => {
            setPropData(record)
            setOpenEdit(true)
        })
    }

    const getCoverSrc = useCallback(
        (record, index) => {
            return (
                record?.cover?.url ||
                (record?.cover?.key ? getFileImage('/' + record.cover.key) : undefined) ||
                fallbackImages[index % (fallbackImages.length || 1)]
            )
        },
        [getFileImage]
    )

    const columns = useMemo(
        () =>
            getMomentVideoColumns({
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

    const onSwitchView = (value) => setViewMode(value)

    const handleTabChange = useCallback((key) => {
        startTransition(() => {
            setCurrentPage(1)
            setFilterStatus(key)
        })
    }, [])

    const isEmpty = !loading && (!list || list.length === 0)

    const emptyDescription =
        filterStatus === MOMENT_STATUS_KEYS.ACTIVE
            ? 'No active videos'
            : filterStatus === MOMENT_STATUS_KEYS.UNDER_REVIEW
                ? 'No videos under review'
                : filterStatus === MOMENT_STATUS_KEYS.HIDE
                    ? 'No hidden videos'
                    : 'No videos found'

    return (
        <>
            {open ? (
                <AddPost
                    open={open}
                    setOpen={setOpen}
                    fetchMomentVideos={fetchMomentVideos}
                    username={username}
                />
            ) : null}

            {openEdit ? (
                <EditPost
                    open={openEdit}
                    setOpen={setOpenEdit}
                    propsData={propData}
                    fetchMomentVideos={fetchMomentVideos}
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
                specialKey={true}
                tabsHeader={
                    <MomentStatusTabs
                        activeKey={filterStatus}
                        onChange={handleTabChange}
                    />
                }
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
                            <Empty description={emptyDescription} />
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
                                    <MomentVideoCardItem
                                        item={item}
                                        index={index}
                                        filterStatus={filterStatus}
                                        getCoverSrc={getCoverSrc}
                                        onView={handleView}
                                        onEdit={handleEdit}
                                        onDelete={onDelete}
                                        onApprove={onApprove}
                                        onAddMention={onAddMention}
                                        onHide={onHide}
                                        onActive={onActive}
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

export default MomentAsVideo