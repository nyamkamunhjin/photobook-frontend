import React from 'react'
import { LoadingOutlined } from '@ant-design/icons'

interface Props {
  fill?: boolean
  className?: string
}

const Loading: React.FC<Props> = ({ fill = true, className = 'text-3xl text-blue-400' }) => (
  <div
    className="container flex justify-center items-center"
    style={{ width: fill ? '100vw' : '100%', height: fill ? '100vh' : '100%' }}
  >
    {/* <Spin /> */}
    <LoadingOutlined className={className} />
  </div>
)

export default Loading
