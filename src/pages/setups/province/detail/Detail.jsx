import React, { useState, useEffect, useContext, useMemo, useRef } from 'react'
import {
  Avatar,
  Button,
  Card,
  Tabs,
  Breadcrumb,
  Skeleton,
} from 'antd'
import {
  HomeOutlined,
  EnvironmentOutlined,
  ArrowLeftOutlined,
  GlobalOutlined,
  AppstoreOutlined,
  TagsOutlined,
  PictureOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { AuthContext } from '../../../../contexts/AuthContext'
import helpFunctions from '../../../../utils/helpFunctions'
import { PERMS } from '../../../../constants/permission/perms'
import { useProvinceStore } from '../../../../Stores/Province/province.store'
import CoverSlideshow from './SlideShow'

//  tabs (5 files)
import OverviewTab from './tabs/OverviewTab'
import PlacesTab from './tabs/PlacesTab'
import AreasTab from './tabs/AreasTab'
import MomentsTab from './tabs/MomentsTab'
import CategoriesTab from './tabs/CategoriesTab'

// small image helper
const pickSmallImage = (images = []) => {
  if (!Array.isArray(images)) return ''
  return (
    images.find((u) => typeof u === 'string' && u.includes('/original-')) ||
    images[3] ||
    images[0] ||
    ''
  )
}

const normalizeProvince = (res) => {
  // supports: {success:true,data:{...}} OR direct object
  return res
}

const ProfileProvinceDetail = () => {
  const { id } = useParams()
  const { getFileImage } = helpFunctions
  const { access_token, checkPermission } = useContext(AuthContext)
  const { provinces, provinceDetail, fetchProvinceById } = useProvinceStore()
  const navigate = useNavigate()
  const { setDisplayEmitContent } = useOutletContext() || {}

  const [openEdit, setOpenEdit] = useState(false)
  const [activeTabKey, setActiveTabKey] = useState('overview')
  const [loading, setLoading] = useState(true)
  //  NEW: keep latest token without triggering refetch
  const accessTokenRef = useRef(access_token)
  useEffect(() => {
    accessTokenRef.current = access_token
  }, [access_token])

  //  ADD: key to re-trigger animation on each tab click
  const [fadeKey, setFadeKey] = useState(0)

  //  ADD: smooth tab change handler (keeps your state)
  const onTabChange = (key) => {
    setActiveTabKey(key)
    setFadeKey((v) => v + 1)
  }

  //  permission
  useEffect(() => {
    if (!checkPermission(PERMS.PROVINCE_MANAGEMENT)) {
      navigate('/', { replace: true })
    }
  }, [checkPermission, navigate])

  if (!checkPermission(PERMS.PROVINCE_MANAGEMENT)) return null

  //  FIX: fetch ONLY when id changes (not when token refreshes)
  useEffect(() => {
    let mounted = true

    const run = async () => {
      const token = accessTokenRef.current
      if (!id || !token) return
      try {
        if (mounted) setLoading(true)
        await fetchProvinceById(token, id)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    run()

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const onEdit = () => setOpenEdit(true)
  const handleBack = () => navigate('/province')

  //  header (like screenshot)
  useEffect(() => {
    if (!setDisplayEmitContent) return
    setDisplayEmitContent(
      <div className="flex justify-between my-2 items-center">
        <div
          className="flex items-center space-x-2 dark:text-slate-200"
          style={{ color: '#495057' }}
        >
          <Button
            style={{ width: 40 }}
            className="dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-100"
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
          />
          <span className="font-medium dark:text-slate-200">Province Detail</span>
        </div>

        <div className="dark:[&_.ant-breadcrumb_*]:!text-white dark:[&_.anticon]:!text-white">
          <Breadcrumb
            items={[
              {
                title: (
                  <HomeOutlined
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate('/province')}
                  />
                ),
              },
              { title: 'Province' },
              { title: 'Detail' },
            ]}
          />
        </div>
      </div>
    )
  }, [navigate, setDisplayEmitContent])

  //  counts (safe defaults)
  const counts = useMemo(() => {
    return {
      places: provinceDetail?.placesCount || provinceDetail?.placeCount || 0,
      areas: provinceDetail?.areasCount || 0,
      moments: provinceDetail?.momentsCount || 0,
      categories: provinceDetail?.categoriesCount || 0,
    }
  }, [provinceDetail])

  const avatarSrc = useMemo(() => {
    const img = pickSmallImage(provinceDetail?.images)
    return img || provinceDetail?.images?.[0] || ''
  }, [provinceDetail])

  const tabItems = useMemo(
    () => [
      {
        key: 'overview',
        label: (
          <span className="flex items-center gap-2">
            <GlobalOutlined /> Overview
          </span>
        ),
        children: (
          <div
            key={`tab-${activeTabKey}-${fadeKey}`}
            className="transition-all duration-300 ease-out opacity-0 translate-y-2 animate-[fadeInUp_.3s_ease-out_forwards]"
          >
            <OverviewTab loading={loading} province={provinceDetail} />
          </div>
        ),
      },
      {
        key: 'places',
        label: (
          <span className="flex items-center gap-2">
            <UnorderedListOutlined /> Places ({counts.places})
          </span>
        ),
        children: (
          <div
            key={`tab-${activeTabKey}-${fadeKey}`}
            className="transition-all duration-300 ease-out opacity-0 translate-y-2 animate-[fadeInUp_.3s_ease-out_forwards]"
          >
            <PlacesTab provinceId={id} />
          </div>
        ),
      },
      {
        key: 'areas',
        label: (
          <span className="flex items-center gap-2">
            <AppstoreOutlined /> Areas ({counts.areas})
          </span>
        ),
        children: (
          <div
            key={`tab-${activeTabKey}-${fadeKey}`}
            className="transition-all duration-300 ease-out opacity-0 translate-y-2 animate-[fadeInUp_.3s_ease-out_forwards]"
          >
            <AreasTab provinceId={id} />
          </div>
        ),
      },
      {
        key: 'moments',
        label: (
          <span className="flex items-center gap-2">
            <PictureOutlined /> Moments ({counts.moments})
          </span>
        ),
        children: (
          <div
            key={`tab-${activeTabKey}-${fadeKey}`}
            className="transition-all duration-300 ease-out opacity-0 translate-y-2 animate-[fadeInUp_.3s_ease-out_forwards]"
          >
            <MomentsTab provinceId={id} />
          </div>
        ),
      },
      {
        key: 'categories',
        label: (
          <span className="flex items-center gap-2">
            <TagsOutlined /> Categories
          </span>
        ),
        children: (
          <div
            key={`tab-${activeTabKey}-${fadeKey}`}
            className="transition-all duration-300 ease-out opacity-0 translate-y-2 animate-[fadeInUp_.3s_ease-out_forwards]"
          >
            <CategoriesTab provinceId={id} />
          </div>
        ),
      },
    ],
    [counts, id, loading, provinceDetail, activeTabKey, fadeKey]
  )

  return (
    <div className="bg-gray-100 dark:bg-slate-950 min-h-screen max-w-8xl mx-auto">
      <style>
        {`
          @keyframes fadeInUp {
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>

      <div className="relative">
        <div className="w-full overflow-hidden rounded-t-lg bg-white dark:bg-slate-900">
          {loading ? (
            <div className="p-4 dark:bg-slate-900">
              <Skeleton active paragraph={{ rows: 6 }} />
            </div>
          ) : (
            <CoverSlideshow
              images={provinceDetail?.images || []}
              videos={provinceDetail?.videos || []}
              getFileImage={getFileImage}
              filePath={provinceDetail?.filePath}
              id={id}
            />
          )}
        </div>

        <div
          style={{ zIndex: 20 }}
          className="absolute bottom-[-150px] lg:bottom-[-90px] md:right-0 md:left-0 left-1/2 transform -translate-x-1/2 lg:flex items-end lg:left-14 md:transform-none"
        >
          <div className="flex justify-center">
            <Avatar
              size={120}
              src={avatarSrc}
              className="border-4 border-white dark:border-slate-900 bg-gray-200 dark:bg-slate-800"
            />
          </div>

          <div className="lg:ml-4 mb-5">
            <h2 className="text-2xl font-bold flex items-center justify-center lg:justify-start text-slate-900 dark:text-slate-100">
              <span>{provinceDetail?.provinceEn || '-'}</span>
            </h2>

            <p className="text-gray-600 dark:text-slate-300 flex items-center justify-center lg:justify-start space-x-2">
              <EnvironmentOutlined />
              <span>{provinceDetail?.provinceKh || '-'}</span>
              <span> - </span>
              <span>Cambodia</span>
            </p>
          </div>
        </div>
      </div>

      <Card
        className="mt-40 lg:mt-28 dark:!bg-slate-900 dark:!text-slate-100 dark:!border-slate-800"
        style={{ borderRadius: 12 }}
      >
        <div className="dark:[&_.ant-tabs-tab]:!text-slate-300 dark:[&_.ant-tabs-tab-active]:!text-white dark:[&_.ant-tabs-ink-bar]:!bg-blue-500">
          <Tabs
            activeKey={activeTabKey}
            onChange={onTabChange}
            items={tabItems}
          />
        </div>
      </Card>
    </div>
  )
}

export default ProfileProvinceDetail