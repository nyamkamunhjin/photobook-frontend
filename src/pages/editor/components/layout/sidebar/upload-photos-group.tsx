/* eslint-disable jsx-a11y/click-events-have-key-events */
import { LaptopOutlined, PictureOutlined } from '@ant-design/icons'
import { UploadablePicture } from 'interfaces'
import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import UploadModal from '../upload-modal'

interface Props {
  uploadPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void
  uploadPhotos: (images: UploadablePicture[]) => void
}

interface Type {
  visible: boolean
  type: 'google' | 'facebook'
}

const UploadPhotosGroup: React.FC<Props> = ({ uploadPhoto, uploadPhotos }) => {
  const [inputRef, setInputRef] = useState<any>(null)
  const [modal, setModal] = useState<Type>({
    visible: false,
    type: 'facebook',
  })

  const onFacebook = () => {
    if (!localStorage.getItem('facebookAccessToken')) {
      const popupWindow = window.open(
        `${process.env.REACT_APP_BACK_URL}/auth/facebook`,
        '_blank',
        'width=400, height=300'
      )
      if (popupWindow) popupWindow.focus()
    }
    setModal({ visible: true, type: 'facebook' })
  }

  const onGoogle = () => {
    if (!localStorage.getItem('googleAccessToken')) {
      const popupWindow = window.open(
        `${process.env.REACT_APP_BACK_URL}/auth/google`,
        '_blank',
        'width=400, height=300'
      )
      if (popupWindow) popupWindow.focus()
    }
    setModal({ visible: true, type: 'google' })
  }

  return (
    <>
      <div className="UploadPhotosGroup grid grid-cols-1 md:grid-cols-2">
        <input
          type="file"
          style={{ display: 'none' }}
          onChange={(e) => uploadPhoto(e)}
          ref={(file) => setInputRef(file)}
        />
        <div onClick={() => inputRef.click()} className="UploadPhotos">
          <LaptopOutlined className="icon" />
          <span>
            <FormattedMessage id="upload.computer" />
          </span>
        </div>
        <div className="UploadPhotos">
          <PictureOutlined className="icon" />
          <span>
            <FormattedMessage id="upload.my_photos" />
          </span>
        </div>
        <div onClick={onFacebook} className="UploadPhotos">
          <PictureOutlined className="icon" />
          <span>
            <FormattedMessage id="upload.facebook" />
          </span>
        </div>
        <div onClick={onGoogle} className="UploadPhotos">
          <PictureOutlined className="icon" />
          <span>
            <FormattedMessage id="upload.google" />
          </span>
        </div>
      </div>
      {modal.visible && (
        <UploadModal
          onCancel={() => setModal({ visible: false, type: 'facebook' })}
          onUpload={uploadPhotos}
          type="wide"
          visible={modal.visible}
          name={modal.type}
          loading={false}
        />
      )}
    </>
  )
}

export default UploadPhotosGroup
