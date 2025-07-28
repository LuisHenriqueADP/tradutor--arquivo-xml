# Tradutor de Localização XML

Sistema para traduzir arquivos XML de localização do inglês para português, desenvolvido em TypeScript.

## 📋 Descrição

Este sistema traduz arquivos XML de localização de sistemas de BI, seguindo o formato da Nasajon. Utiliza API gratuita de tradução (Google Translate) para converter textos do inglês para o português brasileiro.

## 🚀 Instalação

1. **Clone ou baixe o projeto**
2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Compile o projeto:**
   ```bash
   npm run build
   ```

## 📖 Como Usar

### Traduzir Arquivo


**Exemplo:**
```bash
npm run translate examples/sample-localization.xml
```

**Opções:**
- `-o, --output <arquivo-saida>`: Arquivo de saída (opcional)
- `-s, --source <idioma-origem>`: Idioma de origem (padrão: 'en')
- `-t, --target <idioma-destino>`: Idioma de destino (padrão: 'pt')

### Validar Arquivo

```bash
npm run validate <arquivo.xml>
```

### Testar Serviço

```bash
npm run test
```

## 📁 Estrutura do Projeto

```
teste-trad-xml/
├── src/                           # Código fonte TypeScript
│   ├── types/localization.ts      # Tipos TypeScript
│   ├── parsers/xmlParser.ts       # Parser XML
│   ├── services/translationService.ts # Serviço de tradução
│   ├── translators/localizationTranslator.ts # Tradutor principal
│   └── index.ts                   # Interface CLI
├── dist/                          # Código compilado (criado automaticamente após build)
├── examples/
│   └── sample-localization.xml    # Arquivo de exemplo
├── package.json
├── tsconfig.json
└── README.md
```

**Nota:** A pasta `dist` é criada automaticamente após executar `npm run build` e contém os arquivos JavaScript compilados.

## 📄 Formato do XML

O sistema suporta arquivos XML com esta estrutura:

```xml
<?xml version="1.0" encoding="utf-8"?>
<localization xmlns="http://nasajon.com/schemas/localization.xsd"
culture="en"
moduleId="EE04F36F-BAD2-4305-CCB3-34F5B1D0C8F1">
  <group name="NomeDoGrupo">
    <string key="CHAVE_UNICA">Texto em inglês</string>
    <group name="SubGrupo" tags="client">
      <string key="OUTRA_CHAVE">Outro texto</string>
    </group>
  </group>
</localization>
```

## 🔧 Funcionalidades

- ✅ **Validação**: Verifica se o XML é válido e segue o formato esperado
- 🌐 **Tradução**: Traduz automaticamente do inglês para português
- 📊 **Estatísticas**: Mostra total de grupos e strings
- 🛡️ **Tratamento de Erros**: Validação robusta e fallback para texto original

## 🎯 Exemplo de Uso

1. **Arquivo original:**
   ```xml
   <string key="GS_LogOn_Title">Log on to Nasajon BI</string>
   ```

2. **Após tradução:**
   ```xml
   <string key="GS_LogOn_Title">Entrar no Nasajon BI</string>
   ```

## 🚨 Limitações

- **API Gratuita**: Usa Google Translate não oficial, pode ter limitações
- **Conectividade**: Requer internet para tradução
- **Qualidade**: Tradução automática pode não ser perfeita

## 🔍 Troubleshooting

### Erro: "Arquivo não encontrado"
- Verifique se o caminho do arquivo está correto

### Erro: "Serviço de tradução não está funcionando"
- Verifique sua conexão com a internet
- Tente novamente em alguns minutos

### Erro: "Arquivo XML inválido"
- Verifique se o arquivo segue o formato correto
- Confirme se tem os elementos `<localization>`, `<group>` e `<string>`

