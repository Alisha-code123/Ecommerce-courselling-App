import React from "react";
import Sidebar from "./Sidebar";
 // adjust path if different
import "./common.css";
import Header from "../../components/header/Header";

const Layout = ({ children }) => {
  return (
    <div>
      <Header/>

      <div className="dashboard-admin">
        <Sidebar />
        
        <div className="content">
          {children}
        </div>

      </div>
    </div>
  );
};

export default Layout;
