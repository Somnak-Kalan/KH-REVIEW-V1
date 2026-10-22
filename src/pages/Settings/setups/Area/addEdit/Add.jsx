import React, { useContext, useMemo } from 'react'
import { Modal } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import AreaForm from '../../../../../components/Area/add/AreaForm'
import { AuthContext } from '../../../../../contexts/AuthContext' //  adjust path
import { useAreasStore } from '../../../../../Stores/Area/area.store' //  adjust path

const AddArea = ({
    open,
    setOpen,

    // options
    provinces = [],
    districts = [],
    types = [
        { label: 'Riverine Floating', value: 'riverine_floating' },
        { label: 'Island Tourism', value: 'island_tourism' },
        { label: 'Coastal Beach', value: 'coastal_beach' },
        { label: 'Mountain Tourism', value: 'mountain_tourism' },
        { label: 'Eco Tourism', value: 'eco_tourism' },
        { label: 'Community Tourism', value: 'community_tourism' },
        { label: 'Agricultural Farm', value: 'agricultural_farm' },
        { label: 'Night Street', value: 'night_street' },
    ],

    // optional: load districts when province changes
    onProvinceChange,
}) => {
    const { access_token, user } = useContext(AuthContext)
    const { saving, createArea } = useAreasStore()

    const handleClose = () => setOpen(false)

    //  IMPORTANT: keep same reference so AreaForm won't reset coverFile/preview
    const initialValues = useMemo(
        () => ({
            status: 'active',
            order: 1,
            createdBy: user?.username || 'admin',
        }),
        [user?._id]
    )

    const handleSubmit = async (values) => {
        const fd = new FormData()
        fd.append('nameKh', values?.nameKh || '')
        fd.append('nameEn', values?.nameEn || '')
        fd.append('provinceId', values?.provinceId || '')
        fd.append('districtId', values?.districtId || '')
        fd.append('type', values?.type || '')
        fd.append('descriptionEn', values?.descriptionEn || '')
        fd.append('descriptionKm', values?.descriptionKm || '')
        fd.append('lat', String(values?.lat ?? ''))
        fd.append('lng', String(values?.lng ?? ''))
        fd.append('mapLink', values?.mapLink ?? '')
        fd.append('status', values?.status || 'active')
        fd.append('order', String(values?.order ?? 0))
        fd.append('createdBy', values?.createdBy || user?.username || 'admin')
        if (values?.coverFile) {

            fd.append('cover', values.coverFile) //  File
        }

        const res = await createArea(access_token, fd)
        if (res) setOpen(false) //  only close on success
    }

    return (
        <Modal
            open={open}
            onCancel={handleClose}
            footer={null}
            centered
            width={1200}
            destroyOnHidden
            closeIcon={<span className="text-xl">×</span>}
            styles={{
                content: { padding: 0, borderRadius: 12, overflow: 'hidden' },
            }}
        >
            <AreaForm
                mode="create"
                title="Add New Area"
                subtitle="Create a new geographical area with location details and descriptions"
                okText="Create Area"
                okIcon={<PlusOutlined />}
                loading={saving}
                provinces={provinces}
                districts={districts}
                types={types}
                requireCover
                onProvinceChange={onProvinceChange}
                onCancel={handleClose}
                onSubmit={handleSubmit}
                initialValues={initialValues}
            />
        </Modal>
    )
}

export default AddArea
