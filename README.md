# Scaffold

A matemática e a programação para compreender as aulas de [Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html), de Andrej Karpathy, começando do início e em lições curtas. Um projeto da Bragat.

O Scaffold não refaz as aulas nem usa os exemplos delas: prepara a pessoa para compreender os conceitos. Não é afiliado ao curso.

Site estático, sem servidor: a matemática tem gráficos que se mexem e respostas conferidas na hora; a programação roda em Python no navegador (Pyodide). O progresso fica no aparelho. O conteúdo das lições está em `licoes.js` (Capítulo 1) e `capitulo2.js` (Capítulo 2), e os exercícios de depois de cada aula em `depois1.js` e `depois2.js`; a trilha (cada capítulo do Scaffold antes da aula correspondente do curso) está em `trilha.js`.

Para rodar localmente: `python3 -m http.server` nesta pasta.

## Duas perspectivas

**Engenharia**: os capítulos antes de cada aula do curso e, depois do curso, o método para implementar papers. O Paper 1 de engenharia (`paper1.js`) ensina o método com Kaplan et al. (2020), *Scaling Laws for Neural Language Models*, e termina com uma ficha para aplicar o método a qualquer paper.

**Research** (Bragat Research, em inglês): os papers do dia, um por dia, escolhidos pela linha de pesquisa (modelos de linguagem, e a linguagem como ferramenta de aprendizado, na linha de Vygotsky). Cada paper abre com a capa e o método num desenho que se percorre em etapas (`figuras.js`, modo `paper`), segue com a leitura do zero e termina com o núcleo implementado no estilo do Karpathy, um número reproduzido e uma pergunta própria. A lista fica em `PESQUISA`, em `trilha.js`.

O Paper 1 de pesquisa (`pesquisa1.js`) é Huang et al. (2026), *Latent Feedback Is a Compute and Data Amplifier* (Nov 13, 2026): a small model that feeds its top-layer state into the next letter, trained with two passes and a hand-written backward pass in numpy, against one that only repeats the data; the own question tests whether that state keeps the subject of the sentence. O capítulo inteiro, e a interface das lições de Research, são em inglês.
