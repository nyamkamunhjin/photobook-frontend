import React, { FC, useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { FrameMaterial, PaperSize, RootInterface, Template } from 'interfaces'
import { Link } from 'react-router-dom'
import { CustomButton } from 'components'
import { useSelector } from 'react-redux'
import AuthModal from '../auth-modal'

interface Props {
  template: Template
  paperSizes: PaperSize[]
  frameMaterials: FrameMaterial[]
  selectedState: {
    paperSize?: PaperSize | undefined
    frameMaterial?: FrameMaterial | undefined
  }
  setSelectedState: React.Dispatch<
    React.SetStateAction<{
      paperSize?: PaperSize | undefined
      frameMaterial?: FrameMaterial | undefined
    }>
  >
}

const FrameLayoutOptions: FC<Props> = ({ template, frameMaterials, paperSizes, selectedState, setSelectedState }) => {
  const intl = useIntl()
  const user = useSelector((state: RootInterface) => state.auth.user)
  const [isModalVisible, setIsModalVisible] = useState(false)
  useEffect(() => {
    const initialState = () => {
      const [paperSize] = paperSizes

      setSelectedState({
        paperSize,
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
        <span className="font-normal text-xl">{intl.formatMessage({ id: 'paper_size' })}</span>
        <div className="flex flex-wrap gap-4">
          {paperSizes?.map((each: PaperSize) => (
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

      <div className="space-y-4">
        <span className="font-normal text-xl">{intl.formatMessage({ id: 'frame_material' })}</span>
        <div className="flex flex-wrap gap-4">
          {frameMaterials?.map((each: FrameMaterial) => (
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
      <Link
        to={user ? `/editor/frame?template=${template.id}&paperSize=${selectedState.paperSize?.id}` : '#'}
        onClick={() => !user && setIsModalVisible(true)}
      >
        <CustomButton className="btn-primary">
          <FormattedMessage id="start_book" />
        </CustomButton>
      </Link>
    </div>
  )
}
export default FrameLayoutOptions
