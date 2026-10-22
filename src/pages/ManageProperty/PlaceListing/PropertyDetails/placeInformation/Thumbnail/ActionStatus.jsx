import React from 'react'

import {
  Typography,
  Dropdown,
  Button,
  Image,
} from 'antd'

import Swal from 'sweetalert2'

import DeleteIcon from '../../../../../../assets/icon/delete.png'
import EyeIcon from '../../../../../../assets/icon/eye.png'
import HideEyeIcon from '../../../../../../assets/icon/hideEye.png'
import HomeIcon from '../../../../../../assets/icon/home.png'
import MessageIcon from '../../../../../../assets/icon/message.png'
import TickBookIcon from '../../../../../../assets/icon/tickBook.png'
import RecoverIcon from '../../../../../../assets/icon/recover.png'

import {
  updateNonBusinessStatus,
} from '../../../../../ManageProperty/PlaceListing/Property/ChangeStatus'

const { Text } = Typography

export default function ActionStatus(props) {
  const {
    _id,
    status,
    getBusinessProperty,
    access_token,
  } = props

  /* =========================================================
     NORMALIZED STATUS
  ========================================================= */

  const colorStatus =
    status
      ?.trim()
      ?.toLowerCase()

  /* =========================================================
     REFRESH PROPERTY
  ========================================================= */

  const refreshProperty = async () => {
    if (
      typeof getBusinessProperty !==
      'function'
    ) {
      return null
    }

    try {
      const freshProperty =
        await getBusinessProperty(
          _id,
          true
        )

      console.log(
        'FRESH PROPERTY:',
        freshProperty
      )

      return freshProperty
    } catch (error) {
      console.error(
        'Refresh property failed:',
        error
      )

      return null
    }
  }

  /* =========================================================
     UPDATE STATUS
  ========================================================= */

  const onFinish = async (
    nextStatus,
    options = {}
  ) => {
    try {
      const result =
        await updateNonBusinessStatus(
          _id,
          status,
          nextStatus,
          access_token,
          options
        )

      if (!result) {
        return false
      }

      /* =====================================================
         FORCE REFRESH AFTER UPDATE
      ===================================================== */

      await refreshProperty()

      return true
    } catch (error) {
      console.error(
        'Action status error:',
        error
      )

      return false
    }
  }

  /* =========================================================
     INACTIVE POPUP STYLE
  ========================================================= */

  const injectInactivePopupStyle = () => {
    const styleId =
      'action-status-inactive-place-style'

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

    style.innerHTML = `
      .action-inactive-popup {
        width: 520px !important;
        max-width: calc(100vw - 24px) !important;
        border-radius: 12px !important;
        padding: 0 !important;
        overflow: hidden !important;
      }

      .action-inactive-container {
        padding: 16px 20px 0 20px;
        text-align: left;
      }

      .action-inactive-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
      }

      .action-inactive-title {
        font-size: 15px;
        line-height: 1.2;
        font-weight: 700;
        color: #1f2937;
      }

      .action-inactive-desc {
        font-size: 13px;
        line-height: 1.45;
        color: #9ca3af;
        margin-bottom: 18px;
      }

      .action-inactive-field {
        margin-bottom: 16px;
      }

      .action-inactive-label {
        font-size: 14px;
        line-height: 1.3;
        font-weight: 700;
        color: #374151;
        margin-bottom: 12px;
      }

      .action-inactive-required {
        color: #ef4444;
      }

      .action-inactive-reasons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px 12px;
      }

      .action-inactive-chip {
        width: 100%;
        height: 36px;

        border:
          1px solid
          #d9dfe8;

        border-radius: 999px;

        background:
          #ffffff;

        color:
          #9aa4b2;

        font-size: 13px;
        font-weight: 400;

        padding:
          0
          14px;

        display: inline-flex;
        align-items: center;
        justify-content: space-between;

        gap: 8px;

        cursor: pointer;
        outline: none;

        text-align: left;

        transition:
          all
          0.18s
          ease;
      }

      .action-inactive-chip:hover {
        border-color: #b9d4ff;
        color: #3b82f6;
      }

      .action-inactive-chip.active {
        border-color: #1677ff;

        color: #1677ff;

        font-weight: 500;

        background:
          #ffffff;
      }

      .action-inactive-chip-text {
        flex:
          1
          1
          auto;

        overflow: hidden;

        text-overflow:
          ellipsis;

        white-space:
          nowrap;
      }

      .action-inactive-chip-check {
        width: 16px;
        height: 16px;

        flex:
          0
          0
          16px;

        display: none;
      }

      .action-inactive-chip.active
      .action-inactive-chip-check {
        display: inline-flex;
      }

      .action-inactive-textarea {
        width: 100%;

        min-height:
          92px;

        border:
          1px solid
          #d9d9d9;

        border-radius:
          8px;

        resize:
          none;

        padding:
          12px
          14px;

        font-size:
          14px;

        color:
          #374151;

        box-sizing:
          border-box;

        transition:
          all
          0.18s
          ease;
      }

      .action-inactive-textarea::placeholder {
        color:
          #bfc5cf;
      }

      .action-inactive-textarea:focus {
        outline:
          none;

        border-color:
          #1677ff;

        box-shadow:
          0
          0
          0
          2px
          rgba(
            22,
            119,
            255,
            0.08
          );
      }

      .action-inactive-html {
        margin:
          0 !important;

        padding:
          0 !important;
      }

      .action-inactive-close {
        color:
          #9ca3af
          !important;

        font-size:
          28px
          !important;

        width:
          34px
          !important;

        height:
          34px
          !important;

        top:
          8px
          !important;

        right:
          24px
          !important;

        padding:
          0
          !important;

        display:
          flex
          !important;

        align-items:
          center
          !important;

        justify-content:
          center
          !important;

        line-height:
          1
          !important;
      }

      .action-inactive-actions {
        width:
          100%;

        display:
          flex
          !important;

        justify-content:
          flex-end;

        gap:
          8px;

        padding:
          18px
          20px
          14px
          20px
          !important;

        margin:
          0
          !important;

        box-sizing:
          border-box
          !important;
      }

      .action-inactive-cancel {
        min-width:
          76px;

        height:
          32px;

        border-radius:
          6px
          !important;

        border:
          1px solid
          #d9d9d9
          !important;

        background:
          #ffffff
          !important;

        color:
          #3f3f46
          !important;

        font-size:
          14px
          !important;

        font-weight:
          500
          !important;

        box-shadow:
          none
          !important;
      }

      .action-inactive-cancel:hover {
        border-color:
          #c8c8c8
          !important;

        background:
          #ffffff
          !important;
      }

      .action-inactive-confirm {
        min-width:
          126px;

        height:
          32px;

        border-radius:
          6px
          !important;

        border:
          none
          !important;

        background:
          #1677ff
          !important;

        color:
          #ffffff
          !important;

        font-size:
          14px
          !important;

        font-weight:
          500
          !important;

        box-shadow:
          none
          !important;
      }

      .action-inactive-confirm:hover {
        background:
          #1668dc
          !important;
      }

      .action-inactive-confirm:disabled,
      .action-inactive-confirm.swal2-styled:disabled {
        background:
          #e5e7eb
          !important;

        color:
          #b6bcc6
          !important;

        cursor:
          not-allowed
          !important;

        opacity:
          1
          !important;
      }

      .action-inactive-confirm:focus,
      .action-inactive-cancel:focus {
        box-shadow:
          none
          !important;
      }

      .swal2-validation-message {
        margin:
          8px
          20px
          0
          20px
          !important;

        border-radius:
          8px
          !important;

        font-size:
          13px
          !important;

        text-align:
          left
          !important;
      }

      @media (max-width: 560px) {
        .action-inactive-reasons {
          grid-template-columns:
            1fr;
        }
      }
    `

    document.head.appendChild(
      style
    )
  }

  /* =========================================================
     ACTIVE -> INACTIVE
  ========================================================= */

  const openInactiveDialog =
    async () => {
      injectInactivePopupStyle()

      let selectedReason =
        ''

      let notedValue =
        ''

      /* =====================================================
         REASON OPTIONS
      ===================================================== */

      const reasonOptions = [
        {
          label:
            'Permanently Closed',

          value:
            'permanently_closed',
        },

        {
          label:
            'Data Maintenance',

          value:
            'data_maintenance',
        },

        {
          label:
            'Does Not Meet Listing Criteria',

          value:
            'does_not_meet_listing_criteria',
        },

        {
          label:
            'Policy Violation / Reported',

          value:
            'policy_violation_reported',
        },
      ]

      /* =====================================================
         OPEN POPUP
      ===================================================== */

      const result =
        await Swal.fire({
          html: `
            <div class="action-inactive-container">

              <div class="action-inactive-header">

                <div class="action-inactive-title">
                  Inactive Place
                </div>

              </div>

              <div class="action-inactive-desc">
                This place will be hidden from public view in the app.
                Select a reason you want to send to the creator.
              </div>

              <div class="action-inactive-field">

                <div class="action-inactive-label">

                  Inactive reason

                  <span class="action-inactive-required">
                    *
                  </span>

                </div>

                <div class="action-inactive-reasons">

                  ${reasonOptions
              .map(
                (
                  reason
                ) => `
                        <button
                          type="button"
                          class="action-inactive-chip"
                          data-value="${reason.value}"
                        >
                          <span class="action-inactive-chip-text">
                            ${reason.label}
                          </span>

                          <span class="action-inactive-chip-check">
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 16 16"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle
                                cx="8"
                                cy="8"
                                r="8"
                                fill="#1677FF"
                              />

                              <path
                                d="M5 8.1L6.7 9.8L11 5.6"
                                stroke="white"
                                stroke-width="1.6"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              />
                            </svg>
                          </span>

                        </button>
                      `
              )
              .join(
                ''
              )}

                </div>

              </div>

              <div class="action-inactive-field">

                <div class="action-inactive-label">
                  Noted
                </div>

                <textarea
                  id="inactive-place-note"
                  class="action-inactive-textarea"
                  placeholder="Add details reason ..."
                ></textarea>

              </div>

            </div>
          `,

          showCloseButton:
            true,

          showCancelButton:
            true,

          reverseButtons:
            true,

          focusConfirm:
            false,

          buttonsStyling:
            false,

          cancelButtonText:
            'Cancel',

          confirmButtonText:
            'Inactive Place',

          customClass: {
            popup:
              'action-inactive-popup',

            htmlContainer:
              'action-inactive-html',

            closeButton:
              'action-inactive-close',

            actions:
              'action-inactive-actions',

            cancelButton:
              'action-inactive-cancel',

            confirmButton:
              'action-inactive-confirm',
          },

          /* =================================================
             WHEN POPUP OPEN
          ================================================= */

          didOpen: () => {
            const popup =
              Swal.getPopup()

            if (!popup) {
              return
            }

            const confirmBtn =
              Swal.getConfirmButton()

            const chips =
              popup.querySelectorAll(
                '.action-inactive-chip'
              )

            /* -----------------------------------------------
               DISABLE INITIALLY
            ----------------------------------------------- */

            if (confirmBtn) {
              confirmBtn.disabled =
                true
            }

            /* -----------------------------------------------
               REASON CLICK
            ----------------------------------------------- */

            chips.forEach(
              (
                chip
              ) => {
                chip.addEventListener(
                  'click',
                  () => {
                    /* Remove previous selection */

                    chips.forEach(
                      (
                        item
                      ) => {
                        item.classList.remove(
                          'active'
                        )
                      }
                    )

                    /* Select clicked reason */

                    chip.classList.add(
                      'active'
                    )

                    selectedReason =
                      String(
                        chip.getAttribute(
                          'data-value'
                        ) || ''
                      ).trim()

                    /* Enable button */

                    if (
                      confirmBtn
                    ) {
                      confirmBtn.disabled =
                        selectedReason ===
                        ''

                      if (
                        selectedReason
                      ) {
                        confirmBtn.removeAttribute(
                          'disabled'
                        )
                      }
                    }
                  }
                )
              }
            )
          },

          /* =================================================
             CONFIRM
          ================================================= */

          preConfirm: () => {
            const noteEl =
              document.getElementById(
                'inactive-place-note'
              )

            notedValue =
              noteEl
                ?.value
                ?.trim() ||
              ''

            selectedReason =
              String(
                selectedReason ||
                ''
              ).trim()

            if (
              !selectedReason
            ) {
              Swal.showValidationMessage(
                'Inactive reason is required.'
              )

              return false
            }

            console.log(
              'INACTIVE FORM:',
              {
                reason:
                  selectedReason,

                note:
                  notedValue,
              }
            )

            return {
              reason:
                selectedReason,

              note:
                notedValue,
            }
          },
        })

      /* =====================================================
         CANCEL / CLOSE
      ===================================================== */

      if (
        !result.isConfirmed
      ) {
        return false
      }

      /* =====================================================
         FORM RESULT
      ===================================================== */

      const inactiveData =
        result.value ||
        {}

      console.log(
        'INACTIVE RESULT:',
        inactiveData
      )

      /* =====================================================
         UPDATE STATUS
      ===================================================== */

      const updated =
        await onFinish(
          'Inactive',
          {
            reason:
              inactiveData
                ?.reason,

            note:
              inactiveData
                ?.note,

            /*
             * Custom popup already confirmed.
             */
            skipConfirm:
              true,
          }
        )

      return updated
    }

  /* =========================================================
     MENU CLICK
  ========================================================= */

  const handleMenuClick =
    async ({
      key,
    }) => {
      /* =====================================================
         ACTIVE -> INACTIVE
      ===================================================== */

      if (
        key ===
        'Inactive'
      ) {
        await openInactiveDialog()

        return
      }

      /* =====================================================
         ACTION -> STATUS
      ===================================================== */

      const statusMap = {
        'In Review':
          'In Review',

        Approved:
          'Active',

        deleted:
          'Deleted',

        Active:
          'Active',

        recover:
          'Pending',

        addToBusinessPlace:
          'addToBusinessPlace',
      }

      const nextStatus =
        statusMap[key]

      if (
        !nextStatus
      ) {
        return
      }

      await onFinish(
        nextStatus
      )
    }

  /* =========================================================
     MENU ITEMS
  ========================================================= */

  const menuItems =
    []

  /* =========================================================
     PENDING -> IN REVIEW
  ========================================================= */

  if (
    colorStatus ===
    'pending'
  ) {
    menuItems.push({
      key:
        'In Review',

      label: (
        <>
          <Image
            src={
              MessageIcon
            }
            preview={
              false
            }
            width={
              15
            }
          />

          {' '}

          In Review
        </>
      ),
    })
  }

  /* =========================================================
     PENDING / IN REVIEW -> ACTIVE
  ========================================================= */

  if (
    colorStatus ===
    'pending' ||
    colorStatus ===
    'in review'
  ) {
    menuItems.push({
      key:
        'Approved',

      label: (
        <>
          <Image
            src={
              TickBookIcon
            }
            preview={
              false
            }
            width={
              15
            }
          />

          {' '}

          Approve Place
        </>
      ),
    })
  }

  /* =========================================================
     INACTIVE -> ACTIVE
  ========================================================= */

  if (
    colorStatus ===
    'inactive'
  ) {
    menuItems.push({
      key:
        'Active',

      label: (
        <>
          <Image
            src={
              EyeIcon
            }
            preview={
              false
            }
            width={
              15
            }
          />

          {' '}

          Active
        </>
      ),
    })
  }

  /* =========================================================
     DELETE
  ========================================================= */

  if (
    [
      'pending',
      'draft',
      'in review',
      'inactive',
    ].includes(
      colorStatus
    )
  ) {
    menuItems.push({
      key:
        'deleted',

      label: (
        <>
          <Image
            src={
              DeleteIcon
            }
            preview={
              false
            }
            width={
              15
            }
          />

          {' '}

          Delete
        </>
      ),
    })
  }

  /* =========================================================
     ACTIVE
  ========================================================= */

  if (
    colorStatus ===
    'active'
  ) {
    menuItems.push(
      {
        key:
          'addToBusinessPlace',

        label: (
          <>
            <Image
              src={
                HomeIcon
              }
              preview={
                false
              }
              width={
                15
              }
            />

            {' '}

            Add to Business Place
          </>
        ),
      },

      {
        key:
          'Inactive',

        label: (
          <>
            <Image
              src={
                HideEyeIcon
              }
              preview={
                false
              }
              width={
                15
              }
            />

            {' '}

            Inactive
          </>
        ),
      }
    )
  }

  /* =========================================================
     DELETED -> RECOVER
  ========================================================= */

  if (
    colorStatus ===
    'deleted'
  ) {
    menuItems.push({
      key:
        'recover',

      label: (
        <>
          <Image
            src={
              RecoverIcon
            }
            preview={
              false
            }
            width={
              12
            }
          />

          {' '}

          Recover
        </>
      ),
    })
  }

  /* =========================================================
     STATUS BACKGROUND
  ========================================================= */

  const statusBackground =
    colorStatus ===
      'deleted'

      ? '#EAEAEA'

      : colorStatus ===
        'pending'

        ? '#FFF3DE'

        : colorStatus ===
          'draft'

          ? '#F0F2F8'

          : colorStatus ===
            'in review'

            ? '#FDFAE8'

            : colorStatus ===
              'active'

              ? '#F2FAEA'

              : colorStatus ===
                'inactive'

                ? '#F8EDED'

                : ''

  /* =========================================================
     STATUS COLOR
  ========================================================= */

  const statusColor =
    colorStatus ===
      'deleted'

      ? '#838383'

      : colorStatus ===
        'pending'

        ? '#DD991B'

        : colorStatus ===
          'draft'

          ? '#5C6BB2'

          : colorStatus ===
            'in review'

            ? '#E8C504'

            : colorStatus ===
              'active'

              ? '#6AC917'

              : colorStatus ===
                'inactive'

                ? '#AD3838'

                : ''

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div
      style={{
        display:
          'flex',

        alignItems:
          'center',

        marginBottom:
          12,

        gap:
          8,
      }}
    >
      {/* =====================================================
          STATUS
      ===================================================== */}

      <div
        style={{
          flex:
            1,

          background:
            statusBackground,

          borderRadius:
            8,

          padding:
            '4px 12px',

          textAlign:
            'center',
        }}
      >
        <Text
          style={{
            color:
              statusColor,

            fontWeight:
              'bold',

            fontSize:
              16,

            textTransform:
              'capitalize',
          }}
        >
          {status}
        </Text>
      </div>

      {/* =====================================================
          ACTION
      ===================================================== */}

      <Dropdown
        trigger={[
          'click',
        ]}
        menu={{
          items:
            menuItems,

          onClick:
            handleMenuClick,
        }}
      >
        <Button
          onClick={(
            event
          ) => {
            event.preventDefault()
          }}

          type='primary'

          style={{
            background:
              '#0070FF',
          }}
        >
          Action
        </Button>
      </Dropdown>
    </div>
  )
}