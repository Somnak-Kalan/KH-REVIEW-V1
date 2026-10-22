import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { HomeOutlined } from '@ant-design/icons'
import { Card, Breadcrumb, Pagination, message } from 'antd'
import '@fortawesome/fontawesome-free/css/all.min.css'
import dayjs from 'dayjs'
import EditNonBusiness from './Edit/CreateNonBusiness'
import FilterSelection from './filters/FilterSelection'
import TableView from './TableView'
import getTableColumns from './Column'
import { AuthContext } from '../../../../contexts/AuthContext'
import { PERMS } from '../../../../constants/permission/perms'
import ImageLoading from '../../../../components/Loading/ImageLoading'
// ADD: zustand store import
import { useImportReviewStore } from '../../../../Stores/ManageProperty/AllProperty/ImportReview.store'

const ReviewImport = () => {
  const { user, access_token, checkPermission } = useContext(AuthContext)
  const { setDisplayEmitContent } = useOutletContext()
  const [username, setUsername] = useState()
  useEffect(() => {
    setUsername(user?.username)
  }, [user])

  const navigate = useNavigate()

  //CHECK PERMISSION
  const hasPermission = !!user && checkPermission(PERMS.REVIEW_IMPORT_MANAGEMENT)

  useEffect(() => {
    if (!user) return //  wait user loaded (important)
    if (!hasPermission) navigate('/', { replace: true })
  }, [user, hasPermission, navigate])

  if (!user) return null
  if (!hasPermission) return null
  //END CHECK PERMISSION

  const [openEdit, setOpenEdit] = useState(false)

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [propData, setPropData] = useState()

  // Pagination (server-side)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalRecords, setTotalRecords] = useState(0)

  // Tabs & filters
  const [activeTab, setActiveTab] = useState('all')
  const [activeStatus, setActiveStatus] = useState('all')
  const [filterProvince, setFilterProvince] = useState(null)
  const [search, setSearch] = useState('')

  // zustand store (ADD)
  const { fetchReviewImportList } = useImportReviewStore()

  //  build request payload (stable)
  const requestDoc = useMemo(() => {
    return {
      page: currentPage,
      limit: pageSize,
      province: filterProvince || '',
      keyword: search || '',
    }
  }, [currentPage, pageSize, filterProvince, search])

  const requestKey = useMemo(() => JSON.stringify(requestDoc), [requestDoc])

  //  prevent duplicate requests
  const inFlightRef = useRef(false)
  const lastKeyRef = useRef('')

  const getReviewImport = async (docArg) => {
    const doc = docArg || requestDoc
    const key = JSON.stringify(doc)

    //  block duplicate same request
    if (inFlightRef.current) return
    if (lastKeyRef.current === key) return

    inFlightRef.current = true
    lastKeyRef.current = key

    setLoading(true)
    try {
      // CHANGE ONLY HERE: use store instead of service directly
      const res = await fetchReviewImportList(access_token, doc, { force: false })

      if (res) {
        const list =
          res?.data?.places ||
          res?.data?.locations ||
          res?.data ||
          res?.records ||
          res

        const normalizedList = Array.isArray(list) ? list : []
        setData(normalizedList)

        const pagination = res?.data?.pagination || res?.pagination
        if (pagination) {
          const nextPage = pagination.currentPage || 1
          const nextSize = pagination.pageSize || pageSize
          const nextTotal = pagination.totalRecords || normalizedList.length

          //  only set if different (avoid re-triggering effect)
          setCurrentPage((prev) => (prev === nextPage ? prev : nextPage))
          setPageSize((prev) => (prev === nextSize ? prev : nextSize))
          setTotalRecords(nextTotal)
        } else {
          setTotalRecords(normalizedList.length)
        }
      }
    } catch (e) {
      console.error(e)
      lastKeyRef.current = '' // allow retry
      message.error('Failed to load review import list')
    } finally {
      setLoading(false)
      inFlightRef.current = false
    }
  }

  //  ONE effect only (debounced) — no double-call on mount
  useEffect(() => {
    const t = setTimeout(() => {
      getReviewImport(requestDoc)
    }, 250)

    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey])

  // Reset current page when activeTab changes
  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab])

  const handleView = (record) => {
    navigate('/list-place/detail/' + record?._id)
  }

  const filterData = () => {
    let filtered = data
    return filtered
  }

  const onEditNonBusiness = (record) => {
    setOpenEdit(true)
    setPropData(record)
  }

  const onCityChange = (value) => {
    if (!value) {
      setFilterProvince(null)
      setCurrentPage(1)
      return
    }
    const label = value?.key
    setFilterProvince(label)
    setCurrentPage(1)
  }

  const filteredData = filterData() || []
  const tableColumns = getTableColumns(currentPage, pageSize, handleView, onEditNonBusiness)

  useEffect(() => {
    setDisplayEmitContent(
      <div className='flex justify-between my-3'>
        <div className='flex'>
          <Breadcrumb
            items={[
              { title: <HomeOutlined style={{ cursor: 'pointer' }} /> },
              { title: <span>Warehouse</span> },
              { title: <span>Place Listing</span> },
              { title: <span>Review Import Non Business</span> },
            ]}
          />
        </div>
      </div>
    )
  }, [navigate, setDisplayEmitContent])

  return (
    <>
      <EditNonBusiness
        getReviewImport={getReviewImport}
        open={openEdit}
        setOpen={setOpenEdit}
        propData={propData}
        access_token={access_token}
        username={username}
      />

      <FilterSelection
        access_token={access_token}
        onCityChange={onCityChange}
        setSearch={(v) => {
          setCurrentPage(1)
          setSearch(v)
        }}
      />

      <Card
        hidden={activeStatus === 'Dashboard'}
        title={
          <span className='text-sm'>
            <span className='text-blue-700'>{totalRecords}</span>
            <span className='text-gray-400'> | Total Amount</span>
          </span>
        }
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

          <div style={{ display: 'flex', justifyContent: 'end', textAlign: 'center', marginTop: 16 }}>
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

export default ReviewImport