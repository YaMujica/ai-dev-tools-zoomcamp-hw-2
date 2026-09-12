// WaitEase Centralized API Service
// Connected to live FastAPI backend (Question 6)

const USE_MOCK = false;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Initial mock data simulating walk-in restaurant parties
let mockParties = [
  {
    id: 1,
    customer_name: "Elena Rostova",
    party_size: 2,
    phone_number: "+1 (555) 234-8901",
    notes: "Window booth preferred, celebrating anniversary",
    status: "WAITING",
    estimated_wait_minutes: 15,
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 25 * 60000).toISOString()
  },
  {
    id: 2,
    customer_name: "Marcus Vance",
    party_size: 4,
    phone_number: "+1 (555) 456-7890",
    notes: "Highchair needed for toddler",
    status: "NOTIFIED",
    estimated_wait_minutes: 5,
    created_at: new Date(Date.now() - 20 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60000).toISOString()
  },
  {
    id: 3,
    customer_name: "Amina Al-Sayed",
    party_size: 6,
    phone_number: "+1 (555) 678-1234",
    notes: "Patio seating if warm, otherwise indoor",
    status: "WAITING",
    estimated_wait_minutes: 30,
    created_at: new Date(Date.now() - 12 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60000).toISOString()
  },
  {
    id: 4,
    customer_name: "David Chen",
    party_size: 2,
    phone_number: "+1 (555) 901-2345",
    notes: "Quiet table preferred",
    status: "SEATED",
    estimated_wait_minutes: 0,
    created_at: new Date(Date.now() - 50 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60000).toISOString()
  }
];

let nextId = 5;

// Helper to simulate network latency in mock mode
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  // Get list of parties with optional status filtering
  async getParties(status = 'ALL') {
    if (USE_MOCK) {
      await delay();
      if (status === 'ACTIVE') {
        return mockParties.filter((p) => p.status === 'WAITING' || p.status === 'NOTIFIED');
      }
      if (status !== 'ALL') {
        return mockParties.filter((p) => p.status === status);
      }
      return [...mockParties];
    }
    const res = await fetch(`${API_BASE_URL}/parties${status && status !== 'ALL' ? `?status=${status}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch parties');
    return await res.json();
  },

  // Get specific party details (e.g. For guest live view)
  async getParty(id) {
    if (USE_MOCK) {
      await delay();
      const party = mockParties.find((p) => p.id === Number(id));
      if (!party) throw new Error('Party not found');
      // Calculate queue position among active parties
      const activeParties = mockParties.filter((p) => p.status === 'WAITING' || p.status === 'NOTIFIED');
      const position = activeParties.findIndex((p) => p.id === Number(id)) + 1;
      return { ...party, position: position > 0 ? position : null };
    }
    const res = await fetch(`${API_BASE_URL}/parties/${id}`);
    if (!res.ok) throw new Error('Party not found');
    return await res.json();
  },

  // Add a new party to waitlist
  async addParty(data) {
    if (USE_MOCK) {
      await delay();
      // Auto estimate wait time: 10 mins per party currently in queue
      const activeWaiting = mockParties.filter((p) => p.status === 'WAITING').length;
      const autoWait = Math.max(10, (activeWaiting + 1) * 10);

      const newParty = {
        id: nextId++,
        customer_name: data.customer_name,
        party_size: Number(data.party_size) || 2,
        phone_number: data.phone_number || '',
        notes: data.notes || '',
        status: 'WAITING',
        estimated_wait_minutes: Number(data.estimated_wait_minutes) || autoWait,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      mockParties.unshift(newParty);
      return { ...newParty };
    }
    const res = await fetch(`${API_BASE_URL}/parties`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create party');
    return await res.json();
  },

  // Update party status
  async updatePartyStatus(id, newStatus) {
    if (USE_MOCK) {
      await delay();
      const party = mockParties.find((p) => p.id === Number(id));
      if (!party) throw new Error('Party not found');
      party.status = newStatus;
      party.updated_at = new Date().toISOString();
      return { ...party };
    }
    const res = await fetch(`${API_BASE_URL}/parties/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) throw new Error('Failed to update party status');
    return await res.json();
  },

  // Delete party
  async deleteParty(id) {
    if (USE_MOCK) {
      await delay();
      mockParties = mockParties.filter((p) => p.id !== Number(id));
      return { success: true };
    }
    const res = await fetch(`${API_BASE_URL}/parties/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete party');
    return await res.json();
  },

  // Get queue analytics
  async getStats() {
    if (USE_MOCK) {
      await delay();
      const activeParties = mockParties.filter((p) => p.status === 'WAITING' || p.status === 'NOTIFIED');
      const totalGuestsWaiting = activeParties.reduce((sum, p) => sum + p.party_size, 0);
      const seatedParties = mockParties.filter((p) => p.status === 'SEATED');
      const avgWait = activeParties.length
        ? Math.round(activeParties.reduce((sum, p) => sum + p.estimated_wait_minutes, 0) / activeParties.length)
        : 0;

      return {
        active_parties: activeParties.length,
        total_guests_waiting: totalGuestsWaiting,
        avg_wait_minutes: avgWait,
        seated_today: seatedParties.length
      };
    }
    const res = await fetch(`${API_BASE_URL}/stats`);
    if (!res.ok) throw new Error('Failed to fetch stats');
    return await res.json();
  }
};
