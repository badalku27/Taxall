"use client"

import { useState, useEffect } from "react"
import {
  FaBox,
  FaBook,
  FaBuilding,
  FaTag,
  FaUsers,
  FaChartBar,
  FaChevronDown,
  FaCalculator,
  FaBalanceScale,
  FaBars,
  FaTimes,
  FaFile,
} from "react-icons/fa"
import { FiLogIn } from "react-icons/fi"
import logo from "/assets/taxallnewww22n.png"
import IncomeTaxCalculator from "../incometaxcalculator/IncomeTaxCalculator"
import "./Header.css"
import { userAPI, documentAPI } from "../../APILinks"

const Header = () => {
  const token = localStorage.getItem("token")
  const isAuthenticated = Boolean(token)

  const [activeDropdown, setActiveDropdown] = useState(null)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConverterOpen, setIsConverterOpen] = useState(false)
  const [isSubscriptionOpen, setIsSubscriptionOpen] = useState(false)

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [username, setUsername] = useState("")
  const [profileImage, setProfileImage] = useState(null)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserDetails()
    }
  }, [isAuthenticated])

  useEffect(() => {
    const cachedProfileImage = localStorage.getItem("profileImage")
    if (cachedProfileImage) {
      setProfileImage(cachedProfileImage)
      setImageError(false)
    } else if (isAuthenticated) {
      fetchProfileImage()
    }
  }, [isAuthenticated])

  const fetchUserDetails = async () => {
    try {
      const email = localStorage.getItem("userEmail")
      if (!email || !token) return

      // Fetch user ID
      const idResponse = await userAPI.getUserIdByEmail(email)
      const userId = idResponse.data

      // Fetch user profile
      const profileResponse = await userAPI.getUserById(userId)
      const { firstname, lastname } = profileResponse.data
      const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)
      setUsername(`${cap(firstname)} ${cap(lastname)}`)

      // Attempt to fetch profile image
      fetchProfileImage()
    } catch (error) {
      console.error("Error fetching user details:", error)
    }
  }

  const fetchProfileImage = async () => {
    try {
      const response = await documentAPI.getProfileImage()
      const blob = new Blob([response.data], { type: "image/jpeg" })
      const imageUrl = URL.createObjectURL(blob)
      setProfileImage(imageUrl)
      setImageError(false)
      localStorage.setItem("profileImage", imageUrl) // Store in localStorage
    } catch (error) {
      console.error("Error fetching profile image:", error)
      setImageError(true)
      localStorage.removeItem("profileImage") // Remove from localStorage if fetch fails
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const getInitials = () => {
    return username
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
  }

  const authButton = isAuthenticated ? (
    <button
      className={`profile-button ${isMobile ? "mobile-profile" : "desktop-only"}`}
      onClick={() => {
        const role = localStorage.getItem("role") // Get the role from localStorage
        if (role === "ADMIN") {
          window.location.href = "/AdminDashboard"
        } else if (role === "USER") {
          window.location.href = "/profile"
        } else {
          console.error("Invalid role or role not found.")
        }
      }}
    >
      <div className="profile-avatar-container">
        {profileImage && !imageError ? (
          <img
            src={profileImage || "/placeholder.svg"}
            alt={username}
            className="profile-avatar"
            onError={() => {
              setImageError(true)
              localStorage.removeItem("profileImage")
            }}
          />
        ) : (
          <div className="profile-avatar initials-avatar">{getInitials()}</div>
        )}
      </div>
      <span className="profile-text">{username || "Profile"}</span>
    </button>
  ) : (
    <button
      className={`sign-in-button ${isMobile ? "mobile-sign-in" : "desktop-only"}`}
      onClick={() => (window.location.href = "/signin")}
    >
      <FiLogIn className="sign-in-icon" /> Sign In
    </button>
  )

  const handleMouseEnter = (menu) => setActiveDropdown(menu)
  const handleMouseLeave = () => setActiveDropdown(null)
  const toggleMobileMenu = () => setMobileMenu(!mobileMenu)
  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)
  const openConverter = () => setIsConverterOpen(true)
  const closeConverter = () => setIsConverterOpen(false)
  const toggleSubscription = () => setIsSubscriptionOpen(!isSubscriptionOpen)

  return (
    <>
      <header className="header">
        <div className="container">
          <h1 className="logo" id="logo" onClick={() => (window.location.href = "/")}>
            <img src={logo || "/placeholder.svg"} alt="Brand Logo" className="logo-img" />
          </h1>
          <div className="menu-icon" onClick={toggleMobileMenu}>
            {mobileMenu ? <FaTimes /> : <FaBars />}
          </div>
          <nav className={`nav ${mobileMenu ? "nav-active" : ""}`}>
            <ul className="nav-list">
              {/* Products Dropdown */}
              <li
                className="nav-item-container"
                onMouseEnter={() => handleMouseEnter("products")}
                onMouseLeave={handleMouseLeave}
              >
                <span className="nav-item">
                  <FaBox className="nav-icon" /> Products <FaChevronDown className="chevron-icon" />
                </span>
                {activeDropdown === "products" && (
                  <div className="dropdown">
                    <div className="dropdown-item" onClick={openModal}>
                      <FaCalculator className="icon" /> Income Tax Calculator
                    </div>
                    <div className="dropdown-item" onClick={openConverter}>
                      <FaFile className="icon" /> Taxall File Converter
                    </div>
                    <div className="dropdown-item">
                      <FaBalanceScale className="icon" /> Regulatory Compliance Hub
                    </div>
                  </div>
                )}
              </li>
              {/* Resources Dropdown */}
              <li
                className="nav-item-container"
                onMouseEnter={() => handleMouseEnter("resources")}
                onMouseLeave={handleMouseLeave}
              >
                <span className="nav-item">
                  <FaBook className="nav-icon" /> Resources <FaChevronDown className="chevron-icon" />
                </span>
                {activeDropdown === "resources" && (
                  <div className="dropdown">
                    <div className="dropdown-item">
                      <FaChartBar className="icon" /> Reports
                    </div>
                    <div className="dropdown-item">
                      <FaTag className="icon" /> Pricing Guide
                    </div>
                  </div>
                )}
              </li>
              {/* Company Dropdown */}
              <li
                className="nav-item-container"
                onMouseEnter={() => handleMouseEnter("company")}
                onMouseLeave={handleMouseLeave}
              >
                <span className="nav-item">
                  <FaBuilding className="nav-icon" /> Company <FaChevronDown className="chevron-icon" />
                </span>
                {activeDropdown === "company" && (
                  <div className="dropdown">
                    <div className="dropdown-item">
                      <FaUsers className="icon" /> About Us
                    </div>
                    <div className="dropdown-item">
                      <FaTag className="icon" /> Careers
                    </div>
                  </div>
                )}
              </li>
              {/* Render auth button inside navigation only for mobile */}
              {isMobile && <li className="nav-item auth-nav-item">{authButton}</li>}
            </ul>
          </nav>
          <div className="header-buttons">
            <button className="get-started" id="get-started" onClick={toggleSubscription}>
              Subscribe Us
            </button>
            {/* Render auth button in header (right side) only for desktop */}
            {!isMobile && authButton}
          </div>
        </div>
      </header>

      {/* Modal for Income Tax Calculator */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>
              &times;
            </button>
            <IncomeTaxCalculator />
          </div>
        </div>
      )}

      {/* Modal for File Converter */}
      {isConverterOpen && (
        <div className="modal-overlay" onClick={closeConverter}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeConverter}>
              &times;
            </button>
            {/* Uncomment and implement Converter if needed */}
            {/* <Converter /> */}
          </div>
        </div>
      )}
    </>
  )
}

export default Header

