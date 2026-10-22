import {
  Breadcrumb,
  Button,
  Table,
  Tooltip,
} from 'antd'

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
  useOutletContext,
} from 'react-router-dom'


import {
  EditOutlined,
  EyeOutlined,
  HomeOutlined,
  PlusOutlined,
  SortAscendingOutlined,

} from '@ant-design/icons'


import dayjs from 'dayjs'
import ReorderIcon from '../../../assets/icon/setting/general/Reorder.svg'

import { AuthContext } from '../../../contexts/AuthContext'


import helpFunctions from '../../../utils/helpFunctions'


import ImageLoading from '../../../components/Loading/ImageLoading'


import TypeFilterOnly from '../../../components/Filter/setup/TypeFilter'


import TableHeader from '../../../widgets/TableHeader'


import { PERMS } from '../../../constants/permission/perms'


import useCategoryStore from '../../../Stores/setups/category.store'


import AddCategory from './Add'


import EditCategory from './Edit'


import ReorderModal from './Modal/ReorderModal'



const isValidValue = (value) => {

  return (
    value !== undefined &&
    value !== null &&
    value !== 'undefined' &&
    value !== 'null'
  )

}



const getRawImageUrl = (image) => {

  if (!image)
    return ''


  if (typeof image === 'string')
    return image



  return (
    image?.original ||
    image?.url ||
    image?.path ||
    ''
  )

}


const CategoryImage = ({
  src,
  label,
}) => {

  const [
    loaded,
    setLoaded,
  ] = useState(false)


  const [
    error,
    setError,
  ] = useState(false)



  useEffect(() => {

    setLoaded(false)

    setError(false)

  }, [src])



  return (

    <Tooltip title={label}>


      <div

        style={{

          width: 42,

          height: 42,

          borderRadius: 8,

          overflow: 'hidden',

          background: '#f3f4f6',

          border: '1px solid #e5e7eb',

          display: 'flex',

          justifyContent: 'center',

          alignItems: 'center',

          position: 'relative',

        }}

      >


        {
          src && !loaded && !error

            ?

            <div

              style={{

                position: 'absolute',

                inset: 0,

                display: 'flex',

                justifyContent: 'center',

                alignItems: 'center',

                zIndex: 1,

              }}

            >

              <ImageLoading

                overlay={false}

                size={18}

                logoSize={8}

              />

            </div>

            :

            null

        }



        {
          src && !error

            ?

            <img

              src={src}

              alt={label}

              onLoad={() => setLoaded(true)}

              onError={() => setError(true)}

              style={{

                width: '100%',

                height: '100%',

                objectFit: 'contain',

                padding: 4,

                opacity: loaded ? 1 : 0,

              }}

            />

            :

            <span
              className="text-xs text-gray-400"
            >
              N/A
            </span>

        }


      </div>


    </Tooltip>

  )

}



const CategoryList = () => {


  const {
    access_token,
    checkPermission,
  } = useContext(AuthContext)



  const {
    setDisplayEmitContent,
  } = useOutletContext()



  const navigate = useNavigate()



  const categories =
    useCategoryStore(
      state => state.categories
    )


  const loadingList =
    useCategoryStore(
      state => state.loading
    )



  const fetchCategory =
    useCategoryStore(
      state => state.fetchCategory
    )

  const reorderCategory =
    useCategoryStore(
      state => state.reorderCategory
    )


  const {
    getFileImage,
  } = helpFunctions



  const [
    currentPage,
    setCurrentPage,
  ] = useState(1)



  const [
    pageSize,
    setPageSize,
  ] = useState(10)



  const [
    search,
    setSearch,
  ] = useState('')



  const [
    openAdd,
    setOpenAdd,
  ] = useState(false)



  const [
    openEdit,
    setOpenEdit,
  ] = useState(false)



  const [
    openReorder,
    setOpenReorder,
  ] = useState(false)



  const [
    propData,
    setPropData,
  ] = useState(null)



  const [
    ,
    setLoading,
  ] = useState(false)




  const canManageCategory =
    useMemo(
      () => checkPermission?.(
        PERMS.CATEGORY_MANAGEMENT
      ),
      [
        checkPermission
      ]
    )



  const canEdit =
    useMemo(
      () => checkPermission?.(
        PERMS.ASSIGNED_USER
      ),
      [
        checkPermission
      ]
    )



  const getCategoryImageUrl =
    useCallback(
      (image) => {

        const raw =
          getRawImageUrl(image)



        if (!raw)
          return ''



        if (
          raw.startsWith('http')
        )
          return raw



        return getFileImage(raw)

      },
      [
        getFileImage
      ]
    )



  const handleView =
    useCallback(
      (record) => {

        if (!record?._id)
          return


        navigate(
          `/category/detail/${record._id}/subcategory`
        )

      },
      [
        navigate
      ]
    )



  const handleEdit =
    useCallback(
      (record) => {

        setPropData(record)

        setOpenEdit(true)

      },
      []
    )
  const renderNo =
    useCallback(
      (_, __, index) => {

        return (
          (currentPage - 1) *
          pageSize +
          index +
          1
        )

      },
      [
        currentPage,
        pageSize,
      ]
    )



  const renderDescription =
    useCallback(
      (_, record) => {

        const text =
          record?.description



        if (!isValidValue(text))
          return '-'



        if (
          String(text).length <= 50
        ) {

          return text

        }



        return (

          <Tooltip
            title={text}
          >

            <span
              className="
                truncate
                inline-block
                max-w-[260px]
              "
            >
              {text}
            </span>


          </Tooltip>

        )

      },
      []
    )




  useEffect(() => {

    if (
      canManageCategory === false
    ) {

      navigate(
        '/',
        {
          replace: true
        }
      )

    }


  }, [
    canManageCategory,
    navigate
  ])




  useEffect(() => {

    setDisplayEmitContent(

      <div
        className="
          flex
          justify-between
          my-3
        "
      >

        <div
          className="
            font-semibold
            text-gray-700
          "
        >

          Category

        </div>


        <Breadcrumb

          items={[
            {
              title:
                <HomeOutlined />
            },

            {
              title: 'Category'
            }

          ]}

        />


      </div>

    )


  }, [
    setDisplayEmitContent
  ])





  useEffect(() => {


    if (
      canManageCategory !== true
    )
      return



    if (!access_token)
      return



    const timer =
      setTimeout(() => {


        fetchCategory({

          access_token,

          doc: {
            search
          }

        })


      }, 300)



    return () => clearTimeout(timer)


  }, [
    access_token,
    search,
    fetchCategory,
    canManageCategory
  ])
  const handleSaveOrder = async (list) => {


    console.log(
      'CATEGORY REORDER LIST:',
      list
    )


    return await reorderCategory({

      access_token,

      data: list

    })


  }

  const columns =
    useMemo(
      () => [


        {
          title:
            <span className="table-header">
              No
            </span>,

          width: 60,

          align: 'center',

          render: renderNo

        },



        {

          title:
            <span className="table-header">
              Image
            </span>,


          width: 130,


          align: 'center',


          render: (_, record) => {

            console.log(record, 'recore');

            return (

              <div
                className="
                  flex
                  justify-center
                  gap-2
                "
              >
                <CategoryImage

                  src={
                    getCategoryImageUrl(
                      record?.icon2d
                    )
                  }
                  label="2D Icon"

                />
                <CategoryImage

                  src={
                    getCategoryImageUrl(
                      record?.icon3d
                    )
                  }
                  label="3D Icon"

                />


              </div>

            )

          }

        },



        {


          title:
            <span className="table-header">
              Category
            </span>,


          render: (_, record) => (


            <div

              onClick={() =>
                handleView(record)
              }

              className="
                cursor-pointer
              "

            >


              <div

                className="
                  font-semibold
                  text-blue-800
                "

              >

                {
                  record?.nameEn || '-'
                }


              </div>



              <div

                className="
                  text-xs
                  text-gray-500
                  font-bold
                "

              >

                {
                  record?.nameKh || ''
                }


              </div>


            </div>


          )


        },



        {


          title:
            <span className="table-header">
              Description
            </span>,
          width: 280,
          align: 'center',
          render: renderDescription


        },



        {
          title:
            <span className="table-header">
              Created By
            </span>,
          align: 'center',
          render: (_, record) =>

            isValidValue(record?.createdBy)
              ?
              record?.createdBy
              :
              '-'


        },



        {

          title:
            <span className="table-header">
              Created At
            </span>,

          align: 'center',
          render: (_, record) =>
            record?.createdAt
              ?
              dayjs(record?.createdAt)
                .format(
                  'YYYY-MM-DD'
                )
              :
              '-'


        },



        {

          title:
            <span className="table-header">
              Action
            </span>,


          align: 'center',


          width: 100,


          render: (_, record) => (


            <div
              className="
                flex
                justify-center
              "
            >


              <Tooltip title="View">

                <Button

                  size="small"

                  shape="circle"

                  icon={
                    <EyeOutlined
                      style={{
                        color: 'green'
                      }}
                    />
                  }

                  onClick={() =>
                    handleView(record)
                  }

                />

              </Tooltip>




              {
                canEdit
                  ?

                  <Tooltip title="Edit">

                    <Button

                      size="small"

                      shape="circle"

                      className="ml-2"

                      icon={
                        <EditOutlined />
                      }


                      onClick={() =>
                        handleEdit(record)
                      }

                    />


                  </Tooltip>

                  :

                  null

              }



            </div>


          )

        }


      ],
      [
        renderNo,
        renderDescription,
        getCategoryImageUrl,
        handleView,
        handleEdit,
        canEdit
      ]

    )

  const pagination =
    useMemo(
      () => ({

        current: currentPage,

        pageSize,

        total:
          categories?.length || 0,


        onChange: (page, size) => {

          setCurrentPage(page)

          setPageSize(size)

        },


        showSizeChanger: true,


        pageSizeOptions: [
          '10',
          '20',
          '50',
          '100'
        ]


      }),
      [
        currentPage,
        pageSize,
        categories?.length
      ]
    )




  if (canManageCategory !== true)
    return null




  return (

    <>


      <div
        className="
          mb-2
          px-3
          sm:px-5
          py-4
          bg-white
          rounded-lg
        "
      >


        <div

          className="
            flex
            justify-between
            items-center
            gap-3
          "

        >


          <div
            className="
              w-full
            "
          >

            <TypeFilterOnly

              typeFilter={setSearch}

            />


          </div>



          {

            canEdit

              ?

              <div
                className="
              flex
              items-center
              gap-2
              flex-shrink-0
            "

              >
                <div>
                  <Button

                    icon={

                      <img

                        src={ReorderIcon}

                        alt="Reorder"

                        style={{

                          width: 18,

                          height: 18,

                          display: 'block'

                        }}

                      />

                    }


                    onClick={() =>
                      setOpenReorder(true)
                    }

                  >

                    Reorder

                  </Button>

                </div>


                <div>

                  <Button

                    type="primary"

                    icon={
                      <PlusOutlined />
                    }


                    onClick={() =>
                      setOpenAdd(true)
                    }

                  >

                    Add

                  </Button>
                </div>




              </div>

              :

              null

          }



        </div>


      </div>





      <AddCategory

        open={openAdd}

        setOpen={setOpenAdd}

        access_token={access_token}

        setLoading={setLoading}

      />






      {

        openEdit

          ?

          <EditCategory


            open={openEdit}


            setOpen={setOpenEdit}


            access_token={access_token}


            setLoading={setLoading}


            propData={propData}


            getFileImage={getFileImage}


          />

          :

          null


      }







      <ReorderModal


        open={openReorder}


        setOpen={setOpenReorder}


        data={categories}


        title="Reorder Category"


        onSave={handleSaveOrder}


      />







      <TableHeader

        total={
          categories?.length || 0
        }

        label="Total Amount"

      >




        <div

          style={{
            position: 'relative'
          }}

        >



          {

            loadingList

              ?

              <div

                style={{

                  position: 'absolute',

                  inset: 0,

                  zIndex: 10,

                  display: 'flex',

                  alignItems: 'center',

                  justifyContent: 'center',

                  background:
                    'rgba(255,255,255,.5)'


                }}

              >

                <ImageLoading

                  overlay={false}

                  size={60}

                  logoSize={25}

                />


              </div>

              :

              null

          }






          <Table


            rowKey={(record) =>
              record?._id
            }



            columns={columns}



            dataSource={
              categories || []
            }



            pagination={pagination}



            bordered={false}



            size="small"



            scroll={{
              x: 'max-content'
            }}



            loading={false}



            className="
              custom-table-category
            "



            rowClassName={(_, index) =>

              index % 2 === 0

                ?

                'even-row'

                :

                'odd-row'

            }



          />



        </div>



      </TableHeader>




    </>

  )


}



export default CategoryList