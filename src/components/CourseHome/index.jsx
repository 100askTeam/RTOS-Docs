import React from 'react';
import Link from '@docusaurus/Link';
import KitExplorer from '@site/src/components/KitExplorer';
import HeroBoardStage from './HeroBoardStage';
import styles from './styles.module.css';

const BASE = '/docs/DShanMCU-F407';
const QS_BASE = `${BASE}/quickstart`;

const HERO_STATS = [
  {value: '14 节', label: '外设模块快速体验'},
  {value: '19 章', label: 'CubeMX + FreeRTOS'},
  {value: '5 种', label: '内存管理方案'},
];

const PREP_STEPS = [
  {num: '01', label: '认识实验套件与固件', to: `${QS_BASE}/p1-00-认识实验套件/`},
  {num: '02', label: 'SWD 调试烧录硬件连接', to: `${QS_BASE}/p1-00-SWD调试烧录硬件连接/`},
  {num: '03', label: '搭建开发环境', to: `${BASE}/chapter3`},
  {num: '04', label: '开发板使用', to: `${BASE}/chapter4`},
];

const PHASE_TRACKS = [
  {
    themeClass: styles.trackPhase1,
    phase: '快速体验',
    count: '14 节',
    title: '外设模块快速体验',
    description: '免搭编译环境，下载 .hex 固件配合 DshanPI USBToolBox 一键烧录验证全套底板模块。',
    tags: ['USBToolBox 直烧', 'M1 OLED 联动', '14 套预编译固件'],
    primaryLabel: '开始体验 →',
    primaryTo: `${QS_BASE}/p1-01-OLED双色屏显示/`,
    secondaryLabel: '套件与固件总表',
    secondaryTo: `${QS_BASE}/p1-00-认识实验套件/`,
  },
  {
    themeClass: styles.trackPhase2,
    phase: '系统开发',
    count: '第 1～8 章',
    title: 'STM32CubeMX 配置与工程基础',
    description: '从开发环境搭建、第 5 章外设 CubeMX 驱动配置，到创建 FreeRTOS 工程与 5 种内存管理。',
    tags: ['CubeMX 配置', '第 5 章驱动总表', 'heap_1~5'],
    primaryLabel: '进入第 5 章 →',
    primaryTo: `${BASE}/chapter5`,
    secondaryLabel: '第 1 章 课程介绍',
    secondaryTo: `${BASE}/chapter1`,
  },
  {
    themeClass: styles.trackPhase3,
    phase: '内核实战',
    count: '第 9～19 章',
    title: 'FreeRTOS 内核机制与调试',
    description: '深入任务调度、队列、信号量、互斥量、事件组、任务通知、软件定时器、中断管理与调试优化。',
    tags: ['任务管理', '队列 / 信号量 / 互斥量', '中断与调试优化'],
    primaryLabel: '进入第 9 章 →',
    primaryTo: `${BASE}/chapter9`,
  },
];

export default function CourseHome() {
  return (
    <div className={styles.portal}>
      <section className={styles.hero} aria-labelledby="home-hero-title">
        <div className={styles.heroCopy}>
          <div className={styles.eyebrowPill}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            <span>DshanMCU-F407 · FreeRTOS 教程</span>
          </div>

          <h1 id="home-hero-title" className={styles.heroTitle}>
            DshanMCU-F407
            <br />
            <span className={styles.heroTitleAccent}>FreeRTOS 实战教程</span>
          </h1>

          <p className={styles.heroLead}>
            基于 DshanMCU-F407 核心板与扩展底板，支持免编译下载 .hex 一键快速体验 14
            类外设，以及基于 STM32CubeMX 的 19 章 FreeRTOS 系统开发。
          </p>

          <div className={styles.heroActions}>
            <Link className={styles.btnPrimary} to={`${QS_BASE}/p1-01-OLED双色屏显示/`}>
              快速体验外设 →
            </Link>
            <Link className={styles.btnSecondary} to={`${BASE}/chapter1`}>
              FreeRTOS 教程（CubeMX）
            </Link>
          </div>

          <div className={styles.heroStats} aria-label="课程概览数据">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className={styles.heroStatItem}>
                <strong className={styles.heroStatValue}>{stat.value}</strong>
                <span className={styles.heroStatLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <HeroBoardStage />
      </section>

      <section id="development" className={styles.sectionBlock} aria-labelledby="development-title">
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeaderMain}>
            <h2 id="development-title" className={styles.sectionTitle}>
              课程路线
            </h2>
          </div>
          <Link className={styles.sectionLink} to={`${QS_BASE}/p1-00-认识实验套件/`}>
            从认识实验套件开始 →
          </Link>
        </div>

        <div className={styles.prepCard}>
          <div className={styles.prepTop}>
            <div className={styles.prepIntro}>
              <span className={styles.prepBadge} aria-hidden="true">
                00
              </span>
              <div className={styles.prepText}>
                <h3 className={styles.prepTitle}>开始之前 · 环境与硬件连接</h3>
              </div>
            </div>
            <Link className={styles.prepAction} to={`${QS_BASE}/p1-00-认识实验套件/`}>
              套件与固件总表 →
            </Link>
          </div>

          <div className={styles.prepSteps}>
            {PREP_STEPS.map((step) => (
              <Link key={step.num} className={styles.prepStepChip} to={step.to}>
                <span className={styles.prepStepNum}>{step.num}</span>
                <span className={styles.prepStepName}>{step.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.trackGrid}>
          {PHASE_TRACKS.map((track) => (
            <article key={track.phase} className={`${styles.trackCard} ${track.themeClass}`}>
              <div className={styles.trackMeta}>
                <span className={styles.trackPhaseBadge}>{track.phase}</span>
                <span className={styles.trackCountBadge}>{track.count}</span>
              </div>
              <h3 className={styles.trackTitle}>{track.title}</h3>
              <p className={styles.trackDesc}>{track.description}</p>
              <div className={styles.trackTags}>
                {track.tags.map((tag) => (
                  <span key={tag} className={styles.trackTag}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className={styles.trackFooter}>
                <Link className={styles.trackPrimaryLink} to={track.primaryTo}>
                  {track.primaryLabel}
                </Link>
                {track.secondaryTo && (
                  <Link className={styles.trackSecondaryLink} to={track.secondaryTo}>
                    {track.secondaryLabel}
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="kit-explorer" className={styles.sectionBlock} aria-labelledby="explorer-title">
        <span id="quickstart" aria-hidden="true" />
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeaderMain}>
            <h2 id="explorer-title" className={styles.sectionTitle}>
              实验套件与底板接线
            </h2>
          </div>
          <Link className={styles.sectionLink} to={`${QS_BASE}/p1-00-认识实验套件/`}>
            引脚复用与固件总表 →
          </Link>
        </div>

        <KitExplorer mode="explorer" />
      </section>
    </div>
  );
}
