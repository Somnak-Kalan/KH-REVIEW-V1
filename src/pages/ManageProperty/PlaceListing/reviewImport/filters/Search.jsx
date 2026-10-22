import { AutoComplete, Row, Col, Input } from 'antd'
import {
  FilterOutlined,
  PullRequestOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
const Search = (props) => {
  const { setSearch } = props
  const handleChangeSearch = (value) => {
    setSearch(value)
  }
  return (
    <Row>
      <Col xs={24} sm={24} className='flex items-center'>
        <AutoComplete
          style={{ width: '100%' }}
          onChange={handleChangeSearch}
          allowClear
        >
          <Input
            id='search_text_value'
            placeholder={`search `}
            prefix={
              <SearchOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
            }
          />
        </AutoComplete>
      </Col>
    </Row>
  )
}

export default Search
