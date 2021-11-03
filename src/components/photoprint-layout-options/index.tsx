import React, { FC, useCallback, useEffect, useState } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { PaperSize, RootInterface, Template } from 'interfaces'
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
  }
  setSelectedState: React.Dispatch<
    React.SetStateAction<{
      orientation?: string
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

  const orientations = paperSizes.reduce((acc, paperSize) => {
    if (!acc.some((item) => item.name === paperSize.orientation)) {
      acc.push({ name: paperSize.orientation, sizes: [paperSize] })
    } else {
      acc.find((item) => item.name === paperSize.orientation)?.sizes.push(paperSize)
    }
    return acc
  }, [] as any[])

  const initialState = useCallback(() => {
    const [paperSize] = orientations[0]?.sizes

    setSelectedState({
      orientation: orientations[0].name,
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
