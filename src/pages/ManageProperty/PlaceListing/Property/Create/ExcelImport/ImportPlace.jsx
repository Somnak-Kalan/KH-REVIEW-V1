import { HomeOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons'
import { Breadcrumb, Button } from 'antd'
import React, { useEffect, useRef } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import ImportComponent from './Import'
export default function ImportPlace() {
  const { setDisplayEmitContent } = useOutletContext()
  const navigate = useNavigate()
  const excelImportRef = useRef(null)

  const handleParentClick = () => {
    if (excelImportRef.current) {
      excelImportRef.current.triggerFileUpload()
    }
  }
  useEffect(() => {
    setDisplayEmitContent(
      <div className='flex justify-between my-3'>
        <div className=' flex'>
          <div className='flex'>
            <Breadcrumb
              items={[
                { title: <HomeOutlined style={{ cursor: 'pointer' }} /> },
                { title: <span>Place</span> },
                { title: <span>Import</span> },
              ]}
            />
          </div>
        </div>
      </div>
    )
  }, [navigate])
  return (
    <>
      <div className='mt-1 px-5 py-4 bg-white rounded-lg border-l-4 border-blue-500'>
        <div className='sm:flex justify-between items-center'>
          <div className='w-full md:w-full 2xl:w-5/6 sm:mx-1 md:mx-0 '>
            <div className=''></div>
            {/* Render a separate filter icon */}
          </div>
          <div className='flex space-x-1'>
            <div className=''>
              <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={handleParentClick}
              >
                Import
              </Button>
            </div>
            <div className=' '>
              <Button
                disabled={excelImportRef === null}
                type='primary'
                icon={<SaveOutlined />}
                onClick={handleParentClick}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className='my-2'>
        <ImportComponent ref={excelImportRef} />
      </div>
    </>
  )
}
