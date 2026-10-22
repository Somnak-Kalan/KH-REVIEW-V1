
import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Breadcrumb,
  Button,
  Input,
  Tabs,
} from 'antd'
import {
  HomeOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  useNavigate,
  useOutletContext,
  useSearchParams,
} from 'react-router-dom'



import { AuthContext } from '../../../../contexts/AuthContext'
import { PERMS } from '../../../../constants/permission/perms'
import useAlbumStore from '../../../../Stores/setups/album.store'
// import useAlbumSetStore from '../../../../Stores/setups/albumSet.store'

import AlbumList from './AlbumList'
import AddAlbum from './Add'

// sets is outside album
import AlbumSets from './sets/Sets'
import AddAlbumSet from './sets/AddSet'

const Album = () => {
  const {
    access_token,
    checkPermission,
  } = useContext(AuthContext)

  const { setDisplayEmitContent } =
    useOutletContext()

  const navigate = useNavigate()

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams()

  // Store data only for tab totals
  // const albums = useAlbumStore(
  //   state => state.albums || []
  // )
  const albums = []

  const albumSets = []
  // const albumSets = useAlbumSetStore(
  //   state => state.sets || []
  // )

  // UI state
  const [search, setSearch] = useState('')
  const [openAddAlbum, setOpenAddAlbum] =
    useState(false)

  const [openAddAlbumSet, setOpenAddAlbumSet] =
    useState(false)
  //
  const [amountAlbum, setAmountAlbuls] = useState(0)
  const [amountAlbumSet, setAmountAlbulsSet] = useState(0)

  // Permission
  const canManage = useMemo(() => {
    if (!access_token) return null

    return checkPermission?.(
      PERMS.ACTIVITY_MANAGEMENT
    )
  }, [access_token, checkPermission])

  const canEdit = useMemo(() => {
    if (!access_token) return false

    return checkPermission?.(
      PERMS.ASSIGNED_USER
    )
  }, [access_token, checkPermission])

  // Current tab
  const activeTab =
    searchParams.get('tab') === 'sets'
      ? 'sets'
      : 'albums'

  // Redirect without permission
  useEffect(() => {
    if (canManage === false) {
      navigate('/', {
        replace: true,
      })
    }
  }, [canManage, navigate])

  // Page header
  useEffect(() => {
    setDisplayEmitContent(
      <div className="my-3 flex items-center justify-between">
        <div className="font-semibold text-gray-700 dark:text-slate-300">
          Album
        </div>

        <Breadcrumb
          items={[
            {
              title: (
                <HomeOutlined
                  className="cursor-pointer"
                  onClick={() =>
                    navigate('/')
                  }
                />
              ),
            },
            {
              title: 'Album',
            },
          ]}
        />
      </div>
    )
  }, [
    navigate,
    setDisplayEmitContent,
  ])

  const handleTabChange = key => {
    setSearch('')

    if (key === 'sets') {
      setSearchParams({
        tab: 'sets',
      })
      return
    }

    setSearchParams({})
  }

  const handleAdd = () => {
    if (activeTab === 'sets') {
      setOpenAddAlbumSet(true)
      return
    }

    setOpenAddAlbum(true)
  }

  const addButtonText =
    activeTab === 'sets'
      ? 'Add Album Set'
      : 'Add Album'

  const searchPlaceholder =
    activeTab === 'sets'
      ? 'Search album set...'
      : 'Search album...'

  if (
    canManage === null ||
    canManage === false
  ) {
    return null
  }

  return (
    <>
      {/* Album create modal */}
      {openAddAlbum ? (
        <AddAlbum
          open={openAddAlbum}
          setOpen={setOpenAddAlbum}
          access_token={access_token}
        />
      ) : null}

      {/* Album-set create modal */}
      {openAddAlbumSet ? (
        <AddAlbumSet
          open={openAddAlbumSet}
          setOpen={setOpenAddAlbumSet}
          access_token={access_token}
        />
      ) : null}

      {/* Search and add section */}
      <div className="mb-3 rounded-lg bg-white px-3 py-4 shadow-sm dark:bg-slate-900 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-[500px]">
            <Input
              allowClear
              value={search}
              prefix={
                <SearchOutlined className="text-blue-500" />
              }
              placeholder={
                searchPlaceholder
              }
              onChange={event =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>

          {canEdit ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="w-full sm:w-auto"
              onClick={handleAdd}
            >
              {addButtonText}
            </Button>
          ) : null}
        </div>
      </div>

      {/* Tabs and tables */}
      <div className="rounded-lg bg-white px-3 pb-4 shadow-sm dark:bg-slate-900 sm:px-5">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          tabBarGutter={45}
          items={[
            {
              key: 'albums',
              label: (
                <span className="font-semibold">
                  Album ({amountAlbum})
                </span>
              ),
              children: (
                <AlbumList
                  setAmountAlbuls={setAmountAlbuls}
                  accessToken={
                    access_token
                  }
                  canEdit={canEdit}
                  search={search}
                />
              ),
            },
            {
              key: 'sets',
              label: (
                <span className="font-semibold">
                  Album Sets (
                  {amountAlbumSet})
                </span>
              ),
              children: (
                <AlbumSets
                  setAmountAlbulsSet={setAmountAlbulsSet}
                  accessToken={
                    access_token
                  }
                  canEdit={canEdit}
                  search={search}
                />
              ),
            },
          ]}
        />
      </div>
    </>
  )
}

export default Album