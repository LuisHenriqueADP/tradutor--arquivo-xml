import { XMLParser } from '../parsers/xmlParser'
import { TranslationService } from '../services/translationService'
import { LocalizationDocument, LocalizationGroup, LocalizationString, TranslationOptions } from '../types/localization'
import * as path from 'path'

export class LocalizationTranslator {
  private xmlParser: XMLParser;
  private translationService: TranslationService;

  constructor(options?: TranslationOptions) {
    this.xmlParser = new XMLParser();
    this.translationService = new TranslationService(options);
  }

  
  async translateFile(
    inputFilePath: string, 
    outputFilePath?: string,
    sourceLanguage: string = 'en',
    targetLanguage: string = 'pt'
  ): Promise<string> {
    try {
      console.log(`📖 Lendo arquivo: ${inputFilePath}`);
      
     
      const localizationFile = await this.xmlParser.parseFile(inputFilePath);
      
      
      const outputPath = outputFilePath || this.generateOutputPath(inputFilePath, targetLanguage);
      
      console.log(`🔄 Iniciando tradução de ${sourceLanguage} para ${targetLanguage}...`);
      
      
      const translatedDocument = await this.translateDocument(
        localizationFile.content,
        sourceLanguage,
        targetLanguage
      );
      
      
      translatedDocument.localization.culture = targetLanguage;
      
      console.log(`💾 Salvando arquivo traduzido: ${outputPath}`);
      
      
      await this.xmlParser.saveToFile(translatedDocument, outputPath);
      
      console.log(`✅ Tradução concluída com sucesso!`);
      
      return outputPath;
    } catch (error) {
      throw new Error(`Erro na tradução do arquivo: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  
  private async translateDocument(
    document: LocalizationDocument,
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<LocalizationDocument> {
    const translatedDocument = JSON.parse(JSON.stringify(document)) as LocalizationDocument;
    
    if (translatedDocument.localization.group) {
      translatedDocument.localization.group = await this.translateGroups(
        translatedDocument.localization.group,
        sourceLanguage,
        targetLanguage
      );
    }
    
    return translatedDocument;
  }

  
  private async translateGroups(
    groups: LocalizationGroup[],
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<LocalizationGroup[]> {
    const translatedGroups: LocalizationGroup[] = [];
    
    for (const group of groups) {
      const translatedGroup: LocalizationGroup = {
        name: group.name,
        tags: group.tags
      };
      
      
      if (group.string) {
        const strings = Array.isArray(group.string) ? group.string : [group.string];
        translatedGroup.string = await this.translateStrings(
          strings,
          sourceLanguage,
          targetLanguage
        );
      }
      
      
      if (group.group) {
        const subGroups = Array.isArray(group.group) ? group.group : [group.group];
        translatedGroup.group = await this.translateGroups(
          subGroups,
          sourceLanguage,
          targetLanguage
        );
      }
      
      translatedGroups.push(translatedGroup);
    }
    
    return translatedGroups;
  }

  
  private async translateStrings(
    strings: LocalizationString[],
    sourceLanguage: string,
    targetLanguage: string
  ): Promise<LocalizationString[]> {
    const translatedStrings: LocalizationString[] = [];
    
    
    const textsToTranslate: string[] = [];
    const stringMap = new Map<number, LocalizationString>();
    
    strings.forEach((str, index) => {
      if (str._ && str._.trim()) {
        textsToTranslate.push(str._);
        stringMap.set(textsToTranslate.length - 1, str);
      }
    });
    
    
    const translationResults = await this.translationService.translateBatch(
      textsToTranslate,
      sourceLanguage,
      targetLanguage
    );
    
    
    for (const originalString of strings) {
      const translatedString: LocalizationString = {
        key: originalString.key,
        value: originalString.value,
        _: originalString._
      };
      
      
      if (originalString._ && originalString._.trim()) {
        const textIndex = textsToTranslate.indexOf(originalString._);
        if (textIndex !== -1 && translationResults[textIndex]) {
          translatedString._ = translationResults[textIndex].translatedText;
          console.log(`  "${originalString._}" → "${translatedString._}"`);
        }
      } else if (originalString.value && originalString.value.trim()) {
        
        const textIndex = textsToTranslate.indexOf(originalString.value);
        if (textIndex !== -1 && translationResults[textIndex]) {
          translatedString.value = translationResults[textIndex].translatedText;
          console.log(`  "${originalString.value}" → "${translatedString.value}"`);
        }
      }
      
      translatedStrings.push(translatedString);
    }
    
    return translatedStrings;
  }

  
  private generateOutputPath(inputPath: string, targetLanguage: string): string {
    const dir = path.dirname(inputPath);
    const name = path.basename(inputPath, path.extname(inputPath));
    const ext = path.extname(inputPath);
    
    return path.join(dir, `${name}_${targetLanguage}${ext}`);
  }

  
  async validateFile(filePath: string): Promise<boolean> {
    return await this.xmlParser.validateFile(filePath);
  }

  
  async testTranslationService(): Promise<boolean> {
    return await this.translationService.testConnection();
  }

  
  async getFileStats(filePath: string): Promise<{
    totalStrings: number;
    totalGroups: number;
    culture: string;
    moduleId: string;
  }> {
    const file = await this.xmlParser.parseFile(filePath);
    const stats = this.countStringsAndGroups(file.content.localization.group);
    
    return {
      totalStrings: stats.strings,
      totalGroups: stats.groups,
      culture: file.culture,
      moduleId: file.moduleId
    };
  }

  
  private countStringsAndGroups(groups: LocalizationGroup[]): { strings: number; groups: number } {
    let strings = 0;
    let groupCount = groups.length;
    
    for (const group of groups) {
      if (group.string) {
        strings += Array.isArray(group.string) ? group.string.length : 1;
      }
      
      if (group.group) {
        const subGroups = Array.isArray(group.group) ? group.group : [group.group];
        const subStats = this.countStringsAndGroups(subGroups);
        strings += subStats.strings;
        groupCount += subStats.groups;
      }
    }
    
    return { strings, groups: groupCount };
  }
} 