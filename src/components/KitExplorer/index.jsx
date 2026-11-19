import React, {useEffect, useId, useMemo, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {
  COREBOARD_ID,
  COREBOARD_VARIANTS,
  FOCUS_PRESETS,
  IMAGE_SIZE,
  KIT_CATEGORIES,
  KIT_IMAGE_SRC,
  KIT_ITEMS,
  KIT_ITEMS_BY_ID,
  M9_VARIANTS,
  getFirmwareDownloadForKey,
} from './kitData';
import styles from './styles.module.css';

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function estimateLabelWidth(text) {
  let units = 0;
  for (const ch of text) {
    units += ch.charCodeAt(0) > 127 ? 1.85 : 1.05;
  }
  return Math.max(176, Math.round(units * 14.8 + 44));
}

function renderItemRect(item, props = {}) {
  const tx = item.rot ? `rotate(${item.rot} ${item.cx} ${item.cy})` : undefined;
  return (
    <rect
      x={item.cx - item.w / 2}
      y={item.cy - item.h / 2}
      width={item.w}
      height={item.h}
      rx={item.rx}
      ry={item.rx}
      transform={tx}
      {...props}
    />
  );
}

function LeaderCallout({
  anchorX,
  anchorY,
  elbowX,
  x,
  y,
  text,
  tone = 'active',
  shadowFilterId,
  onClick,
}) {
  const width = estimateLabelWidth(text);
  const height = 50;
  const cx = clamp(x, width / 2 + 14, IMAGE_SIZE - width / 2 - 14);
  const cy = clamp(y, height / 2 + 14, IMAGE_SIZE - height / 2 - 14);
  const elbow = typeof elbowX === 'number' ? elbowX : anchorX;

  const palette =
    {
      active: {
        fill: '#0284c7',
        stroke: '#ffffff',
        text: '#ffffff',
        line: '#0284c7',
      },
      core: {
        fill: '#dc2626',
        stroke: '#ffffff',
        text: '#ffffff',
        line: '#dc2626',
      },
      conflict: {
        fill: '#fff7ed',
        stroke: '#ea580c',
        text: '#c2410c',
        line: '#ea580c',
      },
      coexist: {
        fill: '#ecfdf5',
        stroke: '#059669',
        text: '#047857',
        line: '#059669',
      },
      optical: {
        fill: '#f0fdfa',
        stroke: '#0d9488',
        text: '#0f766e',
        line: '#0d9488',
      },
    }[tone] || {
      fill: '#0f172a',
      stroke: '#cbd5e1',
      text: '#ffffff',
      line: '#0f172a',
    };

  const hasLeader = typeof anchorX === 'number' && typeof anchorY === 'number';
  const pathD = hasLeader ? `M ${anchorX} ${anchorY} L ${elbow} ${cy} L ${cx} ${cy}` : '';

  return (
    <g onClick={onClick} style={onClick ? {cursor: 'pointer'} : undefined}>
      {hasLeader && (
        <g style={{pointerEvents: 'none'}}>
          <path
            d={pathD}
            fill="none"
            stroke="#ffffff"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeOpacity="0.86"
          />
          <path
            d={pathD}
            fill="none"
            stroke={palette.line}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx={anchorX}
            cy={anchorY}
            r="6"
            fill={palette.line}
            stroke="#ffffff"
            strokeWidth="2.5"
          />
        </g>
      )}
      <rect
        x={cx - width / 2}
        y={cy - height / 2}
        width={width}
        height={height}
        rx={13}
        fill={palette.fill}
        stroke={palette.stroke}
        strokeWidth="2.5"
        filter={shadowFilterId ? `url(#${shadowFilterId})` : undefined}
      />
      <text
        x={cx}
        y={cy + 0.5}
        fill={palette.text}
        fontSize="25"
        fontWeight="700"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif">
        {text}
      </text>
    </g>
  );
}

export default function KitExplorer({focus, mode, variant}) {
  const rawId = useId();
  const safeId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const maskId = `f407-kit-mask-${safeId}`;
  const glowFilterId = `f407-kit-glow-${safeId}`;
  const shadowFilterId = `f407-kit-shadow-${safeId}`;
  const kitImageUrl = useBaseUrl(KIT_IMAGE_SRC);

  const resolvedMode = mode || (focus ? 'lesson' : 'explorer');
  const isExplorer = resolvedMode === 'explorer';
  const initialFocusKey = focus || 'm1';

  const [selectedFocus, setSelectedFocus] = useState(initialFocusKey);
  const [m9Variant, setM9Variant] = useState(
    M9_VARIANTS[variant] ? variant : 'passive',
  );
  const [coreVariant, setCoreVariant] = useState(
    COREBOARD_VARIANTS[variant] ? variant : 'board',
  );
  const [category, setCategory] = useState('all');
  const [cameraMode, setCameraMode] = useState('overview');
  const [zoom, setZoom] = useState(1);
  const [panPct, setPanPct] = useState({x: 0, y: 0});
  const [isDragging, setIsDragging] = useState(false);
  const [conflictPulseKey, setConflictPulseKey] = useState(0);

  const viewportRef = useRef(null);
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    origPanX: 0,
    origPanY: 0,
  });

  useEffect(() => {
    setSelectedFocus(focus || 'm1');
  }, [focus]);

  const activePreset = FOCUS_PRESETS[selectedFocus] || null;
  const primaryId = activePreset
    ? activePreset.primary
    : KIT_ITEMS_BY_ID[selectedFocus]
      ? selectedFocus
      : 'm1';

  const primaryItem = KIT_ITEMS_BY_ID[primaryId] || KIT_ITEMS_BY_ID.m1;
  const activeIds = activePreset ? activePreset.actives : [primaryItem.id];

  const conflictIds = useMemo(() => {
    if (activePreset) {
      return activePreset.conflicts || [];
    }
    return primaryItem.conflicts || [];
  }, [activePreset, primaryItem]);

  const coexistIds = useMemo(() => {
    if (activePreset) {
      return activePreset.coexists || [];
    }
    return primaryItem.coexists || [];
  }, [activePreset, primaryItem]);

  const isCoreSelected = primaryItem.id === COREBOARD_ID;
  const isOledCoexist = Boolean(activePreset?.usesOled || primaryItem.usesOled);

  const computeFocusCamera = (preset, item) => {
    if (preset && preset.id === 'ir_tx_rx') {
      const targetZoom = 1.32;
      const targetX = 810;
      const targetY = 1040;
      const maxPan = (targetZoom - 1) * 50;
      const dxPct = ((targetX - 800) / IMAGE_SIZE) * 100;
      const dyPct = ((targetY - 800) / IMAGE_SIZE) * 100;
      return {
        zoom: targetZoom,
        pan: {
          x: clamp(-targetZoom * dxPct, -maxPan, maxPan),
          y: clamp(-targetZoom * dyPct, -maxPan, maxPan),
        },
      };
    }

    const targetZoom = item.id === COREBOARD_ID ? 1.48 : 1.68;
    const targetX = item.cx * 0.78 + item.labelX * 0.22;
    const targetY = item.cy * 0.78 + item.labelY * 0.22;
    const maxPan = (targetZoom - 1) * 50;
    const dxPct = ((targetX - 800) / IMAGE_SIZE) * 100;
    const dyPct = ((targetY - 800) / IMAGE_SIZE) * 100;
    return {
      zoom: targetZoom,
      pan: {
        x: clamp(-targetZoom * dxPct, -maxPan, maxPan),
        y: clamp(-targetZoom * dyPct, -maxPan, maxPan),
      },
    };
  };

  const applyOverview = () => {
    setCameraMode('overview');
    setZoom(1);
    setPanPct({x: 0, y: 0});
  };

  const applyFocusZoom = (preset = activePreset, item = primaryItem) => {
    const cam = computeFocusCamera(preset, item);
    setCameraMode('focus');
    setZoom(cam.zoom);
    setPanPct(cam.pan);
  };

  const selectTarget = (targetKey) => {
    if (!isExplorer) {
      return;
    }
    setSelectedFocus(targetKey);
    if (cameraMode === 'focus') {
      const nextPreset = FOCUS_PRESETS[targetKey] || null;
      const nextItem =
        KIT_ITEMS_BY_ID[nextPreset ? nextPreset.primary : targetKey] || primaryItem;
      const cam = computeFocusCamera(nextPreset, nextItem);
      setZoom(cam.zoom);
      setPanPct(cam.pan);
    }
  };

  const handleStepZoom = (delta) => {
    setZoom((prev) => {
      const next = clamp(Number((prev + delta).toFixed(2)), 1, 2.5);
      if (next <= 1.01) {
        setCameraMode('overview');
        setPanPct({x: 0, y: 0});
        return 1;
      }
      setCameraMode('focus');
      const maxPan = (next - 1) * 50;
      setPanPct((p) => ({
        x: clamp(p.x, -maxPan, maxPan),
        y: clamp(p.y, -maxPan, maxPan),
      }));
      return next;
    });
  };

  const handlePointerDown = (e) => {
    if (zoom <= 1.01 || e.button !== 0) {
      return;
    }
    dragRef.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      origPanX: panPct.x,
      origPanY: panPct.y,
    };
    setIsDragging(true);
    if (e.currentTarget.setPointerCapture) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Ignore capture failure on synthetic pointers
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.active || !viewportRef.current) {
      return;
    }
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.hypot(dx, dy) > 4) {
      dragRef.current.moved = true;
    }
    const rect = viewportRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) {
      return;
    }
    const maxPan = (zoom - 1) * 50;
    const deltaXPct = (dx / rect.width) * 100;
    const deltaYPct = (dy / rect.height) * 100;
    setPanPct({
      x: clamp(dragRef.current.origPanX + deltaXPct, -maxPan, maxPan),
      y: clamp(dragRef.current.origPanY + deltaYPct, -maxPan, maxPan),
    });
  };

  const handlePointerEnd = () => {
    if (!dragRef.current.active) {
      return;
    }
    dragRef.current.active = false;
    setIsDragging(false);
  };

  const handleStageDoubleClick = () => {
    if (zoom > 1.05) {
      applyOverview();
    } else {
      applyFocusZoom();
    }
  };

  const handleSvgSelect = (id) => {
    if (dragRef.current.moved) {
      dragRef.current.moved = false;
      return;
    }
    selectTarget(id);
  };

  const handleLocateConflict = () => {
    applyOverview();
    setConflictPulseKey((k) => k + 1);
  };

  const activeVariantMeta =
    primaryItem.id === 'm9'
      ? M9_VARIANTS[m9Variant] || M9_VARIANTS.passive
      : primaryItem.id === COREBOARD_ID
        ? COREBOARD_VARIANTS[coreVariant] || COREBOARD_VARIANTS.board
        : null;

  const displayTitle = activePreset
    ? activePreset.title
    : `${primaryItem.code} · ${primaryItem.name}`;
  const displaySubtitle = activePreset
    ? activePreset.subtitle
    : activeVariantMeta
      ? activeVariantMeta.subtitle
      : primaryItem.subtitle;
  const displayBus = activeVariantMeta ? activeVariantMeta.bus : primaryItem.bus;
  const displayDriverFile = activeVariantMeta
    ? activeVariantMeta.driverFile
    : primaryItem.driverFile;
  const displayTestFunc = activeVariantMeta
    ? activeVariantMeta.testFunc
    : primaryItem.testFunc;
  const displayCubemxNote = activeVariantMeta
    ? activeVariantMeta.cubemxNote
    : primaryItem.cubemxNote;
  const displayLessonPath = activeVariantMeta
    ? activeVariantMeta.lessonPath
    : primaryItem.lessonPath;
  const displayLessonLabel = activeVariantMeta
    ? activeVariantMeta.lessonLabel
    : primaryItem.lessonLabel;
  const activeDemoKey = activeVariantMeta
    ? activeVariantMeta.demoKey
    : primaryItem.demoKey;
  const firmwareInfo = getFirmwareDownloadForKey(activeDemoKey);

  const filteredTrayItems = useMemo(() => {
    if (category === 'all') {
      return KIT_ITEMS;
    }
    return KIT_ITEMS.filter((item) => item.category === category);
  }, [category]);

  const conflictTargets = conflictIds
    .map((cid) => KIT_ITEMS_BY_ID[cid])
    .filter(Boolean);
  const coexistTargets = coexistIds
    .map((cid) => KIT_ITEMS_BY_ID[cid])
    .filter(Boolean);

  const showIrSwitch =
    isExplorer &&
    (primaryItem.id === 'm4' || primaryItem.id === 'm8' || activePreset?.id === 'ir_tx_rx');

  const viewportClassNames = [
    styles.stageViewport,
    zoom > 1.01 ? styles.stageViewportZoomed : '',
    isDragging ? styles.stageViewportDragging : '',
  ]
    .filter(Boolean)
    .join(' ');

  const cameraClassNames = [
    styles.stageCamera,
    isDragging ? styles.stageCameraDragging : '',
  ]
    .filter(Boolean)
    .join(' ');

  const zoomPercent = Math.round(zoom * 100);

  return (
    <section
      className={styles.explorerRoot}
      aria-label="DshanMCU-F407 实验套件底板接线图">
      <div className={styles.topBar}>
        <div className={styles.topBarTitleGroup}>
          <span className={styles.modeBadge}>实验套件总览</span>
          <span className={styles.topBarHeading}>
            点击图中模块插座（M1–M13 / DRV 电机 / J6–J8 舵机）或核心板，查看 STM32F407 引脚映射与共用冲突
          </span>
        </div>

        <div className={styles.cameraControls}>
          <button
            type="button"
            className={`${styles.camBtn} ${
              cameraMode === 'overview' && zoom <= 1.05 ? styles.camBtnActive : ''
            }`}
            onClick={applyOverview}>
            全板总览
          </button>
          <button
            type="button"
            className={`${styles.camBtn} ${
              cameraMode === 'focus' && zoom > 1.05 ? styles.camBtnActive : ''
            }`}
            onClick={() => applyFocusZoom()}>
            局部放大
          </button>
          <button
            type="button"
            className={styles.camBtn}
            onClick={() => handleStepZoom(-0.25)}
            aria-label="缩小">
            －
          </button>
          <span className={styles.zoomChip}>{zoomPercent}%</span>
          <button
            type="button"
            className={styles.camBtn}
            onClick={() => handleStepZoom(0.25)}
            aria-label="放大">
            ＋
          </button>
        </div>
      </div>

      <div className={styles.explorerLayout}>
        <div className={styles.stageColumn}>
          <div
            ref={viewportRef}
            className={viewportClassNames}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onDoubleClick={handleStageDoubleClick}>
            <div
              className={cameraClassNames}
              style={{
                transform: `translate(${panPct.x}%, ${panPct.y}%) scale(${zoom})`,
              }}>
              <img
                src={kitImageUrl}
                alt="DshanMCU-F407 核心板与 Base Board 实验底板俯视图"
                className={styles.photoImg}
                draggable={false}
              />

              <svg
                className={styles.overlaySvg}
                viewBox={`0 0 ${IMAGE_SIZE} ${IMAGE_SIZE}`}
                preserveAspectRatio="xMidYMid meet">
                <defs>
                  <filter
                    id={glowFilterId}
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  <filter
                    id={shadowFilterId}
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="160%">
                    <feDropShadow
                      dx="0"
                      dy="3"
                      stdDeviation="4"
                      floodColor="#0f172a"
                      floodOpacity="0.16"
                    />
                  </filter>

                  <mask id={maskId}>
                    <rect
                      x="0"
                      y="0"
                      width={IMAGE_SIZE}
                      height={IMAGE_SIZE}
                      fill="white"
                    />
                    {conflictTargets.map((item) =>
                      renderItemRect(item, {
                        key: `mask-conf-${item.id}`,
                        fill: '#555555',
                      }),
                    )}
                    {coexistTargets.map((item) =>
                      renderItemRect(item, {
                        key: `mask-coex-${item.id}`,
                        fill: '#555555',
                      }),
                    )}
                    {activeIds.map((aid) => {
                      const item = KIT_ITEMS_BY_ID[aid];
                      if (!item) {
                        return null;
                      }
                      return renderItemRect(item, {
                        key: `mask-act-${aid}`,
                        fill: 'black',
                      });
                    })}
                  </mask>
                </defs>

                <rect
                  x="0"
                  y="0"
                  width={IMAGE_SIZE}
                  height={IMAGE_SIZE}
                  fill="rgba(255, 255, 255, 0.56)"
                  mask={`url(#${maskId})`}
                  style={{pointerEvents: 'none'}}
                />

                {coexistTargets.map((item) => (
                  <g
                    key={`coex-${item.id}`}
                    className={isExplorer ? styles.svgHotspot : undefined}
                    style={isExplorer ? undefined : {pointerEvents: 'none'}}
                    onClick={isExplorer ? () => handleSvgSelect(item.id) : undefined}>
                    {renderItemRect(item, {
                      fill: 'rgba(5, 150, 105, 0.06)',
                      stroke: '#059669',
                      strokeWidth: '3.5',
                    })}
                  </g>
                ))}

                {conflictTargets.map((item) => (
                  <g
                    key={`conf-${item.id}-${conflictPulseKey}`}
                    className={isExplorer ? styles.svgHotspot : undefined}
                    style={isExplorer ? undefined : {pointerEvents: 'none'}}
                    onClick={isExplorer ? () => handleSvgSelect(item.id) : undefined}>
                    {renderItemRect(item, {
                      fill: 'rgba(234, 88, 12, 0.07)',
                      stroke: '#ea580c',
                      strokeWidth: '4',
                      className: conflictPulseKey > 0 ? styles.conflictEmphasis : '',
                    })}
                  </g>
                ))}

                {activePreset?.opticalBeam && (
                  <g style={{pointerEvents: 'none'}}>
                    <path
                      d={activePreset.opticalBeam.path}
                      fill="none"
                      stroke="#14b8a6"
                      strokeWidth="10"
                      strokeOpacity="0.16"
                      strokeLinecap="round"
                    />
                    <path
                      d={activePreset.opticalBeam.path}
                      fill="none"
                      stroke="#0d9488"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <circle
                      cx={activePreset.opticalBeam.startX}
                      cy={activePreset.opticalBeam.startY}
                      r="6"
                      fill="#0d9488"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />
                    <circle
                      cx={activePreset.opticalBeam.endX}
                      cy={activePreset.opticalBeam.endY}
                      r="6"
                      fill="#0d9488"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                    />
                  </g>
                )}

                {activeIds.map((aid) => {
                  const item = KIT_ITEMS_BY_ID[aid];
                  if (!item) {
                    return null;
                  }
                  const isCore = item.id === COREBOARD_ID;
                  const strokeColor = isCore ? '#dc2626' : '#0284c7';
                  const haloColor = isCore ? '#f87171' : '#38bdf8';
                  return (
                    <g key={`act-${aid}`} style={{pointerEvents: 'none'}}>
                      {renderItemRect(item, {
                        fill: 'none',
                        stroke: haloColor,
                        strokeWidth: '12',
                        strokeOpacity: '0.22',
                        filter: `url(#${glowFilterId})`,
                        className: styles.activeAura,
                      })}
                      {renderItemRect(item, {
                        fill: 'none',
                        stroke: strokeColor,
                        strokeWidth: '4.5',
                      })}
                      {renderItemRect(item, {
                        fill: 'none',
                        stroke: 'rgba(255, 255, 255, 0.88)',
                        strokeWidth: '1.5',
                      })}
                    </g>
                  );
                })}

                {isExplorer &&
                  KIT_ITEMS.filter(
                    (item) =>
                      !activeIds.includes(item.id) &&
                      !conflictIds.includes(item.id) &&
                      !coexistIds.includes(item.id),
                  ).map((item) => {
                    const badgeW =
                      item.id === COREBOARD_ID || item.id === 'motor' || item.id === 'servo'
                        ? 68
                        : 56;
                    return (
                      <g
                        key={`hit-${item.id}`}
                        className={styles.svgHotspot}
                        onClick={() => handleSvgSelect(item.id)}>
                        {renderItemRect(item, {
                          className: styles.hotspotIdleStroke,
                        })}
                        <g>
                          <rect
                            x={item.sockX - badgeW / 2}
                            y={item.sockY - 16}
                            width={badgeW}
                            height="32"
                            rx="16"
                            fill="rgba(255, 255, 255, 0.94)"
                            stroke="#94a3b8"
                            strokeWidth="2"
                            filter={`url(#${shadowFilterId})`}
                            className={styles.idleBadgeRect}
                          />
                          <text
                            x={item.sockX}
                            y={item.sockY + 0.5}
                            fill="#0f172a"
                            fontSize="18"
                            fontWeight="800"
                            textAnchor="middle"
                            dominantBaseline="central"
                            className={styles.idleBadgeText}
                            fontFamily="system-ui, -apple-system, sans-serif">
                            {item.code}
                          </text>
                        </g>
                      </g>
                    );
                  })}

                {coexistTargets.map((item) => (
                  <LeaderCallout
                    key={`pill-coex-${item.id}`}
                    anchorX={item.anchorX}
                    anchorY={item.anchorY}
                    elbowX={item.elbowX}
                    x={item.labelX}
                    y={item.labelY}
                    text={
                      isOledCoexist && item.id === 'm1'
                        ? 'M1 · OLED 联动显示'
                        : `${item.code} · I2C1 共存`
                    }
                    tone="coexist"
                    shadowFilterId={shadowFilterId}
                    onClick={isExplorer ? () => handleSvgSelect(item.id) : undefined}
                  />
                ))}

                {conflictTargets.map((item) => (
                  <LeaderCallout
                    key={`pill-conf-${item.id}`}
                    anchorX={item.anchorX}
                    anchorY={item.anchorY}
                    elbowX={item.elbowX}
                    x={item.labelX}
                    y={item.labelY}
                    text={`${item.code} · 冲突需拔除`}
                    tone="conflict"
                    shadowFilterId={shadowFilterId}
                    onClick={isExplorer ? () => handleSvgSelect(item.id) : undefined}
                  />
                ))}

                {activeIds.map((aid) => {
                  const item = KIT_ITEMS_BY_ID[aid];
                  if (!item) {
                    return null;
                  }
                  return (
                    <LeaderCallout
                      key={`pill-act-${aid}`}
                      anchorX={item.anchorX}
                      anchorY={item.anchorY}
                      elbowX={item.elbowX}
                      x={item.labelX}
                      y={item.labelY}
                      text={`${item.code} · ${item.shortTitle}`}
                      tone={item.id === COREBOARD_ID ? 'core' : 'active'}
                      shadowFilterId={shadowFilterId}
                    />
                  );
                })}

                {activePreset?.opticalBeam && (
                  <LeaderCallout
                    anchorX={activePreset.opticalBeam.anchorX}
                    anchorY={activePreset.opticalBeam.anchorY}
                    elbowX={activePreset.opticalBeam.elbowX}
                    x={activePreset.opticalBeam.badgeX}
                    y={activePreset.opticalBeam.badgeY}
                    text={activePreset.opticalBeam.label}
                    tone="optical"
                    shadowFilterId={shadowFilterId}
                  />
                )}
              </svg>
            </div>
          </div>

          <div className={styles.stageLegend}>
            <div className={styles.legendItems}>
              <span className={styles.legendItem}>
                <i className={styles.swatchActive} />
                当前选中模块
              </span>
              {conflictTargets.length > 0 && (
                <span className={styles.legendItem}>
                  <i className={styles.swatchConflict} />
                  共用引脚冲突（需拔除）
                </span>
              )}
              {coexistTargets.length > 0 && (
                <span className={styles.legendItem}>
                  <i className={styles.swatchCoexist} />
                  {isOledCoexist ? 'M1 OLED 联动显示' : 'I2C1 同总线共存'}
                </span>
              )}
            </div>
            <span className={styles.legendHint}>
              {zoom > 1.05
                ? '按住拖动平移 · 双击恢复全板总览'
                : '双击图片或点击“局部放大”查看细节'}
            </span>
          </div>
        </div>

        <aside className={styles.inspectorColumn}>
          <div className={styles.inspectorHeader}>
            <div className={styles.badgeRow}>
              <span
                className={`${styles.codePill} ${
                  isCoreSelected ? styles.codePillCore : ''
                }`}>
                {activePreset ? 'M4 + M8' : primaryItem.code}
              </span>
              <span className={styles.metaPill}>{primaryItem.voltage}</span>
              <span className={styles.metaPill}>{displayBus}</span>
            </div>
            <h3 className={styles.moduleTitle}>{displayTitle}</h3>
            <p className={styles.moduleSubtitle}>{displaySubtitle}</p>
          </div>

          {primaryItem.id === 'm9' && (
            <div>
              <div className={styles.sectionLabel}>M9 兼容两种蜂鸣器模块（切换查看用法）</div>
              <div className={styles.variantTabs}>
                {Object.values(M9_VARIANTS).map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className={`${styles.variantBtn} ${
                      m9Variant === v.id ? styles.variantBtnActive : ''
                    }`}
                    onClick={() => setM9Variant(v.id)}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {primaryItem.id === COREBOARD_ID && (
            <div>
              <div className={styles.sectionLabel}>核心板与板载外设视图</div>
              <div className={styles.variantTabs}>
                {Object.values(COREBOARD_VARIANTS).map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    className={`${styles.variantBtn} ${
                      coreVariant === v.id ? styles.variantBtnActive : ''
                    }`}
                    onClick={() => setCoreVariant(v.id)}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showIrSwitch && (
            <div>
              <div className={styles.sectionLabel}>红外通信视角切换</div>
              <div className={styles.variantTabs}>
                <button
                  type="button"
                  className={`${styles.variantBtn} ${
                    !activePreset && primaryItem.id === 'm4' ? styles.variantBtnActive : ''
                  }`}
                  onClick={() => selectTarget('m4')}>
                  M4 红外发射
                </button>
                <button
                  type="button"
                  className={`${styles.variantBtn} ${
                    !activePreset && primaryItem.id === 'm8' ? styles.variantBtnActive : ''
                  }`}
                  onClick={() => selectTarget('m8')}>
                  M8 红外接收
                </button>
                <button
                  type="button"
                  className={`${styles.variantBtn} ${
                    activePreset?.id === 'ir_tx_rx' ? styles.variantBtnActive : ''
                  }`}
                  onClick={() => selectTarget('ir_tx_rx')}>
                  M4 + M8 收发联动
                </button>
              </div>
            </div>
          )}

          {conflictTargets.length > 0 && (
            <div className={`${styles.alertBox} ${styles.conflictBox}`}>
              <div className={styles.alertTitle}>
                <span>⚠ 引脚复用提醒（需拔除冲突模块）</span>
              </div>
              <div>{primaryItem.conflictNote}</div>
              <div className={styles.alertActions}>
                <button
                  type="button"
                  className={styles.inlineActionBtn}
                  onClick={handleLocateConflict}>
                  在图中标出 {conflictTargets.map((c) => c.code).join(' / ')} 位置
                </button>
                {conflictTargets.map((c) => (
                  <button
                    key={`jump-${c.id}`}
                    type="button"
                    className={styles.inlineActionBtn}
                    onClick={() => selectTarget(c.id)}>
                    查看 {c.code} 详情
                  </button>
                ))}
              </div>
            </div>
          )}

          {coexistTargets.length > 0 && (
            <div className={`${styles.alertBox} ${styles.coexistBox}`}>
              <div className={styles.alertTitle}>
                <span>
                  {isOledCoexist
                    ? '✓ M1 OLED 实时显示（建议保留在底板）'
                    : '✓ I2C1 总线共存（可同时插在底板）'}
                </span>
              </div>
              <div>{activePreset?.coexistNote || primaryItem.coexistNote}</div>
              <div className={styles.alertActions}>
                {coexistTargets.map((c) => (
                  <button
                    key={`coex-jump-${c.id}`}
                    type="button"
                    className={styles.inlineActionBtn}
                    onClick={() => selectTarget(c.id)}>
                    切换到 {c.code} ({c.shortTitle})
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className={styles.sectionLabel}>
              {activePreset ? '发射端 M4 与接收端 M8 引脚定义' : '核心引脚与信号映射'}
            </div>
            <div className={styles.pinList}>
              {(activePreset
                ? [
                    ['M4 发射 (DAT)', 'PA7 (TIM3_CH2 · 38kHz)'],
                    ['M8 接收 (OUT)', 'PA6 (EXTI 双边沿中断)'],
                    ['供电 (VCC/GND)', '3.3V / GND'],
                    ['通信验证', 'NEC 编码自发自收 / 白纸反射'],
                  ]
                : primaryItem.pins
              ).map(([key, val]) => (
                <div key={key} className={styles.pinRow}>
                  <span className={styles.pinKey}>{key}</span>
                  <span className={styles.pinVal}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {primaryItem.tips && <p className={styles.tipText}>{primaryItem.tips}</p>}

          <div className={styles.quickCard}>
            <div className={styles.quickTop}>
              <span>F407 驱动与 CubeMX 速查</span>
              <Link
                className={styles.quickToolLink}
                to="/docs/DShanMCU-F407/chapter5#52-调试引脚与定时器">
                定时器与调试引脚分配 →
              </Link>
            </div>
            <div className={styles.quickGrid}>
              <div className={styles.quickCell}>
                <span className={styles.quickKey}>驱动文件</span>
                <span className={styles.quickVal}>{displayDriverFile}</span>
              </div>
              <div className={styles.quickCell}>
                <span className={styles.quickKey}>测试函数</span>
                <span className={styles.quickVal}>{displayTestFunc}</span>
              </div>
              <div className={styles.quickCell}>
                <span className={styles.quickKey}>CubeMX 配置</span>
                <span className={styles.quickVal}>{displayCubemxNote}</span>
              </div>
              <div className={styles.quickCell}>
                <span className={styles.quickKey}>调试与串口</span>
                <span className={styles.quickVal}>SWD + 115200 8-N-1</span>
              </div>
            </div>
          </div>

          <div className={styles.ctaRow}>
            <Link className={styles.primaryLink} to={displayLessonPath}>
              查看 {displayLessonLabel} →
            </Link>
            {firmwareInfo && (
              <a
                className={styles.secondaryLink}
                href={firmwareInfo.url}
                download={firmwareInfo.fileName}>
                {firmwareInfo.label} ↓
              </a>
            )}
            <Link className={styles.secondaryLink} to="/docs/DShanMCU-F407/chapter6">
              创建 FreeRTOS 工程 →
            </Link>
            {primaryItem.secondaryLessonPath && (
              <Link className={styles.secondaryLink} to={primaryItem.secondaryLessonPath}>
                {primaryItem.secondaryLessonLabel}
              </Link>
            )}
          </div>
        </aside>
      </div>

      <div className={styles.selectorTray}>
        <div className={styles.categoryRow}>
          <div className={styles.filterGroup}>
            {KIT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`${styles.filterTab} ${
                  category === cat.id ? styles.filterTabActive : ''
                }`}
                onClick={() => setCategory(cat.id)}>
                {cat.label}
              </button>
            ))}
          </div>
          <span className={styles.trayHint}>
            选择下方模块可查看对应插座位置与引脚定义（橙色标记表示共用引脚冲突）
          </span>
        </div>

        <div className={styles.chipGrid}>
          {filteredTrayItems.map((item) => {
            const isActive = activeIds.includes(item.id);
            const isConflict = conflictIds.includes(item.id);
            const chipClass = [
              styles.moduleChip,
              isActive ? styles.moduleChipActive : '',
              !isActive && isConflict ? styles.moduleChipConflict : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <button
                key={item.id}
                type="button"
                className={chipClass}
                onClick={() => selectTarget(item.id)}>
                <span className={styles.chipCode}>{item.code}</span>
                <span className={styles.chipName}>
                  {item.shortTitle}
                  {isConflict ? ' (冲突)' : ''}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
