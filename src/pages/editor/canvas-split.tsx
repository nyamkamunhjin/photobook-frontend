/* eslint-disable no-unused-expressions */
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
  Image,
  ImageInterface,
  ObjectType,
  PObject,
  ProjectCreate,
  ProjectImage,
  ProjectInterface,
  RootInterface,
  Slide,
} from 'interfaces'
import Spinner from 'components/spinner'
import { debounce } from 'utils'

import { useBoolean, useDebounceFn, useFullscreen } from 'ahooks'
import { linkImages as _linkImages } from 'redux/actions/image'
import { Header, FooterListTools, SideBarPanel, Toolbar } from './components/layout'
import Preview from './components/preview'
import { Editor, renderObject } from './components/utils'
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
  image: ImageInterface
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
  linkImages: (images: string[], id: number) => Promise<any>
}

const BookEditor: React.FC<Props> = ({
  getProjects,
  saveProject,
  editor,
  loadObjects,
  loadContainers,
  updateGroupContainer,
  saveProjectAttribute,
  updateObject,
  updateHistory,
  loadBackgrounds,
  addLayout,
  addObject,
  linkImages,
  removeObject,
  project: {
    currentProject,
    objects,
    containers,
    backgrounds,
    bgStyles,
    slideWidth,
    slideHeight,
    layouts,
    loading,
    fetching,
  },
  image: { images, loading: imgLoading },
}) => {
  const [template] = useQueryState('template', 1)
  const [width] = useQueryState('width', 1)
  const [height] = useQueryState('height', 1)
  const [uuid, setUuid] = useQueryState('project', '')
  const urlParams = new URLSearchParams(window.location.search)
  const tradephoto = urlParams.get('tradephoto')

  const slideViewRef: any = useRef(null)
  const editorContainerRef: any = useRef(null)
  const slideContainerRef: any = useRef(null)
  const selectionRef: any = useRef(null)
  const canvasRef = useRef<any>(null)
  const scaledContainerRef = useRef<any>(null)
  const groupRef = useRef<any>(null)
  const [overflow, setOverflow] = useState<string>('hidden')
  const [preview, setPreview] = useBoolean(false)
  const [single, setSingle] = useBoolean(true)
  const [isOrder, setIsOrder] = useState(false)
  const [tradephotoLoading, setTradephotoLoading] = useState<boolean>(tradephoto !== null)

  // states
  const [scale, setScale] = useState<number>(1)
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
  const _slideIndex = 0
  useHotkeys('shift+a', () => editors.onRotateLeftObject(_index, objects), [_index, objects])
  useHotkeys('shift+d', () => editors.onRotateRightObject(_index, objects), [_index, objects])
  useHotkeys('shift+q', () => editors.onFlipObject(_index, objects), [_index, objects])
  useHotkeys('shift+w', () => editors.onSendForward(_index, objects), [_index, objects])
  useHotkeys('shift+s', () => editors.onSendBackward(_index, objects), [_index, objects])
  // useHotkeys('Delete', () => editors.onRemoveObject(containers, objects, _index), [_index, objects])
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

  const BORDER_WIDTH = currentProject.templateType?.gap?.borderWidth || 0

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
      double: false,
    })
  }, [scale, slideHeight, slideWidth])

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
    updatedSlide.objects = objects.map((o: PObject) => {
      if (o.props.className !== 'image-placeholder') return o
      const obj = document.getElementById(o.id)
      const [img] = obj?.getElementsByTagName('img') as any
      if (!img) return o
      const { width: w, height: h, top, left } = img.style
      if (w !== 'auto' && h !== 'auto') {
        o.props.imageStyle.width = w
        o.props.imageStyle.height = h
      } else if (w !== 'auto') o.props.imageStyle.width = w
      else if (h !== 'auto') o.props.imageStyle.height = h
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
    // Urgeljlel bii
    // console.log(
    //   'scale',
    //   ratio,
    //   'rect',
    //   rect,
    //   'maxWidth',
    //   maxWidth,
    //   'maxHeight',
    //   maxHeight,
    //   'srcWidth',
    //   srcWidth,
    //   'srcHeight',
    //   srcHeight
    // )

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
    editors.loadObjects(currentSlide.objects, BORDER_WIDTH)
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
    if (!template || width === 0 || height === 0) {
      window.history.back()
      return
    }
    const paperSize = { width, height }
    getProjects(template, { paperSize }, uuid).then((id) => {
      if (id) {
        setUuid(id)
      }
    })
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

  const ref = useRef<any>()
  const [isFullscreen, { setFull, exitFull }] = useFullscreen(ref)
  useEffect(() => {
    if (isFullscreen) return
    setPreview.setFalse()
    setSingle.setTrue()
  }, [isFullscreen])

  useEffect(() => {
    debouncedSave.run()
  }, [_object])

  useEffect(() => {
    const addTradePhoto = async () => {
      try {
        if (tradephoto) {
          if (images.length === 0 || !images.some((projectImage) => projectImage.imageId === parseFloat(tradephoto))) {
            console.log('addTradePhoto')
            await linkImages([tradephoto], currentProject.id)
          }
        }
      } catch (err) {
        console.error(err)
      }
    }

    if (
      tradephoto &&
      tradephotoLoading &&
      currentProject.id !== 0 &&
      !imgLoading &&
      (images.length === 0 || !images.some((projectImage) => projectImage.imageId === parseFloat(tradephoto)))
    )
      addTradePhoto()
  }, [tradephoto, tradephotoLoading, images, imgLoading, currentProject])

  useEffect(() => {
    const setTradePhoto = async () => {
      try {
        if (tradephoto) {
          const image = images.find((item: ProjectImage) => item.imageId === parseFloat(tradephoto))?.image
          if (image) {
            console.log('setTradePhoto')
            editors.setFirstObject(image, editor.type, objects, slideWidth, slideHeight, 0, objects[0].id)
            saveObjects()
            setTradephotoLoading(false)
          }
        }
      } catch (err) {
        console.error(err)
      }
    }

    if (
      tradephoto &&
      tradephotoLoading &&
      images.length > 0 &&
      images.some((image) => image.imageId === parseFloat(tradephoto)) &&
      objects[0] &&
      objects[0].id &&
      objects[0].props.imageUrl === 'empty.png'
    )
      setTradePhoto()
  }, [tradephoto, tradephotoLoading, images, objects, currentProject, slideWidth, slideHeight])

  const renderEditor = (
    <div className="EditorPanelContainer">
      <div ref={slideViewRef} className="StepSlideContainer SlideViewContainer">
        <div id="editor_container" ref={editorContainerRef}>
          <Toolbar
            object={_object}
            objectType={_objectType}
            index={_index}
            objects={objects}
            updateObject={updateObject}
            updateHistory={updateHistory}
            flipObject={() => editors.onFlipObject(_index, objects)}
            imageFit={() => {
              const _obj = objects.find((o: PObject) => o.props.className === 'image-placeholder')
              if (!_obj) return
              editors.imageFitNoDebounce(objects, _obj, BORDER_WIDTH)
            }}
            getImagePosition={(o: PObject) => editors.getImagePosition(o)}
            // moveResizers={editors.moveResizers}
            // removeImageFromObject={() => editors.onRemoveImageFromObject(_index, objects, _objectType)}
            // rotateLeftObject={() => editors.onRotateLeftObject(_index, objects)}
            // rotateRightObject={() => editors.onRotateRightObject(_index, objects)}
            // sendForward={() => editors.onSendForward(_index, objects)}
            // sendBackward={() => editors.onSendBackward(_index, objects)}
            // removeObject={() => {
            //   return null
            // }}
          />
          <div id="selection" hidden ref={selectionRef} />
          <div
            id="slide_container"
            // onMouseDown={(e) => editors.onSlideMouseDown(e, _index, objects)}
            onDrop={(e) => editors.onObjectDrop(e, editor.type, objects, 0, BORDER_WIDTH, true, 'canvas-split')}
            onDragOver={editors.onObjectDragOver}
            ref={slideContainerRef}
          >
            <div id="slide" style={{ overflow }}>
              <div id="scaled_container" ref={scaledContainerRef} className="relative">
                <div ref={canvasRef} id="canvas_container">
                  {!loading && (
                    <>
                      <div id="container">
                        {objects.map((o: PObject, i: number) => {
                          return (
                            <div
                              id={o.id}
                              key={o.id}
                              style={{
                                ...(o.style as React.CSSProperties),
                                width: slideWidth + 'px',
                                height: slideHeight + 'px',
                                top: 0,
                                left: 0,
                              }}
                              className={o.className}
                              onMouseDown={(e) => {
                                editors.onSelect(e, o, i, objects)
                                // Manage img-circle
                                const _o = document.getElementById(o.id) as HTMLElement
                                if (!_o) return
                                const circle = _o.querySelector('.image-center') as HTMLElement
                                if (circle.style.display === 'flex') circle.style.display = 'none'
                                else circle.style.display = 'flex'
                              }}
                              onMouseEnter={(e) => editors.objectHover(e, i, _index)}
                              onMouseLeave={(e) => editors.objectHoverOff(e, i, _index)}
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
                                zoom: 1,
                                scale,
                                border: BORDER_WIDTH,
                                slideWidth,
                                slideHeight,
                                _templateType: 'canvas-split',
                                templateType: currentProject.templateType,
                              })}
                            </div>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>

                <div
                  className="group-selection"
                  ref={groupRef}
                  onMouseDown={(e) => editors.selectionDragStart(e, containers)}
                />
                <div className="active-border" />
                <div className="page-border-canvas" />
                {/* <div className="rotate" onMouseDown={(e) => editors.startRotate(e, objects, _index)} /> */}
                <div id="magnetX" />
                <div id="magnetY" />
                {/* {Object.keys(editors.transformers).map((t: string) => {
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
                })} */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
  return fetching && !tradephotoLoading ? (
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
            hasBackground={false}
            hasFrames={false}
            hasLayout={false}
            hasMask={false}
            hasClipArt={false}
            hasImage
            isOrder={isOrder}
            setIsOrder={setIsOrder}
            templateType={currentProject?.templateType}
          />
        )}
        <div className="EditorPanel">
          {preview ? (
            <Preview slideIndex={_slideIndex} isPhotobook={false} _templateType="canvas-split" />
          ) : (
            renderEditor
          )}
          <FooterListTools
            hideTools
            scale={scale}
            fitScale={fitScale}
            setScale={setScale}
            loading={loading}
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
            updateObject={updateObject}
            updateHistory={updateHistory}
            saveObjects={saveObjects}
            mustHaveImageCenter
            isFullscreen={isFullscreen}
            _templateType="canvas-split"
          />
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state: RootInterface) => ({
  project: state.project,
  editor: state.editor,
  image: state.image,
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
  linkImages: _linkImages,
})(BookEditor)
