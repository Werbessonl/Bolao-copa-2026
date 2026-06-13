/**
 * =============================================================================
 * MÓDULO: RANKING VIRTUAL DA COPA DO MUNDO 2026
 * =============================================================================
 * 
 * Calcula o ranking virtual de um bolão baseado na classificação ATUAL dos grupos.
 * Cada acerto de Top 2 de um grupo = 1 ponto.
 * 
 * Autor: Sistema de Bolão
 * Data: 2026
 */

// ====== MAPEAMENTO DE NOMES DE TIMES ======
// Normaliza nomes vindos da API (inglês) e das apostas (português)
const TEAM_NORMALIZATION_MAP = {
  // Variações de Coreia do Sul
  'republica da coreia': 'coreia do sul',
  'korea republic': 'coreia do sul',
  'south korea': 'coreia do sul',
  'coreia': 'coreia do sul',
  'korea': 'coreia do sul',

  // Variações de EUA / Estados Unidos
  'eua': 'estados unidos',
  'usa': 'estados unidos',
  'united states': 'estados unidos',

  // Variações de Irã
  'ri do ira': 'ira',
  'iran': 'ira',
  'islamic republic of iran': 'ira',

  // Variações de Curaçao
  'curacao': 'curacao',
  'curaçao': 'curacao',

  // Variações de RD Congo
  'rd do congo': 'rd congo',
  'rd congo': 'rd congo',
  'democratic republic of congo': 'rd congo',
  'dr congo': 'rd congo',

  // Variações de República Tcheca
  'tchequia': 'republica tcheca',
  'czechoslovakia': 'republica tcheca',
  'czech republic': 'republica tcheca',
  'czechia': 'republica tcheca',

  // Inglês -> Português (alguns casos comuns)
  'mexico': 'mexico',
  'south africa': 'africa do sul',
  'bosnia-herzegovina': 'bosnia e herzegovina',
  'bosnia and herzegovina': 'bosnia e herzegovina',
  'switzerland': 'suica',
  'canada': 'canada',
  'brazil': 'brasil',
  'morocco': 'marrocos',
  'paraguay': 'paraguai',
  'germany': 'alemanha',
  'ecuador': 'equador',
  'netherlands': 'holanda',
  'japan': 'japao',
  'belgium': 'belgica',
  'egypt': 'egito',
  'spain': 'espanha',
  'uruguay': 'uruguai',
  'france': 'franca',
  'senegal': 'senegal',
  'argentina': 'argentina',
  'austria': 'austria',
  'portugal': 'portugal',
  'colombia': 'colombia',
  'england': 'inglaterra',
  'croatia': 'croacia',
  'sweden': 'suecia',
  'norway': 'noruega',
  'ghana': 'gana',
  'ivory coast': 'costa do marfim',
  'cote d\'ivoire': 'costa do marfim',
  'scotland': 'escocia',
  'saudi arabia': 'arabia saudita',
  'algeria': 'argelia',
  'serbia': 'serbia',
  'australia': 'australia',
  'tunisia': 'tunisia',
  'new zealand': 'nova zelandia',
  'qatar': 'catar',
  'panama': 'panama',
  'chile': 'chile',
  'peru': 'peru',
  'venezuela': 'venezuela',
  'bolivia': 'bolivia',
  'costa rica': 'costa rica',
  'honduras': 'honduras',
  'jamaica': 'jamaica',
  'nigeria': 'nigeria',
  'cameroon': 'camaraes',
  'mali': 'mali',
  'kenya': 'quenia',
  'congo': 'congo',
  'iraq': 'iraque',
  'uzbekistan': 'uzbequistao',
  'jordan': 'jordania',
  'ukraine': 'ucrania',
  'poland': 'polonia',
  'denmark': 'dinamarca',
  'hungary': 'hungria',
  'romania': 'romania',
  'greece': 'grecia',
  'slovakia': 'eslovaquia',
  'slovenia': 'eslovenia',
  'thailand': 'tailandia',
  'vietnam': 'vietna',
  'singapore': 'singapura',
  'oman': 'oma',
  'uae': 'emirados arabes',
  'united arab emirates': 'emirados arabes',
  'north korea': 'coreia do norte',
  'chinese taipei': 'taiwan',
  'taiwan': 'taiwan',
  'china': 'china',
  'hong kong': 'hong kong',
  'macao': 'macau',
  'cyprus': 'chipre',
  'malta': 'malta',
  'luxembourg': 'luxemburgo',
  'iceland': 'islandia',
  'finland': 'finlandia',
  'estonia': 'estonia',
  'latvia': 'letonia',
  'lithuania': 'lituania',
  'belarus': 'belarus',
  'moldova': 'moldova',
  'albania': 'albania',
  'north macedonia': 'macedonia do norte',
  'kosovo': 'kosovo',
  'montenegro': 'montenegro',
  'cape verde': 'cabo verde',
  'cape verde islands': 'cabo verde',
};

/**
 * Normaliza um nome de time removendo acentos, convertendo para minúsculas,
 * e aplicando mapeamento padrão.
 * 
 * @param {string} teamName - Nome do time
 * @returns {string} Nome normalizado
 */
function normalizeTeamName(teamName) {
  if (!teamName || typeof teamName !== 'string') return '';
  
  // Remove espaços extras
  let normalized = teamName.trim();
  
  // Converte para minúsculas
  normalized = normalized.toLowerCase();
  
  // Remove acentos usando NFD
  normalized = normalized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  
  // Aplica mapeamento padrão
  if (TEAM_NORMALIZATION_MAP[normalized]) {
    normalized = TEAM_NORMALIZATION_MAP[normalized];
  }
  
  return normalized;
}

/**
 * Compara dois nomes de times de forma inteligente.
 * Lida com variações de nomes (diferentes idiomas, acentuação, etc.)
 * 
 * @param {string} team1 - Primeiro time
 * @param {string} team2 - Segundo time
 * @returns {boolean} true se os times são iguais
 */
function teamsMatch(team1, team2) {
  const norm1 = normalizeTeamName(team1);
  const norm2 = normalizeTeamName(team2);
  return norm1 === norm2 && norm1 !== '';
}

/**
 * Extrai os times do Top 2 de cada grupo a partir da classificação atual.
 * 
 * Formato esperado de currentStandings:
 * {
 *   standings: [
 *     {
 *       group: "Group A",
 *       table: [
 *         { position: 1, team: { name: "Mexico" }, ... },
 *         { position: 2, team: { name: "South Korea" }, ... },
 *         ...
 *       ]
 *     },
 *     ...
 *   ]
 * }
 * 
 * @param {Object} standings - Objeto com propriedade 'standings' contendo grupos
 * @returns {Set} Conjunto com nomes normalizados dos times classificados virtualmente
 */
function getVirtualQualifiedTeams(standings) {
  const qualified = new Set();
  
  if (!standings || !standings.standings || !Array.isArray(standings.standings)) {
    console.warn('⚠️ Estrutura de standings inválida');
    return qualified;
  }
  
  standings.standings.forEach(group => {
    if (!group.table || !Array.isArray(group.table)) {
      return; // Grupo sem dados, ignorar
    }
    
    // Extrai apenas posições 1 e 2 (top 2)
    const top2 = group.table
      .filter(row => row.position && row.position <= 2)
      .map(row => {
        if (!row.team || !row.team.name) return null;
        return normalizeTeamName(row.team.name);
      })
      .filter(name => name !== null && name !== '');
    
    top2.forEach(team => qualified.add(team));
  });
  
  return qualified;
}

/**
 * Calcula o ranking virtual do bolão.
 * 
 * Formato esperado de bets:
 * [
 *   {
 *     participant: "Nome",
 *     groupStagePicks: ["Mexico", "South Korea", ...] (24 times)
 *   },
 *   ...
 * ]
 * 
 * Formato esperado de standings:
 * {
 *   standings: [{ group: "Group A", table: [...] }, ...]
 * }
 * 
 * @param {Array} bets - Array com apostas dos participantes
 * @param {Object} standings - Classificação atual dos grupos
 * @returns {Array} Ranking ordenado por pontos (maior -> menor), com empates em ordem alfabética
 */
function calculateVirtualRanking(bets, standings) {
  // Obtém times qualificados virtualmente (top 2 de cada grupo)
  const virtualQualified = getVirtualQualifiedTeams(standings);
  
  if (virtualQualified.size === 0) {
    console.warn('⚠️ Nenhum time qualificado encontrado nos standings');
  }
  
  // Calcula pontos para cada participante
  const ranking = bets.map(bet => {
    const { participant, groupStagePicks } = bet;
    
    if (!groupStagePicks || !Array.isArray(groupStagePicks)) {
      console.warn(`⚠️ ${participant} não tem apostas válidas`);
      return {
        participant,
        virtualPoints: 0,
        hits: [],
        misses: [],
        totalPicks: 0,
        rawPicks: groupStagePicks || []
      };
    }
    
    const hits = [];
    const misses = [];
    
    // Verifica cada aposta contra times qualificados
    groupStagePicks.forEach(pick => {
      const normalizedPick = normalizeTeamName(pick);
      
      // Procura se este time está entre os qualificados
      let found = false;
      for (let qualified of virtualQualified) {
        if (normalizedPick === qualified) {
          hits.push(pick);
          found = true;
          break;
        }
      }
      
      if (!found) {
        misses.push(pick);
      }
    });
    
    return {
      participant,
      virtualPoints: hits.length,
      hits,
      misses,
      totalPicks: groupStagePicks.length,
      rawPicks: groupStagePicks
    };
  });
  
  // Ordena por pontos (descendente), depois por nome (alfabético)
  ranking.sort((a, b) => {
    if (b.virtualPoints !== a.virtualPoints) {
      return b.virtualPoints - a.virtualPoints; // Maior pontuação primeiro
    }
    return a.participant.localeCompare(b.participant); // Empate: ordem alfabética
  });
  
  // Adiciona posição (considerando empates)
  let position = 1;
  ranking.forEach((entry, idx) => {
    if (idx > 0 && ranking[idx - 1].virtualPoints !== entry.virtualPoints) {
      position = idx + 1;
    }
    entry.position = position;
  });
  
  return ranking;
}

/**
 * Formata o ranking para exibição em console.table
 * 
 * @param {Array} ranking - Resultado de calculateVirtualRanking
 * @returns {Array} Dados formatados para table
 */
function formatRankingForDisplay(ranking) {
  return ranking.map(entry => ({
    'Pos': entry.position,
    'Participante': entry.participant,
    'Acertos': entry.virtualPoints,
    'Total de Apostas': entry.totalPicks,
    'Taxa de Acerto': `${((entry.virtualPoints / entry.totalPicks) * 100).toFixed(1)}%`
  }));
}

// ====== EXPORTS (para Node.js / módulos) ======
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    normalizeTeamName,
    teamsMatch,
    getVirtualQualifiedTeams,
    calculateVirtualRanking,
    formatRankingForDisplay
  };
}
