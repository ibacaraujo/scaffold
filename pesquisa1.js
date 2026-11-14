// Research, Paper 1: the first paper of the day (Nov 13, 2026). The Research track is in English. It
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
  titulo: 'Paper 1',
  pesquisa: true,
  semFicha: true,
  paper: {
    titulo: 'Latent Feedback Is a Compute and Data Amplifier',
    autores: 'Huang et al.',
    ano: 2026,
    url: 'https://www.alphaxiv.org/abs/2611.latent-feedback-transformers-scaling-law',
  },
  aula: 'https://www.alphaxiv.org/abs/2611.latent-feedback-transformers-scaling-law',
  intro: 'Research, Paper 1 (Nov 13, 2026): Latent Feedback Is a Compute and Data Amplifier. First the cover and the method in a diagram; then the paper, read from scratch; then the core, implemented in the browser.',
  partes: [
    {
      id: 'matematica',
      titulo: 'Read the paper',
      modulos: [
        {
          titulo: 'The idea',
          licoes: [
            {
              id: 'r1-capa',
              titulo: 'The paper in one diagram',
              porque: 'Before the pages, the whole method at once. The diagram is the paper in five stages; click each one.',
              passos: [
                {
                  texto: `<p>Today's paper: <strong>Latent Feedback Is a Compute and Data Amplifier</strong>, by Benhao Huang, Chaitanya Dwivedi, Xuezhe Ma, Alexander Moreno and Hector Liu (Institute of Foundation Models, USC and CMU), published on November 13, 2026.</p>
<p>Its question fits in one sentence: <em>when good data runs out, is it better to train on the same data again, or to let the model feed its own state into the next token?</em></p>
<p>Go through the five stages of the diagram. Each one becomes a lesson, and then a line of code.</p>`,
                  figura: {
                    modo: 'paper',
                    desenho: 'feedback',
                    tag: 'Research · Paper 1 · Nov 13, 2026',
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
                  certo: 'That is the core. The next lessons build each piece from scratch.',
                },
              ],
            },
            {
              id: 'r1-epocas',
              titulo: 'When data runs out',
              porque: 'The paper exists because of a practical problem: the world\'s good text is running out, and training again on the same data pays less each time.',
              passos: [
                {
                  texto: `<p>A language model learns by reading text. An <strong>epoch</strong> is one full read of the data. When the good text runs out, the usual way out is to read the same data again: two, three, four epochs.</p>
<p>But each repeat teaches less than the one before. The paper uses the rule of Muennighoff et al. (2023): epoch number <code>k</code> is worth <code>e<sup>−(k−1)/R*</sup></code> of a fresh read. The first is worth 1, and the next ones less and less. <code>R*</code> says how slowly the worth decays.</p>
<p>Move the sliders: each bar is the worth of one epoch.</p>`,
                  figura: { modo: 'epocas', rEstrela: 2, epocas: 4 },
                  tarefa: 'With <code>R* = 2</code>, what is the second epoch worth? (Use <code>e<sup>−0.5</sup> ≈ 0.607</code>.)',
                  campos: [{ rotulo: 'worth of epoch 2 =', resposta: 0.607, tol: 0.01 }],
                  erro: 'Put k = 2 and R* = 2 in the exponent: −(2 − 1) / 2.',
                  dica: 'The exponent is −1/2 = −0.5, and e<sup>−0.5</sup> ≈ 0.607.',
                  solucao: 'e^(−(2−1)/2) = e^(−0.5) ≈ 0.607: the second read is worth about 61% of fresh data.',
                  certo: 'That is the problem: spending compute on more epochs buys less and less. The paper asks whether there is a better way to spend that same compute.',
                },
              ],
            },
            {
              id: 'r1-estado',
              titulo: 'The top-layer state',
              porque: 'The feedback sends back one specific vector of the model, the last layer\'s state. It is worth knowing what it is before seeing where it goes.',
              passos: [
                {
                  texto: `<p>A neural network is a sequence of layers. Each layer receives a list of numbers (a <strong>vector</strong>), does some arithmetic and passes another vector on.</p>
<p>The vector that leaves the last layer, at a point in the text, is the <strong>top-layer state</strong>, <code>h</code>. The model takes its prediction of the next word from it. It is the result of all the work the model did up to that point.</p>
<p>In a plain Transformer, once the prediction is made, this vector is not used again: the next word starts again from the bottom layers.</p>`,
                  tarefa: 'Why is the top-layer state a good candidate to pass on?',
                  opcoes: [
                    { t: 'Because it is the most processed vector: it has gone through every layer.', certa: true },
                    { t: 'Because it is the smallest vector in the model.', por: 'Size is not the reason. Think about how much computation has already gone into it.' },
                    { t: 'Because it is the written word itself.', por: 'The written word is the output. The state is the vector the output is taken from.' },
                  ],
                  erro: 'Think about the path the vector took to get to the top.',
                  dica: 'It came out of the last layer.',
                  solucao: 'Because it has gone through every layer: it is the most elaborate summary of that point in the text.',
                  certo: 'Passing it on gives the next word, right at its input, what the previous one concluded at the top.',
                },
              ],
            },
            {
              id: 'r1-equacao',
              titulo: 'The feedback equation',
              porque: 'The core of the paper is equation (1). It has three pieces: the word\'s input, a map W and a normalization called rms.',
              passos: [
                {
                  texto: `<p>Equation (1) of the paper:</p>
<p style="font-size:1.15em"><code>u<sub>t</sub> = e<sub>t</sub> + W rms(h<sub>t−1</sub>)</code></p>
<ul><li><code>e<sub>t</sub></code> is the usual input of word <code>t</code>;</li><li><code>h<sub>t−1</sub></code> is the top-layer state of the previous word;</li><li><code>rms</code> puts the vector on a standard scale;</li><li><code>W</code> is a learned matrix that translates the state into the shape of the input.</li></ul>
<p><code>rms</code> divides the vector by the square root of the mean of its squares. Then the mean of the squares becomes 1, and a large state cannot drown the input. For <code>h = (3, 4)</code>: the mean of the squares is (9 + 16) / 2 = 12.5, and its square root is ≈ 3.536.</p>`,
                  tarefa: 'What is each number of <code>rms((3, 4))</code>?',
                  campos: [{ rotulo: 'first =', resposta: 0.849, tol: 0.01 }, { rotulo: 'second =', resposta: 1.131, tol: 0.01 }],
                  erro: 'Divide 3 and 4 by 3.536.',
                  dica: '3 / 3.536 and 4 / 3.536.',
                  solucao: '3 / 3.536 ≈ 0.849 and 4 / 3.536 ≈ 1.131.',
                  certo: 'Check: 0.849² + 1.131² ≈ 2, so the mean of the squares became 1. The vector changed size, not direction.',
                },
              ],
            },
            {
              id: 'r1-passadas',
              titulo: 'Two passes, one gradient',
              porque: 'Feedback creates a problem in training. The paper\'s solution (equation 2 and Algorithm 1) sets its cost, and the cost decides the comparison.',
              passos: [
                {
                  texto: `<p>In training, the model reads all the words of a text at once, in parallel. But word <code>t</code> needs the top-layer state of word <code>t − 1</code>, which only exists after the network has run.</p>
<p>The paper's solution: run twice. The <strong>first pass</strong> runs without feedback and without gradient, only to get the states. The <strong>second</strong> runs with those states fed back, and only it computes the gradient.</p>
<p>The cost: one training pass costs about 3 units (1 to go forward and 2 for the gradient to come back). The extra pass, forward only, costs 1, that is, 1/3 more. The paper only does the extra pass part of the time: with probability <code>p = 0.15</code> it runs a single pass. So the cost is <code>c = 1 + (1 − p) / 3</code>.</p>`,
                  tarefa: 'With <code>p = 0.15</code>, what is <code>c</code>?',
                  campos: [{ rotulo: 'c =', resposta: 1.283, tol: 0.005 }],
                  erro: 'Compute (1 − 0.15) / 3 and add 1.',
                  dica: '0.85 / 3 ≈ 0.283.',
                  solucao: 'c = 1 + 0.85 / 3 ≈ 1.283. The paper measures 1.20 to 1.27 on the clock.',
                  certo: 'At equal compute, the feedback model trains c times fewer epochs. That is the paper\'s trade: fewer repeats, more work per word.',
                },
              ],
            },
            {
              id: 'r1-kappa',
              titulo: 'How much is saved',
              porque: 'The paper\'s main result is a number: how much compute feedback saves to reach the same loss.',
              passos: [
                {
                  texto: `<p>The paper compares both models at the same size and the same unique data. It measures the <strong>compute multiplier</strong> <code>κ</code>: how many times more compute the plain Transformer needs to reach the feedback model's loss.</p>
<p>If <code>κ = 2</code>, the plain one needs twice as much; so feedback saves half. In general, the saving is <code>1 − 1/κ</code>.</p>
<p>The largest value measured in the paper is <code>κ = 1.91</code>, at 60 million parameters, 400 unique tokens per parameter and two epochs of compute.</p>`,
                  tarefa: 'With <code>κ = 1.91</code>, what share of the compute does feedback save? Answer as a percentage.',
                  campos: [{ rotulo: 'saving (%) =', resposta: 47.6, tol: 0.6 }],
                  erro: 'Compute 1 − 1/1.91 and multiply by 100.',
                  dica: '1/1.91 ≈ 0.524.',
                  solucao: '1 − 1/1.91 ≈ 0.476, that is, about 48% of the compute.',
                  certo: 'That is the "up to 48%" in the paper\'s abstract. Now, the implementation.',
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
