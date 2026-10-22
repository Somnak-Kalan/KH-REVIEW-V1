import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AuthContext } from '../../../contexts/AuthContext'
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom'
import {
  CopyOutlined,
  EditOutlined,
  EyeOutlined,
  HomeOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { Avatar, Breadcrumb, Button, Table, Tabs, Tooltip, message, Empty, Card } from 'antd'
import dayjs from 'dayjs'

import AddType from './Add'
import EditType from './Edit'
import helpFunctions from '../../../utils/helpFunctions'
import { PERMS } from '../../../constants/permission/perms'
import './Type.scss'
import useTypeStore from '../../../Stores/setups/type.store'
import TableHeader from '../../../widgets/TableHeader'
import TypeFilterOnly from '../../../components/Filter/setup/TypeFilter'
import ImageLoading from '../../../components/Loading/ImageLoading'
const Types = () => {
  const { access_token, checkPermission } = useContext(AuthContext)
  const { setDisplayEmitContent } = useOutletContext()
  const navigate = useNavigate()
  const location = useLocation()
  const { getFileImage } = helpFunctions
  const [imgLoadingMap, setImgLoadingMap] = useState({})
  const { fetchType, types, loading: storeLoading } = useTypeStore()

  //  permissions once
  const canManage = useMemo(
    () => checkPermission?.(PERMS.TYPE_MANAGEMENT),
    [checkPermission]
  )
  const canEdit = useMemo(
    () => checkPermission?.(PERMS.ASSIGNED_USER),
    [checkPermission]
  )

  // redirect once
  useEffect(() => {
    if (!canManage) navigate('/', { replace: true })
  }, [canManage, navigate])

  if (!canManage) return null

  // tab from route
  const initialTab = location.pathname.endsWith('/food') ? 'Food' : 'Place'
  const [currentTab, setCurrentTab] = useState(initialTab)

  // modals
  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [propData, setPropData] = useState(null)

  // table paging + search
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [search, setSearch] = useState('')

  // sync tab when URL changes
  useEffect(() => {
    const tab = location.pathname.endsWith('/food') ? 'Food' : 'Place'
    setCurrentTab(tab)
    setCurrentPage(1)
    setSearch('')
  }, [location.pathname])

  // header
  useEffect(() => {
    setDisplayEmitContent(
      <div className='flex justify-between my-3'>
        <div className='font-semibold text-gray-700 dark:text-slate-300'>Type</div>
        <Breadcrumb
          items={[
            { title: <HomeOutlined style={{ cursor: 'pointer' }} /> },
            { title: 'Type' },
          ]}
        />
      </div>
    )
  }, [setDisplayEmitContent])

  //  debounced fetch (prevents request spam)
  const lastQueryRef = useRef('')
  useEffect(() => {
    if (!access_token) return

    const q = `${currentTab}__${search || ''}`
    // avoid repeating same call due to re-render/mount
    if (lastQueryRef.current === q) return

    const t = setTimeout(() => {
      lastQueryRef.current = q

      fetchType({
        access_token,
        type: currentTab,
        search,
        //  don't force every time
        // force: true,
      }).catch(() => message.error('Failed to load data'))
    }, 300)

    return () => clearTimeout(t)
  }, [access_token, currentTab, search, fetchType])

  const handleTabChange = (key) => {
    setCurrentPage(1)
    setSearch('')
    navigate(`/type/${key.toLowerCase()}`)
  }

  const handleView = (record) => navigate(`/type/detail/${record?._id}`)

  const handleEdit = (record) => {
    setPropData(record)
    setOpenEdit(true)
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      message.success(`Copied ID: ${text}`)
    } catch {
      message.error('Copy failed')
    }
  }

  const renderNo = (_, __, index) => (currentPage - 1) * pageSize + index + 1

  // store returns already filtered by type; keep safe filter
  const dataSource = useMemo(() => {
    return (types || []).filter((x) => x?.type === currentTab)
  }, [types, currentTab])
  //  image loading map

  useEffect(() => {
    const next = {}
      ; (types || []).forEach((item) => {
        const url = item?.images?.find((img) => img.includes('original'))
        if (item?._id) next[item._id] = Boolean(url)
      })
    setImgLoadingMap(next)
  }, [types])
  const columns = useMemo(
    () => [
      {
        title: 'No',
        width: 60,
        align: 'center',
        render: renderNo,
      },
      {
        title: 'Copy ID',
        align: 'center',
        render: (_, rec) => (
          <CopyOutlined
            onClick={() => copyToClipboard(rec?._id)}
            className='text-blue-500 hover:text-blue-600 cursor-pointer'
          />
        ),
      },
      {
        title: 'Type Name',

        align: 'left',
        render: (_, record) => {
          const url = record?.images?.find((img) => img.includes('original'))
          const isLoading = Boolean(record?._id && imgLoadingMap[record._id])

          return (
            <div
              className='flex items-center'
              style={{
                gap: 10,
                justifyContent: 'flex-start',
              }}
            >
              <div
                style={{
                  width: 35,
                  height: 35,
                  minWidth: 35,
                  borderRadius: 4,
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                {!url ? (
                  <Avatar shape='square' size={35} style={{ cursor: 'pointer' }} />
                ) : (
                  <>
                    {isLoading ? (
                      <div
                        style={{
                          width: 35,
                          height: 35,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <ImageLoading overlay={false} size={30} logoSize={10} />
                      </div>
                    ) : null}

                    <img
                      src={url}
                      alt='preload'
                      style={{
                        width: 1,
                        height: 1,
                        opacity: 0,
                        position: 'absolute',
                        pointerEvents: 'none',
                      }}
                      onLoad={() => {
                        setImgLoadingMap((prev) => ({
                          ...prev,
                          [record?._id]: false,
                        }))
                      }}
                      onError={() => {
                        setImgLoadingMap((prev) => ({
                          ...prev,
                          [record?._id]: false,
                        }))
                      }}
                    />

                    {!isLoading ? (
                      <Avatar
                        shape='square'
                        size={35}
                        src={url}
                        style={{ cursor: 'pointer' }}
                      />
                    ) : null}
                  </>
                )}
              </div>

              <div
                className='cursor-pointer'
                onClick={() => handleView(record)}
                style={{ lineHeight: 1.2, textAlign: 'left' }}
              >
                <div
                  className='text-blue-800 dark:text-slate-400'
                  style={{ fontWeight: 600 }}
                >
                  {record?.nameEn || '-'}
                </div>
                <div
                  className='font-bold text-gray-500 hover:underline'
                  style={{ fontSize: 12 }}
                >
                  {record?.nameKh || ''}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        align: 'center',
        render: (v) => <span className='text-gray-700 dark:text-slate-300'>{v}</span>,
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        render: (_, record) => (
          <span className='text-gray-600 dark:text-slate-400'>
            {record?.description !== 'undefined' ? record?.description : ''}
          </span>
        ),
      },
      {
        title: 'CreatedAt',
        dataIndex: 'createdAt',
        key: 'createdAt',
        align: 'center',
        render: (_, record) => dayjs(record?.createdAt).format('YYYY-MM-DD'),
      },
      {
        title: 'Action',
        key: 'action',
        width: 120,
        align: 'center',
        render: (_, record) => (
          <div className='flex justify-center'>
            <Tooltip title='View'>
              <Button
                icon={<EyeOutlined style={{ color: 'green' }} />}
                shape='circle'
                size='small'
                onClick={() => handleView(record)}
                style={{ marginRight: 8 }}
              />
            </Tooltip>

            {canEdit ? (
              <Button
                icon={<EditOutlined />}
                shape='circle'
                size='small'
                onClick={() => handleEdit(record)}
              />
            ) : null}
          </div>
        ),
      },
    ],
    [currentPage, pageSize, canEdit, currentTab]
  )

  const pagination = {
    current: currentPage,
    pageSize,
    total: dataSource.length,
    onChange: (page, size) => {
      setCurrentPage(page)
      setPageSize(size)
    },
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
  }
  const tabHeader = () => {
    return (
      <div className='mb-6'>
        <Tabs
          activeKey={currentTab}
          onChange={handleTabChange}
          className='type-tabs'
          items={[
            { label: 'Place', key: 'Place' },
            { label: 'Food', key: 'Food' },
          ]}
        />
      </div>
    )
  }
  return (
    <>
      {openAdd ? (
        <AddType
          open={openAdd}
          setOpen={setOpenAdd}
          access_token={access_token}
          type={currentTab}
        />
      ) : null}

      {openEdit ? (
        <EditType
          open={openEdit}
          setOpen={setOpenEdit}
          propData={propData}
          access_token={access_token}
          getFileImage={getFileImage}
          category={currentTab}
        />
      ) : null}

      <div className='mb-2' style={{ borderRadius: '5px' }}>
        <div className='mb-2 px-3 sm:px-5 py-4 bg-white rounded-lg dark:bg-slate-900'>
          <div className='sm:flex justify-between items-center'>
            <div className='w-full md:w-full 2xl:w-5/6 sm:mx-1 md:mx-0'>
              <TypeFilterOnly typeFilter={setSearch} typeName="Type" />
            </div>

            {canEdit ? (
              <Button
                type='primary'
                style={{ background: '#1677ff' }}
                className='cursor-pointer text-white mt-2'
                onClick={() => setOpenAdd(true)}
              >
                <PlusOutlined /> add
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <TableHeader total={dataSource?.length} label="Total Amount" tabsHeader={tabHeader()}>
        <div
          style={{
            position: 'relative',
            minHeight: 250,
          }}
        >
          {storeLoading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.6)',
                borderRadius: 8,
              }}
            >
              <ImageLoading overlay={false} size={60} logoSize={25} />
            </div>
          )}

          <Table
            rowKey={(r) => r._id}
            columns={columns}
            dataSource={dataSource}
            loading={false}
            pagination={pagination}
            scroll={{ x: 'max-content' }}
            className="dark:bg-slate-900 dark:text-slate-200"
          />

          {dataSource.length === 0 && !storeLoading ? (
            <Empty
              className='mt-8'
              description={<span className="dark:text-slate-400">No data exists</span>}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : null}
        </div>
      </TableHeader>
    </>
  )
}

export default Types