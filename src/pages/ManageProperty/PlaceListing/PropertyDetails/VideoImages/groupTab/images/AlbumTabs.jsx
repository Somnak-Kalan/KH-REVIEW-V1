import React, {
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Button,
  Empty,
  message,
  Typography,
} from 'antd'

import { useAllPropertyStore } from '../../../../../../../Stores/ManageProperty/AllProperty/AllProperty.store'
import useAlbumSetStore from '../../../../../../../Stores/settings/setups/AlbumSet'

import PreviewImage from '../../../placeInformation/slideshow/PreviewImage'
import SelectIcon from '../../../../../../../assets/icon/placeicon/select.svg'
import PropertyAlbumServices from '../../../../../../../services/ManageProperty/PlaceListing/Album'
import AlbumGallery from './AlbumGallery'
import './groupTab-custom.css'

const { Text, Title } = Typography

const NONE_ALBUM_NAME =
  'None Album'

const getId = value => {
  if (!value) {
    return null
  }

  if (
    typeof value ===
    'string'
  ) {
    return value
  }

  return (
    value?._id ||
    value?.id ||
    value?.albumId ||
    value?.setId ||
    null
  )
}

/*
 * Use this only when we need the
 * MongoDB record ID of an object.
 *
 * Do not use albumId as a fallback.
 */
const getRecordId = value => {
  if (!value) {
    return null
  }

  if (
    typeof value ===
    'string'
  ) {
    return value
  }

  return (
    value?._id ||
    value?.id ||
    null
  )
}

const getFileUrl = file => {
  if (
    typeof file ===
    'string'
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

const getAlbumValue =
  gallery => {
    if (
      gallery?.album &&
      typeof gallery.album ===
      'object'
    ) {
      return gallery.album
    }

    if (
      gallery?.albumId &&
      typeof gallery.albumId ===
      'object'
    ) {
      return gallery.albumId
    }

    return null
  }

const getAlbumsFromSet =
  albumSet => {
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

const getAlbumSetName =
  albumSet => {
    return (
      albumSet?.nameEn ||
      albumSet?.name_en ||
      albumSet?.name ||
      albumSet?.title ||
      'Album Set'
    )
  }

const getAlbumNameEn =
  album => {
    return (
      album?.nameEn ||
      album?.name_en ||
      album?.name ||
      album?.title ||
      'Album'
    )
  }

const getAlbumNameKh =
  album => {
    return (
      album?.nameKh ||
      album?.name_kh ||
      getAlbumNameEn(album)
    )
  }

const getAssignedSetIds =
  albumSets => {
    return [
      ...new Set(
        (albumSets || [])
          .map(getId)
          .filter(Boolean)
          .map(String)
      ),
    ]
  }

const getSetIdsContainingAlbum = (
  albumSetDetails,
  albumId
) => {
  if (!albumId) {
    return []
  }

  return albumSetDetails
    .filter(albumSet =>
      getAlbumsFromSet(
        albumSet
      ).some(
        album =>
          String(
            getId(album)
          ) ===
          String(albumId)
      )
    )
    .map(getId)
    .filter(Boolean)
}

const getExplicitAlbumSetId = (
  gallery,
  album
) => {
  return (
    getId(
      gallery?.albumSetId
    ) ||
    getId(
      gallery?.albumSet
    ) ||
    getId(
      gallery?.album_set
    ) ||
    getId(
      album?.albumSetId
    ) ||
    getId(
      album?.albumSet
    ) ||
    null
  )
}

const buildAlbumGroups = (
  galleries,
  albumSetDetails
) => {
  return (galleries || []).map(
    (
      gallery,
      galleryIndex
    ) => {
      const album =
        getAlbumValue(
          gallery
        )

      const albumId =
        getId(album) ||
        (
          typeof gallery
            ?.albumId ===
            'string'
            ? gallery.albumId
            : null
        )

      const explicitAlbumSetId =
        getExplicitAlbumSetId(
          gallery,
          album
        )

      const matchingSetIds =
        getSetIdsContainingAlbum(
          albumSetDetails,
          albumId
        )

      const albumSetId =
        explicitAlbumSetId ||
        (
          matchingSetIds.length ===
            1
            ? matchingSetIds[0]
            : null
        )

      const albumSet =
        albumSetDetails.find(
          item =>
            String(
              getId(item)
            ) ===
            String(albumSetId)
        ) || null

      const propertyGalleryId =
        getRecordId(
          gallery
        )

      const galleryKey =
        propertyGalleryId ||
        `gallery-${galleryIndex}`

      const isNoneAlbum =
        !albumId

      const nameEn =
        isNoneAlbum
          ? NONE_ALBUM_NAME
          : getAlbumNameEn(
            album
          )

      const nameKh =
        isNoneAlbum
          ? NONE_ALBUM_NAME
          : getAlbumNameKh(
            album
          )

      const rawFiles =
        Array.isArray(
          gallery?.files
        )
          ? gallery.files
          : []

      /*
       * This keeps the exact image
       * order returned by the API.
       */
      const files =
        rawFiles
          .map(getFileUrl)
          .filter(
            file =>
              typeof file ===
              'string' &&
              file.trim()
          )

      return {
        key:
          String(
            galleryKey
          ),

        /*
         * Original position from API.
         * Useful for debugging.
         */
        galleryIndex,

        galleryId:
          propertyGalleryId
            ? String(
              propertyGalleryId
            )
            : null,

        albumSetId:
          albumSetId
            ? String(
              albumSetId
            )
            : null,

        albumId:
          albumId
            ? String(
              albumId
            )
            : null,

        albumSet,
        album,

        setNameEn:
          albumSet
            ? getAlbumSetName(
              albumSet
            )
            : '',

        nameEn,
        nameKh,
        isNoneAlbum,

        /*
         * files.map also keeps the exact
         * image order from gallery.files.
         */
        images: files.map(
          (
            file,
            fileIndex
          ) => ({
            id: [
              galleryKey,
              fileIndex,
              file,
            ].join('::'),

            fileIndex,

            galleryId:
              propertyGalleryId
                ? String(
                  propertyGalleryId
                )
                : null,

            albumSetId:
              albumSetId
                ? String(
                  albumSetId
                )
                : null,

            albumId:
              albumId
                ? String(
                  albumId
                )
                : null,

            albumKey:
              String(
                galleryKey
              ),

            albumNameEn:
              nameEn,

            albumNameKh:
              nameKh,

            url: file,
          })
        ),

        raw: gallery,
      }
    }
  )
}

const getDestinationKey = (
  albumSetId,
  albumId
) => {
  return [
    albumSetId,
    albumId,
  ].join('::')
}

const buildDestinationAlbums =
  albumSetDetails => {
    const destinationMap =
      new Map()

    albumSetDetails.forEach(
      albumSet => {
        const albumSetId =
          getId(albumSet)

        if (!albumSetId) {
          return
        }

        getAlbumsFromSet(
          albumSet
        ).forEach(album => {
          const albumId =
            getId(album)

          if (!albumId) {
            return
          }

          const key =
            getDestinationKey(
              albumSetId,
              albumId
            )

          destinationMap.set(
            key,
            {
              key,

              albumSetId:
                String(
                  albumSetId
                ),

              albumSetNameEn:
                getAlbumSetName(
                  albumSet
                ),

              albumId:
                String(
                  albumId
                ),

              albumNameEn:
                getAlbumNameEn(
                  album
                ),

              albumNameKh:
                getAlbumNameKh(
                  album
                ),

              albumSet,
              album,
            }
          )
        })
      }
    )

    return Array.from(
      destinationMap.values()
    )
  }

const getImageIdentity =
  image => {
    return [
      image?.galleryId || '',
      image?.url || '',
    ].join('::')
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

export default function AlbumTabs({
  galleries = [],
  albumSets = [],
  id,
  access_token,
  getFileByName,

  /*
   * Both are optional.
   *
   * Pass whichever refresh callback
   * your parent component already has.
   */
  refreshProperty,
  getBusinessProperty,
}) {
  const movePropertyGalleryImages =
    useAllPropertyStore(
      state =>
        state
          .movePropertyGalleryImages
    )

  const reorderPropertyGalleryImages =
    useAllPropertyStore(
      state =>
        state
          .reorderPropertyGalleryImages
    )

  /*
   * Fallback refresh action.
   */
  const refreshPropertyById =
    useAllPropertyStore(
      state =>
        state
          .fetchNonBusinessPropertyById
    )

  const movingImages =
    useAllPropertyStore(
      state =>
        Boolean(
          state.galleryMoving
        )
    )

  const savingOrder =
    useAllPropertyStore(
      state =>
        Boolean(
          state
            .galleryOrderSaving
        )
    )

  const fetchAlbumSetById =
    useAlbumSetStore(
      state =>
        state.fetchSetById
    )

  const [
    albumSetDetails,
    setAlbumSetDetails,
  ] = useState([])

  const [
    loadingAlbumSetDetails,
    setLoadingAlbumSetDetails,
  ] = useState(false)

  const [
    previewOpen,
    setPreviewOpen,
  ] = useState(false)

  const [
    previewGalleries,
    setPreviewGalleries,
  ] = useState([])
  const [
    previewInitialImageUrl,
    setPreviewInitialImageUrl,
  ] = useState('')


  const [
    activeKey,
    setActiveKey,
  ] = useState('all')

  const [
    selectionMode,
    setSelectionMode,
  ] = useState(false)

  const [
    selectedImageIds,
    setSelectedImageIds,
  ] = useState([])

  const [
    reorderMode,
    setReorderMode,
  ] = useState(false)

  const [
    reorderImages,
    setReorderImages,
  ] = useState([])

  const [
    imgLoading,
    setImgLoading,
  ] = useState({})

  /*
   * This was missing in your code.
   */
  const [
    deletingSelectedImages,
    setDeletingSelectedImages,
  ] = useState(false)

  /*
   * Hide deleted images immediately
   * while the parent is refreshing.
   */
  const [
    deletedImageKeys,
    setDeletedImageKeys,
  ] = useState([])

  const deletingImages =
    deletingSelectedImages

  /*
   * Load complete details for every
   * Album Set assigned to the property.
   */

  useEffect(() => {
    let mounted = true

    const loadAlbumSetDetails =
      async () => {
        const setIds =
          getAssignedSetIds(
            albumSets
          )

        if (
          !access_token ||
          !setIds.length
        ) {
          if (mounted) {
            setAlbumSetDetails(
              []
            )
          }

          return
        }

        setLoadingAlbumSetDetails(
          true
        )

        const details = []

        try {

          for (
            const setId of
            setIds
          ) {
            try {
              const detail =
                await fetchAlbumSetById(
                  {
                    access_token,
                    setId,
                    _id: setId,
                  }
                )

              if (
                detail?._id ||
                detail?.id
              ) {
                details.push(
                  detail
                )
              }
            } catch (error) {
              console.error(
                `Could not load Album Set ${setId}:`,
                error
              )
            }
          }

          if (mounted) {
            setAlbumSetDetails(
              details
            )
          }
        } finally {
          if (mounted) {
            setLoadingAlbumSetDetails(
              false
            )
          }
        }
      }

    loadAlbumSetDetails()

    return () => {
      mounted = false
    }
  }, [
    access_token,
    albumSets,
    fetchAlbumSetById,
  ])

  const albumGroups =
    useMemo(() => {
      const deletedSet =
        new Set(
          deletedImageKeys
        )



      const groups =
        buildAlbumGroups(
          galleries,
          albumSetDetails
        ).map(group => ({
          ...group,

          images:
            group.images.filter(
              image =>
                !deletedSet.has(
                  getImageIdentity(
                    image
                  )
                )
            ),
        }))

      return groups
    }, [
      galleries,
      albumSetDetails,
      deletedImageKeys,
    ])
  const allImages =
    useMemo(
      () =>
        albumGroups.flatMap(
          group =>
            group.images
        ),
      [albumGroups]
    )

  const activeGroup =
    useMemo(
      () =>
        albumGroups.find(
          group =>
            group.key ===
            activeKey
        ) || null,
      [
        albumGroups,
        activeKey,
      ]
    )

  const selectedImages =
    useMemo(() => {
      if (!activeGroup) {
        return []
      }

      const selectedSet =
        new Set(
          selectedImageIds
        )

      return activeGroup
        .images
        .filter(
          image =>
            selectedSet.has(
              image.id
            )
        )
    }, [
      activeGroup,
      selectedImageIds,
    ])

  const destinationAlbums =
    useMemo(
      () =>
        buildDestinationAlbums(
          albumSetDetails
        ),
      [albumSetDetails]
    )

  const destinationMap =
    useMemo(
      () =>
        new Map(
          destinationAlbums.map(
            destination => [
              destination.key,
              destination,
            ]
          )
        ),
      [destinationAlbums]
    )

  const destinationOptions =
    useMemo(() => {
      if (!activeGroup) {
        return []
      }

      const groupedOptions =
        new Map()

      destinationAlbums.forEach(
        destination => {
          const isCurrentAlbum =
            destination
              .albumSetId ===
            activeGroup
              .albumSetId &&
            destination
              .albumId ===
            activeGroup
              .albumId

          if (isCurrentAlbum) {
            return
          }

          if (
            !groupedOptions.has(
              destination
                .albumSetId
            )
          ) {
            groupedOptions.set(
              destination
                .albumSetId,
              {
                label:
                  destination
                    .albumSetNameEn,

                options: [],
              }
            )
          }

          groupedOptions
            .get(
              destination
                .albumSetId
            )
            .options.push({
              value:
                destination.key,

              label:
                destination
                  .albumNameKh &&
                  destination
                    .albumNameKh !==
                  destination
                    .albumNameEn
                  ? `${destination.albumNameEn} — ${destination.albumNameKh}`
                  : destination
                    .albumNameEn,
            })
        }
      )

      return Array.from(
        groupedOptions.values()
      ).filter(
        group =>
          group.options.length > 0
      )
    }, [
      activeGroup,
      destinationAlbums,
    ])

  const hasReorderChanges =
    useMemo(() => {
      if (
        !activeGroup ||
        !reorderMode ||
        reorderImages.length !==
        activeGroup
          .images
          .length
      ) {
        return false
      }

      return reorderImages.some(
        (
          image,
          index
        ) => {
          return (
            getImageIdentity(
              image
            ) !==
            getImageIdentity(
              activeGroup
                .images[index]
            )
          )
        }
      )
    }, [
      activeGroup,
      reorderMode,
      reorderImages,
    ])

  /*
   * Reset temporary delete state
   * when opening another property.
   */
  useEffect(() => {
    setDeletedImageKeys([])
    setDeletingSelectedImages(
      false
    )
    setSelectionMode(false)
    setSelectedImageIds([])
    setActiveKey('all')
  }, [id])

  useEffect(() => {
    setImgLoading(
      previous => {
        const next = {}

        allImages.forEach(
          image => {
            next[image.url] =
              previous[
              image.url
              ] ?? true
          }
        )

        return next
      }
    )
  }, [allImages])

  useEffect(() => {
    const validKeys = [
      'all',

      ...albumGroups.map(
        group =>
          group.key
      ),
    ]

    if (
      !validKeys.includes(
        activeKey
      )
    ) {
      setActiveKey('all')
      setSelectionMode(false)
      setSelectedImageIds([])
      setReorderMode(false)
      setReorderImages([])
    }
  }, [
    albumGroups,
    activeKey,
  ])

  useEffect(() => {
    if (!activeGroup) {
      setSelectedImageIds(
        []
      )

      return
    }

    const validIds =
      new Set(
        activeGroup.images.map(
          image =>
            image.id
        )
      )

    setSelectedImageIds(
      previous =>
        previous.filter(
          imageId =>
            validIds.has(
              imageId
            )
        )
    )
  }, [activeGroup])

  // const stopImageLoading =
  //   url => {
  //     if (!url) {
  //       return
  //     }

  //     setImgLoading(
  //       previous => ({
  //         ...previous,
  //         [url]: false,
  //       })
  //     )
  //   }
  const stopImageLoading =
    url => {
      if (!url) {
        return
      }

      setImgLoading(previous => {
        // Already false, don't update state
        if (
          previous[url] === false
        ) {
          return previous
        }

        return {
          ...previous,
          [url]: false,
        }
      })
    }

  const resetSelection =
    () => {
      setSelectionMode(false)
      setSelectedImageIds([])
    }

  const resetReorder =
    () => {
      setReorderMode(false)
      setReorderImages([])
    }

  const handleTabChange =
    nextKey => {
      if (
        deletingImages ||
        movingImages ||
        savingOrder
      ) {
        return
      }

      setActiveKey(nextKey)
      resetSelection()
      resetReorder()
    }

  const handleSelectImage =
    () => {
      if (
        !activeGroup
          ?.images
          ?.length
      ) {
        return
      }

      resetReorder()
      setSelectionMode(true)
      setSelectedImageIds([])
    }

  const handleCancelReorder =
    () => {
      if (savingOrder) {
        return
      }

      resetReorder()
    }

  const handleToggleImage =
    imageId => {
      setSelectedImageIds(
        previous => {
          if (
            previous.includes(
              imageId
            )
          ) {
            return previous.filter(
              currentId =>
                currentId !==
                imageId
            )
          }

          return [
            ...previous,
            imageId,
          ]
        }
      )
    }

  const handleSelectAll =
    () => {
      if (!activeGroup) {
        return
      }

      const allIds =
        activeGroup.images.map(
          image =>
            image.id
        )

      const allSelected =
        allIds.length > 0 &&
        allIds.every(
          imageId =>
            selectedImageIds
              .includes(
                imageId
              )
        )

      setSelectedImageIds(
        allSelected
          ? []
          : allIds
      )
    }

  const handlePreview =
    image => {
      const group =
        albumGroups.find(
          item =>
            item.key ===
            image.albumKey
        )

      if (!group) {
        return
      }

      // Remember exactly which image
      // the user clicked
      setPreviewInitialImageUrl(
        image.url
      )

      // Keep your existing album images
      setPreviewGalleries([
        {
          _id:
            group.galleryId,

          category_gallery:
            group.nameEn,

          album:
            group.album,

          files:
            group.images.map(
              item =>
                item.url
            ),
        },
      ])

      setPreviewOpen(true)
    }
  // const handlePreview =
  //   image => {
  //     const group =
  //       albumGroups.find(
  //         item =>
  //           item.key ===
  //           image.albumKey
  //       )

  //     if (!group) {
  //       return
  //     }

  //     setPreviewGalleries([
  //       {
  //         _id:
  //           group.galleryId,

  //         category_gallery:
  //           group.nameEn,

  //         album:
  //           group.album,

  //         files:
  //           group.images.map(
  //             item =>
  //               item.url
  //           ),
  //       },
  //     ])

  //     setPreviewOpen(true)
  //   }

  const refreshAfterDelete =
    async () => {
      const payload = {
        access_token,
        id,
        force: true,
      }

      if (
        typeof refreshProperty ===
        'function'
      ) {
        await refreshProperty(
          payload
        )

        return
      }

      if (
        typeof getBusinessProperty ===
        'function'
      ) {
        await getBusinessProperty(
          payload
        )

        return
      }

      if (
        typeof refreshPropertyById ===
        'function'
      ) {
        await refreshPropertyById(
          payload
        )
      }
    }

  const handleDeleteSelected =
    async () => {
      if (
        !selectedImages.length ||
        deletingSelectedImages
      ) {
        return false
      }

      /*
       * galleryId must be the real
       * media.gallery MongoDB _id.
       */
      const validImages =
        selectedImages.filter(
          image =>
            Boolean(
              image?.galleryId &&
              image?.url
            )
        )

      const invalidImages =
        selectedImages.filter(
          image =>
            !image?.galleryId ||
            !image?.url
        )

      if (!validImages.length) {
        console.error(
          'Invalid selected images:',
          selectedImages
        )

        message.error(
          'Could not identify the selected images.'
        )

        return false
      }

      setDeletingSelectedImages(
        true
      )

      const deletedImages = []

      const failedImages = [
        ...invalidImages,
      ]

      try {

        for (
          const image of
          validImages
        ) {
          try {
            const response =
              await PropertyAlbumServices
                .removeImageGallery({
                  _id: id,

                  /*
                   * Property gallery record ID.
                   */
                  albumId:
                    image.galleryId,

                  doc: {
                    galleryFile:
                      image.url,
                  },

                  access_token,
                })

            const responseData =
              response?.data ??
              response

            if (
              responseData
                ?.success ===
              false
            ) {
              throw new Error(
                responseData?.msg ||
                responseData
                  ?.message ||
                'Could not delete image.'
              )
            }

            deletedImages.push(
              image
            )
          } catch (error) {
            failedImages.push(
              image
            )

            console.error(
              'Delete image failed:',
              {
                propertyId: id,

                galleryId:
                  image.galleryId,

                galleryFile:
                  image.url,

                error,
              }
            )
          }
        }

        const deletedCount =
          deletedImages.length

        const failedCount =
          failedImages.length

        if (deletedCount > 0) {
          /*
           * Hide successfully deleted
           * images immediately.
           */
          const deletedKeys =
            deletedImages.map(
              getImageIdentity
            )

          setDeletedImageKeys(
            previous => [
              ...new Set([
                ...previous,
                ...deletedKeys,
              ]),
            ]
          )

          /*
           * Remove successful images from
           * the current selection.
           */
          const deletedIds =
            new Set(
              deletedImages.map(
                image =>
                  image.id
              )
            )

          setSelectedImageIds(
            previous =>
              previous.filter(
                imageId =>
                  !deletedIds.has(
                    imageId
                  )
              )
          )

          /*
           * Refresh once after all delete
           * requests finish.
           */
          try {
            await refreshAfterDelete()
          } catch (
          refreshError
          ) {
            console.error(
              'Property refresh failed:',
              refreshError
            )
          }
        }

        if (
          deletedCount === 0
        ) {
          message.error(
            `${failedCount} image(s) could not be deleted.`
          )

          return false
        }

        if (
          failedCount > 0
        ) {
          /*
           * Keep only failed images
           * selected for retry.
           */
          setSelectedImageIds(
            failedImages
              .map(
                image =>
                  image.id
              )
              .filter(Boolean)
          )

          message.warning(
            `${deletedCount} image(s) deleted, ${failedCount} failed.`
          )

          return false
        }

        resetSelection()

        message.success(
          `${deletedCount} image(s) deleted successfully.`
        )

        return true
      } catch (error) {
        console.error(
          'Delete selected images error:',
          error
        )

        message.error(
          getErrorMessage(
            error,
            'Could not delete the selected images.'
          )
        )

        return false
      } finally {
        setDeletingSelectedImages(
          false
        )
      }
    }

  const handleMoveSelected =
    async targetKey => {
      if (
        !activeGroup ||
        !selectedImages.length
      ) {
        return false
      }

      const destination =
        destinationMap.get(
          targetKey
        )

      if (!destination) {
        message.error(
          'The destination album was not found.'
        )

        return false
      }

      const destinationSet =
        albumSetDetails.find(
          albumSet =>
            String(
              getId(albumSet)
            ) ===
            String(
              destination
                .albumSetId
            )
        )

      const albumBelongsToSet =
        getAlbumsFromSet(
          destinationSet
        ).some(
          album =>
            String(
              getId(album)
            ) ===
            String(
              destination
                .albumId
            )
        )

      if (!albumBelongsToSet) {
        console.error(
          'Invalid destination pair:',
          {
            targetAlbumSetId:
              destination
                .albumSetId,

            targetAlbumId:
              destination
                .albumId,

            destinationSet,
          }
        )

        message.error(
          'The selected album does not belong to the selected album set.'
        )

        return false
      }

      const moveAll =
        selectedImages.length ===
        activeGroup.images.length

      const fileUrls =
        selectedImages
          .map(
            image =>
              image.url
          )
          .filter(Boolean)

      const movePayload = {
        access_token,
        propertyId: id,

        sourceAlbumSetId:
          activeGroup
            .albumSetId ??
          null,

        sourceAlbumId:
          activeGroup
            .albumId ??
          null,

        targetAlbumSetId:
          destination
            .albumSetId,

        targetAlbumId:
          destination
            .albumId,

        fileUrls,
        moveAll,
      }

      try {
        const response =
          await movePropertyGalleryImages(
            movePayload
          )

        const movedCount =
          response?.movedCount ??
          selectedImages.length

        resetSelection()

        message.success(
          `${movedCount} image${movedCount === 1
            ? ''
            : 's'
          } moved to “${destination
            .albumNameEn
          }” successfully.`
        )

        return true
      } catch (error) {
        console.error(
          'Move images error:',
          error
        )

        message.error(
          getErrorMessage(
            error,
            'Could not move the selected images.'
          )
        )

        return false
      }
    }

  const handleSaveReorder =
    async () => {
      if (
        !activeGroup ||
        !hasReorderChanges
      ) {
        return false
      }

      try {
        await reorderPropertyGalleryImages(
          {
            access_token,
            propertyId: id,

            galleryId:
              activeGroup
                .galleryId,

            albumId:
              activeGroup
                .albumId,

            fileUrls:
              reorderImages.map(
                image =>
                  image.url
              ),
          }
        )

        resetReorder()

        message.success(
          'Image order saved successfully.'
        )

        return true
      } catch (error) {
        console.error(error)

        message.error(
          getErrorMessage(
            error,
            'Could not save the image order.'
          )
        )

        return false
      }
    }

  const renderEmpty =
    description => (
      <div className='album-gallery-empty'>
        <Empty
          description={
            description
          }
        />
      </div>
    )

  const allTabContent = (
    <div className='album-all-groups'>
      {albumGroups.length ===
        0
        ? renderEmpty(
          'No albums'
        )
        : albumGroups.map(
          group => (


            < section
              key={group.key}
              className='album-all-group'
            >
              <div className='album-group-title-row'>
                <Title
                  level={5}
                  className='album-group-title'
                >
                  {
                    group.nameEn
                  }
                </Title>


                {!group.setNameEn &&
                  group.nameKh !==
                  group.nameEn && (
                    <Text
                      type='secondary'
                      className='album-group-kh'
                    >
                      (
                      {
                        group
                          .nameKh
                      }
                      )
                    </Text>
                  )}
              </div>

              <AlbumGallery
                group={group}
                destinationOptions={
                  []
                }
                selectionMode={
                  false
                }
                reorderMode={
                  false
                }
                selectedImageIds={
                  []
                }
                reorderImages={
                  []
                }
                deleting={false}
                moving={false}
                savingOrder={
                  false
                }
                reorderChanged={
                  false
                }
                onToggleImage={() => { }}
                onSelectAll={() => { }}
                onCancelSelection={() => { }}
                onDeleteSelected={
                  async () =>
                    false
                }
                onMoveSelected={
                  async () =>
                    false
                }
                onReorderChange={() => { }}
                onCancelReorder={() => { }}
                onSaveReorder={
                  async () =>
                    false
                }
                onPreview={
                  handlePreview
                }
                imgLoading={
                  imgLoading
                }
                onImageLoad={
                  stopImageLoading
                }
                onImageError={
                  stopImageLoading
                }
              />
            </section>
          )
        )
      }
    </div >
  )

  const tabItems = [
    {
      key: 'all',
      title: 'All',
      count:
        allImages.length,
      children:
        allTabContent,
    },

    ...albumGroups.map(
      group => ({
        key:
          group.key,

        title:
          group.setNameEn
            ? `${group.nameEn}`
            : group.nameEn,

        count:
          group.images.length,

        children: (
          <AlbumGallery
            group={group}
            destinationOptions={
              activeKey ===
                group.key
                ? destinationOptions
                : []
            }
            selectionMode={
              selectionMode &&
              activeKey ===
              group.key
            }
            reorderMode={
              reorderMode &&
              activeKey ===
              group.key
            }
            selectedImageIds={
              activeKey ===
                group.key
                ? selectedImageIds
                : []
            }
            reorderImages={
              activeKey ===
                group.key
                ? reorderImages
                : []
            }
            deleting={
              deletingImages
            }
            moving={
              movingImages
            }
            savingOrder={
              savingOrder
            }
            reorderChanged={
              activeKey ===
              group.key &&
              hasReorderChanges
            }
            onToggleImage={
              handleToggleImage
            }
            onSelectAll={
              handleSelectAll
            }
            onCancelSelection={
              resetSelection
            }
            onDeleteSelected={
              handleDeleteSelected
            }
            onMoveSelected={
              handleMoveSelected
            }
            onReorderChange={
              setReorderImages
            }
            onCancelReorder={
              handleCancelReorder
            }
            onSaveReorder={
              handleSaveReorder
            }
            onPreview={
              handlePreview
            }
            imgLoading={
              imgLoading
            }
            onImageLoad={
              stopImageLoading
            }
            onImageError={
              stopImageLoading
            }
          />
        ),
      })
    ),
  ]

  const activeTabContent =
    tabItems.find(
      item =>
        item.key ===
        activeKey
    )?.children || null

  const canShowAlbumActions =
    Boolean(
      activeKey !== 'all' &&
      activeGroup
        ?.images
        ?.length &&
      !selectionMode &&
      !reorderMode
    )

  return (
    <>
      <div className='px-5'>
        <PreviewImage
          open={previewOpen}
          setOpen={
            setPreviewOpen
          }
          galleries={
            previewGalleries
          }
          getFileByName={
            getFileByName
          }

          //  Send selected image
          initialImageUrl={
            previewInitialImageUrl
          }
        />

        <div className=''>
          <div className='flex items-center gap-2 mb-4'>
            <div className='text-[11px]  text-slate-500 dark:text-slate-400'>
              Album Sets:
            </div>

            {albumSets?.length ? (
              <div className='flex flex-wrap items-center gap-1'>
                {albumSets.map(
                  (
                    albumSet,
                    index
                  ) => (
                    <span
                      key={getId(
                        albumSet
                      )}
                      className='text-[12px] font-medium text-blue-600 dark:text-blue-400'
                    >
                      {getAlbumSetName(
                        albumSet
                      )}
                      {index <
                        albumSets.length -
                        1 && ','}
                    </span>
                  )
                )}
              </div>
            ) : (
              <span className='text-[12px] text-slate-400 dark:text-slate-500'>
                No Album Set
              </span>
            )}
          </div>
          <div className='flex items-center justify-between gap-3'>
            <div className='flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-1'>
              {tabItems.map(
                item => {
                  const isActive =
                    activeKey ===
                    item.key

                  return (
                    <button
                      key={
                        item.key
                      }
                      type='button'
                      disabled={
                        deletingImages ||
                        movingImages ||
                        savingOrder
                      }
                      onClick={() =>
                        handleTabChange(
                          item.key
                        )
                      }

                      className={`
                      inline-flex
                      h-[30px]
                      shrink-0
                      items-center
                      gap-[5px]
                      rounded-[6px]
                      border
                      px-[9px]
                      text-[11px]
                      font-normal
                      leading-none
                      outline-none
                      transition-colors
                      mb-5

                      ${isActive
                          ? `
                            border-[#d8e6f8]
                            bg-[#eaf3ff]
                            text-[#1677ff]

                            dark:border-[#315b8d]
                            dark:bg-[#1e3a5f]
                            dark:text-[#60a5fa]
                          `
                          : `
                            border-transparent
                            bg-[#f7f7f8]
                            text-[#68707d]
                            hover:bg-[#f0f1f3]
                            hover:text-[#1677ff]

                            dark:border-[#263449]
                            dark:bg-[#182235]
                            dark:text-[#a8b3c7]
                            dark:hover:border-[#3b4b63]
                            dark:hover:bg-[#22304a]
                            dark:hover:text-[#60a5fa]
                          `
                        }
                    `}
                    >
                      <span>
                        {
                          item.title
                        }
                      </span>

                      <span
                        className={`
                        inline-flex
                        h-[17px]
                        min-w-[17px]
                        items-center
                        justify-center
                        rounded-full
                        border
                        bg-white
                        px-[3px]
                        text-[9px]
                        font-normal
                        leading-none

                        ${isActive
                            ? 'border-[#d5dde8] text-[#5f6875]'
                            : 'border-[#dedede] text-[#626b78]'
                          }
                      `}
                      >
                        {
                          item.count
                        }
                      </span>
                    </button>
                  )
                }
              )}
            </div>

            {canShowAlbumActions && (
              <div className='flex shrink-0 items-center gap-2'>
                <Button
                  ghost
                  type='primary'
                  icon={
                    <img
                      src={
                        SelectIcon
                      }
                      alt=''
                      className='h-4 w-4'
                    />
                  }
                  loading={
                    loadingAlbumSetDetails
                  }
                  disabled={
                    deletingImages ||
                    movingImages ||
                    savingOrder ||
                    loadingAlbumSetDetails
                  }
                  onClick={
                    handleSelectImage
                  }
                >
                  Select image
                </Button>
              </div>
            )}
          </div>

          <div className='mt-4'>
            {
              activeTabContent
            }
          </div>
        </div>
      </div>
    </>
  )
}