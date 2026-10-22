import './tabs-custom.css'

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  Badge,
  Button,
  Card,
  Col,
  Row,
  Tabs as AntTabs,
  Tooltip,
} from 'antd'

import IconClock from '../../../../assets/icon/Clock.svg'
import Swal from 'sweetalert2'

import {
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from 'react-router-dom'

import Thumbnail from './placeInformation/Thumbnail/Thumbnail'
import SlideImage from './placeInformation/slideshow/SlideImage'
import DashboardCard from './placeInformation/DashboardCard'
import GroupInfo from './placeInformation/groupInfo/Tabs'
import VideoImageTab from './VideoImages/Tabs'
import ReviewTabs from './reviews/Tabs'
import TaskCommentsPlain from './tasks/Task'

import {
  useAllPropertyStore,
} from '../../../../Stores/ManageProperty/AllProperty/AllProperty.store'

import {
  AuthContext,
} from '../../../../contexts/AuthContext'

import helpFunctions from '../../../../utils/helpFunctions'


const EMPTY_MEDIA = {
  video: [],
  image: [],
  gallery: [],
  albumSets: [],
}


/* =========================================================
   REASON LABELS
========================================================= */

const STATUS_REASON_LABELS = {
  permanently_closed:
    'Permanently Closed',

  data_maintenance:
    'Data Maintenance',

  does_not_meet_listing_criteria:
    'Does Not Meet Listing Criteria',

  policy_violation_reported:
    'Policy Violation / Reported',
}


/* =========================================================
   FORMAT REASON
========================================================= */

const formatReason = (value) => {
  if (!value) {
    return '-'
  }

  return (
    STATUS_REASON_LABELS[value] ||
    String(value)
      .replaceAll('_', ' ')
      .replace(
        /\b\w/g,
        (char) =>
          char.toUpperCase()
      )
  )
}


/* =========================================================
   FORMAT DATE
========================================================= */

const formatHistoryDate = (value) => {
  if (!value) {
    return '-'
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '-'
  }

  const datePart =
    new Intl.DateTimeFormat(
      'en-US',
      {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }
    ).format(date)

  const timePart =
    new Intl.DateTimeFormat(
      'en-US',
      {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }
    ).format(date)

  return `${datePart} • ${timePart}`
}


/* =========================================================
   GET HISTORY USER
========================================================= */

const getHistoryUser = (item) => {
  if (!item) {
    return '-'
  }

  const candidates = [
    item?.updatedBy,
    item?.createdBy,
    item?.inactiveBy,
    item?.activeBy,
    item?.by,
    item?.user,
  ]

  for (const candidate of candidates) {
    if (
      typeof candidate === 'string' &&
      candidate.trim()
    ) {
      return candidate.trim()
    }

    if (
      candidate &&
      typeof candidate === 'object'
    ) {
      const name =
        candidate?.displayName ||
        candidate?.username ||
        candidate?.name ||
        candidate?.fullName

      if (name) {
        return name
      }
    }
  }

  return '-'
}


/* =========================================================
   GET HISTORY DATE
========================================================= */

const getHistoryDate = (item) => {
  if (!item) {
    return null
  }

  return (
    item?.updatedAt ||
    item?.createdAt ||
    item?.date ||
    item?.at ||
    item?.inactiveAt ||
    item?.activeAt ||
    null
  )
}


/* =========================================================
   NORMALIZE STATUS
========================================================= */

const normalizeStatus = (value) => {
  return String(
    value || ''
  )
    .trim()
    .toLowerCase()
}


/* =========================================================
   ESCAPE HTML
========================================================= */

const escapeHtml = (value) => {
  const text =
    value === null ||
      value === undefined ||
      value === ''
      ? '-'
      : String(value)

  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}


/* =========================================================
   HISTORY POPUP STYLE
========================================================= */

const injectInactiveHistoryStyle = () => {
  const styleId =
    'inactive-history-swal-style'

  if (
    document.getElementById(
      styleId
    )
  ) {
    return
  }

  const style =
    document.createElement(
      'style'
    )

  style.id =
    styleId

  style.textContent = `
    /* =====================================================
       POPUP
    ===================================================== */

    .inactive-history-popup {
      width: 520px !important;
      max-width: calc(100vw - 24px) !important;

      padding: 0 !important;

      border-radius: 8px !important;

      overflow: hidden !important;

      background: #ffffff !important;

      box-shadow:
        0 8px 30px
        rgba(0, 0, 0, 0.15) !important;
    }


    /* =====================================================
       SWEETALERT HTML
    ===================================================== */

    .inactive-history-html {
      width: 100% !important;

      margin: 0 !important;

      padding: 0 !important;

      text-align: left !important;
    }


    /* =====================================================
       MAIN
    ===================================================== */

    .inactive-history-container {
      width: 100%;

      box-sizing: border-box;

      padding:
        22px
        20px
        20px
        20px;

      text-align: left;
    }


    /* =====================================================
       TITLE
    ===================================================== */

    .inactive-history-title {
      margin:
        0
        0
        16px
        0;

      padding-right: 40px;

      color: #262626;

      font-size: 15px;

      line-height: 20px;

      font-weight: 600;
    }


    /* =====================================================
       CLOSE
    ===================================================== */

    .inactive-history-close {
      position: absolute !important;

      top: 10px !important;

      right: 12px !important;

      width: 30px !important;

      min-width: 30px !important;

      height: 30px !important;

      padding: 0 !important;

      margin: 0 !important;

      display: flex !important;

      align-items: center !important;

      justify-content: center !important;

      border: none !important;

      background: transparent !important;

      color: #9ca3af !important;

      font-size: 21px !important;

      line-height: 1 !important;

      box-shadow: none !important;

      outline: none !important;
    }


    .inactive-history-close:hover {
      color: #595959 !important;

      background: transparent !important;
    }


    /* =====================================================
       HISTORY SCROLL
    ===================================================== */

    .inactive-history-list {
      width: 100%;

      max-height: 450px;

      overflow-y: auto;

      overflow-x: hidden;

      padding-right: 4px;

      box-sizing: border-box;
    }


    .inactive-history-list::-webkit-scrollbar {
      width: 5px;
    }


    .inactive-history-list::-webkit-scrollbar-track {
      background: transparent;
    }


    .inactive-history-list::-webkit-scrollbar-thumb {
      background: #d9d9d9;

      border-radius: 20px;
    }


    .inactive-history-list::-webkit-scrollbar-thumb:hover {
      background: #bfbfbf;
    }


    /* =====================================================
       ONE HISTORY GROUP
    ===================================================== */

    .inactive-history-group {
      width: 100%;

      box-sizing: border-box;

      margin-bottom: 14px;
    }


    .inactive-history-group:last-child {
      margin-bottom: 0;
    }


    /* =====================================================
       ACTIVE CARD
    ===================================================== */

    .inactive-history-active-card {
      width: 100%;

      box-sizing: border-box;

      padding:
        9px
        11px;

      margin-bottom: 7px;

      border:
        1px solid
        #95de64;

      border-radius: 7px;

      background: #fcfff9;

      color: #3f3f3f;

      font-size: 12px;

      line-height: 19px;
    }


    /* =====================================================
       INACTIVE CARD
    ===================================================== */

    .inactive-history-inactive-card {
      width: 100%;

      box-sizing: border-box;

      padding:
        9px
        11px;

      border:
        1px solid
        #ff9c99;

      border-radius: 7px;

      background: #fffafa;

      color: #3f3f3f;

      font-size: 12px;

      line-height: 19px;
    }


    /* =====================================================
       ROW
    ===================================================== */

    .inactive-history-row {
      display: flex;

      align-items: flex-start;

      flex-wrap: wrap;

      width: 100%;

      gap: 4px;
    }


    /* =====================================================
       LABEL
    ===================================================== */

    .inactive-history-label {
      flex: 0 0 auto;

      color: #595959;

      font-weight: 400;
    }


    /* =====================================================
       VALUE
    ===================================================== */

    .inactive-history-value {
      color: #262626;

      font-weight: 500;

      word-break: break-word;
    }


    /* =====================================================
       NOTE
    ===================================================== */

    .inactive-history-note {
      color: #3f3f3f;

      font-weight: 400;

      word-break: break-word;
    }


    /* =====================================================
       DATE
    ===================================================== */

    .inactive-history-date {
      margin-left: 4px;

      color: #262626;

      font-weight: 400;
    }


    /* =====================================================
       SEPARATOR
    ===================================================== */

    .inactive-history-separator {
      width: 100%;

      height: 1px;

      background: #f0f0f0;

      margin-top: 14px;
    }


    .inactive-history-group:last-child
    .inactive-history-separator {
      display: none;
    }


    /* =====================================================
       EMPTY
    ===================================================== */

    .inactive-history-empty {
      width: 100%;

      padding:
        25px
        10px;

      box-sizing: border-box;

      text-align: center;

      color: #9ca3af;

      font-size: 13px;
    }


    /* =====================================================
       REMOVE ACTION AREA
    ===================================================== */

    .inactive-history-popup
    .swal2-actions {
      display: none !important;
    }


    /* =====================================================
       MOBILE
    ===================================================== */

    @media (max-width: 560px) {
      .inactive-history-popup {
        width:
          calc(
            100vw - 24px
          ) !important;
      }

      .inactive-history-container {
        padding:
          20px
          16px
          18px
          16px;
      }

      .inactive-history-list {
        max-height: 60vh;
      }

      .inactive-history-date {
        margin-left: 0;
      }
    }
  `

  document.head.appendChild(
    style
  )
}


/* =========================================================
   COMPONENT
========================================================= */

export default function Tabs() {
  const {
    setDisplayEmitContent,
  } =
    useOutletContext()

  const navigate =
    useNavigate()

  const location =
    useLocation()

  const {
    id,
  } =
    useParams()

  const {
    access_token,
  } =
    useContext(
      AuthContext
    )

  const {
    getFileByName,
  } =
    helpFunctions

  const {
    fetchNonBusinessPropertyById,
    fetchPlaceReviewList,
    propertyDetail,
  } =
    useAllPropertyStore()


  /* =========================================================
     STATES
  ========================================================= */

  const [
    activeKey,
    setActiveKey,
  ] =
    useState('1')

  const [
    businessProperty,
    setBusinessProperty,
  ] =
    useState(null)

  const [
    thumbnail,
    setThumbnail,
  ] =
    useState([])

  const [
    showInfoOnThumbnail,
    setShowInfoOnThumbnail,
  ] =
    useState(null)

  const [
    slideShow,
    setSlideShow,
  ] =
    useState([])

  const [
    media,
    setMedia,
  ] =
    useState(
      EMPTY_MEDIA
    )

  const [
    scheduleList,
    setScheduleList,
  ] =
    useState([])


  /* =========================================================
     CHECK CURRENT STATUS
  ========================================================= */

  const isInactive =
    normalizeStatus(
      businessProperty
        ?.status
    ) ===
    'inactive'


  /* =========================================================
     BUILD ALL ACTIVE -> INACTIVE HISTORY GROUPS

     API RETURNS NEWEST FIRST, BUT WE SORT AGAIN
     TO MAKE SURE ORDER IS ALWAYS CORRECT.
  ========================================================= */

  const inactiveHistoryGroups =
    useMemo(
      () => {
        const history =
          businessProperty
            ?.statusHistory ||
          businessProperty
            ?.status_history ||
          []

        if (
          !Array.isArray(
            history
          )
        ) {
          return []
        }


        /* ===================================================
           NEWEST FIRST
        =================================================== */

        const historyList =
          [
            ...history,
          ].sort(
            (
              a,
              b
            ) => {
              const aTime =
                new Date(
                  getHistoryDate(
                    a
                  ) ||
                  0
                ).getTime()

              const bTime =
                new Date(
                  getHistoryDate(
                    b
                  ) ||
                  0
                ).getTime()

              return (
                bTime -
                aTime
              )
            }
          )


        const groups =
          []


        /* ===================================================
           FIND EACH INACTIVE RECORD

           Example:

           [0] Active -> Inactive
           [1] Inactive -> Active
           [2] Active -> Inactive
           [3] Inactive -> Active

           For each Inactive record, find its previous
           Active history record below it.
        =================================================== */

        historyList.forEach(
          (
            item,
            index
          ) => {
            const itemStatus =
              normalizeStatus(
                item
                  ?.status
              )


            if (
              itemStatus !==
              'inactive'
            ) {
              return
            }


            let activeRecord =
              null


            /* ===============================================
               FIND THE ACTIVE RECORD BEFORE THIS INACTIVE
               CHANGE IN TIME.
            =============================================== */

            for (
              let i =
                index + 1;

              i <
              historyList.length;

              i += 1
            ) {
              const candidate =
                historyList[i]


              if (
                normalizeStatus(
                  candidate
                    ?.status
                ) ===
                'active'
              ) {
                activeRecord =
                  candidate

                break
              }
            }


            groups.push({
              activeRecord,

              inactiveRecord:
                item,
            })
          }
        )


        return groups
      },
      [
        businessProperty,
      ]
    )


  /* =========================================================
     SHOW INACTIVE HISTORY
  ========================================================= */

  const showInactiveHistory =
    useCallback(
      () => {
        if (
          !isInactive
        ) {
          return
        }


        injectInactiveHistoryStyle()


        /* ===================================================
           GENERATE ALL HISTORY GROUPS
        =================================================== */

        const historyHtml =
          inactiveHistoryGroups
            .map(
              (
                group
              ) => {
                const activeRecord =
                  group
                    ?.activeRecord


                const inactiveRecord =
                  group
                    ?.inactiveRecord


                /* ===========================================
                   ACTIVE DATA
                =========================================== */

                const hasActiveRecord =
                  Boolean(
                    activeRecord
                  )


                const activeBy =
                  escapeHtml(
                    getHistoryUser(
                      activeRecord
                    )
                  )


                const activeAt =
                  escapeHtml(
                    formatHistoryDate(
                      getHistoryDate(
                        activeRecord
                      )
                    )
                  )


                /* ===========================================
                   INACTIVE DATA
                =========================================== */

                const reason =
                  escapeHtml(
                    formatReason(
                      inactiveRecord
                        ?.reason
                    )
                  )


                const note =
                  escapeHtml(
                    inactiveRecord
                      ?.note ||
                    inactiveRecord
                      ?.noted ||
                    '-'
                  )


                const inactiveBy =
                  escapeHtml(
                    getHistoryUser(
                      inactiveRecord
                    )
                  )


                const inactiveAt =
                  escapeHtml(
                    formatHistoryDate(
                      getHistoryDate(
                        inactiveRecord
                      )
                    )
                  )


                return `
                  <div
                    class="
                      inactive-history-group
                    "
                  >

                    ${hasActiveRecord
                    ? `
                          <div
                            class="
                              inactive-history-active-card
                            "
                          >

                            <div
                              class="
                                inactive-history-row
                              "
                            >

                              <span
                                class="
                                  inactive-history-label
                                "
                              >
                                Active By :
                              </span>

                              <span
                                class="
                                  inactive-history-value
                                "
                              >
                                ${activeBy}
                              </span>

                              <span
                                class="
                                  inactive-history-date
                                "
                              >
                                ${activeAt}
                              </span>

                            </div>

                          </div>
                        `
                    : ''
                  }


                    <div
                      class="
                        inactive-history-inactive-card
                      "
                    >

                      <div
                        class="
                          inactive-history-row
                        "
                      >

                        <span
                          class="
                            inactive-history-label
                          "
                        >
                          Reason :
                        </span>

                        <span
                          class="
                            inactive-history-value
                          "
                        >
                          ${reason}
                        </span>

                      </div>


                      <div
                        class="
                          inactive-history-row
                        "
                      >

                        <span
                          class="
                            inactive-history-label
                          "
                        >
                          Noted :
                        </span>

                        <span
                          class="
                            inactive-history-note
                          "
                        >
                          ${note}
                        </span>

                      </div>


                      <div
                        class="
                          inactive-history-row
                        "
                      >

                        <span
                          class="
                            inactive-history-label
                          "
                        >
                          Inactive By :
                        </span>

                        <span
                          class="
                            inactive-history-value
                          "
                        >
                          ${inactiveBy}
                        </span>

                        <span
                          class="
                            inactive-history-date
                          "
                        >
                          ${inactiveAt}
                        </span>

                      </div>

                    </div>


                    <div
                      class="
                        inactive-history-separator
                      "
                    ></div>

                  </div>
                `
              }
            )
            .join('')


        /* ===================================================
           SHOW POPUP
        =================================================== */

        Swal.fire({
          html: `
            <div
              class="
                inactive-history-container
              "
            >

              <div
                class="
                  inactive-history-title
                "
              >
                Inactive history
              </div>


              <div
                class="
                  inactive-history-list
                "
              >

                ${historyHtml ||
            `
                    <div
                      class="
                        inactive-history-empty
                      "
                    >
                      No inactive history found.
                    </div>
                  `
            }

              </div>

            </div>
          `,

          width:
            520,

          showCloseButton:
            true,

          showConfirmButton:
            false,

          showCancelButton:
            false,

          allowOutsideClick:
            true,

          allowEscapeKey:
            true,

          buttonsStyling:
            false,

          customClass: {
            popup:
              'inactive-history-popup',

            htmlContainer:
              'inactive-history-html',

            closeButton:
              'inactive-history-close',
          },
        })
      },
      [
        inactiveHistoryGroups,
        isInactive,
      ]
    )


  /* =========================================================
     CLOSE HISTORY WHEN STATUS CHANGES
  ========================================================= */

  useEffect(
    () => {
      if (
        !isInactive &&
        Swal.isVisible()
      ) {
        const popup =
          Swal.getPopup()

        if (
          popup
            ?.classList
            .contains(
              'inactive-history-popup'
            )
        ) {
          Swal.close()
        }
      }
    },
    [
      isInactive,
    ]
  )


  /* =========================================================
     APPLY PROPERTY DATA
  ========================================================= */

  const applyPlaceData =
    useCallback(
      (place) => {
        if (
          !place
        ) {
          return
        }


        const nextMedia = {
          ...EMPTY_MEDIA,

          ...(
            place
              ?.media ||
            {}
          ),
        }


        setBusinessProperty(
          place
        )


        setThumbnail(
          nextMedia
            .image
        )


        setSlideShow(
          nextMedia
            .gallery
        )


        setMedia(
          nextMedia
        )


        setScheduleList(
          Array.isArray(
            place
              ?.schedule
          )
            ? place
              .schedule

            : place
              ?.schedule ||
            []
        )


        setShowInfoOnThumbnail({
          nameEn:
            place
              ?.nameEn,

          nameKh:
            place
              ?.nameKh,

          star:
            place
              ?.star,

          mainCategory:
            place
              ?.mainCategory,

          subCategory:
            place
              ?.subCategory,

          typeOfPlace:
            place
              ?.typeOfPlace,

          typeOfFood:
            place
              ?.typeOfFood,

          activity:
            place
              ?.activity,

          status:
            place
              ?.status,

          _id:
            place
              ?._id,

          checkInOut:
            place
              ?.schedule
              ?.checkInOut,
        })
      },
      []
    )


  /* =========================================================
     FETCH PROPERTY
  ========================================================= */

  const getBusinessProperty =
    useCallback(
      async (
        _id,
        force = false
      ) => {
        if (
          !_id ||
          !access_token
        ) {
          return null
        }


        try {
          const response =
            await fetchNonBusinessPropertyById({
              access_token,

              id:
                _id,

              force,
            })


          const place =
            response
              ?.data ||
            null


          if (
            place
          ) {
            applyPlaceData(
              place
            )
          }


          return place

        } catch (
        error
        ) {
          console.error(
            'Failed to load property:',
            error
          )


          return null
        }
      },
      [
        access_token,
        applyPlaceData,
        fetchNonBusinessPropertyById,
      ]
    )


  /* =========================================================
     LOAD PROPERTY
  ========================================================= */

  useEffect(
    () => {
      if (
        id
      ) {
        getBusinessProperty(
          id
        )
      }
    },
    [
      id,
      getBusinessProperty,
    ]
  )


  /* =========================================================
     APPLY STORE PROPERTY
  ========================================================= */

  useEffect(
    () => {
      if (
        propertyDetail
          ?._id ||
        propertyDetail
          ?.id
      ) {
        applyPlaceData(
          propertyDetail
        )
      }
    },
    [
      propertyDetail,
      applyPlaceData,
    ]
  )


  /* =========================================================
     ROUTE TAB CONTROL
  ========================================================= */

  useEffect(
    () => {
      if (
        !id
      ) {
        return
      }


      const basePath =
        `/property/${id}`


      if (
        location
          .pathname ===
        basePath
      ) {
        navigate(
          `${basePath}/info`,
          {
            replace:
              true,
          }
        )

        return
      }


      if (
        location
          .pathname
          .includes(
            '/media'
          )
      ) {
        setActiveKey(
          '2'
        )

        return
      }


      if (
        location
          .pathname
          .includes(
            '/review'
          )
      ) {
        setActiveKey(
          '3'
        )

        return
      }


      if (
        location
          .pathname
          .includes(
            '/task'
          )
      ) {
        setActiveKey(
          '4'
        )

        return
      }


      setActiveKey(
        '1'
      )
    },
    [
      id,
      location.pathname,
      navigate,
    ]
  )


  /* =========================================================
     PLACE CODE
  ========================================================= */

  const placeCode =
    businessProperty
      ?.placeId ||
    businessProperty
      ?.placeCode ||
    businessProperty
      ?.place_code ||
    businessProperty
      ?.codePlace ||
    businessProperty
      ?.codeNo ||
    null


  /* =========================================================
     TAB ITEMS
  ========================================================= */

  const items =
    useMemo(
      () => [
        {
          key:
            '1',

          label: (
            <span className='px-5'>
              Place Information
            </span>
          ),

          children: (
            <Card
              variant='plain'

              styles={{
                body: {
                  padding:
                    0,
                },
              }}

              style={{
                background:
                  '#fff',

                borderRadius:
                  12,

                overflow:
                  'hidden',
              }}
            >
              <Row
                gutter={
                  0
                }
              >
                <Col
                  xs={
                    24
                  }

                  sm={
                    24
                  }

                  md={
                    12
                  }

                  xl={
                    8
                  }
                >
                  <div
                    className='px-3'

                    style={{
                      margin:
                        '10px 0',
                    }}
                  >
                    <Thumbnail
                      thumbnail={
                        thumbnail
                      }

                      getFileByName={
                        getFileByName
                      }
                      businessProperty={businessProperty}

                      showInfoOnThumbnail={
                        showInfoOnThumbnail
                      }

                      scheduleList={
                        scheduleList
                      }

                      getBusinessProperty={
                        getBusinessProperty
                      }

                      access_token={
                        access_token
                      }
                    />
                  </div>
                </Col>


                <Col
                  xs={
                    24
                  }

                  xl={
                    16
                  }
                >
                  <div
                    style={{
                      margin:
                        '11px 0',
                    }}
                  >
                    <SlideImage
                      slideShow={
                        slideShow
                      }

                      getFileByName={
                        getFileByName
                      }

                      media={
                        media
                      }
                    />
                  </div>
                </Col>
              </Row>
            </Card>
          ),
        },


        {
          key:
            '2',

          label: (
            <span className='px-5'>
              Video & Image
            </span>
          ),

          children: (
            <div>
              <VideoImageTab
                media={
                  media
                }

                getFileByName={
                  getFileByName
                }

                access_token={
                  access_token
                }

                id={
                  id
                }

                getBusinessProperty={
                  getBusinessProperty
                }
              />
            </div>
          ),
        },


        {
          key:
            '3',

          label: (
            <span className='flex items-center gap-1 px-5'>
              Review
            </span>
          ),

          children: (
            <div className='p09 m-0'>
              <ReviewTabs
                access_token={
                  access_token
                }

                placeCode={
                  placeCode
                }

                averageStar={
                  businessProperty
                    ?.star ||
                  0
                }

                fetchPlaceReviewList={
                  fetchPlaceReviewList
                }
              />
            </div>
          ),
        },


        {
          key:
            '4',

          label: (
            <span className='flex items-center gap-1 px-5'>
              <Badge
                size='small'

                offset={[
                  0,
                  -2,
                ]}

                style={{
                  backgroundColor:
                    '#d93025',
                }}
              >
                Task
              </Badge>
            </span>
          ),

          children: (
            <div className='text-center text-gray-400'>
              <TaskCommentsPlain
                placeId={
                  id
                }
              />
            </div>
          ),
        },
      ],
      [
        access_token,
        businessProperty
          ?.star,
        fetchPlaceReviewList,
        getBusinessProperty,
        getFileByName,
        id,
        media,
        placeCode,
        scheduleList,
        showInfoOnThumbnail,
        slideShow,
        thumbnail,
      ]
    )


  /* =========================================================
     TAB CHANGE
  ========================================================= */

  const handleTabChange =
    useCallback(
      (key) => {
        if (
          !id
        ) {
          return
        }


        const basePath =
          `/property/${id}`


        const tabPaths = {
          1:
            `${basePath}/info`,

          2:
            `${basePath}/media`,

          3:
            `${basePath}/review`,

          4:
            `${basePath}/task`,
        }


        setActiveKey(
          key
        )


        const targetPath =
          tabPaths[
          key
          ]


        if (
          targetPath &&
          location
            .pathname !==
          targetPath
        ) {
          navigate(
            targetPath,
            {
              replace:
                true,
            }
          )
        }
      },
      [
        id,
        location.pathname,
        navigate,
      ]
    )


  /* =========================================================
     TOP TAB NAVIGATION
  ========================================================= */

  const tabNavigationItems =
    useMemo(
      () => [
        {
          key:
            '1',

          label: (
            <span className='px-5'>
              Place Information
            </span>
          ),
        },


        {
          key:
            '2',

          label: (
            <span className='px-5'>
              Video & Image
            </span>
          ),
        },


        {
          key:
            '3',

          label: (
            <span className='flex items-center gap-1 px-5'>
              Review
            </span>
          ),
        },


        {
          key:
            '4',

          label: (
            <span className='flex items-center gap-1 px-5'>
              <Badge
                size='small'

                offset={[
                  0,
                  -2,
                ]}

                style={{
                  backgroundColor:
                    '#d93025',
                }}
              >
                Task
              </Badge>
            </span>
          ),
        },
      ],
      []
    )


  /* =========================================================
     HEADER
  ========================================================= */

  useEffect(
    () => {
      setDisplayEmitContent(
        <div
          className='property-main-tabs-navigation'

          style={{
            width:
              '100%',

            display:
              'flex',

            alignItems:
              'center',

            justifyContent:
              'space-between',

            gap:
              12,
          }}
        >
          <div
            style={{
              flex:
                1,

              minWidth:
                0,
            }}
          >
            <AntTabs
              items={
                tabNavigationItems
              }

              activeKey={
                activeKey
              }

              onChange={
                handleTabChange
              }

              tabBarGutter={
                16
              }

              className='custom-tabs custom-tabs-navigation-only'
            />
          </div>


          {/* =================================================
              HISTORY BUTTON ONLY WHEN CURRENT STATUS INACTIVE
          ================================================= */}

          {isInactive && (
            <Tooltip
              title='Inactive history'
            >
              <Button
                type='text'

                onClick={
                  showInactiveHistory
                }

                icon={
                  <img
                    src={
                      IconClock
                    }

                    alt='History'
                  />
                }

                style={{
                  width:
                    34,

                  minWidth:
                    34,

                  height:
                    34,

                  display:
                    'inline-flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'center',

                  padding:
                    0,

                  marginRight:
                    10,

                  borderRadius:
                    8,

                  background:
                    '#a6a6a6',

                  border:
                    'none',

                  boxShadow:
                    'none',
                }}
              />
            </Tooltip>
          )}

        </div>
      )
    },
    [
      activeKey,
      handleTabChange,
      isInactive,
      setDisplayEmitContent,
      showInactiveHistory,
      tabNavigationItems,
    ]
  )


  /* =========================================================
     CLEAN HEADER
  ========================================================= */

  useEffect(
    () => {
      return () => {
        setDisplayEmitContent(
          null
        )


        const popup =
          Swal.getPopup()


        if (
          popup
            ?.classList
            .contains(
              'inactive-history-popup'
            )
        ) {
          Swal.close()
        }
      }
    },
    [
      setDisplayEmitContent,
    ]
  )


  /* =========================================================
     ACTIVE TAB CONTENT
  ========================================================= */

  const activeTabContent =
    useMemo(
      () => {
        return (
          items.find(
            (
              item
            ) =>
              item.key ===
              activeKey
          )
            ?.children ||
          null
        )
      },
      [
        items,
        activeKey,
      ]
    )


  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className='property-main-tabs-content'>

      {activeTabContent}


      {activeKey ===
        '1' && (
          <div className='dashboard-card-property'>
            <Card className='my-2'>
              <DashboardCard />
            </Card>
          </div>
        )}


      {activeKey ===
        '1' && (
          <div className='dashboard-card-property'>
            <Card className='my-2'>
              <GroupInfo
                businessProperty={
                  businessProperty
                }

                getBusinessProperty={
                  getBusinessProperty
                }

                access_token={
                  access_token
                }

                id={
                  id
                }
              />
            </Card>
          </div>
        )}

    </div>
  )
}