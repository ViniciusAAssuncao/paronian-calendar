# API do Calendário Paroniano/Hadabiano

Sistema completo de conversão temporal entre o Calendário Terrestre e o Calendário Hadabiano, com precisão astronômica e arquitetura serverless de alta disponibilidade.

## ⭐ Características

- ✅ **Sempre Online**: Sem cold start, resposta global < 50ms
- ✅ **Precisão Extrema**: Erro de 1 dia a cada 52.000 anos
- ✅ **Matemática Pura**: Sem banco de dados, conversões instantâneas
- ✅ **API RESTful**: Endpoints simples e intuitivos
- ✅ **CORS Habilitado**: Use de qualquer frontend
- ✅ **Dados Dinâmicos**: Atualize feriados via GitHub sem redeploy
- ✅ **Extensão de Navegador**: Visualize Hadab em tempo real

## 🚀 Quick Start

### Instalar e Rodar Localmente

```bash
npm install
npm run dev
```

API rodando em `http://localhost:8787`

### Deploy para Produção

```bash
npx wrangler login
npm run deploy
```

Sua API estará em `https://hadab-calendar-api.SEU-ACCOUNT.workers.dev`

## 📚 Documentação Completa

- **[API Reference](docs/API.md)**: Todos os endpoints e exemplos
- **[Guia de Deploy](docs/DEPLOY.md)**: Instruções passo a passo
- **[Exemplos de Uso](docs/EXAMPLES.md)**: Integrações práticas

## 🔍 Exemplos Rápidos

### Obter Hora Atual em Hadab

```bash
curl https://hadab-calendar-api.workers.dev/api/current
```

Resposta:
```json
{
  "hadab": {
    "year": 2026,
    "month": "Helkatom",
    "day": 15,
    "weekday": "Prasdas",
    "time": {
      "formatted": "13:45:23"
    },
    "formatted": {
      "long": "Prasdas, 15 Helkatom, 2026 AH"
    }
  }
}
```

### Converter Data Terrestre para Hadab

```bash
curl "https://hadab-calendar-api.workers.dev/api/convert/to-hadab?date=2024-12-24T12:00:00Z"
```

### Converter Data Hadabiana para Terrestre

```bash
curl "https://hadab-calendar-api.workers.dev/api/convert/to-earth?year=2026&month=Helkatom&day=15"
```

## 📅 Sistema do Calendário

### Estrutura Base
- **Ano Hadabiano**: 365.24219 dias
- **13 Meses**: 28 dias cada
- **Dia Hadabiano**: 26h 09m 40.23s (94.180,23 segundos terrestres)
- **Semana**: 7 dias (fixos)

### Anos Bissextos
- Regra: Divisível por 4, exceto divisível por 128
- Precisão: 31 dias a cada 128 anos
- Erro: 1 dia a cada ~52.000 anos

### Evriom (Dias Intercalares)
- Ano comum: 1 Evriom (início do ano)
- Ano bissexto: 2 Evrioms (início + fim do ano)
- Não pertencem a nenhum mês ou semana

### Sistema Horário Decimal
- 1 dia = 26 Tems
- 1 Tem = 100 Minuts (≈ 60.37 minutos terrestres)
- 1 Minut = 100 Seguns (≈ 36.22 segundos terrestres)
- Formato: `TT:MM:SS`

### 13 Meses
1. Helkatom
2. Stabom
3. Prairom
4. Arsom
5. Balom
6. Nûle
7. Airûle
8. Frostûle
9. Astûle
10. Zoris
11. Curis
12. Traris
13. Biris

### 7 Dias da Semana
1. Suldas
2. Stabdas
3. Cultas
4. Prasdas
5. Gardas
6. Flardas
7. Krindas

### 4 Estações (Perom)
1. **Helkaper** (91 dias): Período de Proximidade (periélio)
2. **Balansper** (91 dias): Período de Equilíbrio
3. **Frosper** (91 dias): Período de Distância (afélio)
4. **Nodper** (92.242 dias): Período de Renovação

## 🌍 Conceitos Teológicos

### Árions (Eras Cósmicas)
- **Árion da Ërda Velha**: Mundo Intermediário (~500.000 anos)
- **Árion de Nova Ërda**: Mundo Transfigurado (atual)

### Érions (Períodos Históricos)
Cada Érion dura ~13.025 anos:
- **Pré-Édicos**: Aurora da humanidade
- **Édicos (AHE)**: Era de Ouro (multiplicador 3x)
- **Antigos (AHA)**: Era de Transição
- **Atual (AH)**: Presente Contínuo (2026 AH)

### Anos Especiais
- **2025 AH**: Ano Perdido (péssimo augúrio)
- **2026 AH**: Ano da Vigilância (transição)
- **2027 AH**: Ano de Colheita Espiritual (bom augúrio)

## 🛠️ Arquitetura Técnica

### Stack
- **Runtime**: Cloudflare Workers (V8 Isolates)
- **Linguagem**: JavaScript ES6+ (sem build step)
- **Cache**: Cloudflare KV (opcional)
- **Data Source**: GitHub JSON (opcional)

### Performance
- **Latência**: < 50ms globalmente
- **Cold Start**: Nenhum
- **Disponibilidade**: 99.99%+
- **Rate Limit**: 100.000 req/dia (gratuito)

### Estrutura de Arquivos

```
hadab-calendar-api/
├── src/
│   ├── calendar-core.js    # Motor de cálculos
│   └── worker.js            # Cloudflare Worker handler
├── config/
│   └── calendar-data.json   # Dados dinâmicos
├── browser-extension/       # Extensão do navegador
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   └── background.js
├── test/
│   └── calendar-tests.js    # Suite de testes
├── docs/
│   ├── API.md              # Documentação da API
│   ├── DEPLOY.md           # Guia de deploy
│   └── EXAMPLES.md         # Exemplos práticos
├── wrangler.toml           # Config Cloudflare
└── package.json
```

## 🔌 Integrações

### JavaScript/TypeScript
```javascript
const response = await fetch('https://sua-api/api/current');
const data = await response.json();
console.log(data.hadab.formatted.long);
```

### Python
```python
import requests
r = requests.get('https://sua-api/api/current')
print(r.json()['hadab']['formatted']['long'])
```

### PHP
```php
$data = json_decode(file_get_contents('https://sua-api/api/current'), true);
echo $data['hadab']['formatted']['long'];
```

## 🧪 Testes

Rodar suite de testes:
```bash
npm test
```

Testa:
- ✅ Regras de anos bissextos
- ✅ Conversões bidirecionais
- ✅ Detecção de Evriom
- ✅ Precisão temporal
- ✅ Mapeamento de estações

## 📦 Extensão do Navegador

A extensão mostra o horário Hadabiano em tempo real:

1. Abra `chrome://extensions`
2. Ative "Modo do desenvolvedor"
3. Clique "Carregar sem compactação"
4. Selecione a pasta `browser-extension/`
5. Clique no ícone da extensão

A extensão sincroniza com a API e calcula o tempo localmente para máxima precisão.

## 🔒 Segurança

- ✅ CORS habilitado para uso público
- ✅ Sem autenticação necessária (dados públicos)
- ✅ Rate limiting configurável
- ✅ Validação de inputs

## 📈 Monitoramento

Ver logs em tempo real:
```bash
npm run tail
```

Dashboard Cloudflare:
```
https://dash.cloudflare.com
```

## 🤝 Contribuindo

Contribuições são bem-vindas! Para adicionar features:

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Add feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

MIT License - use livremente em seus projetos.

## 🙏 Créditos

Baseado no Calendário Paroniano/Hadabiano com precisão astronômica e profundidade teológica.

## 📞 Suporte

- Documentação: `docs/`
- Issues: GitHub Issues
- API Status: `/api/health`

---

**Desenvolvido com precisão matemática para Nova Ërda** 🌟
