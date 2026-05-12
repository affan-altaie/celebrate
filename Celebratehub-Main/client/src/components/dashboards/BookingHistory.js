import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { toast } from "react-toastify";
import "./BookingHistory.css";

const BookingHistory = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || user?._id;

  useEffect(() => {
    if (userId) {
      axios.get(`/api/bookings/user/${userId}`)
        .then(res => {
          setBookings(res.data);
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
    if (window.confirm(t("confirmCancelBooking"))) {
      try {
        await axios.delete(`/api/bookings/${bookingId}`);
        toast.success(t("bookingCancelledSuccessfully"));
        setBookings(bookings.filter(booking => booking._id !== bookingId));
      } catch (error) {
        console.error("Error cancelling booking:", error);
        toast.error(t("failedToCancelBooking"));
      }
    }
  };

  if (loading) {
    return <div className="booking-history-container"><div className="loading">{t("loading")}</div></div>;
  }

  return (
    <div className="booking-history-container">
      <header className="booking-history-header">
        <button onClick={() => navigate("/customer-dashboard")} className="back-btn">{t("backToDashboard")}</button>
        <h1>{t("bookingHistory")}</h1>
      </header>
      <main className="booking-history-content">
        {bookings.length > 0 ? (
          bookings.map(booking => (
            <div key={booking._id} className="booking-card">
              <div className="booking-card-header">
                  <h3>{booking.serviceName}</h3>
              </div>
              <div className="booking-card-body">
                <p><span className="label">{t("bookedOnLabel")}:</span> {new Date(booking.createdAt).toLocaleDateString("en-GB")}</p>
                <p><span className="label">{t("dateLabel")}:</span> {booking.date}</p>
                <p><span className="label">{t("timeLabel")}:</span> {booking.time}</p>
                <p><span className="label">{t("priceLabel") || "Price"}:</span> OMR {booking.totalPrice.toFixed(2)}</p>
                <p><span className="label">{t("statusLabel")}:</span> <span className={`status ${booking.status.toLowerCase()}`}>{t(booking.status.toLowerCase())}</span></p>
              </div>
              <div className="booking-card-footer">
                {booking.status === "confirmed" && !booking.isReviewed && (
                  <button onClick={() => navigate(`/leave-review/${booking._id}`)} className="action-btn review-btn">
                    {t("leaveReview")}
                  </button>
                )}
                <button onClick={() => handleCancelBooking(booking._id)} className="action-btn cancel-btn">
                  {t("cancelBooking")}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-bookings">
            <h2>{t("noBookingsFound") || "No bookings found."}</h2>
            <p>{t("startCelebrating") || "No bookings yet — start celebrating!"}</p>
            <button onClick={() => navigate("/services")} className="action-btn">{t("bookNow")}</button>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookingHistory;
