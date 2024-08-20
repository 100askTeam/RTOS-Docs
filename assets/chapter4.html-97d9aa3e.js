import{_ as i,r as a,o as r,c as d,a as n,b as t,d as e,w as o,e as p}from"./app-a3aa5aa8.js";const c={},u=p(`<h1 id="第四章-同步互斥与通信" tabindex="-1"><a class="header-anchor" href="#第四章-同步互斥与通信" aria-hidden="true">#</a> 第四章 同步互斥与通信</h1><p>本章是概述性的内容。可以把多任务系统当做一个团队，里面的每一个任务就相当于团队里的一个人。团队成员之间要协调工作进度(同步)、争用会议室(互斥)、沟通(通信)。多任务系统中所涉及的概念，都可以在现实生活中找到例子。</p><p>各类RTOS都会涉及这些概念：任务通知(task notification)、队列(queue)、事件组(event group)、信号量(semaphoe)、互斥量(mutex)等。我们先站在更高角度来讲解这些概念。</p><h2 id="_4-1-同步与互斥的概念" tabindex="-1"><a class="header-anchor" href="#_4-1-同步与互斥的概念" aria-hidden="true">#</a> 4.1 同步与互斥的概念</h2><p>一句话理解同步与互斥：我等你用完厕所，我再用厕所。 什么叫同步？就是：哎哎哎，我正在用厕所，你等会。 什么叫互斥？就是：哎哎哎，我正在用厕所，你不能进来。 同步与互斥经常放在一起讲，是因为它们之的关系很大，“互斥”操作可以使用“同步”来实现。我“等”你用完厕所，我再用厕所。这不就是用“同步”来实现“互斥”吗？</p><p>再举一个例子。在团队活动里，同事A先写完报表，经理B才能拿去向领导汇报。经理B必须等同事A完成报表，AB之间有依赖，B必须放慢脚步，被称为同步。在团队活动中，同事A已经使用会议室了，经理B也想使用，即使经理B是领导，他也得等着，这就叫互斥。经理B跟同事A说：你用完会议室就提醒我。这就是使用&quot;同步&quot;来实现&quot;互斥&quot;。</p><p>有时候看代码更容易理解，伪代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token number">01</span> <span class="token keyword">void</span>  抢厕所<span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span>
<span class="token number">02</span> <span class="token punctuation">{</span>
<span class="token number">03</span>    <span class="token keyword">if</span> <span class="token punctuation">(</span>有人在用<span class="token punctuation">)</span> 我眯一会<span class="token punctuation">;</span>
<span class="token number">04</span>    用厕所<span class="token punctuation">;</span>
<span class="token number">05</span>    喂，醒醒，有人要用厕所吗<span class="token punctuation">;</span>
<span class="token number">06</span> <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>假设有A、B两人早起抢厕所，A先行一步占用了；B慢了一步，于是就眯一会；当A用完后叫醒B，B也就愉快地上厕所了。 在这个过程中，A、B是互斥地访问“厕所”，“厕所”被称之为临界资源。我们使用了“休眠-唤醒”的同步机制实现了“临界资源”的“互斥访问”。</p><p>同一时间只能有一个人使用的资源，被称为临界资源。比如任务A、B都要使用串口来打印，串口就是临界资源。如果A、B同时使用串口，那么打印出来的信息就是A、B混杂，无法分辨。所以使用串口时，应该是这样：A用完，B再用；B用完，A再用。</p><h2 id="_4-2-同步与互斥并不简单" tabindex="-1"><a class="header-anchor" href="#_4-2-同步与互斥并不简单" aria-hidden="true">#</a> 4.2 同步与互斥并不简单</h2><h2 id="_4-3-各类方法的对比" tabindex="-1"><a class="header-anchor" href="#_4-3-各类方法的对比" aria-hidden="true">#</a> 4.3 各类方法的对比</h2><p>能实现同步、互斥的内核方法有：任务通知(task notification)、队列(queue)、事件组(event group)、信号量(semaphoe)、互斥量(mutex)。</p><p>它们都有类似的操作方法：获取/释放、阻塞/唤醒、超时。比如：</p><ul><li>A获取资源，用完后A释放资源</li><li>A获取不到资源则阻塞，B释放资源并把A唤醒</li><li>A获取不到资源则阻塞，并定个闹钟；A要么超时返回，要么在这段时间内因为B释放资源而被唤醒。</li></ul><p>这些内核对象五花八门，记不住怎么办？我也记不住，通过对比的方法来区分它们。</p><ul><li>能否传信息？只能传递状态？</li><li>为众生？只为你？</li><li>我生产，你们消费？</li><li>我上锁，只能由我开锁</li></ul><table><thead><tr><th>内核对象</th><th>生产者</th><th>消费者</th><th>数据/状态</th><th>说明</th></tr></thead><tbody><tr><td>队列</td><td>ALL</td><td>ALL</td><td>数据：若干个数据<br>谁都可以往队列里扔数据，<br>谁都可以从队列里读数据</td><td>用来传递数据，<br>发送者、接收者无限制，<br>一个数据只能唤醒一个接收者</td></tr><tr><td>事件组</td><td>ALL</td><td>ALL</td><td>多个位：或、与<br>谁都可以设置(生产)多个位，<br>谁都可以等待某个位、若干个位</td><td>用来传递事件，<br>可以是N个事件，<br>发送者、接受者无限制，<br>可以唤醒多个接收者：像广播</td></tr><tr><td>信号量</td><td>ALL</td><td>ALL</td><td>数量：0~n<br>谁都可以增加一个数量，<br>谁都可消耗一个数量</td><td>用来维持资源的个数，<br>生产者、消费者无限制，<br>1个资源只能唤醒1个接收者</td></tr><tr><td>任务通知</td><td>ALL</td><td>只有我</td><td>数据、状态都可以传输，<br>使用任务通知时，<br>必须指定接受者</td><td>N对1的关系：<br>发送者无限制，<br>接收者只能是这个任务</td></tr><tr><td>互斥量</td><td>只能A开锁</td><td>A上锁</td><td>位：0、1<br>我上锁：1变为0，<br>只能由我开锁：0变为1</td><td>就像一个空厕所，<br>谁使用谁上锁，<br>也只能由他开锁</td></tr></tbody></table><p>使用图形对比如下：</p><ul><li>队列： <ul><li>里面可以放任意数据，可以放多个数据</li><li>任务、ISR都可以放入数据；任务、ISR都可以从中读出数据</li></ul></li><li>事件组： <ul><li>一个事件用一bit表示，1表示事件发生了，0表示事件没发生</li><li>可以用来表示事件、事件的组合发生了，不能传递数据</li><li>有广播效果：事件或事件的组合发生了，等待它的多个任务都会被唤醒</li></ul></li><li>信号量： <ul><li>核心是&quot;计数值&quot;</li><li>任务、ISR释放信号量时让计数值加1</li><li>任务、ISR获得信号量时，让计数值减1</li></ul></li><li>任务通知： <ul><li>核心是任务的TCB里的数值</li><li>会被覆盖</li><li>发通知给谁？必须指定接收任务</li><li>只能由接收任务本身获取该通知</li></ul></li><li>互斥量： <ul><li>数值只有0或1</li><li>谁获得互斥量，就必须由谁释放同一个互斥量</li></ul></li></ul><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-4/01_compare_sync_objects.png" alt="image-20210802182212569"></p><h2 id="技术答疑交流" tabindex="-1"><a class="header-anchor" href="#技术答疑交流" aria-hidden="true">#</a> 技术答疑交流</h2>`,22),h={href:"https://forums.100ask.net",target:"_blank",rel:"noopener noreferrer"},b=n("hr",null,null,-1);function m(_,k){const s=a("ExternalLinkIcon"),l=a("center");return r(),d("div",null,[u,n("p",null,[t("在学习中遇到任何问题，请前往我们的技术交流社区留言： "),n("a",h,[t("https://forums.100ask.net"),e(s)])]),b,e(l,null,{default:o(()=>[t("本章完")]),_:1})])}const v=i(c,[["render",m],["__file","chapter4.html.vue"]]);export{v as default};