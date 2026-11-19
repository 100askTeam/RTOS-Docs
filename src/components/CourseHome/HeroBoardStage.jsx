import React, {useState} from 'react';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

// Stage canvas: 1084 × 1044. The board photo (1084 × 723) is placed at y=160,
// leaving clean margins above and below for orthogonal traces and 6 HUD cards.
const STAGE = {width: 1084, height: 1044, imageY: 160};

const LENS_OPTIONS = [
  {
    id: 'all',
    label: '全板总览',
    telemetryCode: 'board: DshanMCU-F407 核心板',
    telemetryText: 'STM32F407ZGT6 · 1MB SRAM · 32MB Flash · 双 Type-C',
    linkLabel: '开发板使用详解 →',
    linkTo: '/docs/DShanMCU-F407/chapter4',
  },
  {
    id: 'core',
    label: '核心主控',
    telemetryCode: 'core: STM32F407ZGT6 + IS62WV51216BLL + GD25Q256',
    telemetryText: 'Cortex-M4 168MHz 主控、1MB 外部 SRAM 与 32MB SPI Flash',
    linkLabel: '认识核心板 →',
    linkTo: '/docs/DShanMCU-F407/chapter1',
  },
  {
    id: 'debug',
    label: '下载调试',
    telemetryCode: 'debug: SWD 4Pin + DEBUG 串口 / ISP',
    telemetryText: 'ST-Link 在线调试烧录，板载 USB 转串口日志与 ISP 下载',
    linkLabel: '连接 ST-Link 与串口 →',
    linkTo: '/docs/DShanMCU-F407/chapter4',
  },
  {
    id: 'ext',
    label: '扩展接口',
    telemetryCode: 'ext: P2/P3 (2×25 Pin) + LCD-8080 / CAMERA + OTG',
    telemetryText: '100Pin 双排针引出到底板，另带并口屏与 DVP 摄像头座',
    linkLabel: '模块与引脚对应 →',
    linkTo: '/docs/DShanMCU-F407/chapter5',
  },
];

const HW_NODES = [
  {
    id: 'header',
    lenses: ['all', 'ext'],
    accent: 'var(--node-bus)',
    tag: 'P2 / P3 · 2×25 Pin',
    title: '100Pin 扩展排针',
    reticle: {x1: 156, y1: 194, x2: 918, y2: 266},
    secondaryReticle: {x1: 156, y1: 776, x2: 918, y2: 848},
    anchor: {x: 236, y: 194},
    points: '236,118 236,194',
    card: {x: 16, y: 10, w: 336, h: 108},
    telemetryCode: 'header: P2 + P3 (2×25 Pin × 2 = 100Pin)',
    telemetryText: '双排百针全部引出，倒扣插接扩展底板与外设模块',
    linkLabel: '模块与引脚对应 →',
    linkTo: '/docs/DShanMCU-F407/chapter5',
  },
  {
    id: 'soc',
    lenses: ['all', 'core', 'debug'],
    accent: 'var(--node-soc)',
    tag: 'Cortex-M4 · 168MHz',
    title: 'STM32F407ZGT6',
    reticle: {x1: 295, y1: 350, x2: 588, y2: 642},
    anchor: {x: 442, y: 350},
    points: '442,118 442,350',
    card: {x: 374, y: 10, w: 336, h: 108},
    telemetryCode: 'mcu: STM32F407ZGT6 (LQFP144)',
    telemetryText: '168MHz 主频 · 1MB 片内 Flash · 192KB SRAM',
    linkLabel: '创建 FreeRTOS 工程 →',
    linkTo: '/docs/DShanMCU-F407/chapter6',
  },
  {
    id: 'sram',
    lenses: ['all', 'core'],
    accent: 'var(--node-sdram)',
    tag: 'FSMC · 512K×16bit',
    title: '1MB 外部 SRAM',
    reticle: {x1: 658, y1: 284, x2: 842, y2: 532},
    anchor: {x: 768, y: 284},
    points: '768,118 768,284',
    card: {x: 732, y: 10, w: 336, h: 108},
    telemetryCode: 'sram: IS62WV51216BLL-55TLI (1MB)',
    telemetryText: 'FSMC 并口扩展 1MB 高速外部 SRAM',
    linkLabel: '内存管理 →',
    linkTo: '/docs/DShanMCU-F407/chapter8',
  },
  {
    id: 'debug',
    lenses: ['all', 'debug', 'ext'],
    accent: 'var(--node-usbc)',
    tag: 'SWD · DEBUG · OTG',
    title: '调试与双 USB 口',
    reticle: {x1: 28, y1: 336, x2: 180, y2: 706},
    anchor: {x: 126, y: 706},
    points: '126,926 126,706',
    card: {x: 16, y: 926, w: 336, h: 108},
    telemetryCode: 'debug: SWD 4Pin + DEBUG 串口 + USB OTG',
    telemetryText: 'ST-Link 烧录调试、板载 USB 转串口/ISP 与 USB OTG',
    linkLabel: '开发板连接与烧录 →',
    linkTo: '/docs/DShanMCU-F407/chapter4',
  },
  {
    id: 'flash',
    lenses: ['all', 'core'],
    accent: 'var(--node-nor)',
    tag: 'SPI NOR · 32MB',
    title: 'GD25Q256 存储',
    reticle: {x1: 706, y1: 600, x2: 782, y2: 712},
    anchor: {x: 744, y: 712},
    points: '684,926 684,908 744,848 744,712',
    card: {x: 374, y: 926, w: 336, h: 108},
    telemetryCode: 'storage: GD25Q256 (32MB) + 背面 MicroSD',
    telemetryText: '板载 32MB SPI NOR Flash，背面另带 TF 卡槽',
    linkLabel: '认识核心板 →',
    linkTo: '/docs/DShanMCU-F407/chapter1',
  },
  {
    id: 'display',
    lenses: ['all', 'ext'],
    accent: 'var(--node-jtag)',
    tag: 'LCD-8080 / CAMERA',
    title: '显示与摄像头座',
    reticle: {x1: 972, y1: 276, x2: 1056, y2: 762},
    anchor: {x: 1014, y: 762},
    points: '1014,926 1014,762',
    card: {x: 732, y: 926, w: 336, h: 108},
    telemetryCode: 'fpc: LCD-8080 (32P) + CAMERA DVP (24P)',
    telemetryText: '8080 并口显示排线座与 DVP 摄像头排线座',
    linkLabel: '认识核心板 →',
    linkTo: '/docs/DShanMCU-F407/chapter1',
  },
];

function renderCornerBrackets(rect, color, len = 24, strokeWidth = 4.2) {
  const {x1, y1, x2, y2} = rect;
  const paths = [
    `M ${x1} ${y1 + len} L ${x1} ${y1} L ${x1 + len} ${y1}`,
    `M ${x2 - len} ${y1} L ${x2} ${y1} L ${x2} ${y1 + len}`,
    `M ${x1} ${y2 - len} L ${x1} ${y2} L ${x1 + len} ${y2}`,
    `M ${x2 - len} ${y2} L ${x2} ${y2} L ${x2} ${y2 - len}`,
  ];
  return paths.map((d, index) => (
    <g key={index}>
      <path
        d={d}
        fill="none"
        stroke="var(--stage-halo)"
        strokeWidth={strokeWidth + 3.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  ));
}

export default function HeroBoardStage() {
  const boardImgUrl = useBaseUrl('/img/f407-coreboard.webp');
  const [lens, setLens] = useState('all');
  const [hoveredId, setHoveredId] = useState(null);
  const [pinnedId, setPinnedId] = useState(null);

  const activeInspectId = hoveredId || pinnedId;
  const activeLens = LENS_OPTIONS.find((opt) => opt.id === lens) || LENS_OPTIONS[0];
  const inspectedNode = HW_NODES.find((node) => node.id === activeInspectId) || null;
  const telemetry = inspectedNode || activeLens;

  const handleSelectLens = (nextLens) => {
    setLens(nextLens);
    setPinnedId(null);
    setHoveredId(null);
  };

  const handleTogglePin = (nodeId) => {
    setPinnedId((prev) => (prev === nodeId ? null : nodeId));
  };

  const handleNodeKeyDown = (e, nodeId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleTogglePin(nodeId);
    }
  };

  return (
    <aside className={styles.heroStage} aria-label="DshanMCU-F407 核心板硬件资源总览">
      <div className={styles.stageGridOverlay} aria-hidden="true" />

      <div className={styles.stageHeader}>
        <div className={styles.stageTitleGroup}>
          <span className={styles.stageBeacon} aria-hidden="true" />
          <span className={styles.stageBoardCode}>DshanMCU-F407 核心板</span>
        </div>

        <div className={styles.lensTabs} role="tablist" aria-label="按课程用途筛选板载硬件">
          {LENS_OPTIONS.map((opt) => {
            const isActive = lens === opt.id && !pinnedId;
            return (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={lens === opt.id}
                className={`${styles.lensBtn} ${isActive ? styles.lensBtnActive : ''}`}
                onClick={() => handleSelectLens(opt.id)}>
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className={styles.stageSvgWrap}>
        <svg
          className={styles.stageSvg}
          viewBox={`0 0 ${STAGE.width} ${STAGE.height}`}
          role="img"
          aria-label="DshanMCU-F407 核心板主要器件、接口与按键分布图">
          <defs>
            <filter id="f407-board-shadow" x="-12%" y="-12%" width="124%" height="140%">
              <feDropShadow dx="0" dy="18" stdDeviation="16" floodColor="#0f2942" floodOpacity="0.24" />
            </filter>
            <filter id="f407-card-shadow" x="-12%" y="-18%" width="124%" height="144%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0f2942" floodOpacity="0.09" />
            </filter>
            <radialGradient id="f407-core-aura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--stage-aura-core)" stopOpacity="0.14" />
              <stop offset="62%" stopColor="var(--stage-aura-core)" stopOpacity="0.05" />
              <stop offset="100%" stopColor="var(--stage-aura-core)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="f407-pcb-warmth" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--stage-aura-warm)" stopOpacity="0.07" />
              <stop offset="68%" stopColor="var(--stage-aura-core)" stopOpacity="0.03" />
              <stop offset="100%" stopColor="var(--stage-aura-core)" stopOpacity="0" />
            </radialGradient>
          </defs>

          <ellipse cx="542" cy="522" rx="520" ry="340" fill="url(#f407-pcb-warmth)" />
          <circle cx="542" cy="522" r="330" fill="url(#f407-core-aura)" />
          <g stroke="var(--stage-ring)" fill="none">
            <circle cx="542" cy="522" r="260" strokeWidth="1.2" strokeDasharray="5 12" />
          </g>

          <g stroke="var(--stage-corner)" strokeWidth="2" fill="none">
            <path d="M 30 22 L 16 22 L 16 46" />
            <path d="M 1054 22 L 1068 22 L 1068 46" />
            <path d="M 16 998 L 16 1022 L 30 1022" />
            <path d="M 1068 998 L 1068 1022 L 1054 1022" />
          </g>

          <image
            href={boardImgUrl}
            x="0"
            y={STAGE.imageY}
            width="1084"
            height="723"
            filter="url(#f407-board-shadow)"
          />

          {HW_NODES.map((node) => {
            const isHighlighted = activeInspectId
              ? activeInspectId === node.id
              : node.lenses.includes(lens);
            const isFocused = activeInspectId === node.id;
            const nodeOpacity = isHighlighted ? 1 : 0.24;
            const showSecondary = Boolean(node.secondaryReticle && (isFocused || lens === 'ext'));
            const showTraceFlow = isFocused || (lens !== 'all' && isHighlighted);

            return (
              <g
                key={node.id}
                className={styles.hudNode}
                style={{opacity: nodeOpacity}}
                role="button"
                tabIndex={0}
                aria-label={`${node.title}：${node.telemetryText}`}
                aria-pressed={pinnedId === node.id}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(node.id)}
                onBlur={() => setHoveredId(null)}
                onClick={() => handleTogglePin(node.id)}
                onKeyDown={(e) => handleNodeKeyDown(e, node.id)}>
                <g className={styles.hudTrace}>
                  <polyline
                    points={node.points}
                    fill="none"
                    stroke="var(--stage-halo)"
                    strokeWidth={isFocused ? 7 : 5.4}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  <polyline
                    points={node.points}
                    fill="none"
                    stroke={node.accent}
                    strokeWidth={isFocused ? 2.9 : 2.1}
                    strokeOpacity={isFocused ? 0.85 : 0.55}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {showTraceFlow && (
                    <polyline
                      points={node.points}
                      className={styles.traceFlow}
                      fill="none"
                      stroke={node.accent}
                      strokeWidth={isFocused ? 3.6 : 2.8}
                      strokeDasharray="20 68"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  )}
                </g>

                <circle
                  cx={node.anchor.x}
                  cy={node.anchor.y}
                  r={isFocused ? 12 : 9}
                  fill={node.accent}
                  fillOpacity={0.18}
                  stroke={node.accent}
                  strokeWidth="2"
                />
                <circle
                  cx={node.anchor.x}
                  cy={node.anchor.y}
                  r="4.4"
                  fill="#ffffff"
                  stroke={node.accent}
                  strokeWidth="2.2"
                />

                {renderCornerBrackets(
                  node.reticle,
                  node.accent,
                  node.id === 'soc' ? 30 : 22,
                  isFocused ? 5.2 : 4.2,
                )}
                {showSecondary &&
                  renderCornerBrackets(node.secondaryReticle, node.accent, 22, isFocused ? 5.2 : 4.2)}

                <g className={styles.hudCard}>
                  <rect
                    x={node.card.x}
                    y={node.card.y}
                    width={node.card.w}
                    height={node.card.h}
                    rx="16"
                    fill={isFocused ? 'var(--stage-card-bg-focus)' : 'var(--stage-card-bg)'}
                    filter="url(#f407-card-shadow)"
                    stroke={node.accent}
                    strokeWidth={isFocused ? 2.6 : 1.5}
                    strokeOpacity={isFocused ? 0.92 : 'var(--stage-card-stroke-opacity)'}
                  />
                  <rect
                    x={node.card.x + 18}
                    y={node.card.y + 16}
                    width="6"
                    height={node.card.h - 32}
                    rx="3"
                    fill={node.accent}
                  />
                  <text
                    x={node.card.x + 36}
                    y={node.card.y + 34}
                    fill={node.accent}
                    fontSize="18.5"
                    fontWeight="700"
                    fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">
                    {node.tag}
                  </text>
                  <text
                    x={node.card.x + 36}
                    y={node.card.y + 78}
                    fill="var(--stage-card-title)"
                    fontSize="26"
                    fontWeight="800"
                    fontFamily="Inter, 'Noto Sans SC', 'Microsoft YaHei', sans-serif">
                    {node.title}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      <div className={styles.mobileLegend} aria-label="板载硬件速览">
        {HW_NODES.map((node) => (
          <button
            key={node.id}
            type="button"
            className={styles.mobileLegendItem}
            style={{'--node-accent': node.accent}}
            aria-pressed={pinnedId === node.id}
            onClick={() => handleTogglePin(node.id)}>
            <span className={styles.mobileLegendDot} aria-hidden="true" />
            <span className={styles.mobileLegendTitle}>{node.title}</span>
            <span className={styles.mobileLegendTag}>{node.tag}</span>
          </button>
        ))}
      </div>

      <div className={styles.stageFooter}>
        <div className={styles.telemetryInfo}>
          <span className={styles.telemetryCode}>{telemetry.telemetryCode}</span>
          <span className={styles.telemetryText}>{telemetry.telemetryText}</span>
        </div>
        <Link className={styles.telemetryLink} to={telemetry.linkTo}>
          {telemetry.linkLabel}
        </Link>
      </div>
    </aside>
  );
}
