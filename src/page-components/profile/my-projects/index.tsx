import { useRequest } from 'ahooks'
import { List, message, Popconfirm } from 'antd'
import React, { FC, useEffect } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { createCartItem, deleteProject, listProject } from 'api'
import { Project, RootInterface } from 'interfaces'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import { CustomButton } from 'components'

const MyProjects: FC = () => {
  const history = useHistory()
  const intl = useIntl()
  const user = useSelector((state: RootInterface) => state.auth.user)
  const projects = useRequest(
    ({ current, pageSize }, { userId }, pageNumber) => listProject({ current, pageSize }, { userId }, pageNumber),
    {
      manual: true,
      paginated: true,
    }
  )

  useEffect(() => {
    if (user?.id) {
      projects.run(
        { current: projects.pagination.current, pageSize: projects.pagination.pageSize },
        { userId: user.id.toString() },
        (projects.pagination.current - 1) * projects.pagination.pageSize
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  return (
    <div className="p-2">
      <span className="font-semibold text-xl">
        <FormattedMessage id="my_projects" />
      </span>
      <div>
        <List
          itemLayout="horizontal"
          dataSource={projects.data?.list || []}
          loading={projects.loading}
          pagination={{
            ...projects.pagination,
            onChange: projects.pagination.changeCurrent,
          }}
          renderItem={(item: Project) => (
            <List.Item
              className="flex flex-col items-start lg:flex-row gap-4 rounded p-2 hover:bg-gray-50"
              key={item.id}
              actions={[
                <button
                  className="btn-primary"
                  type="button"
                  onClick={() => {
                    if (item.templateType?.name === 'photobook') {
                      history.push(`/editor?project=${item.uuid}`)
                    } else if (item.templateType?.name === 'canvas') {
                      if (item.canvasType === 'Split') {
                        history.push(`/editor/canvas/split?project=${item.uuid}`)
                      } else {
                        history.push(`/editor/canvas?project=${item.uuid}`)
                      }
                    } else if (item.templateType?.name === 'frame') {
                      history.push(`/editor/frame?project=${item.uuid}`)
                    } else if (item.templateType?.name === 'photoprint') {
                      history.push(`/editor/photoprint?project=${item.uuid}`)
                    }
                  }}
                >
                  <FormattedMessage id="edit" />
                </button>,
                <Popconfirm
                  title={<FormattedMessage id="delete-confirm-text" />}
                  onConfirm={() => {
                    deleteProject({
                      ids: [item.id],
                    }).then(() => {
                      projects.refresh()
                    })
                  }}
                  okText={<FormattedMessage id="yes" />}
                  cancelText={<FormattedMessage id="no" />}
                >
                  <CustomButton className="btn-cancel" type="button">
                    <FormattedMessage id="remove" />
                  </CustomButton>
                </Popconfirm>,
                <CustomButton
                  className="btn-accept"
                  type="button"
                  onClick={() => {
                    if (user) {
                      createCartItem({
                        project: item.id,
                      }).then((res) => {
                        if (res) message.success(intl.formatMessage({ id: 'added_to_cart' }))
                      })
                    }
                  }}
                >
                  <FormattedMessage id="add_to_cart" />
                </CustomButton>,
              ]}
            >
              <div className="flex gap-2">
                <img
                  className="w-28 h-28 rounded"
                  src={`${process.env.REACT_APP_PUBLIC_IMAGE}${item.imageUrl}`}
                  alt="project"
                />
                <div className="flex flex-col">
                  <span className="font-semibold text-base">
                    {item.name} <span className="font-light text-sm text-gray-500">({item.templateType?.name})</span>
                  </span>
                  <p>{item.description}</p>
                </div>
              </div>
            </List.Item>
          )}
        />
      </div>
    </div>
  )
}

export default MyProjects
