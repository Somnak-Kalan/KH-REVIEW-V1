import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { HomeOutlined, SearchOutlined } from '@ant-design/icons'
import {
  Card,
  Breadcrumb,
  Pagination,
  Input,
  DatePicker,
  Select,
  Row,
  Col,
  Checkbox,
  message,
} from 'antd'
import dayjs from 'dayjs'
import TableView from './TableView'
import getTableColumns from './Column'
import AddRemark from '../other/AddRemark'
import AddComment from '../other/AddComment'
import { AuthContext } from '../../../../contexts/AuthContext'
import { PERMS } from '../../../../constants/permission/perms'
import { useTaskCommentStore } from '../../../../Stores/ManageProperty/Task/TaskComment.store'
import ImageLoading from '../../../../components/Loading/ImageLoading'
const { RangePicker } = DatePicker
const { Option } = Select

const Tasks = () => {
  const { setDisplayEmitContent } = useOutletContext()
  const { access_token, checkPermission } = useContext(AuthContext)
  const navigate = useNavigate()

  //  store state
  const { data, pagination, loading, fetchCommentList, lastKey } =
    useTaskCommentStore()

  // Redirect if no permission
  useEffect(() => {
    if (!checkPermission(PERMS.FOLLOW_UP_MANAGEMENT)) {
      navigate('/', { replace: true })
    }
  }, [checkPermission, navigate])

  if (!checkPermission(PERMS.FOLLOW_UP_MANAGEMENT)) return null

  // “Add” modals
  const [isAddRemarkOpen, setIsAddRemarkOpen] = useState(false)
  const [isCommentOpen, setCommentOpen] = useState(false)

  // Pagination (server-side)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalRecords, setTotalRecords] = useState(0)

  // Filters
  const [filterReady, setFilterReady] = useState(false)
  const [dateRange, setDateRange] = useState([])
  const [filterRemark, setFilterRemark] = useState('all')
  const [searchText, setSearchText] = useState('')

  // sync local pagination from store response
  useEffect(() => {
    const pg = pagination || {}
    const nextPage = pg.currentPage || 1
    const nextSize = pg.pageSize || 10
    const nextTotal = pg.totalRecords || 0

    setCurrentPage((prev) => (prev === nextPage ? prev : nextPage))
    setPageSize((prev) => (prev === nextSize ? prev : nextSize))
    setTotalRecords(nextTotal)
  }, [pagination])

  // ---------- BUILD PAYLOAD ----------
  const backendFilters = useMemo(() => {
    const [startDate, endDate] = dateRange || []

    let markAsText = ''
    if (filterRemark === '2') markAsText = 'Special remark'
    else if (filterRemark === '3') markAsText = 'Follow up'

    return {
      markAs: markAsText,
      startDate: startDate ? dayjs(startDate).format('YYYY-MM-DD') : '',
      endDate: endDate ? dayjs(endDate).format('YYYY-MM-DD') : '',
      search: searchText?.trim() || '',
      page: currentPage,
      limit: pageSize,
    }
  }, [dateRange, filterRemark, searchText, currentPage, pageSize])

  const filtersKey = useMemo(
    () => JSON.stringify(backendFilters),
    [backendFilters]
  )

  //  one effect only (debounced) + store cache prevents refetch on route switch
  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        //  if same filtersKey already in store and has data -> skip calling
        const hasData = (data?.length || 0) > 0
        if (lastKey === filtersKey && hasData) return

        const res = await fetchCommentList(access_token, backendFilters)
        if (!res) message.error('Failed to load tasks')
      } catch (e) {
        console.error(e)
        message.error('Failed to load tasks')
      }
    }, 250)

    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, access_token])

  // ---------- READY FILTER ----------
  const flattenComments = (comments = []) => {
    const result = []
    const recurse = (items) => {
      for (const item of items) {
        result.push(item)
        if (Array.isArray(item.replyComment) && item.replyComment.length > 0) {
          recurse(item.replyComment)
        }
      }
    }
    recurse(comments)
    return result
  }

  const checkMark = (item) => {
    const flatComments = flattenComments(item?.comments || [])
    const allRemarkComments = flatComments.filter(
      (c) =>
        c.markAs?.toLowerCase().trim() === 'special remark' ||
        c.markAs?.toLowerCase().trim() === 'follow up'
    )
    return allRemarkComments?.length > 0
  }

  const filteredData = useMemo(() => {
    let filtered = data || []
    if (filterReady) filtered = filtered.filter((item) => checkMark(item))
    return filtered
  }, [data, filterReady])

  const tableColumns = getTableColumns()

  // Breadcrumb & page title
  useEffect(() => {
    setDisplayEmitContent(
      <div className='flex justify-between my-3'>
        <Breadcrumb
          items={[
            { title: <HomeOutlined style={{ cursor: 'pointer' }} /> },
            { title: <span>Warehouse</span> },
            { title: <span>Place Listing</span> },
            { title: <span>Task</span> },
          ]}
        />
      </div>
    )
  }, [navigate, setDisplayEmitContent])

  // filter handlers reset page first
  const onDateRangeChange = (dates) => {
    setCurrentPage(1)
    setDateRange(dates)
  }
  const onRemarkChange = (val) => {
    setCurrentPage(1)
    setFilterRemark(val ?? 'all')
  }
  const onSearchChange = (value) => {
    setCurrentPage(1)
    setSearchText(value)
  }

  return (
    <>
      <AddRemark open={isAddRemarkOpen} setOpen={setIsAddRemarkOpen} />
      <AddComment open={isCommentOpen} setOpen={setCommentOpen} />

      <Card
        style={{
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          marginBottom: 16,
        }}
        styles={{ body: { padding: 16 } }}
      >
        <Row gutter={[8, 8]} align='middle'>
          <Col xs={24} sm={24} md={12}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={onDateRangeChange}
              placeholder={['Start date', 'End date']}
            />
          </Col>

          <Col xs={0} sm={0} md={11}>
            <Input
              prefix={<SearchOutlined />}
              placeholder='Search'
              allowClear
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </Col>

          <Col xs={24} sm={24} md={12}>
            <Select
              style={{ width: '100%' }}
              placeholder='Special remark'
              value={filterRemark === 'all' ? undefined : filterRemark}
              onChange={onRemarkChange}
              allowClear
            >
              <Option value='all'>All</Option>
              <Option value='2'>Special Remark</Option>
              <Option value='3'>Follow Up</Option>
            </Select>
          </Col>

          <Col flex='auto' />

          <Col xs={24} sm={24} md={0}>
            <Input
              prefix={<SearchOutlined />}
              placeholder='Search'
              allowClear
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </Col>
        </Row>
      </Card>

      <Card
        title={
          <span className='text-sm flex items-center space-x-2'>
            <span className='text-blue-700'>{totalRecords}</span>
            <span className='text-gray-400'>| Total Amount</span>
            <Checkbox
              checked={filterReady}
              onChange={(e) => setFilterReady(e.target.checked)}
            >
              Ready
            </Checkbox>
          </span>
        }
        style={{ borderRadius: 12 }}
      >
        <div style={{ position: 'relative' }}>
          {loading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.6)',
              }}
            >
              <ImageLoading overlay={false} size={60} logoSize={25} />
            </div>
          )}
          <TableView
            data={filteredData}
            loading={loading}
            columns={tableColumns}
            currentPage={currentPage}
            pageSize={pageSize}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalRecords}
              onChange={(page, size) => {
                setCurrentPage(page)
                setPageSize(size)
              }}
              pageSizeOptions={['10', '20', '50', '100']}
              showSizeChanger
            />
          </div>
        </div>
      </Card>
    </>
  )
}

export default Tasks