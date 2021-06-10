/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react'
import { connect } from 'react-redux'
import { useDrop, useRequest } from 'ahooks'
import {
  addImages as _addImages,
  uploadImages as _uploadImages,
  linkImages as _linkImages,
  unlinkImages as _unlinkImages,
} from 'redux/actions/image'
import {
  setType as _setType,
  setDragStart as _setDragStart,
  setBackgroundEdit as _setBackgroundEdit,
  toggleSidebar as _toggleSidebar,
} from 'redux/actions/editor'
import { s3SyncImages, s3UploadImages } from 'utils/aws-lib'
import { FormattedMessage } from 'react-intl'
import { listPaperMaterial, listPaperSize } from 'api'
import { ImageInterface, PaperMaterial, PaperSize, Project, RootInterface, UploadablePicture } from 'interfaces'

import Images from './images'
import UploadPhotosGroup from '../upload-modal/upload-photos-group'

interface Props {
  addImages: (images: string[], id: number) => Promise<void>
  linkImages: (images: string[], id: number) => Promise<void>
  unlinkImages: (images: string[], id: number) => Promise<void>
  uploadImages: () => Promise<void>
  setBackgroundEdit: (backgroundEdit: boolean) => void
  toggleSidebar: () => void
  image: ImageInterface
  currentProject: Project
}

const PrintPanel: React.FC<Props> = ({
  addImages,
  uploadImages,
  linkImages,
  unlinkImages,
  currentProject,
  image: { images, loading },
}) => {
  const paperSizes = useRequest<PaperSize[]>(listPaperSize)
  const paperMaterials = useRequest<PaperMaterial[]>(listPaperMaterial)
  const [props, { isHovering }] = useDrop({
    onFiles: (files) => {
      uploadImages()
      s3UploadImages(files).then((keys) => {
        addImages(keys, currentProject.id)
      })
    },
  })

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files?.length > 0) {
      await uploadImages()
      const keys = await s3UploadImages(Array.from(e.target.files))
      await addImages(keys, currentProject.id)
    }
  }

  const syncPhoto = async (_images: UploadablePicture[]) => {
    if (_images.length) {
      await uploadImages()
      const keys = await s3SyncImages(_images)
      await addImages(keys, currentProject.id)
    }
  }

  const linkPhoto = async (_images: string[]) => {
    await uploadImages()
    await linkImages(_images, currentProject.id)
  }

  const unlinkPhoto = async (_images: string[]) => {
    await uploadImages()
    await unlinkImages(_images, currentProject.id)
  }

  const uploadedImages = images.filter((image) => image.type === 'images')
  return (
    <div className="CenterPanel" style={isHovering ? { background: '#add6ff' } : {}} {...props}>
      <Images
        loading={loading}
        images={uploadedImages}
        uploadPhoto={uploadPhoto}
        syncPhoto={syncPhoto}
        linkPhoto={linkPhoto}
        unlinkPhoto={unlinkPhoto}
        paperSizes={paperSizes.data}
        paperMaterials={paperMaterials.data}
      />
      <div className="TabView">
        <div className="UserPhotoList">
          <div className="LibraryItemsListContainer">
            <div className="UploadImageDropArea">
              <div>
                <p>
                  <FormattedMessage id="choose_source_to" />
                </p>
                <p className="phrase-add">
                  <FormattedMessage id="add_photos" />
                </p>
              </div>
              <UploadPhotosGroup single uploadPhoto={uploadPhoto} syncPhoto={syncPhoto} linkPhoto={linkPhoto} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state: RootInterface) => ({
  image: state.image,
  currentProject: state.project.currentProject,
})

export default connect(mapStateToProps, {
  addImages: _addImages,
  linkImages: _linkImages,
  unlinkImages: _unlinkImages,
  setType: _setType,
  setDragStart: _setDragStart,
  setBackgroundEdit: _setBackgroundEdit,
  toggleSidebar: _toggleSidebar,
  uploadImages: _uploadImages,
})(PrintPanel)