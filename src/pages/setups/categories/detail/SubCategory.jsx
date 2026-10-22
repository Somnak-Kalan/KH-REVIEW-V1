import {
  Avatar,
  Breadcrumb,
  Button,
  Table,
  Tooltip,
} from 'antd'

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  useNavigate,
  useOutletContext,
} from 'react-router-dom'


import {
  EyeOutlined,
  HomeOutlined,
  SortAscendingOutlined,
} from '@ant-design/icons'


import dayjs from 'dayjs'


import ImageLoading from '../../../../components/Loading/ImageLoading'


import TypeFilterOnly from '../../../../components/Filter/setup/TypeFilter'


import TableHeader from '../../../../widgets/TableHeader'

import useCategoryStore from '../../../../Stores/setups/category.store'
import ReorderModal from '../Modal/ReorderModal'

import ReorderIcon from '../../../../assets/icon/setting/general/Reorder.svg'
const isValidValue = (value) => {

  return (
    value !== undefined &&
    value !== null &&
    value !== 'undefined' &&
    value !== 'null'
  )

}





const getImageUrl = (images) => {

  if (!images)
    return ''


  if (typeof images === 'string')
    return images



  return (
    images?.original ||
    images?.url ||
    images?.path ||
    ''
  )

}



const CategoryImage = ({
  src,
  label,
}) => {

  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
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
          !loaded &&
          !error &&
          src &&

          <div

            style={{

              position: 'absolute',

              inset: 0,

              display: 'flex',

              justifyContent: 'center',

              alignItems: 'center',

              zIndex: 1,

              background: '#f3f4f6'

            }}

          >

            <ImageLoading

              overlay={false}

              size={18}

              logoSize={8}

            />


          </div>

        }







        {
          src && !error

            ?

            <img

              src={src}

              alt={label}


              onLoad={() => {

                setLoaded(true)

              }}



              onError={() => {

                setError(true)

                setLoaded(true)

              }}



              style={{

                width: '100%',

                height: '100%',

                objectFit: 'contain',

                padding: 4,

                opacity: loaded ? 1 : 0,

                transition: 'opacity .2s ease'

              }}

            />


            :

            <span

              className="
              text-xs
              text-gray-400
            "

            >

              N/A

            </span>

        }



      </div>


    </Tooltip>

  )

}
const SubCategoryList = (props) => {
  const {
    isConfirmDelete,
    subCategory,
    access_token,
  } = props
  // const {
  //   isConfirmDelete,
  //   subCategory,
  // } = props




  const navigate = useNavigate()



  const {
    setDisplayEmitContent,
  } = useOutletContext()





  const [
    userList,
    setUserList,
  ] = useState([])



  const [
    currentPage,
    setCurrentPage,
  ] = useState(1)



  const [
    pageSize,
    setPageSize,
  ] = useState(10)



  const [
    loading,
    setLoading,
  ] = useState(true)




  const [
    search,
    setSearch,
  ] = useState('')





  const [
    openReorder,
    setOpenReorder,
  ] = useState(false)





  useEffect(() => {


    setLoading(false)

    setUserList(
      subCategory || []
    )


  }, [
    subCategory
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

          Sub Category

        </div>



        <Breadcrumb

          items={[

            {
              title:
                <HomeOutlined />
            },

            {
              title: 'Sub Category'
            }

          ]}

        />


      </div>


    )


  }, [
    setDisplayEmitContent
  ])


  const reorderSubCategory =
    useCategoryStore(
      state => state.reorderSubCategory
    )




  const handleView =
    useCallback(
      (record) => {


        navigate(
          '/sub-category/detail/' +
          record._id
        )


      },
      [
        navigate
      ]
    )






  const renderNo =
    useCallback(
      (_, __, index) => {


        return (

          (currentPage - 1)
          *
          pageSize
          +
          index
          +
          1

        )


      },
      [
        currentPage,
        pageSize
      ]
    )




  const handleSaveOrder =
    async (list) => {


      try {


        await reorderSubCategory({

          access_token,

          data: list


        })



        setUserList(list)



      } catch (error) {


        console.error(
          'Reorder sub category error:',
          error
        )


      }


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


          width: 100,


          align: 'center',


          render: (_, record) => {


            const image =
              record?.images?.find(
                img =>
                  img?.includes('original')
              )



            return (

              <div
                className="
                  flex
                  justify-center
                "
              >

                <CategoryImage

                  src={image}

                  label="Sub Category Image"

                />


              </div>

            )

          }


        },





        {


          title:
            <span className="table-header">
              Title
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
                  hover:underline
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
                  hover:underline
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



          render: (_, record) => {


            const description =
              record?.description



            if (
              !isValidValue(description)
            )
              return '-'




            return (


              <Tooltip

                title={description}

              >


                <span

                  className="
                    inline-block
                    truncate
                    max-w-[250px]
                  "

                >

                  {
                    description
                  }


                </span>



              </Tooltip>


            )


          }


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



          width: 80,


          align: 'center',



          hidden: isConfirmDelete,



          render: (_, record) => (


            <div

              className="
                flex
                justify-center
              "

            >


              <Tooltip title="View">


                <Button


                  icon={

                    <EyeOutlined

                      style={{
                        color: 'green'
                      }}

                    />

                  }


                  shape="circle"


                  size="small"



                  onClick={() => handleView(record)}



                />


              </Tooltip>


            </div>


          )


        }


      ],


      [

        renderNo,

        handleView

      ]


    )






  const pagination = {


    current: currentPage,


    pageSize,


    total: userList?.length || 0,



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

  }


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
            className="w-full"
          >


            <TypeFilterOnly

              typeFilter={setSearch}

            />


          </div>




          <Button


            type="default"



            icon={
              <img

                src={ReorderIcon}

                alt="Reorder"

                style={{

                  width: 22,

                  height: 28,

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



      </div>







      <ReorderModal


        open={openReorder}


        setOpen={setOpenReorder}



        title="Reorder Sub Category"



        data={userList}



        onSave={handleSaveOrder}


      />








      <TableHeader


        total={
          userList?.length || 0
        }


        label="Total Amount"



      >




        <div

          style={{
            position: 'relative'
          }}

        >



          {
            loading

              ?

              <div

                style={{

                  position: 'absolute',

                  inset: 0,

                  zIndex: 10,

                  display: 'flex',

                  justifyContent: 'center',

                  alignItems: 'center',

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

              record?._id ||
              record?.id ||
              record?.key

            }



            columns={columns}



            dataSource={
              userList
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



export default SubCategoryList


