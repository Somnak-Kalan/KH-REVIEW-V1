import React from 'react'

import { Avatar, Tag } from 'antd'

import { FileImageOutlined } from '@ant-design/icons'

import dayjs from 'dayjs'


import {

    stripHashtagsFromDescription,

    renderStatusTag,

} from './_moment.helpers'


import { MomentEngagement } from './_moment.engagement'


import { MomentActionMenu } from './_moment.action'





const getDisplayName = (value) => {


    if (!value) return ''



    if (typeof value === 'string') {

        return value.trim()

    }



    if (typeof value === 'object') {


        return (

            value?.name ||

            value?.fullName ||

            value?.username ||

            value?.displayName ||

            value?.email ||

            ''

        )

    }



    return ''

}





const getApprovedByName = (record = {}) => {


    const approvedBy =


        getDisplayName(record?.approvedBy) ||


        getDisplayName(record?.approvedByName) ||


        getDisplayName(record?.approval?.approvedBy) ||


        getDisplayName(record?.review?.approvedBy) ||


        getDisplayName(record?.moderation?.approvedBy) ||


        getDisplayName(record?.autoApprovedBy) ||


        getDisplayName(record?.reviewedBy)



    return approvedBy || 'system allow'

}





const getApprovedAt = (record = {}) => {


    return (

        record?.approvedAt ||

        record?.approval?.approvedAt ||

        record?.review?.approvedAt ||

        record?.reviewedAt ||

        record?.moderation?.approvedAt ||

        null

    )

}





const isSystemApproved = (value) => {


    const text = String(value || '')

        .toLowerCase()

        .trim()



    return (

        !text ||

        text === '-' ||

        text === 'system allow' ||

        text === 'system auto allow' ||

        text.includes('system')

    )

}







export const getMomentColumns = ({


    currentPage,

    pageSize,

    filterStatus,


    onView,

    onApprove,

    onAddMention,

    onHide,

    onEdit,

    onActive,

    onDelete,


}) => {



    const stopEvent = (e) => {

        e?.preventDefault?.()

        e?.stopPropagation?.()

    }






    const renderNo = (_, __, index) =>
        (currentPage - 1) * pageSize + index + 1
    const isUnderReviewTab =
        String(filterStatus || '')
            .toLowerCase() === 'under_review'
    const columns = [
        {
            title: 'No',
            width: 50,
            align: 'center',
            render: renderNo,
        },
        {
            title: 'Post Details',
            key: 'post_details',
            render: (_, record) => (
                <div
                    className="flex items-center gap-1"
                    onClick={(e) => {
                        stopEvent(e)
                        onView?.(record)
                    }}
                >
                    <Avatar
                        src={

                            record?.cover?.url ||

                            record?.media?.[0]?.url ||

                            undefined

                        }


                        icon={

                            <FileImageOutlined />

                        }


                        size={40}


                        shape="square"


                        style={{

                            flexShrink: 0,

                        }}

                    />
                    <div


                        className="leading-tight cursor-pointer hover:text-blue-500"


                        style={{

                            marginLeft: 2,

                        }}


                    >



                        <p


                            className="m-0 p-0 cursor-pointer font-bold text-blue-800 hover:underline"


                        >



                            {

                                record?.title?.length > 40


                                    ?


                                    record.title.slice(0, 40) + '...'


                                    :


                                    record?.title || ''

                            }



                        </p>







                        {

                            record?.description &&


                            (


                                <p


                                    className="text-xs m-0 p-0 cursor-pointer font-semibold text-gray-500 hover:underline"


                                >



                                    {

                                        record.description.length > 40


                                            ?


                                            stripHashtagsFromDescription(

                                                record.description.slice(0, 40) + '...'

                                            )


                                            :


                                            stripHashtagsFromDescription(

                                                record.description

                                            )

                                    }



                                </p>


                            )


                        }




                    </div>





                </div>


            )


        },







        ...(

            !isUnderReviewTab


                ?


                [


                    {


                        title: 'Engagements',


                        key: 'engagements',


                        render: (_, record) => (

                            <MomentEngagement

                                record={record}

                            />

                        ),


                    }


                ]


                :


                []

        ),







        {


            title: 'Status',


            dataIndex: 'status',


            key: 'status',


            align: 'center',


            render: (status) =>

                renderStatusTag(

                    status,

                    Tag

                ),


        },







        {


            title: 'Hashtags',


            dataIndex: 'hashtags',


            key: 'hashtags',


            align: 'center',


            render: (hashtags) => (

                Array.isArray(hashtags)

                    ?

                    hashtags.length

                    :

                    0

            ),

        },







        {


            title: 'Created At',


            dataIndex: 'createdAt',


            key: 'createdAt',



            render: (_, record) => (


                <>


                    <p

                        className="m-0 p-0"

                    >

                        by {

                            record?.postedBy?.nickname ||

                            '-'

                        }


                    </p>




                    <p

                        className="m-0 p-0"

                    >


                        {

                            record?.createdAt

                                ?

                                dayjs(record.createdAt)

                                    .format(

                                        'YYYY-MM-DD HH:mm:ss A'

                                    )


                                :

                                '-'

                        }



                    </p>



                </>


            )



        },
        {


            title: 'Approved By',


            dataIndex: 'approvedBy',


            key: 'approvedBy',




            render: (_, record) => {


                const status = String(record?.status || '')

                    .toLowerCase()

                    .trim()





                const isUnderReview =


                    status === 'under_review' ||

                    status === 'under review' ||

                    status === 'review' ||

                    status === 'pending'





                if (isUnderReview) {


                    return null


                }






                const approvedByName =

                    getApprovedByName(record)





                const approvedAt =

                    getApprovedAt(record)





                const systemApproved =

                    isSystemApproved(

                        approvedByName

                    )





                return (


                    <div>



                        <p

                            className="m-0 p-0 text-blue-800"

                        >


                            {

                                systemApproved

                                    ?

                                    'system allow'

                                    :

                                    approvedByName

                            }



                        </p>







                        {


                            !systemApproved && approvedAt

                                ?


                                <p

                                    className="m-0 p-0 text-blue-800"

                                >


                                    {

                                        dayjs(approvedAt)

                                            .format(

                                                'YYYY-MM-DD HH:mm:ss A'

                                            )

                                    }



                                </p>


                                :


                                null


                        }




                    </div>


                )



            },


        },









        {



            title:

                <span className="table-header">

                    Action

                </span>,



            dataIndex: 'action',



            key: 'action',



            align: 'center',



            width: 80,






            render: (_, record) => (



                <div


                    className="flex justify-center"



                    onClick={(e) => {


                        e.preventDefault()

                        e.stopPropagation()


                    }}



                    onMouseDown={(e) => {


                        e.preventDefault()

                        e.stopPropagation()


                    }}



                >



                    <MomentActionMenu



                        record={record}



                        onView={onView}



                        onApprove={onApprove}



                        onAddMention={onAddMention}



                        onHide={onHide}



                        onEdit={onEdit}



                        onActive={onActive}



                        onDelete={onDelete}



                        showWhiteIcon={true}



                    />



                </div>


            ),



        },



    ]





    return columns


}






export const getMomentVideoColumns =

    getMomentColumns