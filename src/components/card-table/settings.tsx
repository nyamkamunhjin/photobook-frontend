import { useBoolean, useDebounceFn } from 'ahooks'
import { Button, Checkbox, Modal, Table } from 'antd'
import { CheckboxValueType } from 'antd/lib/checkbox/Group'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'

export type SettingsValue = { shows: string[]; freezes: string[] }

export interface SettingsData {
  key: string
}

interface Props {
  defaultValues: SettingsValue
  data: SettingsData[]
  onSave: (value: SettingsValue) => void
  onCancel: () => void
}

const Settings: React.FC<Props> = ({ defaultValues, data, onSave, onCancel }) => {
  const intl = useIntl()
  const [visible, setVisible] = useBoolean(true)
  const [values, setValues] = useState<CheckboxValueType[]>([
    ...defaultValues.shows.map((item) => `show|${item}`),
    ...defaultValues.freezes.map((item) => `freeze|${item}`),
  ])
  const close = useDebounceFn(
    (type: SettingsValue | 'cancel') => {
      if (type === 'cancel') onCancel()
      if (typeof type !== 'string') onSave(type)
    },
    { wait: 300 }
  )

  const onClose = () => {
    setVisible.setFalse()
    close.run('cancel')
  }

  const onFinish = () => {
    setVisible.setFalse()
    close.run({
      shows: values.reduce<string[]>((acc, item) => {
        if (typeof item === 'string' && item.startsWith('show|')) {
          acc.push(item.split('|')[1])
        }
        return acc
      }, []),
      freezes: values.reduce<string[]>((acc, item) => {
        if (typeof item === 'string' && item.startsWith('freeze|')) {
          acc.push(item.split('|')[1])
        }
        return acc
      }, []),
    })
  }

  return (
    <Modal
      closable={false}
      visible={visible}
      onCancel={onClose}
      style={{ top: '1rem' }}
      title={intl.formatMessage({ id: 'settings' })}
      footer={[
        <Button key="submit" type="primary" onClick={onFinish}>
          {intl.formatMessage({ id: 'save' })}
        </Button>,
        <Button key="close" onClick={onClose}>
          {intl.formatMessage({ id: 'close' })}
        </Button>,
      ]}
    >
      <Checkbox.Group value={values} onChange={setValues} className="w-100">
        <Table rowKey="key" pagination={false} dataSource={data}>
          <Table.Column<SettingsData>
            key="key"
            dataIndex="key"
            title={intl.formatMessage({ id: 'key' })}
            render={(_, record) => record.key && intl.formatMessage({ id: record.key })}
          />

          <Table.Column<SettingsData>
            key="isShow"
            dataIndex="isShow"
            title={intl.formatMessage({ id: 'is-show' })}
            render={(_, { key }) => <Checkbox key={key} value={`show|${key}`} />}
          />
          <Table.Column<SettingsData>
            key="isFreeze"
            dataIndex="isFreeze"
            title={intl.formatMessage({ id: 'is-freeze' })}
            render={(_, { key }) => <Checkbox key={key} value={`freeze|${key}`} />}
          />
        </Table>
      </Checkbox.Group>
    </Modal>
  )
}

export default Settings
