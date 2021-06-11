/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable consistent-return */
import React, { useRef } from 'react'
import { connect } from 'react-redux'
import { EditorInterface, PObject, ProjectInterface, RootInterface, Slide } from 'interfaces'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { ImageModal } from 'components'
import Image from './image'
import '../../styles/print.scss'

interface Props {
  editor: EditorInterface
  project: ProjectInterface
  object: Slide
  slideIndex: number
  prevSlide?: () => void
  nextSlide?: () => void
  onCancel: () => void
  hasNext?: () => boolean
  hasPrevious?: () => boolean
  visible: boolean
}

const Editor: React.FC<Props> = ({ prevSlide, nextSlide, hasNext, hasPrevious, visible, object, onCancel }) => {
  const maxWidth = 1000
  const maxHeight = 1000
  const srcHeight = 500 + 100
  const srcWidth = maxWidth * (srcHeight / maxHeight)

  const ratio = srcWidth / maxWidth
  // states
  return (
    <ImageModal
      className="h-screen"
      bodyStyle={{ height: 800 }}
      type="wide"
      loading={false}
      visible={visible}
      onCancel={onCancel}
    >
      <div id="wrapper_container">
        <div className="advanced_container" style={{ width: maxWidth * ratio, height: maxHeight * ratio }}>
          <div id="canvas_container" style={{ transform: 'scale(' + ratio + ')', transformOrigin: '0 0' }}>
            <Image
              object={object.object || ({} as PObject)}
              resolution={{
                width: Number(object.object?.style?.width),
                height: Number(object.object?.style.height),
              }}
              style={object.object?.style}
              className={object.object?.className || 'object'}
              draggable={false}
              alt={object.object?.id}
              imageUrl={object.object?.props.imageUrl}
              imageStyle={object.object?.props.imageStyle}
              placeholderStyle={object.object?.props.placeholderStyle}
            />
          </div>
        </div>
        {hasPrevious && (
          <div className={`control prev cursor-pointer ${!hasPrevious() && 'inactive'}`} onClick={prevSlide}>
            <LeftOutlined />
          </div>
        )}
        {hasNext && (
          <div className={`control next cursor-pointer ${!hasNext() && 'inactive'}`} onClick={nextSlide}>
            <RightOutlined />
          </div>
        )}
      </div>
      <div className="controller_container">
        <div>transform</div>
        <div>orientation</div>
        <div>rotate</div>
        <div>flip</div>
        <div>filters</div>
        <div>brightness</div>
        <div>contrast</div>
        <div>saturation</div>
        <div>size</div>
        <div>paper</div>
        <div>image brightening</div>
        <div>amount brightening</div>
        <div>reset</div>
        <div>delete</div>
      </div>
    </ImageModal>
  )
}

const mapStateToProps = (state: RootInterface) => ({
  project: state.project,
  editor: state.editor,
})

export default connect(mapStateToProps)(Editor)
