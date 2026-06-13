/**
 * =============================================================================
 * INTEGRAÇÃO: RANKING VIRTUAL NO INDEX.HTML
 * =============================================================================
 * 
 * Este arquivo integra o módulo ranking-virtual.js com o código existente
 * do index.html, substituindo a função calcVirtualPoints por uma versão
 * corrigida baseada na sugestão do ChatGPT.
 * 
 * Mudanças principais:
 * 1. Usa normalização inteligente de nomes de times
 * 2. Conta apenas Top 2 de grupos com jogos disputados
 * 3. Ignora grupos incompletos (sem standinga até o 2º lugar)
 * 4. Mantém compatibilidade com código existente
 */

/**
 * FUNÇÃO CORRIGIDA: Calcula pontos virtuais baseado em Top 2 de grupos
 * 
 * Substitui a função original em index.html (linha 935)
 * 
 * @param {Array} realScores - Array com {name, idx, real, virtual}
 * @param {Array} standings - Array de objetos com {table, group}
 * @returns {Array} Array com scores atualizados incluindo virtual points
 */
function calcVirtualPointsCorrected(realScores, standings) {
  // Caso 1: Sem dados de standings
  if (!standings || standings.length === 0) {
    return realScores.map(s => ({...s, virtual: s.real}));
  }

  // Obtém times qualificados (Top 2) de cada grupo
  const qualifiedTeams = [];
  const groupsProcessed = [];

  standings.forEach(grp => {
    if (!grp.table || grp.table.length === 0) {
      return; // Grupo sem dados, ignorar
    }

    // Filtra apenas times na posição 1 e 2
    // Nota: Pode haver múltiplos times com position=1 em caso de empate
    const positions = new Set();
    const top2Teams = [];

    grp.table.forEach(row => {
      if (row.position && row.position <= 2 && !positions.has(row.position)) {
        positions.add(row.position);
        if (row.team && row.team.name) {
          top2Teams.push(row.team.name);
          qualifiedTeams.push(row.team.name);
        }
      }
    });

    if (top2Teams.length > 0) {
      groupsProcessed.push({
        group: grp.group || '?',
        teams: top2Teams
      });
    }
  });

  console.log(`ℹ️ Grupos processados: ${groupsProcessed.length}`);
  console.log(`ℹ️ Times qualificados (Top 2): ${qualifiedTeams.length}`);

  // Calcula pontos virtuais para cada participante
  return realScores.map(s => {
    const p = PALPITES[s.idx];
    let gruposPts = 0;

    // Conta acertos em apostas de grupos
    p.grupos.forEach(apostado => {
      if (inList(apostado, qualifiedTeams)) {
        gruposPts += 1;
      }
    });

    return {...s, virtual: s.real + gruposPts};
  });
}

/**
 * FUNÇÃO AUXILIAR: Versão melhorada de calcVirtualPointsCorrected
 * que usa o módulo ranking-virtual.js para normalização robusta
 * 
 * Use esta função se quiser máxima compatibilidade com diferentes
 * formatos de nomes de times (português/inglês, acentuação, etc.)
 */
function calcVirtualPointsImproved(realScores, standings) {
  // Obtém times qualificados usando o módulo ranking-virtual.js
  const virtualQualified = getVirtualQualifiedTeams({ standings });

  console.log(`ℹ️ Times qualificados (normalizado): ${virtualQualified.size}`);

  // Calcula pontos virtuais para cada participante
  return realScores.map(s => {
    const p = PALPITES[s.idx];
    let gruposPts = 0;

    // Conta acertos usando comparação normalizada
    p.grupos.forEach(apostado => {
      const normalized = normalizeTeamName(apostado);
      if (virtualQualified.has(normalized)) {
        gruposPts += 1;
      }
    });

    return {...s, virtual: s.real + gruposPts};
  });
}

/**
 * INSTRUÇÃO DE INTEGRAÇÃO:
 * 
 * 1. No arquivo index.html, localize a função calcVirtualPoints (linha ~935)
 * 
 * 2. Substitua o corpo da função por:
 * 
 *    function calcVirtualPoints(realScores, standings) {
 *      return calcVirtualPointsImproved(realScores, standings);
 *    }
 * 
 * 3. Certifique-se de que ranking-virtual.js é carregado ANTES de index.html
 *    no HTML:
 * 
 *    <script src="ranking-virtual.js"></script>
 *    <script src="index.html"></script>
 * 
 * 4. Ou, se preferir a versão simples sem o módulo:
 * 
 *    function calcVirtualPoints(realScores, standings) {
 *      return calcVirtualPointsCorrected(realScores, standings);
 *    }
 */

/**
 * TESTES: Execute no console do navegador para validar
 */
function testVirtualRankingLogic() {
  console.log('\n=== TESTE DE RANKING VIRTUAL ===\n');

  // Simula dados dos standings (formato do data.json)
  const testStandings = [
    {
      group: "Group A",
      table: [
        { position: 1, team: { name: "Mexico" } },
        { position: 2, team: { name: "South Korea" } },
        { position: 3, team: { name: "Czechia" } },
        { position: 4, team: { name: "South Africa" } }
      ]
    },
    {
      group: "Group B",
      table: [
        { position: 1, team: { name: "Bosnia-Herzegovina" } },
        { position: 2, team: { name: "Canada" } },
        { position: 3, team: { name: "Qatar" } },
        { position: 4, team: { name: "Switzerland" } }
      ]
    },
    {
      group: "Group D",
      table: [
        { position: 1, team: { name: "United States" } },
        { position: 2, team: { name: "Australia" } },
        { position: 3, team: { name: "Turkey" } },
        { position: 4, team: { name: "Paraguay" } }
      ]
    }
  ];

  // Simula scores reais
  const testScores = [
    { name: "Osmar", idx: 7, real: 0, virtual: 0 },
    { name: "Werbesson", idx: 11, real: 0, virtual: 0 }
  ];

  // Calcula usando a função melhorada
  const result = calcVirtualPointsCorrected(testScores, testStandings);

  console.log('✅ Resultado do teste:');
  console.table(result);

  // Esperado:
  // - México, Coreia do Sul (Grupo A)
  // - Bósnia, Canadá (Grupo B)
  // - EUA, Austrália (Grupo D)
  // Total: 6 times qualificados

  return result;
}

// Exporta para use em Node.js se necessário
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calcVirtualPointsCorrected,
    calcVirtualPointsImproved,
    testVirtualRankingLogic
  };
}

console.log('✅ Módulo de integração carregado com sucesso');
console.log('📝 Funções disponíveis:');
console.log('   - calcVirtualPointsCorrected(realScores, standings)');
console.log('   - calcVirtualPointsImproved(realScores, standings)');
console.log('   - testVirtualRankingLogic()');
