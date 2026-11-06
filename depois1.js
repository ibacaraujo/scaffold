// Depois da aula 1: exercícios simples para praticar o que a aula do micrograd mostrou.
// Cada exercício é uma tarefa só: uma conta, uma escolha ou poucas linhas de código.

const ex = (id, titulo, passo) => ({ id, titulo, passos: [passo] })

const NO_VOLTA = `class No:
    def __init__(self, valor, filhos=()):
        self.valor = valor
        self.grad = 0
        self.filhos = filhos
        self.volta = lambda: None

    def __add__(self, outro):
        saida = No(self.valor + outro.valor, (self, outro))
        def volta():
            self.grad += saida.grad
            outro.grad += saida.grad
        saida.volta = volta
        return saida

    def __mul__(self, outro):
        saida = No(self.valor * outro.valor, (self, outro))
        def volta():
            self.grad += outro.valor * saida.grad
            outro.grad += self.valor * saida.grad
        saida.volta = volta
        return saida

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

export const DEPOIS_1 = {
  id: 'depois',
  titulo: 'Depois da aula',
  exercicios: true,
  modulos: [
    {
      titulo: 'Exercícios da aula 1',
      licoes: [
        ex('a1-passo', 'Medir a inclinação com um passo', {
          texto: `<p>A aula mede a derivada dando um passo pequeno <code>h</code>: quanto <code>f</code> subiu, dividido por <code>h</code>.</p>`,
          tarefa: 'Com <code>f(x) = x²</code>, <code>x = 3</code> e <code>h = 0,01</code>, quanto dá <code>(f(3,01) − f(3)) / 0,01</code>?',
          campos: [{ rotulo: 'inclinação ≈', resposta: 6.01, tol: 0.0001 }],
          erro: 'f(3,01) = 9,0601 e f(3) = 9. Divida a diferença por 0,01.',
          dica: '9,0601 − 9 = 0,0601. Depois, 0,0601 ÷ 0,01.',
          solucao: 'f(3,01) = 9,0601\n9,0601 − 9 = 0,0601\n0,0601 ÷ 0,01 = 6,01',
          certo: 'Bem perto de 6, a derivada exata de x² em 3.',
        }),
        ex('a1-inclinacao', 'A inclinação em código', {
          texto: `<p>O mesmo passo pequeno, agora numa função de Python.</p>`,
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
        ex('a1-mult', 'O gradiente numa multiplicação', {
          texto: `<p>Em <code>L = x · y</code>, o gradiente de cada lado é o valor do outro lado.</p>`,
          tarefa: 'Com <code>x = 3</code> e <code>y = −2</code>, qual é o gradiente de <code>x</code> e o de <code>y</code>?',
          campos: [{ rotulo: 'grad de x =', resposta: -2 }, { rotulo: 'grad de y =', resposta: 3 }],
          erro: 'Cada lado recebe o valor do outro.',
          dica: 'O gradiente de x é o valor de y.',
          solucao: 'grad de x = y = −2\ngrad de y = x = 3',
        }),
        ex('a1-soma', 'O gradiente numa soma', {
          texto: `<p>Em <code>s = x + y</code>, a soma repassa o gradiente que chegou nela, igual, para os dois lados.</p>`,
          tarefa: 'Depois, <code>L = s · 3</code>. Qual é o gradiente de <code>s</code>? E o de <code>x</code>?',
          campos: [{ rotulo: 'grad de s =', resposta: 3 }, { rotulo: 'grad de x =', resposta: 3 }],
          erro: 'Na multiplicação por 3, o gradiente de s é 3. A soma repassa esse valor para x.',
          dica: 'L = s · 3: o gradiente de s é o outro lado, 3.',
          solucao: 'grad de s = 3\ngrad de x = grad de s = 3',
        }),
        ex('a1-cadeia', 'A regra da cadeia', {
          texto: `<p><code>s = x · y</code> e <code>L = s · 5</code>, com <code>x = 2</code> e <code>y = 4</code>. O gradiente que chega em <code>s</code> é multiplicado pela derivada local.</p>`,
          tarefa: 'Qual é o gradiente de <code>s</code>? E o de <code>x</code>?',
          campos: [{ rotulo: 'grad de s =', resposta: 5 }, { rotulo: 'grad de x =', resposta: 20 }],
          erro: 'grad de x = grad de s × y.',
          dica: 'O gradiente de s é 5. Depois, 5 × 4.',
          solucao: 'grad de s = 5\ngrad de x = 5 × y = 5 × 4 = 20',
        }),
        ex('a1-duas-vezes', 'Um valor usado duas vezes', {
          texto: `<p>Quando um valor aparece duas vezes, os gradientes das duas partes se <strong>somam</strong>.</p>`,
          tarefa: 'Com <code>a = 4</code>: qual é o gradiente de <code>a</code> em <code>b = a + a</code>? E em <code>c = a · a</code>?',
          campos: [{ rotulo: 'em a + a =', resposta: 2 }, { rotulo: 'em a · a =', resposta: 8 }],
          erro: 'Em a + a, cada parte dá 1. Em a · a, cada parte dá o valor do outro lado, 4.',
          dica: '1 + 1, e 4 + 4.',
          solucao: 'a + a: 1 + 1 = 2\na · a: 4 + 4 = 8',
        }),
        ex('a1-tanh', 'A derivada da tanh', {
          texto: `<p>A derivada de <code>tanh(x)</code> é <code>1 − tanh(x)²</code>.</p>`,
          tarefa: 'Se <code>tanh(x) = 0,6</code>, qual é a derivada?',
          campos: [{ rotulo: 'derivada =', resposta: 0.64 }],
          erro: 'Calcule 0,6², e tire de 1.',
          dica: '0,6² = 0,36.',
          solucao: '1 − 0,6² = 1 − 0,36 = 0,64',
        }),
        ex('a1-exp', 'A derivada da exponencial', {
          texto: `<p>A derivada de <code>e^x</code> é o próprio <code>e^x</code>.</p>`,
          tarefa: 'Se <code>e^x = 5</code>, qual é a derivada nesse ponto?',
          campos: [{ rotulo: 'derivada =', resposta: 5 }],
          erro: 'A derivada é igual ao próprio valor.',
          dica: 'É o mesmo número.',
          solucao: '5',
        }),
        ex('a1-mais-igual', 'Consertar o =', {
          texto: `<p>Este autograd usa <code>=</code> na volta. Com <code>a + a</code>, o segundo apaga o primeiro, e <code>a.grad</code> sai 1 em vez de 2.</p>`,
          tarefa: 'Troque <code>=</code> por <code>+=</code> nas duas linhas da volta.',
          inicio: `class No:\n    def __init__(self, valor):\n        self.valor = valor\n        self.grad = 0\n\n    def __add__(self, outro):\n        saida = No(self.valor + outro.valor)\n        def volta():\n            self.grad = saida.grad\n            outro.grad = saida.grad\n        saida.volta = volta\n        return saida\n\na = No(3)\nb = a + a\nb.grad = 1\nb.volta()\nprint(a.grad)\n`,
          dica: '<code>self.grad += saida.grad</code> e <code>outro.grad += saida.grad</code>.',
          solucao: `class No:\n    def __init__(self, valor):\n        self.valor = valor\n        self.grad = 0\n\n    def __add__(self, outro):\n        saida = No(self.valor + outro.valor)\n        def volta():\n            self.grad += saida.grad\n            outro.grad += saida.grad\n        saida.volta = volta\n        return saida\n\na = No(3)\nb = a + a\nb.grad = 1\nb.volta()\nprint(a.grad)\n`,
          checagem: `
tem('No')
a1 = No(3); b1 = a1 + a1; b1.grad = 1; b1.volta()
if a1.grad != 2:
    falha('a.grad devia ser 2. Use += nas duas linhas da volta.')
`,
        }),
        ex('a1-zerar', 'Zerar o gradiente', {
          texto: `<p>Com <code>+=</code>, o gradiente da volta anterior continua lá. Por isso a aula zera o gradiente antes de cada volta.</p>`,
          tarefa: 'Zere <code>a.grad</code> no começo do <code>for</code>, para aparecer 6 nas três linhas.',
          inicio: `class No:\n    def __init__(self, valor):\n        self.valor = valor\n        self.grad = 0\n\n    def __mul__(self, outro):\n        saida = No(self.valor * outro.valor)\n        def volta():\n            self.grad += outro.valor * saida.grad\n            outro.grad += self.valor * saida.grad\n        saida.volta = volta\n        return saida\n\na = No(3)\nfor passo in range(3):\n    b = a * a\n    b.grad = 1\n    b.volta()\n    print(a.grad)\n`,
          dica: 'Uma linha nova, logo no começo do <code>for</code>: <code>a.grad = 0</code>.',
          solucao: `class No:\n    def __init__(self, valor):\n        self.valor = valor\n        self.grad = 0\n\n    def __mul__(self, outro):\n        saida = No(self.valor * outro.valor)\n        def volta():\n            self.grad += outro.valor * saida.grad\n            outro.grad += self.valor * saida.grad\n        saida.volta = volta\n        return saida\n\na = No(3)\nfor passo in range(3):\n    a.grad = 0\n    b = a * a\n    b.grad = 1\n    b.volta()\n    print(a.grad)\n`,
          checagem: `
if saida.split() != ['6', '6', '6']:
    falha('Deviam aparecer 6, 6 e 6. Zere a.grad antes de cada volta.')
`,
        }),
        ex('a1-potencia', 'A volta da potência', {
          texto: `<p>Para <code>x ** n</code>, a derivada local é <code>n · x^(n−1)</code>, vezes o gradiente que chegou na saída.</p>`,
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
        ex('a1-para-tras', 'A volta inteira', {
          texto: `<p>Este autograd já tem <code>para_tras</code>, que faz a volta pelo grafo inteiro, como o <code>backward</code> da aula.</p>`,
          tarefa: 'Monte <code>L = (x * y + z) * w</code>, chame <code>L.para_tras()</code> e mostre os quatro gradientes.',
          inicio: `${NO_VOLTA}
x, y, z, w = No(3), No(-2), No(4), No(5)
`,
          dica: '<code>L = (x * y + z) * w</code>, <code>L.para_tras()</code> e <code>print(x.grad, y.grad, z.grad, w.grad)</code>.',
          solucao: `${NO_VOLTA}
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
        ex('a1-neuronio', 'O gradiente de um peso', {
          texto: `<p>Num neurônio <code>o = tanh(x · w + b)</code>, o gradiente do peso é <code>(1 − o²) · x</code>.</p>`,
          tarefa: 'Com <code>o = 0,8</code> e <code>x = 2</code>, qual é o gradiente de <code>w</code>?',
          campos: [{ rotulo: 'grad de w =', resposta: 0.72 }],
          erro: '1 − 0,8² = 0,36. Multiplique por x.',
          dica: '0,36 × 2.',
          solucao: '1 − 0,64 = 0,36\n0,36 × 2 = 0,72',
        }),
        ex('a1-passo-descida', 'Um passo de descida', {
          texto: `<p>Treinar é mover cada peso um pouco <strong>contra</strong> o gradiente: <code>w = w − taxa · grad</code>.</p>`,
          tarefa: 'Com <code>w = 1</code>, gradiente 4 e taxa 0,1, qual é o novo <code>w</code>?',
          campos: [{ rotulo: 'novo w =', resposta: 0.6 }],
          erro: 'Tire de w a taxa vezes o gradiente.',
          dica: '0,1 × 4 = 0,4.',
          solucao: '1 − 0,1 × 4 = 1 − 0,4 = 0,6',
        }),
        ex('a1-sinal', 'Para que lado mexer', {
          texto: `<p>O gradiente de um peso é positivo: se o peso subir um pouco, a perda sobe.</p>`,
          tarefa: 'Para a perda diminuir, o que fazer com esse peso?',
          opcoes: [
            { t: 'Aumentar o peso.', por: 'Com gradiente positivo, aumentar o peso aumenta a perda.' },
            { t: 'Diminuir o peso.', certa: true },
            { t: 'Deixar como está.', por: 'O gradiente diz que mexer ajuda: só precisa ser para o lado certo.' },
          ],
          erro: 'Ande contra o gradiente.',
          dica: 'Gradiente positivo: subir o peso sobe a perda.',
          solucao: 'Diminuir o peso: andar contra o gradiente.',
        }),
        ex('a1-treinar', 'Treinar um peso', {
          texto: `<p>Achar o <code>w</code> que faz <code>w · 3</code> chegar em 6. A perda é <code>(w · 3 − 6)²</code>, e o gradiente dela é <code>2 · (w · 3 − 6) · 3</code>.</p>`,
          tarefa: 'Dentro do <code>for</code>, atualize <code>w</code> contra o gradiente.',
          inicio: `w = 0.0\ntaxa = 0.05\n\nfor passo in range(20):\n    grad = 2 * (w * 3 - 6) * 3\n    # atualize w aqui\n\nprint(w)\n`,
          dica: '<code>w = w - taxa * grad</code>, com o mesmo recuo da linha do <code>grad</code>.',
          solucao: `w = 0.0\ntaxa = 0.05\n\nfor passo in range(20):\n    grad = 2 * (w * 3 - 6) * 3\n    w = w - taxa * grad\n\nprint(w)\n`,
          checagem: `
tem('w')
if not perto(w, 2, 1e-3):
    falha('w devia chegar perto de 2. Use w = w - taxa * grad dentro do for.')
`,
          certo: 'w chegou em 2 sozinho, só seguindo o gradiente: é o laço de treino da aula, com um peso só.',
        }),
        ex('a1-taxa', 'Taxa grande demais', {
          texto: `<p>No exercício anterior, com taxa 0,05, o treino chega em 2. Com taxa 0,2, cada passo pula para além do 2, cada vez mais longe.</p>`,
          tarefa: 'O que acontece com a perda quando a taxa é grande demais?',
          opcoes: [
            { t: 'Diminui mais rápido.', por: 'Até certo ponto, sim. Passando dele, o passo pula o mínimo.' },
            { t: 'Cresce sem parar: o treino explode.', certa: true },
            { t: 'Fica igual.', por: 'O peso muda a cada passo, e a perda junto.' },
          ],
          erro: 'Pense em passos enormes descendo uma ladeira.',
          dica: 'Cada passo cai do outro lado do mínimo, mais longe.',
          solucao: 'A perda cresce sem parar: o treino explode.',
        }),
      ],
    },
  ],
}
