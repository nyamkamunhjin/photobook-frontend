import React, { FC, useCallback, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { BindingType, CoverMaterial, CoverMaterialColor, CoverType, PaperSize, Template } from 'interfaces'
import Carousels from 'components/carousel'

interface Props {
  template: Template
  paperSizes: PaperSize[]
  selectedState: {
    paperSize?: PaperSize
    coverType?: CoverType
    bindingType?: BindingType
    coverMaterial?: CoverMaterial
    coverMaterialColor?: CoverMaterialColor
  }
  setSelectedState: React.Dispatch<
    React.SetStateAction<{
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

  const initialState = useCallback(() => {
    let coverType
    let bindingType
    let coverMaterial
    let coverMaterialColor

    const [paperSize] = paperSizes

    if (paperSize.coverTypes && paperSize.coverTypes.length > 0) [coverType] = paperSize.coverTypes
    if (coverType?.bindingTypes && coverType.bindingTypes.length > 0) [bindingType] = coverType.bindingTypes
    if (coverType?.coverMaterials && coverType.coverMaterials.length > 0) [coverMaterial] = coverType.coverMaterials
    if (coverMaterial?.coverMaterialColors && coverMaterial.coverMaterialColors.length > 0)
      [coverMaterialColor] = coverMaterial.coverMaterialColors

    setSelectedState({
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

  return (
    <div className="flex flex-col gap-4">
      <span className="text-2xl">{template.name}</span>
      <div className="space-y-4">
        <span className="font-semibold text-xl">{intl.formatMessage({ id: 'paper_size' })}</span>
        <div className="flex flex-wrap gap-4">
          {paperSizes.map((each: PaperSize) => (
            <button
              type="button"
              className={`w-32 p-2 rounded border-dashed border-4 focus:outline-none  ${
                selectedState.paperSize?.id === each.id ? 'border-green-400 outline-none' : 'hover:border-green-200'
              } `}
              key={each.id}
              onClick={() => {
                setSelectedState({ paperSize: each })
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
      </div>

      <div className="space-y-4">
        <span className="font-semibold text-xl">{intl.formatMessage({ id: 'cover_type' })}</span>
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
                  bindingType: undefined,
                  coverMaterial: undefined,
                  coverMaterialColor: undefined,
                }))
              }}
            >
              <div className="flex flex-col">
                <img src={each.imageUrl} alt="cover-type" />
                <span>{each.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <span className="font-semibold text-xl">{intl.formatMessage({ id: 'binding_type' })}</span>
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
                <img src={each.imageUrl} alt="binding-type" />
                <span>{each.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <span className="font-semibold text-xl">{intl.formatMessage({ id: 'cover_material' })}</span>
        <div className="flex flex-wrap gap-4">
          {selectedState.coverType?.coverMaterials?.map((each: CoverMaterial) => (
            <button
              type="button"
              className={`w-28 p-2 rounded border-dashed border-4 focus:outline-none  ${
                selectedState.coverMaterial?.id === each.id ? 'border-green-400 outline-none' : 'hover:border-green-200'
              } `}
              key={each.id}
              onClick={() => {
                setSelectedState((prev) => ({ ...prev, coverMaterial: each }))
              }}
            >
              <div className="flex flex-col">
                <img src={each.imageUrl} alt="cover-material" />
                <span>{each.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4" hidden={selectedState.coverMaterial?.coverMaterialColors.length === 0}>
        <span className="font-semibold text-xl">{intl.formatMessage({ id: 'cover_material_color' })}</span>
        <div className="flex flex-wrap gap-4">
          <Carousels>
            {({ style, className }: any) =>
              selectedState.coverMaterial?.coverMaterialColors?.map((each: CoverMaterialColor) => (
                <button
                  type="button"
                  className={`glider-slide ${className}`}
                  style={style}
                  key={each.id}
                  onClick={() => {
                    setSelectedState((prev) => ({ ...prev, coverMaterialColor: each }))
                  }}
                >
                  <div className="flex flex-col">
                    <img src={each.imageUrl} alt="cover-material-color" />
                    <span>{each.name}</span>
                  </div>
                </button>
              ))
            }
          </Carousels>
        </div>
      </div>
    </div>
  )
}
export default PhotobookLayoutOptions
