import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  useNavigate,
  useOutletContext,
} from 'react-router-dom'

import {
  PlusOutlined,
  HomeOutlined,
} from '@ant-design/icons'

import {
  Button,
  Tabs,
  Card,
  Breadcrumb,
  Pagination,
  Row,
  Col,
} from 'antd'

import '@fortawesome/fontawesome-free/css/all.min.css'

import dayjs from 'dayjs'

import CreateNonBusiness from './Create/CreateNonBusiness'
import FilterSelection from './filters/FilterSelection'
import InactiveReasonFilter from './filters/InactiveReasonFilter'

import TableView from './TableView'
import CardView from './CardView'
import ViewSwitcher from './filters/SwitchButton'

import getTableColumns from './Column'

import CardStatus from './dashboard/CardStatus'
import CardDashboard from './dashboard/CardDashboard'

import { AuthContext } from '../../../../contexts/AuthContext'
import { PERMS } from '../../../../constants/permission/perms'

import { useAllPropertyStore } from '../../../../Stores/ManageProperty/AllProperty/AllProperty.store'

import ImageLoading from '../../../../components/Loading/ImageLoading'

const ALL_PROPERTY_VIEW_MODE_KEY =
  'all_property_view_mode'

const AllProperty = () => {
  const {
    setDisplayEmitContent,
  } = useOutletContext()

  const navigate =
    useNavigate()

  const {
    user,
    access_token,
    checkPermission,
  } = useContext(AuthContext)

  const [
    username,
    setUsername,
  ] = useState(
    user?.username
  )

  /* =========================================================
     CHECK PERMISSION
  ========================================================= */

  useEffect(() => {
    if (
      !checkPermission(
        PERMS.ALL_PROPERTY_MANAGEMENT
      )
    ) {
      navigate(
        '/',
        {
          replace: true,
        }
      )
    }
  }, [
    checkPermission,
    navigate,
  ])

  if (
    !checkPermission(
      PERMS.ALL_PROPERTY_MANAGEMENT
    )
  ) {
    return null
  }

  /* =========================================================
     GENERAL STATE
  ========================================================= */

  const [
    openAdd,
    setOpenAdd,
  ] =
    useState(false)

  const [
    viewMode,
    setViewMode,
  ] =
    useState(() => {
      return (
        localStorage.getItem(
          ALL_PROPERTY_VIEW_MODE_KEY
        ) ||
        'table'
      )
    })

  const [
    loading,
    setLoading,
  ] =
    useState(true)

  /* =========================================================
     PAGINATION
  ========================================================= */

  const [
    currentPage,
    setCurrentPage,
  ] =
    useState(1)

  const [
    pageSize,
    setPageSize,
  ] =
    useState(10)

  const [
    totalRecords,
    setTotalRecords,
  ] =
    useState(0)

  const [
    totalPages,
    setTotalPages,
  ] =
    useState(0)

  /* =========================================================
     TABS + STATUS
  ========================================================= */

  const [
    activeTab,
    setActiveTab,
  ] =
    useState('all')

  const [
    activeStatus,
    setActiveStatus,
  ] =
    useState('All')

  /* =========================================================
     NEW - INACTIVE REASON FILTER
  ========================================================= */

  const [
    inactiveReason,
    setInactiveReason,
  ] =
    useState('All')

  const [
    reasonSummary,
    setReasonSummary,
  ] =
    useState({})

  /* =========================================================
     DATA
  ========================================================= */

  const [
    properties,
    setProperties,
  ] =
    useState([])

  /* =========================================================
     FILTERS
  ========================================================= */

  const [
    filterSearch,
    setFilterSearch,
  ] =
    useState()

  const [
    filterCategory,
    setFilterCategory,
  ] =
    useState()

  const [
    filterProvince,
    setFilterProvince,
  ] =
    useState()

  const [
    filterUser,
    setFilterUser,
  ] =
    useState()

  const [
    filterOwnership,
    setFilterOwnership,
  ] =
    useState()

  const [
    allFilter,
    setAllFilter,
  ] =
    useState()

  const [
    filterDateRange,
    setFilterDateRange,
  ] =
    useState()

  /* =========================================================
     STATUS SUMMARY
  ========================================================= */

  const [
    statusSummary,
    setStatusSummary,
  ] =
    useState()

  /* =========================================================
     STORE
  ========================================================= */

  const {
    fetchAllProperty,
  } =
    useAllPropertyStore()

  /* =========================================================
     SAVE VIEW MODE
  ========================================================= */

  useEffect(() => {
    localStorage.setItem(
      ALL_PROPERTY_VIEW_MODE_KEY,
      viewMode
    )
  }, [
    viewMode,
  ])

  /* =========================================================
     BUILD BACKEND FILTER
  ========================================================= */

  const buildBackendFilters =
    () => {
      const payload = {}

      /* -----------------------------------------------------
         STATUS
      ----------------------------------------------------- */

      if (
        activeStatus &&
        activeStatus !== 'All' &&
        activeStatus !== 'Dashboard'
      ) {
        payload.status =
          activeStatus
      }

      /* -----------------------------------------------------
         NEW - INACTIVE REASON

         Only send reason when:
         status = Inactive
         AND reason != All
      ----------------------------------------------------- */

      if (
        activeStatus ===
        'Inactive' &&
        inactiveReason &&
        inactiveReason !==
        'All'
      ) {
        payload.reason =
          inactiveReason
      }

      /* -----------------------------------------------------
         SEARCH
      ----------------------------------------------------- */

      if (
        filterSearch &&
        typeof filterSearch
          ?.search ===
        'string' &&
        filterSearch.search.trim() !==
        ''
      ) {
        payload.keyword =
          filterSearch.search.trim()
      }

      /* -----------------------------------------------------
         CATEGORY
      ----------------------------------------------------- */

      if (
        filterCategory &&
        typeof filterCategory
          ?.filterCategory ===
        'string' &&
        filterCategory.filterCategory.trim() !==
        ''
      ) {
        payload.category =
          filterCategory.filterCategory.trim()
      }

      /* -----------------------------------------------------
         PROVINCE
      ----------------------------------------------------- */

      if (filterProvince) {
        let provinceValue =
          null

        if (
          !provinceValue &&
          (
            typeof filterProvince
              .filterProvince ===
            'number' ||
            typeof filterProvince
              .filterProvince ===
            'string'
          )
        ) {
          provinceValue =
            filterProvince.filterProvince
        }

        if (
          provinceValue
        ) {
          payload.provinceId =
            provinceValue
        }
      }

      /* -----------------------------------------------------
         OWNERSHIP
      ----------------------------------------------------- */

      if (
        filterOwnership &&
        typeof filterOwnership
          ?.filterOwnership ===
        'string' &&
        filterOwnership.filterOwnership.trim() !==
        ''
      ) {
        payload.ownership =
          filterOwnership.filterOwnership.trim()
      }

      /* -----------------------------------------------------
         USER
      ----------------------------------------------------- */

      if (
        filterUser &&
        typeof filterUser
          ?.filterUser ===
        'string' &&
        filterUser.filterUser.trim() !==
        ''
      ) {
        payload.updateBy =
          filterUser.filterUser.trim()
      }

      /* -----------------------------------------------------
         DATE RANGE
      ----------------------------------------------------- */

      if (
        filterDateRange
          ?.filterDateRange
          ?.length ===
        2 &&
        dayjs.isDayjs(
          filterDateRange
            ?.filterDateRange?.[0]
        ) &&
        dayjs.isDayjs(
          filterDateRange
            ?.filterDateRange?.[1]
        )
      ) {
        const [
          startDate,
          endDate,
        ] =
          filterDateRange.filterDateRange

        payload.fromTo = {
          from:
            startDate.format(
              'YYYY-MM-DD'
            ),

          to:
            endDate.format(
              'YYYY-MM-DD'
            ),
        }
      }

      /* -----------------------------------------------------
         ADVANCED FILTER
      ----------------------------------------------------- */

      if (
        allFilter?.allFilter
      ) {
        const filter =
          allFilter.allFilter

        const setIfHasValue =
          (key) => {
            const value =
              filter[key]

            if (
              value !==
              undefined &&
              value !== null &&
              value !== '' &&
              payload[key] ===
              undefined
            ) {
              payload[key] =
                value
            }
          }

        setIfHasValue(
          'category'
        )

        setIfHasValue(
          'subCategory'
        )

        setIfHasValue(
          'typeOfPlace'
        )

        setIfHasValue(
          'provinceId'
        )

        setIfHasValue(
          'districtId'
        )

        setIfHasValue(
          'communeId'
        )

        setIfHasValue(
          'village'
        )

        setIfHasValue(
          'belongTo'
        )

        setIfHasValue(
          'updateBy'
        )

        setIfHasValue(
          'ownership'
        )
      }

      /* -----------------------------------------------------
         PAGINATION
      ----------------------------------------------------- */

      payload.page =
        currentPage

      payload.limit =
        pageSize

      return payload
    }

  /* =========================================================
     MEMO BACKEND FILTER
  ========================================================= */

  const backendFilters =
    useMemo(
      () =>
        buildBackendFilters(),
      [
        activeStatus,

        inactiveReason,

        filterSearch,

        filterCategory,

        filterProvince,

        filterUser,

        filterOwnership,

        filterDateRange,

        allFilter,

        currentPage,

        pageSize,
      ]
    )

  const filtersKey =
    useMemo(
      () =>
        JSON.stringify(
          backendFilters
        ),
      [
        backendFilters,
      ]
    )

  /* =========================================================
     REQUEST DEDUPE
  ========================================================= */

  const inFlightRef =
    useRef(false)

  const lastKeyRef =
    useRef('')

  /* =========================================================
     GET ALL PROPERTY
  ========================================================= */

  const getAllProperty =
    async (
      filters,
      options = {}
    ) => {
      const {
        force = false,
      } = options

      const key =
        JSON.stringify(
          filters ||
          {}
        )

      if (
        inFlightRef.current
      ) {
        return
      }

      inFlightRef.current =
        true

      lastKeyRef.current =
        key

      setLoading(true)

      try {
        const data =
          await fetchAllProperty(
            access_token,
            filters,
            {
              force,
            }
          )

        if (data) {
          const raw =
            data?.data
              ? data
              : null

          const wrapper =
            data?.cached
              ? data
              : null

          /* -------------------------------------------------
             LOCATIONS
          ------------------------------------------------- */

          const locations =
            raw?.data
              ?.locations ||
            wrapper?.data
              ?.locations ||
            []

          /* -------------------------------------------------
             STATUS SUMMARY
          ------------------------------------------------- */

          const summary =
            raw?.data
              ?.statusSummary ||
            wrapper?.data
              ?.statusSummary ||
            {}

          /* -------------------------------------------------
             NEW - REASON SUMMARY

             Expected example:

             reasonSummary: {
               "All": 450,
               "Permanently Closed": 100,
               "Data Maintenance": 50,
               "Does Not Meet Listing Criteria": 100,
               "Policy Violation / Reported": 200
             }
          ------------------------------------------------- */

          const nextReasonSummary =
            raw?.data
              ?.reasonSummary ||
            wrapper?.data
              ?.reasonSummary ||
            {}

          setProperties(
            locations
          )

          setStatusSummary(
            summary ||
            {}
          )

          setReasonSummary(
            nextReasonSummary ||
            {}
          )

          /* -------------------------------------------------
             PAGINATION
          ------------------------------------------------- */

          const pagination =
            raw?.data
              ?.pagination ||
            wrapper?.data
              ?.pagination ||
            null

          if (
            pagination
          ) {
            const nextPage =
              pagination.currentPage ||
              1

            const nextSize =
              pagination.pageSize ||
              pageSize

            const nextTotalRecords =
              pagination.totalRecords ||
              0

            const nextTotalPages =
              pagination.totalPages ||
              0

            setCurrentPage(
              prev =>
                prev ===
                  nextPage
                  ? prev
                  : nextPage
            )

            setPageSize(
              prev =>
                prev ===
                  nextSize
                  ? prev
                  : nextSize
            )

            setTotalRecords(
              nextTotalRecords
            )

            setTotalPages(
              nextTotalPages
            )
          } else {
            setTotalRecords(
              locations.length
            )

            setTotalPages(
              1
            )
          }
        }
      } catch (e) {
        lastKeyRef.current =
          ''
      } finally {
        setLoading(false)

        inFlightRef.current =
          false
      }
    }

  /* =========================================================
     FETCH WHEN FILTER CHANGES
  ========================================================= */

  useEffect(() => {
    const t =
      setTimeout(
        () => {
          getAllProperty(
            backendFilters
          )
        },
        250
      )

    return () =>
      clearTimeout(t)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filtersKey,
  ])

  /* =========================================================
     RESET PAGE WHEN MAIN TAB CHANGES
  ========================================================= */

  useEffect(() => {
    setCurrentPage(1)
  }, [
    activeTab,
  ])

  /* =========================================================
     VIEW PROPERTY
  ========================================================= */

  const handleView =
    (record) => {
      navigate(
        `/property/${record?._id}/info`
      )
    }

  /* =========================================================
     SMALL FILTERS
  ========================================================= */

  const onHandleSearch =
    (value) =>
      setFilterSearch(
        value
      )

  const onHandleFilterCategory =
    (value) =>
      setFilterCategory(
        value
      )

  const onHandleFilterProvince =
    (value) =>
      setFilterProvince(
        value
      )

  const onHandleFilterUser =
    (value) =>
      setFilterUser(
        value
      )

  const onHandleFilterOwnership =
    (value) =>
      setFilterOwnership(
        value
      )

  const onHandleAllFilter =
    (value) =>
      setAllFilter(
        value
      )

  const onHandleFilterDateRange =
    (value) =>
      setFilterDateRange(
        value
      )

  /* =========================================================
     FILTER DATA BY MAIN TAB
  ========================================================= */

  const filterData =
    () => {
      let filtered =
        properties

      if (
        activeTab ===
        'pending'
      ) {
        filtered =
          filtered.filter(
            (item) =>
              item.belong_to ===
              '' ||
              item.belong_to ===
              'admin'
          )
      } else if (
        activeTab ===
        'non-pending'
      ) {
        filtered =
          filtered.filter(
            (item) =>
              item.belong_to !==
              '' &&
              item.belong_to !==
              'admin'
          )
      }

      return filtered
    }

  /* =========================================================
     STATUS CARD CHANGE
  ========================================================= */

  const onChangeActiveFilterCard =
    (status) => {
      setCurrentPage(1)

      setActiveStatus(
        status
      )

      /*
       * When leaving Inactive,
       * reset reason back to All.
       */
      if (
        status !==
        'Inactive'
      ) {
        setInactiveReason(
          'All'
        )
      }
    }

  /* =========================================================
     NEW - REASON FILTER CHANGE
  ========================================================= */

  const onChangeInactiveReason =
    (reason) => {
      setCurrentPage(1)

      setInactiveReason(
        reason
      )
    }

  /* =========================================================
     FILTERED DATA
  ========================================================= */

  const filteredData =
    filterData()

  /* =========================================================
     TABLE COLUMNS
  ========================================================= */

  const tableColumns =
    getTableColumns(
      currentPage,
      pageSize,
      handleView,

      () =>
        getAllProperty(
          backendFilters,
          {
            force: true,
          }
        ),

      activeStatus
    )
  /* =========================================================
     BREADCRUMB
  ========================================================= */

  useEffect(() => {
    setDisplayEmitContent(
      <div className='flex justify-between my-3'>
        <div className='flex'>
          <Breadcrumb
            items={[
              {
                title: (
                  <HomeOutlined
                    style={{
                      cursor:
                        'pointer',
                    }}
                  />
                ),
              },

              {
                title: (
                  <span>
                    Warehouse
                  </span>
                ),
              },

              {
                title: (
                  <span>
                    Place Listing
                  </span>
                ),
              },

              {
                title: (
                  <span>
                    All Property
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>
    )
  }, [
    navigate,
    setDisplayEmitContent,
  ])

  /* =========================================================
     UI
  ========================================================= */

  return (
    <>
      <div className='font-bold text-lg my-1'>
        All Property
      </div>

      {/* =====================================================
          CREATE PROPERTY
      ===================================================== */}

      <CreateNonBusiness
        open={
          openAdd
        }
        setOpen={
          setOpenAdd
        }
        access_token={
          access_token
        }
        username={
          username
        }
        getAllProperty={() =>
          getAllProperty(
            backendFilters
          )
        }
      />

      {/* =====================================================
          MOBILE CREATE BUTTON
      ===================================================== */}

      <Row
        className='md:hidden flex my-2'
        gutter={[
          8,
          2,
        ]}
      >
        <Col
          xs={
            24
          }
          sm={
            24
          }
        >
          {checkPermission(
            PERMS.ASSIGNED_USER
          ) ? (
            <Button
              style={{
                width:
                  '100%',
              }}
              type='primary'
              icon={
                <PlusOutlined />
              }
              onClick={() =>
                setOpenAdd(
                  true
                )
              }
            >
              Create Place Non Business
            </Button>
          ) : (
            ''
          )}
        </Col>
      </Row>

      {/* =====================================================
          MAIN TABS
      ===================================================== */}

      <span className='apply-all-tabs'>
        <Tabs
          activeKey={
            activeTab
          }
          onChange={
            setActiveTab
          }
          className='mb-2 rounded-md'
          tabBarExtraContent={
            <Row
              className='md:flex hidden mx-3'
              gutter={[
                8,
                2,
              ]}
            >
              {checkPermission(
                PERMS.ASSIGNED_USER
              ) ? (
                <Button
                  style={{
                    width:
                      '100%',
                  }}
                  type='primary'
                  icon={
                    <PlusOutlined />
                  }
                  onClick={() =>
                    setOpenAdd(
                      true
                    )
                  }
                >
                  Create Place Non Business
                </Button>
              ) : (
                ' '
              )}

              <Col
                xs={
                  24
                }
                sm={
                  24
                }
              />
            </Row>
          }
          items={[
            /* =================================================
               ALL PROPERTY
            ================================================= */

            {
              key:
                'all',

              label: (
                <span className='text-md font-semibold'>
                  All Property
                </span>
              ),

              children: (
                <>
                  <CardStatus
                    activeTab={
                      activeTab
                    }
                    status={
                      statusSummary
                    }
                    activeStatus={
                      activeStatus
                    }
                    setActiveStatus={
                      onChangeActiveFilterCard
                    }
                  />

                  <span
                    hidden={
                      activeStatus ===
                      'Dashboard'
                    }
                  >
                    <FilterSelection
                      onHandleFilterCategory={
                        onHandleFilterCategory
                      }
                      onHandleFilterProvince={
                        onHandleFilterProvince
                      }
                      onHandleFilterUser={
                        onHandleFilterUser
                      }
                      onHandleFilterOwnership={
                        onHandleFilterOwnership
                      }
                      onHandleSearch={
                        onHandleSearch
                      }
                      onHandleAllFilter={
                        onHandleAllFilter
                      }
                      onHandleFilterDateRange={
                        onHandleFilterDateRange
                      }
                    />
                  </span>
                </>
              ),
            },

            /* =================================================
               NON BUSINESS
            ================================================= */

            {
              key:
                'pending',

              label: (
                <span className='text-md font-semibold'>
                  Non Business Property
                </span>
              ),

              children: (
                <>
                  <CardStatus
                    activeTab={
                      activeTab
                    }
                    status={
                      statusSummary
                    }
                    activeStatus={
                      activeStatus
                    }
                    setActiveStatus={
                      onChangeActiveFilterCard
                    }
                  />

                  <span
                    hidden={
                      activeStatus ===
                      'Dashboard'
                    }
                  >
                    <FilterSelection />
                  </span>
                </>
              ),
            },

            /* =================================================
               BUSINESS
            ================================================= */

            {
              key:
                'non-pending',

              label: (
                <span className='text-md font-semibold'>
                  Business Property
                </span>
              ),

              children: (
                <>
                  <CardStatus
                    activeTab={
                      activeTab
                    }
                    status={
                      statusSummary
                    }
                    activeStatus={
                      activeStatus
                    }
                    setActiveStatus={
                      onChangeActiveFilterCard
                    }
                  />
                </>
              ),
            },
          ]}
        />
      </span>

      {/* =====================================================
          DASHBOARD
      ===================================================== */}

      <span
        hidden={
          activeStatus !==
          'Dashboard'
        }
      >
        <CardDashboard
          data={
            filteredData
          }
        />
      </span>

      {/* =====================================================
          TABLE / CARD VIEW
      ===================================================== */}
      <Card
        hidden={activeStatus === 'Dashboard'}

        styles={{
          header: {
            alignItems: 'flex-start',
          },

          title: {
            overflow: 'visible',
            whiteSpace: 'normal',
            textOverflow: 'unset',
            padding: '12px 0',
          },
        }}

        title={
          <div className='text-sm flex items-center gap-3'>
            {/* TOTAL */}
            <div className='flex items-center'>
              <span className='text-blue-700'>
                {totalRecords}
              </span>

              <span className='text-gray-400 ml-1'>
                | Total Amount
              </span>
            </div>

            {/* INACTIVE REASON FILTER */}
            {activeStatus === 'Inactive' && (
              <div className='flex items-center'>
                <InactiveReasonFilter
                  value={inactiveReason}
                  onChange={onChangeInactiveReason}
                  reasonSummary={reasonSummary}
                  totalInactive={statusSummary?.Inactive || 0}
                />
              </div>
            )}
          </div>
        }

        extra={
          <div className='flex items-center space-x-2'>
            <ViewSwitcher
              viewMode={viewMode}
              onViewModeChange={(mode) =>
                setViewMode(mode)
              }
            />
          </div>
        }
      >
        <div
          style={{
            position: 'relative',
          }}
        >
          {/* your existing table/content here */}
        </div>

        <div
          style={{
            position:
              'relative',
          }}
        >


          {loading && (
            <div
              style={{
                position:
                  'absolute',

                inset:
                  0,

                zIndex:
                  10,

                display:
                  'flex',

                justifyContent:
                  'center',

                alignItems:
                  'center',

                background:
                  'rgba(255,255,255,0.6)',
              }}
            >
              <ImageLoading
                overlay={
                  false
                }
                size={
                  60
                }
                logoSize={
                  25
                }
              />
            </div>
          )}

          {/* =================================================
              TABLE / CARD
          ================================================= */}

          {activeTab !==
            'dashboard' &&
            (
              viewMode ===
                'table'
                ? (
                  <TableView
                    data={
                      filteredData
                    }
                    loading={
                      loading
                    }
                    columns={
                      tableColumns
                    }
                    currentPage={
                      currentPage
                    }
                    pageSize={
                      pageSize
                    }
                  />
                )
                : (
                  <div>
                    <CardView
                      handleView={
                        handleView
                      }
                      data={
                        filteredData
                      }
                      currentPage={
                        currentPage
                      }
                      pageSize={
                        pageSize
                      }
                    />
                  </div>
                )
            )}

          {/* =================================================
              PAGINATION
          ================================================= */}

          {activeTab !==
            'dashboard' && (
              <div
                style={{
                  display:
                    'flex',

                  justifyContent:
                    'end',

                  textAlign:
                    'center',

                  marginTop:
                    '16px',
                }}
              >
                <Pagination
                  current={
                    currentPage
                  }
                  pageSize={
                    pageSize
                  }
                  total={
                    totalRecords
                  }
                  onChange={(
                    page,
                    size
                  ) => {
                    setCurrentPage(
                      page
                    )

                    setPageSize(
                      size
                    )
                  }}
                  pageSizeOptions={[
                    '10',
                    '20',
                    '50',
                    '100',
                  ]}
                  showSizeChanger
                />
              </div>
            )}
        </div>
      </Card>
    </>
  )
}

export default AllProperty