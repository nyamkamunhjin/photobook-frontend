/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useState } from 'react'
import { Modal, Button, Select, InputNumber } from 'antd'
import { CgZoomIn, CgZoomOut } from 'react-icons/cg'
import { useLocalStorageState, useThrottleFn } from 'ahooks'
import { Image, PaperMaterial, PaperSize, UploadablePicture } from 'interfaces'
import { FormattedMessage } from 'react-intl'
import Spinner from 'components/spinner'
import { filterArray } from 'utils'
import UploadPhotosGroup from '../upload-modal/upload-photos-group'

interface Props {
  loading: boolean
  images: Image[]
  paperSizes?: PaperSize[]
  paperMaterials?: PaperMaterial[]
  uploadPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void
  syncPhoto: (images: UploadablePicture[]) => void
  linkPhoto: (images: string[]) => void
  unlinkPhoto: (images: string[]) => void
}

const Images: React.FC<Props> = ({
  loading,
  images,
  uploadPhoto,
  syncPhoto,
  linkPhoto,
  paperSizes,
  paperMaterials,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [popVisible, setPopVisible] = useState(-1)
  const [selectedImages, setSelectedImages] = useState<Image[]>()
  const [sort, setSort] = useState('a-z')
  const [zoom, setZoom] = useLocalStorageState('zoom', 1)
  const showModal = () => {
    setModalVisible(true)
  }

  const handleOk = () => {
    setModalVisible(false)
  }

  const handleCancel = () => {
    setModalVisible(false)
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

  const _zoom = (zoom || 1) * 80
  return loading ? (
    <Spinner />
  ) : (
    <div className="Images">
      <div className="AddMorePhotos flex flex-col">
        <div className="flex justify-between">
          <div className="flex flex-col justify-center p-2">
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
          <div className="flex flex-col justify-center p-2 flex-none">
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
          <div className="flex flex-col justify-end p-2 flex-none">
            <span className="text-xs mb-1">
              <FormattedMessage id="image.thumbs" />
            </span>
            <div className="flex">
              <div
                onClick={onZoomOut}
                className="rounded p-1 shadow-sm border border-gray-300 rounded-r-none cursor-pointer"
              >
                <CgZoomOut className={zoom === 1 ? 'text-gray-300' : 'text-gray-500'} />
              </div>
              <div
                onClick={onZoomIn}
                className="rounded p-1 shadow-sm border border-gray-300 rounded-l-none cursor-pointer"
              >
                <CgZoomIn className={zoom === 3 ? 'text-gray-300' : 'text-gray-500'} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="ImportedPhotos">
        {getItems().map((image: Image, key: number) => {
          return (
            <>
              <div onMouseEnter={() => setPopVisible(key)} onMouseLeave={() => setPopVisible(-1)}>
                <div
                  className={
                    selectedImages?.some((each) => each.id === image.id) ? 'ImageContainer active' : 'ImageContainer'
                  }
                  style={{ width: 60 + _zoom, height: 100 + _zoom }}
                  key={`images${image.imageUrl}`}
                >
                  <div className="header">{image.imageUrl}</div>
                  <img
                    draggable={false}
                    className="w-full"
                    alt={image.tempUrl}
                    src={image.tempUrl}
                    onClick={(e) => toggle.run(image, e)}
                  />
                  <div className="flex flex-row justify-center">
                    <Select size="small" bordered={false} className="w-1/3 min-w-14">
                      {paperSizes?.map((each) => (
                        <Select.Option value={each.id}>{each.size}</Select.Option>
                      ))}
                    </Select>
                    <Select size="small" bordered={false} className="w-1/3 min-w-14">
                      {paperMaterials?.map((each) => (
                        <Select.Option value={each.id}>{each.name}</Select.Option>
                      ))}
                    </Select>
                  </div>
                  <div className="flex flex-row mb-2">
                    <InputNumber size="small" />
                  </div>
                </div>
                <div
                  className="flex justify-between bg-white p-1 rounded-2xl"
                  style={key === popVisible ? { opacity: 1 } : { opacity: 0 }}
                >
                  <div className="cursor-pointer">
                    <FormattedMessage id="duplicate" />
                  </div>
                  <div className="cursor-pointer">
                    <FormattedMessage id="edit" />
                  </div>
                  <div className="cursor-pointer">
                    <FormattedMessage id="remove" />
                  </div>
                </div>
              </div>
            </>
          )
        })}
      </div>
    </div>
  )
}

export default Images
