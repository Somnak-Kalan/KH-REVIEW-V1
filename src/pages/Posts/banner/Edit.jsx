import React, { useEffect, useContext, useState } from 'react'
import { Col, Form, Input, Modal, Row, Button, Select, message } from 'antd'
import { AuthContext } from '../../../contexts/AuthContext'
import BannerTypeSelection from '../../../components/post/banner/form/BannerTypeSelection'

import CustomAction from '../../../components/post/banner/form/CustomAction'
import Schedule from '../../../components/post/banner/mainFunction/Schedule'

import dayjs from 'dayjs'
import Swal from 'sweetalert2'
import { PlusOutlined } from '@ant-design/icons'

const { Option } = Select

//  New UI components (same folder style you used in AddBanner new code)
import BannerHeader from '../../../components/post/banner/mainFunction/BannerHeader'
import BannerImageSection from '../../../components/post/banner/mainFunction/BannerImageSection'
import BannerContentForm from '../../../components/post/banner/mainFunction/BannerContentForm'
import BannerTabsSection from '../../../components/post/banner/mainFunction/BannerTabsSection'
import BannerPreviewPanel from '../../../components/post/banner/mainFunction/BannerPreviewPanel'
import CustomizeLinkModal from '../../../components/post/banner/mainFunction/CustomizeLinkModal'
//
import { useBannerStore } from '../../../Stores/Post/Banner.store'
const sanitizeHtml = (dirtyHtml = '') => {
  const html = String(dirtyHtml || '').trim()
  if (!html) return ''

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const body = doc.body

  const walk = (node) => {
    const children = Array.from(node.childNodes || [])
    for (const child of children) {
      // remove comments
      if (child.nodeType === 8) {
        child.remove()
        continue
      }

      // element node
      if (child.nodeType === 1) {
        const tag = child.tagName.toUpperCase()

        //  remove dangerous tags completely
        if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'LINK', 'META'].includes(tag)) {
          child.remove()
          continue
        }

        // remove all attributes except safe ones
        for (const attr of Array.from(child.attributes || [])) {
          const name = attr.name.toLowerCase()

          //  allow href on <a>
          if (tag === 'A' && name === 'href') continue

          //  optionally allow src on img (if you want images)
          // if (tag === 'IMG' && name === 'src') continue

          child.removeAttribute(attr.name)
        }

        // block javascript: URLs
        if (tag === 'A') {
          const href = child.getAttribute('href') || ''
          if (/^\s*javascript:/i.test(href)) child.removeAttribute('href')
        }

        walk(child)
      }
    }
  }

  walk(body)
  return (body.innerHTML || '').trim()
}


const EditBanner = ({ open, setOpen, getBannerList, activeTab, propData, username }) => {
  const [form] = Form.useForm()
  const isEdit = !!propData

  //  keep initial snapshot for close-confirm logic
  const initialSnapshotRef = React.useRef(null)

  // image previews
  const [enImageLarge, setEnImageLarge] = useState(null)
  const [enImageSmall, setEnImageSmall] = useState(null)
  const [khImageLarge, setKhImageLarge] = useState(null)
  const [khImageSmall, setKhImageSmall] = useState(null)

  // image files (only set when user uploads new images)
  const [fileEnImageLarge, setFileEnImageLarge] = useState(null)
  const [fileEnImageSmall, setFileEnImageSmall] = useState(null)
  const [fileKhImageLarge, setFileKhImageLarge] = useState(null)
  const [fileKhImageSmall, setfileKhImageSmall] = useState(null)

  const [currentConfig, setCurrentConfig] = useState({})

  const [defaultProvinceIds, setDefaultProvinceIds] = useState([])
  const [selectedProvinceIds, setSelectedProvinceIds] = useState([])
  //
  const { updateBanner, fetchBannerById } = useBannerStore()
  //
  const [schedule, setSchedule] = useState({
    publishImmediately: false,
    startDate: null,
    runOption: 'publishImmediately',
    specificDays: null,
    endDate: null,
  })

  const [config, setConfig] = useState({
    buttonTitle: { en: 'Learn More', kh: 'ស្វែងយល់បន្ថែម' },
    navigateTo: 'navigate_to_app',
    targetScreen: 'ProvinceProfile',
    selectedProfile: null,
    targetWebsite: '',
  })

  const { access_token } = useContext(AuthContext)

  const [businessProperty, setBusinessProperty] = useState([])
  const [loading, setLoading] = useState(false)
  const [provinceSelectionType, setProvinceSelectionType] = useState('all')
  const [previewData, setPreviewData] = useState({})

  // for Preview panel
  const [fileENLarge, setFileENLarge] = useState()
  const [fileENSmall, setFileENSmall] = useState()
  const [fileKHLarge, setFileKHLarge] = useState()
  const [fileKHSmall, setFileKHSmall] = useState()
  const [khChildImage, setKhChildImage] = useState(null)
  const [enChildImage, setEnChildImage] = useState(null)

  const [isCustomizeModalVisible, setIsCustomizeModalVisible] = useState(false)
  const [customLinkName, setCustomLinkName] = useState('')
  const [appLinkName, setAppLinkName] = useState('View on App')
  const [websiteLinkName, setWebsiteLinkName] = useState('Visit Website')
  const [currentLinkType, setCurrentLinkType] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [descriptionKh, setDescriptionKh] = useState('')

  const [handleChangeTitleEn, setHandleChangeTitleEn] = useState('')
  const [handleChangeTitleKh, setHandleChangeTitleKh] = useState('')

  const [bannerType, setBannerType] = useState('DetailOnly')
  const [language, setLanguage] = useState('en')

  const [selectedChatBusiness, setSelectedChatBusiness] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [buttonTitle, setButtonTitle] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [actionType, setActionType] = useState()
  const [targetAppScreen, setTargetAppScreen] = useState()
  const [targetWebsite, setTargetWebsite] = useState('')

  const handleCustomizeOk = () => {
    if (currentLinkType === 'app') {
      setAppLinkName(customLinkName)
    } else {
      setWebsiteLinkName(customLinkName)
    }
    setIsCustomizeModalVisible(false)
  }

  const handleCustomizeCancel = () => {
    setIsCustomizeModalVisible(false)
  }

  // --------- LOAD BANNER DETAIL FOR EDIT (YOUR OLD CODE) ----------
  const getBannerById = async (id) => {
    try {
      const response = await fetchBannerById({
        access_token,
        id
      })

      const banner = response?.data
      if (!banner) return

      // ----- IMAGES -----
      const img = banner.image || {}
      const small = img.small || {}
      const large = img.large || {}

      const smallEnUrl = small.en?.url || null
      const smallKmUrl = small.km?.url || null
      const largeEnUrl = large.en?.url || null
      const largeKmUrl = large.km?.url || null

      setEnImageSmall(smallEnUrl)
      setKhImageSmall(smallKmUrl)
      setEnImageLarge(largeEnUrl)
      setKhImageLarge(largeKmUrl)

      if (largeEnUrl) setFileENLarge({ preview: largeEnUrl, label: 'en_large' })
      if (largeKmUrl) setFileKHLarge({ preview: largeKmUrl, label: 'kh_large' })
      if (smallEnUrl) setFileENSmall({ preview: smallEnUrl, label: 'en_small' })
      if (smallKmUrl) setFileKHSmall({ preview: smallKmUrl, label: 'kh_small' })

      // ----- TITLE & DESCRIPTION -----
      const titleEn = banner.title?.en || ''
      const titleKh = banner.title?.kh || ''

      setHandleChangeTitleEn(titleEn)
      setHandleChangeTitleKh(titleKh)

      setDescriptionEn(banner.description?.en || '')
      setDescriptionKh(banner.description?.kh || '')

      // ----- STATUS -----
      const status = banner.status || 'Active'

      // ----- TARGETING -----
      const targeting = banner.targeting || {}

      const placeId = targeting.place?.id || null
      const provinceIds = (targeting.provinces || []).map((p) => p.id)
      const userIds = (targeting.users || []).map((u) => u.id)
      const allProvinces = !!targeting.allProvinces

      setSelectedChatBusiness(placeId)
      setSelectedUsers(userIds)
      setProvinceSelectionType(allProvinces ? 'all' : 'specific')

      // ----- ACTION / CONFIG -----
      const action = banner.action || {}
      const actionTypeFromBanner = action.type || 'DetailOnly'
      setBannerType(actionTypeFromBanner)

      const hasWebsite = !!action.navigateToWebsite
      const navigateTo = hasWebsite ? 'navigate_to_website' : 'navigate_to_app'

      const updatedConfig = {
        buttonTitle: {
          en: action.buttonTitle?.en || 'Learn More',
          kh: action.buttonTitle?.kh || 'ស្វែងយល់បន្ថែម',
        },
        navigateTo,
        targetScreen: action.targetScreen || 'ProvinceProfile',
        selectedProfile: action.targetId || null,
        targetWebsite: action.navigateToWebsite || '',
      }

      setConfig(updatedConfig)
      setTargetWebsite(action.navigateToWebsite || '')
      setActionType(navigateTo)
      setTargetAppScreen(action.targetScreen || 'ProvinceProfile')

      // ----- SCHEDULE -----
      const sch = banner.schedule || {}
      const schType = sch.type || 'PublishImmediately'

      const runOption =
        schType === 'SpecificDays'
          ? 'specificDays'
          : schType === 'EndDate'
            ? 'EndDate'
            : 'publishImmediately'

      setSchedule({
        publishImmediately: schType === 'PublishImmediately',
        startDate: sch.startDate ? dayjs(sch.startDate) : null,
        runOption,
        specificDays: sch.specificDays || null,
        endDate: sch.endDate ? dayjs(sch.endDate) : null,
      })

      // ----- SET FORM FIELDS -----
      setDefaultProvinceIds(provinceIds)
      setSelectedProvinceIds(provinceIds)

      form.setFieldsValue({
        titleEn,
        titleKh,
        status,
        placeId,
        _id: banner._id,
        provinces: allProvinces ? [] : provinceIds,
        selectionMethod: allProvinces ? 'all' : 'specific',
        website: action.navigateToWebsite || '',
        startDate: sch.startDate ? dayjs(sch.startDate) : null,
        schedule: {
          endDate: sch.endDate ? dayjs(sch.endDate) : null,
          specificDays: sch.specificDays || null,
        },
        switch: sch.enabled || false,
        radioCondition: runOption,
        bannerType: actionTypeFromBanner,
        navigateTo,
        buttonTitleEn: action.buttonTitle?.en || '',
        buttonTitleKh: action.buttonTitle?.kh || '',
        targetScreen: action.targetScreen,
        targetId: action?.targetId,
        actionType: action?.type,
      })

      // ----- INITIAL SNAPSHOT -----
      initialSnapshotRef.current = {
        titleEn,
        titleKh,
        descriptionEn: banner.description?.en || '',
        descriptionKh: banner.description?.kh || '',
        status,
        placeId: placeId || '',
        provinceIds: Array.isArray(provinceIds) ? provinceIds : [],
        allProvinces: !!allProvinces,
        userIds: Array.isArray(userIds) ? userIds : [],
        bannerType: actionTypeFromBanner,
        navigateTo,
        targetScreen: action.targetScreen || 'ProvinceProfile',
        website: action.navigateToWebsite || '',
        schedule: {
          publishImmediately: schType === 'PublishImmediately',
          startDate: sch.startDate ? dayjs(sch.startDate).toISOString() : null,
          runOption,
          specificDays: sch.specificDays || null,
          endDate: sch.endDate ? dayjs(sch.endDate).toISOString() : null,
          enabled: !!sch.enabled,
          type: schType,
        },
        images: {
          smallEnUrl,
          smallKmUrl,
          largeEnUrl,
          largeKmUrl,
        },
      }
    } catch (error) {
      console.error('Error fetching banner by ID:', error)
    }
  }

  useEffect(() => {
    if (propData && propData._id) {
      getBannerById(propData._id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propData])

  //  SUBMIT (YOUR OLD CODE, NOT REMOVED)
  const handleSubmit = async () => {
    form
      .validateFields()
      .then(async (values) => {
        setLoading(true)

        const bannerId = values?._id || propData?._id
        if (!bannerId) {
          message.error('Banner ID missing.')
          setLoading(false)
          return
        }

        const currentBannerType = values.bannerType || bannerType

        if (currentBannerType === 'Chat Support' && !selectedChatBusiness) {
          message.error('Please select one business place for chat support.')
          setLoading(false)
          return
        }

        if (currentBannerType === 'ActionButton') {
          if (actionType === 'navigate_to_App' && !targetAppScreen) {
            message.error('Please select a target app screen.')
            setLoading(false)
            return
          }
          if (actionType === 'navigate_to_website' && !targetWebsite && !values.website) {
            message.error('Please enter a target website URL.')
            setLoading(false)
            return
          }
        }

        const type =
          activeTab === 'bannerInMoment'
            ? 'Moment'
            : activeTab === 'category'
              ? 'Category'
              : activeTab === 'homeTop'
                ? 'HomeTop'
                : ''

        const scheduleSwitchOn = !!values.switch
        const scheduleValues = values?.schedule || {}

        let scheduleType = null
        if (scheduleSwitchOn) {
          if (schedule.runOption === 'publishImmediately') scheduleType = 'PublishImmediately'
          if (schedule.runOption === 'specificDays') scheduleType = 'SpecificDays'
          if (schedule.runOption === 'EndDate') scheduleType = 'EndDate'
        }

        const schedulePayload = { enabled: scheduleSwitchOn }

        const startDateISO = (values?.startDate
          ? dayjs(values.startDate)
          : schedule?.startDate
            ? dayjs(schedule.startDate)
            : dayjs()
        ).toISOString()

        schedulePayload.startDate = startDateISO

        if (scheduleSwitchOn) {
          if (scheduleType === 'PublishImmediately') {
            schedulePayload.type = 'PublishImmediately'
          }

          if (scheduleType === 'EndDate') {
            schedulePayload.type = 'EndDate'
            if (scheduleValues?.endDate) {
              schedulePayload.endDate = dayjs(scheduleValues.endDate).toISOString()
            } else {
              message.error('Please choose End Date.')
              setLoading(false)
              return
            }
          }

          if (scheduleType === 'SpecificDays') {
            schedulePayload.type = 'SpecificDays'
            const days = Number(scheduleValues?.specificDays || 0)
            if (!days) {
              message.error('Please enter Specific Days.')
              setLoading(false)
              return
            }
            schedulePayload.specificDays = days
          }
        }

        const provinceIds = Array.isArray(selectedProvinceIds) ? selectedProvinceIds : []
        const targetingPayload = {
          placeId: values?.placeId || '',
          provinceIds,
          userIds: selectedUsers || [],
        }

        if (!provinceIds.length) {
          targetingPayload.allProvinces = true
        }

        const actionPayload = { type: currentBannerType }

        if (values.buttonTitleEn || values.buttonTitleKh) {
          actionPayload.buttonTitle = {
            en: values.buttonTitleEn || '',
            kh: values.buttonTitleKh || '',
          }
        }

        if (currentBannerType === 'ActionButton') {
          const actionTargetScreen = values.targetScreen || targetAppScreen || config.targetScreen
          if (actionTargetScreen && values.navigateTo !== 'navigate_to_website') {
            actionPayload.targetScreen = actionTargetScreen
          }
        }

        if (config.selectedProfile) {
          actionPayload.targetId = config.selectedProfile
        } else if (values?.targetId) {
          actionPayload.targetId = values.targetId
        }

        if (values?.navigateTo === 'navigate_to_website') {
          const website = values.website || targetWebsite
          if (website) actionPayload.navigateToWebsite = website
        }
        const cleanEn = sanitizeHtml(descriptionEn)
        const cleanKh = sanitizeHtml(descriptionKh)
        const payload = {
          _id: String(bannerId),
          type,
          status: values?.status,
          title: { en: values?.titleEn || '', kh: values?.titleKh || '' },
          description: { en: cleanEn || '', kh: cleanKh || '' },
          targeting: targetingPayload,
          schedule: schedulePayload,
          action: actionPayload,
          updatedBy: username,
        }

        const formData = new FormData()
        formData.append('data', JSON.stringify(payload))

        if (fileEnImageSmall) formData.append('smallBannerEn', fileEnImageSmall)
        if (fileKhImageSmall) formData.append('smallBannerKh', fileKhImageSmall)
        if (fileEnImageLarge) formData.append('largeBannerEn', fileEnImageLarge)
        if (fileKhImageLarge) formData.append('largeBannerKh', fileKhImageLarge)

        // console.log(cleanEn, 'cleaned descriptionen');
        // console.log(cleanKh, 'cleaned descriptionkh');

        try {
          const response = await updateBanner({
            access_token,
            formData,
            id: String(bannerId),
          })

          if (response) {
            Swal.fire({
              icon: 'success',
              title: 'Banner Updated!',
              text: 'Your banner has been successfully updated.',
              timer: 2000,
              timerProgressBar: true,
              showConfirmButton: false,
              willClose: () => {
                setOpen(false)
                form.resetFields()
                setLoading(false)
                setEnChildImage(null)
                setKhChildImage(null)
                setProvinceSelectionType([])
                setSelectedChatBusiness(null)
                setButtonTitle('')
                setTargetWebsite('')
                getBannerList()
              },
            })
          }
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: err?.response?.data?.message || 'Something went wrong!',
          })
          setLoading(false)
        }
      })
      .catch((info) => {
        setLoading(false)
        if (
          info?.errorFields?.[0]?.name?.[0] === 'titleKh' ||
          info?.errorFields?.[0]?.name?.[0] === 'titleEn'
        ) {
          message.error('Please enter both English and Khmer title.')
          return
        }
        console.log('Validation Failed:', info)
      })
  }

  //  UNSAVED CHANGES (YOUR OLD CODE)
  const hasUnsavedChanges = () => {
    const initial = initialSnapshotRef.current

    const eqArr = (a, b) => {
      const aa = Array.isArray(a) ? [...a].map(String).sort() : []
      const bb = Array.isArray(b) ? [...b].map(String).sort() : []
      if (aa.length !== bb.length) return false
      for (let i = 0; i < aa.length; i++) if (aa[i] !== bb[i]) return false
      return true
    }

    const toISOorNull = (d) => {
      if (!d) return null
      try {
        return dayjs(d).toISOString()
      } catch {
        return null
      }
    }

    if (!initial) {
      const formTouched = form?.isFieldsTouched?.(true)
      const hasNewFiles =
        !!fileEnImageLarge ||
        !!fileEnImageSmall ||
        !!fileKhImageLarge ||
        !!fileKhImageSmall

      const hasAnyState =
        !!enImageLarge ||
        !!enImageSmall ||
        !!khImageLarge ||
        !!khImageSmall ||
        !!descriptionEn ||
        !!descriptionKh ||
        !!handleChangeTitleEn ||
        !!handleChangeTitleKh ||
        (Array.isArray(selectedProvinceIds) && selectedProvinceIds.length > 0) ||
        (Array.isArray(selectedUsers) && selectedUsers.length > 0) ||
        !!selectedChatBusiness ||
        !!actionType ||
        !!targetAppScreen ||
        !!targetWebsite

      return !!(formTouched || hasNewFiles || hasAnyState)
    }

    if (
      !!fileEnImageLarge ||
      !!fileEnImageSmall ||
      !!fileKhImageLarge ||
      !!fileKhImageSmall
    ) return true

    if ((handleChangeTitleEn || '') !== (initial.titleEn || '')) return true
    if ((handleChangeTitleKh || '') !== (initial.titleKh || '')) return true
    if ((descriptionEn || '') !== (initial.descriptionEn || '')) return true
    if ((descriptionKh || '') !== (initial.descriptionKh || '')) return true

    const currentStatus = form.getFieldValue('status') || ''
    if ((currentStatus || '') !== (initial.status || '')) return true

    const currentPlaceId = form.getFieldValue('placeId') || selectedChatBusiness || ''
    if (String(currentPlaceId || '') !== String(initial.placeId || '')) return true

    const currentProvinceIds = Array.isArray(selectedProvinceIds) ? selectedProvinceIds : []
    const currentAllProvinces = !currentProvinceIds.length
    if (currentAllProvinces !== !!initial.allProvinces) return true
    if (!currentAllProvinces && !eqArr(currentProvinceIds, initial.provinceIds || [])) return true

    if (!eqArr(selectedUsers || [], initial.userIds || [])) return true

    if ((bannerType || '') !== (initial.bannerType || '')) return true
    if ((actionType || '') !== (initial.navigateTo || '')) return true

    const currentWebsite = (form.getFieldValue('website') || targetWebsite || '')
    if ((currentWebsite || '') !== (initial.website || '')) return true

    const currentScreen = (targetAppScreen || config?.targetScreen || '')
    if ((currentScreen || '') !== (initial.targetScreen || '')) return true

    const currentSchedule = {
      publishImmediately: !!schedule?.publishImmediately,
      startDate: toISOorNull(schedule?.startDate),
      runOption: schedule?.runOption || 'publishImmediately',
      specificDays: schedule?.specificDays || null,
      endDate: toISOorNull(schedule?.endDate),
    }

    const initialSchedule = {
      publishImmediately: !!initial?.schedule?.publishImmediately,
      startDate: initial?.schedule?.startDate || null,
      runOption: initial?.schedule?.runOption || 'publishImmediately',
      specificDays: initial?.schedule?.specificDays || null,
      endDate: initial?.schedule?.endDate || null,
    }

    if (
      currentSchedule.publishImmediately !== initialSchedule.publishImmediately ||
      (currentSchedule.startDate || null) !== (initialSchedule.startDate || null) ||
      (currentSchedule.runOption || '') !== (initialSchedule.runOption || '') ||
      Number(currentSchedule.specificDays || 0) !== Number(initialSchedule.specificDays || 0) ||
      (currentSchedule.endDate || null) !== (initialSchedule.endDate || null)
    ) return true

    const currentImages = {
      smallEnUrl: enImageSmall || null,
      smallKmUrl: khImageSmall || null,
      largeEnUrl: enImageLarge || null,
      largeKmUrl: khImageLarge || null,
    }
    const initialImages = initial.images || {}
    if (
      (currentImages.smallEnUrl || null) !== (initialImages.smallEnUrl || null) ||
      (currentImages.smallKmUrl || null) !== (initialImages.smallKmUrl || null) ||
      (currentImages.largeEnUrl || null) !== (initialImages.largeEnUrl || null) ||
      (currentImages.largeKmUrl || null) !== (initialImages.largeKmUrl || null)
    ) return true

    return false
  }

  const confirmBeforeClose = async () => {
    if (loading) return

    if (!hasUnsavedChanges()) {
      setOpen(false)
      return
    }

    const result = await Swal.fire({
      icon: 'warning',
      title: 'Discard changes?',
      text: 'If you close now, your unsaved changes will be lost.',
      showCancelButton: true,
      confirmButtonText: 'Yes, close',
      cancelButtonText: 'No, keep editing',
      reverseButtons: true,
    })

    if (result.isConfirmed) {
      setOpen(false)
    }
  }

  //  IMAGE HANDLERS (YOUR OLD CODE)
  const handleImageChange = (e, setImageState, fileInputRef, langLabel, size) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()

      reader.onload = () => {
        setImageState(reader.result)
        if (size === 'Large' && langLabel.includes('en-Large')) {
          setFileENLarge({ preview: reader.result, label: 'en_large' })
          setFileEnImageLarge(file)
        } else if (size === 'Large' && langLabel.includes('kh-Large')) {
          setFileKHLarge({ preview: reader.result, label: 'kh_large' })
          setFileKhImageLarge(file)
        } else if (size === 'Small' && langLabel.includes('en-Small')) {
          setFileENSmall({ preview: reader.result, label: 'en_small' })
          setFileEnImageSmall(file)
        } else if (size === 'Small' && langLabel.includes('kh-Small')) {
          setFileKHSmall({ preview: reader.result, label: 'kh_small' })
          setfileKhImageSmall(file)
        }
      }
      reader.readAsDataURL(file)
    }

    if (fileInputRef?.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = (setImageState, fileInputRef, size) => {
    setImageState(null)
    if (language === 'en' && size === 'en-Large') {
      setFileENLarge('')
      setFileEnImageLarge('')
    } else if (language === 'kh' && size === 'kh-Large') {
      setFileKHLarge('')
      setFileKhImageLarge('')
    } else if (language === 'en' && size === 'en-Small') {
      setFileENSmall('')
      setFileEnImageSmall('')
    } else if (language === 'kh' && size === 'kh-Small') {
      setFileKHSmall('')
      setfileKhImageSmall('')
    }
    if (fileInputRef?.current) {
      fileInputRef.current.value = ''
    }
  }

  const getTitle = () => {
    switch (activeTab) {
      case 'homeTop':
        return 'Home Top'
      case 'bannerInMoment':
        return 'Home In Moment'
      case 'category':
        return 'Banner In Category'
      default:
        return ''
    }
  }

  useEffect(() => {
    form.setFieldsValue({ descriptionEn })
  }, [descriptionEn, form])

  useEffect(() => {
    form.setFieldsValue({ descriptionKh })
  }, [descriptionKh, form])

  return (
    <>
      <Modal
        title={
          <BannerHeader
            title={`${isEdit ? 'Edit' : 'Create'} Banner for ${getTitle()}`}
            icon={<PlusOutlined style={{ fontSize: '20px' }} />}
          />
        }
        open={open}
        width={1000}
        centered
        closable={true}
        onCancel={confirmBeforeClose}
        maskClosable={false}
        keyboard={true}
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button
              type='primary'
              loading={loading}
              onClick={handleSubmit}
              style={{ minWidth: '120px', borderRadius: '8px' }}
            >
              Save
            </Button>
          </div>
        }
      >
        <Form
          form={form}
          layout='vertical'
          name='edit_banner'
          initialValues={{
            type: 'normal',
            status: 'Active',
            province_selection: 'province',
            bannerType: bannerType,
          }}
        >
          <Form.Item name='_id' hidden>
            <Input type='text' />
          </Form.Item>

          <div className='flex justify-around w-full'>
            <div style={{ flex: 1 }}>
              <BannerImageSection
                activeTab={activeTab}
                enImageSmall={enImageSmall}
                setEnImageSmall={setEnImageSmall}
                enImageLarge={enImageLarge}
                setEnImageLarge={setEnImageLarge}
                khImageSmall={khImageSmall}
                setKhImageSmall={setKhImageSmall}
                khImageLarge={khImageLarge}
                setKhImageLarge={setKhImageLarge}
                handleImageChange={handleImageChange}
                handleRemoveImage={handleRemoveImage}
              />
            </div>

            <div className={`${activeTab === 'bannerInMoment' ? ' mr-24' : 'ml-20'}`}>
              <BannerPreviewPanel
                handleChangeTitleEn={handleChangeTitleEn}
                handleChangeTitleKh={handleChangeTitleKh}
                activeTab={activeTab}
                previewData={previewData}
                descriptionEn={descriptionEn}
                descriptionKh={descriptionKh}
                fileENLarge={fileENLarge}
                language={language}
                fileKHLarge={fileKHLarge}
                fileENSmall={fileENSmall}
                fileKHSmall={fileKHSmall}
              />
            </div>
          </div>

          <Schedule schedule={schedule} setSchedule={setSchedule} form={form} />

          <BannerContentForm
            form={form}
            language={language}
            setLanguage={setLanguage}
            onHandleChangeTitleEn={(v) => setHandleChangeTitleEn(v)}
            onHandleChangeTitleKh={(v) => setHandleChangeTitleKh(v)}
            setDescriptionEn={setDescriptionEn}
            setDescriptionKh={setDescriptionKh}
            descriptionEn={descriptionEn}
            descriptionKh={descriptionKh}
          />


        </Form>

        <BannerTabsSection
          form={form}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setSelectedChatBusiness={setSelectedChatBusiness}
          selectedChatBusiness={selectedChatBusiness}
          access_token={access_token}
          activeTab={activeTab}
          setSelectedProvinceIds={setSelectedProvinceIds}
          selectedProvinceIds={selectedProvinceIds}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
          defaultProvinceIds={defaultProvinceIds}
        />

        <BannerTypeSelection
          form={form}
          bannerType={bannerType}
          setBannerType={setBannerType}
          selectedChatBusiness={selectedChatBusiness}
        />

        {bannerType === 'ActionButton' && (
          <CustomAction
            buttonTitle={buttonTitle}
            setButtonTitle={setButtonTitle}
            actionType={actionType}
            bannerType={bannerType}
            setActionType={setActionType}
            targetAppScreen={targetAppScreen}
            setTargetAppScreen={setTargetAppScreen}
            targetWebsite={targetWebsite}
            access_token={access_token}
            setTargetWebsite={setTargetWebsite}
            setCurrentConfig={setCurrentConfig}
            config={config}
            setConfig={setConfig}
            form={form}
          />
        )}
      </Modal>

      <CustomizeLinkModal
        currentLinkType={currentLinkType}
        isCustomizeModalVisible={isCustomizeModalVisible}
        handleCustomizeOk={handleCustomizeOk}
        handleCustomizeCancel={handleCustomizeCancel}
        customLinkName={customLinkName}
        setCustomLinkName={setCustomLinkName}
      />
    </>
  )
}

export default EditBanner
