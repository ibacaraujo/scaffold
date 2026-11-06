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
  2: {
    aula: 'Building makemore',
    intro: 'O modelo da aula 2 é só uma tabela de contagens, e mesmo assim toca em perguntas que a pesquisa ainda faz sobre os modelos gigantes: quanto contexto basta, como sortear, o que a perda mede e se o modelo inventa ou repete. Cada pergunta tem um experimento que cabe na sua tabela de pares.',
    perguntas: [
      {
        titulo: 'Quanto contexto basta?',
        selo: 'Debate aberto',
        projeto: true,
        daAula: 'O modelo olha só a letra anterior. Nos exercícios, você viu que olhar duas deixa a maioria dos contextos sem contagem.',
        pergunta: 'Contar ainda vale alguma coisa na era das redes neurais, se os dados forem enormes?',
        contexto: 'Em 2024, o infini-gram contou sequências em 5 trilhões de tokens (pedaços de palavras) e deixou o contexto crescer até onde os dados permitem. Esse modelo de contagem acerta o próximo token em 47% dos casos num texto humano, contra 29% de um modelo que olha só 4 tokens para trás. Misturado a uma rede neural, ele reduz a perplexidade dela em até 73%. Um estudo do Google DeepMind no mesmo ano mostrou que, em 79% dos casos, a previsão mais provável de um Transformer pequeno coincide com a de alguma regra simples de contagem.',
        experimento: 'Faça um modelo que usa o trio quando o contexto de duas letras apareceu no treino e volta para o par quando não apareceu. Compare a perda nas palavras de fora com a do modelo só de pares. Com quantas palavras de treino o trio começa a valer a pena?',
        papers: [
          { t: 'Infini-gram: Scaling Unbounded n-gram Language Models to a Trillion Tokens', ano: 2024, id: '2401.17377' },
          { t: 'Understanding Transformers via N-gram Statistics', ano: 2024, id: '2407.12034' },
          { t: 'An Empirical Study of Smoothing Techniques for Language Modeling', ano: 1996, id: 'cmp-lg/9606011' },
        ],
      },
      {
        titulo: 'Suavizar melhor que somar 1',
        selo: 'Clássico',
        daAula: 'A aula soma 1 a todas as contagens, e nos exercícios você escolheu outro número medindo.',
        pergunta: 'Dá para suavizar de um jeito mais inteligente do que somar o mesmo número em tudo?',
        contexto: 'Durante trinta anos, os melhores modelos de linguagem foram de contagem, e a diferença entre eles estava quase toda na suavização. Chen e Goodman compararam as principais técnicas em 1996, e mais tarde uma variante da de Kneser e Ney virou o padrão. Um trabalho de 2024 mostra que o label smoothing, técnica comum para regularizar redes neurais, é equivalente a somar uma constante às contagens, como na aula, e transforma outras suavizações clássicas em regularizadores para redes.',
        experimento: 'Teste a interpolação: P = λ·P(par) + (1 − λ)·P(letra sozinha), com a probabilidade da letra contada sem olhar o contexto. Escolha λ na validação e compare com a melhor suavização de somar k.',
        papers: [
          { t: 'An Empirical Study of Smoothing Techniques for Language Modeling', ano: 1996, id: 'cmp-lg/9606011' },
          { t: 'The Role of n-gram Smoothing in the Age of Neural Networks', ano: 2024, id: '2403.17240' },
        ],
      },
      {
        titulo: 'Como sortear?',
        selo: 'Geração de texto',
        daAula: 'Os nomes novos saem sorteando cada letra com as probabilidades da tabela.',
        pergunta: 'Sortear com as probabilidades exatas é o melhor jeito de gerar texto?',
        contexto: 'Em 2019, Holtzman e colegas mostraram que escolher sempre a palavra mais provável gera texto repetitivo, e que sortear de toda a distribuição deixa escapar palavras absurdas da cauda. A proposta deles, o nucleus sampling, sorteia só entre as opções que somam, juntas, uma probabilidade alta, como 0,9. Ajustar a "temperatura" da distribuição é outra forma de controlar isso, e seus limites ainda são estudados.',
        experimento: 'Antes de sortear, eleve cada probabilidade a 1/T e normalize de novo. Gere 20 palavras com T = 0,5, 1 e 2. Com T pequeno, as palavras ficam mais parecidas com as do treino? Com T grande, ficam mais estranhas?',
        papers: [
          { t: 'The Curious Case of Neural Text Degeneration', ano: 2019, id: '1904.09751' },
          { t: 'Improving Diversity in Language Models: When Temperature Fails, Change the Loss', ano: 2025, id: '2508.09654' },
        ],
      },
      {
        titulo: 'O que a perda mede?',
        selo: 'Teoria da informação',
        daAula: 'A perda é a média de −log das probabilidades. Quanto menor, melhor.',
        pergunta: 'Esse número tem algum sentido além de "menor é melhor"?',
        contexto: 'Tem: dividida por log(2), a perda é o número de bits que o modelo precisa, em média, para escrever cada letra. Um bom modelo é um bom compressor, e a recíproca vale. Em 2023, o Google DeepMind mostrou que um modelo de linguagem treinado em texto comprime imagens e áudio melhor que o PNG e o FLAC.',
        experimento: 'Converta a perda do seu modelo de pares em bits por letra. Compare com log₂(27) ≈ 4,75 bits, o custo de escrever cada letra sem modelo nenhum. Quanto o seu modelo economiza?',
        papers: [
          { t: 'Language Modeling Is Compression', ano: 2023, id: '2309.10668' },
        ],
      },
      {
        titulo: 'Inventa ou repete?',
        selo: 'Memorização',
        daAula: 'O modelo gera nomes que parecem nomes. Alguns deles já estavam na lista de treino.',
        pergunta: 'Quanto do que um modelo gera é novo, e quanto é cópia do treino?',
        contexto: 'Com modelos grandes, essa pergunta envolve privacidade e direitos autorais. Pesquisadores medem quanto do texto gerado aparece igual nos dados de treino, e a resposta muda com o tamanho do modelo e com o jeito de sortear.',
        experimento: 'Gere 200 palavras com o seu modelo de pares e conte quantas estão na lista de treino. Depois, faça o mesmo com o modelo de trios. Olhar mais longe faz o modelo copiar mais?',
        papers: [
          { t: 'Evaluating n-Gram Novelty of Language Models Using Rusty-DAWG', ano: 2024, id: '2406.13069' },
          { t: 'The Landscape of Memorization in LLMs: Mechanisms, Measurement, and Mitigation', ano: 2025, id: '2507.05578' },
        ],
      },
    ],
  },
}
