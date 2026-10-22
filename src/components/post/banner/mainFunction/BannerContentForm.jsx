import React from 'react'
import { Col, Form, Input, Select } from 'antd'
import TextEditor from '../form/TextEditor'
import LanguageSwitcher from './LanguageSwitcher'

const { Option } = Select

const BannerContentForm = ({
    form,
    language,
    setLanguage,
    onHandleChangeTitleEn,
    onHandleChangeTitleKh,
    setDescriptionEn,
    setDescriptionKh,
    descriptionEn,     //  ADD THIS
    descriptionKh,
}) => {
    return (
        <>
            <LanguageSwitcher language={language} setLanguage={setLanguage} />

            <div className="my-4">
                {/* EN */}
                <Form.Item
                    label="Title (English)"
                    style={{ marginBottom: '0px', display: language === 'en' ? 'block' : 'none' }}
                    name="titleEn"
                    labelCol={{ span: 24 }}
                    rules={[{ required: true, message: 'Please enter the English title!' }]}
                >
                    <Input
                        placeholder="Enter banner title in English"
                        onChange={(e) => onHandleChangeTitleEn(e.target.value)}
                    />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Description (English)"
                    style={{ marginBottom: '0px', display: language === 'en' ? 'block' : 'none' }}
                >
                    <TextEditor
                        language={language}
                        form={form}
                        initialContent={descriptionEn}   //  FIX: pass the real HTML
                        initialHtml={descriptionEn}      //  optional (safe)
                        setDescription={setDescriptionEn}
                    />
                </Form.Item>

                {/* KH */}
                <Form.Item
                    label="Title (Khmer)"
                    name="titleKh"
                    labelCol={{ span: 24 }}
                    style={{ marginBottom: '0px', display: language === 'kh' ? 'block' : 'none' }}
                    rules={[{ required: true, message: 'Please enter the Khmer title!' }]}
                >
                    <Input
                        placeholder="Enter banner title in Khmer"
                        onChange={(e) => onHandleChangeTitleKh(e.target.value)}
                    />
                </Form.Item>

                <Form.Item
                    labelCol={{ span: 24 }}
                    form={form}
                    style={{ marginBottom: '0px', display: language === 'kh' ? 'block' : 'none' }}
                    label="Description (Khmer)"
                    valuePropName="value"
                >
                    <TextEditor
                        language={language}
                        form={form}
                        initialContent={descriptionKh}   //  already correct in your code
                        initialHtml={descriptionKh}
                        setDescription={setDescriptionKh}
                    />
                </Form.Item>

                <Col xs={24}>
                    <Form.Item
                        label="Status"
                        name="status"
                        style={{ marginBottom: 0 }}
                        rules={[{ required: true, message: 'Please select a status!' }]}
                    >
                        <Select placeholder='Select status' allowClear>
                            <Option value='Active'>Active</Option>
                            <Option value='Inactive'>Inactive</Option>
                            <Option value='Expired'>Expired</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </div>
        </>
    )
}

export default BannerContentForm
