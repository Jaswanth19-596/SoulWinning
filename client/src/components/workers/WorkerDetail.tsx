import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  Clock,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { workerService } from '../../services/workerService';
import { Worker } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import Loading from '../shared/Loading';
import ErrorMessage from '../shared/ErrorMessage';

const WorkerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isCaptain } = useAuth();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const loadWorker = useCallback(async () => {
    if (!id) return;
    try {
      const data = await workerService.getWorker(id);
      setWorker(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadWorker();
  }, [loadWorker]);


  const handleDelete = async () => {
    if (!worker || !id) return;
    if (!window.confirm(`Delete ${worker.name}?`)) return;
    try {
      await workerService.deleteWorker(id);
      navigate(-1);
    } catch (err: any) {
      alert('Failed to delete: ' + err.message);
    }
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!worker) return <ErrorMessage message="Worker not found" />;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Button>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{worker.name}</CardTitle>
              <Badge variant="secondary" className="mt-2">
                <Briefcase className="w-3 h-3 mr-1" /> {worker.assigned_section}
              </Badge>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/workers/${id}/edit`)}>
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
          <div className="space-y-3 pt-2">
            {worker.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <a href={`tel:${worker.phone}`} className="text-primary hover:underline">{worker.phone}</a>
              </div>
            )}
            {worker.email && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${worker.email}`} className="text-primary hover:underline">{worker.email}</a>
              </div>
            )}
          </div>

          {/* Attendance History */}
          {(worker.attendance_log || []).length > 0 && (
            <div className="pt-2 border-t border-border">
              <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                <Clock className="w-4 h-4" /> Attendance History
              </h4>
              <div className="flex flex-wrap gap-2">
                {(worker.attendance_log || []).slice(0, 20).map((a, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(a.date).toLocaleDateString()}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WorkerDetail;
