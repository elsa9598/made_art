const { useState: useStateI, useMemo: useMemoI } = React;

const ASPECT_RATIOS = [
  { ko: "1:1", en: "--ar 1:1" },
  { ko: "16:9", en: "--ar 16:9" },
  { ko: "4:3", en: "--ar 4:3" },
  { ko: "3:2", en: "--ar 3:2" },
  { ko: "2:1", en: "--ar 2:1" },
  { ko: "5:4", en: "--ar 5:4" },
  { ko: "7:5", en: "--ar 7:5" },
];

const ART_STYLE_OPTIONS = [
  {
    id: "watercolor",
    ko: "1. 웻온웻 수채화",
    en:
      "Wet-on-wet watercolor on pre-wetted paper, with soft bleeding color edges, natural pigment blooms, transparent layered washes, visible paper grain, and luminous stains of reflected light. Use color masses and soft bokeh in the background and non-focal areas, while keeping the main subject readable inside a small clear focal area. Details should be simplified into gentle watercolor shapes, with distant scenery dissolved into atmospheric washes rather than sharp linework.",
  },
  {
    id: "impasto",
    ko: "2. 마티에르 유화",
    en:
      "Impasto oil painting with a strong sense of matiere and physical surface texture. Build the image from thick layered oil paint, palette-knife marks, raised brush ridges, visible canvas tooth, and sculptural pigment relief that catches light and shadow. Use dense buttery paint, broken strokes, layered glazing over darker underpainting, and tactile highlights placed on top of the paint surface. The result should feel like a hand-painted canvas with dimensional material presence, not a smooth digital illustration.",
  },
  {
    id: "ink-wash",
    ko: "3. 수묵담채화",
    en:
      "East Asian ink-and-light-color painting in the spirit of sumukhwa and sumi-e, using decisive calligraphic brushstrokes, controlled ink load, and expressive pressure changes within each stroke. Show a full range of ink tones from deep black to pale gray, with soft diluted washes, dry-brush texture, natural feathering on absorbent paper, and restrained mineral color accents. Forms should be simplified with elegant negative space and atmospheric mist, capturing the essence of the subject through brush rhythm rather than excessive detail.",
  },
  {
    id: "abstract",
    ko: "4. 추상화",
    en:
      "Controlled semi-abstract painting that emphasizes color, form, gesture, rhythm, texture, and composition while preserving the subject as recognizable. Simplify nonessential details into expressive shapes, layered translucent and opaque color fields, gestural brush marks, scraped textures, and a balance of hard edges and dissolved edges. Use contrast, scale, repetition, negative space, and spatial ambiguity to create emotional atmosphere. Abstract the background and supporting shapes more strongly than the main subject.",
  },
  {
    id: "colored-pencil",
    ko: "5. 색연필",
    en:
      "Colored pencil illustration on textured drawing paper, with visible paper tooth, carefully layered pigment, fine hatching and cross-hatching, and gradual tonal buildup from light pressure to rich saturated color. Use directional pencil strokes that follow the form, transparent color mixing through many layers, soft blended gradients, crisp hand-drawn edges, and burnished areas where wax-based pigment is polished into a smooth luminous surface. Preserve clean highlights and tactile hand-drawn texture throughout the image.",
  },
];

const ART_STYLE_CONTROL =
  "Apply the chosen art style only to rendering, brushwork, color, texture, material surface, and background treatment. Keep the requested subject, species, anatomy, pose, clothing, facial identity, composition, and scene clearly recognizable and consistent.";

const ODUNGI_CHARACTER_OPTIONS = [
  {
    id: "kimchi",
    ko: "김치",
    short: "Scottish Fold cat",
    en:
      "Character design 1 - white Scottish Fold cat: all-white fluffy coat, distinctive folded flat ears pressed close to a very round chubby head, sharp yellow-amber half-lidded eyes with a perpetually grumpy stern expression, small pink heart-shaped nose, tiny freckles near the nose, short whisker lines, plump round chubby body, short stubby legs, soft rounded paws, thick fluffy tail, always looking displeased and unimpressed, minimalist clean cartoon style.",
  },
  {
    id: "sangchu",
    ko: "상추",
    short: "Old English Sheepdog",
    en:
      "Character design 2 - Old English Sheepdog: large sturdy heavy-set 35 kg breed, entire head and both ears must be pure solid white with no gray markings, white fluffy chest and white front legs, dark charcoal-gray fur starting strictly from the shoulders and covering the back and hindquarters, very cute big round gentle puppy eyes with heterochromia: one soft brown eye and one soft blue eye, sparkling kind expression, rounded fluffy muzzle, large soft body, thick shaggy fur texture, entirely solid dark charcoal-gray tail that is very short and stubby, absolutely no white color at the tail tip, gentle loyal protector personality.",
  },
  {
    id: "yeolmu",
    ko: "열무",
    short: "Papillon dog",
    en:
      "Character design 3 - Papillon dog: small dainty 5 kg toy breed, brown-and-white fur pattern, very large butterfly-shaped ears with long brown ear fur and soft feathered edges, warm brown round expressive eyes, white blaze running down the center of the face, white muzzle, white chest and belly, brown patches on the face and body, fluffy curled tail with white and brown fur, elegant tiny body, gentle cheerful expression, cute refined cartoon style.",
  },
  {
    id: "baechu",
    ko: "배추",
    short: "American Cocker Spaniel",
    en:
      "Character design 4 - American Cocker Spaniel: medium-sized 15 kg dog, golden beige and cream silky wavy fur, long floppy ears with thick flowing wavy curls, large warm gentle brown eyes, small rounded brown-black nose, sweet innocent smiling expression, fluffy cream chest fur, rounded forehead, soft golden-tan coloring throughout the body, short soft tail, plush cute cartoon proportions, warm friendly personality.",
  },
  {
    id: "kkami",
    ko: "까미",
    short: "gray tuxedo cat",
    en:
      "Character design 5 - gray tuxedo cat: dark charcoal-gray body with white chest and white belly, round face with a dark charcoal-gray mask pattern over the head and around the eyes, white muzzle area, distinctive thick black mustache marking above the mouth, sharp yellow-amber half-lidded eyes with an intense tsundere gaze, small pink heart-shaped nose, pink inner ears, pink heart-shaped paw pads, compact muscular body, long dark-gray tail, grumpy exterior but secretly caring personality, bold clean cartoon line style.",
  },
];

const CHARACTER_CONSISTENCY_CONTROL =
  "Use the selected character designs exactly as written. Do not mix fur patterns, eye colors, ear shapes, tails, species, body sizes, or personalities between characters. Do not replace these characters with vegetables, food, objects, or humans. Maintain perfect visual consistency for each selected character across every image or panel.";

function ImageTab() {
  const { D, Section, Sidebar, ChipPicker, PromptOutput, labelToEn } = window;

  const [selectedCharacters, setSelectedCharacters] = useStateI([]);
  const [subject, setSubject] = useStateI("");
  const [desc, setDesc] = useStateI("");
  const [lighting, setLighting] = useStateI([]);
  const [camera, setCamera] = useStateI([]);
  const [depthOfField, setDepthOfField] = useStateI("");
  const [aspectRatio, setAspectRatio] = useStateI(["1:1"]);
  const [artStyleId, setArtStyleId] = useStateI("watercolor");

  const selectedArtStyle = ART_STYLE_OPTIONS.find((style) => style.id === artStyleId);
  const selectedCharacterDetails = ODUNGI_CHARACTER_OPTIONS.filter((character) =>
    selectedCharacters.includes(character.id)
  );

  const toggleCharacter = (id) => {
    setSelectedCharacters((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };

  const reset = () => {
    if (!confirm("모든 선택을 초기화할까요?")) return;
    setSelectedCharacters([]);
    setSubject("");
    setDesc("");
    setLighting([]);
    setCamera([]);
    setDepthOfField("");
    setAspectRatio(["1:1"]);
    setArtStyleId("watercolor");
  };

  const prompt = useMemoI(() => {
    const lines = [];
    lines.push("=== ODUNGI HARU — IMAGE PROMPT ===");
    lines.push("");

    if (selectedCharacterDetails.length > 0) {
      lines.push("[CHARACTERS - PERFECT CONSISTENCY]");
      lines.push(CHARACTER_CONSISTENCY_CONTROL);
      selectedCharacterDetails.forEach((character) => {
        lines.push(character.en);
      });
      lines.push("");
    }
    
    if (subject) lines.push(`[SUBJECT]\n${subject}\n`);
    if (desc) lines.push(`[DESCRIPTION]\n${desc}\n`);
    
    if (lighting.length > 0) {
      const enLighting = lighting.map(ko => labelToEn(D.LIGHTING, ko));
      lines.push(`[LIGHTING]\n${enLighting.join(", ")}\n`);
    }
    
    if (camera.length > 0) {
      const enCamera = camera.map(ko => labelToEn(D.CAMERA, ko));
      lines.push(`[CAMERA]\n${enCamera.join(", ")}\n`);
    }

    if (depthOfField) {
      lines.push(`[DEPTH OF FIELD]\n${depthOfField}\n`);
    }

    if (selectedArtStyle) {
      lines.push("[ART STYLE]");
      lines.push(ART_STYLE_CONTROL);
      lines.push(selectedArtStyle.en);
    }

    if (aspectRatio.length > 0) {
      const enAr = labelToEn(ASPECT_RATIOS, aspectRatio[0]);
      lines.push(`\n${enAr}`);
    }

    return lines.join("\n");
  }, [selectedCharacterDetails, subject, desc, lighting, camera, depthOfField, selectedArtStyle, aspectRatio]);

  const navItems = [
    { id: "i-input", title: "프롬프트 설정" },
    { id: "i-final", title: "최종 확정" },
  ];

  const [active, setActive] = useStateI("i-input");
  const jump = (id) => {
    setActive(id);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="layout">
      <Sidebar items={navItems} active={active} onJump={jump} />
      <div className="content">
        <div className="tab-header">
          <div className="tab-header-row">
            <h1 className="title-two-line">
              <span>🎨 그림 생성</span>
              <span>프롬프트</span>
            </h1>
            <button className="btn-reset-top" onClick={reset} title="모든 선택을 초기화합니다">🔄 초기화</button>
          </div>
          <p>선택한 아트 스타일을 반영한 그림 생성 프롬프트를 만듭니다.</p>
        </div>

        <Section id="i-input" title="1. 프롬프트 설정" hint="오둥이, 주제, 묘사, 빛, 카메라, 심도, 비율을 설정하세요.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div className="field-label-row">
                <div className="field-label">오둥이 선택 (Characters)</div>
                <div className="field-count">{selectedCharacters.length}명 선택</div>
              </div>
              <div className="odungi-character-grid">
                {ODUNGI_CHARACTER_OPTIONS.map((character) => {
                  const on = selectedCharacters.includes(character.id);
                  return (
                    <button
                      key={character.id}
                      type="button"
                      className={"odungi-character-button" + (on ? " on" : "")}
                      onClick={() => toggleCharacter(character.id)}
                      title={character.en}
                    >
                      <span className="odungi-character-name">{character.ko}</span>
                      <span className="odungi-character-kind">{character.short}</span>
                      {on && <span className="odungi-character-check">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--ink-2)' }}>주제 (Subject)</div>
              <input 
                type="text" 
                className="input" 
                placeholder="예: 강아지 배추가 뛰어노는 들판"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{ width: '100%', padding: "10px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--bg)", color: "var(--ink-1)" }}
              />
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--ink-2)' }}>구체적 묘사 (Description)</div>
              <textarea 
                className="input" 
                placeholder="예: 맑은 날씨에 꼬리를 흔들며 활기차게 달리는 모습..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: "10px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--bg)", color: "var(--ink-1)", resize: "vertical" }}
              />
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--ink-2)' }}>빛 (Lighting)</div>
              <ChipPicker
                list={D.LIGHTING}
                value={lighting}
                onChange={setLighting}
                multi={true}
                searchable={true}
                initialCount={15}
              />
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--ink-2)' }}>카메라 (Camera)</div>
              <ChipPicker
                list={D.CAMERA}
                value={camera}
                onChange={setCamera}
                multi={true}
                searchable={false}
                initialCount={20}
              />
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--ink-2)' }}>심도 (Depth of Field)</div>
              <input 
                type="text" 
                className="input" 
                placeholder="예: 아웃포커스 (Out of focus), 팬포커스 (Deep focus)"
                value={depthOfField}
                onChange={(e) => setDepthOfField(e.target.value)}
                style={{ width: '100%', padding: "10px", borderRadius: "6px", border: "1px solid var(--line)", background: "var(--bg)", color: "var(--ink-1)" }}
              />
            </div>
            
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--ink-2)' }}>비율 (Aspect Ratio)</div>
              <ChipPicker
                list={ASPECT_RATIOS}
                value={aspectRatio}
                onChange={(val) => {
                  // 단일 선택만 허용하도록 (가장 나중에 선택된 것만)
                  if (val.length > 0) {
                    setAspectRatio([val[val.length - 1]]);
                  } else {
                    setAspectRatio([]);
                  }
                }}
                multi={true} // ChipPicker doesn't handle single selection natively the way we want without modifying it, but we force it in onChange
                searchable={false}
                initialCount={10}
              />
            </div>

          </div>
        </Section>

        <Section id="i-final" title="2. 최종 확정 / 영어 프롬프트 복사">
          <div className="art-style-panel">
            <div className="art-style-head">
              <div>
                <div className="art-style-title">ART STYLE 선택</div>
                <div className="art-style-sub">선택한 스타일만 아래 영어 프롬프트에 반영됩니다.</div>
              </div>
              <div className="art-style-status">
                {selectedArtStyle ? selectedArtStyle.ko : "스타일 미적용"}
              </div>
            </div>
            <div className="art-style-grid">
              {ART_STYLE_OPTIONS.map((style) => {
                const on = artStyleId === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    className={"art-style-card" + (on ? " on" : "")}
                    onClick={() => setArtStyleId(on ? "" : style.id)}
                    title={style.en}
                  >
                    <span className="art-style-name">{style.ko}</span>
                    <span className="art-style-preview">{style.en}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <PromptOutput text={prompt} filename="image-prompt.txt" />
        </Section>
      </div>
    </div>
  );
}

Object.assign(window, { ImageTab, ART_STYLE_OPTIONS, ODUNGI_CHARACTER_OPTIONS });
