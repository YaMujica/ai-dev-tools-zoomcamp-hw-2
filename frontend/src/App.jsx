import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api';
import StatsBar from './components/StatsBar';
import PartyCard from './components/PartyCard';
import AddPartyModal from './components/AddPartyModal';
import GuestViewModal from './components/GuestViewModal';
import { Plus, Search, UtensilsCrossed, RefreshCw } from 'lucide-react';

export default function App() {
  const [parties, setParties] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('ACTIVE');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [guestParty, setGuestParty] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch queue and stats
  const loadData = useCallback(async () => {
    try {
      const [fetchedParties, fetchedStats] = await Promise.all([
        api.getParties(activeTab),
        api.getStats()
      ]);
      setParties(fetchedParties);
      setStats(fetchedStats);

      // If guest modal is currently open, refresh its data too
      if (guestParty) {
        try {
          const updatedGuest = await api.getParty(guestParty.id);
          setGuestParty(updatedGuest);
        } catch {
          // Party might have been deleted
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, guestParty?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle party addition
  const handleAddParty = async (partyData) => {
    await api.addParty(partyData);
    await loadData();
  };

  // Handle status update
  const handleUpdateStatus = async (id, newStatus) => {
    await api.updatePartyStatus(id, newStatus);
    await loadData();
  };

  // Handle delete
  const handleDeleteParty = async (id) => {
    if (window.confirm('Are you sure you want to remove this party from the list?')) {
      await api.deleteParty(id);
      await loadData();
    }
  };

  // Filter parties by search input
  const filteredParties = parties.filter((p) =>
    p.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.phone_number && p.phone_number.includes(searchQuery))
  );

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="app-header">
        <div className="header-left">
          <div className="app-logo">
            <UtensilsCrossed size={28} className="logo-svg" />
            <div className="logo-text">
              <h1>WaitEase</h1>
              <span className="app-tagline">Restaurant Waitlist Host Stand</span>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn-refresh" onClick={loadData} title="Refresh data">
            <RefreshCw size={18} />
          </button>
          <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={18} />
            <span>Add Party</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        {/* KPI Stats */}
        <StatsBar stats={stats} />

        {/* Control Bar: Filter Tabs & Search */}
        <div className="controls-bar">
          <div className="tabs">
            {[
              { id: 'ACTIVE', label: 'Active Queue' },
              { id: 'WAITING', label: 'Waiting' },
              { id: 'NOTIFIED', label: 'Notified' },
              { id: 'SEATED', label: 'Seated' },
              { id: 'ALL', label: 'All Parties' }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search guest or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Waitlist Queue List */}
        <div className="queue-container">
          {loading ? (
            <div className="empty-state">Loading waitlist...</div>
          ) : filteredParties.length === 0 ? (
            <div className="empty-state">
              <p className="empty-title">No parties in this view</p>
              <p className="empty-subtitle">
                {searchQuery
                  ? 'No guest matches your search criteria.'
                  : 'Click "+ Add Party" above to welcome new walk-ins.'}
              </p>
            </div>
          ) : (
            <div className="parties-list">
              {filteredParties.map((party) => (
                <PartyCard
                  key={party.id}
                  party={party}
                  onUpdateStatus={handleUpdateStatus}
                  onDelete={handleDeleteParty}
                  onOpenGuestView={(p) => setGuestParty(p)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Party Modal */}
      <AddPartyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddParty}
      />

      {/* Guest Mobile View Modal */}
      <GuestViewModal
        party={guestParty}
        onClose={() => setGuestParty(null)}
        onRefresh={loadData}
      />
    </div>
  );
}
