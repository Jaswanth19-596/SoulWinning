import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { KeyRound, ArrowRight, AlertCircle, Bus, Heart } from 'lucide-react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const DEFAULT_KEYS = [
  { code: 'BUS1', role: 'captain', bus_route: 'Route 1', section: 'Main', label: 'Bus 1 Captain' },
  { code: 'BUS1W', role: 'worker', bus_route: 'Route 1', section: 'Main', label: 'Bus 1 Worker' },
  { code: 'BUS2', role: 'captain', bus_route: 'Route 2', section: 'North', label: 'Bus 2 Captain' },
  { code: 'BUS2W', role: 'worker', bus_route: 'Route 2', section: 'North', label: 'Bus 2 Worker' },
];

const Login: React.FC = () => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const { login } = useAuth();

  // Auto-seed bus keys on first load
  useEffect(() => {
    const seed = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'bus_keys'));
        if (snapshot.empty) {
          setSeeding(true);
          for (const key of DEFAULT_KEYS) {
            await addDoc(collection(db, 'bus_keys'), {
              ...key,
              created_at: new Date().toISOString(),
            });
          }
          console.log('✅ Bus keys seeded');
          setSeeding(false);
        }
      } catch (err) {
        console.error('Seed error:', err);
        setSeeding(false);
      }
    };
    seed();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login Submit:', accessCode);
    if (!accessCode.trim()) {
      console.log('Login Error: empty code');
      setError('Please enter your bus access code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      console.log('Calling login...');
      await login(accessCode.trim());
      console.log('Login success');
    } catch (err: any) {
      console.log('Login failed:', err);
      setError(err.message || 'Invalid access code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card border-primary/20 shadow-2xl">
          <CardHeader className="text-center space-y-4 pb-2">
            <motion.div
              className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Bus className="w-10 h-10 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">
              Soul Winning & Bus Ministry
            </CardTitle>
            <CardDescription className="text-base">
              Enter your bus access code to get started
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            {/* Feature Highlights */}
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-primary" />
                <span className="font-semibold text-sm">Ministry Manager</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Saturday Soul Winning Outreach</li>
                <li>• Sunday Bus Ride Management</li>
                <li>• Prospect & Rider Tracking</li>
                <li>• Real-time Team Sync</li>
              </ul>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  Bus Access Code
                </label>
                <Input
                  id="accessCode"
                  type="text"
                  placeholder="Enter your access code"
                  value={accessCode}
                  onChange={(e) => {
                    setAccessCode(e.target.value.toUpperCase());
                    if (error) setError('');
                  }}
                  className="text-center text-lg tracking-widest font-mono"
                  autoComplete="off"
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white font-semibold py-6 text-lg"
                disabled={loading}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <>
                    Enter Ministry
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
              Get your access code from your bus captain or administrator.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;