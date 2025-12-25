# Guia de Deploy - API do Calendário Hadabiano

Este guia fornece instruções completas para colocar a API online usando Cloudflare Workers.

## Pré-requisitos

1. **Node.js** (versão 18 ou superior)
   ```bash
   node --version
   ```

2. **Conta Cloudflare** (gratuita)
   - Acesse: https://dash.cloudflare.com/sign-up
   - Plano gratuito inclui:
     - 100.000 requisições/dia
     - Sem cold start
     - Latência global < 50ms

3. **Git** (para versionamento)

## Passo 1: Instalação

Clone ou copie o projeto:

```bash
cd hadab-calendar-api
npm install
```

Isso instalará:
- `wrangler`: CLI oficial do Cloudflare Workers

## Passo 2: Autenticação no Cloudflare

```bash
npx wrangler login
```

Isso abrirá seu navegador para autorizar o Wrangler. Após autorizar, volte ao terminal.

Verifique se está autenticado:
```bash
npx wrangler whoami
```

## Passo 3: Criar KV Namespace (Opcional mas Recomendado)

O KV (Key-Value) armazena cache dos dados do GitHub:

```bash
npx wrangler kv:namespace create CALENDAR_DATA_CACHE
```

Copie o ID retornado (exemplo: `a1b2c3d4e5f6...`) e cole no `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "CALENDAR_DATA_CACHE"
id = "cole_o_id_aqui"
```

Para produção:
```bash
npx wrangler kv:namespace create CALENDAR_DATA_CACHE --env production
```

## Passo 4: Configurar Dados Dinâmicos (GitHub)

### Opção A: Usar Dados Locais (Mais Simples)

Edite `wrangler.toml` e remova ou comente a linha:
```toml
# [vars]
# GITHUB_DATA_URL = "..."
```

A API usará os dados padrão incorporados no código.

### Opção B: Usar GitHub (Recomendado)

1. Crie um repositório no GitHub (pode ser privado)
2. Faça upload do arquivo `config/calendar-data.json`
3. Obtenha a URL raw do arquivo:
   ```
   https://raw.githubusercontent.com/SEU-USUARIO/hadab-calendar-data/main/calendar-data.json
   ```
4. Configure no `wrangler.toml`:
   ```toml
   [vars]
   GITHUB_DATA_URL = "https://raw.githubusercontent.com/SEU-USUARIO/hadab-calendar-data/main/calendar-data.json"
   ```

**Vantagem**: Você pode atualizar feriados/anos especiais sem redeploy.

## Passo 5: Testar Localmente

```bash
npm run dev
```

Isso iniciará um servidor local em `http://localhost:8787`.

Teste os endpoints:
```bash
curl http://localhost:8787/api/current
curl http://localhost:8787/api/constants
curl "http://localhost:8787/api/convert/to-hadab?date=2024-12-24T12:00:00Z"
```

## Passo 6: Deploy para Produção

### Deploy Simples (workers.dev)

```bash
npm run deploy
```

Sua API estará disponível em:
```
https://hadab-calendar-api.SEU-ACCOUNT.workers.dev
```

Teste:
```bash
curl https://hadab-calendar-api.SEU-ACCOUNT.workers.dev/api/current
```

### Deploy com Domínio Customizado (Opcional)

Se você tem um domínio no Cloudflare:

1. Edite `wrangler.toml`:
   ```toml
   [env.production]
   name = "hadab-calendar-api-prod"
   route = { pattern = "api.seudominio.com/*", zone_name = "seudominio.com" }
   ```

2. Deploy:
   ```bash
   npm run deploy:prod
   ```

Sua API estará em `https://api.seudominio.com/api/current`.

## Passo 7: Verificação de Saúde

Após o deploy, verifique:

```bash
curl https://SUA-URL/api/health
```

Resposta esperada:
```json
{
  "status": "healthy",
  "hadabTime": "Prasdas, 15 Helkatom, 2026 AH",
  "version": "1.0.0"
}
```

## Estrutura de URLs

Após deploy, seus endpoints serão:

```
https://SUA-URL/api/current
https://SUA-URL/api/convert/to-hadab?timestamp=...
https://SUA-URL/api/convert/to-earth?year=2026&month=Helkatom&day=15
https://SUA-URL/api/year?year=2026
https://SUA-URL/api/evriom
https://SUA-URL/api/constants
https://SUA-URL/api/batch (POST)
https://SUA-URL/api/health
```

## Atualizações

### Atualizar o Código

```bash
git pull
npm run deploy
```

### Atualizar Dados Dinâmicos

Se usar GitHub:
1. Edite `calendar-data.json` no GitHub
2. Commit e push
3. A API atualizará automaticamente em até 1 hora (devido ao cache)

Para forçar atualização imediata, limpe o cache:
```bash
npx wrangler kv:key delete "calendar-data" --namespace-id SEU-NAMESPACE-ID
```

## Monitoramento

### Ver Logs em Tempo Real

```bash
npm run tail
```

### Dashboard Cloudflare

Acesse: https://dash.cloudflare.com
- Navegue até "Workers & Pages"
- Clique em "hadab-calendar-api"
- Veja métricas de uso, erros e performance

## Troubleshooting

### Erro: "Authentication required"
```bash
npx wrangler login
```

### Erro: "KV namespace not found"
Verifique se o ID no `wrangler.toml` está correto:
```bash
npx wrangler kv:namespace list
```

### Erro 500 na API
Veja os logs:
```bash
npm run tail
```

### GitHub URL não funciona
Verifique se:
1. URL está correta (use URL "raw" do GitHub)
2. Repositório é público OU você configurou autenticação

## Limites do Plano Gratuito

- ✅ 100.000 requisições/dia
- ✅ Sem cold start
- ✅ Latência global < 50ms
- ✅ KV: 1GB storage
- ✅ KV: 100.000 reads/dia

Para APIs de uso pessoal ou pequeno, isso é mais que suficiente.

## Segurança

### Adicionar Rate Limiting (Opcional)

Edite `src/worker.js` para adicionar proteção:

```javascript
const RATE_LIMIT = 100;
const RATE_WINDOW = 60 * 1000;

async function checkRateLimit(request, env) {
  const ip = request.headers.get('CF-Connecting-IP');
  const key = `rate:${ip}`;
  
  const count = await env.CALENDAR_DATA_CACHE.get(key);
  
  if (count && parseInt(count) > RATE_LIMIT) {
    return new Response('Too many requests', { status: 429 });
  }
  
  await env.CALENDAR_DATA_CACHE.put(key, 
    count ? String(parseInt(count) + 1) : '1',
    { expirationTtl: RATE_WINDOW / 1000 }
  );
  
  return null;
}
```

## Backup

Sempre mantenha uma cópia local:
```bash
git clone https://github.com/seu-usuario/hadab-calendar-api.git
```

## Próximos Passos

1. **Extensão do Navegador**: Veja `browser-extension/`
2. **Integração em Apps**: Use os endpoints da API
3. **Webhooks**: Configure notificações para Evrioms
4. **Analytics**: Adicione tracking de uso

## Suporte

- Documentação Cloudflare: https://developers.cloudflare.com/workers/
- Documentação API: `docs/API.md`

---

🎉 **Parabéns! Sua API está online e sempre disponível!**
