"use client";

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Key, User, Trash2, Eye, EyeOff, AlertCircle, CheckCircle, Mail, Plus, Edit2, Globe } from 'lucide-react';
import { getApiKey, setApiKey, getAccount, setAccount, clearAllData, getDefaultFromAddress, setDefaultFromAddress, type ResendAccount } from '@/lib/storage';
import { validateApiKey, getDomains } from '@/lib/resend';

interface SettingsProps {
  onApiKeyChange: () => void;
}

export function Settings({ onApiKeyChange }: SettingsProps) {
  const [apiKey, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  
  const account = getAccount();
  const storedApiKey = getApiKey();
  const defaultFrom = getDefaultFromAddress();
  
  // Parse default from address for initial state
  const parseDefaultFrom = () => {
    if (defaultFrom) {
      const match = defaultFrom.match(/^(?:"?([^"]+)"?\s*<)?([^>]+)>?$/);
      if (match) {
        const name = match[1]?.trim() || '';
        const email = match[2]?.trim();
        const [local, domain] = email?.split('@') || ['', ''];
        return { name, local, domain };
      }
      const [local, domain] = defaultFrom.split('@');
      return { name: '', local: local || '', domain: domain || '' };
    }
    return { name: '', local: '', domain: '' };
  };
  const initialFrom = parseDefaultFrom();
  
  // From address state
  const [senderName, setSenderName] = useState(initialFrom.name);
  const [fromEmailLocal, setFromEmailLocal] = useState(initialFrom.local);
  const [fromEmailDomain, setFromEmailDomain] = useState(initialFrom.domain);
  const [domains, setDomains] = useState<{ id: string; name: string; status: string }[]>([]);
  const [isEditingFrom, setIsEditingFrom] = useState(false);
  const [fromMessage, setFromMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load domains and parse default from address
  useEffect(() => {
    const loadDomains = async () => {
      const apiKey = getApiKey();
      if (!apiKey) return;
      
      const result = await getDomains(apiKey);
      if (result.data?.data) {
        setDomains(result.data.data);
      }
    };

    loadDomains();
  }, []);

  const handleUpdateFromAddress = () => {
    if (!fromEmailLocal || !fromEmailDomain) {
      setFromMessage({ type: 'error', text: 'Please enter an email address and select a domain' });
      return;
    }
    
    const email = `${fromEmailLocal}@${fromEmailDomain}`;
    const fullAddress = senderName.trim() 
      ? `"${senderName.trim()}" <${email}>`
      : email;
    
    setDefaultFromAddress(fullAddress);
    setFromMessage({ type: 'success', text: 'Default from address saved!' });
    setIsEditingFrom(false);
  };

  const handleUpdateApiKey = async () => {
    if (!apiKey.trim()) return;

    setIsVerifying(true);
    setMessage(null);

    const result = await validateApiKey(apiKey.trim());

    if (result.error || !result.valid) {
      setMessage({ type: 'error', text: result.error?.message || 'Invalid API key' });
      setIsVerifying(false);
      return;
    }

    if (result.valid) {
      setApiKey(apiKey.trim());
      // Resend doesn't provide account details, so we store a placeholder
      setAccount({
        id: 'resend-account',
        email: 'account@resend.com',
        name: 'Resend Account',
        created_at: new Date().toISOString(),
      });
      setMessage({ type: 'success', text: 'API key updated successfully!' });
      onApiKeyChange();
      setApiKeyInput('');
    }

    setIsVerifying(false);
  };

  const handleClearData = () => {
    clearAllData();
    setShowConfirmClear(false);
    window.location.reload();
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#F43F5E] flex items-center justify-center">
          <SettingsIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[#FAFAFA]">Settings</h2>
          <p className="text-sm text-[#71717A]">Manage your account</p>
        </div>
      </div>

      {/* Default From Address */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="w-4 h-4 text-[#E11D48]" />
          <h3 className="text-sm font-medium text-[#FAFAFA]">Default From Address</h3>
        </div>
        
        {!isEditingFrom ? (
          <div className="flex items-center justify-between p-3 bg-[#1C1C1F] rounded-lg">
            <div>
              <p className="text-sm text-[#FAFAFA]">
                {defaultFrom || 'No default set'}
              </p>
              {!defaultFrom && (
                <p className="text-xs text-[#71717A] mt-1">
                  Set a default from address for your emails
                </p>
              )}
            </div>
            <button
              onClick={() => setIsEditingFrom(true)}
              className="btn btn-ghost p-2"
            >
              {defaultFrom ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Sender Name (optional)"
              className="input text-sm"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={fromEmailLocal}
                onChange={(e) => setFromEmailLocal(e.target.value)}
                placeholder="email"
                className="input text-sm flex-1"
              />
              <span className="text-[#71717A] flex items-center">@</span>
              <select
                value={fromEmailDomain}
                onChange={(e) => setFromEmailDomain(e.target.value)}
                className="input text-sm flex-1 bg-[#18181B]"
              >
                <option value="">Select domain...</option>
                {domains.map((domain) => (
                  <option key={domain.id} value={domain.name}>
                    {domain.name}
                  </option>
                ))}
              </select>
            </div>
            {domains.length === 0 && (
              <p className="text-xs text-[#71717A] flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Fetching domains from Resend...
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditingFrom(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateFromAddress}
                disabled={!fromEmailLocal || !fromEmailDomain}
                className="btn btn-primary flex-1"
              >
                Save
              </button>
            </div>
            {fromMessage && (
              <div className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                fromMessage.type === 'success' 
                  ? 'bg-[#22C55E]/10 text-[#22C55E]' 
                  : 'bg-[#EF4444]/10 text-[#EF4444]'
              }`}>
                {fromMessage.type === 'success' 
                  ? <CheckCircle className="w-4 h-4" />
                  : <AlertCircle className="w-4 h-4" />
                }
                {fromMessage.text}
              </div>
            )}
          </div>
        )}
      </div>

      {/* API Key */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-[#E11D48]" />
          <h3 className="text-sm font-medium text-[#FAFAFA]">API Key</h3>
        </div>
        
        {storedApiKey && (
          <div className="flex items-center gap-2 p-3 bg-[#1C1C1F] rounded-lg mb-4">
            <input
              type={showKey ? 'text' : 'password'}
              value={storedApiKey}
              readOnly
              className="flex-1 bg-transparent text-sm text-[#A1A1AA] outline-none"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="text-[#71717A] hover:text-[#A1A1AA] transition-colors"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        )}

        <div className="space-y-3">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKeyInput(e.target.value)}
            placeholder="Enter new API key (re_xxxxxxxxxxxxx)"
            className="input text-sm"
          />
          <button
            onClick={handleUpdateApiKey}
            disabled={!apiKey.trim() || isVerifying}
            className="btn btn-primary w-full"
          >
            {isVerifying ? 'Verifying...' : 'Update API Key'}
          </button>
        </div>

        {message && (
          <div className={`flex items-center gap-2 mt-4 p-3 rounded-lg ${
            message.type === 'success' 
              ? 'bg-[#22C55E]/10 text-[#22C55E]' 
              : 'bg-[#EF4444]/10 text-[#EF4444]'
          }`}>
            {message.type === 'success' 
              ? <CheckCircle className="w-4 h-4" />
              : <AlertCircle className="w-4 h-4" />
            }
            <p className="text-sm">{message.text}</p>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="card border-[#EF4444]/30">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-4 h-4 text-[#EF4444]" />
          <h3 className="text-sm font-medium text-[#FAFAFA]">Danger Zone</h3>
        </div>
        
        <p className="text-xs text-[#71717A] mb-4">
          Clear all stored data including your API key, contacts, and templates. This cannot be undone.
        </p>

        {!showConfirmClear ? (
          <button
            onClick={() => setShowConfirmClear(true)}
            className="btn btn-secondary w-full text-[#EF4444] border-[#EF4444]/30 hover:bg-[#EF4444]/10"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Data
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-[#EF4444] font-medium">Are you sure?</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmClear(false)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                className="btn bg-[#EF4444] text-white hover:bg-[#DC2626] flex-1"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
