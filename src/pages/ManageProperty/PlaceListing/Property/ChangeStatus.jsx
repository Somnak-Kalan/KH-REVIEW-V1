// src/pages/ManageProperty/PlaceListing/Property/ChangeStatus.jsx

import React, {
  useContext,
  useEffect,
} from 'react'

import Swal from 'sweetalert2'

import OtherServiceNonBusinessProperty from '../../../../services/ManageProperty/PlaceListing/Other'

import {
  AuthContext,
} from '../../../../contexts/AuthContext'


/* =========================================================
   CUSTOM SUCCESS TOAST
========================================================= */

function showSuccessToast(nextStatus) {
  Swal.fire({
    toast: false,

    position: 'center',

    showConfirmButton: false,

    timer: 1800,

    html: `
      <div class="swal2-custom-success">

        <div class="swal2-check-wrapper">
          <i class="swal2-icon-check"></i>
        </div>

        <h3>
          Add to ${nextStatus} Successfully
        </h3>

        <p>
          Your place has been added to
          ${nextStatus.toLowerCase()}
          successfully
        </p>

      </div>
    `,

    didOpen: () => {
      const popup = Swal.getPopup()

      if (!popup) {
        return
      }

      const confirmBtn =
        Swal.getConfirmButton()

      const chips =
        popup.querySelectorAll(
          '.action-inactive-chip'
        )

      if (confirmBtn) {
        confirmBtn.disabled = true
      }

      chips.forEach((chip) => {
        chip.addEventListener(
          'click',
          () => {
            chips.forEach((item) => {
              item.classList.remove(
                'active'
              )
            })

            chip.classList.add(
              'active'
            )

            selectedReason =
              (
                chip.getAttribute(
                  'data-value'
                ) || ''
              ).trim()

            if (confirmBtn) {
              confirmBtn.disabled =
                !selectedReason
            }
          }
        )
      })
    },

    backdrop:
      'rgba(0, 0, 0, 0)',
  })
}


/* =========================================================
   STATUS SUCCESS
========================================================= */

const showStatusSuccess =
  async (status) => {
    let title =
      'Updated!'

    let text =
      'Status change was successful.'


    /* -----------------------------------------------------
       ACTIVE
    ----------------------------------------------------- */

    if (
      status ===
      'Active'
    ) {
      text =
        'Place has been changed to active successfully.'
    }




    /* -----------------------------------------------------
       DELETED
    ----------------------------------------------------- */

    if (
      status ===
      'Deleted'
    ) {
      title =
        'Deleted!'

      text =
        'Place has been deleted successfully.'
    }


    /* -----------------------------------------------------
       DRAFT
    ----------------------------------------------------- */

    if (
      status ===
      'Draft'
    ) {
      text =
        'Place has been changed to draft successfully.'
    }


    /* -----------------------------------------------------
       PENDING
    ----------------------------------------------------- */

    if (
      status ===
      'Pending'
    ) {
      text =
        'Place has been changed to pending successfully.'
    }


    await Swal.fire({
      icon:
        'success',

      title,

      text,

      timer:
        1800,

      showConfirmButton:
        false,
    })
  }


/* =========================================================
   UPDATE STATUS
========================================================= */

export async function updateNonBusinessStatus(
  id,
  preStatus,
  status,
  access_token,
  options = {}
) {
  if (
    !id ||
    !status ||
    !access_token
  ) {
    return false
  }


  const {
    reason = null,

    note = '',

    /*
     * Used because Inactive already has
     * its own custom confirmation popup.
     */
    skipConfirm = false,
  } = options


  /* =======================================================
     NORMALIZE STATUS
  ======================================================= */

  const previousStatus =
    String(
      preStatus || ''
    )
      .trim()
      .toLowerCase()

  const nextStatus =
    String(
      status || ''
    )
      .trim()
      .toLowerCase()


  /* =======================================================
     ACTIVE -> INACTIVE
  ======================================================= */

  const isActiveToInactive =
    previousStatus ===
    'active' &&
    nextStatus ===
    'inactive'


  /* =======================================================
     REASON REQUIRED
  ======================================================= */

  if (
    isActiveToInactive &&
    !reason
  ) {
    await Swal.fire({
      icon:
        'warning',

      title:
        'Reason required',

      text:
        'Please select an inactive reason.',
    })

    return false
  }


  /* =======================================================
     CONFIRMATION
  ======================================================= */

  if (
    !skipConfirm
  ) {
    const {
      isConfirmed,
    } =
      await Swal.fire({
        title:
          status ===
            'Active'
            ? 'Are you sure?'

            : status ===
              'In Review'
              ? 'In Review'

              : status ===
                'Inactive'
                ? 'Inactive'

                : status ===
                  'Deleted'
                  ? 'Are you sure?'

                  : 'Are you sure?',


        text:
          `Do you really want to ${status} this place ?`,


        icon:
          'question',


        showCancelButton:
          true,


        confirmButtonText:
          status ===
            'Active'
            ? 'Active'

            : status ===
              'In Review'
              ? 'Confirm'

              : status ===
                'Inactive'
                ? 'Inactive'

                : status ===
                  'Deleted'
                  ? 'Yes, Delete it!'

                  : 'Confirm',


        cancelButtonText:
          status ===
            'Active'
            ? 'No'

            : status ===
              'Deleted'
              ? 'No'

              : 'Cancel',


        confirmButtonColor:
          status ===
            'Active'
            ? '#52C41A'

            : status ===
              'In Review'
              ? '#F5A623'

              : status ===
                'Inactive'
                ? '#FF4D4F'

                : status ===
                  'Deleted'
                  ? '#D9363E'

                  : '#1677FF',


        cancelButtonColor:
          '#3085D6',


        customClass: {
          cancelButton:
            'change-status-cancel-btn',
        },
      })


    if (
      !isConfirmed
    ) {
      return false
    }
  }


  /* =======================================================
     BUILD BODY
  ======================================================= */

  const doc = {
    id,
    status,
  }


  /* =======================================================
     INACTIVE BODY
  ======================================================= */

  if (
    isActiveToInactive
  ) {
    doc.reason =
      reason

    if (
      note &&
      String(
        note
      ).trim() !== ''
    ) {
      doc.note =
        String(
          note
        ).trim()
    }
  }


  console.log(
    'UPDATE PLACE STATUS:',
    doc
  )


  /* =======================================================
     API REQUEST
  ======================================================= */

  try {
    const response =
      await OtherServiceNonBusinessProperty
        .updateStatusNonBusinessProperty({
          doc,

          access_token,
        })


    /* =====================================================
       SUCCESS

       ALL SUCCESS POPUPS ARE HANDLED HERE
    ===================================================== */

    if (
      status ===
      'In Review'
    ) {
      await showSuccessToast(
        'In-Review'
      )
    } else {
      await showStatusSuccess(
        status
      )
    }


    return (
      response ||
      true
    )
  } catch (err) {
    await Swal.fire({
      icon:
        'error',

      title:
        'Oops…',

      text:
        err?.response
          ?.data?.msg ||

        err?.response
          ?.data?.error?.msg ||

        'Could not update status. Please try again.',
    })

    throw err
  }
}


/* =========================================================
   OPTIONAL SIDE EFFECT COMPONENT
========================================================= */

export default function ChangeStatus({
  id,
  status,
}) {
  const {
    access_token,
  } =
    useContext(
      AuthContext
    )


  useEffect(() => {
    if (
      !id ||
      !status ||
      !access_token
    ) {
      return
    }


    updateNonBusinessStatus(
      id,
      null,
      status,
      access_token
    )

  }, [
    id,
    status,
    access_token,
  ])


  return null
}