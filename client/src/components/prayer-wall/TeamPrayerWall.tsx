import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Clock, User, Tag } from 'lucide-react';
import { prayerWallService, PrayerWallItem } from '../../services/prayerWallService';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { getInitials, formatTimeAgo } from '../../lib/utils';
import Loading from '../shared/Loading';
import ErrorMessage from '../shared/ErrorMessage';
import PrayerItemComments from './PrayerItemComments';

const TeamPrayerWall: React.FC = () => {
  const [prayerItems, setPrayerItems] = useState<PrayerWallItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedItem, setSelectedItem] = useState<PrayerWallItem | null>(null);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    loadPrayerItems();
  }, []);

  const loadPrayerItems = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await prayerWallService.getPrayerWallItems(pageNum, 10);

      if (pageNum === 1) {
        setPrayerItems(response.data);
      } else {
        setPrayerItems(prev => [...prev, ...response.data]);
      }

      setHasMore(response.pagination.current < response.pagination.pages);
      setPage(pageNum);
    } catch (err) {
      setError('Failed to load prayer wall items. Please try again.');
      console.error('Error loading prayer items:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreItems = () => {
    if (hasMore && !loading) {
      loadPrayerItems(page + 1);
    }
  };

  const handleShowComments = (item: PrayerWallItem) => {
    setSelectedItem(item);
    setShowComments(true);
  };

  const handleCloseComments = () => {
    setShowComments(false);
    setSelectedItem(null);
  };

  if (loading && page === 1) {
    return <Loading message="Loading prayer wall..." />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorMessage
          message={error}
          onDismiss={() => setError(null)}
        />
        <div className="text-center">
          <Button
            onClick={() => loadPrayerItems(1)}
            variant="outline"
            size="sm"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gradient-from via-gradient-via to-gradient-to rounded-2xl flex items-center justify-center shadow-xl">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Team Prayer Wall</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A shared space where our soul winning team can lift each other up in prayer.
          See prayer requests from contacts shared by team members and offer your support.
        </p>
      </motion.div>

      {/* Prayer Items */}
      <div className="space-y-4">
        <AnimatePresence>
          {prayerItems.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/30 hover:border-l-primary">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-gradient-to-br from-gradient-from via-gradient-via to-gradient-to text-white">
                          {getInitials(item.userId.username)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>Shared by {item.userId.username}</span>
                          <Clock className="w-3 h-3 ml-2" />
                          <span>{formatTimeAgo(item.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contact Details */}
                  {(item.address || item.phone) && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      {item.address && <p>{item.address}</p>}
                      {item.phone && <p>{item.phone}</p>}
                    </div>
                  )}

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      {item.tags.map((tag, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Prayer Request */}
                  {item.prayerRequest && (
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                        <Heart className="w-4 h-4 text-primary" />
                        Prayer Request
                      </h4>
                      <p className="text-sm text-foreground leading-relaxed">
                        {item.prayerRequest}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShowComments(item)}
                          className="text-muted-foreground hover:text-primary"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {item.commentCount} {item.commentCount === 1 ? 'Prayer' : 'Prayers'}
                        </Button>
                      </motion.div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">🙏 Praying</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center pt-6">
            <Button
              onClick={loadMoreItems}
              disabled={loading}
              variant="outline"
              size="lg"
              className="min-w-32"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Loading...
                </div>
              ) : (
                'Load More'
              )}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && prayerItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 space-y-4"
          >
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No Prayer Requests Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              When team members share contacts to the prayer list, they will appear here for everyone to see and pray for.
            </p>
          </motion.div>
        )}
      </div>

      {/* Comments Modal */}
      <AnimatePresence>
        {showComments && selectedItem && (
          <PrayerItemComments
            item={selectedItem}
            onClose={handleCloseComments}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamPrayerWall;