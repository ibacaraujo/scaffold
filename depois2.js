// Depois da aula 2: exercícios para quem já assistiu à aula de makemore. A pessoa olha mais letras
// para trás, separa treino, validação e teste, compara suavizações, sorteia com temperatura e mede
// o modelo em bits. Tudo com uma lista própria de 50 palavras curtas.

const PALAVRAS = `palavras = "casa bola sapo gato pato lago mala rato vaca faca dado copo mesa rosa lua sol mar rio pao ovo uva noite tarde manha cama sala porta janela livro papel caneta escola amigo banana laranja tomate batata cenoura cebola alho pera melao abacaxi morango limao caju coco milho arroz feijao".split()`

// O modelo de pares, pronto, com a mesma separação dos exercícios anteriores.
const BASE = `import random
import numpy as np

${PALAVRAS}
random.seed(1)
random.shuffle(palavras)

letras = ".abcdefghijklmnopqrstuvwxyz"
posicao = {letra: i for i, letra in enumerate(letras)}

def pares(palavra):
    m = "." + palavra + "."
    return [(posicao[m[i]], posicao[m[i + 1]]) for i in range(len(m) - 1)]

def contar(palavras, k):
    N = np.full((27, 27), float(k))
    for p in palavras:
        for a, b in pares(p):
            N[a, b] += 1
    return N / N.sum(axis=1, keepdims=True)

def perda(P, palavras):
    erros = [-np.log(P[a, b]) for p in palavras for a, b in pares(p)]
    return float(np.mean(erros))
`

const TRES_GRUPOS = `
treino = palavras[:40]
validacao = palavras[40:45]
teste = palavras[45:]
`

const INVENTAR = `
def com_temperatura(p, T):
    q = p ** (1 / T)
    return q / q.sum()

def inventar(P, T):
    palavra = ""
    atual = 0
    while True:
        atual = random.choices(range(27), weights=com_temperatura(P[atual], T))[0]
        if atual == 0:
            return palavra
        palavra = palavra + letras[atual]
`

export const DEPOIS_2 = {
  id: 'depois',
  titulo: 'Depois da aula',
  modulos: [
    {
      titulo: 'Olhar mais longe',
      licoes: [
            {
              id: 'trigramas',
              titulo: 'Olhar duas letras para trás',
              porque: 'O modelo da aula olha só uma letra para decidir a próxima. O primeiro exercício proposto por Karpathy é olhar duas. Aqui você conta os trios de letras e descobre o preço de olhar mais longe.',
              passos: [
                {
                  texto: `<p>Um <strong>trio</strong> são duas letras de contexto e a letra seguinte. Para a palavra começar com contexto, marcamos o início com dois pontos: <code>"ana"</code> vira <code>"..ana."</code>.</p>
<p>Um pedaço de um texto se pega com dois-pontos dentro dos colchetes: <code>marcada[i:i + 3]</code> são as 3 letras a partir da posição <code>i</code>.</p>`,
                  tarefa: 'Complete a linha que conta cada trio.',
                  inicio: `palavras = ["ana", "ano"]\ntrios = {}\n\nfor palavra in palavras:\n    marcada = ".." + palavra + "."\n    for i in range(len(marcada) - 2):\n        trio = marcada[i:i + 3]\n        # conte o trio aqui\n\nprint(trios)\n`,
                  dica: 'Igual à contagem de pares: <code>trios[trio] = trios.get(trio, 0) + 1</code>.',
                  solucao: `palavras = ["ana", "ano"]\ntrios = {}\n\nfor palavra in palavras:\n    marcada = ".." + palavra + "."\n    for i in range(len(marcada) - 2):\n        trio = marcada[i:i + 3]\n        trios[trio] = trios.get(trio, 0) + 1\n\nprint(trios)\n`,
                  checagem: `
tem('trios')
if trios != {'..a': 2, '.an': 2, 'ana': 1, 'na.': 1, 'ano': 1, 'no.': 1}:
    falha('Os trios deviam ser: ..a 2, .an 2, ana 1, na. 1, ano 1, no. 1.')
`,
                },
                {
                  texto: `<p>Com 27 símbolos (as 26 letras e o ponto), existem 27 × 27 = 729 contextos de duas letras. Quantos deles aparecem de verdade numa lista de 50 palavras?</p>
<p><code>.split()</code> corta um texto nos espaços e devolve uma lista. <code>set</code> guarda cada coisa uma vez só, sem repetir, e <code>.add</code> coloca um item nele.</p>`,
                  tarefa: 'Dentro do <code>for</code>, guarde em <code>contextos</code> as duas letras de contexto de cada trio. Depois mostre quantos contextos diferentes apareceram.',
                  inicio: `palavras = "casa bola sapo gato pato lago mala rato vaca faca dado copo mesa rosa lua sol mar rio pao ovo uva noite tarde manha cama sala porta janela livro papel caneta escola amigo banana laranja tomate batata cenoura cebola alho pera melao abacaxi morango limao caju coco milho arroz feijao".split()\n\ncontextos = set()\nfor palavra in palavras:\n    marcada = ".." + palavra + "."\n    for i in range(len(marcada) - 2):\n        pass\n\nprint(len(contextos), "de", 27 * 27)\n`,
                  dica: 'Troque <code>pass</code> por <code>contextos.add(marcada[i:i + 2])</code>.',
                  solucao: `palavras = "casa bola sapo gato pato lago mala rato vaca faca dado copo mesa rosa lua sol mar rio pao ovo uva noite tarde manha cama sala porta janela livro papel caneta escola amigo banana laranja tomate batata cenoura cebola alho pera melao abacaxi morango limao caju coco milho arroz feijao".split()\n\ncontextos = set()\nfor palavra in palavras:\n    marcada = ".." + palavra + "."\n    for i in range(len(marcada) - 2):\n        contextos.add(marcada[i:i + 2])\n\nprint(len(contextos), "de", 27 * 27)\n`,
                  checagem: `
tem('contextos')
if len(contextos) != 109:
    falha('Deviam ser 109 contextos diferentes. Guarde as duas letras de contexto: marcada[i:i + 2].')
`,
                  certo: 'Só 109 dos 729 contextos apareceram. Em mais de 85% deles, o modelo de trios não tem nenhuma contagem.',
                },
                {
                  texto: `<p>Com pares, cada contexto é uma letra só, e quase todas aparecem nos dados. Com trios, a maioria dos contextos nunca apareceu.</p>`,
                  tarefa: 'Com poucos dados, o que acontece quando o modelo olha mais letras para trás?',
                  opcoes: [
                    { t: 'Fica sempre melhor, porque usa mais informação.', por: 'Mais informação ajuda só quando há dados para estimar cada contexto. Aqui, a maioria nunca apareceu.' },
                    { t: 'Muitos contextos nunca aparecem, e o modelo depende mais da suavização ou de mais dados.', certa: true },
                    { t: 'Nada muda: pares e trios dão a mesma perda.', por: 'Os dois modelos dão probabilidades diferentes, e por isso perdas diferentes.' },
                  ],
                  erro: 'Pense nos 620 contextos sem nenhuma contagem.',
                  dica: 'Um contexto sem contagem tem probabilidade zero para tudo, até ser suavizado.',
                  solucao: 'Muitos contextos ficam sem contagem. Esse é o problema que as redes neurais das próximas aulas resolvem: elas compartilham o que aprendem entre contextos parecidos.',
                },
              ],
            },
        {
          id: 'trios-modelo',
          titulo: 'Um modelo de trios inteiro',
          porque: 'O primeiro exercício que Karpathy propõe depois da aula é trocar os pares por trios e ver se a perda melhora. Aqui você faz o modelo completo e compara.',
          passos: [
            {
              texto: `<p>Para trios, a tabela ganha uma dimensão: <code>N[a, b, c]</code> conta quantas vezes <code>c</code> veio depois de <code>a</code> e <code>b</code>. São 27 × 27 × 27 casas.</p>
<p>Para virar probabilidades, cada contexto é dividido pela sua soma, agora ao longo do último eixo: <code>axis=2</code>.</p>`,
              tarefa: 'Complete a linha que soma 1 na tabela para cada trio.',
              inicio: `${BASE}
treino, teste = palavras[:40], palavras[40:]

def trios(palavra):
    m = ".." + palavra + "."
    return [(posicao[m[i]], posicao[m[i + 1]], posicao[m[i + 2]]) for i in range(len(m) - 2)]

def contar_trios(palavras, k):
    N = np.full((27, 27, 27), float(k))
    for p in palavras:
        for a, b, c in trios(p):
            pass  # some 1 em N[a, b, c]
    return N / N.sum(axis=2, keepdims=True)

def perda_trios(P, palavras):
    erros = [-np.log(P[a, b, c]) for p in palavras for a, b, c in trios(p)]
    return float(np.mean(erros))

P3 = contar_trios(treino, 0.1)
print("trios, treino:", perda_trios(P3, treino))
print("trios, teste:", perda_trios(P3, teste))
`,
              dica: 'Troque <code>pass</code> por <code>N[a, b, c] += 1</code>.',
              solucao: `${BASE}
treino, teste = palavras[:40], palavras[40:]

def trios(palavra):
    m = ".." + palavra + "."
    return [(posicao[m[i]], posicao[m[i + 1]], posicao[m[i + 2]]) for i in range(len(m) - 2)]

def contar_trios(palavras, k):
    N = np.full((27, 27, 27), float(k))
    for p in palavras:
        for a, b, c in trios(p):
            N[a, b, c] += 1
    return N / N.sum(axis=2, keepdims=True)

def perda_trios(P, palavras):
    erros = [-np.log(P[a, b, c]) for p in palavras for a, b, c in trios(p)]
    return float(np.mean(erros))

P3 = contar_trios(treino, 0.1)
print("trios, treino:", perda_trios(P3, treino))
print("trios, teste:", perda_trios(P3, teste))
`,
              checagem: `
tem('P3')
if not perto(perda_trios(P3, treino), 1.5537, 1e-3):
    falha('A perda no treino devia ficar perto de 1,55. Some 1 em N[a, b, c] para cada trio.')
`,
              certo: 'No treino, os trios vão muito bem: perda perto de 1,55, contra 1,89 dos pares com a mesma suavização.',
            },
            {
              texto: `<p>Agora a comparação que importa: nas palavras de fora. O código calcula a perda dos pares e a dos trios no teste, os dois com <code>k = 0,1</code>.</p>`,
              tarefa: 'Execute e guarde em <code>melhor</code> qual modelo foi melhor nas palavras de fora: <code>"pares"</code> ou <code>"trios"</code>.',
              inicio: `${BASE}
treino, teste = palavras[:40], palavras[40:]

def trios(palavra):
    m = ".." + palavra + "."
    return [(posicao[m[i]], posicao[m[i + 1]], posicao[m[i + 2]]) for i in range(len(m) - 2)]

def contar_trios(palavras, k):
    N = np.full((27, 27, 27), float(k))
    for p in palavras:
        for a, b, c in trios(p):
            N[a, b, c] += 1
    return N / N.sum(axis=2, keepdims=True)

def perda_trios(P, palavras):
    erros = [-np.log(P[a, b, c]) for p in palavras for a, b, c in trios(p)]
    return float(np.mean(erros))

print("pares, teste:", perda(contar(treino, 0.1), teste))
print("trios, teste:", perda_trios(contar_trios(treino, 0.1), teste))

melhor = ""
`,
              dica: 'O melhor modelo é o de perda menor nas palavras de fora.',
              solucao: `${BASE}
treino, teste = palavras[:40], palavras[40:]

def trios(palavra):
    m = ".." + palavra + "."
    return [(posicao[m[i]], posicao[m[i + 1]], posicao[m[i + 2]]) for i in range(len(m) - 2)]

def contar_trios(palavras, k):
    N = np.full((27, 27, 27), float(k))
    for p in palavras:
        for a, b, c in trios(p):
            N[a, b, c] += 1
    return N / N.sum(axis=2, keepdims=True)

def perda_trios(P, palavras):
    erros = [-np.log(P[a, b, c]) for p in palavras for a, b, c in trios(p)]
    return float(np.mean(erros))

print("pares, teste:", perda(contar(treino, 0.1), teste))
print("trios, teste:", perda_trios(contar_trios(treino, 0.1), teste))

melhor = "pares"
`,
              checagem: `
tem('melhor')
if melhor != 'pares':
    falha('Compare as duas perdas no teste: a menor indica o melhor modelo.')
`,
              certo: 'Os trios foram melhores no treino e piores no teste: 2,82 contra 2,18. Eles decoraram as 40 palavras em vez de aprender o que vale para palavras novas. Com 32 mil nomes, como na aula, o resultado se inverte.',
            },
          ],
        },
      ],
    },
    {
      titulo: 'Medir direito',
      licoes: [
            {
              id: 'treino-teste',
              titulo: 'Separar treino e teste',
              porque: 'Na aula, a perda é medida nas mesmas palavras que foram contadas. Karpathy propõe separar uma parte das palavras para testar o modelo. É a primeira regra de qualquer experimento em aprendizado de máquina.',
              passos: [
                {
                  texto: `<p>Um modelo de contagem conhece bem as palavras que contou. A pergunta que interessa é outra: ele funciona para palavras <strong>que nunca viu</strong>?</p>`,
                  tarefa: 'Por que medir a perda em palavras que ficaram de fora da contagem?',
                  opcoes: [
                    { t: 'Porque assim a perda fica menor.', por: 'Em palavras novas, a perda costuma ficar maior, não menor.' },
                    { t: 'Porque o modelo pode ter só decorado as palavras que contou. Palavras novas mostram se ele generaliza.', certa: true },
                    { t: 'Porque contar todas as palavras demora demais.', por: 'Contar é rápido. O motivo é medir de forma honesta.' },
                  ],
                  erro: 'Pense na diferença entre decorar e aprender.',
                  dica: 'Uma prova com as mesmas questões do exercício mede o quê?',
                  solucao: 'O teste com palavras novas mostra se o modelo generaliza, e não só se decorou.',
                },
                {
                  texto: `<p>Primeiro, embaralhar, para a separação não depender da ordem da lista. <code>random.shuffle</code> embaralha a lista no lugar, e a semente fixa o resultado.</p>
<p>Depois, cortar: <code>palavras[:40]</code> são as 40 primeiras, e <code>palavras[40:]</code> é o resto.</p>`,
                  tarefa: 'Separe as 40 primeiras palavras em <code>treino</code> e as outras em <code>teste</code>.',
                  inicio: `import random\n\npalavras = "casa bola sapo gato pato lago mala rato vaca faca dado copo mesa rosa lua sol mar rio pao ovo uva noite tarde manha cama sala porta janela livro papel caneta escola amigo banana laranja tomate batata cenoura cebola alho pera melao abacaxi morango limao caju coco milho arroz feijao".split()\n\nrandom.seed(1)\nrandom.shuffle(palavras)\n\ntreino = palavras\nteste = []\n\nprint(len(treino), len(teste))\nprint(teste)\n`,
                  dica: '<code>treino = palavras[:40]</code> e <code>teste = palavras[40:]</code>.',
                  solucao: `import random\n\npalavras = "casa bola sapo gato pato lago mala rato vaca faca dado copo mesa rosa lua sol mar rio pao ovo uva noite tarde manha cama sala porta janela livro papel caneta escola amigo banana laranja tomate batata cenoura cebola alho pera melao abacaxi morango limao caju coco milho arroz feijao".split()\n\nrandom.seed(1)\nrandom.shuffle(palavras)\n\ntreino = palavras[:40]\nteste = palavras[40:]\n\nprint(len(treino), len(teste))\nprint(teste)\n`,
                  checagem: `
tem('treino')
tem('teste')
if len(treino) != 40 or len(teste) != 10:
    falha('treino devia ter 40 palavras e teste, 10.')
if set(treino) & set(teste):
    falha('Uma palavra não pode estar no treino e no teste ao mesmo tempo.')
if teste != ['cama', 'melao', 'caneta', 'livro', 'escola', 'rato', 'mar', 'pato', 'batata', 'vaca']:
    falha('Use a semente 1 e corte depois de embaralhar.')
`,
                },
                {
                  texto: `<p>O código já traz duas funções. <code>contar(palavras, k)</code> monta a tabela de probabilidades dos pares, somando <code>k</code> a todas as contagens. <code>perda(P, palavras)</code> é a média de −log das probabilidades dos pares dessas palavras.</p>
<p>Execute com <code>k = 0</code>, sem suavizar: no treino a perda é um número comum, mas no teste dá <code>inf</code>, infinito. Alguma palavra do teste tem um par que nunca apareceu no treino.</p>`,
                  tarefa: 'Mude <code>k</code> para 1 e compare a perda no treino com a perda no teste.',
                  inicio: `import random\nimport numpy as np\n\npalavras = "casa bola sapo gato pato lago mala rato vaca faca dado copo mesa rosa lua sol mar rio pao ovo uva noite tarde manha cama sala porta janela livro papel caneta escola amigo banana laranja tomate batata cenoura cebola alho pera melao abacaxi morango limao caju coco milho arroz feijao".split()\nrandom.seed(1)\nrandom.shuffle(palavras)\ntreino, teste = palavras[:40], palavras[40:]\n\nletras = ".abcdefghijklmnopqrstuvwxyz"\nposicao = {letra: i for i, letra in enumerate(letras)}\n\ndef pares(palavra):\n    m = "." + palavra + "."\n    return [(posicao[m[i]], posicao[m[i + 1]]) for i in range(len(m) - 1)]\n\ndef contar(palavras, k):\n    N = np.full((27, 27), float(k))\n    for p in palavras:\n        for a, b in pares(p):\n            N[a, b] += 1\n    return N / N.sum(axis=1, keepdims=True)\n\ndef perda(P, palavras):\n    erros = [-np.log(P[a, b]) for p in palavras for a, b in pares(p)]\n    return float(np.mean(erros))\n\nk = 0\nP = contar(treino, k)\nperda_treino = perda(P, treino)\nperda_teste = perda(P, teste)\nprint("treino:", perda_treino)\nprint("teste:", perda_teste)\n`,
                  dica: 'Só uma linha muda: <code>k = 1</code>.',
                  solucao: `import random\nimport numpy as np\n\npalavras = "casa bola sapo gato pato lago mala rato vaca faca dado copo mesa rosa lua sol mar rio pao ovo uva noite tarde manha cama sala porta janela livro papel caneta escola amigo banana laranja tomate batata cenoura cebola alho pera melao abacaxi morango limao caju coco milho arroz feijao".split()\nrandom.seed(1)\nrandom.shuffle(palavras)\ntreino, teste = palavras[:40], palavras[40:]\n\nletras = ".abcdefghijklmnopqrstuvwxyz"\nposicao = {letra: i for i, letra in enumerate(letras)}\n\ndef pares(palavra):\n    m = "." + palavra + "."\n    return [(posicao[m[i]], posicao[m[i + 1]]) for i in range(len(m) - 1)]\n\ndef contar(palavras, k):\n    N = np.full((27, 27), float(k))\n    for p in palavras:\n        for a, b in pares(p):\n            N[a, b] += 1\n    return N / N.sum(axis=1, keepdims=True)\n\ndef perda(P, palavras):\n    erros = [-np.log(P[a, b]) for p in palavras for a, b in pares(p)]\n    return float(np.mean(erros))\n\nk = 1\nP = contar(treino, k)\nperda_treino = perda(P, treino)\nperda_teste = perda(P, teste)\nprint("treino:", perda_treino)\nprint("teste:", perda_teste)\n`,
                  checagem: `
import math
tem('perda_teste')
if not math.isfinite(perda_teste):
    falha('A perda no teste ainda é infinita. Suavize com k = 1.')
if k != 1:
    falha('Use k = 1 nesta etapa.')
if not perto(perda_teste, perda(contar(treino, 1), teste)):
    falha('Calcule perda_teste com as palavras do teste.')
`,
                  certo: 'Com k = 1, a perda no teste fica finita: perto de 2,49, contra 2,43 no treino. Agora, a perda no teste é a nota honesta do modelo.',
                },
              ],
            },
            {
              id: 'suavizacao',
              titulo: 'Escolher a suavização',
              porque: 'A aula soma 1 a todas as contagens, mas por que 1? Karpathy propõe medir qual suavização funciona melhor. Escolher um número assim, medindo, é o que se chama ajustar um hiperparâmetro.',
              passos: [
                {
                  texto: `<p>Vamos tentar vários valores de <code>k</code>, de 0,001 até 100, e medir a perda em palavras que ficaram de fora. O gráfico usa escala logarítmica no eixo de <code>k</code>.</p>
<p>Com <code>k</code> muito pequeno, pares nunca vistos ficam quase impossíveis. Com <code>k</code> muito grande, todas as letras ficam quase igualmente prováveis, e o modelo esquece o que contou.</p>`,
                  tarefa: 'Execute e olhe o gráfico. Depois, faça <code>melhor_k</code> ser o <code>k</code> com a menor perda.',
                  inicio: `import random\nimport numpy as np\nimport matplotlib.pyplot as plt\n\npalavras = "casa bola sapo gato pato lago mala rato vaca faca dado copo mesa rosa lua sol mar rio pao ovo uva noite tarde manha cama sala porta janela livro papel caneta escola amigo banana laranja tomate batata cenoura cebola alho pera melao abacaxi morango limao caju coco milho arroz feijao".split()\nrandom.seed(1)\nrandom.shuffle(palavras)\ntreino, teste = palavras[:40], palavras[40:]\n\nletras = ".abcdefghijklmnopqrstuvwxyz"\nposicao = {letra: i for i, letra in enumerate(letras)}\n\ndef pares(palavra):\n    m = "." + palavra + "."\n    return [(posicao[m[i]], posicao[m[i + 1]]) for i in range(len(m) - 1)]\n\ndef contar(palavras, k):\n    N = np.full((27, 27), float(k))\n    for p in palavras:\n        for a, b in pares(p):\n            N[a, b] += 1\n    return N / N.sum(axis=1, keepdims=True)\n\ndef perda(P, palavras):\n    erros = [-np.log(P[a, b]) for p in palavras for a, b in pares(p)]\n    return float(np.mean(erros))\n\nks = [0.001, 0.01, 0.1, 1, 10, 100]\nperdas = []\nfor k in ks:\n    perdas.append(perda(contar(treino, k), teste))\n\nplt.semilogx(ks, perdas, 'o-')\nplt.xlabel('k')\nplt.ylabel('perda nas palavras de fora')\n\nmelhor_k = None\nprint(melhor_k)\n`,
                  dica: 'Como no exercício do tamanho do passo: <code>ks[perdas.index(min(perdas))]</code>.',
                  solucao: `import random\nimport numpy as np\nimport matplotlib.pyplot as plt\n\npalavras = "casa bola sapo gato pato lago mala rato vaca faca dado copo mesa rosa lua sol mar rio pao ovo uva noite tarde manha cama sala porta janela livro papel caneta escola amigo banana laranja tomate batata cenoura cebola alho pera melao abacaxi morango limao caju coco milho arroz feijao".split()\nrandom.seed(1)\nrandom.shuffle(palavras)\ntreino, teste = palavras[:40], palavras[40:]\n\nletras = ".abcdefghijklmnopqrstuvwxyz"\nposicao = {letra: i for i, letra in enumerate(letras)}\n\ndef pares(palavra):\n    m = "." + palavra + "."\n    return [(posicao[m[i]], posicao[m[i + 1]]) for i in range(len(m) - 1)]\n\ndef contar(palavras, k):\n    N = np.full((27, 27), float(k))\n    for p in palavras:\n        for a, b in pares(p):\n            N[a, b] += 1\n    return N / N.sum(axis=1, keepdims=True)\n\ndef perda(P, palavras):\n    erros = [-np.log(P[a, b]) for p in palavras for a, b in pares(p)]\n    return float(np.mean(erros))\n\nks = [0.001, 0.01, 0.1, 1, 10, 100]\nperdas = []\nfor k in ks:\n    perdas.append(perda(contar(treino, k), teste))\n\nplt.semilogx(ks, perdas, 'o-')\nplt.xlabel('k')\nplt.ylabel('perda nas palavras de fora')\n\nmelhor_k = ks[perdas.index(min(perdas))]\nprint(melhor_k)\n`,
                  checagem: `
tem('melhor_k')
if melhor_k is None:
    falha('melhor_k ainda vale None. Escolha o k com a menor perda.')
if melhor_k != 0.1:
    falha('Esse não é o k com a menor perda. Olhe o ponto mais baixo do gráfico.')
`,
                  certo: 'O melhor k aqui é 0,1, menor que o 1 da aula. Com outra lista de palavras, o melhor k seria outro: por isso se mede em vez de chutar.',
                },
                {
                  texto: `<p>Um detalhe importante: o <code>k</code> foi escolhido olhando a perda nas palavras de fora. Então essas palavras ajudaram a construir o modelo, e a perda nelas deixou de ser uma nota honesta.</p>`,
                  tarefa: 'Como Karpathy sugere resolver isso?',
                  opcoes: [
                    { t: 'Não tem problema: é só usar a perda do teste mesmo.', por: 'Se o teste ajudou a escolher k, ele virou parte do treino.' },
                    { t: 'Separar três grupos: treino para contar, validação para escolher k, e teste só no fim, uma vez.', certa: true },
                    { t: 'Usar todas as palavras no treino e não testar.', por: 'Sem palavras de fora, não dá para saber se o modelo generaliza.' },
                  ],
                  erro: 'Pense em quantos grupos de palavras são necessários.',
                  dica: 'Um grupo para contar, um para escolher, um para a nota final.',
                  solucao: 'Treino, validação e teste. A validação escolhe k; o teste dá a nota final, sem ter participado de nenhuma escolha.',
                  certo: 'Na aula seguinte, Karpathy usa exatamente essa divisão em três, com 80%, 10% e 10% dos nomes.',
                },
              ],
            },
        {
          id: 'tres-grupos',
          titulo: 'Treino, validação e teste',
          porque: 'Karpathy propõe separar as palavras em três grupos: um para contar, um para escolher a suavização e um para a nota final. Aqui você faz o experimento inteiro, do jeito certo.',
          passos: [
            {
              texto: `<p>Das 50 palavras embaralhadas: as 40 primeiras para o <strong>treino</strong>, as 5 seguintes para a <strong>validação</strong> e as 5 últimas para o <strong>teste</strong>.</p>
<p><code>palavras[40:45]</code> pega da posição 40 até antes da 45.</p>`,
              tarefa: 'Crie <code>treino</code>, <code>validacao</code> e <code>teste</code>.',
              inicio: `${BASE}
treino = []
validacao = []
teste = []

print(len(treino), len(validacao), len(teste))
`,
              dica: '<code>palavras[:40]</code>, <code>palavras[40:45]</code> e <code>palavras[45:]</code>.',
              solucao: `${BASE}${TRES_GRUPOS}
print(len(treino), len(validacao), len(teste))
`,
              checagem: `
tem('treino'); tem('validacao'); tem('teste')
if (len(treino), len(validacao), len(teste)) != (40, 5, 5):
    falha('Os grupos deviam ter 40, 5 e 5 palavras.')
if treino + validacao + teste != palavras:
    falha('Corte as palavras em ordem: [:40], [40:45] e [45:].')
`,
            },
            {
              texto: `<p>Agora o experimento: para cada <code>k</code>, contar no treino e medir na <strong>validação</strong>. Escolhido o melhor <code>k</code>, medir <strong>uma vez</strong> no teste.</p>`,
              tarefa: 'Guarde em <code>melhor_k</code> o <code>k</code> de menor perda na validação, e em <code>perda_final</code> a perda no teste com esse <code>k</code>.',
              inicio: `${BASE}${TRES_GRUPOS}
ks = [0.001, 0.01, 0.1, 1, 10, 100]
perdas_validacao = [perda(contar(treino, k), validacao) for k in ks]
print(perdas_validacao)

melhor_k = None
perda_final = None
print(melhor_k, perda_final)
`,
              dica: '<code>melhor_k = ks[perdas_validacao.index(min(perdas_validacao))]</code> e <code>perda_final = perda(contar(treino, melhor_k), teste)</code>.',
              solucao: `${BASE}${TRES_GRUPOS}
ks = [0.001, 0.01, 0.1, 1, 10, 100]
perdas_validacao = [perda(contar(treino, k), validacao) for k in ks]
print(perdas_validacao)

melhor_k = ks[perdas_validacao.index(min(perdas_validacao))]
perda_final = perda(contar(treino, melhor_k), teste)
print(melhor_k, perda_final)
`,
              checagem: `
tem('melhor_k'); tem('perda_final')
if melhor_k != 0.1:
    falha('melhor_k devia ser o k de menor perda na validação.')
if perda_final is None or not perto(perda_final, perda(contar(treino, 0.1), teste)):
    falha('perda_final devia ser a perda no teste, com o melhor k.')
`,
              certo: 'Nota final: perto de 2,16. Esse número é honesto: o teste não participou de nenhuma escolha.',
            },
          ],
        },
        {
          id: 'interpolacao',
          titulo: 'Misturar dois modelos',
          porque: 'Somar k a tudo é a suavização mais simples. Uma ideia clássica funciona melhor: quando o par é raro, confiar mais em quão comum é a letra sozinha. Aqui você mistura os dois modelos e mede.',
          passos: [
            {
              texto: `<p>O modelo de <strong>letras sozinhas</strong> ignora o contexto: a probabilidade de cada letra é quantas vezes ela aparece como letra seguinte, dividido pelo total.</p>
<p>Na tabela de contagens <code>N</code>, somar cada coluna dá isso: <code>N.sum(axis=0)</code>.</p>`,
              tarefa: 'Guarde em <code>P1</code> as probabilidades das letras sozinhas.',
              inicio: `${BASE}${TRES_GRUPOS}
N = np.zeros((27, 27))
for p in treino:
    for a, b in pares(p):
        N[a, b] += 1

contagem_letras = N.sum(axis=0)
P1 = None
print(P1)
`,
              dica: '<code>P1 = contagem_letras / contagem_letras.sum()</code>.',
              solucao: `${BASE}${TRES_GRUPOS}
N = np.zeros((27, 27))
for p in treino:
    for a, b in pares(p):
        N[a, b] += 1

contagem_letras = N.sum(axis=0)
P1 = contagem_letras / contagem_letras.sum()
print(P1)
`,
              checagem: `
tem('P1')
if P1 is None or np.shape(P1) != (27,):
    falha('P1 devia ter 27 probabilidades, uma por letra.')
if not perto(float(np.sum(P1)), 1) or not perto(float(P1[1]), float(N.sum(axis=0)[1] / N.sum())):
    falha('Divida a contagem de cada letra pelo total.')
`,
            },
            {
              texto: `<p>A mistura: <code>P = λ · P2 + (1 − λ) · P1</code>, em que <code>P2</code> é o modelo de pares sem suavizar. Com <code>λ</code> perto de 1, confia mais no par; com <code>λ</code> menor, mais na letra sozinha.</p>
<p>Como <code>P1</code> nunca é 0 para uma letra que aparece, a mistura nunca dá probabilidade 0.</p>`,
              tarefa: 'Escolha <code>melhor_lambda</code> pela validação e calcule <code>perda_final</code> no teste.',
              inicio: `${BASE}${TRES_GRUPOS}
N = np.zeros((27, 27))
for p in treino:
    for a, b in pares(p):
        N[a, b] += 1
P1 = N.sum(axis=0) / N.sum()
somas = N.sum(axis=1, keepdims=True)
P2 = np.divide(N, somas, out=np.zeros_like(N), where=somas > 0)

lambdas = [0.5, 0.7, 0.8, 0.9, 0.95, 0.99]
perdas_validacao = [perda(l * P2 + (1 - l) * P1, validacao) for l in lambdas]
print(perdas_validacao)

melhor_lambda = None
perda_final = None
print(melhor_lambda, perda_final)
`,
              dica: 'Como no exercício anterior: o λ de menor perda na validação, e depois <code>perda(melhor_lambda * P2 + (1 - melhor_lambda) * P1, teste)</code>.',
              solucao: `${BASE}${TRES_GRUPOS}
N = np.zeros((27, 27))
for p in treino:
    for a, b in pares(p):
        N[a, b] += 1
P1 = N.sum(axis=0) / N.sum()
somas = N.sum(axis=1, keepdims=True)
P2 = np.divide(N, somas, out=np.zeros_like(N), where=somas > 0)

lambdas = [0.5, 0.7, 0.8, 0.9, 0.95, 0.99]
perdas_validacao = [perda(l * P2 + (1 - l) * P1, validacao) for l in lambdas]
print(perdas_validacao)

melhor_lambda = lambdas[perdas_validacao.index(min(perdas_validacao))]
perda_final = perda(melhor_lambda * P2 + (1 - melhor_lambda) * P1, teste)
print(melhor_lambda, perda_final)
`,
              checagem: `
tem('melhor_lambda'); tem('perda_final')
if melhor_lambda != 0.7:
    falha('melhor_lambda devia ser o λ de menor perda na validação.')
if perda_final is None or not perto(perda_final, perda(0.7 * P2 + 0.3 * P1, teste)):
    falha('perda_final devia ser a perda no teste, com o melhor λ.')
`,
              certo: 'No teste: 2,08 com a mistura, contra 2,16 somando k. Ideias assim, chamadas de interpolação, deram os melhores modelos de linguagem por décadas, antes das redes neurais.',
            },
          ],
        },
        {
          id: 'bits',
          titulo: 'A perda em bits',
          porque: 'A perda da aula tem um significado concreto: dividida por log(2), é quantos bits, em média, o modelo precisa para escrever cada letra. Um bom modelo de linguagem é um bom compressor.',
          passos: [
            {
              texto: `<p>Sem modelo nenhum, cada letra é uma escolha entre 27 símbolos iguais, e custa <code>log₂(27) ≈ 4,75</code> bits.</p>
<p>Com um modelo, letras previsíveis custam menos. A conta é <code>perda / log(2)</code>, porque a perda usa o logaritmo natural.</p>`,
              tarefa: 'Guarde em <code>bits_por_letra</code> a perda no teste convertida em bits.',
              inicio: `${BASE}
treino, teste = palavras[:40], palavras[40:]
P = contar(treino, 0.1)
perda_teste = perda(P, teste)

bits_por_letra = None
print(perda_teste, bits_por_letra, np.log2(27))
`,
              dica: '<code>bits_por_letra = perda_teste / np.log(2)</code>.',
              solucao: `${BASE}
treino, teste = palavras[:40], palavras[40:]
P = contar(treino, 0.1)
perda_teste = perda(P, teste)

bits_por_letra = perda_teste / np.log(2)
print(perda_teste, bits_por_letra, np.log2(27))
`,
              checagem: `
tem('bits_por_letra')
if bits_por_letra is None or not perto(bits_por_letra, perda_teste / np.log(2)):
    falha('Divida a perda por np.log(2).')
`,
              certo: 'Cerca de 3,15 bits por letra, contra 4,75 sem modelo: um terço a menos. Com 40 palavras de treino, só de saber qual letra costuma vir depois de qual.',
            },
          ],
        },
      ],
    },
    {
      titulo: 'Sortear',
      licoes: [
        {
          id: 'temperatura',
          titulo: 'Sortear com temperatura',
          porque: 'Os nomes da aula saem sorteando com as probabilidades exatas. Os modelos de hoje têm um controle a mais, a temperatura, que deixa o sorteio mais cauteloso ou mais ousado. Aqui você constrói esse controle.',
          passos: [
            {
              texto: `<p>Com temperatura <code>T</code>, cada probabilidade é elevada a <code>1/T</code> e a lista é normalizada de novo.</p>
<p>Com <code>T</code> menor que 1, as letras prováveis ficam ainda mais prováveis. Com <code>T</code> maior que 1, as probabilidades ficam mais parecidas entre si. Com <code>T = 1</code>, nada muda.</p>`,
              tarefa: 'Complete <code>com_temperatura</code>: eleve <code>p</code> a <code>1 / T</code> e divida pela soma.',
              inicio: `import numpy as np

def com_temperatura(p, T):
    pass  # eleve p a 1 / T e normalize

p = np.array([0.6, 0.3, 0.1])
for T in [0.5, 1, 2]:
    print(T, com_temperatura(p, T))
`,
              dica: '<code>q = p ** (1 / T)</code> e depois <code>return q / q.sum()</code>.',
              solucao: `import numpy as np

def com_temperatura(p, T):
    q = p ** (1 / T)
    return q / q.sum()

p = np.array([0.6, 0.3, 0.1])
for T in [0.5, 1, 2]:
    print(T, com_temperatura(p, T))
`,
              checagem: `
tem('com_temperatura')
p = np.array([0.6, 0.3, 0.1])
r = com_temperatura(p, 1)
if r is None:
    falha('com_temperatura ainda não devolve nada. Use return.')
if not np.allclose(r, p):
    falha('Com T = 1, as probabilidades deviam continuar iguais.')
if not np.allclose(com_temperatura(p, 0.5), [0.782608696, 0.195652174, 0.02173913]):
    falha('Com T = 0,5, eleve cada probabilidade a 2 e divida pela soma.')
`,
              certo: 'Com T = 0,5, o n vai de 0,6 para 0,78. Com T = 2, ele cai para 0,47, e o s sobe de 0,1 para 0,19.',
            },
            {
              texto: `<p>Agora, inventando palavras com o modelo de pares. A função <code>inventar</code> sorteia letra por letra, com a temperatura escolhida, até sair o ponto.</p>
<p><code>while True</code> repete para sempre; o <code>return</code> é que encerra, quando sai o ponto.</p>`,
              tarefa: 'Para T = 0,5 e T = 2, invente 200 palavras e guarde o tamanho médio em <code>tamanho_frio</code> e <code>tamanho_quente</code>.',
              inicio: `${BASE}${INVENTAR}
treino = palavras[:40]
P = contar(treino, 0.1)

random.seed(5)
frias = [inventar(P, 0.5) for _ in range(200)]
random.seed(5)
quentes = [inventar(P, 2) for _ in range(200)]
print(frias[:10])
print(quentes[:10])

tamanho_frio = None
tamanho_quente = None
print(tamanho_frio, tamanho_quente)
`,
              dica: 'O tamanho médio é a soma dos tamanhos dividida pela quantidade: <code>sum(len(p) for p in frias) / len(frias)</code>. Ou <code>np.mean([len(p) for p in frias])</code>.',
              solucao: `${BASE}${INVENTAR}
treino = palavras[:40]
P = contar(treino, 0.1)

random.seed(5)
frias = [inventar(P, 0.5) for _ in range(200)]
random.seed(5)
quentes = [inventar(P, 2) for _ in range(200)]
print(frias[:10])
print(quentes[:10])

tamanho_frio = np.mean([len(p) for p in frias])
tamanho_quente = np.mean([len(p) for p in quentes])
print(tamanho_frio, tamanho_quente)
`,
              checagem: `
tem('tamanho_frio'); tem('tamanho_quente')
if tamanho_frio is None or tamanho_quente is None:
    falha('Calcule os dois tamanhos médios.')
if not perto(float(tamanho_frio), float(np.mean([len(p) for p in frias]))) or not perto(float(tamanho_quente), float(np.mean([len(p) for p in quentes]))):
    falha('Calcule o tamanho médio de cada lista: frias e quentes.')
`,
              certo: 'Frias, as palavras ficam curtas: o ponto do fim já é muito provável e vira quase certo. Quentes, saem palavras enormes e estranhas, porque letras raras ganham chance. Nos modelos grandes, é o mesmo controle.',
            },
          ],
        },
        {
          id: 'inventa-repete',
          titulo: 'Inventa ou repete?',
          porque: 'Um modelo pode gerar coisas novas ou só repetir o que viu. Medir isso é uma pergunta séria nos modelos grandes. No seu modelo de pares, a conta cabe em poucas linhas.',
          passos: [
            {
              texto: `<p>Inventadas 200 palavras com temperatura 1, quantas delas já estavam no treino?</p>
<p><code>p in treino</code> é <code>True</code> quando <code>p</code> está na lista. Somar <code>True</code> conta como 1.</p>`,
              tarefa: 'Guarde em <code>copiadas</code> a fração das palavras inventadas que estão no treino.',
              inicio: `${BASE}${INVENTAR}
treino = palavras[:40]
P = contar(treino, 0.1)

random.seed(5)
inventadas = [inventar(P, 1) for _ in range(200)]
print(inventadas[:15])

copiadas = None
print(copiadas)
`,
              dica: '<code>copiadas = sum(p in treino for p in inventadas) / len(inventadas)</code>.',
              solucao: `${BASE}${INVENTAR}
treino = palavras[:40]
P = contar(treino, 0.1)

random.seed(5)
inventadas = [inventar(P, 1) for _ in range(200)]
print(inventadas[:15])

copiadas = sum(p in treino for p in inventadas) / len(inventadas)
print(copiadas)
`,
              checagem: `
tem('copiadas')
if copiadas is None or not perto(float(copiadas), sum(p in treino for p in inventadas) / len(inventadas)):
    falha('Divida o número de palavras inventadas que estão no treino por 200.')
`,
              certo: 'Só 1% saiu igual ao treino: o modelo de pares quase nunca copia, porque só lembra de uma letra. Tente com o modelo de trios: olhando mais longe, ele copia mais.',
            },
          ],
        },
      ],
    },
  ],
}
