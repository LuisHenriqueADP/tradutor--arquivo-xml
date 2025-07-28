import axios from 'axios'
import { TranslationResult, TranslationOptions } from '../types/localization'

export class TranslationService {
  private apiKey?: string;
  private baseUrl = 'https://translate.googleapis.com/translate_a/single'

  constructor(options?: TranslationOptions) {
    this.apiKey = options?.apiKey;
  }

  
  async translateText(
    text: string, 
    sourceLanguage: string = 'en', 
    targetLanguage: string = 'pt'
  ): Promise<TranslationResult> {
    try {
      
      const cleanText = text.trim();
      
      if (!cleanText) {
        return {
          originalText: text,
          translatedText: text,
          sourceLanguage,
          targetLanguage
        };
      }

     
      const response = await axios.get(this.baseUrl, {
        params: {
          client: 'gtx',
          sl: sourceLanguage,
          tl: targetLanguage,
          dt: 't',
          q: cleanText
        },
        timeout: 10000
      });

     
      const translatedText = this.extractTranslatedText(response.data);

      return {
        originalText: cleanText,
        translatedText: translatedText || cleanText,
        sourceLanguage,
        targetLanguage
      };
    } catch (error) {
      console.warn(`Erro na tradução de "${text}": ${error instanceof Error ? error.message : String(error)}`);
      
      
      return {
        originalText: text,
        translatedText: text,
        sourceLanguage,
        targetLanguage
      };
    }
  }

  
  async translateBatch(
    texts: string[], 
    sourceLanguage: string = 'en', 
    targetLanguage: string = 'pt'
  ): Promise<TranslationResult[]> {
    const results: TranslationResult[] = [];
    
    for (const text of texts) {
      try {
        const result = await this.translateText(text, sourceLanguage, targetLanguage);
        results.push(result);
        
       
        await this.delay(100);
      } catch (error) {
        console.warn(`Erro na tradução em lote para "${text}": ${error instanceof Error ? error.message : String(error)}`);
        results.push({
          originalText: text,
          translatedText: text,
          sourceLanguage,
          targetLanguage
        });
      }
    }
    
    return results;
  }

  
  private extractTranslatedText(responseData: any): string {
    try {
      if (Array.isArray(responseData) && responseData[0]) {
        const translations = responseData[0];
        if (Array.isArray(translations)) {
          return translations
            .map((item: any) => item?.[0] || '')
            .join('')
            .trim();
        }
      }
      return '';
    } catch (error) {
      console.warn('Erro ao extrair texto traduzido:', error);
      return '';
    }
  }

  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.translateText('Hello', 'en', 'pt');
      return result.translatedText.toLowerCase().includes('olá') || 
             result.translatedText.toLowerCase().includes('oi');
    } catch (error) {
      return false;
    }
  }
} 