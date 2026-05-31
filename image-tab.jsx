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

function ImageTab() {
  const { D, Section, Sidebar, ChipPicker, PromptOutput, labelToEn } = window;

  const [subject, setSubject] = useStateI("");
  const [desc, setDesc] = useStateI("");
  const [lighting, setLighting] = useStateI([]);
  const [camera, setCamera] = useStateI([]);
  const [depthOfField, setDepthOfField] = useStateI("");
  const [aspectRatio, setAspectRatio] = useStateI(["1:1"]);

  const reset = () => {
    if (!confirm("모든 선택을 초기화할까요?")) return;
    setSubject("");
    setDesc("");
    setLighting([]);
    setCamera([]);
    setDepthOfField("");
    setAspectRatio(["1:1"]);
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

    lines.push("[ART STYLE]");
    lines.push("wet-on-wet watercolor where color edges bleed naturally, pigment spreading on pre-wetted paper, color-mass expression rather than fine detail, bleeds and bokeh used together, semi-abstract treatment that melts away some outlines, light reflections treated like watercolor stains, emphasized paper grain, transparent color layers glazed multiple times, very limited focal area, out-of-focus subjects melted into color masses without holding their form, light bleeding into circular bokeh, distant backgrounds with detail removed, expressed like boundary-dissolved watercolor blots.");

    if (aspectRatio.length > 0) {
      const enAr = labelToEn(ASPECT_RATIOS, aspectRatio[0]);
      lines.push(`\n${enAr}`);
    }

    return lines.join("\n");
  }, [subject, desc, lighting, camera, depthOfField, aspectRatio]);

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
          <p>수채화 아트 스타일이 기본으로 탑재된 그림 생성 프롬프트를 만듭니다.</p>
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
          <PromptOutput text={prompt} filename="image-prompt.txt" />
        </Section>
      </div>
    </div>
  );
}

Object.assign(window, { ImageTab });
