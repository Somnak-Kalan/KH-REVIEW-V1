import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Breadcrumb,
  Button,
  Dropdown,
  Empty,
  Input,
  Table,
  Tooltip,
  message,
} from 'antd'

import {
  ArrowLeftOutlined,
  EditOutlined,
  HomeOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
  SwapOutlined,
} from '@ant-design/icons'

import {
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom'

import dayjs from 'dayjs'

import IconRemove from '../../../../../../assets/icon/user/actionIcon/remove.svg'

import { AuthContext } from '../../../../../../contexts/AuthContext'

import { PERMS } from '../../../../../../constants/permission/perms'

import confirmDelete from '../../../../../../components/Action/Confirm/DeleteConfirm'

import ImageLoading from '../../../../../../components/Loading/ImageLoading'

import useAlbumSetStore from '../../../../../../Stores/settings/setups/AlbumSet'

import EditSet from '../EditSet'

import AddAlbumToSet from './AddAlbumToSet'

import ReorderAlbums from './ReorderAlbums'

// =========================================
// Error
// =========================================

const getErrorMessage = (
  error,
  fallbackMessage
) => {
  return (
    error?.response?.data?.msg ||
    error?.response?.data
      ?.message ||
    error?.response?.data
      ?.error ||
    error?.data?.msg ||
    error?.data?.message ||
    error?.data?.error ||
    error?.msg ||
    error?.message ||
    fallbackMessage
  )
}

// =========================================
// Album ID
// =========================================

const getAlbumId =
  album => {
    if (!album) {
      return null
    }

    if (
      typeof album ===
      'string'
    ) {
      return album
    }

    return (
      album?._id ||
      album?.id ||
      album?.albumId ||
      null
    )
  }

// =========================================
// Created By
// =========================================

const getCreatedByName =
  value => {
    if (!value) {
      return '-'
    }

    if (
      typeof value ===
      'string'
    ) {
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

// =========================================
// Component
// =========================================

const AlbumSetDetail = () => {
  const {
    access_token,

    checkPermission,
  } = useContext(
    AuthContext
  )

  const {
    setDisplayEmitContent,
  } = useOutletContext()

  const params =
    useParams()

  const navigate =
    useNavigate()

  const albumSetId =
    params?.setId ||
    params?.id ||
    params?._id ||
    ''

  // =========================================
  // Store
  // =========================================

  const albumSet =
    useAlbumSetStore(
      state =>
        state.albumSet
    )

  const loadingDetail =
    useAlbumSetStore(
      state =>
        state
          .loadingDetail
    )

  const updating =
    useAlbumSetStore(
      state =>
        state.updating
    )

  const fetchSetById =
    useAlbumSetStore(
      state =>
        state
          .fetchSetById
    )

  const updateSet =
    useAlbumSetStore(
      state =>
        state.updateSet
    )

  // =========================================
  // Local State
  // =========================================

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    openAddAlbum,
    setOpenAddAlbum,
  ] = useState(false)

  const [
    openReorder,
    setOpenReorder,
  ] = useState(false)

  const [
    openEdit,
    setOpenEdit,
  ] = useState(false)

  const [
    removingAlbumId,
    setRemovingAlbumId,
  ] = useState(null)

  // =========================================
  // Permission
  // =========================================

  const canManage =
    useMemo(() => {
      if (!access_token) {
        return null
      }

      return checkPermission?.(
        PERMS
          .ACTIVITY_MANAGEMENT
      )
    }, [
      access_token,
      checkPermission,
    ])

  const canEdit =
    useMemo(() => {
      if (!access_token) {
        return false
      }

      return checkPermission?.(
        PERMS.ASSIGNED_USER
      )
    }, [
      access_token,
      checkPermission,
    ])

  // =========================================
  // Permission Redirect
  // =========================================

  useEffect(() => {
    if (
      canManage ===
      false
    ) {
      navigate(
        '/',
        {
          replace: true,
        }
      )
    }
  }, [
    canManage,
    navigate,
  ])

  // =========================================
  // Page Header
  // =========================================

  useEffect(() => {
    setDisplayEmitContent(
      <div className='my-3 flex items-center justify-between'>
        <button
          type='button'
          className='flex items-center gap-3 font-semibold text-gray-700 dark:text-slate-300'
          onClick={() =>
            navigate(
              '/album?tab=sets'
            )
          }
        >
          <ArrowLeftOutlined />

          <span>
            Album Set Details
          </span>
        </button>

        <Breadcrumb
          items={[
            {
              title: (
                <HomeOutlined
                  className='cursor-pointer'
                  onClick={() =>
                    navigate(
                      '/'
                    )
                  }
                />
              ),
            },

            {
              title: (
                <button
                  type='button'
                  onClick={() =>
                    navigate(
                      '/album?tab=sets'
                    )
                  }
                >
                  Album Sets
                </button>
              ),
            },
          ]}
        />
      </div>
    )
  }, [
    navigate,
    setDisplayEmitContent,
  ])

  // =========================================
  // Load Album Set
  // =========================================

  useEffect(() => {
    if (
      !access_token ||
      !albumSetId
    ) {
      return
    }

    fetchSetById({
      access_token,

      setId:
        albumSetId,
    }).catch(
      error => {
        console.error(
          error
        )

        message.error(
          getErrorMessage(
            error,
            'Could not load the album set.'
          )
        )
      }
    )
  }, [
    access_token,
    albumSetId,
    fetchSetById,
  ])

  // =========================================
  // Current Set
  // =========================================

  const setDetail =
    useMemo(() => {
      if (
        !albumSet ||
        String(
          albumSet?._id
        ) !==
        String(
          albumSetId
        )
      ) {
        return null
      }

      return albumSet
    }, [
      albumSet,
      albumSetId,
    ])

  // =========================================
  // Albums
  // =========================================

  const albums =
    useMemo(() => {
      return Array.isArray(
        setDetail?.albums
      )
        ? setDetail.albums
        : []
    }, [
      setDetail?.albums,
    ])

  // =========================================
  // Filter Albums
  // =========================================

  const filteredAlbums =
    useMemo(() => {
      const keyword =
        String(
          search ||
          ''
        )
          .trim()
          .toLowerCase()

      if (!keyword) {
        return albums
      }

      return albums.filter(
        album => {
          const searchableText =
            [
              album
                ?.nameEn,

              album
                ?.nameKh,

              album
                ?.description,

              album
                ?.style,

              getCreatedByName(
                album
                  ?.createdBy
              ),
            ]
              .filter(
                Boolean
              )
              .join(' ')
              .toLowerCase()

          return searchableText
            .includes(
              keyword
            )
        }
      )
    }, [
      albums,
      search,
    ])

  // =========================================
  // Edit Updated
  // =========================================

  const handleUpdated =
    () => {
      setOpenEdit(
        false
      )
    }

  // =========================================
  // Open Album Detail
  // =========================================

  const handleClickAlbumDetail =
    useCallback(
      album => {
        const albumId =
          getAlbumId(
            album
          )

        const currentSetId =
          setDetail?._id ||
          albumSetId

        if (
          !albumId ||
          !currentSetId
        ) {
          message.error(
            'Album information was not found.'
          )

          return
        }

        navigate(
          `/album/set/detail/${encodeURIComponent(
            albumId
          )}?albumSetId=${encodeURIComponent(
            currentSetId
          )}`
        )
      },
      [
        navigate,
        albumSetId,
        setDetail?._id,
      ]
    )

  // =========================================
  // Remove Album From Set
  // =========================================

  const handleRemove =
    async album => {
      const albumId =
        getAlbumId(
          album
        )

      if (
        !setDetail?._id ||
        !albumId
      ) {
        message.error(
          'Album information was not found.'
        )

        return
      }

      const ok =
        await confirmDelete({
          record:
            album,

          title:
            'Are you sure?',

          text:
            `Do you really want to remove ` +
            `"${album?.nameEn || 'Album'}" ` +
            `from "${setDetail?.nameEn || 'Album Set'}"? ` +
            'The album itself will not be deleted.',

          onDelete:
            async () => {
              setRemovingAlbumId(
                albumId
              )

              try {
                const nextAlbumIds =
                  albums
                    .filter(
                      item => {
                        return (
                          String(
                            getAlbumId(
                              item
                            )
                          ) !==
                          String(
                            albumId
                          )
                        )
                      }
                    )
                    .map(
                      getAlbumId
                    )
                    .filter(
                      Boolean
                    )

                const response =
                  await updateSet({
                    access_token,

                    doc: {
                      _id:
                        setDetail
                          ._id,

                      nameEn:
                        setDetail
                          .nameEn,

                      nameKh:
                        setDetail
                          .nameKh ||
                        '',

                      albums:
                        nextAlbumIds,
                    },
                  })

                if (
                  response
                    ?.success ===
                  false
                ) {
                  throw new Error(
                    response
                      ?.msg ||
                    response
                      ?.message ||
                    'Unable to remove the album.'
                  )
                }

                return response
              } catch (
              error
              ) {
                const errorMessage =
                  getErrorMessage(
                    error,

                    'Unable to remove the album.'
                  )

                throw new Error(
                  errorMessage
                )
              } finally {
                setRemovingAlbumId(
                  null
                )
              }
            },

          successText:
            'The album has been removed from the set.',
        })

      if (
        ok === false
      ) {
        setRemovingAlbumId(
          null
        )
      }
    }

  // =========================================
  // Detail Menu
  // =========================================

  const detailMenuItems =
    [
      canEdit
        ? {
          key:
            'edit',

          icon:
            <EditOutlined />,

          label:
            'Edit Set',

          onClick:
            () =>
              setOpenEdit(
                true
              ),
        }
        : null,
    ].filter(
      Boolean
    )

  // =========================================
  // Columns
  // =========================================

  const columns =
    useMemo(
      () => [
        {
          title: 'No',

          width: 60,

          align:
            'center',

          render: (
            _,
            __,
            index
          ) =>
            index +
            1,
        },

        {
          title:
            'Album Name',

          dataIndex:
            'nameEn',

          key:
            'nameEn',

          width: 300,

          render: (
            _,
            record
          ) => (
            <button
              type='button'
              onClick={() =>
                handleClickAlbumDetail(
                  record
                )
              }
              className='block cursor-pointer text-left leading-tight'
            >
              <div className='font-semibold text-blue-800 dark:text-blue-400'>
                {record
                  ?.nameEn ||
                  '-'}
              </div>

              <div className='mt-1 text-xs font-medium text-gray-500'>
                {record
                  ?.nameKh ||
                  ''}
              </div>
            </button>
          ),
        },

        {
          title:
            'Action',

          key:
            'action',

          align:
            'center',

          width: 125,

          render: (
            _,
            record
          ) => {
            const recordAlbumId =
              getAlbumId(
                record
              )

            const isRemoving =
              updating &&
              String(
                removingAlbumId
              ) ===
              String(
                recordAlbumId
              )

            return canEdit
              ? (
                <Tooltip title='Remove from set'>
                  <Button
                    type='text'
                    size='small'
                    danger
                    loading={
                      isRemoving
                    }
                    disabled={
                      updating &&
                      !isRemoving
                    }
                    icon={
                      <img
                        src={
                          IconRemove
                        }
                        alt='Remove'
                      />
                    }
                    onClick={() =>
                      handleRemove(
                        record
                      )
                    }
                  >
                    Remove
                  </Button>
                </Tooltip>
              )
              : null
          },
        },
      ],
      [
        canEdit,

        updating,

        removingAlbumId,

        handleClickAlbumDetail,

        albums,

        setDetail,
      ]
    )

  // =========================================
  // Permission Loading
  // =========================================

  if (
    canManage ===
    null ||
    canManage ===
    false
  ) {
    return null
  }

  // =========================================
  // No Set ID
  // =========================================

  if (!albumSetId) {
    return (
      <div className='rounded-lg bg-white p-10 shadow-sm dark:bg-slate-900'>
        <Empty description='Album set ID was not found in the URL.' />

        <div className='mt-4 flex justify-center'>
          <Button
            onClick={() =>
              navigate(
                '/album?tab=sets'
              )
            }
          >
            Back to Album Sets
          </Button>
        </div>
      </div>
    )
  }

  // =========================================
  // Render
  // =========================================

  return (
    <div className='relative'>
      {loadingDetail
        ? (
          <div className='absolute inset-0 z-20 flex min-h-[350px] items-center justify-center bg-white/60 dark:bg-slate-900/60'>
            <ImageLoading
              overlay={
                false
              }
              size={60}
              logoSize={
                25
              }
            />
          </div>
        )
        : null}

      {!loadingDetail &&
        !setDetail
        ? (
          <div className='rounded-lg bg-white p-10 shadow-sm dark:bg-slate-900'>
            <Empty description='Album set not found' />
          </div>
        )
        : null}

      {setDetail
        ? (
          <>
            <EditSet
              open={
                openEdit
              }
              setOpen={
                setOpenEdit
              }
              accessToken={
                access_token
              }
              propData={
                setDetail
              }
              hideSelectAlbumSet='true'
              onUpdated={
                handleUpdated
              }
            />

            <AddAlbumToSet
              open={
                openAddAlbum
              }
              setOpen={
                setOpenAddAlbum
              }
              accessToken={
                access_token
              }
              setDetail={
                setDetail
              }
            />

            <ReorderAlbums
              open={
                openReorder
              }
              setOpen={
                setOpenReorder
              }
              accessToken={
                access_token
              }
              setDetail={
                setDetail
              }
            />

            {/* ================================= */}
            {/* Album Set Information */}
            {/* ================================= */}

            <div className='mb-3 rounded-lg bg-white px-4 py-4 shadow-sm dark:bg-slate-900'>
              <div className='flex items-start justify-between'>
                <div>
                  <h2 className='m-0 text-lg font-semibold text-gray-800 dark:text-slate-200'>
                    {setDetail
                      ?.nameEn ||
                      'Album Set'}
                  </h2>

                  {setDetail
                    ?.nameKh
                    ? (
                      <div className='mt-1 text-sm font-medium text-gray-500'>
                        {
                          setDetail
                            .nameKh
                        }
                      </div>
                    )
                    : null}

                  <div className='mt-2 text-xs text-gray-500'>
                    Created by{' '}

                    {getCreatedByName(
                      setDetail
                        ?.createdBy
                    )}

                    {' · '}

                    {setDetail
                      ?.createdAt
                      ? dayjs(
                        setDetail
                          .createdAt
                      ).format(
                        'YYYY-MM-DD'
                      )
                      : '-'}
                  </div>
                </div>

                <Dropdown
                  menu={{
                    items:
                      detailMenuItems,
                  }}
                  trigger={[
                    'click',
                  ]}
                  placement='bottomRight'
                >
                  <Button
                    type='text'
                    size='small'
                    icon={
                      <MoreOutlined />
                    }
                  />
                </Dropdown>
              </div>
            </div>

            {/* ================================= */}
            {/* Search / Action */}
            {/* ================================= */}

            <div className='mb-3 rounded-lg bg-white px-4 py-3 shadow-sm dark:bg-slate-900'>
              <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                <Input
                  allowClear
                  value={
                    search
                  }
                  prefix={
                    <SearchOutlined className='text-blue-500' />
                  }
                  placeholder='Search albums'
                  className='w-full sm:max-w-[300px]'
                  onChange={
                    event =>
                      setSearch(
                        event
                          .target
                          .value
                      )
                  }
                />

                {canEdit
                  ? (
                    <div className='flex items-center gap-2'>
                      <Button
                        icon={
                          <SwapOutlined />
                        }
                        disabled={
                          updating ||
                          albums
                            .length <
                          2
                        }
                        onClick={() =>
                          setOpenReorder(
                            true
                          )
                        }
                      >
                        Reorder
                      </Button>

                      <Button
                        type='primary'
                        icon={
                          <PlusOutlined />
                        }
                        disabled={
                          updating
                        }
                        onClick={() =>
                          setOpenAddAlbum(
                            true
                          )
                        }
                      >
                        Add Album
                      </Button>
                    </div>
                  )
                  : null}
              </div>
            </div>

            {/* ================================= */}
            {/* Album Table */}
            {/* ================================= */}

            <div className='rounded-lg bg-white px-4 pb-5 pt-4 shadow-sm dark:bg-slate-900'>
              <div className='mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-slate-300'>
                <span>
                  Albums in “
                  {setDetail
                    ?.nameEn ||
                    'Album Set'}
                  ”
                </span>

                <span className='flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[11px] font-semibold text-white'>
                  {
                    albums
                      .length
                  }
                </span>
              </div>

              <Table
                rowKey={
                  record =>
                    getAlbumId(
                      record
                    )
                }
                columns={
                  columns
                }
                dataSource={
                  filteredAlbums
                }
                bordered={
                  false
                }
                size='small'
                pagination={
                  false
                }
                scroll={{
                  x:
                    'max-content',
                }}
                rowClassName={(
                  _,
                  index
                ) =>
                  index %
                    2 ===
                    0
                    ? 'even-row'
                    : 'odd-row'
                }
              />
            </div>
          </>
        )
        : null}
    </div>
  )
}

export default AlbumSetDetail