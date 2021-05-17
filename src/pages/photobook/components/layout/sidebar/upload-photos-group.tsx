/* eslint-disable jsx-a11y/click-events-have-key-events */
import { LaptopOutlined, PictureOutlined } from '@ant-design/icons'
import React, { useState } from 'react'

interface Props {
  uploadPhoto: any
}

const UploadPhotosGroup: React.FC<Props> = ({ uploadPhoto }) => {
  const [inputRef, setInputRef] = useState<any>(null)

  return (
    <div className="UploadPhotosGroup">
      <input
        type="file"
        style={{ display: 'none' }}
        onChange={(e) => uploadPhoto(e)}
        ref={(file) => setInputRef(file)}
      />
      <div onClick={() => inputRef.click()} className="UploadPhotos">
        <LaptopOutlined className="icon" />
        <span>Computer</span>
      </div>
      <div className="UploadPhotos">
        <PictureOutlined className="icon" />
        <span>My Photos</span>
      </div>
    </div>
  )
}

export default UploadPhotosGroup
