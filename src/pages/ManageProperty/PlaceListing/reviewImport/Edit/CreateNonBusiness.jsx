import React, { useState, useEffect } from 'react'
import { Modal, Steps, Button, Form, Input, message, Divider } from 'antd'
import Swal from 'sweetalert2'
import PlaceInfo from './Steps/PlaceInfo'
import PlaceAddress from './Steps/PlaceAddress'
import PlaceImgVideo from './Steps/PlaceImgVideo'
import ReviewImportNonBusinessServices from '../../../../../services/ManageProperty/PlaceListing/ReviewImport'
import AddOtherAlbum from '../../other/AddOtherAlbum'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)
const { Step } = Steps
const { TextArea } = Input
const safeTime = (value) => {
  if (!value) return null
  const d = dayjs(value, ['h:mmA', 'HH:mm'], true)
  return d.isValid() ? d : null
}

export default function CreateNonBusiness(props) {
  const { open, setOpen, propData, username, access_token, getReviewImport } =
    props

  const [current, setCurrent] = useState(0)

  //  use one persistent form per step
  const [form1] = Form.useForm()
  const [form2] = Form.useForm()
  const [form3] = Form.useForm()
  const [category, setCategory] = useState('')
  const [keyCat, setKeyCat] = useState()

  const [nonBusinessData, setNonBusinessData] = useState()
  const [socialMedia, setSocialMedia] = useState([])
  const [referenceLink, setReferencesLink] = useState([])
  const [openDay, setOpenDay] = useState()
  const [openTimes, setTimes] = useState()
  const [googleMap, setGoogleMap] = useState()
  const [locationId, setLocationId] = useState()

  const [btn_loading, setBtnLoading] = useState(false)
  const [openAlbum, setOpenAlbum] = useState(false)
  const [draftModalVisible, setDraftModalVisible] = useState(false)
  const [draftReason, setDraftReason] = useState('')
  // useEffect(() => {
  //   if (open === true) {
  //     setOpenAlbum(true)
  //   }
  // }, [open])
  //  fetch data by ID
  const getReviewImportById = async (record) => {
    try {
      const doc = { id: record?._id }
      const data =
        await ReviewImportNonBusinessServices.fetchReviewImportNonBusinessById({
          doc,
          access_token,
        })
      if (data) setNonBusinessData(data)

    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (propData) getReviewImportById(propData)
  }, [propData, open])

  //  Set form values when data arrives
  useEffect(() => {
    if (!nonBusinessData) return
    const rawPhone = nonBusinessData.phoneNumber ?? ''
    const parts = rawPhone
      .split(/[-,]/)
      .map((p) => p.trim())
      .filter(Boolean)
    const phone1 = parts[0] ?? ''
    const phone2 = parts[1] ?? ''
    const withIdAct = Array.isArray(nonBusinessData?.activity)
      ? nonBusinessData?.activity
        ?.filter((a) => a.id !== null)
        .map((a) => a.id)
      : []
    const withIdSubCategory =
      (nonBusinessData?.subCategory ?? [])
        .filter((a) => a.id != null)
        .map((a) => a.id) ?? []

    const withIdTypeOfPlace =
      (nonBusinessData?.typeOfPlace ?? [])
        .filter((a) => a.id != null)
        .map((a) => a.id) ?? []

    const openRaw = nonBusinessData?.openTime?.trim?.() || ''
    const closeRaw = nonBusinessData?.closeTime?.trim?.() || ''

    let openTimeVal
    let closeTimeVal

    if (openRaw.toLowerCase() === '24hours' || openRaw.toLowerCase() === '24h' || closeRaw.toLowerCase() === '24hours' || closeRaw.toLowerCase() === '24h') {
      //  Treat as full day
      openTimeVal = dayjs('12:00AM', 'h:mmA')
      closeTimeVal = dayjs('11:59PM', 'h:mmA')
    } else {
      openTimeVal = dayjs(openRaw, ['h:mmA', 'HH:mm'], true)
      closeTimeVal = dayjs(closeRaw, ['h:mmA', 'HH:mm'], true)
    }



    form1.setFieldsValue({
      ...nonBusinessData,
      subCategory: withIdSubCategory,
      mainCategory: nonBusinessData?.mainCategory?.id,
      activity: withIdAct,
      typeOfPlace: withIdTypeOfPlace,
      checkIn: safeTime(openTimeVal) ?? null,
      checkOut: safeTime(closeTimeVal) ?? null,
      is24x7: openRaw === '24hours' && closeRaw === '24hours' || openRaw === '24h' && closeRaw === '24h' ? true : false,
      phone1,
      phone2,
    })

    if (nonBusinessData?.mainCategory)
      setKeyCat(nonBusinessData?.mainCategory?.nameEn)

    const locPath = [
      nonBusinessData?.city?.provinceId,
      nonBusinessData?.district?.districtId,
      nonBusinessData?.commune?.communeId,
    ].filter(Boolean)

    form2.setFieldsValue({
      location: locPath,
      addressDetails: nonBusinessData?.addressDetails,
      googleMap: nonBusinessData?.googleMap,
    })

    setGoogleMap(nonBusinessData?.googleMap)
    setOpenDay(nonBusinessData?.openDay)
    setTimes([nonBusinessData?.openTime, nonBusinessData?.closeTime])
    setSocialMedia([nonBusinessData?.socialMedia])
    setReferencesLink([nonBusinessData?.referenceLink])
  }, [nonBusinessData])

  //  Reset wizard
  const resetWizard = () => {
    form1.resetFields()
    form2.resetFields()
    form3.resetFields()
    setCurrent(0)
    setCategory('')
    setKeyCat(undefined)
    setNonBusinessData(undefined)
    setSocialMedia([])
    setReferencesLink([])
    setOpenDay(undefined)
    setTimes(undefined)
    setGoogleMap(undefined)
  }

  useEffect(() => {
    setCurrent(0)
  }, [open])

  //  handle step navigation
  const next = async () => {
    setBtnLoading(false)
    try {
      await steps[current].form.validateFields()

      setCurrent(current + 1)
    } catch (err) {
      console.error('Validation failed:', err)
    }
  }

  const prev = () => {
    setBtnLoading(false)
    setCurrent(current - 1)
  }
  const handleSubmit = async () => {
    // setBtnLoading(true)
    try {
      /*  1) Validate all the forms you care about */
      await Promise.all([
        form1.validateFields(),
        form2.validateFields(),
        form3.validateFields(),
      ])

      /*  2) Grab their data */
      const infor = form1.getFieldsValue(true)
      const address = form2.getFieldsValue(true)
      const media = form3.getFieldsValue(true)
      const infoMain = form1.getFieldsValue(true) // true = nested
      const { video, image, gallery } = form3.getFieldsValue([
        'video',
        'image',
        'gallery',
      ])
      const {
        nameEn,
        nameKh,
        ownership,
        mainCategory,
        subCategory,
        keyword,
        activity,
        descriptionKh,
        descriptionEn,
        star,
        typeOfPlace,
        typeOfFood,
        phone1,
        phone2,
        _id,
        placeId,
        referenceLinks,
        schedule,
        links,
        vibe
      } = form1.getFieldsValue([
        'schedule',
        'nameEn',
        'nameKh',
        'ownership',
        'mainCategory',
        'subCategory',
        'keyword',
        'activity',
        'descriptionKh',
        'descriptionEn',
        'star',
        'typeOfPlace',
        'typeOfFood',
        'phone1',
        'phone2',
        '_id',
        'placeId',
        'referenceLinks',
        'links',
        'vibe'

      ])

      const info = {
        placeId,
        nameEn,
        nameKh,
        ownership,
        mainCategory: mainCategory,
        subCategory,
        keyword,
        activity: activity,
        descriptionKh,
        descriptionEn,
        star: star == undefined && star === null && star === '' ? 0 : star,
        typeOfPlace: typeOfPlace,
        typeOfFood,
        phone1,
        phone2,
        links: links,
        status: 'setup',
        vibe,
      }

      const mediaInfo = {
        videos: [video],
        images: image,
        gallery: gallery?.[0],
      }
      const doc1 = {
        id: _id,
        info: {
          ...info,
        },
        address,

        referenceLinks: referenceLinks,
        schedule: schedule,
        images: mediaInfo?.images,
        videos: mediaInfo?.videos,
        gallery: mediaInfo?.gallery?.gallery,
        category_gallery: mediaInfo?.gallery?.category_gallery,
      }
      const scheduleList = { schedule: schedule }
      const formData = new FormData()
      formData.append('id', _id)
      formData.append('username', username)
      formData.append('info', JSON.stringify(info))
      formData.append('address', JSON.stringify(address))
      formData.append('referenceLinks', JSON.stringify(referenceLinks))
      formData.append('schedule', JSON.stringify(scheduleList))
      formData.append('images', mediaInfo?.images)
      mediaInfo?.videos?.forEach((f) =>
        formData.append('videos', f?.originFileObj ?? f)
      )
      if (mediaInfo?.gallery?.category_gallery === 'All') {
        if (gallery?.[0]?.gallery?.length) {
          gallery?.[0]?.gallery?.forEach((f) =>
            formData.append('gallery', f.originFileObj ?? f)
          )
        }
      }
      // console.log(scheduleList, 'star now');
      // console.log([...formData]);
      try {
        const doc = formData
        const data =
          await ReviewImportNonBusinessServices.updateImportReviewNonBusiness({
            doc,
            access_token,
          })
        if (data) {
          const id = data?.data?._id
          if (id !== null && id !== undefined && id !== '') {
            setLocationId(id)
            setOpenAlbum(true)
          }
          await Swal.fire({
            icon: 'success',
            title: 'Updated',
            timer: 1200,
            showConfirmButton: false,
          })
          setOpen(false)
          getReviewImport()
          setBtnLoading(false)
          resetWizard()
        }
      } catch (erro) {

        setBtnLoading(false)
      } finally {
        setBtnLoading(false)
      }
    } catch (err) {
      setBtnLoading(false)
      console.error('Validation failed', err)
    }
  }

  //  Steps config
  const steps = [
    {
      title: 'Place Info',
      content: (
        <PlaceInfo
          access_token={access_token}
          form={form1}
          category={category}
          setCategory={setCategory}
          keyCat={keyCat}
          setKeyCat={setKeyCat}
          socialMedia={socialMedia}
          referenceLink={referenceLink}
          nonBusinessData={nonBusinessData}
          openDay={openDay}
          openTimes={openTimes}
          scheduleData={nonBusinessData?.schedule}
        />
      ),
      form: form1,
    },
    {
      title: 'Place Address',
      content: (
        <PlaceAddress
          form={form2}
          access_token={access_token}
          googleMap={googleMap}
        />
      ),
      form: form2,
    },
    {
      title: 'Place Image & Video',
      content: (
        <PlaceImgVideo form={form3} keyCat={keyCat} setKeyCat={setKeyCat} />
      ),
      form: form3,
    },
  ]

  return (
    <>
      <AddOtherAlbum
        open={openAlbum}
        setOpen={setOpenAlbum}
        closeModalEditSetUp={setOpen}
        id={locationId}
      />

      <Modal
        open={open}
        title='Update Place Non Business'
        onCancel={async () => {
          const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Changes you made may not be saved.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, close it',
            cancelButtonText: 'No, keep editing',
          })
          if (result.isConfirmed) {
            setOpen(false)
            resetWizard()
          }
        }}
        footer={null}
        width={1000}
      >
        <Steps current={current} style={{ marginBottom: 24 }}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>

        {/*  Keep all steps mounted to preserve field values */}
        <div style={{ minHeight: 200 }}>
          {steps.map((item, index) => (
            <div
              key={item.title}
              style={{
                display: current === index ? 'block' : 'none',
              }}
            >
              {item.content}
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div className='flex justify-end mt-4'>
          {current > 0 && (
            <Button style={{ marginRight: 8 }} onClick={prev}>
              Previous
            </Button>
          )}

          {current < steps.length - 1 && (
            <Button type='primary' onClick={next}>
              Next
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button type='primary' loading={btn_loading} onClick={handleSubmit}>
              Update
            </Button>
          )}
        </div>
      </Modal>

      {/* Draft Reason Modal */}
      <Modal
        open={draftModalVisible}
        title='Reason for save draft'
        onCancel={() => {
          setDraftModalVisible(false)
          setDraftReason('')
        }}
        okText='Update'
        cancelText='Cancel'
      >
        <Form>
          <Divider />
          <Form.Item labelCol={{ span: 24 }} required style={{ margin: 0 }}>
            <TextArea
              rows={4}
              value={draftReason}
              onChange={(e) => setDraftReason(e.target.value)}
              placeholder='Enter Reason'
            />
          </Form.Item>
          <Divider />
        </Form>
      </Modal>
    </>
  )
}
