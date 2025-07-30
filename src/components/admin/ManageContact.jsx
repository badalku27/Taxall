"use client"

import { useState, useEffect } from "react"
import { Eye, Search, Loader2, AlertTriangle, Calendar, Mail, Phone, MessageSquare, Check, X } from "lucide-react"
import "./ManageContact.css"
import { contactAPI } from "../../APILinks"

// API service for contact operations
// Remove this entire object
// const contactService = { ... }

export default function ManageContact() {
  const [contacts, setContacts] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedContact, setSelectedContact] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [toast, setToast] = useState({ show: false, title: "", message: "", type: "" })

  // Load contacts on component mount and when page changes
  useEffect(() => {
    fetchContacts()
  }, [currentPage, pageSize])

  // Hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const fetchContacts = async () => {
    setIsLoading(true)
    try {
      const response = await contactAPI.getAllContacts(currentPage, pageSize)
      const data = response.data
      setContacts(data.content)
      setTotalPages(data.totalPages)
      setTotalElements(data.totalElements)
      setError(null)
    } catch (error) {
      setError("Failed to load contacts. Please try again.")
      showToast("Error", "Failed to load contacts. Please try again.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const showToast = (title, message, type) => {
    setToast({ show: true, title, message, type })
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage)
  }

  const handleViewContact = async (id) => {
    try {
      const response = await contactAPI.getContactById(id)
      const contact = response.data
      setSelectedContact(contact)
      setIsDetailModalOpen(true)

      // If contact is not seen, mark it as seen
      if (!contact.seen) {
        try {
          await contactAPI.markAsSeen(id, true)
          // Update the contact in the list
          setContacts((prevContacts) => prevContacts.map((c) => (c.id === id ? { ...c, seen: true } : c)))
          showToast("Success", "Contact marked as read", "success")
        } catch (seenError) {
          console.error("Failed to mark contact as seen:", seenError)
          showToast("Warning", "Contact opened but couldn't update read status", "error")
        }
      }
    } catch (error) {
      console.error("Failed to load contact details:", error)
      showToast("Error", "Failed to load contact details", "error")
    }
  }

  const closeDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedContact(null)
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="contacts-container">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-header">{toast.title}</div>
          <div className="toast-message">{toast.message}</div>
        </div>
      )}

      {/* Header with actions */}
      <div className="action-header">
        <h2 className="section-title">Contact Management</h2>
        <div className="action-controls">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search contacts..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-card-header">
            <h3 className="stats-card-title">Total Contacts</h3>
            <p className="stats-card-description">Number of contact submissions</p>
          </div>
          <div className="stats-card-content">
            <p className="stats-value">{totalElements}</p>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <h3 className="stats-card-title">Unread Messages</h3>
            <p className="stats-card-description">Contacts not yet viewed</p>
          </div>
          <div className="stats-card-content">
            <p className="stats-value">{contacts.filter((contact) => !contact.seen).length}</p>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      {isLoading ? (
        <div className="loading-container">
          <Loader2 className="loading-spinner" />
          <p>Loading contacts...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <AlertTriangle className="error-icon" />
          <p>{error}</p>
        </div>
      ) : contacts.length === 0 ? (
        <div className="empty-state">
          <MessageSquare className="empty-icon" />
          <p className="empty-title">No contacts found</p>
          <p className="empty-description">There are no contact submissions yet</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="contacts-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => (
                <tr key={contact.id} className={contact.seen ? "" : "unread-row"}>
                  <td>
                    <div className="status-indicator">
                      {contact.seen ? <Check className="seen-icon" /> : <div className="unread-badge">New</div>}
                    </div>
                  </td>
                  <td className="contact-name">{contact.name}</td>
                  <td>{contact.email}</td>
                  <td className="contact-subject">{contact.subject}</td>
                  <td>
                    <div className="date-container">
                      <Calendar className="date-icon" />
                      <span>{formatDate(contact.createdAt)}</span>
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="action-buttons">
                      <button
                        className="action-button view"
                        onClick={() => handleViewContact(contact.id)}
                        title="View Contact"
                      >
                        <Eye className="action-icon" />
                        <span className="action-text">View</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            className="pagination-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            Previous
          </button>
          <div className="pagination-info">
            Page {currentPage + 1} of {totalPages}
          </div>
          <button
            className="pagination-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
          >
            Next
          </button>
        </div>
      )}

      {/* Contact Detail Modal */}
      {isDetailModalOpen && selectedContact && (
        <div className="dialog-overlay">
          <div className="dialog-content contact-detail-dialog">
            <div className="dialog-header">
              <h2 className="dialog-title">Contact Details</h2>
              <button className="dialog-close" onClick={closeDetailModal}>
                <X className="close-icon" />
              </button>
            </div>

            <div className="contact-detail-content">
              <div className="contact-detail-section">
                <h3 className="contact-detail-section-title">Sender Information</h3>
                <div className="contact-detail-field">
                  <div className="contact-detail-label">
                    <span className="label-icon-wrapper">
                      <User className="label-icon" />
                    </span>
                    <span>Name</span>
                  </div>
                  <div className="contact-detail-value">{selectedContact.name}</div>
                </div>

                <div className="contact-detail-field">
                  <div className="contact-detail-label">
                    <span className="label-icon-wrapper">
                      <Mail className="label-icon" />
                    </span>
                    <span>Email</span>
                  </div>
                  <div className="contact-detail-value">{selectedContact.email}</div>
                </div>

                <div className="contact-detail-field">
                  <div className="contact-detail-label">
                    <span className="label-icon-wrapper">
                      <Phone className="label-icon" />
                    </span>
                    <span>Mobile</span>
                  </div>
                  <div className="contact-detail-value">{selectedContact.mobile || "Not provided"}</div>
                </div>

                <div className="contact-detail-field">
                  <div className="contact-detail-label">
                    <span className="label-icon-wrapper">
                      <Calendar className="label-icon" />
                    </span>
                    <span>Date Submitted</span>
                  </div>
                  <div className="contact-detail-value">{formatDate(selectedContact.createdAt)}</div>
                </div>
              </div>

              <div className="contact-detail-section">
                <h3 className="contact-detail-section-title">Message</h3>
                <div className="contact-detail-field">
                  <div className="contact-detail-label">
                    <span className="label-icon-wrapper">
                      <MessageSquare className="label-icon" />
                    </span>
                    <span>Subject</span>
                  </div>
                  <div className="contact-detail-value subject">{selectedContact.subject}</div>
                </div>

                <div className="message-content">
                  <p>{selectedContact.message}</p>
                </div>
              </div>
            </div>

            <div className="dialog-footer">
              <button type="button" className="cancel-button" onClick={closeDetailModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function User(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

