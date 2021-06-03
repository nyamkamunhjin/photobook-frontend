import { useRequest } from 'ahooks'
import { List, Popconfirm } from 'antd'
import React, { FC, useEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { createCartItem, deleteProject, listProject } from 'api'
import { Project, RootInterface } from 'interfaces'
import { useSelector } from 'react-redux'
import { useHistory } from 'react-router'
import { CustomButton } from 'components'

const MyProjects: FC = () => {
  const history = useHistory()
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
          dataSource={projects.data?.list}
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
                  onClick={() => history.push(`/editor?project=${item.uuid}`)}
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
                    <FormattedMessage id="delete" />
                  </CustomButton>
                </Popconfirm>,
                <CustomButton
                  className="btn-accept"
                  type="button"
                  onClick={() => {
                    if (user) {
                      createCartItem({
                        project: item.id,
                      }).then(() => {
                        history.push('/profile?tab=my_cart')
                      })
                    }
                  }}
                >
                  <FormattedMessage id="add_to_cart" />
                </CustomButton>,
              ]}
            >
              <div className="flex">
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
