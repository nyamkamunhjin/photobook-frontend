import React from 'react'
import Spinner from 'components/spinner'
import { FrameMaterial } from 'interfaces'

interface Props {
  loading: boolean
  frameMaterials: FrameMaterial[]
}

const FrameMaterials: React.FC<Props> = ({ loading, frameMaterials }) => {
  const dragStart = (e: any, tempUrl: any, imageUrl: any, borderWidth = 0) => {
    e.dataTransfer.setData('tempUrl', tempUrl)
    e.dataTransfer.setData('imageUrl', imageUrl)
    e.dataTransfer.setData('borderWidth', borderWidth)
  }

  return loading ? (
    <Spinner />
  ) : (
    <div className="Images">
      <div className="ImportedPhotos">
        {frameMaterials.map((frameMaterial: FrameMaterial) => (
          <div
            key={`${frameMaterial.imageUrl}`}
            style={{
              display: 'flex',
              flexFlow: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            <div className="ImageContainer" key={`${frameMaterial.imageUrl}`}>
              <img
                draggable
                onDragStart={(e) =>
                  dragStart(e, frameMaterial.tempUrl, frameMaterial.imageUrl, frameMaterial.borderWidth)
                }
                alt={frameMaterial.tempUrl}
                src={frameMaterial.tempUrl}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FrameMaterials
