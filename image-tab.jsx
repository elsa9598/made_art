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

function ImageTab() {
  const { D, Section, Sidebar, ChipPicker, PromptOutput, labelToEn } = window;

  const [subject, setSubject] = useStateI("");
  const [desc, setDesc] = useStateI("");
  const [lighting, setLighting] = useStateI([]);
  const [camera, setCamera] = useStateI([]);
  const [depthOfField, setDepthOfField] = useStateI("");
  const [aspectRatio, setAspectRatio] = useStateI(["1:1"]);
  const [artStyleId, setArtStyleId] = useStateI("watercolor");

  const selectedArtStyle = ART_STYLE_OPTIONS.find((style) => style.id === artStyleId);

  const reset = () => {
    if (!confirm("모든 선택을 초기화할까요?")) return;
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
  }, [subject, desc, lighting, camera, depthOfField, selectedArtStyle, aspectRatio]);

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
            <h1>🎨 그림 생성 프롬프트</h1>
            <button className="btn-reset-top" onClick={reset} title="모든 선택을 초기화합니다">🔄 초기화</button>
          </div>
          <p>선택한 아트 스타일을 반영한 그림 생성 프롬프트를 만듭니다.</p>
        </div>

        <Section id="i-input" title="1. 프롬프트 설정" hint="주제, 묘사, 빛, 카메라, 심도, 비율을 설정하세요.">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
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

Object.assign(window, { ImageTab, ART_STYLE_OPTIONS });
