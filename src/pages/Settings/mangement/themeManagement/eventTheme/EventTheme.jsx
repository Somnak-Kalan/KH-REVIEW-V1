import React, {
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react'
import {
    Button,
    Space,
    Table,
} from 'antd'
import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
} from '@ant-design/icons'
import Swal from 'sweetalert2'
import {
    AuthContext,
} from '../../../../../contexts/AuthContext'
import {
    useThemeStore,
} from '../../../../../Stores/settings/theme/theme.store'
import ThemeEmpty from '../components/ThemeEmpty'
import ThemeFormModal from '../components/ThemeFormModal'
import ThemeViewModal from '../components/ThemeViewModal'
import ThemeThumbnail from '../components/ThemeThumbnail'
const normalizeEventTheme = (
    item,
    index
) => {
    return {
        ...item,
        key:
            item?._id ||
            item?.id ||
            index,
        themeName:
            item?.themeName ||
            item?.name ||
            '',
        imageLight:
            item?.imageLight ||
            item?.lightWallpaper ||
            '',
        imageDark:
            item?.imageDark ||
            item?.darkWallpaper ||
            '',
        updatedBy:
            item?.updatedBy?.name ||
            item?.updatedBy ||
            'Admin',
        createdBy:
            item?.createdBy?.name ||
            item?.createdBy ||
            'Admin',
        createdAt:
            item?.createdAt
                ?
                String(item.createdAt)
                    .substring(0, 10)
                :
                '',
    }
}
const EventTheme = (props) => {
    const {
        themes = [],
        loading = false,
        searchValue = '',
    } = props
    const {
        access_token,
    } = useContext(AuthContext)
    const {
        createEventTheme,
        updateEventTheme,
        removeEventTheme,
        saving,
    } = useThemeStore()
    const [
        rows,
        setRows
    ] = useState([])
    const [
        formModal,
        setFormModal
    ] = useState({
        open: false,
        mode: 'add',
        record: null,
    })
    const [
        viewModal,
        setViewModal
    ] = useState({
        open: false,
        record: null,
    })
    useEffect(() => {
        setRows(
            themes.map(
                normalizeEventTheme
            )
        )
    }, [themes])
    const filteredRows = useMemo(() => {
        const keyword =
            searchValue
                .trim()
                .toLowerCase()
        if (!keyword)
            return rows
        return rows.filter(item =>
            item.themeName
                ?.toLowerCase()
                .includes(keyword)
        )
    }, [
        rows,
        searchValue
    ])
    const handleSubmit = async (values) => {
        try {
            const payload = {
                access_token,
                doc: {
                    name:
                        values.themeName,
                    lightWallpaper:
                        values.imageLight,
                    darkWallpaper:
                        values.imageDark,
                }
            }
            if (
                formModal.mode === 'edit'
            ) {
                payload.doc.themeId =
                    formModal.record?._id
                await updateEventTheme(
                    payload
                )
            }
            else {
                await createEventTheme(
                    payload
                )
            }
            await Swal.fire({

                icon: 'success',

                title: 'Success',

                text: 'Event theme saved successfully',

                timer: 1500,
                showConfirmButton: false,

            })
            setFormModal({
                open: false,
                mode: 'add',
                record: null,
            })
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Save Failed',
                text:
                    error?.response?.data?.errors?.[0]
                    ||
                    'Cannot save event theme'
            })
        }
    }
    const handleDelete = async (record) => {
        const confirm = await Swal.fire({
            title: 'Delete Event Theme?',
            text:
                record.themeName,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
            confirmButtonColor: '#dc2626',
        })
        if (!confirm.isConfirmed)
            return
        try {
            await removeEventTheme({
                access_token,
                doc: {
                    _id:
                        record._id
                }
            })
            await Swal.fire({
                icon: 'success',
                title: 'Deleted',
                timer: 1200,
                showConfirmButton: false,
            })
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Delete Failed',
            })
        }
    }
    const columns = [



        {


            title: 'No',


            width: 60,


            align: 'center',


            render: (_, __, index) =>

                index + 1,
        },
        {
            title: 'Image Light',
            render: (_, record) => (
                <ThemeThumbnail
                    src={record?.wallpaper?.light?.url}
                />
            )
        },
        {
            title: 'Image Dark',
            render: (_, record) => (
                <ThemeThumbnail
                    src={record?.wallpaper?.dark?.url}
                />
            )
        },
        {
            title: 'Theme Name',
            dataIndex: 'themeName',
        },

        {

            title: 'Updated By',
            dataIndex: 'updatedBy',
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
        },

        {
            title: 'Action',
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <Space>
                    <Button
                        shape="circle"
                        icon={<EyeOutlined />}
                        onClick={() =>
                            setViewModal({
                                open: true,
                                record,
                            })
                        }
                    />
                    <Button
                        shape="circle"
                        icon={<EditOutlined />}
                        onClick={() =>
                            setFormModal({
                                open: true,
                                mode: 'edit',
                                record,
                            })
                        }
                    />
                    <Button
                        danger
                        shape="circle"
                        icon={<DeleteOutlined />}
                        onClick={() =>
                            handleDelete(record)
                        }
                    />
                </Space>
            )
        }
    ]
    return (
        <>
            {
                filteredRows.length === 0
                    ?
                    <ThemeEmpty
                        description="There are not yet have posts."
                        buttonText="Add Event Theme"
                        onClick={() =>
                            setFormModal({
                                open: true,
                                mode: 'add',
                                record: null,

                            })
                        }
                    />
                    :
                    <Table
                        rowKey="key"
                        loading={loading}
                        columns={columns}
                        dataSource={filteredRows}
                        pagination={false}
                        scroll={{

                            x: 1000
                        }}
                    />
            }
            <ThemeFormModal
                open={formModal.open}
                type="event"
                mode={formModal.mode}
                access_token={access_token}
                targetName={
                    formModal.record?.themeName || ''
                }
                initialValues={{
                    themeName:
                        formModal.record?.themeName || '',
                    imageLight:
                        formModal.record?.imageLight || '',
                    imageDark:
                        formModal.record?.imageDark || '',
                }}
                confirmLoading={saving}
                onCancel={() =>
                    setFormModal({
                        open: false,
                        mode: 'add',
                        record: null,
                    })
                }
                onSubmit={handleSubmit}
            />
            <ThemeViewModal
                open={viewModal.open}
                type="event"
                targetName={
                    viewModal.record?.themeName || ''
                }
                imageLight={
                    viewModal.record?.imageLight
                }
                imageDark={
                    viewModal.record?.imageDark
                }
                onCancel={() =>
                    setViewModal({
                        open: false,
                        record: null,
                    })
                }
            />

        </>
    )
}
export default EventTheme