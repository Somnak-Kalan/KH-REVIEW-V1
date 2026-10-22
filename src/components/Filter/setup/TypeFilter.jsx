import { SearchOutlined } from '@ant-design/icons'
import { AutoComplete, Col, Input, Row } from 'antd'
import React from 'react'

const TypeFilterOnly = ({ typeFilter, typeName = '...' }) => {
    const handleChangeSearch = (value) => {
        if (typeof typeFilter === 'function') typeFilter(value ?? '')
    }

    return (
        <Row className="card">
            <Col xs={24} sm={14} lg={14} xl={12} className="m">
                <AutoComplete
                    style={{ width: '100%' }}
                    onSearch={handleChangeSearch}
                    onChange={handleChangeSearch}
                    allowClear
                >
                    <Input
                        placeholder={`search ${typeName || '...'}`}
                        onChange={(e) => handleChangeSearch(e.target.value)}
                        style={{ paddingTop: 5, paddingBottom: 5, caretColor: '#fff' }}
                        className="dark:bg-slate-900 dark:text-slate-200"
                        prefix={<SearchOutlined style={{ fontSize: 16, color: '#1890ff' }} />}
                    />
                </AutoComplete>
            </Col>
        </Row>
    )
}

export default TypeFilterOnly
