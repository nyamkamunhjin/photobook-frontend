/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react'
import { connect } from 'react-redux'
import { useRequest } from 'ahooks'

import { listPaperMaterial, listPaperSize } from 'api'
import {
  ImageInterface,
  PaperMaterial,
  PaperSize,
  Project,
  ProjectImage,
  ProjectInterface,
  RootInterface,
  Slide,
} from 'interfaces'
import { FormattedMessage } from 'react-intl'
import Checkbox from 'antd/lib/checkbox/Checkbox'
import { GrRotateLeft, GrRotateRight } from 'react-icons/gr'
import { IoIosTabletLandscape, IoIosTabletPortrait } from 'react-icons/io'
import Select from 'rc-select'
import { InputNumber } from 'antd'
import { updateProject } from 'redux/actions/project'
import { ParseNumber } from 'utils'

interface Props {
  currentProject: Project
  loading: Boolean
  selectedSlides?: Slide[]
  setSelectedSlides: (value: any) => void
  setChangeReq: (value: any) => void
}
const Sidebar: React.FC<Props> = ({ currentProject, loading, selectedSlides, setSelectedSlides, setChangeReq }) => {
  const paperSizes = useRequest(() => listPaperSize({ current: 0, pageSize: 100 }, { templateType: 'print' }))
  const paperMaterials = useRequest(() => listPaperMaterial({ current: 0, pageSize: 100 }, { templateTypes: 'print' }))
  const [selectedState, setSelectedState] = useState<{
    paperSize?: PaperSize
    paperMaterial?: PaperMaterial
    enhancement?: Boolean
    amount?: number
  }>({
    paperSize: undefined,
    paperMaterial: undefined,
    enhancement: false,
    amount: undefined,
  })

  const onRotate = async (angle: string) => {
    const slides = currentProject.slides.map((slide) => {
      if (!selectedSlides?.some((item) => item.slideId === slide.slideId) || !slide.object?.props.imageStyle)
        return slide

      let { rotateAngle = 0, transform = 'rotate(0deg)' } = slide.object?.props.imageStyle
      if (!transform.match(/rotate\(([^)]+)\)/)) {
        transform += ' rotate(0deg)'
      }
      if (angle === 'left') {
        rotateAngle -= 90
      } else {
        rotateAngle += 90
      }

      return {
        ...slide,
        object: {
          ...slide.object,
          props: {
            ...slide.object?.props,
            imageStyle: {
              ...slide.object?.props.imageStyle,
              rotateAngle,
              transform: transform.replace(/rotate\(([^)]+)\)/, `rotate(${rotateAngle}deg)`),
            },
          },
        },
      }
    })
    try {
      await updateProject(currentProject.id, { slides })
      setChangeReq({ isChanged: true, action: 'angle' })
    } catch (err) {
      console.error(err)
    }
  }

  const onOrientation = async (position: string) => {
    const slides = currentProject.slides.map((slide) => {
      if (!selectedSlides?.some((item) => item.slideId === slide.slideId) || !slide.object?.props.imageStyle)
        return slide
      const { cropStyle } = slide.object?.props
      const cropper = document.getElementById(slide.slideId)
      if (!cropStyle || !cropper) return slide
      const img = cropper.querySelector('img')
      if (!img) return slide

      let width = ParseNumber(cropStyle.width)
      let height = ParseNumber(cropStyle.height)
      if (position === 'vertical') {
        if (width > height) {
          width = height
          height = ParseNumber(cropStyle?.width)
          cropStyle.width = width
          cropStyle.height = height
          setChangeReq({ isChanged: true, action: 'orientation vertical' })
        } else return slide
      } else if (width < height) {
        width = height
        height = ParseNumber(cropStyle?.width)
        cropStyle.width = width
        cropStyle.height = height
        setChangeReq({ isChanged: true, action: 'orientation horizontal' })
      } else return slide

      const cropperRatio = width / height

      let {
        offsetTop: img_offsetTop,
        offsetLeft: img_offsetLeft,
        offsetHeight: img_offsetHeight,
        offsetWidth: img_offsetWidth,
      } = img
      const { rotateAngle = 0 } = slide.object.props.imageStyle
      if (rotateAngle % 180 !== 0) {
        const _img_offsetTop = img_offsetTop
        const _img_offsetWidth = img_offsetWidth
        img_offsetTop = img_offsetLeft
        img_offsetLeft = _img_offsetTop
        img_offsetWidth = img_offsetHeight
        img_offsetHeight = _img_offsetWidth
      }

      const imgRatio = img_offsetWidth / img_offsetHeight
      if (imgRatio >= cropperRatio) {
        cropStyle.height = img_offsetHeight
        cropStyle.width = cropStyle.height * cropperRatio
      } else {
        cropStyle.width = img_offsetWidth
        cropStyle.height = cropStyle.width / cropperRatio
      }

      if (imgRatio > 1) {
        cropStyle.top = img_offsetTop
        cropStyle.left = (img_offsetWidth - cropStyle.width) / 2
      } else if (imgRatio === 1) {
        cropStyle.top = (img_offsetHeight - cropStyle.height) / 2
        cropStyle.left = (img_offsetWidth - cropStyle.width) / 2
      } else if (imgRatio < 1) {
        cropStyle.left = img_offsetLeft
        cropStyle.top = (img_offsetHeight - cropStyle.height) / 2
      }

      if (cropStyle.left + cropStyle.width > img_offsetLeft + img_offsetWidth) {
        cropStyle.left = img_offsetLeft + img_offsetWidth - cropStyle.width
      }
      if (cropStyle.top + cropStyle.height > img_offsetTop + img_offsetHeight) {
        cropStyle.top = img_offsetTop + img_offsetHeight - cropStyle.height
      }

      return {
        ...slide,
        object: {
          ...slide.object,
          props: {
            ...slide.object.props,
            cropStyle: {
              ...(slide.object.props?.cropStyle as {
                top: number
                left: number
                width: number
                height: number
              }),
              width: cropStyle.width,
              height: cropStyle.height,
              top: cropStyle.top,
              left: cropStyle.left,
            },
          },
        },
      }
    })
    try {
      await updateProject(currentProject.id, { slides })
    } catch (err) {
      console.error(err)
    }
  }

  const handleApply = () => {
    console.log('handleApply', selectedState)
  }

  const handleCancel = () => {
    console.log('handleCancel')
  }

  return (
    <div
      className="flex flex-col gap-4 bg-white border-l h-full px-4 py-8 text-gray-500 font-normal text-sm"
      style={{ width: 260 }}
    >
      <p>
        <FormattedMessage id="select_and_customise_multiple_photos" />
      </p>
      <Checkbox
        className="text-xs"
        onChange={(e) => setSelectedSlides(e.target.checked ? currentProject.slides : [])}
        checked={selectedSlides?.length === currentProject.slides.length}
      >
        <FormattedMessage id="select_all" />
      </Checkbox>
      <span className="text-xs">
        <FormattedMessage id="selected_photos" />
        <span className="text-gray-700 ml-1">{selectedSlides?.length || 0}</span>
      </span>
      <hr />
      <div hidden={!(selectedSlides && selectedSlides?.length > 0)} className="flex flex-col gap-4">
        <p className="text-gray-700">
          <FormattedMessage id="edit_selected_photos" />
        </p>
        <div className="flex justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs">
              <FormattedMessage id="rotate" />
            </span>
            <div className="flex rounded-lg border">
              <div onClick={() => onRotate('left')} className="border-r px-3 py-2 text-black hover:cursor-pointer">
                <GrRotateLeft />
              </div>
              <div onClick={() => onRotate('right')} className="px-3 py-2 text-black hover:cursor-pointer">
                <GrRotateRight />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs">
              <FormattedMessage id="crop" />
            </span>
            <div className="flex rounded-lg border">
              <div
                onClick={() => onOrientation('horizontal')}
                className="border-r px-3 py-2 text-black hover:cursor-pointer"
              >
                <IoIosTabletLandscape />
              </div>
              <div onClick={() => onOrientation('vertical')} className="px-3 py-2 text-black hover:cursor-pointer">
                <IoIosTabletPortrait />
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs">
            <FormattedMessage id="size" />
          </span>
          <Select
            loading={paperSizes.loading}
            className="w-full border rounded"
            onChange={(value) => {
              setSelectedState((each) => ({
                ...each,
                paperSize: value,
              }))
            }}
            defaultValue={!paperSizes.loading && paperSizes.data.list[0]?.id}
          >
            {paperSizes.data?.list.map((each: PaperSize) => (
              <Select.Option className="border bg-white" key={each.size} value={each.id}>
                <span className="font-normal text-gray-700 text-sm">{each.size}</span>
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs">
            <FormattedMessage id="paper" />
          </span>
          <Select
            loading={paperMaterials.loading}
            className="w-full border rounded"
            onChange={(value) => {
              setSelectedState((each) => ({
                ...each,
                paperMaterial: value,
              }))
            }}
            defaultValue={!paperMaterials.loading && paperMaterials.data.list[0]?.id}
          >
            {paperMaterials.data?.list.map((each: PaperMaterial) => (
              <Select.Option key={each.name} value={each.id}>
                <span className="font-normal text-gray-700 text-sm">{each.name}</span>
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs">
            <FormattedMessage id="image_brightening_enhancement" />
          </span>
          <Select
            className="w-full border rounded"
            onChange={(value) => {
              setSelectedState((each) => ({
                ...each,
                paperMaterial: value,
              }))
            }}
            defaultValue={!paperMaterials.loading && paperMaterials.data.list[0]?.id}
          >
            {['Yes', 'No'].map((each: string) => (
              <Select.Option key={each} value={each}>
                <span className="font-normal text-gray-700 text-sm">{each}</span>
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs">
            <FormattedMessage id="amount" />
          </span>
          <InputNumber
            onChange={(value) => {
              setSelectedState((each) => ({
                ...each,
                amount: value,
              }))
            }}
            min={1}
          />
        </div>
        <div className="flex justify-between gap-4">
          <button type="button" className="flex-1 px-4 py-1 border rounded" onClick={handleApply}>
            <FormattedMessage id="apply" />
          </button>
          <button type="button" className="flex-1 px-4 py-1 border rounded" onClick={handleCancel}>
            <FormattedMessage id="cancel" />
          </button>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state: RootInterface) => ({
  image: state.image,
  project: state.project,
})

export default connect(mapStateToProps, {})(Sidebar)
