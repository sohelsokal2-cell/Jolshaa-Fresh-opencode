import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

export default function DesignSystemDemo() {
  const [testInput, setTestInput] = useState('');
  const [errorInput, setErrorInput] = useState('');

  return (
    <div className="min-h-screen bg-background p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-primary mb-2 font-sans">Jolshaa Central Design System</h1>
          <p className="text-gray-500">Bilingual, consistent UI foundation</p>
        </div>

        {/* Buttons section */}
        <Card className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Button Component (বাটন ভ্যারিয়েন্ট)</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">
              প্রাথমিক বাটন / Primary
            </Button>
            <Button variant="secondary">
              সেকেন্ডারি বাটন / Secondary
            </Button>
            <Button variant="accent">
              সাহায্য চাই / Accent (Coral)
            </Button>
            <Button variant="ghost">
              ঘোস্ট বাটন / Ghost
            </Button>
            <Button variant="primary" disabled>
              Disabled State
            </Button>
          </div>
        </Card>

        {/* Inputs section */}
        <Card className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Input Component (ইনপুট ফিল্ড)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="ব্যবহারকারীর নাম / Username"
              placeholder="username লিখুন"
              id="username"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              required
            />
            <Input
              label="ইমেইল এড্রেস / Email Address"
              placeholder="arif@example.com"
              id="email"
              type="email"
              value={errorInput}
              onChange={(e) => setErrorInput(e.target.value)}
              error={errorInput.length > 0 && !errorInput.includes('@') ? 'Invalid email format' : ''}
            />
          </div>
        </Card>

        {/* Cards section */}
        <Card className="mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Card Component (কার্ড কন্টেইনার)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-teal-50 border border-teal-100 rounded-md">
              <h3 className="font-semibold text-primary mb-1">Teal Accents</h3>
              <p className="text-xs text-gray-600">Perfect for success states and general info cards.</p>
            </div>
            <div className="p-4 bg-orange-50 border border-orange-100 rounded-md">
              <h3 className="font-semibold text-accent mb-1">Coral Accents</h3>
              <p className="text-xs text-gray-600">Used for urgent status notifications and alerts.</p>
            </div>
            <div className="p-4 bg-amber-50 border border-amber-100 rounded-md">
              <h3 className="font-semibold text-accent-amber mb-1">Warning Accents</h3>
              <p className="text-xs text-gray-600">Misleading information and review status warnings.</p>
            </div>
          </div>
        </Card>

        {/* Theme variables demo */}
        <Card>
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Custom Color Tokens Preview (থিম কালার)</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center text-xs font-semibold text-white">
            <div className="bg-primary p-4 rounded-md shadow-sm">
              <span className="block mb-1">#1B6B5A</span>
              Primary (Teal)
            </div>
            <div className="bg-primary-light p-4 rounded-md shadow-sm text-gray-800">
              <span className="block mb-1">#4ECBA8</span>
              Primary Light
            </div>
            <div className="bg-accent p-4 rounded-md shadow-sm">
              <span className="block mb-1">#E8541C</span>
              Accent (Coral)
            </div>
            <div className="bg-accent-amber p-4 rounded-md shadow-sm">
              <span className="block mb-1">#F2A33C</span>
              Amber
            </div>
            <div className="bg-accent-green p-4 rounded-md shadow-sm">
              <span className="block mb-1">#2E9E5B</span>
              Green
            </div>
            <div className="bg-background border border-gray-200 p-4 rounded-md shadow-sm text-gray-800">
              <span className="block mb-1">#F5F7F5</span>
              Background
            </div>
          </div>
        </Card>

        {/* Back Link */}
        <div className="mt-8 text-center">
          <a href="/test" className="text-sm font-semibold text-primary hover:underline">
            ← Go to Connection Test
          </a>
        </div>

      </div>
    </div>
  );
}
