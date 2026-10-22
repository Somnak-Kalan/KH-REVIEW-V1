import React, { useContext, useState } from 'react'
import {
  Avatar,
  Button,
  Card,
  Dropdown,
  Modal,
  Radio,
  Tag,
} from 'antd'
import {
  DeleteOutlined,
  EllipsisOutlined,
  FormOutlined,
  HomeOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import AddRemark from '../other/AddRemark'
import AddComment from '../other/AddComment'
import helpFunctions from '../../../../utils/helpFunctions'
import { updateNonBusinessStatus } from './ChangeStatus'
import dayjs from 'dayjs'
import { AuthContext } from '../../../../contexts/AuthContext'
import { PERMS } from '../../../../constants/permission/perms'
import Swal from 'sweetalert2'

export default function getTableColumns(
  currentPage,
  pageSize,
  handleView,
  getAllProperty,
  status
) {
  const [isAddRemarkOpen, setIsAddRemarkOpen] = useState(false)
  const [OpenComment, setOpenComment] = useState(false)
  const [commentRecode, setCommentRecord] = useState()
  const [remarkRecode, setAddRemarkRecord] = useState()
  const { getFileByName } = helpFunctions
  const { access_token, checkPermission } = useContext(AuthContext)
  const hasFullAccess = checkPermission(PERMS.ASSIGNED_USER)

  const onHandleChange = async (
    record,
    status,
    options = {}
  ) => {
    try {
      const result =
        await updateNonBusinessStatus(
          record?._id,
          record?.status,
          status,
          access_token,
          options
        )

      if (!result) {
        return false
      }

      await getAllProperty()

      return true

    } catch (error) {
      console.error(
        'Change status failed:',
        error
      )

      return false
    }
  }

  const confirmEmpty = async (record) => {
    if (!hasFullAccess) return

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to empty this place?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Empty',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
    })

    if (result.isConfirmed) {
      await onHandleChange(record, 'empty')

      Swal.fire({
        title: 'Success!',
        text: 'Place has been emptied successfully.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      })
    }
  }

  const injectInactivePopupStyle = () => {
    if (document.getElementById('inactive-place-swal-style')) return

    const style = document.createElement('style')
    style.id = 'inactive-place-swal-style'
    style.innerHTML = `
      .inactive-place-popup {
        width: 520px !important;
        max-width: calc(100vw - 24px) !important;
        border-radius: 12px !important;
        padding: 0 !important;
        overflow: hidden !important;
      }

      .inactive-place-container {
        padding: 16px 20px 0 20px;
        text-align: left;
      }

      .inactive-place-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 10px;
      }

    

      .inactive-place-header-title {
        font-size: 15px;
        line-height: 1.2;
        font-weight: 700;
        color: #1f2937;
      }

      .inactive-place-desc {
        font-size: 13px;
        line-height: 1.45;
        color: #9ca3af;
        margin-bottom: 18px;
      }

      .inactive-place-field {
        margin-bottom: 16px;
      }

      .inactive-place-label {
        font-size: 14px;
        line-height: 1.3;
        font-weight: 700;
        color: #374151;
        margin-bottom: 12px;
      }

      .inactive-place-required {
        color: #ef4444;
      }

      .inactive-place-reasons {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px 12px;
      }

      .inactive-reason-chip {
        height: 36px;
        border: 1px solid #d9dfe8;
        border-radius: 999px;
        background: #ffffff;
        color: #9aa4b2;
        font-size: 13px;
        font-weight: 400;
        padding: 0 14px;
        display: inline-flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        cursor: pointer;
        transition: all 0.18s ease;
        outline: none;
        width: 100%;
        text-align: left;
      }

      .inactive-reason-chip:hover {
        border-color: #b9d4ff;
        color: #3b82f6;
      }

      .inactive-reason-chip.active {
        border-color: #1677ff;
        color: #1677ff;
        font-weight: 500;
        background: #ffffff;
      }

      .inactive-reason-chip-text {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1 1 auto;
      }

      .inactive-reason-chip-check {
        width: 16px;
        height: 16px;
        flex: 0 0 16px;
        display: none;
      }

      .inactive-reason-chip.active .inactive-reason-chip-check {
        display: inline-flex;
      }

      .inactive-place-textarea {
        width: 100%;
        min-height: 92px;
        border: 1px solid #d9d9d9;
        border-radius: 8px;
        resize: none;
        padding: 12px 14px;
        font-size: 14px;
        color: #374151;
        box-sizing: border-box;
        transition: all 0.18s ease;
      }

      .inactive-place-textarea::placeholder {
        color: #bfc5cf;
      }

      .inactive-place-textarea:focus {
        outline: none;
        border-color: #1677ff;
        box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.08);
      }

      .inactive-place-html {
        margin: 0 !important;
        padding: 0 !important;
      }
      .inactive-place-close {
        color: #9ca3af !important;

        /* bigger X */
        font-size: 28px !important;
        width: 34px !important;
        height: 34px !important;

        /* position */
        top: 8px !important;

        /* bigger right value = move more to LEFT */
        right: 24px !important;

        padding: 0 !important;

        display: flex !important;
        align-items: center !important;
        justify-content: center !important;

        line-height: 1 !important;
      }

      .inactive-place-actions {
        width: 100%;
        display: flex !important;
        justify-content: flex-end;
        gap: 8px;
        padding: 18px 20px 14px 20px !important;
        margin: 0 !important;
        box-sizing: border-box !important;
      }

      .inactive-place-cancel-btn {
        min-width: 76px;
        height: 32px;
        border-radius: 6px !important;
        border: 1px solid #d9d9d9 !important;
        background: #ffffff !important;
        color: #3f3f46 !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        box-shadow: none !important;
      }

      .inactive-place-cancel-btn:hover {
        border-color: #c8c8c8 !important;
        background: #ffffff !important;
      }

      .inactive-place-confirm-btn {
        min-width: 126px;
        height: 32px;
        border-radius: 6px !important;
        border: none !important;
        background: #1677ff !important;
        color: #ffffff !important;
        font-size: 14px !important;
        font-weight: 500 !important;
        box-shadow: none !important;
      }

      .inactive-place-confirm-btn:hover {
        background: #1668dc !important;
      }

      .inactive-place-confirm-btn.swal2-styled.swal2-default-outline:focus,
      .inactive-place-cancel-btn.swal2-styled.swal2-default-outline:focus,
      .inactive-place-confirm-btn:focus,
      .inactive-place-cancel-btn:focus {
        box-shadow: none !important;
      }

      .inactive-place-confirm-btn:disabled,
      .inactive-place-confirm-btn.swal2-styled:disabled {
        background: #e5e7eb !important;
        color: #b6bcc6 !important;
        cursor: not-allowed !important;
        opacity: 1 !important;
      }

      .swal2-validation-message {
        margin: 8px 20px 0 20px !important;
        border-radius: 8px !important;
        font-size: 13px !important;
        text-align: left !important;
      }

      @media (max-width: 560px) {
        .inactive-place-reasons {
          grid-template-columns: 1fr;
        }
      }
    `
    document.head.appendChild(style)
  }

  const openInactiveReasonDialog = async (record) => {
    if (!hasFullAccess) return

    injectInactivePopupStyle()

    let selectedReason = ''
    let notedValue = ''

    const reasonOptions = [
      {
        label: 'Permanently Closed',
        value: 'permanently_closed',
      },
      {
        label: 'Data Maintenance',
        value: 'data_maintenance',
      },
      {
        label: 'Does Not Meet Listing Criteria',
        value: 'does_not_meet_listing_criteria',
      },
      {
        label: 'Policy Violation / Reported',
        value: 'policy_violation_reported',
      },
    ]

    const result = await Swal.fire({
      html: `
        <div class="inactive-place-container">
          <div class="inactive-place-header">
           
            <div class="inactive-place-header-title">Inactive Place</div>
          </div>

          <div class="inactive-place-desc">
            This place will be hidden from public view in the app. Select a reason you want to send to the creator.
          </div>

          <div class="inactive-place-field">
            <div class="inactive-place-label">
              Inactive reason <span class="inactive-place-required">*</span>
            </div>

            <div class="inactive-place-reasons">
             ${reasonOptions
          .map(
            (reason) => `
      <button
        type="button"
        class="inactive-reason-chip"
        data-value="${reason.value}"
      >
        <span class="inactive-reason-chip-text">
          ${reason.label}
        </span>

        <span class="inactive-reason-chip-check">
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
          .join('')}
            </div>
          </div>

          <div class="inactive-place-field">
            <div class="inactive-place-label">Noted</div>
            <textarea
              id="inactive-place-note"
              class="inactive-place-textarea"
              placeholder="Add details reason ..."
            ></textarea>
          </div>
        </div>
      `,
      showCloseButton: true,
      showCancelButton: true,

      // Cancel on left, Confirm on right
      reverseButtons: true,

      focusConfirm: false,
      buttonsStyling: false,

      cancelButtonText: 'Cancel',
      confirmButtonText: 'Inactive Place',

      customClass: {
        popup: 'inactive-place-popup',
        htmlContainer: 'inactive-place-html',
        closeButton: 'inactive-place-close',
        actions: 'inactive-place-actions',
        cancelButton: 'inactive-place-cancel-btn',
        confirmButton: 'inactive-place-confirm-btn',
      },
      didOpen: () => {
        const popup = Swal.getPopup()
        if (!popup) return

        const confirmBtn = Swal.getConfirmButton()
        const chips = popup.querySelectorAll('.inactive-reason-chip')
        const noteEl = popup.querySelector('#inactive-place-note')

        if (confirmBtn) {
          confirmBtn.disabled = true
        }

        chips.forEach((chip) => {
          chip.addEventListener('click', () => {
            chips.forEach((btn) => btn.classList.remove('active'))
            chip.classList.add('active')
            selectedReason = chip.getAttribute('data-value') || ''

            if (confirmBtn) {
              confirmBtn.disabled = !selectedReason
            }
          })
        })

        if (noteEl) {
          noteEl.addEventListener('input', (e) => {
            notedValue = e.target.value
          })
        }
      },
      preConfirm: () => {
        const noteEl = document.getElementById('inactive-place-note')
        notedValue = noteEl?.value?.trim() || ''
        if (!selectedReason) {
          Swal.showValidationMessage('Inactive reason is required.')
          return false
        }
        return {
          reason: selectedReason,
          note: notedValue,
        }
      },
    })

    if (result.isConfirmed) {
      const inactiveData =
        result.value || {}

      await onHandleChange(
        record,
        'Inactive',
        {
          reason:
            inactiveData.reason,

          note:
            inactiveData.note,

          // Already confirmed in custom popup
          skipConfirm:
            true,

          // Column.js shows its own success popup
          skipSuccess:
            true,
        }
      )

    }
  }

  const [statusDlg, setStatusDlg] = useState({
    open: false,
    record: null,
    value: 'Active',
  })

  const onChangeComment = (record) => {
    setOpenComment(true)
    setCommentRecord(record)
  }

  const onChangeRemark = (record) => {
    setIsAddRemarkOpen(true)
    setAddRemarkRecord(record)
  }

  const confirmStatusChange = async () => {
    const { record, value } = statusDlg
    if (!record) return

    await onHandleChange(record, value)
    setStatusDlg({ open: false, record: null, value: 'Active' })
  }

  return [
    {
      title: '',
      key: 'changeStatus',
      align: 'center',
      render: (record) => {
        const status = record?.status?.toLowerCase()

        let menuItems = []

        if (status === 'active') {
          menuItems = [
            {
              key: 'addToBusiness',
              label: 'Add To Business Place',
              disabled: !hasFullAccess,
              icon: (
                <PlusOutlined style={{ fontSize: '14px', color: 'blue' }} />
              ),
              onClick: () =>
                hasFullAccess &&
                console.log('Add To Business Place clicked for', record),
            },
            {
              key: 'inactive',
              disabled: !hasFullAccess,
              label: 'Inactive',
              icon: <HomeOutlined style={{ fontSize: '14px', color: 'red' }} />,
              onClick: () =>
                hasFullAccess && openInactiveReasonDialog(record),
            },
            {
              key: 'addRemark',
              disabled: !hasFullAccess,
              label: 'Add Remark',
              icon: (
                <FormOutlined style={{ fontSize: '14px', color: 'orange' }} />
              ),
              onClick: () => hasFullAccess && onChangeRemark(record),
            },
          ]
        } else if (status === 'pending') {
          menuItems = [
            {
              key: 'delete',
              disabled: !hasFullAccess,
              label: 'Delete Place',
              icon: (
                <DeleteOutlined style={{ fontSize: '14px', color: 'red' }} />
              ),
              onClick: () => onHandleChange(record, 'Deleted'),
            },
            {
              key: 'inReview',
              disabled: !hasFullAccess,
              label: 'In Review',
              icon: (
                <FormOutlined style={{ fontSize: '14px', color: 'purple' }} />
              ),
              onClick: () =>
                hasFullAccess && onHandleChange(record, 'In Review'),
            },
            {
              key: 'approve',
              disabled: !hasFullAccess,
              label: 'Approve Place',
              icon: (
                <HomeOutlined style={{ fontSize: '14px', color: 'blue' }} />
              ),
              onClick: () => hasFullAccess && onHandleChange(record, 'Active'),
            },
          ]
        } else if (status === 'draft') {
          menuItems = [
            {
              key: 'delete',
              disabled: !hasFullAccess,
              label: 'Delete Place',
              icon: (
                <DeleteOutlined style={{ fontSize: '14px', color: 'red' }} />
              ),
              onClick: () => hasFullAccess && onHandleChange(record, 'Deleted'),
            },
          ]
        } else if (status === 'inactive') {
          menuItems = [
            {
              key: 'delete',
              disabled: !hasFullAccess,
              label: 'Delete Place',
              icon: (
                <DeleteOutlined style={{ fontSize: '14px', color: 'red' }} />
              ),
              onClick: () => hasFullAccess && onHandleChange(record, 'Deleted'),
            },
            {
              key: 'active',
              disabled: !hasFullAccess,
              label: 'Active',
              icon: (
                <HomeOutlined style={{ fontSize: '14px', color: 'blue' }} />
              ),
              onClick: () => hasFullAccess && onHandleChange(record, 'Active'),
            },
          ]
        } else if (status === 'in review') {
          menuItems = [
            {
              key: 'delete',
              disabled: !hasFullAccess,
              label: 'Delete Place',
              icon: (
                <DeleteOutlined style={{ fontSize: '14px', color: 'red' }} />
              ),
              onClick: () => hasFullAccess && onHandleChange(record, 'Deleted'),
            },
            {
              key: 'approve',
              disabled: !hasFullAccess,
              label: 'Approve Place',
              icon: (
                <HomeOutlined style={{ fontSize: '14px', color: 'blue' }} />
              ),
              onClick: () => hasFullAccess && onHandleChange(record, 'Active'),
            },
            {
              key: 'addComment',
              disabled: !hasFullAccess,
              label: 'Add Comment',
              icon: (
                <FormOutlined style={{ fontSize: '14px', color: 'orange' }} />
              ),
              onClick: () => hasFullAccess && onChangeComment(record),
            },
          ]
        } else if (status === 'deleted') {
          menuItems = [
            {
              key: 'Empty',
              disabled: !hasFullAccess,
              label: <span>Empty</span>,
              icon: (
                <DeleteOutlined style={{ fontSize: '14px', color: 'red' }} />
              ),
              onClick: () => hasFullAccess && onHandleChange(record, 'Deleted'),
            },
          ]
        }

        return hasFullAccess ? (
          <Dropdown
            menu={{
              items: menuItems.map((m) => ({
                key: m.key,
                label: m.label,
                icon: m.icon,
                onClick: m.onClick,
              })),
            }}
            trigger={['click']}
          >
            <Button
              type='text'
              style={{ transform: 'rotate(90deg)' }}
              icon={<EllipsisOutlined />}
            />
          </Dropdown>
        ) : (
          ''
        )
      },
    },
    {
      title: 'No',
      dataIndex: 'no',
      key: 'no',
      align: 'center',
      width: 60,
      render: (text, record, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: 'Place ID',
      dataIndex: 'placeId',
      key: 'placeId',
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 100,
      render: (val) => {
        if (val === 'Active')
          return (
            <Tag
              color='green'
              style={{
                background: '#6AC917',
                color: 'white',
                borderRadius: '20px',
              }}
            >
              Active
            </Tag>
          )

        if (val === 'Pending')
          return (
            <Tag
              color='orange'
              style={{
                background: 'orange',
                color: 'white',
                borderRadius: '20px',
              }}
            >
              Pending
            </Tag>
          )

        if (val === 'Draft')
          return (
            <Tag
              color='blue'
              style={{
                background: '#5C6BB2',
                color: 'white',
                borderRadius: '20px',
              }}
            >
              Draft
            </Tag>
          )

        if (val === 'Inactive')
          return (
            <Tag
              color='red'
              style={{
                background: '#AD3838',
                color: 'white',
                borderRadius: '20px',
              }}
            >
              Inactive
            </Tag>
          )

        if (val === 'In Review')
          return (
            <Tag
              style={{
                background: '#E8C504',
                color: 'white',
                borderRadius: '20px',
              }}
              color='gold'
            >
              In Review
            </Tag>
          )

        if (val?.trim().toLowerCase() === 'deleted')
          return (
            <Tag
              style={{
                background: 'Red',
                color: 'white',
                borderRadius: '20px',
              }}
              color='gold'
            >
              Deleted
            </Tag>
          )

        return (
          <Tag
            color='gray'
            style={{
              background: 'gray',
              color: 'white',
              borderRadius: '20px',
            }}
          >
            {val}
          </Tag>
        )
      },
    },
    {
      title: 'Property Profile',
      key: 'property_profile',
      align: 'center',
      render: (_, record) => {
        const imageSrc =
          record?.media?.image?.find((img) => img?.includes('original'))

        const detailUrl = `/property/${record?._id}`

        const openDetail = () =>
          window.open(detailUrl, '_blank', 'noopener,noreferrer')

        return (
          <div className='flex items-center gap-2 '>
            <Avatar
              shape='square'
              style={{ width: '60px', height: '40px' }}
              src={imageSrc}
            />
            <div className='flex flex-col items-start leading-[1.05] '>
              <p
                className='m-0 p-0 cursor-pointer font-bold text-blue-800 hover:underline'
                onClick={openDetail}
              >
                {record?.nameEn}
              </p>
              <p
                className='m-0 p-0 my-1 cursor-pointer font-semibold text-gray-500 hover:underline'
                onClick={openDetail}
              >
                {record?.nameKh}
              </p>
            </div>
          </div>
        )
      },
    },

    ...(status === 'Inactive'
      ? [
        {
          title: 'Reason',
          dataIndex: 'statusReason',
          key: 'statusReason',
          align: 'center',


          render: (value) => {
            const reasonLabel = {
              permanently_closed:
                'Permanently Closed',

              data_maintenance:
                'Data Maintenance',

              does_not_meet_listing_criteria:
                'Does Not Meet Listing Criteria',

              policy_violation_reported:
                'Policy Violation / Reported',
            }

            return (
              <span>
                {reasonLabel[value] || '-'}
              </span>
            )
          },
        },
      ]
      : []),
    {
      title: 'Ownership',
      dataIndex: 'ownership',
      key: 'ownership',
      align: 'center',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      align: 'center',
      render: (_, record) => {
        if (!record?.mainCategory) return ''
        if (!record?.mainCategory?.nameKh && !record?.mainCategory?.nameEn) {
          return ''
        }

        return `${record?.mainCategory?.nameKh ?? ''} - ${record?.mainCategory?.nameEn ?? ''}`
      },
    },
    {
      title: 'Sub Category',
      dataIndex: 'sub_category',
      key: 'sub_category',
      align: 'center',
      render: (_, record) => {
        const list = Array.isArray(record?.subCategory)
          ? record?.subCategory
          : []

        return list
          .map((item) => {
            const kh = item?.nameKh ?? ''
            const en = item?.nameEn ?? ''
            return [kh, en].filter(Boolean).join(' + ')
          })
          .join(', ')
      },
    },
    {
      title: 'Type Of Place',
      dataIndex: 'type_of_place',
      key: 'type_of_place',
      align: 'center',
      render: (_, record) => {
        const list = Array.isArray(record?.typeOfPlace)
          ? record?.typeOfPlace
          : []

        return list
          .map((item) => {
            const kh = item?.nameKh ?? ''
            const en = item?.nameEn ?? ''
            return [kh, en].filter(Boolean).join(' ')
          })
          .join(', ')
      },
    },
    {
      title: 'City/Province',
      dataIndex: 'city_province',
      key: 'city_province',
      align: 'center',
      render: (_, record) => {
        if (!record?.address) return ''
        if (!record?.address?.location) return ''
        return record?.address?.location?.provinceEn ?? ''
      },
    },
    {
      title: 'District/Khan',
      dataIndex: 'district_khan',
      key: 'district_khan',
      align: 'center',
      render: (_, record) => {
        if (!record?.address) return ''
        if (!record?.address?.location) return ''
        return record?.address?.location?.districtEn ?? ''
      },
    },
    {
      title: 'Commune/Sangkat',
      dataIndex: 'commune_sangkat',
      key: 'commune_sangkat',
      align: 'center',
      render: (_, record) => {
        if (!record?.address) return ''
        if (!record?.address?.location) return ''
        return record?.address?.location?.communeEn ?? ''
      },
    },
    {
      title: 'Updated By',
      dataIndex: 'updatedBy',
      key: 'updatedBy',
      align: 'center',
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      align: 'center',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      sortDirections: ['ascend', 'descend'],
      className: 'column-sort',
      render: (_, record) => {
        if (!record?.createdAt) return ''
        return dayjs(record?.createdAt ?? '').format('YYYY-MM-DD')
      },
    },
    {
      title: '',
      key: 'addRemarkModal',
      render: () =>
        isAddRemarkOpen && (
          <AddRemark
            open={isAddRemarkOpen}
            setOpen={setIsAddRemarkOpen}
            id={remarkRecode?._id}
          />
        ),
    },
    {
      title: '',
      key: 'AddCommentModal',
      render: () =>
        OpenComment && (
          <AddComment
            open={OpenComment}
            setOpen={setOpenComment}
            id={commentRecode?._id}
          />
        ),
    },
    {
      title: '',
      key: 'changeStatusDialog',
      render: () =>
        statusDlg?.open && (
          <Modal
            open={statusDlg.open}
            title='Change Status'
            okText='Update'
            onOk={confirmStatusChange}
            onCancel={() =>
              setStatusDlg({ open: false, record: null, value: 'Active' })
            }
            mask={false}
            modalClassName='no-blur-modal'
          >
            <Card>
              <Radio.Group
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                value={statusDlg.value}
                onChange={(e) =>
                  setStatusDlg((s) => ({ ...s, value: e.target.value }))
                }
              >
                <Radio value='Inactive'>Inactive</Radio>
                <Radio value='Draft'>Draft</Radio>
                <Radio value='Pending'>Pending</Radio>
                <Radio value='In Review'>In Review</Radio>
              </Radio.Group>
            </Card>
          </Modal>
        ),
    },
  ]
}