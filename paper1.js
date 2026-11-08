// Paper 1: o primeiro capítulo depois do curso. No curso, o Karpathy implementa papers (Bengio et al.
// no makemore, BatchNorm, WaveNet, Attention Is All You Need, GPT-2). Aqui o método continua por conta
// própria: ler o paper, achar o núcleo, implementá-lo com a mesma simplicidade, reproduzir um número e
// fazer uma pergunta que o paper não fez. Este capítulo ensina o método com um paper só; a última parte
// é uma ficha para aplicar o método a qualquer paper escolhido na leitura do dia a dia.
//
// O paper: Kaplan et al. (2020), "Scaling Laws for Neural Language Models", arXiv:2001.08361.
// As constantes usadas aqui são as da equação (1.1) do paper: alfa_N ≈ 0,076 e N_c ≈ 8,8 × 10^13
// parâmetros (sem contar os embeddings). O experimento roda no navegador: um modelo pequeno, de
// features aleatórias, em vez de um Transformer. Ele reproduz a forma da lei (uma reta no gráfico
// log-log), não o número 0,076.

// O experimento dos três últimos passos de código. Cada passo roda sozinho, então cada um traz tudo.
const EXPERIMENTO = `import numpy as np

# A tarefa: aprender uma função de 3 números. Ela é fixa: a mesma em todos os passos.
r = np.random.default_rng(42)
P = r.normal(0, 0.7, (3, 10))
amp = r.normal(0, 1, 10)

def alvo(X):
    return np.sin(X @ P) @ amp / np.sqrt(10)

def dados(n, semente):
    X = np.random.default_rng(semente).normal(0, 1, (n, 3))
    return X, alvo(X)

X_treino, y_treino = dados(3000, 1)
X_teste, y_teste = dados(1000, 2)

# O modelo de tamanho N: N neurônios ReLU com pesos sorteados e fixos.
# Só a última camada aprende, e ela tem solução exata (mínimos quadrados).
def treinar(N, X, y, semente=0):
    r = np.random.default_rng(100 + semente)
    W = r.normal(0, 1, (3, N))
    b = r.normal(0, 1, N)
    F = np.maximum(0, X @ W + b)
    c = np.linalg.solve(F.T @ F + 1e-6 * np.eye(N), F.T @ y)
    return W, b, c

def perda(modelo, X, y):
    W, b, c = modelo
    erro = np.maximum(0, X @ W + b) @ c - y
    return np.mean(erro ** 2) / np.var(y)

def perda_media(N, X, y):
    # A média de 3 sorteios, para a curva não depender da sorte de um só.
    return np.mean([perda(treinar(N, X, y, s), X_teste, y_teste) for s in range(3)])

Ns = [4, 8, 16, 32, 64, 128]
`

const MEDIR = `perdas = [perda_media(N, X_treino, y_treino) for N in Ns]
`

const ex = (id, titulo, passo) => ({ id, titulo, passos: [passo] })

export const PAPER_1 = {
  n: 10,
  titulo: 'Paper 1',
  paper: {
    titulo: 'Scaling Laws for Neural Language Models',
    autores: 'Kaplan et al.',
    ano: 2020,
    url: 'https://arxiv.org/abs/2001.08361',
  },
  aula: 'https://arxiv.org/abs/2001.08361',
  partes: [
    {
      id: 'matematica',
      titulo: 'Ler o paper',
      modulos: [
        {
          titulo: 'O método',
          licoes: [
            {
              id: 'p1-nucleo',
              titulo: 'Achar o núcleo',
              porque: 'No curso, cada aula do Karpathy implementa um paper sem implementar tudo o que está nele. Ele pega só o que é novo e escreve isso com o menor código possível. O primeiro passo do método é achar esse pedaço.',
              passos: [
                {
                  texto: `<p>Um paper costuma ter dezenas de páginas, mas a ideia nova cabe em pouco: uma equação, uma camada, uma mudança num código que já existe.</p>
<p>Esse pedaço é o <strong>núcleo</strong>. O resto do paper serve para mostrar que o núcleo funciona: experimentos, tabelas, comparações.</p>
<p>No makemore, por exemplo, o paper de Bengio et al. (2003) vira um núcleo de poucas linhas: cada letra ganha um vetor (o embedding), e uma rede pequena lê esses vetores para prever a próxima letra.</p>`,
                  tarefa: 'O paper de Kaplan et al. (2020) treina centenas de modelos de linguagem de tamanhos diferentes. Qual é o núcleo dele?',
                  opcoes: [
                    { t: 'Uma arquitetura nova de Transformer.', por: 'Os modelos do paper são Transformers comuns. A novidade não está na arquitetura.' },
                    { t: 'Um otimizador novo.', por: 'O paper usa o Adam, um otimizador que já existia.' },
                    { t: 'Uma lei: a perda cai como uma potência do tamanho do modelo.', certa: true },
                    { t: 'Um conjunto de dados novo.', por: 'O conjunto de dados é só o lugar do experimento. A descoberta é outra.' },
                  ],
                  erro: 'Procure o que o paper descobriu, não o que ele usou.',
                  dica: 'O título fala em "scaling laws": leis de escala.',
                  solucao: 'O núcleo é a lei: a perda cai como uma potência do tamanho do modelo, dos dados e da computação.',
                  certo: 'Às vezes o núcleo é uma relação medida, não um código novo. Implementar esse tipo de paper é refazer a medida.',
                },
                {
                  texto: `<p>Quase todo paper é uma <strong>linha de base</strong> mais uma <strong>diferença</strong>. A linha de base é um código que você já tem. A diferença é o núcleo.</p>
<p>Pense no LoRA (Hu et al., 2021). Para ajustar um modelo grande, em vez de mudar a matriz de pesos <code>W</code> inteira, ele aprende só duas matrizes finas, <code>B</code> e <code>A</code>, e usa <code>W + BA</code>. O resto do modelo não muda.</p>`,
                  tarefa: 'Para implementar o LoRA no estilo do Karpathy, qual é a linha de base e qual é a diferença?',
                  opcoes: [
                    { t: 'Linha de base: um modelo novo do zero. Diferença: tudo.', por: 'Começar do zero esconde o que é novo. A ideia é reaproveitar um código que você entende.' },
                    { t: 'Linha de base: o GPT que você já escreveu. Diferença: trocar W por W + BA nas camadas lineares e treinar só B e A.', certa: true },
                    { t: 'Linha de base: o tokenizador. Diferença: um vocabulário maior.', por: 'O LoRA não mexe no tokenizador.' },
                  ],
                  erro: 'A linha de base é um código que já existe; a diferença é o que o paper muda nele.',
                  dica: 'A diferença do LoRA está na conta W + BA.',
                  solucao: 'Linha de base: o GPT do curso. Diferença: W + BA nas camadas lineares, com W congelada.',
                  certo: 'Com a diferença isolada, o paper vira poucas linhas sobre um código que você entende.',
                },
              ],
            },
            {
              id: 'p1-potencia',
              titulo: 'Ler a equação',
              porque: 'O núcleo do paper de Kaplan é uma equação curta. Antes de escrever código, vale entender o que ela diz com números na mão.',
              passos: [
                {
                  texto: `<p>A equação (1.1) do paper diz como a perda <code>L</code> depende do número de parâmetros <code>N</code>:</p>
<p style="font-size:1.15em"><code>L(N) = (N<sub>c</sub> / N)<sup>α</sup></code></p>
<p>As duas constantes foram medidas no paper: <code>α ≈ 0,076</code> e <code>N<sub>c</sub> ≈ 8,8 × 10<sup>13</sup></code>. A perda é a mesma da aula do makemore: a entropia cruzada, medida em nats por token.</p>
<p>Uma conta assim, com o tamanho elevado a um expoente, se chama <strong>lei de potência</strong>.</p>`,
                  tarefa: 'Qual é a perda prevista para um modelo de 1 bilhão de parâmetros (N = 10<sup>9</sup>)? Use uma calculadora, com duas casas decimais.',
                  campos: [{ rotulo: 'L =', resposta: 2.3756, tol: 0.01 }],
                  erro: 'Divida 8,8 × 10¹³ por 10⁹ e eleve o resultado a 0,076.',
                  dica: '8,8 × 10¹³ ÷ 10⁹ = 88 000. Depois, 88 000 elevado a 0,076.',
                  solucao: 'N_c / N = 88 000\nL = 88 000 ^ 0,076 ≈ 2,38',
                },
                {
                  texto: `<p>Agora dobre o modelo. Se <code>N</code> vira <code>2N</code>, a nova perda é a antiga multiplicada por <code>2<sup>−α</sup></code>.</p>
<p>Isso vale para qualquer <code>N</code>: numa lei de potência, dobrar o tamanho sempre corta a mesma fração da perda.</p>`,
                  tarefa: 'Quanto vale 2<sup>−0,076</sup>, com três casas decimais?',
                  campos: [{ rotulo: '2^(−0,076) =', resposta: 0.9487, tol: 0.002 }],
                  erro: 'Eleve 2 a −0,076 na calculadora.',
                  dica: 'Fica um pouco abaixo de 1.',
                  solucao: '2 ^ (−0,076) ≈ 0,949\nDobrar o modelo tira cerca de 5% da perda.',
                  certo: 'Cada vez que o modelo dobra, a perda cai uns 5%. É pouco a cada passo, mas vale para todos os tamanhos que o paper mediu.',
                },
                {
                  texto: `<p>A mesma conta, ao contrário: quanto o modelo precisa crescer para a perda cair 10%?</p>
<p>Queremos <code>(N<sub>1</sub> / N<sub>2</sub>)<sup>α</sup> = 0,9</code>. Isso dá <code>N<sub>2</sub> / N<sub>1</sub> = (1 / 0,9)<sup>1/α</sup></code>.</p>`,
                  tarefa: 'Quantas vezes maior precisa ser o modelo para a perda cair 10%?',
                  campos: [{ rotulo: 'N₂ / N₁ =', resposta: 4, tol: 0.05 }],
                  erro: 'Calcule 1 ÷ 0,9 e eleve a 1 ÷ 0,076.',
                  dica: '1 ÷ 0,9 ≈ 1,111 e 1 ÷ 0,076 ≈ 13,16.',
                  solucao: '(1 / 0,9) ^ (1 / 0,076) ≈ 4\nO modelo precisa ficar 4 vezes maior.',
                },
              ],
            },
            {
              id: 'p1-loglog',
              titulo: 'A reta escondida',
              porque: 'Para conferir uma lei de potência, o paper desenha os resultados num gráfico com as duas escalas em logaritmo. Ali a curva vira uma reta, e a inclinação da reta é o expoente.',
              passos: [
                {
                  texto: `<p>Tire o logaritmo dos dois lados de <code>L = (N<sub>c</sub> / N)<sup>α</sup></code>:</p>
<p><code>log L = α · log N<sub>c</sub> − α · log N</code></p>
<p>Com <code>x = log N</code> e <code>y = log L</code>, isso é <code>y = (α · log N<sub>c</sub>) − α · x</code>: a equação de uma reta.</p>`,
                  tarefa: 'Num gráfico de log L contra log N, qual é a inclinação da reta do paper?',
                  campos: [{ rotulo: 'inclinação =', resposta: -0.076, tol: 0.0005 }],
                  erro: 'A inclinação é o número que multiplica x. Repare no sinal.',
                  dica: 'Na reta, o x aparece como −α · x.',
                  solucao: 'inclinação = −α = −0,076',
                  certo: 'É assim que se mede α num experimento: ajusta-se uma reta no gráfico log-log e lê-se a inclinação.',
                },
              ],
            },
            {
              id: 'p1-experimento',
              titulo: 'O menor experimento',
              porque: 'O paper de Kaplan usou modelos de até 1,5 bilhão de parâmetros. Para aprender o método não é preciso isso: é preciso o menor experimento que ainda mostre o efeito.',
              passos: [
                {
                  texto: `<p>Para medir <code>L(N)</code>, o paper varia o tamanho do modelo e mede a perda no fim de cada treino.</p>
<p>Uma medida só é limpa quando nada além de <code>N</code> atrapalha. O paper mostra que, com poucos dados, a perda para de cair mesmo com um modelo maior: quem limita passa a ser a quantidade de dados.</p>`,
                  tarefa: 'Num experimento pequeno para medir L(N), o que deve ficar fixo e o que deve variar?',
                  opcoes: [
                    { t: 'Variar N; deixar fixos a tarefa e os dados, com dados de sobra.', certa: true },
                    { t: 'Variar N e a quantidade de dados ao mesmo tempo.', por: 'Aí não dá para saber se a perda caiu por causa do modelo ou por causa dos dados.' },
                    { t: 'Variar a tarefa a cada tamanho, para testar mais coisas.', por: 'Com a tarefa mudando, as perdas deixam de ser comparáveis.' },
                  ],
                  erro: 'Para medir o efeito de uma coisa, só ela pode mudar.',
                  dica: 'Só uma coisa varia. E os dados não podem ser o limite.',
                  solucao: 'Variar só N. A tarefa e os dados ficam fixos, com dados suficientes para não limitar o modelo.',
                  certo: 'Depois vem a pergunta própria: o que acontece quando os dados são poucos? Essa é a ablação do fim do capítulo.',
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
              id: 'p1-lei',
              titulo: 'A lei como função',
              porque: 'O primeiro código de um paper é o núcleo escrito do jeito mais direto. Aqui, o núcleo é a equação (1.1).',
              passos: [
                {
                  texto: `<p>Uma lei de potência vira uma função de uma linha. Em Python, <code>**</code> é a potência e <code>8.8e13</code> é 8,8 × 10<sup>13</sup>.</p>`,
                  tarefa: 'Complete <code>perda_kaplan(N)</code> com a equação do paper: <code>(N_c / N) ** alfa</code>.',
                  inicio: `alfa = 0.076\nN_c = 8.8e13\n\ndef perda_kaplan(N):\n    pass\n\nfor N in [1e6, 1e7, 1e8, 1e9, 1e10]:\n    print(f"N = {N:.0e}   L = {perda_kaplan(N):.3f}")\n`,
                  dica: 'Troque <code>pass</code> por <code>return (N_c / N) ** alfa</code>.',
                  solucao: `alfa = 0.076\nN_c = 8.8e13\n\ndef perda_kaplan(N):\n    return (N_c / N) ** alfa\n\nfor N in [1e6, 1e7, 1e8, 1e9, 1e10]:\n    print(f"N = {N:.0e}   L = {perda_kaplan(N):.3f}")\n`,
                  checagem: `
tem('perda_kaplan')
v = perda_kaplan(1e9)
if v is None:
    falha('A função ainda não devolve nada. Falta o return.')
if not perto(v, 2.3756, 1e-3):
    falha('Para N = 1e9, a perda devia dar cerca de 2,376.')
`,
                },
              ],
            },
            {
              id: 'p1-ajuste',
              titulo: 'Medir o expoente',
              porque: 'Antes de usar uma ferramenta de análise num experimento, um bom pesquisador confere a ferramenta num caso em que sabe a resposta. Aqui, a ferramenta é o ajuste de reta no gráfico log-log.',
              passos: [
                {
                  texto: `<p>O <code>np.polyfit(x, y, 1)</code> acha a reta que passa mais perto dos pontos e devolve a inclinação e o intercepto.</p>
<p>Gere pontos com a própria lei do paper e ajuste a reta em <code>log N</code> contra <code>log L</code>. Se a ferramenta estiver certa, ela devolve o expoente que você colocou.</p>`,
                  tarefa: 'Guarde em <code>alfa_medido</code> o expoente medido: a inclinação com o sinal trocado.',
                  inicio: `import numpy as np\n\nNs = np.array([1e6, 1e7, 1e8, 1e9, 1e10])\nLs = (8.8e13 / Ns) ** 0.076\n\ninclinacao, intercepto = np.polyfit(np.log(Ns), np.log(Ls), 1)\nalfa_medido = 0\n\nprint("alfa medido:", alfa_medido)\n`,
                  dica: 'A inclinação é −α. Então <code>alfa_medido = -inclinacao</code>.',
                  solucao: `import numpy as np\n\nNs = np.array([1e6, 1e7, 1e8, 1e9, 1e10])\nLs = (8.8e13 / Ns) ** 0.076\n\ninclinacao, intercepto = np.polyfit(np.log(Ns), np.log(Ls), 1)\nalfa_medido = -inclinacao\n\nprint("alfa medido:", alfa_medido)\n`,
                  checagem: `
tem('alfa_medido')
if not perto(float(alfa_medido), 0.076, 1e-6):
    falha('O expoente medido devia voltar a ser 0,076. Confira o sinal.')
`,
                  certo: 'A ferramenta devolveu o 0,076 que entrou. Agora dá para confiar nela num experimento de verdade.',
                },
              ],
            },
          ],
        },
        {
          titulo: 'Reproduzir',
          licoes: [
            {
              id: 'p1-medir',
              titulo: 'Treinar modelos de vários tamanhos',
              porque: 'O paper treina modelos de tamanhos diferentes e mede a perda de cada um. É o mesmo experimento, em miniatura: modelos que treinam em menos de um segundo no navegador.',
              passos: [
                {
                  texto: `<p>O código já traz uma tarefa, os dados e um modelo de tamanho <code>N</code>. O modelo tem N neurônios ReLU com pesos sorteados; só a última camada aprende.</p>
<p>Ele não é um Transformer, e isso é de propósito: é o menor modelo em que o tamanho ainda importa. Modelos assim são usados em pesquisa para estudar leis de escala, como em Bahri et al. (2021) e Maloney, Roberts &amp; Sully (2022).</p>
<p>A função <code>perda_media(N, X, y)</code> treina um modelo de tamanho N e devolve a perda no teste.</p>`,
                  tarefa: 'Guarde em <code>perdas</code> a perda de cada tamanho da lista <code>Ns</code>, na mesma ordem.',
                  inicio: EXPERIMENTO + `perdas = []\n\nfor N in Ns:\n    pass\n\nfor N, L in zip(Ns, perdas):\n    print(f"N = {N:4d}   perda = {L:.4f}")\n`,
                  dica: 'Dentro do <code>for</code>: <code>perdas.append(perda_media(N, X_treino, y_treino))</code>.',
                  solucao: EXPERIMENTO + `perdas = []\n\nfor N in Ns:\n    perdas.append(perda_media(N, X_treino, y_treino))\n\nfor N, L in zip(Ns, perdas):\n    print(f"N = {N:4d}   perda = {L:.4f}")\n`,
                  checagem: `
tem('perdas')
if len(perdas) != len(Ns):
    falha('Devia haver uma perda para cada tamanho: ' + str(len(Ns)) + ' ao todo.')
if not perdas[-1] < perdas[0] / 10:
    falha('A perda do maior modelo devia ficar bem abaixo da do menor. Confira se usou X_treino e y_treino.')
`,
                  certo: 'Cada vez que o modelo dobra, a perda cai. A pergunta agora é se ela cai como uma lei de potência.',
                },
              ],
            },
            {
              id: 'p1-reta',
              titulo: 'A reta no gráfico',
              porque: 'Reproduzir um paper é refazer a figura principal. A Figura 1 de Kaplan mostra a perda contra o tamanho em escala log-log: uma reta.',
              passos: [
                {
                  texto: `<p>Com as perdas medidas, ajuste a reta em <code>log N</code> contra <code>log perda</code>, como no passo de conferir a ferramenta.</p>
<p>O gráfico já vem pronto, com as duas escalas em logaritmo.</p>`,
                  tarefa: 'Guarde em <code>alfa</code> o expoente medido no seu experimento.',
                  inicio: EXPERIMENTO + MEDIR + `
inclinacao, intercepto = np.polyfit(np.log(Ns), np.log(perdas), 1)
alfa = 0

import matplotlib.pyplot as plt
plt.figure(figsize=(5, 3.4))
plt.loglog(Ns, perdas, "o", label="medido")
plt.loglog(Ns, np.exp(intercepto) * np.array(Ns, float) ** inclinacao, "--", label="reta ajustada")
plt.xlabel("N (tamanho do modelo)")
plt.ylabel("perda no teste")
plt.legend()
print("alfa:", alfa)
`,
                  dica: 'Igual ao passo anterior: <code>alfa = -inclinacao</code>.',
                  solucao: EXPERIMENTO + MEDIR + `
inclinacao, intercepto = np.polyfit(np.log(Ns), np.log(perdas), 1)
alfa = -inclinacao

import matplotlib.pyplot as plt
plt.figure(figsize=(5, 3.4))
plt.loglog(Ns, perdas, "o", label="medido")
plt.loglog(Ns, np.exp(intercepto) * np.array(Ns, float) ** inclinacao, "--", label="reta ajustada")
plt.xlabel("N (tamanho do modelo)")
plt.ylabel("perda no teste")
plt.legend()
print("alfa:", alfa)
`,
                  checagem: `
tem('alfa')
if not 0.8 < float(alfa) < 1.4:
    falha('O expoente devia ficar perto de 1,1. Confira o sinal da inclinação.')
`,
                  certo: 'Os pontos caem sobre a reta: a forma da lei se reproduziu. O expoente é outro (perto de 1,1, não 0,076) porque a tarefa e o modelo são outros. O paper também mede expoentes diferentes para coisas diferentes: 0,076 para o tamanho e 0,095 para os dados.',
                },
              ],
            },
            {
              id: 'p1-ablacao',
              titulo: 'Uma pergunta própria',
              porque: 'O último passo do método é fazer uma pergunta que o seu experimento pode responder. Ela transforma a reprodução em pesquisa: você passa a ver algo com os próprios olhos.',
              passos: [
                {
                  texto: `<p>A pergunta: <strong>o que acontece com a lei quando os dados são poucos?</strong></p>
<p>O paper responde com outra equação, a (1.5), que junta o tamanho e os dados. Aqui você responde com o experimento: o mesmo modelo, com só 100 exemplos de treino em vez de 3 000.</p>`,
                  tarefa: 'Meça o expoente com os 100 primeiros exemplos e guarde em <code>alfa_poucos</code>. O expoente com todos os dados já está em <code>alfa_muitos</code>.',
                  inicio: EXPERIMENTO + `
def medir_alfa(X, y):
    perdas = [perda_media(N, X, y) for N in Ns]
    inclinacao, _ = np.polyfit(np.log(Ns), np.log(perdas), 1)
    return -inclinacao

alfa_muitos = medir_alfa(X_treino, y_treino)
alfa_poucos = 0

print("com 3000 exemplos:", round(alfa_muitos, 2))
print("com 100 exemplos: ", round(alfa_poucos, 2))
`,
                  dica: 'Os 100 primeiros exemplos são <code>X_treino[:100]</code> e <code>y_treino[:100]</code>. Passe os dois para <code>medir_alfa</code>.',
                  solucao: EXPERIMENTO + `
def medir_alfa(X, y):
    perdas = [perda_media(N, X, y) for N in Ns]
    inclinacao, _ = np.polyfit(np.log(Ns), np.log(perdas), 1)
    return -inclinacao

alfa_muitos = medir_alfa(X_treino, y_treino)
alfa_poucos = medir_alfa(X_treino[:100], y_treino[:100])

print("com 3000 exemplos:", round(alfa_muitos, 2))
print("com 100 exemplos: ", round(alfa_poucos, 2))
`,
                  checagem: `
tem('alfa_poucos'); tem('alfa_muitos')
if float(alfa_poucos) == 0:
    falha('alfa_poucos ainda é 0. Meça com os 100 primeiros exemplos.')
if not float(alfa_poucos) < float(alfa_muitos) - 0.15:
    falha('Com 100 exemplos, o expoente devia ficar menor. Confira se usou [:100] em X e em y.')
`,
                  certo: 'Com poucos dados, a reta fica mais deitada: dobrar o modelo ajuda menos, porque agora os dados limitam. É o que a equação (1.5) do paper descreve. Anos depois, Hoffmann et al. (2022), o paper do Chinchilla, refizeram essas medidas com mais cuidado e mudaram a conclusão de quanto dado usar para cada tamanho de modelo. Reproduzir também é o jeito de achar onde um paper erra.',
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
            ex('p1-ficha-ler', 'Escolher e ler', {
              texto: `<p>Agora o método é seu. Escolha um paper da sua leitura do dia e preencha a ficha com o que você achou ao ler o paper inteiro.</p>
<p>Uma linha por campo basta. Se um campo não fecha, o paper ainda não está pronto para virar código.</p>`,
              tarefa: 'Preencha os quatro campos, trocando cada <code>"..."</code> pelo que vale para o seu paper.',
              inicio: `paper = "..."         # título, autores e ano\nnucleo = "..."        # a ideia nova, numa frase\nlinha_de_base = "..." # o código que você já tem (micrograd, makemore, o GPT do curso...)\ndiferenca = "..."     # o que muda nesse código\n\nprint("Paper:", paper)\nprint("Núcleo:", nucleo)\nprint("Linha de base:", linha_de_base)\nprint("Diferença:", diferenca)\n`,
              dica: 'Para o paper deste capítulo, seria: núcleo = "a perda cai como potência de N"; linha de base = "o GPT do curso"; diferença = "nenhuma no modelo: muda o experimento, que treina vários tamanhos".',
              solucao: `paper = "Kaplan et al. (2020), Scaling Laws for Neural Language Models"\nnucleo = "a perda cai como uma potência do tamanho do modelo"\nlinha_de_base = "o GPT do curso"\ndiferenca = "nenhuma no modelo: o experimento treina vários tamanhos e ajusta a reta log-log"\n\nprint("Paper:", paper)\nprint("Núcleo:", nucleo)\nprint("Linha de base:", linha_de_base)\nprint("Diferença:", diferenca)\n`,
              checagem: `
for nome in ['paper', 'nucleo', 'linha_de_base', 'diferenca']:
    tem(nome)
    v = eval(nome)
    if not isinstance(v, str) or v.strip() in ('', '...'):
        falha('Falta preencher "' + nome + '".')
`,
            }),
            ex('p1-ficha-plano', 'O plano do experimento', {
              texto: `<p>A segunda metade da ficha é o plano. Ela decide se a implementação vira aprendizado ou só código copiado.</p>
<p>O número a reproduzir deve vir de uma figura ou tabela do paper. A pergunta própria deve ser algo que o paper não testou e que o seu experimento pequeno consegue responder.</p>`,
              tarefa: 'Preencha os quatro campos do plano. O código imprime a ficha em Markdown, pronta para o blog ou para o Caderno de Pesquisa.',
              inicio: `formatos = "..."          # o formato de cada tensor do núcleo, ex.: (B, T, C)\nmenor_experimento = "..." # dados e tamanho mínimos que ainda mostram o efeito\nnumero_alvo = "..."       # o número ou a figura do paper que você vai reproduzir\npergunta_propria = "..."  # a ablação: o que o paper não perguntou\n\nprint("## Plano")\nprint("- Formatos:", formatos)\nprint("- Menor experimento:", menor_experimento)\nprint("- Número a reproduzir:", numero_alvo)\nprint("- Pergunta própria:", pergunta_propria)\n`,
              dica: 'Para o paper deste capítulo: número a reproduzir = "a reta da Figura 1"; pergunta própria = "o que acontece com o expoente quando os dados são poucos".',
              solucao: `formatos = "N neurônios: X (n, 3), W (3, N), F (n, N), c (N,)"\nmenor_experimento = "6 tamanhos de 4 a 128 neurônios, 3000 exemplos, no navegador"\nnumero_alvo = "a reta da Figura 1 no gráfico log-log"\npergunta_propria = "o que acontece com o expoente quando os dados são poucos"\n\nprint("## Plano")\nprint("- Formatos:", formatos)\nprint("- Menor experimento:", menor_experimento)\nprint("- Número a reproduzir:", numero_alvo)\nprint("- Pergunta própria:", pergunta_propria)\n`,
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
