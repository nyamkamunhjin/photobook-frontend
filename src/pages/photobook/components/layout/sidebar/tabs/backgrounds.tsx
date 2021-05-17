import React, { useState } from 'react'
import Spinner from 'components/spinner'
import { Modal, Button } from 'antd'
import UploadPhotosGroup from '../upload-photos-group'

interface Props {
  loading: any
  images: any
  uploadPhoto: any
  backgroundEdit: any
  setDragStart: any
  setBackgroundEdit: any
}

const Backgrounds: React.FC<Props> = ({
  loading,
  images,
  uploadPhoto,
  backgroundEdit,
  setDragStart,
  setBackgroundEdit,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false)

  const onDragStart = (e: any, tempUrl: any, imageUrl: any) => {
    setDragStart(true)
    e.dataTransfer.setData('tempUrl', tempUrl)
    e.dataTransfer.setData('imageUrl', imageUrl)
  }

  const showModal = () => {
    setModalVisible(true)
  }

  const handleOk = () => {
    setModalVisible(false)
  }

  const handleCancel = () => {
    setModalVisible(false)
  }

  const onDragEnd = () => {
    setDragStart(false)
  }

  return loading ? (
    <Spinner />
  ) : (
    <div className="Images">
      <div className="AddMorePhotos">
        <Button type="dashed" style={{ width: '100%' }} onClick={showModal}>
          Add more photos
        </Button>
        <Modal title="Upload" visible={modalVisible} onOk={handleOk} onCancel={handleCancel}>
          <UploadPhotosGroup uploadPhoto={uploadPhoto} />
        </Modal>
      </div>
      <div className="ImportedPhotos" style={{ marginBottom: 45 }}>
        {images.map((image: any) => {
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
          Done
        </Button>
      ) : (
        <Button
          type="primary"
          onClick={() => setBackgroundEdit(true)}
          style={{ margin: 5, position: 'absolute', bottom: 0, width: 280 }}
        >
          Edit Background
        </Button>
      )}
    </div>
  )
}

export default Backgrounds
