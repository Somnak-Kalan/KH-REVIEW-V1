import React, { useState, useEffect, useContext } from 'react'
import { Card, Row, Select, DatePicker, Col } from 'antd'

const { Option } = Select
const { RangePicker } = DatePicker
import Search from './Search'
import { AuthContext } from '../../../../../contexts/AuthContext'

//  store province
import { useAddressOptStore } from '../../../../../Stores/Address/Address'

//  store category (your file)
import useCategoryStore from '../../../../../Stores/setups/category.store'

//  store users (your file path may be different — use your real path)
import { useAdminUsersStore } from '../../../../../Stores/AdminUser/AdminUser'

export default function FilterSelection({
  onHandleFilterCategory,
  onHandleFilterProvince,
  onHandleFilterUser,
  onHandleFilterOwnership,
  onHandleSearch,
  onHandleAllFilter,
  onHandleFilterDateRange,
}) {
  const { user, access_token } = useContext(AuthContext)

  // Set initial state for each filter
  const [mainCategory, setMainCategory] = useState('All Main Category')
  const [province, setProvince] = useState('All Province')
  const [createdBy, setCreatedBy] = useState('All Responses by User')
  const [ownership, setOwnership] = useState('All Ownership')

  // =========================
  //  CATEGORY from store
  // =========================
  const { categories, fetchCategory } = useCategoryStore()

  // =========================
  //  PROVINCE from store
  // =========================
  const { provinces, fetchProvinceOpts } = useAddressOptStore()

  // =========================
  //  USERS from store
  // =========================
  const { users, fetchUsers } = useAdminUsersStore()

  //--------function-----
  const getCategory = async () => {
    try {
      // keep your doc concept: {search:''}
      await fetchCategory({
        access_token,
        doc: { search: '' },
        force: false,
      })
    } catch { }
  }

  // keep function name (but now uses store)
  const getProvince = async () => {
    try {
      await fetchProvinceOpts(access_token)
    } catch { }
  }

  const getUser = async () => {
    try {
      await fetchUsers(access_token)
    } catch { }
  }

  useEffect(() => {
    getCategory()
    getProvince()
    getUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  //filter
  const handleFilterByCategory = (value) => {
    setMainCategory(value)
    if (typeof onHandleFilterCategory === 'function') {
      onHandleFilterCategory?.({
        filterCategory: value,
      })
    }
  }

  const handleFilterProvince = (value) => {
    setProvince(value)
    if (typeof onHandleFilterProvince === 'function') {
      onHandleFilterProvince?.({
        filterProvince: value,
      })
    }
  }

  const handleFilterUser = (value) => {
    setCreatedBy(value)
    if (typeof onHandleFilterUser === 'function') {
      onHandleFilterUser?.({
        filterUser: value,
      })
    }
  }

  const handleFilterOwnership = (value) => {
    setOwnership(value)
    if (typeof onHandleFilterOwnership === 'function') {
      onHandleFilterOwnership?.({
        filterOwnership: value,
      })
    }
  }

  const handleFilterDateRange = (value) => {
    if (typeof onHandleFilterDateRange === 'function') {
      onHandleFilterDateRange?.({
        filterDateRange: value,
      })
    }
  }

  //filter
  return (
    <div>
      <div className='my-2'>
        <Row gutter={[8, 8]}>
          <Col xs={24} sm={24} md={12}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates) => {
                handleFilterDateRange(dates)
              }}
              format='YYYY-MM-DD'
            />
          </Col>

          <Col xs={24} sm={24} md={12}>
            <Search onHandleSearch={onHandleSearch} onHandleAllFilter={onHandleAllFilter} />
          </Col>

          {/*  Category uses store list */}
          <Col xs={24} sm={24} md={12} xl={6}>
            <Select
              value={mainCategory}
              onChange={handleFilterByCategory}
              style={{ width: '100%' }}
              allowClear
              showSearch
              placeholder='filter category'
              optionFilterProp='label'
            >
              {categories?.map((category) => (
                <Option
                  key={category._id}
                  value={category._id}
                  label={`${category.nameKh} ${category.nameEn}`}
                >
                  {category.nameKh}-{category.nameEn}
                </Option>
              ))}
            </Select>
          </Col>

          {/*  Province uses store list */}
          <Col xs={24} sm={24} md={12} xl={6}>
            <Select
              value={province}
              onChange={handleFilterProvince}
              style={{ width: '100%' }}
              allowClear
              showSearch
              placeholder='filter Province'
              optionFilterProp='label'
            >
              {provinces?.map((pro) => (
                <Option
                  key={pro._id || pro.provinceId}
                  value={pro.provinceId}
                  label={`${pro.provinceKh} ${pro.provinceEn}`}
                >
                  {pro.provinceKh}-{pro.provinceEn}
                </Option>
              ))}
            </Select>
          </Col>

          {/*  Users uses store list */}
          <Col xs={24} sm={24} md={12} xl={6}>
            <Select
              value={createdBy}
              onChange={handleFilterUser}
              style={{ width: '100%' }}
              allowClear
              showSearch
              placeholder='filter Responses by User'
            >
              {users?.map((u) => (
                <Option key={u._id} value={u?.username}>
                  {u?.fullName}
                </Option>
              ))}
            </Select>
          </Col>

          <Col xs={24} sm={24} md={12} xl={6}>
            <Select
              value={ownership}
              onChange={handleFilterOwnership}
              allowClear
              showSearch
              placeholder='filter Ownership'
              style={{ width: '100%' }}
            >
              <Option value='Private'>Private</Option>
              <Option value='Public'>Public</Option>
            </Select>
          </Col>
        </Row>
      </div>
    </div>
  )
}