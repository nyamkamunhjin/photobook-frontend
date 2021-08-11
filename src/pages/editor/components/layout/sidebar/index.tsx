/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useEffect, useState } from 'react'
import { connect, useSelector } from 'react-redux'
import {
  BgColorsOutlined,
  BorderOuterOutlined,
  BugOutlined,
  InfoCircleOutlined,
  LayoutOutlined,
  LeftOutlined,
  PictureOutlined,
  StarOutlined,
} from '@ant-design/icons'
import { useDrop } from 'ahooks'
import { Button, message } from 'antd'
import Checkbox from 'antd/lib/checkbox/Checkbox'
import Modal from 'antd/lib/modal/Modal'
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
import { FormattedMessage, useIntl } from 'react-intl'
import { EditorInterface, ImageInterface, Project, RootInterface, UploadablePicture } from 'interfaces'
import { createCartItem } from 'api'

import Images from './tabs/images'
import Backgrounds from './tabs/backgrounds'
import Cliparts from './tabs/cliparts'
import Masks from './tabs/masks'
import Frames from './tabs/frames'
import Layouts from './tabs/layouts'
import UploadPhotosGroup from '../upload-modal/upload-photos-group'
import Notices from './tabs/notices'

interface Props {
  addImages: (images: string[], id: number) => Promise<void>
  linkImages: (images: string[], id: number) => Promise<void>
  unlinkImages: (images: string[], id: number) => Promise<void>
  uploadImages: () => Promise<void>
  setType: (type: string) => void
  setDragStart: (dragStart: boolean) => void
  setBackgroundEdit: (backgroundEdit: boolean) => void
  toggleSidebar: () => void
  editor: EditorInterface
  image: ImageInterface
  currentProject: Project
  layoutGroups: any
  hasFrames?: boolean
  hasImage?: boolean
  hasLayout?: boolean
  hasClipArt?: boolean
  hasMask?: boolean
  hasBackground?: boolean
  isOrder: boolean
  setIsOrder: (param: any) => void
}

const SideBarPanel: React.FC<Props> = ({
  hasImage,
  hasLayout = true,
  hasFrames = true,
  hasBackground = true,
  hasClipArt = true,
  hasMask = true,
  isOrder = false,
  setIsOrder,
  addImages,
  uploadImages,
  linkImages,
  unlinkImages,
  setType,
  setDragStart,
  setBackgroundEdit,
  currentProject,
  toggleSidebar,
  editor,
  image: { images, loading, categories },
  layoutGroups,
}) => {
  const [closed, setClosed] = useState<boolean>(!editor.sidebarOpen)
  const [notices, setNotices] = useState<any[]>([])
  const [isNoticeChecked, setIsNoticeChecked] = useState(false)
  const [isModal, setIsModal] = useState(false)
  const intl = useIntl()
  const user = useSelector((state: RootInterface) => state.auth.user)

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
    if (editor.backgroundEdit) return
    toggleSidebar()
    setClosed(true)
    setType('')
  }

  const onGoto = (slideId: string, objectId: string) => {
    console.log('onGoto')
    // _slideIndex = currentProject.slides.findIndex((slide) => slide.slideId === slideId)
    // if(_slideIndex === -1) _slideIndex = 0
  }
  const onHideAllSimilar = (type: string) => {
    setNotices((oldState) => {
      return oldState.filter((notice) => notice.type !== type)
    })
  }
  const onHideThis = (key: string) => {
    setNotices((oldState) => {
      return oldState.filter((notice) => notice.key !== key)
    })
  }
  const createOrder = () => {
    if (user) {
      createCartItem({
        project: currentProject.id,
      }).then((res) => {
        setIsModal(false)
        if (res) message.success(intl.formatMessage({ id: 'added_to_cart' }))
      })
    }
  }
  const makeOrder = () => {
    const _notices = currentProject.slides.reduce((accum, slide, index) => {
      const temp = slide.objects.reduce((acc, o, i) => {
        if (o.props.className.includes('image-placeholder') && !('imageUrl' in o.props)) {
          acc.push({
            type: 'empty slot',
            key: 'empty slot index' + index + 'i' + i,
            data: {
              slide: 'slide' + (index + 1),
              onGoto: () => onGoto(slide.slideId, o.id),
              onHideAllSimilar: () => onHideAllSimilar('empty slot'),
              onHideThis: () => onHideThis('empty slot index' + index + 'i' + i),
            },
          })
        } else if (o.props.className.includes('text-container') && o.props.texts?.includes('Enter text here')) {
          acc.push({
            type: 'empty text',
            key: 'empty text index' + index + 'i' + i,
            data: {
              slide: 'slide' + (index + 1),
              onGoto: () => onGoto(slide.slideId, o.id),
              onHideAllSimilar: () => onHideAllSimilar('empty text'),
              onHideThis: () => onHideThis('empty text index' + index + 'i' + i),
            },
          })
        }
        return acc
      }, [] as any[])
      return accum.concat(temp)
    }, [] as any[])
    setNotices(_notices)
    if (_notices.length > 0) {
      editor.type = 'notices'
      setClosed(false)
      setIsModal(true)
      setIsNoticeChecked(false)
    } else {
      createOrder()
    }
    // console.log('makeOrder', currentProject)
  }

  useEffect(() => {
    if (isOrder) {
      setIsOrder(false)
      makeOrder()
    }
  }, [isOrder])

  const renderEditor = () => {
    switch (editor.type) {
      case 'images': {
        if (hasImage) {
          const uploadedImages = images.filter((image) => image.type === editor.type)
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

              <UploadPhotosGroup uploadPhoto={uploadPhoto} syncPhoto={syncPhoto} linkPhoto={linkPhoto} />
            </div>
          ) : (
            <Images
              loading={loading}
              images={uploadedImages}
              uploadPhoto={uploadPhoto}
              syncPhoto={syncPhoto}
              linkPhoto={linkPhoto}
              unlinkPhoto={unlinkPhoto}
            />
          )
        }
        return <div />
      }
      case 'backgrounds': {
        const backgrounds = categories.filter((category) => category.type === editor.type)
        return !loading && backgrounds.length === 0 ? (
          <div className="UploadImageDropArea">
            <div>
              <p className="phrase-add">
                <FormattedMessage id="empty" />
              </p>
            </div>
            {editor.backgroundEdit ? (
              <Button
                type="primary"
                onClick={() => setBackgroundEdit(false)}
                style={{ margin: 5, position: 'absolute', bottom: 0, left: 0, width: 240 }}
              >
                <FormattedMessage id="done" />
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() => setBackgroundEdit(true)}
                style={{ margin: 5, position: 'absolute', bottom: 0, left: 0, width: 240 }}
              >
                <FormattedMessage id="edit_background" />
              </Button>
            )}
          </div>
        ) : (
          <Backgrounds
            loading={loading}
            categories={backgrounds}
            backgroundEdit={editor.backgroundEdit}
            setDragStart={setDragStart}
            setBackgroundEdit={setBackgroundEdit}
          />
        )
      }
      case 'cliparts': {
        const cliparts = categories.filter((category) => category.type === editor.type)
        return !loading && cliparts.length === 0 ? (
          <div className="UploadImageDropArea">
            <div>
              <p className="phrase-add">
                <FormattedMessage id="empty" />
              </p>
            </div>
          </div>
        ) : (
          <Cliparts loading={loading} categories={cliparts} />
        )
      }
      case 'layouts': {
        return <Layouts loading={loading} setDragStart={setDragStart} layoutGroups={layoutGroups} />
      }
      case 'masks': {
        const masks = categories.filter((category) => category.type === editor.type)
        return !loading && masks.length === 0 ? (
          <div className="UploadImageDropArea">
            <div>
              <p className="phrase-add">
                <FormattedMessage id="empty" />
              </p>
            </div>
          </div>
        ) : (
          <Masks loading={loading} categories={masks} />
        )
      }
      case 'frames': {
        const frames = categories.filter((category) => category.type === editor.type)
        return !loading && frames.length === 0 ? (
          <div className="UploadImageDropArea">
            <div>
              <p className="phrase-add">
                <FormattedMessage id="empty" />
              </p>
            </div>
          </div>
        ) : (
          <Frames loading={loading} categories={frames} />
        )
      }
      case 'notices': {
        return notices.length === 0 ? (
          <div className="UploadImageDropArea">
            <div>
              <p className="phrase-add">
                <FormattedMessage id="empty" />
              </p>
            </div>
          </div>
        ) : (
          <Notices notices={notices} />
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
            hidden={!hasImage}
            onClick={() => switchTab('images')}
            className={'HeaderItem ' + isActive('images') + isDisabled()}
          >
            <PictureOutlined style={{ fontSize: 24 }} />
            <div className="title">
              <FormattedMessage id="images" />
            </div>
          </div>
          <div
            hidden={!hasBackground}
            onClick={() => switchTab('backgrounds')}
            className={'HeaderItem ' + isActive('backgrounds')}
          >
            <PictureOutlined style={{ fontSize: 24 }} />
            <div className="title">
              <FormattedMessage id="backgrounds" />
            </div>
          </div>
          <div
            hidden={!hasClipArt}
            onClick={() => switchTab('cliparts')}
            className={'HeaderItem ' + isActive('cliparts') + isDisabled()}
          >
            <StarOutlined style={{ fontSize: 24 }} />
            <div className="title">
              <FormattedMessage id="cliparts" />
            </div>
          </div>
          <div
            hidden={!hasLayout}
            onClick={() => switchTab('layouts')}
            className={'HeaderItem ' + isActive('layouts') + isDisabled()}
          >
            <LayoutOutlined style={{ fontSize: 24 }} />
            <div className="title">
              <FormattedMessage id="layouts" />
            </div>
          </div>
          <div
            hidden={!hasMask}
            onClick={() => switchTab('masks')}
            className={'HeaderItem ' + isActive('masks') + isDisabled()}
          >
            <BgColorsOutlined style={{ fontSize: 24 }} />
            <div className="title">
              <FormattedMessage id="masks" />
            </div>
          </div>
          <div
            hidden={!hasFrames}
            onClick={() => switchTab('frames')}
            className={'HeaderItem ' + isActive('frames') + isDisabled()}
          >
            <BorderOuterOutlined style={{ fontSize: 24 }} />
            <div className="title">
              <FormattedMessage id="frames" />
            </div>
          </div>
          <div
            // hidden={!hasNotices}
            onClick={() => switchTab('notices')}
            className={'HeaderItem relative ' + isActive('notices') + isDisabled()}
          >
            <BugOutlined style={{ fontSize: 24 }} />
            <div className="title">
              <FormattedMessage id="notices" />
            </div>
            {notices.length > 0 && (
              <span
                className="absolute top-2 right-2 px-0.5 bg-yellow-500 rounded-sm text-white z-10"
                style={{ fontSize: 8 }}
              >
                {notices.length}
              </span>
            )}
          </div>
        </div>
        {!closed && (
          <div className="UserPhotoList">
            <div className="LibraryItemsListContainer" style={isHovering ? { background: '#add6ff' } : {}} {...props}>
              {renderEditor()}
            </div>
          </div>
        )}
        <Modal
          title={
            <div className="flex gap-2 items-center text-gray-500">
              <InfoCircleOutlined /> Your project contains some minor flaws.
            </div>
          }
          centered
          visible={isModal}
          onOk={createOrder}
          okButtonProps={{ disabled: !isNoticeChecked }}
          onCancel={() => setIsModal(false)}
          className="text-center"
        >
          <h5 className="text-3xl font-semibold text-gray-500">Oops!</h5>
          <p className="text-xl font-semibold text-gray-500">Your project contains some minor flaws.</p>
          <p className="text-lg text-gray-500">
            Please review them carefully before ordering. If you&apos;re sure that everything is okay, you can proceed
            anyway.
          </p>
          <Checkbox
            className="text-base font-semibold text-gray-500"
            onChange={(e) => setIsNoticeChecked(e.target.checked)}
            checked={isNoticeChecked}
          >
            I am sure, everything is fine.
          </Checkbox>
        </Modal>
      </div>
    </div>
  )
}

const mapStateToProps = (state: RootInterface) => ({
  image: state.image,
  editor: state.editor,
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
})(SideBarPanel)
