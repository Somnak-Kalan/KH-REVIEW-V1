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

import { AuthContext } from '../../../../contexts/AuthContext'
import AllPropertyServices from '../../../../services/ManageProperty/PlaceListing/AllProperty'
import useAlbumStore from '../../../../Stores/setups/album.store'
import useAlbumSetStore from '../../../../Stores/settings/setups/AlbumSet'
import ImageLoading from '../../../../components/Loading/ImageLoading'

const { Dragger } = Upload
const { Text } = Typography

const MAX_IMAGES_PER_ALBUM = 10

const NONE_ALBUM_ID_KEY =
  '__none_album__'

const LEGACY_ALBUM_SET_KEY =
  '__legacy_album_set__'

const NONE_ALBUM_NAME =
  'None Album'

const createAlbumBucketKey = (
  albumSetId,
  albumId
) => {
  const setKey = albumSetId
    ? String(albumSetId)
    : LEGACY_ALBUM_SET_KEY

  const albumKey = albumId
    ? String(albumId)
    : NONE_ALBUM_ID_KEY

  return `${setKey}::${albumKey}`
}

const createNoneAlbum =
  albumSetId => ({
    key: createAlbumBucketKey(
      albumSetId,
      null
    ),

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

const extractArray = response => {
  const candidates = [
    response?.data?.albums,
    response?.data?.items,
    response?.data?.results,
    response?.data?.docs,
    response?.data?.data,
    response?.albums,
    response?.items,
    response?.results,
    response?.data,
    response,
  ]

  return (
    candidates.find(
      Array.isArray
    ) || []
  )
}

const getErrorMessage = (
  error,
  fallbackMessage
) => {
  return (
    error?.response?.data?.msg ||
    error?.response?.data
      ?.message ||
    error?.response?.data
      ?.error ||
    error?.message ||
    fallbackMessage
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
        file?.url ||
        ''
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

const getGalleryAlbumSetId =
  gallery => {
    return getId(
      gallery?.albumSet ||
      gallery?.albumSetId ||
      gallery?.album_set ||
      gallery?.set ||
      gallery?.setId ||
      gallery?.set_id
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

const normalizeAlbum = (
  value,
  allAlbums,
  albumSetId
) => {
  if (!value) {
    return null
  }

  const nestedValue =
    typeof value === 'object'
      ? value.album ||
      value.albumId ||
      value.album_id ||
      value
      : value

  const albumId =
    getId(nestedValue) ||
    getId(value)

  if (!albumId) {
    return null
  }

  const albumFromList =
    allAlbums.find(
      album =>
        String(
          getId(album)
        ) ===
        String(albumId)
    )

  const album =
    albumFromList ||
    (
      typeof nestedValue ===
        'object'
        ? nestedValue
        : null
    ) ||
    (
      typeof value === 'object'
        ? value
        : null
    )

  if (!album) {
    return null
  }

  const nameEn =
    album?.nameEn ||
    album?.name_en ||
    album?.title ||
    album?.name ||
    'Album'

  return {
    key: createAlbumBucketKey(
      albumSetId,
      albumId
    ),

    _id:
      String(albumId),

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

const getAlbumsFromSet = (
  albumSet,
  allAlbums,
  albumSetId
) => {
  if (!albumSet) {
    return []
  }

  const possibleLists = [
    albumSet?.albums,
    albumSet?.albumIds,
    albumSet?.album_ids,
    albumSet?.albumList,
    albumSet?.albumDetails,
    albumSet?.album_details,
    albumSet?.items,
  ]

  const rawAlbums =
    possibleLists.find(
      Array.isArray
    ) || []

  const albumMap =
    new Map()

  rawAlbums.forEach(
    value => {
      const album =
        normalizeAlbum(
          value,
          allAlbums,
          albumSetId
        )

      if (!album) {
        return
      }

      albumMap.set(
        String(album._id),
        album
      )
    }
  )

  return Array.from(
    albumMap.values()
  )
}

const createPropertyGalleryState =
  galleryList => {
    const next = {}

      ; (galleryList || [])
        .forEach(
          (
            gallery,
            galleryIndex
          ) => {
            const albumSetId =
              getGalleryAlbumSetId(
                gallery
              )

            const albumId =
              getGalleryAlbumId(
                gallery
              )

            const bucketKey =
              createAlbumBucketKey(
                albumSetId,
                albumId
              )

            const propertyAlbumId =
              getId(gallery)

            if (!next[bucketKey]) {
              next[bucketKey] =
                createEmptyBucket({
                  albumSetId,
                  albumId,
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
                      getFileUrl(
                        file
                      )

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

                      status:
                        'done',

                      albumSetId:
                        albumSetId ||
                        null,

                      albumId:
                        albumId ||
                        null,

                      propertyAlbumId:
                        propertyAlbumId ||
                        null,

                      isExisting:
                        true,
                    }
                  }
                )
                .filter(Boolean)

            next[bucketKey] = {
              ...next[bucketKey],

              albumSetId:
                albumSetId ||
                null,

              albumId:
                albumId ||
                null,

              propertyAlbumId:
                next[bucketKey]
                  .propertyAlbumId ||
                propertyAlbumId ||
                null,

              existingFiles: [
                ...next[bucketKey]
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
  closeModalEditSetUp,
}) {
  const { access_token } =
    useContext(AuthContext)

  const fetchAlbum =
    useAlbumStore(
      state =>
        state.fetchAlbum
    )

  const albumSets =
    useAlbumSetStore(
      state =>
        state.albumSets
    )

  const albumSet =
    useAlbumSetStore(
      state =>
        state.albumSet
    )

  const loadingAlbumSets =
    useAlbumSetStore(
      state =>
        state.loadingList
    )

  const loadingAlbumSetDetail =
    useAlbumSetStore(
      state =>
        state.loadingDetail
    )

  const fetchAlbumSets =
    useAlbumSetStore(
      state =>
        state.fetchSets
    )

  const fetchAlbumSetById =
    useAlbumSetStore(
      state =>
        state.fetchSetById
    )

  const clearAlbumSet =
    useAlbumSetStore(
      state =>
        state.clearAlbumSet
    )

  const [
    allAlbums,
    setAllAlbums,
  ] = useState([])

  const [
    selectedSetId,
    setSelectedSetId,
  ] = useState(undefined)

  const [
    activeAlbumKey,
    setActiveAlbumKey,
  ] = useState(null)

  const [
    imagesByAlbum,
    setImagesByAlbum,
  ] = useState({})

  const [
    loadingPropertyData,
    setLoadingPropertyData,
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

  const selectedSetFromList =
    useMemo(() => {
      return (
        albumSets.find(
          item =>
            String(
              getId(item)
            ) ===
            String(
              selectedSetId
            )
        ) || null
      )
    }, [
      albumSets,
      selectedSetId,
    ])

  const selectedSetDetail =
    useMemo(() => {
      if (
        !albumSet ||
        !selectedSetId
      ) {
        return null
      }

      return String(
        getId(albumSet)
      ) ===
        String(selectedSetId)
        ? albumSet
        : null
    }, [
      albumSet,
      selectedSetId,
    ])

  const selectedSet =
    selectedSetDetail ||
    selectedSetFromList

  const visibleAlbums =
    useMemo(() => {
      if (
        !selectedSetId ||
        !selectedSet
      ) {
        return []
      }

      return [
        createNoneAlbum(
          selectedSetId
        ),

        ...getAlbumsFromSet(
          selectedSet,
          allAlbums,
          selectedSetId
        ),
      ]
    }, [
      selectedSetId,
      selectedSet,
      allAlbums,
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
      const urls =
        Array.from(
          objectUrlsRef.current
        )

      urls.forEach(url => {
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

  const resetPendingFiles =
    () => {
      clearObjectUrls()

      setImagesByAlbum(
        previous => {
          const next = {}

          Object.entries(
            previous
          ).forEach(
            ([
              key,
              bucket,
            ]) => {
              next[key] = {
                ...bucket,
                newFiles: [],
              }
            }
          )

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

  const resetState =
    () => {
      clearObjectUrls()
      clearAlbumSet()

      setAllAlbums([])

      setSelectedSetId(
        undefined
      )

      setActiveAlbumKey(
        null
      )

      setImagesByAlbum({})

      imagesByAlbumRef.current =
        {}

      setPreviewLoadingFiles(
        {}
      )

      setDeletingFileUid(
        null
      )

      setUploadPickerKey(
        previous =>
          previous + 1
      )
    }

  const closeParentModal =
    () => {
      if (
        typeof closeModalEditSetUp ===
        'function'
      ) {
        closeModalEditSetUp(
          false
        )
      }
    }

  const loadAlbums =
    async () => {
      if (
        typeof fetchAlbum !==
        'function'
      ) {
        throw new Error(
          'Album list API is not connected.'
        )
      }

      const response =
        await fetchAlbum({
          access_token,

          doc: {
            search: '',
          },
        })

      const albums =
        extractArray(
          response
        )

      setAllAlbums(
        albums
      )

      return albums
    }

  const loadAlbumSets =
    async () => {
      if (
        typeof fetchAlbumSets !==
        'function'
      ) {
        throw new Error(
          'Album Set list API is not connected.'
        )
      }

      return fetchAlbumSets({
        access_token,

        doc: {
          search: '',
        },
      })
    }

  const loadProperty =
    async () => {
      if (!id) {
        return null
      }

      const response =
        await AllPropertyServices
          .fetchNonBusinessPropertyById({
            access_token,
            id,
          })

      const detail =
        response?.data
          ?.locations?.[0] ||
        response?.locations?.[0] ||
        response?.data ||
        response ||
        null

      const galleries =
        Array.isArray(
          detail?.media?.gallery
        )
          ? detail.media.gallery
          : []

      const serverState =
        createPropertyGalleryState(
          galleries
        )

      setImagesByAlbum(
        previous => {
          const merged = {
            ...serverState,
          }

          Object.entries(
            previous
          ).forEach(
            ([
              key,
              bucket,
            ]) => {
              if (
                !bucket
                  ?.newFiles
                  ?.length
              ) {
                return
              }

              merged[key] = {
                ...(merged[key] ||
                  createEmptyBucket({
                    albumSetId:
                      bucket
                        .albumSetId,

                    albumId:
                      bucket
                        .albumId,
                  })),

                newFiles:
                  bucket.newFiles,
              }
            }
          )

          imagesByAlbumRef.current =
            merged

          return merged
        }
      )

      const loadingMap = {}

      Object.values(
        serverState
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

      return detail
    }

  const loadModalData =
    async () => {
      setLoadingPropertyData(
        true
      )

      try {
        await Promise.all([
          loadAlbums(),
          loadAlbumSets(),
          loadProperty(),
        ])
      } catch (error) {
        console.error(
          error
        )

        message.error(
          getErrorMessage(
            error,
            'Could not load image upload data.'
          )
        )
      } finally {
        setLoadingPropertyData(
          false
        )
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
      setActiveAlbumKey(
        null
      )

      return
    }

    setImagesByAlbum(
      previous => {
        const next = {
          ...previous,
        }

        visibleAlbums.forEach(
          album => {
            if (!next[album.key]) {
              next[album.key] =
                createEmptyBucket({
                  albumSetId:
                    selectedSetId,

                  albumId:
                    album._id,
                })
            } else {
              next[album.key] = {
                ...next[
                album.key
                ],

                albumSetId:
                  selectedSetId,

                albumId:
                  album._id ||
                  null,
              }
            }
          }
        )

        imagesByAlbumRef.current =
          next

        return next
      }
    )

    const activeStillVisible =
      visibleAlbums.some(
        album =>
          album.key ===
          activeAlbumKey
      )

    if (!activeStillVisible) {
      setActiveAlbumKey(
        visibleAlbums[0]
          .key
      )
    }
  }, [
    visibleAlbums,
    activeAlbumKey,
    selectedSetId,
  ])

  const handleSetChange =
    async value => {
      resetPendingFiles()
      clearAlbumSet()

      setSelectedSetId(
        value
      )

      if (!value) {
        setActiveAlbumKey(
          null
        )

        return
      }

      setActiveAlbumKey(
        createAlbumBucketKey(
          value,
          null
        )
      )

      try {
        await fetchAlbumSetById({
          access_token,
          setId: value,
        })
      } catch (error) {
        console.error(
          error
        )

        message.error(
          getErrorMessage(
            error,
            'Could not load the selected Album Set.'
          )
        )
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
        `${index}-` +
        `${Math.random()
          .toString(36)
          .slice(2)}`,

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

      status:
        'done',

      albumSetId:
        selectedSetId ||
        null,

      albumId:
        activeAlbum?._id ||
        null,

      isExisting:
        false,
    }
  }

  const processSelectedImages =
    rawFiles => {
      if (
        !selectedSetId ||
        !activeAlbumKey ||
        saving ||
        loadingPropertyData ||
        loadingAlbumSets ||
        loadingAlbumSetDetail
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

      const safeFiles =
        Array.isArray(
          rawFiles
        )
          ? rawFiles
          : []

      const validImageFiles =
        safeFiles.filter(
          file =>
            file?.type
              ?.startsWith(
                'image/'
              )
        )

      if (
        validImageFiles.length !==
        safeFiles.length
      ) {
        message.error(
          'Only image files are allowed.'
        )
      }

      const currentPending =
        bucket.newFiles ||
        []

      const remaining =
        MAX_IMAGES_PER_ALBUM -
        currentPending.length

      if (remaining <= 0) {
        message.warning(
          `Maximum ` +
          `${MAX_IMAGES_PER_ALBUM} ` +
          `images per album per upload.`
        )

        return
      }

      const existingFingerprints =
        new Set(
          currentPending.map(
            getFileFingerprint
          )
        )

      const uniqueRawFiles = []

      validImageFiles.forEach(
        file => {
          const fingerprint =
            getFileFingerprint(
              file
            )

          if (
            existingFingerprints.has(
              fingerprint
            )
          ) {
            return
          }

          existingFingerprints.add(
            fingerprint
          )

          uniqueRawFiles.push(
            file
          )
        }
      )

      const acceptedFiles =
        uniqueRawFiles.slice(
          0,
          remaining
        )

      if (
        uniqueRawFiles.length >
        remaining
      ) {
        message.warning(
          `Maximum ` +
          `${MAX_IMAGES_PER_ALBUM} ` +
          `images per album per upload.`
        )
      }

      const localFiles =
        acceptedFiles.map(
          createLocalFile
        )

      setImagesByAlbum(
        previous => {
          const currentBucket =
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
              ...currentBucket,

              albumSetId:
                selectedSetId,

              albumId:
                activeAlbum
                  ?._id ||
                null,

              newFiles: [
                ...(currentBucket
                  .newFiles ||
                  []),

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
    const selectedBatch =
      Array.isArray(
        fileList
      ) &&
        fileList.length
        ? fileList
        : [file]

    if (
      file?.uid ===
      selectedBatch[0]?.uid
    ) {
      processSelectedImages(
        selectedBatch
      )
    }

    return Upload.LIST_IGNORE
  }

  const handlePreview =
    file => {
      const url =
        getPreviewUrl(
          file
        )

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
      if (!uid) {
        return
      }

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
            const next = {
              ...previous,

              [activeAlbumKey]: {
                ...previous[
                activeAlbumKey
                ],

                newFiles: (
                  previous[
                    activeAlbumKey
                  ]
                    ?.newFiles ||
                  []
                ).filter(
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
          'Could not identify this image.'
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

            propertyId:
              id,

            galleryId:
              file
                .propertyAlbumId,

            fileUrl:
              file.url,
          })

        setImagesByAlbum(
          previous => {
            const next = {
              ...previous,

              [activeAlbumKey]: {
                ...previous[
                activeAlbumKey
                ],

                existingFiles: (
                  previous[
                    activeAlbumKey
                  ]
                    ?.existingFiles ||
                  []
                ).filter(
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
        console.error(
          error
        )

        message.error(
          getErrorMessage(
            error,
            'Could not remove the image.'
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
        String(
          selectedSetId
        )
      )

      /*
       * No images selected.
       * Save only the Album Set.
       */
      if (!groups.length) {
        formData.append(
          'albumId',
          JSON.stringify([])
        )
      }

      /*
       * Images belong to only
       * one album.
       */
      if (groups.length === 1) {
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
      }

      /*
       * Images belong to
       * multiple albums.
       */
      if (groups.length > 1) {
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

      return AllPropertyServices
        .addPropertyMedia({
          access_token,

          propertyId:
            id,

          formData,
        })
    }

  const handleDone =
    async () => {
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
              albumSetId:
                selectedSetId,

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
        closeParentModal()
        resetState()
      } catch (error) {
        console.error(
          error
        )

        message.error(
          getErrorMessage(
            error,
            'Could not save changes.'
          )
        )

        try {
          await loadProperty()
        } catch {
          // Keep current modal state.
        }
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
      closeParentModal()
      resetState()
    }

  const loading =
    loadingPropertyData ||
    loadingAlbumSets ||
    loadingAlbumSetDetail

  const isBusy =
    loading ||
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
      <Spin spinning={loading}>
        <div className='px-1 py-2'>
          <div className='mb-4 text-xs text-gray-500 dark:text-slate-400'>
            (
            <span className='text-red-500'>
              Note:
            </span>{' '}

            Select one Album Set
            and upload a maximum
            of{' '}

            {MAX_IMAGES_PER_ALBUM}{' '}

            images per album per
            upload. Albums can
            contain any number of
            images.)
          </div>

          <div className='mb-3'>
            <label className='mb-1 block text-xs text-gray-700 dark:text-slate-300'>
              Select Album Set
            </label>

            <Select
              showSearch
              allowClear
              value={
                selectedSetId
              }
              loading={
                loadingAlbumSets
              }
              disabled={isBusy}
              placeholder='Select Album Set'
              optionFilterProp='label'
              className='w-full'
              onChange={
                handleSetChange
              }
              options={
                albumSets
                  .map(item => ({
                    value:
                      getId(item),

                    label:
                      getAlbumSetName(
                        item
                      ),
                  }))
                  .filter(
                    option =>
                      Boolean(
                        option.value
                      )
                  )
              }
            />
          </div>

          {selectedSetId && (
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
                      <span>
                        {album.nameEn}
                      </span>

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

                  borderRadius:
                    8,
                }}
              >
                <CloudUploadOutlined
                  style={{
                    color:
                      '#1890ff',

                    fontSize:
                      30,
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

                    const isNetworkLoading =
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
                            disabled={
                              isBusy &&
                              !isDeleting
                            }
                            loading={
                              isDeleting
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

                          {isNetworkLoading && (
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
                  No images selected
                  in{' '}

                  {
                    activeAlbum
                      ?.nameEn
                  }
                  .
                </div>
              )}
            </>
          )}

          {!selectedSetId && (
            <div className='rounded-md border border-dashed border-slate-200 px-4 py-10 text-center text-xs text-gray-400 dark:border-slate-600'>
              Select an Album Set
              first to show its
              albums.
            </div>
          )}
        </div>
      </Spin>
    </Modal>
  )
}