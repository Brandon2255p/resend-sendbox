"use client";

import { useState, useMemo } from 'react';
import { Search, RefreshCw, UserPlus, Users } from 'lucide-react';
import { getApiKey, getContacts, setContacts, type ResendContact } from '@/lib/storage';
import { getContacts as fetchResendContacts } from '@/lib/resend';

interface ContactsListProps {
  onSelectContact?: (contact: ResendContact) => void;
}

export function ContactsList({ onSelectContact }: ContactsListProps) {
  const [contacts, setLocalContacts] = useState<ResendContact[]>(() => getContacts());
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshContacts = async () => {
    const apiKey = getApiKey();
    if (!apiKey) return;

    setIsRefreshing(true);
    const result = await fetchResendContacts(apiKey);
    
    if (result.data?.data) {
      const contactsData = result.data.data;
      setLocalContacts(contactsData);
      setContacts(contactsData);
    }
    
    setIsRefreshing(false);
  };

  // Load contacts on mount if empty
  if (contacts.length === 0 && !isRefreshing) {
    refreshContacts();
  }

  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) {
      return contacts;
    }
    
    const query = searchQuery.toLowerCase();
    return contacts.filter(contact =>
      contact.email.toLowerCase().includes(query) ||
      contact.first_name?.toLowerCase().includes(query) ||
      contact.last_name?.toLowerCase().includes(query)
    );
  }, [searchQuery, contacts]);

  const handleSelectContact = (contact: ResendContact) => {
    onSelectContact?.(contact);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#F43F5E] flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#FAFAFA]">Contacts</h2>
            <p className="text-sm text-[#71717A]">{contacts.length} saved contacts</p>
          </div>
        </div>
        <button
          onClick={refreshContacts}
          disabled={isRefreshing}
          className="btn btn-ghost p-2"
          title="Refresh contacts"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#71717A]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search contacts..."
          className="input pl-10"
        />
      </div>

      {/* Contacts List */}
      {filteredContacts.length > 0 && (
        <div className="space-y-2">
          {filteredContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => handleSelectContact(contact)}
              className="card w-full text-left flex items-center gap-3 hover:border-[#E11D48]/50"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E11D48] to-[#F43F5E] flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {contact.first_name?.[0] || contact.email[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#FAFAFA] truncate">
                  {contact.first_name} {contact.last_name}
                </p>
                <p className="text-xs text-[#71717A] truncate">{contact.email}</p>
              </div>
              <UserPlus className="w-4 h-4 text-[#71717A] flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredContacts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-[#1C1C1F] flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[#71717A]" />
          </div>
          <h3 className="text-lg font-medium text-[#FAFAFA] mb-2">No contacts found</h3>
          <p className="text-sm text-[#71717A] mb-4">
            {searchQuery 
              ? 'Try adjusting your search' 
              : 'Add contacts to your Resend audience to see them here'}
          </p>
          {!searchQuery && (
            <button
              onClick={refreshContacts}
              className="btn btn-secondary"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          )}
        </div>
      )}
    </div>
  );
}
