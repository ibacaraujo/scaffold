# Scaffold

A matemática e a programação para compreender as aulas de [Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html), de Andrej Karpathy, começando do início e em lições curtas. Um projeto da Bragat.

O Scaffold não refaz as aulas nem usa os exemplos delas: prepara a pessoa para compreender os conceitos. Não é afiliado ao curso.

Site estático, sem servidor: a matemática tem gráficos que se mexem e respostas conferidas na hora; a programação roda em Python no navegador (Pyodide). O progresso fica no aparelho. O conteúdo das lições está em `licoes.js` (Capítulo 1) e `capitulo2.js` (Capítulo 2), e os exercícios de depois de cada aula em `depois1.js` e `depois2.js`; a trilha (cada capítulo do Scaffold antes da aula correspondente do curso) está em `trilha.js`.

Para rodar localmente: `python3 -m http.server` nesta pasta.

## Depois do curso: papers

No curso, o Karpathy implementa papers aula a aula. A trilha de papers continua esse método por conta própria: ler o paper inteiro, achar o núcleo, implementá-lo com a mesma simplicidade, reproduzir um número e fazer uma pergunta que o paper não fez.

O Paper 1 (`paper1.js`) ensina o método no caso típico, uma linha de base mais uma diferença, com Hu et al. (2021), *LoRA: Low-Rank Adaptation of Large Language Models*: achar o núcleo no resumo, ver o problema que ele resolve (o tempo a mais dos adapters, na Tabela 1), ler a equação (3) e contar os parâmetros, escrever a camada `W0 x + BAx`, os gradientes de B e A à mão e o laço de treino, juntar os pesos, reproduzir a Tabela 6 em miniatura (a perda para cada r) e perguntar o que acontece quando a mudança da tarefa não tem posto baixo. A última parte é uma ficha para aplicar o método a qualquer paper.

O Paper 2 (`paper2.js`) aplica o método a um paper que não muda o modelo, Kaplan et al. (2020), *Scaling Laws for Neural Language Models*: ler a equação, conferir o ajuste log-log num caso com resposta conhecida, refazer a reta da Figura 1 com um modelo pequeno que roda no navegador, conferir se ela é mesmo uma reta (as inclinações locais), ver a curva encostar num piso com poucos dados (a equação 1.5) e achar o pico da dupla descida quando se tira a regularização.

Nos dois, cada lição mostra o trecho do paper que está implementando (a equação, a figura, a frase), recortado do PDF do arXiv, com o link para a página; os recortes ficam em `papers/`. Os próximos papers sugeridos estão em `PAPERS`, em `trilha.js`, e a linha do tempo da página da trilha (`MARCOS`) mostra onde cada um se encaixa, junto dos marcos que não viraram capítulo (GPT-3, InstructGPT, Chinchilla).

Os Papers 3 e 4 são o começo do paper do ICWM: a LeWorldModel (a base e o código, com o número reproduzido em poucos episódios) e o Language-Forcing transplantado para ela (o paper a superar). Os outros papers do plano (Coconut, ECoT-Lite, TacitVLA) e as leituras de apoio estão em `MARCOS`.
