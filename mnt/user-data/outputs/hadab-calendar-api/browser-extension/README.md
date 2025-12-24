# Extensão de Navegador - Relógio Hadabiano

Extensão para Chrome/Edge/Brave que exibe o horário do Calendário Hadabiano em tempo real.

## Instalação

### Desenvolvimento

1. Abra seu navegador e vá para:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`

2. Ative o "Modo do desenvolvedor"

3. Clique em "Carregar sem compactação"

4. Selecione a pasta `browser-extension/`

5. A extensão aparecerá na barra de ferramentas

## Configuração da API

Edite `popup.js` e altere a URL da API:

```javascript
const API_URL = 'https://SUA-URL-AQUI.workers.dev';
```

## Ícones

Os ícones precisam ser criados nos seguintes tamanhos:
- `icons/icon16.png` (16x16)
- `icons/icon48.png` (48x48)
- `icons/icon128.png` (128x128)

### Gerar Ícones Automaticamente

Você pode usar qualquer ferramenta online ou criar manualmente. Sugestões:

1. **Canva** (https://canva.com):
   - Crie um design 128x128
   - Use fundo gradiente escuro (#1a1a2e → #16213e)
   - Adicione texto "H" em vermelho (#e94560)
   - Exporte em PNG
   - Redimensione para 48x48 e 16x16

2. **GIMP** (gratuito):
   - Crie nova imagem 128x128
   - Use gradiente radial
   - Adicione texto estilizado
   - Exporte como PNG
   - Escale para 48x48 e 16x16

3. **Online PNG Maker**:
   - Vá para https://www.favicon-generator.org/
   - Faça upload de uma imagem
   - Gere múltiplos tamanhos

### Ícone Placeholder

Enquanto isso, você pode usar ícones simples coloridos:

```bash
cd browser-extension/icons

# Crie arquivos PNG simples com ImageMagick (se disponível)
convert -size 16x16 xc:#e94560 icon16.png
convert -size 48x48 xc:#e94560 icon48.png
convert -size 128x128 xc:#e94560 icon128.png
```

## Funcionalidades

- ✅ Sincroniza com a API a cada minuto
- ✅ Calcula tempo localmente para precisão
- ✅ Atualiza display a cada ~0.36 segundos (1 Segun)
- ✅ Mostra data completa, hora e estação
- ✅ Destaca Evrioms e anos especiais
- ✅ Interface responsiva e moderna

## Publicação

Para publicar na Chrome Web Store:

1. Crie um arquivo ZIP de `browser-extension/`
2. Acesse: https://chrome.google.com/webstore/devconsole
3. Pague taxa única de $5 (se for primeira vez)
4. Faça upload do ZIP
5. Preencha detalhes da extensão
6. Aguarde revisão (1-3 dias)

## Customização

### Alterar Cores

Edite `popup.html` na seção `<style>`:

```css
background: linear-gradient(135deg, #SUA-COR1 0%, #SUA-COR2 100%);
color: #SUA-COR-TEXTO;
```

### Adicionar Recursos

Edite `manifest.json` para adicionar permissões:

```json
"permissions": [
  "storage",
  "notifications"
]
```

### Notificações de Evriom

Adicione em `background.js`:

```javascript
chrome.alarms.create('checkEvriom', { periodInMinutes: 1440 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'checkEvriom') {
    const res = await fetch(`${API_URL}/api/evriom`);
    const data = await res.json();
    
    if (data.evriom.isNow) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Dia Especial Hadabiano!',
        message: `Hoje é Evriom de ${data.evriom.nextDate.evriomType}`
      });
    }
  }
});
```

## Estrutura de Arquivos

```
browser-extension/
├── manifest.json       # Configuração da extensão
├── popup.html          # Interface do popup
├── popup.js            # Lógica de cálculo e display
├── background.js       # Service worker
├── icons/              # Ícones (16, 48, 128)
└── README.md           # Este arquivo
```

## Troubleshooting

### Erro: "Failed to fetch"

Verifique se:
1. A URL da API está correta em `popup.js`
2. A API está online (`/api/health`)
3. CORS está habilitado na API

### Tempo não atualiza

1. Abra DevTools (F12) no popup
2. Verifique console por erros
3. Confirme que `updateInterval` está rodando

### Extensão não carrega

1. Verifique se `manifest.json` é válido (use JSONLint)
2. Confirme que todos os arquivos referenciados existem
3. Recarregue a extensão em `chrome://extensions`

## Performance

A extensão é extremamente leve:
- Tamanho: < 50KB
- CPU: < 0.1% (apenas cálculos matemáticos)
- RAM: < 10MB
- Rede: 1 requisição/minuto (~500 bytes)

## Licença

MIT - Use livremente
