import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from "react-toastify";
import "./BookingHistory.css"; // Reuse these styles

const BookingManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const providerId = user?.id || user?._id;

  useEffect(() => {
    if (providerId) {
      axios.get(`/api/bookings/provider/${providerId}`)
        .then(res => {
          // Sort bookings so that 'pending' ones are at the top
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

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await axios.patch(`/api/bookings/${bookingId}/status`, { status: newStatus });
      toast.success(t("statusUpdatedSuccessfully") || "Status updated successfully");
      setBookings(bookings.map(booking => 
        booking._id === bookingId ? { ...booking, status: newStatus } : booking
      ));
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(t("failedToUpdateStatus") || "Failed to update status");
    }
  };

  if (loading) {
    return <div className="booking-history-container"><div className="loading">{t("loading")}</div></div>;
  }

  const upcomingBookings = bookings.filter(b => b.status === "pending" || b.status === "confirmed");
  const completedBookings = bookings.filter(b => b.status === "completed" || b.status === "cancelled" || b.status === "rejected");

  const renderBookingCard = (booking) => (
    <div key={booking._id} className="booking-card">
      <div className="booking-card-header">
          <h3>{booking.serviceName}</h3>
      </div>
      <div className="booking-card-body">
        <p><span className="label">{t("customer")}:</span> {booking.userId?.username} ({booking.customerEmail || booking.userId?.email})</p>
        <p><span className="label">{t("phoneLabel")}:</span> {booking.customerPhone || booking.userId?.phoneNumber || t("N/A")}</p>
        <p><span className="label">{t("dateLabel")}:</span> {booking.date}</p>
        <p><span className="label">{t("timeLabel")}:</span> {booking.time}</p>
        <p><span className="label">{t("locationLabel")}:</span> {booking.location}</p>
        <p><span className="label">{t("priceLabel") || "Price"}:</span> OMR {booking.totalPrice.toFixed(2)}</p>
        <p><span className="label">{t("statusLabel")}:</span> <span className={`status ${booking.status.toLowerCase()}`}>{t(booking.status.toLowerCase())}</span></p>
      </div>
      <div className="booking-card-footer">
        {booking.status === "pending" && (
          <>
            <button onClick={() => handleStatusChange(booking._id, "confirmed")} className="action-btn review-btn">
              {t("confirm") || "Confirm"}
            </button>
            <button onClick={() => handleStatusChange(booking._id, "rejected")} className="action-btn cancel-btn">
              {t("reject") || "Reject"}
            </button>
          </>
        )}
        {booking.status === "confirmed" && (
          <button onClick={() => handleStatusChange(booking._id, "completed")} className="action-btn review-btn">
            {t("completed") || "Completed"}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="booking-history-container">
      <header className="booking-history-header">
        <button onClick={() => navigate("/provider-dashboard")} className="back-btn">{t("backToDashboard")}</button>
        <h1>{t("bookingManagement") || "Booking Management"}</h1>
      </header>
      <main className="booking-history-content">
        {bookings.length > 0 ? (
          <>
            <section className="booking-section">
              <h2 className="section-title">{t("upcoming")}</h2>
              {upcomingBookings.length > 0 ? (
                upcomingBookings.map(renderBookingCard)
              ) : (
                <p className="no-bookings-subtext">{t("noUpcomingBookings") || "No upcoming bookings."}</p>
              )}
            </section>

            <section className="booking-section">
              <h2 className="section-title">{t("completed")}</h2>
              {completedBookings.length > 0 ? (
                completedBookings.map(renderBookingCard)
              ) : (
                <p className="no-bookings-subtext">{t("noCompletedBookings") || "No completed bookings."}</p>
              )}
            </section>
          </>
        ) : (
          <div className="no-bookings">
            <h2>{t("noBookingsFound") || "No bookings found."}</h2>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookingManagement;
