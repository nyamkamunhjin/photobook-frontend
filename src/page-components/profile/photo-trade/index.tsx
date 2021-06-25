import { useRequest } from 'ahooks'
import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import { listUserTradePhoto } from 'api'
import { List } from 'antd'
import { TradePhoto } from 'interfaces'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

const PhotoTrade: React.FC = () => {
  const sellingPhotos = useRequest(listUserTradePhoto, {
    paginated: true,
  })

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-xl">
          <FormattedMessage id="purchased_photos" />
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <hr className="my-1" />
        <span className="font-semibold text-xl">
          <FormattedMessage id="selling_photos" />
        </span>
        <List
          // itemLayout="vertical"
          dataSource={sellingPhotos.data?.list || []}
          loading={sellingPhotos.loading}
          pagination={{
            ...sellingPhotos.pagination,
            onChange: sellingPhotos.pagination.changeCurrent,
          }}
          renderItem={(item: TradePhoto) => (
            <List.Item className="rounded p-2 hover:bg-gray-50" key={item.id}>
              <div className="flex gap-2 items-center w-full">
                <Zoom>
                  <img
                    className="w-32 h-20 object-cover"
                    src={`${process.env.REACT_APP_PUBLIC_IMAGE}${item.imageUrl}`}
                    alt={item.photoName}
                  />
                </Zoom>

                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-base">{item.photoName}</span>
                  <span className="w-full max-w-xs">{item.description}</span>
                </div>
                <div className="ml-auto">
                  <span className="font-semibold text-base">{item.sellCount}</span>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  )
}

export default PhotoTrade
