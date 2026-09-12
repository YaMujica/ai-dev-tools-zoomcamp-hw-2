import React, { useState } from 'react';
import { X, Plus, Users, Phone, Clock, FileText } from 'lucide-react';

export default function AddPartyModal({ isOpen, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [size, setSize] = useState('2');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [waitTime, setWaitTime] = useState('15');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await onAdd({
        customer_name: name.trim(),
        party_size: parseInt(size, 10) || 1,
        phone_number: phone.trim(),
        notes: notes.trim(),
        estimated_wait_minutes: parseInt(waitTime, 10) || 15
      });
      // Reset
      setName('');
      setSize('2');
      setPhone('');
      setNotes('');
      setWaitTime('15');
      onClose();
    } catch (err) {
      alert('Error adding party: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Party to Waitlist</h2>
          <button className="btn-close" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>
              Guest Name <span className="required">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sarah Connor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>
                <Users size={16} className="inline-icon" /> Party Size
              </label>
              <select value={size} onChange={(e) => setSize(e.target.value)}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 16, 20].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                <Clock size={16} className="inline-icon" /> Est. Wait (Mins)
              </label>
              <input
                type="number"
                min="0"
                step="5"
                value={waitTime}
                onChange={(e) => setWaitTime(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <Phone size={16} className="inline-icon" /> Phone Number (SMS ready)
            </label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>
              <FileText size={16} className="inline-icon" /> Special Notes / Requests
            </label>
            <textarea
              rows="2"
              placeholder="e.g. High chair, booth preferred, birthday celebration"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              <Plus size={18} />
              {submitting ? 'Adding...' : 'Add to Waitlist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
