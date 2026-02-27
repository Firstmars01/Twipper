import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "../ui/Layout";
import Home from "../pages/home/Home";
import Login from "../pages/login/Login";
import Register from "../pages/register/Register";
import Profile from "../pages/Profile/Profile";
import Page404 from "../pages/Page404/Page404";


function Root() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="*" element={<Page404 />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default Root