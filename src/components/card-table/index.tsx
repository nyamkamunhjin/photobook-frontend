/* eslint @typescript-eslint/no-explicit-any: off */
/* eslint jsx-a11y/control-has-associated-label: off */
import {
  DeleteOutlined,
  EditOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  PlusOutlined,
  SettingOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import { useBoolean, useDebounceEffect } from 'ahooks'
import { Button, Card, Divider, Dropdown, message, Modal, Row, Space, Table } from 'antd'
import { ButtonType } from 'antd/lib/button'
import { CheckboxProps } from 'antd/lib/checkbox'
import { TableProps } from 'antd/lib/table'
import { TableRowSelection } from 'antd/lib/table/interface'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import Settings, { SettingsData, SettingsValue } from './settings'

interface ActionProps {
  title?: string
  disabled?: boolean
  type?: ButtonType
  icon?: React.ReactNode
  overlay?: React.ReactElement
  onClick: () => Promise<any> | any
}

type ChilrenDataType = [SettingsData[], React.ReactNode[]]

interface Props extends Omit<TableProps<any>, 'title'> {
  label?: string
  createProps?: ActionProps
  hoverable?: boolean
  bordered?: boolean
  type?: 'inner'
  title?: React.ReactNode
  tableTitle?: () => React.ReactNode
  onRowSelected?: (selectedRows: any[]) => void
  refresh?: () => void
  updateProps?: ActionProps
  deleteProps?: ActionProps
  extrasProps?: ActionProps[]
  hasExport?: boolean
  hasTableHeader?: boolean
  hasAllExtend?: boolean
  selectedKeys?: React.Key[]
  clickSelect?: boolean
  getCheckboxProps?: (record: any) => Partial<Omit<CheckboxProps, 'checked' | 'defaultChecked'>>
}

const CardTable: React.FC<Props> = ({
  label,
  createProps,
  deleteProps,
  updateProps,
  extrasProps,
  columns,
  type,
  loading,
  selectedKeys = [],
  onRowSelected,
  refresh,
  title,
  tableTitle,
  children,
  getCheckboxProps,
  rowKey = 'id',
  hoverable = false,
  bordered = false,
  hasExport = false,
  scroll = { x: 'max-content' },
  pagination,
  dataSource,
  hasTableHeader = true,
  clickSelect = true,
  hasAllExtend = false,
  ...props
}) => {
  let rowID = 'id'

  if (rowKey) {
    rowID = typeof rowKey === 'string' ? rowKey : (rowKey(dataSource ? dataSource[0] : {}, 0) as string)
  }

  const intl = useIntl()
  const [pdf] = useBoolean(false)
  const [excel] = useBoolean(false)
  const [settings, setSettings] = useBoolean(false)
  const [isShows, setIsShows] = useState<SettingsValue>({
    shows:
      (Array.isArray(children) &&
        children.reduce<string[]>((acc, item) => {
          if (Array.isArray(item)) {
            item.forEach((i) => {
              acc.push((i as any).key)
            })
          } else {
            acc.push((item as any).key)
          }
          return acc
        }, [])) ||
      [],
    freezes: [],
  })

  const [extendedRows, setExtendedRows] = useState<React.Key[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>(selectedKeys)
  const [, setSelectedRows] = useState<any[]>(
    selectedKeys.map((key) => (dataSource || []).find((item) => item[rowID] === key))
  )

  useEffect(() => {
    if (selectedKeys.length > 0) {
      setSelectedRowKeys(selectedKeys)
    }
  }, [selectedKeys])

  useEffect(() => {
    if (selectedKeys.length > 0) {
      setSelectedRows(selectedKeys.map((key) => (dataSource || []).find((item) => item[rowID] === key)))
    }
  }, [dataSource, rowID, selectedKeys])

  useDebounceEffect(
    () => {
      if (selectedKeys.length === 0) {
        if (onRowSelected) {
          onRowSelected([])
        }
        setSelectedRowKeys([])
      }
    },
    [loading],
    { wait: 10 }
  )

  const rowSelection: TableRowSelection<any> = {
    fixed: true,
    columnWidth: 50,
    selectedRowKeys,
    getCheckboxProps,
    onChange: (selectRowKeys, _selectedRows) => {
      if (onRowSelected) {
        onRowSelected(_selectedRows)
      }
      setSelectedRows(_selectedRows)
      setSelectedRowKeys(selectRowKeys)
    },
  }

  const renderTitle = () => {
    if (title) return title
    if (hasTableHeader) {
      return (
        <div>
          {label && (
            <>
              <strong style={{ fontSize: 16 }}>{label}</strong>
              <Divider className="my-2" />
            </>
          )}
          <Row justify="space-between">
            <Space>
              {createProps && !createProps.disabled && (
                <Button
                  size="small"
                  type="primary"
                  className="mb-0"
                  onClick={createProps.onClick}
                  disabled={createProps.disabled}
                  icon={createProps.icon || <PlusOutlined />}
                >
                  {createProps.title || intl.formatMessage({ id: 'create' })}
                </Button>
              )}
              {updateProps && !updateProps.disabled && (
                <Button
                  size="small"
                  className="mb-0"
                  type="primary"
                  onClick={updateProps.onClick}
                  disabled={updateProps.disabled}
                  icon={updateProps.icon || <EditOutlined />}
                  style={!updateProps.disabled ? { background: '#f6830f', borderColor: '#f6830f' } : undefined}
                >
                  {updateProps.title || intl.formatMessage({ id: 'update' })}
                </Button>
              )}
              {deleteProps && !deleteProps.disabled && (
                <Button
                  danger
                  type="primary"
                  size="small"
                  className="mb-0"
                  disabled={deleteProps.disabled}
                  icon={deleteProps.icon || <DeleteOutlined />}
                  onClick={() => {
                    Modal.confirm({
                      icon: <DeleteOutlined />,
                      title: intl.formatMessage({ id: 'delete-confirm-text' }),
                      okText: intl.formatMessage({ id: 'no' }),
                      okButtonProps: {
                        type: 'default',
                        size: 'small',
                        danger: false,
                      },
                      cancelText: intl.formatMessage({ id: 'true' }),
                      cancelButtonProps: {
                        type: 'primary',
                        size: 'small',
                        danger: true,
                      },
                      onCancel() {
                        return deleteProps.onClick()
                      },
                    })
                  }}
                >
                  {deleteProps.title || intl.formatMessage({ id: 'delete' })}
                </Button>
              )}
              {extrasProps?.map(
                (extra) =>
                  !extra.disabled && (
                    <>
                      <Divider type="vertical" />
                      {extra.overlay ? (
                        <Dropdown overlay={extra.overlay} trigger={['click']}>
                          <Button
                            size="small"
                            className="mb-0"
                            type={extra.type}
                            disabled={extra.disabled}
                            icon={extra.icon}
                            onClick={extra.onClick}
                          >
                            {extra.title}
                          </Button>
                        </Dropdown>
                      ) : (
                        <Button
                          size="small"
                          className="mb-0"
                          type={extra.type}
                          disabled={extra.disabled}
                          icon={extra.icon}
                          onClick={extra.onClick}
                        >
                          {extra.title}
                        </Button>
                      )}
                    </>
                  )
              )}
            </Space>
            <Space>
              {hasExport && (
                <>
                  <Button
                    loading={excel}
                    type="primary"
                    icon={<FileExcelOutlined />}
                    style={{ background: 'green', borderColor: 'green' }}
                    onClick={async () => {
                      if (!dataSource || dataSource?.length < 1) {
                        return message.warning('Хүснэгт хоосон байна')
                      }
                      if (Array.isArray(children)) {
                        // setExcel.setTrue()
                        // await exportXLSX(await exportRenderedJson(dataSource, children), label)
                        // setExcel.setFalse()
                        // return true
                      }
                      return message.warning('Энэ хүснэгтийг xlsx болгох боломжгүй байна')
                    }}
                  />
                  <Button
                    loading={pdf}
                    type="primary"
                    icon={<FilePdfOutlined />}
                    style={{ background: 'orange', borderColor: 'orange' }}
                    onClick={async () => {
                      if (!dataSource || dataSource?.length < 1) {
                        return message.warning('Хүснэгт хоосон байна')
                      }
                      if (Array.isArray(children)) {
                        // setPDF.setTrue()
                        // await exportPDF(await exportRenderedArray(dataSource, children), label)
                        // setPDF.setFalse()
                        // return true
                      }
                      return message.warning('Энэ хүснэгтийг pdf болгох боломжгүй байна')
                    }}
                  />
                </>
              )}
              {refresh && (
                <Button size="small" className="mb-0" icon={<SyncOutlined spin={!!loading} />} onClick={refresh} />
              )}
              <Button
                size="small"
                className="mb-0"
                icon={<SettingOutlined />}
                onClick={() => {
                  setSettings.setTrue()
                }}
              />
            </Space>
          </Row>
        </div>
      )
    }
    return undefined
  }

  if (pagination) {
    pagination.showSizeChanger = true
    pagination.showQuickJumper = true
    pagination.showTotal = (total) => (
      <>
        <strong>{intl.formatMessage({ id: 'total-page' })}: </strong> {total}
      </>
    )
  }

  const onClick = (record: any) => {
    setSelectedRowKeys((oldKeys) => {
      if (oldKeys.includes(record[rowID])) {
        setSelectedRows((oldRows) => {
          const tmp = oldRows.filter((r) => r[rowID] !== record[rowID])
          if (onRowSelected) onRowSelected(tmp)
          return tmp
        })
        return oldKeys.filter((k) => k !== record[rowID])
      }
      if (oldKeys.length > 0) {
        setSelectedRows((oldRows) => {
          const tmp = [...oldRows, record]
          if (onRowSelected) onRowSelected(tmp)
          return tmp
        })
        return [...oldKeys, record[rowID]]
      }
      setSelectedRows(() => {
        const tmp = [record]
        if (onRowSelected) onRowSelected(tmp)
        return tmp
      })
      return [record[rowID]]
    })
  }

  let childrenData: ChilrenDataType = [[], []]
  if (Array.isArray(children)) {
    childrenData = children.reduce<ChilrenDataType>((acc, item) => {
      const addAcc = (localItem: any) => {
        acc[0].push({ key: localItem.key })
        if (isShows.shows.includes(localItem.key)) {
          // TODO: Энэ дээр хийж чадахгүй байгаа
          // if (
          //   isShows?.freezes.includes(anyItem.key) &&
          //   anyItem.props.children &&
          //   anyItem.props.children.props &&
          //   anyItem.props.children.props.fixed !== undefined
          // ) {
          //   anyItem.props.children.props.fixed = true
          // }
          acc[1].push(localItem)
        }
      }
      const anyItem = item as any
      if (Array.isArray(anyItem)) {
        anyItem.forEach((aItem) => {
          addAcc(aItem)
        })
      } else {
        addAcc(anyItem)
      }
      return acc
    }, childrenData)
  }

  const isNotALL = extendedRows.length !== (dataSource?.length || 0)
  childrenData[1].unshift(
    <Table.Column
      width={hasAllExtend ? 46 : 20}
      key="index"
      title={
        hasAllExtend ? (
          <Space size="small" className="w-100">
            <button
              type="button"
              className={`ant-table-row-expand-icon ${isNotALL && 'ant-table-row-expand-icon-collapsed'}`}
              onClick={() => {
                if (isNotALL) {
                  setExtendedRows((dataSource || []).map((item) => item[rowID]))
                } else {
                  setExtendedRows([])
                }
              }}
            />
            №
          </Space>
        ) : (
          '№'
        )
      }
      render={(_a, _b, index) => {
        let total = 1
        if (pagination) {
          total += ((pagination as any).current - 1) * (pagination as any).pageSize
        }
        return total + index
      }}
    />
  )

  return (
    <Card hoverable={hoverable} bordered={bordered} type={type} title={renderTitle()}>
      <Table
        {...props}
        bordered
        id="dataTable"
        title={tableTitle}
        rowKey={rowKey}
        loading={loading}
        size="small"
        scroll={scroll}
        columns={columns}
        pagination={pagination}
        dataSource={dataSource}
        rowSelection={onRowSelected && rowSelection}
        onRow={(record) => {
          return {
            onClick: () => {
              if (clickSelect && record.is_checkable) onClick(record)
            },
          }
        }}
        expandable={{
          expandedRowKeys: extendedRows,
          onExpand: (extended, record) => {
            const rKey = typeof rowKey === 'string' ? rowKey : rowKey(record)
            setExtendedRows((old) => {
              if (record[rKey]) {
                if (extended) {
                  return [...old, record[rKey]]
                }
                return old.filter((oldKey) => oldKey !== record[rKey])
              }
              return old
            })
          },
        }}
      >
        {childrenData[1]}
      </Table>
      {settings && Array.isArray(children) && (
        <Settings
          defaultValues={isShows}
          data={childrenData[0]}
          onSave={(value) => {
            setIsShows(value)
            setSettings.setFalse()
          }}
          onCancel={setSettings.setFalse}
        />
      )}
    </Card>
  )
}

export default CardTable
