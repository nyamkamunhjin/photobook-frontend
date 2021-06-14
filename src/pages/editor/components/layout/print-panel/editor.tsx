/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable consistent-return */
import React, { useState } from 'react'
import { connect } from 'react-redux'
import { EditorInterface, PObject, ProjectInterface, RootInterface, Slide, ToolsType } from 'interfaces'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { ImageModal } from 'components'
import {
  saveProject as _saveProject,
  deleteSlide as _deleteSlide,
  updateObject as _updateObject,
} from 'redux/actions/project'
import Tools from './tools'
import Image from './image'
import '../../styles/print.scss'

interface Props {
  updateObject: (props: { object: PObject }) => void
  deleteSlide: (projectId: number, slideIndex: number) => Promise<void>
  object: Slide
  slideIndex: number
  prevSlide?: () => void
  nextSlide?: () => void
  onCancel: () => void
  hasNext?: () => boolean
  hasPrevious?: () => boolean
  visible: boolean
}

const Editor: React.FC<Props> = ({
  prevSlide,
  nextSlide,
  hasNext,
  hasPrevious,
  visible,
  object,
  onCancel,
  updateObject,
  deleteSlide,
}) => {
  const maxWidth = 1000
  const maxHeight = 1000
  const srcHeight = 500 + 100
  const [selected, setSelected] = useState<ToolsType>('transform')
  const srcWidth = maxWidth * (srcHeight / maxHeight)
  const ratio = Math.min(srcWidth / maxWidth, srcHeight / maxHeight)
  // states
  return (
    <ImageModal
      className="h-screen"
      bodyStyle={{ height: 800, padding: '10px 0px' }}
      type="wide"
      loading={false}
      visible={visible}
      onCancel={onCancel}
    >
      <div className="wrapper_container">
        <div className="advanced_container" style={{ width: maxWidth * ratio, height: maxHeight * ratio }}>
          <div id="canvas_container" style={{ transform: 'scale(' + ratio + ')', transformOrigin: '0 0' }}>
            <Image
              object={object.object || ({} as PObject)}
              slideId={object.slideId}
              resolution={{
                width: Number(object.object?.style?.width),
                height: Number(object.object?.style.height),
              }}
              updateObject={updateObject}
              scaleX={srcWidth / maxWidth}
              scaleY={srcHeight / maxHeight}
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
      <Tools
        slideId={object.slideId}
        updateObject={updateObject}
        object={object.object as PObject}
        select={{
          state: selected,
          action: setSelected,
        }}
      />
    </ImageModal>
  )
}

export default connect(null, {
  saveProject: _saveProject,
  deleteSlide: _deleteSlide,
  updateObject: _updateObject,
})(Editor)
