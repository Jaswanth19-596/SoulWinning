import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Phone, MapPin, Calendar, ChevronRight, User } from 'lucide-react';
import { Contact } from '../../types';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { getInitials, formatDate } from '../../lib/utils';
import PrayerToggle from '../prayer-wall/PrayerToggle';

interface ContactCardProps {
  contact: Contact;
  onClick: () => void;
  onContactUpdate?: (updated: Contact) => void;
}

const ContactCard: React.FC<ContactCardProps> = memo(({ contact, onClick, onContactUpdate }) => {
  const handleContactUpdate = (updated: Contact) => {
    onContactUpdate?.(updated);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="h-[320px] w-full flex flex-col glass-card hover:glass group card-hover border-2 border-white/20 dark:border-white/10 overflow-hidden relative">
        {/* Gradient overlay for extra depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

        <CardHeader className="pb-5 px-6 pt-6 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <Avatar className="w-16 h-16 ring-2 ring-white/30 dark:ring-white/20 group-hover:ring-blue-400/50 dark:group-hover:ring-blue-300/30 transition-all duration-500 shadow-xl hover:shadow-2xl">
                <AvatarFallback className="bg-gradient-to-br from-gradient-from via-gradient-via to-gradient-to text-white font-bold text-xl shadow-2xl">
                  {getInitials(contact.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-foreground text-lg truncate group-hover:text-primary transition-colors duration-300">
                    {contact.name}
                  </h3>
                  {contact.sharedToPrayerList && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 animate-pulse" title="Shared to Prayer List" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(contact.createdAt)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PrayerToggle
                contact={contact}
                onToggle={handleContactUpdate}
              />
              <motion.div
                className="text-muted-foreground group-hover:text-primary transition-colors duration-300"
                whileHover={{ x: 4, scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-5 h-5" />
              </motion.div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 relative z-10 flex-1 flex flex-col">
          {/* Contact Info - Fixed 3 lines */}
          <div className="space-y-2 min-h-[72px] flex flex-col justify-start">
            {/* Phone - Line 1 */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 h-6">
              {contact.phone ? (
                <>
                  <Phone className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className="font-medium truncate">{contact.phone}</span>
                </>
              ) : (
                <div className="h-6" />
              )}
            </div>

            {/* Address - Line 2 & 3 */}
            <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300 h-10">
              {contact.address ? (
                <>
                  <MapPin className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="line-clamp-2 text-sm leading-5">{contact.address}</span>
                </>
              ) : (
                <div className="h-10" />
              )}
            </div>
          </div>

          {/* Tags - Limited height */}
          <div className="flex-1">
            {contact.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 h-7 overflow-hidden">
                {contact.tags.slice(0, 2).map((tag: string, index: number) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs glass-subtle hover:glass border-primary/20 hover:border-primary/40 text-primary transition-all duration-300 hover:scale-105 truncate"
                  >
                    {tag.length > 10 ? `${tag.substring(0, 10)}...` : tag}
                  </Badge>
                ))}
                {contact.tags.length > 2 && (
                  <Badge
                    variant="outline"
                    className="text-xs text-muted-foreground glass-subtle"
                  >
                    +{contact.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Footer - Always at bottom */}
          <div className="flex items-center justify-between pt-3 mt-auto border-t border-border/50">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <User className="w-3 h-3" />
              Soul Contact
            </span>
            <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0">
              View details →
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

ContactCard.displayName = 'ContactCard';

export default ContactCard;