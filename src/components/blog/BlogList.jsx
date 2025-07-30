"use client"

import { useState, useEffect, useRef } from "react"
import { Eye, Heart, Calendar, ArrowRight, Loader2, Search, ImageOff, ChevronUp, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import "./BlogList.css"
import { blogAPI } from "../../APILinks"

// API service for blog operations
const blogService = {
  getAllBlogs: async () => {
    try {
      const response = await blogAPI.getAllBlogs()
      return response.data
    } catch (error) {
      console.error("Error fetching blogs:", error)
      throw error
    }
  },
}

export default function BlogList() {
  const [blogs, setBlogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [imageErrors, setImageErrors] = useState({})
  const [visibleBlogs, setVisibleBlogs] = useState(6)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const navigate = useNavigate()
  const topRef = useRef(null)

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true)
      try {
        const data = await blogService.getAllBlogs()
        setBlogs(data || [])
      } catch (error) {
        setError("Failed to load blogs. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleImageError = (blogId, imageKey) => {
    setImageErrors((prev) => ({
      ...prev,
      [`${blogId}-${imageKey}`]: true,
    }))
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getReadingTime = (text) => {
    const wordCount = text ? text.split(/\s+/).length : 0
    const readingTime = Math.ceil(wordCount / 200)
    return readingTime > 0 ? `${readingTime} min read` : "Quick read"
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setVisibleBlogs(6) // Reset visible blogs when searching
  }

  const clearSearch = () => {
    setSearchTerm("")
    setVisibleBlogs(6)
  }

  const navigateToBlog = (blogId) => {
    navigate(`/blogview/${blogId}`)
  }

  const loadMoreBlogs = () => {
    setIsLoadingMore(true)
    // Simulate loading delay
    setTimeout(() => {
      setVisibleBlogs((prev) => prev + 6)
      setIsLoadingMore(false)
    }, 600)
  }

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Filter blogs based on search term
  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.heading?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.description1?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Add reading time to each blog
  const blogsWithReadingTime = filteredBlogs.map((blog) => {
    const allContent = [blog.description1 || "", blog.description2 || "", blog.description3 || ""].join(" ")
    return {
      ...blog,
      readingTime: getReadingTime(allContent),
    }
  })

  // Get visible blogs
  const currentBlogs = blogsWithReadingTime.slice(0, visibleBlogs)
  const hasMoreBlogs = visibleBlogs < blogsWithReadingTime.length
  const remainingBlogs = blogsWithReadingTime.length - visibleBlogs

  if (isLoading) {
    return (
      <div className="blogs-loading">
        <Loader2 className="loading-spinner" />
        <p>Loading blogs...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="blogs-error">
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="blogs-container" ref={topRef}>
      <div className="blogs-header">
        <h1 className="blogs-title">Our Blog</h1>
        <p className="blogs-subtitle">Discover the latest insights, tutorials, and updates</p>

        <div className="search-wrapper">
          <div className="search-box">
            <div className="search-icon-wrapper">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            {searchTerm && (
              <button className="search-clear-btn" onClick={clearSearch} aria-label="Clear search">
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {blogsWithReadingTime.length === 0 ? (
        <div className="empty-state">
          <h2>No matching blogs</h2>
          <p>Try adjusting your search criteria</p>
        </div>
      ) : (
        <>
          <div className="blogs-grid">
            {currentBlogs.map((blog) => (
              <div key={blog.id} className="blog-card" onClick={() => navigateToBlog(blog.id)}>
                <div className="blog-card-image-container">
                  {blog.image1 && !imageErrors[`${blog.id}-image1`] ? (
                    <img
                      src={blog.image1 || "/placeholder.svg"}
                      alt={blog.heading}
                      className="blog-card-image"
                      onError={() => handleImageError(blog.id, "image1")}
                    />
                  ) : (
                    <div className="blog-card-image-placeholder">
                      <ImageOff className="placeholder-icon" />
                    </div>
                  )}
                </div>

                <div className="blog-card-content">
                  <h2 className="blog-card-title">{blog.heading}</h2>

                  <div className="blog-card-meta">
                    <div className="blog-card-author">
                      <div className="author-avatar">{blog.author?.charAt(0).toUpperCase() || "A"}</div>
                      <span>{blog.author}</span>
                    </div>

                    <div className="blog-card-date">
                      <Calendar className="meta-icon" />
                      <span>{formatDate(blog.postingDate)}</span>
                    </div>
                  </div>

                  <p className="blog-card-excerpt">
                    {blog.description1?.substring(0, 120)}
                    {blog.description1?.length > 120 ? "..." : ""}
                  </p>

                  <div className="blog-card-footer">
                    <div className="blog-card-stats">
                      <div className="stat-item">
                        <Eye className="stat-icon" />
                        <span>{blog.views || 0}</span>
                      </div>
                      <div className="stat-item">
                        <Heart className="stat-icon" />
                        <span>{blog.likedBy?.length || 0}</span>
                      </div>
                      <div className="reading-time">{blog.readingTime}</div>
                    </div>

                    <button className="read-more-button">
                      Read More <ArrowRight className="arrow-icon" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMoreBlogs && (
            <div className="load-more-container">
              <button className="load-more-button" onClick={loadMoreBlogs} disabled={isLoadingMore}>
                {isLoadingMore ? (
                  <>
                    <Loader2 className="load-more-spinner" />
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <span>Load More Blogs</span>
                    {remainingBlogs > 0 && <span className="load-more-count">{remainingBlogs} more to show</span>}
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {showScrollTop && (
        <button className="scroll-top-button" onClick={scrollToTop} aria-label="Scroll to top">
          <ChevronUp />
        </button>
      )}
    </div>
  )
}

