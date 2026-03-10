"use client";

import { Mail, Users, FileText, Settings, ExternalLink } from 'lucide-react';

export type Tab = 'compose' | 'contacts' | 'templates' | 'settings';

interface NavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'compose', label: 'Compose', icon: <Mail className="w-5 h-5" /> },
  { id: 'contacts', label: 'Contacts', icon: <Users className="w-5 h-5" /> },
  { id: 'templates', label: 'Templates', icon: <FileText className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="mobile-only fixed bottom-0 left-0 right-0 bg-[#141416] border-t border-[#27272A] z-40">
        <div className="flex items-center justify-around py-2 px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                activeTab === tab.id
                  ? 'text-[#E11D48]'
                  : 'text-[#71717A] hover:text-[#A1A1AA]'
              }`}
            >
              <div className={activeTab === tab.id ? 'text-[#E11D48]' : ''}>
                {tab.icon}
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar Navigation */}
      <nav className="desktop-only fixed left-0 top-0 bottom-0 w-64 bg-[#141416] border-r border-[#27272A] z-40">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#F43F5E] flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-[#FAFAFA]">ResendMail</h1>
              <p className="text-xs text-[#71717A]">Email Composer</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#E11D48]/10 text-[#E11D48] border border-[#E11D48]/30'
                    : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#1C1C1F]'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Account Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[#27272A]">
          <p className="text-xs text-[#71717A] text-center mb-3">
            Secure client-side email composer
          </p>
          <a
            href="https://sendbox.openprocess.me"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 text-xs text-[#E11D48] hover:text-[#F43F5E] transition-colors"
          >
            Official Site
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </nav>
    </>
  );
}
