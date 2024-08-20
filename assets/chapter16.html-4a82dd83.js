import{_ as n,o as s,c as a,e}from"./app-a3aa5aa8.js";const i={},t=e(`<h1 id="第16章-软件定时器-software-timer" tabindex="-1"><a class="header-anchor" href="#第16章-软件定时器-software-timer" aria-hidden="true">#</a> 第16章 软件定时器(software timer)</h1><p>软件定时器就是&quot;闹钟&quot;，你可以设置闹钟，</p><ul><li>在30分钟后让你起床工作</li><li>每隔1小时让你例行检查机器运行情况</li></ul><p>软件定时器也可以完成两类事情：</p><ul><li>在&quot;未来&quot;某个时间点，运行函数</li><li>周期性地运行函数</li></ul><p>日常生活中我们可以定无数个&quot;闹钟&quot;，这无数的&quot;闹钟&quot;要基于一个真实的闹钟。</p><p>在FreeRTOS里，我们也可以设置无数个&quot;软件定时器&quot;，它们都是基于系统滴答中断(Tick Interrupt)。</p><p>本章涉及如下内容：</p><ul><li>软件定时器的特性</li><li>Daemon Task</li><li>定时器命令队列</li><li>一次性定时器、周期性定时器的差别</li><li>怎么操作定时器：创建、启动、复位、修改周期</li></ul><h2 id="_16-1-软件定时器的特性" tabindex="-1"><a class="header-anchor" href="#_16-1-软件定时器的特性" aria-hidden="true">#</a> 16.1 软件定时器的特性</h2><p>我们在手机上添加闹钟时，需要指定时间、指定类型(一次性的，还是周期性的)、指定做什么事；还有一些过时的、不再使用的闹钟。如下图所示：</p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-16/image1.png" style="zoom:50%;"><p>使用定时器跟使用手机闹钟是类似的：</p><ul><li>指定时间：启动定时器和运行回调函数，两者的间隔被称为定时器的周期(period)。</li><li>指定类型，定时器有两种类型： <ul><li>一次性(One-shot timers)： 这类定时器启动后，它的回调函数只会被调用一次； 可以手工再次启动它，但是不会自动启动它。</li><li>自动加载定时器(Auto-reload timers )： 这类定时器启动后，时间到之后它会自动启动它； 这使得回调函数被周期性地调用。</li></ul></li><li>指定要做什么事，就是指定回调函数</li></ul><p>实际的闹钟分为：有效、无效两类。软件定时器也是类似的，它由两种状态：</p><ul><li>运行(Running、Active)：运行态的定时器，当指定时间到达之后，它的回调函数会被调用</li><li>冬眠(Dormant)：冬眠态的定时器还可以通过句柄来访问它，但是它不再运行，它的回调函数不会被调用</li></ul><p>定时器运行情况示例如下：</p><ul><li>Timer1：它是一次性的定时器，在t1启动，周期是6个Tick。经过6个tick后，在t7执行回调函数。它的回调函数只会被执行一次，然后该定时器进入冬眠状态。</li><li>Timer2：它是自动加载的定时器，在t1启动，周期是5个Tick。每经过5个tick它的回调函数都被执行，比如在t6、t11、t16都会执行。</li></ul><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-16/image2.png" alt=""></p><h2 id="_16-2-软件定时器的上下文" tabindex="-1"><a class="header-anchor" href="#_16-2-软件定时器的上下文" aria-hidden="true">#</a> 16.2 软件定时器的上下文</h2><h3 id="_16-2-1-守护任务" tabindex="-1"><a class="header-anchor" href="#_16-2-1-守护任务" aria-hidden="true">#</a> 16.2.1 守护任务</h3><p>要理解软件定时器API函数的参数，特别是里面的<em>xTicksToWait</em>，需要知道定时器执行的过程。</p><p>FreeRTOS中有一个Tick中断，软件定时器基于Tick来运行。在哪里执行定时器函数？第一印象就是在Tick中断里执行：</p><ul><li>在Tick中断中判断定时器是否超时</li><li>如果超时了，调用它的回调函数</li></ul><p>FreeRTOS是RTOS，它不允许在内核、在中断中执行不确定的代码：如果定时器函数很耗时，会影响整个系统。</p><p>所以，FreeRTOS中，不在Tick中断中执行定时器函数。</p><p>在哪里执行？在某个任务里执行，这个任务就是：RTOS Damemon Task，RTOS守护任务。以前被称为&quot;Timer server&quot;，但是这个任务要做并不仅仅是定时器相关，所以改名为：RTOS Damemon Task。</p><p>当FreeRTOS的配置项<em>configUSE_TIMERS</em>被设置为1时，在启动调度器时，会自动创建RTOS Damemon Task。</p><p>我们自己编写的任务函数要使用定时器时，是通过&quot;定时器命令队列&quot;(timer command queue)和守护任务交互，如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-16/image3.png" alt=""></p><p>守护任务的优先级为：configTIMER_TASK_PRIORITY；定时器命令队列的长度为configTIMER_QUEUE_LENGTH。</p><h3 id="_16-2-2-守护任务的调度" tabindex="-1"><a class="header-anchor" href="#_16-2-2-守护任务的调度" aria-hidden="true">#</a> 16.2.2 守护任务的调度</h3><p>守护任务的调度，跟普通的任务并无差别。当守护任务是当前优先级最高的就绪态任务时，它就可以运行。它的工作有两类：</p><ul><li>处理命令：从命令队列里取出命令、处理</li><li>执行定时器的回调函数</li></ul><p>能否及时处理定时器的命令、能否及时执行定时器的回调函数，严重依赖于守护任务的优先级。下面使用2个例子来演示。</p><p>例子1：守护任务的优先性级较低</p><ul><li>t1：Task1处于运行态，守护任务处于阻塞态。 守护任务在这两种情况下会退出阻塞态切换为就绪态：命令队列中有数据、某个定时器超时了。 至于守护任务能否马上执行，取决于它的优先级。</li><li>t2：Task1调用 <strong>xTimerStart()</strong> 要注意的是，<strong>xTimerStart()</strong> 只是把&quot;start timer&quot;的命令发给&quot;定时器命令队列&quot;，使得守护任务退出阻塞态。 在本例中，Task1的优先级高于守护任务，所以守护任务无法抢占Task1。</li><li>t3：Task1执行完 <strong>xTimerStart()</strong> 但是定时器的启动工作由守护任务来实现，所以*xTimerStart()*返回并不表示定时器已经被启动了。</li><li>t4：Task1由于某些原因进入阻塞态，现在轮到守护任务运行。 守护任务从队列中取出&quot;start timer&quot;命令，启动定时器。</li><li>t5：守护任务处理完队列中所有的命令，再次进入阻塞态。Idel任务时优先级最高的就绪态任务，它执行。</li><li>注意：假设定时器在后续某个时刻tX超时了，超时时间是&quot;tX-t2&quot;，而非&quot;tX-t4&quot;，从 <strong>xTimerStart()</strong> 函数被调用时算起。</li></ul><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-16/image4.png" style="zoom:67%;"><p>例子2：守护任务的优先性级较高</p><ul><li><p>t1：Task1处于运行态，守护任务处于阻塞态。 守护任务在这两种情况下会退出阻塞态切换为就绪态：命令队列中有数据、某个定时器超时了。 至于守护任务能否马上执行，取决于它的优先级。</p></li><li><p>t2：Task1调用<em>xTimerStart()</em> 要注意的是，*xTimerStart()<em>只是把&quot;start timer&quot;的命令发给&quot;定时器命令队列&quot;，使得守护任务退出阻塞态。 在本例中，守护任务的优先级高于Task1，所以守护任务抢占Task1，守护任务开始处理命令队列。 Task1在执行</em>xTimerStart()*的过程中被抢占，这时它无法完成此函数。</p></li><li><p>t3：守护任务处理完命令队列中所有的命令，再次进入阻塞态。 此时Task1是优先级最高的就绪态任务，它开始执行。</p></li><li><p>t4：Task1之前被守护任务抢占，对*xTimerStart()*的调用尚未返回。现在开始继续运行次函数、返回。</p></li><li><p>t5：Task1由于某些原因进入阻塞态，进入阻塞态。Idel任务时优先级最高的就绪态任务，它执行。</p></li></ul><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-16/image5.png" style="zoom:67%;"><p>注意，定时器的超时时间是基于调用 <strong>xTimerStart()</strong> 的时刻tX，而不是基于守护任务处理命令的时刻tY。假设超时时间是10个Tick，超时时间是&quot;tX+10&quot;，而非&quot;tY+10&quot;。</p><h3 id="_16-2-3-回调函数" tabindex="-1"><a class="header-anchor" href="#_16-2-3-回调函数" aria-hidden="true">#</a> 16.2.3 回调函数</h3><p>定时器的回调函数的原型如下：</p><p>void ATimerCallback( TimerHandle_t xTimer );</p><p>定时器的回调函数是在守护任务中被调用的，守护任务不是专为某个定时器服务的，它还要处理其他定时器。</p><p>所以，定时器的回调函数不要影响其他人：</p><ul><li>回调函数要尽快实行，不能进入阻塞状态</li><li>不要调用会导致阻塞的API函数，比如 <strong>vTaskDelay()</strong></li><li>可以调用 <strong>xQueueReceive()</strong> 之类的函数，但是超时时间要设为0：即刻返回，不可阻塞</li></ul><h2 id="_16-3-软件定时器的函数" tabindex="-1"><a class="header-anchor" href="#_16-3-软件定时器的函数" aria-hidden="true">#</a> 16.3 软件定时器的函数</h2><p>根据定时器的状态转换图，就可以知道所涉及的函数：</p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-16/image6.png" style="zoom:67%;"><h3 id="_16-3-1-创建" tabindex="-1"><a class="header-anchor" href="#_16-3-1-创建" aria-hidden="true">#</a> 16.3.1 创建</h3><p>要使用定时器，需要先创建它，得到它的句柄。</p><p>有两种方法创建定时器：动态分配内存、静态分配内存。函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 使用动态分配内存的方法创建定时器
 * pcTimerName:定时器名字, 用处不大, 尽在调试时用到
 * xTimerPeriodInTicks: 周期, 以Tick为单位
 * uxAutoReload: 类型, pdTRUE表示自动加载, pdFALSE表示一次性
 * pvTimerID: 回调函数可以使用此参数, 比如分辨是哪个定时器
 * pxCallbackFunction: 回调函数
 * 返回值: 成功则返回TimerHandle_t, 否则返回NULL
 */</span>
TimerHandle_t <span class="token function">xTimerCreate</span><span class="token punctuation">(</span> <span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span> <span class="token keyword">const</span> pcTimerName<span class="token punctuation">,</span> 
							<span class="token keyword">const</span> TickType_t xTimerPeriodInTicks<span class="token punctuation">,</span>
							<span class="token keyword">const</span> UBaseType_t uxAutoReload<span class="token punctuation">,</span>
							<span class="token keyword">void</span> <span class="token operator">*</span> <span class="token keyword">const</span> pvTimerID<span class="token punctuation">,</span>
							TimerCallbackFunction_t pxCallbackFunction <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 使用静态分配内存的方法创建定时器
 * pcTimerName:定时器名字, 用处不大, 尽在调试时用到
 * xTimerPeriodInTicks: 周期, 以Tick为单位
 * uxAutoReload: 类型, pdTRUE表示自动加载, pdFALSE表示一次性
 * pvTimerID: 回调函数可以使用此参数, 比如分辨是哪个定时器
 * pxCallbackFunction: 回调函数
 * pxTimerBuffer: 传入一个StaticTimer_t结构体, 将在上面构造定时器
 * 返回值: 成功则返回TimerHandle_t, 否则返回NULL
 */</span>
TimerHandle_t <span class="token function">xTimerCreateStatic</span><span class="token punctuation">(</span><span class="token keyword">const</span> <span class="token keyword">char</span> <span class="token operator">*</span> <span class="token keyword">const</span> pcTimerName<span class="token punctuation">,</span>
                                 TickType_t xTimerPeriodInTicks<span class="token punctuation">,</span>
                                 UBaseType_t uxAutoReload<span class="token punctuation">,</span>
                                 <span class="token keyword">void</span> <span class="token operator">*</span> pvTimerID<span class="token punctuation">,</span>
                                 TimerCallbackFunction_t pxCallbackFunction<span class="token punctuation">,</span>
                                 StaticTimer_t <span class="token operator">*</span>pxTimerBuffer <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>回调函数的类型是：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">ATimerCallback</span><span class="token punctuation">(</span> TimerHandle_t xTimer <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">typedef</span> <span class="token keyword">void</span> <span class="token punctuation">(</span><span class="token operator">*</span> TimerCallbackFunction_t<span class="token punctuation">)</span><span class="token punctuation">(</span> TimerHandle_t xTimer <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_16-3-2-删除" tabindex="-1"><a class="header-anchor" href="#_16-3-2-删除" aria-hidden="true">#</a> 16.3.2 删除</h3><p>动态分配的定时器，不再需要时可以删除掉以回收内存。删除函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 删除定时器
 * xTimer: 要删除哪个定时器
 * xTicksToWait: 超时时间
 * 返回值: pdFAIL表示&quot;删除命令&quot;在xTicksToWait个Tick内无法写入队列
 *        pdPASS表示成功
*/</span>
BaseType_t <span class="token function">xTimerDelete</span><span class="token punctuation">(</span> TimerHandle_t xTimer<span class="token punctuation">,</span> TickType_t xTicksToWait <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>定时器的很多API函数，都是通过发送&quot;命令&quot;到命令队列，由守护任务来实现。</p><p>如果队列满了，&quot;命令&quot;就无法即刻写入队列。我们可以指定一个超时时间 <strong>xTicksToWait</strong> ，等待一会。</p><h3 id="_16-3-3-启动-停止" tabindex="-1"><a class="header-anchor" href="#_16-3-3-启动-停止" aria-hidden="true">#</a> 16.3.3 启动/停止</h3><p>启动定时器就是设置它的状态为运行态(Running、Active)。</p><p>停止定时器就是设置它的状态为冬眠(Dormant)，让它不能运行。</p><p>涉及的函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 启动定时器
 * xTimer: 哪个定时器
 * xTicksToWait: 超时时间
 * 返回值: pdFAIL表示&quot;启动命令&quot;在xTicksToWait个Tick内无法写入队列
 *        pdPASS表示成功
 */</span>
BaseType_t <span class="token function">xTimerStart</span><span class="token punctuation">(</span> TimerHandle_t xTimer<span class="token punctuation">,</span> TickType_t xTicksToWait <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 启动定时器(ISR版本)
 * xTimer: 哪个定时器
 * pxHigherPriorityTaskWoken: 向队列发出命令使得守护任务被唤醒,
 *                            如果守护任务的优先级比当前任务的高,
 *                            则&quot;*pxHigherPriorityTaskWoken = pdTRUE&quot;,
 *                            表示需要进行任务调度
 * 返回值: pdFAIL表示&quot;启动命令&quot;无法写入队列
 *        pdPASS表示成功
 */</span>
BaseType_t <span class="token function">xTimerStartFromISR</span><span class="token punctuation">(</span>   TimerHandle_t xTimer<span class="token punctuation">,</span>
                                 BaseType_t <span class="token operator">*</span>pxHigherPriorityTaskWoken <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 停止定时器
 * xTimer: 哪个定时器
 * xTicksToWait: 超时时间
 * 返回值: pdFAIL表示&quot;停止命令&quot;在xTicksToWait个Tick内无法写入队列
 *        pdPASS表示成功
 */</span>
BaseType_t <span class="token function">xTimerStop</span><span class="token punctuation">(</span> TimerHandle_t xTimer<span class="token punctuation">,</span> TickType_t xTicksToWait <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 停止定时器(ISR版本)
 * xTimer: 哪个定时器
 * pxHigherPriorityTaskWoken: 向队列发出命令使得守护任务被唤醒,
 *                            如果守护任务的优先级比当前任务的高,
 *                            则&quot;*pxHigherPriorityTaskWoken = pdTRUE&quot;,
 *                            表示需要进行任务调度
 * 返回值: pdFAIL表示&quot;停止命令&quot;无法写入队列
 *        pdPASS表示成功
 */</span>
BaseType_t <span class="token function">xTimerStopFromISR</span><span class="token punctuation">(</span>    TimerHandle_t xTimer<span class="token punctuation">,</span>
                                 BaseType_t <span class="token operator">*</span>pxHigherPriorityTaskWoken <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注意，这些函数的 <strong>xTicksToWait</strong> 表示的是，把命令写入命令队列的超时时间。命令队列可能已经满了，无法马上把命令写入队列里，可以等待一会。</p><p><strong>xTicksToWait</strong> 不是定时器本身的超时时间，不是定时器本身的&quot;周期&quot;。</p><p>创建定时器时，设置了它的周期(period)。<strong>xTimerStart()</strong> 函数是用来启动定时器。假设调用 <strong>xTimerStart()</strong> 的时刻是tX，定时器的周期是n，那么在<em>tX+n</em>时刻定时器的回调函数被调用。</p><p>如果定时器已经被启动，但是它的函数尚未被执行，再次执行 <strong>xTimerStart()</strong> 函数相当于执行 <strong>xTimerReset()</strong> ，重新设定它的启动时间。</p><h3 id="_16-3-4-复位" tabindex="-1"><a class="header-anchor" href="#_16-3-4-复位" aria-hidden="true">#</a> 16.3.4 复位</h3><p>从定时器的状态转换图可以知道，使用 <strong>xTimerReset()</strong> 函数可以让定时器的状态从冬眠态转换为运行态，相当于使用 <strong>xTimerStart()</strong> 函数。</p><p>如果定时器已经处于运行态，使用 <strong>xTimerReset()</strong> 函数就相当于重新确定超时时间。假设调用 <strong>xTimerReset()</strong> 的时刻是tX，定时器的周期是n，那么<em>tX+n</em>就是重新确定的超时时间。</p><p>复位函数的原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 复位定时器
 * xTimer: 哪个定时器
 * xTicksToWait: 超时时间
 * 返回值: pdFAIL表示&quot;复位命令&quot;在xTicksToWait个Tick内无法写入队列
 *        pdPASS表示成功
 */</span>
BaseType_t <span class="token function">xTimerReset</span><span class="token punctuation">(</span> TimerHandle_t xTimer<span class="token punctuation">,</span> TickType_t xTicksToWait <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 复位定时器(ISR版本)
 * xTimer: 哪个定时器
 * pxHigherPriorityTaskWoken: 向队列发出命令使得守护任务被唤醒,
 *                            如果守护任务的优先级比当前任务的高,
 *                            则&quot;*pxHigherPriorityTaskWoken = pdTRUE&quot;,
 *                            表示需要进行任务调度
 * 返回值: pdFAIL表示&quot;停止命令&quot;无法写入队列
 *        pdPASS表示成功
 */</span>
BaseType_t <span class="token function">xTimerResetFromISR</span><span class="token punctuation">(</span>   TimerHandle_t xTimer<span class="token punctuation">,</span>
                                 BaseType_t <span class="token operator">*</span>pxHigherPriorityTaskWoken <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_16-3-5-修改周期" tabindex="-1"><a class="header-anchor" href="#_16-3-5-修改周期" aria-hidden="true">#</a> 16.3.5 修改周期</h3><p>从定时器的状态转换图可以知道，使用 <strong>xTimerChangePeriod()</strong> 函数，处理能修改它的周期外，还可以让定时器的状态从冬眠态转换为运行态。</p><p>修改定时器的周期时，会使用新的周期重新计算它的超时时间。假设调用 <strong>xTimerChangePeriod()</strong> 函数的时间tX，新的周期是n，则<em>tX+n</em>就是新的超时时间。</p><p>相关函数的原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 修改定时器的周期
 * xTimer: 哪个定时器
 * xNewPeriod: 新周期
 * xTicksToWait: 超时时间, 命令写入队列的超时时间 
 * 返回值: pdFAIL表示&quot;修改周期命令&quot;在xTicksToWait个Tick内无法写入队列
 *        pdPASS表示成功
 */</span>
BaseType_t <span class="token function">xTimerChangePeriod</span><span class="token punctuation">(</span>   TimerHandle_t xTimer<span class="token punctuation">,</span>
                                 TickType_t xNewPeriod<span class="token punctuation">,</span>
                                 TickType_t xTicksToWait <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 修改定时器的周期
 * xTimer: 哪个定时器
 * xNewPeriod: 新周期
 * pxHigherPriorityTaskWoken: 向队列发出命令使得守护任务被唤醒,
 *                            如果守护任务的优先级比当前任务的高,
 *                            则&quot;*pxHigherPriorityTaskWoken = pdTRUE&quot;,
 *                            表示需要进行任务调度
 * 返回值: pdFAIL表示&quot;修改周期命令&quot;在xTicksToWait个Tick内无法写入队列
 *        pdPASS表示成功
 */</span>
BaseType_t <span class="token function">xTimerChangePeriodFromISR</span><span class="token punctuation">(</span> TimerHandle_t xTimer<span class="token punctuation">,</span>
                                      TickType_t xNewPeriod<span class="token punctuation">,</span>
                                      BaseType_t <span class="token operator">*</span>pxHigherPriorityTaskWoken <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_16-3-6-定时器id" tabindex="-1"><a class="header-anchor" href="#_16-3-6-定时器id" aria-hidden="true">#</a> 16.3.6 定时器ID</h3><p>定时器的结构体如下，里面有一项 <strong>pvTimerID</strong> ，它就是定时器ID：</p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-16/image7.png" style="zoom:150%;"><p>怎么使用定时器ID，完全由程序来决定：</p><ul><li>可以用来标记定时器，表示自己是什么定时器</li><li>可以用来保存参数，给回调函数使用</li></ul><p>它的初始值在创建定时器时由 <strong>xTimerCreate()</strong> 这类函数传入，后续可以使用这些函数来操作：</p><ul><li>更新ID：使用 <strong>vTimerSetTimerID()</strong> 函数</li><li>查询ID：查询 <strong>pvTimerGetTimerID()</strong> 函数</li></ul><p>这两个函数不涉及命令队列，它们是直接操作定时器结构体。</p><p>函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 获得定时器的ID
 * xTimer: 哪个定时器
 * 返回值: 定时器的ID
 */</span>
<span class="token keyword">void</span> <span class="token operator">*</span><span class="token function">pvTimerGetTimerID</span><span class="token punctuation">(</span> TimerHandle_t xTimer <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 设置定时器的ID
 * xTimer: 哪个定时器
 * pvNewID: 新ID
 * 返回值: 无
 */</span>
<span class="token keyword">void</span> <span class="token function">vTimerSetTimerID</span><span class="token punctuation">(</span> TimerHandle_t xTimer<span class="token punctuation">,</span> <span class="token keyword">void</span> <span class="token operator">*</span>pvNewID <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_16-4-示例-实现游戏音效" tabindex="-1"><a class="header-anchor" href="#_16-4-示例-实现游戏音效" aria-hidden="true">#</a> 16.4 示例: 实现游戏音效</h2><p>本节代码为：28_timer_game_sound，主要看nwatch\\beep.c。</p><p>对于无源蜂鸣器，只要设置PWM输出方波，它就会发出声音。在game1游戏中，什么时候发出声音？球与挡球板、转块碰撞时发出声音。什么时候停止声音？发出声音后，过一阵子就应该停止声音。这使用软件定时器来实现。</p><p>在初始化蜂鸣器时，创建定时器，代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token number">25</span> <span class="token keyword">static</span> TimerHandle_t g_TimerSound<span class="token punctuation">;</span>

<span class="token comment">/* 省略 */</span>

<span class="token number">52</span> <span class="token keyword">void</span> <span class="token function">buzzer_init</span><span class="token punctuation">(</span><span class="token keyword">void</span><span class="token punctuation">)</span>

<span class="token number">53</span> <span class="token punctuation">{</span>

<span class="token number">54</span>   <span class="token comment">/* 初始化蜂鸣器 */</span>

<span class="token number">55</span>   <span class="token function">PassiveBuzzer_Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">56</span>

<span class="token number">57</span>   <span class="token comment">/* 创建定时器 */</span>

<span class="token number">58</span>   g_TimerSound <span class="token operator">=</span> <span class="token function">xTimerCreate</span><span class="token punctuation">(</span> <span class="token string">&quot;GameSound&quot;</span><span class="token punctuation">,</span>

<span class="token number">59</span>                           <span class="token number">200</span><span class="token punctuation">,</span>

<span class="token number">60</span>                           pdFALSE<span class="token punctuation">,</span>

<span class="token number">61</span>                           <span class="token constant">NULL</span><span class="token punctuation">,</span>

<span class="token number">62</span>                           GameSoundTimer_Func<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">63</span> <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>想发出声音时，调用buzzer_buzz函数，代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token number">78</span> <span class="token keyword">void</span> <span class="token function">buzzer_buzz</span><span class="token punctuation">(</span><span class="token keyword">int</span> freq<span class="token punctuation">,</span> <span class="token keyword">int</span> time_ms<span class="token punctuation">)</span>

<span class="token number">79</span> <span class="token punctuation">{</span>

<span class="token number">80</span>   <span class="token function">PassiveBuzzer_Set_Freq_Duty</span><span class="token punctuation">(</span>freq<span class="token punctuation">,</span> <span class="token number">50</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">81</span>

<span class="token number">82</span>   <span class="token comment">/* 启动定时器 */</span>

<span class="token number">83</span>   <span class="token function">xTimerChangePeriod</span><span class="token punctuation">(</span>g_TimerSound<span class="token punctuation">,</span> time_ms<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">84</span> <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>第80行：设置PWM频率。</p><p>第83行：启动定时器。</p><p>当定时器超时后，GameSoundTimer_Func函数被调用，它会停止蜂鸣器，代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token number">37</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">GameSoundTimer_Func</span><span class="token punctuation">(</span> TimerHandle_t xTimer <span class="token punctuation">)</span>

<span class="token number">38</span> <span class="token punctuation">{</span>

<span class="token number">39</span>   <span class="token function">PassiveBuzzer_Control</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">40</span> <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>game1里如何使用音效？先初始化，代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token number">297</span> <span class="token keyword">void</span> <span class="token function">game1_task</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>params<span class="token punctuation">)</span>

<span class="token number">298</span> <span class="token punctuation">{</span>		  

<span class="token number">299</span>	g_framebuffer <span class="token operator">=</span> <span class="token function">LCD_GetFrameBuffer</span><span class="token punctuation">(</span><span class="token operator">&amp;</span>g_xres<span class="token punctuation">,</span> <span class="token operator">&amp;</span>g_yres<span class="token punctuation">,</span> <span class="token operator">&amp;</span>g_bpp<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">300</span>	<span class="token function">draw_init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">301</span>	<span class="token function">draw_end</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">302</span>	

<span class="token number">303</span>	<span class="token function">buzzer_init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>第303行：初始化蜂鸣器。</p><p>game1里使用buzzer_buzz函数发出声音，比如碰到砖块时：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token number">412</span>        <span class="token function">buzzer_buzz</span><span class="token punctuation">(</span><span class="token number">2000</span><span class="token punctuation">,</span> <span class="token number">100</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>第412行会发出2000Hz的声音，维持100ms。</p>`,108),p=[t];function l(c,o){return s(),a("div",null,p)}const u=n(i,[["render",l],["__file","chapter16.html.vue"]]);export{u as default};
