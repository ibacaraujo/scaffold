// Para pesquisar: perguntas abertas que saem de cada aula. Cada uma liga o que a aula mostrou a um
// experimento pequeno, que cabe no código da pessoa, e a papers para começar a ler (via alphaXiv).

export const PESQUISA = {
  1: {
    aula: 'Building micrograd',
    intro: 'A aula é pequena de propósito: dá para entender cada linha. Isso faz dela um bom laboratório. Cada pergunta abaixo ainda é estudada hoje, e cada uma tem um experimento que cabe no autograd que você escreveu.',
    perguntas: [
      {
        titulo: 'Precisamos mesmo da volta?',
        selo: 'Debate aberto',
        projeto: true,
        daAula: 'O micrograd calcula todas as derivadas numa única volta, de trás para frente. Isso se chama modo reverso.',
        pergunta: 'Dá para treinar uma rede só com idas, sem a volta? E a que custo?',
        contexto: 'Existe o modo direto: escolhendo uma direção aleatória v, uma única ida dá a derivada naquela direção, e (∇f·v)·v é, em média, o próprio gradiente. Baydin e colegas (2022) relatam treino competitivo com o backprop no MNIST, às vezes até 2× mais rápido. Um estudo de 2026 (ICML) contesta: comparado com o backprop que economiza memória recalculando partes da ida, o backprop chega a 31,1% mais acurácia e converge até 34,8% mais rápido.',
        experimento: 'No seu autograd, troque o gradiente pelo estimador (∇f·v)·v. Conte quantos passos o MLP pequeno precisa para chegar à mesma perda com 10, 100 e 1.000 parâmetros. A teoria diz que o ruído cresce com o número de parâmetros: o seu gráfico confirma?',
        papers: [
          { t: 'Gradients without Backpropagation', ano: 2022, id: '2202.08587' },
          { t: 'Memory Savings at What Cost? A Study of Alternatives to Backpropagation', ano: 2025, id: '2506.21833' },
          { t: 'Beyond Backpropagation: Optimization with Multi-Tangent Forward Gradients', ano: 2024, id: '2410.17764' },
        ],
      },
      {
        titulo: 'Quanto custa lembrar',
        selo: 'Engenharia',
        daAula: 'Para fazer a volta, o micrograd guarda todos os nós da ida, até o fim.',
        pergunta: 'Quanta memória isso gasta, e dá para gastar menos sem perder a resposta?',
        contexto: 'Numa rede de n camadas, guardar tudo custa memória proporcional a n. Chen e colegas (2016) mostraram que, guardando só alguns pontos e recalculando o resto na volta, a memória cai para algo proporcional a √n, pagando com um pouco mais de conta.',
        experimento: 'Conte quantos nós o seu autograd guarda durante a ida de um MLP, e veja como esse número cresce com o tamanho da rede. Depois, tente guardar só um nó a cada k e recalcular os outros na volta.',
        papers: [
          { t: 'Training Deep Nets with Sublinear Memory Cost', ano: 2016, id: '1604.06174' },
          { t: 'Dynamic Tensor Rematerialization', ano: 2020, id: '2006.09616' },
        ],
      },
      {
        titulo: 'O cérebro faz backprop?',
        selo: 'Neurociência',
        daAula: 'Na volta, o erro passa pelos mesmos pesos da ida, só que ao contrário.',
        pergunta: 'Um neurônio não tem como saber os pesos que outro neurônio usa. Como um cérebro aprenderia, então?',
        contexto: 'O feedback alignment manda o erro de volta por pesos aleatórios e fixos, e mesmo assim a rede aprende. O Forward-Forward, de Hinton, troca a volta por objetivos locais em cada camada. Os dois funcionam, mas ficam atrás do backprop em redes maiores, e entender por que é pesquisa de 2026.',
        experimento: 'No seu autograd, faça a volta de uma camada usar uma matriz aleatória fixa no lugar dos pesos da ida. O MLP pequeno ainda aprende? Quantos passos a mais ele precisa?',
        papers: [
          { t: 'Brain-Inspired Machine Intelligence: A Survey of Neurobiologically-Plausible Credit Assignment', ano: 2023, id: '2312.09257' },
          { t: 'Overcoming Rank Collapse in Feedback Alignment', ano: 2026, id: '2606.11123' },
          { t: 'The Price of Locality: Why Forward-Forward Underperforms Backpropagation?', ano: 2026, id: '2609.33240' },
        ],
      },
      {
        titulo: 'Redes pequenas, perguntas grandes',
        selo: 'Ciência das redes',
        daAula: 'Uma rede de poucos neurônios, treinada com poucos exemplos, que você entende por inteiro.',
        pergunta: 'O que redes minúsculas revelam sobre como as grandes aprendem?',
        contexto: 'Em 2022, uma rede pequena treinada em contas de resto de divisão primeiro decorou os exemplos e, muito depois, de repente generalizou. O fenômeno ganhou o nome de grokking. Um ano depois, outro grupo abriu a rede por dentro e mostrou o algoritmo que ela tinha aprendido. Redes desse tamanho continuam sendo o principal instrumento dessa área.',
        experimento: 'Treine o seu MLP pequeno numa tarefa que você conhece a resposta, como a soma de dois números de 0 a 9. Guarde a perda nos exemplos de treino e em exemplos que ele nunca viu, e desenhe as duas curvas ao longo do treino.',
        papers: [
          { t: 'Grokking: Generalization Beyond Overfitting on Small Algorithmic Datasets', ano: 2022, id: '2201.02177' },
          { t: 'Progress measures for grokking via mechanistic interpretability', ano: 2023, id: '2301.05217' },
        ],
      },
      {
        titulo: 'Como saber que o autograd está certo?',
        selo: 'Fundamentos',
        daAula: 'O erro do valor usado duas vezes passou despercebido até a conta dar errado.',
        pergunta: 'Como ter certeza de que um autograd calcula a derivada certa em qualquer conta?',
        contexto: 'Há dois caminhos. O prático é comparar com a derivada medida com um passo pequeno, em muitas contas sorteadas. O teórico vem das linguagens de programação: provar que o modo reverso está certo, e um trabalho do Google mostra que ele pode ser decomposto em duas partes mais simples, linearizar e transpor.',
        experimento: 'Escreva um verificador: sorteie contas com soma, multiplicação e tanh, calcule a derivada com o seu autograd e com o passo dos dois lados, e avise quando as duas discordarem. Ele teria pegado o erro do valor usado duas vezes?',
        papers: [
          { t: 'Automatic differentiation in machine learning: a survey', ano: 2015, id: '1502.05767' },
          { t: 'Decomposing reverse-mode automatic differentiation', ano: 2021, id: '2105.09469' },
        ],
      },
    ],
  },
}
