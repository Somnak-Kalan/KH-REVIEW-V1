import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Checkbox, Button, Card, Space, Input, Radio } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import 'tailwindcss/tailwind.css'; // Assuming Tailwind CSS is configured

// Data for all Cambodian provinces
const cambodiaProvinces = [
    { _id: '1', provinceEn: 'Banteay Meanchey', provinceKh: 'បន្ទាយមានជ័យ' },
    { _id: '2', provinceEn: 'Battambang', provinceKh: 'បាត់ដំបង' },
    { _id: '3', provinceEn: 'Kampong Cham', provinceKh: 'កំពង់ចាម' },
    { _id: '4', provinceEn: 'Kampong Chhnang', provinceKh: 'កំពង់ឆ្នាំង' },
    { _id: '5', provinceEn: 'Kampong Speu', provinceKh: 'កំពង់ស្ពឺ' },
    { _id: '6', provinceEn: 'Kampong Thom', provinceKh: 'កំពង់ធំ' },
    { _id: '7', provinceEn: 'Kampot', provinceKh: 'កំពត' },
    { _id: '8', provinceEn: 'Kandal', provinceKh: 'កណ្ដាល' },
    { _id: '9', provinceEn: 'Koh Kong', provinceKh: 'កោះកុង' },
    { _id: '10', provinceEn: 'Kratie', provinceKh: 'ក្រចេះ' },
    { _id: '11', provinceEn: 'Mondulkiri', provinceKh: 'មណ្ឌលគិរី' },
    { _id: '12', provinceEn: 'Phnom Penh', provinceKh: 'ភ្នំពេញ' },
    { _id: '13', provinceEn: 'Preah Vihear', provinceKh: 'ព្រះវិហារ' },
    { _id: '14', provinceEn: 'Prey Veng', provinceKh: 'ព្រៃវែង' },
    { _id: '15', provinceEn: 'Pursat', provinceKh: 'ពោធិ៍សាត់' },
    { _id: '16', provinceEn: 'Ratanakiri', provinceKh: 'រតនគិរី' },
    { _id: '17', provinceKh: 'Siem Reap', provinceEn: 'សៀមរាប' },
    { _id: '18', provinceEn: 'Preah Sihanouk', provinceKh: 'ព្រះសីហនុ' },
    { _id: '19', provinceEn: 'Stung Treng', provinceKh: 'ស្ទឹងត្រែង' },
    { _id: '20', provinceEn: 'Svay Rieng', provinceKh: 'ស្វាយរៀង' },
    { _id: '21', provinceEn: 'Takeo', provinceKh: 'តាកែវ' },
    { _id: '22', provinceEn: 'Oddar Meanchey', provinceKh: 'ឧត្ដរមានជ័យ' },
    { _id: '23', provinceEn: 'Kep', provinceKh: 'កែប' },
    { _id: '24', provinceEn: 'Pailin', provinceKh: 'ប៉ៃលិន' },
    { _id: '25', provinceEn: 'Tboung Khmum', provinceKh: 'ត្បូងឃ្មុំ' },
];

const ProvinceSection = (props) => {
    // Props are not used in this example but are kept for consistency
    const { provinces, access_token } = props;

    const [form] = Form.useForm();
    // State to hold the IDs of specifically selected provinces
    const [selectedProvinceIds, setSelectedProvinceIds] = useState([]);
    // State to manage the search input for provinces
    const [searchTerm, setSearchTerm] = useState('');
    // State to manage the radio button selection: 'all' or 'specific'
    const [selectionMethod, setSelectionMethod] = useState('specific');

    // This effect runs whenever the radio button selection changes
    useEffect(() => {
        // If 'all provinces' is selected, update the form field with all province IDs
        if (selectionMethod === 'all') {
            form.setFieldValue('provinces', cambodiaProvinces.map(p => p._id));
        } else {
            // Otherwise, set the form value to the currently selected IDs
            form.setFieldValue('provinces', selectedProvinceIds);
        }
    }, [selectionMethod, form, selectedProvinceIds]);

    // Handler for when a province checkbox is checked or unchecked
    const handleProvinceCheckboxChange = (checkedValues) => {
        setSelectedProvinceIds(checkedValues);
        form.setFieldValue('provinces', checkedValues);
    };

    // Handler for when the radio button selection changes
    const handleRadioChange = (e) => {
        setSelectionMethod(e.target.value);
    };

    // Filter the provinces based on the search term
    const filteredProvinces = cambodiaProvinces.filter(province =>
        province.provinceEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        province.provinceKh.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Form submission handler
    const onFinish = (values) => {
        let finalSelection;
        if (selectionMethod === 'all') {
            // If 'all' is selected, the final result should be all province IDs
            finalSelection = cambodiaProvinces.map(p => p._id);
        } else {
            // If 'specific' is selected, use the IDs from the checkboxes
            finalSelection = selectedProvinceIds;
        }
        console.log('Form values:', { ...values, selectedProvinces: finalSelection });
    };

    return (
        <div className="">

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{
                    status: 'Active',
                }}
            >
                <Row gutter={[24, 16]}>
                    <Col xs={24} sm={24}>
                        <Form.Item
                            // label="Provinces"
                            style={{ marginBottom: "0px" }}
                            name="selectionMethod"
                            initialValue="specific"
                        >
                            <Radio.Group
                                onChange={handleRadioChange}
                                value={selectionMethod}
                                className="w-full "
                            >
                                <Space className="w-full">
                                    <Radio value="all">All Provinces</Radio>
                                    <Radio value="specific">Select specific provinces</Radio>
                                </Space>
                            </Radio.Group>
                        </Form.Item>

                        {/* This section is only shown when 'Select specific provinces' is chosen */}
                        {selectionMethod === 'specific' && (
                            <Form.Item

                                name="provinces"
                                rules={[{ required: true, message: 'Please select at least one province!' }]}
                            >
                                <Input
                                    placeholder="Search provinces..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="mb-2 rounded-lg"
                                    disabled={selectionMethod === 'all'}
                                />
                                <Checkbox.Group
                                    onChange={handleProvinceCheckboxChange}
                                    value={selectedProvinceIds}
                                    className="w-full"
                                    style={{ width: '100%' }}
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
                                                            <CheckCircleFilled />
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-800 text-base">
                                                                {province.provinceKh} - {province.provinceEn}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                This is some descriptive text for the province.
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Checkbox>
                                            ))}
                                        </Space>
                                    </div>
                                </Checkbox.Group>
                            </Form.Item>
                        )}

                        <div className=" text-sm text-gray-500">
                            {selectionMethod === 'all'
                                ? `All ${cambodiaProvinces.length} provinces selected`
                                : `${selectedProvinceIds.length} province(s) selected`}
                        </div>
                    </Col>
                </Row>

            </Form>

        </div>
    );
};

export default ProvinceSection;
