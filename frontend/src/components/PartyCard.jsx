import React from 'react';
import { Users, Phone, Clock, Bell, Check, Ban, Trash2, ExternalLink } from 'lucide-react';

export default function PartyCard({ party, onUpdateStatus, onDelete, onOpenGuestView }) {
  const getBadgeClass = (status) => {
    switch (status) {
      case 'WAITING':
        return 'badge-waiting';
      case 'NOTIFIED':
        return 'badge-notified';
      case 'SEATED':
        return 'badge-seated';
      case 'CANCELLED':
        return 'badge-cancelled';
      default:
        return '';
    }
  };

  const calculateElapsed = (createdAt) => {
    const mins = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000));
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
  };

  return (
    <div className={`party-card party-card-${party.status.toLowerCase()}`}>
      <div className="party-card-header">
        <div className="party-primary-info">
          <div className="party-title-row">
            <h3 className="party-name">{party.customer_name}</h3>
            <span className={`status-pill ${getBadgeClass(party.status)}`}>
              {party.status}
            </span>
          </div>

          <div className="party-meta-row">
            <span className="party-meta-item">
              <Users size={16} /> {party.party_size} {party.party_size === 1 ? 'Guest' : 'Guests'}
            </span>
            {party.phone_number && (
              <span className="party-meta-item">
                <Phone size={15} /> {party.phone_number}
              </span>
            )}
            <span className="party-meta-item party-elapsed">
              <Clock size={15} /> Added {calculateElapsed(party.created_at)}
            </span>
          </div>
        </div>

        <div className="party-wait-badge">
          <span className="wait-label">Est. Wait</span>
          <span className="wait-time">{party.estimated_wait_minutes}m</span>
        </div>
      </div>

      {party.notes && (
        <div className="party-notes">
          <span className="notes-tag">Note:</span> {party.notes}
        </div>
      )}

      <div className="party-card-actions">
        <div className="action-buttons-left">
          {party.status === 'WAITING' && (
            <button
              className="btn-action btn-notify"
              onClick={() => onUpdateStatus(party.id, 'NOTIFIED')}
              title="Notify guest that table is ready"
            >
              <Bell size={16} /> Notify
            </button>
          )}

          {party.status === 'NOTIFIED' && (
            <button
              className="btn-action btn-seat"
              onClick={() => onUpdateStatus(party.id, 'SEATED')}
              title="Seat this party"
            >
              <Check size={16} /> Seat Party
            </button>
          )}

          {party.status === 'WAITING' && (
            <button
              className="btn-action btn-seat"
              onClick={() => onUpdateStatus(party.id, 'SEATED')}
              title="Seat directly"
            >
              <Check size={16} /> Direct Seat
            </button>
          )}

          {(party.status === 'WAITING' || party.status === 'NOTIFIED') && (
            <button
              className="btn-action btn-cancel"
              onClick={() => onUpdateStatus(party.id, 'CANCELLED')}
              title="Cancel / No-show"
            >
              <Ban size={16} /> Cancel
            </button>
          )}

          {party.status === 'CANCELLED' && (
            <button
              className="btn-action btn-reopen"
              onClick={() => onUpdateStatus(party.id, 'WAITING')}
            >
              Reopen
            </button>
          )}
        </div>

        <div className="action-buttons-right">
          <button
            className="btn-icon"
            onClick={() => onOpenGuestView(party)}
            title="Preview Guest Mobile Status Screen"
          >
            <ExternalLink size={16} />
            <span className="btn-text-sm">Guest View</span>
          </button>
          <button
            className="btn-icon btn-danger"
            onClick={() => onDelete(party.id)}
            title="Delete record permanently"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
