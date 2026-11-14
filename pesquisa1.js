// Pesquisa, Paper 1: o primeiro paper do dia (13/11/2026). A trilha de Pesquisa registra, um por dia,
// papers da linha de pesquisa (modelos de linguagem, e a linguagem como ferramenta de aprendizado, na
// linha de Vygotsky), implementados no núcleo, de modo que a implementação ensine.
//
// O paper: Huang, Dwivedi, Ma, Moreno & Liu (2026), "Latent Feedback Is a Compute and Data Amplifier:
// Scaling Law for Latent Feedback Transformers on Repeated Data" (Institute of Foundation Models, USC,
// CMU), publicado no alphaXiv em 13/11/2026. O núcleo: o estado da camada de cima de cada token entra
// na entrada do token seguinte por um mapa W (equação 1), treinado com duas passadas, a primeira sem
// gradiente (equação 2 e Algoritmo 1). Quando os dados se repetem, isso rende mais que treinar mais
// épocas com a mesma computação.
//
// Aqui tudo roda no navegador, com numpy e backprop escrito à mão. O Transformer vira um MLP com uma
// janela de 3 letras, como o do makemore (a linha de base que o curso já construiu), e o texto é uma
// língua pequena e inventada, repetida por muitas épocas. A primeira passada é feita letra por letra,
// o que dá exatamente os estados de quem decodifica (o ponto fixo da equação 2). O que se reproduz é a
// forma do resultado: com a mesma computação, o modelo com feedback fica abaixo do modelo sem feedback.

// Cada passo de código roda sozinho, então cada um traz o que precisa. Os blocos abaixo são somados.
const DADOS = `import numpy as np

# Uma língua pequena: frases em que o fim concorda com o sujeito do começo.
def frases(n, semente):
    r = np.random.default_rng(semente)
    sujeitos = [('o menino', 'o'), ('a menina', 'a'), ('o gato', 'o'), ('a gata', 'a'), ('o pai', 'o'), ('a mae', 'a')]
    objetos = ['o bolo', 'a bola', 'o rio', 'a lua', 'o sol', 'a casa']
    verbos = ['viu', 'quis', 'pegou', 'achou']
    fins = ['cansad', 'content', 'molhad', 'calad']
    texto = ''
    for _ in range(n):
        s, g = sujeitos[r.integers(6)]
        meio = ' e '.join(verbos[r.integers(4)] + ' ' + objetos[r.integers(6)] for _ in range(r.integers(1, 3)))
        texto += s + ' ' + meio + ' e ficou ' + fins[r.integers(4)] + g + '. '
    return texto

texto_treino = frases(150, 1)   # os dados únicos, que vão se repetir a cada época
texto_valid = frases(150, 2)    # frases novas, só para medir
letras = sorted(set(texto_treino + texto_valid))
V = len(letras)
idx = {c: i for i, c in enumerate(letras)}
`

const CODIFICAR = `treino = np.array([idx[c] for c in texto_treino])
valid = np.array([idx[c] for c in texto_valid])
`

const modelo = (linhaH) => `
K, D, H = 3, 12, 64   # a janela tem 3 letras; cada letra vira 12 números; o estado tem 64

def iniciar(semente):
    r = np.random.default_rng(semente)
    return {'E': r.normal(0, 0.3, (V, D)),
            'W1': r.normal(0, 1 / np.sqrt(K * D), (K * D, H)), 'b1': np.zeros(H),
            'W2': r.normal(0, 1 / np.sqrt(H), (H, V)) * 0.5, 'b2': np.zeros(V),
            'Wf': r.normal(0, 0.02, (H, K * D))}   # o mapa W do feedback

def janelas(seq, pos):
    # as 3 letras antes de cada posição
    return np.stack([seq[pos - K + j] for j in range(K)], -1)

def rms(h):
    return h / np.sqrt((h ** 2).mean(-1, keepdims=True) + 1e-6)

def adiante(P, ctx, fb):
    e = P['E'][ctx].reshape(*ctx.shape[:2], K * D)    # as 3 letras da janela, lado a lado
    u = e + rms(fb) @ P['Wf']                         # a entrada: as letras mais o feedback
${linhaH}
    logits = h @ P['W2'] + P['b2']                    # uma nota para cada letra possível
    return e, u, h, logits
`
const H_CERTO = `    h = np.tanh(u @ P['W1'] + P['b1'])                # o estado de cima`
const MODELO = modelo(H_CERTO)

const estadosCom = (linha) => `
def estados(P, ctx):
    # A primeira passada, letra por letra: o estado de cima de cada letra entra na seguinte.
    B, T, _ = ctx.shape
    e = P['E'][ctx].reshape(B, T, K * D)
    h = np.zeros((B, H))
    hs = np.zeros((B, T, H))
    for t in range(T):
${linha}
        hs[:, t] = h
    return hs

def deslocar(h):
    # a letra t recebe o estado da letra t - 1; a primeira recebe zeros
    z = np.zeros_like(h)
    z[:, 1:] = h[:, :-1]
    return z
`
const ESTADO_CERTO = `        h = np.tanh((e[:, t] + rms(h) @ P['Wf']) @ P['W1'] + P['b1'])`
const ESTADOS = estadosCom(ESTADO_CERTO)

const passoCom = (linhaFb) => `
def passo(P, seq, rng, feedback, lr, B=32, T=24):
    inicio = rng.integers(K, len(seq) - T - 1, B)
    pos = inicio[:, None] + np.arange(T)[None]
    ctx, y = janelas(seq, pos), seq[pos]
    fb = np.zeros((B, T, H))
    if feedback and rng.random() > 0.15:      # p = 0,15: às vezes, uma passada só
${linhaFb}
    e, u, h, lg = adiante(P, ctx, fb)          # a 2a passada: só nela há gradiente
    # A perda: o -log da probabilidade da letra certa.
    lg = lg - lg.max(-1, keepdims=True)
    p = np.exp(lg)
    p /= p.sum(-1, keepdims=True)
    n = B * T
    perda = -np.log(p.reshape(n, V)[np.arange(n), y.reshape(n)]).mean()
    # O backprop, à mão, de trás para a frente (como no micrograd, só que com matrizes).
    dl = p.reshape(n, V).copy()
    dl[np.arange(n), y.reshape(n)] -= 1
    dl /= n
    hf = h.reshape(n, H)
    g = {'W2': hf.T @ dl, 'b2': dl.sum(0)}
    dh = (dl @ P['W2'].T) * (1 - hf ** 2)
    g['W1'] = u.reshape(n, -1).T @ dh
    g['b1'] = dh.sum(0)
    du = dh @ P['W1'].T
    g['Wf'] = rms(fb).reshape(n, H).T @ du    # o feedback entra como uma entrada fixa
    g['E'] = np.zeros_like(P['E'])
    np.add.at(g['E'], ctx.reshape(n, K), du.reshape(n, K, D))
    for k in P:
        P[k] -= lr * g[k]
    return perda

def treinar(feedback, passos, semente=0, lr=0.5):
    P = iniciar(semente)
    rng = np.random.default_rng(semente + 10)
    curva = []
    for t in range(passos):
        curva.append(passo(P, treino, rng, feedback, lr * (1 - 0.9 * t / passos)))
    return P, curva

def perdas(P, seq, feedback):
    # A perda em cada letra do texto, decodificando letra por letra.
    pos = np.arange(K, len(seq))
    ctx = janelas(seq, pos)[None]
    fb = deslocar(estados(P, ctx)) if feedback else np.zeros((1, len(pos), H))
    _, _, _, lg = adiante(P, ctx, fb)
    lg = lg[0] - lg[0].max(-1, keepdims=True)
    lp = lg - np.log(np.exp(lg).sum(-1, keepdims=True))
    return -lp[np.arange(len(pos)), seq[pos]]
`
const FB_CERTO = `        fb = deslocar(estados(P, ctx))         # a 1a passada: sem gradiente`
const TREINO = passoCom(FB_CERTO)
const TUDO = DADOS + CODIFICAR + MODELO + ESTADOS + TREINO

const ex = (id, titulo, porque, passo) => ({ id, titulo, porque, passos: [passo] })

export const PESQUISA_1 = {
  n: 11,
  titulo: 'Paper 1',
  pesquisa: true,
  semFicha: true,
  paper: {
    titulo: 'Latent Feedback Is a Compute and Data Amplifier',
    autores: 'Huang et al.',
    ano: 2026,
    url: 'https://www.alphaxiv.org/abs/2611.latent-feedback-transformers-scaling-law',
  },
  aula: 'https://www.alphaxiv.org/abs/2611.latent-feedback-transformers-scaling-law',
  intro: 'Pesquisa, Paper 1 (13/11/2026): um Transformer que devolve o próprio estado para a letra seguinte, e por que isso rende mais quando os dados acabam. Primeiro a capa e o método num desenho; depois ler, do zero; por fim implementar o núcleo, no navegador.',
  partes: [
    {
      id: 'matematica',
      titulo: 'Ler o paper',
      modulos: [
        {
          titulo: 'A ideia',
          licoes: [
            {
              id: 'r1-capa',
              titulo: 'O paper num desenho',
              porque: 'Antes das páginas, o método inteiro de uma vez. O desenho ao lado é o paper em cinco etapas; clique em cada uma.',
              passos: [
                {
                  texto: `<p>O paper de hoje: <strong>Latent Feedback Is a Compute and Data Amplifier</strong>, de Benhao Huang, Chaitanya Dwivedi, Xuezhe Ma, Alexander Moreno e Hector Liu (Institute of Foundation Models, USC e CMU), publicado em 13 de novembro de 2026.</p>
<p>A pergunta cabe numa frase: <em>quando os dados bons acabam, vale mais treinar de novo nos mesmos dados ou deixar o modelo devolver o próprio estado para a palavra seguinte?</em></p>
<p>Percorra as cinco etapas do desenho. Cada uma vira uma lição, e depois uma linha de código.</p>`,
                  figura: {
                    modo: 'paper',
                    desenho: 'feedback',
                    tag: 'Pesquisa · Paper 1 · 13/11/2026',
                    titulo: 'Latent Feedback Is a Compute and Data Amplifier',
                    autores: 'Huang, Dwivedi, Ma, Moreno & Liu (IFM, USC, CMU)',
                    url: 'https://www.alphaxiv.org/abs/2611.latent-feedback-transformers-scaling-law',
                    rotulo: 'O Transformer com feedback latente: o estado de cima de cada token entra na entrada do token seguinte, por um mapa W.',
                    etapas: [
                      ['Um Transformer comum', 'Cada token entra embaixo, passa pelas camadas e sai em cima como um <strong>estado</strong>, <code>h</code>. Do estado sai a previsão do próximo token. Depois disso, o estado é jogado fora.'],
                      ['O estado de cima', 'O estado <code>h</code> da última camada é o resumo mais trabalhado que o modelo tem daquele ponto do texto. Ele já passou por todas as camadas.'],
                      ['O feedback', 'A ideia do paper: em vez de jogar o estado fora, ele entra na <strong>entrada</strong> do token seguinte, por um mapa <code>W</code>: <code>u<sub>t</sub> = e<sub>t</sub> + W rms(h<sub>t−1</sub>)</code>. Cada token começa sabendo o que o anterior concluiu.'],
                      ['Duas passadas', 'No treino, os estados de cima ainda não existem. Então o modelo roda <strong>duas vezes</strong>: a primeira, sem gradiente, só para obter os estados; a segunda, com eles, para aprender. Isso custa cerca de 1,2 vez o treino comum.'],
                      ['Quando os dados acabam', 'A comparação justa: com a mesma computação, o Transformer comum treina mais épocas nos mesmos dados, e o com feedback treina menos épocas. Quando os dados se repetem, o feedback chega à mesma perda com até <strong>48% menos computação</strong>.'],
                    ],
                  },
                  tarefa: 'Depois de percorrer as cinco etapas: o que entra na entrada de um token, além dele mesmo?',
                  opcoes: [
                    { t: 'O token seguinte, para o modelo espiar o futuro.', por: 'O modelo nunca vê o futuro: é isso que ele tenta prever. Veja a etapa 3.' },
                    { t: 'O estado de cima do token anterior, passado por um mapa W.', certa: true },
                    { t: 'Uma cópia de todos os pesos do modelo.', por: 'Os pesos não entram na entrada. Veja a etapa 3.' },
                  ],
                  erro: 'Volte à etapa 3 do desenho.',
                  dica: 'Na etapa 3, a seta sai de cima de um token e desce na entrada do seguinte.',
                  solucao: 'O estado de cima do token anterior: u_t = e_t + W rms(h_{t−1}).',
                  certo: 'Esse é o núcleo. As próximas lições constroem cada peça a partir do zero.',
                },
              ],
            },
            {
              id: 'r1-epocas',
              titulo: 'Quando os dados acabam',
              porque: 'O paper existe por causa de um problema prático: o texto bom do mundo está acabando, e treinar de novo nos mesmos dados rende cada vez menos.',
              passos: [
                {
                  texto: `<p>Um modelo de linguagem aprende lendo texto. Uma <strong>época</strong> é uma leitura completa dos dados. Quando o texto bom acaba, a saída comum é ler os mesmos dados de novo: duas, três, quatro épocas.</p>
<p>Só que cada repetição ensina menos que a anterior. O paper usa a mesma regra de Muennighoff et al. (2023): a época número <code>k</code> vale <code>e<sup>−(k−1)/R*</sup></code> de uma leitura nova. A primeira vale 1, e as seguintes valem cada vez menos. <code>R*</code> diz o quão devagar o valor cai.</p>
<p>Mexa nos controles ao lado: cada barra é o valor de uma época.</p>`,
                  figura: { modo: 'epocas', rEstrela: 2, epocas: 4 },
                  tarefa: 'Com <code>R* = 2</code>, quanto vale a segunda época? (Use <code>e<sup>−0,5</sup> ≈ 0,607</code>.)',
                  campos: [{ rotulo: 'valor da 2ª época =', resposta: 0.607, tol: 0.01 }],
                  erro: 'Troque k por 2 e R* por 2 no expoente: −(2 − 1) / 2.',
                  dica: 'O expoente é −1/2 = −0,5, e e<sup>−0,5</sup> ≈ 0,607.',
                  solucao: 'e^(−(2−1)/2) = e^(−0,5) ≈ 0,607: a segunda leitura vale cerca de 61% de dados novos.',
                  certo: 'Esse é o problema: gastar computação em mais épocas compra cada vez menos. O paper pergunta se há um jeito melhor de gastar essa mesma computação.',
                },
              ],
            },
            {
              id: 'r1-estado',
              titulo: 'O estado de cima',
              porque: 'O feedback devolve um vetor específico do modelo, o estado da última camada. Vale saber o que ele é antes de ver para onde ele vai.',
              passos: [
                {
                  texto: `<p>Uma rede neural é uma sequência de camadas. Cada camada recebe uma lista de números (um <strong>vetor</strong>), faz contas e passa outro vetor adiante.</p>
<p>O vetor que sai da última camada, num ponto do texto, é o <strong>estado de cima</strong>, <code>h</code>. É dele que o modelo tira a previsão da próxima palavra. Ele é o resultado de todo o trabalho que o modelo fez até ali.</p>
<p>Num Transformer comum, depois que a previsão é feita, esse vetor não é usado de novo: a palavra seguinte recomeça das camadas de baixo.</p>`,
                  tarefa: 'Por que o estado de cima é um bom candidato a ser passado adiante?',
                  opcoes: [
                    { t: 'Porque é o vetor mais trabalhado: já passou por todas as camadas.', certa: true },
                    { t: 'Porque é o menor vetor do modelo.', por: 'O tamanho não é o motivo. Pense em quanta conta já foi feita nele.' },
                    { t: 'Porque é a própria palavra escrita.', por: 'A palavra escrita é a saída. O estado é o vetor de onde a saída é tirada.' },
                  ],
                  erro: 'Pense no caminho que o vetor fez até chegar em cima.',
                  dica: 'Ele saiu da última camada.',
                  solucao: 'Porque ele já passou por todas as camadas: é o resumo mais elaborado daquele ponto do texto.',
                  certo: 'Passá-lo adiante é dar à palavra seguinte, logo na entrada, o que a anterior concluiu lá em cima.',
                },
              ],
            },
            {
              id: 'r1-equacao',
              titulo: 'A equação do feedback',
              porque: 'O núcleo do paper é a equação (1). Ela tem três peças: a entrada da palavra, um mapa W e uma normalização chamada rms.',
              passos: [
                {
                  texto: `<p>A equação (1) do paper:</p>
<p style="font-size:1.15em"><code>u<sub>t</sub> = e<sub>t</sub> + W rms(h<sub>t−1</sub>)</code></p>
<ul><li><code>e<sub>t</sub></code> é a entrada comum da palavra <code>t</code>;</li><li><code>h<sub>t−1</sub></code> é o estado de cima da palavra anterior;</li><li><code>rms</code> põe o vetor numa escala padrão;</li><li><code>W</code> é uma matriz aprendida, que traduz o estado para o formato da entrada.</li></ul>
<p>O <code>rms</code> divide o vetor pela raiz da média dos quadrados dos seus números. Assim, a média dos quadrados passa a ser 1, e um estado grande não atropela a entrada. Para <code>h = (3, 4)</code>: a média dos quadrados é (9 + 16) / 2 = 12,5, e a raiz é ≈ 3,536.</p>`,
                  tarefa: 'Quanto vale cada número de <code>rms((3, 4))</code>?',
                  campos: [{ rotulo: 'primeiro =', resposta: 0.849, tol: 0.01 }, { rotulo: 'segundo =', resposta: 1.131, tol: 0.01 }],
                  erro: 'Divida 3 e 4 por 3,536.',
                  dica: '3 / 3,536 e 4 / 3,536.',
                  solucao: '3 / 3,536 ≈ 0,849 e 4 / 3,536 ≈ 1,131.',
                  certo: 'Confira: 0,849² + 1,131² ≈ 2, e a média dos quadrados ficou 1. O vetor mudou de tamanho, mas não de direção.',
                },
              ],
            },
            {
              id: 'r1-passadas',
              titulo: 'Duas passadas, um gradiente',
              porque: 'O feedback cria um problema no treino. A solução do paper (equação 2 e Algoritmo 1) define quanto ele custa, e o custo decide a comparação.',
              passos: [
                {
                  texto: `<p>No treino, o modelo lê todas as palavras de um texto ao mesmo tempo, em paralelo. Só que a palavra <code>t</code> precisa do estado de cima da palavra <code>t − 1</code>, que só existe depois que a rede rodou.</p>
<p>A solução do paper: rodar duas vezes. A <strong>primeira passada</strong> roda sem feedback e sem gradiente, só para obter os estados. A <strong>segunda</strong> roda com esses estados no feedback, e só nela se calcula o gradiente.</p>
<p>O custo: treinar uma vez custa cerca de 3 unidades (1 para ir adiante e 2 para o gradiente voltar). A passada extra, só adiante, custa 1, ou seja, 1/3 a mais. O paper só faz a passada extra numa parte das vezes: com probabilidade <code>p = 0,15</code> roda uma passada só. Então o custo é <code>c = 1 + (1 − p) / 3</code>.</p>`,
                  tarefa: 'Com <code>p = 0,15</code>, quanto vale <code>c</code>?',
                  campos: [{ rotulo: 'c =', resposta: 1.283, tol: 0.005 }],
                  erro: 'Calcule (1 − 0,15) / 3 e some 1.',
                  dica: '0,85 / 3 ≈ 0,283.',
                  solucao: 'c = 1 + 0,85 / 3 ≈ 1,283. O paper mede, no relógio, de 1,20 a 1,27.',
                  certo: 'Com a mesma computação, o modelo com feedback treina c vezes menos épocas. É a troca do paper: menos repetições, mais trabalho por palavra.',
                },
              ],
            },
            {
              id: 'r1-kappa',
              titulo: 'Quanto se economiza',
              porque: 'O resultado principal do paper é um número: quanta computação o feedback economiza para chegar à mesma perda.',
              passos: [
                {
                  texto: `<p>O paper compara os dois modelos com o mesmo tamanho e os mesmos dados únicos. Ele mede o <strong>multiplicador de computação</strong> <code>κ</code>: quantas vezes mais computação o Transformer comum precisa para chegar à perda do modelo com feedback.</p>
<p>Se <code>κ = 2</code>, o comum precisa do dobro; então o feedback economiza metade. Em geral, a economia é <code>1 − 1/κ</code>.</p>
<p>O maior valor medido no paper é <code>κ = 1,91</code>, com 60 milhões de parâmetros, 400 palavras únicas por parâmetro e duas épocas de computação.</p>`,
                  tarefa: 'Com <code>κ = 1,91</code>, que fração da computação o feedback economiza? Responda em porcentagem.',
                  campos: [{ rotulo: 'economia (%) =', resposta: 47.6, tol: 0.6 }],
                  erro: 'Calcule 1 − 1/1,91 e multiplique por 100.',
                  dica: '1/1,91 ≈ 0,524.',
                  solucao: '1 − 1/1,91 ≈ 0,476, ou seja, cerca de 48% da computação.',
                  certo: 'É o "até 48%" do resumo do paper. Agora, a implementação.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'programacao',
      titulo: 'Implementar',
      modulos: [
        {
          titulo: 'A linha de base',
          licoes: [
            ex('r1-letras', 'Os dados', 'Todo modelo de linguagem começa transformando texto em números. Aqui o texto é uma língua pequena, inventada, que vai ser lida muitas vezes: o caso em que os dados acabaram.', {
              texto: `<p>O código gera frases de uma língua pequena, como "a menina viu a lua e ficou cansada." O fim concorda com o sujeito do começo: menina, cansad<strong>a</strong>; menino, cansad<strong>o</strong>.</p>
<p>São só 150 frases de treino, cerca de 6 mil letras. O modelo vai lê-las muitas vezes. Outras 150 frases, novas, servem para medir.</p>
<p>Cada letra vira um número: <code>idx</code> é um dicionário que leva cada letra ao seu número. <code>[idx[c] for c in texto]</code> percorre o texto e troca cada letra pelo número.</p>`,
              tarefa: 'Complete a linha de <code>treino</code>, no mesmo formato da linha de <code>valid</code>.',
              inicio: DADOS + `
treino = np.array([])   # troque: o texto de treino, letra por letra, em números
valid = np.array([idx[c] for c in texto_valid])

print(texto_treino[:120])
print("letras diferentes:", V)
print("letras de treino:", len(treino))
print("as 10 primeiras, em números:", treino[:10])
`,
              dica: '<code>treino = np.array([idx[c] for c in texto_treino])</code>.',
              solucao: DADOS + `
treino = np.array([idx[c] for c in texto_treino])
valid = np.array([idx[c] for c in texto_valid])

print(texto_treino[:120])
print("letras diferentes:", V)
print("letras de treino:", len(treino))
print("as 10 primeiras, em números:", treino[:10])
`,
              checagem: `
tem('treino')
if len(treino) != len(texto_treino):
    falha('Devia haver um número para cada letra do texto de treino: ' + str(len(texto_treino)) + ' ao todo.')
if ''.join(letras[i] for i in treino[:50]) != texto_treino[:50]:
    falha('Os números não voltam ao texto. Use idx[c] para cada letra c de texto_treino.')
`,
              certo: 'O texto virou uma lista de números. É assim que todo modelo de linguagem vê o texto, só que com pedaços de palavra (tokens) no lugar de letras.',
            }),
            ex('r1-adiante', 'O modelo sem feedback', 'O paper muda um Transformer. Aqui a linha de base é a rede do makemore: uma janela de 3 letras, uma camada escondida e a previsão da próxima letra. É o menor modelo que tem um estado de cima.', {
              texto: `<p>A rede lê as 3 letras antes de cada posição. Cada letra vira 12 números (a tabela <code>E</code>), e as três ficam lado a lado em <code>e</code>.</p>
<p>A entrada <code>u</code> é <code>e</code> mais o feedback. Por enquanto, o feedback <code>fb</code> é só zeros, então <code>u = e</code>.</p>
<p>O <strong>estado de cima</strong> é <code>h = tanh(u · W1 + b1)</code>: uma multiplicação de matriz, um vetor somado e a função <code>tanh</code>, que espreme cada número entre −1 e 1. Do estado saem as notas de cada letra possível, os <code>logits</code>.</p>`,
              tarefa: 'Na linha marcada, faltam o <code>b1</code> e a <code>tanh</code>. Escreva <code>h = np.tanh(u @ P[\'W1\'] + P[\'b1\'])</code>.',
              inicio: DADOS + CODIFICAR + modelo(`    h = u @ P['W1']                                   # troque: falta o b1 e a tanh`) + `
P = iniciar(0)
ctx = janelas(treino, np.arange(3, 8))[None]       # 5 posições: forma (1, 5, 3)
fb = np.zeros((1, 5, H))
e, u, h, logits = adiante(P, ctx, fb)
print("janelas:", ctx.shape, " estado h:", h.shape, " logits:", logits.shape)
print("o estado fica entre -1 e 1:", h.min().round(3), h.max().round(3))
`,
              dica: 'A linha fica <code>    h = np.tanh(u @ P[\'W1\'] + P[\'b1\'])</code>, com 4 espaços de recuo.',
              solucao: DADOS + CODIFICAR + MODELO + `
P = iniciar(0)
ctx = janelas(treino, np.arange(3, 8))[None]       # 5 posições: forma (1, 5, 3)
fb = np.zeros((1, 5, H))
e, u, h, logits = adiante(P, ctx, fb)
print("janelas:", ctx.shape, " estado h:", h.shape, " logits:", logits.shape)
print("o estado fica entre -1 e 1:", h.min().round(3), h.max().round(3))
`,
              checagem: `
tem('adiante')
r = np.random.default_rng(5)
Pt = iniciar(1)
Pt['b1'] = r.normal(0, 1, H)
c = janelas(treino, np.arange(3, 11))[None]
f = r.normal(0, 1, (1, 8, H))
_, ut, ht, _ = adiante(Pt, c, f)
if not np.allclose(ht, np.tanh(ut @ Pt['W1'] + Pt['b1'])):
    falha('O estado devia ser tanh(u @ W1 + b1). Confira se somou o b1 e aplicou a tanh.')
`,
              certo: 'Esta é a linha de base: cada posição olha só a sua janela de 3 letras. O estado h é calculado e, depois da previsão, jogado fora.',
            }),
          ],
        },
        {
          titulo: 'O feedback',
          licoes: [
            ex('r1-rms', 'A normalização rms', 'Antes de entrar na letra seguinte, o estado passa pelo rms, a peça que você calculou à mão.', {
              texto: `<p>Com numpy, <code>(h ** 2).mean(-1, keepdims=True)</code> calcula a média dos quadrados ao longo do último eixo, o dos números de cada estado, e mantém o formato para a divisão funcionar em todas as posições de uma vez.</p>
<p>Somamos <code>1e-6</code> antes da raiz para nunca dividir por zero: o estado da primeira letra é um vetor de zeros.</p>`,
              tarefa: 'Complete <code>rms(h)</code>: divida <code>h</code> pela raiz da média dos quadrados mais <code>1e-6</code>.',
              inicio: `import numpy as np

def rms(h):
    return h   # troque: h dividido pela raiz da média dos quadrados (mais 1e-6)

print(rms(np.array([3.0, 4.0])))                  # devia dar perto de [0.849 1.131]
print(rms(np.array([[1.0, -1.0, 2.0, 0.0]])))
`,
              dica: '<code>return h / np.sqrt((h ** 2).mean(-1, keepdims=True) + 1e-6)</code>.',
              solucao: `import numpy as np

def rms(h):
    return h / np.sqrt((h ** 2).mean(-1, keepdims=True) + 1e-6)

print(rms(np.array([3.0, 4.0])))                  # devia dar perto de [0.849 1.131]
print(rms(np.array([[1.0, -1.0, 2.0, 0.0]])))
`,
              checagem: `
tem('rms')
v = rms(np.array([3.0, 4.0]))
if not np.allclose(v, [0.84853, 1.13137], atol=1e-3):
    falha('Para (3, 4), o rms devia dar perto de (0,849, 1,131).')
m = np.random.default_rng(0).normal(0, 5, (4, 7))
if not np.allclose((rms(m) ** 2).mean(-1), 1, atol=1e-3):
    falha('Cada linha devia sair com média dos quadrados igual a 1. Use mean(-1, keepdims=True).')
if not np.all(np.isfinite(rms(np.zeros((2, 3))))):
    falha('Um vetor de zeros não pode dar divisão por zero. Some 1e-6 antes da raiz.')
`,
              certo: 'Cada estado sai na mesma escala, seja qual for o seu tamanho original.',
            }),
            ex('r1-estados', 'A primeira passada', 'A equação (2) do paper roda passadas em paralelo até chegar aos estados de quem decodifica palavra por palavra. Num modelo deste tamanho, dá para fazer isso diretamente: letra por letra.', {
              texto: `<p>A função <code>estados</code> anda pelas letras em ordem. Em cada letra <code>t</code>, ela calcula o estado de cima usando o estado da letra anterior, que está guardado em <code>h</code>: é a equação (1), seguida da camada do modelo.</p>
<p>No fim, <code>deslocar</code> empurra os estados uma letra para a frente: a letra <code>t</code> recebe o estado da <code>t − 1</code>, e a primeira recebe zeros.</p>
<p>Um teste bonito: se você roda <code>adiante</code> com esses estados no feedback, o estado que sai é exatamente o mesmo que entrou. É o <strong>ponto fixo</strong> da equação (2) do paper.</p>`,
              tarefa: 'Na linha marcada, falta o feedback. Troque <code>e[:, t]</code> por <code>e[:, t] + rms(h) @ P[\'Wf\']</code> dentro do parêntese.',
              inicio: DADOS + CODIFICAR + MODELO + estadosCom(`        h = np.tanh(e[:, t] @ P['W1'] + P['b1'])   # troque: falta o feedback do h anterior`) + `
P = iniciar(0)
P['Wf'] = np.random.default_rng(1).normal(0, 0.3, P['Wf'].shape)   # um W forte, para o efeito aparecer
ctx = janelas(treino, np.arange(3, 43))[None]                        # 40 letras
hs = estados(P, ctx)
_, _, h2, _ = adiante(P, ctx, deslocar(hs))
print("diferença entre o estado e o ponto fixo:", np.abs(h2 - hs).max())
`,
              dica: 'A linha fica <code>        h = np.tanh((e[:, t] + rms(h) @ P[\'Wf\']) @ P[\'W1\'] + P[\'b1\'])</code>.',
              solucao: DADOS + CODIFICAR + MODELO + ESTADOS + `
P = iniciar(0)
P['Wf'] = np.random.default_rng(1).normal(0, 0.3, P['Wf'].shape)   # um W forte, para o efeito aparecer
ctx = janelas(treino, np.arange(3, 43))[None]                        # 40 letras
hs = estados(P, ctx)
_, _, h2, _ = adiante(P, ctx, deslocar(hs))
print("diferença entre o estado e o ponto fixo:", np.abs(h2 - hs).max())
`,
              checagem: `
tem('estados')
if np.abs(h2 - hs).max() > 1e-9:
    falha('Os estados ainda não são o ponto fixo. Na linha marcada, some rms(h) @ P[\\'Wf\\'] a e[:, t].')
`,
              certo: 'Diferença zero: os estados da primeira passada são exatamente os de quem lê letra por letra. A segunda passada pode usá-los em paralelo.',
            }),
            ex('r1-passo', 'O passo de treino', 'Agora o Algoritmo 1 do paper inteiro: duas passadas, gradiente só na segunda, e o backprop escrito à mão, como no micrograd, só que com matrizes.', {
              texto: `<p>Leia <code>passo</code> de cima para baixo:</p>
<ul><li>sorteia 32 trechos de 24 letras do texto de treino;</li><li>com probabilidade 0,85, roda a <strong>primeira passada</strong> (<code>estados</code>) e guarda os estados deslocados em <code>fb</code>;</li><li>roda a <strong>segunda</strong> com esse <code>fb</code>, calcula a perda e faz o gradiente voltar.</li></ul>
<p>Repare na linha <code>g['Wf'] = rms(fb)...</code>: para o gradiente, o feedback é uma entrada fixa. Ele não volta pela primeira passada. É isso que torna a primeira passada "sem gradiente".</p>`,
              tarefa: 'Na linha marcada, guarde em <code>fb</code> os estados da primeira passada, deslocados: <code>fb = deslocar(estados(P, ctx))</code>.',
              inicio: DADOS + CODIFICAR + MODELO + ESTADOS + passoCom(`        fb = fb                                # troque: os estados da 1a passada, deslocados`) + `
P0 = iniciar(0)
P, curva = treinar(True, 300)
print("perda no começo:", round(curva[0], 3), "  no fim:", round(float(np.mean(curva[-30:])), 3))
print("o quanto o mapa W do feedback mudou:", round(float(np.abs(P['Wf'] - P0['Wf']).max()), 3))

import matplotlib.pyplot as plt
plt.figure(figsize=(5, 3.2))
plt.plot(curva)
plt.xlabel("passo de treino")
plt.ylabel("perda")
`,
              dica: 'A linha fica <code>        fb = deslocar(estados(P, ctx))</code>, com 8 espaços de recuo.',
              solucao: DADOS + CODIFICAR + MODELO + ESTADOS + TREINO + `
P0 = iniciar(0)
P, curva = treinar(True, 300)
print("perda no começo:", round(curva[0], 3), "  no fim:", round(float(np.mean(curva[-30:])), 3))
print("o quanto o mapa W do feedback mudou:", round(float(np.abs(P['Wf'] - P0['Wf']).max()), 3))

import matplotlib.pyplot as plt
plt.figure(figsize=(5, 3.2))
plt.plot(curva)
plt.xlabel("passo de treino")
plt.ylabel("perda")
`,
              checagem: `
tem('P')
if np.abs(P['Wf'] - P0['Wf']).max() < 0.05:
    falha('O mapa W do feedback quase não mudou: o feedback continua sendo zeros. Use fb = deslocar(estados(P, ctx)).')
`,
              certo: 'O mapa W aprendeu: o modelo passou a usar o estado da letra anterior. Falta a comparação do paper, com a mesma computação.',
              limite: 30000,
            }),
          ],
        },
        {
          titulo: 'Reproduzir',
          licoes: [
            ex('r1-numero', 'Com a mesma computação', 'A comparação do paper é justa por construção: os dois modelos gastam a mesma computação nos mesmos dados únicos. O sem feedback usa essa computação em mais épocas; o com feedback, nas duas passadas.', {
              texto: `<p>Cada passo do modelo com feedback custa <code>c = 1 + (1 − p) / 3</code> passos do modelo sem feedback. Então, com um orçamento de <code>N</code> passos, o modelo com feedback só pode dar <code>N / c</code>.</p>
<p>O código treina o modelo sem feedback por <code>N = 500</code> passos (são dezenas de épocas sobre as 6 mil letras: os dados se repetem muito) e o com feedback por <code>N / c</code>. Depois mede os dois nas frases novas.</p>
<p>Para ver se mais épocas resolvem, o sem feedback também treina o dobro: <code>2N</code>. São três treinos: pode levar alguns segundos.</p>`,
              tarefa: 'Calcule <code>c</code> com <code>p = 0.15</code> e o número de passos do modelo com feedback, <code>passos_fb = int(N / c)</code>.',
              inicio: TUDO + `
p = 0.15
N = 500
c = 1          # troque: 1 + (1 - p) / 3
passos_fb = N  # troque: int(N / c)

P_sem, _ = treinar(False, N)
P_sem2, _ = treinar(False, 2 * N)
P_fb, _ = treinar(True, passos_fb)
perda_sem = perdas(P_sem, valid, False).mean()
perda_sem2 = perdas(P_sem2, valid, False).mean()
perda_fb = perdas(P_fb, valid, True).mean()
print(f"c = {c:.3f}   passos com feedback = {passos_fb}")
print(f"sem feedback, N passos:   {perda_sem:.3f}")
print(f"sem feedback, 2N passos:  {perda_sem2:.3f}")
print(f"com feedback, N/c passos: {perda_fb:.3f}")
`,
              dica: '<code>c = 1 + (1 - p) / 3</code> e <code>passos_fb = int(N / c)</code>.',
              solucao: TUDO + `
p = 0.15
N = 500
c = 1 + (1 - p) / 3
passos_fb = int(N / c)

P_sem, _ = treinar(False, N)
P_sem2, _ = treinar(False, 2 * N)
P_fb, _ = treinar(True, passos_fb)
perda_sem = perdas(P_sem, valid, False).mean()
perda_sem2 = perdas(P_sem2, valid, False).mean()
perda_fb = perdas(P_fb, valid, True).mean()
print(f"c = {c:.3f}   passos com feedback = {passos_fb}")
print(f"sem feedback, N passos:   {perda_sem:.3f}")
print(f"sem feedback, 2N passos:  {perda_sem2:.3f}")
print(f"com feedback, N/c passos: {perda_fb:.3f}")
`,
              checagem: `
tem('c')
tem('passos_fb')
if not perto(c, 1.28333, 1e-3):
    falha('c devia dar cerca de 1,283.')
if passos_fb != int(N / c):
    falha('passos_fb devia ser int(N / c).')
if not perda_fb < perda_sem2:
    falha('Com a mesma computação, o feedback devia ficar abaixo do modelo sem feedback.')
`,
              certo: 'Com menos passos, o feedback ficou abaixo do sem feedback; e nem com o dobro de computação o sem feedback alcança. No paper, isso aparece como κ = ∞ nas linhas de muita repetição (Tabela 8). A forma do resultado se reproduziu, num modelo milhões de vezes menor.',
              limite: 45000,
            }),
            ex('r1-pergunta', 'Uma pergunta própria: o feedback guarda o sujeito?', 'O paper mede a perda média. Uma pergunta que ele não faz, e que é a de Vygotsky: o estado que passa de palavra em palavra funciona como uma fala interna, que guarda do que se está falando?', {
              texto: `<p>Para Vygotsky, a fala interna é abreviada: ela omite o sujeito, porque quem pensa já sabe de quem está falando, e guarda só o que se diz sobre ele. O feedback latente parece isso: um estado, sem palavras, que passa de uma palavra para a próxima.</p>
<p>A língua deste capítulo tem um teste pronto. A última letra antes do ponto concorda com o sujeito do começo da frase: menin<strong>a</strong>... cansad<strong>a</strong>. Essa letra está a mais de 20 letras do sujeito, longe da janela de 3. Só um estado que guarda o sujeito pode acertá-la.</p>
<p>O teste: medir a perda <strong>só nessa letra</strong> e no resto, para os dois modelos. Se o feedback guardasse o sujeito, a perda nessa letra cairia muito abaixo de 0,69 (o −log de 1/2, o acaso entre "o" e "a").</p>`,
              tarefa: 'Monte <code>genero</code>: <code>True</code> nas posições cuja letra seguinte é o ponto. Use <code>np.array([texto_valid[i + 1] == \'.\' for i in pos])</code>.',
              inicio: TUDO + `
P_sem, _ = treinar(False, 300)
P_fb, _ = treinar(True, int(300 / 1.2833))
l_sem = perdas(P_sem, valid, False)
l_fb = perdas(P_fb, valid, True)
pos = np.arange(K, len(valid) - 1)          # as posições medidas (sem a última)
l_sem, l_fb = l_sem[:-1], l_fb[:-1]

genero = np.zeros(len(pos), bool)   # troque: True onde a letra seguinte é o ponto

print(f"letra do gênero ({genero.sum()} letras)   sem feedback: {l_sem[genero].mean():.3f}   com feedback: {l_fb[genero].mean():.3f}")
print(f"o resto do texto                 sem feedback: {l_sem[~genero].mean():.3f}   com feedback: {l_fb[~genero].mean():.3f}")
`,
              dica: '<code>genero = np.array([texto_valid[i + 1] == \'.\' for i in pos])</code>.',
              solucao: TUDO + `
P_sem, _ = treinar(False, 300)
P_fb, _ = treinar(True, int(300 / 1.2833))
l_sem = perdas(P_sem, valid, False)
l_fb = perdas(P_fb, valid, True)
pos = np.arange(K, len(valid) - 1)          # as posições medidas (sem a última)
l_sem, l_fb = l_sem[:-1], l_fb[:-1]

genero = np.array([texto_valid[i + 1] == '.' for i in pos])

print(f"letra do gênero ({genero.sum()} letras)   sem feedback: {l_sem[genero].mean():.3f}   com feedback: {l_fb[genero].mean():.3f}")
print(f"o resto do texto                 sem feedback: {l_sem[~genero].mean():.3f}   com feedback: {l_fb[~genero].mean():.3f}")
`,
              checagem: `
tem('genero')
if int(genero.sum()) != texto_valid.count('.'):
    falha('Devia haver uma letra de gênero por frase: ' + str(texto_valid.count('.')) + '. Marque as posições i com texto_valid[i + 1] == ".".')
`,
              certo: 'O ganho do feedback está todo no resto do texto. Na letra do gênero, nenhum dos dois fica abaixo do acaso (0,69), e o feedback não ajuda em nada: o estado não guarda o sujeito. O motivo está no próprio método: o gradiente não atravessa o feedback (a primeira passada não tem gradiente), então nada ensina o estado a guardar algo para depois. Ele carrega o que ajuda a letra seguinte, não o que ajudaria 20 letras à frente. Uma fala interna, no sentido de Vygotsky, serve a um plano. Este feedback não é treinado para isso. Testar se um feedback treinado para o futuro (com gradiente através do tempo) passa a guardar o sujeito é um experimento que o paper não fez.',
              limite: 30000,
            }),
          ],
        },
      ],
    },
  ],
}
