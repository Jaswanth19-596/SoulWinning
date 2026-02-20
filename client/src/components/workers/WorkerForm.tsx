import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, User, Phone, Mail, Briefcase } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { workerService } from '../../services/workerService';
import { CreateWorkerData, Gender } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const WorkerForm: React.FC<{ isEdit?: boolean }> = ({ isEdit }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [assignedSection, setAssignedSection] = useState('');
  const [birthday, setBirthday] = useState('');

  useEffect(() => {
    if (isEdit && id) {
      workerService.getWorker(id).then((w) => {
        setName(w.name);
        setGender((w as any).gender || '');
        setPhone(w.phone || '');
        setEmail(w.email || '');
        setAssignedSection(w.assigned_section);
        setBirthday(w.birthday || '');
      });
    }
  }, [isEdit, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name is required'); return; }
    if (!session) return;

    try {
      setLoading(true);
      setError('');

      const data: CreateWorkerData = {
        name: name.trim(),
        gender: gender || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        assigned_section: assignedSection.trim() || 'General',
        bus_route: session.bus_route,
        day_type: 'sunday',
        birthday: birthday || undefined,
        status: 'active',
      };

      if (isEdit && id) {
        await workerService.updateWorker(id, data);
      } else {
        await workerService.createWorker(data);
      }
      navigate(-1);
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      <Card className="glass-card">
        <CardHeader><CardTitle>{isEdit ? 'Edit Worker' : 'Add New Worker'}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1"><User className="w-4 h-4" /> Name *</label>
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
                <label className="text-sm font-medium flex items-center gap-1"><Phone className="w-4 h-4" /> Phone</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(555) 123-4567" type="tel" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1"><Mail className="w-4 h-4" /> Email</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" type="email" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1"><Briefcase className="w-4 h-4" /> Assigned Section</label>
              <Input value={assignedSection} onChange={(e) => setAssignedSection(e.target.value)} placeholder="e.g. North Side, Section A" />
            </div>

            <div className="space-y-2">
               <label className="text-sm font-medium flex items-center gap-1">🎂 Birthday</label>
               <Input 
                 type="date" 
                 value={birthday} 
                 onChange={(e) => setBirthday(e.target.value)} 
               />
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-purple-600" disabled={loading}>
              <Save className="w-4 h-4 mr-1" />
              {loading ? 'Saving...' : isEdit ? 'Update Worker' : 'Add Worker'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WorkerForm;
