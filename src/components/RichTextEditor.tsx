"use client";

import { useRef } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, 
  Link2, Heading1, Heading2, Heading3
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

function ToolbarButton({ 
  onClick, 
  children, 
  title 
}: { 
  onClick: () => void; 
  children: React.ReactNode; 
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-2 rounded-lg text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A] transition-colors"
    >
      {children}
    </button>
  );
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  return (
    <div className="border border-[#27272A] rounded-xl overflow-hidden bg-[#1C1C1F]">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-2 border-b border-[#27272A] bg-[#141416] flex-wrap">
        <ToolbarButton onClick={() => execCommand('bold')} title="Bold">
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('italic')} title="Italic">
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('underline')} title="Underline">
          <Underline className="w-4 h-4" />
        </ToolbarButton>
        
        <div className="w-px h-6 bg-[#27272A] mx-1" />
        
        <ToolbarButton onClick={() => execCommand('formatBlock', 'h1')} title="Heading 1">
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('formatBlock', 'h2')} title="Heading 2">
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('formatBlock', 'h3')} title="Heading 3">
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
        
        <div className="w-px h-6 bg-[#27272A] mx-1" />
        
        <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="Bullet List">
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="Numbered List">
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        
        <div className="w-px h-6 bg-[#27272A] mx-1" />
        
        <ToolbarButton onClick={handleLink} title="Insert Link">
          <Link2 className="w-4 h-4" />
        </ToolbarButton>
      </div>
      
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        data-placeholder={placeholder || 'Write your email content here...'}
        className="editor-content p-4 min-h-[200px] max-h-[400px] overflow-y-auto bg-[#1C1C1F] text-[#FAFAFA]"
        style={{ outline: 'none' }}
      />
    </div>
  );
}

export function getTextContent(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}
