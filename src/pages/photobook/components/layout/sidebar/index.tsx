/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import {
  BgColorsOutlined,
  BorderOuterOutlined,
  LayoutOutlined,
  LeftOutlined,
  PictureOutlined,
  StarOutlined,
} from '@ant-design/icons'
import { Button } from 'antd'
import { getImages as _getImages, addImage as _addImage } from 'redux/actions/image'
import {
  setType as _setType,
  setDragStart as _setDragStart,
  setBackgroundEdit as _setBackgroundEdit,
  toggleSidebar as _toggleSidebar,
} from 'redux/actions/editor'
import { s3Upload } from 'utils/aws-lib'
import { FormattedMessage } from 'react-intl'
import { EditorInterface, ImageInterface, RootInterface } from 'interfaces'

import Images from './tabs/images'
import Backgrounds from './tabs/backgrounds'
import Cliparts from './tabs/cliparts'
import Masks from './tabs/masks'
import Frames from './tabs/frames'
import Layouts from './tabs/layouts'
import UploadPhotosGroup from './upload-photos-group'

interface Props {
  getImages: () => void
  addImage: (imageUrl: string, type: string) => void
  setType: (type: string) => void
  setDragStart: (dragStart: boolean) => void
  setBackgroundEdit: (backgroundEdit: boolean) => void
  toggleSidebar: () => void
  editor: EditorInterface
  image: ImageInterface
  layoutGroups: any
  isCover?: boolean
}

const SideBarPanel: React.FC<Props> = ({
  getImages,
  isCover,
  addImage,
  setType,
  setDragStart,
  setBackgroundEdit,
  toggleSidebar,
  editor,
  image: { images, loading },
  layoutGroups,
}) => {
  const [closed, setClosed] = useState<boolean>(!editor.sidebarOpen)

  const uploadPhoto = async (e: any) => {
    const image = e.target.files[0]
    const imageUrl = await s3Upload(image)
    addImage(imageUrl, editor.type)
  }

  const isActive = (name: any) => {
    return editor.type === name ? 'active' : ''
  }

  const isDisabled = () => {
    return editor.backgroundEdit ? ' disabled' : ''
  }

  const switchTab = (type: any) => {
    if (!editor.backgroundEdit) {
      if (closed) toggleSidebar()
      setClosed(false)
      setType(type)
    }
  }

  const closeTab = () => {
    toggleSidebar()
    setClosed(true)
    setType('')
  }

  useEffect(() => {
    getImages()
  }, [getImages])

  const renderEditor = () => {
    switch (editor.type) {
      case 'images': {
        if (isCover) {
          const uploadedImages = images.filter((image: any) => image.type === editor.type)
          return !loading && uploadedImages.length === 0 ? (
            <div className="UploadImageDropArea">
              <div>
                <p>
                  <FormattedMessage id="choose_source_to" />
                </p>
                <p className="phrase-add">
                  <FormattedMessage id="add_photos" />
                </p>
              </div>

              <UploadPhotosGroup uploadPhoto={uploadPhoto} />
            </div>
          ) : (
            <Images loading={loading} images={uploadedImages} uploadPhoto={uploadPhoto} />
          )
        }
        return <div />
      }
      case 'backgrounds': {
        const backgrounds = images.filter((image: any) => image.type === editor.type)
        return !loading && backgrounds.length === 0 ? (
          <div className="UploadImageDropArea">
            <div>
              <p>
                <FormattedMessage id="empty" />
              </p>
              <p className="phrase-add">
                <FormattedMessage id="please_add_photos" />
              </p>
            </div>
          </div>
        ) : (
          <Backgrounds
            loading={loading}
            images={backgrounds}
            backgroundEdit={editor.backgroundEdit}
            uploadPhoto={uploadPhoto}
            setDragStart={setDragStart}
            setBackgroundEdit={setBackgroundEdit}
          />
        )
      }
      case 'cliparts': {
        const cliparts = images.filter((image: any) => image.type === editor.type)
        return !loading && cliparts.length === 0 ? (
          <div className="UploadImageDropArea">
            <div>
              <p>
                <FormattedMessage id="empty" />
              </p>
              <p className="phrase-add">
                <FormattedMessage id="please_add_photos" />
              </p>
            </div>
          </div>
        ) : (
          <Cliparts loading={loading} images={cliparts} uploadPhoto={uploadPhoto} />
        )
      }
      case 'layouts': {
        return <Layouts loading={loading} setDragStart={setDragStart} layoutGroups={layoutGroups} />
      }
      case 'masks': {
        const masks = images.filter((image: any) => image.type === editor.type)
        return !loading && masks.length === 0 ? (
          <div className="UploadImageDropArea">
            <div>
              <p>
                <FormattedMessage id="empty" />
              </p>
              <p className="phrase-add">
                <FormattedMessage id="please_add_photos" />
              </p>
            </div>
          </div>
        ) : (
          <Masks loading={loading} images={masks} uploadPhoto={uploadPhoto} />
        )
      }
      case 'frames': {
        const frames = images.filter((image: any) => image.type === editor.type)
        return !loading && frames.length === 0 ? (
          <div className="UploadImageDropArea">
            <div>
              <p>
                <FormattedMessage id="empty" />
              </p>
              <p className="phrase-add">
                <FormattedMessage id="please_add_photos" />
              </p>
            </div>
          </div>
        ) : (
          <Frames loading={loading} images={frames} uploadPhoto={uploadPhoto} />
        )
      }
      default:
        return <div>default page</div>
    }
  }

  return (
    <div className="SideBarPanel">
      <div className="TabView">
        {!closed && <Button onClick={closeTab} className="close-sidebar" icon={<LeftOutlined />} />}
        <div className="Headers">
          <div
            hidden={isCover}
            onClick={() => switchTab('images')}
            className={'HeaderItem ' + isActive('images') + isDisabled()}
          >
            <PictureOutlined style={{ fontSize: 24 }} />
            <div className="title">
              <FormattedMessage id="images" />
            </div>
          </div>
          <div onClick={() => switchTab('backgrounds')} className={'HeaderItem ' + isActive('backgrounds')}>
            <PictureOutlined style={{ fontSize: 24 }} />
            <div className="title">
              <FormattedMessage id="backgrounds" />
            </div>
          </div>
          <div onClick={() => switchTab('cliparts')} className={'HeaderItem ' + isActive('cliparts') + isDisabled()}>
            <StarOutlined style={{ fontSize: 24 }} />
            <div className="title">
              <FormattedMessage id="cliparts" />
            </div>
          </div>
          <div onClick={() => switchTab('layouts')} className={'HeaderItem ' + isActive('layouts') + isDisabled()}>
            <LayoutOutlined style={{ fontSize: 24 }} />
            <div className="title">
              <FormattedMessage id="layouts" />
            </div>
          </div>
          <div onClick={() => switchTab('masks')} className={'HeaderItem ' + isActive('masks') + isDisabled()}>
            <BgColorsOutlined style={{ fontSize: 24 }} />
            <div className="title">
              <FormattedMessage id="masks" />
            </div>
          </div>
          <div onClick={() => switchTab('frames')} className={'HeaderItem ' + isActive('frames') + isDisabled()}>
            <BorderOuterOutlined style={{ fontSize: 24 }} />
            <div className="title">
              <FormattedMessage id="frames" />
            </div>
          </div>
        </div>
        {!closed && (
          <div className="UserPhotoList">
            <div className="LibraryItemsListContainer">{renderEditor()}</div>
          </div>
        )}
      </div>
    </div>
  )
}

const mapStateToProps = (state: RootInterface) => ({
  image: state.image,
  editor: state.editor,
})

export default connect(mapStateToProps, {
  getImages: _getImages,
  addImage: _addImage,
  setType: _setType,
  setDragStart: _setDragStart,
  setBackgroundEdit: _setBackgroundEdit,
  toggleSidebar: _toggleSidebar,
})(SideBarPanel)
