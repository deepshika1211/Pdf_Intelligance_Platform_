import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { Sparkles, Mail, Lock, User, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export const Register = () => {
  const [fullName, setFullName] = useState('Aiden Morgan');
  const [email, setEmail] = useState('aiden.morgan@gmail.com');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      addToast('Please fill in both password fields', 'error');
      return;
    }
    if (password !== confirmPassword) {
      addToast('Passwords do not match', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await register(fullName, email, password);
      addToast('Account created successfully!', 'success');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Registration failed. Please try again.';
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950 text-white font-sans overflow-hidden">
      {/* Left Split Screen: Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 p-12 flex-col justify-between overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purpleBrand-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 via-purpleBrand-500 to-cyanBrand-500 p-0.5 shadow-lg">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyanBrand-400" />
            </div>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            PDF<span className="gradient-text">Intel</span>
          </span>
        </div>

        <div className="relative z-10 my-auto py-12 space-y-6 max-w-lg">
          <span className="px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider border border-brand-500/30 inline-block">
            Start 14-Day Pro Trial
          </span>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight text-white">
            Unlock Next-Gen PDF Parsing & Multi-Doc Synthesis
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Join over 10,000+ teams using PDF Intelligence Tool for automated contract reviews, financial audits, and instant question answering.
          </p>

          <div className="space-y-4 pt-4 text-xs font-medium text-slate-300">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <CheckCircle2 className="w-5 h-5 text-brand-400 shrink-0" />
              <span>Unlimited OCR Page Processing & Dense Vector Search</span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <CheckCircle2 className="w-5 h-5 text-purpleBrand-400 shrink-0" />
              <span>Exact Page & Line Citation Snippets in AI Responses</span>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <CheckCircle2 className="w-5 h-5 text-cyanBrand-400 shrink-0" />
              <span>Enterprise SOC2 Type II & Data Encryption at Rest</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500">
          No credit card required for trial setup.
        </div>
      </div>

      {/* Right Split Screen: Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-900/60 backdrop-blur-xl">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center sm:text-left space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Create Free Account
            </h1>
            <p className="text-sm text-slate-400">
              Get started with AI-powered document intelligence.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Aiden Morgan"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aiden.morgan@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-400 pt-1">
              <input
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-brand-500 focus:ring-brand-500"
              />
              <span>I agree to the <a href="#terms" className="text-brand-400 underline">Terms of Service</a> and <a href="#privacy" className="text-brand-400 underline">Privacy Policy</a></span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full font-bold shadow-lg shadow-brand-500/30"
              icon={ArrowRight}
            >
              Create Account
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 pt-2">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-400 hover:text-brand-300 transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
