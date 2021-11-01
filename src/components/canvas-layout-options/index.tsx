import React, { FC, useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { PaperMaterial, PaperSize, RootInterface, Template } from 'interfaces'
import { Select } from 'antd'
import { Link } from 'react-router-dom'
import { CustomButton } from 'components'
import { useSelector } from 'react-redux'
import AuthModal from '../auth-modal'

interface Props {
  template: Template
  paperSizes: PaperSize[]
  paperMaterials: PaperMaterial[]
  selectedState: {
    orientation?: string
    paperSize?: PaperSize
    paperMaterial?: PaperMaterial
    type?: String
  }
  setSelectedState: React.Dispatch<
    React.SetStateAction<{
      orientation?: string
      paperSize?: PaperSize | undefined
      paperMaterial?: PaperMaterial | undefined
      type?: String
    }>
  >
}

const CanvasLayoutOptions: FC<Props> = ({ template, paperSizes, paperMaterials, selectedState, setSelectedState }) => {
  const intl = useIntl()
  const urlParams = new URLSearchParams(window.location.search)
  const tradephoto = urlParams.get('tradephoto')
  const user = useSelector((state: RootInterface) => state.auth.user)
  const [isModalVisible, setIsModalVisible] = useState(false)

  const orientations = paperSizes.reduce((acc, paperSize) => {
    if (!acc.some((item) => item.name === paperSize.orientation)) {
      acc.push({ name: paperSize.orientation, sizes: [paperSize] })
    } else {
      acc.find((item) => item.name === paperSize.orientation)?.sizes.push(paperSize)
    }
    return acc
  }, [] as any[])

  useEffect(() => {
    const initialState = () => {
      const [paperSize] = orientations.find((item) => item.name === selectedState.orientation)?.sizes
      const [paperMaterial] = paperMaterials
      // const [paperMaterial] = paperMaterials

      if (template.canvasType === 'Single') {
        setSelectedState((oldState) => ({
          ...oldState,
          paperSize: (template.productOptions as string[])?.includes('Paper size') ? template.paperSize : paperSize,
          paperMaterial: (template.productOptions as string[])?.includes('Paper material')
            ? template.paperMaterial
            : paperMaterial,
        }))
      } else {
        setSelectedState((oldState) => ({
          ...oldState,
          paperSize: template.paperSize,
          paperMaterial: (template.productOptions as string[])?.includes('Paper material')
            ? template.paperMaterial
            : paperMaterial,
        }))
      }
    }
    if (paperSizes) {
      initialState()
    }
  }, [paperSizes, setSelectedState, paperMaterials, template])

  return (
    <div className="flex flex-col gap-4">
      <span className="text-3xl font-bold">{template.name}</span>

      <div className="flex gap-4 justify-between">
        <span className="font-normal text-lg">{intl.formatMessage({ id: 'type' })}</span>
        <div className="flex flex-wrap gap-4 w-2/3">
          <Select
            className="w-full"
            onChange={(value) => {
              setSelectedState((each) => ({
                ...each,
                type: value,
              }))
            }}
            defaultValue="Air"
          >
            {['Air', 'Standart'].map((each) => (
              <Select.Option key={each} value={each}>
                <span className="font-normal text-gray-700 text-sm">{each}</span>
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>

      {template.canvasType === 'Single' && !(template.productOptions as string[])?.includes('Paper size') && (
        <>
          <div className="flex gap-4 justify-between">
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
                defaultValue="Square"
              >
                {orientations.map((each) => (
                  <Select.Option key={each.name} value={each.name}>
                    <span className="font-normal text-gray-700 text-sm">{each.name}</span>
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex gap-4 justify-between">
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
        </>
      )}

      {/* <div className="space-y-4">
        <span className="font-normal text-lg">{intl.formatMessage({ id: 'paper_size' })}</span>
        <div className="flex flex-wrap gap-4">
          {paperSizes.map((each: PaperSize) => (
            <button
              type="button"
              className={`w-32 p-2 rounded border-dashed border-4 focus:outline-none  ${
                selectedState.paperSize?.id === each.id ? 'border-green-400 outline-none' : 'hover:border-green-200'
              } `}
              key={each.id}
              onClick={() => {
                setSelectedState((prev) => ({ ...prev, paperSize: each }))
              }}
            >
              <div className="flex flex-col">
                <div className="w-full grid place-items-center">
                  <div
                    className="border-solid border-2 border-gray-700"
                    style={{ width: `${each.width}px`, height: `${each.height}px` }}
                  />
                </div>
                <span>{each.size}</span>
              </div>
            </button>
          ))}
        </div>
      </div> */}
      {!(template.productOptions as string[])?.includes('Paper material') && (
        <div className="space-y-4">
          <span className="font-normal text-lg">{intl.formatMessage({ id: 'paper_material_type' })}</span>
          <div className="flex flex-wrap gap-4">
            {paperMaterials.map((each: PaperMaterial) => (
              <button
                type="button"
                className={`w-32 p-2 rounded border-dashed border-4 focus:outline-none  ${
                  selectedState.paperMaterial?.id === each.id
                    ? 'border-green-400 outline-none'
                    : 'hover:border-green-200'
                } `}
                key={each.id}
                onClick={() => {
                  setSelectedState((prev) => ({ ...prev, paperMaterial: each }))
                }}
              >
                <div className="flex flex-col">
                  <div className="w-full grid place-items-center">
                    <div
                      className="border-solid border-2 border-gray-700 bg-no-repeat bg-cover bg-center"
                      style={{ width: 100, height: 100, backgroundImage: `url(${each.tempUrl})` }}
                    />
                  </div>
                  <span>{each.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <AuthModal visible={isModalVisible} setVisible={setIsModalVisible} />
      <Link
        to={
          user
            ? `/editor/canvas/${template.canvasType?.toLowerCase()}?template=${template.id}&paperSize=${
                selectedState.paperSize?.id
              }&type=${selectedState.type}&paperMaterial=${selectedState.paperMaterial?.id}${
                tradephoto ? `&tradephoto=${tradephoto}` : ''
              }`
            : '#'
        }
        onClick={() => !user && setIsModalVisible(true)}
      >
        <CustomButton className="btn-primary">
          <FormattedMessage id="start_book" />
        </CustomButton>
      </Link>
    </div>
  )
}
export default CanvasLayoutOptions
