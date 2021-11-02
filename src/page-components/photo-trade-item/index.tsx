import React, { FC, useMemo, useState } from 'react'
import 'react-medium-image-zoom/dist/styles.css'
import Zoom from 'react-medium-image-zoom'
import { FormattedMessage, useIntl } from 'react-intl'
import { CustomButton } from 'components'
import { buyPhoto, listTemplateCategory } from 'api'
import { currencyFormat } from 'utils'
import { notification, Select } from 'antd'
import { Category, TradePhotoCategory } from 'interfaces'
import { Link } from 'react-router-dom'

interface Props {
  tradePhoto: any
  categories: any
}

// угаалгах, жаазлах, canvas /single, split - template сонгох/
const EDITORS = [
  { name: 'photoprint', url: '/product/photoprint?all=false', type: 'photoprint' },
  { name: 'frame', url: '/product/frame?all=false&format=Single', type: 'frame' },
  { name: 'canvas_single', url: '/product/canvas?all=false&format=Single', type: 'canvas' },
  { name: 'canvas_split', url: '/product/canvas?all=false&format=Split', type: 'canvas' },
]

const PhotoTradeItem: FC<Props> = ({ tradePhoto, categories }) => {
  const intl = useIntl()
  const [editor, setEditor] = useState<{ name: string; url: string; type: string } | null>(null)

  return (
    <div className="flex flex-col items-start min-h-screen ">
      <div className="w-full py-20 px-24 bg-gray-100 shadow-inner">
        <Zoom wrapStyle={{ width: '100%' }}>
          <img
            className="w-full shadow-3xl focus:outline-none"
            src={`${process.env.REACT_APP_PUBLIC_IMAGE}${tradePhoto.data?.imageUrl}`}
            alt={tradePhoto.data?.photoName}
          />
        </Zoom>
      </div>
      <div className="w-full flex flex-col sm:flex-row gap-4 py-4 px-8 items-start h-full">
        <div className="w-full flex flex-col gap-4 items-start">
          <span className="text-4xl mt-0 pt-0 font-semibold">{tradePhoto.data?.photoName}</span>

          <div className="flex flex-col">
            <span className="text-base font-semibold">
              <FormattedMessage id="description" />
            </span>
            <p className="text-base">{tradePhoto.data?.description}</p>
          </div>

          <div className="flex flex-col">
            <span className="text-base font-semibold">
              <FormattedMessage id="sell_count" />
            </span>
            <span className="text-4xl mt-0 pt-0 font-bold">{tradePhoto.data?.sellCount}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-base font-semibold">
              <FormattedMessage id="owner" />
            </span>
            <span className="text-4xl mt-0 pt-0 font-bold">
              {tradePhoto.data?.user?.firstName} {tradePhoto.data?.user?.lastName}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-base font-semibold">
              <FormattedMessage id="tag" />
            </span>
            <p className="text-base font-bold">{tradePhoto.data?.tag?.map((each: string) => `#${each}`).join(', ')}</p>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-base font-semibold">
              <FormattedMessage id="categories" />
            </span>
            {/* <p className="text-base font-bold">{tradePhoto.data?.sellCount}</p> */}
            <div className="flex flex-wrap gap-1">
              {tradePhoto.data?.categories?.map((each: TradePhotoCategory) => (
                <span className="text-sm font-medium py-1 px-3 border rounded-xl shadow-sm" key={each.id}>
                  {each.name}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full flex flex-col gap-4 rounded-xl shadow-2xl bg-white">
          <div className="flex flex-col p-6 border-b">
            <span className="text-base font-semibold">
              <FormattedMessage id="price" />
            </span>
            <span className="text-4xl font-semibold">
              {currencyFormat(tradePhoto.data?.price)}
              <span className="text-lg font-bold">₮</span>
            </span>
          </div>
          <div className="flex flex-col gap-4 p-6">
            {/* <CustomButton
              className="w-full bg-black text-white py-4 px-3 focus:outline-none rounded-xl text-lg font-semibold component-hover"
              onClick={() =>
                buyPhoto(tradePhoto.data?.id).then((res) => {
                  if (res) notification.success({ message: intl.formatMessage({ id: 'success!' }) })
                })
              }
            >
              <FormattedMessage id="buy" />
            </CustomButton> */}
            <span className="text-base font-semibold">
              <FormattedMessage id="choose_editor" />
            </span>
            <Select
              className="w-full"
              onChange={(value) => {
                const _editor = EDITORS.find((item) => item.name === value)
                if (_editor) setEditor(_editor)
              }}
            >
              {EDITORS.map((each) => (
                <Select.Option key={each.name} value={each.name}>
                  <FormattedMessage id={each.name} />
                </Select.Option>
              ))}
            </Select>
            {editor && (
              <Link to={`${editor.url}&category=${categories[editor.type] || 1}&tradephoto=${tradePhoto.data.id}`}>
                <CustomButton className="w-full bg-black text-white py-4 px-3 focus:outline-none rounded-xl text-lg font-semibold component-hover">
                  <FormattedMessage id="move_editor" />
                </CustomButton>
              </Link>
            )}
          </div>
        </div>
      </div>
      {/* <span className="text-base font-semibold">
        <FormattedMessage id="photo_by" />:{' '}
        <span className="font-normal">
          {tradePhoto.data?.user.firstName} {tradePhoto.data?.user.lastName}
        </span>
      </span> */}
    </div>
  )
}

export default PhotoTradeItem
