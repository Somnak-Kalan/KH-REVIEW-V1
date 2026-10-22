import React, { useMemo, useState, useContext, useEffect, useRef } from 'react'
import { Card, Col, Row, Space, Typography, Breadcrumb } from 'antd'
import { ExclamationCircleOutlined, HomeOutlined } from '@ant-design/icons'
import { useNavigate, useOutletContext } from 'react-router-dom'
import Swal from 'sweetalert2'

import AreaToolbar from '../../../../components/Filter/setup/AreaToolbar'
import AreasTable from './AreasTable'
import AreasGrid from './AreasGrid'
import { useAreasStore } from '../../../../Stores/Area/area.store'
import { AuthContext } from '../../../../contexts/AuthContext'
import { PERMS } from '../../../../constants/permission/perms'
import AddArea from './addEdit/Add'
import EditArea from './addEdit/Edit'
import { useAddressOptStore } from '../../../../Stores/Address/Address'
import TableHeader from '../../../../widgets/TableHeader'
import ImageLoading from '../../../../components/Loading/ImageLoading'

const { Title, Text } = Typography

const AREA_VIEW_MODE_KEY = 'area_view_mode'

const StatCard = ({ label, value, dotColor }) => (
    <Card className="rounded-[10px] dark:bg-slate-900 dark:border-slate-700">
        <Space direction="vertical" size={6} className="w-full">
            <Space size={8}>
                <span
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: 999,
                        display: 'inline-block',
                        background: dotColor || '#d9d9d9',
                    }}
                />
                <Text className="dark:text-slate-400" type="secondary">
                    {label}
                </Text>
            </Space>

            <Title level={3} style={{ margin: 0 }} className="dark:!text-slate-200">
                {value}
            </Title>
        </Space>
    </Card>
)

export default function AreaList() {
    const [viewMode, setViewMode] = useState(() => {
        return localStorage.getItem(AREA_VIEW_MODE_KEY) || 'table'
    })
    const [searchText, setSearchText] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')

    const { access_token, user, checkPermission } = useContext(AuthContext)
    const navigate = useNavigate()
    const { setDisplayEmitContent } = useOutletContext()

    //  use selectors (avoid rerender on unrelated store changes)
    const fetchAreas = useAreasStore((s) => s.fetchAreas)
    const loading = useAreasStore((s) => s.loading)
    const removeArea = useAreasStore((s) => s.removeArea)
    const areas = useAreasStore((s) => s.areas || [])

    const provinces = useAddressOptStore((s) => s.provinces || [])
    const districts = useAddressOptStore((s) => s.districts || [])
    const communes = useAddressOptStore((s) => s.communes || [])
    const fetchProvinceOpts = useAddressOptStore((s) => s.fetchProvinceOpts)
    const fetchDistrictOpts = useAddressOptStore((s) => s.fetchDistrictOpts)
    const fetchCommuneOpts = useAddressOptStore((s) => s.fetchCommuneOpts)
    const loadingProvinces = useAddressOptStore((s) => s.loadingProvinces)
    const loadingDistricts = useAddressOptStore((s) => s.loadingDistricts)
    const loadingCommunes = useAddressOptStore((s) => s.loadingCommunes)

    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [record, setRecord] = useState(null)

    // =========================
    //  Permission
    // =========================

    // =========================
    //  Breadcrumb
    // =========================
    useEffect(() => {
        setDisplayEmitContent(
            <div className="flex justify-between my-3">
                <div className="font-semibold text-slate-700 dark:text-slate-200">Area</div>

                <Breadcrumb
                    items={[
                        {
                            title: (
                                <HomeOutlined
                                    className="text-slate-700 dark:text-slate-200"
                                    style={{ cursor: 'pointer' }}
                                />
                            ),
                        },
                        { title: <span className="text-slate-700 dark:text-slate-200">Area</span> },
                    ]}
                />
            </div>
        )
    }, [setDisplayEmitContent])

    // =========================
    //  Cache view mode
    // - keep current tab/view after refresh
    // =========================
    useEffect(() => {
        localStorage.setItem(AREA_VIEW_MODE_KEY, viewMode)
    }, [viewMode])

    // =========================
    //  Load provinces ONCE
    // - StrictMode may call twice in DEV, so we guard
    // - Only fetch if provinces empty
    // =========================
    const didLoadProvinceRef = useRef(false)
    useEffect(() => {
        if (!access_token) return
        if (didLoadProvinceRef.current) return
        if (provinces.length > 0) {
            didLoadProvinceRef.current = true
            return
        }

        didLoadProvinceRef.current = true
        fetchProvinceOpts(access_token)
    }, [access_token, provinces.length, fetchProvinceOpts])

    // =========================
    //  Fetch Area list (debounce + dedupe)
    // =========================
    const lastQueryKeyRef = useRef('')
    const debounceRef = useRef(null)

    useEffect(() => {
        if (!access_token) return

        const payload = {
            keyword: searchText || '',
            type: typeFilter === 'all' ? '' : typeFilter,
            status: statusFilter === 'all' ? '' : statusFilter,
        }

        const key = JSON.stringify(payload)

        //  dedupe: same query => do nothing
        if (lastQueryKeyRef.current === key) return

        //  debounce: wait 300ms (typing)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            lastQueryKeyRef.current = key
            fetchAreas(access_token, payload)
        }, 300)

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [access_token, searchText, typeFilter, statusFilter, fetchAreas])

    // =========================
    //  Cascading select
    // =========================
    const onProvinceChange = (provinceId) => {
        if (!access_token) return
        fetchDistrictOpts(access_token, provinceId)
    }

    const onDistrictChange = (districtId) => {
        if (!access_token) return
        fetchCommuneOpts(access_token, districtId)
    }

    const typeOptions = useMemo(() => {
        const types = Array.from(new Set(areas.map((a) => a?.type))).filter(Boolean)
        return ['all', ...types]
    }, [areas])

    const filteredAreas = areas

    const stats = useMemo(() => {
        const total = areas.length
        const active = areas.filter((a) => a?.status === 'active').length
        const inactive = areas.filter((a) => a?.status === 'inactive').length
        return { total, active, inactive }
    }, [areas])

    const onAddArea = () => setOpenAdd(true)

    const onView = (row) => {
        navigate('/area/detail/' + (row?._id || row?.id))
    }

    const onEdit = (row) => {
        setRecord(row)
        setOpenEdit(true)
    }

    const onDelete = async (row) => {
        try {
            const id = row?._id || row?.id
            if (!id) return

            const result = await Swal.fire({
                title: 'Delete this area?',
                text: `This will permanently remove "${row?.nameEn || row?.nameKh || 'Area'}".`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete',
                cancelButtonText: 'Cancel',
                confirmButtonColor: '#d33',
            })

            if (!result.isConfirmed) return

            const res = await removeArea(access_token, id)

            if (res) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Deleted',
                    timer: 1200,
                    showConfirmButton: false,
                })

                //  refresh list with same filters (forces re-fetch once)
                lastQueryKeyRef.current = ''
                const payload = {
                    keyword: searchText || '',
                    type: typeFilter === 'all' ? '' : typeFilter,
                    status: statusFilter === 'all' ? '' : statusFilter,
                }
                fetchAreas(access_token, payload)
            }
        } catch (e) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text:
                    e?.response?.data?.message ||
                    e?.response?.data?.error ||
                    e?.message ||
                    'Delete failed',
            })
        }
    }

    return (
        <div>
            <AddArea
                open={openAdd}
                setOpen={setOpenAdd}
                provinces={provinces}
                districts={districts}
                communes={communes}
                onProvinceChange={onProvinceChange}
                onDistrictChange={onDistrictChange}
                loadingProvinces={loadingProvinces}
                loadingDistricts={loadingDistricts}
                loadingCommunes={loadingCommunes}
            />

            <EditArea
                open={openEdit}
                setOpen={setOpenEdit}
                record={record}
                provinces={provinces}
                districts={districts}
                communes={communes}
                onProvinceChange={onProvinceChange}
                onDistrictChange={onDistrictChange}
                loadingProvinces={loadingProvinces}
                loadingDistricts={loadingDistricts}
                loadingCommunes={loadingCommunes}
            />

            <Row gutter={[12, 12]} style={{ marginBottom: 14 }}>
                <Col xs={24} md={8}>
                    <StatCard label="Total Areas" value={stats.total} dotColor="#8c8c8c" />
                </Col>
                <Col xs={24} md={8}>
                    <StatCard label="Active Areas" value={stats.active} dotColor="#52c41a" />
                </Col>
                <Col xs={24} md={8}>
                    <StatCard label="Inactive Areas" value={stats.inactive} dotColor="#bfbfbf" />
                </Col>
            </Row>

            <AreaToolbar
                viewMode={viewMode}
                onChangeViewMode={setViewMode}
                searchText={searchText}
                onChangeSearchText={setSearchText}
                typeFilter={typeFilter}
                onChangeTypeFilter={setTypeFilter}
                statusFilter={statusFilter}
                onChangeStatusFilter={setStatusFilter}
                typeOptions={typeOptions}
                onAddArea={onAddArea}
            />

            <TableHeader total={filteredAreas?.length} label="Total Amount">
                {viewMode === 'table' ? (
                    <AreasTable
                        data={filteredAreas}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        access_token={access_token}
                        checkPermission={checkPermission}
                        PERMS={PERMS}
                        ImageLoading={ImageLoading}
                        loading={loading}
                    />
                ) : (
                    <AreasGrid
                        data={filteredAreas}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        access_token={access_token}
                        loading={loading}
                        ImageLoading={ImageLoading}
                    />
                )}

                {filteredAreas.length === 0 && (
                    <div style={{ padding: 20, textAlign: 'center' }}>
                        <ExclamationCircleOutlined style={{ fontSize: 18 }} />
                        <div style={{ marginTop: 8 }}>
                            <Text type="secondary">No areas found.</Text>
                        </div>
                    </div>
                )}
            </TableHeader>
        </div>
    )
}