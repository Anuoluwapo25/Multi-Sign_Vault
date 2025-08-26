'use client';

import { Building2, Users, CheckCircle, Globe, TrendingUp, Eye, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useStacks } from './providers';

// Stacks Connect Button Component
function StacksConnectButton() {
  const { isSignedIn, connectWallet, disconnect, userSession } = useStacks();

  if (isSignedIn) {
    const userData = userSession.loadUserData();
    const address = userData.profile?.stxAddress?.mainnet || userData.profile?.stxAddress?.testnet;
    const shortAddress = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

    return (
      <div className="flex items-center space-x-2">
        <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded-xl flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="font-medium">{shortAddress}</span>
        </div>
        <button
          onClick={disconnect}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
    >
      <Wallet className="w-5 h-5" />
      <span>Connect Wallet</span>
    </button>
  );
}

export default function Home() {
  const features = [
    {
      icon: Building2,
      title: 'Enterprise Treasury',
      description: 'Secure multi-signature treasury management designed for Nigerian enterprises'
    },
    {
      icon: Globe,
      title: 'STX & Bitcoin Native',
      description: 'Built specifically for STX and Bitcoin asset management with Stacks integration'
    },
    {
      icon: Users,
      title: 'Multi-Signer Security',
      description: 'Configurable approval thresholds with unlimited authorized signers'
    },
    {
      icon: Eye,
      title: 'Full Transparency',
      description: 'Complete audit trails and compliance reporting for regulatory requirements'
    }
  ];

  const benefits = [
    'Multi-signature security for STX and Bitcoin assets',
    'Bulk payroll and vendor payments on Stacks',
    'Department-based access controls',
    'Open-source and fully transparent'
  ];

  const useCases = [
    {
      icon: Building2,
      title: 'Fintech Companies',
      description: 'Secure treasury management for payment processors and digital banks'
    },
    {
      icon: Users,
      title: 'E-commerce Platforms',
      description: 'Multi-signature protection for marketplace transaction funds'
    },
    {
      icon: TrendingUp,
      title: 'Tech Startups',
      description: 'Transparent payroll and operational expense management'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-lg border-b border-gray-200/60 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-800 to-indigo-900 bg-clip-text text-transparent">
                    SecureVault
                  </span>
                  <p className="text-xs text-gray-500 -mt-1">Enterprise Treasury</p>
                </div>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Globe className="w-4 h-4" />
                <span>Nigerian Enterprise Solution</span>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/about" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">About</Link>
              <Link href="/docs" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">Documentation</Link>
            </nav>

            <StacksConnectButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold border border-orange-200">
                ₿ Built on Stacks & Bitcoin
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-600 bg-clip-text text-transparent">
                Enterprise Bitcoin
              </span>
              <span className="block text-gray-900 mt-2">Treasury Management</span>
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-gray-700 max-w-4xl mx-auto leading-relaxed">
              Open-source multi-signature treasury solution built on Stacks blockchain. 
              Securely manage <strong className="text-orange-600">Bitcoin and STX assets</strong> with enterprise-grade 
              multi-party computation and full regulatory compliance.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link href="/wallet" className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white text-xl px-10 py-4 rounded-xl font-bold transition-all duration-200 shadow-xl hover:shadow-2xl">
                Launch Enterprise Treasury
              </Link>
              <Link href="/docs" className="bg-white border-2 border-gray-300 hover:border-orange-400 text-gray-800 text-xl px-10 py-4 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl">
                View Documentation
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-600">Open Source</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">Multi-Sig</div>
                <div className="text-sm text-gray-600">Security</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">Stacks</div>
                <div className="text-sm text-gray-600">Native</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Built for Nigerian Enterprise Needs
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Every feature designed with Nigerian enterprises in mind - from Bitcoin support to regulatory compliance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-200">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Trusted by Nigerian Enterprises
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From fintech startups to established enterprises, secure your Bitcoin treasury operations
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <div key={index} className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <useCase.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">{useCase.title}</h3>
                <p className="text-gray-600 leading-relaxed">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Enterprise Treasury in 3 Steps
            </h2>
            <p className="text-xl text-gray-600">
              Simple setup, maximum security for your Bitcoin and STX assets
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-600 to-orange-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Create Treasury</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Set up your multi-signature treasury with authorized signers from your organization
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-violet-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Manage Assets</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Deposit Bitcoin and STX assets and manage payroll, vendor payments, and operational expenses
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Secure Approvals</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Multiple signers approve transactions ensuring security and preventing unauthorized access
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                Why Nigerian Enterprises Choose SecureVault
              </h2>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                Built with Nigerian regulatory requirements and business practices in mind. 
                Open-source, transparent, and designed for enterprise scale on Stacks blockchain.
              </p>
              
              <div className="space-y-5">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-yellow-100 rounded-3xl p-10 border border-orange-200/50">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">Enterprise Security Features</h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-5 bg-white rounded-xl shadow-sm">
                  <span className="font-semibold text-gray-900">Multi-Signature Protection</span>
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-5 bg-white rounded-xl shadow-sm">
                  <span className="font-semibold text-gray-900">Stacks Native Integration</span>
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex items-center justify-between p-5 bg-white rounded-xl shadow-sm">
                  <span className="font-semibold text-gray-900">Open Source Code</span>
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-orange-600 via-orange-700 to-yellow-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto text-center px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Ready to Secure Your Enterprise Treasury?
          </h2>
          <p className="text-xl mb-12 text-orange-100 leading-relaxed">
            Join Nigerian enterprises already using SecureVault for secure Bitcoin treasury management. 
            Open-source, transparent, and built for scale on Stacks blockchain.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/wallet" className="bg-white text-orange-800 font-bold py-4 px-10 rounded-xl hover:bg-orange-50 transition-all duration-200 shadow-xl text-lg">
              Create Your Treasury
            </Link>
            <Link href="/docs" className="border-2 border-white text-white font-bold py-4 px-10 rounded-xl hover:bg-white hover:text-orange-800 transition-all duration-200 text-lg">
              Read Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold">SecureVault</span>
                  <p className="text-xs text-gray-400">Enterprise Treasury</p>
                </div>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Open-source enterprise treasury management for Nigerian businesses. 
                Secure, transparent, and built for Bitcoin and STX assets on Stacks.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold mb-6 text-lg">Product</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/wallet" className="hover:text-white transition-colors">Enterprise Treasury</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/api" className="hover:text-white transition-colors">Developer API</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security Audit</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-6 text-lg">Support</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/compliance" className="hover:text-white transition-colors">Compliance</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold mb-6 text-lg">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/open-source" className="hover:text-white transition-colors">Open Source</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">&copy; 2024 SecureVault. Open-source enterprise treasury solution.</p>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <span className="text-gray-400">₿</span>
              <span className="text-gray-400">Built on Stacks & Bitcoin</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}