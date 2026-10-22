import React, {
  useContext,
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

import { AuthContext } from '../../../../../contexts/AuthContext'
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

const AddSet = ({
  open,
  setOpen,
  accessToken,
  onCreated,
}) => {
  const [form] = Form.useForm()

  const { access_token } =
    useContext(AuthContext)

  const token =
    accessToken ||
    access_token

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

  const createSet =
    useAlbumSetStore(
      state => state.createSet
    )

  const creating =
    useAlbumSetStore(
      state => state.creating
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

    form.setFieldsValue({
      nameEn: '',
      nameKh: '',
      albumIds: [],
    })

    if (
      !token ||
      typeof fetchAlbum !==
      'function'
    ) {
      return
    }

    fetchAlbum({
      access_token: token,

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
    token,
    fetchAlbum,
    form,
  ])

  const handleCancel = () => {
    if (creating) return

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

      const createdSet =
        await createSet({
          access_token: token,

          doc: {
            nameEn,
            nameKh,
            albums: albumIds,
          },
        })

      if (
        typeof onCreated ===
        'function'
      ) {
        onCreated(createdSet)
      }

      message.success(
        'Album set created successfully.'
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
          'Could not create the album set.'
        )
      )
    }
  }

  return (
    <Modal
      title='Add Album Set'
      open={open}
      width={560}
      rootClassName='album-set-modal-root'
      className='album-set-modal'
      closable={!creating}
      maskClosable={!creating}
      keyboard={!creating}
      destroyOnClose
      confirmLoading={creating}
      okText='Add Album Set'
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
            disabled={creating}
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
            disabled={creating}
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
            disabled={
              creating ||
              albumLoading
            }
            options={albumOptions}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddSet