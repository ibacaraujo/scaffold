# Scaffold

A matemática e a programação para compreender as aulas de [Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html), de Andrej Karpathy, começando do início e em lições curtas. Um projeto da Bragat.

O Scaffold não refaz as aulas nem usa os exemplos delas: prepara a pessoa para compreender os conceitos. Não é afiliado ao curso.

Site estático, sem servidor: a matemática tem gráficos que se mexem e respostas conferidas na hora; a programação roda em Python no navegador (Pyodide). O progresso fica no aparelho. O conteúdo das lições está em `licoes.js` (Capítulo 1) e `capitulo2.js` (Capítulo 2), e os exercícios de depois de cada aula em `depois1.js` e `depois2.js`; a trilha (cada capítulo do Scaffold antes da aula correspondente do curso) está em `trilha.js`.

Para rodar localmente: `python3 -m http.server` nesta pasta.

## Depois do curso: papers

No curso, o Karpathy implementa papers aula a aula. A trilha de papers continua esse método por conta própria (ler o paper inteiro, achar o núcleo, implementá-lo com a mesma simplicidade, reproduzir um número e fazer uma pergunta que o paper não fez) e é a trilha da pesquisa: cada paper é uma peça do paper do ICWM.

O Paper 1 é a LeWorldModel (Maes et al., 2026), a base e o código onde o experimento roda, com o número do PushT reproduzido em poucos episódios. O Paper 2 é o Language-Forcing (Li et al., 2026), o paper a superar, transplantado para dentro da LeWorldModel. Os dois estão em `PAPERS`, em `trilha.js`; as leituras que entram no paper sem virar capítulo (Coconut, ECoT-Lite, TacitVLA, Deng et al. e Grounding Spatial Relations) estão em `MARCOS`.
