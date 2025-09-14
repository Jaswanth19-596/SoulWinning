import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Send } from 'lucide-react';
import { Contact } from '../../types';
import { prayerWallService } from '../../services/prayerWallService';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface PrayerToggleProps {
  contact: Contact;
  onToggle: (updated: Contact) => void;
}

const PrayerToggle: React.FC<PrayerToggleProps> = ({ contact, onToggle }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [prayerRequest, setPrayerRequest] = useState(contact.prayerRequest || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isShared = contact.sharedToPrayerList;

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isShared) {
      // If already shared, toggle off immediately
      handleToggle(false);
    } else {
      // If not shared, show dialog to add prayer request
      setShowDialog(true);
      setError(null);
    }
  };

  const handleToggle = async (share: boolean, request?: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🙏 PrayerToggle: Making request with:', {
        contactId: contact._id,
        share,
        request: share ? request : undefined
      });

      const response = await prayerWallService.togglePrayerListSharing(
        contact._id,
        share,
        share ? request : undefined
      );

      onToggle(response.data);
      setShowDialog(false);
      setPrayerRequest('');
    } catch (err) {
      setError('Failed to update prayer list. Please try again.');
      console.error('Error toggling prayer list:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleToggle(true, prayerRequest.trim());
  };

  const handleCancel = () => {
    setShowDialog(false);
    setPrayerRequest(contact.prayerRequest || '');
    setError(null);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggleClick}
        disabled={loading}
        className={`p-2 rounded-full transition-all duration-300 ${
          isShared
            ? 'bg-primary text-primary-foreground shadow-lg hover:shadow-xl'
            : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
        }`}
        title={isShared ? 'Remove from Prayer List' : 'Add to Prayer List'}
      >
        <Heart
          className={`w-4 h-4 ${isShared ? 'fill-current' : ''}`}
        />
      </motion.button>

      {/* Prayer Request Dialog */}
      {showDialog && createPortal(
        <AnimatePresence>
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full z-10"
              style={{ backgroundColor: 'white', zIndex: 10000 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="border-0">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        Add to Prayer List
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Share {contact.name} with the team for prayer support
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancel}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Prayer Request (Optional)
                      </label>
                      <textarea
                        value={prayerRequest}
                        onChange={(e) => setPrayerRequest(e.target.value)}
                        placeholder="Share any specific prayer needs or conversation details..."
                        className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={4}
                        maxLength={500}
                      />
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">
                          {prayerRequest.length}/500
                        </span>
                        <span className="text-xs text-muted-foreground">
                          This will be visible to all team members
                        </span>
                      </div>
                    </div>

                    {error && (
                      <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                            Adding...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Add to Prayer List
                          </div>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </Card>
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default PrayerToggle;