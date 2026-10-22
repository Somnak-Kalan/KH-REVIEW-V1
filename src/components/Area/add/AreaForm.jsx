import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Col, Form, Input, Row, Select, Upload } from 'antd'
import { UploadOutlined, PlusOutlined } from '@ant-design/icons'

const { TextArea } = Input

const parseLatLngFromGoogleMaps = (url) => {
    try {
        if (!url) return null
        const s = String(url)

        const atMatch = s.match(/@(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/)
        if (atMatch) return { lat: Number(atMatch[1]), lng: Number(atMatch[3]) }

        const dMatch = s.match(/!3d(-?\d+(\.\d+)?)!4d(-?\d+(\.\d+)?)/)
        if (dMatch) return { lat: Number(dMatch[1]), lng: Number(dMatch[3]) }

        const qMatch = s.match(/q=(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/)
        if (qMatch) return { lat: Number(qMatch[1]), lng: Number(qMatch[3]) }

        const llMatch = s.match(/ll=(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)/)
        if (llMatch) return { lat: Number(llMatch[1]), lng: Number(llMatch[3]) }

        return null
    } catch {
        return null
    }
}

//  helper: accepts [] OR {data:[]} OR {data:{data:[]}}
const normalizeList = (v) => {
    if (Array.isArray(v)) return v
    if (Array.isArray(v?.data)) return v.data
    if (Array.isArray(v?.data?.data)) return v.data.data
    return []
}

const AreaForm = ({
    mode = 'create',
    title = 'Add New Area',
    subtitle = '',
    okText = 'Create Area',
    okIcon = <PlusOutlined />,
    loading = false,

    provinces = [],
    districts = [],
    types = [],
    requireCover = true,

    initialValues = {},
    disableFields = [],
    onProvinceChange,
    onDistrictChange,
    onCancel,
    onSubmit,
}) => {
    const [form] = Form.useForm()
    const [coverFile, setCoverFile] = useState(null)
    const [fileList, setFileList] = useState([])
    const [previewUrl, setPreviewUrl] = useState('')

    //  track blob url only (so we revoke safely)
    const blobUrlRef = useRef('')

    const disabled = useMemo(() => {
        const set = new Set(disableFields || [])
        return (name) => set.has(name)
    }, [disableFields])

    const setPreviewFromFile = (file) => {
        try {
            if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
            const url = URL.createObjectURL(file)
            blobUrlRef.current = url
            setPreviewUrl(url)
        } catch { }
    }

    const clearBlobPreview = () => {
        if (blobUrlRef.current) {
            try {
                URL.revokeObjectURL(blobUrlRef.current)
            } catch { }
            blobUrlRef.current = ''
        }
    }

    //  helper: when mapLink changes, auto fill lat/lng
    const fillLatLngFromMapLink = (mapLink) => {
        const parsed = parseLatLngFromGoogleMaps(mapLink)
        if (!parsed) return

        form.setFieldsValue({
            lat: parsed.lat,
            lng: parsed.lng,
        })
    }

    //  set form fields on initialValues change
    //  BUT: do not destroy preview if user already chose a new file
    useEffect(() => {
        form.setFieldsValue(initialValues || {})

        //  auto-fill lat/lng from initial mapLink (edit mode)
        // only if lat/lng are empty (so we don't overwrite existing values)
        const ivMap = initialValues?.mapLink || ''
        const ivLat = initialValues?.lat
        const ivLng = initialValues?.lng
        if (ivMap && (ivLat === '' || ivLat == null) && (ivLng === '' || ivLng == null)) {
            fillLatLngFromMapLink(ivMap)
        }

        // if user already selected a new file, keep it
        if (coverFile) return

        const remoteCover = initialValues?.coverUrl || ''
        if (remoteCover) {
            clearBlobPreview()
            setPreviewUrl(remoteCover)
            setFileList([])
        } else if (mode === 'create') {
            clearBlobPreview()
            setCoverFile(null)
            setFileList([])
            setPreviewUrl('')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialValues, form, coverFile, mode])

    //  cleanup blob URL on unmount
    useEffect(() => {
        return () => clearBlobPreview()
    }, [])

    const beforeUpload = (file) => {
        const isOkType =
            file.type === 'image/png' ||
            file.type === 'image/jpeg' ||
            file.type === 'image/jpg'
        const isOkSize = file.size / 1024 / 1024 <= 5

        if (!isOkType) return Upload.LIST_IGNORE
        if (!isOkSize) return Upload.LIST_IGNORE

        setPreviewFromFile(file)
        setCoverFile(file)
        setFileList([file])
        return false
    }

    const handleRemove = () => {
        setCoverFile(null)
        setFileList([])
        clearBlobPreview()

        const remoteCover = initialValues?.coverUrl || ''
        setPreviewUrl(remoteCover || '')
    }

    //  Province options value MUST be provinceId (number)
    const provinceOptions = useMemo(() => {
        const list = normalizeList(provinces)
        return list.map((p) => ({
            value: p?.provinceId,
            label: `${p?.provinceEn || ''} - ${p?.provinceKh || ''}`.trim(),
            searchText: `${p?.provinceEn || ''} ${p?.provinceKh || ''}`.toLowerCase(),
            raw: p,
        }))
    }, [provinces])

    const handleValuesChange = (changed, allValues) => {
        //  province change => load districts
        if (Object.prototype.hasOwnProperty.call(changed, 'provinceId') && onProvinceChange) {
            const selectedProvince =
                provinceOptions.find((x) => x.value === changed.provinceId)?.raw || null

            onProvinceChange(selectedProvince?.provinceId, selectedProvince)
            form.setFieldsValue({ districtId: undefined })
        }

        //  district change => load communes
        if (Object.prototype.hasOwnProperty.call(changed, 'districtId') && onDistrictChange) {
            onDistrictChange(changed.districtId, null)
        }

        //  mapLink change => auto fill lat/lng
        if (Object.prototype.hasOwnProperty.call(changed, 'mapLink')) {
            fillLatLngFromMapLink(changed.mapLink)
        }
    }

    const handleFinish = async (values) => {
        const payload = {
            ...values,
            coverFile,
        }

        if (requireCover && !coverFile && !initialValues?.coverUrl) {
            form.setFields([{ name: 'coverFile', errors: ['Cover image is required'] }])
            return
        }

        await onSubmit?.(payload)
    }

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-start justify-between px-4 sm:px-6 py-4 border-b">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-blue-600 text-lg">+</span>
                        <h2 className="text-base sm:text-lg font-semibold m-0 truncate">{title}</h2>
                    </div>
                    {subtitle ? (
                        <p className="text-gray-500 text-xs sm:text-sm mt-1 mb-0">{subtitle}</p>
                    ) : null}
                </div>
                <button
                    onClick={onCancel}
                    className="text-gray-500 hover:text-gray-800 text-xl leading-none"
                    type="button"
                >
                    ×
                </button>
            </div>

            {/* Body */}
            <div className="px-4 sm:px-6 py-5">
                <Form
                    form={form}
                    layout="vertical"
                    onValuesChange={handleValuesChange}
                    onFinish={handleFinish}
                    initialValues={initialValues}
                >
                    {/* Area Name */}
                    <div className="mb-4">
                        <div className="font-semibold text-sm mb-2 dark:text-slate-300">Area Name</div>
                        <Row gutter={[16, 0]}>
                            <Col xs={24} sm={24} md={12}>
                                <Form.Item
                                    label={
                                        <span>
                                            English <span className="text-red-500">*</span>
                                        </span>
                                    }
                                    name="nameEn"
                                    rules={[{ required: true, message: 'Please enter English name' }]}
                                >
                                    <Input placeholder="e.g., Koh Rong Island" disabled={disabled('nameEn')} />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={12}>
                                <Form.Item
                                    label={
                                        <span>
                                            Khmer <span className="text-red-500">*</span>
                                        </span>
                                    }
                                    name="nameKh"
                                    rules={mode === 'create' ? [{ required: true, message: 'Please enter Khmer name' }] : []}
                                >
                                    <Input placeholder="e.g., កោះរ៉ុង" disabled={disabled('nameKh')} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>

                    <div className="border-t my-4" />

                    {/* Location */}
                    <div className="mb-4">
                        <div className="font-semibold text-sm mb-2 dark:text-slate-300">Location</div>
                        <Row gutter={[16, 0]}>
                            <Col xs={24} sm={24} md={8}>
                                <Form.Item
                                    label={
                                        <span>
                                            Province <span className="text-red-500">*</span>
                                        </span>
                                    }
                                    name="provinceId"
                                    rules={mode === 'create' ? [{ required: true, message: 'Please select province' }] : []}
                                >
                                    <Select
                                        showSearch
                                        placeholder="Select province"
                                        disabled={disabled('provinceId')}
                                        options={provinceOptions}
                                        filterOption={(input, option) =>
                                            (option?.searchText || '').includes(input.toLowerCase())
                                        }
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={24} md={8}>
                                <Form.Item
                                    label={
                                        <span>
                                            District <span className="text-red-500">*</span>
                                        </span>
                                    }
                                    name="districtId"
                                    rules={mode === 'create' ? [{ required: true, message: 'Please select district' }] : []}
                                >
                                    <Select
                                        showSearch
                                        placeholder={mode === 'create' ? 'Province first' : 'Select'}
                                        disabled={disabled('districtId')}
                                        options={districts}
                                        filterOption={(input, option) =>
                                            (option?.searchText || '').includes(input.toLowerCase())
                                        }
                                    />
                                </Form.Item>
                            </Col>

                            <Col xs={24} sm={24} md={8}>
                                <Form.Item
                                    label={
                                        <span>
                                            Type <span className="text-red-500">*</span>
                                        </span>
                                    }
                                    name="type"
                                    rules={mode === 'create' ? [{ required: true, message: 'Please select type' }] : []}
                                >
                                    <Select placeholder="Select" disabled={disabled('type')} options={types} />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>

                    <div className="border-t my-4" />

                    {/* Description */}
                    <div className="mb-4">
                        <div className="font-semibold text-sm mb-2 dark:text-slate-300">Description</div>
                        <Row gutter={[16, 0]}>
                            <Col xs={24} sm={24} md={12}>
                                <Form.Item label="English" name="descriptionEn">
                                    <TextArea
                                        rows={4}
                                        placeholder="Describe the area..."
                                        disabled={disabled('descriptionEn')}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={12}>
                                <Form.Item label="Khmer" name="descriptionKm">
                                    <TextArea
                                        rows={4}
                                        placeholder="ពិពណ៌នាអំពីតំបន់..."
                                        disabled={disabled('descriptionKm')}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>

                    <div className="border-t my-4" />

                    {/* Cover Image */}
                    <div className="mb-4">
                        <div className="font-semibold text-sm mb-2 dark:text-slate-300">Cover Image</div>
                        <Form.Item name="coverFile" className="hidden" />

                        <Upload.Dragger
                            multiple={false}
                            accept=".png,.jpg,.jpeg"
                            beforeUpload={beforeUpload}
                            fileList={fileList}
                            showUploadList={false}
                            disabled={disabled('cover')}
                            className="!bg-white"
                        >
                            {previewUrl ? (
                                <div className="relative w-full">
                                    <img
                                        src={previewUrl}
                                        alt="cover-preview"
                                        className="w-full max-h-[320px] object-cover rounded-lg border"
                                    />

                                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                                        <div className="px-3 py-1.5 rounded-md bg-white/90 text-sm font-medium dark:text-slate-300">
                                            Click to change image
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            handleRemove()
                                        }}
                                        className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-white/90 border hover:bg-white"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ) : (
                                <div className="py-8">
                                    <UploadOutlined className="text-2xl text-gray-500" />
                                    <div className="mt-2 text-sm font-medium dark:text-slate-300">Click to upload image</div>
                                    <div className="text-xs text-gray-500">PNG, JPG up to 5MB</div>
                                    {requireCover ? <div className="text-xs text-red-500 mt-1">*</div> : null}
                                </div>
                            )}
                        </Upload.Dragger>
                    </div>

                    <div className="border-t my-4" />

                    {/* Coordinates */}
                    <div className="mb-4">
                        <div className="font-semibold text-sm mb-2 dark:text-slate-300">Coordinates</div>

                        <Form.Item
                            label={
                                <span>
                                    Google Maps Link <span className="text-red-500">*</span>
                                </span>
                            }
                            name="mapLink"
                            rules={mode === 'create' ? [{ required: true, message: 'Please paste Google Maps URL' }] : []}
                        >
                            <Input placeholder="Paste Google Maps URL" />
                        </Form.Item>

                        <Row gutter={[16, 0]}>
                            <Col xs={24} sm={24} md={12}>
                                <Form.Item
                                    label="Latitude"
                                    name="lat"
                                    rules={mode === 'create' ? [{ required: true, message: 'Latitude is required' }] : []}
                                >
                                    <Input placeholder="11.5657" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={24} md={12}>
                                <Form.Item
                                    label="Longitude"
                                    name="lng"
                                    rules={mode === 'create' ? [{ required: true, message: 'Longitude is required' }] : []}
                                >
                                    <Input placeholder="104.9312" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>

                    <div className="border-t my-4" />

                    {/* Settings */}
                    <div className="mb-2">
                        <div className="font-semibold text-sm mb-2 dark:text-slate-300">Settings</div>
                        <Row gutter={[16, 0]}>
                            <Col xs={24} sm={24} md={12}>
                                <Form.Item
                                    label={
                                        <span>
                                            Status <span className="text-red-500">*</span>
                                        </span>
                                    }
                                    name="status"
                                    rules={[{ required: true, message: 'Please select status' }]}
                                >
                                    <Select
                                        options={[
                                            { label: 'Active', value: 'Active' },
                                            { label: 'Inactive', value: 'Inactive' },
                                        ]}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>
                    </div>

                    {/* Footer */}
                    <div className="flex flex-col sm:flex-row justify-end gap-2 border-t pt-4 mt-4">
                        <Button onClick={onCancel} className="w-full sm:w-auto">
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            icon={okIcon}
                            className="!bg-gray-700 hover:!bg-gray-800 w-full sm:w-auto"
                        >
                            {okText}
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    )
}

export default AreaForm
