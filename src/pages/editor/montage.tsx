/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable consistent-return */
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { useQueryState } from 'react-router-use-location-state'
import { connect } from 'react-redux'
import {
  getProjects as _getProjects,
  saveProject as _saveProject,
  saveProjectAttribute as _saveProjectAttribute,
  addNewSlide as _addNewSlide,
  deleteSlide as _deleteSlide,
  updateHistory as _updateHistory,
  addLayout as _addLayout,
  addObject as _addObject,
  removeObject as _removeObject,
  loadObjects as _loadObjects,
  loadContainers as _loadContainers,
  loadBackgrounds as _loadBackgrounds,
  updateContainer as _updateContainer,
  updateGroupContainer as _updateGroupContainer,
  updateBackground as _updateBackground,
  updateObject as _updateObject,
  setBackgrounds as _setBackgrounds,
  duplicateSlide as _duplicateSlide,
  reOrderSlide as _reOrderSlide,
} from 'redux/actions/project'

import {
  BackgroundImage,
  Container,
  EditorInterface,
  FullLayout,
  HistoryProps,
  ObjectType,
  ProjectCreate,
  PObject,
  ProjectInterface,
  RootInterface,
  Slide,
} from 'interfaces'
import Spinner from 'components/spinner'
import { debounce } from 'utils'

import { useBoolean, useDebounceFn, useFullscreen, useRequest } from 'ahooks'
import { listPaperSize } from 'api'
import { Header, BackgroundImages, FooterListTools, SideButtons, SideBarPanel, Toolbar } from './components/layout'
import Preview from './components/preview'
import { Editor, renderBackground, renderObject } from './components/utils'
import './components/styles/editor.scss'

interface Props {
  getProjects: (id: number, params: ProjectCreate, project: string) => Promise<string | undefined>
  saveProject: (projectId: number, updatedSlide: Slide, slideIndex: number) => void
  addNewSlide: (slideIndex: number, projectId: number) => Promise<void>
  duplicateSlide: (projectId: number, slideIndex: number, duplicatedSlide: Slide) => Promise<void>
  deleteSlide: (projectId: number, slideIndex: number) => Promise<void>
  reOrderSlide: (projectId: number, slides: Slide[]) => Promise<void>
  editor: EditorInterface
  project: ProjectInterface
  loadObjects: (objects: PObject[]) => void
  loadContainers: (containers: Container[]) => void
  updateContainer: (props: { container: Object }) => void
  updateGroupContainer: (props: { containers: Container[] }) => void
  updateBackground: (props: { background: BackgroundImage }) => void
  saveProjectAttribute: (projectId: number, props: Object) => void
  updateObject: (props: { object: PObject }) => void
  updateHistory: (historyType: string, props: HistoryProps) => void
  setBackgrounds: (props: { backgrounds: BackgroundImage[] }) => void
  loadBackgrounds: (backgrounds: Object[]) => void
  addLayout: (props: { objects: Object[]; layout: FullLayout }) => void
  addObject: (props: { object: Object }) => void
  removeObject: (props: { object: Object; container: Object }) => void
}

const BookEditor: React.FC<Props> = ({
  getProjects,
  saveProject,
  addNewSlide,
  duplicateSlide,
  reOrderSlide,
  deleteSlide,
  loadObjects,
  loadContainers,
  updateGroupContainer,
  saveProjectAttribute,
  updateBackground,
  updateObject,
  setBackgrounds,
  updateHistory,
  loadBackgrounds,
  addLayout,
  addObject,
  removeObject,
  editor,
  project: {
    currentProject,
    objects,
    containers,
    backgrounds,
    bgStyles,
    slideWidth,
    slideHeight,
    layout,
    layouts,
    loading,
    fetching,
  },
}) => {
  const [template] = useQueryState('template', 1)
  const [coverTypeId] = useQueryState('coverType', 1)
  const [paperSizeId] = useQueryState('paperSize', 1)
  const [bindingTypeId] = useQueryState('bindingType', 1)
  const [coverMaterialId] = useQueryState('material', 1)
  const [coverColorId] = useQueryState('color', 1)
  const [uuid, setUuid] = useQueryState('project', '')

  const slideViewRef: any = useRef(null)
  const editorContainerRef: any = useRef(null)
  const slideContainerRef: any = useRef(null)
  const selectionRef: any = useRef(null)
  const canvasRef = useRef<any>(null)
  const scaledContainerRef = useRef<any>(null)
  const groupRef = useRef<any>(null)
  const [overflow, setOverflow] = useState<string>('hidden')
  const [refreshing, setRefreshing] = useBoolean(false)
  const [preview, setPreview] = useBoolean(false)
  const [single, setSingle] = useBoolean(true)
  const ref = useRef<any>()
  const [isFullscreen, { setFull, exitFull }] = useFullscreen(ref)
  const [isOrder, setIsOrder] = useState(false)
  const [isSwapping, setIsSwapping] = useState(false)

  // states
  const [scale, setScale] = useState<number>(1)
  const [zoom, setZoom] = useState(1)
  const [fitScale, setFitScale] = useState<number>(1)
  const [_objectType, setObjectType] = useState<ObjectType>('')
  const [_isTextEditing, setIsTextEditing] = useState<boolean>(false)
  const [_index, setObjectIndex] = useState<number>(-1)
  const [_textObjectIndex, setTextObjectIndex] = useState<number>(-1)
  const [_object, setObject] = useState<any>(null)
  const [_groupObjects, setGroupObjects] = useState<any>(null)
  const [footerCollapse, setFooterCollapse] = useBoolean(false)
  const [_groupStyles, setGroupStyles] = useState<{
    left: any
    top: any
    width: any
    height: any
  }>()
  const [_slideIndex, setSlideIndex] = useState<number>(0)
  useHotkeys('shift+a', () => editors.onRotateLeftObject(_index, objects), [_index, objects])
  useHotkeys('shift+d', () => editors.onRotateRightObject(_index, objects), [_index, objects])
  useHotkeys('shift+q', () => editors.onFlipObject(_index, objects), [_index, objects])
  useHotkeys('shift+w', () => editors.onSendForward(_index, objects), [_index, objects])
  useHotkeys('shift+s', () => editors.onSendBackward(_index, objects), [_index, objects])
  useHotkeys('Delete', () => _slideIndex !== 0 && editors.onRemoveObject(containers, objects, _index), [
    _index,
    objects,
  ])
  useHotkeys('shift+Delete', () => editors.onRemoveImageFromObject(_index, objects, _objectType), [_index, objects])
  useHotkeys(
    'ctrl+shift+s',
    () => {
      saveObjects()
    },
    [objects, backgrounds]
  )
  const debouncedSave = useDebounceFn(
    () => {
      saveObjects()
    },
    {
      wait: 1000 * 30,
    }
  )

  const paperSizes = useRequest(() =>
    listPaperSize({ current: 0, pageSize: 100 }, { templateType: currentProject?.templateType?.name })
  )

  const editors = useMemo(() => {
    return new Editor({
      setTextObjectIndex,
      setObjectIndex,
      scale,
      overflow,
      setOverflow,
      _isTextEditing,
      setIsTextEditing,
      _groupObjects,
      setGroupObjects,
      scaledContainerRef,
      _objectType,
      setObjectType,
      groupRef,
      _groupStyles,
      updateGroupContainer,
      slideViewRef,
      slideWidth,
      slideHeight,
      selectionRef,
      updateObject,
      loadBackgrounds,
      updateHistory,
      addLayout,
      addObject,
      removeObject,
      slideContainerRef,
      setObject,
      canvasRef,
      setGroupStyles,
      _object,
      // double: true,
      zoom,
    })
  }, [scale, slideHeight, slideWidth, zoom])

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

  const nextSlide = () => {
    if (_slideIndex < currentProject.slides.length - 1) {
      changeSlideIndex(_slideIndex + 1)
    }
  }

  const onAddSlide = (projectId: number, slideIndex: number) => {
    setRefreshing.setTrue()
    if (slideIndex === 0) slideIndex = 1
    if (slideIndex === currentProject.slides.length - 1) return
    addNewSlide(projectId, slideIndex).then(() => {
      changeSlideIndex(slideIndex + 1)
      setRefreshing.setFalse()
    })
  }

  const onDuplicateSlide = (projectId: number, slideIndex: number) => {
    if ([0, 1, currentProject.slides.length - 1].includes(slideIndex)) return
    setRefreshing.setTrue()
    duplicateSlide(projectId, slideIndex, currentProject.slides[slideIndex]).then(() => {
      changeSlideIndex(_slideIndex + 1)
      setRefreshing.setFalse()
    })
  }

  const onReOrderSlide = (projectId: number, slides: Slide[]) => {
    setRefreshing.setTrue()
    reOrderSlide(projectId, slides).then(() => {
      setRefreshing.setFalse()
      editors.deSelectObject()
      setSlideIndex(0)
    })
  }

  const onDeleteSlide = (projectId: number, slideIndex: number) => {
    if ([0, 1, currentProject.slides.length - 1].includes(slideIndex)) return
    setRefreshing.setTrue()
    deleteSlide(projectId, slideIndex).then(() => {
      setRefreshing.setFalse()
      editors.deSelectObject()
      setSlideIndex(_slideIndex - 1)
    })
  }

  const prevSlide = () => {
    if (_slideIndex !== 0) {
      changeSlideIndex(_slideIndex - 1)
    }
  }

  const changeSlideIndex = (index: number) => {
    saveObjects()
    editors.deSelectObject()
    setSlideIndex(index)
  }

  const hasNext = () => {
    return !(_slideIndex === currentProject.slides.length - 1)
  }

  const hasPrevious = () => {
    return !(_slideIndex === 0)
  }

  const saveObjects = async () => {
    if (_slideIndex >= currentProject.slides.length) return
    const updatedSlide = currentProject.slides[_slideIndex]
    updatedSlide.objects = objects.map((o: PObject) => {
      if (o.props.className !== 'image-placeholder') return o
      const obj = document.getElementById(o.id)
      const [img] = obj?.getElementsByTagName('img') as any
      if (!img) return o
      const { width, height, top, left } = img.style
      if (width !== 'auto' && height !== 'auto') {
        o.props.imageStyle.width = width
        o.props.imageStyle.height = height
      } else if (width !== 'auto') o.props.imageStyle.width = width
      else if (height !== 'auto') o.props.imageStyle.height = height
      o.props.imageStyle.top = top
      o.props.imageStyle.left = left
      return o
    })
    updatedSlide.backgrounds = backgrounds
    saveProject(currentProject.id, updatedSlide, _slideIndex)
  }
  const onSaveName = (name: string) => {
    saveProjectAttribute(currentProject.id, { name })
  }

  const setSlidePosition = () => {
    if (slideContainerRef.current === null) return
    slideContainerRef.current.classList.add('center-slide')

    const editorPanelContainer: any = document.querySelector('.EditorPanelContainer')
    const allLayout: any = document.querySelector('.SlideListAll')

    editorPanelContainer.style.width = editor.sidebarOpen
      ? 'calc(100vw - 400px)' // 310 + 90
      : 'calc(100vw - 90px)' // 90

    if (allLayout?.style) {
      allLayout.style.width = editor.sidebarOpen
        ? 'calc(100vw - 400px)' // 310 + 90
        : 'calc(100vw - 90px)' // 90
    }

    const rect = slideContainerRef.current.getBoundingClientRect()
    const maxWidth = slideWidth
    const maxHeight = slideHeight
    const srcWidth = rect.width - 240 // 240 is the width of two side menus
    const srcHeight = rect.height

    const ratio = Math.min(srcWidth / maxWidth, srcHeight / maxHeight)
    setScale(ratio)
    setFitScale(ratio)

    const scaledWidth = maxWidth * ratio
    const scaledHeight = maxHeight * ratio

    canvasRef.current.style.transform = 'scale(' + ratio + ')'
    canvasRef.current.style.transformOrigin = '0 0'
    scaledContainerRef.current.style.width = scaledWidth + 'px'
    scaledContainerRef.current.style.height = scaledHeight + 'px'

    const slide = document.querySelector('#slide') as HTMLElement
    slide.style.width = scaledWidth + 'px'
    slide.style.height = scaledHeight + 'px'

    editorContainerRef.current.style.width = scaledWidth + 'px'
    editorContainerRef.current.style.height = scaledHeight + 'px'
  }

  const loadSlide = () => {
    const currentSlide = currentProject.slides[_slideIndex]
    if (currentSlide.backgrounds.length === 0) {
      const bgClasses: string[] = ['background-full', 'background-left', 'background-right']
      loadBackgrounds(
        bgClasses.map((bgClass) => ({
          className: bgClass,
        }))
      )
    } else {
      loadBackgrounds(currentSlide.backgrounds)
    }
    loadObjects(currentSlide.objects)
    loadContainers(currentSlide.containers)
    editors.loadObjects(currentSlide.objects)
  }
  useEffect(() => {
    if (loading) return
    const debouncedHandleResize = debounce(function handleResize() {
      editors.hideResizer()
      editors.hideToolbar()
      editors.hideActiveBorder()
      setSlidePosition()
    }, 100)
    window.addEventListener('resize', debouncedHandleResize)
    return () => {
      window.removeEventListener('resize', debouncedHandleResize)
    }
  })

  useEffect(() => {
    if (!template) {
      window.history.back()
      return
    }
    getProjects(template, { paperSizeId, coverColorId, coverMaterialId, coverTypeId, bindingTypeId }, uuid).then(
      (id) => {
        if (id) {
          setUuid(id)
        }
      }
    )
  }, [getProjects, template])

  useEffect(() => {
    if (!loading) loadSlide()
  }, [_slideIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loading && !preview) {
      setSlidePosition()
      loadSlide()
    }
  }, [currentProject, preview]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    editors.deSelectObject()
    if (!loading) {
      setSlidePosition()
    }
  }, [editor.sidebarOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!loading) {
      setSlidePosition()
      loadSlide()
    }
  }, [loading]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (editor.dragStart) {
      if (editor.type === 'backgrounds') {
        const backgroundDrops: any = document.querySelectorAll('.background-drop')
        backgroundDrops.forEach((background: any) => {
          background.style.display = 'block'
        })
      } else if (editor.type === 'layouts') {
        const layoutDrops: any = document.querySelectorAll('.layout-drop')
        layoutDrops.forEach((_layout: any) => {
          _layout.style.display = 'block'
        })
      }
    } else if (editor.type === 'backgrounds') {
      const backgroundDrops: any = document.querySelectorAll('.background-drop')
      backgroundDrops.forEach((background: any) => {
        background.style.display = 'none'
      })
    } else if (editor.type === 'layouts') {
      const layoutDrops: any = document.querySelectorAll('.layout-drop')
      layoutDrops.forEach((_layout: any) => {
        _layout.style.display = 'none'
      })
    }
  }, [editor.dragStart, editor.type])

  useEffect(() => {
    if (isFullscreen) return
    setPreview.setFalse()
    setSingle.setTrue()
  }, [isFullscreen])

  useEffect(() => {
    debouncedSave.run()
  }, [_object])

  const renderEditor = (
    <div className="EditorPanelContainer">
      <div ref={slideViewRef} className="StepSlideContainer SlideViewContainer">
        <div id="editor_container" ref={editorContainerRef}>
          {_slideIndex === 0 && !currentProject.coverEditable ? (
            <Toolbar
              object={_object}
              objectType={_objectType}
              index={_index}
              objects={objects}
              updateObject={updateObject}
              updateHistory={updateHistory}
              moveResizers={editors.moveResizers}
              removeImageFromObject={() => editors.onRemoveImageFromObject(_index, objects, _objectType)}
              removeMaskFromObject={() => editors.onRemoveMaskFromObject(_index, objects, _objectType)}
              swapImages={() => editors.onSwapImages(_index, objects, _objectType, setIsSwapping)}
              rotateLeftObject={() => editors.onRotateLeftObject(_index, objects)}
              rotateRightObject={() => editors.onRotateRightObject(_index, objects)}
              flipObject={() => editors.onFlipObject(_index, objects)}
              sendForward={() => editors.onSendForward(_index, objects)}
              sendBackward={() => editors.onSendBackward(_index, objects)}
              imageFit={(borderWidth, o) => {
                editors.imageFitNoDebounce(objects, o, borderWidth)
              }}
              getImagePosition={(o: PObject) => editors.getImagePosition(o)}
            />
          ) : (
            <Toolbar
              object={_object}
              objectType={_objectType}
              index={_index}
              zoom={{
                state: zoom,
                action: setZoom,
              }}
              objects={objects}
              groupObjects={_groupObjects}
              updateObject={updateObject}
              updateHistory={updateHistory}
              moveResizers={editors.moveResizers}
              removeImageFromObject={() => editors.onRemoveImageFromObject(_index, objects, _objectType)}
              removeFrameMaskFromObject={() => editors.onRemoveFrameMaskFromObject(_index, objects, _objectType)}
              swapImages={() => editors.onSwapImages(_index, objects, _objectType, setIsSwapping)}
              rotateLeftObject={() => editors.onRotateLeftObject(_index, objects)}
              rotateRightObject={() => editors.onRotateRightObject(_index, objects)}
              flipObject={() => editors.onFlipObject(_index, objects)}
              sendForward={() => editors.onSendForward(_index, objects)}
              sendBackward={() => editors.onSendBackward(_index, objects)}
              removeObject={() => editors.onRemoveObject(containers, objects, _index)}
              getImagePosition={(o: PObject) => editors.getImagePosition(o)}
              imageFit={(borderWidth, o) => editors.imageFitNoDebounce(objects, o, borderWidth)}
            />
          )}
          <div id="selection" hidden ref={selectionRef} />
          {!(_slideIndex === 0 && !currentProject.coverEditable) && (
            <SideButtons
              createImage={(e) => editors.createImage(e, objects)}
              createText={(e) => editors.createText(e, objects)}
              createSquare={(e) => editors.createSquare(e, objects)}
              createEclipse={(e) => editors.createEclipse(e, objects)}
              createMontagePortrait={(e) => editors.createMontagePortrait(e, objects)}
              changeLayout={(align, type) => editors.changeLayout(objects, layout, layouts, align, type)}
              layout={layout}
              type="photobook"
              layouts={layouts}
              currentProject={currentProject}
              slideIndex={_slideIndex}
              paperSizes={paperSizes}
            />
          )}
          <div
            id="slide_container"
            onMouseDown={(e) =>
              !(_slideIndex === 0 && !currentProject.coverEditable) && editors.onSlideMouseDown(e, _index, objects)
            }
            onDrop={(e) =>
              !(_slideIndex === 0 && !currentProject.coverEditable)
                ? editors.onObjectDropMontage(e, editor.type, objects, _index)
                : editors.onObjectDrop(e, editor.type, objects, _index, 0, false, 'montage')
            }
            onDragOver={editors.onObjectDragOver}
            ref={slideContainerRef}
          >
            <div id="slide" style={{ overflow }}>
              <div id="scaled_container" ref={scaledContainerRef}>
                <div
                  className="layout-drop layout-drop-left"
                  onDragOver={editors.layoutDragOver}
                  onDragLeave={editors.layoutDragLeave}
                  onDrop={(e) =>
                    !(_slideIndex === 0 && !currentProject.coverEditable) &&
                    _slideIndex !== 1 &&
                    editors.layoutDragDrop(e, objects, layout)
                  }
                />
                <div
                  className="layout-drop layout-drop-middle"
                  onDragOver={editors.layoutDragOver}
                  onDragLeave={editors.layoutDragLeave}
                  onDrop={(e) =>
                    !(_slideIndex === 0 && !currentProject.coverEditable) &&
                    [1, currentProject.slides.length - 1].includes(_slideIndex) &&
                    editors.layoutDragDrop(e, objects, layout)
                  }
                />
                <div
                  className="layout-drop layout-drop-right"
                  onDragOver={editors.layoutDragOver}
                  onDragLeave={editors.layoutDragLeave}
                  onDrop={(e) =>
                    !(_slideIndex === 0 && !currentProject.coverEditable) &&
                    _slideIndex !== currentProject.slides.length - 1 &&
                    editors.layoutDragDrop(e, objects, layout)
                  }
                />
                {!loading && (
                  <BackgroundImages
                    scale={scale}
                    editor={editor}
                    slideIndex={_slideIndex}
                    backgrounds={backgrounds}
                    deSelectObject={editors.deSelectObject}
                    setBackgrounds={setBackgrounds}
                    updateBackground={updateBackground}
                    updateHistory={updateHistory}
                    onBackgroundDropDragOver={editors.onBackgroundDropDragOver}
                    onBackgroundDropDragLeave={editors.onBackgroundDropDragLeave}
                    currentProject={currentProject}
                  />
                )}
                <div ref={canvasRef} id="canvas_container">
                  {!loading && (
                    <>
                      <div id="background">
                        {renderBackground({
                          backgrounds,
                          bgStyles,
                          updateBackground,
                        })}
                      </div>
                      <div id="container">
                        {objects.map((o: PObject, i: number) => {
                          return (
                            <div
                              id={o.id}
                              key={o.id}
                              style={o.style as React.CSSProperties}
                              className={o.className}
                              onMouseDown={
                                !(_slideIndex === 0 && !currentProject.coverEditable)
                                  ? (e) => editors.startDrag(e, o, i, objects, 0, isSwapping)
                                  : (e) => {
                                      editors.onSelect(e, o, i, objects)
                                      // Manage img-circle
                                      const _o = document.getElementById(o.id) as HTMLElement
                                      if (!_o) return
                                      const circle = _o.querySelector('.image-center') as HTMLElement
                                      if (circle.style.display === 'flex') circle.style.display = 'none'
                                      else circle.style.display = 'flex'
                                    }
                              }
                              onMouseEnter={(e) => editors.objectHover(e, i, _index)}
                              onMouseLeave={(e) => editors.objectHoverOff(e, i, _index)}
                              onDragOver={editors.onDragObjectOver}
                              onDragLeave={(e) => editors.onDragObjectLeave(e, _index)}
                              onDoubleClick={(e) => editors.onObjectDoubleClick(e, o, i, objects)}
                              onInput={(e) => editors.updateText(_index, objects, e)}
                              onPaste={(e) => editors.updateText(_index, objects, e)}
                              onBlur={(e) => {
                                editors.updateText(_index, objects, e)
                                if (_textObjectIndex > -1) {
                                  editors.updateTextObject(objects, _textObjectIndex)
                                }
                              }}
                              onKeyDown={(e) => editors.updateText(_index, objects, e)}
                              onKeyUp={(e) => {
                                if (e.keyCode === 16) editors._isShiftDown = false
                                if (e.keyCode === 17) editors._isCtrlDown = false
                              }}
                            >
                              {renderObject({
                                object: o,
                                updateObject,
                                updateHistory,
                                saveObjects,
                                scale,
                                zoom,
                                templateType: currentProject.templateType,
                              })}
                            </div>
                          )
                        })}
                      </div>{' '}
                    </>
                  )}
                </div>

                <div
                  className="group-selection"
                  ref={groupRef}
                  onMouseDown={(e) => editors.selectionDragStart(e, containers)}
                />
                <div className="active-border" />
                <div className="page-border" />
                {!(_slideIndex === 0 && !currentProject.coverEditable) && (
                  <div className="rotate" onMouseDown={(e) => editors.startRotate(e, objects, _index)} />
                )}
                <div id="magnetX" />
                <div id="magnetY" />
                {!(_slideIndex === 0 && !currentProject.coverEditable) &&
                  Object.keys(editors.transformers).map((t: string) => {
                    const cursor = `${t}-resize`
                    const resize = editors.transformers[t]
                    return (
                      <div
                        key={t}
                        style={{ cursor }}
                        onMouseDown={(e) => editors.startResize(e, cursor, resize, _index, objects)}
                        className={`resize ${resize}`}
                      />
                    )
                  })}
                {[1, currentProject.slides.length - 1].includes(_slideIndex) && (
                  <div
                    className={
                      'unavailable-to-edit-page flex flex-col items-center justify-center absolute top-0 w-1/2 h-full bg-gray-500 z-50' +
                      (_slideIndex === 1 ? ' left-page left-0' : ' right-page')
                    }
                    style={
                      _slideIndex !== 1
                        ? {
                            left: '50%',
                          }
                        : {}
                    }
                  >
                    <p className="p-0 m-0 uppercase text-white text-base">This page cannot be edited.</p>
                    <p className="p-0 m-0 text-gray-200">This end paper cannot be edited.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  return fetching ? (
    <div className="AdvancedEditorWrapper">
      <div className="EditorOnePageView">
        <Spinner />
      </div>
    </div>
  ) : (
    <div className="AdvancedEditorWrapper" ref={ref}>
      <Header
        deSelectObject={editors.deSelectObject}
        onPreview={async () => {
          if (preview || !single) {
            exitFull()
          } else {
            await saveObjects()
            setPreview.setTrue()
            setFull()
          }
        }}
        saveName={onSaveName}
        saveObjects={saveObjects}
        saveTextBeforeUndo={saveTextBeforeUndo}
        handleOrder={async () => {
          await saveObjects()
          setIsOrder(true)
        }}
        isFullscreen={isFullscreen}
      />
      <div className="EditorOnePageView">
        {!preview && (
          <SideBarPanel
            layoutGroups={layouts}
            hasImage
            isOrder={isOrder}
            setIsOrder={setIsOrder}
            hasFrameMask
            hasFrames={false}
            hasMask={false}
            templateType={currentProject?.templateType}
          />
        )}
        <div className="EditorPanel">
          {preview ? (
            <Preview
              slideIndex={_slideIndex}
              nextSlide={nextSlide}
              prevSlide={prevSlide}
              hasNext={hasNext}
              hasPrevious={hasPrevious}
            />
          ) : (
            renderEditor
          )}
          <FooterListTools
            scale={scale}
            fitScale={fitScale}
            setScale={setScale}
            loading={loading || refreshing}
            bgStyles={bgStyles}
            collapse={{
              state: footerCollapse,
              action: setFooterCollapse,
            }}
            preview={{
              state: preview,
              action: setPreview,
            }}
            single={{
              state: single,
              action: setSingle,
            }}
            slideWidth={slideWidth}
            slideHeight={slideHeight}
            objects={objects}
            containers={containers}
            backgrounds={backgrounds}
            deSelectObject={editors.deSelectObject}
            slideIndex={_slideIndex}
            currentProject={currentProject}
            changeSlideIndex={changeSlideIndex}
            addNewSlide={onAddSlide}
            duplicateSlide={onDuplicateSlide}
            reOrderSlide={onReOrderSlide}
            deleteSlide={onDeleteSlide}
            nextSlide={nextSlide}
            prevSlide={prevSlide}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            updateObject={updateObject}
            updateHistory={updateHistory}
            saveObjects={saveObjects}
            isFullscreen={isFullscreen}
            _templateType="montage"
          />
        </div>
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
  addNewSlide: _addNewSlide,
  deleteSlide: _deleteSlide,
  loadObjects: _loadObjects,
  loadContainers: _loadContainers,
  loadBackgrounds: _loadBackgrounds,
  updateContainer: _updateContainer,
  updateGroupContainer: _updateGroupContainer,
  updateBackground: _updateBackground,
  updateObject: _updateObject,
  setBackgrounds: _setBackgrounds,
  updateHistory: _updateHistory,
  addLayout: _addLayout,
  addObject: _addObject,
  duplicateSlide: _duplicateSlide,
  removeObject: _removeObject,
  reOrderSlide: _reOrderSlide,
  saveProjectAttribute: _saveProjectAttribute,
})(BookEditor)
