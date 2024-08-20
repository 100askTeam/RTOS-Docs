import{_ as n,o as s,c as a,e}from"./app-a3aa5aa8.js";const t={},i=e(`<h1 id="第17章-中断管理-interrupt-management" tabindex="-1"><a class="header-anchor" href="#第17章-中断管理-interrupt-management" aria-hidden="true">#</a> 第17章 中断管理(Interrupt Management)</h1><p>在RTOS中，需要应对各类事件。这些事件很多时候是通过硬件中断产生，怎么处理中断呢？</p><p>假设当前系统正在运行Task1时，用户按下了按键，触发了按键中断。这个中断的处理流程如下：</p><ul><li>CPU跳到固定地址去执行代码，这个固定地址通常被称为中断向量，这个跳转时硬件实现的</li><li>执行代码做什么？ <ul><li>保存现场：Task1被打断，需要先保存Task1的运行环境，比如各类寄存器的值</li><li>分辨中断、调用处理函数(这个函数就被称为ISR，interrupt service routine)</li><li>恢复现场：继续运行Task1，或者运行其他优先级更高的任务</li></ul></li></ul><p>你要注意到，ISR是在内核中被调用的，ISR执行过程中，用户的任务无法执行。ISR要尽量快，否则：</p><ul><li>其他低优先级的中断无法被处理：实时性无法保证</li><li>用户任务无法被执行：系统显得很卡顿</li></ul><p>如果这个硬件中断的处理，就是非常耗费时间呢？对于这类中断的处理就要分为2部分：</p><ul><li>ISR：尽快做些清理、记录工作，然后触发某个任务</li><li>任务：更复杂的事情放在任务中处理</li><li>所以：需要ISR和任务之间进行通信</li></ul><p>要在FreeRTOS中熟练使用中断，有几个原则要先说明：</p><ul><li>FreeRTOS把任务认为是硬件无关的，任务的优先级由程序员决定，任务何时运行由调度器决定</li><li>ISR虽然也是使用软件实现的，但是它被认为是硬件特性的一部分，因为它跟硬件密切相关 <ul><li>何时执行？由硬件决定</li><li>哪个ISR被执行？由硬件决定</li></ul></li><li>ISR的优先级高于任务：即使是优先级最低的中断，它的优先级也高于任务。任务只有在没有中断的情况下，才能执行。</li></ul><p>本章涉及如下内容：</p><ul><li>FreeRTOS的哪些API函数能在ISR中使用</li><li>怎么把中断的处理分为两部分：ISR、任务</li><li>ISR和任务之间的通信</li></ul><h2 id="_17-1-两套api函数" tabindex="-1"><a class="header-anchor" href="#_17-1-两套api函数" aria-hidden="true">#</a> 17.1 两套API函数</h2><h3 id="_17-1-1-为什么需要两套api" tabindex="-1"><a class="header-anchor" href="#_17-1-1-为什么需要两套api" aria-hidden="true">#</a> 17.1.1 为什么需要两套API</h3><p>在任务函数中，我们可以调用各类API函数，比如队列操作函数：xQueueSendToBack。但是在ISR中使用这个函数会导致问题，应该使用另一个函数：xQueueSendToBackFromISR，它的函数名含有后缀&quot;FromISR&quot;，表示&quot;从ISR中给队列发送数据&quot;。</p><p>FreeRTOS中很多API函数都有两套：一套在任务中使用，另一套在ISR中使用。后者的函数名含有&quot;FromISR&quot;后缀。</p><p>为什么要引入两套API函数？</p><ul><li>很多API函数会导致任务计入阻塞状态： <ul><li>运行这个函数的 <strong>任务</strong> 进入阻塞状态</li><li>比如写队列时，如果队列已满，可以进入阻塞状态等待一会</li></ul></li><li>ISR调用API函数时，ISR不是&quot;任务&quot;，ISR不能进入阻塞状态</li><li>所以，在任务中、在ISR中，这些函数的功能是有差别的</li></ul><p>为什么不使用同一套函数，比如在函数里面分辨当前调用者是任务还是ISR呢？示例代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code>BaseType_t <span class="token function">xQueueSend</span><span class="token punctuation">(</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span><span class="token function">is_in_isr</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
    	<span class="token comment">/* 把数据放入队列 */</span>
        
        <span class="token comment">/* 不管是否成功都直接返回 */</span>
    <span class="token punctuation">}</span>
    <span class="token keyword">else</span> <span class="token comment">/* 在任务中 */</span>
    <span class="token punctuation">{</span>
    	<span class="token comment">/* 把数据放入队列 */</span>
        <span class="token comment">/* 不成功就等待一会再重试 */</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>FreeRTOS使用两套函数，而不是使用一套函数，是因为有如下好处：</p><ul><li>使用同一套函数的话，需要增加额外的判断代码、增加额外的分支，是的函数更长、更复杂、难以测试</li><li>在任务、ISR中调用时，需要的参数不一样，比如： <ul><li>在任务中调用：需要指定超时时间，表示如果不成功就阻塞一会</li><li>在ISR中调用：不需要指定超时时间，无论是否成功都要即刻返回</li><li>如果强行把两套函数揉在一起，会导致参数臃肿、无效</li></ul></li><li>移植FreeRTOS时，还需要提供监测上下文的函数，比如 <strong>is_in_isr()</strong></li><li>有些处理器架构没有办法轻易分辨当前是处于任务中，还是处于ISR中，就需要额外添加更多、更复杂的代码</li></ul><p>使用两套函数可以让程序更高效，但是也有一些缺点，比如你要使用第三方库函数时，即会在任务中调用它，也会在ISR总调用它。这个第三方库函数用到了FreeRTOS的API函数，你无法修改库函数。这个问题可以解决：</p><ul><li>把中断的处理推迟到任务中进行(Defer interrupt processing)，在任务中调用库函数</li><li>尝试在库函数中使用&quot;FromISR&quot;函数： <ul><li>在任务中、在ISR中都可以调用&quot;FromISR&quot;函数</li><li>反过来就不行，非FromISR函数无法在ISR中使用</li></ul></li><li>第三方库函数也许会提供OS抽象层，自行判断当前环境是在任务还是在ISR中，分别调用不同的函数</li></ul><h3 id="_17-1-2-两套api函数列表" tabindex="-1"><a class="header-anchor" href="#_17-1-2-两套api函数列表" aria-hidden="true">#</a> 17.1.2 两套API函数列表</h3><table><tr><th>类型</th><th>在任务中</th><th>在ISR中</th></tr><tr><td rowspan="5">队列(queue)</td><td>xQueueSendToBack</td><td>xQueueSendToBackFromISR</td></tr><tr><td>xQueueSendToFront</td><td>xQueueSendToFrontFromISR</td></tr><tr><td>xQueueReceive</td><td>xQueueReceiveFromISR</td></tr><tr><td>xQueueOverwrite</td><td>xQueueOverwriteFromISR</td></tr><tr><td>xQueuePeek</td><td>xQueuePeekFromISR</td></tr><tr><td rowspan="2">信号量(semaphore)</td><td>xSemaphoreGive</td><td>xSemaphoreGiveFromISR</td></tr><tr><td>xSemaphoreTake</td><td>xSemaphoreTakeFromISR</td></tr><tr><td rowspan="2">事件组(event group)</td><td>xEventGroupSetBits</td><td>xEventGroupSetBitsFromISR</td></tr><tr><td>xEventGroupGetBits</td><td>xEventGroupGetBitsFromISR</td></tr><tr><td rowspan="2">任务通知(task notification)</td><td>xTaskNotifyGive</td><td>vTaskNotifyGiveFromISR</td></tr><tr><td>xTaskNotify</td><td>xTaskNotifyFromISR</td></tr><tr><td rowspan="4">软件定时器(software timer)</td><td>xTimerStart</td><td>xTimerStartFromISR</td></tr><tr><td>xTimerStop</td><td>xTimerStopFromISR</td></tr><tr><td>xTimerReset</td><td>xTimerResetFromISR</td></tr><tr><td>xTimerChangePeriod</td><td>xTimerChangePeriodFromISR</td></tr></table><h3 id="_17-1-3-xhigherprioritytaskwoken参数" tabindex="-1"><a class="header-anchor" href="#_17-1-3-xhigherprioritytaskwoken参数" aria-hidden="true">#</a> 17.1.3 xHigherPriorityTaskWoken参数</h3><p>xHigherPriorityTaskWoken的含义是：是否有更高优先级的任务被唤醒了。如果为pdTRUE，则意味着后面要进行任务切换。</p><p>还是以写队列为例。</p><p>任务A调用 <strong>xQueueSendToBack()</strong> 写队列，有几种情况发生：</p><ul><li>队列满了，任务A阻塞等待，另一个任务B运行</li><li>队列没满，任务A成功写入队列，但是它导致另一个任务B被唤醒，任务B的优先级更高：任务B先运行</li><li>队列没满，任务A成功写入队列，即刻返回</li></ul><p>可以看到，在任务中调用API函数可能导致任务阻塞、任务切换，这叫做&quot;context switch&quot;，上下文切换。这个函数可能很长时间才返回，在函数的内部实现了任务切换。</p><p><strong>xQueueSendToBackFromISR()</strong> 函数也可能导致任务切换，但是不会在函数内部进行切换，而是返回一个参数：表示是否需要切换，函数原型与用法如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 
 * 往队列尾部写入数据，此函数可以在中断函数中使用，不可阻塞
 */</span>
BaseType_t <span class="token function">xQueueSendToBackFromISR</span><span class="token punctuation">(</span>
                                      QueueHandle_t xQueue<span class="token punctuation">,</span>
                                      <span class="token keyword">const</span> <span class="token keyword">void</span> <span class="token operator">*</span>pvItemToQueue<span class="token punctuation">,</span>
                                      BaseType_t <span class="token operator">*</span>pxHigherPriorityTaskWoken
                                   <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 用法示例 */</span>

BaseType_t xHigherPriorityTaskWoken <span class="token operator">=</span> pdFALSE<span class="token punctuation">;</span>
<span class="token function">xQueueSendToBackFromISR</span><span class="token punctuation">(</span>xQueue<span class="token punctuation">,</span> pvItemToQueue<span class="token punctuation">,</span> <span class="token operator">&amp;</span>xHigherPriorityTaskWoken<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">if</span> <span class="token punctuation">(</span>xHigherPriorityTaskWoken <span class="token operator">==</span> pdTRUE<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">/* 任务切换 */</span>    
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>pxHigherPriorityTaskWoken参数，就是用来保存函数的结果：是否需要切换</p><ul><li>*pxHigherPriorityTaskWoken等于pdTRUE：函数的操作导致更高优先级的任务就绪了，ISR应该进行任务切换</li><li>*pxHigherPriorityTaskWoken等于pdFALSE：没有进行任务切换的必要</li></ul><p>为什么不在&quot;FromISR&quot;函数内部进行任务切换，而只是标记一下而已呢？为了效率！示例代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">XXX_ISR</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">int</span> i<span class="token punctuation">;</span>
    <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> N<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token function">xQueueSendToBackFromISR</span><span class="token punctuation">(</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">/* 被多次调用 */</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>ISR中有可能多次调用&quot;FromISR&quot;函数，如果在&quot;FromISR&quot;内部进行任务切换，会浪费时间。解决方法是：</p><ul><li>在&quot;FromISR&quot;中标记是否需要切换</li><li>在ISR返回之前再进行任务切换</li><li>示例代码如下</li></ul><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">XXX_ISR</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">int</span> i<span class="token punctuation">;</span>
    BaseType_t xHigherPriorityTaskWoken <span class="token operator">=</span> pdFALSE<span class="token punctuation">;</span>
    
    <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> N<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token function">xQueueSendToBackFromISR</span><span class="token punctuation">(</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">,</span> <span class="token operator">&amp;</span>xHigherPriorityTaskWoken<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">/* 被多次调用 */</span>
    <span class="token punctuation">}</span>
	
    <span class="token comment">/* 最后再决定是否进行任务切换 */</span>
    <span class="token keyword">if</span> <span class="token punctuation">(</span>xHigherPriorityTaskWoken <span class="token operator">==</span> pdTRUE<span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
    	<span class="token comment">/* 任务切换 */</span>    
	<span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上述的例子很常见，比如UART中断：在UART的ISR中读取多个字符，发现收到回车符时才进行任务切换。</p><p>在ISR中调用API时不进行任务切换，而只是在&quot;xHigherPriorityTaskWoken&quot;中标记一下，除了效率，还有多种好处：</p><ul><li>效率高：避免不必要的任务切换</li><li>让ISR更可控：中断随机产生，在API中进行任务切换的话，可能导致问题更复杂</li><li>可移植性</li><li>在Tick中断中，调用 <strong>vApplicationTickHook()</strong> ：它运行与ISR，只能使用&quot;FromISR&quot;的函数</li></ul><p>使用&quot;FromISR&quot;函数时，如果不想使用xHigherPriorityTaskWoken参数，可以设置为NULL。</p><h3 id="_17-1-4-怎么切换任务" tabindex="-1"><a class="header-anchor" href="#_17-1-4-怎么切换任务" aria-hidden="true">#</a> 17.1.4 怎么切换任务</h3><p>FreeRTOS的ISR函数中，使用两个宏进行任务切换：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code>	<span class="token function">portEND_SWITCHING_ISR</span><span class="token punctuation">(</span> xHigherPriorityTaskWoken <span class="token punctuation">)</span><span class="token punctuation">;</span>
或
	<span class="token function">portYIELD_FROM_ISR</span><span class="token punctuation">(</span> xHigherPriorityTaskWoken <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这两个宏做的事情是完全一样的，在老版本的FreeRTOS中，</p><ul><li><strong>portEND_SWITCHING_ISR</strong> 使用汇编实现</li><li><strong>portYIELD_FROM_ISR</strong> 使用C语言实现</li></ul><p>新版本都统一使用<strong>portYIELD_FROM_ISR</strong>。</p><p>使用示例如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">XXX_ISR</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token keyword">int</span> i<span class="token punctuation">;</span>
    BaseType_t xHigherPriorityTaskWoken <span class="token operator">=</span> pdFALSE<span class="token punctuation">;</span>
    
    <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> N<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span>
    <span class="token punctuation">{</span>
        <span class="token function">xQueueSendToBackFromISR</span><span class="token punctuation">(</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">.</span><span class="token punctuation">,</span> <span class="token operator">&amp;</span>xHigherPriorityTaskWoken<span class="token punctuation">)</span><span class="token punctuation">;</span> <span class="token comment">/* 被多次调用 */</span>
    <span class="token punctuation">}</span>
	
    <span class="token comment">/* 最后再决定是否进行任务切换 
     * xHigherPriorityTaskWoken为pdTRUE时才切换
     */</span>
    <span class="token function">portYIELD_FROM_ISR</span><span class="token punctuation">(</span>xHigherPriorityTaskWoken<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_17-2-中断的延迟处理" tabindex="-1"><a class="header-anchor" href="#_17-2-中断的延迟处理" aria-hidden="true">#</a> 17.2 中断的延迟处理</h2><p>前面讲过，ISR要尽量快，否则：</p><ul><li>其他低优先级的中断无法被处理：实时性无法保证</li><li>用户任务无法被执行：系统显得很卡顿</li><li>如果运行中断嵌套，这会更复杂，ISR越快执行约有助于中断嵌套</li></ul><p>如果这个硬件中断的处理，就是非常耗费时间呢？对于这类中断的处理就要分为2部分：</p><ul><li>ISR：尽快做些清理、记录工作，然后触发某个任务</li><li>任务：更复杂的事情放在任务中处理</li></ul><p>这种处理方式叫&quot;中断的延迟处理&quot;(Deferring interrupt processing)，处理流程如下图所示：</p><ul><li>t1：任务1运行，任务2阻塞</li><li>t2：发生中断，</li><li>该中断的ISR函数被执行，任务1被打断</li><li>ISR函数要尽快能快速地运行，它做一些必要的操作(比如清除中断)，然后唤醒任务2</li><li>t3：在创建任务时设置任务2的优先级比任务1高(这取决于设计者)，所以ISR返回后，运行的是任务2，它要完成中断的处理。任务2就被称为&quot;deferred processing task&quot;，中断的延迟处理任务。</li><li>t4：任务2处理完中断后，进入阻塞态以等待下一个中断，任务1重新运行</li></ul><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-17/image1.png" style="zoom:67%;"><h2 id="_17-3-中断与任务间的通信" tabindex="-1"><a class="header-anchor" href="#_17-3-中断与任务间的通信" aria-hidden="true">#</a> 17.3 中断与任务间的通信</h2><p>前面讲解过的队列、信号量、互斥量、事件组、任务通知等等方法，都可使用。</p><p>要注意的是，在ISR中使用的函数要有&quot;FromISR&quot;后缀。</p><h2 id="_17-4-示例-优化实时性" tabindex="-1"><a class="header-anchor" href="#_17-4-示例-优化实时性" aria-hidden="true">#</a> 17.4 示例: 优化实时性</h2><p>本节代码为：29_fromisr_game，主要看DshanMCU-F103\\driver_ir_receiver.c。</p><p>以前，在中断函数里写队列时，代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token number">150</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">DispatchKey</span><span class="token punctuation">(</span><span class="token keyword">struct</span> <span class="token class-name">ir_data</span> <span class="token operator">*</span>pidata<span class="token punctuation">)</span>

<span class="token number">151</span> <span class="token punctuation">{</span>

<span class="token number">152</span> #<span class="token keyword">if</span> <span class="token number">0</span>

<span class="token number">153</span>   <span class="token keyword">extern</span> QueueHandle_t g_xQueueCar1<span class="token punctuation">;</span>

<span class="token number">154</span>   <span class="token keyword">extern</span> QueueHandle_t g_xQueueCar2<span class="token punctuation">;</span>

<span class="token number">155</span>   <span class="token keyword">extern</span> QueueHandle_t g_xQueueCar3<span class="token punctuation">;</span>

<span class="token number">156</span>   <span class="token function">xQueueSendFromISR</span><span class="token punctuation">(</span>g_xQueueCar1<span class="token punctuation">,</span> pidata<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">157</span>   <span class="token function">xQueueSendFromISR</span><span class="token punctuation">(</span>g_xQueueCar2<span class="token punctuation">,</span> pidata<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">158</span>   <span class="token function">xQueueSendFromISR</span><span class="token punctuation">(</span>g_xQueueCar3<span class="token punctuation">,</span> pidata<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">159</span> #<span class="token keyword">else</span>

<span class="token number">160</span>   <span class="token keyword">int</span> i<span class="token punctuation">;</span>

<span class="token number">161</span>    <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> g_queue_cnt<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span>

<span class="token number">162</span>    <span class="token punctuation">{</span>

<span class="token number">163</span>        <span class="token function">xQueueSendFromISR</span><span class="token punctuation">(</span>g_xQueues<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">,</span> pidata<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">164</span>    <span class="token punctuation">}</span>

<span class="token number">165</span> #endif

<span class="token number">166</span> <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>假设当前运行的是任务A，它的优先级比较低，在它运行过程中发生了中断，中断函数调用了DispatchKey函数写了队列，使得任务B被唤醒了。任务B的优先级比较高，它应该在中断执行完后马上就能运行。但是上述代码无法实现这个目标，xQueueSendFromISR函数会把任务B调整为就绪态，但是不会发起一次调度。</p><p>需要如下修改代码：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token number">150</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">DispatchKey</span><span class="token punctuation">(</span><span class="token keyword">struct</span> <span class="token class-name">ir_data</span> <span class="token operator">*</span>pidata<span class="token punctuation">)</span>

<span class="token number">151</span> <span class="token punctuation">{</span>

<span class="token number">152</span> #<span class="token keyword">if</span> <span class="token number">0</span>

<span class="token number">153</span>   <span class="token keyword">extern</span> QueueHandle_t g_xQueueCar1<span class="token punctuation">;</span>

<span class="token number">154</span>   <span class="token keyword">extern</span> QueueHandle_t g_xQueueCar2<span class="token punctuation">;</span>

<span class="token number">155</span>   <span class="token keyword">extern</span> QueueHandle_t g_xQueueCar3<span class="token punctuation">;</span>

<span class="token number">156</span>   <span class="token function">xQueueSendFromISR</span><span class="token punctuation">(</span>g_xQueueCar1<span class="token punctuation">,</span> pidata<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">157</span>    <span class="token function">xQueueSendFromISR</span><span class="token punctuation">(</span>g_xQueueCar2<span class="token punctuation">,</span> pidata<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">158</span>    <span class="token function">xQueueSendFromISR</span><span class="token punctuation">(</span>g_xQueueCar3<span class="token punctuation">,</span> pidata<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">159</span> #<span class="token keyword">else</span>

<span class="token number">160</span>    <span class="token keyword">int</span> i<span class="token punctuation">;</span>

<span class="token number">161</span>   BaseType_t xHigherPriorityTaskWoken <span class="token operator">=</span> pdFALSE<span class="token punctuation">;</span>

<span class="token number">162</span>    <span class="token keyword">for</span> <span class="token punctuation">(</span>i <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span> i <span class="token operator">&lt;</span> g_queue_cnt<span class="token punctuation">;</span> i<span class="token operator">++</span><span class="token punctuation">)</span>

<span class="token number">163</span>    <span class="token punctuation">{</span>

<span class="token number">164</span>        <span class="token function">xQueueSendFromISR</span><span class="token punctuation">(</span>g_xQueues<span class="token punctuation">[</span>i<span class="token punctuation">]</span><span class="token punctuation">,</span> pidata<span class="token punctuation">,</span> <span class="token operator">&amp;</span>xHigherPriorityTaskWoken<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">165</span>    <span class="token punctuation">}</span>

<span class="token number">166</span>   <span class="token function">portYIELD_FROM_ISR</span><span class="token punctuation">(</span>xHigherPriorityTaskWoken<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">167</span> #endif

<span class="token number">168</span> <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在第164行传入一个变量的地址：&amp;xHigherPriorityTaskWoken，它的初始值是pdFALSE，表示无需发起调度。如果xQueueSendFromISR函数发现唤醒了更高优先级的任务，那么就会把这个变量设置为pdTRUE。</p><p>第166行，如果xHigherPriorityTaskWoken为pdTRUE，它就会发起一次调度。</p><p>本程序上机时，我们感觉不到有什么不同。</p>`,74),p=[i];function o(l,c){return s(),a("div",null,p)}const r=n(t,[["render",o],["__file","chapter17.html.vue"]]);export{r as default};
