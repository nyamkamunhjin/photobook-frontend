import React from 'react'
import Spinner from 'components/spinner'
import { Image } from 'interfaces'

interface Props {
  loading: boolean
  images: Image[]
}

const Masks: React.FC<Props> = ({ loading, images }) => {
  const dragStart = (e: any, tempUrl: any, imageUrl: any) => {
    e.dataTransfer.setData('tempUrl', tempUrl)
    e.dataTransfer.setData('imageUrl', imageUrl)
  }

  return loading ? (
    <Spinner />
  ) : (
    <div className="Images">
      <div className="ImportedPhotos">
        {images.map((image: any) => {
          return (
            <div className="ImageContainer" key={`masks${image.imageUrl}`}>
              <img
                draggable
                onDragStart={(e) => dragStart(e, image.tempUrl, image.imageUrl)}
                alt={image.tempUrl}
                src={image.tempUrl}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Masks
