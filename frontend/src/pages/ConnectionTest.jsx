import { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

const API_URL = import.meta.env.VITE_API_URL;

function StatusBadge({ status }) {
  const isOk = status === 'ok';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${
        isOk
          ? 'bg-green-100 text-green-700'
          : status === 'checking'
          ? 'bg-yellow-100 text-yellow-700'
          : 'bg-red-100 text-red-700'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isOk ? 'bg-green-500' : status === 'checking' ? 'bg-yellow-400' : 'bg-red-500'
        }`}
      />
      {isOk ? 'Connected' : status === 'checking' ? 'Checking…' : 'Error'}
    </span>
  );
}

export default function ConnectionTest() {
  const [backendResult, setBackendResult] = useState({ status: 'checking' });
  const [frontendResult, setFrontendResult] = useState({ status: 'checking' });

  // Test 1: frontend → Supabase directly (anon key)
  useEffect(() => {
    async function testFrontendSupabase() {
      try {
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        if (error) {
          setFrontendResult({ status: 'error', message: error.message });
        } else {
          setFrontendResult({ status: 'ok', profileCount: count });
        }
      } catch (err) {
        setFrontendResult({ status: 'error', message: err.message });
      }
    }

    testFrontendSupabase();
  }, []);

  // Test 2: frontend → backend → Supabase (service role key)
  useEffect(() => {
    async function testBackendConnection() {
      try {
        const res = await fetch(`${API_URL}/health/db`);
        const data = await res.json();
        setBackendResult(data);
      } catch (err) {
        setBackendResult({ status: 'error', message: err.message });
      }
    }

    testBackendConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-teal-700 mb-1">Jolshaa</h1>
          <p className="text-gray-500 text-sm">Connection Test · /test</p>
        </div>

        {/* Card 1: Frontend → Supabase */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-gray-800 text-sm">Frontend → Supabase</p>
              <p className="text-xs text-gray-400 mt-0.5">Direct query using anon key (respects RLS)</p>
            </div>
            <StatusBadge status={frontendResult.status} />
          </div>

          <div className="bg-gray-50 rounded-xl p-3 text-xs font-mono text-gray-600 break-all">
            {frontendResult.status === 'checking' && 'Running query…'}
            {frontendResult.status === 'ok' && (
              <>
                <span className="text-green-600">✓</span> profiles table reachable
                <br />
                <span className="text-gray-400">profileCount:</span>{' '}
                <span className="text-teal-700 font-bold">{frontendResult.profileCount}</span>
              </>
            )}
            {frontendResult.status === 'error' && (
              <span className="text-red-600">✗ {frontendResult.message}</span>
            )}
          </div>
        </div>

        {/* Card 2: Frontend → Backend → Supabase */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-semibold text-gray-800 text-sm">Frontend → Backend → Supabase</p>
              <p className="text-xs text-gray-400 mt-0.5">Via Express /api/health/db (service role key)</p>
            </div>
            <StatusBadge status={backendResult.status} />
          </div>

          <div className="bg-gray-50 rounded-xl p-3 text-xs font-mono text-gray-600 break-all">
            {backendResult.status === 'checking' && 'Calling backend…'}
            {backendResult.status === 'ok' && (
              <>
                <span className="text-green-600">✓</span> {backendResult.message || backendResult.database}
                <br />
                <span className="text-gray-400">profileCount:</span>{' '}
                <span className="text-teal-700 font-bold">{backendResult.profileCount}</span>
              </>
            )}
            {backendResult.status === 'error' && (
              <span className="text-red-600">✗ {backendResult.message}</span>
            )}
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-gray-400">
          দুটো card-ই{' '}
          <span className="text-green-600 font-semibold">Connected</span> দেখালে
          Supabase সংযোগ সফল।
          <br />
          এই পেজটা শুধু development টেস্টের জন্য।
        </p>
      </div>
    </div>
  );
}
