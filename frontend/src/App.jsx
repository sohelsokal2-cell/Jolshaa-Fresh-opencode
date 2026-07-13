import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastProvider } from './components/Toast';
import ConnectionTest from './pages/ConnectionTest';
import DesignSystemDemo from './pages/DesignSystemDemo';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NewsFeed from './pages/NewsFeed';
import Messenger from './pages/Messenger';
import Profile from './pages/Profile';
import Groups from './pages/Groups';
import PagesManagement from './pages/PagesManagement';
import SearchResults from './pages/SearchResults';
import Reels from './pages/Reels';
import Watch from './pages/Watch';
import Events from './pages/Events';
import SahajjoChai from './pages/SahajjoChai';
import FactCheckPreview from './pages/FactCheckPreview';
import Settings from './pages/Settings';
import Friends from './pages/Friends';
import CreatorDashboard from './pages/CreatorDashboard';
import AdminPanel from './pages/AdminPanel';
import AdminProtectedRoute from './components/AdminProtectedRoute';

function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
      <h1 className="text-3xl font-bold text-primary mb-2">{title} Page Coming Soon</h1>
      <p className="text-gray-500 mb-6">এই পেজটি শীঘ্রই যুক্ত করা হবে। আমাদের সাথেই থাকুন।</p>
      <Link to="/feed" className="text-sm font-semibold text-primary hover:underline">
        ← Go to News Feed / নিউজ ফিডে ফিরে যান
      </Link>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected News Feed */}
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <NewsFeed />
              </ProtectedRoute>
            }
          />

          {/* Protected Messenger */}
          <Route
            path="/messenger"
            element={
              <ProtectedRoute>
                <Messenger />
              </ProtectedRoute>
            }
          />

          {/* Protected Profile */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Protected Groups */}
          <Route
            path="/groups"
            element={
              <ProtectedRoute>
                <Groups />
              </ProtectedRoute>
            }
          />

          {/* Protected Pages Management */}
          <Route
            path="/pages"
            element={
              <ProtectedRoute>
                <PagesManagement />
              </ProtectedRoute>
            }
          />

          {/* Protected Search Results */}
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <SearchResults />
              </ProtectedRoute>
            }
          />

          {/* Placeholders for Nav & Sidebar items to prevent broken routing */}
          <Route
            path="/watch"
            element={
              <ProtectedRoute>
                <Watch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            }
          />
          <Route path="/notifications" element={<PlaceholderPage title="Notifications / বিজ্ঞপ্তি" />} />
          <Route
            path="/sahajjo"
            element={
              <ProtectedRoute>
                <SahajjoChai />
              </ProtectedRoute>
            }
          />
          <Route
            path="/friends"
            element={
              <ProtectedRoute>
                <Friends />
              </ProtectedRoute>
            }
          />
          <Route path="/reels" element={
            <ProtectedRoute>
              <Reels />
            </ProtectedRoute>
          } />
          <Route path="/saved" element={<PlaceholderPage title="Saved Posts / সেভ করা পোস্ট" />} />
          <Route path="/memories" element={<PlaceholderPage title="Memories / স্মৃতি" />} />
          <Route path="/creator-hub" element={
            <ProtectedRoute>
              <CreatorDashboard />
            </ProtectedRoute>
          } />

          {/* Admin Panel — admin-only protected */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminProtectedRoute>
                <AdminPanel />
              </AdminProtectedRoute>
            </ProtectedRoute>
          } />

          {/* Real Settings page */}
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Developer Testing Routes */}
          <Route path="/test" element={<ConnectionTest />} />
          <Route path="/design" element={<DesignSystemDemo />} />
          <Route path="/factcheck-preview" element={<FactCheckPreview />} />
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
