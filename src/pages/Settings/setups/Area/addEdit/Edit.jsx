import React, { useContext, useEffect, useMemo, useRef } from 'react'
import { Modal } from 'antd'
import AreaForm from '../../../../../components/Area/add/AreaForm'
import { AuthContext } from '../../../../../contexts/AuthContext'
import { useAreasStore } from '../../../../../Stores/Area/area.store'

const EditArea = ({
    open,
    setOpen,
    record,

    provinces = [],
    districts = [],
    communes = [],

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

    onProvinceChange,
    onDistrictChange,

    loadingProvinces,
    loadingDistricts,
    loadingCommunes,
}) => {
    const { access_token, user } = useContext(AuthContext)

    const {
        saving,
        updateAreaTextOnly,
        updateAreaCover,
        fetchAreaById,
        areaDetail,

    } = useAreasStore()

    const handleClose = () => setOpen(false)

    //  stable primitive id
    const id = record?._id || record?.id || null

    //  Fetch ONCE per open+id
    const fetchedRef = useRef(null)
    useEffect(() => {
        if (!open || !access_token || !id) return
        if (fetchedRef.current === id) return
        fetchedRef.current = id
        fetchAreaById(access_token, id)
    }, [open, access_token, id, fetchAreaById])

    //  areaDetail shape can be:
    // - { data: { area: {...}, places: [] } }
    // - { area: {...}, places: [] }
    const storeArea = areaDetail?.data?.area || areaDetail?.area || null

    //  use storeArea only when it's the same id, else fallback to record
    const area = useMemo(() => {
        const a = storeArea
        const aId = a?.id || a?._id
        if (a && id && aId && String(aId) === String(id)) return a
        return record || null
    }, [storeArea, record, id])

    const areaId = area?.id || area?._id || id

    //  call onProvinceChange once (load districts)
    const provinceLoadedRef = useRef(null)
    useEffect(() => {
        if (!open || !onProvinceChange) return
        const provinceNum = area?.province?.provinceId
        if (!provinceNum) return
        const key = `${areaId}:${provinceNum}`
        if (provinceLoadedRef.current === key) return
        provinceLoadedRef.current = key
        onProvinceChange(provinceNum)
    }, [open, areaId, area?.province?.provinceId, onProvinceChange])

    //  IMPORTANT: Select value MUST match options' value
    // In AreaForm: province option value = p.provinceId (number)
    // So initialValues.provinceId must be provinceId (number)
    const initialValues = useMemo(() => {
        if (!area) return {}


        const mapLink =
            area?.mapLink ||
            area?.googleMapLink ||
            area?.googleMap ||
            area?.map ||
            ''
        return {
            _id: areaId,

            nameKh: area?.nameKh || '',
            nameEn: area?.nameEn || '',

            //  use numeric ids directly (MATCH Select options)
            provinceId: area?.province?.provinceId ?? undefined,
            districtId: area?.district?.districtId ?? undefined,

            type: area?.type || undefined,

            descriptionEn: area?.descriptionEn || '',
            descriptionKm: area?.descriptionKm || '',


            mapLink: mapLink,

            lat: area?.centerLocation?.lat ?? area?.lat ?? '',
            lng: area?.centerLocation?.lng ?? area?.lng ?? '',

            order: area?.order ?? 0,
            status: area?.status ?? 'active',

            //  show current cover in form preview
            coverUrl: area?.cover?.url || '',

            createdBy: user?.username || user?._id || 'admin',
        }
    }, [area, areaId, user?.username, user?._id])

    const handleSubmit = async (values) => {
        if (!areaId) return

        const mapLink = values?.mapLink || values?.googleMapLink || ''

        //  cover update
        if (values?.coverFile) {
            const fd = new FormData()
            fd.append('nameKh', values?.nameKh || '')
            fd.append('nameEn', values?.nameEn || '')
            fd.append('provinceId', String(values?.provinceId || ''))
            fd.append('districtId', String(values?.districtId || ''))
            fd.append('type', values?.type || '')
            fd.append('descriptionEn', values?.descriptionEn || '')
            fd.append('descriptionKm', values?.descriptionKm || '')
            fd.append('lat', String(values?.lat ?? ''))
            fd.append('lng', String(values?.lng ?? ''))
            fd.append('mapLink', mapLink)
            fd.append('status', values?.status || 'active')
            fd.append('order', String(values?.order ?? 0))
            fd.append('createdBy', values?.createdBy || user?.username || user?._id || 'admin')
            fd.append('cover', values.coverFile)

            const res = await updateAreaCover(access_token, { _id: areaId, formData: fd })
            if (res) setOpen(false)
            return
        }

        //  text update (no cover)
        const payload = {
            _id: areaId,
            nameKh: values?.nameKh || '',
            nameEn: values?.nameEn || '',
            provinceId: String(values?.provinceId || ''),
            districtId: String(values?.districtId || ''),
            type: values?.type || '',
            descriptionEn: values?.descriptionEn || '',
            descriptionKm: values?.descriptionKm || '',
            lat: String(values?.lat ?? ''),
            lng: String(values?.lng ?? ''),
            mapLink,
            status: values?.status || 'active',
            order: String(values?.order ?? 0),
            createdBy: values?.createdBy || user?.username || user?._id || 'admin',
        }

        const res = await updateAreaTextOnly(access_token, payload)
        if (res) setOpen(false)
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
            styles={{ content: { padding: 0, borderRadius: 12, overflow: 'hidden' } }}
        >
            <AreaForm
                mode="edit"
                title="Edit Area"
                subtitle="Update area information and cover image"
                okText="Save Changes"
                loading={saving}
                provinces={provinces}
                districts={districts}
                communes={communes}
                types={types}
                initialValues={initialValues}
                onProvinceChange={onProvinceChange}
                onDistrictChange={onDistrictChange}
                onCancel={handleClose}
                onSubmit={handleSubmit}
                requireCover={false}
                disableFields={[]}
                loadingProvinces={loadingProvinces}
                loadingDistricts={loadingDistricts}
                loadingCommunes={loadingCommunes}
            />
        </Modal>
    )
}

export default EditArea
