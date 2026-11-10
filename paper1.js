// Paper 1: o primeiro capítulo depois do curso. No curso, o Karpathy implementa papers (Bengio et al.
// no makemore, BatchNorm, WaveNet, Attention Is All You Need, GPT-2). Aqui o método continua por conta
// própria: ler o paper, achar o núcleo, implementá-lo com a mesma simplicidade, reproduzir um número e
// fazer uma pergunta que o paper não fez. Este capítulo ensina o método no caso típico, uma linha de
// base mais uma diferença; a última parte é uma ficha para aplicar o método a qualquer paper.
//
// O paper: Hu et al. (2021), "LoRA: Low-Rank Adaptation of Large Language Models", arXiv:2106.09685.
// O núcleo é a equação (3): h = W0 x + BAx, com W0 congelada e só B e A treinando. O experimento roda
// no navegador com uma camada linear só (no paper, o LoRA vai nas matrizes da atenção de um
// Transformer). A tarefa nova é feita para que a mudança certa tenha posto 4: assim a ablação do posto
// tem resposta conhecida, e a pergunta própria é o que acontece quando isso não vale.
//
// Os trechos do paper são recortes do PDF do arXiv (v2), em papers/lora2021/, com o link para a página.

// O experimento dos passos de código. Cada passo roda sozinho, então cada um traz tudo.
const EXPERIMENTO = `import numpy as np

# Uma camada pré-treinada: h = W0 x. No GPT do curso, seria uma das matrizes da atenção.
d = k = 64
W0 = np.random.default_rng(0).normal(0, 1, (d, k)) / np.sqrt(k)

# A tarefa nova: a camada certa para ela é W0 mais uma mudança de posto dado.
def tarefa(posto):
    r = np.random.default_rng(posto)
    U = r.normal(0, 1, (d, posto))
    V = r.normal(0, 1, (posto, k)) / np.sqrt(k)
    return W0 + U @ V / np.sqrt(posto)

# Os dados da tarefa nova: uma linha de X por exemplo, como no curso.
def dados(n, semente, W):
    X = np.random.default_rng(semente).normal(0, 1, (n, k))
    ruido = 0.05 * np.random.default_rng(semente + 100).normal(0, 1, (n, d))
    return X, X @ W.T + ruido

# O erro quadrático de cada exemplo, somado nas d saídas, na média dos exemplos.
def perda(W, X, Y):
    return np.mean(np.sum((X @ W.T - Y) ** 2, axis=1))
`

// O ajuste com LoRA, pronto, para os passos depois de escrevê-lo.
const AJUSTAR = `
# O laço da lição "Ajustar só B e A". X.T @ X e Y.T @ X não mudam durante o treino: calculados
# uma vez, o dW é o mesmo de antes, com contas bem menores a cada passo.
def ajustar(r, X, Y, passos=500, lr=0.05):
    A = np.random.default_rng(10).normal(0, 1, (r, k)) / np.sqrt(k)
    B = np.zeros((d, r))
    XtX, YtX = X.T @ X / len(X), Y.T @ X / len(X)
    for _ in range(passos):
        dW = 2 * ((W0 + B @ A) @ XtX - YtX)
        dB, dA = dW @ A.T, B.T @ dW
        B -= lr * dB
        A -= lr * dA
    return B, A
`

const TABELA_INICIO = `
W_nova = tarefa(4)
X, Y = dados(400, 1, W_nova)
X_teste, Y_teste = dados(2000, 2, W_nova)

rs = [1, 2, 4, 8, 16]
`

const TABELA_FIM = `
import matplotlib.pyplot as plt
plt.figure(figsize=(5, 3.4))
if perdas:
    plt.semilogy(rs, perdas, "o-", label="LoRA")
plt.axhline(perda(W0, X_teste, Y_teste), color="gray", ls=":", label="antes do ajuste")
plt.xscale("log", base=2)
plt.xticks(rs, [str(r) for r in rs])
plt.xlabel("r (o posto de BA)")
plt.ylabel("perda no teste")
plt.legend()
for r, L in zip(rs, perdas):
    print(f"r = {r:2d}   parâmetros treinados = {r * (d + k):5d}   perda = {L:.3f}")
`

const PERGUNTA_INICIO = `
rs = [1, 2, 4, 8, 16, 32, 64]

def curva(posto):
    W_nova = tarefa(posto)
    X, Y = dados(400, 1, W_nova)
    X_teste, Y_teste = dados(2000, 2, W_nova)
    antes = perda(W0, X_teste, Y_teste)
    return antes, [perda(W0 + B @ A, X_teste, Y_teste) for B, A in (ajustar(r, X, Y) for r in rs)]

antes_4, perdas_4 = curva(4)      # a mudança tem posto 4, como antes
antes_64, perdas_64 = curva(64)   # a mudança tem posto cheio
`

const PERGUNTA_FIM = `
import matplotlib.pyplot as plt
plt.figure(figsize=(5, 3.4))
plt.semilogy(rs, np.array(perdas_4) / antes_4, "o-", label="mudança de posto 4")
plt.semilogy(rs, np.array(perdas_64) / antes_64, "s-", label="mudança de posto 64")
plt.axhline(0.1, color="gray", ls=":", label="10% da perda de antes")
plt.xscale("log", base=2)
plt.xticks(rs, [str(r) for r in rs])
plt.xlabel("r (o posto de BA)")
plt.ylabel("perda / perda antes")
plt.legend(loc="lower left")
print("r necessário:", r_necessario)
`

const ex = (id, titulo, passo) => ({ id, titulo, passos: [passo] })

// Um trecho do paper, recortado do PDF do arXiv, com o link para a página. Como o Karpathy nas aulas:
// o paper aberto ao lado do código, na parte exata que está sendo implementada.
const trecho = (arquivo, onde, pagina, alt) => `<figure class="trecho">
<a href="papers/lora2021/${arquivo}.png" target="_blank" rel="noopener" title="Abrir em tamanho cheio"><img src="papers/lora2021/${arquivo}.png" alt="${alt}" loading="lazy"></a>
<figcaption><span class="trecho__rotulo">No paper</span> · Hu et al. (2021), ${onde} · <a href="https://arxiv.org/pdf/2106.09685v2#page=${pagina}" target="_blank" rel="noopener">abrir na página ${pagina}</a></figcaption>
</figure>`

export const PAPER_1 = {
  n: 10,
  titulo: 'Paper 1',
  paper: {
    titulo: 'LoRA: Low-Rank Adaptation of Large Language Models',
    autores: 'Hu et al.',
    ano: 2021,
    url: 'https://arxiv.org/abs/2106.09685',
  },
  aula: 'https://arxiv.org/abs/2106.09685',
  partes: [
    {
      id: 'matematica',
      titulo: 'Ler o paper',
      modulos: [
        {
          titulo: 'O método',
          licoes: [
            {
              id: 'lora-nucleo',
              titulo: 'Achar o núcleo',
              porque: 'No curso, cada aula do Karpathy implementa um paper sem implementar tudo o que está nele. Ele pega só o que é novo e escreve isso com o menor código possível. O primeiro passo do método é achar esse pedaço.',
              passos: [
                {
                  texto: `<p>Um paper costuma ter dezenas de páginas, mas a ideia nova cabe em pouco: uma equação, uma camada, uma mudança num código que já existe.</p>
<p>Esse pedaço é o <strong>núcleo</strong>. O resto do paper serve para mostrar que o núcleo funciona: experimentos, tabelas, comparações.</p>
<p>No makemore, por exemplo, o paper de Bengio et al. (2003) vira um núcleo de poucas linhas: cada letra ganha um vetor (o embedding), e uma rede pequena lê esses vetores para prever a próxima letra.</p>
<p>O lugar para começar a procurar é o resumo. Este é o do paper do LoRA:</p>
${trecho('lora-resumo', 'resumo', 1, 'O resumo do paper do LoRA, de Hu et al. (2021).')}`,
                  tarefa: 'Qual é o núcleo do LoRA?',
                  opcoes: [
                    { t: 'Uma arquitetura nova de Transformer, mais barata de treinar.', por: 'O modelo continua o mesmo. O resumo fala em congelar os pesos de um modelo que já existe.' },
                    { t: 'Congelar os pesos pré-treinados e treinar só duas matrizes pequenas, cujo produto é somado a cada camada.', certa: true },
                    { t: 'Treinar um modelo menor que imita o grande.', por: 'Isso é destilação, outra ideia. Aqui o modelo grande continua lá, congelado.' },
                    { t: 'Um conjunto de dados novo para ajustar modelos.', por: 'Os dados são só o lugar dos experimentos.' },
                  ],
                  erro: 'Procure no resumo o que o LoRA faz com os pesos do modelo.',
                  dica: 'Leia a frase "which freezes the pre-trained model weights and injects trainable rank decomposition matrices".',
                  solucao: 'O núcleo: os pesos pré-treinados ficam congelados, e cada camada ganha duas matrizes pequenas treináveis, cujo produto é somado aos pesos.',
                  certo: '"Rank decomposition matrices" são essas duas matrizes pequenas. O resto do resumo são os números que mostram que a ideia funciona: 10 000 vezes menos parâmetros treinados no GPT-3.',
                },
                {
                  texto: `<p>Quase todo paper é uma <strong>linha de base</strong> mais uma <strong>diferença</strong>. A linha de base é um código que você já tem. A diferença é o núcleo.</p>
<p>No LoRA, para ajustar um modelo grande a uma tarefa nova, em vez de mudar a matriz de pesos <code>W</code> inteira, aprende-se só duas matrizes finas, <code>B</code> e <code>A</code>, e usa-se <code>W + BA</code>. O resto do modelo não muda.</p>`,
                  tarefa: 'Para implementar o LoRA no estilo do Karpathy, qual é a linha de base e qual é a diferença?',
                  opcoes: [
                    { t: 'Linha de base: um modelo novo do zero. Diferença: tudo.', por: 'Começar do zero esconde o que é novo. A ideia é reaproveitar um código que você entende.' },
                    { t: 'Linha de base: o GPT que você já escreveu. Diferença: trocar W por W + BA nas camadas lineares e treinar só B e A.', certa: true },
                    { t: 'Linha de base: o tokenizador. Diferença: um vocabulário maior.', por: 'O LoRA não mexe no tokenizador.' },
                  ],
                  erro: 'A linha de base é um código que já existe; a diferença é o que o paper muda nele.',
                  dica: 'A diferença do LoRA está na conta W + BA.',
                  solucao: 'Linha de base: o GPT do curso. Diferença: W + BA nas camadas lineares, com W congelada.',
                  certo: 'Com a diferença isolada, o paper vira poucas linhas sobre um código que você entende. Este é o caso típico do método. Nem todo paper é assim: o Paper 2 é um paper que não muda o modelo.',
                },
              ],
            },
            {
              id: 'lora-antes',
              titulo: 'O que veio antes',
              porque: 'Uma ideia nova quase sempre resolve um problema de uma ideia anterior. Saber qual era o problema mostra por que o núcleo tem o formato que tem.',
              passos: [
                {
                  texto: `<p>O LoRA não foi o primeiro a ajustar um modelo treinando poucos parâmetros. Em 2019, os <strong>adapters</strong> (Houlsby et al.) colocaram camadas pequenas novas dentro de cada bloco do Transformer, e só elas treinavam.</p>
<p>O problema aparece na hora de usar o modelo. As camadas novas ficam no caminho: cada token tem de passar por elas, uma depois da outra. A seção 3 do paper do LoRA mede isso no GPT-2 médio:</p>
${trecho('lora-latencia', 'seção 3, Tabela 1', 4, 'A Tabela 1 do paper: o tempo de uma passada no GPT-2 médio, em milissegundos, com o modelo ajustado normalmente e com dois tipos de adapter, para três tamanhos de lote e de sequência.')}
<p>A linha Fine-Tune/LoRA é o tempo do modelo sem camadas novas. As linhas Adapter mostram o tempo com os adapters e, entre parênteses, quanto mais lento ficou.</p>`,
                  tarefa: 'Com lote de 1 e sequência de 128 tokens (a última coluna), quantos por cento mais lento fica o Adapter<sup>L</sup>?',
                  campos: [{ rotulo: '% mais lento =', resposta: 20.7, tol: 0.15 }],
                  erro: 'Procure a última coluna, na linha Adapter com o L em cima, e leia o número entre parênteses.',
                  dica: 'Na última coluna, a linha Adapter<sup>L</sup> diz 23,9 ± 2,1, e entre parênteses vem a diferença.',
                  solucao: '23,9 ms contra 19,8 ms: +20,7%.',
                  certo: 'Com lotes pequenos, que é o caso de quem conversa com um modelo, um quinto a mais de tempo em cada resposta. É esse o problema que o LoRA resolve.',
                },
                {
                  texto: `<p>O LoRA também acrescenta parâmetros: as matrizes <code>B</code> e <code>A</code>. Mas eles não ficam no caminho como uma camada nova.</p>
<p>Depois do treino, <code>B</code> e <code>A</code> viram uma matriz só, <code>BA</code>, do mesmo tamanho de <code>W</code>.</p>`,
                  tarefa: 'Por que o LoRA não deixa o modelo mais lento depois do treino?',
                  opcoes: [
                    { t: 'Porque B e A são pequenas, então a conta é rápida.', por: 'Pequenas ou não, se ficassem como um caminho separado ainda seriam contas a mais em cada token.' },
                    { t: 'Porque BA tem o mesmo tamanho de W: dá para calcular W + BA uma vez e usar essa matriz no lugar de W.', certa: true },
                    { t: 'Porque o LoRA tira camadas do modelo.', por: 'O LoRA não tira nada do modelo.' },
                  ],
                  erro: 'Pense no que dá para fazer com W e BA, sendo do mesmo tamanho.',
                  dica: 'Duas matrizes do mesmo tamanho podem ser somadas.',
                  solucao: 'W + BA é uma matriz do mesmo tamanho de W. Somando uma vez, o modelo fica com o formato original e o mesmo tempo de antes.',
                  certo: 'O paper chama isso de "No Additional Inference Latency". Você vai fazer essa soma em código, numa lição de implementar.',
                  confira: `<p>O paper diz o mesmo na seção 4.1:</p>
${trecho('lora-juntar', 'seção 4.1', 4, 'Trecho do paper: em produção, calcula-se W = W0 + BA e usa-se como sempre, o que garante não haver tempo a mais na inferência.')}`,
                },
              ],
            },
            {
              id: 'lora-equacao',
              titulo: 'Ler a equação',
              porque: 'O núcleo do LoRA é uma equação curta. Antes de escrever código, vale entender o formato de cada matriz e contar os parâmetros com números na mão.',
              passos: [
                {
                  texto: `<p>A equação (3) é o LoRA inteiro:</p>
${trecho('lora-eq3', 'seção 4.1, equação (3)', 4, 'A equação (3) do paper: h = W0 x + ΔW x = W0 x + BAx, com W0 de d por k, B de d por r, A de r por k, e r muito menor que d e k.')}
<p>Os formatos estão no texto: <code>W<sub>0</sub></code> é <code>d × k</code>, <code>B</code> é <code>d × r</code> e <code>A</code> é <code>r × k</code>, com <code>r</code> pequeno. A Figura 1 desenha a mesma conta:</p>
${trecho('lora-fig1', 'Figura 1', 1, 'A Figura 1 do paper: a entrada x passa pelos pesos pré-treinados W e, ao lado, por A (que reduz para r dimensões) e B (que volta para d). As duas saídas são somadas em h.')}
<p>Os pesos pré-treinados à esquerda; à direita, <code>A</code> estreita a entrada para <code>r</code> números e <code>B</code> a alarga de volta. As duas saídas se somam.</p>`,
                  tarefa: 'No GPT-3, uma matriz da atenção tem d = k = 12 288. Com r = 4, quantos parâmetros têm B e A juntas?',
                  campos: [{ rotulo: 'parâmetros =', resposta: 98304, tol: 0.5 }],
                  erro: 'B tem d × r números e A tem r × k. Some os dois.',
                  dica: 'd × r + r × k = r × (d + k) = 4 × 24 576.',
                  solucao: 'B: 12 288 × 4 = 49 152\nA: 4 × 12 288 = 49 152\nJuntas: 98 304',
                },
                {
                  texto: `<p>Agora compare com a matriz inteira, que o ajuste completo treinaria: <code>W<sub>0</sub></code> tem <code>d × k</code> números.</p>`,
                  tarefa: 'Quantas vezes menos parâmetros o LoRA treina nessa matriz?',
                  campos: [{ rotulo: 'd·k / r(d+k) =', resposta: 1536, tol: 1 }],
                  erro: 'Calcule 12 288 × 12 288 e divida por 98 304.',
                  dica: '12 288 × 12 288 = 150 994 944.',
                  solucao: '150 994 944 / 98 304 = 1 536',
                  certo: 'Mais de mil vezes menos, numa matriz só. O paper fala em 10 000 vezes no modelo inteiro porque o LoRA só entra em algumas matrizes: o resto do GPT-3 fica congelado e não treina nada.',
                },
                {
                  texto: `<p>Falta decidir com que valores <code>B</code> e <code>A</code> começam. O paper sorteia <code>A</code> e começa <code>B</code> com zeros.</p>
<p>O paper ainda multiplica <code>BAx</code> por uma constante, <code>α / r</code>, para não precisar reajustar a taxa de aprendizado quando muda o <code>r</code>. No código deste capítulo ela fica igual a 1.</p>`,
                  tarefa: 'Com B cheia de zeros, o que o modelo calcula no primeiro passo do ajuste?',
                  opcoes: [
                    { t: 'Uma saída aleatória, por causa do A sorteado.', por: 'A aleatória é multiplicada por B, que é zero. O produto some.' },
                    { t: 'Exatamente o mesmo que o modelo pré-treinado.', certa: true },
                    { t: 'Zero em todas as saídas.', por: 'W₀x continua lá. Só a parte BAx é que dá zero.' },
                  ],
                  erro: 'Calcule BA com B = 0 e veja o que sobra de h = W₀x + BAx.',
                  dica: 'Zero vezes qualquer matriz dá zero.',
                  solucao: 'BA = 0, então h = W₀x: o ajuste começa exatamente do modelo pré-treinado.',
                  certo: 'Por que não começar as duas com zeros? Porque aí os gradientes de B e de A também seriam zero, e nada sairia do lugar. Uma das duas tem de ser sorteada.',
                  confira: `<p>No paper, logo depois da equação (3):</p>
${trecho('lora-inicio', 'seção 4.1', 4, 'Trecho do paper: A começa com valores gaussianos e B com zeros, então ΔW = BA é zero no começo do treino; ΔWx é multiplicado por alfa sobre r.')}`,
                },
              ],
            },
            {
              id: 'lora-posto',
              titulo: 'O posto',
              porque: 'O nome do paper é Low-Rank Adaptation. A palavra que sustenta a ideia é "rank", o posto. Sem ela, não dá para saber por que matrizes tão finas bastariam.',
              passos: [
                {
                  texto: `<p>O <strong>posto</strong> de uma matriz é quantas direções independentes ela tem. Uma matriz <code>64 × 64</code> qualquer tem posto 64: ela pode mexer na entrada em todas as direções.</p>
<p>O produto <code>BA</code> é diferente. Toda entrada passa primeiro por <code>A</code>, que a espreme em <code>r</code> números. O que sai de <code>BA</code> só pode variar em <code>r</code> direções, por maior que seja a matriz.</p>
<p>Por que isso bastaria? É a hipótese do paper:</p>
${trecho('lora-hipotese', 'seção 1', 2, 'Trecho do paper: os autores supõem que a mudança dos pesos durante o ajuste tem um posto intrínseco baixo, e mostram no GPT-3 que r igual a 1 ou 2 basta mesmo quando o posto cheio é 12 288.')}
<p>Em português: a mudança que o ajuste faz nos pesos, <code>ΔW</code>, cabe em poucas direções. Se isso for verdade, <code>BA</code> com <code>r</code> pequeno consegue representá-la.</p>`,
                  tarefa: 'Com B de formato 64 × 4 e A de formato 4 × 64, qual é o maior posto possível de BA?',
                  campos: [{ rotulo: 'posto máximo =', resposta: 4, tol: 0 }],
                  erro: 'BA é 64 × 64, mas tudo passa pelo gargalo do meio.',
                  dica: 'O gargalo é o r.',
                  solucao: 'BA é 64 × 64, mas toda entrada é espremida em 4 números por A. Posto máximo: 4.',
                  certo: 'É uma hipótese, não um teorema: o paper a testa com experimentos. Na pergunta própria do fim, você vai ver o que acontece quando ela não vale.',
                },
              ],
            },
            {
              id: 'lora-experimento',
              titulo: 'O menor experimento',
              porque: 'O paper ajusta o GPT-3, com 175 bilhões de parâmetros. Para aprender o método não é preciso isso: é preciso o menor experimento que ainda mostre o efeito.',
              passos: [
                {
                  texto: `<p>O LoRA atua em cada camada linear separadamente: <code>h = W<sub>0</sub>x + BAx</code>. Então o menor experimento é uma camada linear só, com uma <code>W<sub>0</sub></code> que faz o papel da pré-treinada.</p>
<p>Para a tarefa nova, o código monta uma camada certa que é <code>W<sub>0</sub></code> mais uma mudança de posto 4. Assim a resposta é conhecida, e dá para ver se o LoRA a encontra.</p>`,
                  tarefa: 'Para medir como o resultado depende de r, o que deve ficar fixo e o que deve variar?',
                  opcoes: [
                    { t: 'Variar r; deixar fixos W₀, a tarefa nova, os dados e o número de passos.', certa: true },
                    { t: 'Variar r e a quantidade de dados ao mesmo tempo.', por: 'Aí não dá para saber se a perda mudou por causa do r ou por causa dos dados.' },
                    { t: 'Sortear uma W₀ nova para cada r.', por: 'Com o ponto de partida mudando, as perdas deixam de ser comparáveis.' },
                  ],
                  erro: 'Para medir o efeito de uma coisa, só ela pode mudar.',
                  dica: 'Só uma coisa varia.',
                  solucao: 'Variar só r. W₀, a tarefa, os dados e o treino ficam iguais.',
                  certo: 'A camada sozinha esconde uma coisa: no GPT, o LoRA entra em várias matrizes ao mesmo tempo. Mas o núcleo é o mesmo em cada uma delas.',
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
          titulo: 'A equação em código',
          licoes: [
            {
              id: 'lora-camada',
              titulo: 'A camada LoRA',
              porque: 'O primeiro código de um paper é o núcleo escrito do jeito mais direto. Aqui, o núcleo é a equação (3).',
              passos: [
                {
                  texto: `<p>O paper escreve <code>h = W<sub>0</sub>x + BAx</code> com <code>x</code> em pé, uma coluna. No código do curso, cada exemplo é uma linha de <code>X</code>, e uma camada linear vira <code>X @ W.T</code>.</p>
<p>Com a mesma troca, <code>BAx</code> vira <code>X @ A.T @ B.T</code>: primeiro <code>A</code> estreita a entrada para <code>r</code> números, depois <code>B</code> a alarga de volta. São os dois trapézios da Figura 1.</p>`,
                  tarefa: 'Complete <code>camada_lora(X, W0, B, A)</code> com os dois caminhos da equação (3), somados.',
                  inicio: `import numpy as np\n\ndef camada_lora(X, W0, B, A):\n    pass\n\nr = np.random.default_rng(0)\nX = r.normal(0, 1, (5, 6))    # 5 exemplos, k = 6\nW0 = r.normal(0, 1, (4, 6))   # d = 4\nB = r.normal(0, 1, (4, 2))    # r = 2\nA = r.normal(0, 1, (2, 6))\n\nh = camada_lora(X, W0, B, A)\nprint("formato da saída:", None if h is None else h.shape)\n`,
                  dica: 'Troque <code>pass</code> por <code>return X @ W0.T + X @ A.T @ B.T</code>.',
                  solucao: `import numpy as np\n\ndef camada_lora(X, W0, B, A):\n    return X @ W0.T + X @ A.T @ B.T\n\nr = np.random.default_rng(0)\nX = r.normal(0, 1, (5, 6))    # 5 exemplos, k = 6\nW0 = r.normal(0, 1, (4, 6))   # d = 4\nB = r.normal(0, 1, (4, 2))    # r = 2\nA = r.normal(0, 1, (2, 6))\n\nh = camada_lora(X, W0, B, A)\nprint("formato da saída:", None if h is None else h.shape)\n`,
                  checagem: `
tem('camada_lora')
v = camada_lora(X, W0, B, A)
if v is None:
    falha('A função ainda não devolve nada. Falta o return.')
v = np.asarray(v)
if v.shape != (5, 4):
    falha('A saída devia ter uma linha por exemplo e d = 4 colunas: formato (5, 4). Confira as transpostas.')
if not np.allclose(v, X @ (W0 + B @ A).T):
    falha('A saída devia ser X @ W0.T mais X @ A.T @ B.T.')
`,
                  certo: 'A saída tem o formato (5, 4): uma linha por exemplo, d números em cada. Igual ao que uma camada linear comum daria.',
                },
              ],
            },
            {
              id: 'lora-inicio',
              titulo: 'Começar do pré-treinado',
              porque: 'Um ajuste tem de começar do modelo que já sabe alguma coisa. A escolha de B = 0 é o que garante isso.',
              passos: [
                {
                  texto: `<p>Como no paper: <code>A</code> sorteada, <code>B</code> com zeros. Com isso, a camada LoRA começa calculando exatamente <code>X @ W0.T</code>.</p>
<p>Os formatos vêm da equação: <code>B</code> é <code>d × r</code>, <code>A</code> é <code>r × k</code>.</p>`,
                  tarefa: 'Crie <code>B</code> com zeros, no formato certo. O código confere se a saída é igual à do modelo pré-treinado.',
                  inicio: `import numpy as np\n\nd, k, r = 64, 64, 4\nW0 = np.random.default_rng(0).normal(0, 1, (d, k)) / np.sqrt(k)\n\nA = np.random.default_rng(10).normal(0, 1, (r, k)) / np.sqrt(k)\nB = None\n\nX = np.random.default_rng(1).normal(0, 1, (8, k))\nif B is not None:\n    igual = np.allclose(X @ W0.T + X @ A.T @ B.T, X @ W0.T)\n    print("igual ao pré-treinado:", igual)\n`,
                  dica: '<code>np.zeros((d, r))</code> cria uma matriz de zeros com d linhas e r colunas.',
                  solucao: `import numpy as np\n\nd, k, r = 64, 64, 4\nW0 = np.random.default_rng(0).normal(0, 1, (d, k)) / np.sqrt(k)\n\nA = np.random.default_rng(10).normal(0, 1, (r, k)) / np.sqrt(k)\nB = np.zeros((d, r))\n\nX = np.random.default_rng(1).normal(0, 1, (8, k))\nif B is not None:\n    igual = np.allclose(X @ W0.T + X @ A.T @ B.T, X @ W0.T)\n    print("igual ao pré-treinado:", igual)\n`,
                  checagem: `
tem('B')
if B is None:
    falha('B ainda é None. Crie a matriz de zeros.')
B_ = np.asarray(B)
if B_.shape != (d, r):
    falha('B devia ter o formato (d, r) = (' + str(d) + ', ' + str(r) + ').')
if np.any(B_ != 0):
    falha('B devia começar só com zeros.')
`,
                  certo: 'O ajuste começa exatamente do modelo pré-treinado. A cada passo, BA se afasta um pouco do zero, só na direção que a tarefa nova pede.',
                },
              ],
            },
            {
              id: 'lora-gradientes',
              titulo: 'Os gradientes de B e A',
              porque: 'No curso, o Karpathy faz o backprop à mão (a aula "Becoming a Backprop Ninja"). Aqui é a mesma regra, numa multiplicação de matrizes.',
              passos: [
                {
                  texto: `<p>O ajuste precisa dos gradientes da perda em relação a <code>B</code> e a <code>A</code>. Comece pelo que já se sabe: o gradiente em relação à matriz inteira, <code>dW</code>, é o mesmo de uma camada linear comum.</p>
<p>Como <code>W = W<sub>0</sub> + BA</code> e <code>W<sub>0</sub></code> é constante, o gradiente em relação a <code>BA</code> também é <code>dW</code>. Falta passar pela multiplicação. É a regra do backprop do curso: se <code>C = B @ A</code>, então</p>
<p><code>dB = dC @ A.T</code> e <code>dA = B.T @ dC</code></p>
<p>Os formatos conferem a conta: <code>dB</code> tem o formato de <code>B</code>, e <code>dA</code> o de <code>A</code>.</p>`,
                  tarefa: 'Complete <code>gradientes(dW, B, A)</code>, que devolve <code>dB</code> e <code>dA</code>.',
                  inicio: `import numpy as np\n\ndef gradientes(dW, B, A):\n    dB = None\n    dA = None\n    return dB, dA\n\nr = np.random.default_rng(0)\nB = r.normal(0, 1, (6, 2))\nA = r.normal(0, 1, (2, 5))\ndW = r.normal(0, 1, (6, 5))\n\ndB, dA = gradientes(dW, B, A)\nprint("dB:", None if dB is None else dB.shape, "  dA:", None if dA is None else dA.shape)\n`,
                  dica: '<code>dB = dW @ A.T</code> e <code>dA = B.T @ dW</code>.',
                  solucao: `import numpy as np\n\ndef gradientes(dW, B, A):\n    dB = dW @ A.T\n    dA = B.T @ dW\n    return dB, dA\n\nr = np.random.default_rng(0)\nB = r.normal(0, 1, (6, 2))\nA = r.normal(0, 1, (2, 5))\ndW = r.normal(0, 1, (6, 5))\n\ndB, dA = gradientes(dW, B, A)\nprint("dB:", None if dB is None else dB.shape, "  dA:", None if dA is None else dA.shape)\n`,
                  checagem: `
tem('gradientes')
gB, gA = gradientes(dW, B, A)
if gB is None or gA is None:
    falha('Falta calcular dB ou dA.')
gB, gA = np.asarray(gB), np.asarray(gA)
if gB.shape != B.shape or gA.shape != A.shape:
    falha('dB devia ter o formato de B ' + str(B.shape) + ' e dA o de A ' + str(A.shape) + '.')
# Confere com a derivada numérica de f(B, A) = soma(dW * (B @ A)), cujo gradiente em BA é dW.
f = lambda B_, A_: np.sum(dW * (B_ @ A_))
h = 1e-6
Bh = B.copy(); Bh[1, 0] += h
Ah = A.copy(); Ah[0, 3] += h
if not perto(float(gB[1, 0]), (f(Bh, A) - f(B, A)) / h, 1e-4):
    falha('dB não bate com a derivada numérica. Confira a ordem: dW @ A.T.')
if not perto(float(gA[0, 3]), (f(B, Ah) - f(B, A)) / h, 1e-4):
    falha('dA não bate com a derivada numérica. Confira a ordem: B.T @ dW.')
`,
                  certo: 'O código conferiu as duas contas com a derivada numérica, como o Karpathy faz no curso. Repare: dA = B.T @ dW é zero no primeiro passo, porque B começa com zeros. Quem se move primeiro é B.',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Reproduzir',
          licoes: [
            {
              id: 'lora-ajustar',
              titulo: 'Ajustar só B e A',
              porque: 'Com a camada, o começo e os gradientes, falta o laço de treino. É o mesmo laço do curso, com uma diferença: W0 nunca muda.',
              passos: [
                {
                  texto: `<p>O código já traz a camada pré-treinada <code>W0</code>, a tarefa nova (uma mudança de posto 4) e 400 exemplos dela. O laço calcula <code>dW</code> e os gradientes de <code>B</code> e <code>A</code>.</p>
<p>Falta a atualização: dar um passo contra o gradiente, só em <code>B</code> e em <code>A</code>.</p>`,
                  tarefa: 'Complete o laço com a atualização de <code>B</code> e de <code>A</code>, com a taxa <code>lr</code>.',
                  inicio: EXPERIMENTO + `
W_nova = tarefa(4)
X, Y = dados(400, 1, W_nova)
X_teste, Y_teste = dados(2000, 2, W_nova)
W0_antes = W0.copy()

r, lr = 4, 0.05
A = np.random.default_rng(10).normal(0, 1, (r, k)) / np.sqrt(k)
B = np.zeros((d, r))

for passo in range(500):
    dW = 2 * (X @ (W0 + B @ A).T - Y).T @ X / len(X)
    dB, dA = dW @ A.T, B.T @ dW
    # a atualização de B e de A

print("perda antes: ", round(perda(W0, X_teste, Y_teste), 3))
print("perda depois:", round(perda(W0 + B @ A, X_teste, Y_teste), 3))
print("parâmetros treinados:", B.size + A.size, "de", W0.size)
`,
                  dica: 'Duas linhas dentro do <code>for</code>: <code>B -= lr * dB</code> e <code>A -= lr * dA</code>.',
                  solucao: EXPERIMENTO + `
W_nova = tarefa(4)
X, Y = dados(400, 1, W_nova)
X_teste, Y_teste = dados(2000, 2, W_nova)
W0_antes = W0.copy()

r, lr = 4, 0.05
A = np.random.default_rng(10).normal(0, 1, (r, k)) / np.sqrt(k)
B = np.zeros((d, r))

for passo in range(500):
    dW = 2 * (X @ (W0 + B @ A).T - Y).T @ X / len(X)
    dB, dA = dW @ A.T, B.T @ dW
    B -= lr * dB
    A -= lr * dA

print("perda antes: ", round(perda(W0, X_teste, Y_teste), 3))
print("perda depois:", round(perda(W0 + B @ A, X_teste, Y_teste), 3))
print("parâmetros treinados:", B.size + A.size, "de", W0.size)
`,
                  checagem: `
if not np.array_equal(W0, W0_antes):
    falha('W0 mudou. No LoRA, os pesos pré-treinados ficam congelados: só B e A treinam.')
if not np.any(B != 0):
    falha('B ainda é zero. Falta atualizar B e A dentro do laço.')
if not perda(W0 + B @ A, X_teste, Y_teste) < 1:
    falha('A perda no teste devia cair de mais de 60 para menos de 1. Confira o sinal: B -= lr * dB.')
`,
                  certo: 'A perda caiu de cerca de 65 para 0,16, que é o tamanho do ruído dos dados: não dá para ir abaixo disso. Treinando 512 números, um oitavo da matriz, sem tocar em W0.',
                },
              ],
            },
            {
              id: 'lora-juntar',
              titulo: 'Juntar os pesos',
              porque: 'A vantagem prática do LoRA sobre os adapters: depois do treino, ele some dentro da matriz original.',
              passos: [
                {
                  texto: `<p>Depois do ajuste, os dois caminhos da Figura 1 podem virar um só: <code>W = W0 + B @ A</code>. Uma matriz do tamanho de <code>W0</code>, que se usa como uma camada linear comum.</p>
<p>E para voltar ao modelo original, ou trocar de tarefa, basta subtrair <code>B @ A</code>.</p>`,
                  tarefa: 'Guarde em <code>W</code> a matriz juntada. O código confere se ela dá a mesma saída que os dois caminhos.',
                  inicio: EXPERIMENTO + AJUSTAR + `
W_nova = tarefa(4)
X, Y = dados(400, 1, W_nova)
B, A = ajustar(4, X, Y)

W = None

X_novo = np.random.default_rng(5).normal(0, 1, (3, k))
dois_caminhos = X_novo @ W0.T + X_novo @ A.T @ B.T
print("mesma saída:", W is not None and np.allclose(X_novo @ W.T, dois_caminhos))
`,
                  dica: '<code>W = W0 + B @ A</code>.',
                  solucao: EXPERIMENTO + AJUSTAR + `
W_nova = tarefa(4)
X, Y = dados(400, 1, W_nova)
B, A = ajustar(4, X, Y)

W = W0 + B @ A

X_novo = np.random.default_rng(5).normal(0, 1, (3, k))
dois_caminhos = X_novo @ W0.T + X_novo @ A.T @ B.T
print("mesma saída:", W is not None and np.allclose(X_novo @ W.T, dois_caminhos))
`,
                  checagem: `
tem('W')
if W is None:
    falha('W ainda é None. Some W0 com B @ A.')
if np.asarray(W).shape != W0.shape:
    falha('W devia ter o formato de W0: ' + str(W0.shape) + '.')
if not np.allclose(X_novo @ np.asarray(W).T, dois_caminhos):
    falha('W devia dar a mesma saída que os dois caminhos. Confira: W0 + B @ A.')
`,
                  certo: 'Mesma saída, uma multiplicação só. O modelo ajustado tem exatamente o formato e o custo do original: é por isso que o LoRA não deixa o modelo mais lento, ao contrário dos adapters da Tabela 1.',
                },
              ],
            },
            {
              id: 'lora-tabela6',
              titulo: 'Reproduzir a Tabela 6',
              porque: 'Reproduzir um paper é refazer um número dele. A Tabela 6 do LoRA responde a pergunta central: qual r é preciso?',
              passos: [
                {
                  texto: `<p>Na seção 7.2, o paper ajusta o GPT-3 com vários <code>r</code> e mede a acurácia em duas tarefas. O mesmo experimento, em miniatura: ajustar a camada com <code>r</code> de 1 a 16 e medir a perda no teste.</p>
<p>A função <code>ajustar(r, X, Y)</code> já traz o laço da lição anterior e devolve <code>B</code> e <code>A</code>.</p>`,
                  tarefa: 'Guarde em <code>perdas</code> a perda no teste para cada <code>r</code> da lista <code>rs</code>, na mesma ordem.',
                  inicio: EXPERIMENTO + AJUSTAR + TABELA_INICIO + `perdas = []

for r in rs:
    B, A = ajustar(r, X, Y)
    pass
` + TABELA_FIM,
                  dica: 'Troque <code>pass</code> por <code>perdas.append(perda(W0 + B @ A, X_teste, Y_teste))</code>.',
                  solucao: EXPERIMENTO + AJUSTAR + TABELA_INICIO + `perdas = []

for r in rs:
    B, A = ajustar(r, X, Y)
    perdas.append(perda(W0 + B @ A, X_teste, Y_teste))
` + TABELA_FIM,
                  checagem: `
tem('perdas')
if len(perdas) != len(rs):
    falha('Devia haver uma perda para cada r: ' + str(len(rs)) + ' ao todo.')
if not perdas[2] < perdas[0] / 20:
    falha('Com r = 4, a perda devia ficar bem abaixo da de r = 1. Confira se mediu no teste: X_teste e Y_teste.')
`,
                  certo: 'Com r = 1 e 2, o LoRA só acerta parte da mudança. Com r = 4, chega ao piso do ruído, e r maior não ajuda mais. Faz sentido: a mudança da tarefa tem posto 4.',
                  confira: `<p>Compare com a Tabela 6 do paper. No GPT-3, adaptando <code>W<sub>q</sub></code> e <code>W<sub>v</sub></code>, a acurácia com r = 1 já é praticamente a mesma de r = 64:</p>
${trecho('lora-tabela6', 'seção 7.2, Tabela 6', 10, 'A Tabela 6 do paper: acurácia no WikiSQL e no MultiNLI para r de 1 a 64. Adaptando Wq e Wv, r = 1 já dá quase o mesmo que r = 64.')}
<p>No seu experimento, o posto da mudança era 4 porque o código foi feito assim. No GPT-3, ninguém escolheu o posto: o paper mediu, e ele saiu pequeno. É a hipótese do posto intrínseco baixo, vista num modelo de verdade.</p>`,
                },
              ],
            },
            {
              id: 'lora-pergunta',
              titulo: 'Uma pergunta própria',
              porque: 'O último passo do método é fazer uma pergunta que o paper não fez. Ela transforma a reprodução em pesquisa: você passa a ver algo com os próprios olhos.',
              passos: [
                {
                  texto: `<p>Todo o LoRA se apoia na hipótese de que a mudança <code>ΔW</code> tem posto baixo. A pergunta: <strong>o que acontece quando ela não tem?</strong></p>
<p>O experimento compara duas tarefas novas: a de antes, com uma mudança de posto 4, e uma com mudança de posto cheio, 64. Para comparar as duas, cada perda é dividida pela perda de antes do ajuste.</p>`,
                  tarefa: 'Guarde em <code>r_necessario</code> o menor <code>r</code> da lista que deixa a tarefa de posto 64 abaixo de 10% da perda de antes.',
                  inicio: EXPERIMENTO + AJUSTAR + PERGUNTA_INICIO + `
r_necessario = 0
` + PERGUNTA_FIM,
                  dica: 'Percorra <code>zip(rs, perdas_64)</code> e pare no primeiro <code>r</code> com <code>L / antes_64 &lt; 0.1</code>. Em uma linha: <code>r_necessario = next(r for r, L in zip(rs, perdas_64) if L / antes_64 &lt; 0.1)</code>.',
                  solucao: EXPERIMENTO + AJUSTAR + PERGUNTA_INICIO + `
r_necessario = next(r for r, L in zip(rs, perdas_64) if L / antes_64 < 0.1)
` + PERGUNTA_FIM,
                  checagem: `
tem('r_necessario')
if r_necessario == 0:
    falha('r_necessario ainda é 0. Procure o primeiro r com a perda abaixo de 10% da de antes.')
certo_r = next(r for r, L in zip(rs, perdas_64) if L / antes_64 < 0.1)
if r_necessario != certo_r:
    falha('Confira a conta: a perda de cada r dividida por antes_64, e o primeiro r abaixo de 0,1.')
`,
                  certo: 'Com a mudança de posto 4, r = 4 basta. Com a de posto 64, r = 4 ainda deixa 70% da perda, e só r = 32 chega a 10%. Só que r = 32 treina 32 × (64 + 64) = 4 096 números: tantos quanto a matriz inteira. Aí o LoRA não economiza nada. O LoRA funciona quando a hipótese vale. Anos depois, Biderman et al. (2024), em "LoRA Learns Less and Forgets Less", mediram isso em modelos de verdade: em tarefas difíceis, como programação e matemática, a mudança do ajuste completo tem posto bem mais alto do que os r usuais, e o ajuste completo ganha do LoRA. Reproduzir também é o jeito de achar onde uma ideia para de funcionar.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'depois',
      titulo: 'O seu paper',
      exercicios: true,
      modulos: [
        {
          titulo: 'A ficha',
          licoes: [
            ex('lora-ficha-ler', 'Escolher e ler', {
              texto: `<p>Agora o método é seu. Escolha um paper da sua leitura do dia e preencha a ficha com o que você achou ao ler o paper inteiro.</p>
<p>Uma linha por campo basta. Se um campo não fecha, o paper ainda não está pronto para virar código.</p>`,
              tarefa: 'Preencha os quatro campos, trocando cada <code>"..."</code> pelo que vale para o seu paper.',
              inicio: `paper = "..."         # título, autores e ano\nnucleo = "..."        # a ideia nova, numa frase\nlinha_de_base = "..." # o código que você já tem (micrograd, makemore, o GPT do curso...)\ndiferenca = "..."     # o que muda nesse código\n\nprint("Paper:", paper)\nprint("Núcleo:", nucleo)\nprint("Linha de base:", linha_de_base)\nprint("Diferença:", diferenca)\n`,
              dica: 'Para o paper deste capítulo, seria: núcleo = "congelar W e treinar só BA, de posto baixo"; linha de base = "o GPT do curso"; diferença = "W vira W + BA nas camadas lineares".',
              solucao: `paper = "Hu et al. (2021), LoRA: Low-Rank Adaptation of Large Language Models"\nnucleo = "congelar os pesos e treinar só duas matrizes finas, B e A, somando BA a cada camada"\nlinha_de_base = "o GPT do curso"\ndiferenca = "W vira W + BA nas camadas lineares, e só B e A recebem gradiente"\n\nprint("Paper:", paper)\nprint("Núcleo:", nucleo)\nprint("Linha de base:", linha_de_base)\nprint("Diferença:", diferenca)\n`,
              checagem: `
for nome in ['paper', 'nucleo', 'linha_de_base', 'diferenca']:
    tem(nome)
    v = eval(nome)
    if not isinstance(v, str) or v.strip() in ('', '...'):
        falha('Falta preencher "' + nome + '".')
`,
            }),
            ex('lora-ficha-plano', 'O plano do experimento', {
              texto: `<p>A segunda metade da ficha é o plano. Ela decide se a implementação vira aprendizado ou só código copiado.</p>
<p>O número a reproduzir deve vir de uma figura ou tabela do paper. A pergunta própria deve ser algo que o paper não testou e que o seu experimento pequeno consegue responder.</p>`,
              tarefa: 'Preencha os quatro campos do plano. O código imprime a ficha em Markdown, pronta para o blog ou para o Caderno de Pesquisa.',
              inicio: `formatos = "..."          # o formato de cada tensor do núcleo, ex.: (B, T, C)\nmenor_experimento = "..." # dados e tamanho mínimos que ainda mostram o efeito\nnumero_alvo = "..."       # o número ou a figura do paper que você vai reproduzir\npergunta_propria = "..."  # a ablação: o que o paper não perguntou\n\nprint("## Plano")\nprint("- Formatos:", formatos)\nprint("- Menor experimento:", menor_experimento)\nprint("- Número a reproduzir:", numero_alvo)\nprint("- Pergunta própria:", pergunta_propria)\n`,
              dica: 'Para o paper deste capítulo: número a reproduzir = "a Tabela 6: a perda para cada r"; pergunta própria = "o que acontece quando a mudança da tarefa não tem posto baixo".',
              solucao: `formatos = "X (n, k), W0 (d, k), B (d, r), A (r, k), saída (n, d)"\nmenor_experimento = "uma camada linear 64 × 64, 400 exemplos, r de 1 a 16, no navegador"\nnumero_alvo = "a Tabela 6: a perda para cada r"\npergunta_propria = "o que acontece quando a mudança da tarefa não tem posto baixo"\n\nprint("## Plano")\nprint("- Formatos:", formatos)\nprint("- Menor experimento:", menor_experimento)\nprint("- Número a reproduzir:", numero_alvo)\nprint("- Pergunta própria:", pergunta_propria)\n`,
              checagem: `
for nome in ['formatos', 'menor_experimento', 'numero_alvo', 'pergunta_propria']:
    tem(nome)
    v = eval(nome)
    if not isinstance(v, str) or v.strip() in ('', '...'):
        falha('Falta preencher "' + nome + '".')
`,
            }),
          ],
        },
      ],
    },
  ],
}
