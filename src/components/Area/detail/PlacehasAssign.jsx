import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import {
    Avatar,
    Button,
    Card,
    Dropdown,
    Input,
    Select,
    Space,
    Table,
    Tag,
    Typography,
    Row,
    Col,
} from 'antd'
import {
    PlusOutlined,
    SearchOutlined,
    MoreOutlined,
    DeleteOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'

import AddPlacesToAreaModal from '../add/AssignPlaceToArea'
import { usePlacesStore } from '../../../Stores/PlaceStore/PlaceStore'
import { useAreasStore } from '../../../Stores/Area/area.store'

const { Text } = Typography
const safeText = (v) => (v == null ? '' : String(v))

const statusTag = (status) => {
    const s = safeText(status).toLowerCase()
    if (s === 'pending') return <Tag color="orange">Pending</Tag>
    if (s === 'active') return <Tag color="green">Active</Tag>
    if (s === 'inactive') return <Tag>Inactive</Tag>
    if (s === 'rejected') return <Tag color="red">Rejected</Tag>
    return <Tag>{safeText(status) || '-'}</Tag>
}

const fmtDate = (d) => {
    if (!d) return '-'
    const dd = dayjs(d)
    return dd.isValid() ? dd.format('YYYY-MM-DD') : safeText(d)
}

const joinNames = (arr) =>
    Array.isArray(arr) && arr.length
        ? arr
            .map((x) => x?.nameEn || x?.nameKh)
            .filter(Boolean)
            .join(', ') || '-'
        : '-'

export default function AreaPlacesList({
    areaName = 'Area',
    access_token,
    areaId,

    places = [],
    loading = false,

    onAddPlaces,
    onRemovePlace,
    useConfirm = true,
    provinceId,
}) {
    const [q, setQ] = useState('')
    const [categoryId, setCategoryId] = useState('all')
    const [status, setStatus] = useState('all')
    const [openAddPlaces, setOpenAddPlaces] = useState(false)

    //  pagination
    const [pageTable, setPageTable] = useState(1)
    const [pageSizeTable, setPageSizeTable] = useState(10)

    const {
        fetchPlaces,
        placesList = [],
        loading: loadingAssignable,
        pagination,
    } = usePlacesStore()

    const { assignPlacesToArea, removePlacesFromArea, saving } = useAreasStore()

    //  responsive viewport height (for table scroll height)
    const [vh, setVh] = useState(() =>
        typeof window !== 'undefined' ? window.innerHeight : 900
    )
    useEffect(() => {
        const onResize = () => setVh(window.innerHeight)
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    //  close modal after assign finished
    const prevSavingRef = useRef(false)
    useEffect(() => {
        if (prevSavingRef.current && !saving) setOpenAddPlaces(false)
        prevSavingRef.current = saving
    }, [saving])

    //  build filter options from assigned list
    const categoryOptions = useMemo(() => {
        const map = new Map()
            ; (places || []).forEach((p) => {
                const c = p?.category
                const id = c?.id || c?._id
                if (id) map.set(id, c?.nameEn || c?.nameKh || 'Category')
            })
        return [
            { value: 'all', label: 'All Categories' },
            ...Array.from(map.entries()).map(([value, label]) => ({ value, label })),
        ]
    }, [places])

    const statusOptions = useMemo(() => {
        const set = new Set()
            ; (places || []).forEach((p) => p?.status && set.add(p.status))
        return [
            { value: 'all', label: 'All Statuses' },
            ...Array.from(set.values()).map((s) => ({ value: s, label: s })),
        ]
    }, [places])

    //  filter assigned list
    const filtered = useMemo(() => {
        const qq = safeText(q).trim().toLowerCase()
        return (places || []).filter((p) => {
            const placeId = safeText(p?.placeId).toLowerCase()

            const nameEn = safeText(p?.propertyProfile?.nameEn || p?.nameEn).toLowerCase()
            const nameKh = safeText(p?.propertyProfile?.nameKh || p?.nameKh).toLowerCase()

            const cat = p?.category || p?.mainCategory
            const catEn = safeText(cat?.nameEn).toLowerCase()
            const catKh = safeText(cat?.nameKh).toLowerCase()

            const matchesSearch =
                !qq ||
                placeId.includes(qq) ||
                nameEn.includes(qq) ||
                nameKh.includes(qq) ||
                catEn.includes(qq) ||
                catKh.includes(qq)

            const matchesCategory =
                categoryId === 'all'
                    ? true
                    : safeText(cat?.id || cat?._id) === safeText(categoryId)

            const matchesStatus =
                status === 'all'
                    ? true
                    : safeText(p?.status).toLowerCase() === safeText(status).toLowerCase()

            return matchesSearch && matchesCategory && matchesStatus
        })
    }, [places, q, categoryId, status])

    //  reset page when filter changes
    useEffect(() => setPageTable(1), [q, categoryId, status])

    const handleRemove = async (row) => {
        try {
            if (useConfirm) {
                const res = await Swal.fire({
                    icon: 'warning',
                    title: 'Remove from Area?',
                    text: `Remove ${row?.placeId || 'this place'} from ${areaName}?`,
                    showCancelButton: true,
                    confirmButtonText: 'Remove',
                    cancelButtonText: 'Cancel',
                    confirmButtonColor: '#d33',
                })
                if (!res.isConfirmed) return
            }

            if (onRemovePlace) return await onRemovePlace(row)

            const pid = row?.propertyProfile?.id
            if (!pid || !access_token || !areaId) return

            await removePlacesFromArea(access_token, areaId, [pid])
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text:
                    e?.response?.data?.message ||
                    e?.response?.data?.error ||
                    e?.message ||
                    'Remove failed',
            })
        }
    }

    //  columns
    const columns = useMemo(() => {
        return [
            {
                title: '',
                key: 'actions',
                width: 44,
                fixed: 'left',
                render: (_, record) => {
                    const items = [
                        {
                            key: 'remove',
                            label: (
                                <span style={{ color: '#cf1322', fontWeight: 600 }}>
                                    Remove from Area
                                </span>
                            ),
                            icon: <DeleteOutlined style={{ color: '#cf1322' }} />,
                            onClick: () => handleRemove(record),
                        },
                    ]
                    return (
                        <Dropdown trigger={['click']} menu={{ items }} placement="bottomLeft">
                            <Button type="text" icon={<MoreOutlined />} style={{ padding: 0, width: 32 }} />
                        </Dropdown>
                    )
                },
            },
            {
                title: 'No',
                key: 'no',
                width: 70,
                render: (_, __, index) => (
                    <Text className='dark:text-[#64748b]'>{(pageTable - 1) * pageSizeTable + index + 1}</Text>
                ),
            },
            {
                title: 'Place ID',
                dataIndex: 'placeId',
                key: 'placeId',
                width: 120,
                render: (v) => (
                    <a style={{ fontWeight: 600 }} href="#!" onClick={(e) => e.preventDefault()}>
                        {v || '-'}
                    </a>
                ),
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                width: 120,
                render: (v) => statusTag(v),
            },
            {
                title: 'Property Profile',
                key: 'propertyProfile',
                width: 340,
                render: (_, record) => {
                    const img = record?.propertyProfile?.image || record?.media?.image?.[0]
                    const nEn = record?.propertyProfile?.nameEn || record?.nameEn
                    const nKh = record?.propertyProfile?.nameKh || record?.nameKh
                    return (
                        <Space align="start">
                            <Avatar
                                shape="square"
                                size={40}
                                src={img}
                                style={{ borderRadius: 8, background: '#f3f4f6' }}
                            />
                            <div style={{ lineHeight: 1.2 }}>
                                <div>
                                    <a style={{ fontWeight: 700 }} href="#!" onClick={(e) => e.preventDefault()}>
                                        {nEn || '-'}
                                    </a>
                                </div>
                                <Text type="secondary" className='dark:text-[#64748b]'>{nKh || ''}</Text>
                            </div>
                        </Space>
                    )
                },
            },
            {
                title: 'Ownership',
                dataIndex: 'ownership',
                key: 'ownership',
                width: 130,
                render: (v) => v || '-',
            },
            {
                title: 'Category',
                key: 'category',
                width: 160,
                render: (_, r) => {
                    const c = r?.category || r?.mainCategory
                    return c?.nameEn || c?.nameKh || '-'
                },
            },
            {
                title: 'Sub Category',
                key: 'subCategory',
                width: 180,
                render: (_, r) => joinNames(r?.subCategory),
            },
            {
                title: 'Type Of Place',
                key: 'typeOfPlace',
                width: 180,
                render: (_, r) => joinNames(r?.typeOfPlace),
            },
            {
                title: 'City/Province',
                key: 'city',
                width: 160,
                render: (_, r) =>
                    r?.city?.nameEn ||
                    r?.city?.nameKh ||
                    r?.address?.location?.provinceEn ||
                    r?.address?.location?.provinceKh ||
                    '-',
            },
            {
                title: 'District/Khan',
                key: 'district',
                width: 160,
                render: (_, r) =>
                    r?.district?.nameEn ||
                    r?.district?.nameKh ||
                    r?.address?.location?.districtEn ||
                    r?.address?.location?.districtKh ||
                    '-',
            },
            {
                title: 'Commune/Sangkat',
                key: 'commune',
                width: 180,
                render: (_, r) =>
                    r?.commune?.nameEn ||
                    r?.commune?.nameKh ||
                    r?.address?.location?.communeEn ||
                    r?.address?.location?.communeKh ||
                    '-',
            },
            {
                title: 'Updated By',
                dataIndex: 'updatedBy',
                key: 'updatedBy',
                width: 140,
                render: (v) => v || '-',
            },
            {
                title: 'Created By',
                dataIndex: 'createdBy',
                key: 'createdBy',
                width: 140,
                render: (v) => v || '-',
            },
            {
                title: 'Created At',
                dataIndex: 'createdAt',
                key: 'createdAt',
                width: 120,
                render: (v) => fmtDate(v),
            },
        ]
    }, [areaName, pageTable, pageSizeTable, access_token, areaId])

    const handleOpenAdd = () => {
        onAddPlaces?.()
        setOpenAddPlaces(true)
    }

    const handleSubmitAddPlaces = async (placeIds) => {
        if (!access_token || !areaId) return
        await assignPlacesToArea(access_token, areaId, placeIds)
    }

    //  onFetch MUST return array
    const onFetch = useCallback(
        async (filters) => {
            const list = await fetchPlaces(access_token, filters)
            return Array.isArray(list) ? list : []
        },
        [fetchPlaces, access_token]
    )

    /**
     *  KEY PART:
     * - If filtered.length <= pageSizeTable (ex: 6 rows) -> NO scroll.y (auto height)
     * - If filtered.length > pageSizeTable (ex: 30 rows) -> scroll.y responsive
     */
    const tableScrollY = useMemo(() => {
        const needScroll = filtered.length > pageSizeTable
        if (!needScroll) return undefined

        // responsive height: keep within a nice range
        const y = vh - 420 // adjust offset if your layout changes
        return Math.max(260, Math.min(560, y))
    }, [filtered.length, pageSizeTable, vh])

    return (
        <Card
            style={{
                borderRadius: 12,
                //  maxHeight responsive but NOT forced height (so 4/6 rows won't create empty space)
                maxHeight: 'calc(100vh - 180px)',
                overflow: 'hidden',
            }}
        >
            <AddPlacesToAreaModal
                open={openAddPlaces}
                setOpen={setOpenAddPlaces}
                areaName={areaName}
                places={placesList}
                loading={loadingAssignable}
                pagination={pagination}
                onFetch={onFetch}
                onSubmit={handleSubmitAddPlaces}
                provinceId={provinceId}
            />

            <div className="flex items-center justify-between">
                <Text strong style={{ fontSize: 16 }} className='dark:text-slate-400'>
                    Places in {areaName} ({filtered.length})
                </Text>

                <Button icon={<PlusOutlined />} onClick={handleOpenAdd}>
                    Add Places
                </Button>
            </div>

            <div style={{ marginTop: 12 }}>
                <Row gutter={[12, 12]} align="middle">
                    <Col xs={24} md={14} lg={16} xl={18}>
                        <Input
                            prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                            placeholder="Search places..."
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            style={{ width: '100%' }}
                            allowClear
                        />
                    </Col>

                    <Col xs={24} sm={12} md={5} lg={4} xl={3}>
                        <Select
                            value={categoryId}
                            onChange={setCategoryId}
                            options={categoryOptions}
                            style={{ width: '100%' }}
                        />
                    </Col>

                    <Col xs={24} sm={12} md={5} lg={4} xl={3}>
                        <Select
                            value={status}
                            onChange={setStatus}
                            options={statusOptions}
                            style={{ width: '100%' }}
                        />
                    </Col>
                </Row>
            </div>

            <div style={{ marginTop: 12 }} >
                <Table
                    rowKey={(r) => r?.placeId || r?._id}
                    columns={columns}
                    dataSource={filtered}
                    loading={loading}
                    size="small"
                    scroll={{
                        x: 'max-content',
                        ...(tableScrollY ? { y: tableScrollY } : {}), //  only add y when needed
                    }}
                    pagination={{
                        current: pageTable,
                        pageSize: pageSizeTable, //  default 10
                        showSizeChanger: true,
                        pageSizeOptions: ['10', '20', '50', '100'],
                        position: ['bottomRight'],
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                        onChange: (p, ps) => {
                            setPageTable(p)
                            setPageSizeTable(ps)
                        },
                    }}
                />
            </div>
        </Card>
    )
}
