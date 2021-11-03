import React, { FC, useCallback, useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import Slider from 'react-alice-carousel'
import {
  BindingType,
  CoverMaterial,
  CoverMaterialColor,
  CoverType,
  PaperSize,
  RootInterface,
  Template,
} from 'interfaces'
import 'react-alice-carousel/lib/alice-carousel.css'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Select } from 'antd'
import CustomButton from '../custom-button'
import AuthModal from '../auth-modal'

interface Props {
  template: Template
  paperSizes: PaperSize[]
  selectedState: {
    orientation?: string
    paperSize?: PaperSize
    coverType?: CoverType
    bindingType?: BindingType
    coverMaterial?: CoverMaterial
    coverMaterialColor?: CoverMaterialColor
  }
  setSelectedState: React.Dispatch<
    React.SetStateAction<{
      orientation?: string
      paperSize?: PaperSize | undefined
      coverType?: CoverType | undefined
      bindingType?: BindingType | undefined
      coverMaterial?: CoverMaterial | undefined
      coverMaterialColor?: CoverMaterialColor | undefined
    }>
  >
}

const PhotobookLayoutOptions: FC<Props> = ({ template, paperSizes, selectedState, setSelectedState }) => {
  const intl = useIntl()
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

  const initialState = useCallback(() => {
    let coverType
    let bindingType
    let coverMaterial
    let coverMaterialColor

    const [paperSize] = orientations[0].sizes

    if (paperSize.coverTypes && paperSize.coverTypes.length > 0) [coverType] = paperSize.coverTypes
    if (coverType?.bindingTypes && coverType.bindingTypes.length > 0) [bindingType] = coverType.bindingTypes
    if (coverType?.coverMaterials && coverType.coverMaterials.length > 0) [coverMaterial] = coverType.coverMaterials
    if (coverMaterial?.coverMaterialColors && coverMaterial.coverMaterialColors.length > 0)
      [coverMaterialColor] = coverMaterial.coverMaterialColors

    setSelectedState({
      orientation: orientations[0].name,
      paperSize,
      coverType,
      bindingType,
      coverMaterial,
      coverMaterialColor,
    })
  }, [paperSizes, setSelectedState])

  useEffect(() => {
    if (paperSizes) {
      initialState()
    }
  }, [initialState, paperSizes])
  console.log('orientations', orientations)
  return (
    <div className="flex flex-col gap-4">
      <span className="text-3xl font-semibold">{template.name}</span>
      {/* <div className="space-y-4">
        <span className="font-normal text-xl">{intl.formatMessage({ id: 'paper_size' })}</span>
        <div className="flex flex-wrap gap-4">
          {paperSizes.map((each: PaperSize) => (
            <button
              type="button"
              className={`w-32 p-2 rounded border-dashed border-4 focus:outline-none  ${
                selectedState.paperSize?.id === each.id ? 'border-green-400 outline-none' : 'hover:border-green-200'
              } `}
              key={each.id}
              onClick={() => {
                setSelectedState({
                  paperSize: each,
                  coverType: each.coverTypes?.[0],
                  bindingType: each.coverTypes?.[0]?.bindingTypes?.[0],
                  coverMaterial: each.coverTypes?.[0]?.coverMaterials?.[0],
                  coverMaterialColor: each.coverTypes?.[0]?.coverMaterials?.[0]?.coverMaterialColors?.[0],
                })
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

      <div className="space-y-4" hidden={selectedState.paperSize?.coverTypes?.length === 0}>
        <span className="font-normal text-xl">{intl.formatMessage({ id: 'cover_type' })}</span>
        <div className="flex flex-wrap gap-4">
          {selectedState.paperSize?.coverTypes?.map((each: CoverType) => (
            <button
              type="button"
              className={`w-28 p-2 rounded border-dashed border-4 focus:outline-none  ${
                selectedState.coverType?.id === each.id ? 'border-green-400 outline-none' : 'hover:border-green-200'
              } `}
              key={each.id}
              onClick={() => {
                setSelectedState((prev) => ({
                  ...prev,
                  coverType: each,
                  bindingType: each.bindingTypes?.[0],
                  coverMaterial: each.coverMaterials?.[0],
                  coverMaterialColor: each.coverMaterials?.[0]?.coverMaterialColors?.[0],
                }))
              }}
            >
              <div className="flex flex-col">
                <img src={`${process.env.REACT_APP_PUBLIC_IMAGE}${each.imageUrl}`} alt="cover-type" />
                <span>{each.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div
        className="space-y-4"
        hidden={!selectedState.coverType?.bindingTypes || selectedState.coverType?.bindingTypes?.length === 0}
      >
        <span className="font-normal text-xl">{intl.formatMessage({ id: 'binding_type' })}</span>
        <div className="flex flex-wrap gap-4">
          {selectedState.coverType?.bindingTypes?.map((each: BindingType) => (
            <button
              type="button"
              className={`w-28 p-2 rounded border-dashed border-4 focus:outline-none ${
                selectedState.bindingType?.id === each.id ? 'border-green-400 outline-none' : 'hover:border-green-200'
              } `}
              key={each.id}
              onClick={() => {
                setSelectedState((prev) => ({ ...prev, bindingType: each }))
              }}
            >
              <div className="flex flex-col">
                <img src={`${process.env.REACT_APP_PUBLIC_IMAGE}${each.imageUrl}`} alt="binding-type" />
                <span>{each.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div
        className="space-y-4"
        hidden={!selectedState.coverType?.coverMaterials || selectedState.coverType?.coverMaterials?.length === 0}
      >
        <span className="font-normal text-xl">{intl.formatMessage({ id: 'cover_material' })}</span>
        <div className="flex flex-wrap gap-4">
          {selectedState.coverType?.coverMaterials?.map((each: CoverMaterial) => (
            <button
              type="button"
              className={`w-28 p-2 rounded border-dashed border-4 focus:outline-none  ${
                selectedState.coverMaterial?.id === each.id ? 'border-green-400 outline-none' : 'hover:border-green-200'
              } `}
              key={each.id}
              onClick={() => {
                setSelectedState((prev) => ({
                  ...prev,
                  coverMaterial: each,
                  coverMaterialColor: each.coverMaterialColors?.[0],
                }))
              }}
            >
              <div className="flex flex-col">
                <img src={`${process.env.REACT_APP_PUBLIC_IMAGE}${each.imageUrl}`} alt="cover-material" />
                <span>{each.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div
        className="space-y-4"
        hidden={
          !selectedState.coverMaterial?.coverMaterialColors ||
          selectedState.coverMaterial?.coverMaterialColors.length === 0
        }
      >
        <span className="font-normal text-xl">{intl.formatMessage({ id: 'cover_material_color' })}</span>
        <div className="flex flex-wrap gap-4">
          <Slider
            responsive={{
              0: { items: 4 },
              600: { items: 6 },
            }}
            disableButtonsControls
            disableDotsControls
            items={selectedState.coverMaterial?.coverMaterialColors.map((each) => (
              <div
                className={`cursor-pointer w-28 focus:outline-none  ${
                  selectedState.coverMaterialColor?.id === each.id
                    ? 'border-4 border-blue-500'
                    : 'hover:border-green-200'
                } `}
                onClick={() => {
                  setSelectedState((prev) => ({ ...prev, coverMaterialColor: each }))
                }}
              >
                <img
                  src={`${process.env.REACT_APP_PUBLIC_IMAGE}${each.imageUrl}`}
                  className="w-full"
                  alt={each.name}
                  key={each.id}
                />
              </div>
            ))}
          />
        </div>
      </div>
      <AuthModal visible={isModalVisible} setVisible={setIsModalVisible} />
      <Link
        to={
          user
            ? `/editor?template=${template.id}&coverType=${selectedState.coverType?.id}&paperSize=${selectedState.paperSize?.id}&bindingType=${selectedState.bindingType?.id}&material=${selectedState.coverMaterial?.id}&color=${selectedState.coverMaterialColor?.id}`
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
export default PhotobookLayoutOptions
