import { useRequest } from 'ahooks'
import { message } from 'antd'
import React, { FC, useState } from 'react'
import { getTemplate, listPaperSize } from 'api'
import { Loading, PhotobookLayoutOptions } from 'components'
import { useParams } from 'react-router'
import WidthLimiter from 'layouts/main/components/width-limiter'
import { BindingType, CoverMaterial, CoverMaterialColor, CoverType, PaperSize, Template } from 'interfaces'

const ProductTemplate: FC = () => {
  const { id }: { id: string } = useParams()
  const [selectedShowCase, setSelectedShowCase] = useState<{ url: string; type: 'video' | 'image' }>()
  const [selectedState, setSelectedState] = useState<{
    paperSize?: PaperSize
    coverType?: CoverType
    bindingType?: BindingType
    coverMaterial?: CoverMaterial
    coverMaterialColor?: CoverMaterialColor
  }>({
    paperSize: undefined,
    coverType: undefined,
    bindingType: undefined,
    coverMaterial: undefined,
    coverMaterialColor: undefined,
  })

  const template = useRequest(() => getTemplate(parseInt(id, 10)), {
    onSuccess: (res) => {
      if (res.imageUrl) {
        setSelectedShowCase({
          url: res.imageUrl.includes('http') ? res.imageUrl : res.tempUrl,
          type: 'image',
        })
      }
    },
    onError: () => {
      message.error('Error')
    },
  })

  const paperSizes = useRequest(() => listPaperSize({ current: 0, pageSize: 100 }, { templateType: 'photobook' }))

  return (
    <WidthLimiter className="flex flex-col sm:flex-row min-h-screen">
      {template.loading ? (
        <Loading />
      ) : (
        <>
          <div className="flex flex-col w-full sm:w-1/2 gap-4 p-4">
            <div className="w-full grid place-items-center aspect-w-1 aspect-h-1">
              {selectedShowCase?.type === 'video' ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={selectedShowCase.url}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <img className="w-full object-contain" src={selectedShowCase?.url} alt="showcase" />
              )}
            </div>
            <div className="flex gap-4">
              {selectedState.coverType?.videoUrl && (
                <button
                  className="w-full"
                  style={{ maxWidth: '200px' }}
                  type="button"
                  onClick={() => {
                    if (selectedState.coverType?.videoUrl) {
                      setSelectedShowCase({ url: selectedState.coverType.videoUrl, type: 'video' })
                    }
                  }}
                >
                  <img
                    className="w-full"
                    src={`http://i3.ytimg.com/vi/${selectedState.coverType?.videoUrl?.split('/').pop()}/default.jpg
`}
                    alt="covertype"
                  />
                </button>
              )}
              {template.data?.imageUrl && (
                <button
                  className="w-full"
                  style={{ maxWidth: '200px' }}
                  type="button"
                  onClick={() => {
                    if (template.data?.imageUrl) {
                      setSelectedShowCase({
                        url: template.data.imageUrl.includes('http') ? template.data.imageUrl : template.data.tempUrl,
                        type: 'image',
                      })
                    }
                  }}
                >
                  <img
                    className="w-full"
                    src={
                      (template.data as Template).imageUrl?.includes('http')
                        ? (template.data as Template).imageUrl
                        : (template.data as Template).tempUrl
                    }
                    alt="template"
                  />
                </button>
              )}
              {selectedState.bindingType?.featureImageUrl && (
                <button
                  className="w-full"
                  style={{ maxWidth: '200px' }}
                  type="button"
                  onClick={() => {
                    if (selectedState.bindingType?.featureImageUrl) {
                      setSelectedShowCase({
                        url: selectedState.bindingType.featureImageUrl.includes('http')
                          ? selectedState.bindingType.featureImageUrl
                          : selectedState.bindingType.tempFeatureUrl || '',
                        type: 'image',
                      })
                    }
                  }}
                >
                  <img
                    className="w-full"
                    src={
                      selectedState.bindingType?.featureImageUrl.includes('http')
                        ? selectedState.bindingType?.featureImageUrl
                        : selectedState.bindingType?.tempFeatureUrl
                    }
                    alt="bindingType"
                  />
                </button>
              )}
            </div>
            <div dangerouslySetInnerHTML={{ __html: template.data.description }} />
          </div>
          <div className="flex flex-col w-full sm:w-1/2 p-4">
            {paperSizes.loading ? (
              <Loading fill={false} />
            ) : (
              <PhotobookLayoutOptions
                template={template.data}
                paperSizes={paperSizes.data.list}
                selectedState={selectedState}
                setSelectedState={setSelectedState}
              />
            )}
          </div>
        </>
      )}
    </WidthLimiter>
  )
}

export default ProductTemplate
