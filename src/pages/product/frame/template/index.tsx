import { useRequest } from 'ahooks'
import { message } from 'antd'
import React, { FC, useState } from 'react'
import { getTemplate, listFrameMaterial, listPaperSize } from 'api'
import { FrameLayoutOptions, Loading } from 'components'
import { useParams } from 'react-router'
import WidthLimiter from 'layouts/main/components/width-limiter'
import { FrameMaterial, PaperSize, Template } from 'interfaces'

const ProductTemplate: FC = () => {
  const { id }: { id: string } = useParams()
  const [selectedShowCase, setSelectedShowCase] = useState<{ url: string; type: 'video' | 'image' }>()
  const [selectedState, setSelectedState] = useState<{
    paperSize?: PaperSize
    frameMaterial?: FrameMaterial
  }>({
    paperSize: undefined,
    frameMaterial: undefined,
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

  const paperSizes = useRequest(() => listPaperSize({ current: 0, pageSize: 100 }, { templateType: 'frame' }))

  const frameMaterials = useRequest(() => listFrameMaterial())

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
            </div>
            <div dangerouslySetInnerHTML={{ __html: template.data.description }} />
          </div>
          <div className="flex flex-col w-full sm:w-1/2 p-4">
            {paperSizes.loading ? (
              <Loading fill={false} />
            ) : (
              <FrameLayoutOptions
                template={template.data}
                paperSizes={paperSizes.data.list}
                frameMaterials={frameMaterials.data}
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
