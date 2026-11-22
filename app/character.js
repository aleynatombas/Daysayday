// Daysayday character engine: SVG rigs + expressions + speech.
const CSS = `  /* ---------- Character animation ---------- */
  .ch .bodybob { transform-box: view-box; animation: bodybob 3s ease-in-out infinite; }
  @keyframes bodybob { 50% { transform: translateY(-2.5px); } }
  .ch .eyewrap { transform-box: fill-box; transform-origin: center; transition: transform .2s ease; }
  .ch .blinker { transform-box: fill-box; transform-origin: center; transition: transform .07s ease-in; }
  .ch.blink .blinker { transform: scaleY(.08); }
  .ch .looker { transition: transform .28s ease; }
  .ch .brow { transform-box: fill-box; transform-origin: center; transition: transform .2s ease; }
  .ch .eye-open, .ch .eye-happy { transition: opacity .12s; }
  .ch .head { transform-box: view-box; transform-origin: 120px 176px; transition: transform .4s cubic-bezier(.3,1.3,.5,1); }
  .ch.talking .head { animation: bob .34s ease-in-out infinite alternate; }
  @keyframes bob { from { transform: rotate(-1.6deg) translateY(0); } to { transform: rotate(1.6deg) translateY(-1px); } }
  .ch.tilt .head { transform: rotate(-7deg); }
  .ch.nod .head { animation: nod .9s ease-in-out; }
  @keyframes nod { 30% { transform: rotate(0) translateY(4px); } 60% { transform: translateY(-1px); } }
  .ch .tailL { transform-box: view-box; transform-origin: 70px 96px; animation: tailL 2.6s ease-in-out infinite; }
  .ch .tailR { transform-box: view-box; transform-origin: 170px 96px; animation: tailR 2.6s ease-in-out infinite; }
  @keyframes tailL { 50% { transform: rotate(6deg); } }
  @keyframes tailR { 50% { transform: rotate(-6deg); } }
  .ch.talking .tailL, .ch.talking .tailR { animation-duration: .7s; }
  .ch .torso { transform-box: view-box; transition: transform .35s cubic-bezier(.3,1.4,.5,1); }
  .ch.shrug .torso { transform: translateY(-6px); }
  .ch.shrug .head { transform: translateY(-2px) rotate(-6deg); }
  .ch .shoulderR { transform-box: view-box; transform-origin: 158px 214px; }
  .ch .elbowR { transform-box: view-box; transform-origin: 167px 252px; }
  .ch.wave .shoulderR { animation: shoulderR 1.7s cubic-bezier(.45,.05,.25,1); }
  .ch.wave .elbowR { animation: elbowR 1.7s ease-in-out; }
  @keyframes shoulderR {
    0% { transform: rotate(0); }
    24% { transform: rotate(-142deg); }
    31% { transform: rotate(-132deg); }
    76% { transform: rotate(-134deg); }
    100% { transform: rotate(0); }
  }
  @keyframes elbowR {
    0%, 20% { transform: rotate(0); }
    30% { transform: rotate(-8deg); }
    42% { transform: rotate(22deg); }
    54% { transform: rotate(-8deg); }
    66% { transform: rotate(22deg); }
    78%, 100% { transform: rotate(0); }
  }
  .ch .hopper { transform-box: view-box; transform-origin: 120px 262px; }
  .ch.hop .hopper { animation: hop 1.35s cubic-bezier(.3,.6,.4,1); }
  @keyframes hop {
    0% { transform: translateY(0) scale(1, 1); }
    10% { transform: translateY(2px) scale(1.04, .95); }
    28% { transform: translateY(-17px) scale(.97, 1.04); }
    44% { transform: translateY(1px) scale(1.03, .96); }
    58% { transform: translateY(-9px) scale(.99, 1.02); }
    72% { transform: translateY(0) scale(1.02, .98); }
    84% { transform: translateY(-2px) scale(1, 1); }
    100% { transform: translateY(0) scale(1, 1); }
  }
  .ch.hop .tailL { animation: tailHopL 1.35s ease-in-out; }
  .ch.hop .tailR { animation: tailHopR 1.35s ease-in-out; }
  @keyframes tailHopL { 0%,10% { transform: rotate(0); } 30% { transform: rotate(-16deg); } 46% { transform: rotate(14deg); } 60% { transform: rotate(-9deg); } 74% { transform: rotate(6deg); } 88% { transform: rotate(-2deg); } 100% { transform: rotate(0); } }
  @keyframes tailHopR { 0%,10% { transform: rotate(0); } 30% { transform: rotate(16deg); } 46% { transform: rotate(-14deg); } 60% { transform: rotate(9deg); } 74% { transform: rotate(-6deg); } 88% { transform: rotate(2deg); } 100% { transform: rotate(0); } }
  .ch .sparkles path { opacity: 0; transform-box: fill-box; transform-origin: center; }
  .ch.sparkle .sparkles path { animation: spark 1s ease-out; }
  .ch.sparkle .sparkles path:nth-child(2) { animation-delay: .12s; }
  .ch.sparkle .sparkles path:nth-child(3) { animation-delay: .24s; }
  @keyframes spark { 0% { opacity: 0; transform: scale(0) rotate(0); } 35% { opacity: 1; transform: scale(1.2) rotate(25deg); } 100% { opacity: 0; transform: scale(.5) rotate(70deg) translateY(-10px); } }
  .ch .flower { transform-box: fill-box; transform-origin: 50% 100%; }
  .ch .flower.bloom { animation: bloom .6s cubic-bezier(.3,1.6,.5,1); }
  @keyframes bloom { from { transform: scale(0); } to { transform: scale(1); } }
  .ch .gum { transform-box: fill-box; transform-origin: 50% 20%; transform: scale(0); transition: none; }
  .ch.gumming .gum { animation: inflate 1.5s cubic-bezier(.3,.9,.4,1) forwards; }
  @keyframes inflate {
    0% { transform: scale(0); }
    16% { transform: scale(.38, .34); } 26% { transform: scale(.32, .3); }
    48% { transform: scale(.66, .6); } 58% { transform: scale(.58, .56); }
    82% { transform: scale(1.02, .94); } 91% { transform: scale(.96, 1.02); } 100% { transform: scale(1.04, 1); }
  }
  .ch.gumming .mouth, .ch.popped .mouth { opacity: 0; }
  .ch.popped .gum { animation: none; transform: scale(1.4); opacity: 0; transition: transform .08s, opacity .08s; }

  .ch .mug { transform-box: view-box; transform-origin: 154px 220px; transition: transform .6s ease; }
  .ch.sip .mug { transform: translate(-31px, -46px) rotate(-24deg); }
  .ch .steam path { animation: steam 2.6s ease-in-out infinite; }
  .ch .steam path:nth-child(2) { animation-delay: .9s; }
  .ch .steam path:nth-child(3) { animation-delay: 1.7s; }
  @keyframes steam { 0% { opacity: 0; transform: translateY(6px); } 40% { opacity: .7; } 100% { opacity: 0; transform: translateY(-10px); } }

  .ch .beanie { transform-box: view-box; transform-origin: 120px 80px; }
  .ch.tug .beanie { animation: tug 1.1s cubic-bezier(.3,1.3,.5,1); }
  @keyframes tug { 0% { transform: none; } 30% { transform: translateY(7px) rotate(-4deg); } 55% { transform: translateY(-3px) rotate(3deg); } 75% { transform: translateY(1px) rotate(-1deg); } 100% { transform: none; } }
  .ch .pom { transform-box: fill-box; transform-origin: 50% 100%; }
  .ch.tug .pom { animation: pom 1.1s ease-in-out; }
  @keyframes pom { 30% { transform: rotate(-18deg); } 60% { transform: rotate(14deg); } 80% { transform: rotate(-6deg); } }
  .ch.wink [data-eye="R"] .eye-open { opacity: 0 !important; }
  .ch.wink [data-eye="R"] .eye-happy { opacity: 1 !important; }
  .ch.wink [data-eye="R"] + .brow, .ch.wink .brow[data-brow="R"] { transform: translateY(3px); }
  @media (prefers-reduced-motion: reduce) {
    .ch .bodybob, .ch.talking .head, .ch .tailL, .ch .tailR, .ch .steam path { animation: none !important; }
  }`;
  const INK = "#2A1B30";
  const MOUTH = {
    rest:     { type: "line", d: "M-8,0 Q0,5.5 8,0" },
    flat:     { type: "line", d: "M-6,1 Q0,-0.5 6,2.2" },
    m:        { type: "line", d: "M-6,1.5 Q0,2.5 6,1.5" },
    a:        { type: "fill", d: "M-9,-2 Q0,-4 9,-2 Q7,11 0,12 Q-7,11 -9,-2Z" },
    e:        { type: "fill", d: "M-10,-1 Q0,-3 10,-1 Q7,7 0,7.5 Q-7,7 -10,-1Z" },
    i:        { type: "fill", d: "M-9,-1 Q0,-2 9,-1 Q6,4 0,4.5 Q-6,4 -9,-1Z" },
    o:        { type: "fill", d: "M-5.5,3 a5.5,6.5 0 1,0 11,0 a5.5,6.5 0 1,0 -11,0" },
    u:        { type: "fill", d: "M-4,3 a4,5 0 1,0 8,0 a4,5 0 1,0 -8,0" },
    happy:    { type: "fill", d: "M-11,-1 Q0,1 11,-1 Q8,10 0,11 Q-8,10 -11,-1Z" },
    sad:      { type: "line", d: "M-7,5 Q0,-1 7,5" },
    surprised:{ type: "fill", d: "M-4.5,3 a4.5,5.5 0 1,0 9,0 a4.5,5.5 0 1,0 -9,0" },
    smirk:    { type: "line", d: "M-7,2 Q2,4 9,-3" },
    thinking: { type: "line", d: "M-5,2 L5,0" },
    grin:     { type: "line", d: "M-9,1 Q0,6 8,1 Q10,-1 11,-4" },
    toothy:   { type: "fill", d: "M-10,-2 Q0,0 11,-4.5 Q9,6.5 0,7.5 Q-8,6.5 -10,-2Z" }
  };
  const TEETH = "M-9,-1.6 Q0,0.4 10,-3.8 L9.3,-0.6 Q0,2.6 -8.4,0.6Z";
  const EXPR = {
    neutral:     { label: "Normal",      eyes: "open",  bL: [0, 0],   bR: [0, 0],   look: [0, 0],    mouth: "rest",      scale: 1 },
    happy:       { label: "Mutlu",       eyes: "happy", bL: [-3, 0],  bR: [-3, 0],  look: [0, 0],    mouth: "happy",     scale: 1 },
    unimpressed: { label: "Umursamaz",   eyes: "open",  bL: [1, 6],   bR: [-3, -4], look: [3.5, .5], mouth: "flat",      scale: 1 },
    surprised:   { label: "Şaşkın",      eyes: "open",  bL: [-7, 0],  bR: [-7, 0],  look: [0, 0],    mouth: "surprised", scale: 1.12 },
    sad:         { label: "Üzgün",       eyes: "open",  bL: [1, -15], bR: [1, 15],  look: [0, 2],    mouth: "sad",       scale: .96 },
    smirk:       { label: "Sinsi gülüş", eyes: "open",  bL: [1, 0],   bR: [-6, -9], look: [2.5, 0],  mouth: "smirk",     scale: 1 },
    thinking:    { label: "Düşünceli",   eyes: "open",  bL: [2, 7],   bR: [-3, -4], look: [-3, -3],  mouth: "thinking",  scale: 1 },
    cheeky:      { label: "Muzip",       eyes: "open",  bL: [0, 0],   bR: [0, 0],   look: [1.5, 0],  mouth: "toothy",    scale: 1 }
  };

  // Big cartoon eyes. style "round" or "almond" (cat eye). Iris is clipped inside the eye white.
  function face({ id, eyes, rx = 11, ry = 13, irisR = 8.2, iris, style = "round", wing = false, lash = true, shine = 1, shadow = null, browCurve = 3.5,
                  browY, browW = 4, browColor = INK, mouth, mouthScale = 1, lip = "#E2546A", mouthFill = "#7A2236", halfLid = null, lidW = null }) {
    const shape = (x, y, out) => style === "man"
      ? `M${x - out * rx},${y + 1.5} Q${x + out * rx * .1},${y - ry * 1.45} ${x + out * rx},${y - 1} Q${x},${y + ry * 1.05} ${x - out * rx},${y + 1.5}Z`
      : style === "sharp"
      ? `M${x - out * 11.5},${y + 2} Q${x - out * 2},${y - 8.5} ${x + out * 12.5},${y - 5} Q${x + out * 4},${y + 10} ${x - out * 11.5},${y + 2}Z`
      : style === "almond"
      ? `M${x - out * 11},${y + 3} Q${x - out * 1},${y - 14} ${x + out * 12.5},${y - 4} Q${x + out * 3},${y + 12} ${x - out * 11},${y + 3}Z`
      : `M${x - rx},${y} a${rx},${ry} 0 1,0 ${rx * 2},0 a${rx},${ry} 0 1,0 ${-rx * 2},0Z`;
    const lid = (x, y, out) => style === "man"
      ? `M${x - out * (rx + 1.5)},${y + 2} Q${x + out * rx * .1},${y - ry * 1.62} ${x + out * (rx + 2)},${y - 1.5}`
      : style === "sharp"
      ? `M${x - out * 12.5},${y + 2.5} Q${x - out * 2},${y - 9.5} ${x + out * 12.5},${y - 5.5} l${out * 9},-5.5`
      : style === "almond"
      ? `M${x - out * 11.5},${y + 3} Q${x - out * 1},${y - 14.5} ${x + out * 12.5},${y - 4.5} l${out * 6.5},-5`
      : `M${x - rx - 1},${y - 1} Q${x},${y - ry - 7} ${x + rx + 1},${y - 1}`;
    const lower = (x, y, out) => `M${x - out * 9},${y + 4.5} Q${x + out * 3},${y + 10.5} ${x + out * 12},${y - 3}`;
    const eye = ([x, y], side) => {
      const out = side === "L" ? -1 : 1;
      const cid = `${id}-clip-${side}`;
      // Lashes start exactly on the round lid curve near the outer corner and point outward.
      const lidPt = t => {
        const p0 = [x - rx - 1, y - 1], p1 = [x, y - ry - 7], p2 = [x + rx + 1, y - 1];
        return [0, 1].map(i => (1 - t) ** 2 * p0[i] + 2 * (1 - t) * t * p1[i] + t * t * p2[i]);
      };
      const lashAt = (t, len, ang) => {
        const [lx, ly] = lidPt(out === 1 ? t : 1 - t);
        const a = ang * Math.PI / 180;
        return `M${lx.toFixed(1)},${ly.toFixed(1)} l${(out * Math.cos(a) * len).toFixed(1)},${(-Math.sin(a) * len).toFixed(1)}`;
      };
      const lashes = !wing && lash && style === "round"
        ? `<path d="${lashAt(.93, 5, 25)} ${lashAt(.8, 4.5, 50)}" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>` : "";
      return `
      <clipPath id="${cid}"><path d="${shape(x, y, out)}"/></clipPath>
      <g class="eyewrap" data-eye="${side}">
        ${shadow ? `<ellipse cx="${x + out * 2}" cy="${y - 4}" rx="15" ry="9" fill="${shadow}" opacity=".55"/>` : ""}
        <g class="blinker">
          <g class="eye-open">
            <path d="${shape(x, y, out)}" fill="#FFFFFF"/>
            <g clip-path="url(#${cid})">
              <g class="looker">
                <circle cx="${x}" cy="${y + 1}" r="${irisR}" fill="${iris}"/>
                <circle cx="${x}" cy="${y + 2}" r="${irisR * .52}" fill="${INK}"/>
                <circle cx="${x + irisR * .38}" cy="${y - irisR * .35}" r="${irisR * .36 * shine}" fill="#FFFFFF"/>
                ${shine >= 1 ? `<circle cx="${x - irisR * .4}" cy="${y + irisR * .45}" r="${irisR * .16}" fill="#FFFFFF" opacity=".9"/>` : ""}
              </g>
            </g>
            ${halfLid
              ? `<path d="M${x - rx - 2},${y - ry - 3} L${x + rx + 2},${y - ry - 3} L${x + rx + 2},${y - 1} Q${x},${y - 3.5} ${x - rx - 2},${y - 1}Z" fill="${halfLid}"/>
                 <path d="M${x - rx - 1.2},${y - .8} Q${x},${y - 3.8} ${x + rx + 1.2},${y - .8}" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round"/>`
              : `<path d="${lid(x, y, out)}" fill="none" stroke="${INK}" stroke-width="${lidW ?? (wing ? 3.8 : 3)}" stroke-linecap="round" stroke-linejoin="round"/>`}
            ${style === "sharp" ? `<path d="${lower(x, y, out)}" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round" opacity=".85"/>` : ""}
            ${lashes}
          </g>
          <path class="eye-happy" d="M${x - rx},${y + 3} Q${x},${y - ry} ${x + rx},${y + 3}" fill="none" stroke="${INK}" stroke-width="3.6" stroke-linecap="round" opacity="0"/>
        </g>
      </g>`;
    };
    const brow = ([x], side) => `<path class="brow" data-brow="${side}" d="M${x - 10},${browY + 1.5} Q${x},${browY - browCurve} ${x + 10},${browY + 1.5}" fill="none" stroke="${browColor}" stroke-width="${browW}" stroke-linecap="round"/>`;
    return `
      ${eye(eyes[0], "L")}${eye(eyes[1], "R")}
      ${brow(eyes[0], "L")}${brow(eyes[1], "R")}
      <g class="mouth" transform="translate(${mouth[0]} ${mouth[1]}) scale(${mouthScale})">
        <path class="m-fill" d="${MOUTH.happy.d}" fill="${mouthFill}" stroke="${lip}" stroke-width="1.6" stroke-linejoin="round" opacity="0"/>
        <path class="m-teeth" d="${TEETH}" fill="#FFFFFF" opacity="0"/>
        <path class="m-line" d="${MOUTH.rest.d}" fill="none" stroke="${lip}" stroke-width="3.2" stroke-linecap="round"/>
      </g>`;
  }

  const SPARKLES = (pts, color = "#FFD84A") => `<g class="sparkles">${pts.map(([x, y, s]) =>
    `<path d="M${x},${y - s} Q${x},${y} ${x + s},${y} Q${x},${y} ${x},${y + s} Q${x},${y} ${x - s},${y} Q${x},${y} ${x},${y - s}Z" fill="${color}"/>`).join("")}</g>`;

  const FLOWERS = {
    calm: { label: "🌼 Sakin", svg: (() => {
      let p = ""; for (let i = 0; i < 10; i++) p += `<ellipse cx="0" cy="-26" rx="4.5" ry="11" fill="#FFFFFF" stroke="#E6E1D6" stroke-width="1" transform="rotate(${i * 36} 0 -16)"/>`;
      return `${p}<circle cx="0" cy="-16" r="7" fill="#F6C343"/>`; })() },
    happy: { label: "🌻 Mutlu", svg: (() => {
      let p = ""; for (let i = 0; i < 12; i++) p += `<ellipse cx="0" cy="-27" rx="5" ry="10" fill="#F6C343" transform="rotate(${i * 30} 0 -16)"/>`;
      return `${p}<circle cx="0" cy="-16" r="9" fill="#7A4B2A"/>`; })() },
    excited: { label: "🌷 Heyecanlı", svg: `
      <path d="M-13,-6 C-14,-22 -6,-30 0,-32 C6,-30 14,-22 13,-6 C8,0 -8,0 -13,-6Z" fill="#F07AA5"/>
      <path d="M-13,-6 C-12,-20 -6,-26 -2,-28 C-4,-20 -4,-10 0,-4 C-6,-2 -10,-3 -13,-6Z" fill="#E2578A"/>` },
    tired: { label: "🪻 Yorgun", svg: (() => {
      let p = ""; [[-6, 0], [6, 0], [-5, -7], [5, -7], [-4, -14], [4, -14], [0, -21]].forEach(([x, y], i) => p += `<ellipse cx="${x}" cy="${y - 8}" rx="5" ry="4.2" fill="${i % 2 ? "#A58BE0" : "#8C6CF0"}"/>`);
      return p; })() },
    sad: { label: "💠 Hüzünlü", svg: (() => {
      let p = ""; for (let i = 0; i < 5; i++) p += `<circle cx="0" cy="-26" r="8" fill="#86A9E8" transform="rotate(${i * 72} 0 -16)"/>`;
      return `${p}<circle cx="0" cy="-16" r="4.5" fill="#FFE08A"/>`; })() },
    tense: { label: "🌺 Gergin", svg: (() => {
      let p = ""; for (let i = 0; i < 4; i++) p += `<path d="M0,-16 C-14,-20 -16,-36 0,-38 C16,-36 14,-20 0,-16Z" fill="${i % 2 ? "#F2785A" : "#E9624A"}" transform="rotate(${i * 90 + 45} 0 -16)"/>`;
      return `${p}<circle cx="0" cy="-16" r="5" fill="#2A1B30"/>`; })() }
  };
  const daisy = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${[0, 72, 144, 216, 288].map(a => `<circle cx="0" cy="-4.5" r="3.4" fill="#FFFFFF" transform="rotate(${a})"/>`).join("")}<circle r="2.6" fill="#F6C343"/></g>`;
  // Broad bust with arms folded into the silhouette; thin crease lines suggest the arms.
  const BUST = "M58,262 C60,216 86,192 120,192 C154,192 180,216 182,262Z";
  const neck = (skin, shadow) => `<path d="M108,156 L108,180 C108,190 103,196 96,199 L144,199 C137,196 132,190 132,180 L132,156Z" fill="${skin}"/><ellipse cx="120" cy="171" rx="13" ry="5" fill="${shadow}" opacity=".7"/>`;
  const creases = shade => `<path d="M88,222 C85,238 85,252 86,262 M152,222 C155,238 155,252 154,262" fill="none" stroke="${shade}" stroke-width="2.4" stroke-linecap="round"/>`;
  // Right arm drawn in its resting pose along the body; shoulder and elbow joints animate the wave.
  const jointArm = (id, sleeve, shade, cuff, skin, line) => `
    <clipPath id="${id}-frame"><rect x="0" y="0" width="240" height="262"/></clipPath>
    <clipPath id="${id}-bust"><path d="${BUST}"/></clipPath>
    <g clip-path="url(#${id}-frame)">
      <g class="shoulderR">
        <rect x="152" y="206" width="40" height="47" fill="${sleeve}" clip-path="url(#${id}-bust)"/>
        <circle cx="166.5" cy="252" r="14.5" fill="${sleeve}" clip-path="url(#${id}-bust)"/>
        <path d="M154.5,222 C156.5,238 156.5,250 156.5,252" fill="none" stroke="${shade}" stroke-width="2.4" stroke-linecap="round"/>
        <g class="elbowR">
          <path d="M152,252 H181 C181.6,258 181.8,262 181.8,264 L181,281 H155 L153,264 Z" fill="${sleeve}"/>
          <path d="M156.5,252 L156.5,281" fill="none" stroke="${shade}" stroke-width="2.4" stroke-linecap="round"/>
          <rect x="155" y="280" width="26" height="8" rx="3" fill="${cuff}"/>
          <ellipse cx="160" cy="294" rx="4.5" ry="7" fill="${skin}" transform="rotate(25 160 294)"/>
          <ellipse cx="168.5" cy="299" rx="11" ry="12.5" fill="${skin}"/>
          <path d="M164,308 v-5 M168.5,309 v-6 M173,308 v-5" stroke="${line}" stroke-width="1.6" stroke-linecap="round"/>
        </g>
      </g>
    </g>`;

  // Luna's head (her french bob) is a painted layer; eyes, brows and mouth on top stay animated
  const LUNA_HEAD = globalThis.DSD_LUNA_HEAD || "/img/luna-head.png";
  const CREW = `<path d="M97,196 Q120,213 143,196 Q120,205 97,196Z" fill="#3E4270"/>`;
  const IVY_NECK = {
    headphones: { label: "🎧 Kulaklık",
      back: `<path d="M95,199 C97,174 143,174 145,199" fill="none" stroke="#F28DB2" stroke-width="6" stroke-linecap="round"/>`,
      front: CREW + `
        <g transform="rotate(-14 92 207)"><rect x="83" y="194" width="18" height="26" rx="8" fill="#F28DB2"/><rect x="87" y="198" width="10" height="17" rx="5" fill="#FFD1E2"/></g>
        <g transform="rotate(14 148 207)"><rect x="139" y="194" width="18" height="26" rx="8" fill="#F28DB2"/><rect x="143" y="198" width="10" height="17" rx="5" fill="#FFD1E2"/></g>
        <path d="M92,220 C88,232 96,246 92,262" fill="none" stroke="#F28DB2" stroke-width="1.8" stroke-linecap="round"/>` },
  };

  const CHARS = {
    daysy: {
      name: "Daysy",
      sig: "✨ Zıpla",
      idle: "neutral",
      voice: { wave: "sine", base: 600, len: .05, gap: 30, jitter: .2 },
      lines: [
        { tag: "Karşılama", text: "Selaaam, ben Daysy 🌼 Hadi biraz sohbet edelim, bugün nasıldı?", expr: "happy", gesture: "hop" },
        { tag: "Hatırlayan soru", text: "Dur dur, dün o sunum için çok gergindin. Nasıl geçti, anlat anlat!", expr: "surprised", gesture: "tilt" },
        { tag: "Sevinç", text: "Aaa çok sevindim! Bunu kutlamamız lazım 🎉", expr: "happy", flower: "happy", gesture: "sparkle" },
        { tag: "Destek", text: "Ah canım, zor bir gün olmuş. Gel anlat, ben buradayım 💛", expr: "sad", flower: "sad", gesture: "tilt" },
        { tag: "Kapanış", text: "Tamamdır, bugünü günlüğüne yazdım ✍️ Yarın yine konuşalım mı?", expr: "happy", gesture: "hop" }
      ],
      svg: () => `
        <svg class="ch" viewBox="0 0 240 262" role="img" aria-label="Daysy: kahverengi kabarık iki tutam saçlı, kocaman gözlü, lila kazaklı neşeli genç kız">
          <circle cx="120" cy="148" r="106" fill="#F1E4FF"/>
          <circle cx="46" cy="96" r="5" fill="#FFFFFF"/><circle cx="198" cy="76" r="7" fill="#FFFFFF" opacity=".8"/><circle cx="206" cy="190" r="4" fill="#FFFFFF"/>
          <clipPath id="daysy-frame"><rect x="-40" y="-40" width="320" height="302"/></clipPath><g clip-path="url(#daysy-frame)"><g class="hopper"><g class="bodybob">
            ${neck("#F7D2B6", "#EBBE9F")}
            <g class="torso">
              <path d="M58,258 L57,300 H183 L182,258Z" fill="#C9B6F5"/>
              <path d="${BUST}" fill="#C9B6F5"/>
              <path d="M88,222 C85,238 85,252 86,262 L86,300 M152,222 C155,238 155,252 154,262 L154,300" fill="none" stroke="#B19BE6" stroke-width="2.4" stroke-linecap="round"/>
              <path d="M94,192 Q105,210 120,198 Q135,210 146,192 Q133,188 120,190 Q107,188 94,192Z" fill="#FFFFFF"/>
              ${daisy(128, 236, 1.2)}${daisy(100, 252, .9)}
            </g>
            <g class="head">
              <g class="tailL"><ellipse cx="54" cy="124" rx="21" ry="33" fill="#6B3A2A" transform="rotate(18 54 124)"/><path d="M46,104 C40,116 40,132 46,144" fill="none" stroke="#8C5238" stroke-width="4" stroke-linecap="round"/></g>
              <g class="tailR"><ellipse cx="186" cy="124" rx="21" ry="33" fill="#6B3A2A" transform="rotate(-18 186 124)"/><path d="M194,104 C200,116 200,132 194,144" fill="none" stroke="#8C5238" stroke-width="4" stroke-linecap="round"/></g>
              <ellipse cx="68" cy="92" rx="10" ry="7" fill="#FF7FA8" transform="rotate(-30 68 92)"/>
              <ellipse cx="172" cy="92" rx="10" ry="7" fill="#FF7FA8" transform="rotate(30 172 92)"/>
              <ellipse cx="120" cy="104" rx="66" ry="62" fill="#6B3A2A"/>
              <ellipse cx="120" cy="118" rx="58" ry="54" fill="#F7D2B6"/>
              <path d="M62,110 C58,62 92,46 122,46 C154,46 182,64 178,110 C170,92 156,84 142,90 C136,78 120,74 108,82 C96,76 80,82 72,96 C68,100 64,104 62,110Z" fill="#6B3A2A"/>
              <path d="M92,58 C104,52 124,52 138,56" fill="none" stroke="#8C5238" stroke-width="5" stroke-linecap="round"/>
              <path d="M118,80 c-6,-2 -8,6 -2,7" fill="none" stroke="#6B3A2A" stroke-width="3.5" stroke-linecap="round"/>
              <g transform="translate(164 74) scale(.55)"><g class="flower" id="flower">${FLOWERS.calm.svg}</g></g>
              <ellipse cx="86" cy="140" rx="11" ry="7" fill="#FF9BB0" opacity=".55"/><ellipse cx="154" cy="140" rx="11" ry="7" fill="#FF9BB0" opacity=".55"/>
              ${face({ id: "daysy", eyes: [[97, 122], [143, 122]], rx: 11.5, ry: 13.5, irisR: 8.6, iris: "#8A5432", browY: 100, browColor: "#5A2F22", mouth: [120, 150], mouthScale: .9, lip: "#E2546A" })}
              ${SPARKLES([[62, 70, 7], [184, 64, 6], [196, 132, 5]])}
            </g>
          </g>
          </g>
          </g>
        </svg>`
    },
    ivy: {
      name: "Luna",
      sig: "🫧 Sakız patlat",
      idle: "unimpressed",
      voice: { wave: "triangle", base: 330, len: .07, gap: 38, jitter: .06 },
      lines: [
        { tag: "Karşılama", text: "Hm. Geldin sonunda. Hadi biraz sohbet edelim, ne oldu yine?", expr: "unimpressed" },
        { tag: "Hatırlayan soru", text: "Yine mi o çocuk? Cidden mi? ...Tamam, anlat. Dün yazacağım demiştin, yazdın mı?", expr: "smirk", gesture: "shrug" },
        { tag: "Şaşkınlık", text: "Dur. Ne? Baştan anlat. Hemen.", expr: "surprised" },
        { tag: "Destek", text: "Tamam, bu gerçekten berbatmış. Şaka yok, buradayım.", expr: "sad" },
        { tag: "Kapanış", text: "Yazdım. Teşekkür etmene gerek yok. ...Ama edebilirsin.", expr: "smirk", gesture: "shrug" }
      ],
      svg: () => `
        <svg class="ch" viewBox="0 0 240 262" role="img" aria-label="Luna: siyah french bob saçlı ve ince kakülleri olan, lacivert kazaklı, boynunda pembe kulaklık olan sevimli ama atarlı genç kız">
          <circle cx="120" cy="148" r="106" fill="#DEE2F6"/>
          <path d="M34,104 l0,12 M28,110 l12,0 M204,188 l0,10 M199,193 l10,0" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round"/>
          <path d="M214,74 a11,11 0 1,1 -7,-17 a9,9 0 1,0 7,17Z" fill="#FFFFFF" opacity=".9"/>
          <g class="bodybob">
            <g id="ivyNeckBack"></g>${neck("#F6D3BF", "#E6BBA6")}
            <g class="torso">
              <path d="${BUST}" fill="#2E3150"/>
              ${creases("#1F2138")}
              <path d="M104,228 L97,240 L102,240 L99,250 L108,237 L103,237 L107,228Z" fill="#F28DB2"/>
            </g>
            <g id="ivyNeckFront"></g>
            <g class="head"><g transform="translate(120 181) scale(1.1) translate(-120 -172)">
              <path d="M107.7,169.4 Q120,180.6 132.3,169.4 Q120,175 107.7,169.4Z" fill="#E3B49C" opacity=".6"/>
              <image class="luna-head" href="${LUNA_HEAD}" x="46.58" y="55.18" width="149.30" height="126.00"/>
              ${face({ id: "ivy", eyes: [[99, 126], [141, 126]], rx: 10.5, ry: 12, irisR: 7.8, iris: "#6A5A86", style: "round", lash: false, browY: 109.1, browW: 3.4, browCurve: 2.5, browColor: "#24202B", mouth: [120, 152], mouthScale: .85, lip: "#C96B6B", mouthFill: "#7A2236" })}
              <g class="gum"><circle cx="120" cy="158" r="17" fill="#F28DB2" stroke="#E46A98" stroke-width="1.5"/><ellipse cx="113" cy="151" rx="5" ry="3.4" fill="#FFFFFF" opacity=".75" transform="rotate(-30 113 151)"/><circle cx="126" cy="166" r="1.6" fill="#FFFFFF" opacity=".55"/></g>
              ${SPARKLES([[60, 66, 6], [186, 64, 5], [192, 140, 4]], "#FFFFFF")}
            </g></g>
          </g>
        </svg>`
    },
    sage: {
      name: "Eva",
      sig: "☕ Kahve yudumla",
      idle: "neutral",
      voice: { wave: "sine", base: 270, len: .085, gap: 48, jitter: .05 },
      lines: [
        { tag: "Karşılama", text: "Hoş geldin canım. Kahveni al gel, biraz sohbet edelim. Bugün nasıldı?", expr: "happy", gesture: "nod" },
        { tag: "Hatırlayan soru", text: "Geçen hafta kendine hiç vakit ayıramadığını söylemiştin. Bu hafta biraz nefes alabildin mi?", expr: "thinking", gesture: "tilt" },
        { tag: "Takdir", text: "Bak gördün mü? Sen sandığından çok daha güçlüsün.", expr: "happy", gesture: "nod" },
        { tag: "Destek", text: "Bazı günler böyle geçer. Acele etme, ben buradayım.", expr: "sad", gesture: "tilt" },
        { tag: "Kapanış", text: "Bugünü yazdım. Şimdi kendine iyi bak, yarın konuşuruz.", expr: "neutral", gesture: "nod" }
      ],
      svg: () => `
        <svg class="ch" viewBox="0 0 240 262" role="img" aria-label="Eva: koyu kahve topuzlu, gözlüklü, adaçayı yeşili hırkalı, elinde kahve kupası olan abla">
          <circle cx="120" cy="148" r="106" fill="#E4EEDC"/>
          <circle cx="44" cy="120" r="5" fill="#FFFFFF"/><circle cx="196" cy="70" r="7" fill="#FFFFFF" opacity=".8"/>
          <g class="bodybob">
            ${neck("#F2C6A0", "#E3B08C")}
            <g class="torso">
              <path d="${BUST}" fill="#F5EBDD"/>
              <path d="M58,262 C60,216 86,194 106,192 L112,262Z" fill="#8DB596"/>
              <path d="M182,262 C180,216 154,194 134,192 L128,262Z" fill="#8DB596"/>
              ${creases("#759E80")}
              <circle cx="112" cy="234" r="3" fill="#6E9677"/><circle cx="112" cy="252" r="3" fill="#6E9677"/>
              <path d="M108,177 Q120,198 132,177" fill="none" stroke="#C9A04E" stroke-width="2" stroke-linecap="round"/>
              <circle cx="120" cy="193" r="4.6" fill="#D8B26A" stroke="#B8913F" stroke-width="1.2"/>
              <circle cx="118.6" cy="191.6" r="1.3" fill="#F3DFA8"/>
              <path d="M100,193 Q120,208 140,193" fill="none" stroke="#E2D3C0" stroke-width="3" stroke-linecap="round"/>
            </g>
            <g class="head">
              <circle cx="120" cy="46" r="25" fill="#3B2620"/>
              <path d="M108,38 C112,30 128,30 132,38" fill="none" stroke="#56382E" stroke-width="3.5" stroke-linecap="round"/>
              <rect x="101" y="40" width="38" height="13" rx="6" fill="#B07A4A"/>
              <path d="M108,53 v6 M116,53 v6 M124,53 v6 M132,53 v6" stroke="#8E5E36" stroke-width="3" stroke-linecap="round"/>
              <ellipse cx="120" cy="106" rx="64" ry="58" fill="#3B2620"/>
              <path d="M64,112 C58,132 62,150 70,160" fill="none" stroke="#3B2620" stroke-width="7" stroke-linecap="round"/>
              <path d="M176,112 C182,132 178,150 170,160" fill="none" stroke="#3B2620" stroke-width="7" stroke-linecap="round"/>
              <ellipse cx="120" cy="120" rx="56" ry="52" fill="#F2C6A0"/>
              <path d="M64,112 C62,68 96,54 120,58 C144,54 178,68 176,112 C168,88 146,76 120,80 C94,76 72,88 64,112Z" fill="#3B2620"/>
              <path d="M92,66 C102,60 112,60 118,62" fill="none" stroke="#56382E" stroke-width="4" stroke-linecap="round"/>
              <circle cx="64" cy="138" r="3.4" fill="#D8B26A"/><circle cx="176" cy="138" r="3.4" fill="#D8B26A"/>
              <ellipse cx="86" cy="144" rx="10" ry="6" fill="#F0907A" opacity=".35"/><ellipse cx="154" cy="144" rx="10" ry="6" fill="#F0907A" opacity=".35"/>
              ${face({ id: "sage", eyes: [[99, 126], [141, 126]], rx: 9.5, ry: 10.5, irisR: 7, iris: "#6B4630", lash: true, browY: 107, browW: 3.8, browColor: "#3B2620", mouth: [120, 152], mouthScale: .9, lip: "#C0606A", mouthFill: "#6E2A36" })}
              <circle cx="99" cy="127" r="16" fill="#FFFFFF" fill-opacity=".12" stroke="#9A6A3A" stroke-width="3.2"/>
              <circle cx="141" cy="127" r="16" fill="#FFFFFF" fill-opacity=".12" stroke="#9A6A3A" stroke-width="3.2"/>
              <path d="M115,125 Q120,121 125,125" fill="none" stroke="#9A6A3A" stroke-width="3"/>
              ${SPARKLES([[58, 72, 6], [186, 66, 5], [196, 132, 4]], "#D8B26A")}
            </g>
            <g class="mug">
              
              <path d="M170,212 c12,0 12,18 0,18" fill="none" stroke="#FFFFFF" stroke-width="5"/>
              <rect x="136" y="198" width="36" height="40" rx="8" fill="#FFFFFF"/>
              <ellipse cx="154" cy="200" rx="16" ry="3.6" fill="#4A2C1E"/><ellipse cx="151" cy="199.6" rx="7" ry="1.6" fill="#B07A52" opacity=".9"/>
              <ellipse cx="154" cy="220" rx="6.5" ry="9" fill="#6B4430" transform="rotate(20 154 220)"/><path d="M151,212 C156,217 152,223 157,228" fill="none" stroke="#3E2519" stroke-width="1.6" stroke-linecap="round"/>
              
            </g>
          </g>
        </svg>`
    },
    charlie: {
      name: "Charlie",
      sig: "😉 Göz kırp",
      idle: "cheeky",
      voice: { wave: "triangle", base: 240, len: .065, gap: 36, jitter: .12 },
      lines: [
        { tag: "Karşılama", text: "Selam! Ben Charlie. Patlamış mısırımı aldım, anlat bakalım bugünün filmi nasıldı?", expr: "cheeky", gesture: "tilt" },
        { tag: "Hatırlayan soru", text: "Dur, dün o hoca meselesi yarım kalmıştı. Devam filmi geldi mi?", expr: "thinking", gesture: "tilt" },
        { tag: "Sevinç", text: "Oha, bu sahne Oscar'lık! Ayakta alkışlıyorum.", expr: "happy", gesture: "sparkle" },
        { tag: "Destek", text: "Tamam, bu bölüm kötü geçti. Ama hikâye burada bitmiyor, ben buradayım.", expr: "sad", gesture: "tilt" },
        { tag: "Kapanış", text: "Jenerik akıyor: bugünü günlüğüne yazdım. Yarın yeni bölüm!", expr: "cheeky", gesture: "tilt" }
      ],
      svg: () => {
        // a soft print woven into the fabric: muted line motifs, not stickers
        const ink = "#B89B70", red = "#D9897A";
        const popcorn = (x, y, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r})" opacity=".85">
          <path d="M-3.4,-3.2 a1.9,1.9 0 0,1 2.4,-2 a1.9,1.9 0 0,1 3.2,.4 a1.7,1.7 0 0,1 1.2,2" fill="none" stroke="${ink}" stroke-width="1.1" stroke-linecap="round"/>
          <path d="M-4,-3 L4,-3 L3,4.6 L-3,4.6Z" fill="none" stroke="${ink}" stroke-width="1.1" stroke-linejoin="round"/>
          <path d="M-1.3,-3 L-1,4.6 M1.3,-3 L1,4.6" stroke="${red}" stroke-width="1.1"/></g>`;
        const film = (x, y, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r})" opacity=".85">
          <rect x="-6.5" y="-3.2" width="13" height="6.4" rx="1" fill="none" stroke="${ink}" stroke-width="1.1"/>
          <path d="M-6.5,-1.6 h13 M-6.5,1.6 h13 M-2.2,-1.6 v3.2 M2.2,-1.6 v3.2" stroke="${ink}" stroke-width=".8"/></g>`;
        const star = (x, y) => `<path d="M${x},${y - 2.2} L${x + .7},${y - .7} L${x + 2.2},${y} L${x + .7},${y + .7} L${x},${y + 2.2} L${x - .7},${y + .7} L${x - 2.2},${y} L${x - .7},${y - .7}Z" fill="${red}" opacity=".7"/>`;
        const print = [[74, 226, "p", -10], [96, 240, "f", 14], [80, 254, "s"], [92, 216, "s"], [148, 220, "f", -12], [162, 236, "p", 8], [146, 252, "s"], [170, 256, "f", 20],
                       [136, 232, "s"], [104, 258, "p", -6], [158, 212, "s"], [66, 244, "s"], [138, 262, "p", 4], [112, 230, "s"]]
          .map(([x, y, k, r]) => k === "p" ? popcorn(x, y, r) : k === "f" ? film(x, y, r) : star(x, y)).join("");
        return `
        <svg class="ch" viewBox="0 0 240 262" role="img" aria-label="Charlie: dağınık koyu kahve saçlı, göz kırpan, patlamış mısır ve film desenli krem gömlekli şakacı genç">
          <circle cx="120" cy="148" r="106" fill="#FFCD80"/>
          <circle cx="46" cy="100" r="5" fill="#FFFFFF" opacity=".9"/><circle cx="198" cy="78" r="7" fill="#FFFFFF" opacity=".75"/><circle cx="204" cy="188" r="4" fill="#FFFFFF"/>
          <clipPath id="charlie-bust"><path d="${BUST}"/></clipPath>
          <g class="bodybob">
            ${neck("#F6CDAA", "#E6B48E")}
            <g class="torso">
              <path d="${BUST}" fill="#F4E7CB"/>
              <g clip-path="url(#charlie-bust)">
                ${print}
              </g>
              ${creases("#DCC9A0")}
              <path d="M107,195 L120,224 L133,195Z" fill="#F6CDAA"/>
              <path d="M120,224 L120,262" stroke="#DCC9A0" stroke-width="2.2"/>
              <circle cx="124" cy="236" r="2.6" fill="#C9B68A"/><circle cx="124" cy="252" r="2.6" fill="#C9B68A"/>
              <path d="M96,191 L107,194 L120,224 L101,212 L86,206Z" fill="#FBF2DE" stroke="#D9C59A" stroke-width="1.6" stroke-linejoin="round"/>
              <path d="M144,191 L133,194 L120,224 L139,212 L154,206Z" fill="#FBF2DE" stroke="#D9C59A" stroke-width="1.6" stroke-linejoin="round"/>
            </g>
            <g class="head">
              <ellipse cx="65" cy="132" rx="9.5" ry="12.5" fill="#F6CDAA"/><path d="M68,126 C62,128 62,136 67,139" fill="none" stroke="#E2A988" stroke-width="2.4" stroke-linecap="round"/>
              <ellipse cx="175" cy="132" rx="9.5" ry="12.5" fill="#F6CDAA"/><path d="M172,126 C178,128 178,136 173,139" fill="none" stroke="#E2A988" stroke-width="2.4" stroke-linecap="round"/>
              <ellipse cx="120" cy="122" rx="55" ry="52" fill="#F6CDAA"/>
              <path d="M63,132 C54,104 58,78 74,64 C80,52 96,44 110,46 C122,38 142,40 152,48 C170,52 184,70 184,94 C186,110 182,122 177,132
                       C176,118 172,108 166,102 Q166,111 160,114 Q160,102 150,96 Q148,106 138,108 Q140,98 128,94 Q122,104 110,104 Q114,96 104,94 Q96,100 86,108 Q88,100 82,100 Q72,110 67,128Z" fill="#6B4430"/>
              <path d="M128,94 C120,82 104,76 90,80 M150,96 C144,84 132,76 118,74 M166,102 C164,90 156,80 146,74" fill="none" stroke="#3E2419" stroke-width="2.2" stroke-linecap="round" opacity=".45"/>
              <path d="M86,62 C96,54 108,52 118,52 M134,50 C146,50 158,56 166,64" fill="none" stroke="#8A5C40" stroke-width="3.4" stroke-linecap="round"/>
              <ellipse cx="86" cy="149" rx="8" ry="4.5" fill="#F29A9A" opacity=".28"/><ellipse cx="154" cy="149" rx="8" ry="4.5" fill="#F29A9A" opacity=".28"/>
              <path d="M117,140 Q120,143 123,140" fill="none" stroke="#D99E7E" stroke-width="2" stroke-linecap="round"/>
              ${face({ id: "charlie", eyes: [[100, 130], [140, 130]], rx: 6.4, ry: 7.2, irisR: 5.6, iris: "#2E1C14", lash: false, shine: .7, halfLid: "#F6CDAA", browY: 115, browW: 4.8, browCurve: .8, browColor: "#4E3022", mouth: [121, 155], mouthScale: .85, lip: "#A8505A", mouthFill: "#7A2236" })}
              ${SPARKLES([[58, 72, 6], [186, 66, 5], [196, 136, 4]], "#FFFFFF")}
            </g>
          </g>
        </svg>`;
      }
    }
  };

// ---------- Engine (no page DOM assumptions) ----------
// Same voice, three personalities: Daysy bright & quick, Luna cool & even, Eva warm & slow.
const VOICES = { daysy: { pitch: 1.25, rate: 1.07 }, ivy: { pitch: 1.02, rate: 1.0 }, sage: { pitch: 0.88, rate: 0.92 }, charlie: { pitch: 0.72, rate: 1.06 } };
const VOWEL_PITCH = { a: 1, e: 1.12, "ı": .9, i: 1.25, o: .95, "ö": 1.05, u: .85, "ü": 1.15 };
const wait = ms => new Promise(r => setTimeout(r, ms));
function viseme(ch) {
  const c = ch.toLocaleLowerCase("tr");
  if (c === "a") return "a";
  if (c === "e") return "e";
  if ("ıi".includes(c)) return "i";
  if ("oö".includes(c)) return "o";
  if ("uü".includes(c)) return "u";
  if ("bmp".includes(c)) return "m";
  if (/[a-zçğş]/i.test(c)) return Math.random() < .5 ? "i" : "e";
  return null;
}
let trVoice = null, preferredName = "";
const MALE = /tolga|ahmet|cem|murat|mehmet|kerem|male|erkek|man\b/i;
const FEMALE_RANK = [/emel/i, /google/i, /yelda/i, /seda/i, /filiz/i, /female|kadın|woman/i];
export function turkishVoices() {
  if (!("speechSynthesis" in window)) return [];
  return speechSynthesis.getVoices().filter(v => /^tr/i.test(v.lang));
}
function pickVoice() {
  const vs = turkishVoices();
  if (preferredName) { const p = vs.find(v => v.name === preferredName); if (p) return (trVoice = p); }
  const fem = vs.filter(v => !MALE.test(v.name));
  for (const re of FEMALE_RANK) { const v = fem.find(x => re.test(x.name)); if (v) return (trVoice = v); }
  trVoice = fem[0] || null; // never fall back to a male voice: the character uses her cute "blip" voice instead
  return trVoice;
}
export function setPreferredVoice(name) { preferredName = name || ""; pickVoice(); }
export function currentVoiceName() { return trVoice ? trVoice.name : ""; }
if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.addEventListener?.("voiceschanged", pickVoice); }

// One shared audio context, unlocked on the user's first tap (needed on iPhone).
let sharedCtx = null;
export function audioCtx() {
  try { if (!sharedCtx) sharedCtx = new (window.AudioContext || window.webkitAudioContext)(); if (sharedCtx.state === "suspended") sharedCtx.resume(); } catch (_) {}
  return sharedCtx;
}
async function decodeMp3(b64) {
  const ctx = audioCtx(); if (!ctx) return null;
  const bin = atob(b64), buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  try { return await ctx.decodeAudioData(buf.buffer); } catch (_) { return null; }
}

const LUNA_SKIN = globalThis.DSD_LUNA_SKIN || (globalThis.DSD_LUNA_HEAD ? null : "/img/luna-skin.png");
export const NAMES = { daysy: "Daysy", ivy: "Luna", sage: "Eva", charlie: "Charlie" };
export function hasTTS() { return "speechSynthesis" in window && !!(trVoice || pickVoice()); }
export function stopVoice() { if ("speechSynthesis" in window) speechSynthesis.cancel(); }

export class Character {
  constructor(container, key = "daysy") {
    this.el = container; this.sound = true; this.voiceOn = true;
    this.state = { char: key, expr: "neutral", flower: "calm", ivyNeck: "headphones" };
    this.token = 0; this.timers = [];
    this.actx = null;
    if (!document.getElementById("ch-style")) { const s = document.createElement("style"); s.id = "ch-style"; s.textContent = CSS; document.head.append(s); }
    this.mount(key);
  }
  q(s) { return this.svg.querySelector(s); }
  qa(s) { return this.svg.querySelectorAll(s); }
  mount(key) {
    this.timers.forEach(clearTimeout); this.timers = []; this.token++;
    this.state.char = key;
    this.el.innerHTML = CHARS[key].svg();
    this.svg = this.el.querySelector("svg");
    this.svg.removeAttribute("role"); this.svg.setAttribute("aria-hidden", "true");
    if (key === "ivy") this.setIvyNeck("headphones");
    if (key === "daysy") this.setFlower(this.state.flower, false);
    this.applyExpr(CHARS[key].idle);
    this.loopBlink(); this.loopLook(); this.loopIdle();
  }
  // Luna's brows sit right under her painted fringe: they only show on skin, so when they rise they slip under the hair
  maskBrows() {
    const img = this.q(".luna-head"); if (!img || !LUNA_SKIN) return;
    const id = "lunaSkin" + (Character.maskN = (Character.maskN || 0) + 1);
    const ns = "http://www.w3.org/2000/svg", m = document.createElementNS(ns, "mask"), im = document.createElementNS(ns, "image");
    m.setAttribute("id", id); m.setAttribute("maskUnits", "userSpaceOnUse");
    ["x", "y", "width", "height"].forEach(a => im.setAttribute(a, img.getAttribute(a)));
    m.setAttribute("x", "0"); m.setAttribute("y", "0"); m.setAttribute("width", "240"); m.setAttribute("height", "262");
    im.setAttribute("href", LUNA_SKIN); m.append(im); img.after(m);
    this.qa(".brow").forEach(b => b.setAttribute("mask", `url(#${id})`));
  }
  get idle() { return CHARS[this.state.char].idle; }
  busy() { return this.svg.classList.contains("talking") || ["gumming", "sip", "wave", "shrug", "hop"].some(c => this.svg.classList.contains(c)); }
  setMouth(key) {
    const m = MOUTH[key] || MOUTH.rest, fill = this.q(".m-fill"), line = this.q(".m-line");
    if (!fill) return;
    this.q(".m-teeth")?.setAttribute("opacity", key === "toothy" ? "1" : "0");
    if (m.type === "fill") { fill.setAttribute("d", m.d); fill.setAttribute("opacity", "1"); line.setAttribute("opacity", "0"); }
    else { line.setAttribute("d", m.d); line.setAttribute("opacity", "1"); fill.setAttribute("opacity", "0"); }
  }
  setLook(x, y) { this.qa(".looker").forEach(el => el.style.transform = `translate(${x}px, ${y}px)`); }
  setBrows(l, r) {
    // Luna's brows are tucked under her painted fringe: they only tilt a little and never ride up into the hair,
    // so brow and fringe always move as one
    if (this.state.char === "ivy") { const k = v => [Math.max(-1, Math.min(1.5, v[0])), v[1] * .4]; l = k(l); r = k(r); }
    const a = this.q('[data-brow="L"]'), b = this.q('[data-brow="R"]');
    if (a) a.style.transform = `translateY(${l[0]}px) rotate(${l[1]}deg)`;
    if (b) b.style.transform = `translateY(${r[0]}px) rotate(${r[1]}deg)`;
  }
  applyExpr(name, { keepMouth = false } = {}) {
    const e = EXPR[name] || EXPR.neutral;
    this.state.expr = EXPR[name] ? name : "neutral";
    this.qa(".eye-open").forEach(el => el.style.opacity = e.eyes === "open" ? "1" : "0");
    this.qa(".eye-happy").forEach(el => el.setAttribute("opacity", e.eyes === "happy" ? "1" : "0"));
    this.setBrows(e.bL, e.bR);
    this.qa(".eyewrap").forEach(el => el.style.transform = `scale(${e.scale})`);
    this.setLook(e.look[0], e.look[1]);
    if (!keepMouth) this.setMouth(e.mouth);
  }
  setFlower(key, animate = true) {
    if (this.state.char !== "daysy" || !FLOWERS[key]) return;
    this.state.flower = key;
    const f = this.q("#flower"); if (!f) return;
    f.innerHTML = FLOWERS[key].svg;
    if (animate) { f.classList.remove("bloom"); void f.getBBox(); f.classList.add("bloom"); }
  }
  setIvyNeck(key) {
    if (this.state.char !== "ivy" || !IVY_NECK[key]) return;
    const b = this.q("#ivyNeckBack"), f = this.q("#ivyNeckFront");
    if (b) b.innerHTML = IVY_NECK[key].back; if (f) f.innerHTML = IVY_NECK[key].front;
  }
  flash(cls, ms) { const s = this.svg; s.classList.remove(cls); void s.getBBox(); s.classList.add(cls); setTimeout(() => s.classList.remove(cls), ms); }
  gesture(g) {
    const d = { wave: 1750, hop: 1400, sparkle: 1300, tilt: 1600, nod: 950, shrug: 900, tug: 1150, wink: 1250 }[g];
    if (d) this.flash(g, d);
  }
  resetGum() {
    const g = this.svg.querySelector(".gum"); if (!g) return;
    g.style.opacity = "0"; this.svg.classList.remove("gumming", "popped"); void g.getBBox();
    setTimeout(() => { g.style.opacity = ""; }, 60);
  }
  later(fn, ms) { const t = setTimeout(fn, ms); this.timers.push(t); return t; }
  loopBlink() {
    this.later(() => {
      const s = this.svg; s.classList.add("blink"); setTimeout(() => s.classList.remove("blink"), 130);
      if (Math.random() < .25) setTimeout(() => { s.classList.add("blink"); setTimeout(() => s.classList.remove("blink"), 120); }, 260);
      this.loopBlink();
    }, 2800 + Math.random() * 3800);
  }
  loopLook() {
    this.later(() => {
      const idle = this.idle;
      if (this.state.expr === idle && !this.busy()) {
        const base = EXPR[idle].look;
        this.setLook(base[0] + (Math.random() * 5 - 2.5), base[1] + (Math.random() * 3 - 1.5));
        setTimeout(() => this.state.expr === idle && !this.busy() && this.setLook(base[0], base[1]), 1300);
      }
      this.loopLook();
    }, 4000 + Math.random() * 3500);
  }
  async eyeRoll() {
    const e = EXPR.unimpressed;
    this.setBrows([-4, 0], [-6, 0]);
    for (const [x, y] of [[0, -5], [-4, -4], [0, -6], [4, -4], [3.5, 0]]) { this.setLook(x, y); await wait(170); }
    this.setBrows(e.bL, e.bR);
  }
  loopIdle() {
    this.later(async () => {
      const idle = this.idle;
      if (this.state.expr === idle && !this.busy()) {
        if (this.state.char === "daysy") { this.gesture("tilt"); this.applyExpr("happy"); this.gesture("sparkle"); await wait(1500); if (this.state.expr === "happy" && !this.busy()) this.applyExpr(idle); }
        else if (this.state.char === "ivy") await this.eyeRoll();
        else if (this.state.char === "charlie") { this.applyExpr("happy"); this.gesture("sparkle"); await wait(1300); if (this.state.expr === "happy" && !this.busy()) this.applyExpr(idle); }
        else this.gesture("nod");
      }
      this.loopIdle();
    }, 8000 + Math.random() * 6000);
  }
  audio() { return this.sound ? audioCtx() : null; }
  blip(ch) {
    const ctx = this.audio(); if (!ctx) return;
    const v = CHARS[this.state.char].voice;
    const mul = (VOWEL_PITCH[ch] || 1) * (1 + (Math.random() * 2 - 1) * v.jitter), t = ctx.currentTime;
    const osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = v.wave; osc.frequency.setValueAtTime(v.base * mul, t); osc.frequency.exponentialRampToValueAtTime(v.base * mul * .92, t + v.len);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.16, t + .012); g.gain.exponentialRampToValueAtTime(.0008, t + v.len * 1.25);
    osc.connect(g).connect(ctx.destination); osc.start(t); osc.stop(t + v.len * 1.25 + .03);
  }
  stop() {
    this.token++;
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    if (this.src) { try { this.src.stop(); } catch (_) {} this.src = null; }
    this.resetGum(); this.svg.classList.remove("talking", "sip", "wave", "shrug", "tilt", "nod", "tug", "wink");
    this.applyExpr(this.state.expr);
  }
  // Speak text: real Turkish voice when available (and voiceOn), otherwise playful blips. Mouth follows the letters.
  async say(text, expr, g, onProgress, audioB64) {
    const token = ++this.token;
    if ("speechSynthesis" in window) speechSynthesis.cancel();
    if (this.src) { try { this.src.stop(); } catch (_) {} this.src = null; }
    // AI voice audio from the server: decode first so the mouth can follow its exact length
    const buffer = audioB64 && this.sound ? await decodeMp3(audioB64) : null;
    if (token !== this.token) return;
    this.resetGum();
    if (expr) this.applyExpr(expr, { keepMouth: true });
    if (g) this.gesture(g);
    this.svg.classList.add("talking");
    const clean = text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").replace(/[*_#~"“”]/g, "").replace(/\s+/g, " ").trim();
    const chars = Array.from(text);
    const useTTS = !buffer && this.sound && this.voiceOn && hasTTS();
    let pos = 0, ended = !useTTS && !buffer, speakDone;
    const done = new Promise(r => speakDone = r);
    if (useTTS) {
      const v = VOICES[this.state.char];
      const parts = clean.match(/[^.!?…]+[.!?…]*\s*/g) || [clean];
      let offset = 0, left = parts.length;
      parts.forEach(part => {
        const u = new SpeechSynthesisUtterance(part.trim());
        u.lang = "tr-TR"; u.voice = trVoice; u.pitch = v.pitch; u.rate = v.rate;
        const base = offset; offset += part.length;
        u.onboundary = e => { if (typeof e.charIndex === "number") pos = Math.max(pos, base + e.charIndex); };
        u.onend = u.onerror = () => { if (--left <= 0) { ended = true; speakDone(); } };
        speechSynthesis.speak(u);
      });
      // safety: never hang if the browser drops the end event
      setTimeout(() => { if (!ended) { ended = true; speakDone(); } }, 2500 + clean.length * 110);
    }
    if (buffer) {
      const ctx = audioCtx(), src = ctx.createBufferSource();
      src.buffer = buffer; src.connect(ctx.destination);
      src.onended = () => { ended = true; speakDone(); if (this.src === src) this.src = null; };
      this.src = src; src.start();
    }
    const gap = buffer ? Math.max(35, (buffer.duration * 1000 * 0.92) / Math.max(1, chars.length) - 4) : useTTS ? 62 : CHARS[this.state.char].voice.gap;
    let sinceBrow = 0;
    while (pos < chars.length) {
      if (token !== this.token) return;
      const ch = chars[pos++];
      onProgress && onProgress(chars.slice(0, pos).join(""));
      const vis = viseme(ch);
      if (vis) { this.setMouth(vis); const low = ch.toLocaleLowerCase("tr"); if (!useTTS && !buffer && "aeıioöuü".includes(low)) this.blip(low); await wait(gap); }
      else if (/[.!?…]/.test(ch)) {
        this.setMouth("rest");
        if (ch === "!") { this.gesture(this.state.char === "daysy" ? "sparkle" : this.state.char === "charlie" ? "sparkle" : "nod"); }
        else if (ch === "?") this.gesture("tilt");
        await wait(buffer ? gap * 2 : useTTS ? 200 : 280);
      }
      else if (/[,;:]/.test(ch)) { this.setMouth("m"); await wait(140); }
      else { this.setMouth("m"); await wait(gap * .8); }
      if (ch === " " && ++sinceBrow > 4 && Math.random() < .35) {
        sinceBrow = 0; const e = EXPR[this.state.expr];
        this.setBrows([e.bL[0] - 3, e.bL[1]], [e.bR[0] - 3, e.bR[1]]);
        setTimeout(() => token === this.token && this.setBrows(e.bL, e.bR), 220);
      }
    }
    // keep lips moving softly until the voice actually finishes
    while (!ended && token === this.token) { this.setMouth(Math.random() < .5 ? "e" : "m"); await Promise.race([wait(110), done]); }
    if (token !== this.token) return;
    onProgress && onProgress(text);
    this.svg.classList.remove("talking");
    this.applyExpr(this.state.expr);
  }
  listen() { if (!this.busy()) { this.applyExpr("neutral"); this.setLook(0, 1); this.setBrows([-2, 0], [-2, 0]); } }
  // Small "I'm listening" moments while the user talks.
  react(kind) {
    if (this.svg.classList.contains("talking")) return;
    const e = EXPR[this.state.expr] || EXPR.neutral;
    if (kind === "nod") this.gesture("nod");
    else if (kind === "tilt") this.gesture("tilt");
    else if (kind === "brow") { this.setBrows([e.bL[0] - 5, e.bL[1]], [e.bR[0] - 5, e.bR[1]]); setTimeout(() => this.setBrows(e.bL, e.bR), 500); }
    else if (kind === "smile") { this.applyExpr("happy"); setTimeout(() => { if (this.state.expr === "happy" && !this.svg.classList.contains("talking")) this.applyExpr("neutral"); }, 1400); }
    else if (EXPR[kind]) this.applyExpr(kind);
  }
  // Her little habit, no words: Daysy hops, Luna blows a gum bubble, Eva sips her coffee.
  async flourish() {
    if (this.svg.classList.contains("talking") || ["gumming", "popped", "sip", "hop", "tug"].some(c => this.svg.classList.contains(c))) return;
    const token = this.token, k = this.state.char, before = this.state.expr;
    if (k === "daysy") {
      this.applyExpr("happy"); this.gesture("hop"); setTimeout(() => token === this.token && this.gesture("sparkle"), 380);
      await wait(1400);
    } else if (k === "ivy") {
      this.applyExpr("unimpressed"); this.setMouth("u"); this.svg.classList.add("gumming");
      await wait(1550); if (token !== this.token) return this.resetGum();
      this.svg.classList.add("popped"); await wait(120); this.resetGum();
      if (Math.random() < .5) await this.eyeRoll();
    } else if (k === "charlie") {
      // a grin, a wink and a little sparkle
      this.applyExpr("happy"); await wait(450); if (token !== this.token) return;
      this.applyExpr("cheeky"); this.gesture("tilt"); this.gesture("sparkle");
      await wait(1100);
    } else {
      this.svg.classList.add("sip"); await wait(650); if (token !== this.token) return this.svg.classList.remove("sip");
      this.qa(".eye-open").forEach(el => el.style.opacity = "0"); this.qa(".eye-happy").forEach(el => el.setAttribute("opacity", "1")); this.setMouth("u");
      await wait(1100); this.svg.classList.remove("sip"); await wait(400);
    }
    if (token === this.token && !this.svg.classList.contains("talking")) this.applyExpr(before);
  }
  async signature(line, onProgress) {
    this.stop(); const token = this.token, k = this.state.char;
    if (k === "daysy") {
      this.applyExpr("happy"); this.gesture("hop");
      setTimeout(() => token === this.token && this.gesture("sparkle"), 380);
      await wait(1300); if (token !== this.token) return;
      return this.say(line || "Hey heyy, geldin!", "happy", null, onProgress);
    } else if (k === "ivy") {
      this.applyExpr("unimpressed"); this.setMouth("u"); this.svg.classList.add("gumming");
      await wait(1550); if (token !== this.token) return;
      this.svg.classList.add("popped"); await wait(120); this.resetGum(); this.applyExpr("unimpressed");
      await wait(250); await this.eyeRoll(); if (token !== this.token) return;
      return this.say(line || "Ne? Bilerek yaptım.", "smirk", null, onProgress);
    } else if (k === "charlie") {
      // a flirty wink with a sideways grin
      this.applyExpr("cheeky"); this.setBrows([0, 0], [-4, -8]); this.gesture("tilt"); this.gesture("wink");
      await wait(350); if (token !== this.token) return; this.gesture("sparkle");
      await wait(1000); if (token !== this.token) return;
      return this.say(line || "Patlamış mısırım hazır, başrol sende. Anlat bakalım!", "cheeky", null, onProgress);
    } else {
      this.applyExpr("neutral"); this.svg.classList.add("sip"); await wait(650); if (token !== this.token) return;
      this.qa(".eye-open").forEach(el => el.style.opacity = "0"); this.qa(".eye-happy").forEach(el => el.setAttribute("opacity", "1")); this.setMouth("u");
      await wait(1100); this.svg.classList.remove("sip"); await wait(400); if (token !== this.token) return;
      return this.say(line || "Mmm. Kahve gibisi yok.", "happy", "nod", onProgress);
    }
  }
}
export const EXPRESSIONS = Object.keys(EXPR);
export { FLOWERS };
