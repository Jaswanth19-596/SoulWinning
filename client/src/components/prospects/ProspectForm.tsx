import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, User, Phone, Mail, MapPin, Star, FileText } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { prospectService } from '../../services/prospectService';
import { CreateProspectData, InterestLevel, Address, Gender } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import AddressAutocomplete from '../ui/AddressAutocomplete';

const ProspectForm: React.FC<{ isEdit?: boolean }> = ({ isEdit }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [apt, setApt] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [interestLevel, setInterestLevel] = useState<InterestLevel>('somewhat');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      prospectService.getProspect(id).then((p) => {
        setName(p.name);
        setGender((p as any).gender || '');
        setPhone(p.phone || '');
        setEmail(p.email || '');
        setStreet(p.address.street || '');
        setApt(p.address.apt || '');
        setCity(p.address.city || '');
        setState(p.address.state || '');
        setZip(p.address.zip || '');
        setInterestLevel(p.interest_level);
        setNotes(p.notes || '');
      });
    }
  }, [isEdit, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!session) return;

    try {
      setLoading(true);
      setError('');

      const address: Address = { 
        street: street.trim() || undefined, 
        apt: apt.trim() || undefined, 
        city: city.trim() || undefined, 
        state: state.trim() || undefined, 
        zip: zip.trim() || undefined, 
      };
      const data: CreateProspectData = {
        name: name.trim(),
        gender: gender || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address,
        date_contacted: new Date().toISOString().split('T')[0],
        interest_level: interestLevel,
        notes: notes.trim() || undefined,
        status: 'active',
        day_type: 'sunday',
        bus_route: session.bus_route,
      };

      if (isEdit && id) {
        await prospectService.updateProspect(id, data);
      } else {
        await prospectService.createProspect(data);
      }
      navigate(-1);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Prospect' : 'Add New Prospect'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <User className="w-4 h-4" /> Name *
              </label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
            </div>

            {/* Gender Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">👤 Gender</label>
              <div className="flex gap-2">
                {(['male', 'female'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(gender === g ? '' : g)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                      gender === g
                        ? g === 'male'
                          ? 'bg-blue-500/10 border-blue-500 text-blue-600'
                          : 'bg-pink-500/10 border-pink-500 text-pink-600'
                        : 'border-input hover:border-primary/30'
                    }`}
                  >
                    {g === 'male' ? '👨 Male' : '👩 Female'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Phone className="w-4 h-4" /> Phone
                </label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" type="tel" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <Mail className="w-4 h-4" /> Email
                </label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" type="email" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <MapPin className="w-4 h-4" /> Address
              </label>
              <AddressAutocomplete
                value={street}
                onChange={setStreet}
                onSelect={(addr) => {
                  setStreet(addr.street);
                  setCity(addr.city);
                  setState(addr.state);
                  setZip(addr.zip);
                }}
                placeholder="Start typing an address..."
              />
              <div className="grid grid-cols-4 gap-2">
                <Input value={apt} onChange={(e) => setApt(e.target.value)} placeholder="Apt" />
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" className="col-span-1" />
                <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="State" maxLength={2} />
                <Input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="Zip" maxLength={10} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Star className="w-4 h-4" /> Interest Level
              </label>
              <div className="flex gap-2">
                {(['very', 'somewhat', 'neutral'] as InterestLevel[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setInterestLevel(level)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                      interestLevel === level
                        ? level === 'very'
                          ? 'bg-green-500/10 border-green-500 text-green-500'
                          : level === 'somewhat'
                          ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                          : 'bg-gray-500/10 border-gray-500 text-gray-400'
                        : 'border-input hover:border-primary/30'
                    }`}
                  >
                    {level === 'very' ? '🔥 Very' : level === 'somewhat' ? '🤔 Somewhat' : '😐 Neutral'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <FileText className="w-4 h-4" /> Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about the conversation..."
                className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm resize-y"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-purple-600"
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-1" />
              {loading ? 'Saving...' : isEdit ? 'Update Prospect' : 'Add Prospect'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProspectForm;
