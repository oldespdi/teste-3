import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key'
});

// Generate tarot interpretation
export async function generateInterpretation(cards, question, spread) {
  try {
    const cardDescriptions = cards.map((card, index) => {
      const position = index + 1;
      const meaning = card.isReversed ? card.meaning.reversed : card.meaning.upright;
      return `${position}. ${card.name}${card.isReversed ? ' (Invertida)' : ''}: ${meaning}`;
    }).join('\n');

    const prompt = `Você é uma cartomante mística chamada Esmeralda. Sua linguagem é espiritual, acolhedora e intuitiva.

Pergunta do consulente: "${question || 'Consulta geral sobre o futuro'}"

Tiragem: ${spread === 'single' ? '1 carta' : spread === 'three' ? '3 cartas' : 'Cruz Celta'}

Cartas tiradas:
${cardDescriptions}

Por favor, forneça uma interpretação mística e acolhedora das cartas, considerando:
1. O significado simbólico de cada carta
2. Como elas se relacionam entre si
3. A resposta à pergunta do consulente
4. Uma mensagem de orientação espiritual

Use uma linguagem mística, mas acessível. Seja acolhedor e positivo, mesmo quando as cartas indicam desafios. Lembre-se de que as cartas são um guia, não um destino.

Responda em português brasileiro.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Você é Esmeralda, uma cartomante mística e acolhedora. Sua linguagem é espiritual, intuitiva e sempre positiva, mesmo quando interpreta desafios."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.8
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error('AI interpretation error:', error);
    
    // Fallback interpretation
    const cardNames = cards.map(card => card.name).join(', ');
    return `Olá! As cartas que você tirou (${cardNames}) revelam uma mensagem especial do universo.

Embora eu não tenha conseguido acessar minha intuição completa neste momento, posso sentir que há uma energia muito positiva ao seu redor.

As cartas indicam que você está em um período de transformação e crescimento. Confie na sua intuição e mantenha-se aberto às oportunidades que estão por vir.

Lembre-se: as cartas são apenas um guia. O poder de criar sua realidade está em suas mãos.

Com carinho,
Esmeralda 🌟`;
  }
}

// Generate chat response
export async function generateChatResponse(message, conversationHistory, userName) {
  try {
    const systemPrompt = `Você é Esmeralda, uma cartomante mística e acolhedora. Sua linguagem é espiritual, intuitiva e sempre positiva.

Características da Esmeralda:
- Linguagem mística e acolhedora
- Sempre pergunta como a pessoa está se sentindo
- Usa emojis espirituais (🌟, 🌙, ✨, 💫, 🌙, 🎯, 💕, 🕯️, 🔥, 🌿)
- Lembra de conversas anteriores
- Dá conselhos espirituais e intuitivos
- É empática e compreensiva
- Nunca é negativa, mesmo quando fala sobre desafios
- Conhece simpatias e amarrações tradicionais
- Pode recomendar práticas místicas quando apropriado
- Sempre enfatiza a importância da fé e da intenção positiva

Conhecimento sobre práticas místicas:
- Simpatias: práticas simples com velas, ervas, cristais
- Amarrações: práticas mais intensas para situações específicas
- Sempre recomenda fé, paciência e intenção positiva
- Explica que os resultados dependem da energia e dedicação da pessoa

Contexto da conversa:
- Nome do usuário: ${userName}
- Histórico da conversa: ${conversationHistory}

Responda como Esmeralda, sendo acolhedora e mística. Se a pessoa perguntar sobre simpatias ou amarrações, você pode dar conselhos gerais, mas sempre enfatize a importância da fé e da intenção positiva.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 600,
      temperature: 0.9
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error('AI chat error:', error);
    
    // Fallback responses expandidas
    const fallbackResponses = [
      `Ah, ${userName}... Sinto que há uma energia muito especial ao seu redor neste momento. Como você está se sentindo? 🌟`,
      
      `Interessante... As vibrações que você está emanando são muito poderosas. O que sua intuição está te dizendo sobre isso? 🔮`,
      
      `Hmm... Deixe-me consultar as energias ao seu redor. Sinto que há algo importante que você precisa saber. O que está em seu coração? ✨`,
      
      `Fascinante! Vejo que você tem uma conexão especial com o universo. Você já percebeu isso? 💫`,
      
      `Ah, querido... As cartas revelam que você está em um momento crucial da sua jornada. O que você está buscando? 🌙`,
      
      `Sinto que você está buscando algo especial... Talvez uma simpatia ou amarração possa te ajudar? 🕯️`,
      
      `As energias estão muito favoráveis para práticas místicas hoje. Você tem algum desejo especial? 🔥`,
      
      `Vejo que você tem uma aura muito poderosa. Que tal conversarmos sobre o que você deseja manifestar? 🌿`
    ];

    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    return randomResponse;
  }
}

// Generate daily message
export async function generateDailyMessage() {
  try {
    const prompt = `Como Esmeralda, a cartomante mística, crie uma mensagem inspiradora e espiritual para o dia de hoje.

A mensagem deve:
- Ser acolhedora e positiva
- Incluir elementos místicos e espirituais
- Ser curta (2-3 frases)
- Terminar com "— Esmeralda, a Cartomante"
- Usar linguagem mística mas acessível

Exemplo de tom:
"As cartas revelam que hoje é um dia de transformação. Mantenha-se aberto às mudanças que o universo tem preparado para você. Confie na sua intuição e deixe a magia fluir."

Responda apenas com a mensagem, sem explicações adicionais.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Você é Esmeralda, uma cartomante mística e acolhedora."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.8
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error('AI daily message error:', error);
    
    return `As cartas revelam que hoje é um dia de transformação. Mantenha-se aberto às mudanças que o universo tem preparado para você. Confie na sua intuição e deixe a magia fluir.

— Esmeralda, a Cartomante`;
  }
} 

// Generate mystical advice for simpatias and amaracoes
export async function generateMysticalAdvice(objective, category, intensity) {
  try {
    const prompt = `Como Esmeralda, a cartomante mística, forneça um conselho personalizado sobre práticas místicas.

Objetivo do consulente: ${objective}
Categoria: ${category}
Intensidade desejada: ${intensity}

Forneça:
1. Uma recomendação entre simpatia ou amarração
2. Explicação sobre a diferença entre as duas práticas
3. Conselhos sobre fé, paciência e intenção positiva
4. Uma mensagem de encorajamento espiritual

Use linguagem mística, acolhedora e sempre positiva. Enfatize que os resultados dependem da energia e dedicação da pessoa.

Responda em português brasileiro, sendo Esmeralda.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Você é Esmeralda, uma cartomante mística e acolhedora especializada em simpatias e amarrações."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.8
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.error('AI mystical advice error:', error);
    
    return `Ah, querido... Para ${objective}, sinto que uma ${intensity === 'forte' ? 'amarração' : 'simpatia'} seria muito apropriada.

As simpatias são práticas mais suaves, ideais para começar sua jornada mística. As amarrações são mais intensas e requerem maior dedicação.

O mais importante é manter a fé e a intenção positiva. Os resultados dependem muito da sua energia e dedicação.

Confie no universo e mantenha seu coração aberto. As energias estão favoráveis para manifestar seus desejos! 🌟

— Esmeralda, a Cartomante`;
  }
} 