"use client"

import { useState } from "react"
import { FileText, Home, PenSquare, CreditCard, User, Menu, LogOut } from "lucide-react"
import UserDetails from "./UserDetails"
import UpdateDetails from "./UpdateDetails"
import Documents from "./Documents"
import Subscription from "./Subscription"
import "./UserDashboard.css"
import { useNavigate } from "react-router-dom"

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState("UserDetails")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("role")

    // Redirect to login page
    navigate("/")
  }

  const tabs = [
    { id: "UserDetails", label: "User Details", icon: User },
    { id: "UpdateDetails", label: "Update Details", icon: PenSquare },
    { id: "Documents", label: "Documents", icon: FileText },
    { id: "Subscription", label: "Subscription", icon: CreditCard },
    { id: "Logout", label: "Logout", icon: LogOut, onClick: handleLogout },
  ]

  const renderComponent = () => {
    switch (activeTab) {
      case "UserDetails":
        return <UserDetails />
      case "UpdateDetails":
        return <UpdateDetails />
      case "Documents":
        return <Documents />
      case "Subscription":
        return <Subscription />
      default:
        return <UserDetails />
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="d-main">
      <div className="dashboard">
        <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
          <div className="sidebar-header">
            <Home className="logo-icon" />
            <span className="logo-text">User Dashboard</span>
          </div>
          <nav className="sidebar-menu">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`nav-item-1 ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => {
                  if (tab.onClick) {
                    tab.onClick()
                  } else {
                    setActiveTab(tab.id)
                    setIsSidebarOpen(false)
                  }
                }}
              >
                <tab.icon className="nav-icon" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="main-content">
          <header className="content-header">
            <button className="mobile-menu-trigger" onClick={toggleSidebar}>
              <Menu />
            </button>
            <h1>{tabs.find((tab) => tab.id === activeTab)?.label}</h1>
          </header>
          <div className="content-body">{renderComponent()}</div>
        </main>
      </div>
    </div>
  )
}

