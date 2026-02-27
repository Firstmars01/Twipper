import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../ui/layout/Layout";
import Home from "../pages/home/Home";
import Login from "../pages/login/Login";
import Register from "../pages/register/Register";
import Profile from "../pages/profile/Profile";
import Page404 from "../pages/page404/Page404";
import ProtectedRoute from "./ProtectedRoute";


function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
            <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Home />} />
                <Route path="/profile/:username" element={<Profile />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Page404 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default Root