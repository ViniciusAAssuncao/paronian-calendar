# API do Calendário Hadabiano

Sistema completo de conversão e consulta do Calendário Paroniano/Hadabiano com precisão astronômica.

## URL Base

```
https://hadab-calendar-api.workers.dev
```

## Endpoints

### 1. GET `/api/current`

Retorna a data e hora atual em Hadab.

**Parâmetros Query:**
- `metadata` (opcional): `true` para incluir metadados completos do ano

**Exemplo:**
```bash
curl https://hadab-calendar-api.workers.dev/api/current
```

**Resposta:**
```json
{
  "timestamp": 1735027200000,
  "hadab": {
    "year": 2026,
    "month": "Helkatom",
    "day": 15,
    "dayOfYear": 43,
    "weekday": "Prasdas",
    "isEvriom": false,
    "isLeapYear": false,
    "time": {
      "tems": "13",
      "minuts": "45",
      "seguns": "23",
      "formatted": "13:45:23"
    },
    "season": {
      "name": "Helkaper",
      "krimlog": "Helkaper",
      "dayInSeason": 43,
      "totalDays": 91
    },
    "erion": {
      "name": "current",
      "suffix": "AH",
      "multiplier": 1
    },
    "formatted": {
      "short": "15 Helkatom, 2026 AH",
      "long": "Prasdas, 15 Helkatom, 2026 AH",
      "numeric": "2026-01-15"
    }
  }
}
```

### 2. GET `/api/convert/to-hadab`

Converte uma data terrestre para Hadab.

**Parâmetros Query:**
- `timestamp`: Unix timestamp (segundos ou milissegundos)
- `date`: Data ISO 8601 (ex: `2024-12-24T12:00:00Z`)

**Exemplo:**
```bash
curl "https://hadab-calendar-api.workers.dev/api/convert/to-hadab?date=2024-12-24T12:00:00Z"
```

**Resposta:**
```json
{
  "input": {
    "timestamp": 1703419200000,
    "earthDate": "2024-12-24T12:00:00.000Z"
  },
  "hadab": {
    "year": 2026,
    "month": "Biris",
    "day": 28,
    "weekday": "Krindas",
    "time": {
      "formatted": "08:30:15"
    }
  }
}
```

### 3. GET `/api/convert/to-earth`

Converte uma data Hadabiana para terrestre.

**Parâmetros Query:**
- `year`: Ano Hadabiano (obrigatório)
- `month`: Nome do mês (obrigatório, ex: "Helkatom")
- `day`: Dia do mês (obrigatório, 1-28)
- `tems`: Horas (opcional, 0-25)
- `minuts`: Minutos (opcional, 0-99)
- `seguns`: Segundos (opcional, 0-99)

**Exemplo:**
```bash
curl "https://hadab-calendar-api.workers.dev/api/convert/to-earth?year=2026&month=Helkatom&day=15&tems=13&minuts=45&seguns=23"
```

**Resposta:**
```json
{
  "input": {
    "year": 2026,
    "month": "Helkatom",
    "day": 15,
    "time": "13:45:23"
  },
  "earth": {
    "timestamp": 1735027200000,
    "date": "2025-12-24T12:00:00.000Z",
    "unix": 1735027200
  }
}
```

### 4. GET `/api/year`

Retorna informações completas sobre um ano específico.

**Parâmetros Query:**
- `year` (opcional): Ano Hadabiano (padrão: ano atual)

**Exemplo:**
```bash
curl "https://hadab-calendar-api.workers.dev/api/year?year=2026"
```

**Resposta:**
```json
{
  "year": 2026,
  "isLeapYear": false,
  "totalDays": 365,
  "erion": {
    "name": "current",
    "suffix": "AH",
    "multiplier": 1
  },
  "special": {
    "status": "current",
    "name": "Ano da Vigilância",
    "designation": "Vigilância"
  },
  "months": [
    {
      "name": "Helkatom",
      "index": 0,
      "days": 28,
      "startDay": 2
    }
  ],
  "evrioms": [
    {
      "type": "Helkatom",
      "day": 1
    }
  ]
}
```

### 5. GET `/api/evriom`

Retorna informações sobre o próximo Evriom (dia intercalar).

**Exemplo:**
```bash
curl https://hadab-calendar-api.workers.dev/api/evriom
```

**Resposta:**
```json
{
  "timestamp": 1735027200000,
  "current": {
    "year": 2026,
    "month": "Helkatom",
    "day": 15
  },
  "evriom": {
    "isNow": false,
    "nextDate": {
      "year": 2027,
      "isEvriom": true,
      "evriomType": "Helkatom"
    },
    "daysUntil": 350
  }
}
```

### 6. GET `/api/constants`

Retorna constantes do calendário e regras de bissexto.

**Exemplo:**
```bash
curl https://hadab-calendar-api.workers.dev/api/constants
```

**Resposta:**
```json
{
  "months": ["Helkatom", "Stabom", "Prairom", ...],
  "weekdays": ["Suldas", "Stabdas", "Cultas", ...],
  "seasons": [
    {
      "name": "Helkaper",
      "krimlog": "Helkaper",
      "start": 1,
      "duration": 91
    }
  ],
  "constants": {
    "hadabDaySeconds": 94180.23,
    "hadabYearDays": 365.24219,
    "temsPerDay": 26,
    "minutsPerTem": 100,
    "segunsPerMinut": 100
  },
  "leapYearRules": {
    "description": "Divisible by 4, except divisible by 128",
    "precision": "1 day error every ~52,000 years"
  }
}
```

### 7. POST `/api/batch`

Converte múltiplas datas de uma vez (máximo 100).

**Body:**
```json
{
  "timestamps": [
    1703419200000,
    "2024-12-25T00:00:00Z",
    1703505600000
  ]
}
```

**Exemplo:**
```bash
curl -X POST https://hadab-calendar-api.workers.dev/api/batch \
  -H "Content-Type: application/json" \
  -d '{"timestamps": [1703419200000, "2024-12-25T00:00:00Z"]}'
```

**Resposta:**
```json
{
  "total": 2,
  "successful": 2,
  "failed": 0,
  "results": [
    {
      "input": 1703419200000,
      "hadab": {...},
      "success": true
    }
  ]
}
```

### 8. GET `/api/health`

Health check e lista de endpoints disponíveis.

**Exemplo:**
```bash
curl https://hadab-calendar-api.workers.dev/api/health
```

## Códigos de Status HTTP

- `200` - Sucesso
- `400` - Erro na requisição (parâmetros inválidos)
- `404` - Endpoint não encontrado
- `405` - Método não permitido
- `500` - Erro interno do servidor

## CORS

A API permite requisições de qualquer origem (`Access-Control-Allow-Origin: *`).

## Rate Limiting

Cloudflare Workers free tier:
- 100,000 requisições por dia
- Sem cold start (sempre online)

## Precisão

- **Anos bissextos**: Erro de 1 dia a cada ~52.000 anos
- **Conversão temporal**: Precisão de milissegundos
- **Horário decimal**: 1 Segun ≈ 0.36223 segundos terrestres

## Conceitos Importantes

### Evriom
Dias intercalares "fora do tempo" que não pertencem a nenhum mês ou semana:
- Anos comuns: 1 Evriom (Helkatom 1)
- Anos bissextos: 2 Evrioms (Helkatom 1 e Biris 29)

### Érions
Períodos de ~13.025 anos dentro do Árion atual:
- **Pré-Édicos**: Aurora da humanidade transfigurada
- **Édicos (AHE)**: Era de Ouro (multiplicador temporal 3x)
- **Antigos (AHA)**: Era de transição
- **Atual (AH)**: Presente contínuo (2026 AH atual)

### Sistema Horário
- 1 dia = 26 Tems
- 1 Tem = 100 Minuts
- 1 Minut = 100 Seguns
- Formato: `TT:MM:SS`

### Estações (Perom)
Baseadas em variação orbital, não em ângulo solar:
1. **Helkaper** (91 dias): Período de Proximidade (periélio)
2. **Balansper** (91 dias): Período de Equilíbrio
3. **Frosper** (91 dias): Período de Distância (afélio)
4. **Nodper** (92.242 dias): Período de Renovação

## Exemplos de Uso

### JavaScript (Fetch API)
```javascript
async function getCurrentHadabTime() {
  const response = await fetch('https://hadab-calendar-api.workers.dev/api/current');
  const data = await response.json();
  console.log(data.hadab.formatted.long);
}
```

### Python (requests)
```python
import requests

response = requests.get('https://hadab-calendar-api.workers.dev/api/current')
hadab = response.json()['hadab']
print(f"{hadab['formatted']['long']}")
```

### cURL
```bash
curl -s https://hadab-calendar-api.workers.dev/api/current | jq '.hadab.formatted.long'
```

## Dados Dinâmicos (GitHub)

A API busca dados de anos especiais e feriados de um arquivo JSON no GitHub:
- URL configurável via variável de ambiente `GITHUB_DATA_URL`
- Cache de 1 hora via Cloudflare KV
- Fallback para dados padrão se GitHub estiver indisponível

## Suporte

Para reportar bugs ou sugerir features, abra uma issue no repositório do projeto.
