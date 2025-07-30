"use client"

import { useState, useEffect, useRef } from "react"
import {
  FileText,
  Search,
  Loader2,
  X,
  AlertTriangle,
  Download,
  Edit,
  Trash2,
  Filter,
  Calendar,
  FileSymlink,
} from "lucide-react"
import "./ManageDocument.css"
import { documentAPI } from "../../APILinks"


export default function ManageDocument({ userId, userName, onClose }) {
  const [documents, setDocuments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [documentTypeFilter, setDocumentTypeFilter] = useState("all")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentDocument, setCurrentDocument] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState({ show: false, title: "", message: "", type: "" })
  const downloadLinkRef = useRef(null)

  const [formData, setFormData] = useState({
    documentName: "",
    documentType: "",
  })

  useEffect(() => {
    fetchDocuments()
  }, [userId])

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const fetchDocuments = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await documentAPI.getAdminUserDocuments(userId)
      setDocuments(response.data)
    } catch (error) {
      showToast("Error", "Failed to load documents. Please try again.", "error")
      setError("Failed to load documents")
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

  const handleDocumentTypeFilter = (e) => {
    setDocumentTypeFilter(e.target.value)
  }

  const openEditDialog = (document) => {
    setCurrentDocument(document)
    setFormData({
      documentName: document.documentName || "",
      documentType: document.documentType || "",
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (document) => {
    setCurrentDocument(document)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!currentDocument) return

    setIsSubmitting(true)
    try {
      await documentAPI.updateAdminDocument(currentDocument.documentId, formData.documentName, formData.documentType)
      await fetchDocuments()
      showToast("Success", "Document updated successfully", "success")
      setIsEditDialogOpen(false)
    } catch (error) {
      showToast("Error", "Failed to update document", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!currentDocument) return

    setIsSubmitting(true)
    try {
      await documentAPI.deleteAdminDocument(currentDocument.documentId)
      await fetchDocuments()
      showToast("Success", "Document deleted successfully", "success")
      setIsDeleteDialogOpen(false)
    } catch (error) {
      showToast("Error", "Failed to delete document", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDownload = async (document) => {
    try {
      const response = await documentAPI.downloadAdminDocument(document.documentId)
      const blob = response.data
      const fileName = response.headers.get("Content-Disposition")?.split("filename=")[1] || "document"

      const url = URL.createObjectURL(blob)

      // Trigger the download
      const link = downloadLinkRef.current
      link.href = url
      link.download = fileName
      link.click()

      // Release the object URL
      URL.revokeObjectURL(url)
    } catch (error) {
      showToast("Error", "Failed to download document. Please try again.", "error")
    }
  }

  const closeDialog = () => {
    setIsEditDialogOpen(false)
    setIsDeleteDialogOpen(false)
  }

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.documentName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = documentTypeFilter === "all" || documentTypeFilter === doc.documentType
    return matchesSearch && matchesType
  })

  return (
    <div className="document-manager">
      {/* Hidden download link for documents */}
      <a ref={downloadLinkRef} style={{ display: "none" }} />

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-header">{toast.title}</div>
          <div className="toast-message">{toast.message}</div>
        </div>
      )}

      {/* Header with actions */}
      <div className="document-header">
        <div className="header-title">
          <h2 className="section-title">Documents for {userName}</h2>
          <button className="close-button" onClick={onClose}>
            <X className="close-icon" />
          </button>
        </div>
        <div className="filter-controls">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search documents..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <div className="filter-container">
            <Filter className="filter-icon" />
            <select className="filter-select" value={documentTypeFilter} onChange={handleDocumentTypeFilter}>
              <option value="all">All Types</option>
              <option value="PROFILE_IMAGE">Profile Images</option>
              <option value="DOCUMENT">Documents</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      {isLoading ? (
        <div className="loading-container">
          <Loader2 className="loading-spinner" />
          <p>Loading documents...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <AlertTriangle className="error-icon" />
          <p>{error}</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="empty-state">
          <FileText className="empty-icon" />
          <p className="empty-title">No documents found</p>
          <p className="empty-description">This user has no documents uploaded yet</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="documents-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Upload Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocuments.map((document) => (
                <tr key={document.documentId} className="document-row">
                  <td className="document-name">
                    <div className="document-name-container">
                      <FileSymlink className="document-icon" />
                      <span>{document.documentName}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`document-type-badge ${document.documentType?.toLowerCase()}`}>
                      {document.documentType || "Document"}
                    </span>
                  </td>
                  <td>{formatFileSize(document.size)}</td>
                  <td>
                    <div className="date-container">
                      <Calendar className="date-icon" />
                      <span>{formatDate(document.uploadedOn)}</span>
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="document-actions">
                      <button
                        className="document-action download"
                        title="Download Document"
                        onClick={() => handleDownload(document)}
                      >
                        <Download className="action-icon" />
                      </button>
                      <button
                        className="document-action edit"
                        title="Edit Document"
                        onClick={() => openEditDialog(document)}
                      >
                        <Edit className="action-icon" />
                      </button>
                      <button
                        className="document-action delete"
                        title="Delete Document"
                        onClick={() => openDeleteDialog(document)}
                      >
                        <Trash2 className="action-icon" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Document Dialog */}
      {isEditDialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <div className="dialog-header">
              <h2 className="dialog-title">Edit Document</h2>
              <button className="dialog-close" onClick={closeDialog}>
                <X className="close-icon" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="document-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="documentName" className="form-label">
                    Document Name
                  </label>
                  <input
                    id="documentName"
                    name="documentName"
                    className="form-input"
                    value={formData.documentName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="documentType" className="form-label">
                    Document Type
                  </label>
                  <select
                    id="documentType"
                    name="documentType"
                    className="form-select"
                    value={formData.documentType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="DOCUMENT">Document</option>
                    <option value="PROFILE_IMAGE">Profile Image</option>
                  </select>
                </div>
              </div>

              <div className="dialog-footer">
                <button type="button" className="cancel-button" onClick={closeDialog} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="spinner-icon" />}
                  Update Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Document Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog-content delete-dialog">
            <div className="dialog-header">
              <h2 className="dialog-title">Delete Document</h2>
              <button className="dialog-close" onClick={closeDialog}>
                <X className="close-icon" />
              </button>
            </div>

            <div className="delete-message">
              <AlertTriangle className="delete-icon" />
              <p>
                Are you sure you want to delete <strong>{currentDocument?.documentName}</strong>? This action cannot be
                undone.
              </p>
            </div>

            <div className="dialog-footer">
              <button type="button" className="cancel-button" onClick={closeDialog} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="button" className="delete-button" onClick={handleDelete} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="spinner-icon" />}
                Delete Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper function to format file size
function formatFileSize(bytes) {
  if (!bytes) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Helper function to format date
function formatDate(dateString) {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

