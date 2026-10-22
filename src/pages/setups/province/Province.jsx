import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Breadcrumb, Spin, Empty, Segmented, Typography } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { AuthContext } from '../../../contexts/AuthContext'
import { PERMS } from '../../../constants/permission/perms'

import TypeFilterOnly from '../../../components/Filter/setup/TypeFilter'
import AddProvince from './Add'
import EditProvince from './EditCover'

import ProvinceGrid from './ProvinceGrid'
import ProvinceTable from './ProvinceTable'
import { useProvinceStore } from '../../../Stores/Province/province.store'
import TableHeader from '../../../widgets/TableHeader'

const { Text } = Typography

const Province = () => {
  const { setDisplayEmitContent } = useOutletContext()
  const { access_token, checkPermission } = useContext(AuthContext)
  const navigate = useNavigate()

  const [openAdd, setOpenAdd] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [viewMode, setViewMode] = useState('grid')

  const { provinces, loading, fetchProvinces } = useProvinceStore()

  //  compute once (avoid calling checkPermission many times)
  const canManageProvince = useMemo(
    () => checkPermission?.(PERMS.PROVINCE_MANAGEMENT),
    [checkPermission]
  )

  //  redirect only once if no permission
  useEffect(() => {
    if (!canManageProvince) {
      navigate('/', { replace: true })
    }
  }, [canManageProvince, navigate])

  //  breadcrumb header (runs once per mount)
  useEffect(() => {
    setDisplayEmitContent(
      <div className="flex items-center justify-between my-3 gap-2 min-w-0">
        <div className="font-semibold text-[#495057] dark:text-slate-300 truncate min-w-0">
          Province
        </div>

        <div className="hidden sm:block">
          <Breadcrumb
            items={[
              { title: <HomeOutlined style={{ cursor: 'pointer' }} /> },
              { title: 'Province' },
            ]}
          />
        </div>
      </div>
    )
  }, [setDisplayEmitContent])

  //  prevent duplicate initial fetch (StrictMode / remount)
  const didFetchRef = useRef(false)

  useEffect(() => {
    if (!canManageProvince) return
    if (!access_token) return

    // If already have data, don’t refetch on mount (optional but recommended)
    if (Array.isArray(provinces) && provinces.length > 0) return

    if (didFetchRef.current) return
    didFetchRef.current = true

    fetchProvinces(access_token, '')
  }, [access_token, canManageProvince, fetchProvinces, provinces])

  const getProvinceList = (search) => {
    if (!access_token) return
    fetchProvinces(access_token, search || '')
  }

  const handleView = (_id) => navigate(`/province/detail/${_id}`)

  if (!canManageProvince) return null

  return (
    <>
      <AddProvince open={openAdd} setOpen={setOpenAdd} />
      <EditProvince open={openEdit} setOpen={setOpenEdit} />

      {/* Search + Switch */}
      <div className="mb-2 rounded">
        <div className="mb-2 px-3 sm:px-5 py-4 bg-white rounded-lg dark:bg-slate-900">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full">
              <TypeFilterOnly typeFilter={getProvinceList} />
            </div>

            <div className="w-full sm:w-auto overflow-x-auto">
              <div className="min-w-max">
                <Segmented
                  className="
                    dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700
                    dark:[&_.ant-segmented-item:hover_.ant-segmented-item-label]:text-white
                    dark:[&_.ant-segmented-item-selected]:bg-slate-600
                    dark:[&_.ant-segmented-item-selected_.ant-segmented-item-label]:text-white
                    dark:[&_.ant-segmented-thumb]:bg-slate-900
                  "
                  value={viewMode}
                  onChange={setViewMode}
                  options={[
                    { label: 'Table', value: 'table' },
                    { label: 'Grid', value: 'grid' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <TableHeader total={provinces?.length} label="Total Amount">
        <Spin spinning={loading} size="medium">
          {provinces?.length > 0 ? (
            viewMode === 'grid' ? (
              <ProvinceGrid data={provinces} onView={handleView} />
            ) : (
              <ProvinceTable data={provinces} onView={handleView} />
            )
          ) : (
            !loading && (
              <div className="flex justify-center items-center h-64">
                <Empty description="No data Found" />
              </div>
            )
          )}
        </Spin>
      </TableHeader>
    </>
  )
}

export default Province