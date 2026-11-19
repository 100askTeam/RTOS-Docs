import React from 'react';
import Link from '@docusaurus/Link';
import KitExplorer from '@site/src/components/KitExplorer';
import HeroBoardStage from './HeroBoardStage';
import styles from './styles.module.css';
import quickstart from './quickstart.module.css';

const BASE = '/docs/DShanMCU-F407';

const HERO_STATS = [
  {value: '17 类', label: '外设模块驱动'},
  {value: '19 章', label: 'FreeRTOS 课程'},
  {value: '5 种', label: '内存管理方案'},
];

const PREP_STEPS = [
  {num: '01', label: '课程介绍', to: `${BASE}/chapter1`},
  {num: '02', label: '单片机程序设计模式', to: `${BASE}/chapter2`},
  {num: '03', label: '搭建开发环境', to: `${BASE}/chapter3`},
  {num: '04', label: '开发板使用', to: `${BASE}/chapter4`},
];

const PHASE_TRACKS = [
  {
    themeClass: styles.trackPhase1,
    phase: '第一部分',
    count: '4 章',
    title: '模块配置与工程搭建',
    description: '17 类模块驱动与 CubeMX 配置、创建 FreeRTOS 工程与 5 种内存管理。',
    tags: ['CubeMX 配置', '驱动对应表', 'heap_1~5'],
    primaryLabel: '进入第 5 章 →',
    primaryTo: `${BASE}/chapter5`,
    secondaryLabel: '第 1 章 课程介绍',
    secondaryTo: `${BASE}/chapter1`,
  },
  {
    themeClass: styles.trackPhase2,
    phase: '第二部分',
    count: '8 章',
    title: '任务与同步互斥机制',
    description: '任务调度、队列、信号量、互斥量、事件组、任务通知与软件定时器。',
    tags: ['任务管理', '队列 / 信号量', '事件组 / 任务通知'],
    primaryLabel: '进入第 9 章 →',
    primaryTo: `${BASE}/chapter9`,
  },
  {
    themeClass: styles.trackPhase3,
    phase: '第三部分',
    count: '3 章',
    title: '中断、资源与调试',
    description: '中断优先级与 ISR 规范、临界区资源互斥、运行时间与栈监测。',
    tags: ['中断优先级', '临界区', '运行时统计'],
    primaryLabel: '进入第 17 章 →',
    primaryTo: `${BASE}/chapter17`,
  },
];

const MORE_LINKS = [
  {to: '/docs/DShanMCU-F103/', label: 'F103 版本课程'},
  {to: '/docs/rtos-simulator/', label: '模拟器快速入门'},
  {to: '/docs/all_docs_tutorials', label: '教程汇总'},
  {to: '/docs/all_video_tutorials', label: '全部视频教程'},
  {to: 'http://download.100ask.net/', label: '开发板资料下载'},
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
            基于 DshanMCU-F407 核心板与扩展底板，覆盖 17 类外设驱动体验与 19 章 FreeRTOS
            工程开发。
          </p>

          <div className={styles.heroActions}>
            <a className={styles.btnPrimary} href="#kit-explorer">
              外设接线与体验 →
            </a>
            <Link className={styles.btnSecondary} to={`${BASE}/chapter1`}>
              进入系统学习
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
          <Link className={styles.sectionLink} to={`${BASE}/chapter1`}>
            从第 1 章开始 →
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
            <Link className={styles.prepAction} to={`${BASE}/chapter1`}>
              从第 1 章开始 →
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
          <Link className={styles.sectionLink} to={`${BASE}/chapter5`}>
            第 5 章 · 驱动与引脚总表 →
          </Link>
        </div>

        <KitExplorer mode="explorer" />

        <div className={quickstart.moreLinks}>
          {MORE_LINKS.map((link) => (
            <Link key={link.label} className={quickstart.moreLink} to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
