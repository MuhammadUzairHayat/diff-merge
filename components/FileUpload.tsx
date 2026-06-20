'use client';

import { useState, useRef, DragEvent, ReactNode } from 'react';

interface FileUploadProps {
  label: string | ReactNode;
  onFileUpload: (file: File, content: string) => void;
  fileName?: string;
  accept?: string;
  className?: string;
}

export const FileUpload = ({ 
  label, 
  onFileUpload, 
  fileName = '', 
  accept = '.txt,.js,.ts,.py,.java,.cpp,.c,.html,.css,.json,.xml,.md',
  className = '' 
}: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onFileUpload(file, e.target.result as string);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-6 text-center transition-all
        ${isDragging ? 'border-brand bg-bg-hover' : 'border-border bg-bg-secondary'}
        ${fileName ? 'bg-bg-tertiary' : ''}
        ${className}
      `}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        title='upload'
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      
      <p className="text-text-secondary text-sm mb-2">{label}</p>
      
      {fileName ? (
        <div className="flex items-center justify-center gap-3">
          <span className="text-text-primary font-mono text-sm">{fileName}</span>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-text-muted hover:text-text-primary text-xs underline transition-colors"
          >
            Change
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-bg-hover transition-colors"
        >
          Choose File
        </button>
      )}
      
      <p className="text-text-muted text-xs mt-2">or drag & drop</p>
    </div>
  );
};
