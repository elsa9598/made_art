// 그림 생성 탭
const { useState: useStateI, useMemo: useMemoI } = React;

function ImageTab() {
  const [showToast, toastNode] = useToast();

  // 상태
  const [chars, setChars] = useStateI(["배추", "상추"]);
  const [anth, setAnth] = useStateI(true);

  const [tods, setTods] = useStateI([]);
  const [todsCustom, setTodsCustom] = useStateI([]);

  const [weather, setWeather] = useStateI([]);
  const [weatherCustom, setWeatherCustom] = useStateI([]);

  const [scene, setScene] = useStateI([]);
  const [sceneCustom, setSceneCustom] = useStateI([]);

  const [camera, setCamera] = useStateI(["미디엄뷰"]);
  const [cameraCustom, setCameraCustom] = useStateI([]);

  const [focus, setFocus] = useStateI([]); // chars 키들
  const [unfocus, setUnfocus] = useStateI([]);
  const [focusScene, setFocusScene] = useStateI([]); // 배경 항목들
  const [unfocusScene, setUnfocusScene] = useStateI([]);

  const [lighting, setLighting] = useStateI([]);
  const [lightingCustom, setLightingCustom] = useStateI([]);

  const [style, setStyle] = useStateI([]);
  const [styleCustom, setStyleCustom] = useStateI([]);

  const [tech, setTech] = useStateI([]);
  const [techCustom, setTechCustom] = useStateI([]);

  const [ratio, setRatio] = useStateI(["1:1"]);

  // 사이드바 진행도 계산
  const filled = [
    chars.length > 0,
    tods.length > 0,
    weather.length > 0,
    scene.length > 0,
    camera.length > 0,
    lighting.length > 0,
    style.length > 0,
    tech.length > 0,
    ratio.length > 0,
  ].filter(Boolean).length;

  const navItems = [
    { id: "i-char", title: "캐릭터", count: chars.length || null },
    { id: "i-tod", title: "시간대", count: tods.length || null },
    { id: "i-weather", title: "날씨", count: weather.length || null },
    { id: "i-scene", title: "배경", count: scene.length || null },
    { id: "i-camera", title: "카메라", count: camera.length || null },
    { id: "i-focus", title: "포커싱", count: (focus.length + focusScene.length) || null },
    { id: "i-light", title: "광원", count: lighting.length || null },
    { id: "i-style", title: "화풍", count: style.length || null },
    { id: "i-tech", title: "기법", count: tech.length || null },
    { id: "i-ratio", title: "비율", count: ratio.length || null },
    { id: "i-final", title: "최종 확정", count: null },
  ];

  const [active, setActive] = useStateI("i-char");
  const jump = (id) => {
    setActive(id);
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // 영문 프롬프트 빌드
  const prompt = useMemoI(() => {
    const lines = [];
    lines.push("=== ODUNGI HARU — IMAGE PROMPT ===");
    lines.push("");

    // Characters
    const block = buildCharacterBlock(chars, { anthropomorphic: anth });
    if (block.imageRefs) {
      lines.push("[CHARACTERS]");
      lines.push("Reference images attached: " + block.imageRefs);
      lines.push("Character descriptions for consistency:");
      lines.push(block.descriptions);
      lines.push(
        "Maintain identical appearance and proportions across all images. Match each attached reference photo to its labeled character above."
      );
      if (anth && chars.some((k) => D.ANIMAL_KEYS.includes(k))) {
        lines.push(
          "Animal characters (Baechu, Sangchu, Yeolmu, Ggami, Gimchi) are anthropomorphized — standing upright on two legs, posed and acting like humans in this scene."
        );
      }
      lines.push("");
    }

    // Focusing — characters + scene elements
    const focusParts = [];
    if (focus.length) {
      focusParts.push(
        ...focus.map((k) => D.CHARACTER_PRESETS[k]?.name_en || k)
      );
    }
    if (focusScene.length) {
      focusParts.push(...focusScene.map((k) => labelToEn(D.SCENE, k)));
    }
    if (focusParts.length) {
      lines.push(`[FOCUS] Sharp, crisp focus on: ${focusParts.join(", ")}.`);
    }
    const unfocusParts = [];
    if (unfocus.length) {
      unfocusParts.push(
        ...unfocus.map((k) => D.CHARACTER_PRESETS[k]?.name_en || k)
      );
    }
    if (unfocusScene.length) {
      unfocusParts.push(...unfocusScene.map((k) => labelToEn(D.SCENE, k)));
    }
    if (unfocusParts.length) {
      lines.push(
        `[OUT OF FOCUS] Soft bokeh / out-of-focus blur on: ${unfocusParts.join(", ")}.`
      );
    }
    if (focusParts.length || unfocusParts.length) lines.push("");

    // Scene
    if (scene.length) {
      const en = uniq([
        ...scene.map((k) => labelToEn(D.SCENE, k)),
      ]);
      lines.push("[SCENE] " + en.join("; "));
    }

    // Time of day
    if (tods.length) {
      const en = uniq(tods.map((k) => labelToEn(D.TIME_OF_DAY, k)));
      lines.push("[TIME OF DAY] " + en.join(", "));
    }

    // Weather
    if (weather.length) {
      const en = uniq(weather.map((k) => labelToEn(D.WEATHER, k)));
      lines.push("[WEATHER] " + en.join(", "));
    }

    // Lighting
    if (lighting.length) {
      const en = uniq(lighting.map((k) => labelToEn(D.LIGHTING, k)));
      lines.push("[LIGHTING] " + en.join(", "));
    }

    // Camera
    if (camera.length) {
      const en = uniq(camera.map((k) => labelToEn(D.CAMERA, k)));
      lines.push("[CAMERA] " + en.join(", "));
    }
    lines.push("");

    // Style
    if (style.length) {
      const en = uniq(style.map((k) => labelToEn(D.STYLE, k)));
      lines.push("[STYLE] " + en.join(", "));
    }
    if (tech.length) {
      const en = uniq(tech.map((k) => labelToEn(D.TECHNIQUE, k)));
      lines.push("[TECHNIQUE] " + en.join(", "));
    }
    if (ratio.length) {
      const en = labelToEn(D.RATIO, ratio[0]);
      lines.push(`[ASPECT RATIO] ${en} (${ratio[0]})`);
    }

    lines.push("");
    lines.push(
      "Render a single cohesive, high-end illustration combining all elements above. Keep character appearances consistent with the attached reference images."
    );

    return lines.join("\n");
  }, [
    chars,
    anth,
    tods,
    weather,
    scene,
    camera,
    focus,
    unfocus,
    focusScene,
    unfocusScene,
    lighting,
    style,
    tech,
    ratio,
  ]);

  const reset = () => {
    if (!confirm("선택한 항목을 모두 초기화할까요?")) return;
    setChars([]);
    setTods([]);
    setTodsCustom([]);
    setWeather([]);
    setWeatherCustom([]);
    setScene([]);
    setSceneCustom([]);
    setCamera([]);
    setCameraCustom([]);
    setFocus([]);
    setUnfocus([]);
    setFocusScene([]);
    setUnfocusScene([]);
    setLighting([]);
    setLightingCustom([]);
    setStyle([]);
    setStyleCustom([]);
    setTech([]);
    setTechCustom([]);
    setRatio(["1:1"]);
  };

  return (
    <div className="layout">
      <Sidebar items={navItems} active={active} onJump={jump} />
      <div className="content">
        <div className="tab-header">
          <h1>🎨 그림 생성 프롬프트</h1>
          <p>
            각 항목을 골라 영어 프롬프트를 만든 뒤,{" "}
            <b>이미지 생성 AI 채팅창</b>에 첨부 이미지와 함께 붙여넣으세요. 캐릭터마다{" "}
            <code>Image1: 캐릭터명</code> 식으로 일관성 라벨이 자동 포함됩니다.
          </p>
          <div className="progress">
            진행도 <b>{filled}</b> / 9
          </div>
        </div>

        <Section id="i-char" title="캐릭터" hint="복수 선택 가능 · 첨부 이미지와 라벨 매핑됩니다" badge={chars.length}>
          <CharacterPicker value={chars} onChange={setChars} multi />
          <label className="toggle-row">
            <input
              type="checkbox"
              checked={anth}
              onChange={(e) => setAnth(e.target.checked)}
            />
            <span>
              동물 캐릭터(배추·상추·열무·까미·김치)는 <b>의인화</b>하여 두 다리로 서서 연출
            </span>
          </label>
        </Section>

        <Section id="i-tod" title="시간대" hint={`${D.TIME_OF_DAY.length}개 + 직접 입력`} badge={tods.length}>
          <ChipPicker
            list={D.TIME_OF_DAY}
            value={tods}
            onChange={setTods}
            customs={todsCustom}
            onAddCustom={(v) => setTodsCustom(uniq([...todsCustom, v]))}
          />
        </Section>

        <Section id="i-weather" title="날씨" hint={`${D.WEATHER.length}개 + 직접 입력`} badge={weather.length}>
          <ChipPicker
            list={D.WEATHER}
            value={weather}
            onChange={setWeather}
            customs={weatherCustom}
            onAddCustom={(v) => setWeatherCustom(uniq([...weatherCustom, v]))}
          />
        </Section>

        <Section id="i-scene" title="배경" hint={`${D.SCENE.length}개 + 직접 입력 · 도시/자연/실내 다양`} badge={scene.length}>
          <ChipPicker
            list={D.SCENE}
            value={scene}
            onChange={setScene}
            customs={sceneCustom}
            onAddCustom={(v) => setSceneCustom(uniq([...sceneCustom, v]))}
            initialCount={48}
          />
        </Section>

        <Section id="i-camera" title="카메라 (복수 선택)" hint="복수 선택 가능" badge={camera.length}>
          <ChipPicker
            list={D.CAMERA}
            value={camera}
            onChange={setCamera}
            customs={cameraCustom}
            onAddCustom={(v) => setCameraCustom(uniq([...cameraCustom, v]))}
            collapsible={false}
          />
        </Section>

        <Section id="i-focus" title="포커싱 / 아웃포커싱" hint="선택한 캐릭터와 배경 중에서 다중 선택">
          {chars.length === 0 && scene.length === 0 ? (
            <div className="empty">먼저 캐릭터 또는 배경을 선택해주세요.</div>
          ) : (
            <div className="dual-col">
              <div className="focus-col">
                <div className="sub-label">🎯 포커싱 (선명)</div>
                {chars.length > 0 && (
                  <>
                    <div className="sub-mini">캐릭터</div>
                    <div className="chip-row">
                      {chars.map((k) => {
                        const c = D.CHARACTER_PRESETS[k];
                        const on = focus.includes(k);
                        return (
                          <button
                            key={"f-" + k}
                            className={"chip" + (on ? " on" : "")}
                            onClick={() =>
                              setFocus(
                                on ? focus.filter((x) => x !== k) : [...focus, k]
                              )
                            }
                          >
                            {c.emoji} {k}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
                {scene.length > 0 && (
                  <>
                    <div className="sub-mini">배경</div>
                    <div className="chip-row">
                      {scene.map((s) => {
                        const on = focusScene.includes(s);
                        return (
                          <button
                            key={"fs-" + s}
                            className={"chip" + (on ? " on" : "")}
                            onClick={() =>
                              setFocusScene(
                                on
                                  ? focusScene.filter((x) => x !== s)
                                  : [...focusScene, s]
                              )
                            }
                          >
                            🏞 {s}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
              <div className="focus-col">
                <div className="sub-label">🌫 아웃포커싱 (흐림)</div>
                {chars.length > 0 && (
                  <>
                    <div className="sub-mini">캐릭터</div>
                    <div className="chip-row">
                      {chars.map((k) => {
                        const c = D.CHARACTER_PRESETS[k];
                        const on = unfocus.includes(k);
                        return (
                          <button
                            key={"u-" + k}
                            className={"chip" + (on ? " on" : "")}
                            onClick={() =>
                              setUnfocus(
                                on
                                  ? unfocus.filter((x) => x !== k)
                                  : [...unfocus, k]
                              )
                            }
                          >
                            {c.emoji} {k}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
                {scene.length > 0 && (
                  <>
                    <div className="sub-mini">배경</div>
                    <div className="chip-row">
                      {scene.map((s) => {
                        const on = unfocusScene.includes(s);
                        return (
                          <button
                            key={"us-" + s}
                            className={"chip" + (on ? " on" : "")}
                            onClick={() =>
                              setUnfocusScene(
                                on
                                  ? unfocusScene.filter((x) => x !== s)
                                  : [...unfocusScene, s]
                              )
                            }
                          >
                            🏞 {s}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </Section>

        <Section id="i-light" title="광원" hint="복수 선택 가능" badge={lighting.length}>
          <ChipPicker
            list={D.LIGHTING}
            value={lighting}
            onChange={setLighting}
            customs={lightingCustom}
            onAddCustom={(v) => setLightingCustom(uniq([...lightingCustom, v]))}
          />
        </Section>

        <Section id="i-style" title="화풍" hint="복수 선택 가능" badge={style.length}>
          <ChipPicker
            list={D.STYLE}
            value={style}
            onChange={setStyle}
            customs={styleCustom}
            onAddCustom={(v) => setStyleCustom(uniq([...styleCustom, v]))}
          />
        </Section>

        <Section id="i-tech" title="기법" hint="복수 선택 가능" badge={tech.length}>
          <ChipPicker
            list={D.TECHNIQUE}
            value={tech}
            onChange={setTech}
            customs={techCustom}
            onAddCustom={(v) => setTechCustom(uniq([...techCustom, v]))}
          />
        </Section>

        <Section id="i-ratio" title="비율 (단일)" hint="결과 이미지 가로세로 비율">
          <ChipPicker
            list={D.RATIO}
            value={ratio}
            onChange={setRatio}
            multi={false}
            searchable={false}
            collapsible={false}
          />
        </Section>

        <Section id="i-final" title="최종 확정 / 수정" hint="수정하려면 위 섹션을 클릭해 다시 고르세요">
          <div className="final-row">
            <button className="btn-ghost" onClick={reset}>
              전체 초기화
            </button>
            <div className="final-summary">
              캐릭터 {chars.length} · 시간대 {tods.length} · 날씨 {weather.length} · 배경 {scene.length} · 카메라 {camera.length} · 광원 {lighting.length} · 화풍 {style.length} · 기법 {tech.length} · 비율 {ratio[0] || "—"}
            </div>
          </div>
          <PromptOutput text={prompt} filename="odungi-image-prompt.txt" />
        </Section>
      </div>
      {toastNode}
    </div>
  );
}

Object.assign(window, { ImageTab });
