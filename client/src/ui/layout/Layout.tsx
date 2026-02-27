import { Outlet } from "react-router-dom";
import TopBar from "../topbar/TopBar";
import "./Layout.css";

function Layout() {
  return (
    <div className="layout">
      <TopBar />
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
