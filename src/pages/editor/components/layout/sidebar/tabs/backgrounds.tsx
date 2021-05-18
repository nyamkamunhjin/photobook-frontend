import React from 'react'
import Spinner from 'components/spinner'
import { Button } from 'antd'
import { Image } from 'interfaces'
import { FormattedMessage } from 'react-intl'

interface Props {
  loading: boolean
  images: Image[]
  backgroundEdit: boolean
  setDragStart: (dragStart: boolean) => void
  setBackgroundEdit: (backgroundEdit: boolean) => void
}

const Backgrounds: React.FC<Props> = ({ loading, images, backgroundEdit, setDragStart, setBackgroundEdit }) => {
  const onDragStart = (e: any, tempUrl: string, imageUrl: string) => {
    setDragStart(true)
    e.dataTransfer.setData('tempUrl', tempUrl)
    e.dataTransfer.setData('imageUrl', imageUrl)
  }

  const onDragEnd = () => {
    setDragStart(false)
  }

  return loading ? (
    <Spinner />
  ) : (
    <div className="Images">
      <div className="ImportedPhotos" style={{ marginBottom: 45 }}>
        {images.map((image) => {
          return (
            <div className="ImageContainer" key={`${image.imageUrl}`}>
              <img
                draggable
                onDragStart={(e) => onDragStart(e, image.tempUrl, image.imageUrl)}
                onDragEnd={onDragEnd}
                alt={image.tempUrl}
                src={image.tempUrl}
              />
            </div>
          )
        })}
      </div>
      {backgroundEdit ? (
        <Button
          type="primary"
          onClick={() => setBackgroundEdit(false)}
          style={{ margin: 5, position: 'absolute', bottom: 0, width: 280 }}
        >
          <FormattedMessage id="done" />
        </Button>
      ) : (
        <Button
          type="primary"
          onClick={() => setBackgroundEdit(true)}
          style={{ margin: 5, position: 'absolute', bottom: 0, width: 280 }}
        >
          <FormattedMessage id="edit_background" />
        </Button>
      )}
    </div>
  )
}

export default Backgrounds
