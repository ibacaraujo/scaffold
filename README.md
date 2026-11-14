# Scaffold

A matemática e a programação para compreender as aulas de [Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html), de Andrej Karpathy, começando do início e em lições curtas. Um projeto da Bragat.

O Scaffold não refaz as aulas nem usa os exemplos delas: prepara a pessoa para compreender os conceitos. Não é afiliado ao curso.

Site estático, sem servidor: a matemática tem gráficos que se mexem e respostas conferidas na hora; a programação roda em Python no navegador (Pyodide). O progresso fica no aparelho. O conteúdo das lições está em `licoes.js` (Capítulo 1) e `capitulo2.js` (Capítulo 2), e os exercícios de depois de cada aula em `depois1.js` e `depois2.js`; a trilha (cada capítulo do Scaffold antes da aula correspondente do curso) está em `trilha.js`.

Para rodar localmente: `python3 -m http.server` nesta pasta.

## Depois do curso: papers

No curso, o Karpathy implementa papers aula a aula. A trilha de papers continua esse método por conta própria: ler o paper inteiro, achar o núcleo, implementá-lo com a mesma simplicidade, reproduzir um número e fazer uma pergunta que o paper não fez.

O Paper 1 (`paper1.js`) ensina o método com Kaplan et al. (2020), *Scaling Laws for Neural Language Models*: ler a equação, conferir o ajuste log-log num caso com resposta conhecida, refazer a reta da Figura 1 com um modelo pequeno que roda no navegador e medir o que muda com poucos dados. A última parte é uma ficha para aplicar o método a qualquer paper.

Os papers seguintes são papers do dia, um por dia, escolhidos pela linha de pesquisa (LLMs, e a linguagem como ferramenta de aprendizado, na linha de Vygotsky). O Paper 2 (`paper2.js`) é Kim et al. (2026), *Experience-Handoff Reinforcement Learning for Recursive Self-Improvement*: um ator e um refletor aprendem num Mastermind pequeno que roda no navegador, a nota vale o jogo que ela causa, e a pergunta própria testa se as notas são internalizadas. A lista fica em `PAPERS`, em `trilha.js`.

