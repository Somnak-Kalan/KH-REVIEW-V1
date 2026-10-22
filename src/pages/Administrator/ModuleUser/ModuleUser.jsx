import {
  useEffect,
  useState,
} from 'react'


import {
  CaretRightOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'


import {
  Select,
  Table,
  Collapse,
  Divider,
  Row,
  Col,
} from 'antd'


import {
  usePermissionStore
} from '../../../Stores/AdminUser/ModuleUser'





const ModuleUser = ({ access_token }) => {



  const {

    modules,
    permissions,
    users,

    fetchModules,
    fetchPermissions,
    fetchModuleUsers,

  } = usePermissionStore()





  const [moduleId, setModuleId] = useState(null)


  const [currentPage, setCurrentPage] = useState(1)


  const pageSize = 10


  const [loading, setLoading] = useState(false)





  // ============================
  // Load Module + Permission
  // ============================

  useEffect(() => {


    fetchModules({

      access_token

    })


    fetchPermissions({

      access_token

    })


  }, [])






  // ============================
  // Change Module
  // ============================


  const handleChangeModule = async (value) => {


    setModuleId(value)


    setCurrentPage(1)


    try {


      setLoading(true)



      await fetchModuleUsers({

        access_token,

        moduleId: value

      })



    } finally {


      setLoading(false)


    }


  }







  // ============================
  // Table Column
  // ============================


  const columns = [



    {

      title: 'No',

      width: 50,

      align: 'center',

      render: (_, __, index) => (
        (currentPage - 1)
        *
        pageSize
        +
        index
        +
        1
      )

    },



    {

      title: 'Username',

      dataIndex: 'username',

      key: 'username',

      render: (value) => (

        <span className="text-blue-500 cursor-pointer">

          {value}

        </span>

      )

    },



    {

      title: 'Staff Code',

      dataIndex: 'staffCode',

      key: 'staffCode'

    },



    {

      title: 'Full Name',

      dataIndex: 'fullName',

      key: 'fullName'

    },



    {

      title: 'Department',

      dataIndex: 'departmentTitle',

      key: 'departmentTitle'

    },



    {

      title: 'Position',

      dataIndex: 'positionTitle',

      key: 'positionTitle'

    },



    {

      title: 'Created By',

      dataIndex: 'createdBy',

      key: 'createdBy'

    },



    {

      title: 'Created Date',

      dataIndex: 'createdAt',

      key: 'createdAt',

      render: (value) =>

        value

          ?

          new Date(value)
            .toISOString()
            .split('T')[0]

          :

          '-'

    },



    {

      title: 'Status',

      dataIndex: 'status',

      key: 'status',

      render: (status) => (


        <span

          className={

            status === 'Active'

              ?

              'bg-green-500 text-white px-2 rounded'

              :

              'bg-red-500 text-white px-2 rounded'

          }

        >

          {status}

        </span>


      )


    }



  ]










  return (

    <>



      {/* =========================
    Module Select
========================= */}


      <div className="flex justify-end mb-4">


        <Select


          style={{

            width: 400

          }}


          placeholder="Select Module"


          value={moduleId}


          options={

            modules?.map(item => (

              {

                label: item.label,

                value: item.value

              }

            ))

          }


          onChange={handleChangeModule}


        />


      </div>







      {/* =========================
    Permission
========================= */}



      <Collapse

        className="mb-5"

        accordion

        expandIcon={({ isActive }) => (

          <CaretRightOutlined

            rotate={
              isActive ? 90 : 0
            }

          />

        )}

        size="small"


      >


        <Collapse.Panel

          key="1"


          header={

            <strong>

              Permissions

            </strong>

          }


        >



          {

            permissions?.map((item) => (



              <div

                key={item._id}

              >



                <Divider orientation="left">


                  <span className="text-blue-500 font-medium">


                    {item.title}


                  </span>


                </Divider>






                <Row gutter={[8, 16]}>


                  {

                    item.permissions?.map((permission) => (



                      <Col

                        key={permission.value}

                        xs={24}

                        sm={12}

                        md={8}

                        lg={6}


                      >


                        <div className="flex items-center">


                          <CheckCircleOutlined />


                          <span className="mx-2">


                            {permission.label}


                          </span>



                        </div>



                      </Col>



                    ))


                  }



                </Row>




              </div>



            ))


          }




        </Collapse.Panel>


      </Collapse>









      {/* =========================
    User Table
========================= */}



      <Table


        rowKey="_id"


        columns={columns}


        dataSource={users || []}


        loading={loading}


        size="small"


        pagination={{

          current: currentPage,

          pageSize,

          total: users?.length || 0,

          showSizeChanger: false,


          onChange: (page) => {


            setCurrentPage(page)


          }


        }}


        scroll={{

          x: 'max-content'

        }}



      />



    </>


  )


}


export default ModuleUser