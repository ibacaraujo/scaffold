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

const URL = 'https://www.alphaxiv.org/abs/2611.latent-feedback-transformers-scaling-law'

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
  intro: 'Nov 13, 2026. The paper\'s own figures, stepped through with animations; every formula worked out in code; then the core, implemented in the browser.',
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
              titulo: 'Figure 1: the whole paper',
              porque: 'Figure 1 is the paper in one picture: the method on the left, the two results on the right. Step through it before anything else; every later lesson zooms into one part of it.',
              passos: [
                {
                  texto: `<p>Today's paper: <strong>Latent Feedback Is a Compute and Data Amplifier: Scaling Law for Latent Feedback Transformers on Repeated Data</strong>, by Benhao Huang, Chaitanya Dwivedi, Xuezhe Ma, Alexander Moreno and Hector Liu (Institute of Foundation Models, USC and CMU). <a href="${URL}" target="_blank" rel="noopener">Open the paper</a> next to this page, as Karpathy does in his videos: we read it together.</p>
<p>Its question, from the Introduction:</p>
<div class="trecho"><p class="trecho__fonte">From the paper, §1</p><p><em>When data runs out, can latent feedback make every FLOP and every token count for more?</em></p></div>
<p>Two words to know before the figure:</p>
<ul><li>A <strong>FLOP</strong> is one arithmetic operation. Counting FLOPs is how papers measure <em>compute</em>: how much work training took.</li>
<li>A <strong>token</strong> is a piece of text, a word or part of one. <em>Unique</em> tokens are the different texts the model has; when they run out, the same tokens are read again.</li></ul>
<p>On the right is the paper's Figure 1. Press <strong>Play</strong>, or step with the arrows.</p>`,
                  figura: {
                    modo: 'paperfig',
                    src: 'papers/latent-feedback/fig1.png', w: 2086, h: 600,
                    fonte: 'Figure 1 · Huang et al. (2026)',
                    alt: 'Figure 1 of the paper: (a) the latent feedback Transformer; (b) compute saved; (c) unique data saved.',
                    passos: [
                      { t: 'Figure 1 has three panels. <strong>(a)</strong> is the method. <strong>(b)</strong> and <strong>(c)</strong> are the two results: what the method saves.' },
                      { t: '<strong>(a)</strong> A Transformer reading "The husky woof". Each token goes up through the layers. The new part is in purple: the state at the top of one token is sent, through <code>W</code>, into the input of the next token.', marcas: [{ x: 0, y: 0, w: 560, h: 600 }] },
                      { t: '<strong>(b)</strong> How much compute latent feedback saves, against a Transformer that spends the same compute on more epochs. The bars are grouped by how many unique tokens each parameter has.', marcas: [{ x: 590, y: 0, w: 790, h: 600 }] },
                      { t: 'With few unique tokens per parameter (12.5), feedback costs <strong>8% more</strong>: the grey bar is below zero. Repeating the data is still almost as good as fresh data there.', marcas: [{ x: 768, y: 320, w: 118, h: 125 }] },
                      { t: 'With many unique tokens per parameter (400), it saves <strong>46%</strong> of the compute. The more unique data, the more feedback pays off.', marcas: [{ x: 1165, y: 55, w: 130, h: 340 }] },
                      { t: '<strong>(c)</strong> How much unique data it saves, at one epoch on 50 unique tokens per parameter: from <strong>10%</strong> at 60M parameters to <strong>20%</strong> at 778M. The saving grows with model size.', marcas: [{ x: 1400, y: 0, w: 686, h: 600 }] },
                    ],
                  },
                  tarefa: 'Step through all of Figure 1, then continue.',
                  certo: 'Now we zoom in: first the problem (§1), then the method in panel (a) (§2), then how the savings in panels (b) and (c) are measured (§3 and §5).',
                },
              ],
            },
          ],
        },
        {
          titulo: '§1 When data runs out',
          licoes: [
            {
              id: 'r1-epocas',
              titulo: 'Repeated epochs are worth less',
              porque: 'The paper exists because of one fact: reading the same text again teaches less than reading new text. The paper puts a number on this, and that number is the yardstick for everything else.',
              passos: [
                {
                  texto: `<p>An <strong>epoch</strong> is one full read of the training data. When there is no more good text, the usual way out is to read the same text again: a second epoch, a third, a fourth. But each repeat teaches less than the one before.</p>
<p>The paper writes this in §3 with a formula. Step through the excerpt on the right; here is how to read the formula, slowly.</p>
<p><strong>The number <i>e</i>.</strong> It is about <code>2.718</code>. It appears whenever something shrinks (or grows) by the same fraction at every step, like a repeat that keeps losing a fixed share of its value.</p>
<p><strong>A negative exponent</strong> means "one divided by". So <i>e</i><sup>−1</sup> = 1 / <i>e</i> ≈ 1 / 2.718 ≈ 0.368. The more negative the exponent, the smaller the result.</p>
<p><strong>The rule, epoch by epoch</strong>, with <i>R</i>* = 2:</p>
<ul><li>epoch 1: exponent −(1 − 1)/2 = 0, and <i>e</i><sup>0</sup> = 1. The first read is worth a full fresh read;</li>
<li>epoch 2: exponent −(2 − 1)/2 = −0.5, and <i>e</i><sup>−0.5</sup> ≈ 0.607;</li>
<li>epoch 3: exponent −(3 − 1)/2 = −1, and <i>e</i><sup>−1</sup> ≈ 0.368.</li></ul>
<p><i>R</i>* says how slowly the value falls: with a larger <i>R</i>*, repeats stay useful for longer. The paper fits it from its runs.</p>`,
                  figura: {
                    modo: 'paperfig',
                    src: 'papers/latent-feedback/eq3-repeats.png', w: 2098, h: 700,
                    fonte: '§3, Equation (3) and "Repeats" · Huang et al. (2026)',
                    alt: 'Equation 3 of the paper and the paragraph on repeats.',
                    passos: [
                      { t: 'This is the heart of §3: the law the paper fits, and the paragraph that explains repeats. We read only the pieces about repeated data.' },
                      { t: '"Epoch <i>k</i> is worth about <i>e</i><sup>−(<i>k</i>−1)/<i>R</i>*</sup> of a fresh one." This is the rule: the value of each repeat, as a fraction of a new read.', marcas: [{ x: 0, y: 462, w: 1112, h: 72 }] },
                      { t: 'Adding up the value of every epoch gives <i>D<sub>s</sub></i>, the <strong>effective data</strong>: how many fresh tokens all the reads together are worth. <i>U</i> is the number of unique tokens; <i>R</i> is the number of epochs.', marcas: [{ x: 995, y: 85, w: 722, h: 130 }] },
                      { t: 'However many times you repeat, <i>D<sub>s</sub></i> never passes <i>U</i>(1 + <i>R</i>*). Repeating forever is worth at most <i>R</i>* extra epochs of fresh data.', marcas: [{ x: 1122, y: 462, w: 970, h: 72 }] },
                      { t: '<i>R</i> = <i>F</i> / <i>c<sub>s</sub></i>: the epochs a model can afford are its compute budget <i>F</i> divided by its cost per token <i>c<sub>s</sub></i>. Latent feedback costs more per token, so it affords fewer epochs. This trade is the whole paper.', marcas: [{ x: 1737, y: 85, w: 238, h: 130 }] },
                    ],
                  },
                  tarefa: 'Step through the excerpt, then continue. Next, the same rule in code.',
                  certo: 'Now let Python do the arithmetic.',
                },
                {
                  texto: `<p>Karpathy's habit: as soon as a formula appears, write it in code and print it. The code is the formula, with nothing hidden.</p>
<p>In Python, <i>e</i><sup>x</sup> is <code>math.exp(x)</code>. So "epoch <i>k</i> is worth <i>e</i><sup>−(<i>k</i>−1)/<i>R</i>*</sup>" becomes one line:</p>
<pre><code>math.exp(-(k - 1) / R)</code></pre>
<p>Read it from the inside out: <code>k - 1</code>, divided by <code>R</code>, with a minus sign, then <code>exp</code>.</p>`,
                  tarefa: 'Complete <code>worth(k, R)</code> with that line. The code prints the worth of epochs 1 to 8 with <code>R = 2</code>, and how many fresh epochs they add up to.',
                  inicio: `import math

def worth(k, R):
    return 1.0   # replace: e to the power -(k - 1) / R

R = 2
total = 0
for k in range(1, 9):
    total += worth(k, R)
    print(f"epoch {k}: worth {worth(k, R):.3f}   all epochs so far are worth {total:.3f} fresh epochs")
`,
                  dica: '<code>return math.exp(-(k - 1) / R)</code>.',
                  solucao: `import math

def worth(k, R):
    return math.exp(-(k - 1) / R)

R = 2
total = 0
for k in range(1, 9):
    total += worth(k, R)
    print(f"epoch {k}: worth {worth(k, R):.3f}   all epochs so far are worth {total:.3f} fresh epochs")
`,
                  checagem: `
if abs(worth(2, 2) - 0.60653) > 1e-3 or abs(worth(1, 2) - 1) > 1e-9:
    falha('For k = 2 and R = 2 the worth should be about 0.607, and for k = 1 exactly 1. Use math.exp(-(k - 1) / R).')
`,
                  certo: 'Eight reads of the same data are worth only about 2.5 fresh ones, and the total almost stops growing. That is the waste the paper wants to avoid.',
                },
                {
                  texto: `<p>Now the paper's own formula for the effective data, from equation (3):</p>
<img class="trecho__img" src="papers/latent-feedback/eq3-repeats.png" alt="Equation 3 and the paragraph on repeats, from the paper.">
<p class="eq eq--grande"><i>D</i> = <i>U</i> [ 1 + <i>R</i>* (1 − <i>e</i><sup>−(<i>R</i>−1)/<i>R</i>*</sup>) ]</p>
<p>Piece by piece: <i>U</i> is one epoch of fresh data. The bracket adds the value of the repeats: <i>R</i>* times a fraction that starts at 0 (with <i>R</i> = 1 epoch, the exponent is 0 and 1 − 1 = 0) and approaches 1 as <i>R</i> grows. So <i>D</i> goes from <i>U</i> up to at most <i>U</i>(1 + <i>R</i>*).</p>
<p>The paper's fitted value at 100 unique tokens per parameter is <i>R</i>* = 14.6 (Table 4). In code, with <code>U = 1</code>, <code>D</code> reads directly in "fresh epochs".</p>`,
                  tarefa: 'Complete <code>effective_data(R, U, Rs)</code> with the formula: <code>U * (1 + Rs * (1 - math.exp(-(R - 1) / Rs)))</code>.',
                  inicio: `import math

def effective_data(R, U, Rs):
    return U * R   # replace: the paper's formula for D

U, Rs = 1.0, 14.6
for R in [1, 2, 4, 8, 16, 64, 1000]:
    D = effective_data(R, U, Rs)
    print(f"{R:5} epochs are worth {D:6.2f} fresh epochs")
print(f"the ceiling U(1 + R*) = {U * (1 + Rs):.2f}")
`,
                  dica: '<code>return U * (1 + Rs * (1 - math.exp(-(R - 1) / Rs)))</code>.',
                  solucao: `import math

def effective_data(R, U, Rs):
    return U * (1 + Rs * (1 - math.exp(-(R - 1) / Rs)))

U, Rs = 1.0, 14.6
for R in [1, 2, 4, 8, 16, 64, 1000]:
    D = effective_data(R, U, Rs)
    print(f"{R:5} epochs are worth {D:6.2f} fresh epochs")
print(f"the ceiling U(1 + R*) = {U * (1 + Rs):.2f}")
`,
                  checagem: `
if abs(effective_data(1, 1, 14.6) - 1) > 1e-9 or abs(effective_data(4, 1, 14.6) - 3.71) > 0.02:
    falha('With 1 epoch D should be exactly U, and with 4 epochs about 3.71 U. Use U * (1 + Rs * (1 - math.exp(-(R - 1) / Rs))).')
`,
                  certo: 'Four epochs are worth about 3.7 fresh ones: close to the paper\'s "four epochs at 134M are worth 3.0 to 3.9 fresh ones" (§5.3). And a thousand epochs are worth only 15.6: the ceiling. This is why spending compute on more epochs eventually stops paying.',
                },
              ],
            },
          ],
        },
        {
          titulo: '§2 Background',
          licoes: [
            {
              id: 'r1-equacao',
              titulo: 'Equation (1): the state goes back',
              porque: 'Equation (1) is the method. Panel (a) of Figure 1 draws it; we read the panel piece by piece, then write the equation in numpy, then compare with the authors\' own code.',
              passos: [
                {
                  texto: `<p>§2 of the paper says it in one sentence and one equation:</p>
<img class="trecho__img" src="papers/latent-feedback/eq1.png" alt="Section 2 of the paper with equation 1.">
<p>Each symbol, and where it is in panel (a):</p>
<ul><li><i>t</i> is the position of a token: "The" is 1, "husky" is 2, "woof" is 3;</li>
<li><i>e<sub>t</sub></i> is the token's own input, its embedding: a vector, a list of numbers;</li>
<li><i>f</i>, the "blocks", are the layers of the Transformer;</li>
<li><i>h<sub>t</sub></i> is the <strong>top-layer state</strong>: the vector that comes out of the last layer. The next token is predicted from it;</li>
<li>rms puts that vector on a standard scale (next step);</li>
<li><i>W</i> is a matrix the model learns: it turns the state into a vector that can be added to the next token's input;</li>
<li><i>u<sub>t</sub></i> is what actually enters the layers: the token, plus what the previous token concluded.</li></ul>`,
                  figura: {
                    modo: 'paperfig',
                    src: 'papers/latent-feedback/fig1a.png', w: 548, h: 600,
                    fonte: 'Figure 1(a) · Huang et al. (2026)',
                    alt: 'Figure 1(a): the latent feedback Transformer reading "The husky woof".',
                    passos: [
                      { t: 'Panel (a): a Transformer reading "The husky woof", one column per token. Step through it.' },
                      { t: 'The tokens enter at the bottom. Their embeddings are the <i>e<sub>t</sub></i> of equation (1).', marcas: [{ x: 30, y: 528, w: 495, h: 60 }] },
                      { t: 'Each token goes through the <strong>layers</strong>, the <i>f</i> of the paper. It is the same stack of layers in every column.', marcas: [{ x: 35, y: 258, w: 100, h: 182 }, { x: 225, y: 258, w: 100, h: 182 }, { x: 415, y: 258, w: 100, h: 182 }] },
                      { t: 'Out of the top comes the state <i>h<sub>t</sub></i>.', marcas: [{ x: 85, y: 202, r: 22 }, { x: 275, y: 202, r: 22 }, { x: 465, y: 202, r: 22 }] },
                      { t: 'From <i>h<sub>t</sub></i> the model predicts the next token: after "The" it predicts "husky", after "husky" it predicts "woof". In a plain Transformer, <i>h<sub>t</sub></i> stops here.', marcas: [{ x: 30, y: 80, w: 495, h: 42 }] },
                      { t: 'The new part, in purple: <i>h<sub>t</sub></i> goes through the map <i>W</i> and travels to the next column. This is <i>W</i> rms(<i>h</i><sub><i>t</i>−1</sub>), seen from the token that receives it.', marcas: [{ x: 108, y: 186, w: 152, h: 320 }, { x: 298, y: 186, w: 152, h: 320 }] },
                      { t: 'The ⊕ adds it to the token\'s embedding: <i>u<sub>t</sub></i> = <i>e<sub>t</sub></i> + <i>W</i> rms(<i>h</i><sub><i>t</i>−1</sub>). That sum is what enters the layers. The first token, "The", has nothing before it, so it enters alone.', marcas: [{ x: 273, y: 493, r: 18 }, { x: 463, y: 493, r: 18 }] },
                    ],
                  },
                  tarefa: 'Step through panel (a), then continue.',
                  certo: 'Now the three pieces of the equation in code: rms, the map W, and the sum.',
                },
                {
                  texto: `<p><strong>rms</strong> stands for "root mean square". It is three operations, in order: <strong>square</strong> every number of the vector, take the <strong>mean</strong> of the squares, take the square <strong>root</strong> of that mean. Then the vector is divided by the result.</p>
<p>Worked example, <i>h</i> = (3, 4): the squares are 9 and 16; their mean is 12.5; the root is √12.5 ≈ 3.536. So rms(<i>h</i>) = (3/3.536, 4/3.536) ≈ (0.849, 1.131).</p>
<p>Why: after dividing, the mean of the squares is exactly 1, whatever the size of <i>h</i>. A huge state cannot drown the token's own input.</p>
<p>In numpy, an operation on an array applies to every number at once: <code>h ** 2</code> squares them all, <code>.mean()</code> averages, <code>np.sqrt</code> takes the root. One line per operation:</p>`,
                  tarefa: 'Fill in <code>root = ...</code>: the square root of <code>mean</code>, with <code>np.sqrt</code>. Then try your own <code>h</code>, like <code>[6.0, 8.0]</code>.',
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
if abs(root - np.sqrt((h ** 2).mean())) > 1e-9:
    falha('root should be the square root of the mean of the squares. Use np.sqrt(mean).')
`,
                  certo: 'The last line is always 1.0. Try h = [6.0, 8.0]: rms gives the same vector as for [3.0, 4.0], because rms keeps the direction and drops the size.',
                },
                {
                  texto: `<p>Now the whole equation, for every token at once. This is how the authors write it, in their repository (<a href="https://github.com/ifm-ai/LoRM" target="_blank" rel="noopener">ifm-ai/LoRM</a>, Apache 2.0):</p>
<div class="trecho"><p class="trecho__fonte">From the official code, lorm/model/feedback.py</p><pre class="trecho__code">def mix(self, embedding, top):
    """e_t + W rms(top_{t-1}); the first position has
    no previous one and keeps its embedding."""
    fed = self.fusion(F.rms_norm(top, ...))
    return torch.cat([embedding[:, :1],
                      embedding[:, 1:] + fed[:, :-1]], 1)</pre></div>
<p>Two lines. Read them slowly:</p>
<ul><li><code>fed</code> is <i>W</i> rms(<i>h<sub>t</sub></i>) for <strong>every</strong> token at once. <code>self.fusion</code> is the matrix <i>W</i>.</li>
<li><code>embedding[:, :1]</code> is the first token, which keeps its embedding: it has no token before it.</li>
<li><code>embedding[:, 1:] + fed[:, :-1]</code> adds to token 2 the state of token 1, to token 3 the state of token 2, and so on: <code>1:</code> means "from the second on", <code>:-1</code> means "all but the last". This shift by one is the <i>t</i> − 1.</li>
<li><code>torch.cat</code> glues the two parts back together.</li></ul>
<p>Below, the same in numpy, without the batch dimension. A matrix times a vector, <i>W</i> <i>v</i>, is written <code>v @ W.T</code> when the vectors are rows.</p>`,
                  tarefa: 'Write the last line of equation (1): <code>U = np.concatenate([E[:1], E[1:] + fed[:-1]])</code>. The code then checks it token by token against <i>u<sub>t</sub></i> = <i>e<sub>t</sub></i> + <i>W</i> rms(<i>h</i><sub><i>t</i>−1</sub>).',
                  inicio: `import numpy as np

rng = np.random.default_rng(0)
T, d = 4, 3                        # 4 tokens, vectors of 3 numbers
E = rng.normal(size=(T, d))        # e_t: each token's embedding, one row per token
Htop = rng.normal(size=(T, d))     # h_t: each token's top-layer state
W = rng.normal(0, 0.5, (d, d))     # the map W

def rms(h):
    return h / np.sqrt((h ** 2).mean(-1, keepdims=True) + 1e-6)

fed = rms(Htop) @ W.T              # W rms(h_t), for every token at once
U = E                              # replace: the first token keeps e_0; token t gets e_t + fed[t - 1]

for t in range(T):
    by_hand = E[t] if t == 0 else E[t] + W @ rms(Htop[t - 1])
    print(f"token {t}: u_t matches equation (1)? {np.allclose(U[t], by_hand)}")
`,
                  dica: '<code>U = np.concatenate([E[:1], E[1:] + fed[:-1]])</code>.',
                  solucao: `import numpy as np

rng = np.random.default_rng(0)
T, d = 4, 3                        # 4 tokens, vectors of 3 numbers
E = rng.normal(size=(T, d))        # e_t: each token's embedding, one row per token
Htop = rng.normal(size=(T, d))     # h_t: each token's top-layer state
W = rng.normal(0, 0.5, (d, d))     # the map W

def rms(h):
    return h / np.sqrt((h ** 2).mean(-1, keepdims=True) + 1e-6)

fed = rms(Htop) @ W.T              # W rms(h_t), for every token at once
U = np.concatenate([E[:1], E[1:] + fed[:-1]])

for t in range(T):
    by_hand = E[t] if t == 0 else E[t] + W @ rms(Htop[t - 1])
    print(f"token {t}: u_t matches equation (1)? {np.allclose(U[t], by_hand)}")
`,
                  checagem: `
for t in range(T):
    by_hand = E[t] if t == 0 else E[t] + W @ rms(Htop[t - 1])
    if not np.allclose(U[t], by_hand):
        falha('Token ' + str(t) + ' does not match equation (1). The first row is E[:1]; the rest is E[1:] + fed[:-1].')
`,
                  certo: 'Four times True: the one-line version for all tokens is exactly equation (1), token by token. The authors\' mix does the same with a batch dimension.',
                },
              ],
            },
            {
              id: 'r1-passadas',
              titulo: 'Equation (2) and Algorithm 1: training in passes',
              porque: 'Equation (1) has a catch in training: token t needs a state that only exists after the network has run. Equation (2) and Algorithm 1 are the paper\'s way out, and they set what feedback costs.',
              passos: [
                {
                  texto: `<p>In training, a Transformer reads every token of a text at once, in parallel; that is what makes it fast. But equation (1) asks, for token <i>t</i>, for the state of token <i>t</i> − 1, which only exists after the network has run. A chicken-and-egg problem.</p>
<p>The paper's answer is to run the network several times over the whole text. Each run is a <strong>pass</strong>, and each pass feeds in the states of the pass before. The little <sup>(<i>p</i>)</sup> in equation (2) counts the passes.</p>
<p>Why it works, token by token:</p>
<ul><li>pass 1 has no feedback. Token 1 has nothing before it anyway, so its state is already right;</li>
<li>in pass 2, token 2 receives the right state of token 1, so its state becomes right;</li>
<li>in pass 3, token 3 receives the right state of token 2; and so on.</li></ul>
<p>The states stop changing at the <strong>fixed point</strong>, <i>h</i><sup>(*)</sup>, which is exactly what a model reading token by token computes. Step through the excerpt on the right.</p>`,
                  figura: {
                    modo: 'paperfig',
                    src: 'papers/latent-feedback/eq2-alg1.png', w: 2098, h: 1028,
                    fonte: '§2, Equation (2) and Algorithm 1 · Huang et al. (2026)',
                    alt: 'Equation 2 of the paper, the paragraph about passes, and Algorithm 1.',
                    passos: [
                      { t: 'The end of §2: equation (2), the paragraph on passes and decoding, and Algorithm 1.' },
                      { t: 'Equation (2): pass <i>p</i> + 1 feeds in the states of pass <i>p</i>. The arrow says that, as <i>p</i> → ∞, the inputs reach the fixed point <i>u</i><sup>(*)</sup>.', marcas: [{ x: 210, y: 20, w: 1870, h: 120 }] },
                      { t: 'The first pass reads no feedback, and "in practice, two to three passes come close to the fixed point".', marcas: [{ x: 0, y: 200, w: 2098, h: 130 }] },
                      { t: 'Algorithm 1 is one training update. With probability <i>p</i> it runs a single, plain pass; otherwise two.', marcas: [{ x: 1188, y: 570, w: 850, h: 455 }] },
                      { t: 'The first pass, inside <code>no_grad()</code>: it only produces the states <code>s</code>. No gradient, so nothing is learned from it.', marcas: [{ x: 1188, y: 698, w: 560, h: 110 }] },
                      { t: 'Equation (1), applied with the states of the first pass: <code>shift(s)</code> moves them one token forward.', marcas: [{ x: 1188, y: 862, w: 700, h: 52 }] },
                      { t: 'The second pass and the loss. <code>loss.backward()</code> sends the gradient back: the model learns only from this pass.', marcas: [{ x: 1188, y: 912, w: 560, h: 104 }] },
                    ],
                  },
                  tarefa: 'Step through the excerpt, then continue. Next, you watch the passes reach the fixed point.',
                  certo: 'Now the passes, in code.',
                },
                {
                  texto: `<p>A model small enough to follow by eye: every token is one number, the layers are one function <code>f(u) = tanh(1.5 u)</code>, and <i>W</i> is one number, <code>w = 0.9</code>. (rms is left out: on a single number it would only keep the sign.)</p>
<p>First the code computes the <strong>exact</strong> states, decoding token by token. Then it trains the way the paper does, in passes over the whole sequence: each pass feeds every token the previous token's state <strong>from the pass before</strong>.</p>
<p>The authors' forward pass does the same loop (from <code>lorm/model/feedback.py</code>):</p>
<div class="trecho"><p class="trecho__fonte">From the official code, lorm/model/feedback.py</p><pre class="trecho__code">state = x
for index in range(passes):
    with torch.set_grad_enabled(... index == passes - 1):
        if index:
            state = self.mix(x, top.detach())
        top = self.blocks(state, cos, sin)</pre></div>
<p><code>detach()</code> is the "no gradient": the states from the previous pass enter as fixed numbers.</p>`,
                  tarefa: 'In the marked line, add the feedback: <code>u[1:] = e[1:] + w * h[:-1]</code>. Each token reads the previous token\'s state from the last pass.',
                  inicio: `import numpy as np

e = np.array([0.5, -1.0, 0.8, 0.3, -0.6, 1.2])   # 6 tokens, one number each
w = 0.9                                          # the map W
f = lambda u: np.tanh(1.5 * u)                    # the layers

# Decoding, token by token: the exact states.
exact = np.zeros(len(e))
for t in range(len(e)):
    u_t = e[t] if t == 0 else e[t] + w * exact[t - 1]
    exact[t] = f(u_t)

# Training, in passes over the whole sequence (equation 2).
h = f(e)                                          # pass 1: no feedback
print(f"pass 1: {np.isclose(h, exact).sum()} of 6 tokens exact")
for p in range(2, 7):
    u = e.copy()
    u[1:] = e[1:]                                 # replace: + w * h[:-1]
    h = f(u)
    print(f"pass {p}: {np.isclose(h, exact).sum()} of 6 tokens exact   largest error {abs(h - exact).max():.4f}")
`,
                  dica: 'The line becomes <code>    u[1:] = e[1:] + w * h[:-1]</code>.',
                  solucao: `import numpy as np

e = np.array([0.5, -1.0, 0.8, 0.3, -0.6, 1.2])   # 6 tokens, one number each
w = 0.9                                          # the map W
f = lambda u: np.tanh(1.5 * u)                    # the layers

# Decoding, token by token: the exact states.
exact = np.zeros(len(e))
for t in range(len(e)):
    u_t = e[t] if t == 0 else e[t] + w * exact[t - 1]
    exact[t] = f(u_t)

# Training, in passes over the whole sequence (equation 2).
h = f(e)                                          # pass 1: no feedback
print(f"pass 1: {np.isclose(h, exact).sum()} of 6 tokens exact")
for p in range(2, 7):
    u = e.copy()
    u[1:] = e[1:] + w * h[:-1]
    h = f(u)
    print(f"pass {p}: {np.isclose(h, exact).sum()} of 6 tokens exact   largest error {abs(h - exact).max():.4f}")
`,
                  checagem: `
if not np.allclose(h, exact):
    falha('After 6 passes the states should equal the exact ones. In the marked line, add w * h[:-1] to e[1:].')
`,
                  certo: 'Pass p makes the first p tokens exact, and the error of the others shrinks pass after pass. The paper stops at two passes in training: the states are not exact yet, but close, and two passes are cheap.',
                },
                {
                  texto: `<p>How much does that second pass cost? Count it, because the whole comparison of the paper is made at equal compute.</p>
<ul><li>An ordinary update costs about <strong>3</strong> units: 1 to go forward, 2 to bring the gradient back (for each layer, the gradient of the weights and the gradient of the layer below).</li>
<li>The extra pass goes forward only, with no gradient: <strong>1</strong> unit, which is 1/3 of an update.</li>
<li>It happens only with probability 1 − <i>p</i>.</li></ul>
<p>So, on average, an update with feedback costs</p>
<p class="eq eq--grande"><i>c</i> = 1 + (1 − <i>p</i>) / 3</p>
<p>ordinary updates. With the compute of <i>F</i> Transformer epochs, the feedback model trains <i>F</i> / <i>c</i> epochs: the <i>R</i> = <i>F</i> / <i>c<sub>s</sub></i> of equation (3).</p>`,
                  tarefa: 'Compute <code>c</code> for the paper\'s <code>p = 0.15</code>, and the epochs it affords with the compute of 2 Transformer epochs.',
                  inicio: `p = 0.15
F = 2

c = 1.0      # replace: 1 + (1 - p) / 3
R = F        # replace: the epochs feedback can afford, F / c

print(f"one feedback update costs {c:.3f} ordinary updates")
print(f"with the compute of {F} Transformer epochs, feedback trains {R:.2f} epochs")
`,
                  dica: '<code>c = 1 + (1 - p) / 3</code> and <code>R = F / c</code>.',
                  solucao: `p = 0.15
F = 2

c = 1 + (1 - p) / 3
R = F / c

print(f"one feedback update costs {c:.3f} ordinary updates")
print(f"with the compute of {F} Transformer epochs, feedback trains {R:.2f} epochs")
`,
                  checagem: `
if abs(c - 1.28333) > 1e-3:
    falha('c should be about 1.283: 1 + (1 - 0.15) / 3.')
if abs(R - F / c) > 1e-9:
    falha('R should be F / c.')
`,
                  certo: 'Our count gives 1.283; the paper measures 1.20 to 1.27 on the clock (Table 10). Either way, at equal compute, feedback reads the data fewer times. It has to win by getting more out of each read.',
                },
              ],
            },
          ],
        },
        {
          titulo: '§3 and §5: the comparison',
          licoes: [
            {
              id: 'r1-kappa',
              titulo: 'Figure 2(a): reading κ off the curves',
              porque: 'The paper\'s headline numbers, "1.19× compute", "up to 48%", are all read off curves like the one in Figure 2(a). Here you read one by hand, then in code, exactly as the paper does.',
              passos: [
                {
                  texto: `<p>§3 defines the <strong>compute multiplier</strong> <i>κ</i> (kappa): at the same model size and the same unique data, how many times more compute the Transformer needs to reach the loss of latent feedback. From <i>κ</i>, the share of compute that feedback saves is 1 − 1/<i>κ</i>.</p>
<p>Figure 2(a) shows one case, a 271M-parameter model with 200 unique tokens per parameter. Step through it.</p>
<p>How to read an arrow: take the feedback model at budget <i>F</i> = 1 (the purple square). Go right, horizontally, at the same loss, until you hit the Transformer's dashed line. The budget where you hit it, about 1.19, is what the Transformer needs. So <i>κ</i> = 1.19 / 1 = 1.19, and feedback saves 1 − 1/1.19 ≈ 16% of the compute.</p>`,
                  figura: {
                    modo: 'paperfig',
                    src: 'papers/latent-feedback/fig2a.png', w: 680, h: 660,
                    fonte: 'Figure 2(a) · Huang et al. (2026)',
                    alt: 'Figure 2(a): validation loss against budget for the Transformer and latent feedback, 271M parameters, U = 200N.',
                    passos: [
                      { t: 'Figure 2(a): one model size (271M parameters), one amount of unique data (200 tokens per parameter).' },
                      { t: 'The horizontal axis is the compute budget <i>F</i>, counted in Transformer epochs. The vertical axis is the validation loss: lower is better.', marcas: [{ x: 120, y: 565, w: 550, h: 85 }, { x: 0, y: 80, w: 130, h: 480 }] },
                      { t: 'The dashed line with circles: the plain Transformer, at budgets 1 to 4.', marcas: [{ x: 165, y: 135, w: 485, h: 335 }] },
                      { t: 'The solid line with squares: latent feedback, at the same budgets. It is lower everywhere: same compute, lower loss.', marcas: [{ x: 165, y: 178, w: 485, h: 375 }] },
                      { t: 'The first arrow: the Transformer needs <strong>1.19×</strong> the compute to reach the loss feedback has at <i>F</i> = 1. So <i>κ</i> = 1.19.', marcas: [{ x: 170, y: 140, w: 310, h: 70 }] },
                      { t: 'The second arrow, at <i>F</i> = 2: <strong>1.38×</strong>. The gap grows with the budget, as the paper says: the saving grows with repetition.', marcas: [{ x: 180, y: 365, w: 360, h: 72 }] },
                    ],
                  },
                  tarefa: 'Step through Figure 2(a), then continue. Next, you read κ in code.',
                  certo: 'Now the same reading, in code, with the paper\'s own numbers.',
                },
                {
                  texto: `<p>The losses behind Figure 2(a) are in the paper's Table 6. To read <i>κ</i>, the paper finds where the Transformer's loss equals feedback's loss, <strong>interpolating in log <i>F</i></strong> between the measured budgets (caption of Figure 2).</p>
<p>Interpolating means: the target loss lies between two measured points; find how far between them, as a fraction, and move that same fraction along the axis. Worked example for feedback at <i>F</i> = 1, loss 2.2291:</p>
<ul><li>the Transformer has 2.2374 at <i>F</i> = 1 and 2.2042 at <i>F</i> = 2, so the target is between them;</li>
<li>fraction: (2.2374 − 2.2291) / (2.2374 − 2.2042) = 0.0083 / 0.0332 = 0.25;</li>
<li>move 25% of the way from log 1 to log 2: log <i>F<sub>T</sub></i> = 0 + 0.25 × 0.693 = 0.173, so <i>F<sub>T</sub></i> = <i>e</i><sup>0.173</sup> ≈ 1.19.</li></ul>
<p>"In log <i>F</i>" because the budgets double: 1, 2, 4. On a log scale they sit at equal distances.</p>`,
                  tarefa: 'Complete the interpolation line: <code>logF = np.log(F[i]) + frac * (np.log(F[i + 1]) - np.log(F[i]))</code>. The code prints κ for every budget.',
                  inicio: `import numpy as np

# Table 6 of the paper: 271M parameters, U = 200N.
F = np.array([1, 2, 3, 4])
loss_T  = np.array([2.2374, 2.2042, 2.1885, 2.1786])   # Transformer
loss_fb = np.array([2.2291, 2.1916, 2.1738, 2.1626])   # latent feedback

def budget_to_reach(target):
    # the budget at which the Transformer's loss equals target
    for i in range(len(F) - 1):
        if loss_T[i] >= target >= loss_T[i + 1]:
            frac = (loss_T[i] - target) / (loss_T[i] - loss_T[i + 1])
            logF = np.log(F[i])   # replace: move frac of the way from log F[i] to log F[i + 1]
            return np.exp(logF)
    return None   # below the Transformer's best measured loss

for f, l in zip(F, loss_fb):
    FT = budget_to_reach(l)
    if FT is None:
        print(f"feedback at F = {f}: loss {l}, lower than the Transformer reaches by F = 4")
    else:
        print(f"feedback at F = {f}: loss {l}, Transformer needs F = {FT:.2f}   kappa = {FT / f:.2f}   saves {100 * (1 - f / FT):.0f}%")
`,
                  dica: '<code>logF = np.log(F[i]) + frac * (np.log(F[i + 1]) - np.log(F[i]))</code>.',
                  solucao: `import numpy as np

# Table 6 of the paper: 271M parameters, U = 200N.
F = np.array([1, 2, 3, 4])
loss_T  = np.array([2.2374, 2.2042, 2.1885, 2.1786])   # Transformer
loss_fb = np.array([2.2291, 2.1916, 2.1738, 2.1626])   # latent feedback

def budget_to_reach(target):
    # the budget at which the Transformer's loss equals target
    for i in range(len(F) - 1):
        if loss_T[i] >= target >= loss_T[i + 1]:
            frac = (loss_T[i] - target) / (loss_T[i] - loss_T[i + 1])
            logF = np.log(F[i]) + frac * (np.log(F[i + 1]) - np.log(F[i]))
            return np.exp(logF)
    return None   # below the Transformer's best measured loss

for f, l in zip(F, loss_fb):
    FT = budget_to_reach(l)
    if FT is None:
        print(f"feedback at F = {f}: loss {l}, lower than the Transformer reaches by F = 4")
    else:
        print(f"feedback at F = {f}: loss {l}, Transformer needs F = {FT:.2f}   kappa = {FT / f:.2f}   saves {100 * (1 - f / FT):.0f}%")
`,
                  checagem: `
k1 = budget_to_reach(2.2291)
k2 = budget_to_reach(2.1916)
if k1 is None or abs(k1 - 1.19) > 0.01 or abs(k2 / 2 - 1.38) > 0.01:
    falha('kappa at F = 1 should be about 1.19 and at F = 2 about 1.38, as in Figure 2(a). Check the interpolation line.')
`,
                  certo: 'κ = 1.19 and 1.38: the two arrows of Figure 2(a), recomputed from the table. From F = 3 on, feedback\'s loss is lower than anything the Transformer measured, so the paper reads κ off its fitted law instead (§5.3).',
                },
                {
                  texto: `<p>Doing that reading for every cell gives the paper's Table 7. Some of its values, at 134M parameters and <i>F</i> = 2, as the unique data per parameter grows:</p>
<div class="trecho"><p class="trecho__fonte">From the paper, Table 7 (134M, F = 2)</p><table class="trecho__tab"><tr><th>unique tokens per parameter</th><td>12.5</td><td>25</td><td>50</td><td>100</td><td>200</td><td>400</td></tr><tr><th>κ</th><td>0.92</td><td>0.99</td><td>1.10</td><td>1.18</td><td>1.46</td><td>1.79</td></tr></table></div>
<p>The largest κ in the whole table is 1.91 (60M, 400 unique tokens per parameter): 1 − 1/1.91 ≈ 48%, the "up to 48%" of the overview.</p>`,
                  tarefa: 'Complete <code>savings</code>: for each <code>k</code> in <code>kappas</code>, the saving <code>1 - 1 / k</code>.',
                  inicio: `utpp = [12.5, 25, 50, 100, 200, 400]
kappas = [0.92, 0.99, 1.10, 1.18, 1.46, 1.79]

savings = [0 for k in kappas]   # replace: 1 - 1 / k for each k

for u, k, s in zip(utpp, kappas, savings):
    print(f"{u:6} unique tokens per parameter   kappa {k:.2f}   saving {100 * s:5.1f}%")
print(f"the paper's largest kappa, 1.91, saves {100 * (1 - 1 / 1.91):.1f}%")
`,
                  dica: '<code>savings = [1 - 1 / k for k in kappas]</code>.',
                  solucao: `utpp = [12.5, 25, 50, 100, 200, 400]
kappas = [0.92, 0.99, 1.10, 1.18, 1.46, 1.79]

savings = [1 - 1 / k for k in kappas]

for u, k, s in zip(utpp, kappas, savings):
    print(f"{u:6} unique tokens per parameter   kappa {k:.2f}   saving {100 * s:5.1f}%")
print(f"the paper's largest kappa, 1.91, saves {100 * (1 - 1 / 1.91):.1f}%")
`,
                  checagem: `
if abs(savings[-1] - (1 - 1 / 1.79)) > 1e-6 or abs(savings[0] - (1 - 1 / 0.92)) > 1e-6:
    falha('Each saving should be 1 - 1 / k, in the same order as kappas.')
`,
                  certo: 'The first saving is negative (−8.7%), like the grey bar of Figure 1(b): with little unique data, feedback costs more than it saves. Then it grows with the unique data. Today\'s models are far to the right of this table: the median 1B–10B model trains on about 1,040 tokens per parameter (§1). That is the paper, read. Now the Implement part: the same comparison, on a model you train in the browser.',
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
