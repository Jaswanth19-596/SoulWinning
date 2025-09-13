import React, { memo } from 'react';
import { Contact } from '../../types';

interface ContactCardProps {
  contact: Contact;
  onClick: () => void;
}

const ContactCard: React.FC<ContactCardProps> = memo(({ contact, onClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="contact-card" onClick={onClick}>
      <div className="contact-card-header">
        <h3 className="contact-name">{contact.name}</h3>
        <span className="contact-date">{formatDate(contact.createdAt)}</span>
      </div>

      {contact.phone && (
        <div className="contact-info">
          <span className="contact-phone">{contact.phone}</span>
        </div>
      )}

      {contact.address && (
        <div className="contact-info">
          <span className="contact-address">{contact.address}</span>
        </div>
      )}

      {contact.tags.length > 0 && (
        <div className="contact-tags">
          {contact.tags.map((tag, index) => (
            <span key={index} className="contact-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="contact-card-footer">
        <span className="view-details">Tap to view details →</span>
      </div>
    </div>
  );
});

ContactCard.displayName = 'ContactCard';

export default ContactCard;