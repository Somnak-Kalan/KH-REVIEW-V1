import {
  useContext,
  useEffect,
  useState,
} from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  Breadcrumb,
  Button,
  Dropdown,
  Input,
  Tag,
  message,
} from 'antd'
import {
  ArrowLeftOutlined,
  HomeOutlined,
  MoreOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'

import { AuthContext } from '../../../../contexts/AuthContext'

import AddKeywordToGroupModal from './AddKeywordToGroupModal'
import TransferKeywordModal from './TransferKeywordModal'
import EditGroupKeywordModal from '../funstions/EditKeywordGroupModal'
import EditKeywordModal from '../funstions/EditKeywordModal'

import KeywordGroupDetailTable from './KeywordGroupDetailTable'
import useKeywordGroupDetail from './useKeywordGroupDetail'
import useKeywordGroupStore from '../../../../Stores/settings/setups/keyword-group.store'

import EditIcon from '../../../../assets/icon/user/actionIcon/edit.svg'
import DeleteIcon from '../../../../assets/icon/user/actionIcon/delete.svg'

const getCreatedByName = (createdBy) => {
  if (!createdBy) return 'Admin'

  if (typeof createdBy === 'string') {
    return createdBy
  }

  return (
    createdBy?.name ||
    createdBy?.username ||
    'Admin'
  )
}

const getErrorMessage = (
  error,
  fallbackMessage
) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  )
}

const KeywordGroupDetail = () => {
  const {
    setDisplayEmitContent,
  } = useOutletContext()

  const {
    access_token,
  } = useContext(AuthContext)

  const detail =
    useKeywordGroupDetail()

  const {
    groupKeywords,
    groupKeywordPagination,
    groupKeywordsLoading,
    fetchKeywordGroupKeywords,
    transferKeywordsToGroup,
  } = useKeywordGroupStore()

  const [
    keywordCurrentPage,
    setKeywordCurrentPage,
  ] = useState(1)

  const [
    keywordPageSize,
    setKeywordPageSize,
  ] = useState(10)

  const currentGroupId =
    detail.currentGroup?._id

  useEffect(() => {
    setDisplayEmitContent(
      <div className='my-3 flex justify-between'>
        <button
          type='button'
          onClick={() => {
            detail.navigate(
              '/keyword?tab=keyword-groups'
            )
          }}
          className='flex items-center gap-2 font-semibold text-gray-700 transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400'
        >
          <ArrowLeftOutlined />

          <span>
            Keyword Group Detail
          </span>
        </button>

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
  }, [
    setDisplayEmitContent,
    detail.currentGroup?.nameEn,
    detail.navigate,
  ])

  useEffect(() => {
    setKeywordCurrentPage(1)
  }, [
    currentGroupId,
    detail.search,
  ])

  useEffect(() => {
    if (
      !currentGroupId ||
      !access_token
    ) {
      return
    }

    const timeoutId =
      setTimeout(() => {
        fetchKeywordGroupKeywords({
          id:
            currentGroupId,

          access_token,

          page:
            keywordCurrentPage,

          limit:
            keywordPageSize,

          search:
            detail.search ||
            '',
        }).catch((error) => {
          message.error(
            getErrorMessage(
              error,
              'Unable to load keywords in this group.'
            )
          )
        })
      }, 300)

    return () => {
      clearTimeout(
        timeoutId
      )
    }
  }, [
    currentGroupId,
    access_token,
    keywordCurrentPage,
    keywordPageSize,
    detail.search,
    fetchKeywordGroupKeywords,
  ])

  const handleKeywordPageChange = (
    page,
    size
  ) => {
    const isChangingPageSize =
      size !== keywordPageSize

    setKeywordCurrentPage(
      isChangingPageSize
        ? 1
        : page
    )

    setKeywordPageSize(
      size
    )
  }

  const handleRemoveKeywordFromGroup =
    async (record) => {
      if (!record?._id) {
        message.error(
          'Keyword ID is required.'
        )

        return
      }

      if (!currentGroupId) {
        message.error(
          'Keyword group ID is required.'
        )

        return
      }

      try {
        await transferKeywordsToGroup({
          keywordIds: [
            record._id,
          ],

          fromGroupId:
            currentGroupId,

          targetGroupId:
            null,

          access_token,
        })

        message.success(
          'Keyword removed from group successfully'
        )
      } catch (error) {
        message.error(
          getErrorMessage(
            error,
            'Unable to remove keyword from group.'
          )
        )
      }
    }

  const groupActionMenu = {
    items: [
      {
        key: 'edit',

        label: 'Edit',

        icon: (
          <img
            src={EditIcon}
            alt='edit group keyword'
          />
        ),

        onClick: () => {
          detail.setOpenEditGroupKeyword(
            true
          )
        },
      },
      {
        key: 'delete',

        label: (
          <span className='text-red-500'>
            Delete
          </span>
        ),

        icon: (
          <img
            src={DeleteIcon}
            alt='delete group keyword'
          />
        ),

        onClick:
          detail.handleDeleteGroupKeyword,
      },
    ],
  }

  if (
    !detail.currentGroup &&
    detail.detailLoading
  ) {
    return (
      <div className='rounded-lg bg-white p-6 dark:bg-slate-900'>
        Loading keyword group detail...
      </div>
    )
  }

  if (!detail.currentGroup) {
    return (
      <div className='rounded-lg bg-white p-6 dark:bg-slate-900'>
        <div className='mb-4 text-lg font-semibold text-gray-700 dark:text-slate-200'>
          Group not found
        </div>

        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => {
            detail.navigate(
              '/keyword?tab=keyword-groups'
            )
          }}
        >
          Back
        </Button>
      </div>
    )
  }

  return (
    <div className='w-full'>
      <AddKeywordToGroupModal
        open={detail.openAddKeyword}
        group={detail.currentGroup}
        keywords={detail.keywords}
        availableKeywords={
          detail.availableKeywords
        }
        onCancel={() => {
          detail.setOpenAddKeyword(false)
        }}
        onAddExisting={
          detail.handleAddExisting
        }
        onCreateAndAdd={
          detail.handleCreateAndAdd
        }
      />

      <TransferKeywordModal
        open={detail.openTransfer}
        keyword={detail.transferRecord}
        keywords={detail.keywords}
        currentGroup={detail.currentGroup}
        groups={detail.sourceGroups}
        onCancel={() => {
          detail.setOpenTransfer(false)
          detail.setTransferRecord(null)
        }}
        onSubmit={
          detail.handleTransfer
        }
      />

      <EditKeywordModal
        open={detail.openEditKeyword}
        record={detail.editingRecord}
        keywords={detail.keywords}
        groupOptions={detail.groupOptions}
        access_token={detail.access_token}
        onCancel={() => {
          detail.setOpenEditKeyword(false)
          detail.setEditingRecord(null)
        }}
        onSubmit={
          detail.handleUpdateKeyword
        }
      />
      <EditGroupKeywordModal
        open={
          detail.openEditGroupKeyword
        }
        record={
          detail.currentGroup
        }
        groups={
          detail.sourceGroups
        }
        access_token={
          access_token
        }
        onSuccess={(updatedGroup) => {
          detail.setGroupDetail(
            (prev) => ({
              ...(prev || {}),
              ...updatedGroup,
            })
          )
        }}
        onCancel={() => {
          detail.setOpenEditGroupKeyword(
            false
          )
        }}
      />

      <div className='mb-3 rounded-lg bg-white p-4 dark:bg-slate-900'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <div className='flex flex-wrap items-center gap-2'>
              <h2 className='m-0 text-base font-semibold text-gray-800 dark:text-slate-200'>
                {detail.currentGroup.nameEn}
              </h2>

              <Tag
                bordered={false}
                className='m-0 rounded-lg border-0 bg-blue-50 px-4 py-1 text-xs font-normal text-[#0958D9] dark:bg-blue-950/50 dark:text-[#0958D9]'
              >
                {detail.currentGroup.nameKh}
              </Tag>
            </div>

            <div className='mt-2 text-xs text-gray-400'>
              Created by{' '}
              {getCreatedByName(
                detail.currentGroup.createdBy
              )}{' '}
              ·{' '}
              {detail.currentGroup.createdAt
                ? dayjs(
                  detail.currentGroup.createdAt
                ).format('YYYY-MM-DD')
                : '-'}
            </div>
          </div>

          <Dropdown
            menu={groupActionMenu}
            trigger={['click']}
            placement='bottomRight'
          >
            <Button
              type='text'
              shape='circle'
              icon={<MoreOutlined />}
              onClick={(e) => {
                e.preventDefault()
              }}
            />
          </Dropdown>
        </div>
      </div>

      <div className='mb-3 rounded-lg bg-white p-4 dark:bg-slate-900'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <Input
            allowClear
            prefix={
              <SearchOutlined className='text-blue-400' />
            }
            placeholder='search keyword'
            value={detail.search}
            onChange={(e) => {
              detail.setSearch(
                e.target.value
              )
            }}
            className='w-full sm:max-w-md'
          />

          <div className='flex flex-col gap-2 sm:flex-row'>
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={() => {
                detail.handleOpenTransfer(
                  null
                )
              }}
            >
              Transfer Keyword
            </Button>

            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={() => {
                detail.setOpenAddKeyword(
                  true
                )
              }}
            >
              add keyword
            </Button>
          </div>
        </div>
      </div>

      <KeywordGroupDetailTable
        group={detail.currentGroup}
        keywords={
          groupKeywords
        }
        loading={
          detail.detailLoading ||
          groupKeywordsLoading
        }
        currentPage={
          groupKeywordPagination
            ?.page ||
          keywordCurrentPage
        }
        pageSize={
          groupKeywordPagination
            ?.limit ||
          keywordPageSize
        }
        total={
          groupKeywordPagination
            ?.total ||
          0
        }
        onPageChange={
          handleKeywordPageChange
        }
        onEdit={
          detail.handleOpenEdit
        }
        onRemove={
          handleRemoveKeywordFromGroup
        }
        onDelete={
          detail.handleDeleteKeyword
        }
      />
    </div>
  )
}

export default KeywordGroupDetail