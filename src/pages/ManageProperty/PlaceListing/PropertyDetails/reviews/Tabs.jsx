import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react'

import {
  message,
} from 'antd'

import {
  useNavigate,
} from 'react-router-dom'

import usePlaceReviewStore
  from '../../../../../Stores/ManageProperty/AllProperty/PropertyDetail/Review.store'

import useReviewActionStore
  from '../../../../../Stores/ReviewManagement/Reviews/Action'

import {
  ReviewActionModals,
} from '../../../../../components/ReviewManagement/allReview/detail/modals'

import ReviewSummary
  from './components/ReviewSummary'

import ReviewToolbar
  from './components/ReviewToolbar'

import ReviewList
  from './components/ReviewList'

import ReviewReportModal
  from './components/ReviewReportModal'

import {
  DEFAULT_PROPERTY_REVIEW_FILTERS,
  REVIEW_ACTION_SUCCESS_MESSAGES,
} from './review.constants'

import {
  getAverageRatingBreakdown,
  getAverageReviewRating,
  getStatusCounts,
  matchesReviewFilters,
} from './review.utils'

import './reviews.scss'

const getErrorMessage = (
  error,
  fallback
) => {
  return (
    error?.response
      ?.data?.msg ||
    error?.response
      ?.data?.message ||
    error?.response
      ?.data?.error ||
    error?.message ||
    fallback
  )
}

const getApiStatus = (
  status
) => {
  const normalizedStatus =
    String(
      status ||
      ''
    )
      .trim()
      .toLowerCase()

  const statusMap = {
    pending:
      'Pending',

    active:
      'Active',

    hidden:
      'Hidden',

    rejected:
      'Rejected',
  }

  return (
    statusMap[
    normalizedStatus
    ] ||
    ''
  )
}

const ReviewTabs = ({
  access_token,
  placeCode,
  placeId,
  averageStar = 0,
  ratingSummary = {},
}) => {
  const navigate =
    useNavigate()

  const resolvedPlaceId =
    placeId ||
    placeCode

  const [
    filters,
    setFilters,
  ] = useState({
    ...DEFAULT_PROPERTY_REVIEW_FILTERS,
  })

  const [
    page,
    setPage,
  ] = useState(1)

  const [
    pageSize,
    setPageSize,
  ] = useState(20)

  const [
    selectedReview,
    setSelectedReview,
  ] = useState(null)

  const [
    activeAction,
    setActiveAction,
  ] = useState('')

  const [
    reportReview,
    setReportReview,
  ] = useState(null)

  const fetchPlaceReviewList =
    usePlaceReviewStore(
      (
        state
      ) => {
        return state
          .fetchPlaceReviewList
      }
    )

  const reviewList =
    usePlaceReviewStore(
      (
        state
      ) => {
        return state
          .reviewList
      }
    )

  const reviewPagination =
    usePlaceReviewStore(
      (
        state
      ) => {

        return state
          .reviewPagination
      }
    )

  const reviewSummary =
    usePlaceReviewStore(
      (
        state
      ) => {
        return state
          .reviewSummary
      }
    )

  const reviewStats =
    usePlaceReviewStore(
      (
        state
      ) => {
        return state
          .reviewStats
      }
    )

  const reviewsLoading =
    usePlaceReviewStore(
      (
        state
      ) => {
        return state
          .reviewsLoading
      }
    )

  const clearReviewList =
    usePlaceReviewStore(
      (
        state
      ) => {
        return state
          .clearReviewList
      }
    )

  const updatingId =
    useReviewActionStore(
      (
        state
      ) => {
        return state
          .updatingId
      }
    )

  const updateReviewStatus =
    useReviewActionStore(
      (
        state
      ) => {
        return state
          .updateReviewStatus
      }
    )

  const updateReviewContent =
    useReviewActionStore(
      (
        state
      ) => {
        return state
          .updateReviewContent
      }
    )

  const requestDocument =
    useMemo(() => {
      const params = {
        page,

        limit:
          pageSize,

        sort:
          filters?.sort ||
          'latest',
      }

      const selectedStatus =
        getApiStatus(
          filters?.status
        )

      if (selectedStatus) {
        params.status =
          selectedStatus
      }

      if (
        filters?.rating &&
        filters.rating !==
        'all'
      ) {
        params.userRating =
          String(
            filters.rating
          )
      }

      if (
        filters?.withImage
      ) {
        params.reviewType =
          'WithPhoto'
      }

      return params
    }, [
      filters?.rating,
      filters?.sort,
      filters?.status,
      filters?.withImage,
      page,
      pageSize,
    ])

  const loadReviews =
    useCallback(
      async (
        force = false
      ) => {
        if (
          !access_token ||
          !resolvedPlaceId
        ) {
          return
        }

        try {
          await fetchPlaceReviewList({
            access_token,

            placeId:
              resolvedPlaceId,

            doc:
              requestDocument,

            force,
          })
        } catch (
        error
        ) {
          message.error(
            getErrorMessage(
              error,
              'Unable to load reviews'
            )
          )
        }
      },
      [
        access_token,
        fetchPlaceReviewList,
        requestDocument,
        resolvedPlaceId,
      ]
    )

  useEffect(() => {
    clearReviewList()

    setPage(1)

    setFilters({
      ...DEFAULT_PROPERTY_REVIEW_FILTERS,
    })

    setSelectedReview(
      null
    )

    setActiveAction('')

    setReportReview(
      null
    )
  }, [
    clearReviewList,
    resolvedPlaceId,
  ])

  useEffect(() => {
    loadReviews(
      false
    )
  }, [
    loadReviews,
  ])

  const reviews =
    useMemo(() => {
      return Array.isArray(
        reviewList
      )
        ? reviewList
        : []
    }, [
      reviewList,
    ])

  const visibleReviews =
    useMemo(() => {
      return reviews.filter(
        (
          review
        ) => {
          return matchesReviewFilters(
            review,
            filters
          )
        }
      )
    }, [
      filters,
      reviews,
    ])

  const paginationTotalValue =
    Number(
      reviewPagination
        ?.total
    )

  const paginationTotal =
    Number.isFinite(
      paginationTotalValue
    )
      ? paginationTotalValue
      : 0

  const counts =
    useMemo(() => {
      return getStatusCounts(
        reviews,
        reviewStats,
        paginationTotal
      )
    }, [
      paginationTotal,
      reviewStats,
      reviews,
    ])

  const summarySource =
    useMemo(() => {
      if (
        ratingSummary &&
        Object.keys(
          ratingSummary
        ).length >
        0
      ) {
        return ratingSummary
      }

      return (
        reviewSummary ||
        {}
      )
    }, [
      ratingSummary,
      reviewSummary,
    ])

  const ratingBreakdown =
    useMemo(() => {
      return getAverageRatingBreakdown(
        summarySource,
        reviews
      )
    }, [
      reviews,
      summarySource,
    ])

  const resolvedAverageStar =
    useMemo(() => {
      const providedAverage =
        Number(
          averageStar
        )

      if (
        Number.isFinite(
          providedAverage
        ) &&
        providedAverage >
        0
      ) {
        return providedAverage
      }

      const summaryAverage =
        Number(
          summarySource
            ?.averageStar ??
          summarySource
            ?.averageRating ??
          summarySource
            ?.star
        )

      if (
        Number.isFinite(
          summaryAverage
        ) &&
        summaryAverage >
        0
      ) {
        return summaryAverage
      }

      return getAverageReviewRating(
        reviews
      )
    }, [
      averageStar,
      reviews,
      summarySource,
    ])

  const handleFilterChange =
    useCallback(
      (
        nextFilters
      ) => {
        setFilters(
          nextFilters
        )

        setPage(1)
      },
      []
    )

  const handlePageChange =
    useCallback(
      (
        nextPage,
        nextPageSize
      ) => {
        const normalizedPageSize =
          Number(
            nextPageSize
          ) ||
          20

        if (
          normalizedPageSize !==
          pageSize
        ) {
          setPageSize(
            normalizedPageSize
          )

          setPage(1)

          return
        }

        setPage(
          nextPage
        )
      },
      [
        pageSize,
      ]
    )

  const handleViewReview =
    useCallback(
      (
        review
      ) => {
        const reviewId =
          review?._id ||
          review?.id

        if (!reviewId) {
          message.warning(
            'Review ID not found'
          )

          return
        }

        navigate(
          `/all-review/detail/${reviewId}`
        )
      },
      [
        navigate,
      ]
    )

  const handleOpenAction =
    useCallback(
      (
        action,
        review
      ) => {
        const reviewId =
          review?._id ||
          review?.id

        if (
          !action ||
          !reviewId
        ) {
          return
        }

        setSelectedReview(
          review
        )

        setActiveAction(
          action
        )
      },
      []
    )

  const handleCloseAction =
    useCallback(() => {
      const selectedId =
        selectedReview
          ?._id ||
        selectedReview
          ?.id

      if (
        updatingId ===
        selectedId
      ) {
        return
      }

      setActiveAction('')

      setSelectedReview(
        null
      )
    }, [
      selectedReview,
      updatingId,
    ])

  const handleSaveReview =
    useCallback(
      async (
        changes = {}
      ) => {
        const reviewId =
          selectedReview
            ?._id ||
          selectedReview
            ?.id

        if (!reviewId) {
          return
        }

        try {
          const payload = {
            access_token,

            id:
              reviewId,
          }

          if (
            Object.prototype
              .hasOwnProperty
              .call(
                changes,
                'comment'
              )
          ) {
            payload.comment =
              changes.comment
          }

          if (
            Array.isArray(
              changes
                ?.removeMedia
            ) &&
            changes
              .removeMedia
              .length >
            0
          ) {
            payload.removeMedia =
              changes.removeMedia
          }

          await updateReviewContent(
            payload
          )

          message.success(
            REVIEW_ACTION_SUCCESS_MESSAGES
              .edit
          )

          setActiveAction('')

          setSelectedReview(
            null
          )

          await loadReviews(
            true
          )
        } catch (
        error
        ) {
          message.error(
            getErrorMessage(
              error,
              'Unable to update review'
            )
          )
        }
      },
      [
        access_token,
        loadReviews,
        selectedReview,
        updateReviewContent,
      ]
    )

  const handleConfirmAction =
    useCallback(
      async ({
        action,
        targetStatus,
        reason,
      }) => {
        const reviewId =
          selectedReview
            ?._id ||
          selectedReview
            ?.id

        if (
          !reviewId ||
          !action
        ) {
          return
        }

        try {
          await updateReviewStatus({
            access_token,

            id:
              reviewId,

            action,

            targetStatus,

            reason:
              reason ||
              '',

            doc: {
              page,

              limit:
                pageSize,
            },
          })

          message.success(
            REVIEW_ACTION_SUCCESS_MESSAGES?.[
            action
            ] ||
            'Review status updated successfully'
          )

          setActiveAction('')

          setSelectedReview(
            null
          )

          await loadReviews(
            true
          )
        } catch (
        error
        ) {
          message.error(
            getErrorMessage(
              error,
              'Unable to update review status'
            )
          )
        }
      },
      [
        access_token,
        loadReviews,
        page,
        pageSize,
        selectedReview,
        updateReviewStatus,
      ]
    )

  const selectedReviewId =
    selectedReview
      ?._id ||
    selectedReview
      ?.id

  const actionLoading =
    updatingId ===
    selectedReviewId
  const scrollContentRef =
    useRef(null)

  const lastScrollTopRef =
    useRef(0)

  const [
    isToolbarVisible,
    setIsToolbarVisible,
  ] = useState(true)

  useEffect(() => {
    const scrollContainer =
      scrollContentRef.current

    if (!scrollContainer) {
      return undefined
    }

    let animationFrameId =
      null

    const handleScroll = () => {
      if (
        animationFrameId !==
        null
      ) {
        return
      }

      animationFrameId =
        window.requestAnimationFrame(
          () => {
            const currentScrollTop =
              Math.max(
                scrollContainer
                  .scrollTop,
                0
              )

            const previousScrollTop =
              lastScrollTopRef
                .current

            const difference =
              currentScrollTop -
              previousScrollTop

            // At the beginning, always show toolbar
            if (
              currentScrollTop <=
              8
            ) {
              setIsToolbarVisible(
                true
              )
            } else if (
              difference > 2
            ) {
              // Scroll down: hide toolbar upward
              setIsToolbarVisible(
                false
              )
            } else if (
              difference < -2
            ) {
              // Scroll up: show toolbar automatically
              setIsToolbarVisible(
                true
              )
            }

            lastScrollTopRef.current =
              currentScrollTop

            animationFrameId =
              null
          }
        )
    }

    lastScrollTopRef.current =
      scrollContainer.scrollTop

    scrollContainer.addEventListener(
      'scroll',
      handleScroll,
      {
        passive: true,
      }
    )

    return () => {
      scrollContainer
        .removeEventListener(
          'scroll',
          handleScroll
        )

      if (
        animationFrameId !==
        null
      ) {
        window.cancelAnimationFrame(
          animationFrameId
        )
      }
    }
  }, [])


  return (
    <div className='property-review-page'>
      {/* Always fixed above */}
      <div className='property-review-fixed-summary'>
        <ReviewSummary
          averageStar={
            resolvedAverageStar
          }
          ratingBreakdown={
            ratingBreakdown
          }
        />
      </div>

      {/* Toolbar and cards scroll here */}
      <div
        ref={
          scrollContentRef
        }
        className='property-review-scroll-content'
      >
        <div
          className={`property-review-sticky-toolbar ${isToolbarVisible
            ? 'is-visible'
            : 'is-hidden'
            }`}
        >
          <ReviewToolbar
            filters={
              filters
            }
            counts={
              counts
            }
            onChange={
              handleFilterChange
            }
          />
        </div>

        <div className='property-review-list-content'>
          <ReviewList
            reviews={
              visibleReviews
            }
            loading={
              reviewsLoading
            }
            updatingId={
              updatingId
            }
            pagination={{
              current:
                page,

              pageSize,

              total:
                paginationTotal,

              onChange:
                handlePageChange,
            }}
            onView={
              handleViewReview
            }
            onAction={
              handleOpenAction
            }
            onOpenReports={(
              review
            ) => {
              setReportReview(
                review
              )
            }}
          />
        </div>

        <ReviewReportModal
          open={
            Boolean(
              reportReview
            )
          }
          review={
            reportReview
          }
          onClose={() => {
            setReportReview(
              null
            )
          }}
        />

        <ReviewActionModals
          action={
            activeAction
          }
          review={
            selectedReview
          }
          loading={
            actionLoading
          }
          onClose={
            handleCloseAction
          }
          onSaveReview={
            handleSaveReview
          }
          onConfirmAction={
            handleConfirmAction
          }
        />
      </div>
    </div>

  )
}

export default ReviewTabs