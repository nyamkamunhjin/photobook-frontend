import React, { FC, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { PaperMaterial, PaperSize, Template } from 'interfaces'
import { Select } from 'antd'

interface Props {
  template: Template
  paperSizes: PaperSize[]
  paperMaterials: PaperMaterial[]
  selectedState: {
    paperSize?: PaperSize
    paperMaterial?: PaperMaterial
  }
  setSelectedState: React.Dispatch<
    React.SetStateAction<{
      paperSize?: PaperSize | undefined
      paperMaterial?: PaperMaterial | undefined
    }>
  >
}

const CanvasLayoutOptions: FC<Props> = ({ template, paperSizes, paperMaterials, selectedState, setSelectedState }) => {
  const intl = useIntl()

  const initialState = () => {
    const [paperSize] = paperSizes
    // const [paperMaterial] = paperMaterials

    setSelectedState({
      paperSize,
      // paperMaterial,
    })
  }

  useEffect(() => {
    if (paperSizes) {
      initialState()
    }
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <span className="text-2xl">{template.name}</span>

      <div className="space-y-4">
        <span className="font-semibold text-xl">{intl.formatMessage({ id: 'paper_material_type' })}</span>
        <div className="flex flex-wrap gap-4">
          <Select
            className="w-full"
            onChange={(value) => {
              setSelectedState({
                paperMaterial: paperMaterials.find(({ id }) => id === value),
              })
            }}
          >
            {paperMaterials.map((each) => (
              <Select.Option key={each.id} value={each.id}>
                <span className="font-semibold text-gray-700 text-base">{each.paperType}</span>
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>

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
      </div>
    </div>
  )
}
export default CanvasLayoutOptions
