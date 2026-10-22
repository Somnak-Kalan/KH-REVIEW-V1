import { AutoComplete, Row, Col, Input } from 'antd'
import {
  FilterOutlined,
  PullRequestOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { useState } from 'react'
import Filter from './Filter'
export default function Search({
  clickedKey,
  onHandleSearch,
  onHandleAllFilter,
  svgProps,
}) {
  const [filterVisible, setFilterVisible] = useState(false)
  const handleChangeSearch = async (value) => {
    if (typeof onHandleSearch === 'function') {
      onHandleSearch({
        search: value,
      })
    }
  }
  return (
    <Row>
      {filterVisible && (
        <Filter
          filterVisible={filterVisible}
          setFilterVisible={setFilterVisible}
          onHandleAllFilter={onHandleAllFilter}
        />
      )}

      <Col xs={24} sm={24} className='flex items-center'>
        <AutoComplete
          style={{ width: '100%' }}
          onChange={handleChangeSearch}
          allowClear
        >
          <Input
            id='search_text_value'
            placeholder='search'
            style={{ paddingTop: '5px', paddingBottom: '5px' }}
            prefix={
              <SearchOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
            }
          />
        </AutoComplete>
        <span
          onClick={() => setFilterVisible(true)}
          className='px-2 mt-1 py-1  flex items-center    mx-1  text-white rounded '
          style={{ background: '#0076CE', cursor: 'pointer' }}
        >
          <svg
            {...svgProps}
            width='20'
            viewBox='0 0 24 24'
            stroke='white'
            fill='none'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            //   style={{ background: 'blue' }}
          >
            {/* Top slider line */}
            <line x1='1' y1='8' x2='20' y2='8' />
            {/* Circle on top slider: solid white fill */}
            <circle cx='7' cy='8' r='3' fill='#636363' />
            {/* Bottom slider line */}
            <line x1='1' y1='16' x2='20' y2='16' />
            {/* Circle on bottom slider: solid white fill */}
            <circle cx='14' cy='16' r='3' fill='#636363' />
          </svg>
          <span className='text-md'>Filter</span>
        </span>
      </Col>
    </Row>
  )
}

// export default Search
