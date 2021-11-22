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

interface Props {
  currentProject: Project
  loading: Boolean
  selectedSlides?: Slide[]
  setSelectedSlides: (value: any) => void
}
const Sidebar: React.FC<Props> = ({ currentProject, loading, selectedSlides, setSelectedSlides }) => {
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

  const onRotate = (angle: string) => {
    console.log('onRotate', angle)

    // let { rotateAngle = 0, transform = 'rotate(0deg)' } = object.props.imageStyle
    // if (!transform.match(/rotate\(([^)]+)\)/)) {
    //   transform += ' rotate(0deg)'
    // }
    // if (angle === 'left') {
    //   rotateAngle -= 90
    // } else {
    //   rotateAngle += 90
    // }
    // updateObject(
    //   {
    //     object: {
    //       ...object,
    //       props: {
    //         ...object.props,
    //         imageStyle: {
    //           ...object.props.imageStyle,
    //           rotateAngle,
    //           transform: transform.replace(/rotate\(([^)]+)\)/, `rotate(${rotateAngle}deg)`),
    //         },
    //       },
    //     },
    //   },
    //   slideId
    // )
    // setChangeReq({ isChanged: true, action: 'angle' })
  }

  const onOrientation = (position: string) => {
    console.log('onOrientation', position)

    // if (!cropStyle) return

    // setCropperCenter({
    //   top: cropStyle.top + cropStyle.height / 2,
    //   left: cropStyle.left + cropStyle.width / 2,
    // })

    // let width = ParseNumber(cropStyle.width)
    // let height = ParseNumber(cropStyle.height)
    // if (position === 'vertical') {
    //   if (width > height) {
    //     width = height
    //     height = ParseNumber(cropStyle?.width)
    //     cropStyle.width = width
    //     cropStyle.height = height
    //     setChangeReq({ isChanged: true, action: 'orientation vertical' })
    //   }
    // } else if (width < height) {
    //   width = height
    //   height = ParseNumber(cropStyle?.width)
    //   cropStyle.width = width
    //   cropStyle.height = height
    //   setChangeReq({ isChanged: true, action: 'orientation horizontal' })
    // }
    // updateObject(
    //   {
    //     object: {
    //       ...object,
    //       props: {
    //         ...object.props,
    //         cropStyle: {
    //           ...(object.props?.cropStyle as Cropper),
    //           width,
    //           height,
    //         },
    //       },
    //     },
    //   },
    //   slideId
    // )
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
