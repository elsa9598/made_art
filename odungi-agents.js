// 오둥이 하루 — 3에이전트 자동 프롬프트 생성기
// ──────────────────────────────────────────────────────────────
//  이미지 → 드니로(Visual Director)   : made_art 그림 탭 로직
//  음악   → 상추(Music Director)      : made_art 음악 탭 로직
//  4컷    → 배추(4컷 만화 작가)        : made_art 4컷 카툰 탭 로직
//
//  사용: node odungi-agents.js 이미지|음악|4컷
//  결과: D:\Claude_works\made_art\산출물\<타입>_<시각>_<에이전트>.txt
//
//  · made_art/data.js 의 모든 선택지를 그대로 사용 (복수 선택 반영)
//  · 매 실행마다 무작위 조합 → .odungi-history.json 으로 중복 차단
//  · made_art 탭과 100% 동일한 프롬프트 포맷 + 최고품질 디렉티브 추가
// ──────────────────────────────────────────────────────────────
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, "산출물");
const HIST_FILE = path.join(OUT_DIR, ".odungi-history.json");

// ── data.js 로드 (브라우저 IIFE → window 셰임) ───────────────────
const window = {};
eval(fs.readFileSync(path.join(ROOT, "data.js"), "utf8")); // assigns window.ODUNGI_DATA
const D = window.ODUNGI_DATA;
if (!D) {
  console.error("data.js 로드 실패 — window.ODUNGI_DATA 없음");
  process.exit(1);
}

// ── 공용 헬퍼 (app.jsx 동일) ────────────────────────────────────
const uniq = (a) => Array.from(new Set(a));
const labelToEn = (list, ko) => {
  const f = list.find((x) => x.ko === ko);
  return f ? f.en : ko;
};
function buildCharacterBlock(charKeys, { anthropomorphic = true } = {}) {
  if (!charKeys.length) return { imageRefs: "", descriptions: "" };
  const imageRefs = charKeys
    .map((k, i) => `Image${i + 1}: ${k} (${D.CHARACTER_PRESETS[k].name_en})`)
    .join(", ");
  const descriptions = charKeys
    .map((k, i) => {
      const c = D.CHARACTER_PRESETS[k];
      const isAnimal = D.ANIMAL_KEYS.includes(k);
      const anth =
        isAnimal && anthropomorphic
          ? "anthropomorphized standing upright on two legs like a human character"
          : null;
      return `Image${i + 1} = ${c.name_en} [${k}]: ${c.description}${
        anth ? ". " + anth : ""
      }`;
    })
    .join(" | ");
  return { imageRefs, descriptions };
}

// ── 무작위 선택 ────────────────────────────────────────────────
const rnd = (n) => Math.floor(Math.random() * n);
const pickOne = (list) => list[rnd(list.length)];
function pickKos(list, min, max) {
  const n = min + rnd(max - min + 1);
  const pool = [...list];
  // Fisher–Yates
  for (let i = pool.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(n, pool.length)).map((x) => x.ko);
}
function pickCharKeys() {
  const keys = Object.keys(D.CHARACTER_PRESETS);
  const n = 1 + rnd(3); // 1~3명
  const pool = [...keys];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, n);
}

// ── 히스토리 (중복 차단) ────────────────────────────────────────
function loadHist() {
  try {
    return JSON.parse(fs.readFileSync(HIST_FILE, "utf8"));
  } catch {
    return { image: [], music: [], cartoon: [] };
  }
}
function saveHist(h) {
  fs.writeFileSync(HIST_FILE, JSON.stringify(h, null, 0), "utf8");
}

// 중복 안 나올 때까지 최대 60회 재추첨
function uniquePick(kind, hist, makeFn) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const sel = makeFn();
    const sig = JSON.stringify(sel);
    if (!hist[kind].includes(sig)) {
      hist[kind].push(sig);
      if (hist[kind].length > 2000) hist[kind].shift();
      return sel;
    }
  }
  // 조합 공간이 다 차는 건 사실상 불가능 — 마지막 결과라도 반환
  return makeFn();
}

// ── 이미지 (드니로) ────────────────────────────────────────────
function selectImage() {
  const chars = pickCharKeys();
  const scene = pickKos(D.SCENE, 1, 2);
  return {
    chars,
    anth: true,
    tods: [pickOne(D.TIME_OF_DAY).ko],
    weather: pickKos(D.WEATHER, 1, 2),
    scene,
    camera: pickKos(D.CAMERA, 1, 2),
    lighting: pickKos(D.LIGHTING, 1, 2),
    style: pickKos(D.STYLE, 1, 2),
    tech: pickKos(D.TECHNIQUE, 1, 3),
    ratio: [pickOne(D.RATIO).ko],
    // 피사계심도 — 캐릭터 선명 / 배경 보케 (품질 ↑)
    focus: chars.length ? [chars[0]] : [],
    unfocusScene: scene.length ? [scene[scene.length - 1]] : [],
  };
}
function buildImagePrompt(s) {
  const lines = [];
  lines.push("=== ODUNGI HARU — IMAGE PROMPT ===");
  lines.push("");
  const block = buildCharacterBlock(s.chars, { anthropomorphic: s.anth });
  if (block.imageRefs) {
    lines.push("[CHARACTERS]");
    lines.push("Reference images attached: " + block.imageRefs);
    lines.push("Character descriptions for consistency:");
    lines.push(block.descriptions);
    lines.push(
      "Maintain identical appearance and proportions across all images. Match each attached reference photo to its labeled character above."
    );
    if (s.anth && s.chars.some((k) => D.ANIMAL_KEYS.includes(k))) {
      lines.push(
        "Animal characters (Baechu, Sangchu, Yeolmu, Ggami, Gimchi) are anthropomorphized — standing upright on two legs, posed and acting like humans in this scene."
      );
    }
    lines.push("");
  }
  const focusParts = s.focus.map((k) => D.CHARACTER_PRESETS[k]?.name_en || k);
  if (focusParts.length)
    lines.push(`[FOCUS] Sharp, crisp focus on: ${focusParts.join(", ")}.`);
  const unfocusParts = s.unfocusScene.map((k) => labelToEn(D.SCENE, k));
  if (unfocusParts.length)
    lines.push(
      `[OUT OF FOCUS] Soft bokeh / out-of-focus blur on: ${unfocusParts.join(", ")}.`
    );
  if (focusParts.length || unfocusParts.length) lines.push("");
  if (s.scene.length)
    lines.push(
      "[SCENE] " + uniq(s.scene.map((k) => labelToEn(D.SCENE, k))).join("; ")
    );
  if (s.tods.length)
    lines.push(
      "[TIME OF DAY] " +
        uniq(s.tods.map((k) => labelToEn(D.TIME_OF_DAY, k))).join(", ")
    );
  if (s.weather.length)
    lines.push(
      "[WEATHER] " +
        uniq(s.weather.map((k) => labelToEn(D.WEATHER, k))).join(", ")
    );
  if (s.lighting.length)
    lines.push(
      "[LIGHTING] " +
        uniq(s.lighting.map((k) => labelToEn(D.LIGHTING, k))).join(", ")
    );
  if (s.camera.length)
    lines.push(
      "[CAMERA] " +
        uniq(s.camera.map((k) => labelToEn(D.CAMERA, k))).join(", ")
    );
  lines.push("");
  if (s.style.length)
    lines.push(
      "[STYLE] " + uniq(s.style.map((k) => labelToEn(D.STYLE, k))).join(", ")
    );
  if (s.tech.length)
    lines.push(
      "[TECHNIQUE] " +
        uniq(s.tech.map((k) => labelToEn(D.TECHNIQUE, k))).join(", ")
    );
  if (s.ratio.length)
    lines.push(
      `[ASPECT RATIO] ${labelToEn(D.RATIO, s.ratio[0])} (${s.ratio[0]})`
    );
  lines.push("");
  lines.push(
    "[QUALITY] masterpiece, best quality, ultra-detailed, award-winning illustration, professional color grading, perfect composition, no text, no watermark, no logo."
  );
  lines.push("");
  lines.push(
    "Render a single cohesive, high-end illustration combining all elements above. Keep character appearances consistent with the attached reference images."
  );
  return lines.join("\n");
}

// ── 음악 (상추) ────────────────────────────────────────────────
const MUSIC_EMOTION = [
  "잔잔한 위로",
  "설레는 시작",
  "포근한 그리움",
  "조용한 다짐",
  "따뜻한 재회",
  "쓸쓸한 끝자락",
  "소소한 행복",
  "벅찬 감동",
  "고요한 평화",
  "아련한 추억",
];
const MUSIC_STRUCT = [
  "인트로 → 벌스 → 프리코러스 → 코러스 → 브릿지 → 아웃트로, 후반부 자연스러운 페이드아웃",
  "잔잔한 인트로 8마디 → 점층적으로 고조 → 후렴에서 감정 폭발 → 여운 있는 엔딩",
  "어쿠스틱 인트로 → 미니멀 벌스 → 풍성한 코러스 → 브릿지에서 키 전환 → 따뜻한 마무리",
  "루프 기반 그루브 유지 → 벌스/코러스 명확한 다이내믹 대비 → 마지막 후렴 더블링",
];
const MUSIC_HUM = [
  "인트로에 따뜻한 허밍 8마디",
  "후렴 직전 4마디 허밍으로 감정 고조",
  "아웃트로에 잔잔한 허밍 페이드아웃",
  "도입부 휘파람 8마디 후 본 멜로디 진입",
];
function selectMusic() {
  const sc = pickOne(D.SCENE);
  const td = pickOne(D.TIME_OF_DAY);
  const wt = pickOne(D.WEATHER);
  const emo = MUSIC_EMOTION[rnd(MUSIC_EMOTION.length)];
  const subject = `${td.ko}, ${sc.ko} — ${wt.ko} 속 ${emo}`;
  let vocal = pickKos(D.VOCAL, 1, 2);
  if (vocal.includes("인스트루멘탈") || vocal.includes("인스트루멘탈 no vocals"))
    vocal = ["인스트루멘탈"];
  const lang =
    Math.random() < 0.7 ? "한글 가사" : pickOne(D.LYRIC_LANG).ko;
  return {
    subject,
    sceneEn: sc.en,
    todEn: td.en,
    weatherEn: wt.en,
    genre: pickKos(D.GENRE, 1, 2),
    mood: pickKos(D.MOOD, 1, 3),
    vocal,
    chorus: [pickOne(D.CHORUS).ko],
    lang: [lang],
    humming: Math.random() < 0.5 ? MUSIC_HUM[rnd(MUSIC_HUM.length)] : "",
    extra: MUSIC_STRUCT[rnd(MUSIC_STRUCT.length)],
  };
}
function buildMusicPrompt(s) {
  const lines = [];
  lines.push("=== ODUNGI HARU — MUSIC PROMPT ===");
  lines.push("");
  lines.push(`[SUBJECT / THEME] ${s.subject}`);
  lines.push("");
  lines.push("[REFERENCE IMAGE]");
  lines.push(
    "A reference image (the matching Odungi Haru illustration of this same moment) will be attached separately. Analyze its mood, color palette, lighting, composition, and subject matter."
  );
  lines.push(
    "From the attached image AND the subject above, automatically derive: the instrument set, the tempo (BPM), and the musical key (major / minor). Pick instruments and harmony that emotionally match BOTH the image and the subject."
  );
  lines.push(
    `Visual mood reference: ${s.sceneEn}, ${s.todEn}, ${s.weatherEn}.`
  );
  lines.push("");
  if (s.genre.length)
    lines.push(
      "[GENRE] " + uniq(s.genre.map((k) => labelToEn(D.GENRE, k))).join(", ")
    );
  if (s.mood.length)
    lines.push(
      "[MOOD] " + uniq(s.mood.map((k) => labelToEn(D.MOOD, k))).join(", ")
    );
  if (s.vocal.length)
    lines.push(
      "[VOCAL] " + uniq(s.vocal.map((k) => labelToEn(D.VOCAL, k))).join(", ")
    );
  if (s.chorus.length)
    lines.push("[BACKING CHORUS] " + labelToEn(D.CHORUS, s.chorus[0]));
  if (s.lang.length)
    lines.push(
      `[LYRIC LANGUAGE] ${labelToEn(
        D.LYRIC_LANG,
        s.lang[0]
      )}. The lead vocalist sings in this language; pronunciation should be natural and clear.`
    );
  if (s.humming) lines.push(`[HUMMING] ${s.humming}`);
  if (s.extra) lines.push(`[ADDITIONAL] ${s.extra}`);
  lines.push("");
  lines.push(
    "[PRODUCTION] Professional studio-grade mix and master, rich dynamic range, full emotional arc, radio-ready polish, clean stereo image."
  );
  lines.push("");
  lines.push(
    "[AUTO-DETECT FROM IMAGE + SUBJECT] Choose the instrument set, tempo (BPM), and key (major / minor) that best fit both the mood of the attached image AND the subject above. Output a full-length song that matches all directives above."
  );
  return lines.join("\n");
}

// ── 4컷 카툰 (배추) ────────────────────────────────────────────
function selectCartoon() {
  const cats = Object.keys(D.TALMUD_CATEGORIES);
  const cat = cats[rnd(cats.length)];
  const storyIdx = rnd(100);
  return { chars: pickCharKeys(), anth: true, cat, storyIdx };
}
// cartoon-tab.jsx 의 seeded planning 그대로 재현
function planCartoon(cat, storyIdx) {
  const seedStr = cat + "::" + storyIdx;
  let h = 0;
  for (let i = 0; i < seedStr.length; i++)
    h = (h * 31 + seedStr.charCodeAt(i)) | 0;
  const pool = [
    { ko: "버드아이뷰", en: "bird's eye view" },
    { ko: "전신뷰", en: "full body shot" },
    { ko: "미디엄뷰", en: "medium shot" },
    { ko: "후면뷰", en: "back view" },
    { ko: "정면뷰", en: "front view" },
    { ko: "로우앵글뷰", en: "low angle view" },
    { ko: "투시뷰", en: "perspective view" },
    { ko: "와이드뷰", en: "wide angle shot" },
    { ko: "아이소메트릭뷰", en: "isometric view" },
    { ko: "측면뷰", en: "side profile view" },
  ];
  const rng = (n) => {
    h = (h * 9301 + 49297) % 233280;
    return Math.floor((h / 233280) * n);
  };
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = rng(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const cams = shuffled.slice(0, 4);
  const closeupPanel = rng(4);
  const acts = ["전개 (도입)", "발단 (사건 시작)", "위기 (긴장)", "결말 (교훈)"];
  const actsEn = [
    "Setup / Introduction",
    "Inciting incident",
    "Crisis / tension",
    "Resolution / lesson",
  ];
  return { cams, closeupPanel, acts, actsEn };
}
function buildCartoonPrompt(s) {
  const stories = D.TALMUD_CATEGORIES[s.cat].stories;
  const lesson = stories[s.storyIdx];
  const planning = planCartoon(s.cat, s.storyIdx);
  const lines = [];
  lines.push("=== ODUNGI HARU — 4-PANEL TALMUD CARTOON PROMPT ===");
  lines.push("");
  const block = buildCharacterBlock(s.chars, { anthropomorphic: s.anth });
  if (block.imageRefs) {
    lines.push("[CHARACTERS]");
    lines.push("Reference images attached: " + block.imageRefs);
    lines.push("Character descriptions for consistency:");
    lines.push(block.descriptions);
    lines.push(
      "All four panels MUST use the EXACT same character appearance, fur/hair colors, body proportions and outfits. Match each attached reference photo to its labeled character above. Only facial expressions and poses vary across panels."
    );
    if (s.anth && s.chars.some((k) => D.ANIMAL_KEYS.includes(k))) {
      lines.push(
        "Animal characters (Baechu, Sangchu, Yeolmu, Ggami, Gimchi) are ANTHROPOMORPHIZED: they stand upright on two legs, gesture with paws like hands, and act like human characters throughout all four panels."
      );
    }
    lines.push("");
  }
  lines.push(`[CATEGORY] ${s.cat} (${D.TALMUD_CATEGORIES[s.cat].en})`);
  lines.push(`[TALMUD STORY #${s.storyIdx + 1}] ${stories[s.storyIdx]}`);
  lines.push(`[ONE-LINE LESSON / KOREAN] ${lesson}`);
  lines.push(
    "Do NOT translate literally. Interpret the lesson freely so the four panels deliver the Talmud moral with clarity and emotional weight."
  );
  lines.push("");
  lines.push("[FORMAT]");
  lines.push(
    "Output is a SINGLE high-end digital cartoon image with a 9:16 vertical aspect ratio. The image contains 4 panels stacked VERTICALLY from top to bottom (1st panel at the top → 4th panel at the bottom). Each panel has an equal, clean white border / gutter around it (approx 24px white frame and white gutters between panels). Panels share the same character design language and consistent line weight."
  );
  lines.push(
    "IMPORTANT: Do NOT print any panel numbers, numerals, or labels (no '1', '2', '3', '4', no '#1', no 'Panel 1') anywhere inside or on the panels. The reading order is implied purely by the vertical stacking from top to bottom."
  );
  lines.push(
    `RANDOM SPLIT PANEL: the ${
      ["1st (top)", "2nd", "3rd", "4th (bottom)"][planning.closeupPanel]
    } panel — and ONLY this one panel — is divided VERTICALLY into two equal halves by a thin white gutter. The LEFT half shows the main composition (using the camera view assigned below). The RIGHT half is a CLOSE-UP shot of the SAME moment — character's eyes, hands, or a key object — to amplify the emotion. Both halves share one outer white border so the split is clearly read as a single panel. The other three panels remain as single, un-split frames.`
  );
  lines.push(
    "All four panels must use DIFFERENT camera angles — never repeat. Use the angles assigned below. Focus / out-of-focus must be designed to maximize persuasion of the lesson: sharp focus on the meaningful element, soft bokeh on supporting elements."
  );
  lines.push("");
  lines.push(
    "[PANEL-BY-PANEL DIRECTIONS] (positional only — do NOT render these labels)"
  );
  for (let i = 0; i < 4; i++) {
    const cam = planning.cams[i];
    const isCU = i === planning.closeupPanel;
    const posName = ["TOP", "SECOND", "THIRD", "BOTTOM"][i];
    lines.push(
      `${posName} panel — ${planning.actsEn[i]} — Camera: ${cam.en} (${cam.ko})${
        isCU
          ? " — SPLIT PANEL: left half uses this camera view, right half is an extreme close-up of the same scene's key emotional detail"
          : ""
      }. Characters express a NEW emotion and pose distinct from the other panels. Use focus / depth-of-field to drive the message home. Include a concise English speech bubble (max ~8 words) that pushes the story forward and lands the moral.`
    );
  }
  lines.push("");
  lines.push("[TEXT OVERLAYS]");
  lines.push(
    `At the TOP CENTER of the entire image (above or within the top panel area, outside any speech bubble): write the category label in KOREAN — "${s.cat}" — in a clean, bold, slightly playful Korean typeface.`
  );
  lines.push(
    `At the BOTTOM CENTER of the entire image (below or within the bottom panel area): write the one-line Talmud lesson in KOREAN — "${lesson}" — in a clean, readable Korean typeface, centered, with subtle weight.`
  );
  lines.push(
    "All speech bubbles inside panels are in ENGLISH, kept short and conversational. Do not crowd the panels with text. Do NOT render any panel numbers anywhere."
  );
  lines.push("");
  lines.push(
    "[STYLE] High-end digital cartoon illustration. Warm color palette. Crisp linework. Cinematic lighting per panel that matches the story beat. Maintain identical character look across all panels — the only variations are expression, pose, camera angle, and background."
  );
  lines.push(
    "[QUALITY] masterpiece, best quality, ultra-detailed, award-winning webtoon art, professional color grading, perfect panel composition, flawless Korean typography for the two overlay texts only."
  );
  return lines.join("\n");
}

// ── 산출물 저장 ────────────────────────────────────────────────
function tsNow() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}` +
    `-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`
  );
}

const AGENTS = {
  image: {
    ko: "이미지",
    agent: "드니로",
    role: "Visual Director",
    select: selectImage,
    build: buildImagePrompt,
    summary: (s) =>
      `캐릭터 ${s.chars.join("·")} / 시간대 ${s.tods[0]} / 날씨 ${s.weather.join(
        "·"
      )} / 배경 ${s.scene.join("·")} / 카메라 ${s.camera.join(
        "·"
      )} / 광원 ${s.lighting.join("·")} / 화풍 ${s.style.join(
        "·"
      )} / 기법 ${s.tech.join("·")} / 비율 ${s.ratio[0]}`,
  },
  music: {
    ko: "음악",
    agent: "상추",
    role: "Music Director",
    select: selectMusic,
    build: buildMusicPrompt,
    summary: (s) =>
      `주제 "${s.subject}" / 장르 ${s.genre.join("·")} / 분위기 ${s.mood.join(
        "·"
      )} / 보컬 ${s.vocal.join("·")} / 코러스 ${s.chorus[0]} / 가사 ${s.lang[0]}`,
  },
  cartoon: {
    ko: "4컷",
    agent: "배추",
    role: "4컷 만화 작가",
    select: selectCartoon,
    build: buildCartoonPrompt,
    summary: (s) => {
      const st = D.TALMUD_CATEGORIES[s.cat].stories[s.storyIdx];
      return `카테고리 ${s.cat} / 스토리 #${s.storyIdx + 1} "${st}" / 캐릭터 ${s.chars.join(
        "·"
      )}`;
    },
  },
};

function resolveKind(arg) {
  const a = (arg || "").trim().toLowerCase();
  if (["이미지", "image", "img", "그림"].includes(a)) return "image";
  if (["음악", "music", "노래", "song"].includes(a)) return "music";
  if (["4컷", "사컷", "4cut", "cartoon", "만화", "4컷만화"].includes(a))
    return "cartoon";
  return null;
}

function main() {
  const kind = resolveKind(process.argv[2]);
  if (!kind) {
    console.error(
      "사용법: node odungi-agents.js 이미지|음악|4컷\n" +
        "  이미지 → 드니로 · 음악 → 상추 · 4컷 → 배추"
    );
    process.exit(1);
  }
  const cfg = AGENTS[kind];
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const hist = loadHist();
  const sel = uniquePick(kind, hist, cfg.select);
  const prompt = cfg.build(sel);
  saveHist(hist);

  const ts = tsNow();
  const fname = `${cfg.ko}_${ts}_${cfg.agent}.txt`;
  const fpath = path.join(OUT_DIR, fname);
  const human = new Date().toLocaleString("ko-KR");
  const body =
    prompt +
    "\n\n" +
    "────────────────────────────────────────────\n" +
    `🐾 ${cfg.agent} (${cfg.role}) · ${cfg.ko} 산출물 · ${human}\n` +
    `🎲 선택 요약: ${cfg.summary(sel)}\n` +
    "※ 위 === 부터 [QUALITY] 끝까지를 그대로 복사해 생성 AI에 붙여넣으세요.\n";
  fs.writeFileSync(fpath, body, "utf8");

  console.log(`✅ ${cfg.agent}(${cfg.role}) — ${cfg.ko} 생성 완료`);
  console.log(`📄 ${fpath}`);
  console.log(`🎲 ${cfg.summary(sel)}`);
  console.log(`📊 누적 ${cfg.ko} 산출물: ${hist[kind].length}개 (중복 0)`);
}

main();
