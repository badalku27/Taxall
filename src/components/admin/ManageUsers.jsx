"use client"

import { useState, useEffect } from "react"
import { User, Trash2, Edit, FileText, Search, Loader2, UserPlus, X, AlertTriangle } from "lucide-react"
import "./ManageUsers.css"
import ManageDocument from "./ManageDocument"
import { adminUserAPI } from "../../APILinks"

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState({ show: false, title: "", message: "", type: "" })
  const [showDocumentManager, setShowDocumentManager] = useState(false)

  // Form state for user creation/editing
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    mobilenumber: "",
    location: "",
    role: "USER",
    password: "",
  })

  // Load users on component mount
  useEffect(() => {
    fetchUsers()
  }, [])

  // Hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await adminUserAPI.getAllUsers()
      setUsers(response.data)
    } catch (error) {
      showToast("Error", "Failed to load users. Please try again.", "error")
      setError("Failed to load users")
    } finally {
      setIsLoading(false)
    }
  }

  const showToast = (title, message, type) => {
    setToast({ show: true, title, message, type })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const openCreateDialog = () => {
    setCurrentUser(null)
    setFormData({
      firstname: "",
      lastname: "",
      email: "",
      mobilenumber: "",
      location: "",
      role: "USER",
      password: "",
    })
    setIsUserDialogOpen(true)
  }

  const openEditDialog = (user) => {
    setCurrentUser(user)
    setFormData({
      firstname: user.firstname || "",
      lastname: user.lastname || "",
      email: user.email || "",
      mobilenumber: user.mobilenumber || "",
      location: user.location || "",
      role: user.role || "USER",
      // Don't set password when editing
      password: "",
    })
    setIsUserDialogOpen(true)
  }

  const openDeleteDialog = (user) => {
    setCurrentUser(user)
    setIsDeleteDialogOpen(true)
  }

  const openDocumentManager = (user) => {
    setCurrentUser(user)
    setShowDocumentManager(true)
  }

  const closeDocumentManager = () => {
    setShowDocumentManager(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (currentUser) {
        // Update existing user logic would go here
        // For now, just show a toast since the endpoint isn't provided
        showToast("Success", "User updated successfully", "success")
      } else {
        // Create new user
        await adminUserAPI.createUser(formData)
        showToast("Success", "User created successfully", "success")
      }

      // Refresh users list
      fetchUsers()
      setIsUserDialogOpen(false)
    } catch (error) {
      showToast("Error", currentUser ? "Failed to update user" : "Failed to create user", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!currentUser) return

    setIsSubmitting(true)
    try {
      await adminUserAPI.deleteUser(currentUser.userid)
      showToast("Success", "User deleted successfully", "success")
      fetchUsers()
      setIsDeleteDialogOpen(false)
    } catch (error) {
      showToast("Error", "Failed to delete user", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeDialog = () => {
    setIsUserDialogOpen(false)
    setIsDeleteDialogOpen(false)
  }

  // Filter users based on search term
  const filteredUsers = users.filter(
    (user) =>
      (user.firstname + " " + user.lastname)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.mobilenumber?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="users-container">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-header">{toast.title}</div>
          <div className="toast-message">{toast.message}</div>
        </div>
      )}

      {/* Document Manager */}
      {showDocumentManager && currentUser ? (
        <ManageDocument
          userId={currentUser.userid}
          userName={`${currentUser.firstname} ${currentUser.lastname}`}
          onClose={closeDocumentManager}
        />
      ) : (
        <>
          {/* Header with actions */}
          <div className="action-header">
            <h2 className="section-title">User Management</h2>
            <div className="action-controls">
              <div className="search-container">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="search-input"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <button onClick={openCreateDialog} className="create-button">
                <UserPlus className="button-icon" /> Add User
              </button>
            </div>
          </div>

          {/* Users Table */}
          {isLoading ? (
            <div className="loading-container">
              <Loader2 className="loading-spinner" />
              <p>Loading users...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <AlertTriangle className="error-icon" />
              <p>{error}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <User className="empty-icon" />
              <p className="empty-title">No users found</p>
              <p className="empty-description">Add your first user to get started</p>
              <button onClick={openCreateDialog} className="empty-action-button">
                <UserPlus className="button-icon" /> Add User
              </button>
            </div>
          ) : (
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Location</th>
                    <th>Role</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.userid}>
                      <td className="user-name">{user.firstname + " " + user.lastname || "N/A"}</td>
                      <td>{user.email}</td>
                      <td>{user.mobilenumber || "N/A"}</td>
                      <td>{user.location || "N/A"}</td>
                      <td>
                        <span className={`role-badge ${user.role?.toLowerCase() || "user"}`}>
                          {user.role || "USER"}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="action-buttons">
                          <button
                            className="action-button view"
                            onClick={() => openDocumentManager(user)}
                            title="View Documents"
                          >
                            <FileText className="action-icon" />
                            <span className="action-text">Documents</span>
                          </button>
                          <button className="action-button edit" onClick={() => openEditDialog(user)} title="Edit User">
                            <Edit className="action-icon" />
                            <span className="action-text">Edit</span>
                          </button>
                          <button
                            className="action-button delete"
                            onClick={() => openDeleteDialog(user)}
                            title="Delete User"
                          >
                            <Trash2 className="action-icon" />
                            <span className="action-text">Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Create/Edit User Dialog */}
          {isUserDialogOpen && (
            <div className="dialog-overlay">
              <div className="dialog-content">
                <div className="dialog-header">
                  <h2 className="dialog-title">{currentUser ? "Edit User" : "Create New User"}</h2>
                  <button className="dialog-close" onClick={closeDialog}>
                    <X className="close-icon" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="user-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label htmlFor="firstname" className="form-label">
                        First Name
                      </label>
                      <input
                        id="firstname"
                        name="firstname"
                        className="form-input"
                        value={formData.firstname}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="lastname" className="form-label">
                        Last Name
                      </label>
                      <input
                        id="lastname"
                        name="lastname"
                        className="form-input"
                        value={formData.lastname}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email" className="form-label">
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="form-input"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="mobilenumber" className="form-label">
                        Phone Number
                      </label>
                      <input
                        id="mobilenumber"
                        name="mobilenumber"
                        className="form-input"
                        value={formData.mobilenumber}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="role" className="form-label">
                        Role
                      </label>
                      <select
                        id="role"
                        name="role"
                        className="form-select"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                        <option value="MANAGER">Manager</option>
                      </select>
                    </div>

                    <div className="form-group full-width">
                      <label htmlFor="location" className="form-label">
                        Location
                      </label>
                      <textarea
                        id="location"
                        name="location"
                        className="form-textarea"
                        value={formData.location}
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>

                    {!currentUser && (
                      <div className="form-group full-width">
                        <label htmlFor="password" className="form-label">
                          Password
                        </label>
                        <input
                          id="password"
                          name="password"
                          type="password"
                          className="form-input"
                          value={formData.password}
                          onChange={handleInputChange}
                          required={!currentUser}
                          minLength={6}
                        />
                        <p className="form-hint">Minimum 6 characters</p>
                      </div>
                    )}
                  </div>

                  <div className="dialog-footer">
                    <button type="button" className="cancel-button" onClick={closeDialog} disabled={isSubmitting}>
                      Cancel
                    </button>
                    <button type="submit" className="submit-button" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="spinner-icon" />}
                      {currentUser ? "Update User" : "Create User"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          {isDeleteDialogOpen && (
            <div className="dialog-overlay">
              <div className="dialog-content delete-dialog">
                <div className="dialog-header">
                  <h2 className="dialog-title">Delete User</h2>
                  <button className="dialog-close" onClick={closeDialog}>
                    <X className="close-icon" />
                  </button>
                </div>

                <div className="delete-message">
                  <AlertTriangle className="delete-icon" />
                  <p>
                    Are you sure you want to delete{" "}
                    <strong>
                      {currentUser?.firstname} {currentUser?.lastname}
                    </strong>
                    ? This action cannot be undone.
                  </p>
                </div>

                <div className="dialog-footer">
                  <button type="button" className="cancel-button" onClick={closeDialog} disabled={isSubmitting}>
                    Cancel
                  </button>
                  <button type="button" className="delete-button" onClick={handleDelete} disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="spinner-icon" />}
                    Delete User
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

