/* eslint @typescript-eslint/no-explicit-any: off */
import useRequest from '@ahooksjs/use-request'
import { Checkbox, Spin } from 'antd'
import { listMyImages } from 'api'
import { Empty } from 'components'
import { Image, UploadablePicture } from 'interfaces'
import React from 'react'

interface Props {
  name: 'photos'
  onCancel?: (e: React.MouseEvent<HTMLElement>) => void
  setSelectedImages: (images: UploadablePicture[]) => void
}

const Photos: React.FC<Props> = ({ children, name, onCancel, setSelectedImages, ...props }) => {
  const images = useRequest<Image[]>(listMyImages)

  const renderBody = (_images: Image[]) =>
    _images?.map((image) => (
      <Checkbox key={image.id} value={image.id} className="w-24 h-24">
        <img src={image.tempUrl} className="object-cover" alt={image.id} />
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

export default Photos
