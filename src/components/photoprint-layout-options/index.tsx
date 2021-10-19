import React, { FC, useCallback, useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { PaperSize, RootInterface, Template } from 'interfaces'
import 'react-alice-carousel/lib/alice-carousel.css'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import CustomButton from '../custom-button'
import AuthModal from '../auth-modal'

interface Props {
  template: Template
  paperSizes: PaperSize[]
  selectedState: {
    paperSize?: PaperSize
  }
  setSelectedState: React.Dispatch<
    React.SetStateAction<{
      paperSize?: PaperSize | undefined
    }>
  >
}

const PhotoprintLayoutOptions: FC<Props> = ({ template, paperSizes, selectedState, setSelectedState }) => {
  const intl = useIntl()
  const urlParams = new URLSearchParams(window.location.search)
  const tradephoto = urlParams.get('tradephoto')
  const user = useSelector((state: RootInterface) => state.auth.user)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const initialState = useCallback(() => {
    const [paperSize] = paperSizes

    setSelectedState({
      paperSize,
    })
  }, [paperSizes, setSelectedState])

  useEffect(() => {
    if (paperSizes) {
      initialState()
    }
  }, [initialState, paperSizes])

  return (
    <div className="flex flex-col gap-4">
      <span className="text-3xl font-bold">{template.name}</span>
      <div className="space-y-4">
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
      <AuthModal visible={isModalVisible} setVisible={setIsModalVisible} />
      <Link
        to={
          user
            ? `/editor/photoprint?template=${template.id}&paperSize=${selectedState.paperSize?.id}${
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
export default PhotoprintLayoutOptions
