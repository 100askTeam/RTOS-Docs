import{_ as i,r as a,o as c,c as o,a as s,b as n,d as e,w as l,e as u}from"./app-a3aa5aa8.js";const r={},d=u(`<h1 id="第七章-互斥量-mutex" tabindex="-1"><a class="header-anchor" href="#第七章-互斥量-mutex" aria-hidden="true">#</a> 第七章 互斥量(mutex)</h1><p>怎么独享厕所？自己开门上锁，完事了自己开锁。</p><p>你当然可以进去后，让别人帮你把门：但是，命运就掌握在别人手上了。</p><p>使用队列、信号量，都可以实现互斥访问，以信号量为例：</p><ul><li>信号量初始值为1</li><li>任务A想上厕所，&quot;take&quot;信号量成功，它进入厕所</li><li>任务B也想上厕所，&quot;take&quot;信号量不成功，等待</li><li>任务A用完厕所，&quot;give&quot;信号量；轮到任务B使用</li></ul><p>这需要有2个前提：</p><ul><li>任务B很老实，不撬门(一开始不&quot;give&quot;信号量)</li><li>没有坏人：别的任务不会&quot;give&quot;信号量</li></ul><p>可以看到，使用信号量确实也可以实现互斥访问，但是不完美。</p><p>使用互斥量可以解决这个问题，互斥量的名字取得很好：</p><ul><li>量：值为0、1</li><li>互斥：用来实现互斥访问</li></ul><p>它的核心在于：谁上锁，就只能由谁开锁。</p><p>很奇怪的是，FreeRTOS的互斥锁，并没有在代码上实现这点：</p><ul><li>即使任务A获得了互斥锁，任务B竟然也可以释放互斥锁。</li><li>谁上锁、谁释放：只是约定。</li></ul><p>本章涉及如下内容：</p><ul><li>为什么要实现互斥操作</li><li>怎么使用互斥量</li><li>互斥量导致的优先级反转、优先级继承</li></ul><h2 id="_7-1-互斥量的使用场合" tabindex="-1"><a class="header-anchor" href="#_7-1-互斥量的使用场合" aria-hidden="true">#</a> 7.1 互斥量的使用场合</h2><p>在多任务系统中，任务A正在使用某个资源，还没用完的情况下任务B也来使用的话，就可能导致问题。</p><p>比如对于串口，任务A正使用它来打印，在打印过程中任务B也来打印，客户看到的结果就是A、B的信息混杂在一起。</p><p>这种现象很常见：</p><ul><li><p>访问外设：刚举的串口例子</p></li><li><p>读、修改、写操作导致的问题 对于同一个变量，比如<code>int a</code>，如果有两个任务同时写它就有可能导致问题。 对于变量的修改，C代码只有一条语句，比如：<code>a=a+8;</code>，它的内部实现分为3步：读出原值、修改、写入。 <img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-7/01_modify_val.png" alt="image-20210805160212640"></p><p>我们想让任务A、B都执行add_a函数，a的最终结果是<code>1+8+8=17</code>。 假设任务A运行完代码①，在执行代码②之前被任务B抢占了：现在任务A的R0等于1。 任务B执行完add_a函数，a等于9。 任务A继续运行，在代码②处R0仍然是被抢占前的数值1，执行完②③的代码，a等于9，这跟预期的17不符合。</p></li><li><p>对变量的非原子化访问 修改变量、设置结构体、在16位的机器上写32位的变量，这些操作都是非原子的。也就是它们的操作过程都可能被打断，如果被打断的过程有其他任务来操作这些变量，就可能导致冲突。</p></li><li><p>函数重入 &quot;可重入的函数&quot;是指：多个任务同时调用它、任务和中断同时调用它，函数的运行也是安全的。可重入的函数也被称为&quot;线程安全&quot;(thread safe)。 每个任务都维持自己的栈、自己的CPU寄存器，如果一个函数只使用局部变量，那么它就是线程安全的。 函数中一旦使用了全局变量、静态变量、其他外设，它就不是&quot;可重入的&quot;，如果改函数正在被调用，就必须阻止其他任务、中断再次调用它。</p></li></ul><p>上述问题的解决方法是：任务A访问这些全局变量、函数代码时，独占它，就是上个锁。这些全局变量、函数代码必须被独占地使用，它们被称为临界资源。</p><p>互斥量也被称为互斥锁，使用过程如下：</p><ul><li>互斥量初始值为1</li><li>任务A想访问临界资源，先获得并占有互斥量，然后开始访问</li><li>任务B也想访问临界资源，也要先获得互斥量：被别人占有了，于是阻塞</li><li>任务A使用完毕，释放互斥量；任务B被唤醒、得到并占有互斥量，然后开始访问临界资源</li><li>任务B使用完毕，释放互斥量</li></ul><p>正常来说：在任务A占有互斥量的过程中，任务B、任务C等等，都无法释放互斥量。</p><p>但是FreeRTOS未实现这点：任务A占有互斥量的情况下，任务B也可释放互斥量。</p><h2 id="_7-2-互斥量函数" tabindex="-1"><a class="header-anchor" href="#_7-2-互斥量函数" aria-hidden="true">#</a> 7.2 互斥量函数</h2><h3 id="_7-2-1-创建" tabindex="-1"><a class="header-anchor" href="#_7-2-1-创建" aria-hidden="true">#</a> 7.2.1 创建</h3><p>互斥量是一种特殊的二进制信号量。</p><p>使用互斥量时，先创建、然后去获得、释放它。使用句柄来表示一个互斥量。</p><p>创建互斥量的函数有2种：动态分配内存，静态分配内存，函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 创建一个互斥量，返回它的句柄。
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="_7-2-2-其他函数" tabindex="-1"><a class="header-anchor" href="#_7-2-2-其他函数" aria-hidden="true">#</a> 7.2.2 其他函数</h3><p>要注意的是，互斥量不能在ISR中使用。</p><p>各类操作函数，比如删除、give/take，跟一般是信号量是一样的。</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
 * xSemaphore: 信号量句柄，你要删除哪个信号量, 互斥量也是一种信号量
 */</span>
<span class="token keyword">void</span> <span class="token function">vSemaphoreDelete</span><span class="token punctuation">(</span> SemaphoreHandle_t xSemaphore <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 释放 */</span>
BaseType_t <span class="token function">xSemaphoreGive</span><span class="token punctuation">(</span> SemaphoreHandle_t xSemaphore <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 释放(ISR版本) */</span>
BaseType_t <span class="token function">xSemaphoreGiveFromISR</span><span class="token punctuation">(</span>
                       SemaphoreHandle_t xSemaphore<span class="token punctuation">,</span>
                       BaseType_t <span class="token operator">*</span>pxHigherPriorityTaskWoken
                   <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 获得 */</span>
BaseType_t <span class="token function">xSemaphoreTake</span><span class="token punctuation">(</span>
                   SemaphoreHandle_t xSemaphore<span class="token punctuation">,</span>
                   TickType_t xTicksToWait
               <span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">/* 获得(ISR版本) */</span>
<span class="token function">xSemaphoreGiveFromISR</span><span class="token punctuation">(</span>
                       SemaphoreHandle_t xSemaphore<span class="token punctuation">,</span>
                       BaseType_t <span class="token operator">*</span>pxHigherPriorityTaskWoken
                   <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_7-3-示例15-互斥量基本使用" tabindex="-1"><a class="header-anchor" href="#_7-3-示例15-互斥量基本使用" aria-hidden="true">#</a> 7.3 示例15: 互斥量基本使用</h2><p>本节代码为： <code>FreeRTOS_15_mutex</code> 。</p><p>使用互斥量时有如下特点：</p><ul><li>刚创建的互斥量可以被成功&quot;take&quot;</li><li>&quot;take&quot;互斥量成功的任务，被称为&quot;holder&quot;，只能由它&quot;give&quot;互斥量；别的任务&quot;give&quot;不成功</li><li>在ISR中不能使用互斥量</li></ul><p>本程序创建2个发送任务：故意发送大量的字符。可以做2个实验：</p><ul><li>使用互斥量：可以看到任务1、任务2打印的字符串没有混杂在一起</li><li>不使用互斥量：任务1、任务2打印的字符串混杂在一起</li></ul><p>main函数代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 互斥量句柄 */</span>
SemaphoreHandle_t xMutex<span class="token punctuation">;</span>

<span class="token keyword">int</span> <span class="token function">main</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token punctuation">)</span>
<span class="token punctuation">{</span>
	<span class="token function">prvSetupHardware</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	
    <span class="token comment">/* 创建互斥量 */</span>
    xMutex <span class="token operator">=</span> <span class="token function">xSemaphoreCreateMutex</span><span class="token punctuation">(</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>


	<span class="token keyword">if</span><span class="token punctuation">(</span> xMutex <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 创建2个任务: 都是打印
		 * 优先级相同
		 */</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vSenderTask<span class="token punctuation">,</span> <span class="token string">&quot;Sender1&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vSenderTask<span class="token punctuation">,</span> <span class="token string">&quot;Sender2&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span><span class="token punctuation">)</span><span class="token number">2</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token comment">/* 启动调度器 */</span>
		<span class="token function">vTaskStartScheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">else</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 无法创建互斥量 */</span>
	<span class="token punctuation">}</span>

	<span class="token comment">/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */</span>
	<span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>发送任务的函数如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">vSenderTask</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token operator">*</span>pvParameters <span class="token punctuation">)</span>
<span class="token punctuation">{</span>
	<span class="token keyword">const</span> TickType_t xTicksToWait <span class="token operator">=</span> <span class="token function">pdMS_TO_TICKS</span><span class="token punctuation">(</span> <span class="token number">10UL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>	
	<span class="token keyword">int</span> cnt <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>
	<span class="token keyword">int</span> task <span class="token operator">=</span> <span class="token punctuation">(</span><span class="token keyword">int</span><span class="token punctuation">)</span>pvParameters<span class="token punctuation">;</span>
	<span class="token keyword">int</span> i<span class="token punctuation">;</span>
	<span class="token keyword">char</span> c<span class="token punctuation">;</span>
	
	<span class="token comment">/* 无限循环 */</span>
	<span class="token keyword">for</span><span class="token punctuation">(</span> <span class="token punctuation">;</span><span class="token punctuation">;</span> <span class="token punctuation">)</span>
	<span class="token punctuation">{</span>	
		<span class="token comment">/* 获得互斥量: 上锁 */</span>
		<span class="token function">xSemaphoreTake</span><span class="token punctuation">(</span>xMutex<span class="token punctuation">,</span> portMAX_DELAY<span class="token punctuation">)</span><span class="token punctuation">;</span>
		
		<span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;Task %d use UART count: %d, &quot;</span><span class="token punctuation">,</span> task<span class="token punctuation">,</span> cnt<span class="token operator">++</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
		c <span class="token operator">=</span> <span class="token punctuation">(</span>task <span class="token operator">==</span> <span class="token number">1</span> <span class="token punctuation">)</span> <span class="token operator">?</span> <span class="token char">&#39;a&#39;</span> <span class="token operator">:</span> <span class="token char">&#39;A&#39;</span><span class="token punctuation">;</span>
		<span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> <span class="token number">26</span><span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span>
			<span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;%c&quot;</span><span class="token punctuation">,</span> c <span class="token operator">+</span> i<span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token function">printf</span><span class="token punctuation">(</span><span class="token string">&quot;\\r\\n&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
		
		<span class="token comment">/* 释放互斥量: 开锁 */</span>
		<span class="token function">xSemaphoreGive</span><span class="token punctuation">(</span>xMutex<span class="token punctuation">)</span><span class="token punctuation">;</span>
		
		<span class="token function">vTaskDelay</span><span class="token punctuation">(</span>xTicksToWait<span class="token punctuation">)</span><span class="token punctuation">;</span>
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>可以做两个实验：vSenderTask函数的for循环中xSemaphoreTake和xSemaphoreGive这2句代码保留、不保留</p><ul><li>保留：实验现象如下图左边，任务1、任务2的打印信息没有混在一起</li><li>不保留：实验现象如下图右边，打印信息混杂在一起</li></ul><p>程序运行结果如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-7/02_mutex_result1.png" alt="image-20210806213047410"></p><h2 id="_7-4-示例16-谁上锁就由谁解锁" tabindex="-1"><a class="header-anchor" href="#_7-4-示例16-谁上锁就由谁解锁" aria-hidden="true">#</a> 7.4 示例16: 谁上锁就由谁解锁？</h2><p>互斥量、互斥锁，本来的概念确实是：谁上锁就得由谁解锁。</p><p>但是FreeRTOS并没有实现这点，只是要求程序员按照这样的惯例写代码。</p><p>本节代码为： <code>FreeRTOS_16_mutex_who_give</code> 。</p><p>main函数创建了2个任务：</p><ul><li>任务1：高优先级，一开始就获得互斥锁，永远不释放。</li><li>任务2：任务1阻塞时它开始执行，它先尝试获得互斥量，失败的话就监守自盗(释放互斥量、开锁)，然后再上锁</li></ul><p>代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">int</span> <span class="token function">main</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token punctuation">)</span>
<span class="token punctuation">{</span>
	<span class="token function">prvSetupHardware</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	
    <span class="token comment">/* 创建互斥量 */</span>
    xMutex <span class="token operator">=</span> <span class="token function">xSemaphoreCreateMutex</span><span class="token punctuation">(</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

	<span class="token keyword">if</span><span class="token punctuation">(</span> xMutex <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 创建2个任务: 一个上锁, 另一个自己监守自盗(开别人的锁自己用)
		 */</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vTakeTask<span class="token punctuation">,</span> <span class="token string">&quot;Task1&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vGiveAndTakeTask<span class="token punctuation">,</span> <span class="token string">&quot;Task2&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token comment">/* 启动调度器 */</span>
		<span class="token function">vTaskStartScheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">else</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 无法创建互斥量 */</span>
	<span class="token punctuation">}</span>

	<span class="token comment">/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */</span>
	<span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>两个任务的代码和执行流程如下图所示：</p><ul><li>A：任务1的优先级高，先运行，立刻上锁</li><li>B：任务1阻塞</li><li>C：任务2开始执行，尝试获得互斥量(上锁)，超时时间设为0。根据返回值打印出：上锁失败</li><li>D：任务2监守自盗，开锁，成功！</li><li>E：任务2成功获得互斥量</li><li>F：任务2阻塞</li></ul><p>可见，任务1上的锁，被任务2解开了。所以，FreeRTOS并没有实现&quot;谁上锁就得由谁开锁&quot;的功能。</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-7/03_mutex_code2.png" alt="image-20210807002428420"></p><p>程序运行结果如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-7/04_mutex_result2.png" alt="image-20210807001351677"></p><h2 id="_7-5-示例17-优先级反转" tabindex="-1"><a class="header-anchor" href="#_7-5-示例17-优先级反转" aria-hidden="true">#</a> 7.5 示例17: 优先级反转</h2><p>假设任务A、B都想使用串口，A优先级比较低：</p><ul><li>任务A获得了串口的互斥量</li><li>任务B也想使用串口，它将会阻塞、等待A释放互斥量</li><li>高优先级的任务，被低优先级的任务延迟，这被称为&quot;优先级反转&quot;(priority inversion)</li></ul><p>如果涉及3个任务，可以让&quot;优先级反转&quot;的后果更加恶劣。</p><p>本节代码为： <code>FreeRTOS_17_mutex_inversion</code> 。</p><p>互斥量可以通过&quot;优先级继承&quot;，可以很大程度解决&quot;优先级反转&quot;的问题，这也是FreeRTOS中互斥量和二级制信号量的差别。</p><p>本节程序使用二级制信号量来演示&quot;优先级反转&quot;的恶劣后果。</p><p>main函数创建了3个任务：LPTask/MPTask/HPTask(低/中/高优先级任务)，代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 互斥量/二进制信号量句柄 */</span>
SemaphoreHandle_t xLock<span class="token punctuation">;</span>

<span class="token keyword">int</span> <span class="token function">main</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token punctuation">)</span>
<span class="token punctuation">{</span>
	<span class="token function">prvSetupHardware</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	
    <span class="token comment">/* 创建互斥量/二进制信号量 */</span>
    xLock <span class="token operator">=</span> <span class="token function">xSemaphoreCreateBinary</span><span class="token punctuation">(</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>


	<span class="token keyword">if</span><span class="token punctuation">(</span> xLock <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 创建3个任务: LP,MP,HP(低/中/高优先级任务)
		 */</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vLPTask<span class="token punctuation">,</span> <span class="token string">&quot;LPTask&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vMPTask<span class="token punctuation">,</span> <span class="token string">&quot;MPTask&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vHPTask<span class="token punctuation">,</span> <span class="token string">&quot;HPTask&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">3</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token comment">/* 启动调度器 */</span>
		<span class="token function">vTaskStartScheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">else</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 无法创建互斥量/二进制信号量 */</span>
	<span class="token punctuation">}</span>

	<span class="token comment">/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */</span>
	<span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>LPTask/MPTask/HPTask三个任务的代码和运行过程如下图所示：</p><ul><li>A：HPTask优先级最高，它最先运行。在这里故意打印，这样才可以观察到flagHPTaskRun的脉冲。</li><li>HP Delay：HPTask阻塞</li><li>B：MPTask开始运行。在这里故意打印，这样才可以观察到flagMPTaskRun的脉冲。</li><li>MP Delay：MPTask阻塞</li><li>C：LPTask开始运行，获得二进制信号量，然后故意打印很多字符</li><li>D：HP Delay时间到，HPTask恢复运行，它无法获得二进制信号量，一直阻塞等待</li><li>E：MP Delay时间到，MPTask恢复运行，它比LPTask优先级高，一直运行。导致LPTask无法运行，自然无法释放二进制信号量，于是HPTask用于无法运行。</li></ul><p>总结：</p><ul><li>LPTask先持有二进制信号量，</li><li>但是MPTask抢占LPTask，是的LPTask一直无法运行也就无法释放信号量，</li><li>导致HPTask任务无法运行</li><li>优先级最高的HPTask竟然一直无法运行！</li></ul><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-7/05_semaphore_priority_inversion.png" alt="image-20210807022840044"></p><p>程序运行的时序图如下：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-7/06_semaphore_priority_inversion_result.png" alt="image-20210807024154678"></p><h2 id="_7-6-示例18-优先级继承" tabindex="-1"><a class="header-anchor" href="#_7-6-示例18-优先级继承" aria-hidden="true">#</a> 7.6 示例18: 优先级继承</h2><p>本节代码为： <code>FreeRTOS_18_mutex_inheritance</code> 。</p><p>示例17的问题在于，LPTask低优先级任务获得了锁，但是它优先级太低而无法运行。</p><p>如果能提升LPTask任务的优先级，让它能尽快运行、释放锁，&quot;优先级反转&quot;的问题不就解决了吗？</p><p>把LPTask任务的优先级提升到什么水平？</p><p>优先级继承：</p><ul><li>假设持有互斥锁的是任务A，如果更高优先级的任务B也尝试获得这个锁</li><li>任务B说：你既然持有宝剑，又不给我，那就继承我的愿望吧</li><li>于是任务A就继承了任务B的优先级</li><li>这就叫：优先级继承</li><li>等任务A释放互斥锁时，它就恢复为原来的优先级</li><li>互斥锁内部就实现了优先级的提升、恢复</li></ul><p>本节源码是在<code>FreeRTOS_17_mutex_inversion</code> 的代码上做了一些简单修改：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">int</span> <span class="token function">main</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token punctuation">)</span>
<span class="token punctuation">{</span>
	<span class="token function">prvSetupHardware</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	
    <span class="token comment">/* 创建互斥量/二进制信号量 */</span>
    <span class="token comment">//xLock = xSemaphoreCreateBinary( );</span>
	xLock <span class="token operator">=</span> <span class="token function">xSemaphoreCreateMutex</span><span class="token punctuation">(</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>运行时序图如下图所示：</p><ul><li>A：HPTask执行<code>xSemaphoreTake(xLock, portMAX_DELAY);</code>，它的优先级被LPTask继承</li><li>B：LPTask抢占MPTask，运行</li><li>C：LPTask执行<code>xSemaphoreGive(xLock);</code>，它的优先级恢复为原来值</li><li>D：HPTask得到互斥锁，开始运行</li><li>互斥锁的&quot;优先级继承&quot;，可以减小&quot;优先级反转&quot;的影响</li></ul><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-7/07_semaphore_priority_inversion_result2.png" alt="image-20210807030831302"></p><h2 id="_7-7-递归锁" tabindex="-1"><a class="header-anchor" href="#_7-7-递归锁" aria-hidden="true">#</a> 7.7 递归锁</h2><h3 id="_7-7-1-死锁的概念" tabindex="-1"><a class="header-anchor" href="#_7-7-1-死锁的概念" aria-hidden="true">#</a> 7.7.1 死锁的概念</h3><p>日常生活的死锁：我们只招有工作经验的人！我没有工作经验怎么办？那你就去找工作啊！</p><p>假设有2个互斥量M1、M2，2个任务A、B：</p><ul><li>A获得了互斥量M1</li><li>B获得了互斥量M2</li><li>A还要获得互斥量M2才能运行，结果A阻塞</li><li>B还要获得互斥量M1才能运行，结果B阻塞</li><li>A、B都阻塞，再无法释放它们持有的互斥量</li><li>死锁发生！</li></ul><h3 id="_7-7-2-自我死锁" tabindex="-1"><a class="header-anchor" href="#_7-7-2-自我死锁" aria-hidden="true">#</a> 7.7.2 自我死锁</h3><p>假设这样的场景：</p><ul><li>任务A获得了互斥锁M</li><li>它调用一个库函数</li><li>库函数要去获取同一个互斥锁M，于是它阻塞：任务A休眠，等待任务A来释放互斥锁！</li><li>死锁发生！</li></ul><h3 id="_7-7-3-函数" tabindex="-1"><a class="header-anchor" href="#_7-7-3-函数" aria-hidden="true">#</a> 7.7.3 函数</h3><p>怎么解决这类问题？可以使用递归锁(Recursive Mutexes)，它的特性如下：</p><ul><li>任务A获得递归锁M后，它还可以多次去获得这个锁</li><li>&quot;take&quot;了N次，要&quot;give&quot;N次，这个锁才会被释放</li></ul><p>递归锁的函数根一般互斥量的函数名不一样，参数类型一样，列表如下：</p><table><thead><tr><th></th><th>递归锁</th><th>一般互斥量</th></tr></thead><tbody><tr><td>创建</td><td>xSemaphoreCreateRecursiveMutex</td><td>xSemaphoreCreateMutex</td></tr><tr><td>获得</td><td>xSemaphoreTakeRecursive</td><td>xSemaphoreTake</td></tr><tr><td>释放</td><td>xSemaphoreGiveRecursive</td><td>xSemaphoreGive</td></tr></tbody></table><p>函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 创建一个递归锁，返回它的句柄。
 * 此函数内部会分配互斥量结构体 
 * 返回值: 返回句柄，非NULL表示成功
 */</span>
SemaphoreHandle_t <span class="token function">xSemaphoreCreateRecursiveMutex</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>


<span class="token comment">/* 释放 */</span>
BaseType_t <span class="token function">xSemaphoreGiveRecursive</span><span class="token punctuation">(</span> SemaphoreHandle_t xSemaphore <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 获得 */</span>
BaseType_t <span class="token function">xSemaphoreTakeRecursive</span><span class="token punctuation">(</span>
                   SemaphoreHandle_t xSemaphore<span class="token punctuation">,</span>
                   TickType_t xTicksToWait
               <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_7-7-4-示例19-递归锁" tabindex="-1"><a class="header-anchor" href="#_7-7-4-示例19-递归锁" aria-hidden="true">#</a> 7.7.4 示例19: 递归锁</h3><p>本节代码为： <code>FreeRTOS_19_mutex_recursive</code> 。</p><p>递归锁实现了：谁上锁就由谁解锁。</p><p>本程序从<code>FreeRTOS_16_mutex_who_give</code>修改得来，它的main函数里创建了2个任务</p><ul><li>任务1：高优先级，一开始就获得递归锁，然后故意等待很长时间，让任务2运行</li><li>任务2：低优先级，看看能否操作别人持有的锁</li></ul><p>main函数代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 递归锁句柄 */</span>
SemaphoreHandle_t xMutex<span class="token punctuation">;</span>

<span class="token keyword">int</span> <span class="token function">main</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token punctuation">)</span>
<span class="token punctuation">{</span>
	<span class="token function">prvSetupHardware</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	
    <span class="token comment">/* 创建递归锁 */</span>
    xMutex <span class="token operator">=</span> <span class="token function">xSemaphoreCreateRecursiveMutex</span><span class="token punctuation">(</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

	<span class="token keyword">if</span><span class="token punctuation">(</span> xMutex <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 创建2个任务: 一个上锁, 另一个自己监守自盗(看看能否开别人的锁自己用)
		 */</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vTakeTask<span class="token punctuation">,</span> <span class="token string">&quot;Task1&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vGiveAndTakeTask<span class="token punctuation">,</span> <span class="token string">&quot;Task2&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token comment">/* 启动调度器 */</span>
		<span class="token function">vTaskStartScheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">else</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 无法创建递归锁 */</span>
	<span class="token punctuation">}</span>

	<span class="token comment">/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */</span>
	<span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>两个任务经过精细设计，代码和运行流程如下图所示：</p><ul><li><p>A：任务1优先级最高，先运行，获得递归锁</p></li><li><p>B：任务1阻塞，让任务2得以运行</p></li><li><p>C：任务2运行，看看能否获得别人持有的递归锁：不能</p></li><li><p>D：任务2故意执行&quot;give&quot;操作，看看能否释放别人持有的递归锁：不能</p></li><li><p>E：任务2等待递归锁</p></li><li><p>F：任务1阻塞时间到后继续运行，使用循环多次获得、释放递归锁</p></li><li><p>递归锁在代码上实现了：谁持有递归锁，必须由谁释放。</p></li></ul><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-7/08_recursive_mutex_code.png" alt="image-20210807045027754"></p><p>程序运行结果如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-7/09_recursive_mutex_result.png" alt="image-20210807042932296"></p><h2 id="_7-8-常见问题" tabindex="-1"><a class="header-anchor" href="#_7-8-常见问题" aria-hidden="true">#</a> 7.8 常见问题</h2><p>使用互斥量的两个任务是相同优先级时的注意事项。</p><h2 id="技术答疑交流" tabindex="-1"><a class="header-anchor" href="#技术答疑交流" aria-hidden="true">#</a> 技术答疑交流</h2>`,123),k={href:"https://forums.100ask.net",target:"_blank",rel:"noopener noreferrer"},v=s("hr",null,null,-1);function m(b,h){const t=a("ExternalLinkIcon"),p=a("center");return c(),o("div",null,[d,s("p",null,[n("在学习中遇到任何问题，请前往我们的技术交流社区留言： "),s("a",k,[n("https://forums.100ask.net"),e(t)])]),v,e(p,null,{default:l(()=>[n("本章完")]),_:1})])}const _=i(r,[["render",m],["__file","chapter7.html.vue"]]);export{_ as default};
