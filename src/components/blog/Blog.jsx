"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Loader2, ArrowRight } from "lucide-react"
import "./Blog.css"
import { blogAPI } from "../../APILinks"

// API service for blog operations (same as in BlogList.jsx)
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

const Blog = () => {
  const [latestBlogs, setLatestBlogs] = useState([])
  const [moreBlogs, setMoreBlogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true)
      try {
        const data = await blogService.getAllBlogs()

        // Sort blogs by posting date (newest first)
        const sortedBlogs = data.sort((a, b) => {
          return new Date(b.postingDate) - new Date(a.postingDate)
        })

        // Get 3 latest blogs for the Latest Blog section
        setLatestBlogs(sortedBlogs.slice(0, 3))

        // Get next 5 blogs for the More Blogs section
        setMoreBlogs(sortedBlogs.slice(3, 8))
      } catch (error) {
        setError("Failed to load blogs. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlogs()
  }, [])

  const handleImageError = (e) => {
    // Use a more reliable default image URL
    e.target.src = "https://placehold.co/600x400/gray/white?text=Blog+Image"
    e.target.onerror = null // Prevent infinite error loop
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

  const navigateToBlog = (blogId) => {
    navigate(`/blogview/${blogId}`)
  }

  const navigateToAllBlogs = () => {
    navigate("/blogs")
  }

  if (isLoading) {
    return (
      <div className="blog-main">
        <div className="blog-container">
          <div className="loading-container">
            <Loader2 className="loading-spinner" />
            <p>Loading blogs...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="blog-main">
        <div className="blog-container">
          <div className="error-container">
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-main">
      <div className="blog-container">
        <h1 className="blog-title">Our Blog</h1>

        {/* Latest Blog Section (3 latest blogs) */}
        <section className="latest-blog">
          <h2 className="section-title">Latest Blog</h2>
          <div className="blog-grid">
            {latestBlogs.map((blog) => (
              <div key={blog.id} className="blog-card" onClick={() => navigateToBlog(blog.id)}>
                <img
                  src={blog.image1 || "https://placehold.co/600x400/gray/white?text=Blog+Image"}
                  alt={blog.heading}
                  className="blog-image"
                  onError={handleImageError}
                />
                <div className="blog-content">
                  <h3>{blog.heading}</h3>
                  <p>{blog.description1?.substring(0, 80)}...</p>
                  <span className="blog-date">{formatDate(blog.postingDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* More Blogs Section (next 5 blogs) */}
        <section className="other-blogs">
          <h2 className="section-title">More Blogs</h2>
          <div className="blog-grid">
            {moreBlogs.map((blog) => (
              <div key={blog.id} className="blog-card" onClick={() => navigateToBlog(blog.id)}>
                <img
                  src={blog.image1 || "https://placehold.co/600x400/gray/white?text=Blog+Image"}
                  alt={blog.heading}
                  className="blog-image"
                  onError={handleImageError}
                />
                <div className="blog-content">
                  <h3>{blog.heading}</h3>
                  <p>{blog.description1?.substring(0, 60)}...</p>
                  <span className="blog-date">{formatDate(blog.postingDate)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* View All Blogs Button */}
        <div className="view-all-container">
          <button className="view-all-button" onClick={navigateToAllBlogs}>
            View All Blogs <ArrowRight className="arrow-icon" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Blog

