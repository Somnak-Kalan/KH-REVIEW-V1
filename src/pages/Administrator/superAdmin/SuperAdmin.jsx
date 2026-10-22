import {
    Table
} from 'antd'


import {
    useEffect,
    useState
} from 'react'
import {
    useSuperAdminStore
} from '../../../Stores/AdminUser/SuperAdmin'
const SuperAdmin = ({ access_token }) => {
    const {
        superAdmins,
        loading,
        fetchSuperAdmins
    } = useSuperAdminStore()
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10
    useEffect(() => {

        fetchSuperAdmins({
            access_token: access_token

        })


    }, [])



    const renderNo = (_, __, index) => {

        return (
            (currentPage - 1) * pageSize
            +
            index
            +
            1
        )

    }



    const columns = [


        {
            title: 'No',
            key: 'no',
            width: 60,
            align: 'center',
            render: renderNo
        },


        {
            title: 'Staff Code',
            dataIndex: 'staffCode',
            key: 'staffCode'
        },


        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username'
        },


        {
            title: 'Name',
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
            title: 'Status',
            dataIndex: 'status',
            key: 'status'
        },


        {
            title: 'Created By',
            dataIndex: 'createdBy',
            key: 'createdBy'
        },


        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',

            render: (value) => {

                return new Date(value)
                    .toLocaleDateString()

            }

        }


    ]



    return (

        <Table

            rowKey="_id"

            columns={columns}

            dataSource={superAdmins}

            loading={loading}

            size="small"


            pagination={{

                current: currentPage,

                pageSize,

                total: superAdmins.length,


                onChange: (page) => {

                    setCurrentPage(page)

                },


                showSizeChanger: false

            }}


            scroll={{
                x: 'max-content'
            }}

        />

    )


}


export default SuperAdmin