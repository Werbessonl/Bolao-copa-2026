# Bolão Copa do Mundo 2026 — Squad Contas Médicas

Site interativo do bolão do grupo, hospedado gratuitamente no GitHub Pages.
Acesse em: https://werbessonl.github.io/Bolao-copa-2026/

---

## O que o site faz

O site é uma página única (chamada de SPA — Single Page Application) com 5 telas:

| Tela | O que mostra |
|------|-------------|
| **Home** | Página inicial com botões de navegação e estatísticas do bolão |
| **Acompanhe Ao Vivo** | Jogos do dia, classificação dos grupos e melhores terceiros. Dados atualizados a cada 15 minutos automaticamente |
| **Apostas** | As artes visuais com os palpites completos de cada participante |
| **Raio X** | Análise comparativa: times mais apostados, perfis de cada jogador, consenso do grupo |
| **Ranking** | Placar dos pontos reais (baseado em resultados já disputados) e pontos virtuais (projeção com base na classificação atual dos grupos) |

---

## Como os pontos funcionam

| Fase | Pontos por acerto |
|------|-------------------|
| Classificados dos grupos (top 2 por grupo + 8 melhores 3ºs) | 1 pt cada |
| 16 avos de final | 2 pts cada |
| Oitavas de final | 3 pts cada |
| Quartas de final | 4 pts cada |
| Semifinal | 5 pts cada |
| Vice-campeão (chegar à final) | 8 pts |
| Campeão | 8 pts + 25 pts de bônus = **33 pts** |
| **Total máximo possível** | **155 pts** |

O **Ranking Virtual** projeta os pontos como se a classificação atual dos grupos fosse o resultado final — é uma estimativa, não o placar real.

---

## Como o site é construído (para referência técnica)

O site inteiro é **um único arquivo HTML** (`index.html`) montado a partir de 3 arquivos base que ficam em uma pasta temporária:

```
spa_before.html   → Estrutura HTML + todo o CSS (estilos visuais)
hb_json.txt       → As 12 artes HTML dos participantes (embutidas como texto)
spa_after.js      → Toda a lógica JavaScript (navegação, pontuação, ranking, etc.)
```

Para gerar o `index.html` final, esses 3 arquivos são concatenados em sequência usando PowerShell:

```powershell
$combined = (conteúdo do spa_before.html) + (conteúdo do hb_json.txt) + (conteúdo do spa_after.js)
# Salva como index.html
```

---

## Atualização automática dos dados

Os dados de jogos e classificação vêm de uma API de futebol chamada **football-data.org**.

Um robô automático (GitHub Actions) roda a cada 15 minutos e:
1. Busca os resultados de partidas encerradas
2. Busca os jogos do dia de hoje
3. Busca a classificação dos grupos
4. Salva tudo em um arquivo chamado `data.json` no repositório

O site lê esse `data.json` quando você abre a tela de Classificação ou Ranking. A chave de acesso à API fica guardada em segredo no GitHub (nunca aparece no código público).

---

## Plataformas e serviços utilizados

| Serviço | Para que serve | Custo |
|---------|---------------|-------|
| **GitHub** | Armazena o código e o histórico de versões | Grátis |
| **GitHub Pages** | Hospeda o site publicamente na internet | Grátis |
| **GitHub Actions** | Robô que atualiza os dados a cada 15 minutos | Grátis |
| **football-data.org** | API com resultados e classificações em tempo real | Grátis (plano básico) |
| **flagcdn.com** | Imagens das bandeiras dos países | Grátis |
| **Google Fonts** | Fonte "Bebas Neue" usada nas artes | Grátis |
| **Cazé TV (YouTube)** | Link direto para assistir os jogos ao vivo | Externo |

---

## Regras importantes do código

1. **A chave da API nunca fica no código** — ela fica em "Secrets" do GitHub e só o robô tem acesso.
2. **As bandeiras usam flagcdn.com** — os tamanhos válidos são: h20, h40, h80, h120, h240. Outros tamanhos quebram a imagem.
3. **O arquivo `data.json` é a única fonte de dados do site** — o navegador do usuário nunca chama a API diretamente.
4. **A versão da página segue numeração sequencial**: 1.0, 1.1... 2.9, 3.0, 3.1... sem pular números.
5. **O arquivo `hb_json.txt` começa com `const HTMLS = [` e termina com `"];`** — isso é fundamental para a montagem funcionar.

---

## Participantes

Andressa · Boaventura · Bruno · Claudio Henrique · Everton Paes · Fabio Fischer · Jorge Patricio · Osmar · Savio · Thais · Wellerson · Werbesson Lourenco

---

## Histórico resumido de versões

| Versão | Principais mudanças |
|--------|---------------------|
| 1.x | Estrutura inicial, artes HTML dos participantes |
| 2.x | Ranking de pontos, Raio X, melhorias visuais |
| 3.0 | Ícones nos botões, correção de bug de grupos (API retornava "Atlantic Division") |
| 3.1 | Comparativo entre dois participantes no ranking virtual |
| 3.2 | Aba "Jogos Hoje", bandeiras corrigidas, filtro por data de Brasília, ícone YouTube |
| 3.3 | Ícone ao vivo com animação de piscar, comentários de manutenção restaurados |
| 3.4–3.9 | Tooltip de apostas por seleção, reordem de botões/navbar, título "Bolão - R$240,00 🤑", rodapé "Agile Tech +", workflow busca jogos D+1 UTC |
| 4.0 | Título da aba "Bolão - Squad CM", logo SQUAD clicável (atualiza página), correção de fonte nas artes |
| 4.1 | Favicon personalizado (SVG→PNG), PWA manifest, theme-color para barra do iPhone |
| 4.2 | Correção crítica: `const HTMLS` ausente do `hb_json.txt` restaurado — apostas voltam a funcionar |
| 4.3 | `viewport-fit=cover` + `safe-area-inset-top` no navbar/home-header — barra do iPhone fica azul escuro |
| 4.4 | Overscroll background vermelho `#E61D25` — fundo ao deslizar além do limite da página |
| 5.6 | Fases: abre na fase atual ao clicar na aba, workflow estendido para 30 dias (cobre Final 19/jul), `_lastClassifData` global para renavegação |
| 5.5 | Fases: bracket-pair connector (alça azul/dourada) em Oitavas, Quartas, Semis e Final igual ao 16 Avos |
| 5.4 | Fases: abre na fase correta (detectCurrentPhase corrigido), Oitavas→Final com Chave A/B e labels "Vencedor 2A×2B" em vez de "A definir" |
| 5.3 | Seção "Ao Vivo" reformulada: 2 abas (Ao Vivo = jogos hoje, Fases = swipe estilo Apple Sports com Grupos→3°s→16 Avos→Oitavas→Quartas→Semi→Final), abre na fase atual automaticamente |
| 5.2 | Fix real = virtual: pontuação de grupos usa `apostas32 = grupos + melhores_terceiros` combinado — qualquer time que classificou (top2 OU melhor 3°) conta se estava em qualquer das 32 apostas |
| 5.1 | Fix divergência real vs virtual (revertido) |
| 5.0 | Sincronização e limpeza pós-CLI: chaveamento FIFA 2026 com Chave A/B, placares via `score.winner` (cobre prorrogação/pênaltis), `bracketTeam()` resolve times por classificação dos grupos, `BRACKET_32` e `BRACKET_SIDES` como dados centrais |
| 4.9 | Nova aba "16 Avos" em Ao Vivo (layout lista, times A definir para grupos pendentes), workflow busca partidas eliminatórias agendadas |
| 4.8 | Arte da Thais corrigida: melhores 3° exibem o que ela de fato apostou (Argentina, França, Brasil, Alemanha, Portugal, Espanha, Inglaterra, Holanda) |
| 4.7 | Fix palpites Thais (melhores_terceiros corretos), fix virtual double-counting, melhores 3° reais só quando todos grupos encerram |
| 4.6 | Fix ranking real: `calcRealPoints` agora pontua grupos encerrados (1 pt por classificado confirmado) |
| 4.5 | Auditoria e otimização: `@keyframes livePulse` duplicado corrigido, CSS órfão removido, dois blocos `@media` mesclados, variáveis mortas (`finalAdv`, `foundLetters`) removidas, `var` com escopo vazando convertidos para `let`, comparador de standings extraído para `standingsCmp()` |
