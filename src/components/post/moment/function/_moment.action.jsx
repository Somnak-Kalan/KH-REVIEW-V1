import React from 'react'

import { Button, Dropdown, Tooltip } from 'antd'
import { MoreOutlined } from '@ant-design/icons'

import ViewIcon from '../../../../assets/icon/user/actionIcon/view.svg'
import EditIcon from '../../../../assets/icon/user/actionIcon/edit.svg'
import CrossEyeIcon from '../../../../assets/icon/user/actionIcon/crossEye.svg'
import DeleteIcon from '../../../../assets/icon/user/actionIcon/delete.svg'
import ApproveIcon from '../../../../assets/icon/user/actionIcon/approve.svg'
import ActiveIcon from '../../../../assets/icon/user/actionIcon/active.svg'
import AddMoreMentionIcon from '../../../../assets/icon/user/actionIcon/addMoreMention.svg'

const iconSize = 16


const normalizeStatus = (status) => {

    const value = String(status || '')
        .toLowerCase()
        .trim()


    if (value === 'active') {
        return 'active'
    }


    if (
        value === 'under_review' ||
        value === 'under review' ||
        value === 'review' ||
        value === 'pending'
    ) {
        return 'under_review'
    }


    if (
        value === 'hide' ||
        value === 'inactive'
    ) {
        return 'hide'
    }


    return value
}



const iconImgStyle = (size) => ({
    width: size,
    height: size,
    objectFit: 'contain',
    display: 'block',
    flexShrink: 0,
})



const stopEvent = (e) => {

    e?.preventDefault?.()

    e?.stopPropagation?.()

}



const buildMenuItems = ({
    record,

    onView,
    onApprove,
    onAddMention,
    onHide,
    onEdit,
    onActive,
    onDelete,

    detailPage = false,

}) => {


    const status = normalizeStatus(record?.status)



    const viewItem = detailPage !== true
        ? {
            key: 'view',
            label: 'View post',

            icon:
                <img
                    src={ViewIcon}
                    alt="view"
                    style={iconImgStyle(iconSize)}
                />,

            onClick: () => onView?.(record),

            disabled:
                typeof onView !== 'function',
        }
        : null




    if (status === 'under_review') {


        return [

            ...(viewItem ? [viewItem] : []),


            {

                key: 'approve',

                label: 'Approve post',

                icon:
                    <img
                        src={ApproveIcon}
                        alt="approve"
                        style={iconImgStyle(iconSize)}
                    />,


                onClick: () => {
                    onApprove?.(record)
                },


                disabled:
                    typeof onApprove !== 'function',

            },


            {

                key: 'mention',

                label: 'Add more mention',

                icon:
                    <img
                        src={AddMoreMentionIcon}
                        alt="mention"
                        style={iconImgStyle(iconSize)}
                    />,


                onClick: () => {
                    onAddMention?.(record)
                },


                disabled:
                    typeof onAddMention !== 'function',

            },


            {

                key: 'delete',

                label: 'Delete post',

                icon:
                    <img
                        src={DeleteIcon}
                        alt="delete"
                        style={iconImgStyle(iconSize)}
                    />,


                danger: true,


                onClick: () => {
                    onDelete?.(record)
                },


                disabled:
                    typeof onDelete !== 'function',

            },

        ]

    }




    if (status === 'hide') {


        return [

            ...(viewItem ? [viewItem] : []),


            {

                key: 'active',

                label: 'Active post',

                icon:
                    <img
                        src={ActiveIcon}
                        alt="active"
                        style={iconImgStyle(iconSize)}
                    />,


                onClick: () => {
                    onActive?.(record)
                },


                disabled:
                    typeof onActive !== 'function',

            },



            {

                key: 'delete',

                label: 'Delete post',

                icon:
                    <img
                        src={DeleteIcon}
                        alt="delete"
                        style={iconImgStyle(iconSize)}
                    />,


                danger: true,


                onClick: () => {
                    onDelete?.(record)
                },


                disabled:
                    typeof onDelete !== 'function',

            },

        ]

    }




    return [

        ...(viewItem ? [viewItem] : []),


        {

            key: 'mention',

            label: 'Add more mention',

            icon:
                <img
                    src={AddMoreMentionIcon}
                    alt="mention"
                    style={iconImgStyle(iconSize)}
                />,


            onClick: () => {
                onAddMention?.(record)
            },


            disabled:
                typeof onAddMention !== 'function',

        },



        ...(

            String(record?.postedBy?.username || '')
                .trim()
                .toLowerCase() === 'khreviewofficial'


                ? [

                    {

                        key: 'edit',

                        label: 'Edit post',

                        icon:
                            <img
                                src={EditIcon}
                                alt="edit"
                                style={iconImgStyle(iconSize)}
                            />,


                        onClick: () => {
                            onEdit?.(record)
                        },


                        disabled:
                            typeof onEdit !== 'function',

                    }

                ]


                : []

        ),



        {

            key: 'hide',

            label: 'Hide Post',


            icon:

                <img
                    src={CrossEyeIcon}
                    alt="hide"
                    style={iconImgStyle(iconSize)}
                />,


            onClick: () => {
                onHide?.(record)
            },


            disabled:
                typeof onHide !== 'function',

        },


    ]

}





export const MomentActionMenu = ({

    record,

    onView,
    onApprove,
    onAddMention,
    onHide,
    onEdit,
    onActive,
    onDelete,

    showWhiteIcon = false,

    detailPage = false,

}) => {



    const items = buildMenuItems({

        record,

        onView,
        onApprove,
        onAddMention,
        onHide,
        onEdit,
        onActive,
        onDelete,

        detailPage,

    })





    return (

        <Dropdown
            trigger={['click']}
            placement="bottomRight"
            menu={{
                items: items.map(item => ({
                    key: item.key,
                    icon: item.icon,
                    label: item.label,
                    disabled: item.disabled,
                    danger: item.danger,
                })),

                onClick: ({ key, domEvent }) => {

                    domEvent.stopPropagation()

                    const selected = items.find(
                        item => item.key === key
                    )

                    selected?.onClick?.()

                },
            }}
        >
            <Tooltip title="Action">

                <Button
                    type="text"
                    shape="circle"
                    onClick={(e) => {
                        e.stopPropagation()
                    }}
                    icon={
                        <MoreOutlined
                            rotate={180}
                            style={{
                                fontSize: 20,
                                fontWeight: 'bold',
                                color:
                                    showWhiteIcon
                                        ? '#000043'
                                        : '#3f3f46',
                            }}
                        />
                    }

                    style={{
                        color: '#3f3f46',
                        boxShadow: 'none',
                    }}
                />

            </Tooltip>

        </Dropdown>

    )

}