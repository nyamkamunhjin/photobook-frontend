/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import { connect } from 'react-redux'
import { useDrop, useRequest } from 'ahooks'
import {
  addImages as _addImages,
  uploadImages as _uploadImages,
  linkImages as _linkImages,
  unlinkImages as _unlinkImages,
} from 'redux/actions/image'
import {
  addNewPrintSlide as _addNewPrintSlide,
  duplicatePrintSlide as _duplicatePrintSlide,
  deletePrintSlide as _deletePrintSlide,
} from 'redux/actions/project'

import { s3SyncImages, s3UploadImages } from 'utils/aws-lib'
import { FormattedMessage } from 'react-intl'
import { listPaperMaterial, listPaperSize } from 'api'
import { Image, ImageInterface, ProjectInterface, RootInterface, Slide, UploadablePicture } from 'interfaces'

import Grid from './grid'
import UploadPhotosGroup from '../upload-modal/upload-photos-group'

interface Props {
  addImages: (keys: { key: string; naturalSize: any }[], id: number) => Promise<void>
  linkImages: (images: string[], id: number) => Promise<Image[] | null>
  unlinkImages: (images: number[], id: number) => Promise<void>
  uploadImages: () => Promise<void>
  addNewPrintSlide: (projectId: number, imageUrl: string[]) => Promise<void>
  duplicatePrintSlide: (projectId: number, slideIndex: string, duplicatedSlide: Slide) => Promise<void>
  deletePrintSlide: (projectId: number, slideIndex: string) => Promise<void>
  image: ImageInterface
  project: ProjectInterface
}
const PrintPanel: React.FC<Props> = ({
  addImages,
  uploadImages,
  linkImages,
  unlinkImages,
  addNewPrintSlide,
  duplicatePrintSlide,
  deletePrintSlide,
  project: { currentProject, loading: projectLoading },
  image: { loading },
}) => {
  const paperSizes = useRequest(() => listPaperSize({ current: 0, pageSize: 100 }, { templateType: 'print' }))
  const paperMaterials = useRequest(() => listPaperMaterial({ current: 0, pageSize: 100 }, { templateTypes: 'print' }))
  const [props, { isHovering }] = useDrop({
    onFiles: (files) => {
      uploadImages()
      s3UploadImages(files).then((keys) => {
        addImages(keys, currentProject.id).then(() =>
          addNewPrintSlide(
            currentProject.id,
            keys.map((key) => key.key)
          )
        )
      })
    },
  })

  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files?.length > 0) {
      await uploadImages()
      const keys = await s3UploadImages(Array.from(e.target.files))
      await addImages(keys, currentProject.id)
      await addNewPrintSlide(
        currentProject.id,
        keys.map((key) => key.key)
      )
    }
  }

  const syncPhoto = async (_images: UploadablePicture[]) => {
    if (_images.length) {
      await uploadImages()
      const keys = await s3SyncImages(_images)
      await addImages(keys, currentProject.id)
      await addNewPrintSlide(currentProject.id, keys)
    }
  }

  const linkPhoto = async (_images: string[]) => {
    await uploadImages()
    const timages = await linkImages(_images, currentProject.id)
    if (timages) {
      await addNewPrintSlide(
        currentProject.id,
        timages.map((each) => each.imageUrl)
      )
    }
  }
  const duplicatePhoto = async (object: Slide) => {
    await duplicatePrintSlide(currentProject.id, object.slideId, object)
  }
  const removePhoto = async (object: Slide) => {
    await deletePrintSlide(currentProject.id, object.slideId)
  }

  const unlinkPhoto = async (_images: Image[], type?: string) => {
    const imagesIds = _images.reduce((acc, item) => {
      const projectImage = item.projects.find(
        (pImage) => pImage.type === type && pImage.projectId === currentProject.id
      )
      if (projectImage) acc.push(projectImage.id)
      return acc
    }, [] as number[])
    if (imagesIds.length === 0) return
    await uploadImages()
    await unlinkImages(imagesIds, currentProject.id)
  }

  return (
    <div className="center-panel h-full" style={isHovering ? { background: '#add6ff' } : {}} {...props}>
      {currentProject.slides.length > 0 && (
        <Grid
          loading={loading || projectLoading}
          uploadPhoto={uploadPhoto}
          syncPhoto={syncPhoto}
          linkPhoto={linkPhoto}
          duplicatePhoto={duplicatePhoto}
          removePhoto={removePhoto}
          paperSizes={paperSizes.data?.list || []}
          paperMaterials={paperMaterials.data?.list || []}
          currentProject={currentProject}
        />
      )}
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
  project: state.project,
})

export default connect(mapStateToProps, {
  addImages: _addImages,
  linkImages: _linkImages,
  unlinkImages: _unlinkImages,
  uploadImages: _uploadImages,
  addNewPrintSlide: _addNewPrintSlide,
  duplicatePrintSlide: _duplicatePrintSlide,
  deletePrintSlide: _deletePrintSlide,
})(PrintPanel)
