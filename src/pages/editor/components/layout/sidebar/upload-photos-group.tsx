/* eslint-disable jsx-a11y/click-events-have-key-events */
import { UploadablePicture } from 'interfaces'
import { RiComputerFill, RiFacebookBoxFill, RiGoogleFill, RiImageFill } from 'react-icons/ri'
import React, { useState } from 'react'
import { FormattedMessage } from 'react-intl'
import UploadModal from '../upload-modal'

interface Props {
  uploadPhoto: (e: React.ChangeEvent<HTMLInputElement>) => void
  linkPhoto: (images: string[]) => void
  syncPhoto: (images: UploadablePicture[]) => void
}

interface Type {
  visible: boolean
  type: 'google' | 'facebook' | 'photos'
}

const UploadPhotosGroup: React.FC<Props> = ({ uploadPhoto, syncPhoto, linkPhoto }) => {
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
  const onPhotos = () => {
    setModal({ visible: true, type: 'photos' })
  }

  return (
    <>
      <div className="UploadPhotosGroup grid grid-cols-1 md:grid-cols-2">
        <input
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => uploadPhoto(e)}
          ref={(file) => setInputRef(file)}
        />
        <div onClick={() => inputRef.click()} className="UploadPhotos">
          <RiComputerFill size={23} />
          <span>
            <FormattedMessage id="upload.computer" />
          </span>
        </div>
        <div onClick={onPhotos} className="UploadPhotos">
          <RiImageFill size={23} />
          <span>
            <FormattedMessage id="upload.my_photos" />
          </span>
        </div>
        <div onClick={onFacebook} className="UploadPhotos">
          <RiFacebookBoxFill size={23} />
          <span>
            <FormattedMessage id="upload.facebook" />
          </span>
        </div>
        <div onClick={onGoogle} className="UploadPhotos">
          <RiGoogleFill size={23} />
          <span>
            <FormattedMessage id="upload.google" />
          </span>
        </div>
      </div>
      {modal.visible && (
        <UploadModal
          onCancel={() => setModal({ visible: false, type: 'facebook' })}
          onUpload={syncPhoto}
          onLink={linkPhoto}
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
