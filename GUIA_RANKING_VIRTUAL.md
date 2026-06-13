# 📋 GUIA DE IMPLEMENTAÇÃO: RANKING VIRTUAL CORRIGIDO

## 🎯 Resumo Executivo

Sua lógica de ranking virtual tem **3 problemas críticos**:

1. **Grupos incompletos**: Alguns grupos têm posições duplicadas (position: 1, 1, 3, 4)
2. **Top 2 virtual**: O cálculo atual está correto, mas precisa de dados de TODOS os 12 grupos
3. **Falta de normalização**: Diferentes formatos de nomes (México vs Mexico) não são tratados

**Solução**: Implementei 2 módulos novos que corrigem essas falhas.

---

## 📦 Arquivos Criados

### 1. `ranking-virtual.js` (9.7 KB)
**Módulo principal com lógica corrigida**

- ✅ Normaliza nomes de times (inglês ↔ português)
- ✅ Extrai apenas Top 2 de grupos com jogos disputados
- ✅ Usa `Set` para performance
- ✅ Funções exportáveis para testes

**Funções principais**:
```javascript
normalizeTeamName(teamName)           // Padroniza nomes
getVirtualQualifiedTeams(standings)   // Extrai Top 2 de grupos
calculateVirtualRanking(bets, standings) // Calcula ranking completo
```

### 2. `ranking-virtual-integration.js` (6.4 KB)
**Módulo de integração com seu código existente**

- ✅ Funciona com `index.html` atual
- ✅ Fornece `calcVirtualPointsCorrected()` e `calcVirtualPointsImproved()`
- ✅ Inclui função de teste

---

## 🔧 Como Integrar

### Passo 1: Carregar os scripts no HTML

No `index.html`, antes de fechar `</head>`, adicione:

```html
<!-- Ranking Virtual - Módulos corrigidos -->
<script src="ranking-virtual.js"></script>
<script src="ranking-virtual-integration.js"></script>
```

### Passo 2: Substituir função no index.html

Localize a função `calcVirtualPoints` (linha ~935) no `index.html`:

**Antes:**
```javascript
function calcVirtualPoints(realScores, standings) {
  if (!standings || standings.length === 0) {
    return realScores.map(s => ({...s, virtual: s.real}));
  }
  // ... 60+ linhas de lógica
}
```

**Depois (opção simples):**
```javascript
function calcVirtualPoints(realScores, standings) {
  return calcVirtualPointsCorrected(realScores, standings);
}
```

**Ou (opção com normalização robusta):**
```javascript
function calcVirtualPoints(realScores, standings) {
  return calcVirtualPointsImproved(realScores, standings);
}
```

### Passo 3: Testar no navegador

Abra o console (F12) e execute:

```javascript
testVirtualRankingLogic()
```

Esperado: Ver resultado com 6 times qualificados (México, Coreia, Bósnia, Canadá, EUA, Austrália).

---

## 🔍 Comparação: Antes vs Depois

### Antes (Lógica Original)

```javascript
const top2 = [];
const thirds = [];

standings.forEach(grp => {
  const sorted = [...grp.table].sort(/* ... */);
  sorted.forEach((row, idx) => {
    if (idx < 2) top2.push(row.team.name);      // ❌ Problema: 
    if (idx === 2) thirds.push(row);            //    idx é índice do array,
  });                                            //    não a posição do time
});
```

**Problema**: Se há empate em 1º lugar, `idx < 2` pega apenas os 2 primeiros do array, não necessariamente o 1º e 2º lugar.

### Depois (Lógica Corrigida)

```javascript
standings.forEach(grp => {
  if (!grp.table || grp.table.length === 0) {
    return; // Ignora grupos sem dados
  }

  const positions = new Set();
  const top2Teams = [];

  grp.table.forEach(row => {
    // ✅ Verifica POSIÇÃO real, não índice
    if (row.position && row.position <= 2 && !positions.has(row.position)) {
      positions.add(row.position);
      if (row.team && row.team.name) {
        top2Teams.push(row.team.name);
        qualifiedTeams.push(row.team.name);
      }
    }
  });
});
```

---

## 📊 Validação com Dados Reais

### Dados do `data.json` (13 de junho de 2026)

| Grupo | Posição | Time | Status |
|-------|---------|------|--------|
| A | 1º | México | ✅ Qualificado |
| A | 2º | Coreia do Sul | ✅ Qualificado |
| B | 1º | Bósnia-Herzegovina | ✅ Qualificado |
| B | 2º | Canadá | ✅ Qualificado |
| D | 1º | Estados Unidos | ✅ Qualificado |
| D | 2º | Austrália | ❌ (sem jogos) |
| C-I | - | Sem dados | ❌ Incompletos |

**Total de Top 2 definidos**: 5-6 times
**Máximo de acertos esperado**: ~6 pontos virtuais

### Resultado Esperado do Ranking Virtual

```
Pos  Participante    Acertos Esperados (aprox.)
1º   Osmar           4-5 (apostou em México, Canadá, EUA, ...)
2º   Werbesson       4-5 (apostou em México, Canadá, ...)
...
```

⚠️ **NOTA**: Para chegar aos **18 acertos** mostrados no seu esperado, seriam necessários dados de **todos os 12 grupos**, o que ocorrerá após mais rodadas da Copa.

---

## 🚀 Workflow de Atualização Automática

Seu `.github/workflows/update-data.yml` já está configurado corretamente:

```yaml
- name: Buscar dados da API
  run: |
    curl -H "X-Auth-Token: $API_KEY" \
         "https://api.football-data.org/v4/competitions/WC/standings" \
         -o standings_raw.json
```

A cada hora, novos dados são buscados e o `data.json` é atualizado. O ranking virtual será recalculado automaticamente quando você clicar na aba "Ranking".

---

## 📝 Mapeamento de Times (Normalização)

O módulo suporta automaticamente:

| Português | Inglês | Normalizado |
|-----------|--------|------------|
| México | Mexico | mexico |
| Coreia do Sul | South Korea | coreia do sul |
| EUA | United States | estados unidos |
| Irã | Iran | ira |
| Curaçao | Curaçao | curacao |
| República Tcheca | Czech Republic | republica tcheca |

Adicione mais mapeamentos em `TEAM_NORMALIZATION_MAP` conforme necessário.

---

## 🧪 Testes Automatizados

Para testar toda a lógica:

```javascript
// No console do navegador
testVirtualRankingLogic()
```

Output esperado:
```
✅ Resultado do teste:
┌────────────┬─────────────┐
│ name       │ virtual     │
├────────────┼─────────────┤
│ Osmar      │ 4           │
│ Werbesson  │ 4           │
└────────────┴─────────────┘
```

---

## 🔗 Próximos Passos

1. **Integrar scripts** no `index.html`
2. **Testar** no navegador (F12 → Console)
3. **Monitorar** dados da API conforme a Copa avança
4. **Ajustar** mapeamentos de times conforme necessário

---

## 📞 Suporte

Se encontrar problemas:

1. Abra o console (F12)
2. Execute `testVirtualRankingLogic()`
3. Verifique logs com ⚠️ ou ❌
4. Confirme que `standings` tem dados válidos

---

**Criado em**: 13 de junho de 2026  
**Versão**: 1.0  
**Status**: Pronto para integração
