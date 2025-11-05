import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'login' | 'signup' | null;

interface ExpandableAuthProps {
  onClose?: () => void;
  initialMode?: AuthMode;
}

export const ExpandableAuth: React.FC<ExpandableAuthProps> = ({ onClose, initialMode = null }) => {
  const [activeCard, setActiveCard] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { signIn, signUp } = useAuth();

  useEffect(() => {
    if (activeCard) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveCard(null);
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [activeCard]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (activeCard === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Login successful!');
          setTimeout(() => {
            setActiveCard(null);
            onClose?.();
          }, 1000);
        }
      } else if (activeCard === 'signup') {
        const { error } = await signUp(email, password, username);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Account created! Please check your email to verify.');
          setTimeout(() => {
            setActiveCard(null);
            onClose?.();
          }, 2000);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setError('');
    setSuccess('');
  };

  const handleCardClick = (mode: AuthMode) => {
    resetForm();
    setActiveCard(mode);
  };

  const authCards = [
    {
      id: 'login' as AuthMode,
      title: 'Sign In',
      description: 'Access your investment portfolio',
      icon: '🔐',
      gradient: 'from-black to-gray-800',
      features: ['Track your investments', 'View real-time data', 'AI-powered insights'],
    },
    {
      id: 'signup' as AuthMode,
      title: 'Sign Up',
      description: 'Start your investment journey',
      icon: '🚀',
      gradient: 'from-gray-800 to-black',
      features: ['Free to start', 'Secure cloud storage', 'Multi-device sync'],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Gradient Backdrop with Glass Blur Effect */}
      <div
        className="fixed inset-0 bg-gradient-to-br from-black/70 via-gray-900/60 to-black/70 backdrop-blur-xl z-40 transition-all duration-500"
        onClick={() => {
          if (activeCard) {
            setActiveCard(null);
          } else {
            onClose?.();
          }
        }}
      />

      {/* Expanded Card Modal with Glassmorphism */}
      {activeCard && (
        <div className="relative z-50 w-full max-w-md">
          <div className="bg-white/95 dark:bg-black/95 backdrop-blur-2xl border-2 border-white/20 dark:border-white/10 rounded-3xl shadow-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100">
            {/* Close Button */}
            <button
              onClick={() => setActiveCard(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors z-10"
            >
              <svg className="w-5 h-5 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Header */}
            <div className={`bg-gradient-to-br ${authCards.find(c => c.id === activeCard)?.gradient} p-8 text-white`}>
              <div className="text-6xl mb-4">{authCards.find(c => c.id === activeCard)?.icon}</div>
              <h2 className="text-3xl font-bold mb-2">{authCards.find(c => c.id === activeCard)?.title}</h2>
              <p className="text-gray-300">{authCards.find(c => c.id === activeCard)?.description}</p>
            </div>

            {/* Form */}
            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeCard === 'signup' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 dark:bg-black/50 backdrop-blur-sm border-2 border-white/30 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-white/60 dark:focus:border-white/30 focus:bg-white/70 dark:focus:bg-black/70 transition-all"
                      placeholder="Choose a username"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                    placeholder="••••••••"
                    required
                    minLength={6}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-3">
                    <p className="text-green-600 dark:text-green-400 text-sm font-medium">{success}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : activeCard === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              {/* Features */}
              <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-800">
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">What you get:</p>
                <ul className="space-y-2">
                  {authCards.find(c => c.id === activeCard)?.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Switch Mode */}
              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => handleCardClick(activeCard === 'login' ? 'signup' : 'login')}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  {activeCard === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Card Grid - Only show if no initial mode was set */}
      {!initialMode && (
        <div className="relative z-50 max-w-4xl w-full">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Welcome to Investo
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Choose an option to continue
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {authCards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`
                group relative overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-800 
                bg-white dark:bg-black cursor-pointer transition-all duration-300
                hover:border-black dark:hover:border-white hover:shadow-2xl hover:scale-105
                ${activeCard === card.id ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}
              `}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              {/* Content */}
              <div className="relative p-8">
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {card.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {card.description}
                </p>

                {/* Features Preview */}
                <ul className="space-y-2 mb-6">
                  {card.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <button className="w-full py-3 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-lg group-hover:bg-gray-800 dark:group-hover:bg-gray-200 transition-colors">
                  Get Started →
                </button>
              </div>
            </div>
          ))}
        </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
