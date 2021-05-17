import React from 'react'
import { Layout } from 'antd'
import './style.css'

const AuthLayout: React.FC = ({ children }) => {
  const { Content } = Layout

  return (
    <Layout>
      <Content>
        <div className="content p-4">{children}</div>
      </Content>
    </Layout>
  )
}

export default AuthLayout
