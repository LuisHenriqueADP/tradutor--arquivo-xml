#!/usr/bin/env node

import { Command } from 'commander'
import chalk from 'chalk'
import * as path from 'path';
import * as fs from 'fs-extra'
import { LocalizationTranslator } from './translators/localizationTranslator'
import { TranslationOptions } from './types/localization'

const program = new Command();

program
  .name('xml-localization-translator')
  .description('Sistema para traduzir arquivos XML de localização do inglês para português')
  .version('1.0.0');

program
  .command('translate')
  .description('Traduz um arquivo XML de localização')
  .argument('<input-file>', 'Arquivo XML de entrada')
  .option('-o, --output <output-file>', 'Arquivo de saída (opcional)')
  .option('-s, --source <source-language>', 'Idioma de origem', 'en')
  .option('-t, --target <target-language>', 'Idioma de destino', 'pt')
  .option('--api-key <api-key>', 'Chave da API de tradução (opcional)')
  .action(async (inputFile: string, options: any) => {
    try {
      console.log(chalk.blue('🚀 Iniciando tradução de arquivo XML de localização...\n'));
      
    
      if (!await fs.pathExists(inputFile)) {
        console.error(chalk.red(`❌ Arquivo não encontrado: ${inputFile}`));
        process.exit(1);
      }
      
      
      const translatorOptions: TranslationOptions = {
        sourceLanguage: options.source,
        targetLanguage: options.target,
        apiKey: options.apiKey
      };
      
      const translator = new LocalizationTranslator(translatorOptions);
      
     
      console.log(chalk.yellow('🔍 Validando arquivo XML...'));
      const isValid = await translator.validateFile(inputFile);
      
      if (!isValid) {
        console.error(chalk.red('❌ Arquivo XML inválido ou não é um arquivo de localização'));
        process.exit(1);
      }
      
      console.log(chalk.green('✅ Arquivo XML válido'));
      
      
      const stats = await translator.getFileStats(inputFile);
      console.log(chalk.cyan(`📊 Estatísticas do arquivo:`));
      console.log(chalk.cyan(`   - Cultura: ${stats.culture}`));
      console.log(chalk.cyan(`   - Module ID: ${stats.moduleId}`));
      console.log(chalk.cyan(`   - Total de grupos: ${stats.totalGroups}`));
      console.log(chalk.cyan(`   - Total de strings: ${stats.totalStrings}\n`));
      
      
      console.log(chalk.yellow('🌐 Testando serviço de tradução...'));
      const isServiceWorking = await translator.testTranslationService();
      
      if (!isServiceWorking) {
        console.warn(chalk.yellow('⚠️  Serviço de tradução pode não estar funcionando corretamente'));
        console.warn(chalk.yellow('   Continuando mesmo assim...\n'));
      } else {
        console.log(chalk.green('✅ Serviço de tradução funcionando\n'));
      }
      // Executa a tradução
      const outputFile = await translator.translateFile(
        inputFile,
        options.output,
        options.source,
        options.target
      );
      
      console.log(chalk.green(`\n🎉 Tradução concluída!`));
      console.log(chalk.green(`📁 Arquivo traduzido salvo em: ${outputFile}`));
      
    } catch (error) {
      console.error(chalk.red(`❌ Erro durante a tradução: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Valida um arquivo XML de localização')
  .argument('<input-file>', 'Arquivo XML para validar')
  .action(async (inputFile: string) => {
    try {
      console.log(chalk.blue('🔍 Validando arquivo XML de localização...\n'));
      
      if (!await fs.pathExists(inputFile)) {
        console.error(chalk.red(`❌ Arquivo não encontrado: ${inputFile}`));
        process.exit(1);
      }
      
      const translator = new LocalizationTranslator();
      const isValid = await translator.validateFile(inputFile);
      
      if (isValid) {
        console.log(chalk.green('✅ Arquivo XML válido'));
        
        const stats = await translator.getFileStats(inputFile);
        console.log(chalk.cyan(`📊 Estatísticas:`));
        console.log(chalk.cyan(`   - Cultura: ${stats.culture}`));
        console.log(chalk.cyan(`   - Module ID: ${stats.moduleId}`));
        console.log(chalk.cyan(`   - Total de grupos: ${stats.totalGroups}`));
        console.log(chalk.cyan(`   - Total de strings: ${stats.totalStrings}`));
      } else {
        console.error(chalk.red('❌ Arquivo XML inválido ou não é um arquivo de localização'));
        process.exit(1);
      }
      
    } catch (error) {
      console.error(chalk.red(`❌ Erro durante a validação: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program
  .command('test')
  .description('Testa o serviço de tradução')
  .action(async () => {
    try {
      console.log(chalk.blue('🌐 Testando serviço de tradução...\n'));
      
      const translator = new LocalizationTranslator();
      const isWorking = await translator.testTranslationService();
      
      if (isWorking) {
        console.log(chalk.green('✅ Serviço de tradução funcionando corretamente'));
      } else {
        console.error(chalk.red('❌ Serviço de tradução não está funcionando'));
        console.log(chalk.yellow('💡 Verifique sua conexão com a internet'));
        process.exit(1);
      }
      
    } catch (error) {
      console.error(chalk.red(`❌ Erro durante o teste: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });


process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('❌ Erro não tratado:'), reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error(chalk.red('❌ Exceção não capturada:'), error);
  process.exit(1);
});


program.parse(); 