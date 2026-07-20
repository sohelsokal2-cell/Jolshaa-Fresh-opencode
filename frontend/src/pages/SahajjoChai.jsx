import { useState, useRef, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import SahajjoHero from '../components/SahajjoHero';
import SahajjoFilterBar from '../components/SahajjoFilterBar';
import HelpRequestCard from '../components/HelpRequestCard';
import HelpDetailPanel from '../components/HelpDetailPanel';
import CreateHelpRequestModal from '../components/CreateHelpRequestModal';
import { useAuth } from '../context/AuthContext';
import {
  fetchHelpRequests,
  fetchHelpStats,
  fetchHelperCounts,
  fetchUserOffers,
  subscribeToHelpRequests,
} from '../lib/sahajjoApi';
import './SahajjoChai.css';

const sortUrgency = (a, b) => {
  const order = { immediate: 0, hours: 1, days: 2 };
  return (order[a.urgency] ?? 3) - (order[b.urgency] ?? 3);
};

const SahajjoChai = () => {
  const { user } = useAuth();
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({ resolved: 0, active: 0, helpers: 0, districts: 0 });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRequestIds, setNewRequestIds] = useState(new Set());
  const [helperCounts, setHelperCounts] = useState({});
  const [userOffers, setUserOffers] = useState({});
  const detailPanelRef = useRef(null);

  const loadRequests = useCallback(async () => {
    try {
      const data = await fetchHelpRequests({ category: activeFilter, sortBy });
      setRequests(data);

      // Batch fetch helper counts and user offer status
      const ids = data.map((r) => r.id);
      const [counts, offers] = await Promise.all([
        fetchHelperCounts(ids),
        user ? fetchUserOffers(ids, user.id) : Promise.resolve({}),
      ]);
      setHelperCounts(counts);
      setUserOffers(offers);
    } catch (err) {
      console.error('Failed to load help requests:', err);
    }
  }, [activeFilter, sortBy, user]);

  const loadStats = useCallback(async () => {
    try {
      const s = await fetchHelpStats();
      setStats(s);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([loadRequests(), loadStats()]);
      setLoading(false);
    };
    init();
  }, [loadRequests, loadStats]);

  // Realtime subscription for new requests
  useEffect(() => {
    const unsubscribe = subscribeToHelpRequests((newRequest) => {
      setRequests((prev) => {
        if (prev.some((r) => r.id === newRequest.id)) return prev;
        setNewRequestIds((ids) => new Set(ids).add(newRequest.id));
        setTimeout(() => {
          setNewRequestIds((ids) => {
            const next = new Set(ids);
            next.delete(newRequest.id);
            return next;
          });
        }, 5000);
        // Fetch helper count for new request
        fetchHelperCounts([newRequest.id]).then((c) => {
          setHelperCounts((prev) => ({ ...prev, ...c }));
        });
        return [newRequest, ...prev];
      });
      loadStats();
    });

    return () => unsubscribe();
  }, [loadStats]);

  const selectedRequest = requests.find((r) => r.id === selectedRequestId) || null;

  const handleSelectRequest = (requestId) => {
    setSelectedRequestId(requestId);
    if (window.innerWidth < 860 && detailPanelRef.current) {
      detailPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleRequestCreated = () => {
    loadRequests();
    loadStats();
  };

  const handleRequestResolved = () => {
    loadRequests();
    loadStats();
  };

  const handleOfferSent = (requestId) => {
    setUserOffers((prev) => ({ ...prev, [requestId]: true }));
    setHelperCounts((prev) => ({ ...prev, [requestId]: (prev[requestId] || 0) + 1 }));
  };

  const sortedRequests = [...requests].sort((a, b) => {
    if (sortBy === 'urgency') return sortUrgency(a, b);
    return 0;
  });

  return (
    <div className="sahajjo-page-body">
      <Navbar messageCount={5} notificationCount={7} />

      <SahajjoHero
        stats={stats}
        onRequestHelp={() => user && setShowCreateModal(true)}
      />

      <div className="sahajjo-content-area">
        <div className="sahajjo-feed-col">
          <SahajjoFilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)', fontFamily: 'var(--font-bn)' }}>
              লোড হচ্ছে...
            </div>
          ) : sortedRequests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)', fontFamily: 'var(--font-bn)' }}>
              কোনো সাহায্যের অনুরোধ নেই।
            </div>
          ) : (
            sortedRequests.map((request) => (
              <HelpRequestCard
                key={request.id}
                request={request}
                selectedRequestId={selectedRequestId}
                onSelectRequest={handleSelectRequest}
                isNew={newRequestIds.has(request.id)}
                helperCount={helperCounts[request.id] || 0}
                hasUserOffered={!!userOffers[request.id]}
                onOfferSent={handleOfferSent}
              />
            ))
          )}

          <div className="sahajjo-feed-footer">
            <div className="feed-footer-bn">সবার সাহায্যে আরও অনেকে নিরাপদ হোক।</div>
            <div className="feed-footer-en">Together, we keep our community safe.</div>
          </div>
        </div>

        <div ref={detailPanelRef}>
          <HelpDetailPanel
            request={selectedRequest}
            onRequestResolved={handleRequestResolved}
          />
        </div>
      </div>

      {showCreateModal && (
        <CreateHelpRequestModal
          onClose={() => setShowCreateModal(false)}
          onRequestCreated={handleRequestCreated}
        />
      )}
    </div>
  );
};

export default SahajjoChai;
