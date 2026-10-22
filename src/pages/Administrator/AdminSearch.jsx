import { SearchOutlined } from '@ant-design/icons'
import { AutoComplete, Col, Form, Input, Row, Select } from 'antd'
import { useState } from 'react'

const AdminSearch = (props) => {
  const { setSearch, clickedKey } = props
  const handleChangeSearch = (value) => {
    setSearch(value)
  }
  return (
    <Row>
      <Col xs={24} sm={24} md={12} xl={12}>
        {clickedKey === '4' ? (
          <Form.Item
            className=' my-0 p-0'
            labelCol={{ span: 24 }}
            name='module'
          >
            <Select
              placeholder='select module'
              style={{
                color: 'red',
              }}
              options={[
                {
                  value: 1,
                  label: 'iT',
                },
              ]}
            />
          </Form.Item>
        ) : (
          <AutoComplete
            style={{
              width: '100%',
            }}
            onChange={handleChangeSearch}
            allowClear
          >
            <Input
              id='search_text_value'
              placeholder={`search ${clickedKey === '1' ? 'user' : clickedKey === '2' ? 'role' : clickedKey === '3' ? 'module' : ''}`}
              prefix={
                <SearchOutlined
                  style={{ fontSize: '16px', color: '#1890ff' }}
                />
              }
            />
          </AutoComplete>
        )}
      </Col>
    </Row>
  )
}
export default AdminSearch
