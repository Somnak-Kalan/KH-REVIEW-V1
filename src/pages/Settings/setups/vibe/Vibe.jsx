import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Breadcrumb,
  Button,
  Input,
  Table,
  Tooltip,
} from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  HomeOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { useOutletContext } from 'react-router-dom'
import Swal from 'sweetalert2'
import dayjs from 'dayjs'

import { AuthContext } from '../../../../contexts/AuthContext'
import TableHeader from '../../../../widgets/TableHeader'
import useVibeStore from '../../../../Stores/settings/setups/vibe.store'

import AddVibe from './Add'
import EditVibe from './Edit'

const isValidValue = (value) => {
  return (
    value !== undefined &&
    value !== null &&
    value !== 'undefined' &&
    value !== 'null' &&
    value !== ''
  )
}

const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.data ||
    error?.message ||
    'Something went wrong'
  )
}

const getCreatedBy = (value) => {
  if (!value) return '-'

  if (typeof value === 'object') {
    return (
      value?.username ||
      value?.name ||
      value?.fullName ||
      value?.email ||
      value?._id ||
      '-'
    )
  }

  return value
}

const VibeList = () => {
  const { access_token } = useContext(AuthContext)

  const outletContext = useOutletContext()
  const setDisplayEmitContent =
    outletContext?.setDisplayEmitContent

  const vibes = useVibeStore((state) => state.vibes)
  const loadingList = useVibeStore(
    (state) => state.loading
  )

  const fetchVibes = useVibeStore(
    (state) => state.fetchVibes
  )

  const deleteVibe = useVibeStore(
    (state) => state.deleteVibe
  )

  const [search, setSearch] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [selectedVibe, setSelectedVibe] = useState(null)

  useEffect(() => {
    if (!setDisplayEmitContent) return

    setDisplayEmitContent(
      <div className='my-3 flex items-center justify-between'>
        <div className='font-semibold text-gray-700 dark:text-slate-300'>
          Vibe
        </div>

        <Breadcrumb
          items={[
            {
              title: (
                <HomeOutlined className='cursor-pointer' />
              ),
            },
            {
              title: <span>Vibe</span>,
            },
          ]}
        />
      </div>
    )
  }, [setDisplayEmitContent])

  useEffect(() => {
    if (!access_token) return

    const timer = setTimeout(() => {
      fetchVibes({
        access_token,
        doc: {
          search,
        },
      }).catch((error) => {
        console.error('Fetch vibe list error:', error)
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [
    access_token,
    search,
    fetchVibes,
  ])

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  useEffect(() => {
    const lastPage = Math.max(
      1,
      Math.ceil((vibes?.length || 0) / pageSize)
    )

    if (currentPage > lastPage) {
      setCurrentPage(lastPage)
    }
  }, [
    vibes?.length,
    pageSize,
    currentPage,
  ])

  const handleOpenEdit = useCallback((record) => {
    setSelectedVibe(record)
    setOpenEdit(true)
  }, [])

  const handleCloseEdit = useCallback((value) => {
    setOpenEdit(value)

    if (!value) {
      setSelectedVibe(null)
    }
  }, [])

  // SweetAlert2 only. There is no Delete.jsx file.
  const handleDeleteVibe = useCallback(
    async (record) => {
      if (!record?._id) {
        Swal.fire({
          icon: 'error',
          title: 'Data Not Found!',
          text: 'Vibe information was not found.',
        })

        return
      }

      const result = await Swal.fire({
        icon: 'warning',
        title: 'Are you sure?',
        text: 'Do you really want to delete this vibe?',
        width: 410,

        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No',

        confirmButtonColor: '#ef233c',
        cancelButtonColor: '#1677ff',

        reverseButtons: false,
        focusCancel: true,
        showLoaderOnConfirm: true,

        allowOutsideClick: () => !Swal.isLoading(),
        allowEscapeKey: () => !Swal.isLoading(),

        preConfirm: async () => {
          try {
            await deleteVibe({
              access_token,
              _id: record._id,
            })

            return true
          } catch (error) {
            Swal.showValidationMessage(
              getErrorMessage(error)
            )

            return false
          }
        },
      })

      if (!result.isConfirmed) return

      await Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'The vibe has been deleted successfully.',
        showConfirmButton: false,
        timer: 1500,
      })
    },
    [
      access_token,
      deleteVibe,
    ]
  )

  const renderDescription = useCallback(
    (_, record) => {
      const description = record?.description

      if (!isValidValue(description)) {
        return '-'
      }

      const text = String(description)

      if (text.length <= 50) {
        return (
          <span className='text-gray-600 dark:text-slate-300'>
            {text}
          </span>
        )
      }

      return (
        <Tooltip title={text}>
          <span className='inline-block max-w-[280px] overflow-hidden text-ellipsis whitespace-nowrap align-middle text-gray-600 dark:text-slate-300'>
            {text}
          </span>
        </Tooltip>
      )
    },
    []
  )

  const columns = useMemo(
    () => [
      {
        title: (
          <span className='table-header text-white'>
            No
          </span>
        ),
        key: 'no',
        width: 70,
        align: 'center',
        render: (_, __, index) => {
          return (
            (currentPage - 1) * pageSize +
            index +
            1
          )
        },
      },
      {
        title: (
          <span className='table-header text-white'>
            Vibe Name
          </span>
        ),
        key: 'vibeName',
        width: 300,
        render: (_, record) => (
          <div className='leading-tight'>
            <div className='font-semibold text-blue-800 dark:text-blue-400'>
              {record?.nameEn || '-'}
            </div>

            <div className='mt-1 text-xs font-medium text-gray-500 dark:text-slate-400'>
              {record?.nameKh || '-'}
            </div>
          </div>
        ),
      },

      {
        title: (
          <span className='table-header text-white'>
            Created By
          </span>
        ),
        dataIndex: 'createdBy',
        key: 'createdBy',
        align: 'center',
        width: 160,
        render: (value) => getCreatedBy(value),
      },
      {
        title: (
          <span className='table-header text-white'>
            Created At
          </span>
        ),
        dataIndex: 'createdAt',
        key: 'createdAt',
        align: 'center',
        width: 160,
        render: (value) => {
          return value
            ? dayjs(value).format('YYYY-MM-DD')
            : '-'
        },
      },
      {
        title: (
          <span className='table-header text-white'>
            Action
          </span>
        ),
        key: 'action',
        align: 'center',
        width: 130,
        render: (_, record) => (
          <div className='flex items-center justify-center gap-2'>
            <Tooltip title='Edit'>
              <Button
                type='primary'
                shape='circle'
                size='small'
                icon={<EditOutlined />}
                onClick={() =>
                  handleOpenEdit(record)
                }
              />
            </Tooltip>

            <Tooltip title='Delete'>
              <Button
                danger
                shape='circle'
                size='small'
                icon={<DeleteOutlined />}
                onClick={() =>
                  handleDeleteVibe(record)
                }
              />
            </Tooltip>
          </div>
        ),
      },
    ],
    [
      currentPage,
      pageSize,
      renderDescription,
      handleOpenEdit,
      handleDeleteVibe,
    ]
  )

  const pagination = useMemo(
    () => ({
      current: currentPage,
      pageSize,
      total: vibes?.length || 0,

      showSizeChanger: true,
      pageSizeOptions: [
        '10',
        '20',
        '50',
        '100',
      ],

      onChange: (page, size) => {
        if (size !== pageSize) {
          setCurrentPage(1)
          setPageSize(size)
          return
        }

        setCurrentPage(page)
      },

      showTotal: (total) => {
        return `Total ${total} vibes`
      },
    }),
    [
      currentPage,
      pageSize,
      vibes?.length,
    ]
  )

  return (
    <>
      <div className='mb-2 rounded-lg bg-white px-3 py-4 dark:bg-slate-900 sm:px-5'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <Input
            allowClear
            value={search}
            prefix={
              <SearchOutlined className='text-blue-500' />
            }
            placeholder='Search vibe...'
            onChange={(event) => {
              setSearch(event.target.value)
            }}
            className='w-full sm:max-w-[480px]'
          />

          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => setOpenAdd(true)}
            className='w-full sm:w-auto'
          >
            Add
          </Button>
        </div>
      </div>

      <AddVibe
        open={openAdd}
        setOpen={setOpenAdd}
        access_token={access_token}
      />

      {openEdit && selectedVibe ? (
        <EditVibe
          open={openEdit}
          setOpen={handleCloseEdit}
          access_token={access_token}
          propData={selectedVibe}
        />
      ) : null}

      <TableHeader
        total={vibes?.length || 0}
        label='Total Amount'
      >
        <Table
          rowKey={(record) => record?._id}
          columns={columns}
          dataSource={vibes || []}
          pagination={pagination}
          loading={loadingList}
          bordered={false}
          size='small'
          scroll={{
            x: 1100,
          }}
          locale={{
            emptyText: loadingList
              ? 'Loading...'
              : 'No vibe found',
          }}
          rowClassName={(_, index) =>
            index % 2 === 0
              ? 'bg-white dark:bg-slate-900'
              : 'bg-gray-50 dark:bg-slate-800'
          }
          className='
            overflow-hidden rounded-lg

            [&_.ant-table]:dark:!bg-slate-900
            [&_.ant-table-container]:overflow-hidden

            [&_.ant-table-thead>tr>th]:!border-b-0
            [&_.ant-table-thead>tr>th]:!bg-slate-950
            [&_.ant-table-thead>tr>th]:!py-3
            [&_.ant-table-thead>tr>th]:!font-semibold

            [&_.ant-table-tbody>tr>td]:!py-2.5
            [&_.ant-table-tbody>tr>td]:dark:!border-slate-700

            [&_.ant-table-tbody>tr:hover>td]:!bg-blue-50
            [&_.ant-table-tbody>tr:hover>td]:dark:!bg-slate-700
          '
        />
      </TableHeader>
    </>
  )
}

export default VibeList