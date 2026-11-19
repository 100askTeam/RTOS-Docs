import React, {useId} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const IMG_W = 1084;
const IMG_H = 723;

const ANNOTATIONS = [
  {
    id: 'otg',
    rect: {x: 26, y: 178, w: 118, h: 118, rx: 10},
    dashed: true,
    stroke: '#94a3b8',
    strokeWidth: 3,
    maskFill: '#777777',
    anchorX: 144,
    anchorY: 218,
    elbowX: 225,
    labelX: 445,
    labelY: 132,
    text: 'USB OTG（原生 USB，快速体验不插）',
    pillFill: '#334155',
    pillStroke: '#ffffff',
    pillText: '#ffffff',
    lineColor: '#64748b',
  },
  {
    id: 'swd',
    rect: {x: 26, y: 296, w: 178, h: 134, rx: 10},
    dashed: false,
    stroke: '#0284c7',
    strokeWidth: 4,
    maskFill: '#000000',
    anchorX: 204,
    anchorY: 363,
    elbowX: 268,
    labelX: 505,
    labelY: 344,
    text: 'SWD 接口：3.3V · CLK · DIO · GND',
    pillFill: '#0284c7',
    pillStroke: '#ffffff',
    pillText: '#ffffff',
    lineColor: '#0284c7',
  },
  {
    id: 'debug',
    rect: {x: 26, y: 434, w: 124, h: 118, rx: 10},
    dashed: false,
    stroke: '#059669',
    strokeWidth: 4,
    maskFill: '#000000',
    anchorX: 150,
    anchorY: 488,
    elbowX: 205,
    labelX: 425,
    labelY: 466,
    text: 'DEBUG 口：5V 供电 + 115200 串口',
    pillFill: '#059669',
    pillStroke: '#ffffff',
    pillText: '#ffffff',
    lineColor: '#059669',
  },
  {
    id: 'jumpers',
    rect: {x: 208, y: 545, w: 76, h: 83, rx: 8},
    dashed: false,
    stroke: '#d97706',
    strokeWidth: 3.5,
    maskFill: '#111111',
    anchorX: 284,
    anchorY: 592,
    elbowX: 304,
    labelX: 478,
    labelY: 616,
    text: 'MCU-RX / TX 跳线帽（保持短接）',
    pillFill: '#fffbeb',
    pillStroke: '#d97706',
    pillText: '#b45309',
    lineColor: '#d97706',
  },
  {
    id: 'rst',
    rect: {x: 610, y: 498, w: 94, h: 78, rx: 10},
    dashed: false,
    stroke: '#4f46e5',
    strokeWidth: 3.5,
    maskFill: '#111111',
    anchorX: 704,
    anchorY: 537,
    elbowX: 745,
    labelX: 855,
    labelY: 537,
    text: 'RST 复位键',
    pillFill: '#4f46e5',
    pillStroke: '#ffffff',
    pillText: '#ffffff',
    lineColor: '#4f46e5',
  },
];

function estimatePillWidth(text) {
  let units = 0;
  for (const ch of text) {
    units += ch.charCodeAt(0) > 127 ? 1.82 : 1.04;
  }
  return Math.max(140, Math.round(units * 10.6 + 34));
}

export default function CoreboardSwdMap() {
  const rawId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const maskId = `f407-cb-mask-${rawId}`;
  const shadowId = `f407-cb-shadow-${rawId}`;
  const imgUrl = useBaseUrl('/img/f407-coreboard.webp');

  return (
    <section className={styles.explorerRoot} aria-label="DshanMCU-F407 核心板接口定位图">
      <div className={styles.topBar}>
        <div className={styles.topBarTitleGroup}>
          <span className={styles.modeBadge}>核心板接口定位</span>
          <span className={styles.topBarHeading}>
            DshanMCU-F407 核心板 · SWD 调试口与 DEBUG 串口位置
          </span>
        </div>
      </div>

      <div style={{padding: '1rem 1.1rem 0.9rem'}}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: `${IMG_W} / ${IMG_H}`,
            borderRadius: '12px',
            overflow: 'hidden',
            border: '1px solid var(--ifm-color-emphasis-200)',
            background: '#ffffff',
          }}>
          <img
            src={imgUrl}
            alt="DshanMCU-F407 核心板 SWD 接口、DEBUG 串口与跳线帽位置标注图"
            className={styles.photoImg}
            draggable={false}
          />

          <svg
            className={styles.overlaySvg}
            viewBox={`0 0 ${IMG_W} ${IMG_H}`}
            preserveAspectRatio="xMidYMid meet">
            <defs>
              <filter id={shadowId} x="-15%" y="-25%" width="130%" height="160%">
                <feDropShadow
                  dx="0"
                  dy="3"
                  stdDeviation="4"
                  floodColor="#0f172a"
                  floodOpacity="0.22"
                />
              </filter>

              <mask id={maskId}>
                <rect x="0" y="0" width={IMG_W} height={IMG_H} fill="white" />
                {ANNOTATIONS.map((item) => (
                  <rect
                    key={`m-${item.id}`}
                    x={item.rect.x}
                    y={item.rect.y}
                    width={item.rect.w}
                    height={item.rect.h}
                    rx={item.rect.rx}
                    fill={item.maskFill}
                  />
                ))}
              </mask>
            </defs>

            <rect
              x="0"
              y="0"
              width={IMG_W}
              height={IMG_H}
              fill="rgba(15, 23, 42, 0.36)"
              mask={`url(#${maskId})`}
            />

            {ANNOTATIONS.map((item) => (
              <rect
                key={`b-${item.id}`}
                x={item.rect.x}
                y={item.rect.y}
                width={item.rect.w}
                height={item.rect.h}
                rx={item.rect.rx}
                fill="none"
                stroke={item.stroke}
                strokeWidth={item.strokeWidth}
                strokeDasharray={item.dashed ? '7 5' : undefined}
              />
            ))}

            {ANNOTATIONS.map((item) => {
              const pillW = estimatePillWidth(item.text);
              const pillH = 38;
              const cx = Math.max(
                pillW / 2 + 12,
                Math.min(IMG_W - pillW / 2 - 12, item.labelX),
              );
              const cy = item.labelY;
              const pathD = `M ${item.anchorX} ${item.anchorY} L ${item.elbowX} ${cy} L ${cx} ${cy}`;

              return (
                <g key={`l-${item.id}`}>
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="4.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeOpacity="0.9"
                  />
                  <path
                    d={pathD}
                    fill="none"
                    stroke={item.lineColor}
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx={item.anchorX}
                    cy={item.anchorY}
                    r="5"
                    fill={item.lineColor}
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <rect
                    x={cx - pillW / 2}
                    y={cy - pillH / 2}
                    width={pillW}
                    height={pillH}
                    rx={11}
                    fill={item.pillFill}
                    stroke={item.pillStroke}
                    strokeWidth="2"
                    filter={`url(#${shadowId})`}
                  />
                  <text
                    x={cx}
                    y={cy + 0.5}
                    fill={item.pillText}
                    fontSize="17"
                    fontWeight="700"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif">
                    {item.text}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className={styles.stageLegend} style={{marginTop: '0.6rem'}}>
          <div className={styles.legendItems}>
            <span className={styles.legendItem}>
              <i className={styles.swatchActive} />
              SWD 调试烧录口
            </span>
            <span className={styles.legendItem}>
              <i className={styles.swatchCoexist} />
              DEBUG 供电与日志串口
            </span>
            <span className={styles.legendItem}>
              <i className={styles.swatchConflict} />
              串口跳线帽（短接）
            </span>
            <span className={styles.legendItem}>
              <i
                style={{
                  display: 'inline-block',
                  width: 9,
                  height: 9,
                  borderRadius: 2,
                  border: '1.5px dashed #94a3b8',
                }}
              />
              USB OTG（快速体验不插）
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
