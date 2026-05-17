import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaPhone, 
  FaMoneyBillWave, FaHistory, FaStar, FaTimes, FaSearch, FaCheckCircle, FaHourglassHalf, FaWallet 
} from "react-icons/fa";
import "./BookingHistory.css";

const BookingHistory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || user?._id;

  useEffect(() => {
    if (userId) {
      axios.get(`/api/bookings/user/${userId}`)
        .then(res => {
          const sortedBookings = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setBookings(sortedBookings);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching bookings:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [userId]);

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm(t("confirmCancelBooking") || "Are you sure you want to cancel this booking?")) {
      try {
        await axios.patch(`/api/bookings/${bookingId}/status`, { status: "cancelled" });
        toast.success(t("bookingCancelledSuccessfully"));
        setBookings(bookings.map(booking => 
          booking._id === bookingId ? { ...booking, status: "cancelled" } : booking
        ));
      } catch (error) {
        console.error("Error cancelling booking:", error);
        toast.error(t("failedToCancelBooking"));
      }
    }
  };

  if (loading) {
    return <div className="booking-history-container"><div className="loading">{t("loading")}</div></div>;
  }

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    completed: bookings.filter(b => b.status === "completed").length
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || booking.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const renderBookingCard = (booking) => {
    const serviceImage = booking.serviceId?.images?.[booking.serviceId?.mainImageIndex || 0];

    return (
      <div key={booking._id} className="booking-card">
        <div className="booking-card-header">
          <div className="service-info">
            {serviceImage && (
              <img 
                src={serviceImage} 
                alt={booking.serviceName} 
                className="booking-service-img" 
                onError={(e) => { e.target.onerror = null; e.target.src = "/logo2-cut.png"; }}
              />
            )}
            <div>
              <h3>{booking.serviceName}</h3>
              <p className="booking-id-text">{t("bookingId")}: {booking._id.slice(-8).toUpperCase()}</p>
            </div>
          </div>
          <span className={`status ${booking.status.toLowerCase()}`}>{t(booking.status.toLowerCase())}</span>
        </div>
        <div className="booking-card-body">
          <div className="info-grid">
            <div className="info-row">
              <FaUser />
              <span className="label">{t("providerLabel")}:</span>
              <span>{booking.providerId?.username || t("N/A")}</span>
            </div>
            <div className="info-row">
              <FaPhone />
              <span className="label">{t("phoneLabel")}:</span>
              <span>{booking.providerId?.phoneNumber || t("N/A")}</span>
            </div>
            <div className="info-row">
              <FaCalendarAlt />
              <span className="label">{t("dateLabel")}:</span>
              <span>{booking.date}</span>
            </div>
            <div className="info-row">
              <FaClock />
              <span className="label">{t("timeLabel")}:</span>
              <span>{booking.time}</span>
            </div>
            <div className="info-row">
              <FaMapMarkerAlt />
              <span className="label">{t("locationLabel")}:</span>
              <span>{booking.location}</span>
            </div>
            <div className="info-row">
              <FaMoneyBillWave />
              <span className="label">{t("priceLabel")}:</span>
              <span className="price-tag">OMR {booking.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <div className="booking-card-footer">
          {booking.status === "completed" && (
            <>
              {!booking.isReviewed && (
                <button onClick={() => navigate(`/leave-review/${booking._id}`)} className="action-btn review-btn">
                  <FaStar /> {t("leaveReview")}
                </button>
              )}
              <button onClick={() => navigate(`/service/${booking.serviceId?._id || booking.serviceId}`)} className="action-btn book-again-btn">
                <FaHistory /> {t("bookNow")}
              </button>
            </>
          )}
          {(booking.status === "pending" || booking.status === "confirmed") && (
            <button onClick={() => handleCancelBooking(booking._id)} className="action-btn cancel-btn">
              <FaTimes /> {t("cancelBooking")}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="booking-history-container">
      <header className="booking-history-header">
        <button onClick={() => navigate("/customer-dashboard")} className="back-btn">{t("backToDashboard")}</button>
        <h1>{t("bookingHistory")}</h1>
      </header>

      <main className="booking-history-content">
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon total"><FaHistory /></div>
            <div className="stat-info">
              <h4>{t("totalBookings")}</h4>
              <p>{stats.total}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending"><FaHourglassHalf /></div>
            <div className="stat-info">
              <h4>{t("pending")}</h4>
              <p>{stats.pending}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon confirmed"><FaCheckCircle /></div>
            <div className="stat-info">
              <h4>{t("confirmed")}</h4>
              <p>{stats.confirmed}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon earnings"><FaWallet /></div>
            <div className="stat-info">
              <h4>{t("completed")}</h4>
              <p>{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="filters-container">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder={t("searchPlaceholder")} 
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="tabs-wrapper">
            {["all", "pending", "confirmed", "completed", "cancelled", "rejected"].map(tab => (
              <button 
                key={tab}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === "all" ? t("allStatuses") : t(tab)}
              </button>
            ))}
          </div>
        </div>

        <div className="booking-list">
          {filteredBookings.length > 0 ? (
            filteredBookings.map(renderBookingCard)
          ) : (
            <div className="no-bookings">
              <FaHistory size={50} color="#ccc" style={{ marginBottom: '20px' }} />
              <h2>{t("noBookingsInTab")}</h2>
              {searchTerm && <p>{t("tryDifferentSearch")}</p>}
              {!searchTerm && activeTab === "all" && (
                <>
                  <p>{t("startCelebrating") || "No bookings yet — start celebrating!"}</p>
                  <button onClick={() => navigate("/services")} className="action-btn" style={{ marginTop: '20px' }}>{t("bookNow")}</button>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BookingHistory;
