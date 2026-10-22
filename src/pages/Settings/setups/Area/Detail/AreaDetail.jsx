import React, { useContext, useEffect, useMemo, useState } from 'react'
import {
    Card,
    Col,
    Divider,
    Row,
    Space,
    Tag,
    Typography,
    Breadcrumb,
    Button,
    Spin,
} from 'antd'
import { useParams, useOutletContext, useNavigate } from 'react-router-dom'
import {
    EnvironmentOutlined,
    CalendarOutlined,
    UserOutlined,
    LinkOutlined,
    ArrowLeftOutlined,
    HomeOutlined,
    EditOutlined,
    DeleteOutlined,
    ExportOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'

import { useAreasStore } from '../../../../../Stores/Area/area.store'
import { useAddressOptStore } from '../../../../../Stores/Address/Address'
import { AuthContext } from '../../../../../contexts/AuthContext'
import { useDarkMode } from '../../../../../contexts/DarkMode';
import AreaPlacesList from '../../../../../components/Area/detail/PlacehasAssign'
import ImageLoading from '../../../../../components/Loading/ImageLoading'
import EditArea from '../addEdit/Edit'

const { Title, Text } = Typography

const labelStyle = {
    fontSize: 12,
    letterSpacing: 0.6,
    color: '#8c8c8c',
    fontWeight: 600,
    textTransform: 'uppercase',
}

const valueStyle = { fontSize: 16, fontWeight: 600, color: '#1f2937' }

const fmtDate = (d) => {
    if (!d) return '-'
    const dd = dayjs(d)
    return dd.isValid() ? dd.format('M/D/YYYY') : String(d)
}

const fmtLatLng = (lat, lng) => {
    const a = lat ?? ''
    const b = lng ?? ''
    if (a === '' || b === '') return '-'
    return `${Number(a).toFixed(4)}, ${Number(b).toFixed(4)}`
}

const toTypeLabel = (type) => {
    if (!type) return '-'
    const map = {
        riverine_floating: 'Riverine Floating',
        island_tourism: 'Island Tourism',
        coastal_beach: 'Coastal Beach',
        mountain_tourism: 'Mountain Tourism',
        eco_tourism: 'Eco Tourism',
        community_tourism: 'Community Tourism',
        agricultural_farm: 'Agricultural Farm',
        night_street: 'Night Street',
    }
    return map[type] || type
}

export default function AreaDetailHeader({ area: areaProp, coverHeight = 280 }) {
    const { id } = useParams()
    const { access_token } = useContext(AuthContext)
    const { setDisplayEmitContent } = useOutletContext()
    const navigate = useNavigate()

    const { fetchAreaById, areaDetail, removeArea } = useAreasStore()

    //  modal edit like AreaList
    const [openEdit, setOpenEdit] = useState(false)
    const [record, setRecord] = useState(null)

    //  Address store (same as AreaList)
    const {
        provinces,
        districts,
        communes,
        fetchProvinceOpts,
        fetchDistrictOpts,
        fetchCommuneOpts,
        loadingProvinces,
        loadingDistricts,
        loadingCommunes,
    } = useAddressOptStore()

    //  fetch detail
    useEffect(() => {
        if (!access_token || !id) return
        fetchAreaById(access_token, id)
    }, [access_token, id, fetchAreaById])

    //  load provinces once
    useEffect(() => {
        if (!access_token) return
        fetchProvinceOpts(access_token)
    }, [access_token, fetchProvinceOpts])

    //  render from store (fallback to prop if provided)
    const area = areaProp || areaDetail?.data?.area || areaDetail?.area || null

    const coverUrl = area?.cover?.url || area?.coverUrl || area?.imageUrl || ''
    const mapLink = area?.mapLink
    const status = area?.status || 'inactive'

    const statusTag = useMemo(() => {
        const isActive = status === 'active'
        return (
            <Tag
                color={isActive ? 'green' : 'default'}
                style={{
                    borderRadius: 10,
                    padding: '6px 14px',
                    fontWeight: 700,
                    fontSize: 14,
                    textTransform: 'capitalize',
                }}
            >
                {isActive ? 'Active' : 'Inactive'}
            </Tag>
        )
    }, [status])

    const title = area?.nameEn || area?.nameKh || area?.name || '-'
    const titleKh = area?.nameKh || area?.name || '-'
    const description =
        area?.descriptionEn || area?.descriptionKm || area?.description || ''
    const descriptionKh = area?.descriptionKm

    const provinceText =
        area?.province?.provinceEn || area?.province?.provinceKh || '-'
    const provinceId = area?.province?.provinceId
    const districtText =
        area?.district?.districtEn || area?.district?.districtKh || '-'
    const typeText = toTypeLabel(area?.type)

    const lat = area?.centerLocation?.lat ?? ''
    const lng = area?.centerLocation?.lng ?? ''

    const createdAt = fmtDate(area?.createdAt)
    const createdBy =
        area?.createdBy?.username ||
        area?.createdBy?.name ||
        area?.createdBy ||
        area?.created_by ||
        '-'

    const handleBack = () => navigate('/area')

    //  same concept as AreaList
    const onProvinceChange = (provinceId) => {
        if (!access_token) return
        fetchDistrictOpts(access_token, provinceId)
    }

    const onDistrictChange = (districtId) => {
        if (!access_token) return
        fetchCommuneOpts(access_token, districtId)
    }

    const handleEdit = () => {
        //  record is the same object you pass from AreaList
        setRecord(area)
        setOpenEdit(true)

        // optional: preload district list based on existing area province
        const provinceNum = area?.province?.provinceId
        if (provinceNum) onProvinceChange(provinceNum)
    }

    //delete area
    const handleDelete = async () => {
        const res = await Swal.fire({
            icon: 'warning',
            title: 'Delete this area?',
            text: `This will permanently delete "${title}".`,
            showCancelButton: true,
            confirmButtonText: 'Delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#d33',
        })

        if (!res.isConfirmed) return
        if (!removeArea) {
            Swal.fire({ icon: 'error', title: 'removeArea not implemented in store' })
            return
        }

        const ok = await removeArea(access_token, id)
        if (ok !== false) {
            Swal.fire({
                icon: 'success',
                title: 'Deleted',
                timer: 1000,
                showConfirmButton: false,
            })
            navigate('/area')
        }
    }

    //  Header / breadcrumb
    useEffect(() => {
        setDisplayEmitContent(
            <div className="my-2">
                <Row
                    align="middle"
                    justify="space-between"
                    className="bg-white rounded-md px-4 py-2"
                >
                    <Col>
                        <div
                            className="inline-flex items-center space-x-2 cursor-pointer"
                            onClick={handleBack}
                        >
                            <ArrowLeftOutlined />
                            <span style={{ fontWeight: 600, color: '#111827' }}>
                                Back to Area list
                            </span>
                        </div>
                    </Col>

                    <Col>
                        <Breadcrumb
                            items={[
                                {
                                    title: (
                                        <HomeOutlined
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => navigate('/')}
                                        />
                                    ),
                                },
                                { title: 'Setups' },
                                { title: 'Area' },
                                { title: 'Area Detail' },
                            ]}
                        />
                    </Col>
                </Row>
            </div>
        )
    }, [navigate, setDisplayEmitContent])

    const places =
        areaDetail?.data?.places ||
        areaDetail?.places ||
        areaDetail?.data?.data?.places ||
        []

    //  spinner state (ONLY for cover image)
    const [imgLoading, setImgLoading] = useState(true)
    useEffect(() => {
        // whenever cover changes, show spinner again
        setImgLoading(true)
    }, [coverUrl])

    return (
        <>
            {/*  Edit modal like AreaList */}
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

            {/*  Buttons top-right like screenshot */}
            <div className="flex justify-end my-2">
                <Button icon={<EditOutlined />} onClick={handleEdit} className="mx-1 cursor-pointer">
                    Edit
                </Button>
                <Button
                    danger
                    type="primary"
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                    className="mx-1 cursor-pointer"
                >
                    Delete
                </Button>
            </div>

            <Card
                style={{
                    borderRadius: 14,
                    overflow: 'hidden',
                    border: '1px solid #f0f0f0',
                }}
                styles={{ body: { padding: 0 } }}
            >
                {/* Cover */}
                <div style={{ position: 'relative', width: '100%' }} className=''>
                    <div className="flex justify-center  h-[400px]" style={{ position: 'relative' }}>
                        {/*  Spinner overlay */}
                        {imgLoading && (
                            <div
                                style={{
                                    position: 'absolute',
                                    inset: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: '#f3f4f6',
                                    zIndex: 1,
                                }}
                            >
                                <ImageLoading overlay={false} size={80} logoSize={40} />
                            </div>
                        )}

                        <img
                            src={coverUrl}
                            className="w-full  object-cover"
                            alt=""
                            onLoad={() => setImgLoading(false)}
                            onError={() => setImgLoading(false)}
                            style={{
                                opacity: imgLoading ? 0 : 1,
                                transition: 'opacity 200ms ease ',
                            }}
                        />
                    </div>

                    <div style={{ position: 'absolute', right: 18, top: 18 }}>
                        {statusTag}
                    </div>
                </div>

                {/* Content */}
                <div style={{ padding: 22 }}>
                    <Title level={2} style={{ margin: 0 }}>
                        <Title level={2} style={{ margin: 0 }}>
                            <p style={{ margin: 0 }} className='dark:text-[#64748b] text-slate-900'>{title}</p>
                            <p style={{ margin: 0 }} className="text-sm dark:text-[#64748b] text-slate-900">
                                {titleKh}
                            </p>
                        </Title>
                    </Title>
                    {(description || descriptionKh) ? (
                        <div>
                            {description && (
                                <p className="text-base dark:text-[#64748b] text-slate-900">
                                    {description}
                                </p>
                            )}
                            {descriptionKh && (
                                <p className="text-base dark:text-[#64748b] text-slate-900">
                                    {descriptionKh}
                                </p>
                            )}
                        </div>
                    ) : null}

                    <div style={{ marginTop: 18 }}>
                        <Row gutter={[24, 12]}>
                            <Col xs={24} md={8}>
                                <div style={labelStyle} className="text-[#8c8c8c] dark:text-[#64748b]">
                                    Province
                                </div>

                                <div className="text-slate-900 dark:text-[#64748b] font-bold">{provinceText}</div>
                            </Col>

                            <Col xs={24} md={8}>
                                <div style={labelStyle} className="text-[#8c8c8c] dark:text-[#64748b]">
                                    District
                                </div>
                                <div className="text-slate-900 dark:text-[#64748b] font-bold">{districtText}</div>
                            </Col>

                            <Col xs={24} md={8}>
                                <div style={labelStyle} className="text-[#8c8c8c] dark:text-[#64748b]">
                                    Type
                                </div>
                                <div className="text-slate-900 dark:text-[#64748b] font-bold">{typeText}</div>
                            </Col>
                        </Row>
                    </div>

                    <div>
                        <Text className='dark:text-[#64748b]' style={{ fontWeight: 700, letterSpacing: 1, fontSize: '12px' }} type="secondary">
                            GOOGLE MAPS LINK
                        </Text>

                        <div style={{ marginTop: 0 }}>
                            <Space size={8} style={{ maxWidth: 520 }}>
                                <LinkOutlined />

                                {mapLink ? (
                                    <a
                                        href={mapLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        title={mapLink}
                                        style={{
                                            maxWidth: 480,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 6,
                                        }}
                                    >
                                        <Text
                                            ellipsis
                                            className="!text-[12px] !text-[#1890ff] dark:!text-[#60a5fa]"
                                            style={{ maxWidth: 440 }}
                                        >
                                            {mapLink}
                                        </Text>

                                        {/*  the icon on the right */}
                                        <ExportOutlined style={{ color: '#1890ff' }} />
                                    </a>
                                ) : (
                                    <Text type="secondary">-</Text>
                                )}
                            </Space>
                        </div>
                    </div>

                    <Divider style={{ margin: '18px 0' }} />

                    <Space size={26} wrap style={{ color: '#6b7280' }}>
                        <Space size={8}>
                            <EnvironmentOutlined />
                            <Text type="secondary" className='dark:text-slate-400'>{fmtLatLng(lat, lng)}</Text>
                        </Space>

                        <Space size={8}>
                            <CalendarOutlined />
                            <Text type="secondary" className='dark:text-slate-400'>Created {createdAt}</Text>
                        </Space>

                        <Space size={8}>
                            <UserOutlined />
                            <Text type="secondary" className='dark:text-slate-400'>By {createdBy}</Text>
                        </Space>
                    </Space>
                </div>
            </Card>

            <div style={{ marginTop: 12 }}>
                <AreaPlacesList
                    areaName={title || 'Area'}
                    places={places}
                    loading={false}
                    onAddPlaces={() => console.log('Add Places')}
                    access_token={access_token}
                    areaId={id}
                    provinceId={provinceId}
                />
            </div>
        </>
    )
}
