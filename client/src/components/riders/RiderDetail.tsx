import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Check,
  MessageSquare,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { riderService } from '../../services/riderService';
import { Rider } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import Loading from '../shared/Loading';
import ErrorMessage from '../shared/ErrorMessage';

const RiderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isCaptain } = useAuth();
  const [rider, setRider] = useState<Rider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const loadRider = async () => {
    if (!id) return;
    try {
      const data = await riderService.getRider(id);
      setRider(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRider();
  }, [loadRider]);

  const isVisitedToday = rider
    ? (rider.visit_history || []).some((v) => v.date === today)
    : false;

  const handleToggle = async () => {
    if (!id) return;
    try {
      await riderService.logVisit(id);
      await loadRider();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!rider || !id) return;
    if (!window.confirm(`Delete ${rider.name}?`)) return;
    try {
      await riderService.deleteRider(id);
      navigate(-1);
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const formatAddress = (addr: Rider['address']) => {
    return [addr.street, addr.apt, addr.city, addr.state, addr.zip].filter(Boolean).join(', ');
  };

  const openMaps = () => {
    if (!rider) return;
    window.open(`https://maps.google.com/?q=${encodeURIComponent(formatAddress(rider.address))}`, '_blank');
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!rider) return <ErrorMessage message="Rider not found" />;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-2xl">{rider.name}</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/riders/${id}/edit`)}>
                <Edit className="w-4 h-4" />
              </Button>
              {isCaptain && (
                <Button variant="ghost" size="sm" onClick={handleDelete} className="text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Today's Status Toggle */}
          <Button
            onClick={handleToggle}
            className={`w-full ${
              isVisitedToday
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gradient-to-r from-primary to-purple-600'
            } text-white`}
          >
            <Check className="w-4 h-4 mr-2" />
            {isVisitedToday
              ? '✅ Visited Today — Tap to Undo'
              : 'Mark as Visited Today'}
          </Button>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2">
            {rider.phone && (
              <a href={`tel:${rider.phone}`} className="flex flex-col items-center gap-1 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-xs">Call</span>
              </a>
            )}
            {rider.phone && (
              <a href={`sms:${rider.phone}`} className="flex flex-col items-center gap-1 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="text-xs">Text</span>
              </a>
            )}
            <button onClick={openMaps} className="flex flex-col items-center gap-1 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-xs">Navigate</span>
            </button>
          </div>

          {/* Info */}
          <div className="space-y-3 pt-2">
            {rider.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a href={`tel:${rider.phone}`} className="text-primary hover:underline">{rider.phone}</a>
              </div>
            )}
            {rider.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${rider.email}`} className="text-primary hover:underline">{rider.email}</a>
              </div>
            )}
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <button onClick={openMaps} className="text-left text-primary hover:underline">{formatAddress(rider.address)}</button>
            </div>
            {rider.emergency_contact && (
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-sm">Emergency: {rider.emergency_contact} {rider.emergency_phone && `(${rider.emergency_phone})`}</span>
              </div>
            )}
          </div>

          {/* Visit History */}
          {(rider.visit_history || []).length > 0 && (
            <div className="pt-2 border-t border-border">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                <Clock className="w-4 h-4" /> Visit History
              </h4>
              <div className="flex flex-wrap gap-2">
                {(rider.visit_history || []).slice(0, 20).map((v, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(v.date).toLocaleDateString()}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {rider.notes && (
            <div className="pt-2 border-t border-border">
              <h4 className="font-medium text-sm mb-1">Notes</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{rider.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RiderDetail;
