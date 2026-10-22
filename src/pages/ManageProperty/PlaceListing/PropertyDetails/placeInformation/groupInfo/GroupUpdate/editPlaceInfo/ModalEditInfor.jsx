import React, { useState, useEffect } from 'react'
import { Modal, Steps, Button, Form, Input, message, Divider } from 'antd'
import Swal from 'sweetalert2'
import PlaceInfo from './PlaceInfo'

import dayjs from 'dayjs'
import AllPropertyServices from '../../../../../../../../services/ManageProperty/PlaceListing/AllProperty'
import OtherServiceNonBusinessProperty from '../../../../../../../../services/ManageProperty/PlaceListing/Other'

//  helpers (default schedule)
const DAY_KEYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const toTimeString = (v) => {
  if (!v) return null
  // dayjs
  if (dayjs.isDayjs(v)) return v.format('HH:mm')
  // string
  const d = dayjs(v, ['HH:mm', 'H:mm', 'HH:mm:ss', 'h:mm A', 'h:mmA'], true)
  if (d.isValid()) return d.format('HH:mm')
  const iso = dayjs(v)
  return iso.isValid() ? iso.format('HH:mm') : null
}

const buildDefaultSchedule = (openTimes) => {
  const open = toTimeString(openTimes?.[0]) || '08:00'
  const close = toTimeString(openTimes?.[1]) || '17:00'

  const days = DAY_KEYS.reduce((acc, d) => {
    acc[d] = {
      enabled: true,
      intervals: [{ start: open, end: close }],
    }
    return acc
  }, {})

  return {
    is24x7: false,
    days,
    checkInOut: [],
  }
}

//  consider "empty schedule" as no-data
const isScheduleEmpty = (schedule) => {
  if (!schedule || !schedule.days) return true
  const days = schedule.days
  const anyIntervals = Object.values(days).some((d) => Array.isArray(d?.intervals) && d.intervals.length > 0)
  return !anyIntervals
}

export default function CreateNonBusiness(props) {
  const { open, setOpen, propData, username, access_token, getBusinessProperty } = props
  const [current, setCurrent] = useState(0)

  const [form1] = Form.useForm()
  const [scheduleForm] = Form.useForm()

  const [category, setCategory] = useState('')
  const [keyCat, setKeyCat] = useState()
  const [nonBusinessData, setNonBusinessData] = useState()
  const [socialMedia, setSocialMedia] = useState([])
  const [referenceLink, setReferencesLink] = useState([])
  const [openDay, setOpenDay] = useState()
  const [openTimes, setTimes] = useState()
  const [scheduleData, setScheduleData] = useState()
  const [btn_loading, setBtnLoading] = useState(false)

  const getNonBusinessProperty = async (record) => {
    try {
      const propertyId =
        record?._id

      if (
        !propertyId ||
        !access_token
      ) {
        return
      }

      console.log(
        'FETCH PROPERTY ID:',
        propertyId
      )

      const data =
        await AllPropertyServices.fetchNonBusinessPropertyById({
          access_token,
          id: propertyId,
        })

      const property =
        data?.data?.locations?.[0]

      console.log(
        'PROPERTY DETAIL:',
        property
      )

      if (property) {
        setNonBusinessData(
          property
        )
      }
    } catch (error) {
      console.error(
        'Failed to get property detail:',
        error
      )
    }
  }

  useEffect(() => {
    if (!open) return
    if (!propData?._id) return
    if (nonBusinessData?._id === propData._id) return

    getNonBusinessProperty(propData)
  }, [open, propData?._id, nonBusinessData?._id])

  useEffect(() => {
    if (!nonBusinessData) return

    setOpenDay(nonBusinessData?.openDay)
    setTimes([nonBusinessData?.openTime, nonBusinessData?.closeTime])

    const withIdAct = Array.isArray(nonBusinessData?.activity)
      ? nonBusinessData?.activity?.filter((a) => a?._id != null).map((a) => a._id)
      : []
    const withIdVibe = Array.isArray(nonBusinessData?.vibe)
      ? nonBusinessData.vibe
        .map((item) => {
          if (typeof item === 'object') {
            return item?._id
          }

          return item
        })
        .filter(Boolean)
      : []

    const withIdTypeOfPlace =
      nonBusinessData?.typeOfPlace?.filter((a) => a?._id != null).map((a) => a._id) ?? []

    const withIdTypeOfFood =
      nonBusinessData?.typeOfFood?.filter((a) => a?._id != null).map((a) => a._id) ?? []

    const withIdSubCategory = Array.isArray(nonBusinessData?.subCategory)
      ? nonBusinessData?.subCategory?.filter((a) => a?._id != null).map((a) => a._id)
      : []

    //  schedule fallback
    const scheduleFromApi = nonBusinessData?.schedule
    const safeSchedule =
      isScheduleEmpty(scheduleFromApi) ? buildDefaultSchedule([nonBusinessData?.openTime, nonBusinessData?.closeTime]) : scheduleFromApi

    // checkInOut for accommodation
    const checkInOutArr = Array.isArray(safeSchedule?.checkInOut) ? safeSchedule.checkInOut : []
    const [start, end] = checkInOutArr
    const checkInDate = start ? dayjs(start, 'HH:mm') : null
    const checkOutDate = end ? dayjs(end, 'HH:mm') : null

    form1.setFieldsValue({
      ...nonBusinessData,
      subCategory: withIdSubCategory,
      mainCategory: nonBusinessData?.mainCategory?._id,
      activity: withIdAct,
      vibe: withIdVibe,
      typeOfPlace: withIdTypeOfPlace,
      typeOfFood: withIdTypeOfFood,
      phone1: nonBusinessData?.phone1,
      phone2: nonBusinessData?.phone2,
    })

    //  IMPORTANT: set scheduleForm once with safeSchedule
    scheduleForm.setFieldsValue({
      is24x7: Boolean(safeSchedule?.is24x7),
      schedule: safeSchedule,
      checkInOut: [checkInDate, checkOutDate],
      checkIn: checkInDate,
      checkOut: checkOutDate,
    })

    setSocialMedia(nonBusinessData?.links || [])
    setReferencesLink(nonBusinessData?.referenceLinks || [])
    setScheduleData(safeSchedule)

    if (nonBusinessData?.mainCategory) {
      setKeyCat(nonBusinessData?.mainCategory?.nameEn)
    }
  }, [nonBusinessData])

  useEffect(() => {
    setCurrent(0)
  }, [open])

  const handleSubmit = async () => {
    setBtnLoading(true)
    try {
      await Promise.all([form1.validateFields(), scheduleForm.validateFields()])

      const infoMain = form1.getFieldsValue(true)
      const scheduleList = scheduleForm.getFieldsValue(true)

      const { checkInOut, schedule } = scheduleList

      const {
        _id,
        placeId,
        nameEn,
        nameKh,
        ownership,
        phone1,
        phone2,
        keyword,
        referenceLinks,
        links,
        typeOfPlace,
        mainCategory,
        subCategory,
        descriptionEn,
        descriptionKh,
        typeOfFood,
        star,
        status,
        vibe
      } = infoMain

      const doc1 = {
        _id,
        placeId,
        nameEn,
        nameKh,
        star,
        ownership,
        updatedBy: username,
        phone1,
        phone2,
        keyword,
        referenceLinks,
        links,
        typeOfPlace,
        mainCategory,
        subCategory,
        activity: infoMain.activity,
        descriptionEn,
        descriptionKh,
        typeOfFood,
        vibe,

        //  send HH:mm strings (safe)
        checkInOut: {
          start: toTimeString(checkInOut?.[0]),
          end: toTimeString(checkInOut?.[1]),
        },

        //  always exists because Schedule component sets it
        schedule: schedule,

        status,
      }
      // console.log(doc1, 'astea on me');


      try {
        const data = await AllPropertyServices.updatePropertyInformation({
          doc: doc1,
          access_token,
        })

        if (status === 'Draft') {
          await OtherServiceNonBusinessProperty.updateStatusNonBusinessProperty({
            doc: { id: _id, status: 'Pending' },
            access_token,
          })
        }

        if (data) {
          setBtnLoading(false)
          Swal.fire({
            icon: 'success',
            title: 'Updated',
            timer: 1200,
            showConfirmButton: false,
          }).then(() => {
            setOpen(false)
            getBusinessProperty(_id, true)
            setBtnLoading(false)
          })
        }
      } catch (erro) {
        console.log(erro)
        setBtnLoading(false)
      }
    } catch (err) {
      console.error('Validation failed', err)
      setBtnLoading(false)
    }
  }

  return (
    <>
      <Modal
        open={open}
        title="Edit Place Information"
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
            setBtnLoading(false)
          }
        }}
        footer={null}
        width={1000}
      >
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
          scheduleForm={scheduleForm}
          scheduleData={scheduleData}
        />

        <div className="flex justify-end mt-5">
          <Button loading={btn_loading} type="primary" onClick={handleSubmit}>
            Save Change
          </Button>
        </div>
      </Modal>
    </>
  )
}
