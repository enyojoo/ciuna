'use client';

import { useState } from 'react';
import { Button } from '@ciuna/ui';
import { Badge } from '@ciuna/ui';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@ciuna/ui';
import { useLanguage } from '../contexts/i18n-context';
import { Globe, Check } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'button' | 'dropdown' | 'inline';
  showFlag?: boolean;
  showNativeName?: boolean;
  className?: string;
}

const FLAG_EMOJIS: { [key: string]: string } = {
  'en': '🇺🇸',
  'ru': '🇷🇺',
  'de': '🇩🇪',
  'fr': '🇫🇷',
  'es': '🇪🇸',
  'it': '🇮🇹',
  'pt': '🇵🇹',
  'zh': '🇨🇳',
  'ja': '🇯🇵',
  'ko': '🇰🇷',
  'ar': '🇸🇦',
  'hi': '🇮🇳',
  'tr': '🇹🇷',
  'pl': '🇵🇱',
  'nl': '🇳🇱',
};

export default function LanguageSelector({ 
  variant = 'dropdown',
  showFlag = true,
  showNativeName = true,
  className = ''
}: LanguageSelectorProps) {
  const { currentLanguage, setCurrentLanguage, languages, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find(lang => lang.code === currentLanguage);

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    setIsOpen(false);
  };

  if (variant === 'inline') {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        {languages.map((language) => (
          <Button
            key={language.code}
            variant={currentLanguage === language.code ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center space-x-2"
          >
            {showFlag && (
              <span className="text-lg">
                {FLAG_EMOJIS[language.code] || '🌐'}
              </span>
            )}
            <span>
              {showNativeName ? language.native_name : language.name}
            </span>
            {currentLanguage === language.code && (
              <Check className="h-3 w-3" />
            )}
          </Button>
        ))}
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 ${className}`}
      >
        <Globe className="h-4 w-4" />
        {showFlag && currentLang && (
          <span className="text-lg">
            {FLAG_EMOJIS[currentLang.code] || '🌐'}
          </span>
        )}
        <span>
          {currentLang ? (showNativeName ? currentLang.native_name : currentLang.name) : 'Language'}
        </span>
        {isRTL && <span className="text-xs">←</span>}
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`flex items-center space-x-2 ${className}`}
        >
          <Globe className="h-4 w-4" />
          {showFlag && currentLang && (
            <span className="text-lg">
              {FLAG_EMOJIS[currentLang.code] || '🌐'}
            </span>
          )}
          <span>
            {currentLang ? (showNativeName ? currentLang.native_name : currentLang.name) : 'Language'}
          </span>
          {isRTL && <span className="text-xs">←</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center space-x-2">
              {showFlag && (
                <span className="text-lg">
                  {FLAG_EMOJIS[language.code] || '🌐'}
                </span>
              )}
              <div className="flex flex-col">
                <span className="font-medium">
                  {showNativeName ? language.native_name : language.name}
                </span>
                {showNativeName && language.native_name !== language.name && (
                  <span className="text-xs text-gray-500">
                    {language.name}
                  </span>
                )}
              </div>
            </div>
            {currentLanguage === language.code && (
              <Check className="h-4 w-4 text-blue-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact language selector for mobile
export function CompactLanguageSelector({ className = '' }: { className?: string }) {
  const { currentLanguage, setCurrentLanguage, languages } = useLanguage();
  
  const currentLang = languages.find(lang => lang.code === currentLanguage);

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {languages.slice(0, 5).map((language) => (
        <Button
          key={language.code}
          variant={currentLanguage === language.code ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setCurrentLanguage(language.code)}
          className="px-2 py-1 h-8"
        >
          <span className="text-sm">
            {FLAG_EMOJIS[language.code] || '🌐'}
          </span>
        </Button>
      ))}
      {languages.length > 5 && (
        <Badge variant="secondary" className="text-xs">
          +{languages.length - 5}
        </Badge>
      )}
    </div>
  );
}
