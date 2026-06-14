// 그림그리기 — 메인 앱
// 그림/음악/4컷카툰 프롬프트 빌더 (3 탭)

const { useState, useMemo, useEffect, useRef } = React;
const D = window.ODUNGI_DATA;

// ─────────────────────────────────────────────────────────
// 공용 헬퍼
function joinEnglish(parts) {
  return parts.filter(Boolean).join(", ");
}

function labelToEn(list, ko) {
  const found = list.find((x) => x.ko === ko);
  return found ? found.en : ko; // 직접 입력은 그대로
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

// 토스트
function useToast() {
  const [msg, setMsg] = useState(null);
  const t = useRef(null);
  const show = (m) => {
    setMsg(m);
    clearTimeout(t.current);
    t.current = setTimeout(() => setMsg(null), 1800);
  };
  const node = msg ? (
    <div className="toast">{msg}</div>
  ) : null;
  return [show, node];
}

// ─────────────────────────────────────────────────────────
// 캐릭터 카드 선택
function CharacterPicker({ value, onChange, multi = true, label = "캐릭터" }) {
  const toggle = (k) => {
    if (multi) {
      onChange(value.includes(k) ? value.filter((x) => x !== k) : [...value, k]);
    } else {
      onChange([k]);
    }
  };
  return (
    <div className="char-grid">
      {Object.entries(D.CHARACTER_PRESETS).map(([key, c]) => {
        const on = value.includes(key);
        return (
          <button
            key={key}
            type="button"
            className={"char-card" + (on ? " on" : "")}
            onClick={() => toggle(key)}
          >
            <div className="char-emoji">{c.emoji}</div>
            <div className="char-name">{key}</div>
            <div className="char-kind">{c.kind}</div>
            <div className="char-en">{c.name_en}</div>
            {on && <div className="char-check">✓</div>}
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 칩 다중/단일 선택 + 검색 + 커스텀 입력
function ChipPicker({
  list,
  value,
  onChange,
  multi = true,
  searchable = true,
  customs = [],
  onAddCustom = null,
  collapsible = true,
  initialCount = 32,
  aiButton = null,
}) {
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState(!collapsible);

  const filtered = useMemo(() => {
    if (!q.trim()) return list;
    const lower = q.toLowerCase();
    return list.filter(
      (x) =>
        x.ko.toLowerCase().includes(lower) ||
        x.en.toLowerCase().includes(lower)
    );
  }, [list, q]);

  const visible = expanded ? filtered : filtered.slice(0, initialCount);

  const toggle = (ko) => {
    if (multi) {
      onChange(value.includes(ko) ? value.filter((x) => x !== ko) : [...value, ko]);
    } else {
      onChange([ko]);
    }
  };

  const [draft, setDraft] = useState("");
  const submitCustom = () => {
    const v = draft.trim();
    if (!v) return;
    if (onAddCustom) onAddCustom(v);
    onChange(uniq([...value, v]));
    setDraft("");
  };

  return (
    <div className="chip-picker">
      {searchable && (
        <div className="chip-search">
          <input
            type="text"
            placeholder={`검색 (${list.length}개)`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {q && (
            <button className="x" onClick={() => setQ("")}>
              ×
            </button>
          )}
        </div>
      )}
      <div className="chip-row">
        {visible.map((x) => {
          const on = value.includes(x.ko);
          return (
            <button
              key={x.ko}
              type="button"
              className={"chip" + (on ? " on" : "")}
              onClick={() => toggle(x.ko)}
              title={x.en}
            >
              {x.ko}
            </button>
          );
        })}
        {customs.map((c) => {
          const on = value.includes(c);
          return (
            <button
              key={"c-" + c}
              type="button"
              className={"chip custom" + (on ? " on" : "")}
              onClick={() => toggle(c)}
            >
              ✎ {c}
            </button>
          );
        })}
        {!expanded && filtered.length > initialCount && (
          <button className="chip more" onClick={() => setExpanded(true)}>
            +{filtered.length - initialCount}개 더 보기
          </button>
        )}
        {expanded && collapsible && filtered.length > initialCount && (
          <button className="chip more" onClick={() => setExpanded(false)}>
            접기
          </button>
        )}
      </div>
      <div className="chip-custom">
        {aiButton && aiButton(setDraft)}
        <input
          type="text"
          placeholder="직접 입력 후 Enter (선택지에 추가)"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submitCustom();
            }
          }}
        />
        <button onClick={submitCustom} className="btn-add">
          추가
        </button>
      </div>
    </div>
  );
}

// 섹션 래퍼
function Section({ id, title, hint, badge, children }) {
  return (
    <section className="section" id={id}>
      <header>
        <h2>
          {title}
          {badge != null && <span className="badge">{badge}</span>}
        </h2>
        {hint && <p className="hint">{hint}</p>}
      </header>
      <div className="section-body">{children}</div>
    </section>
  );
}

// 사이드바 (앵커 네비)
function Sidebar({ items, active, onJump }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">🥬</div>
        <div className="brand-text">
          <div className="brand-title">그림그리기</div>
          <div className="brand-sub">프롬프트 빌더</div>
        </div>
      </div>
      <nav>
        {items.map((it) => (
          <button
            key={it.id}
            className={"nav-item" + (active === it.id ? " on" : "")}
            onClick={() => onJump(it.id)}
          >
            <span className="dot" />
            <span className="ko">{it.title}</span>
            {it.count != null && <span className="cnt">{it.count}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
}

// 캐릭터 영문 빌더 (이미지N: 캐릭터명 + 영문 묘사 + 의인화 옵션)
function buildCharacterBlock(charKeys, { anthropomorphic = true } = {}) {
  if (!charKeys.length) return { imageRefs: "", descriptions: "" };

  const imageRefs = charKeys
    .map((k, i) => {
      const c = D.CHARACTER_PRESETS[k];
      return `Image${i + 1}: ${k} (${c.name_en})`;
    })
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

// 결과 미리보기 + 복사
function PromptOutput({ text, filename = "prompt.txt" }) {
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      // fallback
      if (ref.current) {
        ref.current.select();
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    }
  };

  const download = () => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="output">
      <div className="output-head">
        <div className="output-title">최종 영어 프롬프트</div>
        <div className="output-actions">
          <button className="btn-ghost" onClick={download}>
            ⬇ txt 저장
          </button>
          <button className="btn-primary" onClick={copy}>
            {copied ? "✓ 복사됨" : "📋 복사하기"}
          </button>
        </div>
      </div>
      <textarea
        ref={ref}
        className="output-text"
        value={text}
        readOnly
        spellCheck="false"
      />
      <div className="output-foot">
        {text.length.toLocaleString()}자 · 복사 후 그림/음악 생성 AI 채팅창에 붙여넣기
      </div>
    </div>
  );
}

// 메인 탭 컨테이너
function App() {
  const [mainTab, setMainTab] = useState("image");
  const [tweak, setTweak] = useTweaks(
    /*EDITMODE-BEGIN*/ {
      theme: "cream",
      accent: "terracotta",
      density: "comfortable",
    } /*EDITMODE-END*/
  );

  // 테마 적용
  useEffect(() => {
    document.documentElement.dataset.theme = tweak.theme;
    document.documentElement.dataset.accent = tweak.accent;
    document.documentElement.dataset.density = tweak.density;
  }, [tweak]);

  return (
    <div className="app">
      <TopBar currentTab={mainTab} onTabChange={setMainTab} />
      <main className="main-wrap">
        {mainTab === "image" && <ImageTab />}
        {mainTab === "music" && <MusicTab />}
      </main>
      <TweaksUI tweak={tweak} setTweak={setTweak} />
    </div>
  );
}

function TopBar({ currentTab, onTabChange }) {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <span className="logo">🥬</span>
        <div>
          <div className="topbar-title">그림그리기</div>
          <div className="topbar-sub">우리집 식구들을 위한 프롬프트 빌더</div>
        </div>
      </div>
      <div className="topbar-nav" style={{ display: 'flex', gap: '8px', marginLeft: 'auto', marginRight: '16px' }}>
        <button 
          className={`btn-ghost ${currentTab === 'image' ? 'on' : ''}`} 
          onClick={() => onTabChange('image')}
          style={currentTab === 'image' ? { background: 'var(--surface-3)', color: 'var(--ink-1)', fontWeight: 'bold' } : {}}
        >
          🎨 그림
        </button>
        <button 
          className={`btn-ghost ${currentTab === 'music' ? 'on' : ''}`} 
          onClick={() => onTabChange('music')}
          style={currentTab === 'music' ? { background: 'var(--surface-3)', color: 'var(--ink-1)', fontWeight: 'bold' } : {}}
        >
          🎵 음악
        </button>
      </div>
    </header>
  );
}

// Tweaks 패널 — 항상 보이지 않고 toolbar 토글로 노출됨
function TweaksUI({ tweak, setTweak }) {
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="테마">
        <TweakRadio
          label="배경"
          value={tweak.theme}
          options={[
            { label: "크림", value: "cream" },
            { label: "차콜", value: "dark" },
          ]}
          onChange={(v) => setTweak("theme", v)}
        />
        <TweakRadio
          label="밀도"
          value={tweak.density}
          options={[
            { label: "여유", value: "comfortable" },
            { label: "촘촘", value: "compact" },
          ]}
          onChange={(v) => setTweak("density", v)}
        />
      </TweakSection>
      <TweakSection label="강조 색상">
        <div className="palette-row">
          {[
            { id: "terracotta", color: "#c97056", label: "테라코타" },
            { id: "olive", color: "#7a8048", label: "올리브" },
            { id: "mustard", color: "#c89c3b", label: "머스타드" },
            { id: "sage", color: "#8aa496", label: "세이지" },
            { id: "dusty-blue", color: "#7b96b3", label: "더스티 블루" },
            { id: "plum", color: "#8a5670", label: "플럼" },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              className={"swatch" + (tweak.accent === p.id ? " on" : "")}
              onClick={() => setTweak("accent", p.id)}
              title={p.label}
            >
              <span className="dot" style={{ background: p.color }} />
              <span className="lbl">{p.label}</span>
            </button>
          ))}
        </div>
      </TweakSection>
    </TweaksPanel>
  );
}

// 전역 노출 (별도 파일에서 사용)
Object.assign(window, {
  App,
  Section,
  Sidebar,
  CharacterPicker,
  ChipPicker,
  PromptOutput,
  buildCharacterBlock,
  joinEnglish,
  labelToEn,
  uniq,
  useToast,
  D,
});
