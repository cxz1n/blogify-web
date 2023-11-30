import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Affix } from "antd";
import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "./layout.css";
const { Header, Sider, Content } = Layout;

const TheLayout: React.FC = () => {
  const navigate = useNavigate();
  const handleClickMenu = (e: any) => {
    navigate(e.key);
  };
  return (
    <Layout className="layout">
      <Layout className="site-layout">
        <Affix offsetTop={0}>
          <Header
            className="site-layout-background"
            style={{ padding: 0 }}
          ></Header>
        </Affix>
        <Content className="site-layout-background">
          <Outlet></Outlet>
        </Content>
      </Layout>
    </Layout>
  );
};

export default TheLayout;
