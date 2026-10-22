import React, { useEffect, useState } from 'react'
import { Row, Col, Form, Checkbox, Space, Input } from 'antd'
import BannerService from '../../../../services/options/Address'
import 'tailwindcss/tailwind.css'
import helpFunctions from '../../../../utils/helpFunctions'
const ProvinceSection = (props) => {
    const { access_token, form, defaultProvinceIds = [], setSelectedProvinceIds = [], selectedProvinceIds } = props

    // const [selectedProvinceIds, setSelectedProvinceIds] = useState([])
    const [provinces, setProvinces] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectionMethod, setSelectionMethod] = useState('all')
    const { getFileImage } = helpFunctions

    // Fetch provinces from API
    const fetchProvinces = async () => {
        try {
            const res = await BannerService.getProvinceOpt({ access_token })
            setProvinces(res?.data || [])
        } catch (error) {
            console.error('Error fetching provinces:', error)
        }
    }

    useEffect(() => {
        fetchProvinces()
    }, [])


    useEffect(() => {
        if (defaultProvinceIds?.length > 0) {
            setSelectedProvinceIds(defaultProvinceIds)
            form.setFieldsValue({ provinces: defaultProvinceIds })
        }
    }, [defaultProvinceIds, form])

    // Update form values when selection changes
    useEffect(() => {
        if (selectionMethod === 'all') {
            form.setFieldsValue({ provinces: provinces.map((p) => p._id) })
        } else {
            form.setFieldsValue({ provinces: selectedProvinceIds })
        }
    }, [selectionMethod, selectedProvinceIds, provinces, form])

    // Handle province checkbox selection
    const handleProvinceCheckboxChange = (checkedValues) => {
        setSelectedProvinceIds(checkedValues)
        form.setFieldsValue({ provinces: checkedValues })
    }

    // Handle toggle click
    const handleToggle = (value) => {
        setSelectionMethod(value)
        form.setFieldsValue({ selectionMethod: value })
    }

    // Filter provinces based on search term
    const filteredProvinces = provinces.filter(
        (province) =>
            province?.provinceEn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            province?.provinceKh?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const onFinish = (values) => {
        const finalSelection =
            selectionMethod === 'all'
                ? provinces.map((p) => p._id)
                : selectedProvinceIds
    }

    return (
        <div>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ selectionMethod: 'specific' }}
            >
                <Row gutter={[24, 16]}>
                    <Col xs={24} sm={24}>
                        {/* Hidden field that actually stores value in Form */}
                        <Form.Item name="selectionMethod" noStyle>
                            <Input type="hidden" />
                        </Form.Item>

                        {/* Pretty full-width toggle */}
                        <div className="w-full flex justify-start mb-3">
                            <div className="w-full  bg-gray-500 rounded-full p-1 flex">
                                <button
                                    type="button"
                                    onClick={() => handleToggle('all')}
                                    className={`flex-1 text-center py-2 text-sm font-semibold rounded-full transition-all
                    ${selectionMethod === 'all'
                                            ? 'bg-white text-purple-600 shadow'
                                            : 'bg-transparent text-white'
                                        }`}
                                >
                                    All Provinces
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleToggle('specific')}
                                    className={`flex-1 text-center py-2 text-sm font-semibold rounded-full transition-all
                    ${selectionMethod === 'specific'
                                            ? 'bg-white text-purple-600 shadow'
                                            : 'bg-transparent text-white'
                                        }`}
                                >
                                    Select specific provinces
                                </button>
                            </div>
                        </div>

                        {selectionMethod === 'specific' && (
                            <Form.Item
                                name="provinces"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please select at least one province!',
                                    },
                                ]}
                            >
                                <div>
                                    <Input
                                        placeholder="Search provinces..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="mb-2 rounded-lg"
                                    />
                                    <Checkbox.Group
                                        onChange={handleProvinceCheckboxChange}
                                        value={selectedProvinceIds}
                                        className="w-full"
                                    >
                                        <div className="max-h-60 w-full overflow-y-auto border rounded-xl p-2 bg-gray-50">
                                            <Space direction="vertical" className="w-full">
                                                {filteredProvinces.map((province) => (

                                                    <Checkbox
                                                        key={province._id}
                                                        value={province._id}
                                                        className="w-full p-3 border border-gray-200 rounded-xl shadow-sm hover:bg-white transition-colors duration-200"
                                                    >
                                                        <div className="flex items-center">
                                                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-500">
                                                                <img
                                                                    src={province?.images?.[3]}
                                                                    alt={province?._id}
                                                                    className="w-8 h-8 rounded-full object-cover shadow-sm"
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-gray-800 text-base">
                                                                    {province.provinceEn}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    {province.provinceKh}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Checkbox>
                                                ))}
                                            </Space>
                                        </div>
                                    </Checkbox.Group>
                                </div>
                            </Form.Item>
                        )}

                        <div className="text-sm text-gray-500">
                            {selectionMethod === 'all'
                                ? `All ${provinces?.length} provinces selected`
                                : `${selectedProvinceIds?.length} province(s) selected`}
                        </div>
                    </Col>
                </Row>
            </Form>
        </div>
    )
}

export default ProvinceSection
