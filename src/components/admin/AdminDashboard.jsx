"use client"

import { useState } from "react"
import { FileText, Home, PenSquare, CreditCard, User, Menu, Contact2 } from "lucide-react"
import ManageUsers from "./ManageUsers"
import ManageBlogs from "./ManageBlogs"
import Subscription from "../signin/Subscription"
import "./AdminDashboard.css"
import ManageContact from "./ManageContact"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("UserDetails")
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const tabs = [
    { id: "UserDetails", label: "User Details", icon: User },
    { id: "Blogs", label: "Blogs", icon: FileText },
    { id: "Contacts", label: "Contacts", icon: Contact2 },
    { id: "Subscription", label: "Subscription", icon: CreditCard },
  ]

  const renderComponent = () => {
    switch (activeTab) {
      case "UserDetails":
        return <ManageUsers />
      case "Blogs":
        return <ManageBlogs />
      case "Contacts":
        return <ManageContact />
      case "Subscription":
        return <Subscription />
      default:
        return <ManageUsers />
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
          <span className="logo-text">Admin Dashboard</span>
        </div>
        <nav className="sidebar-menu">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-item-1 ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id)
                setIsSidebarOpen(false)
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

