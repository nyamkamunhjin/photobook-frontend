/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable consistent-return */
import React, { useRef } from 'react'
import { connect } from 'react-redux'
import { EditorInterface, ProjectInterface, RootInterface } from 'interfaces'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import './styles/editor.scss'
import { ImageModal } from 'components'
interface Props {
  editor: EditorInterface
  project: ProjectInterface
  slideIndex: number
  prevSlide?: () => void
  nextSlide?: () => void
  hasNext?: () => boolean
  hasPrevious?: () => boolean
}

const Editor: React.FC<Props> = ({ prevSlide, nextSlide, hasNext, hasPrevious }) => {
  // states
  return (
    <ImageModal loading>
      <div className="EditorPanelContainerPreview">
        <div className="StepSlideContainer SlideViewContainer">
          <div id="editor_container">
            <div id="slide_container" />
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
      </div>
    </ImageModal>
  )
}

const mapStateToProps = (state: RootInterface) => ({
  project: state.project,
  editor: state.editor,
})

export default connect(mapStateToProps)(Editor)
