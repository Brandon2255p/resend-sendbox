"use client";

import { useState } from 'react';
import { Settings as SettingsIcon, Key, User, Trash2, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { getApiKey, setApiKey, getAccount, setAccount, clearAllData, type ResendAccount } from '@/lib/storage';
import { validateApiKey } from '@/lib/resend';

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

  const handleUpdateApiKey = async () => {
    if (!apiKey.trim()) return;

    setIsVerifying(true);
    setMessage(null);

    const result = await validateApiKey(apiKey.trim());

    if (result.error) {
      setMessage({ type: 'error', text: result.error.message });
      setIsVerifying(false);
      return;
    }

    if (result.data) {
      setApiKey(apiKey.trim());
      setAccount(result.data);
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

      {/* Account Info */}
      {account && (
        <div className="card mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E11D48] to-[#F43F5E] flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#FAFAFA]">{account.name || 'Your Account'}</p>
              <p className="text-xs text-[#71717A]">Connected to Resend</p>
            </div>
          </div>
          <div className="p-3 bg-[#1C1C1F] rounded-lg">
            <p className="text-xs text-[#71717A] mb-1">From Email</p>
            <p className="text-sm text-[#FAFAFA]">{account.email}</p>
          </div>
        </div>
      )}

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
