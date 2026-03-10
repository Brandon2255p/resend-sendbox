"use client";

import { useState } from 'react';
import { RefreshCw, FileText, Eye, Mail } from 'lucide-react';
import { getApiKey, getTemplates, setTemplates, type ResendTemplate } from '@/lib/storage';
import { getTemplates as fetchResendTemplates } from '@/lib/resend';

interface TemplatesListProps {
  onSelectTemplate?: (template: ResendTemplate) => void;
}

export function TemplatesList({ onSelectTemplate }: TemplatesListProps) {
  const [templates, setLocalTemplates] = useState<ResendTemplate[]>(() => getTemplates());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<ResendTemplate | null>(null);

  const refreshTemplates = async () => {
    const apiKey = getApiKey();
    if (!apiKey) return;

    setIsRefreshing(true);
    const result = await fetchResendTemplates(apiKey);
    
    if (result.data?.data) {
      const templatesData = result.data.data;
      setLocalTemplates(templatesData);
      setTemplates(templatesData);
    }
    
    setIsRefreshing(false);
  };

  // Load templates on mount if empty
  if (templates.length === 0 && !isRefreshing) {
    refreshTemplates();
  }

  const handleUseTemplate = (template: ResendTemplate) => {
    onSelectTemplate?.(template);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E11D48] to-[#F43F5E] flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#FAFAFA]">Templates</h2>
            <p className="text-sm text-[#71717A]">{templates.length} available templates</p>
          </div>
        </div>
        <button
          onClick={refreshTemplates}
          disabled={isRefreshing}
          className="btn btn-ghost p-2"
          title="Refresh templates"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Templates List */}
      {templates.length > 0 && (
        <div className="space-y-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="card hover:border-[#E11D48]/50"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-[#FAFAFA]">{template.name}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPreviewTemplate(template)}
                    className="p-2 rounded-lg text-[#71717A] hover:text-[#A1A1AA] hover:bg-[#27272A] transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleUseTemplate(template)}
                    className="p-2 rounded-lg text-[#71717A] hover:text-[#E11D48] hover:bg-[#E11D48]/10 transition-colors"
                    title="Use template"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {template.subject && (
                <p className="text-xs text-[#71717A] truncate">
                  Subject: {template.subject}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {templates.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-[#1C1C1F] flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-[#71717A]" />
          </div>
          <h3 className="text-lg font-medium text-[#FAFAFA] mb-2">No templates yet</h3>
          <p className="text-sm text-[#71717A] mb-4">
            Create templates in your Resend dashboard to use them here
          </p>
          <button
            onClick={refreshTemplates}
            className="btn btn-secondary"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setPreviewTemplate(null)}
          />
          <div className="relative w-full max-w-2xl max-h-[80vh] overflow-hidden animate-scale-in">
            <div className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#27272A]">
                <div>
                  <h3 className="text-lg font-semibold text-[#FAFAFA]">{previewTemplate.name}</h3>
                  {previewTemplate.subject && (
                    <p className="text-sm text-[#71717A]">Subject: {previewTemplate.subject}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUseTemplate(previewTemplate)}
                    className="btn btn-primary"
                  >
                    <Mail className="w-4 h-4" />
                    Use Template
                  </button>
                  <button
                    onClick={() => setPreviewTemplate(null)}
                    className="btn btn-ghost"
                  >
                    Close
                  </button>
                </div>
              </div>
              {/* Content */}
              <div className="p-4 max-h-[60vh] overflow-y-auto scrollbar-thin">
                {previewTemplate.html ? (
                  <div 
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: previewTemplate.html }}
                  />
                ) : (
                  <p className="text-[#71717A]">No HTML content available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
