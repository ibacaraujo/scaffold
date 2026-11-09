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
// fazer uma pergunta que o paper não fez. A trilha é a da pesquisa: os papers são as peças do paper do
// ICWM, na ordem em que o experimento precisa delas. O Paper 1 é a LeWorldModel, a base onde o
// experimento roda; o Paper 2 é o Language-Forcing, o paper a superar, transplantado para ela.
export const PAPERS = [
  {
    n: 10,
    pronto: true,
    titulo: 'Um world model que planeja',
    ref: 'Maes, Le Lidec, Scieur, LeCun & Balestriero (2026), LeWorldModel',
    url: 'https://arxiv.org/abs/2603.19312',
    constroi: 'Encoder e preditor treinados juntos a partir dos pixels, o SIGReg contra o colapso e o planejamento por CEM no PushT. Reproduzir o número com poucos episódios é a célula 1 do paper do ICWM: achar o regime em que a LeWM fica entre 35% e 55%.',
  },
  {
    n: 11,
    pronto: true,
    titulo: 'Alinhar à linguagem, e superar',
    ref: 'Li et al. (2026), Language-Forcing: Semantic Alignment of Whole-Body World Action Models',
    url: 'https://arxiv.org/abs/2610.23894',
    constroi: 'Descrições do que mudou, alinhadas por cosseno às features futuras e descartadas no teste, transplantadas para dentro da LeWM. Refazer as ablações que dizem onde ele é forte (camada do meio, peso 1, descrições embaralhadas, ganho pequeno com poucos dados) e a pergunta que ele não fez: e se o modelo usar a própria fala em vez de descartá-la?',
  },
]

// A linha do tempo dos papers, do curso até hoje: onde cada capítulo se encaixa, e as leituras que não
// viraram capítulo mas entram no paper do ICWM. `paper` é o n do capítulo em PAPERS; `onde` diz onde a
// leitura aparece quando não é um capítulo.
export const MARCOS = [
  { data: '2017', ref: 'Vaswani et al., Attention Is All You Need', url: 'https://arxiv.org/abs/1706.03762', nota: 'O Transformer.', onde: 'No curso, aula 7' },
  { data: '2019', ref: 'Radford et al., GPT-2', url: 'https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf', nota: 'O modelo que o curso termina reproduzindo.', onde: 'No curso, aula 9' },
  { data: '2024', ref: 'Deng, Choi & Shieber, Stepwise Internalization', url: 'https://arxiv.org/abs/2405.14838', nota: 'Tirar os passos escritos aos poucos até o modelo resolver sem eles. A retirada gradual que o Coconut adota.', onde: 'Leitura junto do Paper 2', marco: true },
  { data: '2024', ref: 'Hao et al., Coconut', url: 'https://arxiv.org/abs/2412.06769', nota: 'Raciocinar em vetores, não em palavras, que continuam no teste. A fala interna retida da nossa condição.', onde: 'Leitura junto do Paper 2', marco: true },
  { data: '2025', ref: 'Chen et al., ECoT-Lite', url: 'https://arxiv.org/abs/2505.08243', nota: 'Raciocínio no treino, dropout no teste. A condição do dropout da própria fala.', onde: 'Leitura junto do Paper 2', marco: true },
  { data: '2026', ref: 'Maes et al., LeWorldModel', url: 'https://arxiv.org/abs/2603.19312', nota: 'Um JEPA treinado dos pixels que planeja.', paper: 10 },
  { data: '2026', ref: 'Wang, Wei & Ling, Grounding Spatial Relations in a Compact World Model', url: 'https://arxiv.org/abs/2607.06925', nota: 'Quando o texto que nomeia a resposta entra no preditor, ele copia a resposta em vez de aprender a dinâmica; o objetivo fica no custo do planejador. Por que a fala do outro só pode ser alvo.', onde: 'Leitura junto do Paper 1', marco: true },
  { data: '2026', ref: 'Li et al., Language-Forcing', url: 'https://arxiv.org/abs/2610.23894', nota: 'Linguagem alinhada às features futuras, descartada no teste.', paper: 11 },
  { data: '2026', ref: 'Lu et al., TacitVLA', url: 'https://arxiv.org/abs/2610.17540', nota: 'Aprender a gerar o raciocínio já basta? O risco mais sério para a tese; a condição da fala gerada mas não consumida.', onde: 'Leitura junto do Paper 2', marco: true },
]
