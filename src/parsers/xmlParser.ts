import * as fs from 'fs-extra'
import * as xml2js from 'xml2js'
import { LocalizationDocument, LocalizationFile } from '../types/localization'

export class XMLParser {
  private parser: xml2js.Parser;
  private builder: xml2js.Builder;

  constructor() {
    this.parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      normalize: true,
      normalizeTags: false,
      trim: true
    });

    this.builder = new xml2js.Builder({
      renderOpts: {
        pretty: true,
        indent: '  ',
        newline: '\n'
      },
      xmldec: {
        version: '1.0',
        encoding: 'utf-8'
      }
    });
  }

  
  async parseFile(filePath: string): Promise<LocalizationFile> {
    try {
      const xmlContent = await fs.readFile(filePath, 'utf-8');
      const result = await this.parser.parseStringPromise(xmlContent);
      
      const localization = result.localization;
      const culture = localization.culture;
      const moduleId = localization.moduleId;

      return {
        path: filePath,
        content: result as LocalizationDocument,
        culture,
        moduleId
      };
    } catch (error) {
      throw new Error(`Erro ao parsear arquivo XML: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  
  buildXML(document: LocalizationDocument): string {
    try {
      const localization = document.localization;
      
      let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
      xml += `<localization xmlns="${localization.xmlns}"\n`;
      xml += `culture="${localization.culture}"\n`;
      xml += `moduleId="${localization.moduleId}">\n`;
      
      if (localization.group) {
        xml += this.buildGroupsXML(localization.group, 1);
      }
      
      xml += '</localization>';
      
      return xml;
    } catch (error) {
      throw new Error(`Erro ao gerar XML: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  
  private buildGroupsXML(groups: any[], indent: number): string {
    let xml = '';
    const spaces = '  '.repeat(indent);
    
    for (const group of groups) {
      xml += `${spaces}<group name="${group.name}"`;
      if (group.tags) {
        xml += ` tags="${group.tags}"`;
      }
      xml += '>\n';
      
      
      if (group.string) {
        const strings = Array.isArray(group.string) ? group.string : [group.string];
        for (const str of strings) {
          xml += `${spaces}  <string key="${str.key}">${str._ || str.value || ''}</string>\n`;
        }
      }
      
      
      if (group.group) {
        const subGroups = Array.isArray(group.group) ? group.group : [group.group];
        xml += this.buildGroupsXML(subGroups, indent + 1);
      }
      
      xml += `${spaces}</group>\n`;
    }
    
    return xml;
  }

  
  async saveToFile(document: LocalizationDocument, filePath: string): Promise<void> {
    try {
      const xmlContent = this.buildXML(document);
      await fs.writeFile(filePath, xmlContent, 'utf-8');
    } catch (error) {
      throw new Error(`Erro ao salvar arquivo XML: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  
  async validateFile(filePath: string): Promise<boolean> {
    try {
      const file = await this.parseFile(filePath);
      
     
      if (!file.content.localization) {
        return false;
      }

      const attrs = file.content.localization;
      if (!attrs.culture || !attrs.moduleId || !attrs.xmlns) {
        return false;
      }

      if (!file.content.localization.group || !Array.isArray(file.content.localization.group)) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }
} 