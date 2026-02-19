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
  Star,
  Calendar,
  ArrowRightLeft,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { prospectService } from '../../services/prospectService';
import { riderService } from '../../services/riderService';
import { Prospect, InterestLevel } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import Loading from '../shared/Loading';
import ErrorMessage from '../shared/ErrorMessage';

const interestColors: Record<InterestLevel, string> = {
  very: 'bg-green-500/10 text-green-500',
  somewhat: 'bg-amber-500/10 text-amber-500',
  neutral: 'bg-gray-500/10 text-gray-400',
};

const ProspectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, isCaptain } = useAuth();
  const { dayType } = useApp();
  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    if (id) {
      prospectService
        .getProspect(id)
        .then(setProspect)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const formatAddress = (addr: Prospect['address']) => {
    const parts = [addr.street, addr.apt, addr.city, addr.state, addr.zip].filter(Boolean);
    return parts.join(', ');
  };

  const openMaps = () => {
    if (!prospect) return;
    const query = encodeURIComponent(formatAddress(prospect.address));
    window.open(`https://maps.google.com/?q=${query}`, '_blank');
  };

  const handleConvertToRider = async () => {
    if (!prospect || !session) return;
    try {
      setConverting(true);
      // Create a rider from this prospect
      await riderService.createRider({
        name: prospect.name,
        phone: prospect.phone,
        email: prospect.email,
        address: prospect.address,
        bus_route: prospect.bus_route,
        day_type: 'sunday', // Riders go to Sunday
        source: 'prospect',
        notes: prospect.notes,
        status: 'active',
      });
      // Mark prospect as converted
      await prospectService.updateProspect(prospect.id, { status: 'converted' });
      setProspect({ ...prospect, status: 'converted' });
      alert('🎉 Prospect converted to Sunday Rider!');
    } catch (err: any) {
      alert('Failed to convert: ' + err.message);
    } finally {
      setConverting(false);
    }
  };

  const handleDelete = async () => {
    if (!prospect || !id) return;
    if (!window.confirm(`Delete ${prospect.name}? This cannot be undone.`)) return;
    try {
      await prospectService.deleteProspect(id);
      navigate(-1);
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!prospect) return <ErrorMessage message="Prospect not found" />;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{prospect.name}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge className={interestColors[prospect.interest_level]}>
                  {prospect.interest_level === 'very' ? '🔥 Very Interested' : prospect.interest_level === 'somewhat' ? '🤔 Somewhat' : '😐 Neutral'}
                </Badge>
                {prospect.status === 'converted' && (
                  <Badge className="bg-green-500/10 text-green-500">✅ Converted to Rider</Badge>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/prospects/${id}/edit`)}>
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
          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-2">
            {prospect.phone && (
              <a
                href={`tel:${prospect.phone}`}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-xs">Call</span>
              </a>
            )}
            {prospect.phone && (
              <a
                href={`sms:${prospect.phone}`}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="text-xs">Text</span>
              </a>
            )}
            <button
              onClick={openMaps}
              className="flex flex-col items-center gap-1 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-xs">Navigate</span>
            </button>
          </div>

          {/* Convert to Rider */}
          {prospect.status !== 'converted' && (
            <Button
              onClick={handleConvertToRider}
              disabled={converting}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              {converting ? 'Converting...' : 'Convert to Sunday Rider'}
            </Button>
          )}

          {/* Contact Info */}
          <div className="space-y-3 pt-2">
            {prospect.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a href={`tel:${prospect.phone}`} className="text-primary hover:underline">{prospect.phone}</a>
              </div>
            )}
            {prospect.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${prospect.email}`} className="text-primary hover:underline">{prospect.email}</a>
              </div>
            )}
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <button onClick={openMaps} className="text-left text-primary hover:underline">
                {formatAddress(prospect.address)}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Contacted: {new Date(prospect.date_contacted).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Notes */}
          {prospect.notes && (
            <div className="pt-2 border-t border-border">
              <h4 className="font-medium text-sm mb-1">Notes</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{prospect.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProspectDetail;
