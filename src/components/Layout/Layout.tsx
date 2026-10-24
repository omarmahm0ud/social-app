import { Outlet } from "react-router";
import Navbar from "../Navbar/Navbar";

export default function Layout() {
  return (
    <div className="min-h-screen bg-sec">
      <Navbar />
      <Outlet />
    </div>
  );
}
