import React, { useEffect, useMemo, useState } from 'react'
import { Form, Input, Switch, Button, Typography, message } from 'antd'

import { LinkOutlined, EnvironmentOutlined } from '@ant-design/icons'
import {
  FaTelegramPlane,
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
} from 'react-icons/fa'
import { BsChevronDown } from 'react-icons/bs'

import { BsTelephone, BsEmojiSmile } from 'react-icons/bs'
import ProvinceBottomSheet from './ProvinceBottomSheet'
import creatorRequestImg from '../../../../assets/webview/backgroundImg/creatorRequest.jpg'
import LinksSvg from '../../../../assets/icon/webview/links.svg'
import FacebookSvg from '../../../../assets/icon/webview/facebook.svg'
import InstagramSvg from '../../../../assets/icon/webview/instagram.svg'
import TelegramSvg from '../../../../assets/icon/webview/telegram.svg'
import TikTokSvg from '../../../../assets/icon/webview/tiktok.svg'
import YoutubeSvg from '../../../../assets/icon/webview/youtube.svg'
import './CreatorRequestWebView.css'
const { Title, Text } = Typography
const { TextArea } = Input
const CONTENT_TYPES = [
  'Travel & Adventure',
  'Activities & Entertainment',
  'Food & Drinks',
  'Services & Products',
]
import { useAddressOptStore } from '../../../../Stores/Address/Address'
import useCreatorRequestStore from '../../../../Stores/WebView/user/CreatorRequest/CreatorRequest'
import {
  getCreatorRequestTranslate,
  normalizeLanguage,
} from '../../../../utils/webview/creatorRequestTranslate'
const InputPrefix = ({ icon }) => {
  return (
    <div className='flex h-full items-center'>
      <span className='flex items-center justify-center text-[16px] text-[#6b7280] sm:text-[18px]'>
        {icon}
      </span>
      <span className='mx-2 h-[18px] w-px bg-[#d9dfe7] sm:mx-3 sm:h-[20px]' />
    </div>
  )
}
const FloatingInput = ({
  label,
  required = false,
  value,
  focused,
  onFocus,
  onBlur,
  prefix,
  disabled = false,
  className = '',
  inputClassName = '',
  theme = 'light',
  ...props
}) => {
  const isFloating = focused || !!value
  const isDark = theme === 'dark'

  return (
    <div className={`relative  ${className}`}>
      <label
        className={`pointer-events-none absolute  z-10 px-1 transition-all duration-200 ${
          prefix ? 'left-[50px] sm:left-[58px]' : 'left-[12px] sm:left-[14px]'
        } ${
          isFloating
            ? `top-[-10px] ${isDark ? '!bg-[#1f2937] text-[#60a5fa]' : '!bg-white text-[#1677ff]'} text-[12px] sm:text-[13px]`
            : `top-[13px] text-[13px] ${isDark ? 'text-[#94a3b8]' : 'text-[#a0a8b8]'} sm:text-[14px]`
        } ${disabled ? '!text-[#c0c7d4]' : ''}`}
      >
        {label} {required && <span className='text-[#ff4d4f]'>*</span>}
      </label>

      <Input
        {...props}
        value={value}
        prefix={prefix}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
        placeholder=''
        className={`!h-[48px] sm:!h-[50px] !rounded-[16px] !px-3 sm:!px-4 !pt-1 !text-[16px] sm:!text-[15px] !shadow-none
                [&_.ant-input-prefix]:!me-0
                [&_.ant-input-prefix]:!bg-transparent
                [&_.ant-input]:!bg-transparent
                [&_.ant-input]:focus:!bg-transparent
                [&_.ant-input]:hover:!bg-transparent
                [&_.ant-input]:!text-[16px]
                sm:[&_.ant-input]:!text-[15px]
                [&_.ant-input]:!shadow-none
                ${
                  isDark
                    ? `!bg-[#1f2937] !text-white [&_.ant-input]:!text-white ${
                        isFloating
                          ? '!border-[#60a5fa] hover:!border-[#60a5fa] focus:!border-[#60a5fa]'
                          : '!border-[#374151] hover:!border-[#4b5563] focus:!border-[#60a5fa]'
                      }`
                    : `${
                        isFloating
                          ? '!border-[#1677ff] hover:!border-[#1677ff] focus:!border-[#1677ff]'
                          : '!border-[#d9dfe7] hover:!border-[#d9dfe7] focus:!border-[#1677ff]'
                      } !bg-white !text-[#1f2937] [&_.ant-input]:!text-[#1f2937]`
                }
                ${disabled ? '!bg-[#f5f6fa] !text-[#b7bfcc]' : ''}
                ${inputClassName}`}
      />
    </div>
  )
}

const FloatingTextArea = ({
  label,
  required = false,
  value,
  focused,
  onFocus,
  onBlur,
  className = '',
  textAreaClassName = '',
  theme = 'light',
  ...props
}) => {
  const isFloating = focused || !!value
  const isDark = theme === 'dark'

  return (
    <div className={`relative ${className}`}>
      <label
        className={`pointer-events-none absolute left-[12px] sm:left-[14px] z-10 px-1 transition-all duration-200 ${
          isFloating
            ? `top-[-10px] ${isDark ? '!bg-[#1f2937] text-[#60a5fa]' : '!bg-white text-[#2563eb]'} text-[12px] sm:text-[13px]`
            : `top-[12px] ${isDark ? 'bg-[#1f2937] text-[#94a3b8]' : 'bg-white text-[#9ca3af]'} text-[13px] sm:text-[14px]`
        }`}
      >
        {label} {required && <span className='text-[#ff4d4f]'>*</span>}
      </label>

      <TextArea
        {...props}
        value={value}
        placeholder=''
        onFocus={onFocus}
        onBlur={onBlur}
        className={`!rounded-[12px] !px-3 sm:!px-4 !py-3 !pt-6 !text-[16px] sm:!text-[15px] !shadow-none ${
          isDark
            ? `${
                isFloating
                  ? '!border-[#60a5fa] hover:!border-[#60a5fa] focus:!border-[#60a5fa]'
                  : '!border-[#374151] hover:!border-[#4b5563] focus:!border-[#60a5fa]'
              } !bg-[#1f2937] !text-white`
            : `${
                isFloating
                  ? '!border-[#7c3aed] hover:!border-[#7c3aed] focus:!border-[#7c3aed]'
                  : '!border-[#d9dfe7] hover:!border-[#d9dfe7] focus:!border-[#7c3aed]'
              } bg-white`
        } ${textAreaClassName}`}
      />
    </div>
  )
}

const FloatingSelect = ({
  label,
  required = false,
  value,
  focused,
  prefixIcon,
  className = '',
  onClick,
  theme = 'light',
}) => {
  const isFloating =
    focused || (value !== undefined && value !== null && value !== '')
  const isDark = theme === 'dark'

  return (
    <div className={`relative creatorRequest ${className}`}>
      <label
        className={`pointer-events-none absolute z-10 px-2 leading-none transition-all duration-200 ${
          prefixIcon
            ? 'left-[50px] sm:left-[58px]'
            : 'left-[12px] sm:left-[14px]'
        } ${
          isFloating
            ? `top-[-8px] ${isDark ? 'bg-[#1f2937] text-[#60a5fa]' : 'bg-white text-[#1677ff]'} text-[12px] font-medium sm:text-[13px]`
            : `top-[18px] ${isDark ? 'bg-transparent text-[#94a3b8]' : 'bg-transparent text-[#94a3b8]'} text-[13px] sm:top-[20px] sm:text-[15px]`
        }`}
      >
        {label} {required && <span className='text-[#ff4d4f]'>*</span>}
      </label>

      {prefixIcon ? (
        <div className='pointer-events-none absolute left-[14px] sm:left-[18px] top-1/2 z-[2] -translate-y-1/2'>
          <div className='flex h-full items-center'>
            <span className='flex items-center justify-center text-[16px] text-[#94a3b8] sm:text-[18px]'>
              {prefixIcon}
            </span>
            <span className='mx-3 h-[20px] w-px bg-[#d9dfe7] sm:mx-4 sm:h-[20px]' />
          </div>
        </div>
      ) : null}

      <button
        type='button'
        onClick={onClick}
        className={`relative w-full rounded-[16px] border text-left shadow-none transition-all ${
          isDark
            ? `${
                isFloating
                  ? 'border-[#60a5fa]'
                  : 'border-[#374151] hover:border-[#4b5563]'
              } bg-[#1f2937]`
            : `${
                isFloating
                  ? 'border-[#1677ff]'
                  : 'border-[#d9dfe7] hover:border-[#d8dee8]'
              } bg-white`
        }`}
      >
        <div className='flex h-[48px] sm:h-[50px] items-center justify-between pl-[60px] pr-[16px] sm:pl-[86px] sm:pr-[22px]'>
          <span
            className={`truncate text-[16px] sm:text-[14px] ${
              value
                ? isDark
                  ? 'text-white'
                  : 'text-[#111827]'
                : 'text-[#9ca3af]'
            }`}
          >
            {value || ''}
          </span>

          <span className='text-[35px] mb-0 sm:text-[35px] text-[#94a3b8]'>
            <BsChevronDown size={20} strokeWidth={1} />
          </span>
        </div>
      </button>
    </div>
  )
}

export default function CreatorRequest(props) {
  const {
    initialPhone,
    userId,
    access_token,
    language = 'en',
    theme = 'light',
  } = props
  const [form] = Form.useForm()
  const [selectedTypes, setSelectedTypes] = useState([])
  const [sameAsPhone, setSameAsPhone] = useState(false)
  const [provinceOpen, setProvinceOpen] = useState(false)
  const { fetchProvinceOpts, provinces } = useAddressOptStore()
  const { createCreatorRequest } = useCreatorRequestStore()
  const [existingCreatorRequest, setCreatorRequestExisting] = useState()

  const isDark = theme === 'dark'

  const currentLanguage = normalizeLanguage(language)
  const t = getCreatorRequestTranslate(currentLanguage)
  const contentTypes = t.contentTypes || CONTENT_TYPES

  React.useEffect(() => {
    if (initialPhone) {
      form.setFieldValue('phone', initialPhone)
    }
  }, [initialPhone, form])

  const [focusState, setFocusState] = useState({
    about: false,
    location: false,
    phone: false,
    telegram: false,
    tiktok: false,
    facebook: false,
    instagram: false,
    youtube: false,
    otherLink: false,
  })

  const aboutValue = Form.useWatch('about', form)
  const locationValue = Form.useWatch('location', form)
  const phoneValue = Form.useWatch('phone', form)
  const telegramValue = Form.useWatch('telegram', form)
  const tiktokValue = Form.useWatch('tiktok', form)
  const facebookValue = Form.useWatch('facebook', form)
  const instagramValue = Form.useWatch('instagram', form)
  const youtubeValue = Form.useWatch('youtube', form)
  const otherLinkValue = Form.useWatch('otherLink', form)

  const locationOptions = useMemo(() => {
    return (provinces || []).map((item) => ({
      _id: item._id,
      provinceId: item.provinceId,
      provinceKh: item.provinceKh,
      provinceEn: item.provinceEn,
      value:
        currentLanguage === 'zh'
          ? item.provinceEn
          : currentLanguage === 'en'
            ? item.provinceEn
            : item.provinceKh,
      label:
        currentLanguage === 'zh'
          ? item.provinceEn
          : currentLanguage === 'en'
            ? item.provinceEn
            : item.provinceKh,
    }))
  }, [provinces, currentLanguage])

  const setFieldFocus = (field, value) => {
    setFocusState((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const onToggleContentType = (type) => {
    let next = []
    if (selectedTypes.includes(type)) {
      next = selectedTypes.filter((item) => item !== type)
    } else {
      next = [...selectedTypes, type]
    }
    setSelectedTypes(next)
    form.setFieldValue('contentTypes', next)
  }

  const onSameAsPhoneChange = (checked) => {
    setSameAsPhone(checked)
    if (checked) {
      form.setFieldValue('telegram', phoneValue || '')
    } else {
      form.setFieldValue('telegram', '')
    }
  }

  const clearSocialLinkErrors = () => {
    form.setFields([
      { name: 'tiktok', errors: [] },
      { name: 'facebook', errors: [] },
      { name: 'instagram', errors: [] },
      { name: 'youtube', errors: [] },
      { name: 'otherLink', errors: [] },
    ])
  }

  useEffect(() => {
    fetchProvinceOpts(access_token)
  }, [access_token, fetchProvinceOpts])

  const onFinish = async (values) => {
    try {
      clearSocialLinkErrors()

      const hasAtLeastOneLink =
        values?.tiktok ||
        values?.facebook ||
        values?.instagram ||
        values?.youtube ||
        values?.otherLink

      if (!hasAtLeastOneLink) {
        form.setFields([
          {
            name: 'tiktok',
            errors: [t.atLeastOneLink],
          },
        ])
        return
      }

      const payloadDoc = {
        about: values?.about || '',
        contentTypes: values?.contentTypes || [],
        socialLinks: {
          facebook: values?.facebook || '',
          instagram: values?.instagram || '',
          youtube: values?.youtube || '',
          tiktok: values?.tiktok || '',
          otherLink: values?.otherLink || '',
        },
        locationContact: {
          provinceId: values?.provinceId,
          phone: values?.phone || '',
          telegramPhone: values?.telegram || '',
        },
      }
      try {
        const res = await createCreatorRequest({
          access_token,
          userId,
          doc: payloadDoc,
        })

        const successPayload = {
          type: 'CREATOR_REQUEST_SUCCESS',
          data: {
            userId,
            requestId: res?.data?._id || res?.data?.id || null,
            status: res?.data?.status || 'pending',
            currentLanguage,
            theme,
          },
        }

        if (window.flutter_inappwebview?.callHandler) {
          window.flutter_inappwebview.callHandler(
            'creatorRequestSuccess',
            successPayload
          )
        } else {
          console.log('Not inside Flutter WebView')
        }
        form.resetFields()
        setSelectedTypes([])
        setSameAsPhone(false)
        setFocusState({
          about: false,
          location: false,
          phone: false,
          telegram: false,
          tiktok: false,
          facebook: false,
          instagram: false,
          youtube: false,
          otherLink: false,
        })
      } catch (error) {
        const errorPayload = {
          type: 'CREATOR_REQUEST_ERROR',
          data: {
            userId,
            message:
              error?.response?.data?.message ||
              error?.response?.data?.error?.message ||
              error?.message ||
              'Request failed',
            status: error?.response?.status || null,
            currentLanguage,
            theme,
          },
        }
        const sendToFlutter = (handlerName, payload) => {
          if (window.flutter_inappwebview?.callHandler) {
            window.flutter_inappwebview.callHandler(handlerName, payload)
          } else {
            console.log(`${handlerName} fallback:`, payload)
          }
        }
        sendToFlutter('creatorRequestError', errorPayload)
        console.error('submit creator request error:', error?.message)

        setCreatorRequestExisting(error?.response?.data?.error?.message || '')
      }
    } catch (error) {
      message.error(error?.response?.data?.message || t.submitFail)
    }
  }

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden bg-no-repeat bg-center bg-cover top-0 ${isDark ? 'text-white' : ''}`}
      // <div
      //     className={`min-h-screen w-full bg-no-repeat bg-center bg-cover top-0 ${isDark ? "text-white" : ""}`}
      style={{
        backgroundImage: isDark
          ? `linear-gradient(rgba(17, 24, 39, 0.75), rgba(17, 24, 39, 0.75)), url(${creatorRequestImg})`
          : `url(${creatorRequestImg})`,
        backgroundAttachment: 'fixed',
        backgroundColor: isDark ? '#111827' : '#ffffff',
      }}
    >
      <link
        rel='stylesheet'
        href='https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
      />

      <div className='w-full max-w-[760px] xl:max-w-[820px] mx-auto px-3 sm:px-4 lg:px-5 py-4 sm:py-5'>
        <div className='mb-2 sm:mb-4'>
          <Title
            level={2}
            className={`!mb-1 !text-[24px] sm:!text-[28px] lg:!text-[30px] !font-bold ${isDark ? '!text-white' : '!text-[#1f2937]'}`}
          >
            {t.pageTitle}
          </Title>
          <Text
            className={`!text-[14px] sm:!text-[15px] lg:!text-[16px] !leading-4 ${isDark ? '!text-[#cbd5e1]' : '!text-[#8b93a7]'}`}
          >
            {t.pageSubTitle}
          </Text>
          <p
            className={`!text-[14px]  sm:!text-[15px] lg:!text-[16px] !leading-6 ${isDark ? '!text-red-500' : '!text-red-500'}`}
          >
            {existingCreatorRequest}
          </p>
        </div>

        <Form
          form={form}
          layout='vertical'
          requiredMark={false}
          onFinish={onFinish}
          initialValues={{
            location: '',
            provinceId: null,
            contentTypes: [],
            phone: '',
            telegram: '',
            about: '',
            tiktok: '',
            facebook: '',
            instagram: '',
            youtube: '',
            otherLink: '',
          }}
          className='[&_.ant-form-item]:!mb-4'
        >
          <div
            className={`mb-4 rounded-[20px] sm:rounded-[24px] border p-3 sm:p-4 lg:p-5 shadow-[0_10px_30px_rgba(177,120,255,0.12)] backdrop-blur-sm ${isDark ? 'border-[#374151] bg-[#111827]/90' : 'border-white/65 bg-white'}`}
          >
            <div className='mb-4 flex items-start sm:items-center gap-3'>
              <div className='flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-[#f4e8ff] text-[#8b3dff]'>
                <BsEmojiSmile
                  className='!text-[16px] sm:!text-[18px]'
                  style={{ strokeWidth: 0.5 }}
                />
              </div>
              <div className='flex min-w-0 flex-wrap items-center gap-2'>
                <h3
                  className={`m-0 text-[17px] sm:text-[18px] lg:text-[19px] font-bold ${isDark ? 'text-white' : 'text-[#1f2937]'}`}
                >
                  {t.section1Title}
                </h3>
                <span className='text-[12px] sm:text-[13px] font-medium text-[#ff7a59]'>
                  {t.required}
                </span>
              </div>
            </div>

            <Form.Item
              name='about'
              className=''
              rules={[{ required: true, message: t.aboutRequired }]}
            >
              <FloatingTextArea
                label={t.aboutYourself}
                required
                rows={5}
                value={aboutValue}
                focused={focusState.about}
                onFocus={() => setFieldFocus('about', true)}
                onBlur={() => setFieldFocus('about', false)}
                theme={theme}
              />
            </Form.Item>

            <Form.Item
              name='location'
              className='my-8'
              rules={[{ required: true, message: t.selectLocation }]}
            >
              <FloatingSelect
                label={t.yourLocation}
                required
                value={locationValue}
                focused={focusState.location}
                prefixIcon={
                  <EnvironmentOutlined className='!text-[16px] sm:!text-[18px] !text-[#94a3b8]' />
                }
                onClick={() => {
                  setFieldFocus('location', true)
                  setProvinceOpen(true)
                }}
                theme={theme}
              />
            </Form.Item>

            <Form.Item
              hidden
              name='provinceId'
              rules={[{ required: true, message: t.selectLocation }]}
            >
              <Input />
            </Form.Item>

            <div
              className={`mb-2 mt-6 text-[14px] font-semibold ${isDark ? 'text-[#e5e7eb]' : 'text-[#334155]'}`}
            >
              {t.contentType}
            </div>

            <Form.Item
              name='contentTypes'
              rules={[
                {
                  validator: (_, value) => {
                    if (value && value.length > 0) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error(t.selectContentType))
                  },
                },
              ]}
            >
              <div className='flex flex-wrap gap-2 sm:gap-3'>
                {contentTypes.map((type) => {
                  const active = selectedTypes.includes(type)
                  return (
                    <button
                      key={type}
                      type='button'
                      onClick={() => onToggleContentType(type)}
                      className={`max-w-full rounded-full border px-3 sm:px-4 py-2 text-[13px] sm:text-[14px] font-medium transition-all break-words ${
                        active
                          ? 'border-[#1677ff] bg-white text-[#1677ff]'
                          : isDark
                            ? 'border-[#374151] bg-[#1f2937] text-[#cbd5e1]'
                            : 'border-[#e8ebf0] bg-white text-[#98a2b3]'
                      }`}
                    >
                      {type}
                    </button>
                  )
                })}
              </div>
            </Form.Item>
          </div>

          <div
            className={`mb-4 rounded-[20px] sm:rounded-[24px] border p-3 sm:p-4 lg:p-5 shadow-[0_10px_30px_rgba(177,120,255,0.12)] backdrop-blur-sm ${isDark ? 'border-[#374151] bg-[#111827]/90' : 'border-white/65 bg-white'}`}
          >
            <div className='mb-4 flex items-start sm:items-center gap-3'>
              <div className='flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-[#ffe7f4] text-[#ff3ea5]'>
                <BsTelephone className='!text-[16px] sm:!text-[18px]' />
              </div>
              <div className='flex min-w-0 flex-wrap items-center gap-2'>
                <h3
                  className={`m-0 text-[17px] sm:text-[18px] lg:text-[19px] font-bold ${isDark ? 'text-white' : 'text-[#1f2937]'}`}
                >
                  {t.section2Title}
                </h3>
                <span className='text-[12px] sm:text-[13px] font-medium text-[#ff7a59]'>
                  {t.required}
                </span>
              </div>
            </div>

            <Form.Item
              className=''
              name='phone'
              rules={[{ required: true, message: t.phoneRequired }]}
            >
              <FloatingInput
                label={t.enterPhone}
                required
                value={phoneValue}
                focused={focusState.phone}
                onFocus={() => setFieldFocus('phone', true)}
                onBlur={() => setFieldFocus('phone', false)}
                prefix={
                  <InputPrefix
                    icon={
                      <BsTelephone className='!text-[16px] sm:!text-[18px] !text-[#94a3b8]' />
                    }
                  />
                }
                theme={theme}
              />
            </Form.Item>

            <div
              className={`rounded-[20px]  mt-6  sm:rounded-[24px] border p-3 transition-all ${isDark ? 'border-[#374151] bg-[#1f2937]' : ''}`}
            >
              <div className='mb-4 flex items-center justify-between gap-3 rounded-[18px] px-1 sm:px-2 py-1'>
                <span
                  className={`px-1 sm:px-2 text-[13px] sm:text-[14px] font-semibold ${isDark ? 'text-[#cbd5e1]' : 'text-[#64748b]'}`}
                >
                  {t.sameAsPhone}
                </span>
                <Switch
                  checked={sameAsPhone}
                  onChange={onSameAsPhoneChange}
                  className='[&.ant-switch]:!bg-[#d7deea] [&.ant-switch.ant-switch-checked]:!bg-[#b46cff]'
                />
              </div>

              <Form.Item name='telegram' className='!mb-0'>
                <FloatingInput
                  label={t.enterTelegram}
                  value={telegramValue}
                  focused={focusState.telegram}
                  onFocus={() => setFieldFocus('telegram', true)}
                  onBlur={() => setFieldFocus('telegram', false)}
                  prefix={
                    <InputPrefix
                      icon={
                        <FaTelegramPlane className='text-[16px]  sm:text-[18px] text-[#2aabee]' />
                      }
                    />
                  }
                  disabled={sameAsPhone}
                  inputClassName={
                    sameAsPhone
                      ? '!border-[#1677ff] hover:!border-[#1677ff] focus:!border-[#1677ff]'
                      : ''
                  }
                  theme={theme}
                />
              </Form.Item>
            </div>
          </div>

          <div
            className={`mb-5 rounded-[20px] sm:rounded-[24px] border p-3 sm:p-4 lg:p-5 shadow-[0_10px_30px_rgba(177,120,255,0.12)] backdrop-blur-sm ${isDark ? 'border-[#374151] bg-[#111827]/90' : 'border-white/65 bg-white'}`}
          >
            <div className='mb-3 flex items-start sm:items-center gap-3'>
              <div className='flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-[#ffe9f3] text-[#ff4f9b]'>
                <LinkOutlined className='!text-[16px] sm:!text-[18px]' />
              </div>
              <div className='flex min-w-0 flex-wrap items-center gap-2'>
                <h3
                  className={`m-0 text-[17px] sm:text-[18px] lg:text-[19px] font-bold ${isDark ? 'text-white' : 'text-[#1f2937]'}`}
                >
                  {t.section3Title}
                </h3>
                <span className='text-[12px] sm:text-[13px] font-medium text-[#ff7a59]'>
                  {t.requiredOneLink}
                </span>
              </div>
            </div>

            <Text
              className={`!mb-4 !block !text-[14px] sm:!text-[15px] lg:!text-[16px] !leading-6 ${isDark ? '!text-[#cbd5e1]' : '!text-[#7b879c]'}`}
            >
              {t.socialSubTitle}
            </Text>
            <Form.Item shouldUpdate noStyle>
              {() => {
                const hasError = form.getFieldError('tiktok')?.length > 0

                return (
                  <Form.Item
                    name='tiktok'
                    className={`!relative !mb-0 ${hasError ? 'pb-4' : 'pb-0'}`}
                    dependencies={[
                      'facebook',
                      'instagram',
                      'youtube',
                      'otherLink',
                    ]}
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const facebook = getFieldValue('facebook')
                          const instagram = getFieldValue('instagram')
                          const youtube = getFieldValue('youtube')
                          const otherLink = getFieldValue('otherLink')

                          const hasAtLeastOneLink =
                            value ||
                            facebook ||
                            instagram ||
                            youtube ||
                            otherLink

                          if (hasAtLeastOneLink) {
                            return Promise.resolve()
                          }

                          return Promise.reject(new Error(t.atLeastOneLink))
                        },
                      }),
                    ]}
                  >
                    <FloatingInput
                      label={t.tiktok}
                      value={tiktokValue}
                      focused={focusState.tiktok}
                      onFocus={() => setFieldFocus('tiktok', true)}
                      onBlur={() => {
                        setFieldFocus('tiktok', false)
                        form.validateFields(['tiktok'])
                      }}
                      prefix={
                        <InputPrefix
                          icon={
                            <div className='flex h-[22px] w-[22px] sm:h-[24px] sm:w-[24px] items-center justify-center rounded-[5px]'>
                              <img
                                src={TikTokSvg}
                                alt='tiktok icon'
                                className='w-6 h-6'
                              />
                            </div>
                          }
                        />
                      }
                      theme={theme}
                    />
                  </Form.Item>
                )
              }}
            </Form.Item>

            <Form.Item name='facebook' className=''>
              <FloatingInput
                label={t.facebook}
                value={facebookValue}
                focused={focusState.facebook}
                onFocus={() => setFieldFocus('facebook', true)}
                onBlur={() => {
                  setFieldFocus('facebook', false)
                  form.validateFields(['tiktok'])
                }}
                prefix={
                  <InputPrefix
                    icon={
                      <div className='flex h-[22px] w-[22px] sm:h-[24px] sm:w-[24px] items-center justify-center rounded-full bg-[#1877f2]'>
                        <img
                          src={FacebookSvg}
                          alt='facebook icon'
                          className='w-6 h-6'
                        />
                      </div>
                    }
                  />
                }
                theme={theme}
              />
            </Form.Item>

            <Form.Item name='instagram'>
              <FloatingInput
                label={t.instagram}
                value={instagramValue}
                focused={focusState.instagram}
                onFocus={() => setFieldFocus('instagram', true)}
                onBlur={() => {
                  setFieldFocus('instagram', false)
                  form.validateFields(['tiktok'])
                }}
                prefix={
                  <InputPrefix
                    icon={
                      <div className='flex h-[22px] w-[22px] sm:h-[24px] sm:w-[24px] items-center justify-center rounded-[5px] bg-[radial-gradient(circle_at_30%_107%,#fdf497_0%,#fdf497_5%,#fd5949_45%,#d6249f_60%,#285AEB_90%)]'>
                        <img
                          src={InstagramSvg}
                          alt='instagram icon'
                          className='w-6 h-6'
                        />
                      </div>
                    }
                  />
                }
                theme={theme}
              />
            </Form.Item>

            <Form.Item name='youtube'>
              <FloatingInput
                label={t.youtube}
                value={youtubeValue}
                focused={focusState.youtube}
                onFocus={() => setFieldFocus('youtube', true)}
                onBlur={() => {
                  setFieldFocus('youtube', false)
                  form.validateFields(['tiktok'])
                }}
                prefix={
                  <InputPrefix
                    icon={
                      <div className='flex h-[22px] w-[22px] sm:h-[24px] sm:w-[24px] items-center justify-center'>
                        <img
                          src={YoutubeSvg}
                          alt='youtube icon'
                          className='w-6 h-6'
                        />
                      </div>
                    }
                  />
                }
                theme={theme}
              />
            </Form.Item>

            <Form.Item name='otherLink' className='!mb-0'>
              <FloatingInput
                label={t.otherLink}
                value={otherLinkValue}
                focused={focusState.otherLink}
                onFocus={() => setFieldFocus('otherLink', true)}
                onBlur={() => {
                  setFieldFocus('otherLink', false)
                  form.validateFields(['tiktok'])
                }}
                prefix={
                  <InputPrefix
                    icon={
                      <div className='flex h-[22px] w-[22px] sm:h-[24px] sm:w-[24px] items-center justify-center'>
                        <LinkOutlined className='!text-[20px] sm:!text-[24px] !text-[#8b5cf6]' />
                      </div>
                    }
                  />
                }
                theme={theme}
              />
            </Form.Item>
          </div>

          <Button
            htmlType='submit'
            block
            className='!h-[50px] sm:!h-[54px] !rounded-[16px] !border-0 !text-[18px] sm:!text-[20px] !font-semibold !text-white !shadow-[0_10px_30px_rgba(255,0,153,0.25)]'
            style={{
              background: 'linear-gradient(90deg, #8b2cff 0%, #ff1493 100%)',
            }}
          >
            {t.submitBtn}
          </Button>
        </Form>
      </div>

      <ProvinceBottomSheet
        open={provinceOpen}
        value={locationValue}
        provinces={locationOptions}
        onClose={() => {
          setProvinceOpen(false)
          setFieldFocus('location', !!form.getFieldValue('location'))
        }}
        access_token={access_token}
        language={currentLanguage}
        theme={theme}
        onConfirm={(province) => {
          form.setFieldsValue({
            location:
              currentLanguage === 'zh'
                ? province.provinceEn || province.provinceKh
                : currentLanguage === 'en'
                  ? province.provinceEn || province.provinceKh
                  : province.provinceKh,
            provinceId: province.provinceId,
          })
          setProvinceOpen(false)
          setFieldFocus('location', true)
        }}
      />
    </div>
  )
}
