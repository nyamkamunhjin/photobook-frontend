/* eslint-disable no-alert */
/* eslint-disable import/newline-after-import */
/* eslint-disable @typescript-eslint/no-shadow */
import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { connect } from 'react-redux'
import { updateProject } from 'redux/actions/project'
import { Modal, Select } from 'antd'
import {
  BindingType,
  CoverMaterial,
  CoverMaterialColor,
  CoverType,
  PaperSize,
  Project,
  ProjectInterface,
  StateInterface,
} from 'interfaces'
import { FormattedMessage, useIntl } from 'react-intl'

interface Props {
  setSettingsVisible: (value: boolean) => void
  settingsVisible: boolean
  updateProject: (projectId: number, props: any) => void
  project: ProjectInterface
  paperSizes: PaperSize[]
  slideIndex: number
  currentProject: Project
}

const SlideSettings: React.FC<Props> = ({
  setSettingsVisible,
  settingsVisible,
  updateProject,
  project: { slideWidth, slideHeight, objects },
  paperSizes,
  slideIndex,
  currentProject,
}) => {
  const intl = useIntl()
  const orientations = useMemo(
    () =>
      paperSizes.reduce((acc: any, paperSize: any) => {
        if (!acc.some((item: any) => item.name === paperSize.orientation)) {
          acc.push({ name: paperSize.orientation, sizes: [paperSize] })
        } else {
          acc.find((item: any) => item.name === paperSize.orientation)?.sizes.push(paperSize)
        }
        return acc
      }, [] as any[]),
    [paperSizes]
  )
  const [selectedState, setSelectedState] = useState<{
    orientation?: string
    paperSize?: PaperSize
    coverType?: CoverType
    bindingType?: BindingType
    coverMaterial?: CoverMaterial
    coverMaterialColor?: CoverMaterialColor
    changeRequest?: string
  }>({
    orientation: currentProject.paperSize?.orientation,
    paperSize: currentProject.paperSize,
    coverType: undefined,
    bindingType: undefined,
    coverMaterial: undefined,
    coverMaterialColor: undefined,
    changeRequest: undefined,
  })

  // const initialState = useCallback(() => {
  //   let coverType
  //   let bindingType
  //   let coverMaterial
  //   let coverMaterialColor

  //   const [paperSize] = orientations[0].sizes

  //   if (paperSize.coverTypes && paperSize.coverTypes.length > 0) [coverType] = paperSize.coverTypes
  //   if (coverType?.bindingTypes && coverType.bindingTypes.length > 0) [bindingType] = coverType.bindingTypes
  //   if (coverType?.coverMaterials && coverType.coverMaterials.length > 0) [coverMaterial] = coverType.coverMaterials
  //   if (coverMaterial?.coverMaterialColors && coverMaterial.coverMaterialColors.length > 0)
  //     [coverMaterialColor] = coverMaterial.coverMaterialColors

  //   setSelectedState({
  //     orientation: orientations[0].name,
  //     paperSize,
  //     coverType,
  //     bindingType,
  //     coverMaterial,
  //     coverMaterialColor,
  //     changeRequest: 'Unnecessary',
  //   })
  // }, [orientations, setSelectedState])

  // useEffect(() => {
  //   if (paperSizes) {
  //     initialState()
  //   }
  // }, [initialState, paperSizes])

  const handleSettingsCancel = useCallback(() => {
    setSettingsVisible(false)
  }, [setSettingsVisible])

  const onFinish = async () => {
    try {
      if (currentProject.id) {
        const data = {
          paperSizeId: selectedState.paperSize?.id,
          coverTypeId: selectedState.paperSize?.coverTypes?.length === 0 ? undefined : selectedState.coverType?.id,
          bindingTypeId:
            !selectedState.coverType?.bindingTypes || selectedState.coverType?.bindingTypes?.length === 0
              ? undefined
              : selectedState.bindingType?.id,
          coverMaterialId:
            !selectedState.coverType?.coverMaterials || selectedState.coverType?.coverMaterials?.length === 0
              ? undefined
              : selectedState.coverMaterial?.id,
          coverColorId:
            !selectedState.coverMaterial?.coverMaterialColors ||
            selectedState.coverMaterial?.coverMaterialColors.length === 0
              ? undefined
              : selectedState.coverMaterialColor?.id,
        } as any

        if (!data.paperSizeId) {
          alert('Please choose all the options')
          return
        }
        if (currentProject.paperSizeId === data.paperSizeId) delete data.paperSizeId
        if (currentProject.coverTypeId === data.coverTypeId) delete data.coverTypeId
        if (currentProject.bindingTypeId === data.bindingTypeId) delete data.bindingTypeId
        if (currentProject.coverMaterialId === data.coverMaterialId) delete data.coverMaterialId
        if (currentProject.coverColorId === data.coverColorId) delete data.coverColorId

        if (
          currentProject.paperSizeId !== selectedState.paperSize?.id &&
          selectedState.paperSize &&
          currentProject.paperSize
        ) {
          const { width: wTemp, height: h } = selectedState.paperSize
          const { width: _wTemp, height: _h } = currentProject.paperSize
          const w = ['photobook', 'montage'].includes(currentProject.templateType?.name + '')
            ? wTemp * 100 * 2 + 30
            : wTemp
          const _w = ['photobook', 'montage'].includes(currentProject.templateType?.name + '')
            ? _wTemp * 100 * 2 + 30
            : _wTemp
          console.log('new', wTemp, h, 'old', _wTemp, _h)
          const slides = currentProject.slides.map((slide, index) => {
            const _objects = index === slideIndex ? objects : slide.objects
            return {
              ...slide,
              objects: _objects.map((o) => {
                if (['photobook', 'montage'].includes(currentProject.templateType?.name + '')) {
                  return {
                    ...o,
                    style: {
                      ...o.style,
                      top: `${(h * parseFloat(o.style.top + '')) / _h}px`,
                      left: `${(((w - 30) / 2) * parseFloat(o.style.left + '')) / ((_w - 30) / 2)}px`,
                      height: `${(h * parseFloat(o.style.height + '')) / _h}px`,
                      width: `${(((w - 30) / 2) * parseFloat(o.style.width + '')) / ((_w - 30) / 2)}px`,
                    },
                  }
                } else {
                  return {
                    ...o,
                    style: {
                      ...o.style,
                      width: (parseFloat(o.style.width + '') * w) / _w + 'px',
                      height: (parseFloat(o.style.height + '') * h) / _h + 'px',
                      top: (parseFloat(o.style.top + '') * h) / _h + 'px',
                      left: (parseFloat(o.style.left + '') * w) / _w + 'px',
                    },
                  }
                }
              }),
            }
          })
          await updateProject(currentProject.id, { ...data, slides })
        } else {
          await updateProject(currentProject.id, data)
        }
        setSettingsVisible(false)
      }
    } catch (err: any) {
      console.log(err.message)
    }
  }

  useEffect(() => {
    const clickWindow = (e: any) => {
      if (typeof e.target.className === 'object' || e.target.closest('.ant-modal-close')) {
        handleSettingsCancel()
        return
      }
      if (
        e.target.closest('.modal-child') ||
        e.target.className.includes('modal-child') ||
        e.target.className.includes('ant-select-item-option-content')
      )
        return
      handleSettingsCancel()
    }
    if (settingsVisible) window.addEventListener('mouseup', clickWindow)
    else window.removeEventListener('mouseup', clickWindow)

    return () => {
      window.removeEventListener('mouseup', clickWindow)
    }
  }, [settingsVisible, handleSettingsCancel])

  return (
    <Modal
      title={<FormattedMessage id="slide_settings" />}
      visible={settingsVisible}
      className="modal-child"
      onOk={onFinish}
      onCancel={handleSettingsCancel}
    >
      <div className="flex flex-col gap-4">
        <div className="flex gap-4 justify-between">
          <span className="font-normal text-sm">{intl.formatMessage({ id: 'orientation' })}</span>
          <div className="flex flex-wrap gap-4 w-2/3">
            <Select
              className="w-full"
              onChange={(value) => {
                setSelectedState((each: any) => ({
                  ...each,
                  orientation: value,
                }))
              }}
              // defaultValue={currentProject.paperSize?.orientation}
            >
              {orientations.map((each: any) => (
                <Select.Option key={each.name} value={each.name}>
                  {each.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex gap-4 justify-between">
          <span className="font-normal text-sm">{intl.formatMessage({ id: 'paper_size' })}</span>
          <div className="flex flex-wrap gap-4 w-2/3">
            <Select
              className="w-full flex items-center"
              onChange={(value) => {
                setSelectedState((each) => ({
                  ...each,
                  paperSize: orientations
                    .find((item: any) => item.name === selectedState.orientation)
                    ?.sizes.find((item: PaperSize) => item.size === value),
                }))
              }}
              // defaultValue={orientations.find((item: any) => item.name === selectedState.orientation)?.sizes[0].size}
            >
              {orientations
                .find((item: any) => item.name === selectedState.orientation)
                ?.sizes.map((each: PaperSize) => (
                  <Select.Option key={each.size} value={each.size}>
                    {each.size}
                  </Select.Option>
                ))}
            </Select>
          </div>
        </div>

        <div className="flex gap-4 justify-between" hidden={selectedState.paperSize?.coverTypes?.length === 0}>
          <span className="font-normal text-sm">{intl.formatMessage({ id: 'cover_type' })}</span>
          <div className="flex flex-wrap gap-4 w-2/3">
            <Select className="w-full flex items-center">
              {selectedState.paperSize?.coverTypes?.map((each: CoverType) => (
                <Select.Option
                  key={each.id}
                  value={each.id}
                  onClick={() => {
                    setSelectedState((prev) => ({
                      ...prev,
                      coverType: each,
                      bindingType: each.bindingTypes?.[0],
                      coverMaterial: each.coverMaterials?.[0],
                      coverMaterialColor: each.coverMaterials?.[0]?.coverMaterialColors?.[0],
                    }))
                  }}
                >
                  {each.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>

        <div
          className="flex gap-4 justify-between"
          hidden={!selectedState.coverType?.bindingTypes || selectedState.coverType?.bindingTypes?.length === 0}
        >
          <span className="font-normal text-sm">{intl.formatMessage({ id: 'binding_type' })}</span>
          <div className="flex flex-wrap gap-4 w-2/3">
            <Select className="w-full flex items-center">
              {selectedState.coverType?.bindingTypes?.map((each: BindingType) => (
                <Select.Option
                  key={each.id}
                  value={each.id}
                  onClick={() => {
                    setSelectedState((prev) => ({ ...prev, bindingType: each }))
                  }}
                >
                  {each.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
        <div
          className="flex gap-4 justify-between"
          hidden={!selectedState.coverType?.coverMaterials || selectedState.coverType?.coverMaterials?.length === 0}
        >
          <span className="font-normal text-sm">{intl.formatMessage({ id: 'cover_material' })}</span>
          <div className="flex flex-wrap gap-4 w-2/3">
            <Select className="w-full flex items-center">
              {selectedState.coverType?.coverMaterials?.map((each: CoverMaterial) => (
                <Select.Option
                  key={each.id}
                  value={each.id}
                  onClick={() => {
                    setSelectedState((prev) => ({
                      ...prev,
                      coverMaterial: each,
                      coverMaterialColor: each.coverMaterialColors?.[0],
                    }))
                  }}
                >
                  {each.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>

        <div
          className="flex gap-4 justify-between"
          hidden={
            !selectedState.coverMaterial?.coverMaterialColors ||
            selectedState.coverMaterial?.coverMaterialColors.length === 0
          }
        >
          <span className="font-normal text-sm">{intl.formatMessage({ id: 'cover_material_color' })}</span>
          <div className="flex flex-wrap gap-4 w-2/3">
            <Select className="w-full flex items-center">
              {selectedState.coverMaterial?.coverMaterialColors?.map((each) => (
                <Select.Option
                  key={each.id}
                  value={each.id}
                  onClick={() => {
                    setSelectedState((prev) => ({ ...prev, coverMaterialColor: each }))
                  }}
                >
                  {each.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex gap-4 justify-between">
          <span className="font-normal text-sm">{intl.formatMessage({ id: 'change_request' })}</span>
          <div className="flex flex-wrap gap-4 w-2/3">
            <Select className="w-full flex items-center">
              {['Brightness', 'Color', 'Unnecessary'].map((each) => (
                <Select.Option
                  key={each}
                  value={each}
                  onClick={() => {
                    setSelectedState((prev) => ({ ...prev, changeRequest: each }))
                  }}
                >
                  {each}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </Modal>
  )
}

const mapStateToProps = (state: StateInterface) => ({
  project: state.project,
})

export default connect(mapStateToProps, { updateProject })(SlideSettings)
