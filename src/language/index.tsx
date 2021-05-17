/* eslint @typescript-eslint/explicit-module-boundary-types: off */
import React from 'react'
import { ConfigProvider } from 'antd'
import antdEN from 'antd/lib/locale-provider/en_US'
import antdMN from 'antd/lib/locale-provider/mn_MN'
import { IntlProvider } from 'react-intl'
import { Empty } from 'components'
import { useSelector } from 'react-redux'
import { RootInterface, SettingsInterface } from 'interfaces'
import dayjs from 'dayjs'
import en from './en.json'
import mn from './mn.json'

const locales = {
  en,
  mn,
}

const antdData = {
  mn: antdMN,
  en: antdEN,
}

interface LocalizationProps {
  children: React.ReactNode
}

const Localization: React.FC<LocalizationProps> = ({ children }) => {
  const { locale } = useSelector<RootInterface, SettingsInterface>((state) => state.settings)

  dayjs.locale(locale.substring(0, 2))

  return (
    <ConfigProvider locale={antdData[locale]} renderEmpty={() => <Empty />}>
      <IntlProvider locale={locale.substring(0, 2)} messages={locales[locale]}>
        {children}
      </IntlProvider>
    </ConfigProvider>
  )
}

export default Localization
