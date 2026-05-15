import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  FaSearch, FaCalendarAlt, FaClock, FaMapMarkerAlt, 
  FaUser, FaPhone, FaMoneyBillWave, FaCheck, FaTimes, FaHistory,
  FaClipboardList, FaHourglassHalf, FaCheckCircle
} from "react-icons/fa";
import "./BookingHistory.css";

const BookingManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingBookingId, setRejectingBookingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  
  // New States for UI/UX
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const user = JSON.parse(localStorage.getItem("user"));
  const providerId = user?.id || user?._id;

  useEffect(() => {
    if (providerId) {
      axios.get(`/api/bookings/provider/${providerId}`)
        .then(res => {
          const sortedBookings = res.data.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          });
          setBookings(sortedBookings);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching provider bookings:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [providerId]);

  const handleStatusChange = async (bookingId, newStatus, reason = "") => {
    try {
      await axios.patch(`/api/bookings/${bookingId}/status`, { 
          status: newStatus,
          reason: reason
      });
      toast.success(t("statusUpdatedSuccessfully"));
      setBookings(bookings.map(booking => 
        booking._id === bookingId ? { ...booking, status: newStatus, rejectionReason: reason } : booking
      ));
      setRejectingBookingId(null);
      setRejectionReason("");
      setOtherReason("");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(t("failedToUpdateStatus"));
    }
  };

  // Stats Calculations
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    confirmed: bookings.filter(b => b.status === "confirmed").length,
    earnings: bookings
      .filter(b => b.status === "completed" || b.status === "confirmed")
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0)
  };

  // Filtering Logic
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.userId?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      activeTab === "all" || 
      (activeTab === "pending" && booking.status === "pending") ||
      (activeTab === "confirmed" && booking.status === "confirmed") ||
      (activeTab === "completed" && booking.status === "completed") ||
      (activeTab === "history" && ["cancelled", "rejected"].includes(booking.status));

    return matchesSearch && matchesTab;
  });

  if (loading) {
    return <div className="booking-history-container"><div className="loading">{t("loading")}</div></div>;
  }

  const renderBookingCard = (booking) => (
    <div key={booking._id} className="booking-card">
      <div className="booking-card-header">
          <h3>{booking.serviceName}</h3>
          <span className={`status ${booking.status.toLowerCase()}`}>{t(booking.status.toLowerCase())}</span>
      </div>
      <div className="booking-card-body">
        <div className="info-row">
          <FaUser />
          <span className="label">{t("customer")}:</span>
          <span>{booking.userId?.username} ({booking.customerEmail || booking.userId?.email})</span>
        </div>
        <div className="info-row">
          <FaPhone />
          <span className="label">{t("phoneLabel")}:</span>
          <span>{booking.customerPhone || booking.userId?.phoneNumber || t("N/A")}</span>
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
          <span style={{ fontWeight: 'bold', color: '#28a745' }}>OMR {booking.totalPrice.toFixed(2)}</span>
        </div>
      </div>
      <div className="booking-card-footer">
        {booking.status === "pending" && (
          <>
            <button onClick={() => handleStatusChange(booking._id, "confirmed")} className="action-btn review-btn">
              <FaCheck style={{ marginRight: '5px' }} /> {t("confirm")}
            </button>
            <button onClick={() => setRejectingBookingId(booking._id)} className="action-btn cancel-btn">
              <FaTimes style={{ marginRight: '5px' }} /> {t("reject")}
            </button>
          </>
        )}
        {booking.status === "confirmed" && (
          <button onClick={() => handleStatusChange(booking._id, "completed")} className="action-btn review-btn">
            <FaCheckCircle style={{ marginRight: '5px' }} /> {t("completed")}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="booking-history-container">
      {rejectingBookingId && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>{t("selectRejectionReason")}</h3>
            <select 
              value={rejectionReason} 
              onChange={(e) => setRejectionReason(e.target.value)}
              className="modal-select"
            >
              <option value="">{t("selectRejectionReason")}</option>
              <option value={t("scheduleConflict")}>{t("scheduleConflict")}</option>
              <option value={t("resourceUnavailable")}>{t("resourceUnavailable")}</option>
              <option value={t("locationOutOfRange")}>{t("locationOutOfRange")}</option>
              <option value="other">{t("other")}</option>
            </select>
            {rejectionReason === "other" && (
              <textarea
                className="modal-textarea"
                placeholder={t("rejectionReasonPlaceholder")}
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
              />
            )}
            <div className="modal-actions">
              <button onClick={() => {
                setRejectingBookingId(null);
                setRejectionReason("");
                setOtherReason("");
              }} className="action-btn secondary-btn">
                {t("cancel")}
              </button>
              <button 
                onClick={() => {
                    const finalReason = rejectionReason === "other" ? otherReason : rejectionReason;
                    handleStatusChange(rejectingBookingId, "rejected", finalReason);
                }} 
                disabled={!rejectionReason || (rejectionReason === "other" && !otherReason)}
                className="action-btn cancel-btn"
              >
                {t("confirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="booking-history-header">
        <button onClick={() => navigate("/provider-dashboard")} className="back-btn">{t("backToDashboard")}</button>
        <h1>{t("bookingManagement")}</h1>
      </header>

      <div className="booking-history-content">
        {/* Stats Dashboard */}
        <section className="stats-container">
          <div className="stat-card">
            <div className="stat-icon total"><FaClipboardList /></div>
            <div className="stat-info">
              <h4>{t("totalBookings") || "Total Bookings"}</h4>
              <p>{stats.total}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending"><FaHourglassHalf /></div>
            <div className="stat-info">
              <h4>{t("pending") || "Pending"}</h4>
              <p>{stats.pending}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon confirmed"><FaCheckCircle /></div>
            <div className="stat-info">
              <h4>{t("confirmed") || "Confirmed"}</h4>
              <p>{stats.confirmed}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon earnings"><FaMoneyBillWave /></div>
            <div className="stat-info">
              <h4>{t("totalEarnings") || "Total Earnings"}</h4>
              <p>OMR {stats.earnings.toFixed(2)}</p>
            </div>
          </div>
        </section>

        {/* Filters and Search */}
        <section className="filters-container">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              className="search-input" 
              placeholder={t("searchPlaceholder") || "Search by customer or service..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="tabs-wrapper">
            <button 
              className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              {t("allStatuses") || "All"}
            </button>
            <button 
              className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => setActiveTab("pending")}
            >
              {t("pending")}
            </button>
            <button 
              className={`tab-btn ${activeTab === "confirmed" ? "active" : ""}`}
              onClick={() => setActiveTab("confirmed")}
            >
              {t("confirmed")}
            </button>
            <button 
              className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
              onClick={() => setActiveTab("completed")}
            >
              {t("completed")}
            </button>
            <button 
              className={`tab-btn ${activeTab === "history" ? "active" : ""}`}
              onClick={() => setActiveTab("history")}
            >
              {t("bookingHistory") || "History"}
            </button>
          </div>
        </section>

        <main style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {filteredBookings.length > 0 ? (
            <div className="booking-section">
              {filteredBookings.map(renderBookingCard)}
            </div>
          ) : (
            <div className="no-bookings">
              <FaHistory size={50} color="#ccc" style={{ marginBottom: '20px' }} />
              <h2>{t("noBookingsFound")}</h2>
              <p>{searchTerm ? t("tryDifferentSearch") || "Try a different search term" : t("noBookingsInTab") || "No bookings found in this category."}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BookingManagement;
