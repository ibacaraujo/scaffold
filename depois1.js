// Depois da aula 1: exercícios para praticar o que a aula do micrograd mostrou.
// Método: os objetivos da aula, na ordem do vídeo, viram blocos; em cada bloco os exercícios sobem
// de nível (reconhecer, calcular à mão, escrever em código, aplicar). Cada exercício é uma tarefa só,
// com números próprios, e o último junta tudo: treinar um modelo do zero com o seu autograd.

const ex = (id, titulo, passo) => ({ id, titulo, passos: [passo] })

const CLASSE = `class No:
    def __init__(self, valor, filhos=()):
        self.valor = valor
        self.grad = 0
        self.filhos = filhos
        self.volta = lambda: None
`
const SOMA = `
    def __add__(self, outro):
        outro = outro if isinstance(outro, No) else No(outro)
        saida = No(self.valor + outro.valor, (self, outro))
        def volta():
            self.grad += saida.grad
            outro.grad += saida.grad
        saida.volta = volta
        return saida
`
const MULT = `
    def __mul__(self, outro):
        outro = outro if isinstance(outro, No) else No(outro)
        saida = No(self.valor * outro.valor, (self, outro))
        def volta():
            self.grad += outro.valor * saida.grad
            outro.grad += self.valor * saida.grad
        saida.volta = volta
        return saida
`
const POT = `
    def __pow__(self, n):
        saida = No(self.valor ** n, (self,))
        def volta():
            self.grad += n * self.valor ** (n - 1) * saida.grad
        saida.volta = volta
        return saida

    def __sub__(self, outro):
        return self + outro * -1
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
const VOLTA = `
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
const NO_BASICO = CLASSE + SOMA + MULT + VOLTA
const NO_TUDO = 'import math\n\n' + CLASSE + SOMA + MULT + POT + TANH + VOLTA

export const DEPOIS_1 = {
  id: 'depois',
  titulo: 'Depois da aula',
  exercicios: true,
  modulos: [
    {
      titulo: 'A derivada',
      licoes: [
        ex('a1-passo', 'Medir com um passo', {
          texto: `<p>A aula mede a derivada dando um passo pequeno <code>h</code>: quanto <code>f</code> subiu, dividido por <code>h</code>.</p>`,
          tarefa: 'Com <code>f(x) = x²</code>, <code>x = 3</code> e <code>h = 0,01</code>, quanto dá <code>(f(3,01) − f(3)) / 0,01</code>?',
          campos: [{ rotulo: 'inclinação ≈', resposta: 6.01, tol: 0.0001 }],
          erro: 'f(3,01) = 9,0601 e f(3) = 9. Divida a diferença por 0,01.',
          dica: '9,0601 − 9 = 0,0601. Depois, 0,0601 ÷ 0,01.',
          solucao: '9,0601 − 9 = 0,0601\n0,0601 ÷ 0,01 = 6,01',
          certo: 'Bem perto de 6, a derivada exata de x² em 3.',
        }),
        ex('a1-sinal-derivada', 'O sinal da derivada', {
          texto: `<p>A derivada diz o que acontece com <code>f</code> quando <code>x</code> sobe um pouquinho.</p>`,
          tarefa: 'Num ponto, a derivada é −4. Se <code>x</code> subir um pouquinho, o que acontece com <code>f</code>?',
          opcoes: [
            { t: 'Sobe, mais ou menos 4 vezes o pouquinho.', por: 'Derivada negativa quer dizer que f vai no sentido contrário.' },
            { t: 'Desce, mais ou menos 4 vezes o pouquinho.', certa: true },
            { t: 'Não muda.', por: 'Isso aconteceria com derivada 0.' },
          ],
          erro: 'Pense no sinal e no tamanho.',
          dica: 'Negativa: desce. O 4 diz quanto.',
          solucao: 'Desce, cerca de 4 vezes o pouquinho.',
        }),
        ex('a1-fundo', 'No ponto mais baixo', {
          texto: `<p>No ponto mais baixo de uma curva, ela para de descer e ainda não começou a subir.</p>`,
          tarefa: 'Quanto vale a derivada nesse ponto?',
          campos: [{ rotulo: 'derivada =', resposta: 0 }],
          erro: 'A reta que encosta no fundo da curva é deitada.',
          dica: 'Nem sobe, nem desce.',
          solucao: '0: no fundo, a curva fica plana. É esse ponto que o treino de uma rede procura.',
        }),
        ex('a1-inclinacao', 'A inclinação em código', {
          texto: `<p>O mesmo passo pequeno, agora numa função de Python que recebe outra função.</p>`,
          tarefa: 'Complete <code>inclinacao(f, x, h)</code> para devolver <code>(f(x + h) - f(x)) / h</code>.',
          inicio: `def f(x):\n    return x**3\n\ndef inclinacao(f, x, h):\n    pass\n\nprint(inclinacao(f, 2, 0.001))\n`,
          dica: 'Troque <code>pass</code> por <code>return (f(x + h) - f(x)) / h</code>.',
          solucao: `def f(x):\n    return x**3\n\ndef inclinacao(f, x, h):\n    return (f(x + h) - f(x)) / h\n\nprint(inclinacao(f, 2, 0.001))\n`,
          checagem: `
tem('inclinacao')
r = inclinacao(lambda x: x * x, 3, 0.5)
if r is None:
    falha('A função ainda não devolve nada. Use return.')
if not perto(r, 6.5):
    falha('Confira a fórmula: (f(x + h) - f(x)) / h.')
`,
          certo: 'Perto de 12, a derivada de x³ em 2.',
        }),
        ex('a1-parcial', 'Várias entradas', {
          texto: `<p>Com várias entradas, a aula empurra <strong>uma</strong> delas e mantém as outras paradas.</p>
<p><code>d = a · b + c</code>, com <code>a = 3</code>, <code>b = 2</code> e <code>c = 1</code>, dá <code>d = 7</code>.</p>`,
          tarefa: 'Empurrando só <code>b</code> para 2,01, quanto vale <code>d</code>? E quanto <code>d</code> subiu, dividido por 0,01?',
          campos: [{ rotulo: 'novo d =', resposta: 7.03, tol: 0.0001 }, { rotulo: 'derivada em b ≈', resposta: 3, tol: 0.0001 }],
          erro: 'd = 3 · 2,01 + 1.',
          dica: '3 · 2,01 = 6,03. Depois, (7,03 − 7) ÷ 0,01.',
          solucao: 'd = 6,03 + 1 = 7,03\n(7,03 − 7) ÷ 0,01 = 3',
          certo: 'A derivada em b é 3, o valor de a. É a regra da multiplicação, medida.',
        }),
      ],
    },
    {
      titulo: 'Gradientes à mão',
      licoes: [
        ex('a1-mult', 'Numa multiplicação', {
          texto: `<p>Em <code>L = x · y</code>, o gradiente de cada lado é o valor do outro lado.</p>`,
          tarefa: 'Com <code>x = 3</code> e <code>y = −2</code>, qual é o gradiente de <code>x</code> e o de <code>y</code>?',
          campos: [{ rotulo: 'grad de x =', resposta: -2 }, { rotulo: 'grad de y =', resposta: 3 }],
          erro: 'Cada lado recebe o valor do outro.',
          dica: 'O gradiente de x é o valor de y.',
          solucao: 'grad de x = y = −2\ngrad de y = x = 3',
        }),
        ex('a1-soma', 'Numa soma', {
          texto: `<p>A soma repassa o gradiente que chegou nela, igual, para os dois lados.</p>`,
          tarefa: '<code>s = x + y</code> e <code>L = s · 3</code>. Qual é o gradiente de <code>s</code>? E o de <code>x</code>?',
          campos: [{ rotulo: 'grad de s =', resposta: 3 }, { rotulo: 'grad de x =', resposta: 3 }],
          erro: 'Na multiplicação por 3, o gradiente de s é 3. A soma repassa esse valor.',
          dica: 'L = s · 3: o gradiente de s é o outro lado, 3.',
          solucao: 'grad de s = 3\ngrad de x = 3',
        }),
        ex('a1-cadeia', 'A regra da cadeia', {
          texto: `<p>O gradiente que chega num nó é multiplicado pela derivada local, e segue para trás.</p>`,
          tarefa: '<code>s = x · y</code> e <code>L = s · 5</code>, com <code>x = 2</code> e <code>y = 4</code>. Qual é o gradiente de <code>s</code>? E o de <code>x</code>?',
          campos: [{ rotulo: 'grad de s =', resposta: 5 }, { rotulo: 'grad de x =', resposta: 20 }],
          erro: 'grad de x = grad de s × y.',
          dica: 'O gradiente de s é 5. Depois, 5 × 4.',
          solucao: 'grad de s = 5\ngrad de x = 5 × 4 = 20',
        }),
        ex('a1-grafo', 'Um grafo pequeno', {
          texto: `<p><code>s = a + b</code> e <code>L = s · c</code>, com <code>a = 1</code>, <code>b = 2</code> e <code>c = −3</code>.</p>`,
          tarefa: 'Qual é o gradiente de <code>a</code>, o de <code>b</code> e o de <code>c</code>?',
          campos: [{ rotulo: 'grad de a =', resposta: -3 }, { rotulo: 'grad de b =', resposta: -3 }, { rotulo: 'grad de c =', resposta: 3 }],
          erro: 'O gradiente de s é c. A soma repassa para a e b. O de c é o valor de s.',
          dica: 's = 3. O gradiente de s é −3.',
          solucao: 'grad de s = c = −3, repassado para a e b\ngrad de c = s = 3',
        }),
        ex('a1-subtracao', 'Numa subtração', {
          texto: `<p>Em <code>L = a − c</code>, se <code>c</code> sobe um pouquinho, <code>L</code> desce o mesmo pouquinho.</p>`,
          tarefa: 'Qual é o gradiente de <code>a</code>? E o de <code>c</code>?',
          campos: [{ rotulo: 'grad de a =', resposta: 1 }, { rotulo: 'grad de c =', resposta: -1 }],
          erro: 'a entra com sinal de mais, c com sinal de menos.',
          dica: 'Subtrair é somar c vezes −1.',
          solucao: 'grad de a = 1\ngrad de c = −1',
        }),
        ex('a1-duas-vezes', 'Um valor usado duas vezes', {
          texto: `<p>Quando um valor aparece em dois lugares, os gradientes das duas partes se <strong>somam</strong>.</p>`,
          tarefa: 'Com <code>a = 4</code>: qual é o gradiente de <code>a</code> em <code>a + a</code>? E em <code>a · a</code>?',
          campos: [{ rotulo: 'em a + a =', resposta: 2 }, { rotulo: 'em a · a =', resposta: 8 }],
          erro: 'Em a + a, cada parte dá 1. Em a · a, cada parte dá o valor do outro lado, 4.',
          dica: '1 + 1, e 4 + 4.',
          solucao: 'a + a: 1 + 1 = 2\na · a: 4 + 4 = 8',
        }),
        ex('a1-tanh', 'A derivada da tanh', {
          texto: `<p>A derivada de <code>tanh(x)</code> é <code>1 − tanh(x)²</code>.</p>`,
          tarefa: 'Se <code>tanh(x) = 0,6</code>, qual é a derivada?',
          campos: [{ rotulo: 'derivada =', resposta: 0.64 }],
          erro: 'Calcule 0,6² e tire de 1.',
          dica: '0,6² = 0,36.',
          solucao: '1 − 0,36 = 0,64',
        }),
        ex('a1-neuronio-mao', 'Um neurônio à mão', {
          texto: `<p>Um neurônio: <code>o = tanh(x · w + b)</code>. A saída deu <code>o = 0,6</code>, com a entrada <code>x = 2</code>.</p>`,
          tarefa: 'Qual é o gradiente de <code>w</code>? E o do viés <code>b</code>?',
          campos: [{ rotulo: 'grad de w =', resposta: 1.28 }, { rotulo: 'grad de b =', resposta: 0.64 }],
          erro: 'A tanh dá 1 − 0,6² = 0,64. Depois, w multiplica por x, e b recebe direto.',
          dica: '0,64 × 2 para w. O viés está numa soma.',
          solucao: 'derivada da tanh = 0,64\ngrad de w = 0,64 × 2 = 1,28\ngrad de b = 0,64',
        }),
        ex('a1-saturado', 'Um neurônio saturado', {
          texto: `<p>Quando a saída da tanh fica perto de 1 ou −1, o neurônio está <strong>saturado</strong>.</p>`,
          tarefa: 'Com <code>o = 0,99</code>, o que acontece com os gradientes dos pesos desse neurônio?',
          opcoes: [
            { t: 'Ficam enormes.', por: '1 − 0,99² ≈ 0,02: um número pequeno multiplica tudo.' },
            { t: 'Ficam perto de zero, e o neurônio quase não aprende.', certa: true },
            { t: 'Não mudam.', por: 'Todos passam pela derivada da tanh, que ficou minúscula.' },
          ],
          erro: 'Calcule 1 − 0,99².',
          dica: '0,99² ≈ 0,98.',
          solucao: 'Ficam perto de zero: 1 − 0,99² ≈ 0,02. A aula 4 volta a esse problema.',
        }),
      ],
    },
    {
      titulo: 'O autograd em código',
      licoes: [
        ex('a1-ida', 'A ida da soma', {
          texto: `<p>Um nó guarda o <code>valor</code> e de quais nós ele veio, os <code>filhos</code>.</p>`,
          tarefa: 'Complete <code>__add__</code>: o valor da saída é a soma dos valores, e os filhos são <code>(self, outro)</code>.',
          inicio: `class No:\n    def __init__(self, valor, filhos=()):\n        self.valor = valor\n        self.filhos = filhos\n\n    def __add__(self, outro):\n        return No(0)  # troque por um nó com a soma e os filhos\n\nc = No(2) + No(3)\nprint(c.valor, len(c.filhos))\n`,
          dica: '<code>return No(self.valor + outro.valor, (self, outro))</code>.',
          solucao: `class No:\n    def __init__(self, valor, filhos=()):\n        self.valor = valor\n        self.filhos = filhos\n\n    def __add__(self, outro):\n        return No(self.valor + outro.valor, (self, outro))\n\nc = No(2) + No(3)\nprint(c.valor, len(c.filhos))\n`,
          checagem: `
tem('No')
a = No(2); b = No(3); c = a + b
if c.valor != 5:
    falha('O valor de No(2) + No(3) devia ser 5.')
if c.filhos != (a, b):
    falha('Os filhos deviam ser (self, outro).')
`,
        }),
        ex('a1-volta-mult', 'A volta da multiplicação', {
          texto: `<p>A volta de uma conta manda o gradiente da saída para os filhos, vezes a derivada local.</p>`,
          tarefa: 'Complete a volta de <code>__mul__</code>: cada lado recebe o valor do outro, vezes <code>saida.grad</code>.',
          inicio: `class No:\n    def __init__(self, valor):\n        self.valor = valor\n        self.grad = 0\n\n    def __mul__(self, outro):\n        saida = No(self.valor * outro.valor)\n        def volta():\n            pass\n        saida.volta = volta\n        return saida\n\nx, y = No(3), No(-2)\nL = x * y\nL.grad = 1\nL.volta()\nprint(x.grad, y.grad)\n`,
          dica: '<code>self.grad += outro.valor * saida.grad</code> e <code>outro.grad += self.valor * saida.grad</code>.',
          solucao: `class No:\n    def __init__(self, valor):\n        self.valor = valor\n        self.grad = 0\n\n    def __mul__(self, outro):\n        saida = No(self.valor * outro.valor)\n        def volta():\n            self.grad += outro.valor * saida.grad\n            outro.grad += self.valor * saida.grad\n        saida.volta = volta\n        return saida\n\nx, y = No(3), No(-2)\nL = x * y\nL.grad = 1\nL.volta()\nprint(x.grad, y.grad)\n`,
          checagem: `
tem('No')
x, y = No(3), No(-2); L = x * y; L.grad = 1; L.volta()
if (x.grad, y.grad) != (-2, 3):
    falha('x.grad devia ser -2 e y.grad, 3.')
x, y = No(2), No(5); L = x * y; L.grad = 10; L.volta()
if (x.grad, y.grad) != (50, 20):
    falha('Não esqueça de multiplicar por saida.grad.')
`,
        }),
        ex('a1-mais-igual', 'Consertar o =', {
          texto: `<p>Este autograd usa <code>=</code> na volta. Em <code>a + a</code>, a segunda linha apaga a primeira.</p>`,
          tarefa: 'Troque <code>=</code> por <code>+=</code> nas duas linhas da volta, para <code>a.grad</code> dar 2.',
          inicio: `class No:\n    def __init__(self, valor):\n        self.valor = valor\n        self.grad = 0\n\n    def __add__(self, outro):\n        saida = No(self.valor + outro.valor)\n        def volta():\n            self.grad = saida.grad\n            outro.grad = saida.grad\n        saida.volta = volta\n        return saida\n\na = No(3)\nb = a + a\nb.grad = 1\nb.volta()\nprint(a.grad)\n`,
          dica: '<code>self.grad += saida.grad</code> e <code>outro.grad += saida.grad</code>.',
          solucao: `class No:\n    def __init__(self, valor):\n        self.valor = valor\n        self.grad = 0\n\n    def __add__(self, outro):\n        saida = No(self.valor + outro.valor)\n        def volta():\n            self.grad += saida.grad\n            outro.grad += saida.grad\n        saida.volta = volta\n        return saida\n\na = No(3)\nb = a + a\nb.grad = 1\nb.volta()\nprint(a.grad)\n`,
          checagem: `
tem('No')
a1 = No(3); b1 = a1 + a1; b1.grad = 1; b1.volta()
if a1.grad != 2:
    falha('a.grad devia ser 2. Use += nas duas linhas.')
`,
        }),
        ex('a1-potencia', 'A volta da potência', {
          texto: `<p>Para <code>x ** n</code>, a derivada local é <code>n · x^(n−1)</code>.</p>`,
          tarefa: 'Complete a volta de <code>__pow__</code>.',
          inicio: `class No:\n    def __init__(self, valor):\n        self.valor = valor\n        self.grad = 0\n\n    def __pow__(self, n):\n        saida = No(self.valor ** n)\n        def volta():\n            pass\n        saida.volta = volta\n        return saida\n\nx = No(3)\ny = x ** 2\ny.grad = 1\ny.volta()\nprint(x.grad)\n`,
          dica: '<code>self.grad += n * self.valor ** (n - 1) * saida.grad</code>.',
          solucao: `class No:\n    def __init__(self, valor):\n        self.valor = valor\n        self.grad = 0\n\n    def __pow__(self, n):\n        saida = No(self.valor ** n)\n        def volta():\n            self.grad += n * self.valor ** (n - 1) * saida.grad\n        saida.volta = volta\n        return saida\n\nx = No(3)\ny = x ** 2\ny.grad = 1\ny.volta()\nprint(x.grad)\n`,
          checagem: `
tem('No')
x = No(3); y = x ** 2; y.grad = 1; y.volta()
if x.grad != 6:
    falha('Para x ** 2 em 3, o gradiente devia ser 6.')
x = No(2); y = x ** 3; y.grad = 1; y.volta()
if x.grad != 12:
    falha('Para x ** 3 em 2, o gradiente devia ser 12.')
`,
        }),
        ex('a1-volta-tanh', 'A volta da tanh', {
          texto: `<p>A tanh guarda o resultado em <code>t</code>, e a derivada local é <code>1 − t²</code>.</p>`,
          tarefa: 'Complete a volta de <code>tanh</code>.',
          inicio: `import math\n\nclass No:\n    def __init__(self, valor):\n        self.valor = valor\n        self.grad = 0\n\n    def tanh(self):\n        t = math.tanh(self.valor)\n        saida = No(t)\n        def volta():\n            pass\n        saida.volta = volta\n        return saida\n\nx = No(0.5)\ny = x.tanh()\ny.grad = 1\ny.volta()\nprint(x.grad)\n`,
          dica: '<code>self.grad += (1 - t ** 2) * saida.grad</code>.',
          solucao: `import math\n\nclass No:\n    def __init__(self, valor):\n        self.valor = valor\n        self.grad = 0\n\n    def tanh(self):\n        t = math.tanh(self.valor)\n        saida = No(t)\n        def volta():\n            self.grad += (1 - t ** 2) * saida.grad\n        saida.volta = volta\n        return saida\n\nx = No(0.5)\ny = x.tanh()\ny.grad = 1\ny.volta()\nprint(x.grad)\n`,
          checagem: `
tem('No')
for v in (0.5, -1.2, 0):
    x = No(v); y = x.tanh(); y.grad = 1; y.volta()
    if not perto(x.grad, 1 - math.tanh(v) ** 2):
        falha('O gradiente devia ser 1 - t ** 2.')
`,
        }),
        ex('a1-numero', 'Um número do lado esquerdo', {
          texto: `<p><code>x * 2</code> funciona, mas <code>2 * x</code> não: o Python pergunta primeiro ao 2, que não sabe multiplicar um nó. Quando o da esquerda não sabe, o Python tenta <code>__rmul__</code> no da direita.</p>`,
          tarefa: 'Complete <code>__rmul__</code> para devolver <code>self * outro</code>.',
          inicio: `class No:\n    def __init__(self, valor):\n        self.valor = valor\n\n    def __mul__(self, outro):\n        outro = outro if isinstance(outro, No) else No(outro)\n        return No(self.valor * outro.valor)\n\n    def __rmul__(self, outro):\n        pass\n\nx = No(3)\nprint((2 * x).valor)\n`,
          dica: '<code>return self * outro</code>: a multiplicação não depende da ordem.',
          solucao: `class No:\n    def __init__(self, valor):\n        self.valor = valor\n\n    def __mul__(self, outro):\n        outro = outro if isinstance(outro, No) else No(outro)\n        return No(self.valor * outro.valor)\n\n    def __rmul__(self, outro):\n        return self * outro\n\nx = No(3)\nprint((2 * x).valor)\n`,
          checagem: `
tem('No')
r = 2 * No(3)
if r is None or r.valor != 6:
    falha('2 * No(3) devia dar um nó com valor 6.')
`,
        }),
        ex('a1-zerar', 'Zerar o gradiente', {
          texto: `<p>Com <code>+=</code>, o gradiente da volta anterior continua lá. Por isso a aula zera antes de cada volta.</p>`,
          tarefa: 'Zere <code>a.grad</code> no começo do <code>for</code>, para aparecer 6 nas três linhas.',
          inicio: `class No:\n    def __init__(self, valor):\n        self.valor = valor\n        self.grad = 0\n\n    def __mul__(self, outro):\n        saida = No(self.valor * outro.valor)\n        def volta():\n            self.grad += outro.valor * saida.grad\n            outro.grad += self.valor * saida.grad\n        saida.volta = volta\n        return saida\n\na = No(3)\nfor passo in range(3):\n    b = a * a\n    b.grad = 1\n    b.volta()\n    print(a.grad)\n`,
          dica: 'Uma linha nova, logo no começo do <code>for</code>: <code>a.grad = 0</code>.',
          solucao: `class No:\n    def __init__(self, valor):\n        self.valor = valor\n        self.grad = 0\n\n    def __mul__(self, outro):\n        saida = No(self.valor * outro.valor)\n        def volta():\n            self.grad += outro.valor * saida.grad\n            outro.grad += self.valor * saida.grad\n        saida.volta = volta\n        return saida\n\na = No(3)\nfor passo in range(3):\n    a.grad = 0\n    b = a * a\n    b.grad = 1\n    b.volta()\n    print(a.grad)\n`,
          checagem: `
if saida.split() != ['6', '6', '6']:
    falha('Deviam aparecer 6, 6 e 6. Zere a.grad antes de cada volta.')
`,
        }),
        ex('a1-ordem', 'A ordem da volta', {
          texto: `<p>O <code>backward</code> da aula chama a volta de cada nó numa ordem: da saída para as entradas.</p>`,
          tarefa: 'Por que a volta começa pela saída?',
          opcoes: [
            { t: 'Porque é mais rápido.', por: 'A ordem não é por velocidade: é para o gradiente estar pronto.' },
            { t: 'Porque um nó só pode repassar o gradiente depois de receber tudo dos nós que vêm depois dele.', certa: true },
            { t: 'Tanto faz a ordem.', por: 'Se um nó repassar antes de receber, repassa um gradiente incompleto.' },
          ],
          erro: 'De onde vem o gradiente que um nó repassa?',
          dica: 'O gradiente vem da saída para trás.',
          solucao: 'Um nó só repassa depois de ter recebido tudo. Por isso a aula ordena o grafo e percorre de trás para frente.',
        }),
        ex('a1-para-tras', 'A volta inteira', {
          texto: `<p>Este autograd já tem <code>para_tras</code>, como o <code>backward</code> da aula.</p>`,
          tarefa: 'Monte <code>L = (x * y + z) * w</code>, chame <code>L.para_tras()</code> e mostre os quatro gradientes.',
          inicio: `${NO_BASICO}
x, y, z, w = No(3), No(-2), No(4), No(5)
`,
          dica: '<code>L = (x * y + z) * w</code>, <code>L.para_tras()</code> e <code>print(x.grad, y.grad, z.grad, w.grad)</code>.',
          solucao: `${NO_BASICO}
x, y, z, w = No(3), No(-2), No(4), No(5)
L = (x * y + z) * w
L.para_tras()
print(x.grad, y.grad, z.grad, w.grad)
`,
          checagem: `
tem('L')
if (x.grad, y.grad, z.grad, w.grad) != (-10, 15, 5, -2):
    falha('Os gradientes deviam ser -10, 15, 5 e -2. Chame L.para_tras().')
`,
          certo: 'Confira à mão: o gradiente de x é w · y = 5 · (−2) = −10.',
        }),
        ex('a1-conferir', 'Conferir com o passo', {
          texto: `<p>A aula confere cada gradiente com o passo pequeno. Se o autograd estiver certo, os dois números quase coincidem.</p>`,
          tarefa: 'Guarde em <code>numerica</code> a derivada medida com o passo dos dois lados: <code>(L(3 + h) - L(3 - h)) / (2 * h)</code>.',
          inicio: `${NO_BASICO}
def L(x):
    n = x if isinstance(x, No) else No(x)
    return n * n * n + n

x = No(3)
L(x).para_tras()

h = 0.0001
numerica = None
print(x.grad, numerica)
`,
          dica: '<code>numerica = (L(3 + h).valor - L(3 - h).valor) / (2 * h)</code>. O <code>.valor</code> pega o número de dentro do nó.',
          solucao: `${NO_BASICO}
def L(x):
    n = x if isinstance(x, No) else No(x)
    return n * n * n + n

x = No(3)
L(x).para_tras()

h = 0.0001
numerica = (L(3 + h).valor - L(3 - h).valor) / (2 * h)
print(x.grad, numerica)
`,
          checagem: `
tem('numerica')
if numerica is None or not perto(numerica, 28, 1e-4):
    falha('numerica devia dar perto de 28. Use .valor nos dois lados.')
`,
          certo: 'Os dois dão 28: 3 · 3² + 1. O autograd passou na conferência.',
        }),
      ],
    },
    {
      titulo: 'A rede e o treino',
      licoes: [
        ex('a1-neuronio', 'Um neurônio em código', {
          texto: `<p>Um neurônio com duas entradas: <code>o = tanh(x1·w1 + x2·w2 + b)</code>.</p>`,
          tarefa: 'Monte o neurônio em <code>o</code> e chame <code>o.para_tras()</code>.',
          inicio: `${NO_TUDO}
x1, x2 = No(1.0), No(-2.0)
w1, w2 = No(0.5), No(0.25)
b = No(0.3)

o = None
`,
          dica: '<code>o = (x1 * w1 + x2 * w2 + b).tanh()</code> e <code>o.para_tras()</code>.',
          solucao: `${NO_TUDO}
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
    falha('A saída devia ser tanh(0,3), perto de 0,29.')
if not perto(w2.grad, (1 - t * t) * -2.0):
    falha('Chame o.para_tras() para calcular os gradientes.')
`,
        }),
        ex('a1-parametros', 'Contar os parâmetros', {
          texto: `<p>Numa camada, cada neurônio tem um peso para cada entrada e mais um viés.</p>`,
          tarefa: 'Uma rede com 2 entradas, uma camada de 3 neurônios e uma saída de 1 neurônio. Quantos parâmetros ela tem?',
          campos: [{ rotulo: 'parâmetros =', resposta: 13 }],
          erro: 'Primeira camada: 3 neurônios × (2 pesos + 1 viés). Saída: 1 × (3 pesos + 1 viés).',
          dica: '3 × 3 = 9. Depois, 1 × 4 = 4.',
          solucao: 'camada: 3 × (2 + 1) = 9\nsaída: 1 × (3 + 1) = 4\ntotal: 13',
        }),
        ex('a1-perda', 'A perda quadrática', {
          texto: `<p>A perda da aula soma, em cada exemplo, o quadrado da diferença entre a previsão e o alvo.</p>`,
          tarefa: 'Previsões 0,5 e −1, alvos 1 e −1. Quanto vale a perda?',
          campos: [{ rotulo: 'perda =', resposta: 0.25 }],
          erro: '(0,5 − 1)² + (−1 − (−1))².',
          dica: '(−0,5)² = 0,25. O segundo exemplo está certo.',
          solucao: '(−0,5)² + 0² = 0,25',
        }),
        ex('a1-passo-descida', 'Um passo de descida', {
          texto: `<p>Treinar é mover cada peso um pouco <strong>contra</strong> o gradiente: <code>w = w − taxa · grad</code>.</p>`,
          tarefa: 'Com <code>w = 1</code>, gradiente 4 e taxa 0,1, qual é o novo <code>w</code>?',
          campos: [{ rotulo: 'novo w =', resposta: 0.6 }],
          erro: 'Tire de w a taxa vezes o gradiente.',
          dica: '0,1 × 4 = 0,4.',
          solucao: '1 − 0,4 = 0,6',
        }),
        ex('a1-lado', 'Para que lado mexer', {
          texto: `<p>O gradiente de um peso é positivo: se o peso subir, a perda sobe.</p>`,
          tarefa: 'Para a perda diminuir, o que fazer com esse peso?',
          opcoes: [
            { t: 'Aumentar.', por: 'Com gradiente positivo, aumentar o peso aumenta a perda.' },
            { t: 'Diminuir.', certa: true },
            { t: 'Deixar como está.', por: 'O gradiente diz que mexer ajuda.' },
          ],
          erro: 'Ande contra o gradiente.',
          dica: 'Gradiente positivo: subir o peso sobe a perda.',
          solucao: 'Diminuir: andar contra o gradiente.',
        }),
        ex('a1-treinar', 'Treinar um peso', {
          texto: `<p>Achar o <code>w</code> que faz <code>w · 3</code> chegar em 6. O gradiente da perda <code>(w·3 − 6)²</code> é <code>2 · (w·3 − 6) · 3</code>.</p>`,
          tarefa: 'Dentro do <code>for</code>, atualize <code>w</code> contra o gradiente.',
          inicio: `w = 0.0\ntaxa = 0.05\n\nfor passo in range(20):\n    grad = 2 * (w * 3 - 6) * 3\n    # atualize w aqui\n\nprint(w)\n`,
          dica: '<code>w = w - taxa * grad</code>, com o mesmo recuo do <code>grad</code>.',
          solucao: `w = 0.0\ntaxa = 0.05\n\nfor passo in range(20):\n    grad = 2 * (w * 3 - 6) * 3\n    w = w - taxa * grad\n\nprint(w)\n`,
          checagem: `
tem('w')
if not perto(w, 2, 1e-3):
    falha('w devia chegar perto de 2. Use w = w - taxa * grad dentro do for.')
`,
        }),
        ex('a1-taxa', 'Taxa grande demais', {
          texto: `<p>No exercício anterior, com taxa 0,2, cada passo pula para além do 2, cada vez mais longe.</p>`,
          tarefa: 'O que acontece com a perda?',
          opcoes: [
            { t: 'Diminui mais rápido.', por: 'Passando de um limite, o passo pula o mínimo.' },
            { t: 'Cresce sem parar: o treino explode.', certa: true },
            { t: 'Fica igual.', por: 'O peso muda a cada passo, e a perda junto.' },
          ],
          erro: 'Pense em passos enormes descendo uma ladeira.',
          dica: 'Cada passo cai do outro lado, mais longe.',
          solucao: 'Cresce sem parar: o treino explode.',
        }),
        ex('a1-esquecer-zerar', 'Esquecer de zerar', {
          texto: `<p>Num laço de treino, alguém esqueceu de zerar os gradientes antes de cada volta.</p>`,
          tarefa: 'O que acontece?',
          opcoes: [
            { t: 'O Python avisa com um erro.', por: 'Não há erro nenhum: o código roda normalmente.' },
            { t: 'Os gradientes se acumulam entre os passos, e os pesos andam errado, sem aviso.', certa: true },
            { t: 'Nada muda.', por: 'Com +=, o gradiente antigo continua somado ao novo.' },
          ],
          erro: 'Lembre do exercício de zerar o gradiente.',
          dica: '6, 12, 18...',
          solucao: 'Os gradientes se acumulam. Foi exatamente o erro que apareceu na aula.',
        }),
        ex('a1-final', 'Treinar com o seu autograd', {
          texto: `<p>Juntando tudo: achar <code>w</code> e <code>b</code> para que <code>w·x + b</code> acerte os exemplos (0, 1), (1, 3) e (2, 5). A resposta é <code>w = 2</code> e <code>b = 1</code>, mas o treino não sabe disso.</p>
<p>A cada passo: montar a perda, zerar os gradientes, fazer a volta e mover os dois contra o gradiente.</p>`,
          tarefa: 'Complete o laço: zere <code>w.grad</code> e <code>b.grad</code> antes da volta, e atualize <code>w.valor</code> e <code>b.valor</code> depois.',
          inicio: `${NO_TUDO}
xs = [0, 1, 2]
ys = [1, 3, 5]
w, b = No(0.0), No(0.0)
taxa = 0.05

for passo in range(200):
    perda = No(0)
    for x, y in zip(xs, ys):
        perda = perda + (w * x + b - y) ** 2
    # zere os gradientes
    perda.para_tras()
    # mova w e b contra o gradiente

print(w.valor, b.valor, perda.valor)
`,
          dica: '<code>w.grad = 0</code> e <code>b.grad = 0</code> antes da volta. Depois, <code>w.valor -= taxa * w.grad</code> e o mesmo para <code>b</code>.',
          solucao: `${NO_TUDO}
xs = [0, 1, 2]
ys = [1, 3, 5]
w, b = No(0.0), No(0.0)
taxa = 0.05

for passo in range(200):
    perda = No(0)
    for x, y in zip(xs, ys):
        perda = perda + (w * x + b - y) ** 2
    w.grad = 0
    b.grad = 0
    perda.para_tras()
    w.valor -= taxa * w.grad
    b.valor -= taxa * b.grad

print(w.valor, b.valor, perda.valor)
`,
          checagem: `
tem('w'); tem('b')
if not perto(w.valor, 2, 1e-2) or not perto(b.valor, 1, 1e-2):
    falha('w devia chegar perto de 2 e b perto de 1. Zere os gradientes e atualize os dois.')
`,
          certo: 'w chegou em 2 e b em 1, com um autograd escrito por você. É o mesmo laço que treina a rede da aula.',
        }),
      ],
    },
  ],
}
