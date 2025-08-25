'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, Construction } from 'lucide-react';

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent">
                    SecureVault
                  </span>
                  <p className="text-xs text-gray-500 -mt-1">Documentation</p>
                </div>
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/wallet" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Enterprise Treasury</Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">About</Link>
              <Link href="/docs" className="text-blue-600 font-medium">Documentation</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-24">
        <div className="text-center">
          {/* Go Back Button */}
          <div className="mb-12">
            <Link 
              href="/"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>

          {/* Coming Soon Content */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-16">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Documentation Coming Soon
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto">
              We&apos;re working hard to create comprehensive documentation for SecureVault. 
              This will include detailed guides, API references, and best practices for 
              enterprise treasury management.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 mb-8">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-semibold text-blue-900">What&apos;s Coming</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4 text-left max-w-3xl mx-auto">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-blue-900">Getting Started Guide</p>
                    <p className="text-sm text-blue-700">Step-by-step setup for your first treasury</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-blue-900">API Reference</p>
                    <p className="text-sm text-blue-700">Complete contract and service documentation</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-blue-900">Security Best Practices</p>
                    <p className="text-sm text-blue-700">Multi-signature configuration guidelines</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-blue-900">Integration Examples</p>
                    <p className="text-sm text-blue-700">Code samples and deployment tutorials</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-center justify-center space-x-3 mb-3">
                <Construction className="w-5 h-5 text-amber-600" />
                <span className="font-semibold text-amber-800">Under Development</span>
              </div>
              <p className="text-amber-700 text-sm">
                Our team is actively working on comprehensive documentation. 
                In the meantime, you can explore the application or contact us for support.
              </p>
            </div>
          </div>

          {/* Additional Actions */}
          <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/wallet"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              <span>Try SecureVault</span>
            </Link>
            <Link 
              href="/about"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 rounded-xl hover:bg-white hover:shadow-lg transition-all duration-200 font-semibold"
            >
              <span>Learn More</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
} 