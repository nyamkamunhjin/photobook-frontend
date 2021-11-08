import { useRequest } from 'ahooks'
import { message } from 'antd'
import React, { FC, useState } from 'react'
import { getTemplate, listPaperSize } from 'api'
import { Loading, MontageLayoutOptions } from 'components'
import { useParams } from 'react-router'
import WidthLimiter from 'layouts/main/components/width-limiter'
import { BindingType, CoverMaterial, CoverMaterialColor, CoverType, PaperSize } from 'interfaces'

const ProductTemplate: FC = () => {
  const { id }: { id: string } = useParams()
  const [selectedShowCase, setSelectedShowCase] = useState<{ url: string; type: 'video' | 'image' }>()
  const [selectedState, setSelectedState] = useState<{
    orientation?: string
    paperSize?: PaperSize
    coverType?: CoverType
    bindingType?: BindingType
    coverMaterial?: CoverMaterial
    coverMaterialColor?: CoverMaterialColor
  }>({
    orientation: 'Square',
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
          url: res.imageUrl,
          type: 'image',
        })
      }
    },
    onError: () => {
      message.error('Error')
    },
  })

  const paperSizes = useRequest(() => listPaperSize({ current: 0, pageSize: 100 }, { templateType: 'montage' }))

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
                <img
                  className="w-full object-contain"
                  src={`${process.env.REACT_APP_PUBLIC_IMAGE}${selectedShowCase?.url}`}
                  alt="showcase"
                />
              )}
            </div>
            <div dangerouslySetInnerHTML={{ __html: template.data.description }} />
          </div>
          <div className="flex flex-col w-full sm:w-1/2 p-4">
            {paperSizes.loading ? (
              <Loading fill={false} />
            ) : (
              <MontageLayoutOptions
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
