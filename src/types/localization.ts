

export interface LocalizationString {
  key: string;
  value: string;
  _: string; 
}

export interface LocalizationGroup {
  name: string;
  tags?: string;
  string?: LocalizationString[];
  group?: LocalizationGroup[];
}

export interface LocalizationDocument {
  localization: {
    xmlns: string;
    culture: string;
    moduleId: string;
    group: LocalizationGroup[];
  };
}

export interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslationOptions {
  sourceLanguage?: string;
  targetLanguage?: string;
  apiKey?: string;
  preserveFormatting?: boolean;
  skipEmptyStrings?: boolean;
}

export interface LocalizationFile {
  path: string;
  content: LocalizationDocument;
  culture: string;
  moduleId: string;
} 