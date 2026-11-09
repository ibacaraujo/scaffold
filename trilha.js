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
// base mais uma diferença; o Paper 2 (Kaplan) o aplica a um paper de medida. Os outros são sugestões, e
// a ficha do fim do Paper 1 serve para qualquer paper escolhido na leitura do dia a dia.
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
    titulo: 'Um GPT moderno',
    ref: 'Su et al. (2021), RoFormer; Touvron et al. (2023), LLaMA',
    url: 'https://arxiv.org/abs/2302.13971',
    constroi: 'O GPT do curso com as peças de hoje: RoPE, RMSNorm e SwiGLU.',
  },
  {
    n: 13,
    titulo: 'Atenção em blocos',
    ref: 'Dao et al. (2022), FlashAttention',
    url: 'https://arxiv.org/abs/2205.14135',
    constroi: 'A mesma atenção, calculada em pedaços, sem guardar a matriz inteira na memória.',
  },
  {
    n: 14,
    titulo: 'Aprender com preferências',
    ref: 'Rafailov et al. (2023), Direct Preference Optimization',
    url: 'https://arxiv.org/abs/2305.18290',
    constroi: 'O pós-treino de um modelo a partir de pares de respostas, uma melhor que a outra.',
  },
  {
    n: 15,
    titulo: 'Imagens como sequências',
    ref: 'Dosovitskiy et al. (2020), An Image is Worth 16x16 Words',
    url: 'https://arxiv.org/abs/2010.11929',
    constroi: 'O Transformer do curso lendo uma imagem cortada em quadradinhos.',
  },
  {
    n: 16,
    titulo: 'Prever a representação',
    ref: 'Assran et al. (2023), I-JEPA',
    url: 'https://arxiv.org/abs/2301.08243',
    constroi: 'Um modelo que aprende prevendo o que uma parte escondida da imagem representa, não os pixels.',
  },
  {
    n: 17,
    titulo: 'Abrir o modelo',
    ref: 'Bricken et al. (2023), Towards Monosemanticity',
    url: 'https://transformer-circuits.pub/2023/monosemantic-features',
    constroi: 'Um autoencoder esparso que separa as ativações de um modelo em ideias que dá para ler.',
  },
]

// A linha do tempo dos papers, do curso até hoje: onde cada capítulo se encaixa, e os marcos que não
// viraram capítulo (porque não cabem num experimento pequeno) mas que vale ler. `paper` é o n do
// capítulo em PAPERS; `onde` diz onde o marco aparece quando não é um capítulo.
export const MARCOS = [
  { data: '2017', ref: 'Vaswani et al., Attention Is All You Need', url: 'https://arxiv.org/abs/1706.03762', nota: 'O Transformer.', onde: 'No curso, aula 7' },
  { data: '2019', ref: 'Radford et al., GPT-2', url: 'https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf', nota: 'O modelo que o curso termina reproduzindo.', onde: 'No curso, aula 9' },
  { data: '2019', ref: 'Houlsby et al., Adapters', url: 'https://arxiv.org/abs/1902.00751', nota: 'Ajustar treinando só camadas pequenas novas. O problema que o LoRA resolve.', onde: 'Dentro do Paper 1' },
  { data: '2019', ref: 'Zhang & Sennrich, RMSNorm', url: 'https://arxiv.org/abs/1910.07467', nota: 'Uma LayerNorm mais simples.', paper: 12 },
  { data: '2020', ref: 'Kaplan et al., Scaling Laws', url: 'https://arxiv.org/abs/2001.08361', nota: 'A perda cai como potência do tamanho.', paper: 11 },
  { data: '2020', ref: 'Shazeer, GLU Variants (SwiGLU)', url: 'https://arxiv.org/abs/2002.05202', nota: 'A camada feed-forward dos modelos de hoje.', paper: 12 },
  { data: '2020', ref: 'Brown et al., GPT-3', url: 'https://arxiv.org/abs/2005.14165', nota: 'O GPT-2 cem vezes maior, aprendendo a tarefa pelos exemplos no prompt. O marco mais importante do período; não cabe num experimento pequeno.', onde: 'Leitura junto do Paper 2', marco: true },
  { data: '2020', ref: 'Dosovitskiy et al., ViT', url: 'https://arxiv.org/abs/2010.11929', nota: 'O Transformer lendo imagens.', paper: 15 },
  { data: '2021', ref: 'Su et al., RoFormer (RoPE)', url: 'https://arxiv.org/abs/2104.09864', nota: 'A posição girando os vetores.', paper: 12 },
  { data: '2021', ref: 'Hu et al., LoRA', url: 'https://arxiv.org/abs/2106.09685', nota: 'Ajustar treinando só W + BA.', paper: 10 },
  { data: '2022', ref: 'Ouyang et al., InstructGPT', url: 'https://arxiv.org/abs/2203.02155', nota: 'O RLHF que levou ao ChatGPT. Três etapas pesadas; o DPO é a versão simples da mesma ideia.', onde: 'Leitura antes do Paper 5', marco: true },
  { data: '2022', ref: 'Hoffmann et al., Chinchilla', url: 'https://arxiv.org/abs/2203.15556', nota: 'Refaz as leis de escala e muda quanto dado usar para cada tamanho.', onde: 'Leitura junto do Paper 2', marco: true },
  { data: '2022', ref: 'Dao et al., FlashAttention', url: 'https://arxiv.org/abs/2205.14135', nota: 'A atenção em blocos.', paper: 13 },
  { data: '2023', ref: 'Assran et al., I-JEPA', url: 'https://arxiv.org/abs/2301.08243', nota: 'Prever representações, não pixels.', paper: 16 },
  { data: '2023', ref: 'Touvron et al., LLaMA', url: 'https://arxiv.org/abs/2302.13971', nota: 'Junta RMSNorm, SwiGLU e RoPE num modelo aberto.', paper: 12 },
  { data: '2023', ref: 'Rafailov et al., DPO', url: 'https://arxiv.org/abs/2305.18290', nota: 'O pós-treino com pares de respostas.', paper: 14 },
  { data: '2023', ref: 'Bricken et al., Towards Monosemanticity', url: 'https://transformer-circuits.pub/2023/monosemantic-features', nota: 'Ler as ideias dentro de um modelo.', paper: 17 },
]
