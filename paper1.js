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
// log-log), não o número 0,076. A regularização do modelo (reg=0.1) faz o papel do early stopping do
// paper; a última lição de código a tira e mostra o pico da dupla descida, em N = número de exemplos.

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
# O reg é uma regularização pequena, que faz o papel do early stopping do paper.
def treinar(N, X, y, semente=0, reg=0.1):
    r = np.random.default_rng(100 + semente)
    W = r.normal(0, 1, (3, N))
    b = r.normal(0, 1, N)
    F = np.maximum(0, X @ W + b)
    c = np.linalg.solve(F.T @ F + reg * np.eye(N), F.T @ y)
    return W, b, c

def perda(modelo, X, y):
    W, b, c = modelo
    erro = np.maximum(0, X @ W + b) @ c - y
    return np.mean(erro ** 2) / np.var(y)

def perda_media(N, X, y, reg=0.1):
    # A média de 3 sorteios, para a curva não depender da sorte de um só.
    return np.mean([perda(treinar(N, X, y, s, reg), X_teste, y_teste) for s in range(3)])

Ns = [4, 8, 16, 32, 64, 128]
`

const MEDIR = `perdas = [perda_media(N, X_treino, y_treino) for N in Ns]
`

// A pergunta própria: as mesmas perdas com 100 exemplos, e um tamanho a mais para ver o fim da curva.
const ABL_INICIO = `
Ns = [4, 8, 16, 32, 64, 128, 256]
perdas_muitos = [perda_media(N, X_treino, y_treino) for N in Ns]
`

const ABL_FIM = `
import matplotlib.pyplot as plt
plt.figure(figsize=(5, 3.4))
plt.loglog(Ns, perdas_muitos, "o-", label="3000 exemplos")
if perdas_poucos:
    plt.loglog(Ns, perdas_poucos, "s-", label="100 exemplos")
plt.xlabel("N (tamanho do modelo)")
plt.ylabel("perda no teste")
plt.legend()

def inclinacoes(perdas):
    p = np.array(perdas)
    return np.round(-np.log(p[1:] / p[:-1]) / np.log(2), 2)

print("inclinações locais, 3000 exemplos:", inclinacoes(perdas_muitos))
print("inclinações locais, 100 exemplos: ", inclinacoes(perdas_poucos))
`

// O pico: sem regularização, com 100 exemplos e muitos tamanhos perto de 100.
const PICO_INICIO = `
# Sem regularização: reg quase zero. Só 100 exemplos de treino.
Ns_finos = [40, 60, 80, 90, 95, 100, 105, 110, 120, 140, 160, 200]
perdas = [perda_media(N, X_treino[:100], y_treino[:100], reg=1e-6) for N in Ns_finos]
`

const PICO_FIM = `
import matplotlib.pyplot as plt
plt.figure(figsize=(5, 3.4))
plt.plot(Ns_finos, perdas, "o-")
plt.axvline(100, color="gray", ls=":", label="N = número de exemplos")
plt.xlabel("N (tamanho do modelo)")
plt.ylabel("perda no teste")
plt.legend()
print("pior tamanho:", pior_N)
`

const ex = (id, titulo, passo) => ({ id, titulo, passos: [passo] })

// Um trecho do paper, recortado do PDF do arXiv (v1), com o link para a página. Como o Karpathy nas
// aulas: o paper aberto ao lado do código, na parte exata que está sendo implementada.
const trecho = (arquivo, onde, pagina, alt) => `<figure class="trecho">
<a href="papers/kaplan2020/${arquivo}.png" target="_blank" rel="noopener" title="Abrir em tamanho cheio"><img src="papers/kaplan2020/${arquivo}.png" alt="${alt}" loading="lazy"></a>
<figcaption><span class="trecho__rotulo">No paper</span> · Kaplan et al. (2020), ${onde} · <a href="https://arxiv.org/pdf/2001.08361v1#page=${pagina}" target="_blank" rel="noopener">abrir na página ${pagina}</a></figcaption>
</figure>`

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
<p>No makemore, por exemplo, o paper de Bengio et al. (2003) vira um núcleo de poucas linhas: cada letra ganha um vetor (o embedding), e uma rede pequena lê esses vetores para prever a próxima letra.</p>
<p>O lugar para começar a procurar é o resumo. Este é o do paper de Kaplan et al. (2020):</p>
${trecho('kaplan-resumo', 'resumo', 1, 'O resumo do paper de Kaplan et al. (2020).')}`,
                  tarefa: 'O paper treina centenas de modelos de linguagem de tamanhos diferentes. Qual é o núcleo dele?',
                  opcoes: [
                    { t: 'Uma arquitetura nova de Transformer.', por: 'Os modelos do paper são Transformers comuns. A novidade não está na arquitetura.' },
                    { t: 'Um otimizador novo.', por: 'O paper usa o Adam, um otimizador que já existia.' },
                    { t: 'Uma lei: a perda cai como uma potência do tamanho do modelo.', certa: true },
                    { t: 'Um conjunto de dados novo.', por: 'O conjunto de dados é só o lugar do experimento. A descoberta é outra.' },
                  ],
                  erro: 'Procure o que o paper descobriu, não o que ele usou.',
                  dica: 'Leia a segunda frase do resumo: "The loss scales as a power-law..."',
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
                  texto: `<p>A equação (1.1) do paper diz como a perda <code>L</code> depende do número de parâmetros <code>N</code>. Ela está na seção 1.2, que resume as leis do paper:</p>
${trecho('kaplan-eq1-1', 'seção 1.2, equação (1.1)', 4, 'A equação (1.1): L(N) = (N_c / N) elevado a alfa_N, com alfa_N ≈ 0,076 e N_c ≈ 8,8 × 10^13 parâmetros sem os embeddings.')}
<p>Em português: <code>L(N) = (N<sub>c</sub> / N)<sup>α</sup></code>, onde o paper escreve <code>α<sub>N</sub></code> para lembrar que é o expoente do tamanho.</p>
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
                  confira: `<p>O paper faz a mesma conta na página 5, entre a quinta e a sexta linha:</p>
${trecho('kaplan-dobrar', 'seção 1.2', 5, 'Trecho do paper: dobrar o número de parâmetros dá uma perda menor por um fator 2 elevado a menos alfa_N, igual a 0,95.')}`,
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
<p>Com <code>x = log N</code> e <code>y = log L</code>, isso é <code>y = (α · log N<sub>c</sub>) − α · x</code>: a equação de uma reta.</p>
<p>É por isso que a Figura 1, a principal do paper, tem as duas escalas em logaritmo. No painel da direita (Parameters), os pontos de <code>L(N)</code> caem numa reta, e a legenda traz a própria equação (1.1):</p>
${trecho('kaplan-fig1', 'Figura 1', 3, 'A Figura 1 do paper: três gráficos log-log da perda no teste contra a computação, o tamanho dos dados e o número de parâmetros. Nos três, os pontos formam uma reta.')}`,
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
<p>O alvo é o painel da direita da Figura 1. O gráfico do seu código já vem pronto, com as duas escalas em logaritmo, para comparar com ele.</p>
${trecho('kaplan-fig1', 'Figura 1', 3, 'A Figura 1 do paper, com o painel da perda contra o número de parâmetros à direita.')}`,
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
                  certo: 'Os pontos parecem cair sobre a reta. O expoente é outro (perto de 1,1, não 0,076) porque a tarefa e o modelo são outros. O paper também mede expoentes diferentes para coisas diferentes: 0,076 para o tamanho e 0,095 para os dados.',
                },
                {
                  texto: `<p>Um ajuste de reta sempre devolve um número, mesmo quando os pontos fazem curva. Antes de acreditar no expoente, confira se a reta é mesmo uma reta.</p>
<p>Como cada tamanho é o dobro do anterior, dá para medir a inclinação entre cada par de vizinhos: quanto a perda cai, em escala log, quando o modelo dobra. Isso é a <strong>inclinação local</strong>:</p>
<p><code>−log(L<sub>2N</sub> / L<sub>N</sub>) / log 2</code></p>
<p>Numa lei de potência, todas as inclinações locais dão o mesmo número. Se elas encolhem pelo caminho, a curva está deitando, e um expoente só não descreve os dados.</p>`,
                  tarefa: 'Guarde em <code>locais</code> as 5 inclinações locais, uma para cada par de tamanhos vizinhos.',
                  inicio: EXPERIMENTO + MEDIR + `
p = np.array(perdas)
locais = []

print("inclinações locais:", np.round(locais, 2))
`,
                  dica: '<code>p[1:] / p[:-1]</code> divide cada perda pela anterior. Então <code>locais = -np.log(p[1:] / p[:-1]) / np.log(2)</code>.',
                  solucao: EXPERIMENTO + MEDIR + `
p = np.array(perdas)
locais = -np.log(p[1:] / p[:-1]) / np.log(2)

print("inclinações locais:", np.round(locais, 2))
`,
                  checagem: `
tem('locais')
v = np.asarray(locais, float)
if v.shape != (5,):
    falha('Devia haver 5 inclinações: uma para cada par de vizinhos entre os 6 tamanhos.')
if not perto(float(v[0]), float(-np.log(perdas[1] / perdas[0]) / np.log(2)), 1e-6):
    falha('A primeira inclinação devia comparar o tamanho 8 com o 4. Confira a conta.')
if not (v > 0.6).all():
    falha('Todas as inclinações deviam ser positivas e perto de 1. Confira o sinal.')
`,
                  certo: 'As inclinações oscilam em volta de 1,1, sem encolher: com dados de sobra, a reta é de verdade. Os papers de leis de escala fazem a mesma conferência. Na próxima lição, ela vai mostrar uma curva que deita.',
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
<p>O paper responde com outra equação, a (1.5), que junta o tamanho <code>N</code> e a quantidade de dados <code>D</code>:</p>
${trecho('kaplan-eq1-5', 'seção 1.2, equação (1.5)', 5, 'A equação (1.5): L(N, D) é a soma de (N_c / N) elevado a alfa_N sobre alfa_D com D_c / D, tudo elevado a alfa_D.')}
<p>Quando <code>N</code> cresce muito, o primeiro termo some e sobra <code>(D<sub>c</sub> / D)<sup>α<sub>D</sub></sup></code>: um <strong>piso</strong> que só depende dos dados. Aqui você vê esse piso com o experimento: o mesmo modelo, com só 100 exemplos de treino em vez de 3 000, e um tamanho a mais (256) para enxergar o fim da curva.</p>`,
                  tarefa: 'Guarde em <code>perdas_poucos</code> a perda de cada tamanho treinando só com os 100 primeiros exemplos. As perdas com todos os dados já estão em <code>perdas_muitos</code>.',
                  inicio: EXPERIMENTO + `${ABL_INICIO}perdas_poucos = []
${ABL_FIM}`,
                  dica: 'Os 100 primeiros exemplos são <code>X_treino[:100]</code> e <code>y_treino[:100]</code>. Use a mesma linha de <code>perdas_muitos</code>, trocando os dados.',
                  solucao: EXPERIMENTO + `${ABL_INICIO}perdas_poucos = [perda_media(N, X_treino[:100], y_treino[:100]) for N in Ns]
${ABL_FIM}`,
                  checagem: `
tem('perdas_poucos'); tem('perdas_muitos')
if len(perdas_poucos) != len(Ns):
    falha('Devia haver uma perda para cada tamanho: ' + str(len(Ns)) + ' ao todo.')
if not perdas_poucos[-1] > 2 * perdas_muitos[-1]:
    falha('Com 100 exemplos, o maior modelo devia ficar bem pior do que com 3000. Confira se usou [:100] em X e em y.')
if not perdas_poucos[-1] > 0.9 * perdas_poucos[-2]:
    falha('Com 100 exemplos, dobrar de 128 para 256 quase não devia ajudar. Confira se usou [:100] em X e em y.')
`,
                  certo: 'Com 3000 exemplos, as inclinações locais ficam perto de 1 e só começam a cair no último par, em 256: até 3000 exemplos têm limite. Com 100, elas encolhem até quase zero: a curva deita e encosta num piso, e dobrar o modelo deixa de ajudar. É o que a equação (1.5) prevê. Repare que um expoente só, ajustado na curva inteira, esconderia isso: ele daria um número no meio do caminho. Anos depois, Hoffmann et al. (2022), o paper do Chinchilla, refizeram as medidas de Kaplan com mais cuidado (o ponto principal foi ajustar o learning rate à duração de cada treino) e mudaram a conclusão de quanto dado usar para cada tamanho de modelo. Reproduzir também é o jeito de achar onde um paper erra.',
                  confira: `<p>Compare o seu gráfico com o da esquerda na Figura 9 do paper. Lá, cada cor é uma quantidade de dados: a amarela, com mais dados, é uma reta; as escuras, com poucos, deitam e encostam num piso.</p>
${trecho('kaplan-fig9', 'Figura 9', 11, 'A Figura 9 do paper. À esquerda, a perda contra o tamanho do modelo para várias quantidades de dados: com muitos dados é uma reta, com poucos a curva para de cair.')}`,
                },
              ],
            },
            {
              id: 'p1-pico',
              titulo: 'O que a regularização esconde',
              porque: 'Um bom experimento pequeno às vezes mostra algo que o paper não mostra. Aqui, a pergunta é sobre uma escolha do próprio código: por que o modelo usa reg=0.1?',
              passos: [
                {
                  texto: `<p>O <code>treinar</code> resolve os mínimos quadrados com uma regularização pequena, <code>reg=0.1</code>. O paper de Kaplan faz algo parecido de outro jeito. Está numa frase da seção 4.2, logo abaixo da Figura 9:</p>
${trecho('kaplan-early-stopping', 'seção 4.2', 11, 'Trecho do paper: todos os modelos são regularizados com 10% de dropout, e o treino para quando a perda no teste deixa de cair.')}
<p>Dropout de 10% e parar o treino quando a perda no teste deixa de cair (o <em>early stopping</em>): duas regularizações. Uma frase dessas passa fácil numa leitura, e o experimento abaixo mostra por que ela importa.</p>
<p>Para entender por que, tire a regularização e treine com só 100 exemplos, agora com muitos tamanhos perto de 100. Num modelo com exatamente 100 parâmetros que aprendem, há uma solução que passa por cada um dos 100 pontos de treino, e ela é a única.</p>`,
                  tarefa: 'Guarde em <code>pior_N</code> o tamanho de <code>Ns_finos</code> com a maior perda no teste.',
                  inicio: EXPERIMENTO + `${PICO_INICIO}
pior_N = 0
${PICO_FIM}`,
                  dica: '<code>np.argmax(perdas)</code> devolve a posição da maior perda. Então <code>pior_N = Ns_finos[np.argmax(perdas)]</code>.',
                  solucao: EXPERIMENTO + `${PICO_INICIO}
pior_N = Ns_finos[np.argmax(perdas)]
${PICO_FIM}`,
                  checagem: `
tem('pior_N')
if pior_N == 0:
    falha('pior_N ainda é 0. Procure o tamanho com a maior perda.')
if int(pior_N) != Ns_finos[int(np.argmax(perdas))]:
    falha('pior_N devia ser o tamanho com a maior perda, não a posição dele na lista.')
`,
                  certo: 'O pior modelo tem 100 neurônios, o mesmo número de exemplos de treino. Para passar exatamente por cada ponto, ele precisa de pesos enormes, e entre os pontos a função fica louca. Com menos neurônios, ele não consegue decorar; com mais, há muitas soluções e os mínimos quadrados escolhem a mais suave. A perda sobe e depois desce de novo: é a dupla descida (double descent), estudada por Belkin et al. (2019) e por Nakkiran et al. (2019) em redes profundas. A regularização e o early stopping apagam o pico. Sem eles, a reta log-log do paper não apareceria com poucos dados.',
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
