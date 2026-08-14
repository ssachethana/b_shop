'use client';

import React, { useState, useRef, useCallback } from 'react';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export interface ImageUploadProps {
  /** Current image URL (controlled) */
  value: string;
  /** Called with the uploaded R2 public URL, or '' when removed */
  onChange: (url: string) => void;
  /** Called when a validation or network error occurs */
  onError?: (msg: string) => void;
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const;
const MAX_SIZE_MB = 5;

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function ImageUpload({ value, onChange, onError }: ImageUploadProps) {
  const [isDragging, setIsDragging]       = useState(false);
  const [isUploading, setIsUploading]     = useState(false);
  const [preview, setPreview]             = useState<string | null>(value || null);
  const [uploadError, setUploadError]     = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Validation ──────────────────────────────
  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type as typeof ACCEPTED_TYPES[number]))
      return 'Only JPG, PNG, WEBP, and GIF files are accepted.';
    if (file.size > MAX_SIZE_MB * 1024 * 1024)
      return `File must be under ${MAX_SIZE_MB}MB.`;
    return null;
  };

  // ── Upload ───────────────────────────────────
  const uploadFile = useCallback(async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setUploadError(validationError);
      onError?.(validationError);
      return;
    }

    // Instant local preview while uploading
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Upload failed');

      onChange(data.url);
      setUploadSuccess(true);
    } catch (err: any) {
      const msg = err.message || 'Upload failed';
      setUploadError(msg);
      onError?.(msg);
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  }, [onChange, onError]);

  // ── Handlers ─────────────────────────────────
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleRemove = () => {
    setPreview(null);
    setUploadSuccess(false);
    setUploadError(null);
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  // ── Render ────────────────────────────────────
  return (
    <div className="flex flex-col gap-2">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !preview && inputRef.current?.click()}
        className={[
          'relative flex flex-col items-center justify-center',
          'border-2 border-dashed rounded-lg transition-all duration-200',
          preview ? 'cursor-default' : 'cursor-pointer',
          isDragging
            ? 'border-blue-500 bg-blue-50 scale-[1.01]'
            : uploadError
              ? 'border-red-300 bg-red-50'
              : uploadSuccess
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50',
        ].join(' ')}
        style={{ minHeight: preview ? 'auto' : '148px' }}
      >
        {/* ── Preview state ── */}
        {preview ? (
          <div className="relative w-full">
            <img
              src={preview}
              alt="Product preview"
              className="w-full h-44 object-cover rounded-lg"
            />

            {/* Hover overlay actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                className="px-3 py-1.5 bg-white text-gray-800 text-xs font-medium rounded-md shadow hover:bg-gray-100 transition"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove(); }}
                className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-md shadow hover:bg-red-600 transition"
              >
                Remove
              </button>
            </div>

            {/* Uploaded badge */}
            {uploadSuccess && (
              <span className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded-full shadow">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Uploaded
              </span>
            )}
          </div>

        /* ── Uploading state ── */
        ) : isUploading ? (
          <div className="flex flex-col items-center gap-3 py-8">
            <svg className="animate-spin w-10 h-10 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <p className="text-sm text-gray-500 font-medium">Uploading…</p>
          </div>

        /* ── Idle / empty state ── */
        ) : (
          <div className="flex flex-col items-center gap-2 py-6 px-4 text-center select-none">
            <div className={`p-3 rounded-full transition-colors ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}`}>
              <svg
                className={`w-6 h-6 transition-colors ${isDragging ? 'text-blue-600' : 'text-gray-400'}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>

            <div>
              <p className={`text-sm font-medium transition-colors ${isDragging ? 'text-blue-600' : 'text-gray-600'}`}>
                {isDragging ? 'Drop to upload' : 'Drag & drop product image'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                or{' '}
                <span
                  className="text-blue-500 hover:text-blue-700 underline cursor-pointer font-medium"
                  onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
                >
                  browse files
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                JPG, PNG, WEBP, GIF · max {MAX_SIZE_MB}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }}
      />

      {/* Validation / network error */}
      {uploadError && (
        <p className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          {uploadError}
        </p>
      )}
    </div>
  );
}