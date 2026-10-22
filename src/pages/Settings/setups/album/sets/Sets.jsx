import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Button,
  message,
  Table,
  Tag,
  Tooltip,
} from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'

import confirmDelete from '../../../../../components/Action/Confirm/DeleteConfirm'
import ImageLoading from '../../../../../components/Loading/ImageLoading'
import useAlbumSetStore from '../../../../../Stores/settings/setups/AlbumSet'

import EditSet from './EditSet'
import './AlbumSet.css'

const getErrorMessage = (
  error,
  fallbackMessage
) => {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.data?.msg ||
    error?.data?.message ||
    error?.data?.error ||
    error?.msg ||
    error?.message ||
    fallbackMessage
  )
}

const getCreatedByName = value => {
  if (!value) return '-'

  if (typeof value === 'string') {
    return value
  }

  const fullName = [
    value?.firstName,
    value?.lastName,
  ]
    .filter(Boolean)
    .join(' ')
    .trim()

  return (
    value?.username ||
    fullName ||
    value?.name ||
    '-'
  )
}

const Sets = ({
  accessToken,
  canEdit = false,
  search = '',
  setAmountAlbulsSet,
}) => {
  const navigate = useNavigate()

  const albumSets = useAlbumSetStore(
    state => state.albumSets || []
  )

  const loadingList = useAlbumSetStore(
    state => state.loadingList
  )

  const fetchSets = useAlbumSetStore(
    state => state.fetchSets
  )

  const removeSet = useAlbumSetStore(
    state => state.removeSet
  )

  const removing = useAlbumSetStore(
    state => state.removing
  )

  const [openEdit, setOpenEdit] =
    useState(false)

  const [
    selectedSet,
    setSelectedSet,
  ] = useState(null)

  const [
    deletingSetId,
    setDeletingSetId,
  ] = useState(null)

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1)

  const [pageSize, setPageSize] =
    useState(10)

  useEffect(() => {
    if (!accessToken) return undefined

    const timer = setTimeout(() => {
      fetchSets({
        access_token: accessToken,
        doc: {
          search: String(
            search || ''
          ).trim(),
        },
      }).catch(error => {
        console.error(error)

        message.error(
          getErrorMessage(
            error,
            'Could not load album sets.'
          )
        )
      })
    }, 300)

    return () => {
      clearTimeout(timer)
    }
  }, [
    accessToken,
    search,
    fetchSets,
  ])

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  useEffect(() => {
    if (
      typeof setAmountAlbulsSet ===
      'function'
    ) {
      setAmountAlbulsSet(
        albumSets.length
      )
    }
  }, [
    albumSets.length,
    setAmountAlbulsSet,
  ])

  useEffect(() => {
    const maximumPage = Math.max(
      1,
      Math.ceil(
        albumSets.length /
        pageSize
      )
    )

    if (
      currentPage >
      maximumPage
    ) {
      setCurrentPage(
        maximumPage
      )
    }
  }, [
    albumSets.length,
    currentPage,
    pageSize,
  ])

  const handleView = record => {
    if (!record?._id) return

    navigate(
      `/album/set/${record._id}`
    )
  }

  const handleEdit = record => {
    setSelectedSet(record)
    setOpenEdit(true)
  }

  const handleUpdated = () => {
    setSelectedSet(null)
  }

  const handleDelete = async record => {
    const setId = record?._id

    if (!setId) return

    const ok = await confirmDelete({
      record,

      title: 'Are you sure?',

      text:
        'Do you really want to delete this album set? Albums inside the set will not be deleted.',

      onDelete: async () => {
        setDeletingSetId(setId)

        try {
          const response =
            await removeSet({
              access_token:
                accessToken,

              setId,
            })

          if (
            response?.success ===
            false
          ) {
            throw new Error(
              response?.msg ||
              response?.message ||
              'Unable to delete album set.'
            )
          }

          return response
        } catch (error) {
          const errorMessage =
            getErrorMessage(
              error,
              'Unable to delete album set.'
            )

          throw new Error(
            errorMessage
          )
        } finally {
          setDeletingSetId(null)
        }
      },

      successText:
        'The album set has been deleted.',
    })

    if (ok === false) {
      setDeletingSetId(null)
    }
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
        title: 'Set Name',
        dataIndex: 'nameEn',
        key: 'nameEn',
        width: 240,

        render: (_, record) => (
          <button
            type="button"
            className="album-set-name text-left"
            onClick={() =>
              handleView(record)
            }
          >
            <div>
              {record?.nameEn || '-'}
            </div>

            {record?.nameKh ? (
              <div className="mt-1 text-xs font-medium text-gray-500">
                {record.nameKh}
              </div>
            ) : null}
          </button>
        ),
      },
      {
        title: 'Albums',
        dataIndex: 'albums',
        key: 'albums',
        width: 420,

        render: value => {
          const albumList =
            Array.isArray(value)
              ? value
              : []

          if (!albumList.length) {
            return (
              <span className="text-gray-400">
                No albums
              </span>
            )
          }

          const visibleAlbums =
            albumList.slice(0, 5)

          const remaining =
            albumList.length -
            visibleAlbums.length

          return (
            <div className="flex flex-wrap gap-1">
              {visibleAlbums.map(
                (album, index) => (
                  <Tag
                    key={
                      album?._id ||
                      `${album?.nameEn}-${index}`
                    }
                    className="album-set-tag"
                  >
                    {album?.nameEn ||
                      '-'}
                  </Tag>
                )
              )}

              {remaining > 0 ? (
                <Tag className="album-set-tag">
                  +{remaining}
                </Tag>
              ) : null}
            </div>
          )
        },
      },
      {
        title: 'Created By',
        dataIndex: 'createdBy',
        key: 'createdBy',
        align: 'center',
        width: 150,

        render:
          getCreatedByName,
      },
      {
        title: 'Created At',
        dataIndex: 'createdAt',
        key: 'createdAt',
        align: 'center',
        width: 150,

        render: value =>
          value
            ? dayjs(value).format(
              'YYYY-MM-DD'
            )
            : '-',
      },
      {
        title: 'Action',
        key: 'action',
        align: 'center',
        width: 145,

        render: (_, record) => (
          <div className="flex items-center justify-center gap-1">
            <Tooltip title="View">
              <Button
                type="text"
                shape="circle"
                size="small"
                className="album-set-view-btn"
                icon={
                  <EyeOutlined />
                }
                onClick={() =>
                  handleView(record)
                }
              />
            </Tooltip>

            {canEdit ? (
              <>
                <Tooltip title="Edit">
                  <Button
                    type="text"
                    shape="circle"
                    size="small"
                    className="album-set-edit-btn"
                    icon={
                      <EditOutlined />
                    }
                    onClick={() =>
                      handleEdit(record)
                    }
                  />
                </Tooltip>

                <Tooltip title="Delete">
                  <Button
                    type="text"
                    danger
                    shape="circle"
                    size="small"
                    loading={
                      removing &&
                      deletingSetId ===
                      record?._id
                    }
                    className="album-set-delete-btn"
                    icon={
                      <DeleteOutlined />
                    }
                    onClick={() =>
                      handleDelete(record)
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
      removing,
      deletingSetId,
    ]
  )

  const pagination = {
    current: currentPage,
    pageSize,
    total: albumSets.length,

    showSizeChanger: true,

    showTotal: total =>
      `Total ${total} sets`,

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
      <EditSet
        open={openEdit}
        setOpen={setOpenEdit}
        accessToken={accessToken}
        propData={selectedSet}
        onUpdated={handleUpdated}
      />

      <div className="relative">
        {loadingList ? (
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
          className="album-set-table"
          columns={columns}
          dataSource={albumSets}
          bordered={false}
          size="small"
          scroll={{
            x: 'max-content',
          }}
          pagination={pagination}
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
    </>
  )
}

export default Sets