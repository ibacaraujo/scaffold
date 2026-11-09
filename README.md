# Scaffold

A matemática e a programação para compreender as aulas de [Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html), de Andrej Karpathy, começando do início e em lições curtas. Um projeto da Bragat.

O Scaffold não refaz as aulas nem usa os exemplos delas: prepara a pessoa para compreender os conceitos. Não é afiliado ao curso.

Site estático, sem servidor: a matemática tem gráficos que se mexem e respostas conferidas na hora; a programação roda em Python no navegador (Pyodide). O progresso fica no aparelho. O conteúdo das lições está em `licoes.js` (Capítulo 1) e `capitulo2.js` (Capítulo 2), e os exercícios de depois de cada aula em `depois1.js` e `depois2.js`; a trilha (cada capítulo do Scaffold antes da aula correspondente do curso) está em `trilha.js`.

Para rodar localmente: `python3 -m http.server` nesta pasta.

## Depois do curso: papers

No curso, o Karpathy implementa papers aula a aula. A trilha de papers continua esse método por conta própria (ler o paper inteiro, achar o núcleo, implementá-lo com a mesma simplicidade, reproduzir um número e fazer uma pergunta que o paper não fez) e é a trilha da pesquisa: cada paper é uma peça do paper do ICWM.

O Paper 1 é a LeWorldModel (Maes et al., 2026), a base e o código onde o experimento roda, com o número do PushT reproduzido em poucos episódios. O Paper 2 é o Language-Forcing (Li et al., 2026), o paper a superar, transplantado para dentro da LeWorldModel. O Paper 1 (`paper1.js`) lê o núcleo (a perda de previsão mais o SIGReg, sem EMA nem stop-gradient), implementa em NumPy no navegador o teste de Epps–Pulley, o SIGReg, o colapso num mundo de resposta conhecida e o CEM, e termina na célula 1: a conta de poder, a regra de escolha do número de episódios e a configuração do treino que roda numa GPU. O Paper 2 (`paper2.js`) lê a equação de alinhamento e as ablações (Tabelas 2 e 3, Figura 4), implementa a perda de cosseno, o projetor, o controle embaralhado e a correção de Holm, e termina no plano do transplante para a LeWM e na pergunta do paper do ICWM. Os dois estão em `PAPERS`, em `trilha.js`; as leituras que entram no paper sem virar capítulo (Coconut, ECoT-Lite, TacitVLA, Deng et al. e Grounding Spatial Relations) estão em `MARCOS`.
