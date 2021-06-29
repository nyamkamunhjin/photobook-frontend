import { useRequest } from 'ahooks'
import React from 'react'
import { FormattedMessage } from 'react-intl'
import { listUserPurchasedPhotos, listUserSellingPhotos } from 'api'
import { List, ConfigProvider } from 'antd'
import { TradePhoto } from 'interfaces'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'
import { currencyFormat } from 'utils'
import UploadPhoto from 'pages/photo-trade/upload-photo'

const PhotoTrade: React.FC = () => {
  const sellingPhotos = useRequest(listUserSellingPhotos, {
    paginated: true,
  })

  const purchasedPhotos = useRequest(listUserPurchasedPhotos, {
    paginated: true,
  })

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <span className="font-semibold text-xl">
          <FormattedMessage id="purchased_photos" />
        </span>
        <List
          // itemLayout="vertical"
          dataSource={purchasedPhotos.data?.list || []}
          loading={purchasedPhotos.loading}
          pagination={{
            ...purchasedPhotos.pagination,
            onChange: purchasedPhotos.pagination.changeCurrent,
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

                <div className="flex flex-col gap-2 self-start">
                  <span className="font-semibold text-base">{item.photoName}</span>
                  <span className="w-full max-w-xs">{item.description}</span>
                </div>

                {/* <div className="ml-auto">
                  <Link
                    className="btn-primary"
                    to={`${process.env.REACT_APP_PUBLIC_IMAGE}${item.imageUrl}`}
                    target="_blank"
                    download
                  >
                    <FormattedMessage id="download" />
                  </Link>
                </div> */}
              </div>
            </List.Item>
          )}
        />
      </div>
      <div className="flex flex-col gap-2">
        <hr className="my-1" />
        <div className="flex items-center">
          <span className="font-semibold text-xl">
            <FormattedMessage id="selling_photos" />
          </span>
          <div className="ml-auto">
            <UploadPhoto />
          </div>
        </div>
        <ConfigProvider
          renderEmpty={() => (
            <div className="w-full flex flex-col gap-4">
              <span className="text-base text-gray-500">
                <FormattedMessage id="you_have_no_selling_photos" />
              </span>
              <UploadPhoto />
            </div>
          )}
        >
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

                  <div className="flex flex-col gap-2 self-start">
                    <span className="font-semibold text-base">{item.photoName}</span>
                    <span className="w-full max-w-xs">{item.description}</span>
                    <span className="w-full max-w-xs">{currencyFormat(item.price)} ₮</span>
                  </div>

                  {/* <div className="ml-auto">
                  <span className="font-semibold text-base">{item.sellCount}</span>
                </div> */}
                </div>
              </List.Item>
            )}
          />
        </ConfigProvider>
      </div>
    </div>
  )
}

export default PhotoTrade
