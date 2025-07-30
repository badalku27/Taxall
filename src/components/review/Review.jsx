"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { FaStar, FaTimes, FaUser, FaSignInAlt } from "react-icons/fa"
import "./Review.css"
import { reviewAPI } from "../../APILinks"

const Review = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [userReview, setUserReview] = useState(null)
  const [newReview, setNewReview] = useState({
    stars: 0,
    description: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const containerRef = useRef(null)
  const animationRef = useRef(null)
  const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 0)

  const token = localStorage.getItem("token")
  const userId = localStorage.getItem("userId")

  // Optimized fetch reviews function with memoization
  const fetchReviews = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true)
      const response = await reviewAPI.getAllReviews(pageNum)

      if (!response.data) {
        throw new Error("Failed to fetch reviews")
      }

      const data = response.data

      if (data.length === 0) {
        setHasMore(false)
      } else {
        if (append) {
          setReviews((prev) => [...prev, ...data])
        } else {
          setReviews(data)
        }
        setPage(pageNum)
      }
    } catch (err) {
      setError(err.message)
      console.error("Error fetching reviews:", err)
      showToast("Error loading reviews. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }, [])

  // Check if current user has already submitted a review
  const checkUserReview = useCallback(() => {
    if (!userId) return

    const foundReview = reviews.find((review) => review.userID?.toString() === userId)
    if (foundReview) {
      setUserReview(foundReview)
    } else {
      setUserReview(null)
    }
  }, [reviews, userId])

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  // Check for user review whenever reviews change
  useEffect(() => {
    checkUserReview()
  }, [reviews, userId, checkUserReview])

  // Stable animation implementation
  useEffect(() => {
    if (!containerRef.current || reviews.length === 0) return

    let animationActive = true
    let position = 0
    const speed = windowWidth < 768 ? 0.5 : 1 // Slower on mobile

    const animate = () => {
      if (!animationActive || !containerRef.current) return

      const container = containerRef.current
      const firstCard = container.firstChild

      if (!firstCard) return

      position += speed

      // When the first card is fully out of view
      if (position >= firstCard.offsetWidth + 20) {
        // 20px for gap
        position = 0
        // Move the first card to the end
        container.appendChild(firstCard)
      }

      // Apply the transform
      container.style.transform = `translateX(-${position}px)`

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      animationActive = false
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [reviews, windowWidth])

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: "", type: "" })
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [toast])

  // Show toast notification
  const showToast = (message, type = "info") => {
    setToast({ show: true, message, type })
  }

  // Format date from ISO string
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Handle load more button click
  const handleLoadMore = () => {
    if (!hasMore || loading) return
    fetchReviews(page + 1, true)
  }

  // Handle add review button click
  const handleAddReviewClick = () => {
    if (!token || !userId) {
      showToast("Please sign in to add a review", "warning")
      return
    }

    setShowModal(true)
  }

  // Handle input changes for review form
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewReview((prev) => ({ ...prev, [name]: value }))
  }

  // Handle star rating click
  const handleStarClick = (rating) => {
    setNewReview((prev) => ({ ...prev, stars: rating }))
  }

  // Open edit modal with existing review data
  const handleEditReview = () => {
    if (!userReview) return

    setNewReview({
      stars: userReview.stars,
      description: userReview.description,
    })

    setIsEditing(true)
    setShowModal(true)
  }

  // Submit review (add or update)
  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (!token || !userId) {
      showToast("Please sign in to submit a review", "warning")
      return
    }

    try {
      setLoading(true)

      const reviewData = {
        stars: newReview.stars,
        description: newReview.description,
      }

      let response

      if (isEditing && userReview) {
        // Update existing review
        response = await reviewAPI.updateReview(userReview.id, reviewData)
      } else {
        // Add new review
        response = await reviewAPI.createReview(reviewData)
      }

      if (!response.data) {
        throw new Error("Failed to submit review")
      }

      // Refresh reviews to show the new/updated one
      fetchReviews()
      setShowModal(false)
      setNewReview({ stars: 0, description: "" })
      setIsEditing(false)
      showToast(isEditing ? "Review updated successfully!" : "Review added successfully!", "success")
    } catch (err) {
      setError(err.message)
      console.error("Error submitting review:", err)
      showToast("Error submitting review. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  // Close modal handler with cleanup
  const handleCloseModal = () => {
    setShowModal(false)
    setIsEditing(false)
    setNewReview({ stars: 0, description: "" })
  }

  return (
    <div className="review-component">
      <div className="testimonial-wrapper">
        <h2 className="testimonial-title">Trusted by experts and customers</h2>
        <p className="testimonial-subtitle">
          Discover early user feedback on <span>Dico integration</span> within their workflows.
        </p>

        {loading && reviews.length === 0 ? (
          <div className="loading">Loading reviews...</div>
        ) : error ? (
          <div className="error">Error: {error}</div>
        ) : (
          <div className="testimonial-container" ref={containerRef}>
            {reviews.map((review) => (
              <div key={review.id} className="testimonial-card">
                <div className="testimonial-header">
                  {/* Default profile icon instead of avatar */}
                  <div className="avatar">
                    <FaUser size={30} />
                  </div>
                  <div>
                    <h3 className="author-name">{review.userName}</h3>
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => {
                        const ratingValue = i + 1
                        return <FaStar key={i} size={16} color={ratingValue <= review.stars ? "#ff6ec4" : "#ccc"} />
                      })}
                    </div>
                  </div>
                </div>
                <p className="testimonial-text">« {review.description} »</p>
                <p className="testimonial-date">📅 {formatDate(review.createdAt)}</p>

                {/* Edit button if this is the user's review */}
                {userId && review.userID?.toString() === userId && (
                  <button className="edit-review-button" onClick={handleEditReview}>
                    Edit My Review
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        <div className="load-more-wrapper">
          <button className="load-more-button" onClick={handleLoadMore} disabled={!hasMore || loading}>
            {loading ? "Loading..." : hasMore ? "Load More Reviews" : "No More Reviews"}
          </button>
        </div>

        {/* Add Review Button */}
        <div className="add-review-button-wrapper">
          <button className="add-review-button" onClick={userReview ? handleEditReview : handleAddReviewClick}>
            {!token || !userId ? (
              <>
                <FaSignInAlt className="button-icon" />
                Sign in to Review
              </>
            ) : userReview ? (
              "Update Your Review"
            ) : (
              "Add Review"
            )}
          </button>
        </div>
      </div>

      {/* Review Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={handleCloseModal}>
              <FaTimes size={20} />
            </button>
            <h3>Your Review</h3>
            <form onSubmit={handleSubmitReview} className="review-form">
              <div className="rating-input">
                <label>Your Rating:</label>
                <div>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      size={24}
                      color={star <= newReview.stars ? "#ff6ec4" : "#ccc"}
                      onClick={() => handleStarClick(star)}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
                </div>
              </div>
              <textarea
                name="description"
                placeholder="Your Review"
                value={newReview.description}
                onChange={handleInputChange}
                required
              />
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? "Submitting..." : isEditing ? "Update" : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          <p>{toast.message}</p>
        </div>
      )}
    </div>
  )
}

export default Review

