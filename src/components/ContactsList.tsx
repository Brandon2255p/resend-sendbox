"use client";

import { useState, useMemo } from 'react';
import { Search, RefreshCw, UserPlus, Users, Edit2, Trash2, X, Check } from 'lucide-react';
import { getApiKey, getContacts, setContacts, type ResendContact } from '@/lib/storage';
import { getContacts as fetchResendContacts } from '@/lib/resend';

interface ContactsListProps {
  onSelectContact?: (contact: ResendContact) => void;
}

export function ContactsList({ onSelectContact }: ContactsListProps) {
  const [contacts, setLocalContacts] = useState<ResendContact[]>(() => getContacts());
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Add/Edit contact state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<ResendContact | null>(null);
  const [newContact, setNewContact] = useState({ email: '', first_name: '', last_name: '' });

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

  const handleAddContact = () => {
    if (!newContact.email.trim()) return;
    
    const contact: ResendContact = {
      id: `local-${Date.now()}`,
      email: newContact.email.trim(),
      first_name: newContact.first_name.trim() || null,
      last_name: newContact.last_name.trim() || null,
      created_at: new Date().toISOString(),
    };
    
    const updated = [...contacts, contact];
    setLocalContacts(updated);
    setContacts(updated);
    setNewContact({ email: '', first_name: '', last_name: '' });
    setShowAddForm(false);
  };

  const handleEditContact = (contact: ResendContact) => {
    setEditingContact(contact);
    setNewContact({
      email: contact.email,
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
    });
  };

  const handleSaveEdit = () => {
    if (!editingContact || !newContact.email.trim()) return;
    
    const updated = contacts.map(c => 
      c.id === editingContact.id 
        ? {
            ...c,
            email: newContact.email.trim(),
            first_name: newContact.first_name.trim() || null,
            last_name: newContact.last_name.trim() || null,
          }
        : c
    );
    
    setLocalContacts(updated);
    setContacts(updated);
    setEditingContact(null);
    setNewContact({ email: '', first_name: '', last_name: '' });
  };

  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter(c => c.id !== id);
    setLocalContacts(updated);
    setContacts(updated);
  };

  const handleCancelEdit = () => {
    setEditingContact(null);
    setShowAddForm(false);
    setNewContact({ email: '', first_name: '', last_name: '' });
  };

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
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary p-2"
            title="Add contact"
          >
            <UserPlus className="w-5 h-5" />
          </button>
          <button
            onClick={refreshContacts}
            disabled={isRefreshing}
            className="btn btn-ghost p-2"
            title="Refresh contacts"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Add/Edit Contact Form */}
      {(showAddForm || editingContact) && (
        <div className="card mb-4 border-[#E11D48]/30">
          <h3 className="text-sm font-medium text-[#FAFAFA] mb-3">
            {editingContact ? 'Edit Contact' : 'Add Contact'}
          </h3>
          <div className="space-y-3">
            <input
              type="email"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              placeholder="Email address"
              className="input text-sm"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newContact.first_name}
                onChange={(e) => setNewContact({ ...newContact, first_name: e.target.value })}
                placeholder="First name"
                className="input text-sm flex-1"
              />
              <input
                type="text"
                value={newContact.last_name}
                onChange={(e) => setNewContact({ ...newContact, last_name: e.target.value })}
                placeholder="Last name"
                className="input text-sm flex-1"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                className="btn btn-secondary flex-1"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={editingContact ? handleSaveEdit : handleAddContact}
                disabled={!newContact.email.trim()}
                className="btn btn-primary flex-1"
              >
                <Check className="w-4 h-4" />
                {editingContact ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

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
            <div
              key={contact.id}
              className="card flex items-center gap-3 group"
            >
              <button
                onClick={() => handleSelectContact(contact)}
                className="flex-1 flex items-center gap-3 text-left min-w-0"
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
              </button>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEditContact(contact)}
                  className="p-2 text-[#71717A] hover:text-[#E11D48] transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteContact(contact.id)}
                  className="p-2 text-[#71717A] hover:text-[#EF4444] transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
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
              : 'Add contacts to your list to get started'}
          </p>
          {!searchQuery && (
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setShowAddForm(true)}
                className="btn btn-primary"
              >
                <UserPlus className="w-4 h-4" />
                Add Contact
              </button>
              <button
                onClick={refreshContacts}
                className="btn btn-secondary"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
