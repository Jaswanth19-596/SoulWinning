import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, Trash2, Edit3 } from 'lucide-react';
import { prayerWallService, PrayerWallItem, PrayerComment } from '../../services/prayerWallService';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { getInitials, formatTimeAgo } from '../../lib/utils';
import Loading from '../shared/Loading';

interface PrayerItemCommentsProps {
  item: PrayerWallItem;
  onClose: () => void;
}

const PrayerItemComments: React.FC<PrayerItemCommentsProps> = ({ item, onClose }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<PrayerComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [selectedReaction, setSelectedReaction] = useState<'praying' | 'amen' | 'heart'>('praying');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await prayerWallService.getPrayerItemComments(item._id);
      setComments(response.data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  }, [item._id]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      const response = await prayerWallService.addPrayerComment(
        item._id,
        newComment.trim(),
        selectedReaction
      );
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await prayerWallService.deletePrayerComment(commentId);
      setComments(prev => prev.filter(c => c._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      const comment = comments.find(c => c._id === commentId);
      if (!comment) return;

      const response = await prayerWallService.updatePrayerComment(
        commentId,
        editContent.trim(),
        comment.reaction
      );

      setComments(prev =>
        prev.map(c => c._id === commentId ? response.data : c)
      );
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const startEditing = (comment: PrayerComment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const getReactionIcon = (reaction: string) => {
    switch (reaction) {
      case 'praying': return '🙏';
      case 'amen': return '🙌';
      case 'heart': return '❤️';
      default: return '🙏';
    }
  };

  const getReactionLabel = (reaction: string) => {
    switch (reaction) {
      case 'praying': return 'Praying';
      case 'amen': return 'Amen';
      case 'heart': return 'Love';
      default: return 'Praying';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Prayer Comments</h2>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">{item.name}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">
                  Shared by {item.userId.username}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Prayer Request */}
          {item.prayerRequest && (
            <div className="mt-4 p-4 bg-primary/5 border border-primary/10 rounded-lg">
              <p className="text-sm text-foreground leading-relaxed">
                {item.prayerRequest}
              </p>
            </div>
          )}
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto max-h-[400px] p-6 space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <Loading message="Loading prayers..." />
            </div>
          ) : comments.length > 0 ? (
            <AnimatePresence>
              {comments.map((comment, index) => (
                <motion.div
                  key={comment._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-gradient-to-br from-gradient-from via-gradient-via to-gradient-to text-white text-xs">
                          {getInitials(comment.userId.username)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm text-foreground">
                            {comment.userId.username}
                          </span>
                          <span className="text-lg">{getReactionIcon(comment.reaction)}</span>
                          <span className="text-xs text-muted-foreground">
                            {getReactionLabel(comment.reaction)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            • {formatTimeAgo(comment.createdAt)}
                          </span>
                        </div>

                        {editingComment === comment._id ? (
                          <div className="space-y-3">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full p-2 border border-border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                              rows={3}
                              placeholder="Edit your prayer comment..."
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEditComment(comment._id)}
                                disabled={!editContent.trim()}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelEditing}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-foreground leading-relaxed">
                              {comment.content}
                            </p>

                            {user?._id === comment.userId._id && (
                              <div className="flex gap-2 mt-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEditing(comment)}
                                  className="text-xs text-muted-foreground hover:text-foreground p-1 h-auto"
                                >
                                  <Edit3 className="w-3 h-3 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteComment(comment._id)}
                                  className="text-xs text-muted-foreground hover:text-destructive p-1 h-auto"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No prayers yet. Be the first to offer support!</p>
            </div>
          )}
        </div>

        {/* Comment Form */}
        <div className="p-6 border-t border-border/50">
          <form onSubmit={handleSubmitComment} className="space-y-4">
            {/* Reaction Selector */}
            <div className="flex gap-2">
              <span className="text-sm text-muted-foreground">React:</span>
              {(['praying', 'amen', 'heart'] as const).map((reaction) => (
                <button
                  key={reaction}
                  type="button"
                  onClick={() => setSelectedReaction(reaction)}
                  className={`px-3 py-1 rounded-full text-xs border transition-all ${
                    selectedReaction === reaction
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted text-muted-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {getReactionIcon(reaction)} {getReactionLabel(reaction)}
                </button>
              ))}
            </div>

            {/* Comment Input */}
            <div className="flex gap-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-gradient-from via-gradient-via to-gradient-to text-white text-xs">
                  {getInitials(user?.username || '')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your prayers and encouragement..."
                  className="w-full p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {newComment.length}/500
                  </span>
                  <Button
                    type="submit"
                    disabled={!newComment.trim() || submitting}
                    size="sm"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send Prayer
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PrayerItemComments;