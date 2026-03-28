

# Redesign de Pins, Raios, GPS Real-time, Popup de Alerta e Tabs Laterais

## Resumo
Redesign premium e minimalista dos pins de ocorrência, zonas de risco com gradiente concêntrico, GPS funcional em tempo real, popup de alerta compacto no estilo da HomePage, e tabs laterais mais clean.

---

## 1. Pins de Ocorrência — Design Premium (`MapCore.tsx`)

**Atual:** Círculo escuro 14px + emoji 16px por cima. Sem refinamento visual.

**Novo design:**
- Background circle: `12px` radius, cor da ocorrência com `opacity: 0.2` (não mais preto)
- Inner circle: `7px` radius, cor sólida da ocorrência com `opacity: 0.9`
- Emoji icon: `text-size: 14`, centrado, `text-allow-overlap: true`
- Sem stroke/border em nenhum nível — clean

**Clusters:** Mesma paleta, sem stroke, `circle-opacity: 0.8`

## 2. Raios/Halos Gradiente Concêntricos (`MapCore.tsx`)

**Somente para roubo/assalto (alertas graves):**
- Camada `alert-serious-halo`: `circle-blur: 1.5`, `circle-opacity: 0.12`, radius interpolado por zoom (40→90→130px)
- Cor extraída da propriedade `color` do feature
- Sem stroke, sem arco — puro degradê radial
- Sobreposição de dois alertas graves próximos cria efeito concêntrico natural

**Zonas de risco:**
- Remover `user-radius-stroke` (borda tracejada do raio do usuário)
- `user-radius-fill`: `fill-opacity: 0.04` — quase invisível, apenas indicativo
- `zonas-risco-fill`: manter, `fill-opacity: 0.1` — mais sutil

## 3. GPS Real-time Funcional (`MapOrchestrator.tsx` + `useUserLocation.ts`)

**Problema:** GPS só inicia tracking ao clicar no botão. Precisa funcionar automaticamente.

**Mudanças:**
- `MapOrchestrator`: chamar `startTracking()` automaticamente no mount via `useEffect`
- Quando `userCoords` muda, `MapCore` já atualiza o marker e o raio — isso já funciona
- Ao clicar GPS, fazer `flyTo(userCoords)` com zoom 15 para centralizar
- Atualizar estilo do botão GPS para indicar estado ativo (tracking vs idle)

## 4. Popup de Alerta Compacto (`MapaPage.tsx`)

**Atual:** O toast no topo é simples. O `OccurrenceModal` é um sheet grande com cards scrolláveis.

**Novo:** Quando um pin é clicado, mostrar um popup compacto (não o modal gigante) no estilo do banner de "ZONA DE RISCO" da HomePage:
- Altura: ~70px, posicionado abaixo das tabs de filtro (top: ~148px)
- Layout: ícone da ocorrência | título + bairro + tempo | distância + confirmações
- Dot pulsante com cor da ocorrência
- Botão X para fechar
- Background: `${color}0A`, border: `${color}1A`, borderRadius: 14
- Tap no popup abre o `OccurrenceModal` completo

**Isso substitui** a abertura direta do OccurrenceModal ao clicar no pin — agora é: pin → popup compacto → tap popup → modal completo.

## 5. Tabs Laterais Minimalistas (`MapControls.tsx`)

**Atual:** 40px botões com `borderRadius: 12`, background escuro com border.

**Novo design premium:**
- Tamanho: `36px × 36px`
- `borderRadius: 50%` (totalmente circular)
- Background: `rgba(11,16,24,0.7)` sem border visível (`border: 1px solid transparent`)
- Backdrop blur mais forte: `blur(20px)`
- Ícones: `14px`, stroke-width `1.5` (mais fino)
- Estado ativo: glow sutil `box-shadow: 0 0 10px ${color}30`
- Gap entre botões: `8px`
- Sem shadow pesado — apenas blur

## Arquivos Modificados

| Arquivo | Mudanças |
|---------|----------|
| `MapCore.tsx` | Redesign pin layers, ajustar halos, remover user-radius-stroke, suavizar opacidades |
| `MapControls.tsx` | Botões circulares 36px, ícones 14px, sem borders visíveis, glow ativo |
| `MapOrchestrator.tsx` | Auto-start GPS tracking no mount, flyTo com zoom ao clicar GPS |
| `MapaPage.tsx` | Popup compacto ao clicar pin (estilo zona de risco), tap abre modal completo |

