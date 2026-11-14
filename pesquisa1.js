// Research: the first paper of the day (Nov 13, 2026). The Research track is in English. It
// records, one per day, papers from the research line (language models, and language as a tool for
// learning, in the spirit of Vygotsky), implemented at their core so that the implementation teaches.
//
// The paper: Huang, Dwivedi, Ma, Moreno & Liu (2026), "Latent Feedback Is a Compute and Data Amplifier:
// Scaling Law for Latent Feedback Transformers on Repeated Data" (Institute of Foundation Models, USC,
// CMU), published on alphaXiv on Nov 13, 2026. The core: each token's top-layer state enters the next
// token's input through a map W (equation 1), trained with two passes, the first without gradient
// (equation 2 and Algorithm 1). On repeated data, this beats spending the same compute on more epochs.
//
// Everything runs in the browser, with numpy and a hand-written backward pass. The Transformer becomes
// an MLP with a 3-letter window, like the one in makemore (the baseline the course already built), and
// the text is a tiny made-up language, repeated for many epochs. The first pass runs letter by letter,
// which gives exactly the decoding states (the fixed point of equation 2). What reproduces is the shape
// of the result: at equal compute, the model with feedback ends below the one without.

// Each code step runs on its own, so each one carries what it needs. The blocks below add up.
const DATA = `import numpy as np

# A tiny language: sentences whose pronoun agrees with the subject at the start.
def sentences(n, seed):
    r = np.random.default_rng(seed)
    subjects = [('the boy', 'he'), ('the girl', 'she'), ('the king', 'he'), ('the queen', 'she'), ('the father', 'he'), ('the mother', 'she')]
    objects = ['the cake', 'the ball', 'the river', 'the moon', 'the sun', 'the house']
    verbs = ['saw', 'wanted', 'took', 'found']
    ends = ['tired', 'happy', 'wet', 'quiet']
    text = ''
    for _ in range(n):
        s, pronoun = subjects[r.integers(6)]
        middle = ' and '.join(verbs[r.integers(4)] + ' ' + objects[r.integers(6)] for _ in range(r.integers(1, 3)))
        text += s + ' ' + middle + ' and then ' + pronoun + ' was ' + ends[r.integers(4)] + '. '
    return text

text_train = sentences(150, 1)   # the unique data, repeated every epoch
text_valid = sentences(150, 2)   # new sentences, only for measuring
chars = sorted(set(text_train + text_valid))
V = len(chars)
stoi = {c: i for i, c in enumerate(chars)}
`

const ENCODE = `train_data = np.array([stoi[c] for c in text_train])
valid_data = np.array([stoi[c] for c in text_valid])
`

const model = (lineH) => `
K, D, H = 3, 12, 64   # the window has 3 letters; each letter becomes 12 numbers; the state has 64

def init(seed):
    r = np.random.default_rng(seed)
    return {'E': r.normal(0, 0.3, (V, D)),
            'W1': r.normal(0, 1 / np.sqrt(K * D), (K * D, H)), 'b1': np.zeros(H),
            'W2': r.normal(0, 1 / np.sqrt(H), (H, V)) * 0.5, 'b2': np.zeros(V),
            'Wf': r.normal(0, 0.02, (H, K * D))}   # the feedback map W

def windows(seq, pos):
    # the 3 letters before each position
    return np.stack([seq[pos - K + j] for j in range(K)], -1)

def rms(h):
    return h / np.sqrt((h ** 2).mean(-1, keepdims=True) + 1e-6)

def forward(P, ctx, fb):
    e = P['E'][ctx].reshape(*ctx.shape[:2], K * D)    # the 3 window letters, side by side
    u = e + rms(fb) @ P['Wf']                         # the input: the letters plus the feedback
${lineH}
    logits = h @ P['W2'] + P['b2']                    # one score for each possible letter
    return e, u, h, logits
`
const H_RIGHT = `    h = np.tanh(u @ P['W1'] + P['b1'])                # the top-layer state`
const MODEL = model(H_RIGHT)

const statesWith = (line) => `
def states(P, ctx):
    # The first pass, letter by letter: each letter's top state enters the next one.
    B, T, _ = ctx.shape
    e = P['E'][ctx].reshape(B, T, K * D)
    h = np.zeros((B, H))
    hs = np.zeros((B, T, H))
    for t in range(T):
${line}
        hs[:, t] = h
    return hs

def shift(h):
    # letter t receives the state of letter t - 1; the first one receives zeros
    z = np.zeros_like(h)
    z[:, 1:] = h[:, :-1]
    return z
`
const STATE_RIGHT = `        h = np.tanh((e[:, t] + rms(h) @ P['Wf']) @ P['W1'] + P['b1'])`
const STATES = statesWith(STATE_RIGHT)

const stepWith = (lineFb) => `
def step(P, seq, rng, feedback, lr, B=32, T=24):
    start = rng.integers(K, len(seq) - T - 1, B)
    pos = start[:, None] + np.arange(T)[None]
    ctx, y = windows(seq, pos), seq[pos]
    fb = np.zeros((B, T, H))
    if feedback and rng.random() > 0.15:      # p = 0.15: sometimes, a single pass
${lineFb}
    e, u, h, lg = forward(P, ctx, fb)          # pass 2: the only one with gradient
    # The loss: -log of the probability of the right letter.
    lg = lg - lg.max(-1, keepdims=True)
    p = np.exp(lg)
    p /= p.sum(-1, keepdims=True)
    n = B * T
    loss = -np.log(p.reshape(n, V)[np.arange(n), y.reshape(n)]).mean()
    # The backward pass, by hand, from the end to the start (like micrograd, with matrices).
    dl = p.reshape(n, V).copy()
    dl[np.arange(n), y.reshape(n)] -= 1
    dl /= n
    hf = h.reshape(n, H)
    g = {'W2': hf.T @ dl, 'b2': dl.sum(0)}
    dh = (dl @ P['W2'].T) * (1 - hf ** 2)
    g['W1'] = u.reshape(n, -1).T @ dh
    g['b1'] = dh.sum(0)
    du = dh @ P['W1'].T
    g['Wf'] = rms(fb).reshape(n, H).T @ du    # the feedback enters as a fixed input
    g['E'] = np.zeros_like(P['E'])
    np.add.at(g['E'], ctx.reshape(n, K), du.reshape(n, K, D))
    for k in P:
        P[k] -= lr * g[k]
    return loss

def train(feedback, steps, seed=0, lr=0.5):
    P = init(seed)
    rng = np.random.default_rng(seed + 10)
    curve = []
    for t in range(steps):
        curve.append(step(P, train_data, rng, feedback, lr * (1 - 0.9 * t / steps)))
    return P, curve

def losses(P, seq, feedback):
    # The loss at each letter of a text, decoding letter by letter.
    pos = np.arange(K, len(seq))
    ctx = windows(seq, pos)[None]
    fb = shift(states(P, ctx)) if feedback else np.zeros((1, len(pos), H))
    _, _, _, lg = forward(P, ctx, fb)
    lg = lg[0] - lg[0].max(-1, keepdims=True)
    lp = lg - np.log(np.exp(lg).sum(-1, keepdims=True))
    return -lp[np.arange(len(pos)), seq[pos]]
`
const FB_RIGHT = `        fb = shift(states(P, ctx))              # pass 1: no gradient`
const TRAIN = stepWith(FB_RIGHT)
const ALL = DATA + ENCODE + MODEL + STATES + TRAIN

const ex = (id, titulo, porque, passo) => ({ id, titulo, porque, passos: [passo] })

export const PESQUISA_1 = {
  n: 11,
  titulo: 'Latent Feedback Is a Compute and Data Amplifier',
  pesquisa: true,
  semFicha: true,
  paper: {
    titulo: 'Latent Feedback Is a Compute and Data Amplifier',
    autores: 'Huang et al.',
    ano: 2026,
    url: 'https://www.alphaxiv.org/abs/2611.latent-feedback-transformers-scaling-law',
  },
  aula: 'https://www.alphaxiv.org/abs/2611.latent-feedback-transformers-scaling-law',
  intro: 'Nov 13, 2026. First the method in one diagram; then the paper, section by section, with every formula worked by hand and in code; then the core, implemented in the browser.',
  partes: [
    {
      id: 'matematica',
      titulo: 'Read the paper',
      modulos: [
        {
          titulo: 'The paper',
          licoes: [
            {
              id: 'r1-capa',
              titulo: 'The paper in one diagram',
              porque: 'Before the pages, the whole method at once. Then we read the paper section by section, in its own order: the introduction, the background, the comparison and the results.',
              passos: [
                {
                  texto: `<p>Today's paper: <strong>Latent Feedback Is a Compute and Data Amplifier: Scaling Law for Latent Feedback Transformers on Repeated Data</strong>, by Benhao Huang, Chaitanya Dwivedi, Xuezhe Ma, Alexander Moreno and Hector Liu (Institute of Foundation Models, USC and CMU), published on November 13, 2026.</p>
<p>Its question, in one sentence: <em>when good data runs out, is it better to train on the same data again, or to let the model feed its own state into the next token?</em></p>
<p>Its answer: once each parameter has seen enough unique data, feeding the state back wins. It reaches the same loss with up to 48% less compute, or with up to 47% less unique data.</p>
<p>The diagram on the right is the method in five stages. Click each one. Then, lesson by lesson, we read the paper in its own order:</p>
<ul><li><strong>§1 Introduction</strong>: why repeated data pays less;</li><li><strong>§2 Background</strong>: the feedback equation and how to train it;</li><li><strong>§3 Scaling law</strong>: how the two models are compared;</li><li><strong>§5 Results</strong>: what the numbers say.</li></ul>`,
                  figura: {
                    modo: 'paper',
                    desenho: 'feedback',
                    tag: 'Research · Nov 13, 2026',
                    titulo: 'Latent Feedback Is a Compute and Data Amplifier',
                    autores: 'Huang, Dwivedi, Ma, Moreno & Liu (IFM, USC, CMU)',
                    abrir: 'open the paper',
                    url: 'https://www.alphaxiv.org/abs/2611.latent-feedback-transformers-scaling-law',
                    rotulo: 'The latent feedback Transformer: each token\'s top-layer state enters the next token\'s input through a map W.',
                    etapas: [
                      ['A plain Transformer', 'Each token enters at the bottom, goes through the layers and comes out on top as a <strong>state</strong>, <code>h</code>. The prediction of the next token comes from that state. Then the state is thrown away.'],
                      ['The top-layer state', 'The state <code>h</code> of the last layer is the most processed summary the model has of that point in the text. It has already gone through every layer.'],
                      ['The feedback', 'The paper\'s idea: instead of throwing the state away, feed it into the next token\'s <strong>input</strong>, through a map <code>W</code>: <code>u<sub>t</sub> = e<sub>t</sub> + W rms(h<sub>t−1</sub>)</code>. Each token starts out knowing what the previous one concluded.'],
                      ['Two passes', 'During training, the top states do not exist yet. So the model runs <strong>twice</strong>: the first pass, without gradient, only to get the states; the second, with them, to learn. This costs about 1.2 times plain training.'],
                      ['When data runs out', 'The fair comparison: with the same compute, the plain Transformer trains more epochs on the same data, and the feedback model trains fewer. On repeated data, feedback reaches the same loss with up to <strong>48% less compute</strong>.'],
                    ],
                  },
                  tarefa: 'After going through the five stages: besides the token itself, what enters a token\'s input?',
                  opcoes: [
                    { t: 'The next token, so the model can peek at the future.', por: 'The model never sees the future: that is what it predicts. See stage 3.' },
                    { t: 'The previous token\'s top-layer state, through a map W.', certa: true },
                    { t: 'A copy of all the model\'s weights.', por: 'The weights do not enter the input. See stage 3.' },
                  ],
                  erro: 'Go back to stage 3 of the diagram.',
                  dica: 'In stage 3, the arrow leaves the top of one token and lands at the input of the next.',
                  solucao: 'The previous token\'s top-layer state: u_t = e_t + W rms(h_{t−1}).',
                  certo: 'That is the core. Now the paper, section by section.',
                },
              ],
            },
          ],
        },
        {
          titulo: '§1 Introduction',
          licoes: [
            {
              id: 'r1-epocas',
              titulo: 'When data runs out',
              porque: 'The paper opens with a practical problem: high-quality text is running out, and reading the same text again teaches less each time. Everything else in the paper is a way around this.',
              passos: [
                {
                  texto: `<p>A language model learns by reading text. One <strong>epoch</strong> is one full read of the training data. When there is no more good text, the usual way out is to read the same text again: a second epoch, a third, a fourth.</p>
<p>The problem is that each repeat teaches less than the one before. The paper measures this with a rule from an earlier paper (Muennighoff et al., 2023):</p>
<div class="trecho"><p class="trecho__fonte">From the paper, §3</p><p>Epoch <i>k</i> is worth about <span class="eq"><i>e</i><sup>−(<i>k</i>−1)/<i>R</i>*</sup></span> of a fresh one.</p></div>
<p>Let us read this slowly, piece by piece.</p>
<ul><li><strong><i>e</i></strong> is a fixed number, about <code>2.718</code>. It shows up whenever something shrinks (or grows) by the same fraction at every step.</li>
<li>A <strong>negative exponent</strong> means "one divided by": <i>e</i><sup>−1</sup> = 1 / <i>e</i> ≈ 1 / 2.718 ≈ 0.368. The bigger the exponent, the smaller the result.</li>
<li><strong><i>R</i>*</strong> is a number fitted from data. It says how slowly the worth decays: a big <i>R</i>* means repeats stay useful for longer.</li></ul>
<p><strong>A worked example</strong>, with <i>R</i>* = 2:</p>
<ul><li>Epoch 1: the exponent is −(1 − 1) / 2 = 0. And <i>e</i><sup>0</sup> = 1, because any number to the power 0 is 1. The first read is worth one fresh read, as it should.</li>
<li>Epoch 3: the exponent is −(3 − 1) / 2 = −1. So the worth is <i>e</i><sup>−1</sup> ≈ 0.368: the third read teaches about a third of a fresh one.</li></ul>
<p>The bars on the right show this. Move <i>R</i>* and watch the bars fall faster or slower.</p>`,
                  figura: { modo: 'epocas', rEstrela: 2, epocas: 4 },
                  tarefa: 'With <i>R</i>* = 2, what is the exponent for epoch <i>k</i> = 2? Then use <i>e</i><sup>−0.5</sup> ≈ 0.607 for the worth.',
                  campos: [{ rotulo: 'exponent =', resposta: -0.5, tol: 0.001 }, { rotulo: 'worth of epoch 2 =', resposta: 0.607, tol: 0.01 }],
                  erro: 'The exponent is −(k − 1) / R*. Put k = 2 and R* = 2.',
                  dica: '−(2 − 1) / 2 = −1/2 = −0.5. The worth is e<sup>−0.5</sup>, and the task gives it: about 0.607. You can also read it off the second bar.',
                  solucao: 'Exponent: −(2 − 1) / 2 = −0.5. Worth: e^(−0.5) ≈ 0.607, about 61% of a fresh read.',
                  certo: 'The second bar on the right shows the same 0.607. Now let Python do the arithmetic.',
                },
                {
                  texto: `<p>Karpathy's habit: as soon as a formula appears, write it in code and print it. The code is the formula, with nothing hidden.</p>
<p>In Python, <i>e</i><sup>x</sup> is <code>math.exp(x)</code>. So the paper's rule becomes one line:</p>
<pre><code>math.exp(-(k - 1) / R)</code></pre>
<p>Read it from the inside out: <code>k - 1</code>, then divide by <code>R</code>, then the minus sign, then <code>exp</code>. It is exactly <i>e</i><sup>−(<i>k</i>−1)/<i>R</i>*</sup>.</p>`,
                  tarefa: 'Complete <code>worth(k, R)</code> with that line. The code prints the worth of epochs 1 to 4, and their sum.',
                  inicio: `import math

def worth(k, R):
    return 1.0   # replace: the paper's rule, e to the power -(k - 1) / R

R = 2
for k in range(1, 5):
    print(f"epoch {k}: worth {worth(k, R):.3f}")

total = sum(worth(k, R) for k in range(1, 5))
print(f"4 epochs are worth {total:.3f} fresh epochs")
`,
                  dica: '<code>return math.exp(-(k - 1) / R)</code>.',
                  solucao: `import math

def worth(k, R):
    return math.exp(-(k - 1) / R)

R = 2
for k in range(1, 5):
    print(f"epoch {k}: worth {worth(k, R):.3f}")

total = sum(worth(k, R) for k in range(1, 5))
print(f"4 epochs are worth {total:.3f} fresh epochs")
`,
                  checagem: `
if abs(worth(2, 2) - 0.60653) > 1e-3 or abs(worth(1, 2) - 1) > 1e-9:
    falha('For k = 2 and R = 2 the worth should be about 0.607, and for k = 1 exactly 1. Use math.exp(-(k - 1) / R).')
`,
                  certo: 'Four reads of the same data are worth only about 2.2 fresh ones. That is the waste the paper wants to avoid: compute spent on repeats buys less and less.',
                },
              ],
            },
          ],
        },
        {
          titulo: '§2 Background',
          licoes: [
            {
              id: 'r1-estado',
              titulo: 'The top-layer state',
              porque: 'The feedback sends back one specific vector of the model: the last layer\'s state. Before the equation, it is worth seeing what that vector is.',
              passos: [
                {
                  texto: `<p>A neural network is a sequence of layers. Each layer receives a list of numbers (a <strong>vector</strong>), does some arithmetic, and passes another vector on.</p>
<p>In a Transformer, every token of the text gets its own column of vectors, one per layer. The vector that leaves the <strong>last</strong> layer, at the position of a token, is the <strong>top-layer state</strong>. The paper calls it <i>h</i>.</p>
<p>The prediction of the next token is read from <i>h</i>. So <i>h</i> is the result of all the work the model did at that position. In a plain Transformer, once the prediction is made, <i>h</i> is not used again: the next token starts from the bottom layer.</p>
<div class="trecho"><p class="trecho__fonte">From the paper, §1</p><p>A latent feedback Transformer feeds each token's top-layer state into the next token's input.</p></div>`,
                  tarefa: 'Why is the top-layer state a good candidate to pass on?',
                  opcoes: [
                    { t: 'Because it is the most processed vector: it has gone through every layer.', certa: true },
                    { t: 'Because it is the smallest vector in the model.', por: 'Size is not the reason. Think about how much computation has already gone into it.' },
                    { t: 'Because it is the written word itself.', por: 'The written word is the output. The state is the vector the output is read from.' },
                  ],
                  erro: 'Think about the path the vector took to get to the top.',
                  dica: 'It came out of the last layer.',
                  solucao: 'Because it has gone through every layer: it is the most elaborate summary of that point in the text.',
                  certo: 'Passing it on gives the next token, right at its input, what the previous one concluded at the top.',
                },
              ],
            },
            {
              id: 'r1-equacao',
              titulo: 'Equation (1): the feedback',
              porque: 'Equation (1) is the core of the paper. It has three pieces: the token\'s own input, a normalization called rms, and a matrix W. We take them one at a time, by hand and then in code.',
              passos: [
                {
                  texto: `<div class="trecho"><p class="trecho__fonte">From the paper, §2, equation (1)</p><p class="eq eq--grande"><i>u<sub>t</sub></i> = <i>e<sub>t</sub></i> + <i>W</i> rms(<i>h</i><sub><i>t</i>−1</sub>)</p></div>
<p>Each symbol, in words:</p>
<ul><li><i>t</i> is the position of the token in the text: 1, 2, 3, …</li>
<li><i>e<sub>t</sub></i> is the usual input of token <i>t</i>: its embedding, a vector.</li>
<li><i>h</i><sub><i>t</i>−1</sub> is the top-layer state of the <em>previous</em> token.</li>
<li>rms puts that state on a standard scale.</li>
<li><i>W</i> is a matrix the model learns. It turns the state into a vector the same size as <i>e<sub>t</sub></i>, so the two can be added.</li>
<li><i>u<sub>t</sub></i> is what actually enters the layers: the token plus what the previous token concluded.</li></ul>
<p><strong>First piece: rms.</strong> rms stands for "root mean square". It is three operations, in this order:</p>
<ol><li><strong>square</strong> every number of the vector;</li><li>take the <strong>mean</strong> of those squares;</li><li>take the square <strong>root</strong> of that mean.</li></ol>
<p>Then the vector is divided by that number. Worked example, <i>h</i> = (3, 4):</p>
<ol><li>squares: 3² = 9 and 4² = 16;</li><li>mean: (9 + 16) / 2 = 12.5;</li><li>root: √12.5 ≈ 3.536.</li></ol>
<p>So rms(<i>h</i>) = (3 / 3.536, 4 / 3.536) ≈ (0.849, 1.131).</p>
<p>Why do this? After dividing, the mean of the squares is exactly 1, whatever the original size. A huge state cannot drown the token's own input.</p>`,
                  tarefa: 'Do the three operations for <i>h</i> = (6, 8): the mean of the squares, then the square root.',
                  campos: [{ rotulo: 'mean of the squares =', resposta: 50, tol: 0.01 }, { rotulo: 'root =', resposta: 7.071, tol: 0.01 }],
                  erro: 'Square each number (36 and 64), take their mean, then the square root.',
                  dica: '(36 + 64) / 2 = 50, and √50 ≈ 7.071.',
                  solucao: 'Squares: 36 and 64. Mean: 50. Root: √50 ≈ 7.071. So rms(6, 8) = (6/7.071, 8/7.071) ≈ (0.849, 1.131): the same as for (3, 4), because (6, 8) points in the same direction.',
                  certo: 'rms(6, 8) is the same vector as rms(3, 4): rms keeps the direction and throws away the size.',
                },
                {
                  texto: `<p>Now the same three operations in code, with numpy, the library Karpathy uses for arrays of numbers. With numpy, an operation on an array applies to every number at once:</p>
<pre><code>h ** 2          # squares every number
(h ** 2).mean() # their mean
np.sqrt(...)    # the square root</code></pre>
<p>The code has each operation on its own line, with a name, just like the three steps above.</p>`,
                  tarefa: 'Fill in the line <code>root = ...</code>: the square root of <code>mean</code>, with <code>np.sqrt</code>.',
                  inicio: `import numpy as np

h = np.array([3.0, 4.0])

squares = h ** 2           # 1. square every number
mean = squares.mean()      # 2. the mean of the squares
root = 1.0                 # 3. replace: the square root of the mean
out = h / root             # divide the vector by it

print("squares:", squares)
print("mean:", mean)
print("root:", round(root, 3))
print("rms(h):", out.round(3))
print("mean of the squares after rms:", (out ** 2).mean().round(3))
`,
                  dica: '<code>root = np.sqrt(mean)</code>.',
                  solucao: `import numpy as np

h = np.array([3.0, 4.0])

squares = h ** 2           # 1. square every number
mean = squares.mean()      # 2. the mean of the squares
root = np.sqrt(mean)       # 3. the square root of the mean
out = h / root             # divide the vector by it

print("squares:", squares)
print("mean:", mean)
print("root:", round(root, 3))
print("rms(h):", out.round(3))
print("mean of the squares after rms:", (out ** 2).mean().round(3))
`,
                  checagem: `
if abs(root - 3.53553) > 1e-3:
    falha('The root should be about 3.536, the square root of 12.5. Use np.sqrt(mean).')
`,
                  certo: 'The last line printed 1.0: after rms, the mean of the squares is always 1. The Implement part uses this same function, written in one line.',
                },
                {
                  texto: `<p><strong>Second piece: the matrix <i>W</i>.</strong> Multiplying a matrix by a vector gives a new vector. Each number of the result is one row of the matrix "against" the vector: multiply number by number, then add.</p>
<p>Worked example, with</p>
<p class="eq"><i>W</i> = [[1, 0], [0, 2]] and rms(<i>h</i>) = (0.849, 1.131):</p>
<ul><li>first row (1, 0): 1 · 0.849 + 0 · 1.131 = 0.849;</li><li>second row (0, 2): 0 · 0.849 + 2 · 1.131 = 2.262.</li></ul>
<p>So <i>W</i> rms(<i>h</i>) = (0.849, 2.262). This <i>W</i> keeps the first number and doubles the second. In the real model, <i>W</i> is learned: training decides which parts of the state matter for the next token.</p>
<p><strong>Third piece: the sum.</strong> Vectors are added number by number. If the token's input is <i>e<sub>t</sub></i> = (1, 1), then <i>u<sub>t</sub></i> = (1 + 0.849, 1 + 2.262).</p>`,
                  tarefa: 'Finish equation (1): with <i>e<sub>t</sub></i> = (1, 1) and <i>W</i> rms(<i>h</i>) = (0.849, 2.262), what is <i>u<sub>t</sub></i>?',
                  campos: [{ rotulo: 'first number =', resposta: 1.849, tol: 0.01 }, { rotulo: 'second number =', resposta: 3.262, tol: 0.01 }],
                  erro: 'Add number by number: 1 + 0.849 and 1 + 2.262.',
                  dica: '1 + 0.849 = 1.849 and 1 + 2.262 = 3.262.',
                  solucao: 'u_t = (1.849, 3.262). That vector is what enters the layers for token t.',
                  certo: 'That is the whole of equation (1): rms, then W, then a sum. In numpy, it is the line e + rms(h) @ W of the Implement part, where @ is matrix multiplication.',
                },
              ],
            },
            {
              id: 'r1-passadas',
              titulo: 'Equation (2) and Algorithm 1: two passes',
              porque: 'Equation (1) has a catch in training: token t needs a state that only exists after the network has run. Equation (2) and Algorithm 1 are the paper\'s way out, and they decide how much feedback costs.',
              passos: [
                {
                  texto: `<p>In training, the model reads every token of a text at once, in parallel. That is what makes Transformers fast. But equation (1) asks, for token <i>t</i>, for the state of token <i>t</i> − 1, and that state only exists once the network has run. A chicken-and-egg problem.</p>
<p>The paper's answer is to run the network several times, each time feeding in the states from the time before:</p>
<div class="trecho"><p class="trecho__fonte">From the paper, §2, equation (2)</p><p class="eq"><i>u<sub>t</sub></i><sup>(<i>p</i>+1)</sup> = <i>e<sub>t</sub></i> + <i>W</i> rms(<i>h</i><sub><i>t</i>−1</sub><sup>(<i>p</i>)</sup>), &nbsp; <i>h</i><sub><i>t</i>−1</sub><sup>(<i>p</i>)</sup> = <i>f</i>(<i>u</i><sub><i>t</i>−1</sub><sup>(<i>p</i>)</sup>)</p></div>
<p>The little <sup>(<i>p</i>)</sup> counts the passes. Pass 1 has no feedback at all. Pass 2 uses the states that pass 1 produced. Pass 3 uses those of pass 2. And so on.</p>
<p>Why does this work? Look at the first tokens:</p>
<ul><li>token 1 has no token before it, so its state is right from pass 1;</li><li>in pass 2, token 2 receives the right state of token 1, so its state is now right too;</li><li>in pass 3, token 3 receives the right state of token 2, and so on.</li></ul>
<p>After enough passes, the states stop changing: that is the <strong>fixed point</strong>, and it is exactly what a model reading token by token would compute. The paper finds that two or three passes already come close.</p>`,
                  tarefa: 'After 2 passes, how many of the first tokens are guaranteed to have exactly the right state?',
                  campos: [{ rotulo: 'tokens =', resposta: 2, tol: 0.001 }],
                  erro: 'Follow the list: pass 1 fixes token 1; each new pass fixes one more.',
                  dica: 'Pass 1 fixes token 1, pass 2 fixes token 2.',
                  solucao: '2: after p passes, the first p tokens are exactly right. The paper\'s Appendix C says the same.',
                  certo: 'The rest of the tokens are approximately right, and the approximation improves quickly. In the Implement part, the model is small enough to compute the exact fixed point directly, token by token.',
                },
                {
                  texto: `<p>In training, the paper keeps this cheap. Its Algorithm 1 is short; here it is, as in the paper:</p>
<div class="trecho"><p class="trecho__fonte">From the paper, §2, Algorithm 1: one training update</p><pre class="trecho__code">x = embed(tokens)
if rand() > p:
    with no_grad():
        s = blocks(x)
    # token t reads s[t−1]
    x = x + W(rms_norm(shift(s)))
loss = ce(head(blocks(x)), y)
loss.backward()</pre></div>
<p>Line by line:</p>
<ul><li><code>x = embed(tokens)</code>: every token becomes its input vector <i>e<sub>t</sub></i>.</li>
<li><code>if rand() > p</code>: with probability 1 − <i>p</i>, do the extra pass; with probability <i>p</i>, skip it. The paper uses <i>p</i> = 0.15.</li>
<li><code>with no_grad(): s = blocks(x)</code>: the <strong>first pass</strong>, with no gradient. It only produces the states <code>s</code>.</li>
<li><code>shift(s)</code>: moves the states one position forward, so token <i>t</i> receives the state of token <i>t</i> − 1.</li>
<li><code>x = x + W(rms_norm(...))</code>: equation (1).</li>
<li><code>loss = ...</code> and <code>loss.backward()</code>: the <strong>second pass</strong>, with the gradient. The model learns only from this one.</li></ul>`,
                  tarefa: 'In Algorithm 1, which pass does the model learn from?',
                  opcoes: [
                    { t: 'The first pass, the one inside no_grad.', por: 'no_grad means "compute no gradient": nothing is learned there.' },
                    { t: 'The second pass, the one that ends in loss.backward().', certa: true },
                    { t: 'Both passes, equally.', por: 'Only one of them computes the gradient. Look at no_grad.' },
                  ],
                  erro: 'Look for the line that computes the gradient.',
                  dica: 'backward() is the gradient going back through the network.',
                  solucao: 'The second pass. The first only supplies the states, as a fixed input.',
                  certo: 'This detail matters for the question at the end of the Implement part: since no gradient flows through the first pass, nothing teaches the state to keep information for later tokens.',
                },
                {
                  texto: `<p>How much does feedback cost? It is worth counting carefully, because the whole comparison of the paper is made at equal compute.</p>
<p><strong>The cost of one ordinary training update.</strong> Going forward through the network costs about 1 unit. Going back (the gradient) costs about 2 units, because for each layer it computes two things: the gradient for the weights and the gradient for the layer below. Total: about 3 units.</p>
<p><strong>The extra pass.</strong> It goes forward only, with no gradient: about 1 unit. Relative to an ordinary update, that is 1/3 more.</p>
<p><strong>The average.</strong> The extra pass happens only with probability 1 − <i>p</i>. So, on average, a feedback update costs</p>
<p class="eq eq--grande"><i>c</i> = 1 + (1 − <i>p</i>) / 3</p>
<p>times an ordinary one. Worked example, with <i>p</i> = 0.4: 1 − 0.4 = 0.6, then 0.6 / 3 = 0.2, so <i>c</i> = 1.2.</p>`,
                  tarefa: 'Compute <code>c</code> in code, for the paper\'s <i>p</i> = 0.15.',
                  inicio: `p = 0.15

c = 1.0   # replace: 1 + (1 - p) / 3

print(f"one feedback update costs {c:.3f} ordinary updates")
print(f"with the compute of 100 ordinary epochs, feedback trains {100 / c:.1f} epochs")
`,
                  dica: '<code>c = 1 + (1 - p) / 3</code>.',
                  solucao: `p = 0.15

c = 1 + (1 - p) / 3

print(f"one feedback update costs {c:.3f} ordinary updates")
print(f"with the compute of 100 ordinary epochs, feedback trains {100 / c:.1f} epochs")
`,
                  checagem: `
if abs(c - 1.28333) > 1e-3:
    falha('c should be about 1.283: 1 + (1 - 0.15) / 3.')
`,
                  certo: 'Our count gives 1.283. The paper measures the real cost on the clock: 1.20 to 1.27, depending on the model size (Table 10). Either way, at equal compute, feedback trains about 20% fewer epochs.',
                },
              ],
            },
          ],
        },
        {
          titulo: '§3 The comparison',
          licoes: [
            {
              id: 'r1-kappa',
              titulo: 'Equation (6): how much is saved',
              porque: 'The paper\'s results are two numbers, κ and μ. Before reading the results, it is worth knowing exactly what each one measures.',
              passos: [
                {
                  texto: `<p>The paper compares the two models at the <strong>same size</strong> and the <strong>same validation loss</strong>, in two ways:</p>
<div class="trecho"><p class="trecho__fonte">From the paper, §3, equation (6)</p><p class="eq"><i>κ</i> = <i>F<sub>T</sub></i> / <i>F</i> &nbsp; with &nbsp; <i>L<sub>T</sub></i>(<i>N</i>, <i>U</i>, <i>F<sub>T</sub></i>) = <i>L<sub>s</sub></i>(<i>N</i>, <i>U</i>, <i>F</i>)</p></div>
<p>Symbol by symbol:</p>
<ul><li><i>N</i>: the model size; <i>U</i>: the amount of unique data; <i>F</i>: the compute budget, counted in Transformer epochs.</li>
<li><i>L<sub>s</sub></i>(<i>N</i>, <i>U</i>, <i>F</i>): the loss of the feedback model with budget <i>F</i>.</li>
<li><i>F<sub>T</sub></i>: the budget the plain Transformer needs to reach that same loss.</li>
<li><i>κ</i> (kappa), the <strong>compute multiplier</strong>: how many times more compute the Transformer needs.</li></ul>
<p>From <i>κ</i>, the share of compute that feedback saves is 1 − 1/<i>κ</i>. Worked example from the paper's Figure 2(a): at 271M parameters with 200 unique tokens per parameter, the feedback model with <i>F</i> = 1 is matched by the Transformer only at <i>F<sub>T</sub></i> ≈ 1.19. So <i>κ</i> = 1.19 / 1 = 1.19, and the saving is 1 − 1/1.19 ≈ 0.16: 16% less compute.</p>
<p>The second number, <i>μ</i> (mu), the <strong>data multiplier</strong>, is the same idea for unique data: how many times more unique data the Transformer needs at the same number of epochs.</p>`,
                  tarefa: 'The largest κ measured in the paper is 1.91 (Table 7). What share of the compute does feedback save there, in percent?',
                  campos: [{ rotulo: 'saving (%) =', resposta: 47.6, tol: 0.6 }],
                  erro: 'Compute 1 − 1/1.91, then multiply by 100.',
                  dica: '1/1.91 ≈ 0.524, and 1 − 0.524 = 0.476.',
                  solucao: '1 − 1/1.91 ≈ 0.476: about 48% of the compute. That is the "up to 48%" of the abstract.',
                  certo: 'Now in code, for several κ at once.',
                },
                {
                  texto: `<p>The paper's Table 7 lists the measured κ. Some of them, at 134M parameters and two epochs of compute, as the unique data per parameter grows:</p>
<div class="trecho"><p class="trecho__fonte">From the paper, Table 7 (134M, F = 2)</p><table class="trecho__tab"><tr><th>unique tokens per parameter</th><td>12.5</td><td>25</td><td>50</td><td>100</td><td>200</td><td>400</td></tr><tr><th>κ</th><td>0.92</td><td>0.99</td><td>1.10</td><td>1.18</td><td>1.46</td><td>1.79</td></tr></table></div>
<p>In code, a list holds the numbers, and one line turns each κ into a saving.</p>`,
                  tarefa: 'Complete <code>savings</code>: for each <code>k</code> in <code>kappas</code>, the saving <code>1 - 1 / k</code>.',
                  inicio: `utpp = [12.5, 25, 50, 100, 200, 400]
kappas = [0.92, 0.99, 1.10, 1.18, 1.46, 1.79]

savings = [0 for k in kappas]   # replace: 1 - 1 / k for each k

for u, k, s in zip(utpp, kappas, savings):
    print(f"{u:6} unique tokens per parameter   kappa {k:.2f}   saving {100 * s:5.1f}%")
`,
                  dica: '<code>savings = [1 - 1 / k for k in kappas]</code>.',
                  solucao: `utpp = [12.5, 25, 50, 100, 200, 400]
kappas = [0.92, 0.99, 1.10, 1.18, 1.46, 1.79]

savings = [1 - 1 / k for k in kappas]

for u, k, s in zip(utpp, kappas, savings):
    print(f"{u:6} unique tokens per parameter   kappa {k:.2f}   saving {100 * s:5.1f}%")
`,
                  checagem: `
if abs(savings[-1] - (1 - 1 / 1.79)) > 1e-6 or abs(savings[0] - (1 - 1 / 0.92)) > 1e-6:
    falha('Each saving should be 1 - 1 / k, in the same order as kappas.')
`,
                  certo: 'The first saving is negative: with little unique data, feedback costs more than it saves. The saving grows with unique data. Today\'s models are far to the right of this table: the median 1B–10B model trains on about 1,040 tokens per parameter (§1).',
                },
              ],
            },
          ],
        },
        {
          titulo: '§5 Results',
          licoes: [
            {
              id: 'r1-resultados',
              titulo: 'Reading the results',
              porque: 'A paper is its evidence. Here are the paper\'s own numbers, to read before reproducing the shape of the result in the Implement part.',
              passos: [
                {
                  texto: `<p>The validation loss of both models at 271M parameters, with 200 unique tokens per parameter, for budgets of 1 to 4 Transformer epochs. Lower is better.</p>
<div class="trecho"><p class="trecho__fonte">From the paper, Table 6 (271M, U = 200N)</p><table class="trecho__tab"><tr><th>budget F</th><td>1</td><td>2</td><td>3</td><td>4</td></tr><tr><th>Transformer</th><td>2.2374</td><td>2.2042</td><td>2.1885</td><td>2.1786</td></tr><tr><th>latent feedback</th><td>2.2291</td><td>2.1916</td><td>2.1738</td><td>2.1626</td></tr></table></div>
<p>How to read it: each column is the same compute for both models. The feedback model is lower in every column. And look across: the feedback model at <i>F</i> = 3 (2.1738) is already better than the Transformer at <i>F</i> = 4 (2.1786), with a quarter less compute. That is what "a compute amplifier" means.</p>
<p>The same table, at the scarcest data (12.5 unique tokens per parameter) and <i>F</i> = 1, shows the opposite: 2.4691 for the Transformer against 2.4907 for feedback. With too little unique data, the extra epochs the Transformer can afford are still worth almost as much as fresh data, and they win.</p>`,
                  tarefa: 'At 271M, U = 200N and F = 2, how much lower is the feedback model\'s loss than the Transformer\'s?',
                  campos: [{ rotulo: 'difference =', resposta: 0.0126, tol: 0.0006 }],
                  erro: 'Subtract the two numbers in the column F = 2: 2.2042 − 2.1916.',
                  dica: '2.2042 − 2.1916 = 0.0126.',
                  solucao: '2.2042 − 2.1916 = 0.0126. It looks small, but to close it the Transformer needs 1.38 times the compute (Table 7).',
                  certo: 'That is the paper read. Now the Implement part: the same comparison, on a model small enough to train in the browser.',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 'programacao',
      titulo: 'Implement',
      modulos: [
        {
          titulo: 'The baseline',
          licoes: [
            ex('r1-letras', 'The data', 'Every language model starts by turning text into numbers. Here the text is a tiny made-up language that will be read many times: the case where data has run out.', {
              texto: `<p>The code generates sentences of a tiny language, like "the girl saw the moon and then she was tired." The pronoun agrees with the subject at the start: girl, <strong>she</strong>; boy, <strong>he</strong>.</p>
<p>There are only 150 training sentences, about 8,000 letters. The model will read them many times. Another 150 sentences, new ones, are used for measuring.</p>
<p>Each letter becomes a number: <code>stoi</code> is a dictionary from each letter to its number. <code>[stoi[c] for c in text]</code> walks through the text and replaces each letter by its number.</p>`,
              tarefa: 'Complete the <code>train_data</code> line, in the same form as the <code>valid_data</code> line.',
              inicio: DATA + `
train_data = np.array([])   # replace: the training text, letter by letter, as numbers
valid_data = np.array([stoi[c] for c in text_valid])

print(text_train[:120])
print("distinct letters:", V)
print("training letters:", len(train_data))
print("the first 10, as numbers:", train_data[:10])
`,
              dica: '<code>train_data = np.array([stoi[c] for c in text_train])</code>.',
              solucao: DATA + `
train_data = np.array([stoi[c] for c in text_train])
valid_data = np.array([stoi[c] for c in text_valid])

print(text_train[:120])
print("distinct letters:", V)
print("training letters:", len(train_data))
print("the first 10, as numbers:", train_data[:10])
`,
              checagem: `
if len(train_data) != len(text_train):
    falha('There should be one number for each letter of the training text: ' + str(len(text_train)) + ' in total.')
if ''.join(chars[int(i)] for i in train_data[:50]) != text_train[:50]:
    falha('The numbers do not turn back into the text. Use stoi[c] for each letter c of text_train.')
`,
              certo: 'The text became a list of numbers. That is how every language model sees text, only with pieces of words (tokens) instead of letters.',
            }),
            ex('r1-adiante', 'The model without feedback', 'The paper changes a Transformer. Here the baseline is the makemore network: a 3-letter window, one hidden layer and the prediction of the next letter. It is the smallest model that has a top-layer state.', {
              texto: `<p>The network reads the 3 letters before each position. Each letter becomes 12 numbers (the table <code>E</code>), and the three sit side by side in <code>e</code>.</p>
<p>The input <code>u</code> is <code>e</code> plus the feedback. For now, the feedback <code>fb</code> is all zeros, so <code>u = e</code>.</p>
<p>The <strong>top-layer state</strong> is <code>h = tanh(u · W1 + b1)</code>: a matrix multiplication, a vector added, and the <code>tanh</code> function, which squeezes each number between −1 and 1. The scores for each possible letter, the <code>logits</code>, come out of the state.</p>`,
              tarefa: 'The marked line is missing <code>b1</code> and the <code>tanh</code>. Write <code>h = np.tanh(u @ P[\'W1\'] + P[\'b1\'])</code>.',
              inicio: DATA + ENCODE + model(`    h = u @ P['W1']                                   # replace: b1 and the tanh are missing`) + `
P = init(0)
ctx = windows(train_data, np.arange(3, 8))[None]   # 5 positions: shape (1, 5, 3)
fb = np.zeros((1, 5, H))
e, u, h, logits = forward(P, ctx, fb)
print("windows:", ctx.shape, " state h:", h.shape, " logits:", logits.shape)
print("the state stays between -1 and 1:", h.min().round(3), h.max().round(3))
`,
              dica: 'The line becomes <code>    h = np.tanh(u @ P[\'W1\'] + P[\'b1\'])</code>, indented by 4 spaces.',
              solucao: DATA + ENCODE + MODEL + `
P = init(0)
ctx = windows(train_data, np.arange(3, 8))[None]   # 5 positions: shape (1, 5, 3)
fb = np.zeros((1, 5, H))
e, u, h, logits = forward(P, ctx, fb)
print("windows:", ctx.shape, " state h:", h.shape, " logits:", logits.shape)
print("the state stays between -1 and 1:", h.min().round(3), h.max().round(3))
`,
              checagem: `
r = np.random.default_rng(5)
Pt = init(1)
Pt['b1'] = r.normal(0, 1, H)
c = windows(train_data, np.arange(3, 11))[None]
f = r.normal(0, 1, (1, 8, H))
_, ut, ht, _ = forward(Pt, c, f)
if not np.allclose(ht, np.tanh(ut @ Pt['W1'] + Pt['b1'])):
    falha('The state should be tanh(u @ W1 + b1). Check that you added b1 and applied the tanh.')
`,
              certo: 'This is the baseline: each position sees only its 3-letter window. The state h is computed and, after the prediction, thrown away.',
            }),
          ],
        },
        {
          titulo: 'The feedback',
          licoes: [
            ex('r1-rms', 'The rms normalization', 'Before entering the next letter, the state goes through rms, the piece you computed by hand.', {
              texto: `<p>With numpy, <code>(h ** 2).mean(-1, keepdims=True)</code> takes the mean of the squares along the last axis, the numbers of each state, and keeps the shape so the division works at every position at once.</p>
<p>We add <code>1e-6</code> before the square root so we never divide by zero: the state before the first letter is a vector of zeros.</p>`,
              tarefa: 'Complete <code>rms(h)</code>: divide <code>h</code> by the square root of the mean of the squares plus <code>1e-6</code>.',
              inicio: `import numpy as np

def rms(h):
    return h   # replace: h divided by the square root of the mean of the squares (plus 1e-6)

print(rms(np.array([3.0, 4.0])))                  # should be close to [0.849 1.131]
print(rms(np.array([[1.0, -1.0, 2.0, 0.0]])))
`,
              dica: '<code>return h / np.sqrt((h ** 2).mean(-1, keepdims=True) + 1e-6)</code>.',
              solucao: `import numpy as np

def rms(h):
    return h / np.sqrt((h ** 2).mean(-1, keepdims=True) + 1e-6)

print(rms(np.array([3.0, 4.0])))                  # should be close to [0.849 1.131]
print(rms(np.array([[1.0, -1.0, 2.0, 0.0]])))
`,
              checagem: `
v = rms(np.array([3.0, 4.0]))
if not np.allclose(v, [0.84853, 1.13137], atol=1e-3):
    falha('For (3, 4), rms should give about (0.849, 1.131).')
m = np.random.default_rng(0).normal(0, 5, (4, 7))
if not np.allclose((rms(m) ** 2).mean(-1), 1, atol=1e-3):
    falha('Each row should come out with a mean of squares equal to 1. Use mean(-1, keepdims=True).')
if not np.all(np.isfinite(rms(np.zeros((2, 3))))):
    falha('A vector of zeros cannot cause a division by zero. Add 1e-6 before the square root.')
`,
              certo: 'Every state comes out on the same scale, whatever its original size.',
            }),
            ex('r1-estados', 'The first pass', 'Equation (2) of the paper runs passes in parallel until it reaches the states of a model decoding word by word. In a model this small, we can do it directly: letter by letter.', {
              texto: `<p>The function <code>states</code> walks through the letters in order. At each letter <code>t</code>, it computes the top-layer state using the previous letter's state, kept in <code>h</code>: that is equation (1), followed by the model's layer.</p>
<p>At the end, <code>shift</code> pushes the states one letter forward: letter <code>t</code> receives the state of letter <code>t − 1</code>, and the first receives zeros.</p>
<p>A nice test: if you run <code>forward</code> with these states as feedback, the state that comes out is exactly the one that went in. It is the <strong>fixed point</strong> of equation (2) in the paper.</p>`,
              tarefa: 'The marked line is missing the feedback. Replace <code>e[:, t]</code> by <code>e[:, t] + rms(h) @ P[\'Wf\']</code> inside the parentheses.',
              inicio: DATA + ENCODE + MODEL + statesWith(`        h = np.tanh(e[:, t] @ P['W1'] + P['b1'])   # replace: the feedback from the previous h is missing`) + `
P = init(0)
P['Wf'] = np.random.default_rng(1).normal(0, 0.3, P['Wf'].shape)   # a strong W, so the effect shows
ctx = windows(train_data, np.arange(3, 43))[None]                    # 40 letters
hs = states(P, ctx)
_, _, h2, _ = forward(P, ctx, shift(hs))
print("difference between the state and the fixed point:", np.abs(h2 - hs).max())
`,
              dica: 'The line becomes <code>        h = np.tanh((e[:, t] + rms(h) @ P[\'Wf\']) @ P[\'W1\'] + P[\'b1\'])</code>.',
              solucao: DATA + ENCODE + MODEL + STATES + `
P = init(0)
P['Wf'] = np.random.default_rng(1).normal(0, 0.3, P['Wf'].shape)   # a strong W, so the effect shows
ctx = windows(train_data, np.arange(3, 43))[None]                    # 40 letters
hs = states(P, ctx)
_, _, h2, _ = forward(P, ctx, shift(hs))
print("difference between the state and the fixed point:", np.abs(h2 - hs).max())
`,
              checagem: `
if np.abs(h2 - hs).max() > 1e-9:
    falha('The states are not the fixed point yet. In the marked line, add rms(h) @ P["Wf"] to e[:, t].')
`,
              certo: 'Zero difference: the first-pass states are exactly those of a model reading letter by letter. The second pass can use them in parallel.',
            }),
            ex('r1-passo', 'The training step', 'Now the whole of Algorithm 1 in the paper: two passes, gradient only in the second, and the backward pass written by hand, like micrograd, but with matrices.', {
              texto: `<p>Read <code>step</code> from top to bottom:</p>
<ul><li>it samples 32 chunks of 24 letters from the training text;</li><li>with probability 0.85, it runs the <strong>first pass</strong> (<code>states</code>) and keeps the shifted states in <code>fb</code>;</li><li>it runs the <strong>second</strong> with that <code>fb</code>, computes the loss and sends the gradient back.</li></ul>
<p>Look at the line <code>g['Wf'] = rms(fb)...</code>: for the gradient, the feedback is a fixed input. It does not flow back through the first pass. That is what makes the first pass "gradient-free".</p>`,
              tarefa: 'In the marked line, store in <code>fb</code> the shifted states of the first pass: <code>fb = shift(states(P, ctx))</code>.',
              inicio: DATA + ENCODE + MODEL + STATES + stepWith(`        fb = fb                                 # replace: the shifted states of pass 1`) + `
P0 = init(0)
P, curve = train(True, 300)
print("loss at the start:", round(curve[0], 3), "  at the end:", round(float(np.mean(curve[-30:])), 3))
print("how much the feedback map W changed:", round(float(np.abs(P['Wf'] - P0['Wf']).max()), 3))

import matplotlib.pyplot as plt
plt.figure(figsize=(5, 3.2))
plt.plot(curve)
plt.xlabel("training step")
plt.ylabel("loss")
`,
              dica: 'The line becomes <code>        fb = shift(states(P, ctx))</code>, indented by 8 spaces.',
              solucao: DATA + ENCODE + MODEL + STATES + TRAIN + `
P0 = init(0)
P, curve = train(True, 300)
print("loss at the start:", round(curve[0], 3), "  at the end:", round(float(np.mean(curve[-30:])), 3))
print("how much the feedback map W changed:", round(float(np.abs(P['Wf'] - P0['Wf']).max()), 3))

import matplotlib.pyplot as plt
plt.figure(figsize=(5, 3.2))
plt.plot(curve)
plt.xlabel("training step")
plt.ylabel("loss")
`,
              checagem: `
if np.abs(P['Wf'] - P0['Wf']).max() < 0.05:
    falha('The feedback map W barely changed: the feedback is still all zeros. Use fb = shift(states(P, ctx)).')
`,
              certo: 'The map W learned: the model started using the previous letter\'s state. What is left is the paper\'s comparison, at equal compute.',
              limite: 30000,
            }),
          ],
        },
        {
          titulo: 'Reproduce',
          licoes: [
            ex('r1-numero', 'At equal compute', 'The paper\'s comparison is fair by construction: both models spend the same compute on the same unique data. The plain model spends it on more epochs; the feedback model, on the two passes.', {
              texto: `<p>Each step of the feedback model costs <code>c = 1 + (1 − p) / 3</code> steps of the plain model. So, with a budget of <code>N</code> steps, the feedback model can only take <code>N / c</code>.</p>
<p>The code trains the plain model for <code>N = 500</code> steps (dozens of epochs over the 8,000 letters: the data repeats a lot) and the feedback model for <code>N / c</code>. Then it measures both on the new sentences.</p>
<p>To see whether more epochs fix it, the plain model also trains twice as long: <code>2N</code>. That is three trainings: it can take a few seconds.</p>`,
              tarefa: 'Compute <code>c</code> with <code>p = 0.15</code> and the number of steps of the feedback model, <code>steps_fb = int(N / c)</code>.',
              inicio: ALL + `
p = 0.15
N = 500
c = 1          # replace: 1 + (1 - p) / 3
steps_fb = N   # replace: int(N / c)

P_plain, _ = train(False, N)
P_plain2, _ = train(False, 2 * N)
P_fb, _ = train(True, steps_fb)
loss_plain = losses(P_plain, valid_data, False).mean()
loss_plain2 = losses(P_plain2, valid_data, False).mean()
loss_fb = losses(P_fb, valid_data, True).mean()
print(f"c = {c:.3f}   feedback steps = {steps_fb}")
print(f"no feedback, N steps:     {loss_plain:.3f}")
print(f"no feedback, 2N steps:    {loss_plain2:.3f}")
print(f"with feedback, N/c steps: {loss_fb:.3f}")
`,
              dica: '<code>c = 1 + (1 - p) / 3</code> and <code>steps_fb = int(N / c)</code>.',
              solucao: ALL + `
p = 0.15
N = 500
c = 1 + (1 - p) / 3
steps_fb = int(N / c)

P_plain, _ = train(False, N)
P_plain2, _ = train(False, 2 * N)
P_fb, _ = train(True, steps_fb)
loss_plain = losses(P_plain, valid_data, False).mean()
loss_plain2 = losses(P_plain2, valid_data, False).mean()
loss_fb = losses(P_fb, valid_data, True).mean()
print(f"c = {c:.3f}   feedback steps = {steps_fb}")
print(f"no feedback, N steps:     {loss_plain:.3f}")
print(f"no feedback, 2N steps:    {loss_plain2:.3f}")
print(f"with feedback, N/c steps: {loss_fb:.3f}")
`,
              checagem: `
if not perto(c, 1.28333, 1e-3):
    falha('c should be about 1.283.')
if steps_fb != int(N / c):
    falha('steps_fb should be int(N / c).')
if not loss_fb < loss_plain2:
    falha('At equal compute, feedback should end below the model without feedback.')
`,
              certo: 'With fewer steps, feedback ended below the plain model; and not even with twice the compute does the plain model catch up. In the paper, this shows up as κ = ∞ in the rows with heavy repetition (Table 8). The shape of the result reproduced, in a model millions of times smaller.',
              limite: 45000,
            }),
            ex('r1-pergunta', 'Own question: does the feedback keep the subject?', 'The paper measures the average loss. A question it does not ask, and that is Vygotsky\'s: does the state that passes from word to word work like inner speech, keeping track of what is being talked about?', {
              texto: `<p>For Vygotsky, inner speech is abbreviated: it drops the subject, because whoever is thinking already knows who it is about, and keeps only what is said of it. Latent feedback looks like that: a state, without words, passed from one word to the next.</p>
<p>The language of this chapter has a ready-made test. The pronoun agrees with the subject at the start of the sentence: the <strong>girl</strong> … and then <strong>s</strong>he. The pronoun's first letter (<code>h</code> or <code>s</code>) is more than 20 letters away from the subject, far outside the 3-letter window. Only a state that keeps the subject can get it right.</p>
<p>The test: measure the loss <strong>only on that letter</strong> and on the rest, for both models. If the feedback kept the subject, the loss on that letter would drop well below 0.69 (−log of 1/2, chance between "he" and "she").</p>`,
              tarefa: 'Build <code>pronoun</code>: <code>True</code> at the positions right after <code>"then "</code>. Use <code>np.array([text_valid[i - 5:i] == \'then \' for i in pos])</code>.',
              inicio: ALL + `
P_plain, _ = train(False, 300)
P_fb, _ = train(True, int(300 / 1.2833))
l_plain = losses(P_plain, valid_data, False)
l_fb = losses(P_fb, valid_data, True)
pos = np.arange(K, len(valid_data))   # the measured positions

pronoun = np.zeros(len(pos), bool)   # replace: True where the letter comes right after "then "

print(f"pronoun letter ({pronoun.sum()} letters)   no feedback: {l_plain[pronoun].mean():.3f}   feedback: {l_fb[pronoun].mean():.3f}")
print(f"the rest of the text          no feedback: {l_plain[~pronoun].mean():.3f}   feedback: {l_fb[~pronoun].mean():.3f}")
`,
              dica: '<code>pronoun = np.array([text_valid[i - 5:i] == \'then \' for i in pos])</code>.',
              solucao: ALL + `
P_plain, _ = train(False, 300)
P_fb, _ = train(True, int(300 / 1.2833))
l_plain = losses(P_plain, valid_data, False)
l_fb = losses(P_fb, valid_data, True)
pos = np.arange(K, len(valid_data))   # the measured positions

pronoun = np.array([text_valid[i - 5:i] == 'then ' for i in pos])

print(f"pronoun letter ({pronoun.sum()} letters)   no feedback: {l_plain[pronoun].mean():.3f}   feedback: {l_fb[pronoun].mean():.3f}")
print(f"the rest of the text          no feedback: {l_plain[~pronoun].mean():.3f}   feedback: {l_fb[~pronoun].mean():.3f}")
`,
              checagem: `
if int(pronoun.sum()) != text_valid.count('then '):
    falha('There should be one pronoun letter per sentence: ' + str(text_valid.count('then ')) + '. Mark the positions i where text_valid[i - 5:i] == "then ".')
`,
              certo: 'Feedback lowers the loss everywhere, but on the pronoun neither model gets below chance (0.69): the state does not keep the subject. Whatever feedback gains there comes from nearby letters, not from remembering who the sentence is about. The reason is in the method itself: the gradient does not flow through the feedback (the first pass has no gradient), so nothing teaches the state to keep something for later. It carries what helps the next letter, not what would help 20 letters ahead. Inner speech, in Vygotsky\'s sense, serves a plan. This feedback is not trained for that. Testing whether a feedback trained for the future (with gradient through time) starts keeping the subject is an experiment the paper did not run.',
              limite: 30000,
            }),
          ],
        },
      ],
    },
  ],
}
