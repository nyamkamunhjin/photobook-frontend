/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useState } from 'react'
import { Modal, Button, Select } from 'antd'
import { CgZoomIn, CgZoomOut } from 'react-icons/cg'
import { useLocalStorageState, useThrottleFn } from 'ahooks'
import { PaperMaterial, PaperSize, Project, Slide, UploadablePicture } from 'interfaces'
import { FormattedMessage } from 'react-intl'
import { Spinner } from 'components'
import { filterArray } from 'utils'
import { getSlides } from 'utils/image-lib'
import UploadPhotosGroup from '../upload-modal/upload-photos-group'
import Images from './images'
import Editor from './editor'

interface Props {
  loading: boolean
  paperSizes?: PaperSize[]
  paperMaterials?: PaperMaterial[]
  uploadPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void
  syncPhoto: (images: UploadablePicture[]) => void
  linkPhoto: (images: string[]) => void
  duplicatePhoto: (object: Slide) => void
  removePhoto: (object: Slide) => void
  currentProject: Project
}

const Grid: React.FC<Props> = ({
  loading,
  uploadPhoto,
  syncPhoto,
  linkPhoto,
  duplicatePhoto,
  removePhoto,
  currentProject: { slides },
  paperSizes,
  paperMaterials,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [selectedSlides, setSelectedSlides] = useState<Slide[]>()
  const [slideIndex, setSlideIndex] = useState<number>(-1)
  const [sort, setSort] = useLocalStorageState('sort', 'a-z')
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
  const onDuplicate = (object: Slide) => {
    duplicatePhoto(object)
  }
  const onRemove = (object: Slide) => {
    removePhoto(object)
  }

  const toggle = useThrottleFn(
    (slide: Slide, event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (event.shiftKey || (event.shiftKey && selectedSlides?.some((each) => each.slideId === slide.slideId))) {
        setSelectedSlides(filterArray(selectedSlides || [], slide, 'slideId'))
      } else {
        setSelectedSlides([slide])
      }
    },
    {
      wait: 100,
    }
  )

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
        </div>
      </div>
      <div className="ImportedPhotos">
        <Images
          onEdit={(index) => setSlideIndex(index)}
          onDuplicate={(index) => onDuplicate(slides[index])}
          onRemove={(index) => onRemove(slides[index])}
          paperSizes={paperSizes}
          paperMaterials={paperMaterials}
          objects={getSlides(sort, slides)}
          selectedObjects={selectedSlides || []}
          toggle={toggle}
          height={(zoom || 1) * 80}
        />
      </div>
      {slideIndex !== -1 && (
        <Editor
          slideIndex={slideIndex}
          paperSizes={paperSizes}
          paperMaterials={paperMaterials}
          onCancel={() => setSlideIndex(-1)}
          visible={slideIndex !== -1}
          object={slides[slideIndex]}
          onRemove={(index) => onRemove(slides[index])}
        />
      )}
    </div>
  )
}

export default Grid
