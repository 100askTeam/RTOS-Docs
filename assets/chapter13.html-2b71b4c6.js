import{_ as n,o as a,c as s,e}from"./app-a3aa5aa8.js";const i={},t=e(`<h1 id="第13章-互斥量-mutex" tabindex="-1"><a class="header-anchor" href="#第13章-互斥量-mutex" aria-hidden="true">#</a> 第13章 互斥量(mutex)</h1><p>怎么独享厕所？自己开门上锁，完事了自己开锁。</p><p>你当然可以进去后，让别人帮你把门：但是，命运就掌握在别人手上了。</p><p>使用队列、信号量，都可以实现互斥访问，以信号量为例：</p><ul><li>信号量初始值为1</li><li>任务A想上厕所，&quot;take&quot;信号量成功，它进入厕所</li><li>任务B也想上厕所，&quot;take&quot;信号量不成功，等待</li><li>任务A用完厕所，&quot;give&quot;信号量；轮到任务B使用</li></ul><p>这需要有2个前提：</p><ul><li>任务B很老实，不撬门(一开始不&quot;give&quot;信号量)</li><li>没有坏人：别的任务不会&quot;give&quot;信号量</li></ul><p>可以看到，使用信号量确实也可以实现互斥访问，但是不完美。</p><p>使用互斥量可以解决这个问题，互斥量的名字取得很好：</p><ul><li>量：值为0、1</li><li>互斥：用来实现互斥访问</li></ul><p>它的核心在于：谁上锁，就只能由谁开锁。</p><p>很奇怪的是，FreeRTOS的互斥锁，并没有在代码上实现这点：</p><ul><li>即使任务A获得了互斥锁，任务B竟然也可以释放互斥锁。</li><li>谁上锁、谁释放：只是约定。</li></ul><p>本章涉及如下内容：</p><ul><li>为什么要实现互斥操作</li><li>怎么使用互斥量</li><li>互斥量导致的优先级反转、优先级继承</li></ul><h2 id="_13-1-互斥量的使用场合" tabindex="-1"><a class="header-anchor" href="#_13-1-互斥量的使用场合" aria-hidden="true">#</a> 13.1 互斥量的使用场合</h2><p>在多任务系统中，任务A正在使用某个资源，还没用完的情况下任务B也来使用的话，就可能导致问题。</p><p>比如对于串口，任务A正使用它来打印，在打印过程中任务B也来打印，客户看到的结果就是A、B的信息混杂在一起。</p><p>这种现象很常见：</p><ul><li>访问外设：刚举的串口例子</li><li>读、修改、写操作导致的问题</li></ul><p>对于同一个变量，比如int a，如果有两个任务同时写它就有可能导致问题。 对于变量的修改，C代码只有一条语句，比如：a=a+8;，它的内部实现分为3步：读出原值、修改、写入。</p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-13/image1.png" style="zoom:67%;"><p>我们想让任务A、B都执行add_a函数，a的最终结果是1+8+8=17。</p><p>假设任务A运行完代码①，在执行代码②之前被任务B抢占了：现在任务A的R0等于1。</p><p>任务B执行完add_a函数，a等于9。</p><p>任务A继续运行，在代码②处R0仍然是被抢占前的数值1，执行完②③的代码，a等于9，这跟预期的17不符合。</p><ul><li>对变量的非原子化访问</li></ul><p>修改变量、设置结构体、在16位的机器上写32位的变量，这些操作都是非原子的。也就是它们的操作过程都可能被打断，如果被打断的过程有其他任务来操作这些变量，就可能导致冲突。</p><ul><li>函数重入</li></ul><p>&quot;可重入的函数&quot;是指：多个任务同时调用它、任务和中断同时调用它，函数的运行也是安全的。可重入的函数也被称为&quot;线程安全&quot;(thread safe)。</p><p>每个任务都维持自己的栈、自己的CPU寄存器，如果一个函数只使用局部变量，那么它就是线程安全的。</p><p>函数中一旦使用了全局变量、静态变量、其他外设，它就不是&quot;可重入的&quot;，如果该函数正在被调用，就必须阻止其他任务、中断再次调用它。</p><p>上述问题的解决方法是：任务A访问这些全局变量、函数代码时，独占它，就是上个锁。这些全局变量、函数代码必须被独占地使用，它们被称为临界资源。</p><p>互斥量也被称为互斥锁，使用过程如下：</p><ul><li>互斥量初始值为1</li><li>任务A想访问临界资源，先获得并占有互斥量，然后开始访问</li><li>任务B也想访问临界资源，也要先获得互斥量：被别人占有了，于是阻塞</li><li>任务A使用完毕，释放互斥量；任务B被唤醒、得到并占有互斥量，然后开始访问临界资源</li><li>任务B使用完毕，释放互斥量</li></ul><p>正常来说：在任务A占有互斥量的过程中，任务B、任务C等等，都无法释放互斥量。 但是FreeRTOS未实现这点：任务A占有互斥量的情况下，任务B也可释放互斥量。</p><h2 id="_13-2-互斥量函数" tabindex="-1"><a class="header-anchor" href="#_13-2-互斥量函数" aria-hidden="true">#</a> 13.2 互斥量函数</h2><h3 id="_13-2-1-创建" tabindex="-1"><a class="header-anchor" href="#_13-2-1-创建" aria-hidden="true">#</a> 13.2.1 创建</h3><p>互斥量是一种特殊的二进制信号量。</p><p>使用互斥量时，先创建、然后去获得、释放它。使用句柄来表示一个互斥量。</p><p>创建互斥量的函数有2种：动态分配内存，静态分配内存，函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 创建一个互斥量，返回它的句柄。
 * 此函数内部会分配互斥量结构体 
 * 返回值: 返回句柄，非NULL表示成功
 */</span>
SemaphoreHandle_t <span class="token function">xSemaphoreCreateMutex</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 创建一个互斥量，返回它的句柄。
 * 此函数无需动态分配内存，所以需要先有一个StaticSemaphore_t结构体，并传入它的指针
 * 返回值: 返回句柄，非NULL表示成功
 */</span>
SemaphoreHandle_t <span class="token function">xSemaphoreCreateMutexStatic</span><span class="token punctuation">(</span> StaticSemaphore_t <span class="token operator">*</span>pxMutexBuffer <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>要想使用互斥量，需要在配置文件FreeRTOSConfig.h中定义：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">configUSE_MUTEXES</span> <span class="token expression"><span class="token number">1</span></span></span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="_13-2-2-其他函数" tabindex="-1"><a class="header-anchor" href="#_13-2-2-其他函数" aria-hidden="true">#</a> 13.2.2 其他函数</h3><p>要注意的是，互斥量不能在ISR中使用。</p><p>各类操作函数，比如删除、give/take，跟一般是信号量是一样的。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
 * xSemaphore: 信号量句柄，你要删除哪个信号量, 互斥量也是一种信号量
 */</span>
<span class="token keyword">void</span> <span class="token function">vSemaphoreDelete</span><span class="token punctuation">(</span> SemaphoreHandle_t xSemaphore <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 释放 */</span>
BaseType_t <span class="token function">xSemaphoreGive</span><span class="token punctuation">(</span> SemaphoreHandle_t xSemaphore <span class="token punctuation">)</span><span class="token punctuation">;</span>


<span class="token comment">/* 获得 */</span>
BaseType_t <span class="token function">xSemaphoreTake</span><span class="token punctuation">(</span>
                   SemaphoreHandle_t xSemaphore<span class="token punctuation">,</span>
                   TickType_t xTicksToWait
               <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_13-3-示例-优先级继承" tabindex="-1"><a class="header-anchor" href="#_13-3-示例-优先级继承" aria-hidden="true">#</a> 13.3 示例: 优先级继承</h2><p>本节代码为：22_mutex_priority_inversion，主要看nwatch\\game2.c。</p><p>12章12.5示例的问题在于，car1低优先级任务获得了锁，但是它优先级太低而无法运行。</p><p>如果能提升car1任务的优先级，让它能尽快运行、释放锁，&quot;优先级反转&quot;的问题不就解决了吗？</p><p>把car1任务的优先级提升到什么水平？car3也想获得同一个互斥锁，不成功而阻塞时，它会把car1的优先级提升得跟car3一样。</p><p>这就是优先级继承：</p><ul><li>假设持有互斥锁的是任务A，如果更高优先级的任务B也尝试获得这个锁</li><li>任务B说：你既然持有宝剑，又不给我，那就继承我的愿望吧</li><li>于是任务A就继承了任务B的优先级</li><li>这就叫：优先级继承</li><li>等任务A释放互斥锁时，它就恢复为原来的优先级</li><li>互斥锁内部就实现了优先级的提升、恢复</li></ul><p>在22_mutex_priority_inversion里，创建的是互斥量，代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token number">259</span> <span class="token keyword">void</span> <span class="token function">car_game</span><span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span>

<span class="token number">260</span> <span class="token punctuation">{</span>

<span class="token number">261</span>	<span class="token keyword">int</span> x<span class="token punctuation">;</span>

<span class="token number">262</span>	<span class="token keyword">int</span> i<span class="token punctuation">,</span> j<span class="token punctuation">;</span>

<span class="token number">263</span>	g_framebuffer <span class="token operator">=</span> <span class="token function">LCD_GetFrameBuffer</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>g_xres<span class="token punctuation">,</span> <span class="token operator">&amp;</span>g_yres<span class="token punctuation">,</span> <span class="token operator">&amp;</span>g_bpp<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">264</span>	<span class="token function">draw_init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">265</span>	<span class="token function">draw_end</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">267</span>	

<span class="token number">268</span>	<span class="token comment">//g_xSemTicks = xSemaphoreCreateCounting(1, 1);</span>

<span class="token number">269</span>	g_xSemTicks <span class="token operator">=</span> <span class="token function">xSemaphoreCreateMutex</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>把第268行打开、第269行去掉，就会有优先级反转的问题。</p><p>把第268行去掉、第269行打开，就解决了优先级反转的问题。</p><p>22_mutex_priority_inversion的实验现象为：car1先运行一会；然后car2运行一会；接着car3任务启动，但是它无法获得互斥量而阻塞，并且提升了car1的优先级；于是：car1、car2交替运行（虽然car1的优先级高于car2，但是car1会使用vTaskDelay阻塞，car2就有机会运行了）；当car1运行到终点，是否了互斥量，car3就可以运行了。</p><h2 id="_13-4-递归锁" tabindex="-1"><a class="header-anchor" href="#_13-4-递归锁" aria-hidden="true">#</a> 13.4 递归锁</h2><h3 id="_13-4-1-死锁的概念" tabindex="-1"><a class="header-anchor" href="#_13-4-1-死锁的概念" aria-hidden="true">#</a> 13.4.1 死锁的概念</h3><p>日常生活的死锁：我们只招有工作经验的人！我没有工作经验怎么办？那你就去找工作啊！</p><p>假设有2个互斥量M1、M2，2个任务A、B：</p><ul><li>A获得了互斥量M1</li><li>B获得了互斥量M2</li><li>A还要获得互斥量M2才能运行，结果A阻塞</li><li>B还要获得互斥量M1才能运行，结果B阻塞</li><li>A、B都阻塞，再无法释放它们持有的互斥量</li><li>死锁发生！</li></ul><h3 id="_13-4-2-自我死锁" tabindex="-1"><a class="header-anchor" href="#_13-4-2-自我死锁" aria-hidden="true">#</a> 13.4.2 自我死锁</h3><p>假设这样的场景：</p><ul><li>任务A获得了互斥锁M</li><li>它调用一个库函数</li><li>库函数要去获取同一个互斥锁M，于是它阻塞：任务A休眠，等待任务A来释放互斥锁！</li><li>死锁发生！</li></ul><h3 id="_13-4-3-函数" tabindex="-1"><a class="header-anchor" href="#_13-4-3-函数" aria-hidden="true">#</a> 13.4.3 函数</h3><p>怎么解决这类问题？可以使用递归锁(Recursive Mutexes)，它的特性如下：</p><ul><li>任务A获得递归锁M后，它还可以多次去获得这个锁</li><li>&quot;take&quot;了N次，要&quot;give&quot;N次，这个锁才会被释放</li></ul><p>递归锁的函数根一般互斥量的函数名不一样，参数类型一样，列表如下：</p><table><thead><tr><th></th><th><strong>递归锁</strong></th><th><strong>一般互斥量</strong></th></tr></thead><tbody><tr><td>创建</td><td>xSemaphoreCreateRecursiveMutex</td><td>xSemaphoreCreateMutex</td></tr><tr><td>获得</td><td>xSemaphoreTakeRecursive</td><td>xSemaphoreTake</td></tr><tr><td>释放</td><td>xSemaphoreGiveRecursive</td><td>xSemaphoreGive</td></tr></tbody></table><p>函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 创建一个递归锁，返回它的句柄。*

 * 此函数内部会分配互斥量结构体* 

 * 返回值: 返回句柄，非NULL表示成功*

 */</span>

SemaphoreHandle_t <span class="token function">xSemaphoreCreateRecursiveMutex</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token operator">*</span><span class="token operator">/</span> 释放 <span class="token operator">*</span><span class="token operator">/</span>

BaseType_t <span class="token function">xSemaphoreGiveRecursive</span><span class="token punctuation">(</span> SemaphoreHandle_t xSemaphore <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token operator">*</span><span class="token operator">/</span> 获得 <span class="token operator">*</span><span class="token operator">/</span>

BaseType_t <span class="token function">xSemaphoreTakeRecursive</span><span class="token punctuation">(</span>

         SemaphoreHandle_t xSemaphore<span class="token punctuation">,</span>

         TickType_t xTicksToWait

        <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_1-3-7-8-常见问题" tabindex="-1"><a class="header-anchor" href="#_1-3-7-8-常见问题" aria-hidden="true">#</a> 1.3 7.8 常见问题</h2><p>使用互斥量的两个任务是相同优先级时的注意事项。</p>`,77),p=[t];function l(c,o){return a(),s("div",null,p)}const d=n(i,[["render",l],["__file","chapter13.html.vue"]]);export{d as default};
