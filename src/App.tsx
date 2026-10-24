import { Navigate, Route, Routes } from "react-router";
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Newsfeed from "./pages/Newsfeed/Newsfeed";
import PostDetails from "./pages/PostDetails/PostDetails";
import Profile from "./pages/Profile/Profile";
import Notification from "./pages/Notification/Notification";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/feed" element={<Newsfeed />} />
          <Route path="/postDetails/:postId" element={<PostDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/notifications" element={<Notification />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/feed" replace />} />
    </Routes>
  );
}

export default App;
