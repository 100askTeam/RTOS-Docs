import{_ as p,r as s,o as l,c as o,a,b as n,d as e,w as c,e as u}from"./app-a3aa5aa8.js";const d={},r=u(`<h1 id="第六章-信号量-semaphore" tabindex="-1"><a class="header-anchor" href="#第六章-信号量-semaphore" aria-hidden="true">#</a> 第六章 信号量(semaphore)</h1><p>前面介绍的队列(queue)可以用于传输数据：在任务之间、任务和中断之间。</p><p>有时候我们只需要传递状态，并不需要传递具体的信息，比如：</p><ul><li>我的事做完了，通知一下你</li><li>卖包子了、卖包子了，做好了1个包子！做好了2个包子！做好了3个包子！</li><li>这个停车位我占了，你们只能等着</li></ul><p>在这种情况下我们可以使用信号量(semaphore)，它更节省内存。</p><p>本章涉及如下内容：</p><ul><li>怎么创建、删除信号量</li><li>怎么发送、获得信号量</li><li>什么是计数型信号量？什么是二进制信号量？</li></ul><h2 id="_6-1-信号量的特性" tabindex="-1"><a class="header-anchor" href="#_6-1-信号量的特性" aria-hidden="true">#</a> 6.1 信号量的特性</h2><h3 id="_6-1-1-信号量的常规操作" tabindex="-1"><a class="header-anchor" href="#_6-1-1-信号量的常规操作" aria-hidden="true">#</a> 6.1.1 信号量的常规操作</h3><p>信号量这个名字很恰当：</p><ul><li>信号：起通知作用</li><li>量：还可以用来表示资源的数量 <ul><li>当&quot;量&quot;没有限制时，它就是&quot;计数型信号量&quot;(Counting Semaphores)</li><li>当&quot;量&quot;只有0、1两个取值时，它就是&quot;二进制信号量&quot;(Binary Semaphores)</li></ul></li><li>支持的动作：&quot;give&quot;给出资源，计数值加1；&quot;take&quot;获得资源，计数值减1</li></ul><p>计数型信号量的典型场景是：</p><ul><li>计数：事件产生时&quot;give&quot;信号量，让计数值加1；处理事件时要先&quot;take&quot;信号量，就是获得信号量，让计数值减1。</li><li>资源管理：要想访问资源需要先&quot;take&quot;信号量，让计数值减1；用完资源后&quot;give&quot;信号量，让计数值加1。</li></ul><p>信号量的&quot;give&quot;、&quot;take&quot;双方并不需要相同，可以用于生产者-消费者场合：</p><ul><li>生产者为任务A、B，消费者为任务C、D</li><li>一开始信号量的计数值为0，如果任务C、D想获得信号量，会有两种结果： <ul><li>阻塞：买不到东西咱就等等吧，可以定个闹钟(超时时间)</li><li>即刻返回失败：不等</li></ul></li><li>任务A、B可以生产资源，就是让信号量的计数值增加1，并且把等待这个资源的顾客唤醒</li><li>唤醒谁？谁优先级高就唤醒谁，如果大家优先级一样就唤醒等待时间最长的人</li></ul><p>二进制信号量跟计数型的唯一差别，就是计数值的最大值被限定为1。</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-6/01_semaphore_usage.png" alt="image-20210804150721288"></p><h3 id="_6-1-2-信号量跟队列的对比" tabindex="-1"><a class="header-anchor" href="#_6-1-2-信号量跟队列的对比" aria-hidden="true">#</a> 6.1.2 信号量跟队列的对比</h3><p>差异列表如下：</p><table><thead><tr><th>队列</th><th>信号量</th></tr></thead><tbody><tr><td>可以容纳多个数据，<br>创建队列时有2部分内存: 队列结构体、存储数据的空间</td><td>只有计数值，无法容纳其他数据。<br>创建信号量时，只需要分配信号量结构体</td></tr><tr><td>生产者：没有空间存入数据时可以阻塞</td><td>生产者：用于不阻塞，计数值已经达到最大时返回失败</td></tr><tr><td>消费者：没有数据时可以阻塞</td><td>消费者：没有资源时可以阻塞</td></tr></tbody></table><h3 id="_6-1-3-两种信号量的对比" tabindex="-1"><a class="header-anchor" href="#_6-1-3-两种信号量的对比" aria-hidden="true">#</a> 6.1.3 两种信号量的对比</h3><p>信号量的计数值都有限制：限定了最大值。如果最大值被限定为1，那么它就是二进制信号量；如果最大值不是1，它就是计数型信号量。</p><p>差别列表如下：</p><table><thead><tr><th>二进制信号量</th><th>技术型信号量</th></tr></thead><tbody><tr><td>被创建时初始值为0</td><td>被创建时初始值可以设定</td></tr><tr><td>其他操作是一样的</td><td>其他操作是一样的</td></tr></tbody></table><h2 id="_6-2-信号量函数" tabindex="-1"><a class="header-anchor" href="#_6-2-信号量函数" aria-hidden="true">#</a> 6.2 信号量函数</h2><p>使用信号量时，先创建、然后去添加资源、获得资源。使用句柄来表示一个信号量。</p><h3 id="_6-2-1-创建" tabindex="-1"><a class="header-anchor" href="#_6-2-1-创建" aria-hidden="true">#</a> 6.2.1 创建</h3><p>使用信号量之前，要先创建，得到一个句柄；使用信号量时，要使用句柄来表明使用哪个信号量。</p><p>对于二进制信号量、计数型信号量，它们的创建函数不一样：</p><table><thead><tr><th></th><th>二进制信号量</th><th>计数型信号量</th></tr></thead><tbody><tr><td>动态创建</td><td>xSemaphoreCreateBinary<br>计数值初始值为0</td><td>xSemaphoreCreateCounting</td></tr><tr><td></td><td>vSemaphoreCreateBinary(过时了)<br>计数值初始值为1</td><td></td></tr><tr><td>静态创建</td><td>xSemaphoreCreateBinaryStatic</td><td>xSemaphoreCreateCountingStatic</td></tr></tbody></table><p>创建二进制信号量的函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 创建一个二进制信号量，返回它的句柄。
 * 此函数内部会分配信号量结构体 
 * 返回值: 返回句柄，非NULL表示成功
 */</span>
SemaphoreHandle_t <span class="token function">xSemaphoreCreateBinary</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 创建一个二进制信号量，返回它的句柄。
 * 此函数无需动态分配内存，所以需要先有一个StaticSemaphore_t结构体，并传入它的指针
 * 返回值: 返回句柄，非NULL表示成功
 */</span>
SemaphoreHandle_t <span class="token function">xSemaphoreCreateBinaryStatic</span><span class="token punctuation">(</span> StaticSemaphore_t <span class="token operator">*</span>pxSemaphoreBuffer <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>创建计数型信号量的函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 创建一个计数型信号量，返回它的句柄。
 * 此函数内部会分配信号量结构体 
 * uxMaxCount: 最大计数值
 * uxInitialCount: 初始计数值
 * 返回值: 返回句柄，非NULL表示成功
 */</span>
SemaphoreHandle_t <span class="token function">xSemaphoreCreateCounting</span><span class="token punctuation">(</span>UBaseType_t uxMaxCount<span class="token punctuation">,</span> UBaseType_t uxInitialCount<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 创建一个计数型信号量，返回它的句柄。
 * 此函数无需动态分配内存，所以需要先有一个StaticSemaphore_t结构体，并传入它的指针
 * uxMaxCount: 最大计数值
 * uxInitialCount: 初始计数值
 * pxSemaphoreBuffer: StaticSemaphore_t结构体指针
 * 返回值: 返回句柄，非NULL表示成功
 */</span>
SemaphoreHandle_t <span class="token function">xSemaphoreCreateCountingStatic</span><span class="token punctuation">(</span> UBaseType_t uxMaxCount<span class="token punctuation">,</span> 
                                                 UBaseType_t uxInitialCount<span class="token punctuation">,</span> 
                                                 StaticSemaphore_t <span class="token operator">*</span>pxSemaphoreBuffer <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_6-2-2-删除" tabindex="-1"><a class="header-anchor" href="#_6-2-2-删除" aria-hidden="true">#</a> 6.2.2 删除</h3><p>对于动态创建的信号量，不再需要它们时，可以删除它们以回收内存。</p><p>vSemaphoreDelete可以用来删除二进制信号量、计数型信号量，函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
 * xSemaphore: 信号量句柄，你要删除哪个信号量
 */</span>
<span class="token keyword">void</span> <span class="token function">vSemaphoreDelete</span><span class="token punctuation">(</span> SemaphoreHandle_t xSemaphore <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_6-2-3-give-take" tabindex="-1"><a class="header-anchor" href="#_6-2-3-give-take" aria-hidden="true">#</a> 6.2.3 give/take</h3><p>二进制信号量、计数型信号量的give、take操作函数是一样的。这些函数也分为2个版本：给任务使用，给ISR使用。列表如下：</p><table><thead><tr><th></th><th>在任务中使用</th><th>在ISR中使用</th></tr></thead><tbody><tr><td>give</td><td>xSemaphoreGive</td><td>xSemaphoreGiveFromISR</td></tr><tr><td>take</td><td>xSemaphoreTake</td><td>xSemaphoreTakeFromISR</td></tr></tbody></table><p>xSemaphoreGive的函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code>BaseType_t <span class="token function">xSemaphoreGive</span><span class="token punctuation">(</span> SemaphoreHandle_t xSemaphore <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>xSemaphoreGive函数的参数与返回值列表如下：</p><table><thead><tr><th>参数</th><th>说明</th></tr></thead><tbody><tr><td>xSemaphore</td><td>信号量句柄，释放哪个信号量</td></tr><tr><td>返回值</td><td>pdTRUE表示成功,<br>如果二进制信号量的计数值已经是1，再次调用此函数则返回失败；<br>如果计数型信号量的计数值已经是最大值，再次调用此函数则返回失败</td></tr></tbody></table><p>pxHigherPriorityTaskWoken的函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code>BaseType_t <span class="token function">xSemaphoreGiveFromISR</span><span class="token punctuation">(</span>
                        SemaphoreHandle_t xSemaphore<span class="token punctuation">,</span>
                        BaseType_t <span class="token operator">*</span>pxHigherPriorityTaskWoken
                    <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>xSemaphoreGiveFromISR函数的参数与返回值列表如下：</p><table><thead><tr><th>参数</th><th>说明</th></tr></thead><tbody><tr><td>xSemaphore</td><td>信号量句柄，释放哪个信号量</td></tr><tr><td>pxHigherPriorityTaskWoken</td><td>如果释放信号量导致更高优先级的任务变为了就绪态，<br>则*pxHigherPriorityTaskWoken = pdTRUE</td></tr><tr><td>返回值</td><td>pdTRUE表示成功,<br>如果二进制信号量的计数值已经是1，再次调用此函数则返回失败；<br>如果计数型信号量的计数值已经是最大值，再次调用此函数则返回失败</td></tr></tbody></table><p>xSemaphoreTake的函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code>BaseType_t <span class="token function">xSemaphoreTake</span><span class="token punctuation">(</span>
                   SemaphoreHandle_t xSemaphore<span class="token punctuation">,</span>
                   TickType_t xTicksToWait
               <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>xSemaphoreTake函数的参数与返回值列表如下：</p><table><thead><tr><th>参数</th><th>说明</th></tr></thead><tbody><tr><td>xSemaphore</td><td>信号量句柄，获取哪个信号量</td></tr><tr><td>xTicksToWait</td><td>如果无法马上获得信号量，阻塞一会：<br>0：不阻塞，马上返回<br>portMAX_DELAY: 一直阻塞直到成功<br>其他值: 阻塞的Tick个数，可以使用<code>pdMS_TO_TICKS()</code>来指定阻塞时间为若干ms</td></tr><tr><td>返回值</td><td>pdTRUE表示成功</td></tr></tbody></table><p>xSemaphoreTakeFromISR的函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code>BaseType_t <span class="token function">xSemaphoreTakeFromISR</span><span class="token punctuation">(</span>
                        SemaphoreHandle_t xSemaphore<span class="token punctuation">,</span>
                        BaseType_t <span class="token operator">*</span>pxHigherPriorityTaskWoken
                    <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>xSemaphoreTakeFromISR函数的参数与返回值列表如下：</p><table><thead><tr><th>参数</th><th>说明</th></tr></thead><tbody><tr><td>xSemaphore</td><td>信号量句柄，获取哪个信号量</td></tr><tr><td>pxHigherPriorityTaskWoken</td><td>如果获取信号量导致更高优先级的任务变为了就绪态，<br>则*pxHigherPriorityTaskWoken = pdTRUE</td></tr><tr><td>返回值</td><td>pdTRUE表示成功</td></tr></tbody></table><h2 id="_6-3-示例12-使用二进制信号量来同步" tabindex="-1"><a class="header-anchor" href="#_6-3-示例12-使用二进制信号量来同步" aria-hidden="true">#</a> 6.3 示例12: 使用二进制信号量来同步</h2><p>本节代码为： <code>FreeRTOS_12_semaphore_binary</code> 。</p><p>main函数中创建了一个二进制信号量，然后创建2个任务：一个用于释放信号量，另一个用于获取信号量，代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 二进制信号量句柄 */</span>
SemaphoreHandle_t xBinarySemaphore<span class="token punctuation">;</span>

<span class="token keyword">int</span> <span class="token function">main</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token punctuation">)</span>
<span class="token punctuation">{</span>
	<span class="token function">prvSetupHardware</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	
    <span class="token comment">/* 创建二进制信号量 */</span>
    xBinarySemaphore <span class="token operator">=</span> <span class="token function">xSemaphoreCreateBinary</span><span class="token punctuation">(</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

	<span class="token keyword">if</span><span class="token punctuation">(</span> xBinarySemaphore <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 创建1个任务用于释放信号量
		 * 优先级为2
		 */</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vSenderTask<span class="token punctuation">,</span> <span class="token string">&quot;Sender&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token comment">/* 创建1个任务用于获取信号量
		 * 优先级为1
		 */</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vReceiverTask<span class="token punctuation">,</span> <span class="token string">&quot;Receiver&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token comment">/* 启动调度器 */</span>
		<span class="token function">vTaskStartScheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">else</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 无法创建二进制信号量 */</span>
	<span class="token punctuation">}</span>

	<span class="token comment">/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */</span>
	<span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>发送任务、接收任务的代码和执行流程如下：</p><ul><li>A：发送任务优先级高，先执行。连续3次释放二进制信号量，只有第1次成功</li><li>B：发送任务进入阻塞态</li><li>C：接收任务得以执行，得到信号量，打印OK；再次去获得信号量时，进入阻塞状态</li><li>在发送任务的vTaskDelay退出之前，运行的是空闲任务：现在发送任务、接收任务都阻塞了</li><li>D：发送任务再次运行，连续3次释放二进制信号量，只有第1次成功</li><li>E：发送任务进入阻塞态</li><li>F：接收任务被唤醒，得到信号量，打印OK；再次去获得信号量时，进入阻塞状态</li></ul><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-6/03_binarysemaphore_code.png" alt="image-20210804173529563"></p><p>运行结果如下图所示，即使发送任务连续释放多个信号量，也只能成功1次。释放、获得信号量是一一对应的。</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-6/02_binarysemaphore_example1.png" alt="image-20210804172926880"></p><h2 id="_6-4-示例13-防止数据丢失" tabindex="-1"><a class="header-anchor" href="#_6-4-示例13-防止数据丢失" aria-hidden="true">#</a> 6.4 示例13: 防止数据丢失</h2><p>本节代码为： <code>FreeRTOS_13_semaphore_circle_buffer</code> 。</p><p>在示例12中，发送任务发出3次&quot;提醒&quot;，但是接收任务只接收到1次&quot;提醒&quot;，其中2次&quot;提醒&quot;丢失了。</p><p>这种情况很常见，比如每接收到一个串口字符，串口中断程序就给任务发一次&quot;提醒&quot;，假设收到多个字符、发出了多次&quot;提醒&quot;。当任务来处理时，它只能得到1次&quot;提醒&quot;。</p><p>你需要使用其他方法来防止数据丢失，比如：</p><ul><li><p>在串口中断中，把数据放入缓冲区</p></li><li><p>在任务中，一次性把缓冲区中的数据都读出</p></li><li><p>简单地说，就是：你提醒了我多次，我太忙只响应你一次，但是我一次性拿走所有数据</p></li></ul><p>main函数中创建了一个二进制信号量，然后创建2个任务：一个用于释放信号量，另一个用于获取信号量，代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 二进制信号量句柄 */</span>
SemaphoreHandle_t xBinarySemaphore<span class="token punctuation">;</span>

<span class="token keyword">int</span> <span class="token function">main</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token punctuation">)</span>
<span class="token punctuation">{</span>
	<span class="token function">prvSetupHardware</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	
    <span class="token comment">/* 创建二进制信号量 */</span>
    xBinarySemaphore <span class="token operator">=</span> <span class="token function">xSemaphoreCreateBinary</span><span class="token punctuation">(</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

	<span class="token keyword">if</span><span class="token punctuation">(</span> xBinarySemaphore <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 创建1个任务用于释放信号量
		 * 优先级为2
		 */</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vSenderTask<span class="token punctuation">,</span> <span class="token string">&quot;Sender&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token comment">/* 创建1个任务用于获取信号量
		 * 优先级为1
		 */</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vReceiverTask<span class="token punctuation">,</span> <span class="token string">&quot;Receiver&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token comment">/* 启动调度器 */</span>
		<span class="token function">vTaskStartScheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">else</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 无法创建二进制信号量 */</span>
	<span class="token punctuation">}</span>

	<span class="token comment">/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */</span>
	<span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>发送任务、接收任务的代码和执行流程如下：</p><ul><li>A：发送任务优先级高，先执行。连续写入3个数据、释放3个信号量：只有1个信号量起作用</li><li>B：发送任务进入阻塞态</li><li>C：接收任务得以执行，得到信号量</li><li>D：接收任务一次性把所有数据取出</li><li>E：接收任务再次尝试获取信号量，进入阻塞状态</li><li>在发送任务的vTaskDelay退出之前，运行的是空闲任务：现在发送任务、接收任务都阻塞了</li><li>F：发送任务再次运行，连续写入3个数据、释放3个信号量：只有1个信号量起作用</li><li>G：发送任务进入阻塞态</li><li>H：接收任务被唤醒，得到信号量，一次性把所有数据取出</li></ul><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-6/04_binarysemaphore_code2.png" alt="image-20210804181129549"></p><p>程序运行结果如下，数据未丢失：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-6/05_binarysemaphore_example2.png" alt="image-20210804180627668"></p><h2 id="_6-5-示例14-使用计数型信号量" tabindex="-1"><a class="header-anchor" href="#_6-5-示例14-使用计数型信号量" aria-hidden="true">#</a> 6.5 示例14: 使用计数型信号量</h2><p>本节代码为： <code>FreeRTOS_14_semaphore_counting</code> 。</p><p>使用计数型信号量时，可以多次释放信号量；当信号量的技术值达到最大时，再次释放信号量就会出错。</p><p>如果信号量计数值为n，就可以连续n次获取信号量，第(n+1)次获取信号量就会阻塞或失败。</p><p>main函数中创建了一个计数型信号量，最大计数值为3，初始值计数值为0；然后创建2个任务：一个用于释放信号量，另一个用于获取信号量，代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 计数型信号量句柄 */</span>
SemaphoreHandle_t xCountingSemaphore<span class="token punctuation">;</span>

<span class="token keyword">int</span> <span class="token function">main</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token punctuation">)</span>
<span class="token punctuation">{</span>
	<span class="token function">prvSetupHardware</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	
    <span class="token comment">/* 创建计数型信号量 */</span>
    xCountingSemaphore <span class="token operator">=</span> <span class="token function">xSemaphoreCreateCounting</span><span class="token punctuation">(</span><span class="token number">3</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

	<span class="token keyword">if</span><span class="token punctuation">(</span> xCountingSemaphore <span class="token operator">!=</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 创建1个任务用于释放信号量
		 * 优先级为2
		 */</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vSenderTask<span class="token punctuation">,</span> <span class="token string">&quot;Sender&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token comment">/* 创建1个任务用于获取信号量
		 * 优先级为1
		 */</span>
		<span class="token function">xTaskCreate</span><span class="token punctuation">(</span> vReceiverTask<span class="token punctuation">,</span> <span class="token string">&quot;Receiver&quot;</span><span class="token punctuation">,</span> <span class="token number">1000</span><span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token constant">NULL</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

		<span class="token comment">/* 启动调度器 */</span>
		<span class="token function">vTaskStartScheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
	<span class="token punctuation">}</span>
	<span class="token keyword">else</span>
	<span class="token punctuation">{</span>
		<span class="token comment">/* 无法创建信号量 */</span>
	<span class="token punctuation">}</span>

	<span class="token comment">/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */</span>
	<span class="token keyword">return</span> <span class="token number">0</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>发送任务、接收任务的代码和执行流程如下：</p><ul><li>A：发送任务优先级高，先执行。连续释放4个信号量：只有前面3次成功，第4次失败</li><li>B：发送任务进入阻塞态</li><li>CDE：接收任务得以执行，得到3个信号量</li><li>F：接收任务试图获得第4个信号量时进入阻塞状态</li><li>在发送任务的vTaskDelay退出之前，运行的是空闲任务：现在发送任务、接收任务都阻塞了</li><li>G：发送任务再次运行，连续释放4个信号量：只有前面3次成功，第4次失败</li><li>H：发送任务进入阻塞态</li><li>IJK：接收任务得以执行，得到3个信号量</li><li>L：接收任务再次获取信号量时进入阻塞状态</li></ul><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-6/06_countingsemaphore_code.png" alt="image-20210804201839632"></p><p>运行结果如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-6/07_countingsemaphore_example.png" alt="image-20210804201958483"></p><h2 id="技术答疑交流" tabindex="-1"><a class="header-anchor" href="#技术答疑交流" aria-hidden="true">#</a> 技术答疑交流</h2>`,91),v={href:"https://forums.100ask.net",target:"_blank",rel:"noopener noreferrer"},m=a("hr",null,null,-1);function k(h,b){const t=s("ExternalLinkIcon"),i=s("center");return l(),o("div",null,[r,a("p",null,[n("在学习中遇到任何问题，请前往我们的技术交流社区留言： "),a("a",v,[n("https://forums.100ask.net"),e(t)])]),m,e(i,null,{default:c(()=>[n("本章完")]),_:1})])}const x=p(d,[["render",k],["__file","chapter6.html.vue"]]);export{x as default};
