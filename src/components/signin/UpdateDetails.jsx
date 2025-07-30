"use client"

import { useState, useEffect, useCallback } from "react"
import { TextField, Button, Typography, Avatar, CircularProgress } from "@mui/material"
import { Edit, Save, Send, CheckCircle } from "@mui/icons-material"
import axios from "axios"
import "./UpdateDetails.css"
import { useNavigate } from "react-router-dom"
import { userAPI, documentAPI, authAPI } from "../../APILinks"

export default function UpdateDetails() {
  const [userDetails, setUserDetails] = useState({
    firstname: "",
    lastname: "",
    location: "",
    email: "",
    mobilenumber: "",
    dateofbirth: "",
  })
  const [profileImage, setProfileImage] = useState(null)
  const [newEmail, setNewEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const token = localStorage.getItem("token")
  const userId = localStorage.getItem("userId")

  const navigate = useNavigate()

  const checkLoginStatus = useCallback(() => {
    if (!token) {
      console.log("No token found in localStorage")
      alert("You are not logged in. Please log in to continue.")
      navigate("/login")
      return false
    }

    try {
      const tokenData = JSON.parse(atob(token.split(".")[1]))
      console.log("Decoded token data:", tokenData)
      if (tokenData.exp * 1000 < Date.now()) {
        console.log("Token has expired")
        alert("Your session has expired. Please log in again.")
        navigate("/login")
        return false
      }
    } catch (error) {
      console.error("Error decoding token:", error)
      alert("Invalid token format. Please log in again.")
      navigate("/login")
      return false
    }

    return true
  }, [token, navigate])

  useEffect(() => {
    if (!checkLoginStatus()) return

    userAPI
      .getUserById(userId)
      .then((response) => {
        setUserDetails(response.data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching user details:", error)
        setError("Failed to fetch user details.")
        setLoading(false)
      })

    documentAPI
      .getProfileImage()
      .then((response) => {
        const blob = new Blob([response.data], { type: "image/jpeg" })
        setProfileImage(URL.createObjectURL(blob))
      })
      .catch((error) => {
        console.error("Error fetching profile image:", error)
        setProfileImage(null)
      })
  }, [token, userId, checkLoginStatus])

  const handleUpdate = () => {
    if (!checkLoginStatus()) return
    userAPI
      .updateUser(userId, userDetails)
      .then(() => alert("User details updated successfully!"))
      .catch((error) => {
        console.error("Error updating user details:", error)
        alert("Failed to update details.")
      })
  }

  const handleEmailUpdate = () => {
    if (!checkLoginStatus()) return
    userAPI
      .updateEmail(userId, newEmail)
      .then(() => alert("OTP sent to new email!"))
      .catch((error) => {
        console.error("Error sending OTP:", error)
        alert("Failed to send OTP.")
      })
  }

  const handleVerifyOtp = () => {
    if (!checkLoginStatus()) return
    userAPI
      .verifyEmailUpdate(userId, otp)
      .then((response) => {
        const newToken = response.data.token
        if (newToken) {
          localStorage.setItem("token", newToken)
          alert("Email updated successfully!")
        } else {
          alert("Email updated but no new token received.")
        }
      })
      .catch((error) => {
        console.error("Error verifying OTP:", error)
        alert("Invalid OTP.")
      })
  }

  const handleProfileImageChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!checkLoginStatus()) return

    console.log("File details:", {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      alert("Please select a JPG or PNG image file.")
      return
    }

    const localImageUrl = URL.createObjectURL(file)
    setProfileImage(localImageUrl)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("userId", userId)
    formData.append("documentName", "profile_image")
    formData.append("type", "PROFILE_IMAGE")

    setLoading(true)

    try {
      // First, try to get user details to check if the token is still valid
      await userAPI.getUserById(userId)

      // If the above request succeeds, proceed with image upload
      const response = await documentAPI.uploadDocument(formData)

      console.log("Upload response:", response)
      alert("Profile image updated successfully!")
    } catch (error) {
      console.error("Error:", error)
      if (error.response) {
        console.error("Error response:", error.response)
        console.error("Error response headers:", error.response.headers)
        console.error("Error response data:", error.response.data)
        switch (error.response.status) {
          case 401:
            alert("Your session has expired. Please log in again.")
            navigate("/login")
            break
          case 403:
            console.error("Forbidden error details:", error.response.data)
            alert(
              "You don't have permission to upload this image. This could be due to an expired session, insufficient privileges, or unsupported file type. Please try logging out and back in. If the problem persists, contact support.",
            )
            // Attempt to refresh the token
            const newToken = await refreshToken()
            if (newToken) {
              // Retry the upload with the new token
              await retryUpload(formData, newToken)
            }
            break
          case 415:
            alert("The server doesn't support this file type. Please try uploading a JPG file.")
            break
          default:
            alert(
              `An error occurred while uploading the image. Status: ${error.response.status}. Please try again later.`,
            )
        }
      } else if (error.request) {
        console.error("No response received:", error.request)
        alert("Network error. Please check your internet connection and try again.")
      } else {
        console.error("Error setting up request:", error.message)
        alert("An unexpected error occurred. Please try again later.")
      }
      revertProfileImage()
    } finally {
      setLoading(false)
    }
  }

  const refreshToken = async () => {
    try {
      const response = await authAPI.refreshToken()
      const newToken = response.data.token
      localStorage.setItem("token", newToken)
      return newToken
    } catch (error) {
      console.error("Error refreshing token:", error)
      alert("Unable to refresh your session. Please log in again.")
      navigate("/login")
      return null
    }
  }

  const retryUpload = async (formData, newToken) => {
    try {
      const response = await axios.post("http://localhost:9090/documents/upload", formData, {
        headers: {
          Authorization: `Bearer ${newToken}`,
          "Content-Type": "multipart/form-data",
        },
      })
      console.log("Retry upload response:", response)
      alert("Profile image updated successfully after token refresh!")
    } catch (error) {
      console.error("Error in retry upload:", error)
      alert("Failed to upload image even after refreshing the session. Please try again later.")
      revertProfileImage()
    }
  }

  const revertProfileImage = () => {
    documentAPI
      .getProfileImage()
      .then((response) => {
        const blob = new Blob([response.data], { type: "image/jpeg" })
        setProfileImage(URL.createObjectURL(blob))
      })
      .catch((error) => {
        console.error("Error reverting profile image:", error)
        setProfileImage(null)
      })
  }

  if (loading)
    return (
      <div className="loading-container">
        <CircularProgress className="loading-spinner" />
      </div>
    )

  if (error)
    return (
      <div className="error-container">
        <Typography color="error" className="error-message">
          {error}
        </Typography>
      </div>
    )

  return (
    <div className="update-details-container">
      <div className="update-details-wrapper">
        <div className="profile-header">
          <Typography variant="h4" className="page-title">
            Profile Settings
          </Typography>
          <div className="profile-image-section">
            <div className="avatar-container">
              {loading ? (
                <CircularProgress className="avatar-loading" />
              ) : profileImage ? (
                <Avatar src={profileImage} alt="Profile" className="profile-avatar" />
              ) : (
                <Avatar className="profile-avatar default-avatar">
                  {userDetails.firstname && userDetails.lastname
                    ? `${userDetails.firstname[0]}${userDetails.lastname[0]}`
                    : "U"}
                </Avatar>
              )}
              <div className="avatar-overlay">
                <label htmlFor="profile-image-upload" className="avatar-edit-icon">
                  <Edit className="edit-icon" />
                </label>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              className="file-input"
              id="profile-image-upload"
            />
            <Typography variant="body2" className="upload-hint">
              {loading ? "Uploading..." : "Click to change profile picture"}
            </Typography>
          </div>
        </div>

        <div className="form-container">
          <div className="form-section personal-info">
            <Typography variant="h6" className="section-title">
              Personal Information
            </Typography>
            <div className="form-row">
              <TextField
                label="First Name"
                value={userDetails.firstname}
                onChange={(e) => setUserDetails({ ...userDetails, firstname: e.target.value })}
                className="text-field half-width"
                variant="outlined"
              />
              <TextField
                label="Last Name"
                value={userDetails.lastname}
                onChange={(e) => setUserDetails({ ...userDetails, lastname: e.target.value })}
                className="text-field half-width"
                variant="outlined"
              />
            </div>
            <TextField
              fullWidth
              label="Location"
              value={userDetails.location || ""}
              onChange={(e) => setUserDetails({ ...userDetails, location: e.target.value })}
              className="text-field"
              variant="outlined"
              placeholder="Enter your address or location"
            />
            <div className="mobile-number-field">
              <TextField
                fullWidth
                label="Mobile Number"
                value={userDetails.mobilenumber || ""}
                onChange={(e) => {
                  // Allow only numbers and + symbol for country code
                  const value = e.target.value
                  if (value === "" || /^[+]?\d*$/.test(value)) {
                    setUserDetails({ ...userDetails, mobilenumber: value })
                  }
                }}
                className="text-field"
                variant="outlined"
                placeholder="+1 (123) 456-7890"
                helperText="Include country code (e.g., +1 for US, +44 for UK)"
              />
            </div>
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              value={userDetails.dateofbirth ? new Date(userDetails.dateofbirth).toISOString().split("T")[0] : ""}
              onChange={(e) => {
                // Send the date in yyyy-MM-dd format which Spring can parse by default
                setUserDetails({ ...userDetails, dateofbirth: e.target.value })
              }}
              className="text-field"
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdate}
              className="action-button update-button"
              startIcon={<Save />}
            >
              Save Changes
            </Button>
          </div>

          <div className="form-section email-section">
            <Typography variant="h6" className="section-title">
              Email Settings
            </Typography>
            <div className="current-email">
              <Typography variant="body2" className="email-label">
                Current Email
              </Typography>
              <Typography variant="body1" className="email-value">
                {userDetails.email || "No email set"}
              </Typography>
            </div>
            <TextField
              fullWidth
              label="New Email Address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="text-field"
              variant="outlined"
              placeholder="Enter your new email address"
            />
            <Button
              variant="outlined"
              color="primary"
              onClick={handleEmailUpdate}
              className="action-button email-button"
              disabled={!newEmail}
              startIcon={<Send />}
            >
              Send Verification Code
            </Button>

            <div className="otp-section">
              <TextField
                fullWidth
                label="Verification Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="text-field otp-field"
                variant="outlined"
                placeholder="Enter the 6-digit code"
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={handleVerifyOtp}
                className="action-button verify-button"
                disabled={!otp}
                startIcon={<CheckCircle />}
              >
                Verify & Update
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

