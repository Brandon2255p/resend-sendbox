"use client";

import { useState } from 'react';
import { Eye, EyeOff, Key, AlertCircle, Loader2 } from 'lucide-react';
import { validateApiKey } from '@/lib/resend';
import { setApiKey, setAccount, type ResendAccount } from '@/lib/storage';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApiKeyModal({ isOpen, onClose, onSuccess }: ApiKeyModalProps) {
  const [apiKey, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await validateApiKey(apiKey.trim());

    if (result.error) {
      setError(result.error.message);
      setIsLoading(false);
      return;
    }

    if (result.data) {
      setApiKey(apiKey.trim());
      setAccount(result.data);
      onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md animate-scale-in">
        <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#F43F5E] flex items-center justify-center">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#FAFAFA]">Enter API Key</h2>
              <p className="text-sm text-[#71717A]">Connect to your Resend account</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#A1A1AA] mb-2">
                Resend API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="re_xxxxxxxxxxxxx"
                  className="input pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#A1A1AA] transition-colors"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {error && (
                <div className="flex items-center gap-2 mt-2 text-sm text-[#EF4444]">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!apiKey.trim() || isLoading}
                className="btn btn-primary flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Connect'
                )}
              </button>
            </div>
          </form>

          {/* Help */}
          <p className="mt-4 text-xs text-center text-[#71717A]">
            Don&apos;t have an API key?{' '}
            <a 
              href="https://resend.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#E11D48] hover:underline"
            >
              Get one from Resend
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
