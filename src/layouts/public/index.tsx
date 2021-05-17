import React from 'react'
import { Layout } from 'antd'
import './style.css'

const AuthLayout: React.FC = ({ children }) => {
  const { Content } = Layout

  return (
    <Layout className="layout">
      <Content>
        <div className="content">{children}</div>
      </Content>
    </Layout>
  )
}

export default AuthLayout
