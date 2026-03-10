"use client";

import { useState, useCallback } from 'react';
import { Mail, Plus } from 'lucide-react';
import { Navigation, type Tab } from '@/components/Navigation';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { EmailComposer } from '@/components/EmailComposer';
import { ContactsList } from '@/components/ContactsList';
import { TemplatesList } from '@/components/TemplatesList';
import { Settings } from '@/components/Settings';
import { ToastContainer, useToast } from '@/components/Toast';
import { getApiKey, type ResendContact, type ResendTemplate } from '@/lib/storage';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('compose');
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(true);
  const [contacts, setContacts] = useState<ResendContact[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ResendTemplate | undefined>();
  
  const { toasts, addToast, removeToast } = useToast();

  const handleApiKeySuccess = useCallback(() => {
    setShowApiKeyModal(false);
    const { getContacts } = require('@/lib/storage');
    setContacts(getContacts());
    addToast('success', 'Connected to Resend successfully!');
  }, [addToast]);

  const handleApiKeyChange = useCallback(() => {
    const { getContacts } = require('@/lib/storage');
    setContacts(getContacts());
  }, []);

  const handleSelectContact = (_contact: ResendContact) => {
    setActiveTab('compose');
  };

  const handleSelectTemplate = (template: ResendTemplate) => {
    setSelectedTemplate(template);
    setActiveTab('compose');
  };

  const handleSendSuccess = () => {
    addToast('success', 'Email sent successfully!');
  };

  const handleClearTemplate = () => {
    setSelectedTemplate(undefined);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Mobile Header */}
      <header className="mobile-only fixed top-0 left-0 right-0 z-30 bg-[#141416]/80 backdrop-blur-md border-b border-[#27272A]">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E11D48] to-[#F43F5E] flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-[#FAFAFA]">ResendMail</span>
          </div>
          {activeTab === 'compose' && (
            <button
              onClick={() => { setSelectedTemplate(undefined); setActiveTab('compose'); }}
              className="btn btn-primary py-2 px-3"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">New</span>
            </button>
          )}
        </div>
      </header>

      {/* Desktop Layout */}
      <div className="desktop-only flex">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 ml-64 p-8 pt-12">
          <div className="max-w-2xl mx-auto">
            {activeTab === 'compose' && (
              <EmailComposer
                contacts={contacts}
                template={selectedTemplate}
                onSendSuccess={handleSendSuccess}
                onClearTemplate={handleClearTemplate}
              />
            )}
            {activeTab === 'contacts' && (
              <ContactsList onSelectContact={handleSelectContact} />
            )}
            {activeTab === 'templates' && (
              <TemplatesList onSelectTemplate={handleSelectTemplate} />
            )}
            {activeTab === 'settings' && (
              <Settings onApiKeyChange={handleApiKeyChange} />
            )}
          </div>
        </main>
      </div>

      {/* Mobile Layout */}
      <div className="mobile-only pt-16 pb-20 px-4">
        {activeTab === 'compose' && (
          <EmailComposer
            contacts={contacts}
            template={selectedTemplate}
            onSendSuccess={handleSendSuccess}
            onClearTemplate={handleClearTemplate}
          />
        )}
        {activeTab === 'contacts' && (
          <ContactsList onSelectContact={handleSelectContact} />
        )}
        {activeTab === 'templates' && (
          <TemplatesList onSelectTemplate={handleSelectTemplate} />
        )}
        {activeTab === 'settings' && (
          <Settings onApiKeyChange={handleApiKeyChange} />
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* API Key Modal - check API key on render */}
      <ApiKeyModal
        isOpen={showApiKeyModal && !getApiKey()}
        onClose={() => {
          if (!getApiKey()) {
            // Don't allow closing without API key
          }
        }}
        onSuccess={handleApiKeySuccess}
      />
    </div>
  );
}

export default function Home() {
  return <AppContent />;
}
