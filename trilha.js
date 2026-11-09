// A trilha: cada capítulo do Scaffold prepara uma aula de Neural Networks: Zero to Hero.
// O capítulo vem antes; a aula vem depois. Os capítulos prontos têm lições (licoes.js e capitulo2.js);
// os outros mostram o que vão cobrir.

export const CURSO = 'https://karpathy.ai/zero-to-hero.html'

export const TRILHA = [
  {
    n: 1,
    pronto: true,
    titulo: 'Derivadas e os primeiros programas',
    aula: {
      titulo: 'Building micrograd',
      subtitulo: 'Redes neurais e backpropagation, explicadas passo a passo',
      duracao: '2h25',
      url: 'https://www.youtube.com/watch?v=VMj-3S1tku0',
      constroi: 'Um pequeno motor que calcula derivadas sozinho e treina uma rede neural.',
    },
  },
  {
    n: 2,
    pronto: true,
    titulo: 'Contar, probabilidade e tabelas',
    matematica: 'Contar e dividir, probabilidade, distribuição, amostrar, logaritmo, a perda como log da probabilidade',
    programacao: 'Textos e caracteres, dicionários, tensores do PyTorch, broadcasting',
    aula: {
      titulo: 'Building makemore',
      subtitulo: 'Introdução a modelos de linguagem',
      duracao: '1h57',
      url: 'https://www.youtube.com/watch?v=PaCmpygFfXo',
      constroi: 'Um modelo que aprende nomes e inventa nomes novos, letra por letra.',
    },
  },
  {
    n: 3,
    titulo: 'Vetores, matrizes e camadas',
    matematica: 'Vetores, multiplicação de matrizes, embeddings, softmax, entropia cruzada',
    programacao: 'Formato dos tensores, fatiar, separar treino, validação e teste, minibatch',
    aula: {
      titulo: 'Building makemore, parte 2: MLP',
      subtitulo: 'Uma rede de várias camadas',
      duracao: '1h15',
      url: 'https://www.youtube.com/watch?v=TCH_1BHY58I',
      constroi: 'Uma rede que olha para várias letras antes de prever a próxima.',
    },
  },
  {
    n: 4,
    titulo: 'Média, variância e distribuições',
    matematica: 'Média, variância, desvio padrão, distribuição normal, normalizar',
    programacao: 'Histogramas, inicializar pesos, olhar dentro de uma rede enquanto ela treina',
    aula: {
      titulo: 'Building makemore, parte 3',
      subtitulo: 'Ativações, gradientes e BatchNorm',
      duracao: '1h55',
      url: 'https://www.youtube.com/watch?v=P6sfmUTpUmc',
      constroi: 'Ferramentas para ver se uma rede está saudável e para ela treinar melhor.',
    },
  },
  {
    n: 5,
    titulo: 'A regra da cadeia com matrizes',
    matematica: 'Derivada de uma soma de matrizes, derivada de um produto de matrizes, a volta do broadcasting',
    programacao: 'Conferir uma derivada com outra, comparar tensores',
    aula: {
      titulo: 'Building makemore, parte 4',
      subtitulo: 'Tornar-se um ninja do backprop',
      duracao: '1h55',
      url: 'https://www.youtube.com/watch?v=q8SA3rM6ckI',
      constroi: 'O backpropagation da rede inteira, escrito à mão, sem ajuda do PyTorch.',
    },
  },
  {
    n: 6,
    titulo: 'Camadas em hierarquia',
    matematica: 'Combinar em pares, árvores, convolução dilatada',
    programacao: 'Classes como peças de montar, módulos, o formato de cada tensor',
    aula: {
      titulo: 'Building makemore, parte 5',
      subtitulo: 'Construindo uma WaveNet',
      duracao: '56min',
      url: 'https://www.youtube.com/watch?v=t3YJ5hKiMQ0',
      constroi: 'Uma rede mais funda, que junta as letras aos poucos, em camadas.',
    },
  },
  {
    n: 7,
    titulo: 'Atenção',
    matematica: 'Produto escalar, média ponderada, softmax com máscara, normalização das camadas',
    programacao: 'Organizar um modelo grande, treinar em GPU',
    aula: {
      titulo: "Let's build GPT",
      subtitulo: 'Do zero, em código, passo a passo',
      duracao: '1h56',
      url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY',
      constroi: 'Um Transformer pequeno, a mesma ideia que está por trás do ChatGPT.',
    },
  },
  {
    n: 8,
    titulo: 'Texto, bytes e tokens',
    matematica: 'Contar pares, frequência, comprimir',
    programacao: 'Unicode, UTF-8, bytes, expressões regulares',
    aula: {
      titulo: "Let's build the GPT Tokenizer",
      subtitulo: 'Como o texto vira números',
      duracao: '2h13',
      url: 'https://www.youtube.com/watch?v=zduSFxRajkE',
      constroi: 'O tokenizador BPE, que corta o texto em pedaços antes de entrar no modelo.',
    },
  },
  {
    n: 9,
    titulo: 'Treinar grande',
    matematica: 'Precisão dos números, taxa de aprendizado que muda, acumular gradientes',
    programacao: 'GPU, medir velocidade, treinar em várias placas',
    aula: {
      titulo: "Let's reproduce GPT-2 (124M)",
      subtitulo: 'Reproduzir um modelo de verdade',
      duracao: '4h01',
      url: 'https://www.youtube.com/watch?v=l8pRSuU81PU',
      constroi: 'O GPT-2 pequeno, treinado do zero e comparado com o original.',
    },
  },
]

// Depois do curso: papers. No curso, o Karpathy implementa papers aula a aula. Aqui o método continua:
// ler o paper inteiro, achar o núcleo, implementá-lo com a mesma simplicidade, reproduzir um número e
// fazer uma pergunta que o paper não fez. O Paper 1 (LoRA) ensina o método no caso típico, uma linha de
// base mais uma diferença; o Paper 2 (Kaplan) o aplica a um paper de medida. Os Papers 3 a 7 seguem uma
// linha de pesquisa só, a do paper do ICWM: a linguagem como andaime de um world model (Vygotsky), que
// vira fala interna. Cada um é uma das condições do experimento principal desse paper. A ficha do fim
// do Paper 1 serve para qualquer outro paper escolhido na leitura do dia a dia.
export const PAPERS = [
  {
    n: 10,
    pronto: true,
    titulo: 'Ajustar com pouco',
    ref: 'Hu et al. (2021), LoRA: Low-Rank Adaptation of Large Language Models',
    url: 'https://arxiv.org/abs/2106.09685',
    constroi: 'O método no caso típico: a linha de base é o GPT do curso, a diferença é W + BA. Os gradientes de B e A à mão, a Tabela 6 em miniatura e o que acontece quando a hipótese do posto baixo falha.',
  },
  {
    n: 11,
    pronto: true,
    titulo: 'Leis de escala',
    ref: 'Kaplan et al. (2020), Scaling Laws for Neural Language Models',
    url: 'https://arxiv.org/abs/2001.08361',
    constroi: 'Um paper que não muda o modelo, muda o experimento: ler a equação, medir o expoente, refazer a reta da Figura 1, ver onde ela entorta com poucos dados e o pico que a regularização esconde.',
  },
  {
    n: 12,
    titulo: 'Pensar sem escrever',
    ref: 'Hao et al. (2024), Coconut: Training Large Language Models to Reason in a Continuous Latent Space',
    url: 'https://arxiv.org/abs/2412.06769',
    constroi: 'O GPT-2 do curso troca os passos escritos do raciocínio, um a um, por vetores que ele mesmo gera e reaproveita, e esses vetores continuam no teste. É a fala interna do paper do ICWM, em texto.',
  },
  {
    n: 13,
    titulo: 'Raciocinar no treino, largar no teste',
    ref: 'Chen et al. (CoRL 2025), Training Strategies for Efficient Embodied Reasoning (ECoT-Lite)',
    url: 'https://arxiv.org/abs/2505.08243',
    constroi: 'Uma política de robô treinada com o raciocínio em texto que às vezes some no treino (reasoning dropout). No paper do ICWM, é a condição do dropout aleatório da própria fala.',
  },
  {
    n: 14,
    titulo: 'Gerar sem consumir',
    ref: 'Lu et al. (2026), TacitVLA: Reasoning Vision-Language-Action Models Without Reasoning Latency',
    url: 'https://arxiv.org/abs/2610.17540',
    constroi: 'A mesma política, mudando só uma célula da máscara de atenção: a ação nunca lê o raciocínio, e mesmo assim ganha. No paper do ICWM, é a condição da fala gerada mas não consumida, o risco mais sério para a tese.',
  },
  {
    n: 15,
    titulo: 'Um world model que planeja',
    ref: 'Maes, Le Lidec, Scieur, LeCun & Balestriero (2026), LeWorldModel',
    url: 'https://arxiv.org/abs/2603.19312',
    constroi: 'Encoder e preditor treinados juntos a partir dos pixels, o SIGReg contra o colapso e o planejamento por CEM no PushT. É a base do paper do ICWM e o código onde o experimento roda.',
  },
  {
    n: 16,
    titulo: 'Alinhar à linguagem',
    ref: 'Li et al. (2026), Language-Forcing: Semantic Alignment of Whole-Body World Action Models',
    url: 'https://arxiv.org/abs/2610.23894',
    constroi: 'Descrições de um VLM sobre o que mudou, alinhadas por cosseno às features futuras do modelo e descartadas no teste. O paper a superar: a afirmação a testar é que alinhar já captura o benefício da linguagem.',
  },
]

// A linha do tempo dos papers, do curso até hoje: onde cada capítulo se encaixa, e os marcos que não
// viraram capítulo (porque não cabem num experimento pequeno) mas que vale ler. `paper` é o n do
// capítulo em PAPERS; `onde` diz onde o marco aparece quando não é um capítulo.
export const MARCOS = [
  { data: '2017', ref: 'Vaswani et al., Attention Is All You Need', url: 'https://arxiv.org/abs/1706.03762', nota: 'O Transformer.', onde: 'No curso, aula 7' },
  { data: '2019', ref: 'Radford et al., GPT-2', url: 'https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf', nota: 'O modelo que o curso termina reproduzindo.', onde: 'No curso, aula 9' },
  { data: '2019', ref: 'Houlsby et al., Adapters', url: 'https://arxiv.org/abs/1902.00751', nota: 'Ajustar treinando só camadas pequenas novas. O problema que o LoRA resolve.', onde: 'Dentro do Paper 1' },
  { data: '2020', ref: 'Kaplan et al., Scaling Laws', url: 'https://arxiv.org/abs/2001.08361', nota: 'A perda cai como potência do tamanho.', paper: 11 },
  { data: '2020', ref: 'Brown et al., GPT-3', url: 'https://arxiv.org/abs/2005.14165', nota: 'O GPT-2 cem vezes maior, aprendendo a tarefa pelos exemplos no prompt. O marco mais importante do período; não cabe num experimento pequeno.', onde: 'Leitura junto do Paper 2', marco: true },
  { data: '2021', ref: 'Hu et al., LoRA', url: 'https://arxiv.org/abs/2106.09685', nota: 'Ajustar treinando só W + BA.', paper: 10 },
  { data: '2022', ref: 'Hoffmann et al., Chinchilla', url: 'https://arxiv.org/abs/2203.15556', nota: 'Refaz as leis de escala e muda quanto dado usar para cada tamanho.', onde: 'Leitura junto do Paper 2', marco: true },
  { data: '2024', ref: 'Deng, Choi & Shieber, Stepwise Internalization', url: 'https://arxiv.org/abs/2405.14838', nota: 'Tirar os passos escritos aos poucos até o modelo resolver sem eles. A retirada gradual que o Coconut adota.', onde: 'Leitura antes do Paper 3', marco: true },
  { data: '2024', ref: 'Hao et al., Coconut', url: 'https://arxiv.org/abs/2412.06769', nota: 'Raciocinar em vetores, não em palavras.', paper: 12 },
  { data: '2025', ref: 'Chen et al., ECoT-Lite', url: 'https://arxiv.org/abs/2505.08243', nota: 'Raciocínio no treino, dropout no teste.', paper: 13 },
  { data: '2026', ref: 'Maes et al., LeWorldModel', url: 'https://arxiv.org/abs/2603.19312', nota: 'Um JEPA treinado dos pixels que planeja.', paper: 15 },
  { data: '2026', ref: 'Wang, Wei & Ling, Grounding Spatial Relations in a Compact World Model', url: 'https://arxiv.org/abs/2607.06925', nota: 'Quando o texto que nomeia a resposta entra no preditor, ele copia a resposta em vez de aprender a dinâmica; o objetivo fica no custo do planejador. Por que a fala do outro só pode ser alvo.', onde: 'Leitura junto do Paper 6', marco: true },
  { data: '2026', ref: 'Li et al., Language-Forcing', url: 'https://arxiv.org/abs/2610.23894', nota: 'Linguagem alinhada às features futuras, descartada no teste.', paper: 16 },
  { data: '2026', ref: 'Lu et al., TacitVLA', url: 'https://arxiv.org/abs/2610.17540', nota: 'Aprender a gerar o raciocínio já basta?', paper: 14 },
]
