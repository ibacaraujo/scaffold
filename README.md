# Scaffold

A matemática e a programação para compreender as aulas de [Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html), de Andrej Karpathy, começando do início e em lições curtas. Um projeto da Bragat.

O Scaffold não refaz as aulas nem usa os exemplos delas: prepara a pessoa para compreender os conceitos. Não é afiliado ao curso.

Site estático, sem servidor: a matemática tem gráficos que se mexem e respostas conferidas na hora; a programação roda em Python no navegador (Pyodide). O progresso fica no aparelho. O conteúdo das lições está em `licoes.js` (Capítulo 1) e `capitulo2.js` (Capítulo 2), e os exercícios de depois de cada aula em `depois1.js` e `depois2.js`; a trilha (cada capítulo do Scaffold antes da aula correspondente do curso) está em `trilha.js`.

Para rodar localmente: `python3 -m http.server` nesta pasta.

## Depois do curso: papers

No curso, o Karpathy implementa papers aula a aula. Depois dele há duas trilhas de papers que continuam esse método por conta própria (ler o paper inteiro, achar o núcleo, implementá-lo com a mesma simplicidade, reproduzir um número e fazer uma pergunta que o paper não fez), com públicos diferentes.

### Mainstream

Os papers famosos, um por capítulo, para qualquer pessoa que terminou o curso.

O Paper 1 (`paper1.js`) ensina o método no caso típico, uma linha de base mais uma diferença, com Hu et al. (2021), *LoRA: Low-Rank Adaptation of Large Language Models*: achar o núcleo no resumo, ver o problema que ele resolve (o tempo a mais dos adapters, na Tabela 1), ler a equação (3) e contar os parâmetros, escrever a camada `W0 x + BAx`, os gradientes de B e A à mão e o laço de treino, juntar os pesos, reproduzir a Tabela 6 em miniatura (a perda para cada r) e perguntar o que acontece quando a mudança da tarefa não tem posto baixo. A última parte é uma ficha para aplicar o método a qualquer paper.

O Paper 2 (`paper2.js`) aplica o método a um paper que não muda o modelo, Kaplan et al. (2020), *Scaling Laws for Neural Language Models*: ler a equação, conferir o ajuste log-log num caso com resposta conhecida, refazer a reta da Figura 1 com um modelo pequeno que roda no navegador, conferir se ela é mesmo uma reta (as inclinações locais), ver a curva encostar num piso com poucos dados (a equação 1.5) e achar o pico da dupla descida quando se tira a regularização.

Nos dois, cada lição mostra o trecho do paper que está implementando (a equação, a figura, a frase), recortado do PDF do arXiv, com o link para a página; os recortes ficam em `papers/`. Os próximos papers sugeridos estão em `MAINSTREAM`, em `trilha.js`, e a linha do tempo da página da trilha (`MARCOS`) mostra onde cada um se encaixa, junto dos marcos que não viraram capítulo (GPT-3, InstructGPT, Chinchilla).

### Linha de pesquisa

Uma pesquisa de verdade, em andamento, mostrada passo a passo: cada capítulo é uma peça do paper do ICWM e termina num passo que roda numa GPU. Os capítulos têm `n` a partir de 20, para não se misturar com os da Mainstream.

A Pesquisa 1 é a LeWorldModel (Maes et al., 2026), a base e o código onde o experimento roda, com o número do PushT reproduzido em poucos episódios. A Pesquisa 2 é o Language-Forcing (Li et al., 2026), o paper a superar, transplantado para dentro da LeWorldModel. A Pesquisa 1 (`pesquisa1.js`) lê o núcleo (a perda de previsão mais o SIGReg, sem EMA nem stop-gradient), implementa em NumPy no navegador o teste de Epps–Pulley, o SIGReg, o colapso num mundo de resposta conhecida e o CEM, e termina na célula 1: a conta de poder, a regra de escolha do número de episódios e a configuração do treino que roda numa GPU. A Pesquisa 2 (`pesquisa2.js`) lê a equação de alinhamento e as ablações (Tabelas 2 e 3, Figura 4), implementa a perda de cosseno, o projetor, o controle embaralhado e a correção de Holm, e termina no plano do transplante para a LeWM e na pergunta do paper do ICWM. Os dois estão em `PESQUISA`, em `trilha.js`; as leituras que entram no paper sem virar capítulo (Coconut, ECoT-Lite, TacitVLA, Deng et al. e Grounding Spatial Relations) estão em `MARCOS_PESQUISA`.
