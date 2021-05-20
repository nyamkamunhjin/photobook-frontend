import React, { useState } from 'react'
import { Modal, Button } from 'antd'
import Spinner from 'components/spinner'
import { UploadablePicture } from 'interfaces'
import UploadPhotosGroup from '../upload-photos-group'

interface Props {
  loading: boolean
  images: any
  uploadPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void
  uploadPhotos: (images: UploadablePicture[]) => void
}

const Images: React.FC<Props> = ({ loading, images, uploadPhoto, uploadPhotos }) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false)

  const dragStart = (e: any, tempUrl: string, imageUrl: string) => {
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
          <UploadPhotosGroup uploadPhoto={uploadPhoto} uploadPhotos={uploadPhotos} />
        </Modal>
      </div>
      <div className="ImportedPhotos">
        {images.map((image: any) => {
          return (
            <div className="ImageContainer" key={`images${image.imageUrl}`}>
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

export default Images
