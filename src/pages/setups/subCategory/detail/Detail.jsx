import React, { useContext, useEffect, useState, useRef } from 'react'
import { Col, Form, Row, Button, Card, Breadcrumb, Tabs, Tooltip } from 'antd'
import {
  HomeOutlined,
  AppstoreOutlined,
  EditOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { AuthContext } from '../../../../contexts/AuthContext'
import helpFunctions from '../../../../utils/helpFunctions'

import EditSubCategory from '../Edit'
import { PERMS } from '../../../../constants/permission/perms'

//  zustand store (use selectors to avoid unstable rerenders)
import useSubCategoryStore from '../../../../Stores/setups/subCategory.store'

const CategoryDetail = ({ open, setOpen }) => {
  const navigate = useNavigate()
  const { setDisplayEmitContent } = useOutletContext()
  const { id } = useParams()

  const { access_token, checkPermission } = useContext(AuthContext)
  const { getFileImage } = helpFunctions

  //  selectors (important)
  const fetchSubCategoryById = useSubCategoryStore((s) => s.fetchSubCategoryById)
  const storeSubCategory = useSubCategoryStore((s) => s.subCategory)
  const loadingDetail = useSubCategoryStore((s) => s.loadingDetail)

  const [clickedKey, setClickedKey] = useState('1')
  const [openEdit, setOpenEdit] = useState(false)
  const fetchedRef = useRef(false)
  // keep your local states (same concept)
  const [subCategory, setSubCategory] = useState()
  const [category, setCategory] = useState()

  //CHECK PERMISSION
  useEffect(() => {
    if (!checkPermission(PERMS.SUB_CATEGORY_MANAGEMENT)) {
      navigate('/', { replace: true })
    }
  }, [checkPermission, navigate])

  if (!checkPermission(PERMS.SUB_CATEGORY_MANAGEMENT)) {
    return null
  }
  //END CHECK PERMISSION

  const handleBack = () => {
    navigate('/sub-category')
  }

  useEffect(() => {
    setDisplayEmitContent(
      <div className='flex justify-between my-2'>
        <div className='font-semibold text-gray-700 flex items-center'>
          <div
            className='flex items-center space-x-1'
            style={{ color: '#495057' }}
          >
            <Button
              style={{ width: '40px', color: 'red' }}
              icon={<ArrowLeftOutlined />}
              onClick={() => handleBack()}
            />
            <p>Sub Category Detail</p>
          </div>
        </div>
        <Breadcrumb
          items={[
            { title: <HomeOutlined style={{ cursor: 'pointer' }} /> },
            { title: 'Sub Category' },
            { title: 'Detail' },
          ]}
        />
      </div>
    )
  }, [setDisplayEmitContent, navigate])
  useEffect(() => {
    if (!access_token || !id) return
    if (openEdit) return //  prevent extra requests when you click Edit
    if (fetchedRef.current) return
    fetchedRef.current = true
    fetchSubCategoryById({ access_token, _id: id })
  }, [access_token, id, fetchSubCategoryById])
  //  sync storeSubCategory -> local state
  useEffect(() => {

    if (storeSubCategory) {
      setSubCategory(storeSubCategory)
    }
  }, [storeSubCategory])


  //  FIX: depend on categoryId
  useEffect(() => {
    if (!access_token) return
    if (!subCategory?.categoryId) return
  }, [access_token, subCategory?.categoryId])

  const onEdit = () => {
    setOpenEdit(true)
  }

  const tabItems = [
    {
      key: '1',
      label: (
        <span className='text-gray-500 font-medium'>
          <AppstoreOutlined style={{ marginRight: '8px' }} /> Description
        </span>
      ),
      children: (
        <Card className='p-4'>
          <p className='text-gray-600'>
            {subCategory?.description !== 'undefined' ? subCategory?.description : ''}
          </p>
        </Card>
      ),
    },
  ]

  return (
    <>
      {openEdit === true ? (
        <EditSubCategory
          open={openEdit}
          setOpen={setOpenEdit}
          access_token={access_token}
          propData={subCategory}
          getFileImage={getFileImage}
        />
      ) : (
        ''
      )}

      <Card className='my-2' loading={loadingDetail}>
        <div className='flex items-center'>
          <img
            alt='avatar'
            src={subCategory?.images?.find((img) => img.includes('original'))}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '5px',
              objectFit: 'cover',
            }}
          />
          <div className='ml-2'>
            <h2 className='font-bold text-2xl'>{subCategory?.nameEn}</h2>
            <p className='text-sm text-gray-600'>{subCategory?.nameKh}</p>
          </div>

          {checkPermission(PERMS.ASSIGNED_USER) ? (
            <Button
              onClick={() => onEdit()}
              type='default'
              icon={<EditOutlined />}
              className='ml-auto'
            />
          ) : (
            ' '
          )}
        </div>
      </Card>

      <Card className='my-2'>
        <Tabs
          activeKey={clickedKey}
          items={tabItems}
          onChange={(key) => setClickedKey(key)}
        />
      </Card>
    </>
  )
}

export default CategoryDetail
