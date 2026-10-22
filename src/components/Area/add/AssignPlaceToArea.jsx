import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import {
    Modal,
    Table,
    Typography,
    Input,
    Select,
    Row,
    Col,
    Space,
    Button,
    Avatar,
    Tag,
    Tooltip,
} from 'antd'
import { PlusOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons'

const { Text } = Typography
const safeText = (v) => (v == null ? '' : String(v))
const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

/**
 *  Normalize search text:
 * - lowercase
 * - remove spaces and ALL symbols
 * - keep ALL letters/numbers (English, Khmer, etc.)
 */
const normalizeForSearch = (input) => {
    const s = safeText(input).toLowerCase().normalize('NFKD')
    return (s.match(/[\p{L}\p{N}]+/gu) || []).join('')
}

const statusPill = (status) => {
    const s = safeText(status).toLowerCase()
    if (s === 'active')
        return (
            <Tag color="green" style={{ borderRadius: 999, padding: '4px 12px' }}>
                Active
            </Tag>
        )
    if (s === 'pending')
        return (
            <Tag color="orange" style={{ borderRadius: 999, padding: '4px 12px' }}>
                Pending
            </Tag>
        )
    if (s === 'inactive') return <Tag style={{ borderRadius: 999, padding: '4px 12px' }}>Inactive</Tag>
    if (s === 'rejected')
        return (
            <Tag color="red" style={{ borderRadius: 999, padding: '4px 12px' }}>
                Rejected
            </Tag>
        )
    return (
        <Tag style={{ borderRadius: 999, padding: '4px 12px' }}>
            {safeText(status) || '-'}
        </Tag>
    )
}

const fmtLocation = (p) => {
    const city =
        p?.city?.nameEn ||
        p?.city?.nameKh ||
        p?.cityEn ||
        p?.cityKh ||
        p?.address?.location?.provinceEn ||
        p?.address?.location?.provinceKh ||
        ''
    const dist =
        p?.district?.nameEn ||
        p?.district?.nameKh ||
        p?.districtEn ||
        p?.districtKh ||
        p?.address?.location?.districtEn ||
        p?.address?.location?.districtKh ||
        ''
    const parts = [city, dist].filter(Boolean)
    return parts.length ? parts.join(', ') : '-'
}

/**  key is ONLY _id */
const getRowKey = (r) => r?._id

export default function AddPlacesToAreaModal({
    open,
    setOpen,
    areaName = 'Area',

    places = [],
    loading = false,
    pagination = null,

    onFetch,
    provinceId,
    onSubmit,

    //  disable already-assigned
    areaId,
    disabledPlaceIds = [],
}) {
    const LIMIT = 10

    /**
     *  Search mode: API request ONLY ONE TIME per search
     * We request bigger limit once, then do normalized matching on client.
     */
    const SEARCH_LIMIT = 500 // adjust if you want (one request)

    const [q, setQ] = useState('')
    const [debouncedQ, setDebouncedQ] = useState('')
    const [categoryId, setCategoryId] = useState('all')

    const [page, setPage] = useState(1)
    const [hasNext, setHasNext] = useState(true)

    const [localRows, setLocalRows] = useState([])
    const [isSearchMode, setIsSearchMode] = useState(false)
    const [searchTruncated, setSearchTruncated] = useState(false)

    const [selectedRowKeys, setSelectedRowKeys] = useState([])
    const [selectedRowsMap, setSelectedRowsMap] = useState(new Map())
    const [submitting, setSubmitting] = useState(false)

    const wrapperRef = useRef(null)
    const loadingRef = useRef(false)

    //  set for fast checking
    const disabledPlaceIdSet = useMemo(() => {
        return new Set((disabledPlaceIds || []).map((x) => safeText(x)))
    }, [disabledPlaceIds])

    //  compute disabled row
    const getDisableInfo = useCallback(
        (record) => {
            const pid = safeText(record?.placeId)

            if (pid && disabledPlaceIdSet.has(pid)) {
                return { disabled: true, reason: 'Already added in this area' }
            }
            if (record?.areaId) {
                return { disabled: true, reason: 'Already assigned to an area' }
            }
            return { disabled: false, reason: '' }
        },
        [disabledPlaceIdSet]
    )

    //  viewport height
    const [vh, setVh] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 900))
    useEffect(() => {
        const onResize = () => setVh(window.innerHeight)
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    //  debounce search text
    useEffect(() => {
        const t = setTimeout(() => setDebouncedQ(q), 350)
        return () => clearTimeout(t)
    }, [q])

    //  reset on close
    useEffect(() => {
        if (!open) {
            setQ('')
            setDebouncedQ('')
            setCategoryId('all')
            setPage(1)
            setHasNext(true)
            setLocalRows([])
            setSelectedRowKeys([])
            setSelectedRowsMap(new Map())
            setSubmitting(false)
            setIsSearchMode(false)
            setSearchTruncated(false)
            loadingRef.current = false
        }
    }, [open])

    const clearSelection = useCallback(() => {
        setSelectedRowKeys([])
        setSelectedRowsMap(new Map())
    }, [])

    //  normal browsing (page by page)
    const fetchPage = useCallback(
        async (nextPage) => {
            if (!onFetch) return
            if (loadingRef.current) return
            if (nextPage < 1) return
            if (!hasNext && nextPage > page) return

            loadingRef.current = true
            try {
                const list = await onFetch({
                    page: nextPage,
                    limit: LIMIT,
                    search: '', // normal mode = no search
                    categoryId: categoryId === 'all' ? undefined : categoryId,
                    provinceId,
                })

                const arr = Array.isArray(list) ? list : []
                setLocalRows(arr)
                setPage(nextPage)
                setHasNext(arr.length >= LIMIT)
            } finally {
                loadingRef.current = false
            }
        },
        [onFetch, categoryId, provinceId, hasNext, page]
    )

    //  search mode: ONE API request only
    const fetchSearchOnce = useCallback(async () => {
        if (!onFetch) return
        if (loadingRef.current) return

        const raw = safeText(debouncedQ).trim()
        if (!raw) return

        const norm = normalizeForSearch(raw)

        loadingRef.current = true
        try {
            setIsSearchMode(true)
            setSearchTruncated(false)
            setPage(1)
            setHasNext(false)

            const list = await onFetch({
                page: 1,
                limit: SEARCH_LIMIT, //  one request with big limit
                search: raw, // send raw (backend can still search normally)
                // optional (safe): backend can use it if you implement later
                searchNormalized: norm,
                categoryId: categoryId === 'all' ? undefined : categoryId,
                provinceId,
            })

            const arr = Array.isArray(list) ? list : []
            setLocalRows(arr)
            setSearchTruncated(arr.length >= SEARCH_LIMIT)
        } finally {
            loadingRef.current = false
        }
    }, [onFetch, debouncedQ, categoryId, provinceId])

    //  open => load first page
    useEffect(() => {
        if (!open) return
        // initial normal browse load
        fetchPage(1)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open])

    //  when search/category changes
    useEffect(() => {
        if (!open) return

        clearSelection()

        const raw = safeText(debouncedQ).trim()
        if (raw) {
            fetchSearchOnce() //  ONE TIME
        } else {
            setIsSearchMode(false)
            setSearchTruncated(false)
            setHasNext(true)
            fetchPage(1)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedQ, categoryId, open])

    //  category options
    const categoryOptions = useMemo(() => {
        const map = new Map()
            ; (localRows || places || []).forEach((p) => {
                const c = p?.category || p?.mainCategory
                const id = c?.id || c?._id
                const name = c?.nameEn || c?.nameKh
                if (id) map.set(id, name || 'Category')
            })
        return [
            { value: 'all', label: 'All Categories' },
            ...Array.from(map.entries()).map(([value, label]) => ({ value, label })),
        ]
    }, [localRows, places])

    /**
     *  Client-side normalized match:
     * Even if user types "abc-123" or "abc 123", it matches.
     */
    const dataSource = useMemo(() => {
        const base = Array.isArray(localRows) ? localRows : []
        const qNorm = normalizeForSearch(debouncedQ)

        if (!qNorm && categoryId === 'all') return base

        return base.filter((p) => {
            const placeId = normalizeForSearch(p?.placeId)
            const nameEn = normalizeForSearch(p?.propertyProfile?.nameEn || p?.nameEn)
            const nameKh = normalizeForSearch(p?.propertyProfile?.nameKh || p?.nameKh)

            const c = p?.category || p?.mainCategory
            const catId = safeText(c?.id || c?._id)
            const catEn = normalizeForSearch(c?.nameEn)
            const catKh = normalizeForSearch(c?.nameKh)

            const matchesSearch =
                !qNorm ||
                placeId.includes(qNorm) ||
                nameEn.includes(qNorm) ||
                nameKh.includes(qNorm) ||
                catEn.includes(qNorm) ||
                catKh.includes(qNorm)

            const matchesCategory = categoryId === 'all' ? true : safeText(catId) === safeText(categoryId)

            return matchesSearch && matchesCategory
        })
    }, [localRows, debouncedQ, categoryId])

    const decoratedRows = useMemo(() => {
        return (dataSource || []).map((r) => {
            const info = getDisableInfo(r)
            return { ...r, __disabled: info.disabled, __disabledReason: info.reason }
        })
    }, [dataSource, getDisableInfo])

    const tableScrollY = useMemo(() => {
        const needFixed = decoratedRows.length >= LIMIT
        if (!needFixed) return undefined
        return clamp(vh - 420, 320, 560)
    }, [decoratedRows.length, vh])

    const columns = useMemo(
        () => [
            {
                title: 'No',
                key: 'no',
                width: 70,
                render: (_, __, index) => (
                    <Text>{isSearchMode ? index + 1 : (page - 1) * LIMIT + index + 1}</Text>
                ),
            },
            {
                title: 'Place ID',
                dataIndex: 'placeId',
                key: 'placeId',
                width: 170,
                render: (v, record) => (
                    <Space size={8}>
                        <a style={{ fontWeight: 700 }} href="#!" onClick={(e) => e.preventDefault()}>
                            {v || '-'}
                        </a>
                        {record.__disabled && (
                            <Tooltip title={record.__disabledReason}>
                                <Tag color="blue">Added</Tag>
                            </Tooltip>
                        )}
                    </Space>
                ),
            },
            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                width: 130,
                render: (v) => statusPill(v),
            },
            {
                title: 'Property Profile',
                key: 'propertyProfile',
                width: 420,
                render: (_, record) => {
                    const img = record?.propertyProfile?.image || record?.media?.image?.[0]
                    const nEn = record?.propertyProfile?.nameEn || record?.nameEn
                    const nKh = record?.propertyProfile?.nameKh || record?.nameKh
                    return (
                        <Space align="start" size={12}>
                            <Avatar
                                shape="square"
                                size={44}
                                src={img}
                                style={{ borderRadius: 10, background: '#f3f4f6' }}
                            />
                            <div style={{ lineHeight: 1.2 }}>
                                <div>
                                    <a style={{ fontWeight: 800 }} href="#!" onClick={(e) => e.preventDefault()}>
                                        {nEn || '-'}
                                    </a>
                                </div>
                                <Text type="secondary">{nKh || ''}</Text>
                            </div>
                        </Space>
                    )
                },
            },
            {
                title: 'Category',
                key: 'category',
                width: 200,
                render: (_, record) => {
                    const c = record?.category || record?.mainCategory
                    return c?.nameEn || c?.nameKh || '-'
                },
            },
            {
                title: 'Location',
                key: 'location',
                width: 220,
                render: (_, record) => <Text>{fmtLocation(record)}</Text>,
            },
            {
                title: 'Property Type',
                key: 'property_type',
                width: 220,
                render: (_, record) => {
                    const arr = record?.typeOfPlace || []
                    if (!Array.isArray(arr) || arr.length === 0) return '-'
                    return arr.map((x) => x?.nameEn || x?.nameKh).filter(Boolean).join(', ') || '-'
                },
            },
        ],
        [page, isSearchMode]
    )

    const rowSelection = useMemo(
        () => ({
            preserveSelectedRowKeys: true,
            selectedRowKeys,
            getCheckboxProps: (record) => ({
                disabled: !!record.__disabled,
            }),
            onChange: (keys, rows) => {
                const cleanKeys = []
                const cleanRows = []
                rows.forEach((r, idx) => {
                    if (!r?.__disabled) {
                        cleanKeys.push(keys[idx])
                        cleanRows.push(r)
                    }
                })

                setSelectedRowKeys(cleanKeys)

                setSelectedRowsMap((prev) => {
                    const next = new Map(prev)
                    cleanRows.forEach((r) => next.set(getRowKey(r), r))

                    const keySet = new Set(cleanKeys)
                    Array.from(next.keys()).forEach((k) => {
                        if (!keySet.has(k)) next.delete(k)
                    })
                    return next
                })
            },
        }),
        [selectedRowKeys]
    )

    const handleCancel = () => setOpen?.(false)

    const handleAdd = async () => {
        if (!selectedRowKeys.length) return
        try {
            setSubmitting(true)
            await onSubmit?.(selectedRowKeys)
        } finally {
            setSubmitting(false)
        }
    }

    const selectedCount = selectedRowKeys.length

    return (
        <Modal
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={1200}
            centered
            destroyOnHidden
            title={
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                    }}
                >
                    <div style={{ minWidth: 220 }}>
                        <div style={{ fontSize: 22, fontWeight: 800 }}>Add Places to {areaName}</div>
                        <div style={{ color: '#6b7280', fontSize: 14, marginTop: 2 }}>
                            {isSearchMode ? (
                                <>
                                    Search results: {decoratedRows.length} item(s)
                                    {searchTruncated ? ' (too many results, refine search)' : ''}
                                </>
                            ) : (
                                <>Page {page} • {LIMIT} per page</>
                            )}
                        </div>
                    </div>

                    {selectedCount > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="mx-4">
                            <div
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '8px 14px ',
                                    borderRadius: 999,
                                    background: '#e6f4ff',
                                    color: '#1677ff',
                                    fontWeight: 700,
                                }}
                            >
                                <span>{selectedCount} selected</span>
                                <Button
                                    type="text"
                                    icon={<CloseOutlined />}
                                    onClick={clearSelection}
                                    style={{
                                        width: 26,
                                        height: 16,
                                        minWidth: 26,
                                        borderRadius: 999,
                                        padding: 0,
                                        color: '#1677ff',
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            }
        >
            {/* Filters */}
            <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 14 }}>
                <Col xs={24} md={18}>
                    <Input
                        size="large"
                        prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
                        placeholder="Search places..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onPressEnter={() => setDebouncedQ(q)}
                        style={{ borderRadius: 10 }}
                        allowClear
                    />
                </Col>
                <Col xs={24} md={6}>
                    <Select
                        size="large"
                        value={categoryId}
                        onChange={setCategoryId}
                        options={categoryOptions}
                        style={{ width: '100%' }}
                    />
                </Col>
            </Row>

            <div ref={wrapperRef} className="h-[600px]">
                <Table
                    rowKey={(r) => getRowKey(r)}
                    columns={columns}
                    dataSource={decoratedRows}
                    loading={loading || submitting}
                    size="small"
                    rowSelection={rowSelection}
                    pagination={false}
                    rowClassName={(record) => (record.__disabled ? 'opacity-60' : '')}
                    scroll={{
                        x: 'max-content',
                        ...(tableScrollY ? { y: 590 } : {}),
                    }}
                    style={{ borderRadius: 12, overflow: 'hidden' }}
                />
            </div>

            {/* Footer */}
            <div
                style={{
                    marginTop: 16,
                    paddingTop: 14,
                    borderTop: '1px solid #f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                }}
            >
                <Text type="secondary" style={{ fontSize: 12 }}>
                    {isSearchMode
                        ? `Search: "${safeText(debouncedQ).trim()}" • ${decoratedRows.length} item(s)${searchTruncated ? ' (refine to see more)' : ''
                        }`
                        : `Page ${page} • showing ${decoratedRows.length} item(s) • ${hasNext ? 'has next' : 'last page'}`}
                </Text>

                <Space wrap style={{ justifyContent: 'flex-end' }}>
                    {/*  Prev/Next ONLY in normal mode */}
                    {!isSearchMode && (
                        <>
                            <Button onClick={() => fetchPage(page - 1)} disabled={page <= 1 || loading || submitting}>
                                Prev
                            </Button>
                            <Button onClick={() => fetchPage(page + 1)} disabled={!hasNext || loading || submitting}>
                                Next
                            </Button>
                        </>
                    )}

                    <Button onClick={handleCancel}>Cancel</Button>

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAdd}
                        loading={submitting}
                        disabled={!selectedCount}
                    >
                        Add Places
                    </Button>
                </Space>
            </div>
        </Modal>
    )
}
