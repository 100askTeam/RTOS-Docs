import{_ as n,o as s,c as a,e}from"./app-a3aa5aa8.js";const p={},t=e(`<h1 id="第2章-单片机程序设计模式" tabindex="-1"><a class="header-anchor" href="#第2章-单片机程序设计模式" aria-hidden="true">#</a> 第2章 单片机程序设计模式</h1><p>本章目标</p><ul><li>理解裸机程序设计模式</li><li>了解多任务系统中程序设计的不同</li></ul><h2 id="_2-1-裸机程序设计模式" tabindex="-1"><a class="header-anchor" href="#_2-1-裸机程序设计模式" aria-hidden="true">#</a> 2.1 裸机程序设计模式</h2><p>裸机程序的设计模式可以分为：轮询、前后台、定时器驱动、基于状态机。前面三种方法都无法解决一个问题：假设有A、B两个都很耗时的函数，无法降低它们相互之间的影响。第4种方法可以解决这个问题，但是实践起来有难度。</p><p>假设一位职场妈妈需要同时解决2个问题：给小孩喂饭、回复工作信息，场景如图所示，后面将会演示各类模式下如何写程序：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-2/image1.png" alt=""></p><h3 id="_2-1-1-轮询模式" tabindex="-1"><a class="header-anchor" href="#_2-1-1-轮询模式" aria-hidden="true">#</a> 2.1.1 轮询模式</h3><p>示例代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">// 经典单片机程序: 轮询</span>
<span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        喂一口饭<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        回一个信息<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在main函数中是一个while循环，里面依次调用2个函数，这两个函数相互之间有影响：如果“喂一口饭”太花时间，就会导致迟迟无法“回一个信息”；如果“回一个信息”太花时间，就会导致迟迟无法“喂下一口饭”。</p><p>使用轮询模式编写程序看起来很简单，但是要求while循环里调用到的函数要执行得非常快，在复杂场景里反而增加了编程难度。</p><h3 id="_2-1-1-前后台" tabindex="-1"><a class="header-anchor" href="#_2-1-1-前后台" aria-hidden="true">#</a> 2.1.1 前后台</h3><p>所谓“前后台”就是使用中断程序。假设收到同事发来的信息时，电脑会发出“滴”的一声，这时候妈妈才需要去回复信息。示例程序如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">// 前后台程序</span>
<span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token comment">// 后台程序</span>
        喂一口饭<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// 前台程序</span>
<span class="token keyword">void</span> 滴_中断<span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    回一个信息<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>main函数里while循环里的代码是后台程序，平时都是while循环在运行；</li><li>当同事发来信息，电脑发出“滴”的一声，触发了中断。妈妈暂停喂饭，去执行“滴_中断”给同事回复信息；</li></ul><p>在这个场景里，给同事回复信息非常及时：即使正在喂饭也会暂停下来去回复信息。“喂一口饭”无法影响到“回一个信息”。但是，如果“回一个信息”太花时间，就会导致 “喂一口饭”迟迟无法执行。</p><p>继续改进，假设小孩吞下饭菜后会发出“啊”的一声，妈妈听到后才会喂下一口饭。喂饭、回复信息都是使用中断函数来处理。示例程序如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">// 前后台程序</span>
<span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token comment">// 后台程序</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// 前台程序</span>
<span class="token keyword">void</span> 滴_中断<span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    回一个信息<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>

<span class="token comment">// 前台程序</span>
<span class="token keyword">void</span> 啊_中断<span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    喂一口饭<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>main函数中的while循环是空的，程序的运行靠中断来驱使。如果电脑声音“滴”、小孩声音“啊”不会同时、相近发出，那么“回一个信息”、“喂一口饭”相互之间没有影响。在不能满足这个前提的情况下，比如“滴”、“啊”同时响起，先“回一个信息”时就会耽误“喂一口饭”，这种场景下程序遭遇到了轮询模式的缺点：函数相互之间有影响。</p><h3 id="_2-1-2-定时器驱动" tabindex="-1"><a class="header-anchor" href="#_2-1-2-定时器驱动" aria-hidden="true">#</a> 2.1.2 定时器驱动</h3><p>定时器驱动模式，是前后台模式的一种，可以按照不用的频率执行各种函数。比如需要每2分钟给小孩喂一口饭，需要每5分钟给同事回复信息。那么就可以启动一个定时器，让它每1分钟产生一次中断，让中断函数在合适的时间调用对应函数。示例代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">// 前后台程序: 定时器驱动</span>
<span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token comment">// 后台程序</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// 前台程序: 每1分钟触发一次中断</span>
<span class="token keyword">void</span> 定时器_中断<span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">static</span> <span class="token keyword">int</span> cnt <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
    cnt<span class="token operator">++</span><span class="token punctuation">;</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>cnt <span class="token operator">%</span> <span class="token number">2</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        喂一口饭<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">else</span> <span class="token keyword">if</span> <span class="token punctuation">(</span>cnt <span class="token operator">%</span> <span class="token number">5</span> <span class="token operator">==</span> <span class="token number">0</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        回一个信息<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>main函数中的while循环是空的，程序的运行靠定时器中断来驱使。</li><li>定时器中断每1分钟发生一次，在中断函数里让cnt变量累加（代码第14行）。</li><li>第15行：进行求模运算，如果对2取模为0，就“喂一口饭”。这相当于每发生2次中断就“喂一口饭”。</li><li>第19行：进行求模运算，如果对5取模为0，就“回一个信息”。这相当于每发生5次中断就“回一个信息”。</li></ul><p>这种模式适合调用周期性的函数，并且每一个函数执行的时间不能超过一个定时器周期。如果“喂一口饭”很花时间，比如长达10分钟，那么就会耽误“回一个信息”；反过来也是一样的，如果“回一个信息”很花时间也会影响到“喂一口饭”；这种场景下程序遭遇到了轮询模式的缺点：函数相互之间有影响。</p><h3 id="_2-1-3-基于状态机" tabindex="-1"><a class="header-anchor" href="#_2-1-3-基于状态机" aria-hidden="true">#</a> 2.1.3 基于状态机</h3><p>当“喂一口饭”、“回一个信息”都需要花很长的时间，无论使用前面的哪种设计模式，都会退化到轮询模式的缺点：函数相互之间有影响。可以使用状态机来解决这个缺点，示例代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">// 状态机</span>
<span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        喂一口饭<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
        回一个信息<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在main函数里，还是使用轮询模式依次调用2个函数。</p><p>关键在于这2个函数的内部实现：使用状态机，每次只执行一个状态的代码，减少每次执行的时间，代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> 喂一口饭<span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">static</span> <span class="token keyword">int</span> state <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
    <span class="token keyword">switch</span> <span class="token punctuation">(</span>state<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token keyword">case</span> <span class="token number">0</span><span class="token operator">:</span>
        <span class="token punctuation">{</span>
            <span class="token comment">/* 舀饭 */</span>
            <span class="token comment">/* 进入下一个状态 */</span>
            state<span class="token operator">++</span><span class="token punctuation">;</span>
            <span class="token keyword">break</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">case</span> <span class="token number">1</span><span class="token operator">:</span>
        <span class="token punctuation">{</span>
            <span class="token comment">/* 喂饭 */</span>
            <span class="token comment">/* 进入下一个状态 */</span>
            state<span class="token operator">++</span><span class="token punctuation">;</span>
            <span class="token keyword">break</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">case</span> <span class="token number">2</span><span class="token operator">:</span>
        <span class="token punctuation">{</span>
            <span class="token comment">/* 舀菜 */</span>
            <span class="token comment">/* 进入下一个状态 */</span>
            state<span class="token operator">++</span><span class="token punctuation">;</span>
            <span class="token keyword">break</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">case</span> <span class="token number">3</span><span class="token operator">:</span>
        <span class="token punctuation">{</span>
            <span class="token comment">/* 喂菜 */</span>
            <span class="token comment">/* 恢复到初始状态 */</span>
            state <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
            <span class="token keyword">break</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">void</span> 回一个信息<span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">static</span> <span class="token keyword">int</span> state <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>

    <span class="token keyword">switch</span> <span class="token punctuation">(</span>state<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token keyword">case</span> <span class="token number">0</span><span class="token operator">:</span>
        <span class="token punctuation">{</span>
            <span class="token comment">/* 查看信息 */</span>
            <span class="token comment">/* 进入下一个状态 */</span>
            state<span class="token operator">++</span><span class="token punctuation">;</span>
            <span class="token keyword">break</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">case</span> <span class="token number">1</span><span class="token operator">:</span>
        <span class="token punctuation">{</span>
            <span class="token comment">/* 打字 */</span>
            <span class="token comment">/* 进入下一个状态 */</span>
            state<span class="token operator">++</span><span class="token punctuation">;</span>
            <span class="token keyword">break</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
        <span class="token keyword">case</span> <span class="token number">2</span><span class="token operator">:</span>
        <span class="token punctuation">{</span>
            <span class="token comment">/* 发送 */</span>
            <span class="token comment">/* 恢复到初始状态 */</span>
            state <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
            <span class="token keyword">break</span><span class="token punctuation">;</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以“喂一口饭”为例，函数内部拆分为4个状态：舀饭、喂饭、舀菜、喂菜。每次执行“喂一口饭”函数时，都只会执行其中的某一状态对应的代码。以前执行一次“喂一口饭”函数可能需要4秒钟，现在可能只需要1秒钟，就降低了对后面“回一个信息”的影响。</p><p>同样的，“回一个信息”函数内部也被拆分为3个状态：查看信息、打字、发送。每次执行这个函数时，都只是执行其中一小部分代码，降低了对“喂一口饭”的影响。</p><p>使用状态机模式，可以解决裸机程序的难题：假设有A、B两个都很耗时的函数，怎样降低它们相互之间的影响。但是很多场景里，函数A、B并不容易拆分为多个状态，并且这些状态执行的时间并不好控制。所以这并不是最优的解决方法，需要使用多任务系统。</p><h2 id="_2-2-多任务系统" tabindex="-1"><a class="header-anchor" href="#_2-2-多任务系统" aria-hidden="true">#</a> 2.2 多任务系统</h2><h3 id="_2-2-1-多任务模式" tabindex="-1"><a class="header-anchor" href="#_2-2-1-多任务模式" aria-hidden="true">#</a> 2.2.1 多任务模式</h3><p>对于裸机程序，无论使用哪种模式进行精心的设计，在最差的情况下都无法解决这个问题：假设有A、B两个都很耗时的函数，无法降低它们相互之间的影响。使用状态机模式时，如果函数拆分得不好，也会导致这个问题。本质原因是：函数是轮流执行的。假设“喂一口饭”需要t1~t5这5段时间，“回一个信息需要”ta~te这5段时间，轮流执行时：先执行完t1~t5，再执行ta~te，如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-2/image2.png" alt=""></p><p>对于职场妈妈，她怎么解决这个问题呢？她是一个眼明手快的人，可以一心多用，她这样做：</p><ul><li>左手拿勺子，给小孩喂饭</li><li>右手敲键盘，回复同事</li><li>两不耽误，小孩“以为”妈妈在专心喂饭，同事“以为”她在专心聊天</li><li>但是脑子只有一个啊，虽然说“一心多用”，但是谁能同时思考两件事？</li><li>只是她反应快，上一秒钟在考虑夹哪个菜给小孩，下一秒钟考虑给同事回复什么信息</li><li>本质是：交叉执行，t1~t5和ta~te交叉执行，如下图所示：</li></ul><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-2/image3.png" alt=""></p><p>基于多任务系统编写程序时，示例代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">// RTOS程序</span>
喂饭任务<span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        喂一口饭<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

回信息任务<span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        回一个信息<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">// 创建2个任务</span>
    <span class="token function">create_task</span><span class="token punctuation">(</span>喂饭任务<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">create_task</span><span class="token punctuation">(</span>回信息任务<span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token comment">// 启动调度器</span>
    <span class="token function">start_scheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>第21、22行，创建2个任务；</li><li>第25行，启动调度器；</li><li>之后，这2个任务就会交叉执行了；</li></ul><p>基于多任务系统编写程序时，反而更简单了：</p><ol><li>上面第2~8行是“喂饭任务”的代码；</li><li>第10~16行是“回信息任务”的代码，编写它们时甚至都不需要考虑它和其他函数的相互影响。就好像有2个单板：一个只运行“喂饭任务”这个函数、另一个只运行“回信息任务”这个函数。</li></ol><p>多任务系统会依次给这些任务分配时间：你执行一会，我执行一会，如此循环。只要切换的间隔足够短，用户会“感觉这些任务在同时运行”。如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-2/image4.png" alt=""></p><h3 id="_2-2-2-互斥操作" tabindex="-1"><a class="header-anchor" href="#_2-2-2-互斥操作" aria-hidden="true">#</a> 2.2.2 互斥操作</h3><p>多任务系统中，多个任务可能会“同时”访问某些资源，需要增加保护措施以防止混乱。比如任务A、B都要使用串口，能否使用一个全局变量让它们独占地、互斥地使用串口？示例代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">// RTOS程序</span>
<span class="token keyword">int</span> g_canuse <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>

<span class="token keyword">void</span> <span class="token function">uart_print</span><span class="token punctuation">(</span><span class="token keyword">char</span> <span class="token operator">*</span>str<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>g_canuse<span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        g_canuse <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
        <span class="token function">printf</span><span class="token punctuation">(</span>str<span class="token punctuation">)</span><span class="token punctuation">;</span>
        g_canuse <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token function">task_A</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token function">uart_print</span><span class="token punctuation">(</span><span class="token string">&quot;0123456789\\n&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token function">task_B</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token function">uart_print</span><span class="token punctuation">(</span><span class="token string">&quot;abcdefghij&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">// 创建2个任务</span>
    <span class="token function">create_task</span><span class="token punctuation">(</span>task_A<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">create_task</span><span class="token punctuation">(</span>task_B<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// 启动调度器</span>
    <span class="token function">start_scheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>程序的意图是：task_A打印“0123456789”，task_B打印“abcdefghij”。在task_A或task_B打印的过程中，另一个任务不能打印，以避免数字、字母混杂在一起，比如避免打印这样的字符：“012abc”。</p><p>第6行使用全局变量g_canuse实现互斥打印，它等于1时表示“可以打印”。在进行实际打印之前，先把g_canuse设置为0，目的是防止别的任务也来打印。</p><p>这个程序大部分时间是没问题的，但是只要它运行的时间足够长，就会出现数字、字母混杂的情况。下图把uart_print函数标记为①~④个步骤：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">uart_print</span><span class="token punctuation">(</span><span class="token keyword">char</span> <span class="token operator">*</span>str<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">if</span><span class="token punctuation">(</span> g_canuse <span class="token punctuation">)</span>     ①
    <span class="token punctuation">{</span>
        g_canuse <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>  ②
        <span class="token function">printf</span><span class="token punctuation">(</span>str<span class="token punctuation">)</span><span class="token punctuation">;</span>   ③
        g_canuse <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>  ④
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果task_A执行完①，进入if语句里面执行②之前被切换为task_B：在这一瞬间，g_canuse还是1。</p><p>task_B执行①时也会成功进入if语句，假设它执行到③，在printf打印完部分字符比如“abc”后又再次被切换为task_A。</p><p>task_A继续从上次被暂停的地方继续执行，即从②那里继续执行，成功打印出“0123456789”。这时在串口上可以看到打印的结果为：“abc0123456789”。</p><p>是不是“①判断”、“②清零”间隔太远了，uart_print函数改进成如下的代码呢？</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">uart_print</span><span class="token punctuation">(</span><span class="token keyword">char</span> <span class="token operator">*</span>str<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    g_canuse<span class="token operator">--</span><span class="token punctuation">;</span>            ① 减一
    <span class="token keyword">if</span><span class="token punctuation">(</span> g_canuse <span class="token operator">==</span> <span class="token number">0</span> <span class="token punctuation">)</span>    ② 判断
    <span class="token punctuation">{</span>
        <span class="token function">printf</span><span class="token punctuation">(</span>str<span class="token punctuation">)</span><span class="token punctuation">;</span>     ③ 打印
    <span class="token punctuation">}</span>
    g_canuse<span class="token operator">++</span><span class="token punctuation">;</span>          ④ 加一
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>即使改进为上述代码，仍然可能产生两个任务同时使用串口的情况。因为“①减一”这个操作会分为3个步骤：a.从内存读取变量的值放入寄存器里，b.修改寄存器的值让它减一，c.把寄存器的值写到内存上的变量上去。</p><p>如果task_A执行完步骤a、b，还没来得及把新值写到内存的变量里，就被切换为task_B：在这一瞬间，g_canuse还是1。</p><p>task_B执行①②时也会成功进入if语句，假设它执行到③，在printf打印完部分字符比如“abc”后又再次被切换为task_A。</p><p>task_A继续从上次被暂停的地方继续执行，即从步骤c那里继续执行，成功打印出“0123456789”。这时在串口上可以看到打印的结果为：“abc0123456789”。</p><p>从上面的例子可以看到，基于多任务系统编写程序时，访问公用的资源的时候要考虑“互斥操作”。任何一种多任务系统都会提供相应的函数。</p><h3 id="_2-2-3-同步操作" tabindex="-1"><a class="header-anchor" href="#_2-2-3-同步操作" aria-hidden="true">#</a> 2.2.3 同步操作</h3><p>如果任务之间有依赖关系，比如任务A执行了某个操作之后，需要任务B进行后续的处理。如果代码如下编写的话，任务B大部分时间做的都是无用功。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">// RTOS程序</span>
<span class="token keyword">int</span> flag <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>

<span class="token keyword">void</span> <span class="token function">task_A</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token comment">// 做某些复杂的事情</span>
        <span class="token comment">// 完成后把flag设置为1</span>
        flag <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">void</span> <span class="token function">task_B</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token keyword">if</span> <span class="token punctuation">(</span>flag<span class="token punctuation">)</span>
        <span class="token punctuation">{</span>
            <span class="token comment">// 做后续的操作</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">// 创建2个任务</span>
    <span class="token function">create_task</span><span class="token punctuation">(</span>task_A<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">create_task</span><span class="token punctuation">(</span>task_B<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// 启动调度器</span>
    <span class="token function">start_scheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上述代码中，在任务A没有设置flag为1之前，任务B的代码都只是去判断flag。而任务A、B的函数是依次轮流运行的，假设系统运行了100秒，其中任务A总共运行了50秒，任务B总共运行了50秒，任务A在努力处理复杂的运算，任务B仅仅是浪费CPU资源。</p><p>如果可以让任务B阻塞，即让任务B不参与调度，那么任务A就可以独占CPU资源加快处理复杂的事情。当任务A处理完事情后，再唤醒任务B。示例代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">// RTOS程序</span>
<span class="token keyword">void</span> <span class="token function">task_A</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token comment">// 做某些复杂的事情</span>
        <span class="token comment">// 释放信号量,会唤醒任务B;</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">void</span> <span class="token function">task_B</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token comment">// 等待信号量, 会让任务B阻塞</span>
        <span class="token comment">// 做后续的操作</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token keyword">void</span> <span class="token function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">// 创建2个任务</span>
    <span class="token function">create_task</span><span class="token punctuation">(</span>task_A<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token function">create_task</span><span class="token punctuation">(</span>task_B<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">// 启动调度器</span>
    <span class="token function">start_scheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>第15行：任务B运行时，等待信号量，不成功时就会阻塞，不在参与任务调度。</li><li>第7行：任务A处理完复杂的事情后，释放信号量会唤醒任务B。</li><li>第16行：任务B被唤醒后，从这里继续运行。</li></ul><p>在这个过程中，任务A处理复杂事情的时候可以独占CPU资源，加快处理速度。</p>`,73),i=[t];function c(l,o){return s(),a("div",null,i)}const d=n(p,[["render",c],["__file","chapter2.html.vue"]]);export{d as default};
