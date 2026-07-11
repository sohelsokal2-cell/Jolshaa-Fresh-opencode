import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ConnectionTest from './pages/ConnectionTest';
import DesignSystemDemo from './pages/DesignSystemDemo';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NewsFeed from './pages/NewsFeed';

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

          {/* Placeholders for Nav & Sidebar items to prevent broken routing */}
          <Route path="/groups" element={<PlaceholderPage title="Groups / গ্রুপসমূহ" />} />
          <Route path="/watch" element={<PlaceholderPage title="Watch / ভিডিও" />} />
          <Route path="/events" element={<PlaceholderPage title="Events / ইভেন্ট" />} />
          <Route path="/messenger" element={<PlaceholderPage title="Messages / বার্তা" />} />
          <Route path="/notifications" element={<PlaceholderPage title="Notifications / বিজ্ঞপ্তি" />} />
          <Route path="/sahajjo" element={<PlaceholderPage title="Sahajjo Chai / সাহায্য চাই" />} />
          <Route path="/search" element={<PlaceholderPage title="Search / খুঁজুন" />} />
          <Route path="/profile" element={<PlaceholderPage title="Profile / প্রোফাইল" />} />
          <Route path="/friends" element={<PlaceholderPage title="Friends / বন্ধুরা" />} />
          <Route path="/pages" element={<PlaceholderPage title="Pages / পেইজ" />} />
          <Route path="/reels" element={<PlaceholderPage title="Reels & Shorts / রিলস ও শর্টস" />} />
          <Route path="/saved" element={<PlaceholderPage title="Saved Posts / সেভ করা পোস্ট" />} />
          <Route path="/memories" element={<PlaceholderPage title="Memories / স্মৃতি" />} />
          <Route path="/creator-hub" element={<PlaceholderPage title="Creator Hub / ক্রিয়েটর হাব" />} />

          {/* Developer Testing Routes */}
          <Route path="/test" element={<ConnectionTest />} />
          <Route path="/design" element={<DesignSystemDemo />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
