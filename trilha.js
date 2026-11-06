// A trilha: cada capítulo do Scaffold prepara uma aula de Neural Networks: Zero to Hero.
// O capítulo vem antes; a aula vem depois. O Capítulo 1 tem lições prontas (em licoes.js);
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
    titulo: 'Contar, probabilidade e tensores',
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
