import React, { useState } from 'react'
import Spinner from 'components/spinner'
import { Modal, Button } from 'antd'
import UploadPhotosGroup from '../upload-photos-group'

interface Props {
  loading: any
  images: any
  uploadPhoto: any
}

const Masks: React.FC<Props> = ({ loading, images, uploadPhoto }) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false)

  const dragStart = (e: any, tempUrl: any, imageUrl: any) => {
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
