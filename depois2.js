// Depois da aula 2: exercícios simples para praticar o que a aula de makemore mostrou.
// Cada exercício é uma tarefa só: uma conta, uma escolha ou poucas linhas de código.

const ex = (id, titulo, passo) => ({ id, titulo, passos: [passo] })

export const DEPOIS_2 = {
  id: 'depois',
  titulo: 'Depois da aula',
  exercicios: true,
  modulos: [
    {
      titulo: 'Exercícios da aula 2',
      licoes: [
        ex('a2-contagem', 'De contagem a probabilidade', {
          texto: `<p>Depois da letra <code>a</code>, contamos: <code>n</code> 3 vezes e <code>l</code> 1 vez.</p>`,
          tarefa: 'Qual é a probabilidade de vir <code>n</code> depois de <code>a</code>?',
          campos: [{ rotulo: 'P(n) =', resposta: 0.75 }],
          erro: 'Divida a contagem de n pelo total.',
          dica: '3 ÷ (3 + 1).',
          solucao: '3 ÷ 4 = 0,75',
        }),
        ex('a2-linha', 'Normalizar uma linha', {
          texto: `<p>Uma linha da tabela de contagens: <code>[2, 6, 2]</code>. Dividindo pela soma, ela vira uma distribuição.</p>`,
          tarefa: 'Qual é a probabilidade do meio? E a soma das três?',
          campos: [{ rotulo: 'do meio =', resposta: 0.6 }, { rotulo: 'soma =', resposta: 1 }],
          erro: 'A soma da linha é 10.',
          dica: '6 ÷ 10. E uma distribuição sempre soma 1.',
          solucao: 'do meio: 6 ÷ 10 = 0,6\nsoma: 0,2 + 0,6 + 0,2 = 1',
        }),
        ex('a2-pares', 'Os pares de uma palavra', {
          texto: `<p>A aula marca o começo e o fim com um ponto e olha cada par de letras vizinhas.</p>`,
          tarefa: 'Quantos pares tem <code>.uva.</code>? E qual é o último par?',
          opcoes: [
            { t: '3 pares; o último é "va".', por: 'Faltou o par do fim: depois do a vem o ponto.' },
            { t: '4 pares; o último é "a.".', certa: true },
            { t: '5 pares; o último é ".".', por: 'Um par tem duas letras. .uva. tem 5 símbolos, e 4 pares.' },
          ],
          erro: 'Conte: .u, uv, va, a.',
          dica: 'Um texto de 5 símbolos tem 4 pares vizinhos.',
          solucao: '.u, uv, va, a.: 4 pares, e o último é "a.".',
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
        ex('a2-tabela', 'A tabela de contagens', {
          texto: `<p>Na aula, as contagens vão para uma tabela: a linha é a letra de agora, a coluna é a seguinte.</p>`,
          tarefa: 'Some 1 na tabela para cada par de <code>.ovo.</code>.',
          inicio: `import numpy as np\n\nposicao = {".": 0, "o": 1, "v": 2}\nN = np.zeros((3, 3))\n\nmarcada = ".ovo."\nfor i in range(len(marcada) - 1):\n    a = posicao[marcada[i]]\n    b = posicao[marcada[i + 1]]\n    # some 1 em N aqui\n\nprint(N)\n`,
          dica: '<code>N[a, b] += 1</code>.',
          solucao: `import numpy as np\n\nposicao = {".": 0, "o": 1, "v": 2}\nN = np.zeros((3, 3))\n\nmarcada = ".ovo."\nfor i in range(len(marcada) - 1):\n    a = posicao[marcada[i]]\n    b = posicao[marcada[i + 1]]\n    N[a, b] += 1\n\nprint(N)\n`,
          checagem: `
import numpy as _np
tem('N')
if not _np.array_equal(N, [[0, 1, 0], [1, 0, 1], [0, 1, 0]]):
    falha('A tabela devia ficar [[0, 1, 0], [1, 0, 1], [0, 1, 0]]. Use N[a, b] += 1.')
`,
        }),
        ex('a2-keepdims', 'Dividir cada linha', {
          texto: `<p>Para cada linha somar 1, divide-se pela soma da própria linha. Sem <code>keepdims=True</code>, a divisão sai pelas colunas, sem dar erro.</p>`,
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
        ex('a2-sortear', 'Sortear uma letra', {
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
        ex('a2-choices', 'Sortear em código', {
          texto: `<p><code>random.choices</code> sorteia usando pesos. Com a semente fixa, o resultado se repete.</p>`,
          tarefa: 'Sorteie 1.000 letras e guarde em <code>quantos_s</code> quantas vezes saiu <code>s</code>.',
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
        ex('a2-palavra', 'A probabilidade de uma palavra', {
          texto: `<p>A probabilidade de uma palavra é a multiplicação das probabilidades dos seus pares.</p>`,
          tarefa: 'Os pares de <code>.oi.</code> têm probabilidades 0,5, 0,2 e 0,5. Qual é a probabilidade da palavra?',
          campos: [{ rotulo: 'P(oi) =', resposta: 0.05 }],
          erro: 'Multiplique as três.',
          dica: '0,5 × 0,2 × 0,5.',
          solucao: '0,5 × 0,2 = 0,1\n0,1 × 0,5 = 0,05',
        }),
        ex('a2-menos-log', 'Menos o logaritmo', {
          texto: `<p>O erro de cada par é <code>−log(p)</code>. Alguns valores: <code>log(1) = 0</code>, <code>log(0,5) = −0,69</code>, <code>log(0,25) = −1,39</code>.</p>`,
          tarefa: 'Quanto vale o erro de um par com probabilidade 1? E com probabilidade 0,25?',
          campos: [{ rotulo: '−log(1) =', resposta: 0 }, { rotulo: '−log(0,25) =', resposta: 1.39 }],
          erro: 'Use a tabela e troque o sinal.',
          dica: 'log(0,25) = −1,39. Menos isso dá 1,39.',
          solucao: '−log(1) = 0\n−log(0,25) = 1,39',
        }),
        ex('a2-media', 'A perda média', {
          texto: `<p>A perda é a média dos erros de todos os pares.</p>`,
          tarefa: 'Os erros de quatro pares são 0,69, 0,69, 1,39 e 0. Qual é a perda?',
          campos: [{ rotulo: 'perda ≈', resposta: 0.6925, tol: 0.006 }],
          erro: 'Some os quatro e divida por 4.',
          dica: '0,69 + 0,69 + 1,39 + 0 = 2,77.',
          solucao: '2,77 ÷ 4 ≈ 0,69',
        }),
        ex('a2-perda-codigo', 'A perda em código', {
          texto: `<p>Em código, a perda é a média de <code>-np.log(p)</code> sobre as probabilidades dos pares.</p>`,
          tarefa: 'Guarde em <code>perda</code> a média de <code>-np.log</code> das probabilidades.',
          inicio: `import numpy as np\n\nprobabilidades = np.array([0.5, 0.25, 0.5, 1.0])\n\nperda = None\nprint(perda)\n`,
          dica: '<code>perda = np.mean(-np.log(probabilidades))</code>.',
          solucao: `import numpy as np\n\nprobabilidades = np.array([0.5, 0.25, 0.5, 1.0])\n\nperda = np.mean(-np.log(probabilidades))\nprint(perda)\n`,
          checagem: `
tem('perda')
if perda is None or not perto(float(perda), 0.6931471805599453):
    falha('perda devia ser a média de -np.log(probabilidades), perto de 0,693.')
`,
          certo: 'É a mesma conta do exercício anterior, agora sem arredondar: 0,693.',
        }),
        ex('a2-melhor', 'Qual modelo é melhor', {
          texto: `<p>Dois modelos medidos nas mesmas palavras: o A tem perda 2,5 e o B tem perda 2,1.</p>`,
          tarefa: 'Qual é melhor?',
          opcoes: [
            { t: 'O modelo A.', por: 'Perda maior significa probabilidades menores para as palavras de verdade.' },
            { t: 'O modelo B.', certa: true },
          ],
          erro: 'A perda funciona como um erro.',
          dica: 'Erro menor é melhor.',
          solucao: 'O B: a perda dele é menor.',
        }),
        ex('a2-suavizar', 'Suavizar', {
          texto: `<p>Um par que nunca apareceu tem probabilidade 0, e a perda vira infinito. A aula soma 1 a todas as contagens antes de dividir.</p>`,
          tarefa: 'As contagens depois de <code>o</code> são 3, 2, 1 e 0. Somando 1 a todas, qual é a probabilidade da última?',
          campos: [{ rotulo: 'P =', resposta: 0.1 }],
          erro: 'Com +1, as contagens viram 4, 3, 2 e 1.',
          dica: 'O novo total é 10.',
          solucao: '4 + 3 + 2 + 1 = 10\n1 ÷ 10 = 0,1',
        }),
        ex('a2-treino-teste', 'Separar treino e teste', {
          texto: `<p>Para saber se o modelo vale para palavras novas, uma parte das palavras fica de fora da contagem. <code>lista[:4]</code> pega as 4 primeiras, e <code>lista[4:]</code>, o resto.</p>`,
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
        ex('a2-trios', 'Contar trios', {
          texto: `<p>Olhando duas letras para trás: um trio são duas letras de contexto e a seguinte. <code>marcada[i:i + 3]</code> pega 3 letras a partir de <code>i</code>.</p>`,
          tarefa: 'Complete a linha que conta cada trio.',
          inicio: `trios = {}\n\nfor palavra in ["ana", "ano"]:\n    marcada = ".." + palavra + "."\n    for i in range(len(marcada) - 2):\n        trio = marcada[i:i + 3]\n        # conte o trio aqui\n\nprint(trios)\n`,
          dica: '<code>trios[trio] = trios.get(trio, 0) + 1</code>.',
          solucao: `trios = {}\n\nfor palavra in ["ana", "ano"]:\n    marcada = ".." + palavra + "."\n    for i in range(len(marcada) - 2):\n        trio = marcada[i:i + 3]\n        trios[trio] = trios.get(trio, 0) + 1\n\nprint(trios)\n`,
          checagem: `
tem('trios')
if trios != {'..a': 2, '.an': 2, 'ana': 1, 'na.': 1, 'ano': 1, 'no.': 1}:
    falha('Os trios deviam ser: ..a 2, .an 2, ana 1, na. 1, ano 1, no. 1.')
`,
        }),
      ],
    },
  ],
}
