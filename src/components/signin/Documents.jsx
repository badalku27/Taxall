"use client"

import { useEffect, useState, useRef } from "react"
import { documentAPI } from "../../APILinks"

import {
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Alert,
  LinearProgress,
  Box,
} from "@mui/material"
import {
  Delete as DeleteIcon,
  CloudDownload as DownloadIcon,
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Close as CloseIcon,
} from "@mui/icons-material"
import "./Documents.css"

export default function Documents() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [file, setFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)

  const token = localStorage.getItem("token")
  const userId = localStorage.getItem("userId")

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = () => {
    setLoading(true)
    documentAPI
      .getUserDocuments()
      .then((response) => {
        setDocuments(response.data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching documents:", error)
        setError(`Failed to fetch documents: ${error.message}`)
        setLoading(false)
      })
  }

  const handleDelete = (documentId) => {
    const documentElement = document.getElementById(`document-${documentId}`)
    if (documentElement) {
      documentElement.classList.add("deleting")
    }

    documentAPI
      .deleteDocument(documentId, userId, "DOCUMENT")
      .then(() => {
        // Refresh the documents list after a short delay
        setTimeout(() => {
          fetchDocuments()
        }, 300)
      })
      .catch((error) => {
        console.error("Error deleting document:", error)
        if (documentElement) {
          documentElement.classList.remove("deleting")
        }
        setError(`Failed to delete document: ${error.response?.data?.message || error.message}`)
      })
  }

  const handleDownload = (documentId, documentName) => {
    if (!documentId) {
      setError("Invalid document ID for download.")
      return
    }

    const documentElement = document.getElementById(`document-${documentId}`)
    if (documentElement) {
      documentElement.classList.add("downloading")
    }

    documentAPI
      .downloadDocument(documentId)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const a = document.createElement("a")
        a.href = url
        a.download = documentName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        if (documentElement) {
          documentElement.classList.remove("downloading")
          setTimeout(() => {
            documentElement.classList.remove("downloading")
          }, 500)
        }
      })
      .catch((error) => {
        console.error("Error downloading document:", error)
        if (documentElement) {
          documentElement.classList.remove("downloading")
        }
        setError(`Failed to download document: ${error.response?.status === 403 ? "Access denied" : error.message}`)
      })
  }

  const handleUpload = () => {
    if (!file) return

    setUploading(true)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("userId", userId)
    formData.append("documentName", file.name)
    formData.append("type", "DOCUMENT")

    documentAPI
      .uploadDocument(formData)
      .then(() => {
        setUploading(false)
        setFile(null)
        fetchDocuments()
      })
      .catch((error) => {
        console.error("Error uploading file:", error)
        setUploading(false)
        setError("Failed to upload file.")
      })
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const clearFile = (e) => {
    e.stopPropagation() // Prevent triggering the parent click event
    setFile(null)
  }

  const getFileIcon = (fileType) => {
    if (fileType && fileType.toLowerCase().includes("pdf")) {
      return <PdfIcon className="file-icon pdf" />
    }
    return <FileIcon className="file-icon" />
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B"
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB"
    else return (bytes / 1048576).toFixed(2) + " MB"
  }

  return (
    <div className="documents-container">
      <Card className="documents-card">
        <CardContent>
          <Typography variant="h4" className="documents-title">
            My Documents
          </Typography>

          {error && (
            <Alert
              severity="error"
              className="error-alert"
              action={
                <IconButton aria-label="close" color="inherit" size="small" onClick={() => setError(null)}>
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {error}
            </Alert>
          )}

          <div
            className={`upload-area ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current && fileInputRef.current.click()}
          >
            {!file ? (
              <>
                <div className="upload-icon">
                  <UploadIcon fontSize="large" />
                </div>
                <Typography className="upload-text">
                  <span className="desktop-text">Drag & drop files here or click to browse</span>
                  <span className="mobile-text">Tap to upload files</span>
                </Typography>
                <input
                  type="file"
                  ref={fileInputRef}
                  id="file-upload"
                  className="file-input"
                  onChange={handleFileChange}
                />
                <Button variant="outlined" className="browse-button">
                  Browse Files
                </Button>
              </>
            ) : (
              <div className="selected-file">
                <div className="file-preview">
                  {getFileIcon(file.type)}
                  <div className="file-details">
                    <Typography className="file-name">{file.name}</Typography>
                    <Typography className="file-size">{formatFileSize(file.size)}</Typography>
                  </div>
                </div>
                <div className="file-actions">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="upload-button"
                    startIcon={<UploadIcon />}
                  >
                    {uploading ? "Uploading..." : "Upload File"}
                  </Button>
                  <IconButton color="error" className="remove-file" onClick={clearFile} aria-label="Remove file">
                    <CloseIcon />
                  </IconButton>
                </div>
              </div>
            )}
          </div>

          {uploading && (
            <div className="upload-progress">
              <LinearProgress variant="determinate" value={uploadProgress} className="progress-bar" />
              <Typography className="progress-text">{uploadProgress}% uploaded</Typography>
            </div>
          )}

          {loading ? (
            <div className="loading-container">
              <CircularProgress size={40} />
              <Typography style={{ marginTop: "1rem" }}>Loading documents...</Typography>
            </div>
          ) : documents.length === 0 ? (
            <div className="empty-state">
              <FileIcon style={{ fontSize: 48 }} />
              <Typography variant="h6">No documents found</Typography>
              <Typography className="empty-description">Upload your first document to get started</Typography>
            </div>
          ) : (
            <div className="responsive-table-wrapper">
              <TableContainer component={Paper} className="table-container">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Typography variant="subtitle2">Document</Typography>
                      </TableCell>
                      <TableCell className="hide-on-mobile">
                        <Typography variant="subtitle2">Size</Typography>
                      </TableCell>
                      <TableCell className="hide-on-mobile">
                        <Typography variant="subtitle2">Type</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle2">Actions</Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.documentId} id={`document-${doc.documentId}`}>
                        <TableCell className="document-name">
                          <Box display="flex" alignItems="center">
                            {getFileIcon(doc.documentType)}
                            <Typography className="doc-name-text">{doc.documentName}</Typography>
                          </Box>
                          <div className="mobile-meta">
                            <Typography className="mobile-size">{formatFileSize(doc.size)}</Typography>
                            <Typography className="mobile-type">{doc.documentType}</Typography>
                          </div>
                        </TableCell>
                        <TableCell className="hide-on-mobile">{formatFileSize(doc.size)}</TableCell>
                        <TableCell className="hide-on-mobile">{doc.documentType}</TableCell>
                        <TableCell align="right">
                          <div className="action-buttons">
                            <IconButton
                              color="primary"
                              onClick={() => handleDownload(doc.documentId, doc.documentName)}
                              className="action-button download"
                              aria-label="Download document"
                            >
                              <DownloadIcon />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDelete(doc.documentId)}
                              className="action-button delete"
                              aria-label="Delete document"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

