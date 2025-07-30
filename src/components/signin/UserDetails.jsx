"use client"

import { useEffect, useState } from "react"
import "./UserDetails.css"
import { userAPI, documentAPI } from "../../APILinks"

export default function UserDetails() {
  const [userDetails, setUserDetails] = useState(null)
  const [profileImage, setProfileImage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userId = localStorage.getItem("userId")

    if (!token || !userId) {
      setError("Authentication failed. Please log in.")
      setLoading(false)
      return
    }

    // Fetch user details
    userAPI
      .getUserById(userId)
      .then((response) => {
        setUserDetails(response.data)
        setLoading(false)
      })
      .catch((error) => {
        setError("Failed to fetch user details.")
        setLoading(false)
      })

    // Fetch profile image
    documentAPI
      .getProfileImage()
      .then((response) => {
        const blob = new Blob([response.data], { type: "image/jpeg" })
        setProfileImage(URL.createObjectURL(blob))
      })
      .catch(() => {
        setProfileImage(null)
      })
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    )
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div className="profile-container">
      <div className="profile-background">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-image-container">
            {profileImage ? (
              <img src={profileImage || "/placeholder.svg"} alt="Profile" className="profile-image" />
            ) : (
              <div className="profile-image-placeholder">
                {userDetails?.firstname?.charAt(0)}
                {userDetails?.lastname?.charAt(0)}
              </div>
            )}
          </div>
          <h1 className="profile-title">User Profile</h1>
          {userDetails?.firstname && userDetails?.lastname && (
            <p className="profile-name">
              {userDetails.firstname} {userDetails.lastname}
            </p>
          )}
        </div>

        <div className="profile-content">
          <div className="profile-info-grid">
            <div className="info-item">
              <span className="info-label">First Name</span>
              <span className="info-value">{userDetails?.firstname}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Last Name</span>
              <span className="info-value">{userDetails?.lastname}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Location</span>
              <span className="info-value">{userDetails?.location}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{userDetails?.email}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Mobile Number</span>
              <span className="info-value">{userDetails?.mobilenumber}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Date of Birth</span>
              <span className="info-value">
                {userDetails?.dateofbirth && new Date(userDetails.dateofbirth).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

