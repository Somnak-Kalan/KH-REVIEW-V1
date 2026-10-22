import { useContext, useEffect, useState } from 'react'
import {
  useNavigate,
  useOutletContext,
  useSearchParams,
} from 'react-router-dom'
import { Breadcrumb, Input, Button, Space } from 'antd'
import {
  HomeOutlined,
  SearchOutlined,
  PlusOutlined,
} from '@ant-design/icons'

import TableHeader from '../../../widgets/TableHeader'
import { AuthContext } from '../../../contexts/AuthContext'
import { PERMS } from '../../../constants/permission/perms'

import KeywordList from './KeywordList'
import KeywordGroupList from './KeywordGroupList'

import useKeywordStore from '../../../Stores/settings/setups/keyword.store'
import useKeywordGroupStore from '../../../Stores/settings/setups/keyword-group.store'

const Keywords = () => {
  const TAB_KEYS = ['keywords', 'keyword-groups']

  const getSafeTab = (tab) => {
    return TAB_KEYS.includes(tab) ? tab : 'keywords'
  }

  const { access_token, checkPermission } =
    useContext(AuthContext)

  const { setDisplayEmitContent } =
    useOutletContext()

  const navigate = useNavigate()

  const [searchParams, setSearchParams] =
    useSearchParams()

  const tabFromUrl =
    getSafeTab(searchParams.get('tab'))

  const [search, setSearch] =
    useState('')

  const [activeTab, setActiveTab] =
    useState(tabFromUrl)

  const [tabDirection, setTabDirection] =
    useState(1)

  const [keywordAddSignal, setKeywordAddSignal] =
    useState(0)

  const [groupAddSignal, setGroupAddSignal] =
    useState(0)

  /*
    Real total from:
    GET /core/setup/keyword/list
  */
  const keywordTotal = useKeywordStore(
    (state) => state.pagination?.total || 0
  )

  /*
    Real total from:
    GET /core/setup/keyword/group/list
  */
  const keywordGroupTotal = useKeywordGroupStore(
    (state) => state.pagination?.total || 0
  )

  const canManage =
    checkPermission(PERMS.ASSIGNED_USER)

  useEffect(() => {
    if (!checkPermission(PERMS.KEYWORD_MANAGEMENT)) {
      navigate('/', { replace: true })
    }
  }, [checkPermission, navigate])

  useEffect(() => {
    setDisplayEmitContent(
      <div className='flex justify-between my-3'>
        <div className='font-semibold text-gray-700 dark:text-slate-300'>
          Keyword
        </div>

        <Breadcrumb
          items={[
            {
              title: (
                <HomeOutlined
                  style={{
                    cursor: 'pointer',
                  }}
                />
              ),
            },
            {
              title: 'Keywords',
            },
          ]}
        />
      </div>
    )
  }, [setDisplayEmitContent])

  if (!checkPermission(PERMS.KEYWORD_MANAGEMENT)) {
    return null
  }

  const handleAdd = () => {
    if (activeTab === 'keywords') {
      setKeywordAddSignal(
        (prev) => prev + 1
      )
    } else {
      setGroupAddSignal(
        (prev) => prev + 1
      )
    }
  }

  const handleChangeTab = (key) => {
    if (key === activeTab) return

    const tabOrder = [
      'keywords',
      'keyword-groups',
    ]

    const currentIndex =
      tabOrder.indexOf(activeTab)

    const nextIndex =
      tabOrder.indexOf(key)

    setTabDirection(
      nextIndex > currentIndex
        ? 1
        : -1
    )

    setActiveTab(key)
    setSearch('')

    const nextParams =
      new URLSearchParams(
        searchParams
      )

    nextParams.set('tab', key)

    setSearchParams(nextParams, {
      replace: true,
    })
  }

  useEffect(() => {
    const safeTab =
      getSafeTab(
        searchParams.get('tab')
      )

    if (safeTab !== activeTab) {
      setActiveTab(safeTab)
    }
  }, [searchParams])

  const searchPlaceholder =
    activeTab === 'keywords'
      ? 'search keyword'
      : 'search keyword group'

  const addButtonText =
    activeTab === 'keywords'
      ? 'add keyword'
      : 'add group keyword'

  const totalAmount =
    activeTab === 'keywords'
      ? keywordTotal
      : keywordGroupTotal

  const tabs = [
    {
      key: 'keywords',
      label: 'Keywords',
      count: keywordTotal,
    },
    {
      key: 'keyword-groups',
      label: 'Keyword Groups',
      count: keywordGroupTotal,
    },
  ]

  const activeIndex =
    tabs.findIndex((item) => {
      return item.key === activeTab
    })

  const tabsHeader = (
    <div className='relative inline-flex items-center gap-8'>
      {tabs.map((tab) => {
        const isActive =
          activeTab === tab.key

        return (
          <button
            key={tab.key}
            type='button'
            onClick={() =>
              handleChangeTab(tab.key)
            }
            className={`relative z-10 pb-3 text-sm font-semibold transition-all duration-300 ease-out ${isActive
              ? 'text-blue-600'
              : 'text-gray-700 hover:text-blue-500 dark:text-slate-300'
              }`}
          >
            {tab.label}
            <span>
              {
                tab.count === 0 ? '' : `(${tab.count})`
              }

            </span>
          </button>
        )
      })}

      <span
        className='absolute bottom-0 h-[2px] rounded-full bg-blue-600 transition-all duration-300 ease-out'
        style={{
          width:
            activeTab === 'keywords'
              ? 82
              : 180,

          transform: `translateX(${activeIndex === 0
            ? 0
            : 114
            }px)`,
        }}
      />
    </div>
  )

  return (
    <div className='w-full'>
      <div className='mb-3 rounded-lg bg-white p-4 dark:bg-slate-900'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <Input
            allowClear
            prefix={
              <SearchOutlined className='text-blue-400' />
            }
            placeholder={
              searchPlaceholder
            }
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            className='w-full sm:max-w-md'
          />

          {canManage ? (
            <Button
              type='primary'
              icon={
                <PlusOutlined />
              }
              onClick={handleAdd}
              className='w-full sm:w-auto'
            >
              {addButtonText}
            </Button>
          ) : null}
        </div>
      </div>

      <TableHeader
        specialKey
        tabsHeader={tabsHeader}
        extra={
          <Space
            size={6}
            style={{
              lineHeight: 1,
              flexWrap: 'wrap',
            }}
          >
            <span className='text-sm font-semibold text-blue-700 dark:text-slate-400'>
              {totalAmount}
            </span>

            <span className='text-sm font-bold text-gray-400 dark:text-slate-400'>
              |
            </span>

            <span className='inline-flex items-center font-bold text-gray-400 dark:text-slate-400'>
              Total Amount
            </span>
          </Space>
        }
      >
        <div className='keyword-tab-wrapper'>
          <div
            key={activeTab}
            className={`keyword-tab-panel ${tabDirection === 1
              ? 'keyword-tab-next'
              : 'keyword-tab-prev'
              }`}
          >
            {activeTab === 'keywords' ? (
              <KeywordList
                tableOnly
                search={search}
                addSignal={
                  keywordAddSignal
                }
                access_token={
                  access_token
                }
                canManage={
                  canManage
                }
              />
            ) : (
              <KeywordGroupList
                tableOnly
                search={search}
                addSignal={
                  groupAddSignal
                }
                access_token={
                  access_token
                }
                canManage={
                  canManage
                }
              />
            )}
          </div>
        </div>
      </TableHeader>
    </div>
  )
}

export default Keywords