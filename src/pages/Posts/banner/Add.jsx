import React, { useEffect, useContext, useState, useRef } from 'react'
import { Col, Form, Modal, Row, Button, message, Select, Input } from 'antd'
import dayjs from 'dayjs'
import Swal from 'sweetalert2'

import { AuthContext } from '../../../contexts/AuthContext'
//
import { useBannerStore } from '../../../Stores/Post/Banner.store'
import { useProvinceStore } from '../../../Stores/Province/province.store'
//

import BannerTypeSelection from '../../../components/post/banner/form/BannerTypeSelection'
import CustomAction from '../../../components/post/banner/form/CustomAction'
import Schedule from '../../../components/post/banner/mainFunction/Schedule'

//  New UI components (your new structure)
import BannerHeader from '../../../components/post/banner/mainFunction/BannerHeader'
import BannerImageSection from '../../../components/post/banner/mainFunction/BannerImageSection'
import BannerContentForm from '../../../components/post/banner/mainFunction/BannerContentForm'
import BannerTabsSection from '../../../components/post/banner/mainFunction/BannerTabsSection'
import BannerPreviewPanel from '../../../components/post/banner/mainFunction/BannerPreviewPanel'
import CustomizeLinkModal from '../../../components/post/banner/mainFunction/CustomizeLinkModal'

const { Option } = Select
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
const AddBanner = ({ open, setOpen, getBannerList, activeTab, username }) => {
  const [form] = Form.useForm()
  const { access_token } = useContext(AuthContext)

  //  ALL your states (same as old code)
  const [enImageLarge, setEnImageLarge] = useState(null)
  const [enImageSmall, setEnImageSmall] = useState(null)
  const [khImageLarge, setKhImageLarge] = useState(null)
  const [khImageSmall, setKhImageSmall] = useState(null)

  const [fileEnImageLarge, setFileEnImageLarge] = useState(null)
  const [fileEnImageSmall, setFileEnImageSmall] = useState(null)
  const [fileKhImageLarge, setFileKhImageLarge] = useState(null)
  const [fileKhImageSmall, setfileKhImageSmall] = useState(null)

  const [currentConfig, setCurrentConfig] = useState({})
  const [selectedProvinceIds, setSelectedProvinceIds] = useState([])

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
    targetScreen: 'province_detail',
    selectedProfile: null,
    targetWebsite: '',
  })

  const [provinces, setProvinces] = useState([])
  const [loading, setLoading] = useState(false)
  const [provinceSelectionType, setProvinceSelectionType] = useState('all')
  const [previewData, setPreviewData] = useState({})

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
  const [handleChangeTitleEn, setHandleChangeTitleEn] = useState()
  const [handleChangeTitleKh, setHandleChangeTitleKh] = useState()

  // Banner type used for UI and form
  const [bannerType, setBannerType] = useState('DetailOnly')
  const [language, setLanguage] = useState('en')

  const [selectedChatBusiness, setSelectedChatBusiness] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [buttonTitle, setButtonTitle] = useState('')
  const [selectedUsers, setSelectedUsers] = useState([])
  const [actionType, setActionType] = useState() // navigate_to_app / navigate_to_website (your code)
  const [targetAppScreen, setTargetAppScreen] = useState()
  const [targetWebsite, setTargetWebsite] = useState('')
  // ----------------------------
  const { createBanner } = useBannerStore()
  const { fetchProvinces } = useProvinceStore()
  // ----------------------------
  // Customize link modal (same concept)
  // ----------------------------
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

  // ----------------------------
  //  OLD HANDLE SUBMIT (UNCHANGED LOGIC)
  // ----------------------------
  const handleSubmit = async () => {
    form
      .validateFields()
      .then(async (values) => {
        // setLoading(true)

        // ---- final banner type (from form or state) ----
        const currentBannerType = values.bannerType || bannerType

        // ---- validation for Chat Support ----
        if (currentBannerType === 'Chat Support' && !selectedChatBusiness) {
          message.error('Please select one business place for chat support.')
          setLoading(false)
          return
        }

        // ---- validation for ActionButton ----
        if (currentBannerType === 'ActionButton') {
          if (actionType === 'navigate_to_App' && !targetAppScreen) {
            message.error('Please select a target app screen.')
            setLoading(false)
            return
          }
          if (actionType === 'navigate_to_website' && !targetWebsite) {
            message.error('Please enter a target website URL.')
            setLoading(false)
            return
          }
        }

        //  1) Build "type" exactly like before
        const type =
          activeTab === 'bannerInMoment'
            ? 'Moment'
            : activeTab === 'category'
              ? 'Category'
              : activeTab === 'homeTop'
                ? 'HomeTop'
                : ''

        //  2) Build schedule object (Swagger style)
        const scheduleSwitchOn = !!values.switch
        const scheduleValues = values?.schedule || {}

        let scheduleType = null

        if (scheduleSwitchOn) {
          if (schedule.runOption === 'publishImmediately') scheduleType = 'PublishImmediately'
          if (schedule.runOption === 'specificDays') scheduleType = 'SpecificDays'
          if (scheduleValues?.endDate) scheduleType = 'EndDate'
        }

        const startDateISO = (values?.startDate ? dayjs(values.startDate) : dayjs()).toISOString()

        const schedulePayload = {
          enabled: scheduleSwitchOn,
        }
        schedulePayload.startDate = startDateISO

        if (scheduleSwitchOn) {
          if (scheduleType === 'PublishImmediately') {
            schedulePayload.type = 'PublishImmediately'
          }

          if (scheduleType === 'EndDate') {
            schedulePayload.type = 'EndDate'
            schedulePayload.endDate = dayjs(scheduleValues.endDate).toISOString()
          }

          if (scheduleType === 'SpecificDays') {
            schedulePayload.type = 'SpecificDays'
            schedulePayload.specificDays = Number(scheduleValues?.specificDays || 0) || null
          }
        }

        //  3) Build targeting object (Swagger style)
        const provinceIds = Array.isArray(values?.provinces) ? values.provinces : []

        const targetingPayload = {
          placeId: values?.placeId || '',
          provinceIds,
          userIds: selectedUsers || [],
        }

        if (!provinceIds.length) {
          targetingPayload.allProvinces = true
        }

        //  4) Build action object (Swagger style)
        const actionPayload = {
          type: currentBannerType,
        }

        if (values.buttonTitleEn || values.buttonTitleKh) {
          actionPayload.buttonTitle = {
            en: values.buttonTitleEn || '',
            kh: values.buttonTitleKh || '',
          }
        }

        if (currentBannerType === 'ActionButton') {
          const actionTargetScreen = targetAppScreen || config.targetScreen
          if (actionTargetScreen && values.navigateTo !== 'navigate_to_website') {
            actionPayload.targetScreen = actionTargetScreen
          }
        }

        if (config.selectedProfile) {
          actionPayload.targetId = config.selectedProfile
        }

        if (values?.navigateTo === 'navigate_to_website' && values?.website) {
          actionPayload.navigateToWebsite = values.website
        }

        //  5) Build final payload object
        const cleanEn = sanitizeHtml(descriptionEn)
        const cleanKh = sanitizeHtml(descriptionKh)
        const payload = {
          title: {
            en: values?.titleEn || '',
            kh: values?.titleKh || '',
          },
          description: {
            en: cleanEn || '',
            kh: cleanKh || '',
          },
          targeting: targetingPayload,
          schedule: schedulePayload,
          action: actionPayload,
          type,
          status: values?.status,
          createdBy: username,
        }

        //  6) multipart/form-data
        const formData = new FormData()
        formData.append('data', JSON.stringify(payload))

        if (fileEnImageSmall) formData.append('smallBannerEn', fileEnImageSmall)
        if (fileKhImageSmall) formData.append('smallBannerKh', fileKhImageSmall)
        if (fileEnImageLarge) formData.append('largeBannerEn', fileEnImageLarge)
        if (fileKhImageLarge) formData.append('largeBannerKh', fileKhImageLarge)

        // console.log(cleanEn, 'test form data en');
        // console.log(cleanKh, 'test form data kh');

        try {
          const response = await createBanner({
            access_token,
            formData,
          })

          if (response) {
            Swal.fire({
              icon: 'success',
              title: 'Banner Created!',
              text: 'Your banner has been successfully added.',
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
            title: 'Creation Failed',
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

  // ----------------------------
  //  OLD RESET (UNCHANGED)
  // ----------------------------
  const resetAll = () => {
    try {
      form.resetFields()
    } catch { }

    setEnImageLarge(null)
    setEnImageSmall(null)
    setKhImageLarge(null)
    setKhImageSmall(null)

    setFileEnImageLarge(null)
    setFileEnImageSmall(null)
    setFileKhImageLarge(null)
    setfileKhImageSmall(null)

    setEnChildImage(null)
    setKhChildImage(null)

    setSelectedProvinceIds([])
    setSelectedUsers([])
    setSelectedChatBusiness(null)

    setProvinceSelectionType('all')
    setButtonTitle('')
    setActionType('navigate_to_app')
    setTargetAppScreen('province_detail')
    setTargetWebsite('')
    setSearchTerm('')

    setDescriptionEn('')
    setDescriptionKh('')
    setHandleChangeTitleEn('')
    setHandleChangeTitleKh('')

    setSchedule({
      publishImmediately: false,
      startDate: null,
      runOption: 'publishImmediately',
      specificDays: null,
      endDate: null,
    })

    setConfig({
      buttonTitle: { en: 'Learn More', kh: 'ស្វែងយល់បន្ថែម' },
      navigateTo: 'navigate_to_app',
      targetScreen: 'province_detail',
      selectedProfile: null,
      targetWebsite: '',
    })

    setLanguage('en')
    setBannerType('DetailOnly')
  }

  //  OLD UNSAVED CHECK (UNCHANGED)
  const hasUnsavedChanges = () => {
    const formTouched = form?.isFieldsTouched?.(true)

    const hasAnyImages =
      !!enImageLarge ||
      !!enImageSmall ||
      !!khImageLarge ||
      !!khImageSmall ||
      !!fileEnImageLarge ||
      !!fileEnImageSmall ||
      !!fileKhImageLarge ||
      !!fileKhImageSmall ||
      !!fileENLarge ||
      !!fileENSmall ||
      !!fileKHLarge ||
      !!fileKHSmall ||
      !!enChildImage ||
      !!khChildImage

    const hasAnySelections =
      (Array.isArray(selectedProvinceIds) && selectedProvinceIds.length > 0) ||
      (Array.isArray(selectedUsers) && selectedUsers.length > 0) ||
      !!selectedChatBusiness

    const hasAnyText =
      !!descriptionEn ||
      !!descriptionKh ||
      !!handleChangeTitleEn ||
      !!handleChangeTitleKh ||
      !!buttonTitle ||
      !!targetWebsite

    const scheduleChanged =
      schedule?.publishImmediately !== false ||
      schedule?.startDate !== null ||
      schedule?.runOption !== 'publishImmediately' ||
      schedule?.specificDays !== null ||
      schedule?.endDate !== null

    const configChanged =
      config?.buttonTitle?.en !== 'Learn More' ||
      config?.buttonTitle?.kh !== 'ស្វែងយល់បន្ថែម' ||
      config?.navigateTo !== 'navigate_to_app' ||
      config?.targetScreen !== 'province_detail' ||
      config?.selectedProfile !== null ||
      config?.targetWebsite !== ''

    const uiChanged =
      language !== 'en' ||
      bannerType !== 'DetailOnly' ||
      !!actionType ||
      !!targetAppScreen

    return !!(
      formTouched ||
      hasAnyImages ||
      hasAnySelections ||
      hasAnyText ||
      scheduleChanged ||
      configChanged ||
      uiChanged
    )
  }

  //  OLD CONFIRM CLOSE (UNCHANGED)
  const confirmBeforeClose = async () => {
    if (loading) return

    if (!hasUnsavedChanges()) {
      setOpen(false)
      resetAll()
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
      resetAll()
    }
  }

  //  OLD IMAGE CHANGE (UNCHANGED)
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

  //  OLD REMOVE (UNCHANGED)
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
  }, [descriptionEn])

  useEffect(() => {
    form.setFieldsValue({ descriptionKh })
  }, [descriptionKh])

  return (
    <>
      <Modal
        title={<BannerHeader title={`Create Banner for ${getTitle()}`} />}
        open={open}
        width={1000}
        centered
        closable={true}
        onCancel={confirmBeforeClose}
        destroyOnHidden
        closeIcon={<span className='text-xl'>×</span>}
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
          name='add_banner'
          initialValues={{
            type: 'normal',
            status: 'Active',
            province_selection: 'province',
            bannerType: bannerType,
          }}
        >
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

          {/*  keep your schedule + content concept */}
          <Schedule schedule={schedule} setSchedule={setSchedule} form={form} />

          <BannerContentForm
            form={form}
            language={language}
            setLanguage={setLanguage}
            onHandleChangeTitleEn={(v) => setHandleChangeTitleEn(v)}
            onHandleChangeTitleKh={(v) => setHandleChangeTitleKh(v)}
            setDescriptionEn={setDescriptionEn}
            setDescriptionKh={setDescriptionKh}
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
          provinces={provinces}
          setSelectedProvinceIds={setSelectedProvinceIds}
          selectedProvinceIds={selectedProvinceIds}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
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

export default AddBanner
