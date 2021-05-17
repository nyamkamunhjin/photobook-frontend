import React from 'react'
import { LoadingOutlined } from '@ant-design/icons'

interface Props {
  fill?: boolean
}

const Loading: React.FC<Props> = ({ fill = true }) => (
  <div
    className="container flex justify-center items-center"
    style={{ width: fill ? '100vw' : '100%', height: fill ? '100vh' : '100%' }}
  >
    {/* <Spin /> */}
    <LoadingOutlined className="text-3xl text-blue-400" />
  </div>
)

export default Loading
