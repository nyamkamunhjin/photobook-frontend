import React, { useState } from 'react'
import { Modal, Button, Image as ImageComponent, Select } from 'antd'
import { CgTrashEmpty, CgZoomIn, CgZoomOut } from 'react-icons/cg'
import { useLocalStorageState, useThrottleFn } from 'ahooks'
import { Image, UploadablePicture } from 'interfaces'
import { FormattedMessage } from 'react-intl'
import Spinner from 'components/spinner'
import { filterArray } from 'utils'
import UploadPhotosGroup from '../upload-modal/upload-photos-group'

interface Props {
  loading: boolean
  images: Image[]
  uploadPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void
  syncPhoto: (images: UploadablePicture[]) => void
  linkPhoto: (images: string[]) => void
  unlinkPhoto: (images: string[]) => void
}

interface PreviewInterface {
  image: Image
  top: number
  left: number
}

const Images: React.FC<Props> = ({ loading, images, uploadPhoto, syncPhoto, linkPhoto, unlinkPhoto }) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false)

  const [hover, setHover] = useState<PreviewInterface>()
  const [selectedImages, setSelectedImages] = useState<Image[]>()
  const [sort, setSort] = useState('a-z')
  const [zoom, setZoom] = useLocalStorageState('zoom', 1)

  const dragStart = (e: React.DragEvent<HTMLImageElement>) => {
    e.dataTransfer.setData('images', JSON.stringify(selectedImages))
  }

  const showModal = () => {
    setModalVisible(true)
  }

  const handleOk = () => {
    setModalVisible(false)
  }

  const handleCancel = () => {
    setModalVisible(false)
  }
  const onRemote = () => {
    if (selectedImages && selectedImages?.length > 0) {
      unlinkPhoto(selectedImages?.map((each) => each.id))
    }
  }
  const onZoomOut = () => {
    if ((zoom || 1) > 1) {
      setZoom((zoom || 1) - 1)
    }
  }
  const onZoomIn = () => {
    if ((zoom || 1) <= 2) {
      setZoom((zoom || 1) + 1)
    }
  }
  const toggle = useThrottleFn(
    (image: Image, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (event.shiftKey || (event.shiftKey && selectedImages?.some((each) => each.id === image.id))) {
        setSelectedImages(filterArray(selectedImages || [], image, 'id'))
      } else {
        setSelectedImages([image])
      }
    },
    {
      wait: 100,
    }
  )

  const getItems = () => {
    switch (sort) {
      case 'a-z':
        return images.sort((a, b) => a.name.localeCompare(b.name))
      case 'z-a': {
        return images.sort((b, a) => a.name.localeCompare(b.name))
      }
      case 'earlier': {
        return images.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      }
      case 'recently': {
        return images.sort((b, a) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      }
      default:
        return images
    }
  }

  const _zoom = (zoom || 1) * 30
  return loading ? (
    <Spinner />
  ) : (
    <div className="Images">
      <div className="AddMorePhotos flex flex-col">
        <div className="flex">
          <div className="flex flex-col justify-center p-2 flex-none">
            <span className="text-xs mb-1">
              <FormattedMessage id="image.thumbs" />
            </span>
            <div className="flex">
              <div
                onClick={onZoomOut}
                className="rounded p-1 shadow-sm border border-gray-500 rounded-r-none cursor-pointer"
              >
                <CgZoomOut className={zoom === 1 ? 'text-gray-500' : 'text-gray-500'} />
              </div>
              <div
                onClick={onZoomIn}
                className="rounded p-1 shadow-sm border border-gray-500 rounded-l-none cursor-pointer"
              >
                <CgZoomIn className={zoom === 3 ? 'text-gray-500' : 'text-gray-500'} />
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center p-2 flex-grow">
            <span className="text-xs mb-1 flex-none">
              <FormattedMessage id="image.sort" />
            </span>
            <div className="w-full">
              <Select defaultValue={sort} size="small" onChange={(e) => setSort(e)} className="min-w-full">
                <Select.Option value="a-z">
                  <FormattedMessage id="sort.a-z" />
                </Select.Option>
                <Select.Option value="z-a">
                  <FormattedMessage id="sort.z-a" />
                </Select.Option>
                <Select.Option value="earlier">
                  <FormattedMessage id="sort.earlier" />
                </Select.Option>
                <Select.Option value="recently">
                  <FormattedMessage id="sort.recently" />
                </Select.Option>
              </Select>
            </div>
          </div>
          <div className="flex flex-col justify-end p-2 flex-none">
            <div className="flex">
              <div onClick={onRemote} className="cursor-pointer p-1">
                <CgTrashEmpty size={20} className="text-gray-500" />
              </div>
            </div>
          </div>
        </div>
        <Button type="dashed" style={{ width: '100%' }} onClick={showModal}>
          <FormattedMessage id="image.add_new" />
        </Button>
        <Modal title="Upload" visible={modalVisible} onOk={handleOk} onCancel={handleCancel}>
          <UploadPhotosGroup
            uploadPhoto={(e) => {
              uploadPhoto(e)
              handleCancel()
            }}
            syncPhoto={(e) => {
              syncPhoto(e)
              handleCancel()
            }}
            linkPhoto={(e) => {
              linkPhoto(e)
              handleCancel()
            }}
          />
        </Modal>
      </div>
      <div className="ImportedPhotos">
        {getItems().map((image: Image) => {
          return (
            <div
              className="ImageContainer"
              style={{ width: 40 + _zoom, height: 40 + _zoom }}
              key={`images${image.imageUrl}`}
            >
              <ImageComponent
                draggable
                preview={false}
                style={{ maxHeight: 40 + _zoom, maxWidth: 40 + _zoom }}
                className={selectedImages?.some((each) => each.id === image.id) ? 'active' : ''}
                alt={image.tempUrl}
                src={image.tempUrl}
                onDragStart={(e) => dragStart(e)}
                onClick={(e) => toggle.run(image, e)}
                onMouseEnter={(e) => setHover({ image, left: e.clientX, top: e.clientY })}
                onMouseLeave={() => setHover(undefined)}
                fallback="data:image/png;base64,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"
              />
            </div>
          )
        })}
        {hover && (
          <div
            style={{
              top: hover.top,
              left: hover.left,
              position: 'absolute',
              width: 200,
              background: 'white',
              padding: 10,
            }}
            className="items-center flex justify-center flex-col"
          >
            <img style={{ maxWidth: 180, marginBottom: 5 }} src={hover.image.tempUrl} alt={hover.image.id} />
            <p>{hover.image.id}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Images
