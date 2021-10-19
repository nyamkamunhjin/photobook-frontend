import React, { FC, useEffect, useRef, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { PaperMaterial, PaperSize, RootInterface, Template } from 'interfaces'
import { Select } from 'antd'
import { Link, useHistory } from 'react-router-dom'
import { CustomButton } from 'components'
import { useSelector } from 'react-redux'
import AuthModal from '../auth-modal'

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
  const urlParams = new URLSearchParams(window.location.search)
  const tradephoto = urlParams.get('tradephoto')
  const user = useSelector((state: RootInterface) => state.auth.user)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const widthRef = useRef<HTMLInputElement>(null)
  const heightRef = useRef<HTMLInputElement>(null)
  const history = useHistory()

  const onFinish = () => {
    if (
      !widthRef.current ||
      !heightRef.current ||
      parseFloat(widthRef.current?.value) === 0 ||
      parseFloat(heightRef.current?.value) === 0
    )
      return alert('Please check the size')

    return history.push(
      `/editor/canvas/split?template=${template.id}&width=${widthRef.current.value}&height=${heightRef.current.value}${
        tradephoto ? `&tradephoto=${tradephoto}` : ''
      }`
    )
  }

  useEffect(() => {
    const initialState = () => {
      const [paperSize] = paperSizes
      // const [paperMaterial] = paperMaterials

      setSelectedState({
        paperSize,
        // paperMaterial,
      })
    }
    if (paperSizes) {
      initialState()
    }
  }, [paperSizes, setSelectedState])

  return (
    <div className="flex flex-col gap-4">
      <span className="text-3xl font-bold">{template.name}</span>

      <div className="space-y-4">
        <span className="font-normal text-xl">{intl.formatMessage({ id: 'paper_material_type' })}</span>
        <div className="flex flex-wrap gap-4">
          <Select
            className="w-full"
            onChange={(value) => {
              setSelectedState((each) => ({
                ...each,
                paperMaterial: paperMaterials.find(({ id }) => id === value),
              }))
            }}
          >
            {paperMaterials.map((each) => (
              <Select.Option key={each.id} value={each.id}>
                <span className="font-normal text-gray-700 text-base">{`${each.name} - ${each.paperType}`}</span>
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-4" hidden={template.canvasType === 'Split'}>
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
      <div className="space-y-4" hidden={template.canvasType !== 'Split'}>
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
      <AuthModal visible={isModalVisible} setVisible={setIsModalVisible} />
      {template.canvasType === 'Split' ? (
        <CustomButton onClick={onFinish} className="btn-primary max-w-max">
          <FormattedMessage id="start_book" />
        </CustomButton>
      ) : (
        <Link
          to={
            user
              ? `/editor/canvas?template=${template.id}&paperSize=${selectedState.paperSize?.id}${
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
      )}
    </div>
  )
}
export default CanvasLayoutOptions
