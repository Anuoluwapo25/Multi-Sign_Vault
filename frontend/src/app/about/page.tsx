'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Shield, Users, Zap, Lock, Award, Heart, CheckCircle, Code, Database, Globe, Cpu } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  const features = [
    {
      icon: Shield,
      title: 'Threshold Signatures',
      description: 'Multi-party computation with configurable threshold requirements'
    },
    {
      icon: Users,
      title: 'Distributed Key Management',
      description: 'No single point of failure with distributed key shares'
    },
    {
      icon: Zap,
      title: 'Instant Execution',
      description: 'Fast transaction execution once threshold is met'
    },
    {
      icon: Lock,
      title: 'Zero Trust Architecture',
      description: 'Enterprise-grade security with audit trails'
    }
  ];

  const benefits = [
    'Eliminates single points of failure',
    'Reduces operational risk',
    'Enables secure multi-signer workflows',
    'Provides comprehensive audit trails',
    'Supports regulatory compliance',
    'Scales with enterprise needs'
  ];

  

  const securityStandards = [
    {
      icon: Shield,
      title: 'ISO 27001 Compliance',
      description: 'Adherence to international information security management standards'
    },
    {
      icon: Lock,
      title: 'SOC 2 Type II',
      description: 'Service Organization Control compliance for security, availability, and confidentiality'
    },
    {
      icon: Award,
      title: 'Regulatory Framework',
      description: 'Built to meet Nigerian financial services and digital asset regulations'
    },
    {
      icon: CheckCircle,
      title: 'Industry Best Practices',
      description: 'Following OWASP security guidelines and blockchain security standards'
    }
  ];

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-slate-700 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">SecureVault</span>
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/mpc-wallet" className="text-gray-700 hover:text-blue-600 transition-colors">MPC Wallet</Link>
              <Link href="/about" className="text-blue-600 font-medium">About</Link>
              <Link href="/docs" className="text-gray-700 hover:text-blue-600 transition-colors">Documentation</Link>
            </nav>

            <ConnectButton />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            About <span className="text-blue-600">SecureVault</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
            Enterprise-grade multi-party computation wallet infrastructure for secure digital asset management. 
            Built with cutting-edge cryptography and zero-trust principles.
          </p>
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <Heart className="w-5 h-5 text-red-500" />
            <span>Built with security-first principles</span>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                To democratize enterprise-grade security by providing accessible, 
                secure multi-party computation infrastructure for digital asset management.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We believe that every organization should have access to military-grade 
                security for their digital assets, regardless of size or technical expertise.
              </p>
              <div className="flex items-center space-x-4">
                <Award className="w-8 h-8 text-yellow-500" />
                <span className="text-lg font-semibold text-gray-900">
                  Enterprise-Grade Security Infrastructure
                </span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Why MPC?</h3>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Distributed Security</h4>
                    <p className="text-gray-600">No single point of failure</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Threshold Signatures</h4>
                    <p className="text-gray-600">Configurable approval requirements</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Zero Trust</h4>
                    <p className="text-gray-600">Verify everything, trust nothing</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Audit Trail</h4>
                    <p className="text-gray-600">Complete transaction history</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SecureVault?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built for enterprises that demand the highest security standards
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Enterprise Benefits
            </h2>
            <p className="text-xl text-gray-600">
              Transform your digital asset security with MPC technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-gray-700 text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Standards Section */}
      <section className="py-20 gradient-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Security Standards & Compliance
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built to meet the highest industry standards and regulatory requirements for enterprise security
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {securityStandards.map((standard, index) => (
              <div key={index} className="card text-center group hover:scale-105 transition-transform duration-300">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-shadow">
                  <standard.icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{standard.title}</h3>
                <p className="text-gray-600 leading-relaxed">{standard.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-blue-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Secure Your Assets?
          </h2>
          <p className="text-xl mb-8 text-slate-200">
            Join enterprises worldwide using SecureVault for their digital asset security
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/mpc-wallet" className="bg-white text-slate-900 font-semibold py-3 px-8 rounded-xl hover:bg-gray-100 transition-colors">
              Launch MPC Wallet
            </Link>
            <Link href="/docs" className="border-2 border-white text-white font-semibold py-3 px-8 rounded-xl hover:bg-white hover:text-slate-900 transition-colors">
              View Documentation
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-slate-700 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">SecureVault</span>
              </div>
              <p className="text-gray-400">
                Enterprise-grade MPC wallet infrastructure for secure digital asset management.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/mpc-wallet" className="hover:text-white transition-colors">MPC Wallet</Link></li>
                <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                <li><Link href="/api" className="hover:text-white transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SecureVault. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 