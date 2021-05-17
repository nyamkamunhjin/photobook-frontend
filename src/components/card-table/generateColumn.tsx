import { Divider, Form, Input, Space, Table } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'

interface Props<Type> {
  key: string
  name: string
  width: number
  sort?: boolean
  filter?: boolean
  hideFilter?: boolean
  title?: (placeholder: string) => React.ReactNode
  render?: (record: Type, index: number) => React.ReactNode
}

function useColumn<Type>({
  key,
  name,
  title,
  sort = false,
  filter = true,
  hideFilter = false,
  width,
  render,
}: Props<Type>): JSX.Element {
  const intl = useIntl()
  const label = intl.formatMessage({ id: key })

  return (
    <Table.Column<Type>
      key={key}
      sorter={sort}
      width={width}
      dataIndex={name}
      ellipsis={{ showTitle: true }}
      title={
        <Space direction="vertical" split={<Divider className="m-0" />} className="w-100">
          {label}
          {!hideFilter && (
            <Form.Item name={name} className="m-0">
              {title ? title(label) : <Input allowClear disabled={!filter} placeholder={label} />}
            </Form.Item>
          )}
        </Space>
      }
      onCell={() => ({
        style: { maxWidth: width },
      })}
      render={render ? (_, record, index) => render(record, index) : undefined}
    />
  )
}

function generateColumn<Type>(datas: Props<Type>[]): JSX.Element[] {
  return datas.map((data) => useColumn<Type>(data))
}

export default generateColumn
