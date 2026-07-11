import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ConnectionTest from './pages/ConnectionTest';

function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-teal-700">Jolshaa</h1>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test" element={<ConnectionTest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
