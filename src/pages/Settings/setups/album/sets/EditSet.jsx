import React, {
  useEffect,
  useMemo,
} from 'react'
import {
  Form,
  Input,
  message,
  Modal,
  Select,
} from 'antd'

import useAlbumStore from '../../../../../Stores/setups/album.store'
import useAlbumSetStore from '../../../../../Stores/settings/setups/AlbumSet'

import './AlbumSet.css'

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
    album?.name ||
    'Album'

  const nameKh =
    album?.nameKh ||
    album?.nameKhmer ||
    ''

  return nameKh
    ? `${nameEn} — ${nameKh}`
    : nameEn
}

const EditSet = ({
  open,
  setOpen,
  accessToken,
  propData,
  onUpdated,
  hideSelectAlbumSet
}) => {
  const [form] = Form.useForm()

  const albums = useAlbumStore(
    state =>
      Array.isArray(state.albums)
        ? state.albums
        : []
  )

  const fetchAlbum = useAlbumStore(
    state => state.fetchAlbum
  )

  const albumLoading =
    useAlbumStore(
      state =>
        Boolean(state.loading)
    )

  const updateSet =
    useAlbumSetStore(
      state => state.updateSet
    )

  const updating =
    useAlbumSetStore(
      state => state.updating
    )

  const albumOptions =
    useMemo(() => {
      return albums
        .map(album => ({
          value:
            getAlbumId(album),

          label:
            getAlbumLabel(album),
        }))
        .filter(
          option =>
            Boolean(option.value)
        )
    }, [albums])

  useEffect(() => {
    if (!open) {
      form.resetFields()
      return
    }

    const selectedAlbumIds =
      Array.isArray(
        propData?.albums
      )
        ? propData.albums
          .map(getAlbumId)
          .filter(Boolean)
        : []

    form.setFieldsValue({
      nameEn:
        propData?.nameEn || '',

      nameKh:
        propData?.nameKh || '',

      albumIds:
        selectedAlbumIds,
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
    propData,
    fetchAlbum,
    form,
  ])

  const handleCancel = () => {
    if (updating) return

    form.resetFields()
    setOpen(false)
  }

  const handleSubmit = async () => {


    try {
      const values =
        await form.validateFields()

      const nameEn =
        String(
          values?.nameEn || ''
        ).trim()

      const nameKh =
        String(
          values?.nameKh || ''
        ).trim()

      const albumIds =
        Array.isArray(
          values?.albumIds
        )
          ? values.albumIds
          : []

      const updatedSet =
        await updateSet({
          access_token:
            accessToken,

          doc: {
            _id:
              propData._id,

            nameEn,
            nameKh,

            // Complete ordered array.
            albums: albumIds,
          },
        })

      if (
        typeof onUpdated ===
        'function'
      ) {
        onUpdated(updatedSet)
      }

      message.success(
        'Album set updated successfully.'
      )

      form.resetFields()
      setOpen(false)
    } catch (error) {
      if (error?.errorFields) {
        return
      }

      console.error(error)

      message.error(
        getErrorMessage(
          error,
          'Could not update the album set.'
        )
      )
    }
  }

  return (
    <Modal
      title='Edit Album Set'
      open={open}
      width={560}
      rootClassName='album-set-modal-root'
      className='album-set-modal'
      closable={!updating}
      maskClosable={!updating}
      keyboard={!updating}
      destroyOnClose
      confirmLoading={updating}
      okText='Save Changes'
      cancelText='Cancel'
      onCancel={handleCancel}
      onOk={handleSubmit}
    >
      <Form
        form={form}
        layout='vertical'
        requiredMark
      >
        <Form.Item
          label='Set Name'
          name='nameEn'
          rules={[
            {
              required: true,
              whitespace: true,
              message:
                'Please enter the English name.',
            },
            {
              max: 150,
              message:
                'English name cannot exceed 150 characters.',
            },
          ]}
        >
          <Input
            placeholder='e.g. Restaurant albums'
            maxLength={150}
            disabled={updating}
          />
        </Form.Item>

        {/* 
        <Form.Item
          label='Khmer Name'
          name='nameKh'
          rules={[
            {
              max: 150,
              message:
                'Khmer name cannot exceed 150 characters.',
            },
          ]}
        >
          <Input
            placeholder='ឈ្មោះជាភាសាខ្មែរ'
            maxLength={150}
            disabled={updating}
          />
        </Form.Item>
        */}

        <Form.Item
          label='Albums in This Set'
          name='albumIds'
          validateTrigger='onChange'
        >
          <Select
            mode='multiple'

            showSearch
            allowClear
            maxTagCount='responsive'
            placeholder='Select albums'
            optionFilterProp='label'
            popupClassName='album-set-select-dropdown'
            loading={albumLoading}
            disabled
            options={albumOptions}
          />
        </Form.Item>


      </Form>
    </Modal>
  )
}

export default EditSet