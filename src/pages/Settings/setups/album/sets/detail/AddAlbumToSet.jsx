import React, {
  useEffect,
  useMemo,
} from 'react'
import {
  Form,
  Modal,
  Select,
  message,
} from 'antd'
import {
  CheckCircleFilled,
} from '@ant-design/icons'

import useAlbumStore from '../../../../../../Stores/setups/album.store'
import useAlbumSetStore from '../../../../../../Stores/settings/setups/AlbumSet'

const getErrorMessage = (
  error,
  fallbackMessage
) => {
  return (
    error?.response?.data?.msg ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  )
}

const getAlbumId = album => {
  if (!album) return null

  if (typeof album === 'string') {
    return album
  }

  return (
    album?._id ||
    album?.id ||
    album?.albumId ||
    null
  )
}

const getAlbumLabel = album => {
  const nameEn =
    album?.nameEn ||
    'Album'

  const nameKh =
    album?.nameKh ||
    ''

  return nameKh
    ? `${nameEn} — ${nameKh}`
    : nameEn
}

const getUniqueIds = values => {
  return Array.from(
    new Set(
      values
        .filter(Boolean)
        .map(value =>
          String(value)
        )
    )
  )
}

const AddAlbumToSet = ({
  open,
  setOpen,
  accessToken,
  setDetail,
  onUpdated,
}) => {
  const [form] = Form.useForm()

  const albums = useAlbumStore(
    state =>
      Array.isArray(
        state.albums
      )
        ? state.albums
        : []
  )

  const fetchAlbum =
    useAlbumStore(
      state =>
        state.fetchAlbum
    )

  const albumLoading =
    useAlbumStore(
      state =>
        Boolean(
          state.loading
        )
    )

  const updateSet =
    useAlbumSetStore(
      state =>
        state.updateSet
    )

  const updating =
    useAlbumSetStore(
      state =>
        state.updating
    )

  const currentAlbumIds =
    useMemo(() => {
      const currentAlbums =
        Array.isArray(
          setDetail?.albums
        )
          ? setDetail.albums
          : []

      return getUniqueIds(
        currentAlbums
          .map(getAlbumId)
          .filter(Boolean)
      )
    }, [
      setDetail?.albums,
    ])

  const options =
    useMemo(() => {
      const currentIdSet =
        new Set(
          currentAlbumIds.map(
            albumId =>
              String(albumId)
          )
        )

      return albums
        .map(album => {
          const albumId =
            getAlbumId(album)

          if (!albumId) {
            return null
          }

          const normalizedId =
            String(albumId)

          const alreadyExists =
            currentIdSet.has(
              normalizedId
            )

          return {
            value:
              normalizedId,

            label:
              getAlbumLabel(
                album
              ),

            disabled:
              alreadyExists,

            alreadyExists,

            album,
          }
        })
        .filter(Boolean)
    }, [
      albums,
      currentAlbumIds,
    ])

  const availableAlbumCount =
    useMemo(() => {
      return options.filter(
        option =>
          !option.alreadyExists
      ).length
    }, [options])

  useEffect(() => {
    if (!open) {
      form.resetFields()
      return
    }

    form.setFieldsValue({
      albumIds: [],
    })

    if (
      !accessToken ||
      typeof fetchAlbum !==
      'function'
    ) {
      return
    }

    fetchAlbum({
      access_token:
        accessToken,

      doc: {
        search: '',
      },
    }).catch(error => {
      console.error(error)

      message.error(
        getErrorMessage(
          error,
          'Could not load albums.'
        )
      )
    })
  }, [
    open,
    accessToken,
    fetchAlbum,
    form,
  ])

  const handleCancel = () => {
    if (updating) return

    form.resetFields()
    setOpen(false)
  }

  const handleSubmit = async () => {
    if (!setDetail?._id) {
      message.error(
        'Album set ID was not found.'
      )

      return
    }

    try {
      const values =
        await form.validateFields()

      const selectedIds =
        Array.isArray(
          values?.albumIds
        )
          ? values.albumIds
          : []

      const nextAlbumIds =
        getUniqueIds([
          ...currentAlbumIds,
          ...selectedIds,
        ])

      const updatedSet =
        await updateSet({
          access_token:
            accessToken,

          doc: {
            _id:
              setDetail._id,

            nameEn:
              setDetail.nameEn,

            nameKh:
              setDetail.nameKh ||
              '',

            // Complete album array.
            albums:
              nextAlbumIds,
          },
        })

      if (
        typeof onUpdated ===
        'function'
      ) {
        onUpdated(
          updatedSet
        )
      }

      message.success(
        'Albums added to the set successfully.'
      )

      form.resetFields()
      setOpen(false)
    } catch (error) {
      if (
        error?.errorFields
      ) {
        return
      }

      console.error(error)

      message.error(
        getErrorMessage(
          error,
          'Could not add albums to the set.'
        )
      )
    }
  }

  return (
    <Modal
      title={`Add Albums to “${setDetail?.nameEn || ''}”`}
      open={open}
      onCancel={
        handleCancel
      }
      onOk={
        handleSubmit
      }
      confirmLoading={
        updating
      }
      okText='Add Albums'
      cancelText='Cancel'
      destroyOnClose
      maskClosable={
        !updating
      }
      keyboard={
        !updating
      }
      okButtonProps={{
        disabled:
          availableAlbumCount ===
          0,
      }}
    >
      <Form
        form={form}
        layout='vertical'
      >
        <div className='mb-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700'>
          <CheckCircleFilled className='mr-2' />

          {currentAlbumIds.length}{' '}
          album
          {currentAlbumIds.length ===
            1
            ? ''
            : 's'}{' '}
          already in this set.
          Existing albums are
          marked in green and
          disabled.
        </div>

        <Form.Item
          label='Select Albums'
          name='albumIds'
          validateTrigger='onChange'
          rules={[
            {
              validator: (
                _,
                value
              ) => {
                if (
                  Array.isArray(
                    value
                  ) &&
                  value.length > 0
                ) {
                  return Promise.resolve()
                }

                return Promise.reject(
                  new Error(
                    'Please select at least one album.'
                  )
                )
              },
            },
          ]}
        >
          <Select
            mode='multiple'
            showSearch
            allowClear
            loading={
              albumLoading
            }
            disabled={
              albumLoading ||
              updating ||
              availableAlbumCount ===
              0
            }
            options={options}
            optionFilterProp='label'
            placeholder={
              availableAlbumCount >
                0
                ? 'Select albums'
                : 'All albums are already in this set'
            }
            maxTagCount='responsive'
            notFoundContent='No albums found'
            optionRender={option => {
              const {
                label,
                alreadyExists,
              } = option.data

              if (
                alreadyExists
              ) {
                return (
                  <div
                    className='flex w-full items-center justify-between rounded px-2 py-1'
                    style={{
                      background:
                        '#f0fdf4',

                      color:
                        '#15803d',
                    }}
                  >
                    <span
                      className='truncate'
                      title={label}
                    >
                      {label}
                    </span>

                    <span className='ml-3 flex shrink-0 items-center gap-1 text-xs font-semibold'>
                      <CheckCircleFilled />

                      Already in this set
                    </span>
                  </div>
                )
              }

              return (
                <div
                  className='truncate px-2 py-1'
                  title={label}
                >
                  {label}
                </div>
              )
            }}
          />
        </Form.Item>

        {availableAlbumCount ===
          0 ? (
          <div className='text-sm text-gray-500'>
            All available albums
            have already been added
            to this set.
          </div>
        ) : (
          <div className='text-xs text-gray-500'>
            {
              availableAlbumCount
            }{' '}
            album
            {availableAlbumCount ===
              1
              ? ''
              : 's'}{' '}
            available to add.
          </div>
        )}
      </Form>
    </Modal>
  )
}

export default AddAlbumToSet