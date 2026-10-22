import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  Button,
  Col,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Spin,
  Typography,
  Upload,
} from 'antd'
import {
  CloudUploadOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import Swal from 'sweetalert2'
import styled from 'styled-components'

import { AuthContext } from '../../../../../../contexts/AuthContext'
import { useAllPropertyStore } from '../../../../../../Stores/ManageProperty/AllProperty/AllProperty.store'
import useAlbumSetStore from '../../../../../../Stores/settings/setups/AlbumSet'
import AllPropertyServices from '../../../../../../services/ManageProperty/PlaceListing/AllProperty'
import ImageLoading from '../../../../../../components/Loading/ImageLoading'

const { Dragger } = Upload
const { Text } = Typography

const MAX_IMAGES_PER_ALBUM = 10

const NONE_ALBUM_KEY =
  '__none_album__'

const NONE_ALBUM_NAME =
  'None Album'

const StyledDeleteButton =
  styled(Button)`
    position: absolute;
    top: 5px;
    right: 5px;
    z-index: 5;

    width: 28px;
    height: 28px;
    padding: 0;

    background: rgba(
      0,
      0,
      0,
      0.55
    ) !important;

    border-radius: 6px;

    &:hover {
      background: white !important;
    }
  `

const getId = value => {
  if (!value) {
    return null
  }

  if (
    typeof value === 'object'
  ) {
    return (
      value._id ||
      value.id ||
      value.value ||
      null
    )
  }

  return value
}

const getRecordId = value => {
  if (!value) {
    return null
  }

  if (
    typeof value === 'object'
  ) {
    return (
      value._id ||
      value.id ||
      null
    )
  }

  return value
}

const extractArray = response => {
  const candidates = [
    response?.data?.albumSets,
    response?.data?.sets,
    response?.data?.items,
    response?.data?.results,
    response?.data?.docs,
    response?.data?.data,
    response?.albumSets,
    response?.sets,
    response?.items,
    response?.data,
    response,
  ]

  return (
    candidates.find(
      Array.isArray
    ) || []
  )
}

const extractSetDetail =
  response => {
    const candidates = [
      response?.data?.albumSet,
      response?.data?.set,
      response?.data?.item,
      response?.data?.result,
      response?.data?.data,
      response?.albumSet,
      response?.set,
      response?.item,
      response?.data,
      response,
    ]

    return (
      candidates.find(
        value =>
          value &&
          typeof value ===
          'object' &&
          !Array.isArray(value)
      ) || null
    )
  }

const getErrorMessage = (
  error,
  fallback
) => {
  return (
    error?.response?.data?.msg ||
    error?.response?.data
      ?.message ||
    error?.response?.data
      ?.error ||
    error?.message ||
    fallback
  )
}

const getPreviewUrl = file => {
  return (
    file?.previewUrl ||
    file?.url ||
    ''
  )
}

const getFileUrl = file => {
  if (
    typeof file === 'string'
  ) {
    return file
  }

  return (
    file?.url ||
    file?.path ||
    file?.file ||
    ''
  )
}

const normalizeFileName =
  value => {
    const source =
      String(value || '')
        .split('?')[0]
        .split('#')[0]

    const rawName =
      source
        .split('/')
        .pop() || source

    try {
      return decodeURIComponent(
        rawName
      )
        .trim()
        .toLowerCase()
    } catch {
      return rawName
        .trim()
        .toLowerCase()
    }
  }

const getFileFingerprint =
  file => {
    const rawFile =
      file?.originFileObj ||
      file

    return [
      normalizeFileName(
        rawFile?.name ||
        file?.name ||
        file?.url
      ),
      Number(
        rawFile?.size ||
        file?.size ||
        0
      ),
      Number(
        rawFile?.lastModified ||
        file?.lastModified ||
        0
      ),
    ].join('|')
  }

const getAlbumSetAlbums =
  albumSet => {
    if (!albumSet) {
      return []
    }

    const candidates = [
      albumSet?.albums,
      albumSet?.albumIds,
      albumSet?.album_ids,
      albumSet?.albumList,
      albumSet?.albumDetails,
      albumSet?.album_details,
      albumSet?.items,
    ]

    return (
      candidates.find(
        Array.isArray
      ) || []
    )
  }

const isFullAlbumSet =
  value => {
    if (
      !value ||
      typeof value !== 'object' ||
      Array.isArray(value) ||
      !getId(value)
    ) {
      return false
    }

    return [
      value?.albums,
      value?.albumIds,
      value?.album_ids,
      value?.albumList,
      value?.albumDetails,
      value?.album_details,
    ].some(Array.isArray)
  }

const getAlbumSetName =
  albumSet => {
    return (
      albumSet?.nameEn ||
      albumSet?.name_en ||
      albumSet?.title ||
      albumSet?.name ||
      'Album Set'
    )
  }

const getPropertyDetail =
  response => {
    return (
      response?.data
        ?.locations?.[0] ||
      response?.data
        ?.location ||
      response?.data
        ?.property ||
      response?.data
        ?.data ||
      response?.data ||
      response ||
      null
    )
  }

const getPropertyGalleries =
  detail => {
    const candidates = [
      detail?.media?.gallery,
      detail?.media?.galleries,
      detail?.gallery,
      detail?.galleries,
      detail?.data
        ?.media?.gallery,
    ]

    return (
      candidates.find(
        Array.isArray
      ) || []
    )
  }

const findAlbumSetDeep = (
  root,
  maximumDepth = 6
) => {
  if (
    !root ||
    typeof root !== 'object'
  ) {
    return null
  }

  const visited =
    new WeakSet()

  const queue = [
    {
      value: root,
      depth: 0,
    },
  ]

  while (queue.length) {
    const current =
      queue.shift()

    const value =
      current.value

    const depth =
      current.depth

    if (
      !value ||
      typeof value !== 'object' ||
      visited.has(value)
    ) {
      continue
    }

    visited.add(value)

    if (
      isFullAlbumSet(value)
    ) {
      return value
    }

    if (
      depth >= maximumDepth
    ) {
      continue
    }

    const children =
      Array.isArray(value)
        ? value
        : Object.values(value)

    children.forEach(child => {
      if (
        child &&
        typeof child === 'object'
      ) {
        queue.push({
          value: child,
          depth: depth + 1,
        })
      }
    })
  }

  return null
}

const getAssignedSetReference =
  detail => {
    if (!detail) {
      return null
    }

    const candidates = [
      detail?.albumSet,
      detail?.album_set,
      detail?.albumSetId,
      detail?.album_set_id,
      detail?.media?.albumSet,
      detail?.media?.album_set,
      detail?.media?.albumSetId,
      detail?.media
        ?.album_set_id,
      detail?.galleryAlbumSet,
      detail
        ?.gallery_album_set,
      detail?.albumSets?.[0],
      detail?.album_sets?.[0],
      detail?.media
        ?.albumSets?.[0],
      detail?.media
        ?.album_sets?.[0],
    ].filter(Boolean)

    const fullSet =
      candidates.find(
        isFullAlbumSet
      )

    if (fullSet) {
      return fullSet
    }

    const deepSet =
      findAlbumSetDeep(detail)

    if (deepSet) {
      return deepSet
    }

    return (
      candidates[0] ||
      null
    )
  }

const normalizeAlbum = (
  value,
  albumSetId
) => {
  if (!value) {
    return null
  }

  const nested =
    typeof value === 'object'
      ? value.album ||
      value.albumId ||
      value.album_id ||
      value
      : value

  const albumId =
    getId(nested) ||
    getId(value)

  const album =
    typeof nested === 'object'
      ? nested
      : typeof value === 'object'
        ? value
        : null

  if (
    !albumId ||
    !album
  ) {
    return null
  }

  const nameEn =
    album?.nameEn ||
    album?.name_en ||
    album?.title ||
    album?.name ||
    'Album'

  return {
    key: String(albumId),
    _id: String(albumId),

    albumSetId:
      albumSetId
        ? String(albumSetId)
        : null,

    nameEn,

    nameKh:
      album?.nameKh ||
      album?.name_kh ||
      nameEn,

    isNoneAlbum: false,
  }
}

const getAlbumsFromSet =
  albumSet => {
    if (!albumSet) {
      return []
    }

    const albumSetId =
      getId(albumSet)

    const albumMap =
      new Map()

    getAlbumSetAlbums(
      albumSet
    ).forEach(value => {
      const album =
        normalizeAlbum(
          value,
          albumSetId
        )

      if (!album) {
        return
      }

      albumMap.set(
        String(album._id),
        album
      )
    })

    return Array.from(
      albumMap.values()
    )
  }

const createNoneAlbum =
  albumSetId => ({
    key: NONE_ALBUM_KEY,
    _id: null,

    albumSetId:
      albumSetId || null,

    nameEn:
      NONE_ALBUM_NAME,

    nameKh:
      NONE_ALBUM_NAME,

    isNoneAlbum: true,
  })

const createEmptyBucket = ({
  albumSetId = null,
  albumId = null,
} = {}) => ({
  albumSetId:
    albumSetId || null,

  albumId:
    albumId || null,

  propertyAlbumId: null,
  existingFiles: [],
  newFiles: [],
})

const getGallerySetId =
  gallery => {
    return getId(
      gallery?.albumSet ||
      gallery?.albumSetId ||
      gallery?.album_set ||
      gallery?.album_set_id ||
      gallery?.set ||
      gallery?.setId
    )
  }

const getGalleryAlbumId =
  gallery => {
    return getId(
      gallery?.album ||
      gallery?.albumId ||
      gallery?.album_id
    )
  }

const createGalleryState = (
  galleryList,
  albumSet
) => {
  const albumSetId =
    getId(albumSet)

  const setAlbums =
    getAlbumsFromSet(
      albumSet
    )

  const allowedAlbumIds =
    new Set(
      setAlbums.map(
        album =>
          String(album._id)
      )
    )

  const next = {
    [NONE_ALBUM_KEY]:
      createEmptyBucket({
        albumSetId,
        albumId: null,
      }),
  }

    ; (galleryList || [])
      .forEach(
        (
          gallery,
          galleryIndex
        ) => {
          const gallerySetId =
            getGallerySetId(
              gallery
            )

          const galleryAlbumId =
            getGalleryAlbumId(
              gallery
            )

          if (
            albumSetId &&
            gallerySetId &&
            String(gallerySetId) !==
            String(albumSetId)
          ) {
            return
          }

          if (
            galleryAlbumId &&
            allowedAlbumIds.size &&
            !allowedAlbumIds.has(
              String(
                galleryAlbumId
              )
            )
          ) {
            return
          }

          const albumKey =
            galleryAlbumId
              ? String(
                galleryAlbumId
              )
              : NONE_ALBUM_KEY

          const propertyAlbumId =
            getRecordId(gallery)

          if (!next[albumKey]) {
            next[albumKey] =
              createEmptyBucket({
                albumSetId,
                albumId:
                  galleryAlbumId,
              })
          }

          const files =
            Array.isArray(
              gallery?.files
            )
              ? gallery.files
              : []

          const existingFiles =
            files
              .map(
                (
                  file,
                  fileIndex
                ) => {
                  const url =
                    getFileUrl(file)

                  if (!url) {
                    return null
                  }

                  return {
                    uid:
                      `server-${propertyAlbumId ||
                      galleryIndex
                      }-${fileIndex}`,

                    name:
                      normalizeFileName(
                        url
                      ) ||
                      `image-${fileIndex + 1
                      }`,

                    url,
                    status: 'done',

                    albumSetId:
                      albumSetId ||
                      gallerySetId ||
                      null,

                    albumId:
                      galleryAlbumId ||
                      null,

                    propertyAlbumId:
                      propertyAlbumId ||
                      null,

                    isExisting: true,
                  }
                }
              )
              .filter(Boolean)

          next[albumKey] = {
            ...next[albumKey],

            albumSetId:
              albumSetId ||
              gallerySetId ||
              null,

            albumId:
              galleryAlbumId ||
              null,

            propertyAlbumId:
              next[albumKey]
                .propertyAlbumId ||
              propertyAlbumId ||
              null,

            existingFiles: [
              ...next[albumKey]
                .existingFiles,
              ...existingFiles,
            ],
          }
        }
      )

  return next
}

export default function MultipleImageModal({
  open,
  setOpen,
  id,
}) {
  const { access_token } =
    useContext(AuthContext)

  const fetchPropertyById =
    useAllPropertyStore(
      state =>
        state
          .fetchNonBusinessPropertyById
    )

  const fetchAlbumSets =
    useAlbumSetStore(
      state =>
        state.fetchSets
    )

  const fetchSetById =
    useAlbumSetStore(
      state =>
        state.fetchSetById
    )

  const [
    albumSets,
    setAlbumSets,
  ] = useState([])

  const [
    selectedAlbumSet,
    setSelectedAlbumSet,
  ] = useState(null)

  const [
    hasAssignedSet,
    setHasAssignedSet,
  ] = useState(false)

  const [
    propertyGalleries,
    setPropertyGalleries,
  ] = useState([])

  const [
    activeAlbumKey,
    setActiveAlbumKey,
  ] = useState(null)

  const [
    imagesByAlbum,
    setImagesByAlbum,
  ] = useState({})

  const [
    loading,
    setLoading,
  ] = useState(false)

  const [
    loadingSet,
    setLoadingSet,
  ] = useState(false)

  const [
    saving,
    setSaving,
  ] = useState(false)

  const [
    deletingFileUid,
    setDeletingFileUid,
  ] = useState(null)

  const [
    previewLoadingFiles,
    setPreviewLoadingFiles,
  ] = useState({})

  const [
    uploadPickerKey,
    setUploadPickerKey,
  ] = useState(0)

  const imagesByAlbumRef =
    useRef(imagesByAlbum)

  const objectUrlsRef =
    useRef(new Set())

  useEffect(() => {
    imagesByAlbumRef.current =
      imagesByAlbum
  }, [imagesByAlbum])

  const selectedSetId =
    useMemo(() => {
      const value =
        getId(
          selectedAlbumSet
        )

      return value
        ? String(value)
        : undefined
    }, [selectedAlbumSet])

  const setOptions =
    useMemo(() => {
      const source =
        hasAssignedSet
          ? selectedAlbumSet
            ? [selectedAlbumSet]
            : []
          : albumSets

      return source
        .map(albumSet => ({
          value:
            String(
              getId(albumSet)
            ),

          label:
            getAlbumSetName(
              albumSet
            ),
        }))
        .filter(
          item =>
            item.value &&
            item.value !==
            'null'
        )
    }, [
      albumSets,
      selectedAlbumSet,
      hasAssignedSet,
    ])

  const visibleAlbums =
    useMemo(() => {
      if (
        !selectedAlbumSet ||
        !selectedSetId
      ) {
        return []
      }

      return [
        createNoneAlbum(
          selectedSetId
        ),
        ...getAlbumsFromSet(
          selectedAlbumSet
        ),
      ]
    }, [
      selectedAlbumSet,
      selectedSetId,
    ])

  const activeAlbum =
    useMemo(() => {
      return (
        visibleAlbums.find(
          album =>
            album.key ===
            activeAlbumKey
        ) || null
      )
    }, [
      visibleAlbums,
      activeAlbumKey,
    ])

  const activeBucket =
    activeAlbumKey
      ? imagesByAlbum[
      activeAlbumKey
      ]
      : null

  const activeFiles =
    activeBucket
      ? [
        ...activeBucket
          .existingFiles,
        ...activeBucket
          .newFiles,
      ]
      : []

  const revokeObjectUrl =
    url => {
      if (!url) {
        return
      }

      try {
        URL.revokeObjectURL(
          url
        )
      } catch {
        // Ignore cleanup error.
      }

      objectUrlsRef.current
        .delete(url)
    }

  const clearObjectUrls =
    () => {
      objectUrlsRef.current
        .forEach(url => {
          try {
            URL.revokeObjectURL(
              url
            )
          } catch {
            // Ignore cleanup error.
          }
        })

      objectUrlsRef.current
        .clear()
    }

  const resetState =
    () => {
      clearObjectUrls()

      setAlbumSets([])
      setSelectedAlbumSet(null)
      setHasAssignedSet(false)
      setPropertyGalleries([])
      setActiveAlbumKey(null)
      setImagesByAlbum({})
      setPreviewLoadingFiles({})
      setDeletingFileUid(null)
      setLoadingSet(false)

      imagesByAlbumRef.current =
        {}

      setUploadPickerKey(
        previous =>
          previous + 1
      )
    }

  const loadSetDetail =
    async setId => {
      if (!setId) {
        return null
      }

      const existing =
        albumSets.find(
          item =>
            String(
              getId(item)
            ) ===
            String(setId)
        )

      if (
        existing &&
        isFullAlbumSet(existing)
      ) {
        return existing
      }

      if (
        typeof fetchSetById !==
        'function'
      ) {
        throw new Error(
          'Album Set detail API is not connected.'
        )
      }

      const response =
        await fetchSetById({
          access_token,
          setId,
          id: setId,
          _id: setId,
        })

      const detail =
        extractSetDetail(
          response
        )

      if (
        !detail ||
        !getId(detail)
      ) {
        throw new Error(
          'Album Set detail was not found.'
        )
      }

      setAlbumSets(previous => {
        const detailId =
          String(
            getId(detail)
          )

        const exists =
          previous.some(
            item =>
              String(
                getId(item)
              ) === detailId
          )

        if (!exists) {
          return [
            ...previous,
            detail,
          ]
        }

        return previous.map(
          item =>
            String(
              getId(item)
            ) === detailId
              ? {
                ...item,
                ...detail,
              }
              : item
        )
      })

      return detail
    }

  const resolveAssignedSet =
    async detail => {
      const reference =
        getAssignedSetReference(
          detail
        )

      if (!reference) {
        return null
      }

      if (
        isFullAlbumSet(
          reference
        )
      ) {
        return reference
      }

      const setId =
        getId(reference)

      if (!setId) {
        return null
      }

      return loadSetDetail(
        setId
      )
    }

  const loadAllSets =
    async () => {
      if (
        typeof fetchAlbumSets !==
        'function'
      ) {
        throw new Error(
          'Album Set list API is not connected.'
        )
      }

      const response =
        await fetchAlbumSets({
          access_token,

          doc: {
            search: '',
          },
        })

      const list =
        extractArray(response)

      setAlbumSets(list)

      return list
    }

  const setGalleryState = (
    galleries,
    albumSet
  ) => {
    const nextState =
      createGalleryState(
        galleries,
        albumSet
      )

    imagesByAlbumRef.current =
      nextState

    setImagesByAlbum(
      nextState
    )

    const loadingMap = {}

    Object.values(
      nextState
    ).forEach(bucket => {
      bucket.existingFiles
        .forEach(file => {
          loadingMap[
            file.uid
          ] = true
        })
    })

    setPreviewLoadingFiles(
      loadingMap
    )
  }

  const loadProperty =
    async () => {
      const response =
        await fetchPropertyById({
          access_token,
          id,
          force: true,
        })

      const detail =
        getPropertyDetail(
          response
        )

      const galleries =
        getPropertyGalleries(
          detail
        )

      setPropertyGalleries(
        galleries
      )

      const assignedSet =
        await resolveAssignedSet(
          detail
        )

      if (
        assignedSet &&
        getId(assignedSet)
      ) {
        setHasAssignedSet(true)

        setSelectedAlbumSet(
          assignedSet
        )

        setAlbumSets([
          assignedSet,
        ])

        setGalleryState(
          galleries,
          assignedSet
        )

        return detail
      }

      setHasAssignedSet(false)
      setSelectedAlbumSet(null)
      setImagesByAlbum({})

      imagesByAlbumRef.current =
        {}

      await loadAllSets()

      message.info(
        'Please select an Album Set.'
      )

      return detail
    }

  const loadModalData =
    async () => {
      setLoading(true)

      try {
        await loadProperty()
      } catch (error) {
        console.error(error)

        message.error(
          getErrorMessage(
            error,
            'Could not load upload data.'
          )
        )
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    if (
      !open ||
      !access_token ||
      !id
    ) {
      return
    }

    resetState()
    loadModalData()
  }, [
    open,
    access_token,
    id,
  ])

  useEffect(() => {
    return () => {
      clearObjectUrls()
    }
  }, [])

  useEffect(() => {
    if (
      !visibleAlbums.length
    ) {
      setActiveAlbumKey(null)
      return
    }

    setImagesByAlbum(
      previous => {
        const next = {
          ...previous,
        }

        visibleAlbums.forEach(
          album => {
            const current =
              next[album.key]

            next[album.key] = {
              ...(current ||
                createEmptyBucket()),

              albumSetId:
                selectedSetId,

              albumId:
                album._id ||
                null,

              existingFiles:
                current
                  ?.existingFiles ||
                [],

              newFiles:
                current
                  ?.newFiles ||
                [],
            }
          }
        )

        imagesByAlbumRef.current =
          next

        return next
      }
    )

    const activeExists =
      visibleAlbums.some(
        album =>
          album.key ===
          activeAlbumKey
      )

    if (!activeExists) {
      setActiveAlbumKey(
        visibleAlbums[0].key
      )
    }
  }, [
    visibleAlbums,
    activeAlbumKey,
    selectedSetId,
  ])

  const handleSetChange =
    async setId => {
      if (
        hasAssignedSet ||
        !setId
      ) {
        return
      }

      setLoadingSet(true)

      try {
        clearObjectUrls()

        const detail =
          await loadSetDetail(
            setId
          )

        setSelectedAlbumSet(
          detail
        )

        setActiveAlbumKey(
          null
        )

        setGalleryState(
          propertyGalleries,
          detail
        )

        setUploadPickerKey(
          previous =>
            previous + 1
        )
      } catch (error) {
        console.error(error)

        message.error(
          getErrorMessage(
            error,
            'Could not load Album Set.'
          )
        )
      } finally {
        setLoadingSet(false)
      }
    }

  const createLocalFile = (
    rawFile,
    index
  ) => {
    const previewUrl =
      URL.createObjectURL(
        rawFile
      )

    objectUrlsRef.current
      .add(previewUrl)

    return {
      uid:
        `local-${Date.now()}-` +
        `${index}-${Math.random()}`,

      name:
        rawFile?.name ||
        `image-${index + 1}`,

      type:
        rawFile?.type,

      size:
        rawFile?.size,

      lastModified:
        rawFile
          ?.lastModified,

      originFileObj:
        rawFile,

      previewUrl,
      status: 'done',

      albumSetId:
        selectedSetId ||
        null,

      albumId:
        activeAlbum?._id ||
        null,

      isExisting: false,
    }
  }

  const processSelectedImages =
    rawFiles => {
      if (
        !selectedSetId ||
        !activeAlbumKey ||
        loading ||
        loadingSet ||
        saving
      ) {
        return
      }

      const bucket =
        imagesByAlbumRef.current[
        activeAlbumKey
        ]

      if (!bucket) {
        return
      }

      const files =
        Array.isArray(rawFiles)
          ? rawFiles
          : []

      const validFiles =
        files.filter(
          file =>
            file?.type
              ?.startsWith(
                'image/'
              )
        )

      if (
        validFiles.length !==
        files.length
      ) {
        message.error(
          'Only image files are allowed.'
        )
      }

      const pending =
        bucket.newFiles || []

      const remaining =
        MAX_IMAGES_PER_ALBUM -
        pending.length

      if (remaining <= 0) {
        message.warning(
          `Maximum ` +
          `${MAX_IMAGES_PER_ALBUM} ` +
          `images per upload.`
        )

        return
      }

      const fingerprints =
        new Set(
          pending.map(
            getFileFingerprint
          )
        )

      const uniqueFiles = []

      validFiles.forEach(file => {
        const fingerprint =
          getFileFingerprint(
            file
          )

        if (
          fingerprints.has(
            fingerprint
          )
        ) {
          return
        }

        fingerprints.add(
          fingerprint
        )

        uniqueFiles.push(file)
      })

      const accepted =
        uniqueFiles.slice(
          0,
          remaining
        )

      const localFiles =
        accepted.map(
          createLocalFile
        )

      setImagesByAlbum(
        previous => {
          const current =
            previous[
            activeAlbumKey
            ] ||
            createEmptyBucket({
              albumSetId:
                selectedSetId,

              albumId:
                activeAlbum?._id,
            })

          const next = {
            ...previous,

            [activeAlbumKey]: {
              ...current,

              newFiles: [
                ...current.newFiles,
                ...localFiles,
              ],
            },
          }

          imagesByAlbumRef.current =
            next

          return next
        }
      )

      setUploadPickerKey(
        previous =>
          previous + 1
      )
    }

  const handleBeforeUpload = (
    file,
    fileList
  ) => {
    const selectedFiles =
      fileList?.length
        ? fileList
        : [file]

    if (
      file?.uid ===
      selectedFiles[0]?.uid
    ) {
      processSelectedImages(
        selectedFiles
      )
    }

    return Upload.LIST_IGNORE
  }

  const handlePreview =
    file => {
      const url =
        getPreviewUrl(file)

      if (!url) {
        return
      }

      Swal.fire({
        imageUrl: url,
        imageWidth: 500,
        showConfirmButton:
          false,
      })
    }

  const handleImageLoaded =
    uid => {
      setPreviewLoadingFiles(
        previous => {
          const next = {
            ...previous,
          }

          delete next[uid]

          return next
        }
      )
    }

  const handleRemoveFile =
    async file => {
      if (
        saving ||
        deletingFileUid ||
        !activeAlbumKey
      ) {
        return
      }

      if (!file?.isExisting) {
        revokeObjectUrl(
          file.previewUrl
        )

        setImagesByAlbum(
          previous => {
            const bucket =
              previous[
              activeAlbumKey
              ]

            const next = {
              ...previous,

              [activeAlbumKey]: {
                ...bucket,

                newFiles:
                  bucket.newFiles
                    .filter(
                      item =>
                        item.uid !==
                        file.uid
                    ),
              },
            }

            imagesByAlbumRef.current =
              next

            return next
          }
        )

        return
      }

      if (
        !file?.url ||
        !file?.propertyAlbumId
      ) {
        message.error(
          'Could not identify image.'
        )

        return
      }

      setDeletingFileUid(
        file.uid
      )

      try {
        await AllPropertyServices
          .removeImageGallery({
            access_token,
            propertyId: id,

            galleryId:
              file
                .propertyAlbumId,

            fileUrl:
              file.url,
          })

        setImagesByAlbum(
          previous => {
            const bucket =
              previous[
              activeAlbumKey
              ]

            const next = {
              ...previous,

              [activeAlbumKey]: {
                ...bucket,

                existingFiles:
                  bucket
                    .existingFiles
                    .filter(
                      item =>
                        item.uid !==
                        file.uid
                    ),
              },
            }

            imagesByAlbumRef.current =
              next

            return next
          }
        )

        message.success(
          'Image removed successfully.'
        )
      } catch (error) {
        console.error(error)

        message.error(
          getErrorMessage(
            error,
            'Could not remove image.'
          )
        )
      } finally {
        setDeletingFileUid(
          null
        )
      }
    }

  const uploadMedia =
    async groups => {
      const formData =
        new FormData()

      formData.append(
        'albumSetId',
        String(selectedSetId)
      )

      if (!groups.length) {
        formData.append(
          'albumId',
          JSON.stringify([])
        )
      } else if (
        groups.length === 1
      ) {
        const group =
          groups[0]

        formData.append(
          'albumId',
          group.albumId
            ? String(
              group.albumId
            )
            : 'null'
        )

        group.files.forEach(
          file => {
            formData.append(
              'gallery',
              file.originFileObj
            )
          }
        )
      } else {
        formData.append(
          'albumId',
          JSON.stringify(
            groups.map(
              group =>
                group.albumId ||
                null
            )
          )
        )

        groups.forEach(
          (
            group,
            index
          ) => {
            const fieldName =
              `gallery_${index + 1}`

            group.files.forEach(
              file => {
                formData.append(
                  fieldName,
                  file.originFileObj
                )
              }
            )
          }
        )
      }

      await AllPropertyServices
        .addPropertyMedia({
          access_token,
          propertyId: id,
          formData,
        })
    }

  const handleDone =
    async () => {
      if (!selectedSetId) {
        message.warning(
          'Please select an Album Set.'
        )

        return
      }

      const uploadGroups =
        visibleAlbums
          .map(album => {
            const bucket =
              imagesByAlbumRef
                .current[
              album.key
              ]

            const files =
              bucket?.newFiles ||
              []

            if (!files.length) {
              return null
            }

            return {
              albumId:
                album._id ||
                null,

              files,
            }
          })
          .filter(Boolean)

      setSaving(true)

      try {
        await uploadMedia(
          uploadGroups
        )

        message.success(
          uploadGroups.length
            ? 'Images uploaded successfully.'
            : 'Album Set saved successfully.'
        )

        setOpen(false)
        resetState()
      } catch (error) {
        console.error(error)

        message.error(
          getErrorMessage(
            error,
            'Could not save changes.'
          )
        )
      } finally {
        setSaving(false)
      }
    }

  const handleCancel =
    () => {
      if (
        saving ||
        deletingFileUid
      ) {
        return
      }

      setOpen(false)
      resetState()
    }

  const isBusy =
    loading ||
    loadingSet ||
    saving ||
    Boolean(
      deletingFileUid
    )

  return (
    <Modal
      title='Upload Images'
      open={open}
      width={800}
      closable={!isBusy}
      maskClosable={!isBusy}
      onCancel={
        isBusy
          ? undefined
          : handleCancel
      }
      footer={[
        <Button
          key='cancel'
          disabled={isBusy}
          onClick={
            handleCancel
          }
        >
          Cancel
        </Button>,

        <Button
          key='done'
          type='primary'
          loading={saving}
          disabled={
            loading ||
            loadingSet ||
            !selectedSetId ||
            Boolean(
              deletingFileUid
            )
          }
          onClick={
            handleDone
          }
        >
          Save Change
        </Button>,
      ]}
    >
      <Spin spinning={isBusy}>
        <div className='px-1 py-2'>
          <div className='mb-4 text-xs text-gray-500 dark:text-slate-400'>
            <span className='text-red-500'>
              Note:
            </span>{' '}

            {hasAssignedSet
              ? 'The Album Set is assigned automatically.'
              : 'Please select an Album Set.'}

            {' '}Maximum{' '}
            {MAX_IMAGES_PER_ALBUM}{' '}
            images per album per
            upload.
          </div>

          <div className='mb-3'>
            <label className='mb-1 block text-xs text-gray-700 dark:text-slate-300'>
              Album Set
            </label>

            <Select
              showSearch
              value={
                selectedSetId
              }
              loading={
                loading ||
                loadingSet
              }
              disabled={
                hasAssignedSet ||
                isBusy
              }
              placeholder='Select Album Set'
              optionFilterProp='label'
              className='w-full'
              options={setOptions}
              onChange={
                handleSetChange
              }
            />
          </div>

          {selectedSetId &&
            visibleAlbums.length >
            0 && (
              <>
                <Radio.Group
                  value={
                    activeAlbumKey
                  }
                  disabled={isBusy}
                  onChange={
                    event =>
                      setActiveAlbumKey(
                        event.target
                          .value
                      )
                  }
                  className='mb-4 flex flex-wrap gap-x-5 gap-y-2'
                >
                  {visibleAlbums.map(
                    album => (
                      <Radio
                        key={
                          album.key
                        }
                        value={
                          album.key
                        }
                      >
                        {album.nameEn}

                        {!album
                          .isNoneAlbum &&
                          album.nameKh &&
                          album.nameKh !==
                          album.nameEn && (
                            <Text
                              type='secondary'
                              className='ml-1 text-xs'
                            >
                              (
                              {
                                album.nameKh
                              }
                              )
                            </Text>
                          )}
                      </Radio>
                    )
                  )}
                </Radio.Group>

                <Dragger
                  key={
                    `${activeAlbumKey}-` +
                    uploadPickerKey
                  }
                  multiple
                  accept='image/*'
                  fileList={[]}
                  showUploadList={
                    false
                  }
                  disabled={
                    !activeAlbum ||
                    isBusy
                  }
                  beforeUpload={
                    handleBeforeUpload
                  }
                  className='!mb-4'
                  style={{
                    minHeight: 140,
                    padding:
                      '40px 0',

                    border:
                      '1px dashed ' +
                      '#91d5ff',

                    borderRadius: 8,
                  }}
                >
                  <CloudUploadOutlined
                    style={{
                      color:
                        '#1890ff',
                      fontSize: 30,
                    }}
                  />

                  <div className='mt-2 text-xs text-gray-500 dark:text-slate-400'>
                    Click or drag
                    images to upload
                  </div>
                </Dragger>

                <Row
                  gutter={[
                    12,
                    12,
                  ]}
                >
                  {activeFiles.map(
                    file => {
                      const imageUrl =
                        getPreviewUrl(
                          file
                        )

                      const isDeleting =
                        deletingFileUid ===
                        file.uid

                      const imageLoading =
                        Boolean(
                          file.isExisting &&
                          previewLoadingFiles[
                          file.uid
                          ]
                        )

                      return (
                        <Col
                          key={
                            file.uid
                          }
                          xs={8}
                          sm={6}
                          md={4}
                        >
                          <div className='relative h-[88px] overflow-hidden rounded-md border border-slate-200 bg-slate-100 dark:border-slate-600 dark:bg-slate-800'>
                            <img
                              src={
                                imageUrl
                              }
                              alt={
                                file.name ||
                                'Gallery image'
                              }
                              className='h-full w-full cursor-pointer object-cover'
                              onClick={() => {
                                if (
                                  !isDeleting
                                ) {
                                  handlePreview(
                                    file
                                  )
                                }
                              }}
                              onLoad={() =>
                                handleImageLoaded(
                                  file.uid
                                )
                              }
                              onError={() =>
                                handleImageLoaded(
                                  file.uid
                                )
                              }
                            />

                            <StyledDeleteButton
                              type='text'
                              danger
                              loading={
                                isDeleting
                              }
                              disabled={
                                isBusy &&
                                !isDeleting
                              }
                              icon={
                                !isDeleting
                                  ? (
                                    <DeleteOutlined />
                                  )
                                  : null
                              }
                              onClick={() =>
                                handleRemoveFile(
                                  file
                                )
                              }
                            />

                            {imageLoading && (
                              <ImageLoading />
                            )}
                          </div>
                        </Col>
                      )
                    }
                  )}
                </Row>

                {!activeFiles.length && (
                  <div className='py-4 text-center text-xs text-gray-400'>
                    No images in{' '}
                    {
                      activeAlbum
                        ?.nameEn
                    }
                    .
                  </div>
                )}
              </>
            )}

          {!loading &&
            !selectedSetId && (
              <div className='rounded-md border border-dashed border-slate-200 px-4 py-10 text-center text-xs text-gray-400 dark:border-slate-600'>
                This property has no
                assigned Album Set.
                Please select one.
              </div>
            )}
        </div>
      </Spin>
    </Modal>
  )
}