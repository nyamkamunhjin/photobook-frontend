import { useRequest } from 'ahooks'
import { Checkbox, Spin } from 'antd'
import { listTradePhoto } from 'api'
import { Empty } from 'components'
import { Image, UploadablePicture } from 'interfaces'
import React from 'react'

interface Props {
  name: 'photo_trade'
  setSelectedImages: (images: UploadablePicture[]) => void
}

const PhotoTrade: React.FC<Props> = ({ setSelectedImages }) => {
  const images = useRequest<Image[]>(listTradePhoto)
  const renderBody = (_images: Image[]) =>
    _images?.map((image) => (
      <Checkbox key={image.id} value={image.id} className="w-24 h-24">
        <img
          src={image.tempUrl || process.env.REACT_APP_PUBLIC_IMAGE + image.imageUrl}
          className="object-cover"
          alt={image.id}
        />
      </Checkbox>
    ))
  return (
    <>
      {images.loading ? (
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
