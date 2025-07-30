"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ThumbsUp, Eye, ArrowLeft, Loader2, Calendar, User, Clock } from "lucide-react"
import "./BlogView.css"
import { blogAPI } from "../../APILinks"

const blogService = {
  getBlogById: async (id) => {
    const response = await blogAPI.getBlogById(id)
    return response.data
  },
  likeBlog: async (id, userId = "anonymous") => {
    const response = await blogAPI.likeBlog(id, userId)
    return response.data
  },
  incrementView: async (id) => {
    await blogAPI.incrementView(id)
  },
}

export default function BlogView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [blog, setBlog] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiking, setIsLiking] = useState(false)
  const [error, setError] = useState(null)
  const [imageErrors, setImageErrors] = useState({
    image1: false,
    image2: false,
    image3: false,
  })

  useEffect(() => {
    const fetchBlog = async () => {
      setIsLoading(true)
      try {
        const data = await blogService.getBlogById(id)
        setBlog(data)
        // Increment view count when blog is loaded
        await blogService.incrementView(id)
        // Optionally, re-fetch the blog to get updated view count:
        const updatedData = await blogService.getBlogById(id)
        setBlog(updatedData)
      } catch (error) {
        setError("Failed to load blog. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchBlog()
  }, [id])

  const handleLike = async () => {
    if (isLiking) return
    setIsLiking(true)
    try {
      const userId = `user_${Math.floor(Math.random() * 10000)}`
      const updatedBlog = await blogService.likeBlog(id, userId)
      setBlog(updatedBlog)
    } catch (error) {
      console.error("Failed to like blog:", error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleImageError = (imageKey) => {
    setImageErrors((prev) => ({
      ...prev,
      [imageKey]: true,
    }))
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const goBack = () => {
    navigate(-1)
  }

  if (isLoading) {
    return (
      <div className="blog-view-loading">
        <Loader2 className="loading-spinner" />
        <p>Loading blog...</p>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="blog-view-error">
        <h2>Error</h2>
        <p>{error || "Blog not found"}</p>
        <button onClick={goBack} className="back-button">
          <ArrowLeft className="button-icon" /> Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="blog-view-container">
      <button onClick={goBack} className="back-button">
        <ArrowLeft className="button-icon" /> Back to Blogs
      </button>
      <article className="blog-content">
        <header className="blog-header">
          <h1 className="blog-heading">{blog.heading}</h1>
          <div className="blog-meta">
            <div className="blog-author">
              <User className="meta-icon" />
              <span>
                By <span className="author-name">{blog.author}</span>
              </span>
            </div>
            <div className="blog-date">
              <Calendar className="meta-icon" />
              <span>{formatDate(blog.postingDate)}</span>
              {blog.postingDate && (
                <>
                  <Clock className="meta-icon time-icon" />
                  <span>{formatTime(blog.postingDate)}</span>
                </>
              )}
            </div>
            <div className="blog-stats">
              <div className="stat-item">
                <Eye className="meta-icon" />
                <span>{blog.views || 0} views</span>
              </div>
              <div className="stat-item">
                <ThumbsUp className="meta-icon" />
                <span>{blog.likedBy?.length || 0} likes</span>
              </div>
            </div>
          </div>
        </header>
        <div className="blog-sections">
          {/* Render sections similarly, with images and descriptions */}
          {blog.image1 && !imageErrors.image1 && (
            <div className="blog-image-container">
              <img
                src={blog.image1 || "/placeholder.svg"}
                alt={`${blog.heading} - image 1`}
                className="blog-image"
                onError={() => handleImageError("image1")}
              />
            </div>
          )}
          {blog.description1 && (
            <div className="blog-description">
              {blog.description1
                .split("\n")
                .map((paragraph, index) => (paragraph.trim() ? <p key={index}>{paragraph}</p> : <br key={index} />))}
            </div>
          )}
          {/* Add similar sections for image2/description2 and image3/description3 */}
        </div>
        <footer className="blog-footer">
          <button className={`like-button ${isLiking ? "liking" : ""}`} onClick={handleLike} disabled={isLiking}>
            <ThumbsUp className="button-icon" />
            <span>{isLiking ? "Liking..." : "Like"}</span>
          </button>
        </footer>
      </article>
    </div>
  )
}

