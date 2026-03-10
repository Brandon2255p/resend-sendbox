"use client";

import { useState, useRef } from 'react';
import { 
  Send, Paperclip, X, ChevronDown, ChevronUp,
  UserPlus, Loader2, CheckCircle
} from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { getApiKey, getAccount, type ResendContact, type ResendTemplate } from '@/lib/storage';
import { sendEmail, fileToBase64, validateEmails, type Attachment } from '@/lib/resend';

interface EmailComposerProps {
  contacts: ResendContact[];
  template?: ResendTemplate;
  onSendSuccess?: () => void;
  onClearTemplate?: () => void;
}

interface EmailField {
  value: string;
  error?: string;
}

export function EmailComposer({ contacts, template, onSendSuccess, onClearTemplate }: EmailComposerProps) {
  const [to, setTo] = useState<EmailField>({ value: '' });
  const [cc, setCc] = useState<EmailField>({ value: '' });
  const [bcc, setBcc] = useState<EmailField>({ value: '' });
  const [subject, setSubject] = useState(template?.subject || '');
  const [content, setContent] = useState(template?.html || '');
  const [attachments, setAttachments] = useState<{ file: File; preview: string }[]>([]);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [contactPickerField, setContactPickerField] = useState<'to' | 'cc' | 'bcc'>('to');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const account = getAccount();

  // Handle template loading
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    const newAttachments = await Promise.all(
      validFiles.map(async (file) => ({
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : 'file'
      }))
    );

    setAttachments(prev => [...prev, ...newAttachments].slice(0, 5));
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const newAttachments = [...prev];
      if (newAttachments[index].preview !== 'file') {
        URL.revokeObjectURL(newAttachments[index].preview);
      }
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  };

  const addContactToField = (email: string, field: 'to' | 'cc' | 'bcc') => {
    const setter = field === 'to' ? setTo : field === 'cc' ? setCc : setBcc;
    const current = field === 'to' ? to.value : field === 'cc' ? cc.value : bcc.value;
    
    const emails = current ? current.split(',').map(e => e.trim()) : [];
    if (!emails.includes(email)) {
      emails.push(email);
    }
    
    setter({ value: emails.join(', '), error: undefined });
    setShowContactPicker(false);
  };

  const validateForm = (): boolean => {
    let isValid = true;
    
    const toEmails = to.value.split(',').map(e => e.trim()).filter(Boolean);
    if (toEmails.length === 0) {
      setTo(prev => ({ ...prev, error: 'At least one recipient is required' }));
      isValid = false;
    } else if (!validateEmails(toEmails)) {
      setTo(prev => ({ ...prev, error: 'Invalid email address' }));
      isValid = false;
    }

    if (cc.value) {
      const ccEmails = cc.value.split(',').map(e => e.trim()).filter(Boolean);
      if (!validateEmails(ccEmails)) {
        setCc(prev => ({ ...prev, error: 'Invalid email address' }));
        isValid = false;
      }
    }

    if (bcc.value) {
      const bccEmails = bcc.value.split(',').map(e => e.trim()).filter(Boolean);
      if (!validateEmails(bccEmails)) {
        setBcc(prev => ({ ...prev, error: 'Invalid email address' }));
        isValid = false;
      }
    }

    if (!subject.trim()) {
      isValid = false;
    }

    if (!content.trim()) {
      isValid = false;
    }

    return isValid;
  };

  const handleSend = async () => {
    if (!validateForm()) return;
    
    const apiKey = getApiKey();
    if (!apiKey) return;

    setIsSending(true);

    const toEmails = to.value.split(',').map(e => e.trim()).filter(Boolean);
    const ccEmails = cc.value.split(',').map(e => e.trim()).filter(Boolean);
    const bccEmails = bcc.value.split(',').map(e => e.trim()).filter(Boolean);

    const emailAttachments: Attachment[] = await Promise.all(
      attachments.map(async ({ file }) => ({
        filename: file.name,
        content: await fileToBase64(file),
        contentType: file.type,
      }))
    );

    const result = await sendEmail(apiKey, {
      from: account?.email || '',
      to: toEmails,
      cc: ccEmails.length > 0 ? ccEmails : undefined,
      bcc: bccEmails.length > 0 ? bccEmails : undefined,
      subject: subject.trim(),
      html: content,
      attachments: emailAttachments.length > 0 ? emailAttachments : undefined,
    });

    setIsSending(false);

    if (result.error) {
      alert(`Failed to send email: ${result.error.message}`);
    } else {
      setSendSuccess(true);
      setTo({ value: '' });
      setCc({ value: '' });
      setBcc({ value: '' });
      setSubject('');
      setContent('');
      setAttachments([]);
      setShowCcBcc(false);
      
      setTimeout(() => {
        setSendSuccess(false);
        onSendSuccess?.();
      }, 2000);
    }
  };

  const filteredContacts = contacts.filter(c => 
    c.email.toLowerCase().includes(to.value.toLowerCase()) ||
    (c.first_name?.toLowerCase().includes(to.value.toLowerCase())) ||
    (c.last_name?.toLowerCase().includes(to.value.toLowerCase()))
  );

  return (
    <div className="animate-fade-in">
      {/* From */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[#A1A1AA] mb-2">From</label>
        <div className="input bg-[#141416] cursor-not-allowed opacity-70">
          {account?.email || 'Loading...'}
        </div>
      </div>

      {/* To */}
      <div className="mb-4 relative">
        <label className="block text-sm font-medium text-[#A1A1AA] mb-2">To</label>
        <div className="relative">
          <input
            type="text"
            value={to.value}
            onChange={(e) => setTo({ value: e.target.value, error: undefined })}
            onFocus={() => { setShowContactPicker(true); setContactPickerField('to'); }}
            placeholder="recipient@example.com"
            className={`input ${to.error ? 'border-[#EF4444] focus:border-[#EF4444]' : ''}`}
          />
          <button
            type="button"
            onClick={() => { setShowContactPicker(!showContactPicker); setContactPickerField('to'); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#A1A1AA]"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>
        {to.error && <p className="text-xs text-[#EF4444] mt-1">{to.error}</p>}
      </div>

      {/* CC/BCC Toggle */}
      <button
        type="button"
        onClick={() => setShowCcBcc(!showCcBcc)}
        className="flex items-center gap-1 text-sm text-[#71717A] hover:text-[#A1A1AA] mb-4 transition-colors"
      >
        {showCcBcc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        {showCcBcc ? 'Hide' : 'Show'} CC/BCC
      </button>

      {/* CC */}
      {showCcBcc && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#A1A1AA] mb-2">CC</label>
          <input
            type="text"
            value={cc.value}
            onChange={(e) => setCc({ value: e.target.value, error: undefined })}
            onFocus={() => { setShowContactPicker(true); setContactPickerField('cc'); }}
            placeholder="cc@example.com"
            className={`input ${cc.error ? 'border-[#EF4444] focus:border-[#EF4444]' : ''}`}
          />
          {cc.error && <p className="text-xs text-[#EF4444] mt-1">{cc.error}</p>}
        </div>
      )}

      {/* BCC */}
      {showCcBcc && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#A1A1AA] mb-2">BCC</label>
          <input
            type="text"
            value={bcc.value}
            onChange={(e) => setBcc({ value: e.target.value, error: undefined })}
            onFocus={() => { setShowContactPicker(true); setContactPickerField('bcc'); }}
            placeholder="bcc@example.com"
            className={`input ${bcc.error ? 'border-[#EF4444] focus:border-[#EF4444]' : ''}`}
          />
          {bcc.error && <p className="text-xs text-[#EF4444] mt-1">{bcc.error}</p>}
        </div>
      )}

      {/* Contact Picker Dropdown */}
      {showContactPicker && filteredContacts.length > 0 && (
        <div className="mb-4 border border-[#27272A] rounded-xl overflow-hidden bg-[#1C1C1F] max-h-48 overflow-y-auto scrollbar-thin">
          {filteredContacts.slice(0, 10).map(contact => (
            <button
              key={contact.id}
              type="button"
              onClick={() => addContactToField(contact.email, contactPickerField)}
              className="w-full px-4 py-3 text-left hover:bg-[#27272A] transition-colors flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E11D48] to-[#F43F5E] flex items-center justify-center text-white text-sm font-medium">
                {contact.first_name?.[0] || contact.email[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm text-[#FAFAFA]">
                  {contact.first_name} {contact.last_name}
                </p>
                <p className="text-xs text-[#71717A]">{contact.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Subject */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Email subject"
          className="input text-lg"
        />
      </div>

      {/* Rich Text Editor */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Message</label>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Write your email content here..."
        />
      </div>

      {/* Attachments */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[#A1A1AA] mb-2">
          Attachments {attachments.length > 0 && `(${attachments.length}/5)`}
        </label>
        
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 bg-[#1C1C1F] rounded-lg border border-[#27272A]"
              >
                {attachment.preview !== 'file' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={attachment.preview} alt="" className="w-6 h-6 rounded object-cover" />
                ) : (
                  <Paperclip className="w-4 h-4 text-[#71717A]" />
                )}
                <span className="text-sm text-[#A1A1AA] max-w-[120px] truncate">
                  {attachment.file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(index)}
                  className="text-[#71717A] hover:text-[#EF4444] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {attachments.length < 5 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 border border-dashed border-[#27272A] rounded-xl text-[#71717A] hover:text-[#A1A1AA] hover:border-[#E11D48] transition-colors w-full justify-center"
          >
            <Paperclip className="w-4 h-4" />
            Add attachment (max 10MB)
          </button>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="*/*"
        />
      </div>

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={isSending || !subject.trim() || !content.trim() || !to.value.trim()}
        className="btn btn-primary w-full py-4 text-base"
      >
        {isSending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Sending...
          </>
        ) : sendSuccess ? (
          <>
            <CheckCircle className="w-5 h-5" />
            Sent!
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Send Email
          </>
        )}
      </button>
    </div>
  );
}
