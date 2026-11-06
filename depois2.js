// Depois da aula 2: exercícios para praticar o que a aula de makemore mostrou.
// Método: os objetivos da aula, na ordem do vídeo, viram blocos (contar, sortear, medir, a rede);
// em cada bloco os exercícios sobem de nível (reconhecer, calcular à mão, código, aplicar). Cada
// exercício é uma tarefa só, com exemplos próprios, e o último treina a rede de pares do zero.

const ex = (id, titulo, passo) => ({ id, titulo, passos: [passo] })

// Os dados do exercício final: 4 palavras com as letras ., a, n e o.
const DADOS_REDE = `import numpy as np

letras = [".", "a", "n", "o"]
posicao = {letra: i for i, letra in enumerate(letras)}

xs, ys = [], []
for palavra in ["ana", "ano", "nao", "ona"]:
    m = "." + palavra + "."
    for i in range(len(m) - 1):
        xs.append(posicao[m[i]])
        ys.append(posicao[m[i + 1]])
xs, ys = np.array(xs), np.array(ys)
n = len(xs)

X = np.zeros((n, 4))
X[np.arange(n), xs] = 1
Y = np.zeros((n, 4))
Y[np.arange(n), ys] = 1
`

export const DEPOIS_2 = {
  id: 'depois',
  titulo: 'Depois da aula',
  exercicios: true,
  modulos: [
    {
      titulo: 'Contar',
      licoes: [
        ex('a2-pares', 'Os pares de uma palavra', {
          texto: `<p>A aula marca o começo e o fim com um ponto e olha cada par de letras vizinhas.</p>`,
          tarefa: 'Quantos pares tem <code>.uva.</code>? E qual é o último?',
          opcoes: [
            { t: '3 pares; o último é "va".', por: 'Faltou o par do fim: depois do a vem o ponto.' },
            { t: '4 pares; o último é "a.".', certa: true },
            { t: '5 pares; o último é ".".', por: 'Um par tem dois símbolos. .uva. tem 5 símbolos e 4 pares.' },
          ],
          erro: 'Conte: .u, uv, va, a.',
          dica: 'Um texto de 5 símbolos tem 4 pares vizinhos.',
          solucao: '.u, uv, va, a.: 4 pares.',
        }),
        ex('a2-listar-pares', 'Listar os pares', {
          texto: `<p>Em código: marcar a palavra e pegar cada letra com a seguinte.</p>`,
          tarefa: 'Guarde em <code>pares</code> a lista de pares de <code>"sol"</code>, com os pontos nas pontas.',
          inicio: `marcada = "." + "sol" + "."\npares = []\n\nfor i in range(len(marcada) - 1):\n    pass\n\nprint(pares)\n`,
          dica: 'Troque <code>pass</code> por <code>pares.append(marcada[i] + marcada[i + 1])</code>.',
          solucao: `marcada = "." + "sol" + "."\npares = []\n\nfor i in range(len(marcada) - 1):\n    pares.append(marcada[i] + marcada[i + 1])\n\nprint(pares)\n`,
          checagem: `
tem('pares')
if pares != ['.s', 'so', 'ol', 'l.']:
    falha('A lista devia ser [".s", "so", "ol", "l."].')
`,
        }),
        ex('a2-contar-pares', 'Contar os pares', {
          texto: `<p>Um dicionário guarda quantas vezes cada par apareceu.</p>`,
          tarefa: 'Complete a linha que conta cada par.',
          inicio: `pares = {}\n\nfor palavra in ["ovo", "uva"]:\n    marcada = "." + palavra + "."\n    for i in range(len(marcada) - 1):\n        par = marcada[i] + marcada[i + 1]\n        # conte o par aqui\n\nprint(pares)\n`,
          dica: '<code>pares[par] = pares.get(par, 0) + 1</code>.',
          solucao: `pares = {}\n\nfor palavra in ["ovo", "uva"]:\n    marcada = "." + palavra + "."\n    for i in range(len(marcada) - 1):\n        par = marcada[i] + marcada[i + 1]\n        pares[par] = pares.get(par, 0) + 1\n\nprint(pares)\n`,
          checagem: `
tem('pares')
if pares != {'.o': 1, 'ov': 1, 'vo': 1, 'o.': 1, '.u': 1, 'uv': 1, 'va': 1, 'a.': 1}:
    falha('Cada um dos 8 pares devia aparecer uma vez.')
`,
        }),
        ex('a2-posicao', 'Uma posição para cada letra', {
          texto: `<p>Para usar uma tabela, cada letra ganha um número, e cada número volta a ser uma letra. Na aula, são o <code>stoi</code> e o <code>itos</code>.</p>`,
          tarefa: 'Monte <code>posicao</code> (letra para número) e <code>letra_de</code> (número para letra).',
          inicio: `letras = [".", "a", "o", "v"]\nposicao = {}\nletra_de = {}\n\nfor i, letra in enumerate(letras):\n    pass\n\nprint(posicao, letra_de)\n`,
          dica: 'Duas linhas no lugar do <code>pass</code>: <code>posicao[letra] = i</code> e <code>letra_de[i] = letra</code>.',
          solucao: `letras = [".", "a", "o", "v"]\nposicao = {}\nletra_de = {}\n\nfor i, letra in enumerate(letras):\n    posicao[letra] = i\n    letra_de[i] = letra\n\nprint(posicao, letra_de)\n`,
          checagem: `
tem('posicao'); tem('letra_de')
if posicao != {'.': 0, 'a': 1, 'o': 2, 'v': 3} or letra_de != {0: '.', 1: 'a', 2: 'o', 3: 'v'}:
    falha('posicao devia ir de letra para número, e letra_de, de número para letra.')
`,
        }),
        ex('a2-tabela', 'A tabela de contagens', {
          texto: `<p>Na tabela, a linha é a letra de agora e a coluna é a seguinte.</p>`,
          tarefa: 'Some 1 na tabela para cada par de <code>.ovo.</code>.',
          inicio: `import numpy as np\n\nposicao = {".": 0, "o": 1, "v": 2}\nN = np.zeros((3, 3))\n\nmarcada = ".ovo."\nfor i in range(len(marcada) - 1):\n    a = posicao[marcada[i]]\n    b = posicao[marcada[i + 1]]\n    # some 1 em N aqui\n\nprint(N)\n`,
          dica: '<code>N[a, b] += 1</code>.',
          solucao: `import numpy as np\n\nposicao = {".": 0, "o": 1, "v": 2}\nN = np.zeros((3, 3))\n\nmarcada = ".ovo."\nfor i in range(len(marcada) - 1):\n    a = posicao[marcada[i]]\n    b = posicao[marcada[i + 1]]\n    N[a, b] += 1\n\nprint(N)\n`,
          checagem: `
import numpy as _np
tem('N')
if not _np.array_equal(N, [[0, 1, 0], [1, 0, 1], [0, 1, 0]]):
    falha('A tabela devia ficar [[0, 1, 0], [1, 0, 1], [0, 1, 0]].')
`,
        }),
        ex('a2-contagem', 'De contagem a probabilidade', {
          texto: `<p>Depois da letra <code>a</code>, contamos: <code>n</code> 3 vezes e <code>l</code> 1 vez.</p>`,
          tarefa: 'Qual é a probabilidade de vir <code>n</code> depois de <code>a</code>?',
          campos: [{ rotulo: 'P(n) =', resposta: 0.75 }],
          erro: 'Divida a contagem de n pelo total.',
          dica: '3 ÷ 4.',
          solucao: '3 ÷ 4 = 0,75',
        }),
        ex('a2-linha', 'Normalizar uma linha', {
          texto: `<p>Uma linha de contagens: <code>[2, 6, 2]</code>. Dividindo pela soma, ela vira uma distribuição.</p>`,
          tarefa: 'Qual é a probabilidade do meio? E a soma das três?',
          campos: [{ rotulo: 'do meio =', resposta: 0.6 }, { rotulo: 'soma =', resposta: 1 }],
          erro: 'A soma da linha é 10.',
          dica: '6 ÷ 10. Uma distribuição sempre soma 1.',
          solucao: 'do meio: 0,6\nsoma: 1',
        }),
        ex('a2-formato', 'O formato da soma', {
          texto: `<p>Uma tabela <code>N</code> tem 27 linhas e 27 colunas. A aula soma cada linha com <code>keepdim=True</code>.</p>`,
          tarefa: 'Qual é o formato dessa soma?',
          opcoes: [
            { t: '(27,)', por: 'Esse é o formato sem keepdim: uma lista solta, que divide pelas colunas.' },
            { t: '(27, 1)', certa: true },
            { t: '(1, 27)', por: 'Esse seria a soma de cada coluna.' },
          ],
          erro: 'Um total por linha, guardado como coluna.',
          dica: '27 linhas, 1 coluna.',
          solucao: '(27, 1): uma coluna com um total por linha. Assim cada total divide a sua linha.',
        }),
        ex('a2-keepdims', 'Dividir cada linha', {
          texto: `<p>Sem <code>keepdims=True</code>, a divisão sai pelas colunas, sem dar erro.</p>`,
          tarefa: 'Conserte a divisão para cada linha de <code>P</code> somar 1.',
          inicio: `import numpy as np\n\nN = np.array([[1, 3], [2, 6]])\nP = N / N.sum(axis=1)\nprint(P.sum(axis=1))\n`,
          dica: '<code>P = N / N.sum(axis=1, keepdims=True)</code>.',
          solucao: `import numpy as np\n\nN = np.array([[1, 3], [2, 6]])\nP = N / N.sum(axis=1, keepdims=True)\nprint(P.sum(axis=1))\n`,
          checagem: `
import numpy as _np
tem('P')
if not _np.allclose(P.sum(axis=1), 1) or not _np.allclose(P[0], [0.25, 0.75]):
    falha('Cada linha devia somar 1. Use keepdims=True.')
`,
        }),
      ],
    },
    {
      titulo: 'Sortear',
      licoes: [
        ex('a2-faixa', 'Sortear uma letra', {
          texto: `<p>Com probabilidades <code>n</code> 0,7, <code>r</code> 0,2 e <code>s</code> 0,1, a faixa de 0 a 1 é dividida nessa ordem.</p>`,
          tarefa: 'Se o número sorteado for 0,85, qual letra sai?',
          opcoes: [
            { t: 'n', por: 'O pedaço de n vai de 0 a 0,7.' },
            { t: 'r', certa: true },
            { t: 's', por: 'O pedaço de s começa em 0,9.' },
          ],
          erro: 'Veja em qual pedaço o 0,85 cai.',
          dica: 'r vai de 0,7 a 0,9.',
          solucao: 'r: o pedaço de r vai de 0,7 até 0,9.',
        }),
        ex('a2-esperado', 'Quantas vezes sai', {
          texto: `<p>Sorteando muitas vezes, cada letra sai numa proporção perto da sua probabilidade.</p>`,
          tarefa: 'Com probabilidade 0,2, mais ou menos quantas vezes sai <code>r</code> em 500 sorteios?',
          campos: [{ rotulo: 'perto de', resposta: 100 }],
          erro: 'Multiplique os sorteios pela probabilidade.',
          dica: '500 × 0,2.',
          solucao: '500 × 0,2 = 100',
        }),
        ex('a2-choices', 'Sortear em código', {
          texto: `<p><code>random.choices</code> sorteia usando pesos.</p>`,
          tarefa: 'Guarde em <code>quantos_s</code> quantas vezes saiu <code>s</code> nos 1.000 sorteios.',
          inicio: `import random\n\nrandom.seed(2)\nsorteios = random.choices(["n", "r", "s"], weights=[0.7, 0.2, 0.1], k=1000)\n\nquantos_s = None\nprint(quantos_s)\n`,
          dica: '<code>quantos_s = sorteios.count("s")</code>.',
          solucao: `import random\n\nrandom.seed(2)\nsorteios = random.choices(["n", "r", "s"], weights=[0.7, 0.2, 0.1], k=1000)\n\nquantos_s = sorteios.count("s")\nprint(quantos_s)\n`,
          checagem: `
tem('quantos_s')
if quantos_s != sorteios.count('s'):
    falha('Conte quantas vezes s aparece em sorteios.')
`,
          certo: 'Perto de 100, como a probabilidade 0,1 prevê.',
        }),
        ex('a2-semente', 'A semente', {
          texto: `<p>A aula cria o gerador de números com uma semente fixa antes de sortear.</p>`,
          tarefa: 'Para que serve a semente?',
          opcoes: [
            { t: 'Para os sorteios saírem melhores.', por: 'A semente não muda a qualidade, só fixa a sequência.' },
            { t: 'Para repetir exatamente os mesmos sorteios toda vez.', certa: true },
            { t: 'Para sortear mais rápido.', por: 'A velocidade é a mesma.' },
          ],
          erro: 'O que muda entre duas execuções com a mesma semente?',
          dica: 'Mesma semente, mesmos números.',
          solucao: 'Para repetir os mesmos sorteios: assim todo mundo vê os mesmos nomes.',
        }),
        ex('a2-inventar', 'Inventar uma palavra', {
          texto: `<p>Começando no ponto, a aula sorteia a próxima letra com as probabilidades da letra atual, até sair o ponto de novo.</p>`,
          tarefa: 'Complete a linha do sorteio da próxima letra.',
          inicio: `import random\n\nletras = [".", "a", "n"]\nprobs = {\n    ".": [0.0, 0.6, 0.4],\n    "a": [0.5, 0.0, 0.5],\n    "n": [0.3, 0.7, 0.0],\n}\n\ndef inventar():\n    palavra = ""\n    atual = random.choices(letras, weights=probs["."])[0]\n    while atual != ".":\n        palavra = palavra + atual\n        atual = "."  # troque por um sorteio com probs[atual]\n    return palavra\n\nrandom.seed(3)\nfor _ in range(5):\n    print(inventar())\n`,
          dica: '<code>atual = random.choices(letras, weights=probs[atual])[0]</code>.',
          solucao: `import random\n\nletras = [".", "a", "n"]\nprobs = {\n    ".": [0.0, 0.6, 0.4],\n    "a": [0.5, 0.0, 0.5],\n    "n": [0.3, 0.7, 0.0],\n}\n\ndef inventar():\n    palavra = ""\n    atual = random.choices(letras, weights=probs["."])[0]\n    while atual != ".":\n        palavra = palavra + atual\n        atual = random.choices(letras, weights=probs[atual])[0]\n    return palavra\n\nrandom.seed(3)\nfor _ in range(5):\n    print(inventar())\n`,
          checagem: `
tem('inventar')
import random as _r
_r.seed(9)
feitas = [inventar() for _ in range(40)]
if all(len(p) <= 1 for p in feitas):
    falha('As palavras estão saindo com uma letra só. Sorteie a próxima letra dentro do while.')
for p in feitas:
    if 'aa' in p or 'nn' in p:
        falha('Saiu um par com probabilidade zero. Use os pesos da letra atual, probs[atual].')
`,
        }),
      ],
    },
    {
      titulo: 'Medir',
      licoes: [
        ex('a2-palavra', 'A probabilidade de uma palavra', {
          texto: `<p>A probabilidade de uma palavra é a multiplicação das probabilidades dos seus pares.</p>`,
          tarefa: 'Os pares de <code>.oi.</code> têm probabilidades 0,5, 0,2 e 0,5. Qual é a probabilidade da palavra?',
          campos: [{ rotulo: 'P(oi) =', resposta: 0.05 }],
          erro: 'Multiplique as três.',
          dica: '0,5 × 0,2 × 0,5.',
          solucao: '0,5 × 0,2 × 0,5 = 0,05',
        }),
        ex('a2-por-que-log', 'Por que o logaritmo', {
          texto: `<p>Uma palavra de 10 pares, cada um com probabilidade 0,1, tem probabilidade 0,0000000001.</p>`,
          tarefa: 'Por que a aula usa o logaritmo das probabilidades?',
          opcoes: [
            { t: 'Para os números ficarem maiores que 1.', por: 'Os logaritmos de probabilidades são negativos.' },
            { t: 'Porque transforma a multiplicação de números minúsculos numa soma de números comuns.', certa: true },
            { t: 'Porque é mais bonito.', por: 'É uma questão prática: os produtos ficam pequenos demais.' },
          ],
          erro: 'Pense no que acontece ao multiplicar muitos números pequenos.',
          dica: 'log(a × b) = log(a) + log(b).',
          solucao: 'O log troca o produto minúsculo por uma soma de números de tamanho comum.',
        }),
        ex('a2-log-soma', 'Log de um produto', {
          texto: `<p>O logaritmo de uma multiplicação é a soma dos logaritmos. Alguns valores: <code>log(0,5) = −0,69</code> e <code>log(0,2) = −1,61</code>.</p>`,
          tarefa: 'Quanto vale <code>log(0,5 × 0,2)</code>?',
          campos: [{ rotulo: 'log(0,1) =', resposta: -2.3 }],
          erro: 'Some os dois logaritmos.',
          dica: '−0,69 + (−1,61).',
          solucao: '−0,69 − 1,61 = −2,30',
        }),
        ex('a2-menos-log', 'Menos o logaritmo', {
          texto: `<p>O erro de cada par é <code>−log(p)</code>. Alguns valores: <code>log(1) = 0</code> e <code>log(0,25) = −1,39</code>.</p>`,
          tarefa: 'Quanto vale o erro de um par com probabilidade 1? E com 0,25?',
          campos: [{ rotulo: '−log(1) =', resposta: 0 }, { rotulo: '−log(0,25) =', resposta: 1.39 }],
          erro: 'Use os valores e troque o sinal.',
          dica: 'Menos −1,39 dá 1,39.',
          solucao: '−log(1) = 0\n−log(0,25) = 1,39',
        }),
        ex('a2-media', 'A perda média', {
          texto: `<p>A perda é a média dos erros de todos os pares.</p>`,
          tarefa: 'Os erros de quatro pares são 0,69, 0,69, 1,39 e 0. Qual é a perda?',
          campos: [{ rotulo: 'perda ≈', resposta: 0.6925, tol: 0.006 }],
          erro: 'Some os quatro e divida por 4.',
          dica: 'A soma dá 2,77.',
          solucao: '2,77 ÷ 4 ≈ 0,69',
        }),
        ex('a2-perda-codigo', 'A perda em código', {
          texto: `<p>Em código, a perda é a média de <code>-np.log(p)</code>.</p>`,
          tarefa: 'Guarde em <code>perda</code> a média de <code>-np.log</code> das probabilidades.',
          inicio: `import numpy as np\n\nprobabilidades = np.array([0.5, 0.25, 0.5, 1.0])\n\nperda = None\nprint(perda)\n`,
          dica: '<code>perda = np.mean(-np.log(probabilidades))</code>.',
          solucao: `import numpy as np\n\nprobabilidades = np.array([0.5, 0.25, 0.5, 1.0])\n\nperda = np.mean(-np.log(probabilidades))\nprint(perda)\n`,
          checagem: `
tem('perda')
if perda is None or not perto(float(perda), 0.6931471805599453):
    falha('perda devia ser a média de -np.log(probabilidades), perto de 0,693.')
`,
          certo: 'A mesma conta do exercício anterior, sem arredondar.',
        }),
        ex('a2-melhor', 'Qual modelo é melhor', {
          texto: `<p>Dois modelos nas mesmas palavras: o A tem perda 2,5 e o B tem perda 2,1.</p>`,
          tarefa: 'Qual é melhor?',
          opcoes: [
            { t: 'O A.', por: 'Perda maior quer dizer probabilidades menores para as palavras de verdade.' },
            { t: 'O B.', certa: true },
          ],
          erro: 'A perda funciona como um erro.',
          dica: 'Erro menor é melhor.',
          solucao: 'O B: a perda dele é menor.',
        }),
        ex('a2-infinito', 'Perda infinita', {
          texto: `<p>Um modelo de contagem foi medido numa palavra nova, e a perda deu infinito.</p>`,
          tarefa: 'O que aconteceu?',
          opcoes: [
            { t: 'A palavra era longa demais.', por: 'Tamanho não leva ao infinito: a média é finita.' },
            { t: 'A palavra tem um par que nunca apareceu na contagem, com probabilidade 0.', certa: true },
            { t: 'O computador errou a conta.', por: 'A conta está certa: −log(0) é infinito mesmo.' },
          ],
          erro: 'Quanto vale −log(0)?',
          dica: 'Um único par com probabilidade 0 basta.',
          solucao: 'Um par com probabilidade 0: −log(0) é infinito.',
        }),
        ex('a2-suavizar', 'Suavizar', {
          texto: `<p>A aula soma 1 a todas as contagens antes de dividir, e nenhum par fica com probabilidade 0.</p>`,
          tarefa: 'As contagens depois de <code>o</code> são 3, 2, 1 e 0. Somando 1 a todas, qual é a probabilidade da última?',
          campos: [{ rotulo: 'P =', resposta: 0.1 }],
          erro: 'Com +1, as contagens viram 4, 3, 2 e 1.',
          dica: 'O novo total é 10.',
          solucao: '4 + 3 + 2 + 1 = 10\n1 ÷ 10 = 0,1',
        }),
        ex('a2-suavizar-muito', 'Suavizar demais', {
          texto: `<p>Em vez de 1, alguém soma 1.000 a todas as contagens.</p>`,
          tarefa: 'O que acontece com as probabilidades?',
          opcoes: [
            { t: 'Ficam quase todas iguais, e o modelo esquece o que contou.', certa: true },
            { t: 'Ficam iguais às de antes.', por: 'Com 1.000 somado a tudo, as contagens de verdade quase não pesam.' },
            { t: 'A letra mais comum fica ainda mais provável.', por: 'Somar o mesmo a tudo aproxima as contagens.' },
          ],
          erro: 'Compare 3 + 1000 com 0 + 1000.',
          dica: '1003 e 1000 são quase iguais.',
          solucao: 'Ficam quase iguais: o modelo vira um sorteio uniforme.',
        }),
        ex('a2-treino-teste', 'Separar treino e teste', {
          texto: `<p>Para saber se o modelo vale para palavras novas, uma parte fica de fora da contagem. <code>lista[:4]</code> pega as 4 primeiras, e <code>lista[4:]</code>, o resto.</p>`,
          tarefa: 'Separe as 4 primeiras palavras em <code>treino</code> e o resto em <code>teste</code>.',
          inicio: `palavras = ["casa", "bola", "sapo", "gato", "pato"]\n\ntreino = []\nteste = []\n\nprint(treino, teste)\n`,
          dica: '<code>treino = palavras[:4]</code> e <code>teste = palavras[4:]</code>.',
          solucao: `palavras = ["casa", "bola", "sapo", "gato", "pato"]\n\ntreino = palavras[:4]\nteste = palavras[4:]\n\nprint(treino, teste)\n`,
          checagem: `
tem('treino'); tem('teste')
if treino != ['casa', 'bola', 'sapo', 'gato'] or teste != ['pato']:
    falha('treino devia ter as 4 primeiras palavras, e teste, a última.')
`,
        }),
      ],
    },
    {
      titulo: 'A rede',
      licoes: [
        ex('a2-par-exemplo', 'Pares viram exemplos', {
          texto: `<p>Para a rede, cada par vira um exemplo: a letra de agora é a entrada <code>x</code>, e a seguinte é a resposta certa <code>y</code>, as duas como números.</p>`,
          tarefa: 'Com posições <code>.</code> 0, <code>o</code> 1 e <code>v</code> 2, guarde em <code>xs</code> as entradas e em <code>ys</code> as respostas de <code>.ovo.</code>.',
          inicio: `posicao = {".": 0, "o": 1, "v": 2}\nmarcada = ".ovo."\nxs, ys = [], []\n\nfor i in range(len(marcada) - 1):\n    pass\n\nprint(xs, ys)\n`,
          dica: '<code>xs.append(posicao[marcada[i]])</code> e <code>ys.append(posicao[marcada[i + 1]])</code>.',
          solucao: `posicao = {".": 0, "o": 1, "v": 2}\nmarcada = ".ovo."\nxs, ys = [], []\n\nfor i in range(len(marcada) - 1):\n    xs.append(posicao[marcada[i]])\n    ys.append(posicao[marcada[i + 1]])\n\nprint(xs, ys)\n`,
          checagem: `
tem('xs'); tem('ys')
if xs != [0, 1, 2, 1] or ys != [1, 2, 1, 0]:
    falha('xs devia ser [0, 1, 2, 1] e ys, [1, 2, 1, 0].')
`,
        }),
        ex('a2-one-hot', 'One-hot', {
          texto: `<p>A rede não recebe o número da letra direto: recebe um vetor de zeros, com um 1 na posição da letra. Isso se chama <strong>one-hot</strong>.</p>`,
          tarefa: 'Com 5 símbolos, qual é o one-hot da letra de posição 3?',
          opcoes: [
            { t: '[0, 0, 3, 0, 0]', por: 'O one-hot só tem 0 e 1.' },
            { t: '[0, 0, 0, 1, 0]', certa: true },
            { t: '[0, 0, 1, 0, 0]', por: 'Esse é o da posição 2: a contagem começa do zero.' },
          ],
          erro: 'Conte as posições a partir do zero.',
          dica: 'Posições 0, 1, 2, 3, 4.',
          solucao: '[0, 0, 0, 1, 0]: o 1 fica na posição 3.',
        }),
        ex('a2-one-hot-codigo', 'One-hot em código', {
          texto: `<p>Em código: um vetor de zeros, e um 1 na posição certa.</p>`,
          tarefa: 'Faça <code>v</code> ser o one-hot da posição 2 entre 4 símbolos.',
          inicio: `import numpy as np\n\nv = np.zeros(4)\n\nprint(v)\n`,
          dica: '<code>v[2] = 1</code>.',
          solucao: `import numpy as np\n\nv = np.zeros(4)\nv[2] = 1\n\nprint(v)\n`,
          checagem: `
import numpy as _np
tem('v')
if not _np.array_equal(v, [0, 0, 1, 0]):
    falha('v devia ser [0, 0, 1, 0].')
`,
        }),
        ex('a2-linha-de-w', 'One-hot vezes a matriz', {
          texto: `<p>A rede multiplica o one-hot pela matriz de pesos <code>W</code>: cada número do resultado soma a entrada vezes o peso, linha por linha.</p>
<p><code>x = [0, 1, 0]</code> e <code>W = [[1, 2], [3, 4], [5, 6]]</code>.</p>`,
          tarefa: 'Quanto dá <code>x @ W</code>?',
          campos: [{ rotulo: 'primeiro =', resposta: 3 }, { rotulo: 'segundo =', resposta: 4 }],
          erro: 'Só a linha do meio de W fica, porque as outras são multiplicadas por 0.',
          dica: '0 · 1 + 1 · 3 + 0 · 5.',
          solucao: '[3, 4]: exatamente a linha 1 de W.',
          certo: 'O one-hot vezes W escolhe uma linha de W. Por isso a rede da aula é parente da tabela de contagens: cada letra tem a sua linha.',
        }),
        ex('a2-logits', 'Os logits em código', {
          texto: `<p>O resultado de <code>x @ W</code> são os <strong>logits</strong>: números soltos, um para cada letra seguinte.</p>`,
          tarefa: 'Guarde em <code>logits</code> o one-hot <code>x</code> vezes <code>W</code>, e confira que é a linha 2 de <code>W</code>.',
          inicio: `import numpy as np\n\nW = np.array([[0.1, 0.5], [0.3, -0.2], [1.0, 2.0]])\nx = np.array([0, 0, 1])\n\nlogits = None\nprint(logits, W[2])\n`,
          dica: '<code>logits = x @ W</code>.',
          solucao: `import numpy as np\n\nW = np.array([[0.1, 0.5], [0.3, -0.2], [1.0, 2.0]])\nx = np.array([0, 0, 1])\n\nlogits = x @ W\nprint(logits, W[2])\n`,
          checagem: `
import numpy as _np
tem('logits')
if logits is None or not _np.allclose(logits, [1.0, 2.0]):
    falha('logits devia ser x @ W, igual à linha 2 de W: [1, 2].')
`,
        }),
        ex('a2-softmax-mao', 'De logits a probabilidades', {
          texto: `<p>Os logits viram contagens com a exponencial, e as contagens viram probabilidades divididas pela soma. As duas contas juntas se chamam <strong>softmax</strong>.</p>`,
          tarefa: 'A exponencial de dois logits deu 1 e 3. Qual é a probabilidade do segundo?',
          campos: [{ rotulo: 'P =', resposta: 0.75 }],
          erro: 'Divida pela soma.',
          dica: '3 ÷ (1 + 3).',
          solucao: '3 ÷ 4 = 0,75',
        }),
        ex('a2-softmax', 'Softmax em código', {
          texto: `<p><code>np.exp</code> faz a exponencial de cada número.</p>`,
          tarefa: 'Complete <code>softmax</code>: exponencial e depois divisão pela soma.',
          inicio: `import numpy as np\n\ndef softmax(logits):\n    pass\n\nprint(softmax(np.array([0.0, np.log(3)])))\n`,
          dica: '<code>contagens = np.exp(logits)</code> e <code>return contagens / contagens.sum()</code>.',
          solucao: `import numpy as np\n\ndef softmax(logits):\n    contagens = np.exp(logits)\n    return contagens / contagens.sum()\n\nprint(softmax(np.array([0.0, np.log(3)])))\n`,
          checagem: `
import numpy as _np
tem('softmax')
r = softmax(_np.array([0.0, _np.log(3)]))
if r is None:
    falha('softmax ainda não devolve nada. Use return.')
if not _np.allclose(r, [0.25, 0.75]):
    falha('Faça a exponencial e divida pela soma.')
`,
        }),
        ex('a2-escolher-probs', 'A probabilidade da resposta certa', {
          texto: `<p>Com uma linha de probabilidades por exemplo, a perda usa só a da resposta certa. <code>P[np.arange(n), ys]</code> pega, na linha <code>i</code>, a coluna <code>ys[i]</code>.</p>`,
          tarefa: 'Guarde em <code>perda</code> a média de <code>-np.log</code> das probabilidades das respostas certas.',
          inicio: `import numpy as np\n\nP = np.array([[0.5, 0.5, 0.0], [0.1, 0.1, 0.8], [0.25, 0.5, 0.25]])\nys = np.array([1, 2, 0])\nn = len(ys)\n\ncertas = P[np.arange(n), ys]\nperda = None\nprint(certas, perda)\n`,
          dica: '<code>perda = np.mean(-np.log(certas))</code>.',
          solucao: `import numpy as np\n\nP = np.array([[0.5, 0.5, 0.0], [0.1, 0.1, 0.8], [0.25, 0.5, 0.25]])\nys = np.array([1, 2, 0])\nn = len(ys)\n\ncertas = P[np.arange(n), ys]\nperda = np.mean(-np.log(certas))\nprint(certas, perda)\n`,
          checagem: `
import numpy as _np
tem('perda')
if perda is None or not perto(float(perda), float(_np.mean(-_np.log([0.5, 0.8, 0.25])))):
    falha('A perda devia ser a média de -log de [0.5, 0.8, 0.25].')
`,
        }),
        ex('a2-regularizar', 'Puxar os pesos para zero', {
          texto: `<p>A aula soma à perda um pedaço extra: a média de <code>W²</code>. Isso puxa os pesos para perto de zero.</p>`,
          tarefa: 'Com todos os pesos em zero, os logits são iguais. O que isso lembra?',
          opcoes: [
            { t: 'A suavização: as probabilidades ficam mais parecidas entre si.', certa: true },
            { t: 'A semente do sorteio.', por: 'A semente fixa os sorteios. Aqui o efeito é nas probabilidades.' },
            { t: 'O one-hot.', por: 'O one-hot é a entrada. Aqui o efeito é na saída.' },
          ],
          erro: 'Logits iguais dão probabilidades iguais.',
          dica: 'Somar muito às contagens também deixa tudo igual.',
          solucao: 'A suavização: os dois puxam as probabilidades para ficarem iguais.',
        }),
        ex('a2-final', 'Treinar a rede de pares', {
          texto: `<p>Juntando tudo: os exemplos já viraram one-hot em <code>X</code>, e as respostas, em <code>Y</code>. A cada passo, a rede calcula as probabilidades, a perda e o gradiente de <code>W</code>.</p>
<p>Com <code>W</code> zerada, todas as letras são igualmente prováveis, e a perda é <code>log(4) ≈ 1,39</code>.</p>`,
          tarefa: 'Dentro do <code>for</code>, mova <code>W</code> contra o gradiente.',
          inicio: `${DADOS_REDE}
W = np.zeros((4, 4))
taxa = 1.0

for passo in range(200):
    contagens = np.exp(X @ W)
    P = contagens / contagens.sum(axis=1, keepdims=True)
    perda = np.mean(-np.log(P[np.arange(n), ys]))
    grad = X.T @ (P - Y) / n
    # mova W contra o gradiente

print(perda)
`,
          dica: '<code>W = W - taxa * grad</code>, com o mesmo recuo do <code>grad</code>.',
          solucao: `${DADOS_REDE}
W = np.zeros((4, 4))
taxa = 1.0

for passo in range(200):
    contagens = np.exp(X @ W)
    P = contagens / contagens.sum(axis=1, keepdims=True)
    perda = np.mean(-np.log(P[np.arange(n), ys]))
    grad = X.T @ (P - Y) / n
    W = W - taxa * grad

print(perda)
`,
          checagem: `
tem('perda')
if not perda < 0.9:
    falha('A perda devia cair de 1,39 para menos de 0,9. Atualize W com W = W - taxa * grad.')
`,
          certo: 'A perda caiu de 1,39 para cerca de 0,87, perto dos 0,85 da tabela de contagens: a rede aprendeu, por gradiente, o mesmo que a contagem. É a conclusão da aula.',
        }),
      ],
    },
  ],
}
