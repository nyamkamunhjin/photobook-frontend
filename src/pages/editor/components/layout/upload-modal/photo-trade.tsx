import { useRequest } from 'ahooks'
import { Checkbox, Spin } from 'antd'
import { listTradeImages, listTradePhoto } from 'api'
import { Empty } from 'components'
import { Image, TradePhoto, UploadablePicture } from 'interfaces'
import React from 'react'

interface Props {
  name: 'photo_trade'
  setSelectedImages: (images: UploadablePicture[]) => void
}

const PhotoTrade: React.FC<Props> = ({ setSelectedImages }) => {
  const images = useRequest<Image[]>(listTradeImages)
  const tradePhotos = useRequest<TradePhoto[]>(listTradePhoto)
  const formatter = new Intl.NumberFormat()

  const renderBody = (_images: Image[]) =>
    _images?.map((image) => {
      if (!tradePhotos.data)
        return (
          <Checkbox key={image.id} value={image.id} className="w-24 h-24">
            <img src={image.tempUrl} className="object-cover" alt={image.id} />
          </Checkbox>
        )
      const { price, sellCount } = tradePhotos.data.find((item) => item.id === parseFloat(image.id)) as TradePhoto
      return (
        <Checkbox key={image.id} value={image.id} className="w-24 h-24">
          <div className="flex flex-col text-xs">
            <img src={image.tempUrl} className="object-cover" alt={image.id} />
            <span>
              Үнэ: <b>{formatter.format(price)}₮</b>
            </span>
            <span>
              Зарагдсан тоо: <b>{sellCount}</b>
            </span>
          </div>
        </Checkbox>
      )
    })
  return (
    <>
      {images.loading && tradePhotos.loading ? (
        <Spin spinning>
          <div style={{ height: 150 }} />
        </Spin>
      ) : (
        <>
          {(images.data?.length || 0) > 0 ? (
            <div>
              <Checkbox.Group
                onChange={(list) => {
                  setSelectedImages(
                    (images.data || [])
                      .filter((a) => list.includes(a.id))
                      .map<UploadablePicture>((each) => ({
                        url: each.imageUrl,
                        filename: each.name,
                        id: each.id,
                        mimeType: 'png',
                      }))
                  )
                }}
              >
                {renderBody(images.data as Image[])}
              </Checkbox.Group>
            </div>
          ) : (
            <Empty />
          )}
        </>
      )}
    </>
  )
}

export default PhotoTrade
