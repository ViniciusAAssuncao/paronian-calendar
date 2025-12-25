# 🚀 Quick Start Guide

Comece a usar a API do Calendário Hadabiano em 5 minutos!

## Opção 1: Usar API Pública (Mais Rápido)

Se a API já está deployada publicamente:

```bash
curl https://hadab-calendar-api.workers.dev/api/current
```

Pronto! Você já está usando o Calendário Hadabiano.

## Opção 2: Deploy Sua Própria API

### 1. Pré-requisitos

```bash
node --version  # Precisa ser v18+
```

### 2. Clone e Instale

```bash
git clone https://github.com/seu-usuario/hadab-calendar-api.git
cd hadab-calendar-api
npm install
```

### 3. Teste Localmente

```bash
npm run dev
```

API disponível em `http://localhost:8787`

### 4. Autentique no Cloudflare

```bash
npx wrangler login
```

Isso abrirá seu navegador para autorização.

### 5. Deploy!

```bash
npm run deploy
```

Sua API estará em:
```
https://hadab-calendar-api.SEU-ACCOUNT.workers.dev
```

### 6. Teste a API

```bash
curl https://hadab-calendar-api.SEU-ACCOUNT.workers.dev/api/health
```

✅ Se retornar JSON com `"status": "healthy"`, está funcionando!

## Opção 3: Usar Extensão do Navegador

### 1. Instalar Extensão

1. Abra `chrome://extensions`
2. Ative "Modo do desenvolvedor"
3. Clique "Carregar sem compactação"
4. Selecione a pasta `browser-extension/`

### 2. Configurar API

Edite `browser-extension/popup.js`:

```javascript
const API_URL = 'https://SUA-URL-AQUI.workers.dev';
```

### 3. Usar

Clique no ícone da extensão para ver a hora Hadabiana!

## Primeiros Passos

### Ver Data Atual

**JavaScript:**
```javascript
fetch('https://sua-api/api/current')
  .then(r => r.json())
  .then(data => console.log(data.hadab.formatted.long));
```

**Python:**
```python
import requests
r = requests.get('https://sua-api/api/current')
print(r.json()['hadab']['formatted']['long'])
```

**cURL:**
```bash
curl https://sua-api/api/current | jq '.hadab.formatted.long'
```

### Converter Data

```bash
curl "https://sua-api/api/convert/to-hadab?date=2024-12-24T12:00:00Z"
```

### Ver Informações do Ano

```bash
curl "https://sua-api/api/year?year=2026"
```

### Converter Várias Datas

```bash
curl -X POST https://sua-api/api/batch \
  -H "Content-Type: application/json" \
  -d '{"timestamps": [1703419200000, "2024-12-25T00:00:00Z"]}'
```

## Estrutura de Resposta

Todas as respostas são JSON:

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
    "season": {
      "name": "Helkaper"
    },
    "formatted": {
      "short": "15 Helkatom, 2026 AH",
      "long": "Prasdas, 15 Helkatom, 2026 AH"
    }
  }
}
```

## Endpoints Principais

```
GET  /api/current          - Data/hora atual
GET  /api/convert/to-hadab - Terra → Hadab
GET  /api/convert/to-earth - Hadab → Terra
GET  /api/year             - Info do ano
GET  /api/evriom           - Próximo Evriom
GET  /api/constants        - Constantes
POST /api/batch            - Conversão em lote
GET  /api/health           - Health check
```

## Exemplos Rápidos

### React Hook

```jsx
import { useState, useEffect } from 'react';

function useHadabTime() {
  const [hadab, setHadab] = useState(null);

  useEffect(() => {
    const fetchTime = async () => {
      const res = await fetch('https://sua-api/api/current');
      const data = await res.json();
      setHadab(data.hadab);
    };

    fetchTime();
    const interval = setInterval(fetchTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return hadab;
}

function App() {
  const hadab = useHadabTime();
  return <div>{hadab?.formatted.long}</div>;
}
```

### Node.js CLI

```javascript
#!/usr/bin/env node
const fetch = require('node-fetch');

(async () => {
  const res = await fetch('https://sua-api/api/current');
  const data = await res.json();
  console.log(data.hadab.formatted.long);
})();
```

### Python Script

```python
import requests
from datetime import datetime

def hadab_now():
    r = requests.get('https://sua-api/api/current')
    return r.json()['hadab']

hadab = hadab_now()
print(f"Agora em Hadab: {hadab['formatted']['long']}")
print(f"Hora: {hadab['time']['formatted']}")
print(f"Estação: {hadab['season']['name']}")
```

## Próximos Passos

1. **Explore a Documentação**
   - `docs/API.md` - Referência completa
   - `docs/EXAMPLES.md` - 10+ exemplos práticos
   - `docs/FAQ.md` - Perguntas frequentes

2. **Customize**
   - Edite `config/calendar-data.json` para adicionar feriados
   - Configure domínio customizado
   - Adicione rate limiting

3. **Integre**
   - Adicione em seu website
   - Crie um bot (Discord/Telegram)
   - Integre com Google Sheets

4. **Contribua**
   - Leia `CONTRIBUTING.md`
   - Abra issues
   - Envie pull requests

## Ajuda

**Problema?** Consulte:
- `docs/FAQ.md` - Perguntas frequentes
- GitHub Issues - Reportar bugs
- `docs/DEPLOY.md` - Troubleshooting

**Dúvidas sobre o Calendário?**
- Leia a documentação inicial fornecida
- Consulte os conceitos no README

## Recursos Adicionais

- **Health Check**: `/api/health`
- **Testes**: `npm test`
- **Logs**: `npm run tail`
- **Dashboard**: https://dash.cloudflare.com

---

**Pronto!** 🎉

Você agora tem uma API serverless do Calendário Hadabiano rodando globalmente com latência < 50ms e disponibilidade 99.99%+.

**Custo:** $0 (até 100k req/dia)
**Latência:** < 50ms
**Uptime:** 99.99%+
**Precisão:** 1 dia de erro a cada 52.000 anos

Comece a usar agora! 🚀
