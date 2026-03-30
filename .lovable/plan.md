

# Redesign Completo: Heatmap, Pins, GPS, Feed e Filtros

## Resumo
Heatmap colorido por tipo de ocorrência, pins com ícones visíveis, GPS real-time funcional, centro em Campinas-SP, popup de alerta compacto, página de Feed estilo Reels/posts, mais tipos de ocorrências nos filtros, e perfis para motoboy/motorista/civil.

---

## 1. Heatmap Colorido por Tipo de Ocorrência (`MapCore.tsx`)

**Problema:** Heatmap atual usa uma única paleta vermelho/laranja para todos os tipos.

**Solução:** Criar múltiplas camadas de heatmap — uma por tipo de ocorrência selecionado. Cada camada usa a cor do tipo:
- `roubo` → vermelho (`#FF3232`)
- `assalto` → rosa (`#FF2D78`)
- `acidente` → laranja (`#FF7A00`)
- `alagamento` → azul (`#3D8EFF`)
- `perigo` → amarelo (`#FFD000`)

Ao invés de 1 heatmap genérico, separar os features por tipo e criar heatmaps com `heatmap-color` usando a cor específica. Cada camada tem `heatmap-opacity: 0.6` para blending natural.

**Pins:** Manter o sistema atual de circles + emoji, mas:
- Outer glow: `radius: 14`, `opacity: 0.25`, `circle-blur: 0.8`
- Inner: `radius: 8`, `opacity: 1.0`
- Emoji `text-size: 16`, `text-offset: [0, -0.1]` (centrado no circle, não flutuando acima)

## 2. Centro em Campinas-SP (`mapConstants.ts` + `useMapAlerts.ts`)

- Mudar `SP_CENTER` para `[-47.0626, -22.9064]` (Campinas)
- Atualizar coordenadas dos alertas mock em `useMapAlerts.ts` para usar Campinas como base
- Atualizar zonas de risco em `MapCore.tsx` para bairros de Campinas (Centro, Cambuí, Taquaral, Barão Geraldo, Bosque)

## 3. GPS Real-time Funcional (`MapOrchestrator.tsx` + `MapCore.tsx`)

Já está auto-starting no mount. Verificar que:
- `flyTo(userCoords, 15)` funciona ao clicar GPS
- O user marker (pulsing dot) se atualiza com `watchPosition`
- O raio do usuário acompanha as coordenadas em tempo real
- Sem fallback para SP_CENTER quando GPS está ativo — só centraliza no user

## 4. Popup de Alerta Compacto (`MapaPage.tsx`)

**Atual:** Já existe um popup compacto. Refinar para ficar igual ao banner de zona de risco da HomePage:
- Dot pulsante com `boxShadow` da cor da ocorrência
- Ícone da ocorrência + título + bairro + tempo
- Altura compacta (~60px) para não atrapalhar visualização
- Tap abre modal completo

## 5. Página de Feed (`FeedPage.tsx` — novo)

**Estrutura:**
- Header com filtros (mesmos da MapaPage + pesquisa)
- Scroll vertical infinito com dois tipos de conteúdo:

**Posts de foto:**
```
┌──────────────────────────┐
│ [avatar] Nome · 2min     │
│ Legenda do post          │
│ ┌──────────────────────┐ │
│ │     📷 Mídia/Foto    │ │
│ └──────────────────────┘ │
│ [compartilhar] [salvar]  │
└──────────────────────────┘
```

**Posts de vídeo (estilo Reels):**
- Full-height card (80vh) com vídeo/placeholder de fundo
- Overlay com avatar, nome, legenda na parte inferior
- Botões laterais: curtir, comentar, compartilhar
- Scroll vertical snap entre reels
- Indicador de tipo de ocorrência (badge colorido)

**Dados:** Mock data com posts baseados nos alertas existentes + posts de foto inventados. Cada post tem: `id, type, userName, userAvatar, timestamp, caption, mediaUrl, mediaType (photo|video), occurrenceType, location`.

## 6. Mais Tipos de Ocorrências (`constants.ts`)

Adicionar aos `ALL_FILTERS`:
- `furto` → "Furto" 🕵️ (cor: purple) — Furtos sem violência
- `blitz` → "Blitz Policial" 🚔 (cor: blue) — Operações policiais
- `transito` → "Trânsito Intenso" 🚗 (cor: orange) — Congestionamentos
- `obra` → "Obra na Via" 🚧 (cor: yellow) — Interdições por obras
- `incendio` → "Incêndio" 🔥 (cor: red) — Focos de incêndio
- `veiculo_suspeito` → "Veículo Suspeito" 🚐 (cor: pink) — Veículos em atitude suspeita

Atualizar `DEFAULT_ON` para incluir os mais relevantes.

## 7. Filtros na Página de Feed

- Barra de filtros idêntica à da MapaPage (horizontal scroll de chips)
- Barra de busca para pesquisar por bairro, tipo ou texto
- Botão de configuração que abre o mesmo sheet de personalização
- Filtros afetam quais posts aparecem no feed

## 8. Perfis por Tipo de Usuário

Adicionar ao config/constants um campo `userType: "motoboy" | "motorista" | "civil"`. Por enquanto é visual — badge no perfil e no feed mostra o tipo do reporter. Ícones:
- Motoboy: 🏍
- Motorista: 🚗
- Civil: 👤

## 9. Tabs Laterais do Mapa — Sem Mudanças

Já foram redesenhadas na iteração anterior (36px circular, blur, sem borders). Manter como está.

---

## Arquivos

| Arquivo | Ação |
|---------|------|
| `src/lib/mapConstants.ts` | Centro Campinas |
| `src/components/ironguard/constants.ts` | +6 novos tipos de ocorrência, user types |
| `src/hooks/useMapAlerts.ts` | Coordenadas base Campinas |
| `src/components/map/MapCore.tsx` | Heatmap por tipo, pin offset fix, zonas Campinas |
| `src/components/map/MapOrchestrator.tsx` | GPS refinements |
| `src/components/ironguard/MapaPage.tsx` | Popup refinement |
| `src/components/ironguard/FeedPage.tsx` | **Novo** — página de feed com reels + posts |
| `src/components/ironguard/IronGuardApp.tsx` | Render FeedPage na nav "feed" |

