import React, {
    forwardRef,
    useContext,
    useEffect,
    useImperativeHandle,
    useMemo,
    useState,
    useRef
} from 'react'
import {
    Button,
    Space,
    Table,
} from 'antd'
import {
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
import ThemeFormModal from '../components/ThemeFormModal'
import ThemeViewModal from '../components/ThemeViewModal'
import ThemeThumbnail from '../components/ThemeThumbnail'
import ImgClickIcon from '../../../../../assets/other/ImgClick.svg'
const getName = (value) => {
    if (!value)
        return ''
    if (typeof value === 'string')
        return value
    return (
        value?.name ||
        value?.fullName ||
        value?.username ||
        ''
    )
}
const formatDate = (value) => {
    if (!value)
        return ''
    if (typeof value === 'string')
        return value.substring(0, 10)
    const date = new Date(value)
    if (Number.isNaN(date.getTime()))
        return ''
    return date
        .toISOString()
        .substring(0, 10)
}
const normalizeProvince = (
    item,
    index
) => {
    return {
        ...item,
        key:
            item?.themeId ||
            index,
        themeId:
            item?.themeId || '',
        provinceName:
            item?.provinceEn || '',
        provinceNameKh:
            item?.provinceKh || '',
        imageLight:
            item?.wallpaper?.light?.url || '',
        imageDark:
            item?.wallpaper?.dark?.url || '',
        updatedBy:
            getName(item?.updatedBy)
            ||
            'Admin',
        createdBy:
            getName(item?.createdBy)
            ||
            'Admin',
        createdAt:
            formatDate(
                item?.createdAt
            )
    }
}
const ProvinceTheme = forwardRef((props, ref) => {
    const {
        searchValue = '',
    } = props
    const loaded = useRef(false)
    const {
        access_token,
    } = useContext(AuthContext)
    const provinceThemes = useThemeStore(
        state => state.provinceThemes
    )
    const loadingProvince = useThemeStore(
        state => state.loadingProvince
    )
    const saving = useThemeStore(
        state => state.saving
    )
    const fetchProvinceThemes = useThemeStore(
        state => state.fetchProvinceThemes
    )
    const createAllProvinceTheme = useThemeStore(
        state => state.createAllProvinceTheme
    )
    const updateProvinceTheme = useThemeStore(
        state => state.updateProvinceTheme
    )
    const [rows, setRows] = useState([])
    const [formModal, setFormModal] = useState({
        open: false,
        mode: 'add',
        record: null,
        isAllProvince: false,
    })
    const [viewModal, setViewModal] = useState({
        open: false,
        record: null,
    })
    // ==========================================
    // FETCH PROVINCE THEME
    // ==========================================
    useEffect(() => {
        if (!access_token)
            return
        if (loaded.current)
            return
        loaded.current = true
        fetchProvinceThemes(access_token)
    }, [access_token])
    // ==========================================
    // NORMALIZE DATA
    // ==========================================
    useEffect(() => {
        setRows(
            (provinceThemes || [])
                .map(
                    normalizeProvince
                )
        )
    }, [provinceThemes])
    // ==========================================
    // OPEN ADD ALL PROVINCE
    // ==========================================
    const openAddAllProvince = () => {
        setFormModal({
            open: true,
            mode: 'add',
            record: null,
            isAllProvince: true,
        })
    }
    useImperativeHandle(
        ref,
        () => ({
            openAddAllProvince,
        })
    )
    // ==========================================
    // FILTER SEARCH
    // ==========================================
    const filteredRows = useMemo(() => {
        const keyword =
            searchValue
                .trim()
                .toLowerCase()
        if (!keyword)
            return rows
        return rows.filter(item => {
            return (
                item.provinceName
                    ?.toLowerCase()
                    .includes(keyword)
                ||
                item.provinceNameKh
                    ?.toLowerCase()
                    .includes(keyword)
            )
        })
    }, [
        rows,
        searchValue
    ])
    // ==========================================
    // VIEW
    // ==========================================
    const handleOpenView = (record) => {
        setViewModal({
            open: true,
            record,
        })
    }
    // ==========================================
    // EDIT
    // ==========================================
    const handleOpenEdit = (record) => {
        setFormModal({
            open: true,
            mode: 'edit',
            record,
            isAllProvince: false,
        })
    }
    const handleCloseForm = () => {
        setFormModal({
            open: false,
            mode: 'add',
            record: null,
            isAllProvince: false,
        })
    }
    // ==========================================
    // SAVE
    // ==========================================
    const handleSaveTheme = async (values) => {
        try {
            if (formModal.isAllProvince) {
                await createAllProvinceTheme({
                    access_token,
                    doc: {
                        lightWallpaper:
                            values.imageLight,
                        darkWallpaper:
                            values.imageDark,
                    }
                })
            }
            else {
                await updateProvinceTheme({
                    access_token,
                    doc: {
                        themeId:
                            formModal.record?.themeId,
                        lightWallpaper:
                            values.imageLight,
                        darkWallpaper:
                            values.imageDark,
                    }
                })
            }
            await Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Province theme saved successfully',
                timer: 1500,
                showConfirmButton: false,
            })
            handleCloseForm()
        }
        catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Save failed',
                text:
                    error?.response?.data?.message
                    ||
                    'Cannot save province theme'
            })
        }
    }
    const columns = [
        {
            title: 'No',
            width: 60,
            align: 'center',
            render: (_, __, index) =>
                index + 1
        },
        {
            title: 'Image Light mode',
            dataIndex: 'imageLight',
            width: 150,
            render: (_, record) => (
                <ThemeThumbnail
                    src={record.imageLight}
                />
            )
        },
        {
            title: 'Image dark mode',
            dataIndex: 'imageDark',
            width: 150,
            render: (_, record) => (
                <ThemeThumbnail
                    src={record.imageDark}
                />
            )
        },
        {
            title: 'Province name',
            width: 220,
            render: (_, record) => (
                <div className="theme-name-cell">
                    <div
                        className="
                            font-semibold
                            text-gray-800
                        "
                    >
                        {record.provinceName}
                    </div>
                    {
                        record.provinceNameKh
                        &&
                        <div
                            className="
                                text-xs
                                text-gray-500
                            "
                        >
                            {record.provinceNameKh}
                        </div>
                    }
                </div>
            )
        },
        {
            title: 'Updated By',
            dataIndex: 'updatedBy',
            width: 140,
            align: 'center',
        },
        {
            title: 'Created By',
            dataIndex: 'createdBy',
            width: 140,
            align: 'center',
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            width: 140,
            align: 'center',
        },
        {
            title: 'Action',
            width: 120,
            fixed: 'right',
            align: 'center',
            render: (_, record) => {
                return (
                    <Space size={8}>
                        {/* VIEW */}
                        <Button
                            size="small"
                            shape="circle"
                            className="
                                theme-action-btn
                                theme-action-view
                            "
                            icon={
                                <EyeOutlined />
                            }
                            onClick={() =>
                                handleOpenView(record)
                            }

                        />
                        {/* EDIT */}
                        <Button
                            size="small"
                            shape="circle"
                            className="
                                theme-action-btn
                                theme-action-edit
                            "
                            icon={
                                <EditOutlined />
                            }
                            onClick={() =>
                                handleOpenEdit(record)
                            }
                        />
                    </Space>
                )
            }
        }
    ]
    return (
        <>
            <Table
                rowKey="key"
                loading={loadingProvince}
                columns={columns}
                dataSource={filteredRows}
                pagination={false}
                className="theme-table"
                scroll={{
                    x: 1200
                }}
            />
            <ThemeFormModal
                open={formModal.open}
                type="province"
                mode={formModal.mode}
                targetName={
                    formModal.isAllProvince
                        ?
                        'All Province'
                        :
                        formModal.record?.provinceName || ''
                }
                initialValues={{
                    imageLight:
                        formModal.record?.imageLight || '',
                    imageDark:
                        formModal.record?.imageDark || '',
                }}
                confirmLoading={saving}
                onCancel={handleCloseForm}
                onSubmit={handleSaveTheme}
            />
            <ThemeViewModal
                open={viewModal.open}
                type="province"
                targetName={
                    viewModal.record?.provinceName || ''
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
})
export default ProvinceTheme