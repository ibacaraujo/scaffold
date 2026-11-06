// Depois da aula 1: exercícios para quem já assistiu à aula do micrograd. A pessoa monta, aos poucos,
// um autograd próprio (a classe No), confere se ele está certo e treina com ele. O código não é o do
// vídeo: é escrito do zero, com nomes em português.

// Pedaços da classe No. Cada exercício parte do que os anteriores construíram.
const NO_INICIO = `import math

class No:
    def __init__(self, valor, filhos=()):
        self.valor = valor
        self.grad = 0
        self.filhos = filhos
        self.volta = lambda: None

    def __add__(self, outro):
        outro = outro if isinstance(outro, No) else No(outro)
        saida = No(self.valor + outro.valor, (self, outro))
        def volta():
            self.grad += saida.grad
            outro.grad += saida.grad
        saida.volta = volta
        return saida

    def __mul__(self, outro):
        outro = outro if isinstance(outro, No) else No(outro)
        saida = No(self.valor * outro.valor, (self, outro))
        def volta():
            self.grad += outro.valor * saida.grad
            outro.grad += self.valor * saida.grad
        saida.volta = volta
        return saida
`
const POTENCIA = `
    def __pow__(self, n):
        saida = No(self.valor ** n, (self,))
        def volta():
            self.grad += n * self.valor ** (n - 1) * saida.grad
        saida.volta = volta
        return saida
`
const EXP = `
    def exp(self):
        saida = No(math.exp(self.valor), (self,))
        def volta():
            self.grad += saida.valor * saida.grad
        saida.volta = volta
        return saida
`
const EXP_QUEBRADA = `
    def exp(self):
        saida = No(math.exp(self.valor), (self,))
        def volta():
            self.grad += self.valor * saida.grad
        saida.volta = volta
        return saida
`
const TANH = `
    def tanh(self):
        t = math.tanh(self.valor)
        saida = No(t, (self,))
        def volta():
            self.grad += (1 - t ** 2) * saida.grad
        saida.volta = volta
        return saida
`
const PARA_TRAS = `
    def para_tras(self):
        ordem, vistos = [], set()
        def visitar(no):
            if no not in vistos:
                vistos.add(no)
                for filho in no.filhos:
                    visitar(filho)
                ordem.append(no)
        visitar(self)
        self.grad = 1
        for no in reversed(ordem):
            no.volta()
`
const DIV_SUB = `
    def __truediv__(self, outro):
        return self * outro ** -1

    def __sub__(self, outro):
        return self + outro * -1
`
const RELU = `
    def relu(self):
        saida = No(max(0, self.valor), (self,))
        def volta():
            self.grad += (saida.valor > 0) * saida.grad
        saida.volta = volta
        return saida
`
// A classe inteira, com todas as contas e a volta pelo grafo.
const NO_COMPLETO = NO_INICIO + POTENCIA + EXP + TANH + PARA_TRAS + DIV_SUB

export const DEPOIS_1 = {
  id: 'depois',
  titulo: 'Depois da aula',
  modulos: [
    {
      titulo: 'Fixar a aula',
      licoes: [
          {
            id: 'passo-h',
            titulo: 'O tamanho do passo',
            porque: 'Na aula, Karpathy confere cada derivada dando um passo pequeno h e medindo quanto o resultado mudou. Aqui você descobre até onde essa conta é confiável, e por que ela deixa de ser.',
            passos: [
              {
                texto: `<p>A inclinação de <code>f</code> perto de <code>x</code> pode ser medida com um passo pequeno <code>h</code>: quanto <code>f</code> subiu, dividido por quanto andamos.</p>
<p>Em Python, uma função pode receber outra função. Assim, a mesma <code>inclinacao</code> serve para qualquer <code>f</code>.</p>`,
                tarefa: 'Complete <code>inclinacao(f, x, h)</code> para devolver <code>(f(x + h) - f(x)) / h</code>.',
                inicio: `def f(x):\n    return x**3\n\ndef inclinacao(f, x, h):\n    # devolva quanto f subiu, dividido por h\n    pass\n\nprint(inclinacao(f, 2, 0.001))\n`,
                dica: 'Troque <code>pass</code> por <code>return (f(x + h) - f(x)) / h</code>.',
                solucao: `def f(x):\n    return x**3\n\ndef inclinacao(f, x, h):\n    return (f(x + h) - f(x)) / h\n\nprint(inclinacao(f, 2, 0.001))\n`,
                checagem: `
tem('inclinacao')
r = inclinacao(lambda x: x * x, 3, 0.5)
if r is None:
    falha('A função ainda não devolve nada. Use return.')
if not perto(r, 6.5):
    falha('Para x² em 3, com h = 0,5, a conta devia dar 6,5. Confira a fórmula.')
if not perto(inclinacao(f, 2, 0.001), 12.006001, 1e-6):
    falha('Para x³ em 2, com h = 0,001, devia dar perto de 12,006.')
`,
                certo: 'A derivada de x³ em 2 é exatamente 12. Com h = 0,001, a conta chega perto: 12,006.',
              },
              {
                texto: `<p>Então é só usar um <code>h</code> cada vez menor? Vamos medir.</p>
<p>O código abaixo tenta <code>h</code> de 0,1 até 0,000000000000001 e guarda o <strong>erro</strong> de cada tentativa: a distância até 12, a resposta certa. O gráfico usa escala logarítmica: cada risco é 10 vezes menor que o anterior.</p>`,
                tarefa: 'Execute e olhe o gráfico. Depois, faça <code>melhor_h</code> ser o <code>h</code> com o menor erro.',
                inicio: `import matplotlib.pyplot as plt\n\ndef f(x):\n    return x**3\n\ndef inclinacao(f, x, h):\n    return (f(x + h) - f(x)) / h\n\npassos = [10**-k for k in range(1, 16)]\nerros = []\nfor h in passos:\n    erros.append(abs(inclinacao(f, 2, h) - 12))\n\nplt.loglog(passos, erros, 'o-')\nplt.xlabel('h')\nplt.ylabel('erro')\n\nmelhor_h = None\nprint(melhor_h)\n`,
                dica: '<code>min(erros)</code> é o menor erro, e <code>erros.index(min(erros))</code> é a posição dele. O <code>h</code> está na mesma posição em <code>passos</code>.',
                solucao: `import matplotlib.pyplot as plt\n\ndef f(x):\n    return x**3\n\ndef inclinacao(f, x, h):\n    return (f(x + h) - f(x)) / h\n\npassos = [10**-k for k in range(1, 16)]\nerros = []\nfor h in passos:\n    erros.append(abs(inclinacao(f, 2, h) - 12))\n\nplt.loglog(passos, erros, 'o-')\nplt.xlabel('h')\nplt.ylabel('erro')\n\nmelhor_h = passos[erros.index(min(erros))]\nprint(melhor_h)\n`,
                checagem: `
tem('melhor_h')
ps = [10**-k for k in range(1, 16)]
es = [abs(((2 + h)**3 - 8) / h - 12) for h in ps]
certo = ps[es.index(min(es))]
if melhor_h is None:
    falha('melhor_h ainda vale None. Escolha o h com o menor erro.')
if melhor_h != certo:
    falha('Esse não é o h com o menor erro. Olhe o ponto mais baixo do gráfico.')
`,
                certo: 'O erro cai até h perto de 0,00000001 e depois volta a subir. Diminuir o h ajuda só até certo ponto.',
              },
              {
                texto: `<p>O computador guarda cada número com uma quantidade fixa de algarismos, mais ou menos 16. Com <code>h</code> muito pequeno, <code>f(x + h)</code> e <code>f(x)</code> ficam quase iguais, e quase todos os algarismos da diferença se perdem.</p>
<p>Uma curiosidade: a primeira descrição do modo reverso, a ideia por trás do backpropagation, apareceu em 1970, na tese de mestrado de Seppo Linnainmaa. Ele estudava justamente como erros de arredondamento se acumulam numa conta longa.</p>`,
                tarefa: 'Por que o erro volta a subir quando <code>h</code> fica pequeno demais?',
                opcoes: [
                  { t: 'Porque a derivada de x³ em 2 muda quando h diminui.', por: 'A derivada em 2 é sempre 12. O que muda é a nossa estimativa dela.' },
                  { t: 'Porque o computador guarda poucos algarismos, e a diferença f(x + h) − f(x) perde precisão.', certa: true },
                  { t: 'Porque o código tem um erro na fórmula.', por: 'A fórmula é a mesma para todos os h, e funcionou bem até 0,00000001.' },
                ],
                erro: 'Pense no que acontece com dois números quase iguais.',
                dica: 'Com h = 0,000000000000001, f(2 + h) e f(2) diferem só no 15º algarismo.',
                solucao: 'O arredondamento: a diferença entre dois números quase iguais perde os algarismos que importam.',
              },
              {
                texto: `<p>Existe um jeito melhor de medir: em vez de olhar só para a frente, olhar para os dois lados do ponto. Andamos <code>h</code> para a frente e <code>h</code> para trás, e dividimos pela distância total, <code>2h</code>.</p>`,
                tarefa: 'Complete <code>inclinacao_central</code>, que devolve <code>(f(x + h) - f(x - h)) / (2 * h)</code>, e compare os dois erros com o mesmo <code>h</code>.',
                inicio: `def f(x):\n    return x**3\n\ndef inclinacao(f, x, h):\n    return (f(x + h) - f(x)) / h\n\ndef inclinacao_central(f, x, h):\n    pass\n\nh = 0.001\nprint('para a frente:', abs(inclinacao(f, 2, h) - 12))\nprint('dos dois lados:', abs(inclinacao_central(f, 2, h) - 12))\n`,
                dica: 'Troque <code>pass</code> por <code>return (f(x + h) - f(x - h)) / (2 * h)</code>.',
                solucao: `def f(x):\n    return x**3\n\ndef inclinacao(f, x, h):\n    return (f(x + h) - f(x)) / h\n\ndef inclinacao_central(f, x, h):\n    return (f(x + h) - f(x - h)) / (2 * h)\n\nh = 0.001\nprint('para a frente:', abs(inclinacao(f, 2, h) - 12))\nprint('dos dois lados:', abs(inclinacao_central(f, 2, h) - 12))\n`,
                checagem: `
tem('inclinacao_central')
r = inclinacao_central(lambda x: x**3, 2, 0.001)
if r is None:
    falha('A função ainda não devolve nada. Use return.')
if not perto(r, 12.000001, 1e-6):
    falha('Para x³ em 2, com h = 0,001, devia dar perto de 12,000001.')
`,
                certo: 'Com o mesmo h, o erro caiu de cerca de 0,006 para 0,000001. Olhar para os dois lados cancela boa parte do erro.',
              },
            ],
          },
          {
            id: 'grafo',
            titulo: 'O grafo à mão',
            porque: 'Na aula, Karpathy desenha a conta como um grafo e preenche os gradientes de trás para frente, à mão, antes de deixar o código fazer isso. Repetir sozinho, numa conta nova, é o melhor teste de que a ideia ficou.',
            passos: [
              {
                texto: `<p>Uma conta nova, com quatro valores de entrada: <code>x = 3</code>, <code>y = −2</code>, <code>z = 4</code> e <code>w = 5</code>.</p>
<p><code>s = x · y</code><br><code>t = s + z</code><br><code>L = t · w</code></p>
<p>Primeiro, a ida: calcule os valores da esquerda para a direita.</p>`,
                tarefa: 'Quanto valem <code>s</code>, <code>t</code> e <code>L</code>?',
                figura: { modo: 'grafo', valores: ['x', 'y', 'z', 'w'], grads: {}, perguntas: ['s', 't', 'L'] },
                campos: [{ rotulo: 's =', resposta: -6 }, { rotulo: 't =', resposta: -2 }, { rotulo: 'L =', resposta: -10 }],
                erro: 'Algum valor não bate. Siga a ordem: s, depois t, depois L.',
                dica: '<code>s = 3 · (−2)</code>. Depois some 4. Depois multiplique por 5.',
                solucao: 's = 3 · (−2) = −6\nt = −6 + 4 = −2\nL = −2 · 5 = −10',
              },
              {
                texto: `<p>Agora a volta. O gradiente de um nó responde: <strong>se este valor subir um pouquinho, quanto L muda?</strong></p>
<p>Em <code>L</code>, a resposta é 1. Numa multiplicação <code>L = t · w</code>, o gradiente de <code>t</code> é o valor de <code>w</code>, e o gradiente de <code>w</code> é o valor de <code>t</code>.</p>`,
                tarefa: 'Qual é o gradiente de <code>t</code> e o de <code>w</code>?',
                figura: { modo: 'grafo', valores: true, grads: { L: 1 }, perguntas: ['t', 'w'] },
                campos: [{ rotulo: 'grad de t =', resposta: 5 }, { rotulo: 'grad de w =', resposta: -2 }],
                erro: 'Na multiplicação, cada lado recebe o valor do outro lado.',
                dica: 'O gradiente de t é o valor de w, que é 5. O de w é o valor de t.',
                solucao: 'grad de t = w = 5\ngrad de w = t = −2',
              },
              {
                texto: `<p>Na soma <code>t = s + z</code>, se <code>s</code> sobe um pouquinho, <code>t</code> sobe a mesma coisa. Por isso a soma <strong>repassa</strong> o gradiente que recebeu, igual, para os dois lados.</p>`,
                tarefa: 'Qual é o gradiente de <code>s</code> e o de <code>z</code>?',
                figura: { modo: 'grafo', valores: true, grads: { L: 1, t: 5, w: -2 }, perguntas: ['s', 'z'] },
                campos: [{ rotulo: 'grad de s =', resposta: 5 }, { rotulo: 'grad de z =', resposta: 5 }],
                erro: 'A soma repassa o gradiente de t, sem mudar.',
                dica: 'O gradiente de t é 5.',
                solucao: 'grad de s = grad de t = 5\ngrad de z = grad de t = 5',
              },
              {
                texto: `<p>Falta a primeira multiplicação, <code>s = x · y</code>. É a regra da cadeia: o gradiente que chegou em <code>s</code> é multiplicado pela derivada local.</p>
<p>O gradiente de <code>x</code> é <code>grad de s · y</code>, e o de <code>y</code> é <code>grad de s · x</code>.</p>`,
                tarefa: 'Qual é o gradiente de <code>x</code> e o de <code>y</code>?',
                figura: { modo: 'grafo', valores: true, grads: { L: 1, t: 5, w: -2, s: 5, z: 5 }, perguntas: ['x', 'y'] },
                campos: [{ rotulo: 'grad de x =', resposta: -10 }, { rotulo: 'grad de y =', resposta: 15 }],
                erro: 'Multiplique o gradiente de s pelo valor do outro lado.',
                dica: 'grad de x = 5 · (−2). grad de y = 5 · 3.',
                solucao: 'grad de x = 5 · y = 5 · (−2) = −10\ngrad de y = 5 · x = 5 · 3 = 15',
              },
              {
                texto: `<p>Agora confira a mão com a máquina. Se o gradiente de <code>x</code> é −10, então empurrar <code>x</code> um pouquinho para cima deve fazer <code>L</code> descer 10 vezes esse pouquinho.</p>
<p>O código já mede isso para <code>x</code>, dando um passo pequeno.</p>`,
                tarefa: 'Faça o mesmo para <code>y</code>: guarde em <code>dy</code> e mostre. Deve dar perto de 15.',
                inicio: `def L(x, y, z, w):\n    s = x * y\n    t = s + z\n    return t * w\n\nh = 0.000001\ndx = (L(3 + h, -2, 4, 5) - L(3, -2, 4, 5)) / h\nprint(dx)\n`,
                dica: 'Copie a linha do <code>dx</code>, empurrando o segundo valor: <code>L(3, -2 + h, 4, 5)</code>.',
                solucao: `def L(x, y, z, w):\n    s = x * y\n    t = s + z\n    return t * w\n\nh = 0.000001\ndx = (L(3 + h, -2, 4, 5) - L(3, -2, 4, 5)) / h\nprint(dx)\n\ndy = (L(3, -2 + h, 4, 5) - L(3, -2, 4, 5)) / h\nprint(dy)\n`,
                checagem: `
tem('dy')
if not perto(dy, 15, 1e-3):
    falha('dy devia dar perto de 15. Empurre só o y, que é o segundo valor.')
`,
                certo: 'A conta à mão e a medida com passo pequeno concordam. É assim que se confere um autograd: comparando com a derivada medida.',
              },
            ],
          },
          {
            id: 'duas-vezes',
            titulo: 'Quando um valor é usado duas vezes',
            porque: 'Na aula aparece um erro sutil: quando o mesmo valor entra duas vezes numa conta, o gradiente sai errado. E aparece outro: esquecer de zerar o gradiente entre um passo e outro. Aqui você encontra e conserta os dois num código seu.',
            passos: [
              {
                texto: `<p>Com <code>a = 3</code>, olhe duas contas que usam <code>a</code> duas vezes: <code>b = a + a</code> e <code>c = a · a</code>.</p>
<p>Se <code>a</code> subir um pouquinho, <code>b</code> sobe o dobro disso: <code>a</code> aparece duas vezes.</p>`,
                tarefa: 'Qual é a derivada de <code>b</code> e a de <code>c</code> em relação a <code>a</code>, com <code>a = 3</code>?',
                campos: [{ rotulo: 'db/da =', resposta: 2 }, { rotulo: 'dc/da =', resposta: 6 }],
                erro: 'b = 2a. E a derivada de a² é 2a.',
                dica: '<code>a + a</code> é <code>2a</code>. Para <code>a · a</code>, use a regra da potência: 2 · a.',
                solucao: 'db/da = 2\ndc/da = 2 · 3 = 6',
              },
              {
                texto: `<p>Abaixo está um pequeno autograd, com uma classe <code>No</code>. Cada nó guarda um <code>valor</code>, um <code>grad</code> e uma função <code>volta</code>, que manda o gradiente para os nós de onde ele veio.</p>
<p>Execute: <code>a.grad</code> sai 1, mas a derivada é 2. As duas pontas da soma são o mesmo nó, e a segunda atribuição apaga a primeira.</p>`,
                tarefa: 'Conserte as duas funções <code>volta</code>: em vez de substituir o <code>grad</code> com <code>=</code>, <strong>some</strong> com <code>+=</code>.',
                inicio: `class No:\n    def __init__(self, valor):\n        self.valor = valor\n        self.grad = 0\n        self.volta = lambda: None\n\n    def __add__(self, outro):\n        saida = No(self.valor + outro.valor)\n        def volta():\n            self.grad = saida.grad\n            outro.grad = saida.grad\n        saida.volta = volta\n        return saida\n\n    def __mul__(self, outro):\n        saida = No(self.valor * outro.valor)\n        def volta():\n            self.grad = outro.valor * saida.grad\n            outro.grad = self.valor * saida.grad\n        saida.volta = volta\n        return saida\n\na = No(3)\nb = a + a\nb.grad = 1\nb.volta()\nprint(a.grad)\n`,
                dica: 'São quatro linhas para trocar: <code>self.grad = ...</code> vira <code>self.grad += ...</code>, e o mesmo com <code>outro.grad</code>.',
                solucao: `class No:\n    def __init__(self, valor):\n        self.valor = valor\n        self.grad = 0\n        self.volta = lambda: None\n\n    def __add__(self, outro):\n        saida = No(self.valor + outro.valor)\n        def volta():\n            self.grad += saida.grad\n            outro.grad += saida.grad\n        saida.volta = volta\n        return saida\n\n    def __mul__(self, outro):\n        saida = No(self.valor * outro.valor)\n        def volta():\n            self.grad += outro.valor * saida.grad\n            outro.grad += self.valor * saida.grad\n        saida.volta = volta\n        return saida\n\na = No(3)\nb = a + a\nb.grad = 1\nb.volta()\nprint(a.grad)\n`,
                checagem: `
tem('No')
a1 = No(3); b1 = a1 + a1; b1.grad = 1; b1.volta()
if a1.grad != 2:
    falha('Em a + a, o gradiente de a devia ser 2. Conserte a volta da soma.')
a2 = No(3); c2 = a2 * a2; c2.grad = 1; c2.volta()
if a2.grad != 6:
    falha('Em a · a, o gradiente de a devia ser 6. Conserte a volta da multiplicação.')
x = No(2); y = No(5); z = x * y; z.grad = 1; z.volta()
if x.grad != 5 or y.grad != 2:
    falha('Com dois nós diferentes, x · y devia dar grad 5 para x e 2 para y.')
`,
                certo: 'Com +=, cada caminho que chega em a deixa a sua parte, e as partes se somam. Na regra da cadeia, quando um valor é usado em vários lugares, os gradientes se somam.',
              },
              {
                texto: `<p>O <code>+=</code> resolveu um problema e criou uma responsabilidade. Num treino, a volta acontece a cada passo. Como o gradiente agora se <strong>soma</strong>, o da volta anterior continua lá.</p>
<p>Execute: a cada passo, <code>a.grad</code> cresce, mas a derivada de <code>a · a</code> em 3 é sempre 6.</p>`,
                tarefa: 'Dentro do <code>for</code>, zere <code>a.grad</code> antes de cada volta, para aparecer 6 nas três linhas.',
                inicio: `class No:\n    def __init__(self, valor):\n        self.valor = valor\n        self.grad = 0\n        self.volta = lambda: None\n\n    def __mul__(self, outro):\n        saida = No(self.valor * outro.valor)\n        def volta():\n            self.grad += outro.valor * saida.grad\n            outro.grad += self.valor * saida.grad\n        saida.volta = volta\n        return saida\n\na = No(3)\nfor passo in range(3):\n    b = a * a\n    b.grad = 1\n    b.volta()\n    print(a.grad)\n`,
                dica: 'Uma linha nova, logo no começo do <code>for</code>: <code>a.grad = 0</code>.',
                solucao: `class No:\n    def __init__(self, valor):\n        self.valor = valor\n        self.grad = 0\n        self.volta = lambda: None\n\n    def __mul__(self, outro):\n        saida = No(self.valor * outro.valor)\n        def volta():\n            self.grad += outro.valor * saida.grad\n            outro.grad += self.valor * saida.grad\n        saida.volta = volta\n        return saida\n\na = No(3)\nfor passo in range(3):\n    a.grad = 0\n    b = a * a\n    b.grad = 1\n    b.volta()\n    print(a.grad)\n`,
                checagem: `
if saida.split() != ['6', '6', '6']:
    falha('Deviam aparecer 6, 6 e 6. Zere a.grad antes de cada volta.')
`,
                certo: 'Esse é o zero_grad da aula. Esquecer dele não dá erro nenhum: o treino só anda na direção errada, sem avisar.',
              },
            ],
          },
      ],
    },
    {
      titulo: 'Aumentar o seu autograd',
      licoes: [
        {
          id: 'mais-contas',
          titulo: 'Mais contas no No',
          porque: 'Na aula, o Value ganha contas novas uma de cada vez: potência, exponencial, tangente hiperbólica. Para cada uma, basta saber a derivada local. Aqui a sua classe No ganha as mesmas contas.',
          passos: [
            {
              texto: `<p>Esta é a classe <code>No</code> da lição anterior, agora com <code>filhos</code>: cada nó lembra de quais nós ele veio. E aceita números comuns: <code>isinstance(outro, No)</code> pergunta se <code>outro</code> já é um nó, e se não for, ele vira um.</p>
<p>Para a <strong>potência</strong> <code>x ** n</code>, a derivada local é <code>n · x^(n−1)</code>. Multiplicada pelo gradiente que chegou na saída, é o que vai para <code>x</code>.</p>`,
              tarefa: 'Complete a função <code>volta</code> de <code>__pow__</code>.',
              inicio: `${NO_INICIO}
    def __pow__(self, n):
        saida = No(self.valor ** n, (self,))
        def volta():
            pass  # some no self.grad a derivada local vezes saida.grad
        saida.volta = volta
        return saida

x = No(3)
y = x ** 2
y.grad = 1
y.volta()
print(x.grad)
`,
              dica: '<code>self.grad += n * self.valor ** (n - 1) * saida.grad</code>.',
              solucao: `${NO_INICIO}${POTENCIA}
x = No(3)
y = x ** 2
y.grad = 1
y.volta()
print(x.grad)
`,
              checagem: `
tem('No')
x = No(3); y = x ** 2; y.grad = 1; y.volta()
if x.grad != 6:
    falha('Para x ** 2 em 3, o gradiente devia ser 6.')
x = No(2); y = x ** 3; y.grad = 1; y.volta()
if x.grad != 12:
    falha('Para x ** 3 em 2, o gradiente devia ser 12. Use n * self.valor ** (n - 1).')
`,
            },
            {
              texto: `<p>A <strong>exponencial</strong> <code>e^x</code> tem uma propriedade rara: a derivada dela é ela mesma. Então o gradiente local é o próprio valor da saída.</p>
<p><code>math.exp(x)</code> calcula <code>e^x</code>, com <code>e ≈ 2,718</code>.</p>`,
              tarefa: 'Complete a função <code>volta</code> de <code>exp</code>.',
              inicio: `${NO_INICIO}${POTENCIA}
    def exp(self):
        saida = No(math.exp(self.valor), (self,))
        def volta():
            pass  # a derivada de e^x é e^x, que é saida.valor
        saida.volta = volta
        return saida

x = No(1)
y = x.exp()
y.grad = 1
y.volta()
print(y.valor, x.grad)
`,
              dica: '<code>self.grad += saida.valor * saida.grad</code>.',
              solucao: `${NO_INICIO}${POTENCIA}${EXP}
x = No(1)
y = x.exp()
y.grad = 1
y.volta()
print(y.valor, x.grad)
`,
              checagem: `
tem('No')
for v in (0, 1, -0.5):
    x = No(v); y = x.exp(); y.grad = 1; y.volta()
    if not perto(x.grad, math.exp(v)):
        falha('O gradiente de exp devia ser o próprio valor de e^x.')
`,
            },
            {
              texto: `<p>A <strong>tangente hiperbólica</strong>, <code>tanh</code>, é a função que a aula usa em cada neurônio: ela achata qualquer número para ficar entre −1 e 1.</p>
<p>A derivada dela é <code>1 − tanh(x)²</code>. Repare que ela reaproveita o próprio resultado, guardado em <code>t</code>.</p>`,
              tarefa: 'Complete a função <code>volta</code> de <code>tanh</code>.',
              inicio: `${NO_INICIO}${POTENCIA}${EXP}
    def tanh(self):
        t = math.tanh(self.valor)
        saida = No(t, (self,))
        def volta():
            pass  # a derivada é 1 - t ** 2
        saida.volta = volta
        return saida

x = No(0.5)
y = x.tanh()
y.grad = 1
y.volta()
print(y.valor, x.grad)
`,
              dica: '<code>self.grad += (1 - t ** 2) * saida.grad</code>.',
              solucao: `${NO_INICIO}${POTENCIA}${EXP}${TANH}
x = No(0.5)
y = x.tanh()
y.grad = 1
y.volta()
print(y.valor, x.grad)
`,
              checagem: `
tem('No')
for v in (0.5, -1.2, 0):
    x = No(v); y = x.tanh(); y.grad = 1; y.volta()
    if not perto(x.grad, 1 - math.tanh(v) ** 2):
        falha('O gradiente de tanh devia ser 1 - tanh(x) ** 2.')
`,
              certo: 'Em x = 0 o gradiente é 1, e longe do zero ele cai para perto de 0. É por isso que um neurônio com tanh saturado quase não aprende, assunto da aula 4.',
            },
          ],
        },
        {
          id: 'para-tras',
          titulo: 'A volta pelo grafo inteiro',
          porque: 'Até aqui, cada volta foi chamada à mão, nó por nó. Na aula, Karpathy escreve um backward que percorre o grafo inteiro na ordem certa: primeiro a saída, por último as entradas. Aqui você escreve o seu.',
          passos: [
            {
              texto: `<p>Um nó só pode mandar o gradiente para trás depois de ter recebido tudo dos nós que vêm depois dele. Por isso a volta segue uma ordem: a função <code>visitar</code> coloca cada nó na lista <strong>depois</strong> de todos os filhos dele. Ao contrário, essa lista começa na saída.</p>
<p>O <code>if</code> só executa o bloco com recuo quando a condição é verdadeira: aqui, quando o nó ainda não foi visitado.</p>`,
              tarefa: 'Complete <code>para_tras</code>: comece com o gradiente da saída igual a 1 e chame <code>volta()</code> de cada nó, de trás para frente.',
              inicio: `${NO_INICIO}${POTENCIA}${EXP}${TANH}
    def para_tras(self):
        ordem, vistos = [], set()
        def visitar(no):
            if no not in vistos:
                vistos.add(no)
                for filho in no.filhos:
                    visitar(filho)
                ordem.append(no)
        visitar(self)
        # comece com self.grad = 1
        # e chame volta() de cada nó em reversed(ordem)

x, y, z, w = No(3), No(-2), No(4), No(5)
L = (x * y + z) * w
L.para_tras()
print(x.grad, y.grad, z.grad, w.grad)
`,
              dica: 'Duas partes: <code>self.grad = 1</code>, e depois <code>for no in reversed(ordem):</code> com <code>no.volta()</code> na linha de baixo, com recuo.',
              solucao: `${NO_INICIO}${POTENCIA}${EXP}${TANH}${PARA_TRAS}
x, y, z, w = No(3), No(-2), No(4), No(5)
L = (x * y + z) * w
L.para_tras()
print(x.grad, y.grad, z.grad, w.grad)
`,
              checagem: `
tem('No')
x, y, z, w = No(3), No(-2), No(4), No(5)
L = (x * y + z) * w
L.para_tras()
if (x.grad, y.grad, z.grad, w.grad) != (-10, 15, 5, -2):
    falha('Os gradientes deviam ser -10, 15, 5 e -2, os mesmos do grafo à mão.')
`,
              certo: 'São os mesmos números que você calculou à mão no grafo: −10, 15, 5 e −2. Agora a máquina faz a volta inteira sozinha.',
            },
            {
              texto: `<p>Com a volta automática, um nó usado em dois lugares recebe as duas partes do gradiente, graças ao <code>+=</code>.</p>
<p>Em <code>f = a · b + a</code>, a derivada em relação a <code>a</code> é <code>b + 1</code>: um pedaço vem da multiplicação, outro da soma.</p>`,
              tarefa: 'Monte <code>f = a * b + a</code>, chame <code>f.para_tras()</code> e mostre <code>a.grad</code> e <code>b.grad</code>.',
              inicio: `${NO_INICIO}${POTENCIA}${EXP}${TANH}${PARA_TRAS}
a = No(2)
b = No(5)
`,
              dica: '<code>f = a * b + a</code>, depois <code>f.para_tras()</code> e <code>print(a.grad, b.grad)</code>.',
              solucao: `${NO_INICIO}${POTENCIA}${EXP}${TANH}${PARA_TRAS}
a = No(2)
b = No(5)
f = a * b + a
f.para_tras()
print(a.grad, b.grad)
`,
              checagem: `
tem('f')
if a.grad != 6 or b.grad != 2:
    falha('a.grad devia ser 6 (b + 1) e b.grad devia ser 2. Monte f = a * b + a e chame f.para_tras().')
`,
            },
            {
              texto: `<p>Divisão e subtração não precisam de derivada nova. Dá para escrever com as contas que a classe já tem:</p>
<p><code>a / b = a · b⁻¹</code> e <code>a − b = a + b · (−1)</code>.</p>`,
              tarefa: 'Escreva <code>__truediv__</code> e <code>__sub__</code> usando só <code>*</code>, <code>**</code> e <code>+</code>.',
              inicio: `${NO_INICIO}${POTENCIA}${EXP}${TANH}${PARA_TRAS}
    def __truediv__(self, outro):
        pass  # devolva self vezes outro elevado a -1

    def __sub__(self, outro):
        pass  # devolva self mais outro vezes -1

a = No(6)
b = No(2)
c = a / b - b
c.para_tras()
print(c.valor, a.grad, b.grad)
`,
              dica: '<code>return self * outro ** -1</code> e <code>return self + outro * -1</code>.',
              solucao: `${NO_COMPLETO}
a = No(6)
b = No(2)
c = a / b - b
c.para_tras()
print(c.valor, a.grad, b.grad)
`,
              checagem: `
tem('No')
a = No(6); b = No(2); c = a / b - b; c.para_tras()
if not perto(c.valor, 1):
    falha('6 / 2 - 2 devia dar 1.')
if not perto(a.grad, 0.5) or not perto(b.grad, -2.5):
    falha('a.grad devia ser 0,5 e b.grad, -2,5.')
`,
              certo: 'A derivada de c em relação a b junta as duas partes: −6/2² da divisão e −1 da subtração, total −2,5.',
            },
          ],
        },
        {
          id: 'verificador',
          titulo: 'Conferir o autograd',
          porque: 'Na aula, cada derivada é conferida com um passo pequeno antes de seguir. Um erro numa única volta passa despercebido e estraga todo o treino. Aqui você escreve um verificador e usa ele para achar um erro escondido.',
          passos: [
            {
              texto: `<p>Duas formas de calcular a mesma derivada: a <strong>numérica</strong>, com o passo dos dois lados que você usou no tamanho do passo, e a do <strong>autograd</strong>. Se o autograd estiver certo, as duas quase coincidem.</p>
<p><code>lambda n: (n * n).tanh()</code> é uma função escrita numa linha só: recebe <code>n</code> e devolve a conta.</p>`,
              tarefa: 'Complete <code>confere</code> para devolver a distância entre as duas derivadas, com <code>abs</code>.',
              inicio: `${NO_COMPLETO}
def numerica(f, x, h=0.000001):
    return (f(No(x + h)).valor - f(No(x - h)).valor) / (2 * h)

def autograd(f, x):
    n = No(x)
    f(n).para_tras()
    return n.grad

def confere(f, x):
    pass  # a distância entre numerica(f, x) e autograd(f, x)

g = lambda n: (n * n).tanh()
print(confere(g, 0.7))
`,
              dica: '<code>return abs(numerica(f, x) - autograd(f, x))</code>.',
              solucao: `${NO_COMPLETO}
def numerica(f, x, h=0.000001):
    return (f(No(x + h)).valor - f(No(x - h)).valor) / (2 * h)

def autograd(f, x):
    n = No(x)
    f(n).para_tras()
    return n.grad

def confere(f, x):
    return abs(numerica(f, x) - autograd(f, x))

g = lambda n: (n * n).tanh()
print(confere(g, 0.7))
`,
              checagem: `
tem('confere')
r = confere(lambda n: (n * n).tanh(), 0.7)
if r is None:
    falha('confere ainda não devolve nada. Use return.')
if r > 1e-6:
    falha('A distância devia ser minúscula, menor que 0,000001. Confira a conta.')
`,
              certo: 'A distância é de uns 0,0000000001: as duas formas concordam.',
            },
            {
              texto: `<p>Nesta versão da classe, uma das contas tem um erro na volta. O código roda sem nenhuma mensagem de erro.</p>
<p>O verificador testa três funções, cada uma usando uma conta diferente.</p>`,
              tarefa: 'Execute e descubra qual conta está quebrada. Guarde o nome dela em <code>quebrada</code>: <code>"potencia"</code>, <code>"exp"</code> ou <code>"tanh"</code>.',
              inicio: `${NO_INICIO}${POTENCIA}${EXP_QUEBRADA}${TANH}${PARA_TRAS}${DIV_SUB}
def numerica(f, x, h=0.000001):
    return (f(No(x + h)).valor - f(No(x - h)).valor) / (2 * h)

def autograd(f, x):
    n = No(x)
    f(n).para_tras()
    return n.grad

def confere(f, x):
    return abs(numerica(f, x) - autograd(f, x))

print("potencia:", confere(lambda n: n ** 3, 0.5))
print("exp:", confere(lambda n: (n * 2).exp(), 0.5))
print("tanh:", confere(lambda n: (n * n).tanh(), 0.5))

quebrada = ""
`,
              dica: 'A conta quebrada é a que mostra uma distância grande, longe de 0.',
              solucao: `${NO_INICIO}${POTENCIA}${EXP_QUEBRADA}${TANH}${PARA_TRAS}${DIV_SUB}
def numerica(f, x, h=0.000001):
    return (f(No(x + h)).valor - f(No(x - h)).valor) / (2 * h)

def autograd(f, x):
    n = No(x)
    f(n).para_tras()
    return n.grad

def confere(f, x):
    return abs(numerica(f, x) - autograd(f, x))

print("potencia:", confere(lambda n: n ** 3, 0.5))
print("exp:", confere(lambda n: (n * 2).exp(), 0.5))
print("tanh:", confere(lambda n: (n * n).tanh(), 0.5))

quebrada = "exp"
`,
              checagem: `
tem('quebrada')
if quebrada != 'exp':
    falha('Olhe de novo as três distâncias: a quebrada é a que fica longe de 0.')
`,
            },
            {
              texto: `<p>Achado o culpado, falta consertar. Compare a volta de <code>exp</code> com o que você escreveu em "Mais contas no No": a derivada de <code>e^x</code> é o próprio <code>e^x</code>.</p>`,
              tarefa: 'Conserte a volta de <code>exp</code> e confira de novo: a distância deve ficar perto de 0.',
              inicio: `${NO_INICIO}${POTENCIA}${EXP_QUEBRADA}${TANH}${PARA_TRAS}${DIV_SUB}
def numerica(f, x, h=0.000001):
    return (f(No(x + h)).valor - f(No(x - h)).valor) / (2 * h)

def autograd(f, x):
    n = No(x)
    f(n).para_tras()
    return n.grad

def confere(f, x):
    return abs(numerica(f, x) - autograd(f, x))

print("exp:", confere(lambda n: (n * 2).exp(), 0.5))
`,
              dica: 'Na volta de <code>exp</code>, troque <code>self.valor</code> por <code>saida.valor</code>.',
              solucao: `${NO_COMPLETO}
def numerica(f, x, h=0.000001):
    return (f(No(x + h)).valor - f(No(x - h)).valor) / (2 * h)

def autograd(f, x):
    n = No(x)
    f(n).para_tras()
    return n.grad

def confere(f, x):
    return abs(numerica(f, x) - autograd(f, x))

print("exp:", confere(lambda n: (n * 2).exp(), 0.5))
`,
              checagem: `
tem('confere')
for v in (0.5, -1, 2):
    if confere(lambda n: (n * 2).exp(), v) > 1e-4:
        falha('A volta de exp ainda está errada. A derivada de e^x é e^x, o valor da saída.')
`,
              certo: 'Esse é o hábito que a aula ensina: toda conta nova passa pelo verificador antes de entrar numa rede.',
            },
          ],
        },
      ],
    },
    {
      titulo: 'Treinar',
      licoes: [
        {
          id: 'neuronio',
          titulo: 'Um neurônio',
          porque: 'O neurônio da aula soma as entradas multiplicadas pelos pesos, soma um viés e passa o resultado pela tanh. Com a sua classe No, ele cabe numa linha, e a volta diz como cada peso afeta a saída.',
          passos: [
            {
              texto: `<p>Um neurônio com duas entradas: <code>o = tanh(x1·w1 + x2·w2 + b)</code>. As entradas <code>x1</code> e <code>x2</code> são os dados; os pesos <code>w1</code>, <code>w2</code> e o viés <code>b</code> são o que a rede aprende.</p>`,
              tarefa: 'Monte o neurônio em <code>o</code>, chame <code>o.para_tras()</code> e mostre a saída e o gradiente de cada peso.',
              inicio: `${NO_COMPLETO}
x1, x2 = No(1.0), No(-2.0)
w1, w2 = No(0.5), No(0.25)
b = No(0.3)

o = None
`,
              dica: '<code>o = (x1 * w1 + x2 * w2 + b).tanh()</code>, depois <code>o.para_tras()</code> e <code>print(o.valor, w1.grad, w2.grad, b.grad)</code>.',
              solucao: `${NO_COMPLETO}
x1, x2 = No(1.0), No(-2.0)
w1, w2 = No(0.5), No(0.25)
b = No(0.3)

o = (x1 * w1 + x2 * w2 + b).tanh()
o.para_tras()
print(o.valor, w1.grad, w2.grad, b.grad)
`,
              checagem: `
tem('o')
if o is None:
    falha('Monte o neurônio em o.')
t = math.tanh(0.3)
if not perto(o.valor, t):
    falha('A saída devia ser tanh(0,3), perto de 0,291.')
if not perto(w1.grad, (1 - t * t) * 1.0) or not perto(w2.grad, (1 - t * t) * -2.0):
    falha('Chame o.para_tras() para calcular os gradientes.')
`,
            },
            {
              texto: `<p>O gradiente de um peso é a derivada da tanh, <code>1 − o²</code>, vezes a entrada que multiplica esse peso. Com <code>o ≈ 0,29</code>, a derivada da tanh é <code>1 − 0,29² ≈ 0,915</code>.</p>`,
              tarefa: 'Sem código: qual é o gradiente de <code>w2</code>, sabendo que <code>x2 = −2</code>? E o de um peso cuja entrada é 0?',
              campos: [{ rotulo: 'grad de w2 =', resposta: -1.83, tol: 0.01 }, { rotulo: 'com entrada 0 =', resposta: 0 }],
              erro: 'Multiplique 0,915 pela entrada de cada peso.',
              dica: '0,915 × (−2). E qualquer número vezes 0 dá 0.',
              solucao: 'grad de w2 = 0,915 × (−2) ≈ −1,83\ncom entrada 0: 0,915 × 0 = 0',
              certo: 'Um peso cuja entrada é 0 não recebe gradiente: naquele exemplo, ele não influenciou a saída, então não há o que corrigir.',
            },
          ],
        },
        {
          id: 'descida',
          titulo: 'Descer o gradiente',
          porque: 'Treinar, na aula, é repetir: calcular a perda, fazer a volta, empurrar cada peso um pouco contra o gradiente. O tamanho desse empurrão é a taxa de aprendizado, e escolher mal faz o treino explodir.',
          passos: [
            {
              texto: `<p>Um problema pequeno: achar o peso <code>w</code> que faz <code>w · x</code> chegar perto de <code>y</code> nos exemplos (1, 2), (2, 4) e (3, 6). A resposta é <code>w = 2</code>, mas o treino não sabe disso.</p>
<p>A perda é a soma de <code>(w·x − y)²</code>. A cada passo: zerar o gradiente, fazer a volta e mover <code>w</code> um pouco <strong>contra</strong> o gradiente. <code>zip</code> passa pelas duas listas juntas.</p>`,
              tarefa: 'Complete a linha que atualiza <code>w.valor</code>: tire dele a taxa vezes o gradiente.',
              inicio: `${NO_COMPLETO}
xs = [1, 2, 3]
ys = [2, 4, 6]
w = No(0.0)
taxa = 0.02

for passo in range(30):
    perda = No(0)
    for x, y in zip(xs, ys):
        perda = perda + (w * x - y) ** 2
    w.grad = 0
    perda.para_tras()
    # atualize w.valor aqui

print(w.valor, perda.valor)
`,
              dica: '<code>w.valor -= taxa * w.grad</code>, com o mesmo recuo do <code>perda.para_tras()</code>.',
              solucao: `${NO_COMPLETO}
xs = [1, 2, 3]
ys = [2, 4, 6]
w = No(0.0)
taxa = 0.02

for passo in range(30):
    perda = No(0)
    for x, y in zip(xs, ys):
        perda = perda + (w * x - y) ** 2
    w.grad = 0
    perda.para_tras()
    w.valor -= taxa * w.grad

print(w.valor, perda.valor)
`,
              checagem: `
tem('w')
if not perto(w.valor, 2, 1e-3):
    falha('Depois de 30 passos, w devia estar perto de 2. Atualize com w.valor -= taxa * w.grad.')
`,
              certo: 'w saiu de 0 e chegou a 2 sozinho, só seguindo o gradiente. É o mesmo laço que treina a rede da aula, com um peso em vez de 41.',
            },
            {
              texto: `<p>Agora o mesmo treino com taxas diferentes. A função <code>treinar</code> devolve a perda depois de 30 passos. A perda no começo, com <code>w = 0</code>, é 56.</p>`,
              tarefa: 'Execute. Depois guarde em <code>maior_taxa</code> a maior taxa cuja perda final ficou <strong>menor</strong> que 56.',
              inicio: `${NO_COMPLETO}
xs = [1, 2, 3]
ys = [2, 4, 6]

def treinar(taxa):
    w = No(0.0)
    for passo in range(30):
        perda = No(0)
        for x, y in zip(xs, ys):
            perda = perda + (w * x - y) ** 2
        w.grad = 0
        perda.para_tras()
        w.valor -= taxa * w.grad
    return perda.valor

for taxa in [0.01, 0.05, 0.07, 0.08, 0.1]:
    print(taxa, treinar(taxa))

maior_taxa = None
`,
              dica: 'Olhe a perda de cada taxa. A partir de alguma taxa, ela passa de 56 e explode.',
              solucao: `${NO_COMPLETO}
xs = [1, 2, 3]
ys = [2, 4, 6]

def treinar(taxa):
    w = No(0.0)
    for passo in range(30):
        perda = No(0)
        for x, y in zip(xs, ys):
            perda = perda + (w * x - y) ** 2
        w.grad = 0
        perda.para_tras()
        w.valor -= taxa * w.grad
    return perda.valor

for taxa in [0.01, 0.05, 0.07, 0.08, 0.1]:
    print(taxa, treinar(taxa))

maior_taxa = 0.07
`,
              checagem: `
tem('maior_taxa')
if maior_taxa != 0.07:
    falha('Procure a maior taxa com perda final menor que 56. Com 0,08 a perda já explode.')
`,
              certo: 'Com 0,07 o treino ainda desce; com 0,08 ele explode. A fronteira fica em 1/14 ≈ 0,0714, e passar dela um pouco já basta para o treino divergir.',
            },
            {
              texto: `<p>Com taxa 0,08, cada passo empurra <code>w</code> para além do 2, do outro lado, e mais longe do que estava.</p>`,
              tarefa: 'Por que uma taxa de aprendizado grande demais faz a perda explodir?',
              opcoes: [
                { t: 'Porque o gradiente aponta para o lado errado.', por: 'O gradiente aponta certo. O problema é o tamanho do passo.' },
                { t: 'Porque o passo passa do ponto mais baixo e cai do outro lado, cada vez mais longe.', certa: true },
                { t: 'Porque o computador arredonda os números.', por: 'Os números aqui são pequenos e exatos o bastante. É o tamanho do passo.' },
              ],
              erro: 'Pense em descer uma ladeira dando passos enormes.',
              dica: 'O gradiente diz a direção, não a distância certa.',
              solucao: 'O passo passa do mínimo e cai do outro lado, cada vez mais longe. Por isso, na aula, a taxa é escolhida com cuidado.',
            },
          ],
        },
        {
          id: 'relu',
          titulo: 'ReLU e neurônios mortos',
          porque: 'A aula usa tanh, mas a função mais comum nas redes de hoje é a ReLU: devolve o número se ele for positivo, e 0 se não for. Ela é simples e rápida, e tem um defeito que vale conhecer.',
          passos: [
            {
              texto: `<p><code>relu(x) = max(0, x)</code>. A derivada é 1 quando <code>x</code> é positivo e 0 quando não é.</p>
<p>Em Python, <code>saida.valor &gt; 0</code> é <code>True</code> ou <code>False</code>, e numa conta valem 1 e 0.</p>`,
              tarefa: 'Complete a volta de <code>relu</code>.',
              inicio: `${NO_COMPLETO}
    def relu(self):
        saida = No(max(0, self.valor), (self,))
        def volta():
            pass  # 1 se a saída for positiva, 0 se não for, vezes saida.grad
        saida.volta = volta
        return saida

for v in [3, -2]:
    x = No(v)
    y = x.relu()
    y.para_tras()
    print(v, y.valor, x.grad)
`,
              dica: '<code>self.grad += (saida.valor &gt; 0) * saida.grad</code>.',
              solucao: `${NO_COMPLETO}${RELU}
for v in [3, -2]:
    x = No(v)
    y = x.relu()
    y.para_tras()
    print(v, y.valor, x.grad)
`,
              checagem: `
tem('No')
x = No(3); y = x.relu(); y.para_tras()
if x.grad != 1:
    falha('Para x = 3, o gradiente da relu devia ser 1.')
x = No(-2); y = x.relu(); y.para_tras()
if x.grad != 0:
    falha('Para x = -2, o gradiente da relu devia ser 0.')
`,
            },
            {
              texto: `<p>Um neurônio com ReLU e viés −5: <code>relu(w·x − 5)</code>, com <code>w = 1</code>. Para qualquer entrada entre 0 e 1, a conta dentro da ReLU fica negativa.</p>
<p>A saída é 0, e o gradiente de <code>w</code> e do viés também é 0, para todos esses exemplos.</p>`,
              tarefa: 'O que acontece com esse neurônio durante o treino?',
              opcoes: [
                { t: 'Ele aprende devagar, mas aprende.', por: 'Com gradiente 0 em todos os exemplos, nenhum passo muda os pesos.' },
                { t: 'Ele nunca muda: com gradiente zero, os pesos ficam parados. É um neurônio morto.', certa: true },
                { t: 'Ele aprende mais rápido, porque a saída é simples.', por: 'Sem gradiente não há aprendizado nenhum.' },
              ],
              erro: 'O que o treino faz com um peso cujo gradiente é 0?',
              dica: 'w.valor -= taxa * 0 não muda nada.',
              solucao: 'Ele nunca mais muda: é um neurônio morto. Na aula 4, Karpathy mostra como achar neurônios assim numa rede de verdade.',
            },
          ],
        },
        {
          id: 'gradiente-direto',
          titulo: 'Gradiente sem a volta',
          porque: 'O backpropagation calcula todas as derivadas numa volta. Existe outro caminho: sortear direções e medir a derivada em cada uma só com idas. Fazer isso à mão mostra por que a volta da aula é tão valiosa.',
          passos: [
            {
              texto: `<p>Para <code>f(θ) = θ₁² + θ₂² + θ₃²</code>, o gradiente é <code>2θ</code>. Mas imagine que não sabemos fazer a volta.</p>
<p>Sorteamos uma direção <code>v</code>, medimos a derivada nessa direção com o passo dos dois lados, só com idas, e multiplicamos por <code>v</code>. Uma estimativa sozinha é ruidosa, mas a <strong>média</strong> de muitas chega no gradiente.</p>`,
              tarefa: 'Guarde em <code>media</code> a média das estimativas, ao longo das linhas.',
              inicio: `import numpy as np

np.random.seed(0)
def f(t):
    return np.sum(t ** 2)

theta = np.array([1.0, -2.0, 0.5])
gradiente = 2 * theta
h = 0.00001

estimativas = []
for _ in range(5000):
    v = np.random.randn(3)
    d = (f(theta + h * v) - f(theta - h * v)) / (2 * h)
    estimativas.append(d * v)

media = None
print(media)
print(gradiente)
`,
              dica: '<code>media = np.mean(estimativas, axis=0)</code>.',
              solucao: `import numpy as np

np.random.seed(0)
def f(t):
    return np.sum(t ** 2)

theta = np.array([1.0, -2.0, 0.5])
gradiente = 2 * theta
h = 0.00001

estimativas = []
for _ in range(5000):
    v = np.random.randn(3)
    d = (f(theta + h * v) - f(theta - h * v)) / (2 * h)
    estimativas.append(d * v)

media = np.mean(estimativas, axis=0)
print(media)
print(gradiente)
`,
              checagem: `
import numpy as _np
tem('media')
if media is None or _np.shape(media) != (3,):
    falha('media devia ter 3 números, um por direção. Use axis=0.')
if not _np.allclose(media, [2, -4, 1], atol=0.3):
    falha('A média devia chegar perto de [2, -4, 1].')
`,
              certo: 'Com 5.000 sorteios, a média chega perto de [2, −4, 1]. Precisou de 10.000 idas. O backprop dá o gradiente exato com uma ida e uma volta.',
            },
            {
              texto: `<p>Com 3 números, 5.000 sorteios bastaram. Uma rede pequena tem milhares de pesos; uma grande, bilhões. Cada direção sorteada mede só um pedacinho do gradiente, e quanto mais pesos, menor o pedacinho.</p>`,
              tarefa: 'Por que o backpropagation é usado em vez de sortear direções?',
              opcoes: [
                { t: 'Porque sortear direções dá a resposta errada.', por: 'Em média, a resposta é certa. O problema é quantas idas são precisas.' },
                { t: 'Porque, com muitos pesos, seriam necessárias idas demais. A volta dá todas as derivadas de uma vez.', certa: true },
                { t: 'Porque o backpropagation não precisa da ida.', por: 'Ele precisa: primeiro a ida, depois a volta.' },
              ],
              erro: 'Compare o custo dos dois caminhos quando há milhões de pesos.',
              dica: 'Uma volta custa mais ou menos o mesmo que uma ida.',
              solucao: 'Com muitos pesos, o ruído de cada direção sorteada cresce, e seriam precisas idas demais. A volta dá o gradiente exato pelo preço de mais ou menos uma ida.',
            },
          ],
        },
      ],
    },
  ],
}
