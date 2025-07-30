"use client"

import { useState, useEffect, useRef } from "react"
import { PenSquare, Trash2, Eye, ThumbsUp, Plus, Loader2, ImageIcon, Search, Upload } from "lucide-react"
import "./ManageBlogs.css"
import { blogAPI } from "../../APILinks" // Import the blog API functions

export default function ManageBlogs() {
  const [blogs, setBlogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentBlog, setCurrentBlog] = useState(null)
  const [stats, setStats] = useState({ totalViews: 0, totalBlogs: 0 })
  const [toast, setToast] = useState({ show: false, title: "", message: "", type: "" })
  const [searchTerm, setSearchTerm] = useState("")
  const [removedImages, setRemovedImages] = useState({
    image1: false,
    image2: false,
    image3: false,
  })

  // Refs for file inputs
  const image1Ref = useRef(null)
  const image2Ref = useRef(null)
  const image3Ref = useRef(null)

  // State for image previews
  const [imagePreviews, setImagePreviews] = useState({
    image1: null,
    image2: null,
    image3: null,
  })

  // State for image files
  const [imageFiles, setImageFiles] = useState({
    image1: null,
    image2: null,
    image3: null,
  })

  // Form state aligned with backend entity
  const [formData, setFormData] = useState({
    heading: "",
    author: "",
    image1: "",
    image2: "",
    image3: "",
    description1: "",
    description2: "",
    description3: "",
  })

  // Load blogs on component mount
  useEffect(() => {
    fetchBlogs()
    fetchStats()
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

  const fetchBlogs = async () => {
    setIsLoading(true)
    try {
      const response = await blogAPI.getAllBlogs()
      setBlogs(response.data)
    } catch (error) {
      showToast("Error", "Failed to load blogs. Please try again.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await blogAPI.getTotalStats()
      setStats(data)
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  const showToast = (title, message, type) => {
    setToast({ show: true, title, message, type })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const { name, files } = e.target
    if (files && files[0]) {
      const file = files[0]

      // Update image files state
      setImageFiles((prev) => ({
        ...prev,
        [name]: file,
      }))

      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setImagePreviews((prev) => ({
        ...prev,
        [name]: previewUrl,
      }))

      // If editing, clear the URL field since we're uploading a new image
      if (currentBlog) {
        setFormData((prev) => ({
          ...prev,
          [name]: "",
        }))
      }
    }
  }

  const triggerImageUpload = (inputRef) => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  // Update the openCreateDialog function to reset the removedImages state
  const openCreateDialog = () => {
    setCurrentBlog(null)
    setFormData({
      heading: "",
      author: "",
      image1: "",
      image2: "",
      image3: "",
      description1: "",
      description2: "",
      description3: "",
    })
    // Reset image previews and files
    setImagePreviews({
      image1: null,
      image2: null,
      image3: null,
    })
    setImageFiles({
      image1: null,
      image2: null,
      image3: null,
    })
    // Reset removed images state
    setRemovedImages({
      image1: false,
      image2: false,
      image3: false,
    })
    setIsDialogOpen(true)
  }

  // Update the openEditDialog function to reset the removedImages state
  const openEditDialog = (blog) => {
    setCurrentBlog(blog)
    setFormData({
      heading: blog.heading || "",
      author: blog.author || "",
      image1: blog.image1 || "",
      image2: blog.image2 || "",
      image3: blog.image3 || "",
      description1: blog.description1 || "",
      description2: blog.description2 || "",
      description3: blog.description3 || "",
    })
    // Set image previews from existing URLs
    setImagePreviews({
      image1: blog.image1 || null,
      image2: blog.image2 || null,
      image3: blog.image3 || null,
    })
    // Reset image files
    setImageFiles({
      image1: null,
      image2: null,
      image3: null,
    })
    // Reset removed images state
    setRemovedImages({
      image1: false,
      image2: false,
      image3: false,
    })
    setIsDialogOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let result

      if (currentBlog) {
        // Create remove flags object based on image changes
        const removeFlags = {
          removeImage1: currentBlog.image1 && !formData.image1 && !imageFiles.image1,
          removeImage2: currentBlog.image2 && !formData.image2 && !imageFiles.image2,
          removeImage3: currentBlog.image3 && !formData.image3 && !imageFiles.image3,
        }

        // Update existing blog with images
        await blogAPI.updateBlog(currentBlog.id, formData, imageFiles, removeFlags)
        showToast("Success", "Blog updated successfully", "success")
      } else {
        // Create new blog with images
        await blogAPI.createBlog(formData, imageFiles)
        showToast("Success", "Blog created successfully", "success")
      }

      // Refresh blogs list
      fetchBlogs()
      fetchStats()
      setIsDialogOpen(false)
    } catch (error) {
      showToast("Error", currentBlog ? "Failed to update blog" : "Failed to create blog", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this blog?")) return

    try {
      await blogAPI.deleteBlog(id)
      showToast("Success", "Blog deleted successfully", "success")
      fetchBlogs()
      fetchStats()
    } catch (error) {
      showToast("Error", "Failed to delete blog", "error")
    }
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.heading?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleRemoveImage = (imageName) => {
    // Update removed images state
    setRemovedImages((prev) => ({
      ...prev,
      [imageName]: true,
    }))

    // Clear the image preview
    setImagePreviews((prev) => ({
      ...prev,
      [imageName]: null,
    }))

    // Clear the form data image URL
    setFormData((prev) => ({
      ...prev,
      [imageName]: "",
    }))

    // Clear any selected file
    setImageFiles((prev) => ({
      ...prev,
      [imageName]: null,
    }))
  }

  return (
    <div className="blogs-container">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-header">{toast.title}</div>
          <div className="toast-message">{toast.message}</div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="stats-card-header">
            <h3 className="stats-card-title">Total Blogs</h3>
            <p className="stats-card-description">Number of published blogs</p>
          </div>
          <div className="stats-card-content">
            <p className="stats-value">{stats.totalBlogs}</p>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-header">
            <h3 className="stats-card-title">Total Views</h3>
            <p className="stats-card-description">Across all blogs</p>
          </div>
          <div className="stats-card-content">
            <p className="stats-value">{stats.totalViews}</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="action-header">
        <h2 className="section-title">Blog Management</h2>
        <div className="action-controls">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search blogs..."
              className="search-input"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          <button onClick={openCreateDialog} className="create-button">
            <Plus className="button-icon" /> Create Blog
          </button>
        </div>
      </div>

      {/* Blogs Table */}
      {isLoading ? (
        <div className="loading-container">
          <Loader2 className="loading-spinner" />
        </div>
      ) : blogs.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">No blogs found</p>
          <p className="empty-description">Create your first blog to get started</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="blogs-table">
            <thead>
              <tr>
                <th>Heading</th>
                <th>Author</th>
                <th>Posted Date</th>
                <th className="text-center">Views</th>
                <th className="text-center">Likes</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBlogs.map((blog) => (
                <tr key={blog.id}>
                  <td className="blog-title">{blog.heading}</td>
                  <td>{blog.author}</td>
                  <td>{formatDate(blog.postingDate)}</td>
                  <td className="text-center">
                    <div className="stat-value">
                      <Eye className="stat-icon" />
                      {blog.views || 0}
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="stat-value">
                      <ThumbsUp className="stat-icon" />
                      {blog.likedBy?.length || 0}
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="action-buttons">
                      <button
                        className="action-button view"
                        onClick={() => (window.location.href = `/blogview/${blog.id}`)}
                        title="View Blog"
                      >
                        <Eye className="action-icon" />
                        <span className="action-text">View</span>
                      </button>
                      <button className="action-button edit" onClick={() => openEditDialog(blog)} title="Edit Blog">
                        <PenSquare className="action-icon" />
                        <span className="action-text">Edit</span>
                      </button>
                      <button
                        className="action-button delete"
                        onClick={() => handleDelete(blog.id)}
                        title="Delete Blog"
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

      {/* Create/Edit Blog Dialog */}
      {isDialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog-content">
            <div className="dialog-header">
              <h2 className="dialog-title">{currentBlog ? "Edit Blog" : "Create New Blog"}</h2>
              <p className="dialog-description">
                {currentBlog ? "Make changes to the blog post here." : "Fill in the details to create a new blog post."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="blog-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="heading" className="form-label">
                    Heading
                  </label>
                  <input
                    id="heading"
                    name="heading"
                    className="form-input"
                    value={formData.heading}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="author" className="form-label">
                    Author
                  </label>
                  <input
                    id="author"
                    name="author"
                    className="form-input"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Image Upload Fields */}
                <div className="form-group">
                  <label className="form-label">
                    <ImageIcon className="form-label-icon" /> Image 1
                  </label>
                  <div className="image-upload-container">
                    <input
                      type="file"
                      ref={image1Ref}
                      name="image1"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file-input"
                    />
                    <div className="image-actions">
                      <button type="button" className="upload-button" onClick={() => triggerImageUpload(image1Ref)}>
                        <Upload className="upload-icon" />
                        Upload Image
                      </button>
                      {(imagePreviews.image1 || (currentBlog && formData.image1)) && (
                        <button type="button" className="remove-button" onClick={() => handleRemoveImage("image1")}>
                          <Trash2 className="remove-icon" />
                          Remove
                        </button>
                      )}
                    </div>
                    {imagePreviews.image1 && (
                      <div className="image-preview-container">
                        <img src={imagePreviews.image1 || "/placeholder.svg"} alt="Preview" className="image-preview" />
                      </div>
                    )}
                    {!imagePreviews.image1 && currentBlog && formData.image1 && !removedImages.image1 && (
                      <div className="image-preview-container">
                        <img
                          src={formData.image1 || "/placeholder.svg"}
                          alt="Current image"
                          className="image-preview"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <ImageIcon className="form-label-icon" /> Image 2
                  </label>
                  <div className="image-upload-container">
                    <input
                      type="file"
                      ref={image2Ref}
                      name="image2"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file-input"
                    />
                    <div className="image-actions">
                      <button type="button" className="upload-button" onClick={() => triggerImageUpload(image2Ref)}>
                        <Upload className="upload-icon" />
                        Upload Image
                      </button>
                      {(imagePreviews.image2 || (currentBlog && formData.image2)) && (
                        <button type="button" className="remove-button" onClick={() => handleRemoveImage("image2")}>
                          <Trash2 className="remove-icon" />
                          Remove
                        </button>
                      )}
                    </div>
                    {imagePreviews.image2 && (
                      <div className="image-preview-container">
                        <img src={imagePreviews.image2 || "/placeholder.svg"} alt="Preview" className="image-preview" />
                      </div>
                    )}
                    {!imagePreviews.image2 && currentBlog && formData.image2 && !removedImages.image2 && (
                      <div className="image-preview-container">
                        <img
                          src={formData.image2 || "/placeholder.svg"}
                          alt="Current image"
                          className="image-preview"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <ImageIcon className="form-label-icon" /> Image 3
                  </label>
                  <div className="image-upload-container">
                    <input
                      type="file"
                      ref={image3Ref}
                      name="image3"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file-input"
                    />
                    <div className="image-actions">
                      <button type="button" className="upload-button" onClick={() => triggerImageUpload(image3Ref)}>
                        <Upload className="upload-icon" />
                        Upload Image
                      </button>
                      {(imagePreviews.image3 || (currentBlog && formData.image3)) && (
                        <button type="button" className="remove-button" onClick={() => handleRemoveImage("image3")}>
                          <Trash2 className="remove-icon" />
                          Remove
                        </button>
                      )}
                    </div>
                    {imagePreviews.image3 && (
                      <div className="image-preview-container">
                        <img src={imagePreviews.image3 || "/placeholder.svg"} alt="Preview" className="image-preview" />
                      </div>
                    )}
                    {!imagePreviews.image3 && currentBlog && formData.image3 && !removedImages.image3 && (
                      <div className="image-preview-container">
                        <img
                          src={formData.image3 || "/placeholder.svg"}
                          alt="Current image"
                          className="image-preview"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description1" className="form-label">
                    Description 1
                  </label>
                  <textarea
                    id="description1"
                    name="description1"
                    className="form-textarea"
                    value={formData.description1}
                    onChange={handleInputChange}
                    rows={5}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description2" className="form-label">
                    Description 2
                  </label>
                  <textarea
                    id="description2"
                    name="description2"
                    className="form-textarea"
                    value={formData.description2}
                    onChange={handleInputChange}
                    rows={5}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="description3" className="form-label">
                    Description 3
                  </label>
                  <textarea
                    id="description3"
                    name="description3"
                    className="form-textarea"
                    value={formData.description3}
                    onChange={handleInputChange}
                    rows={5}
                  />
                </div>
              </div>

              <div className="dialog-footer">
                <button type="button" className="cancel-button" onClick={closeDialog} disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="spinner-icon" />}
                  {currentBlog ? "Update Blog" : "Create Blog"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

