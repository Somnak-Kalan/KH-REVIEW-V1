import React from 'react'

import { Card, Tag } from 'antd'
import dayjs from 'dayjs'

import {
    stripHashtagsFromDescription,
    renderStatusTag,
} from './_moment.helpers'

import { MomentEngagement } from './_moment.engagement'

import { MomentActionMenu } from './_moment.action'


const images = []



export const MomentCardItem = ({

    item,

    index,

    onView,

    onEdit,

    onDelete,

    onApprove,

    onAddMention,

    onHide,

    filterStatus,

    onActive,

}) => {



    const stopEvent = (e) => {

        e?.preventDefault?.()

        e?.stopPropagation?.()

    }



    const imageUrl =

        item?.cover?.url ||

        item?.media?.[0]?.url ||

        images[index % images.length] ||

        ''



    const titleText =

        item?.title?.length > 45

            ? `${item.title.slice(0, 45)}...`

            : item?.title || ''



    const descriptionText =

        item?.description

            ? item.description.length > 55

                ? stripHashtagsFromDescription(
                    item.description.slice(0, 55) + '...'
                )

                : stripHashtagsFromDescription(
                    item.description
                )

            : ''



    const isUnderReviewTab =

        String(filterStatus || '')
            .toLowerCase() === 'under_review'





    return (

        <Card


            variant="borderless"


            className="cursor-pointer"



            onClick={(e) => {

                stopEvent(e)

                onView?.(item)

            }}



            style={{

                width: '100%',

                borderRadius: 8,

                overflow: 'hidden',

                boxShadow:
                    '0 1px 6px rgba(0,0,0,0.12)',

                background: '#fff',

            }}



            styles={{

                body: {

                    padding: 8,

                    display: 'flex',

                    flexDirection: 'column',

                    gap: 6,

                },

            }}





            cover={


                <div


                    onClick={stopEvent}


                    onMouseDown={stopEvent}


                    style={{

                        position: 'relative',

                        width: '100%',

                        height: 125,

                        overflow: 'hidden',

                        background: '#f5f5f5',

                    }}



                >



                    {/* STATUS */}


                    <div


                        style={{

                            position: 'absolute',

                            top: 6,

                            left: 6,

                            zIndex: 3,

                        }}


                    >

                        {
                            renderStatusTag(
                                item?.status,
                                Tag
                            )
                        }


                    </div>




                    {/* ACTION MENU */}


                    <div


                        onClick={stopEvent}


                        onMouseDown={stopEvent}


                        onPointerDown={stopEvent}



                        style={{

                            position: 'absolute',

                            top: 6,

                            right: 6,

                            zIndex: 5,

                            background:
                                'rgba(0,0,0,0.28)',

                            borderRadius: 6,

                            padding: '0 2px',

                        }}


                    >


                        <MomentActionMenu


                            record={item}


                            onView={onView}

                            onApprove={onApprove}

                            onAddMention={onAddMention}

                            onHide={onHide}

                            onEdit={onEdit}

                            onActive={onActive}

                            onDelete={onDelete}


                        />


                    </div>






                    {/* IMAGE */}



                    <div


                        style={{

                            width: '100%',

                            height: 125,

                            overflow: 'hidden',

                            background: '#f5f5f5',

                        }}


                    >



                        <img


                            src={imageUrl}


                            alt="Moment"



                            onClick={(e) => {

                                stopEvent(e)

                                onView?.(item)

                            }}



                            style={{

                                width: '100%',

                                height: '100%',

                                objectFit: 'cover',

                                display: 'block',

                            }}


                        />




                        <div


                            style={{

                                position: 'absolute',

                                inset: 0,

                                background:
                                    'rgba(0,0,0,0.18)',

                                pointerEvents: 'none',

                            }}



                        />


                    </div>



                </div>


            }



        >




            {/* CONTENT */}



            <div

                onClick={(e) => {

                    stopEvent(e)

                    onView?.(item)

                }}

            >



                <div


                    style={{

                        fontSize: 14,

                        lineHeight: 1.15,

                        color: '#5b6472',

                        fontWeight: 500,

                        minHeight: 28,

                        wordBreak: 'break-word',

                    }}



                >



                    {titleText}



                    {

                        descriptionText &&

                        (

                            <>

                                <br />


                                <span

                                    style={{

                                        fontSize: '12px',

                                    }}

                                >

                                    {descriptionText}


                                </span>


                            </>


                        )

                    }



                </div>


            </div>






            {/* DATE */}



            <div


                style={{

                    fontSize: 11,

                    color: '#777',

                    lineHeight: 1.2,

                }}



            >



                <span

                    style={{

                        fontWeight: 700,

                        color: '#666',

                    }}

                >

                    Created At:

                </span>


                {' '}



                {

                    item?.createdAt

                        ?

                        dayjs(item.createdAt)
                            .format(
                                'YYYY-MM-DD HH:mm'
                            )

                        :

                        '-'

                }




                <br />


                by {item?.createdBy || '-'}



            </div>






            {/* ENGAGEMENT */}



            {

                !isUnderReviewTab &&

                (

                    <div

                        onClick={stopEvent}

                    >


                        <MomentEngagement


                            record={item}


                            fontSize={11}


                            gap={6}


                            wrap={false}


                            iconSize={14}


                        />


                    </div>

                )

            }



        </Card>

    )

}





export default MomentCardItem



export const MomentVideoCardItem =
    MomentCardItem