import React, {useState} from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

const TAOBAO_URL = 'https://item.taobao.com/item.htm?id=724601559592';
const VIDEO_URL = 'https://www.bilibili.com/video/BV11h41167iD';
const VIDEO_IFRAME_SRC =
  '//player.bilibili.com/player.html?aid=206670748&bvid=BV11h41167iD&cid=370140179&p=1';
const DOWNLOAD_URL = 'http://download.100ask.net/boards/St/DShanMCU-F103/index.html';
const QQ_JOIN_URL =
  'http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=E37yrufRLFpLyU26PXzSc6YA5KsaR425&authKey=VD9gMsGRobd97XATc7oU19G37meKMVjybNCZmxK9nW%2FxGBzENm7FY6AV4k5I%2BhFJ&noverify=0&group_code=576453735';
const KIT_IMAGE_URL =
  'http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-1/image1.png';
const QQ_QR_URL =
  'http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/DShanMCU-F103_HAL+RreeRTOS-QQgroup.png';

const SIMULATOR_LINK = '/docs/rtos-simulator/';
const SIMULATOR_CH14_LINK = '/docs/rtos-simulator/chapter14';

const FAQ_ITEMS = [
  {
    num: '1',
    question: (
      <>
        <Link to={SIMULATOR_LINK}>《FreeRTOS快速入门基于模拟器》</Link> 和
        《FreeRTOS入门与工程实践-基于STM32F103》的开发板有何不同？
      </>
    ),
    answer: (
      <>
        前者使用Keil自带的模拟器无需实际开发板，后者使用
        <a href={TAOBAO_URL} target="_blank" rel="noopener noreferrer">
          DShanMCU-F103开发板套件
        </a>
        （STM32F103C8T6主控芯片）
      </>
    ),
  },
  {
    num: '2',
    question: (
      <>
        <Link to={SIMULATOR_LINK}>《FreeRTOS快速入门基于模拟器》</Link> 和
        《FreeRTOS入门与工程实践-基于STM32F103》如何选择？
      </>
    ),
    answer: <>不想买板子的学习前者，负担得起板子的学习后者。</>,
  },
  {
    num: '3',
    question: (
      <>
        <Link to={SIMULATOR_LINK}>《FreeRTOS快速入门基于模拟器》</Link> 和
        《FreeRTOS入门与工程实践-基于STM32F103》 课程有何不同？
      </>
    ),
    answer: (
      <>
        前者主讲FreeRTOS的使用，后者包含前者的内容，并且加入了更多的工程实践：用FreeRTOS解决实际工作难题。
      </>
    ),
  },
  {
    num: '4',
    question: <>入门之后该怎么进阶学习？</>,
    answer: (
      <>
        阅读 <Link to={SIMULATOR_CH14_LINK}>【拓展】进阶学习</Link> 章节，了解关于FreeRTOS的学习路线。
      </>
    ),
  },
];

export default function F103CourseHome() {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <div className={styles.portal}>
      <section className={styles.hero} aria-labelledby="f103-hero-title">
        <div className={styles.heroCopy}>
          <div className={styles.eyebrowPill}>
            <span className={styles.eyebrowDot} aria-hidden="true" />
            <span>DShanMCU-F103 · STM32F103C8T6 · FreeRTOS</span>
          </div>

          <h1 id="f103-hero-title" className={styles.heroTitle}>
            百问网《FreeRTOS入门与工程实践-基于STM32F103》教程
            <br />
            <span className={styles.heroTitleSub}>基于 DShanMCU-103 (STM32F103)</span>
          </h1>

          <p className={styles.heroLead}>
            《FreeRTOS入门与工程实践-基于STM32F103》基于{' '}
            <a href={TAOBAO_URL} target="_blank" rel="noopener noreferrer">
              DShanMCU-103学习套件
            </a>{' '}
            编写。
          </p>

          <div className={styles.heroActions}>
            <Link className={styles.btnPrimary} to="/docs/DShanMCU-F103/chapter1">
              开始第 1 章学习 →
            </Link>
            <a className={styles.btnSecondary} href="#pre-study-video">
              学前必看视频
            </a>
            <a className={styles.btnSecondary} href="#resources">
              配套资料与交流群
            </a>
          </div>
        </div>

        <div className={styles.heroStage}>
          <div className={styles.kitPhotoWrap}>
            <img
              src={KIT_IMAGE_URL}
              alt="DShanMCU-103 学习套件与传感器扩展模块实拍图"
              className={styles.kitPhoto}
            />
          </div>
          <div className={styles.kitCaption}>
            <span>最小系统板 · 扩展底板 · 多传感器模块</span>
            <span className={styles.kitBadge}>STM32F103C8T6</span>
          </div>
        </div>
      </section>

      <section className={styles.sectionBlock} aria-labelledby="f103-preface-title">
        <div className={styles.sectionHeader}>
          <h2 id="f103-preface-title" className={styles.sectionTitle}>
            前言
          </h2>
          <span className={styles.sectionNote}>选课对比与进阶路线常见问题</span>
        </div>

        <div className={styles.faqGrid}>
          {FAQ_ITEMS.map((item) => (
            <article key={item.num} className={styles.faqCard}>
              <div className={styles.faqQuestionRow}>
                <span className={styles.qPill}>问 {item.num}</span>
                <p className={styles.faqQuestion}>{item.question}</p>
              </div>
              <div className={styles.faqAnswerBox}>
                <span className={styles.aTag}>答 {item.num}</span>
                <p className={styles.faqAnswer}>{item.answer}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="pre-study-video"
        className={styles.sectionBlock}
        aria-labelledby="f103-video-title">
        <div className={styles.sectionHeader}>
          <h2 id="f103-video-title" className={styles.sectionTitle}>
            学前必看
          </h2>
          <span className={styles.sectionNote}>先建立 RTOS 核心概念，再动手工程实践</span>
        </div>

        <div className={styles.videoCard}>
          <div className={styles.videoTop}>
            <p className={styles.videoLead}>
              对于RTOS初学者或者对RTOS的基础概念不太清楚的同学，请先学习{' '}
              <a href={VIDEO_URL} target="_blank" rel="noopener noreferrer">
                这个视频课程
              </a>
              ，在充分理解什么是RTOS之后再开始学习，对于你的学习能达到事半功倍的作用！
            </p>
            <a
              className={styles.btnSecondary}
              href={VIDEO_URL}
              target="_blank"
              rel="noopener noreferrer">
              前往 B 站观看 ↗
            </a>
          </div>

          <div className={styles.videoFrameWrap}>
            {videoLoaded ? (
              <iframe
                src={VIDEO_IFRAME_SRC}
                title="百问网 RTOS 学前必看视频课程"
                className={styles.videoFrame}
                scrolling="no"
                frameBorder="0"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                className={styles.videoFacade}
                onClick={() => setVideoLoaded(true)}
                aria-label="加载并播放 B 站学前必看视频课程">
                <span className={styles.facadeBadge}>学前必看 · 嵌入式视频课程</span>
                <span className={styles.playCircle} aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                    <path d="M8 5.5v13l11-6.5-11-6.5z" />
                  </svg>
                </span>
                <span className={styles.facadeTitle}>5 分钟快速理解什么是 RTOS</span>
                <span className={styles.facadeSub}>点击立即加载 B 站播放器（BV11h41167iD）</span>
              </button>
            )}
          </div>

          <div className={styles.videoFooter}>
            <span>
              视频观看地址：{' '}
              <a href={VIDEO_URL} target="_blank" rel="noopener noreferrer">
                {VIDEO_URL}
              </a>
            </span>
          </div>
        </div>
      </section>

      <section
        id="resources"
        className={styles.sectionBlock}
        aria-labelledby="f103-resources-title">
        <div className={styles.sectionHeader}>
          <h2 id="f103-resources-title" className={styles.sectionTitle}>
            配套学习套件与资料获取
          </h2>
          <span className={styles.sectionNote}>硬件购买入口、资料包下载与技术交流群</span>
        </div>

        <div className={styles.resourceGrid}>
          <article className={styles.resourceCard}>
            <div>
              <div className={styles.cardHeader}>
                <span className={styles.cardTag}>硬件平台</span>
                <h3 className={styles.cardTitle}>配套学习套件</h3>
              </div>
            </div>

            <div className={styles.kitMetaList}>
              <div className={styles.kitMetaRow}>
                <span className={styles.kitMetaKey}>套件型号</span>
                <span className={styles.kitMetaVal}>DShanMCU-F103 学习套件</span>
              </div>
              <div className={styles.kitMetaRow}>
                <span className={styles.kitMetaKey}>主控芯片</span>
                <span className={styles.kitMetaVal}>STM32F103C8T6</span>
              </div>
              <div className={styles.kitMetaRow}>
                <span className={styles.kitMetaKey}>淘宝链接</span>
                <a href={TAOBAO_URL} target="_blank" rel="noopener noreferrer">
                  点击前往淘宝购买 ↗
                </a>
              </div>
            </div>

            <a
              className={styles.kitActionBtn}
              href={TAOBAO_URL}
              target="_blank"
              rel="noopener noreferrer">
              前往淘宝查看 DShanMCU-F103 学习套件 ↗
            </a>
          </article>

          <article className={styles.resourceCard}>
            <div className={styles.cardHeader}>
              <span className={styles.cardTag}>资料下载</span>
              <h3 className={styles.cardTitle}>配套资料获取</h3>
            </div>

            <div className={styles.resourcesBody}>
              <div className={styles.channelList}>
                <div className={styles.channelItem}>
                  <div className={styles.channelTitle}>获取方式一：官方资料下载页</div>
                  <p className={styles.channelText}>
                    <a href={DOWNLOAD_URL} target="_blank" rel="noopener noreferrer">
                      {DOWNLOAD_URL}
                    </a>
                  </p>
                </div>

                <div className={styles.channelItem}>
                  <div className={styles.channelTitle}>获取方式二：QQ 交流群文件</div>
                  <p className={styles.channelText}>
                    进入QQ交流群获取，资料包在群文件中，不需要开vip，比较正常的下载速度，点击下方QQ群号跳转加入群聊，或打开手机QQ搜索群号 / 扫描右侧二维码加入群聊：
                  </p>
                  <a
                    className={styles.qqJoinBtn}
                    href={QQ_JOIN_URL}
                    target="_blank"
                    rel="noopener noreferrer">
                    QQ 群：576453735 ↗
                  </a>
                </div>
              </div>

              <div className={styles.qrBox}>
                <img
                  src={QQ_QR_URL}
                  alt="DShanMCU-F103 HAL + FreeRTOS QQ 交流群二维码"
                  className={styles.qrImg}
                />
                <span className={styles.qrCaption}>扫码加入 QQ 群 (576453735)</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
