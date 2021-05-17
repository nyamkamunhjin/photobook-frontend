import { useRequest } from 'ahooks'
import { message } from 'antd'
import React, { FC, useState } from 'react'
import { getTemplate, listPaperMaterial, listPaperSize } from 'api'
import { CanvasLayoutOptions, Loading } from 'components'
import { useParams } from 'react-router'
import WidthLimiter from 'layouts/main/components/width-limiter'
import { PaperMaterial, PaperSize, Template } from 'interfaces'

const ProductTemplate: FC = () => {
  const { id }: { id: string } = useParams()
  const [selectedShowCase, setSelectedShowCase] = useState<{ url: string; type: 'video' | 'image' }>()
  const [selectedState, setSelectedState] = useState<{
    paperSize?: PaperSize
    paperMaterial?: PaperMaterial
  }>({
    paperSize: undefined,
    paperMaterial: undefined,
  })

  const template = useRequest(() => getTemplate(parseInt(id, 10)), {
    onSuccess: (res) => {
      if (res.imageUrl) {
        setSelectedShowCase({
          url: res.imageUrl,
          type: 'image',
        })
      }
    },
    onError: () => {
      message.error('Error')
    },
  })

  const paperSizes = useRequest(() => listPaperSize({ current: 0, pageSize: 100 }, { templateType: 'canvas' }))

  const paperMaterials = useRequest(() => listPaperMaterial())

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
              {template.data?.imageUrl && (
                <button
                  className="w-full"
                  style={{ maxWidth: '200px' }}
                  type="button"
                  onClick={() => {
                    if (template.data?.imageUrl) {
                      setSelectedShowCase({ url: template.data.imageUrl, type: 'image' })
                    }
                  }}
                >
                  <img className="w-full" src={(template.data as Template).imageUrl} alt="template" />
                </button>
              )}
              {selectedState.paperMaterial?.imageUrl && (
                <button
                  className="w-full"
                  style={{ maxWidth: '200px' }}
                  type="button"
                  onClick={() => {
                    if (selectedState.paperMaterial?.imageUrl) {
                      setSelectedShowCase({ url: selectedState.paperMaterial.imageUrl, type: 'image' })
                    }
                  }}
                >
                  <img className="w-full" src={selectedState.paperMaterial.imageUrl} alt="template" />
                </button>
              )}
            </div>
            <div dangerouslySetInnerHTML={{ __html: template.data.description }} />
          </div>
          <div className="flex flex-col w-full sm:w-1/2 p-4">
            {template.loading || paperSizes.loading || paperMaterials.loading ? (
              <Loading fill={false} />
            ) : (
              <CanvasLayoutOptions
                template={template.data}
                paperSizes={paperSizes.data.list}
                paperMaterials={paperMaterials.data}
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
