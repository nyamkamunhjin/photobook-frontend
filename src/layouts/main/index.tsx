import React from 'react'
import { Layout } from 'antd'
import Header from './header'
import Footer from './footer'

const MainLayout: React.FC = ({ children }) => {
  const { Content } = Layout

  return (
    <Layout className=" w-full mx-auto">
      <Header />
      <Content>
        <div className="mx-auto min-h-screen bg-white">{children}</div>
      </Content>
      <Footer />
    </Layout>
  )
}

export default MainLayout
