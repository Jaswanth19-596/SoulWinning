import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, User, Lock, ArrowRight, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import Loading from '../shared/Loading';
import { InputSanitizer } from '../../utils/inputSanitizer';
import { ErrorSanitizer } from '../../utils/errorSanitizer';
import { rateLimiter, RATE_LIMITS } from '../../utils/rateLimiter';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(RATE_LIMITS.LOGIN.maxRequests);
  const [lockoutTime, setLockoutTime] = useState<number>(0);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Check rate limit status on component mount and update remaining attempts
  useEffect(() => {
    const updateRateLimit = () => {
      const currentAttempts = rateLimiter.getCurrentRequestCount('login', RATE_LIMITS.LOGIN.windowMs);
      const remaining = Math.max(0, RATE_LIMITS.LOGIN.maxRequests - currentAttempts);
      setRemainingAttempts(remaining);

      if (remaining === 0) {
        const remainingTime = rateLimiter.getRemainingTime('login', RATE_LIMITS.LOGIN.maxRequests, RATE_LIMITS.LOGIN.windowMs);
        setLockoutTime(Math.ceil(remainingTime / 1000));
      }
    };

    updateRateLimit();
    const interval = setInterval(updateRateLimit, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format lockout time display
  const formatLockoutTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return minutes > 0 ? `${minutes}:${secs.toString().padStart(2, '0')}` : `${secs}s`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Sanitize input based on field type
    const sanitizedValue = name === 'username'
      ? InputSanitizer.sanitizeByFieldType(value, 'email').substring(0, 100)
      : value.substring(0, 128); // Limit password length for security

    setFormData({
      ...formData,
      [name]: sanitizedValue,
    });

    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for malicious content
    if (InputSanitizer.containsMaliciousContent(formData.username) ||
        InputSanitizer.containsMaliciousContent(formData.password)) {
      setError('Invalid input detected. Please check your credentials.');
      return;
    }

    // Basic validation
    if (!formData.username.trim() || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    // Additional validation
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Check rate limiting
    if (!rateLimiter.canMakeRequest('login', RATE_LIMITS.LOGIN.maxRequests, RATE_LIMITS.LOGIN.windowMs)) {
      const remainingTime = rateLimiter.getRemainingTime('login', RATE_LIMITS.LOGIN.maxRequests, RATE_LIMITS.LOGIN.windowMs);
      setError(`Too many login attempts. Please wait ${Math.ceil(remainingTime / 60000)} minutes before trying again.`);
      return;
    }

    try {
      setLoading(true);
      setError('');
      await login(formData.username.trim(), formData.password);

      // Reset rate limiter on successful login
      setRemainingAttempts(RATE_LIMITS.LOGIN.maxRequests);
      setLockoutTime(0);

      navigate('/');
    } catch (err: any) {
      // Use sanitized error messages
      const sanitizedError = ErrorSanitizer.sanitizeAndLog(err, 'login');
      setError(sanitizedError);

      // Update rate limit status
      const currentAttempts = rateLimiter.getCurrentRequestCount('login', RATE_LIMITS.LOGIN.windowMs);
      const remaining = Math.max(0, RATE_LIMITS.LOGIN.maxRequests - currentAttempts - 1);
      setRemainingAttempts(remaining);

      if (remaining === 0) {
        const remainingTime = rateLimiter.getRemainingTime('login', RATE_LIMITS.LOGIN.maxRequests, RATE_LIMITS.LOGIN.windowMs);
        setLockoutTime(Math.ceil(remainingTime / 1000));
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Signing in..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="glass-card border-2 border-white/20 dark:border-white/10 shadow-2xl">
          <CardHeader className="text-center space-y-6 pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-24 h-24 bg-gradient-to-br from-gradient-from via-gradient-via to-gradient-to rounded-3xl flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all duration-300 hover:rotate-3"
            >
              <Heart className="w-12 h-12 text-white" />
            </motion.div>
            <div>
              <CardTitle className="text-3xl font-bold text-foreground">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-lg mt-2 text-muted-foreground">
                Continue your soul winning journey
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
              >
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
              </motion.div>
            )}

            {/* Rate Limiting Info */}
            {remainingAttempts < RATE_LIMITS.LOGIN.maxRequests && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
              >
                <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <div className="text-amber-700 dark:text-amber-300 text-xs">
                  {lockoutTime > 0 ? (
                    <span>Account temporarily locked. Unlock in: {formatLockoutTime(lockoutTime)}</span>
                  ) : (
                    <span>{remainingAttempts} login attempt{remainingAttempts !== 1 ? 's' : ''} remaining</span>
                  )}
                </div>
              </motion.div>
            )}

            {/* Security Features Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-800 dark:text-blue-300 text-sm font-medium">Security Features</span>
              </div>
              <ul className="text-blue-700 dark:text-blue-300 text-xs space-y-1">
                <li>• Encrypted secure storage</li>
                <li>• Rate limiting protection</li>
                <li>• Input sanitization</li>
                <li>• Session-based authentication</li>
              </ul>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <label
                  htmlFor="username"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Username or Email
                </label>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="h-12 text-base"
                  placeholder="Enter your username or email"
                  autoComplete="username"
                  required
                  aria-describedby="username-help"
                  aria-invalid={error && error.includes('username') ? 'true' : 'false'}
                  maxLength={100}
                  spellCheck={false}
                />
                <div id="username-help" className="sr-only">
                  Enter your registered username or email address
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="h-12 text-base"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  aria-describedby="password-help"
                  aria-invalid={error && error.includes('password') ? 'true' : 'false'}
                  maxLength={128}
                  spellCheck={false}
                />
                <div id="password-help" className="sr-only">
                  Enter your account password. Minimum 6 characters required.
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  type="submit"
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  disabled={loading || lockoutTime > 0}
                  aria-describedby="login-button-help"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
                <div id="login-button-help" className="sr-only">
                  {lockoutTime > 0
                    ? `Login temporarily disabled. Try again in ${formatLockoutTime(lockoutTime)}`
                    : "Click to sign in to your account"
                  }
                </div>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Sign up here
                </Link>
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;