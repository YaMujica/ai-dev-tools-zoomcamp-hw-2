import React from 'react';
import { X, Clock, Users, Bell, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function GuestViewModal({ party, onClose, onRefresh }) {
  if (!party) return null;

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'WAITING':
        return {
          title: 'You are in line!',
          badge: 'Waiting',
          badgeClass: 'badge-waiting',
          message: 'Please stay close to the restaurant lobby or patio. We will notify you when your table is being prepared.'
        };
      case 'NOTIFIED':
        return {
          title: 'Your Table is Ready! 🎉',
          badge: 'Table Ready',
          badgeClass: 'badge-notified',
          message: 'Please proceed immediately to the host stand. We are waiting to seat your party.'
        };
      case 'SEATED':
        return {
          title: 'You are Seated 🍽️',
          badge: 'Seated',
          badgeClass: 'badge-seated',
          message: 'Enjoy your meal! Thank you for dining with us.'
        };
      case 'CANCELLED':
        return {
          title: 'Reservation Cancelled',
          badge: 'Cancelled',
          badgeClass: 'badge-cancelled',
          message: 'This waitlist entry was removed or marked as cancelled.'
        };
      default:
        return { title: status, badge: status, badgeClass: '', message: '' };
    }
  };

  const statusInfo = getStatusDisplay(party.status);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content guest-phone-card" onClick={(e) => e.stopPropagation()}>
        <div className="guest-card-header">
          <div className="restaurant-brand">
            <span className="logo-icon">🍽️</span>
            <div>
              <h3>Bistro Del Sol</h3>
              <p className="subtitle">Powered by WaitEase</p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="guest-hero-section">
          <span className={`status-pill ${statusInfo.badgeClass}`}>
            {statusInfo.badge}
          </span>
          <h1 className="guest-hero-title">{statusInfo.title}</h1>
          <p className="guest-hero-msg">{statusInfo.message}</p>
        </div>

        {party.status === 'WAITING' && (
          <div className="queue-position-box">
            <div className="position-item">
              <span className="metric-label">Your Spot</span>
              <span className="metric-number">
                #{party.position ?? '1'}
              </span>
            </div>
            <div className="position-divider"></div>
            <div className="position-item">
              <span className="metric-label">Est. Wait</span>
              <span className="metric-number">
                ~{party.estimated_wait_minutes} min
              </span>
            </div>
          </div>
        )}

        <div className="guest-party-info">
          <div className="info-row">
            <span className="info-key"><Users size={16} /> Party Name:</span>
            <span className="info-val">{party.customer_name}</span>
          </div>
          <div className="info-row">
            <span className="info-key"><Users size={16} /> Party Size:</span>
            <span className="info-val">{party.party_size} {party.party_size === 1 ? 'guest' : 'guests'}</span>
          </div>
          {party.notes && (
            <div className="info-row">
              <span className="info-key">Notes:</span>
              <span className="info-val">{party.notes}</span>
            </div>
          )}
        </div>

        <div className="guest-footer">
          <button className="btn-refresh" onClick={onRefresh}>
            <RefreshCw size={16} /> Refresh Status
          </button>
          <small className="last-updated">
            Registered: {new Date(party.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </small>
        </div>
      </div>
    </div>
  );
}
