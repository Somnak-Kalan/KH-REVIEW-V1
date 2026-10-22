import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Button,
  Table,
  Tooltip,
} from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

import useAlbumStore from '../../../../Stores/setups/album.store'
import TableHeader from '../../../../widgets/TableHeader'
import confirmDelete from '../../../../components/Action/Confirm/DeleteConfirm'
import ImageLoading from '../../../../components/Loading/ImageLoading'

import EditAlbum from './Edit'

const AlbumList = ({
  accessToken,
  canEdit,
  search,
  setAmountAlbuls,
}) => {
  const navigate = useNavigate()

  const fetchAlbum = useAlbumStore(
    state => state.fetchAlbum
  )

  const removeAlbum = useAlbumStore(
    state => state.removeAlbum
  )

  const albums = useAlbumStore(
    state => state.albums || []
  )

  const storeLoading = useAlbumStore(
    state => state.loading
  )

  const [openEdit, setOpenEdit] =
    useState(false)

  const [
    selectedAlbum,
    setSelectedAlbum,
  ] = useState(null)

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1)

  const [pageSize, setPageSize] =
    useState(10)

  const lastQueryRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (!accessToken) {
      return undefined
    }

    const query = String(
      search || ''
    ).trim()

    setCurrentPage(1)

    if (debounceRef.current) {
      clearTimeout(
        debounceRef.current
      )
    }

    debounceRef.current =
      setTimeout(() => {
        if (
          lastQueryRef.current !==
          null &&
          lastQueryRef.current ===
          query
        ) {
          return
        }

        lastQueryRef.current = query

        fetchAlbum({
          access_token:
            accessToken,
          search: query,
          force: false,
        })
      }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(
          debounceRef.current
        )
      }
    }
  }, [
    accessToken,
    fetchAlbum,
    search,
  ])

  useEffect(() => {
    if (
      typeof setAmountAlbuls ===
      'function'
    ) {
      setAmountAlbuls(
        albums.length
      )
    }
  }, [
    albums,
    setAmountAlbuls,
  ])

  const handleView = record => {
    navigate(
      `/album/detail/${record._id}`
    )
  }

  const handleEdit = record => {
    setSelectedAlbum(record)
    setOpenEdit(true)
  }

  const getErrorMessage = error => {
    return (
      error?.response?.data?.msg ||
      error?.response?.data
        ?.message ||
      error?.data?.msg ||
      error?.data?.message ||
      error?.msg ||
      error?.message ||
      'Unable to delete album.'
    )
  }

  const handleDelete = async record => {
    const ok = await confirmDelete({
      record,
      title: 'Are you sure?',
      text:
        'Do you really want to delete this album?',
      onDelete: async () => {
        try {
          const response =
            await removeAlbum({
              access_token:
                accessToken,
              doc: {
                _id: record._id,
              },
            })

          if (
            response?.success ===
            false
          ) {
            throw new Error(
              response?.msg ||
              'Unable to delete album.'
            )
          }

          return response
        } catch (error) {
          const message =
            getErrorMessage(error)

          throw new Error(message)
        }
      },
      successText:
        'The album has been deleted.',
    })

    if (ok === false) {
      return
    }

    lastQueryRef.current = null

    await fetchAlbum({
      access_token: accessToken,
      search: String(
        search || ''
      ).trim(),
      force: true,
    })
  }

  const columns = useMemo(
    () => [
      {
        title: 'No',
        width: 60,
        align: 'center',
        render: (
          _,
          __,
          index
        ) =>
          (currentPage - 1) *
          pageSize +
          index +
          1,
      },
      {
        title: 'Album Name',
        dataIndex: 'nameEn',
        key: 'nameEn',
        minWidth: 220,
        render: (_, record) => (
          <button
            type="button"
            className="text-left leading-tight"
            onClick={() =>
              handleView(record)
            }
          >
            <div className="font-semibold text-blue-800 hover:underline dark:text-slate-300">
              {record?.nameEn ||
                '-'}
            </div>

            <div className="text-xs font-bold text-gray-500">
              {record?.nameKh ||
                ''}
            </div>
          </button>
        ),
      },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        minWidth: 250,
        render: text => (
          <div className="whitespace-normal break-words">
            {text || '-'}
          </div>
        ),
      },
      {
        title: 'Created By',
        dataIndex: 'createdBy',
        key: 'createdBy',
        align: 'center',
        width: 140,
        render: value =>
          value?.username ||
          value?.name ||
          value ||
          '-',
      },
      {
        title: 'Created At',
        dataIndex: 'createdAt',
        key: 'createdAt',
        align: 'center',
        width: 140,
        render: value =>
          value
            ? dayjs(
              value
            ).format(
              'YYYY-MM-DD'
            )
            : '-',
      },
      {
        title: 'Action',
        key: 'action',
        align: 'center',
        width: 120,
        render: (_, record) => (
          <div className="flex justify-center gap-2">
            {canEdit ? (
              <>
                <Tooltip title="Edit">
                  <Button
                    type="primary"
                    icon={
                      <EditOutlined />
                    }
                    shape="circle"
                    size="small"
                    onClick={() =>
                      handleEdit(
                        record
                      )
                    }
                  />
                </Tooltip>

                <Tooltip title="Delete">
                  <Button
                    danger
                    icon={
                      <DeleteOutlined />
                    }
                    shape="circle"
                    size="small"
                    onClick={() =>
                      handleDelete(
                        record
                      )
                    }
                  />
                </Tooltip>
              </>
            ) : null}
          </div>
        ),
      },
    ],
    [
      canEdit,
      currentPage,
      pageSize,
    ]
  )

  const pagination = {
    current: currentPage,
    pageSize,
    total: albums.length,
    showSizeChanger: true,
    pageSizeOptions: [
      '10',
      '20',
      '50',
      '100',
    ],
    onChange: (
      page,
      size
    ) => {
      setCurrentPage(page)
      setPageSize(size)
    },
  }

  return (
    <>
      {openEdit ? (
        <EditAlbum
          open={openEdit}
          setOpen={setOpenEdit}
          propData={
            selectedAlbum
          }
          access_token={
            accessToken
          }
        />
      ) : null}

      {/*
      <TableHeader
        total={albums.length}
        label="Album"
      >
      */}

      <div className="relative">
        {storeLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-slate-900/60">
            <ImageLoading
              overlay={false}
              size={60}
              logoSize={25}
            />
          </div>
        ) : null}

        <Table
          rowKey="_id"
          columns={columns}
          dataSource={albums}
          bordered={false}
          size="small"
          scroll={{
            x: 'max-content',
          }}
          pagination={
            pagination
          }
          rowClassName={(
            _,
            index
          ) =>
            index % 2 === 0
              ? 'even-row'
              : 'odd-row'
          }
        />
      </div>

      {/* </TableHeader> */}
    </>
  )
}

export default AlbumList