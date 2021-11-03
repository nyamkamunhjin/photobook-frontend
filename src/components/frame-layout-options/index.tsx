/* eslint-disable no-alert */
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { FrameMaterial, PaperSize, RootInterface, Template } from 'interfaces'
import { useHistory } from 'react-router-dom'
import { CustomButton } from 'components'
import { useSelector } from 'react-redux'
import { notification, Select } from 'antd'
import Button from 'components/button'
import AuthModal from '../auth-modal'

interface Props {
  template: Template
  paperSizes: PaperSize[]
  frameMaterials: FrameMaterial[]
  selectedState: {
    orientation?: string
    paperSize?: PaperSize | undefined
    frameMaterial?: FrameMaterial | undefined
  }
  setSelectedState: React.Dispatch<
    React.SetStateAction<{
      orientation?: string
      paperSize?: PaperSize | undefined
      frameMaterial?: FrameMaterial | undefined
    }>
  >
}

const FrameLayoutOptions: FC<Props> = ({ template, frameMaterials, paperSizes, selectedState, setSelectedState }) => {
  const intl = useIntl()
  const urlParams = new URLSearchParams(window.location.search)
  const tradephoto = urlParams.get('tradephoto')
  const user = useSelector((state: RootInterface) => state.auth.user)
  const widthRef = useRef<HTMLInputElement>(null)
  const heightRef = useRef<HTMLInputElement>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const history = useHistory()
  const _frameMaterials = useMemo(() => {
    return frameMaterials?.filter((frameMaterial: FrameMaterial) => frameMaterial.status === 'Active')
  }, [frameMaterials])

  const orientations = paperSizes.reduce((acc, paperSize) => {
    if (!acc.some((item) => item.name === paperSize.orientation)) {
      acc.push({ name: paperSize.orientation, sizes: [paperSize] })
    } else {
      acc.find((item) => item.name === paperSize.orientation)?.sizes.push(paperSize)
    }
    return acc
  }, [] as any[])

  const onFinish = () => {
    if (
      template.frameType === 'Single' &&
      tradephoto !== null &&
      (!widthRef.current ||
        !heightRef.current ||
        parseFloat(widthRef.current?.value) === 0 ||
        parseFloat(heightRef.current?.value) === 0)
    )
      return alert('Please check the size')

    if (!user) return notification.warn({ message: 'Танд хандах эрх байхгүй байна. Дахин нэвтэрнэ үү' })

    if (template.frameType === 'Single' && tradephoto !== null) {
      return history.push(
        `/editor/frame/single?template=${template.id}&frameMaterial=${selectedState.frameMaterial?.id}${
          parseFloat(widthRef.current?.value || '0') > 0 && parseFloat(heightRef.current?.value || '0') > 0
            ? `&width=${widthRef.current?.value}&height=${heightRef.current?.value}`
            : `&paperSize=${selectedState.paperSize?.id || template.paperSize?.id}`
        }${tradephoto ? `&tradephoto=${tradephoto}` : ''}`
      )
    }
    return history.push(
      `/editor/frame/${template.frameType?.toLowerCase()}?template=${template.id}&frameMaterial=${
        selectedState.frameMaterial?.id
      }&paperSize=${selectedState.paperSize?.id || template.paperSize?.id}`
    )
  }

  useEffect(() => {
    const initialState = () => {
      const [paperSize] = orientations[0]?.sizes
      if (_frameMaterials && _frameMaterials.length > 0) {
        const [frameMaterial] = _frameMaterials
        setSelectedState({
          orientation: orientations[0].name,
          paperSize,
          frameMaterial,
        })
      } else {
        setSelectedState({
          orientation: orientations[0].name,
          paperSize,
        })
      }
    }
    if (paperSizes) {
      initialState()
    }
  }, [paperSizes, frameMaterials, setSelectedState])

  return (
    <div className="flex flex-col gap-4">
      <span className="text-3xl font-bold">{template.name}</span>

      <div className="flex gap-4 justify-between" hidden={template.frameType === 'Single' && tradephoto !== null}>
        <span className="font-normal text-lg">{intl.formatMessage({ id: 'orientation' })}</span>
        <div className="flex flex-wrap gap-4 w-2/3">
          <Select
            className="w-full"
            onChange={(value) => {
              setSelectedState((each) => ({
                ...each,
                orientation: value,
              }))
            }}
            defaultValue={orientations[0].name}
          >
            {orientations.map((each) => (
              <Select.Option key={each.name} value={each.name}>
                <span className="font-normal text-gray-700 text-sm">{each.name}</span>
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex gap-4 justify-between" hidden={template.frameType === 'Single' && tradephoto !== null}>
        <span className="font-normal text-lg">{intl.formatMessage({ id: 'paper_size' })}</span>
        <div className="flex flex-wrap gap-4 w-2/3">
          <Select
            className="w-full flex items-center"
            onChange={(value) => {
              setSelectedState((each) => ({
                ...each,
                paperSize: orientations
                  .find((item) => item.name === selectedState.orientation)
                  ?.sizes.find((item: PaperSize) => item.size === value),
              }))
            }}
            defaultValue={orientations.find((item) => item.name === selectedState.orientation)?.sizes[0].size}
          >
            {orientations
              .find((item) => item.name === selectedState.orientation)
              ?.sizes.map((each: PaperSize) => (
                <Select.Option key={each.size} value={each.size}>
                  <span className="font-normal text-gray-700 text-sm">{each.size}</span>
                </Select.Option>
              ))}
          </Select>
        </div>
      </div>

      <div className="space-y-4" hidden={template.frameType !== 'Single' || tradephoto === null}>
        <span className="font-normal text-xl">{intl.formatMessage({ id: 'paper_size' })} /см/</span>
        <div className="flex gap-8">
          <div className="flex flex-col gap-1 flex-1">
            <span className="text-gray-500 font-medium">Width</span>
            <input
              placeholder="width"
              type="number"
              ref={widthRef}
              defaultValue={0}
              className="max-w-min px-2 py-1 border appearance-none focus:appearance-none hover:appearance-none focus:outline-none focus:border-blue-400 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <span className="text-gray-500 font-medium">Height</span>
            <input
              placeholder="height"
              type="number"
              ref={heightRef}
              defaultValue={0}
              className="max-w-min px-2 py-1 border appearance-none focus:appearance-none hover:appearance-none focus:outline-none focus:border-blue-400 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <span className="font-normal text-xl">{intl.formatMessage({ id: 'frame_material' })}</span>
        <div className="flex flex-wrap gap-4">
          {_frameMaterials?.map((each: FrameMaterial) => (
            <button
              type="button"
              className={`w-28 p-2 rounded border-dashed border-4 focus:outline-none  ${
                selectedState.frameMaterial?.id === each.id ? 'border-green-400 outline-none' : 'hover:border-green-200'
              } `}
              key={each.id}
              onClick={() => {
                setSelectedState((prev) => ({ ...prev, frameMaterial: each }))
              }}
            >
              <div className="flex flex-col">
                <img src={`${process.env.REACT_APP_PUBLIC_IMAGE}${each.imageUrl}`} alt="cover-material-color" />
                <span>{each.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <AuthModal visible={isModalVisible} setVisible={setIsModalVisible} />
      <Button onClick={onFinish}>
        <CustomButton className="btn-primary">
          <FormattedMessage id="start_book" />
        </CustomButton>
      </Button>
    </div>
  )
}
export default FrameLayoutOptions
