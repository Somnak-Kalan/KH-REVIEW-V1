import React, { useContext, useState } from 'react'
import { Avatar, Button, Dropdown, Tag, Tooltip } from 'antd'

import dayjs from 'dayjs'
import { PERMS } from '../../../../constants/permission/perms'
import { AuthContext } from '../../../../contexts/AuthContext'

export default function getTableColumns(
  currentPage,
  pageSize,
  handleView,
  onEditNonBusiness
) {
  const { username, access_token, checkPermission } = useContext(AuthContext)
  const canEdit = checkPermission(PERMS.ASSIGNED_USER)
  return [
    {
      title: 'No',
      key: 'no',
      align: 'center',
      render: (_text, _record, index) => {
        return (currentPage - 1) * pageSize + index + 1
      },
    },
    {
      title: 'Place ID',
      dataIndex: 'placeId',
      key: 'placeId',
      align: 'center',
    },
    {
      title: 'Status',
      key: 'status',
      align: 'center',
      width: 110,
      render: (_, record) =>
        canEdit ? (
          <Tag
            // visual
            style={{
              background: canEdit ? 'gray' : 'gray', // greyed-out
              color: '#fff',
              borderRadius: 20,
              cursor: canEdit ? 'pointer' : 'not-allowed',
              pointerEvents: canEdit ? 'auto' : 'none', // 🔒 really disables click
            }}
            // only wire the handler when allowed
            {...(canEdit && { onClick: () => onEditNonBusiness(record) })}
          >
            Set&nbsp;Up
          </Tag>
        ) : (
          ''
        ),
    },

    {
      title: 'Property Profile',
      key: 'property_profile',
      align: 'center',
      render: (_, record) => (
        <div className='flex items-center'>
          <div className='flex flex-col items-start leading-[1.05]'>
            <p className='m-0 p-0 my-2 font-bold text-gray-700 '>
              {record?.nameEn}
            </p>
            <p className='m-0 p-0 font-semibold text-gray-500 '>
              {record?.nameKh}
            </p>
          </div>
        </div>
      ),
    },

    {
      title: 'Ownership',
      dataIndex: 'ownership',
      key: 'ownership',
      align: 'center',
    },
    {
      title: 'Category',
      dataIndex: 'mainCategory',
      key: 'mainCategory',
      align: 'center',
    },
    {
      title: 'Sub Category',
      dataIndex: 'subCategory',
      key: 'subCategory',
      align: 'center',
      render: (subCategory) => {
        // If it's a valid array
        if (Array.isArray(subCategory) && subCategory?.length > 0) {
          return subCategory?.join(', ')
        }

        // If it's a string
        if (typeof subCategory === 'string' && subCategory?.trim() !== '') {
          return subCategory
        }

        // Otherwise, fallback
        return '-'
      }
    },

    {
      title: 'Type Of Place',
      dataIndex: 'typeOfPlace',
      key: 'typeOfPlace',
      align: 'center',
      render: (typeOfPlace) => {
        // Check if it's an array first
        if (Array.isArray(typeOfPlace) && typeOfPlace?.length > 0) {
          return typeOfPlace?.join(', ')
        }

        // If it's a string (just in case)
        if (typeof typeOfPlace === 'string' && typeOfPlace?.trim() !== '') {
          return typeOfPlace
        }

        // Fallback for anything else
        return '-'
      }
    }
    ,
    {
      title: 'Open Day',
      dataIndex: 'openDay',
      key: 'openDay',
      align: 'center',
    },
    {
      title: 'Open Time',
      dataIndex: 'openTime',
      key: 'openTime',
      align: 'center',
    },
    {
      title: 'Close Time',
      dataIndex: 'closeTime',
      key: 'closeTime',
      align: 'center',
    },
    {
      title: 'City/Province',
      dataIndex: 'city',
      key: 'city',
      align: 'center',
    },
    {
      title: 'District/Khan',
      dataIndex: 'district',
      key: 'district',
      align: 'center',
    },
    {
      title: 'Commune/Sangkat',
      dataIndex: 'commune',
      key: 'commune',
      align: 'center',
    },
    {
      title: 'Created By',
      dataIndex: 'createdBy',
      key: 'createdBy',
      align: 'center',
      sorter: (a, b) =>
        String(a['Created By']).localeCompare(String(b['Created By'])),
      sortDirections: ['ascend', 'descend'],
      className: 'column-sort', // add this
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',

      sorter: (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      sortDirections: ['ascend', 'descend'],
      className: 'column-sort', // add this
      render: (val) => dayjs(val).format('YYYY-MM-DD'),
    },
  ]
}
