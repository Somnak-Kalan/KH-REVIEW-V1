import React, { useMemo, useEffect, useState, useContext } from 'react'
import { Button, Col, Divider, Form, Input, Row, Skeleton, Typography } from 'antd'
import {
    GlobalOutlined,
    LinkOutlined,
    EnvironmentOutlined,
    EditOutlined,
} from '@ant-design/icons'
import { useProvinceStore } from '../../../../../Stores/Province/province.store'
import { AuthContext } from '../../../../../contexts/AuthContext'

const { Text } = Typography

const safeText = (v) => (typeof v === 'string' && v.trim() ? v : v ?? '-')

//  NEW: extract lat/lng from google maps link
const extractLatLngFromGoogleMapsLink = (url) => {
    if (!url || typeof url !== 'string') return { lat: '', lng: '' }

    // 1) @lat,lng (most common)
    const atMatch = url.match(/@(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/)
    if (atMatch) return { lat: atMatch[1], lng: atMatch[3] }

    // 2) query param q=lat,lng OR ll=lat,lng
    try {
        const u = new URL(url)
        const q = u.searchParams.get('q') || u.searchParams.get('ll')
        if (q) {
            const m = q.match(/(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/)
            if (m) return { lat: m[1], lng: m[3] }
        }
    } catch (e) {
        // ignore invalid URL
    }

    // 3) /place/lat,lng
    const placeMatch = url.match(/\/place\/(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/)
    if (placeMatch) return { lat: placeMatch[1], lng: placeMatch[3] }

    return { lat: '', lng: '' }
}

export default function OverviewTab({
    loading,
    province,
}) {
    const [form] = Form.useForm()
    const [isEditing, setIsEditting] = useState(false)

    //  ADD: animation key (re-trigger animation on every click)
    const [animKey, setAnimKey] = useState(0)

    //  ADD: tailwind animation class (fade + slide)
    const wrapClass =
        "opacity-0 translate-y-2 animate-[fadeInUp_.25s_ease-out_forwards]"

    const { access_token } = useContext(AuthContext)

    //  from store
    const { updateProvince, fetchProvinceById, saving } = useProvinceStore()

    const descEn = useMemo(
        () => safeText(province?.descriptionEn || province?.description || ''),
        [province]
    )
    const descKh = useMemo(() => safeText(province?.descriptionKh || province?.descriptionKm || ''), [province])

    const mapLink = useMemo(() => safeText(province?.mapLink || ''), [province])
    const centerKh = useMemo(
        () => safeText(province?.centerPointNameKh || province?.centerPointNameKm || province?.centerPointKh || ''),
        [province]
    )
    const centerEn = useMemo(
        () => safeText(province?.centerPointNameEn || province?.centerPointEn || ''),
        [province]
    )

    //  API uses "long" but UI uses "lng"
    const lat = useMemo(
        () => safeText(province?.lat ?? province?.centerLocation?.lat ?? ''),
        [province]
    )
    const lng = useMemo(
        () => safeText(province?.long ?? province?.lng ?? province?.centerLocation?.lng ?? ''),
        [province]
    )

    const canPreview =
        typeof province?.mapLink === 'string' && province.mapLink.trim().length > 0

    const onEdit = () => {
        setIsEditting(true)
        setAnimKey((v) => v + 1) //  ADD: trigger animation

    }

    //  when enter edit mode, preload inputs (same layout as your screenshot)
    useEffect(() => {
        if (!isEditing) return
        form.setFieldsValue({
            descriptionEn: province?.descriptionEn || province?.description || '',
            descriptionKh: province?.descriptionKm || province?.descriptionKh || '',
            mapLink: province?.mapLink || '',
            centerPointNameKh: province?.centerPointNameKm || province?.centerPointNameKh || province?.centerPointKh || '',
            centerPointNameEn: province?.centerPointNameEn || province?.centerPointEn || '',

            //  preload lat/lng
            lat: province?.lat ?? province?.centerLocation?.lat ?? '',
            lng: province?.long ?? province?.lng ?? province?.centerLocation?.lng ?? '',
        })
    }, [isEditing, province, form])

    //  when mapLink changes in edit mode, auto set lat/lng
    const handleMapLinkChange = (e) => {
        const value = e?.target?.value || ''
        const { lat: newLat, lng: newLng } = extractLatLngFromGoogleMapsLink(value)

        if (newLat && newLng) {
            form.setFieldsValue({ lat: newLat, lng: newLng })
        }
    }

    const handleSave = async () => {
        const values = await form.validateFields()
        if (!access_token) return
        const id = province?._id
        if (!id) return

        //  build payload exactly like your API doc (JSON)
        const doc = {
            _id: id,

            // required by doc screenshot:
            provinceKh: province?.provinceKh || province?.nameKh || province?.name_kh || '',
            provinceEn: province?.provinceEn || province?.nameEn || province?.name_en || '',

            descriptionEn: values?.descriptionEn || '',
            descriptionKm: values?.descriptionKh || '',

            centerPointNameEn: values?.centerPointNameEn || '',
            centerPointNameKm: values?.centerPointNameKh || '',

            mapLink: values?.mapLink || '',

            lat: String(values?.lat ?? ''),
            long: String(values?.lng ?? ''), //  API uses "long"
        }

        const res = await updateProvince(access_token, doc, {
            title: 'Province Updated!',
            text: 'Province has been successfully updated.',
            onClose: () => { },
        })

        if (res) {
            setIsEditting(false)
            setAnimKey((v) => v + 1) //  ADD: animate back to view mode
            // refresh detail
            await fetchProvinceById(access_token, id)
        }
    }

    const onCancelEdit = () => {
        setIsEditting(false)
        setAnimKey((v) => v + 1) //  ADD: animate back to view mode
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
            {/*  ADD: inline keyframes (no tailwind config needed) */}
            <style>
                {`
          @keyframes fadeInUp {
            to { opacity: 1; transform: translateY(0); }
          }
        `}
            </style>

            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between">
                <div className="font-semibold text-gray-900 dark:text-slate-100">About Province</div>

                {!isEditing && (
                    <Button
                        onClick={onEdit}
                        icon={<EditOutlined />}
                        className="bg-[#D4A106] hover:bg-[#BF9400] border-none text-white font-medium rounded-md"
                    >
                        Edit Province
                    </Button>
                )}
            </div>

            <Divider className="m-0 dark:border-slate-700" />

            {/* Body */}
            <div className="p-4">
                {loading ? (
                    <Skeleton active paragraph={{ rows: 3 }} />
                ) : (
                    //  ADD: wrapper to animate BOTH view/edit content
                    <div
                        key={`${isEditing ? 'edit' : 'view'}-${animKey}`}
                        className={wrapClass}
                    >
                        {isEditing ? (
                            <>
                                {/*  EDIT MODE (match screenshot) */}
                                <Form form={form} layout="vertical" requiredMark={false}>
                                    {/* Description */}
                                    <Row gutter={[24, 16]}>
                                        <Col xs={24} md={12}>
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 font-medium mb-2">
                                                <GlobalOutlined className="text-gray-500 dark:text-slate-400" />
                                                <span className="text-sm">Description English</span>
                                            </div>

                                            <Form.Item
                                                name="descriptionEn"
                                                className="mb-0"
                                            >
                                                <Input.TextArea
                                                    placeholder="Enter description english"
                                                    autoSize={{ minRows: 2, maxRows: 3 }}
                                                    className="
                            !bg-gray-100 !border-gray-100 !rounded-lg
                            dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-100
                          "
                                                />
                                            </Form.Item>
                                        </Col>

                                        <Col xs={24} md={12}>
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 font-medium mb-2">
                                                <GlobalOutlined className="text-gray-500 dark:text-slate-400" />
                                                <span className="text-sm">Description Khmer</span>
                                            </div>

                                            <Form.Item
                                                name="descriptionKh"
                                                className="mb-0"
                                            >
                                                <Input.TextArea
                                                    placeholder="Enter description khmer"
                                                    autoSize={{ minRows: 2, maxRows: 3 }}
                                                    className="
                            !bg-gray-100 !border-gray-100 !rounded-lg
                            dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-100
                          "
                                                />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    {/* Google Maps Location */}
                                    <Divider className="my-4 dark:border-slate-700" />

                                    <div className="flex items-center gap-2 text-gray-900 dark:text-slate-100 font-semibold">
                                        <EnvironmentOutlined className="text-blue-600" />
                                        <span>Google Maps Location</span>
                                    </div>

                                    <div className="mt-3">
                                        <Row gutter={[16, 14]}>
                                            <Col xs={24} md={12}>
                                                <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 font-medium mb-2">
                                                    <LinkOutlined className="text-gray-500 dark:text-slate-400" />
                                                    <span className="text-sm">
                                                        Google Maps Link <span className="text-red-500">*</span>
                                                    </span>
                                                </div>

                                                <Form.Item
                                                    name="mapLink"
                                                    className="mb-0"
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: 'Paste Google Maps link here to extract coordinates',
                                                        },
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Paste Google Maps link here to extract coordinates"
                                                        className="
                              !bg-gray-100 !border-gray-100 !rounded-lg h-10
                              dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-100
                            "
                                                        onChange={handleMapLinkChange}
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} md={6}>
                                                <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 font-medium mb-2">
                                                    <LinkOutlined className="text-gray-500 dark:text-slate-400" />
                                                    <span className="text-sm">
                                                        Center Point Name Khmer <span className="text-red-500">*</span>
                                                    </span>
                                                </div>

                                                <Form.Item
                                                    name="centerPointNameKh"
                                                    className="mb-0"
                                                    rules={[
                                                        { required: true, message: 'Enter Center Point Name Khmer' },
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Enter Center Point Name Khmer"
                                                        className="
                              !bg-gray-100 !border-gray-100 !rounded-lg h-10
                              dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-100
                            "
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} md={6}>
                                                <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 font-medium mb-2">
                                                    <LinkOutlined className="text-gray-500 dark:text-slate-400" />
                                                    <span className="text-sm">
                                                        Center Point Name English <span className="text-red-500">*</span>
                                                    </span>
                                                </div>

                                                <Form.Item
                                                    name="centerPointNameEn"
                                                    className="mb-0"
                                                    rules={[
                                                        { required: true, message: 'Enter Center Point Name English' },
                                                    ]}
                                                >
                                                    <Input
                                                        placeholder="Enter Center Point Name English"
                                                        className="
                              !bg-gray-100 !border-gray-100 !rounded-lg h-10
                              dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-100
                            "
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        {/*  Lat/Lng inputs in edit mode */}
                                        <Row gutter={[16, 14]} className="mt-4">
                                            <Col xs={24} md={12}>
                                                <div className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                                    Latitude
                                                </div>

                                                <Form.Item
                                                    name="lat"
                                                    className="mb-0"
                                                    rules={[{ required: true, message: 'Enter latitude' }]}
                                                >
                                                    <Input
                                                        placeholder="Latitude"
                                                        className="
                              !bg-blue-50 !border-blue-200 !rounded-lg h-11 !text-blue-700
                              dark:!bg-slate-800 dark:!border-slate-700 dark:!text-sky-300
                            "
                                                    />
                                                </Form.Item>
                                            </Col>

                                            <Col xs={24} md={12}>
                                                <div className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                                                    Longitude
                                                </div>

                                                <Form.Item
                                                    name="lng"
                                                    className="mb-0"
                                                    rules={[{ required: true, message: 'Enter longitude' }]}
                                                >
                                                    <Input
                                                        placeholder="Longitude"
                                                        className="
                              !bg-blue-50 !border-blue-200 !rounded-lg h-11 !text-blue-700
                              dark:!bg-slate-800 dark:!border-slate-700 dark:!text-sky-300
                            "
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>

                                        {/*  Buttons like screenshot */}
                                        <div className="mt-5 flex items-center gap-3">
                                            <Button
                                                type="primary"
                                                onClick={handleSave}
                                                loading={saving}
                                                className="bg-blue-600 hover:bg-blue-700 border-none rounded-md"
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                onClick={onCancelEdit}
                                                className="rounded-md dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-100"
                                                disabled={saving}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                </Form>
                            </>
                        ) : (
                            <>
                                {/*  VIEW MODE (your original) */}
                                <Row gutter={[24, 16]}>
                                    {/* Description EN */}
                                    <Col xs={24} md={12}>
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 font-medium">
                                            <GlobalOutlined className="text-gray-500 dark:text-slate-400" />
                                            <span className="text-sm">Description English</span>
                                        </div>
                                        <div className="mt-1">
                                            <Text className="text-gray-700 dark:!text-slate-200">{descEn}</Text>
                                        </div>
                                    </Col>

                                    {/* Description KH */}
                                    <Col xs={24} md={12}>
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 font-medium">
                                            <GlobalOutlined className="text-gray-500 dark:text-slate-400" />
                                            <span className="text-sm">Description Khmer</span>
                                        </div>
                                        <div className="mt-1">
                                            <Text className="text-gray-700 dark:!text-slate-200">{descKh}</Text>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Google Maps Location */}
                                <Divider className="my-4 dark:border-slate-700" />

                                <div className="flex items-center gap-2 text-gray-900 dark:text-slate-100 font-semibold">
                                    <EnvironmentOutlined className="text-blue-600" />
                                    <span>Google Maps Location</span>
                                </div>

                                <div className="mt-3">
                                    {/* Row 1: link + center names */}
                                    <Row gutter={[16, 14]}>
                                        <Col xs={24} md={12}>
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 font-medium">
                                                <LinkOutlined className="text-gray-500 dark:text-slate-400" />
                                                <span className="text-sm">
                                                    Google Maps Link <span className="text-red-500">*</span>
                                                </span>
                                            </div>

                                            <div className="mt-1 text-gray-800 dark:text-slate-200">
                                                {mapLink !== '-' ? (
                                                    <a
                                                        href={String(province?.mapLink)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-700 inline-block max-w-full truncate align-middle"
                                                        title={String(province?.mapLink)}
                                                    >
                                                        {String(province?.mapLink)}
                                                    </a>
                                                ) : (
                                                    <Text type="secondary" className="dark:!text-slate-400">-</Text>
                                                )}
                                            </div>

                                        </Col>

                                        <Col xs={24} md={6}>
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 font-medium">
                                                <EnvironmentOutlined className="text-gray-500 dark:text-slate-400" />
                                                <span className="text-sm">
                                                    Center Point Name Khmer <span className="text-red-500">*</span>
                                                </span>
                                            </div>
                                            <div className="mt-1 text-gray-800 dark:text-slate-200">{centerKh}</div>
                                        </Col>

                                        <Col xs={24} md={6}>
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-slate-300 font-medium">
                                                <EnvironmentOutlined className="text-gray-500 dark:text-slate-400" />
                                                <span className="text-sm">
                                                    Center Point Name English <span className="text-red-500">*</span>
                                                </span>
                                            </div>
                                            <div className="mt-1 text-gray-800 dark:text-slate-200">{centerEn}</div>
                                        </Col>
                                    </Row>

                                    {/* Row 2: Lat/Lng boxes */}
                                    <Row gutter={[16, 14]} className="mt-4">
                                        <Col xs={24} md={12}>
                                            <div className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Latitude</div>
                                            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300">
                                                {lat}
                                            </div>
                                        </Col>

                                        <Col xs={24} md={12}>
                                            <div className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Longitude</div>
                                            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300">
                                                {lng}
                                            </div>
                                        </Col>
                                    </Row>

                                    {/* Preview Button */}
                                    <div className="mt-4">
                                        <Button
                                            block
                                            disabled={!canPreview}
                                            onClick={() =>
                                                window.open(String(province?.mapLink), '_blank', 'noopener,noreferrer')
                                            }
                                            className="
                        rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-medium h-10
                        dark:!bg-slate-900 dark:!border-slate-700 dark:!text-slate-100 dark:hover:!bg-slate-800
                      "
                                            icon={<EnvironmentOutlined />}
                                        >
                                            Preview on Google Maps
                                        </Button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
