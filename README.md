# Scaffold

A matemática e a programação para compreender as aulas de [Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html), de Andrej Karpathy, começando do início e em lições curtas. Um projeto da Bragat.

O Scaffold não refaz as aulas nem usa os exemplos delas: prepara a pessoa para compreender os conceitos. Não é afiliado ao curso.

Site estático, sem servidor: a matemática tem gráficos que se mexem e respostas conferidas na hora; a programação roda em Python no navegador (Pyodide). O progresso fica no aparelho. O conteúdo das lições está em `licoes.js` (Capítulo 1) e `capitulo2.js` (Capítulo 2), e os exercícios de depois de cada aula em `depois1.js` e `depois2.js`; a trilha (cada capítulo do Scaffold antes da aula correspondente do curso) está em `trilha.js`.

Para rodar localmente: `python3 -m http.server` nesta pasta.

## Depois do curso: papers

No curso, o Karpathy implementa papers aula a aula. A trilha de papers continua esse método por conta própria: ler o paper inteiro, achar o núcleo, implementá-lo com a mesma simplicidade, reproduzir um número e fazer uma pergunta que o paper não fez.

O Paper 1 (`paper1.js`) ensina o método com Kaplan et al. (2020), *Scaling Laws for Neural Language Models*: ler a equação, conferir o ajuste log-log num caso com resposta conhecida, refazer a reta da Figura 1 com um modelo pequeno que roda no navegador, conferir se ela é mesmo uma reta (as inclinações locais), ver a curva encostar num piso com poucos dados (a equação 1.5) e achar o pico da dupla descida quando se tira a regularização. Cada lição mostra o trecho do paper que está implementando (a equação, a figura, a frase), recortado do PDF do arXiv, com o link para a página; esses recortes ficam em `papers/kaplan2020/`. A última parte é uma ficha para aplicar o método a qualquer paper. Os próximos papers sugeridos estão em `PAPERS`, em `trilha.js`.

