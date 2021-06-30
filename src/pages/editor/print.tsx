/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable consistent-return */
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useQueryState } from 'react-router-use-location-state'
import { connect } from 'react-redux'
import {
  getPrintProject as _getProjects,
  saveProject as _saveProject,
  saveProjectAttribute as _saveProjectAttribute,
  updateHistory as _updateHistory,
  removeObject as _removeObject,
  loadObjects as _loadObjects,
  updateObject as _updateObject,
} from 'redux/actions/project'

import { HistoryProps, ObjectType, PObject, ProjectCreate, ProjectInterface, RootInterface, Slide } from 'interfaces'
import Spinner from 'components/spinner'

import { useBoolean } from 'ahooks'
import { Header, PrintPanel } from './components/layout'
import { Editor } from './components/utils'
import './components/styles/editor.scss'

interface Props {
  getProjects: (id: number, params: ProjectCreate, project: string) => Promise<string | undefined>
  saveProject: (projectId: number, updatedSlide: Slide, slideIndex: number) => void
  project: ProjectInterface
  loadObjects: (objects: PObject[]) => void
  saveProjectAttribute: (projectId: number, props: Object) => void
  updateObject: (props: { object: PObject }) => void
  updateHistory: (historyType: string, props: HistoryProps) => void
}

const BookEditor: React.FC<Props> = ({
  getProjects,
  saveProject,
  saveProjectAttribute,
  updateObject,
  updateHistory,
  project: { currentProject, objects, containers, backgrounds, slideWidth, slideHeight, fetching },
}) => {
  const [template] = useQueryState('template', 1)
  const [paperSizeId] = useQueryState('paperSize', 1)
  const [uuid, setUuid] = useQueryState('project', '')

  const slideViewRef: any = useRef(null)
  const slideContainerRef: any = useRef(null)
  const selectionRef: any = useRef(null)
  const canvasRef = useRef<any>(null)
  const scaledContainerRef = useRef<any>(null)
  const groupRef = useRef<any>(null)
  const [overflow, setOverflow] = useState<string>('hidden')
  const [preview, setPreview] = useBoolean(false)
  const [single, setSingle] = useBoolean(true)

  // states
  const [_objectType, setObjectType] = useState<ObjectType>('')
  const [_isTextEditing, setIsTextEditing] = useState<boolean>(false)
  const [_index, setObjectIndex] = useState<number>(-1)
  const [_textObjectIndex, setTextObjectIndex] = useState<number>(-1)
  const [_object, setObject] = useState<any>(null)
  const [_groupObjects, setGroupObjects] = useState<any>(null)
  const [_groupStyles, setGroupStyles] =
    useState<{
      left: any
      top: any
      width: any
      height: any
    }>()
  const _slideIndex = 0
  useHotkeys('shift+a', () => editors.onRotateLeftObject(_index, objects), [_index, objects])
  useHotkeys('shift+d', () => editors.onRotateRightObject(_index, objects), [_index, objects])
  useHotkeys('shift+q', () => editors.onFlipObject(_index, objects), [_index, objects])
  useHotkeys('shift+w', () => editors.onSendForward(_index, objects), [_index, objects])
  useHotkeys('shift+s', () => editors.onSendBackward(_index, objects), [_index, objects])
  useHotkeys('ctrl+Delete', () => editors.onRemoveObject(containers, objects, _index), [_index, objects])
  useHotkeys('shift+Delete', () => editors.onRemoveImageFromObject(_index, objects, _objectType), [_index, objects])
  useHotkeys(
    'ctrl+shift+s',
    () => {
      saveObjects()
    },
    [objects, backgrounds]
  )

  const editors = useMemo(() => {
    return new Editor({
      setObjectIndex,
      scale: 1,
      overflow,
      setOverflow,
      _groupObjects,
      setGroupObjects,
      scaledContainerRef,
      _objectType,
      setObjectType,
      groupRef,
      _groupStyles,
      slideViewRef,
      slideWidth,
      slideHeight,
      selectionRef,
      updateObject,
      updateHistory,
      slideContainerRef,
      setObject,
      canvasRef,
      setGroupStyles,
      _object,
      double: false,
    })
  }, [slideHeight, slideWidth])

  const saveTextBeforeUndo = () => {
    if (_index > -1 && _isTextEditing) {
      _object.classList.remove('selected')
      _object.firstChild.style.cursor = 'default'
      _object.firstChild.style.pointerEvents = 'none'
      _object.firstChild.childNodes[2].contentEditable = false
      window.getSelection()?.removeAllRanges()
      editors.updateCurrentTextObject(_index, objects)
      setIsTextEditing(false)
      setTextObjectIndex(_index)
    }
  }

  const saveObjects = async () => {
    if (_slideIndex >= currentProject.slides.length) return
    const updatedSlide = currentProject.slides[_slideIndex]
    updatedSlide.objects = objects
    saveProject(currentProject.id, updatedSlide, _slideIndex)
  }
  const onSaveName = (name: string) => {
    saveProjectAttribute(currentProject.id, { name })
  }

  useEffect(() => {
    if (!template) {
      window.history.back()
      return
    }
    getProjects(template, { paperSizeId }, uuid).then((id) => {
      if (id) {
        setUuid(id)
      }
    })
  }, [getProjects, template])

  return fetching ? (
    <div className="AdvancedEditorWrapper">
      <div className="EditorOnePageView">
        <Spinner />
      </div>
    </div>
  ) : (
    <div className="AdvancedEditorWrapper h-full">
      <Header
        deSelectObject={editors.deSelectObject}
        onPreview={() => {
          if (preview || !single) {
            setPreview.setFalse()
            setSingle.setTrue()
          } else {
            setPreview.setTrue()
          }
        }}
        saveName={onSaveName}
        saveObjects={saveObjects}
        saveTextBeforeUndo={saveTextBeforeUndo}
      />
      <div className="EditorPrintWrapper h-full">
        <PrintPanel />
      </div>
    </div>
  )
}

const mapStateToProps = (state: RootInterface) => ({
  project: state.project,
  editor: state.editor,
})

export default connect(mapStateToProps, {
  getProjects: _getProjects,
  saveProject: _saveProject,
  loadObjects: _loadObjects,
  updateObject: _updateObject,
  updateHistory: _updateHistory,
  removeObject: _removeObject,
  saveProjectAttribute: _saveProjectAttribute,
})(BookEditor)
