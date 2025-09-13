'use client';

import { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/i18n-context';
import { I18nService } from '@ciuna/sb';

interface LocalizedTextProps {
  contentId: string;
  contentType: 'listing_title' | 'listing_description' | 'vendor_name' | 'vendor_description' | 'service_title' | 'service_description' | 'category_name' | 'category_description';
  fieldName: string;
  fallback?: string;
  className?: string;
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export default function LocalizedText({
  contentId,
  contentType,
  fieldName,
  fallback,
  className = '',
  as: Component = 'span'
}: LocalizedTextProps) {
  const { currentLanguage } = useI18n();
  const [text, setText] = useState<string>(fallback || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLocalizedText();
  }, [contentId, contentType, fieldName, currentLanguage]);

  const loadLocalizedText = async () => {
    try {
      setLoading(true);
      const localizedText = await I18nService.getLocalizedContent(
        contentType,
        contentId,
        currentLanguage,
        fieldName
      );
      
      if (localizedText) {
        setText(localizedText);
      } else if (fallback) {
        setText(fallback);
      } else {
        setText(`${contentType}.${fieldName}`);
      }
    } catch (error) {
      console.error('Error loading localized text:', error);
      setText(fallback || `${contentType}.${fieldName}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Component className={`animate-pulse bg-gray-200 rounded ${className}`}>
        {fallback || 'Loading...'}
      </Component>
    );
  }

  return (
    <Component className={className}>
      {text}
    </Component>
  );
}

// Hook for managing localized content
export function useLocalizedContent(
  contentId: string,
  contentType: LocalizedTextProps['contentType'],
  fieldName: string,
  fallback?: string
) {
  const { currentLanguage } = useI18n();
  const [text, setText] = useState<string>(fallback || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
  }, [contentId, contentType, fieldName, currentLanguage]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const localizedText = await I18nService.getLocalizedContent(
        contentType,
        contentId,
        currentLanguage,
        fieldName
      );
      
      if (localizedText) {
        setText(localizedText);
      } else if (fallback) {
        setText(fallback);
      } else {
        setText(`${contentType}.${fieldName}`);
      }
    } catch (err) {
      console.error('Error loading localized content:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setText(fallback || `${contentType}.${fieldName}`);
    } finally {
      setLoading(false);
    }
  };

  const updateContent = async (newText: string) => {
    try {
      setError(null);
      await I18nService.setLocalizedContent(
        contentType,
        contentId,
        currentLanguage,
        fieldName,
        newText
      );
      setText(newText);
    } catch (err) {
      console.error('Error updating localized content:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  return {
    text,
    loading,
    error,
    updateContent,
    refetch: loadContent
  };
}

// Component for editing localized content
interface LocalizedTextEditorProps extends LocalizedTextProps {
  onSave?: (text: string) => void;
  editable?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function LocalizedTextEditor({
  contentId,
  contentType,
  fieldName,
  fallback,
  className = '',
  as: Component = 'span',
  onSave,
  editable = false,
  placeholder,
  maxLength
}: LocalizedTextEditorProps) {
  const { text, loading, error, updateContent } = useLocalizedContent(
    contentId,
    contentType,
    fieldName,
    fallback
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text);

  useEffect(() => {
    setEditText(text);
  }, [text]);

  const handleSave = async () => {
    if (editText !== text) {
      await updateContent(editText);
      onSave?.(editText);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(text);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Component className={`animate-pulse bg-gray-200 rounded ${className}`}>
        {fallback || 'Loading...'}
      </Component>
    );
  }

  if (error) {
    return (
      <Component className={`text-red-500 ${className}`}>
        Error: {error}
      </Component>
    );
  }

  if (editable && isEditing) {
    return (
      <div className="space-y-2">
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full p-2 border rounded-md resize-none ${className}`}
          rows={3}
        />
        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <Component 
      className={`${editable ? 'cursor-pointer hover:bg-gray-50' : ''} ${className}`}
      onClick={editable ? () => setIsEditing(true) : undefined}
    >
      {text}
      {editable && (
        <span className="ml-2 text-xs text-gray-400">✏️</span>
      )}
    </Component>
  );
}
