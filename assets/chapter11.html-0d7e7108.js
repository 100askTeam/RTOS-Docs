import{_ as n,o as s,c as a,e}from"./app-a3aa5aa8.js";const t="/assets/image1-57ce4835.png",i="/assets/image2-6791671c.png",p="/assets/image3-40b3b269.png",l="/assets/image4-32b1ce1e.png",c={},u=e('<h1 id="第11章-队列-queue" tabindex="-1"><a class="header-anchor" href="#第11章-队列-queue" aria-hidden="true">#</a> 第11章 队列(queue)</h1><p>队列(queue)可以用于&quot;任务到任务&quot;、&quot;任务到中断&quot;、&quot;中断到任务&quot;直接传输信息。</p><p>本章涉及如下内容：</p><ul><li>怎么创建、清除、删除队列</li><li>队列中消息如何保存</li><li>怎么向队列发送数据、怎么从队列读取数据、怎么覆盖队列的数据</li><li>在队列上阻塞是什么意思</li><li>怎么在多个队列上阻塞</li><li>读写队列时如何影响任务的优先级</li></ul><h2 id="_11-1-队列的特性" tabindex="-1"><a class="header-anchor" href="#_11-1-队列的特性" aria-hidden="true">#</a> 11.1 队列的特性</h2><h3 id="_1-1-1-常规操作" tabindex="-1"><a class="header-anchor" href="#_1-1-1-常规操作" aria-hidden="true">#</a> 1.1.1 常规操作</h3><p>队列的简化操如入下图所示，从此图可知：</p><ul><li>队列可以包含若干个数据：队列中有若干项，这被称为&quot;长度&quot;(length)</li><li>每个数据大小固定</li><li>创建队列时就要指定长度、数据大小</li><li>数据的操作采用先进先出的方法(FIFO，First In First Out)：写数据时放到尾部，读数据时从头部读</li><li>也可以强制写队列头部：覆盖头部数据</li></ul><p><img src="'+t+'" alt=""></p><p>更详细的操作入下图所示：</p><p><img src="'+i+`" alt=""></p><h3 id="_11-1-2-传输数据的两种方法" tabindex="-1"><a class="header-anchor" href="#_11-1-2-传输数据的两种方法" aria-hidden="true">#</a> 11.1.2 传输数据的两种方法</h3><p>使用队列传输数据时有两种方法：</p><ul><li>拷贝：把数据、把变量的值复制进队列里</li><li>引用：把数据、把变量的地址复制进队列里</li></ul><p>FreeRTOS使用拷贝值的方法，这更简单：</p><ul><li>局部变量的值可以发送到队列中，后续即使函数退出、局部变量被回收，也不会影响队列中的数据</li><li>无需分配buffer来保存数据，队列中有buffer</li><li>局部变量可以马上再次使用</li><li>发送任务、接收任务解耦：接收任务不需要知道这数据是谁的、也不需要发送任务来释放数据</li><li>如果数据实在太大，你还是可以使用队列传输它的地址</li><li>队列的空间有FreeRTOS内核分配，无需任务操心</li><li>对于有内存保护功能的系统，如果队列使用引用方法，也就是使用地址，必须确保双方任务对这个地址都有访问权限。使用拷贝方法时，则无此限制：内核有足够的权限，把数据复制进队列、再把数据复制出队列。</li></ul><h3 id="_11-1-3-队列的阻塞访问" tabindex="-1"><a class="header-anchor" href="#_11-1-3-队列的阻塞访问" aria-hidden="true">#</a> 11.1.3 队列的阻塞访问</h3><p>只要知道队列的句柄，谁都可以读、写该队列。任务、ISR都可读、写队列。可以多个任务读写队列。</p><p>任务读写队列时，简单地说：如果读写不成功，则阻塞；可以指定超时时间。口语化地说，就是可以定个闹钟：如果能读写了就马上进入就绪态，否则就阻塞直到超时。</p><p>某个任务读队列时，如果队列没有数据，则该任务可以进入阻塞状态：还可以指定阻塞的时间。如果队列有数据了，则该阻塞的任务会变为就绪态。如果一直都没有数据，则时间到之后它也会进入就绪态。</p><p>既然读取队列的任务个数没有限制，那么当多个任务读取空队列时，这些任务都会进入阻塞状态：有多个任务在等待同一个队列的数据。当队列中有数据时，哪个任务会进入就绪态？</p><ul><li>优先级最高的任务</li><li>如果大家的优先级相同，那等待时间最久的任务会进入就绪态</li></ul><p>跟读队列类似，一个任务要写队列时，如果队列满了，该任务也可以进入阻塞状态：还可以指定阻塞的时间。如果队列有空间了，则该阻塞的任务会变为就绪态。如果一直都没有空间，则时间到之后它也会进入就绪态。</p><p>既然写队列的任务个数没有限制，那么当多个任务写&quot;满队列&quot;时，这些任务都会进入阻塞状态：有多个任务在等待同一个队列的空间。当队列中有空间时，哪个任务会进入就绪态？</p><ul><li>优先级最高的任务</li><li>如果大家的优先级相同，那等待时间最久的任务会进入就绪态</li></ul><h2 id="_11-2-队列函数" tabindex="-1"><a class="header-anchor" href="#_11-2-队列函数" aria-hidden="true">#</a> 11.2 队列函数</h2><p>使用队列的流程：创建队列、写队列、读队列、删除队列。</p><h3 id="_11-2-1-创建" tabindex="-1"><a class="header-anchor" href="#_11-2-1-创建" aria-hidden="true">#</a> 11.2.1 创建</h3><p>队列的创建有两种方法：动态分配内存、静态分配内存，</p><ul><li>动态分配内存：xQueueCreate，队列的内存在函数内部动态分配</li></ul><p>函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code>QueueHandle_t <span class="token function">xQueueCreate</span><span class="token punctuation">(</span> UBaseType_t uxQueueLength<span class="token punctuation">,</span> UBaseType_t uxItemSize <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><table><thead><tr><th><strong>参数</strong></th><th><strong>说明</strong></th></tr></thead><tbody><tr><td>uxQueueLength</td><td>队列长度，最多能存放多少个数据(item)</td></tr><tr><td>uxItemSize</td><td>每个数据(item)的大小：以字节为单位</td></tr><tr><td>返回值</td><td>非0：成功，返回句柄，以后使用句柄来操作队列 NULL：失败，因为内存不足</td></tr></tbody></table><ul><li>静态分配内存：xQueueCreateStatic，队列的内存要事先分配好</li></ul><p>函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code>QueueHandle_t <span class="token function">xQueueCreateStatic</span><span class="token punctuation">(</span><span class="token operator">*</span>
              		UBaseType_t uxQueueLength<span class="token punctuation">,</span><span class="token operator">*</span>
              		UBaseType_t uxItemSize<span class="token punctuation">,</span><span class="token operator">*</span>
              		<span class="token class-name">uint8_t</span> <span class="token operator">*</span>pucQueueStorageBuffer<span class="token punctuation">,</span><span class="token operator">*</span>
              		StaticQueue_t <span class="token operator">*</span>pxQueueBuffer<span class="token operator">*</span>
           		 <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><table><thead><tr><th><strong>参数</strong></th><th><strong>说明</strong></th></tr></thead><tbody><tr><td>uxQueueLength</td><td>队列长度，最多能存放多少个数据(item)</td></tr><tr><td>uxItemSize</td><td>每个数据(item)的大小：以字节为单位</td></tr><tr><td>pucQueueStorageBuffer</td><td>如果uxItemSize非0，pucQueueStorageBuffer必须指向一个uint8_t数组， 此数组大小至少为&quot;uxQueueLength * uxItemSize&quot;</td></tr><tr><td>pxQueueBuffer</td><td>必须执行一个StaticQueue_t结构体，用来保存队列的数据结构</td></tr><tr><td>返回值</td><td>非0：成功，返回句柄，以后使用句柄来操作队列 NULL：失败，因为pxQueueBuffer为NULL</td></tr></tbody></table><p>示例代码：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">// 示例代码</span>
 <span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">QUEUE_LENGTH</span> <span class="token expression"><span class="token number">10</span></span></span>
 <span class="token macro property"><span class="token directive-hash">#</span><span class="token directive keyword">define</span> <span class="token macro-name">ITEM_SIZE</span> <span class="token expression"><span class="token keyword">sizeof</span><span class="token punctuation">(</span> <span class="token class-name">uint32_t</span> <span class="token punctuation">)</span></span></span>
 
 <span class="token comment">// xQueueBuffer用来保存队列结构体</span>
 StaticQueue_t xQueueBuffer<span class="token punctuation">;</span>

<span class="token comment">// ucQueueStorage 用来保存队列的数据</span>

<span class="token comment">// 大小为：队列长度 * 数据大小</span>
 <span class="token class-name">uint8_t</span> ucQueueStorage<span class="token punctuation">[</span> QUEUE_LENGTH <span class="token operator">*</span> ITEM_SIZE <span class="token punctuation">]</span><span class="token punctuation">;</span>

 <span class="token keyword">void</span> <span class="token function">vATask</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token operator">*</span>pvParameters <span class="token punctuation">)</span>
 <span class="token punctuation">{</span>
	QueueHandle_t xQueue1<span class="token punctuation">;</span>

	<span class="token comment">// 创建队列: 可以容纳QUEUE_LENGTH个数据，每个数据大小是ITEM_SIZE</span>
	xQueue1 <span class="token operator">=</span> <span class="token function">xQueueCreateStatic</span><span class="token punctuation">(</span> QUEUE_LENGTH<span class="token punctuation">,</span>
							ITEM_SIZE<span class="token punctuation">,</span>
                            ucQueueStorage<span class="token punctuation">,</span>
                            <span class="token operator">&amp;</span>xQueueBuffer <span class="token punctuation">)</span><span class="token punctuation">;</span> 
  <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_11-2-2-复位" tabindex="-1"><a class="header-anchor" href="#_11-2-2-复位" aria-hidden="true">#</a> 11.2.2 复位</h3><p>队列刚被创建时，里面没有数据；使用过程中可以调用 <strong>xQueueReset()</strong> 把队列恢复为初始状态，此函数原型为：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*  pxQueue : 复位哪个队列;
 * 返回值: pdPASS(必定成功)
*/</span>
BaseType_t <span class="token function">xQueueReset</span><span class="token punctuation">(</span> QueueHandle_t pxQueue<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_11-2-3-删除" tabindex="-1"><a class="header-anchor" href="#_11-2-3-删除" aria-hidden="true">#</a> 11.2.3 删除</h3><p>删除队列的函数为 <strong>vQueueDelete()</strong> ，只能删除使用动态方法创建的队列，它会释放内存。原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">vQueueDelete</span><span class="token punctuation">(</span> QueueHandle_t xQueue <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="_11-2-4-写队列" tabindex="-1"><a class="header-anchor" href="#_11-2-4-写队列" aria-hidden="true">#</a> 11.2.4 写队列</h3><p>可以把数据写到队列头部，也可以写到尾部，这些函数有两个版本：在任务中使用、在ISR中使用。函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 等同于xQueueSendToBack
 * 往队列尾部写入数据，如果没有空间，阻塞时间为xTicksToWait
 */</span>
BaseType_t <span class="token function">xQueueSend</span><span class="token punctuation">(</span>
                                QueueHandle_t    xQueue<span class="token punctuation">,</span>
                                <span class="token keyword">const</span> <span class="token keyword">void</span>       <span class="token operator">*</span>pvItemToQueue<span class="token punctuation">,</span>
                                TickType_t       xTicksToWait
                            <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 
 * 往队列尾部写入数据，如果没有空间，阻塞时间为xTicksToWait
 */</span>
BaseType_t <span class="token function">xQueueSendToBack</span><span class="token punctuation">(</span>
                                QueueHandle_t    xQueue<span class="token punctuation">,</span>
                                <span class="token keyword">const</span> <span class="token keyword">void</span>       <span class="token operator">*</span>pvItemToQueue<span class="token punctuation">,</span>
                                TickType_t       xTicksToWait
                            <span class="token punctuation">)</span><span class="token punctuation">;</span>


<span class="token comment">/* 
 * 往队列尾部写入数据，此函数可以在中断函数中使用，不可阻塞
 */</span>
BaseType_t <span class="token function">xQueueSendToBackFromISR</span><span class="token punctuation">(</span>
                                      QueueHandle_t xQueue<span class="token punctuation">,</span>
                                      <span class="token keyword">const</span> <span class="token keyword">void</span> <span class="token operator">*</span>pvItemToQueue<span class="token punctuation">,</span>
                                      BaseType_t <span class="token operator">*</span>pxHigherPriorityTaskWoken
                                   <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 
 * 往队列头部写入数据，如果没有空间，阻塞时间为xTicksToWait
 */</span>
BaseType_t <span class="token function">xQueueSendToFront</span><span class="token punctuation">(</span>
                                QueueHandle_t    xQueue<span class="token punctuation">,</span>
                                <span class="token keyword">const</span> <span class="token keyword">void</span>       <span class="token operator">*</span>pvItemToQueue<span class="token punctuation">,</span>
                                TickType_t       xTicksToWait
                            <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 
 * 往队列头部写入数据，此函数可以在中断函数中使用，不可阻塞
 */</span>
BaseType_t <span class="token function">xQueueSendToFrontFromISR</span><span class="token punctuation">(</span>
                                      QueueHandle_t xQueue<span class="token punctuation">,</span>
                                      <span class="token keyword">const</span> <span class="token keyword">void</span> <span class="token operator">*</span>pvItemToQueue<span class="token punctuation">,</span>
                                      BaseType_t <span class="token operator">*</span>pxHigherPriorityTaskWoken
                                   <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这些函数用到的参数是类似的，统一说明如下：</p><table><thead><tr><th>参数</th><th>说明</th></tr></thead><tbody><tr><td>xQueue</td><td>队列句柄，要写哪个队列</td></tr><tr><td>pvItemToQueue</td><td>数据指针，这个数据的值会被复制进队列， 复制多大的数据？在创建队列时已经指定了数据大小</td></tr><tr><td>xTicksToWait</td><td>如果队列满则无法写入新数据，可以让任务进入阻塞状态， xTicksToWait表示阻塞的最大时间(Tick Count)。 如果被设为0，无法写入数据时函数会立刻返回； 如果被设为portMAX_DELAY，则会一直阻塞直到有空间可写</td></tr><tr><td>返回值</td><td>pdPASS：数据成功写入了队列 errQUEUE_FULL：写入失败，因为队列满了。</td></tr></tbody></table><h3 id="_11-2-5-读队列" tabindex="-1"><a class="header-anchor" href="#_11-2-5-读队列" aria-hidden="true">#</a> 11.2.5 读队列</h3><p>使用 <strong>xQueueReceive()</strong> 函数读队列，读到一个数据后，队列中该数据会被移除。这个函数有两个版本：在任务中使用、在ISR中使用。函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code>BaseType_t <span class="token function">xQueueReceive</span><span class="token punctuation">(</span> QueueHandle_t xQueue<span class="token punctuation">,</span>
                          <span class="token keyword">void</span> <span class="token operator">*</span> <span class="token keyword">const</span> pvBuffer<span class="token punctuation">,</span>
                          TickType_t xTicksToWait <span class="token punctuation">)</span><span class="token punctuation">;</span>

BaseType_t <span class="token function">xQueueReceiveFromISR</span><span class="token punctuation">(</span>
                                    QueueHandle_t    xQueue<span class="token punctuation">,</span>
                                    <span class="token keyword">void</span>             <span class="token operator">*</span>pvBuffer<span class="token punctuation">,</span>
                                    BaseType_t       <span class="token operator">*</span>pxTaskWoken
                                <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>参数说明如下：</p><table><thead><tr><th><strong>参数</strong></th><th><strong>说明</strong></th></tr></thead><tbody><tr><td>xQueue</td><td>队列句柄，要读哪个队列</td></tr><tr><td>pvBuffer</td><td>bufer指针，队列的数据会被复制到这个buffer 复制多大的数据？在创建队列时已经指定了数据大小</td></tr><tr><td>xTicksToWait</td><td>果队列空则无法读出数据，可以让任务进入阻塞状态， xTicksToWait表示阻塞的最大时间(Tick Count)。 如果被设为0，无法读出数据时函数会立刻返回； 如果被设为portMAX_DELAY，则会一直阻塞直到有数据可写</td></tr><tr><td>返回值</td><td>pdPASS：从队列读出数据入 errQUEUE_EMPTY：读取失败，因为队列空了。</td></tr></tbody></table><h3 id="_11-2-6-查询" tabindex="-1"><a class="header-anchor" href="#_11-2-6-查询" aria-hidden="true">#</a> 11.2.6 查询</h3><p>可以查询队列中有多少个数据、有多少空余空间。函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/*
 * 返回队列中可用数据的个数
 */</span>
UBaseType_t <span class="token function">uxQueueMessagesWaiting</span><span class="token punctuation">(</span> <span class="token keyword">const</span> QueueHandle_t xQueue <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/*
 * 返回队列中可用空间的个数
 */</span>
UBaseType_t <span class="token function">uxQueueSpacesAvailable</span><span class="token punctuation">(</span> <span class="token keyword">const</span> QueueHandle_t xQueue <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_11-2-7-覆盖-偷看" tabindex="-1"><a class="header-anchor" href="#_11-2-7-覆盖-偷看" aria-hidden="true">#</a> 11.2.7 覆盖/偷看</h3><p>当队列长度为1时，可以使用 <strong>xQueueOverwrite()</strong> 或 <strong>xQueueOverwriteFromISR()</strong> 来覆盖数据。</p><p>注意，队列长度必须为1。当队列满时，这些函数会覆盖里面的数据，这也以为着这些函数不会被阻塞。</p><p>函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 覆盖队列
 * xQueue: 写哪个队列
 * pvItemToQueue: 数据地址
 * 返回值: pdTRUE表示成功, pdFALSE表示失败
 */</span>
BaseType_t <span class="token function">xQueueOverwrite</span><span class="token punctuation">(</span>
                           QueueHandle_t xQueue<span class="token punctuation">,</span>
                           <span class="token keyword">const</span> <span class="token keyword">void</span> <span class="token operator">*</span> pvItemToQueue
                      <span class="token punctuation">)</span><span class="token punctuation">;</span>

BaseType_t <span class="token function">xQueueOverwriteFromISR</span><span class="token punctuation">(</span>
                           QueueHandle_t xQueue<span class="token punctuation">,</span>
                           <span class="token keyword">const</span> <span class="token keyword">void</span> <span class="token operator">*</span> pvItemToQueue<span class="token punctuation">,</span>
                           BaseType_t <span class="token operator">*</span>pxHigherPriorityTaskWoken
                      <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>如果想让队列中的数据供多方读取，也就是说读取时不要移除数据，要留给后来人。那么可以使用&quot;窥视&quot;，也就是<strong>xQueuePeek()<strong>或</strong>xQueuePeekFromISR()</strong>。这些函数会从队列中复制出数据，但是不移除数据。这也意味着，如果队列中没有数据，那么&quot;偷看&quot;时会导致阻塞；一旦队列中有数据，以后每次&quot;偷看&quot;都会成功。</p><p>函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 偷看队列
 * xQueue: 偷看哪个队列
 * pvItemToQueue: 数据地址, 用来保存复制出来的数据
 * xTicksToWait: 没有数据的话阻塞一会
 * 返回值: pdTRUE表示成功, pdFALSE表示失败
 */</span>
BaseType_t <span class="token function">xQueuePeek</span><span class="token punctuation">(</span>
                          QueueHandle_t xQueue<span class="token punctuation">,</span>
                          <span class="token keyword">void</span> <span class="token operator">*</span> <span class="token keyword">const</span> pvBuffer<span class="token punctuation">,</span>
                          TickType_t xTicksToWait
                      <span class="token punctuation">)</span><span class="token punctuation">;</span>

BaseType_t <span class="token function">xQueuePeekFromISR</span><span class="token punctuation">(</span>
                                 QueueHandle_t xQueue<span class="token punctuation">,</span>
                                 <span class="token keyword">void</span> <span class="token operator">*</span>pvBuffer<span class="token punctuation">,</span>
                             <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_11-3-示例-队列的基本使用" tabindex="-1"><a class="header-anchor" href="#_11-3-示例-队列的基本使用" aria-hidden="true">#</a> 11.3 示例: 队列的基本使用</h2><p>本节代码为：13_queue_game。以前使用环形缓冲区传输红外遥控器的数据，本程序改为使用队列。</p><h3 id="_11-3-1-程序框架" tabindex="-1"><a class="header-anchor" href="#_11-3-1-程序框架" aria-hidden="true">#</a> 11.3.1 程序框架</h3><p>01_game_template使用轮询的方式从环形缓冲区读取红外遥控器的键值，13_queue_game把环形缓冲区改为队列。</p><p>13_queue_game程序的框架如下：</p><p><img src="`+p+`" alt=""></p><p>game1_task：游戏的主要逻辑判断，每次循环就移动一下球，判断球是否跟边沿、砖块、挡球板相碰，进而调整球的移动方向、消减砖块、统计分数。</p><p>platform_task：挡球板任务，根据遥控器左右移动挡球板。</p><p>IRReceiver_IRQ_Callback解析出遥控器键值后，写队列g_xQueuePlatform。</p><h3 id="_11-3-2-源码分析" tabindex="-1"><a class="header-anchor" href="#_11-3-2-源码分析" aria-hidden="true">#</a> 11.3.2 源码分析</h3><p>IRReceiver_IRQ_Callback中断回调函数里，识别出红外遥控键值后，构造一个struct input_data结构体，然后使用xQueueSendFromISR函数把它写入队列g_xQueuePlatform。</p><p>写队列的代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">struct</span> <span class="token class-name">input_data</span> idata<span class="token punctuation">;</span>

idata<span class="token punctuation">.</span>dev <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>

idata<span class="token punctuation">.</span>val <span class="token operator">=</span> <span class="token number">0</span><span class="token punctuation">;</span>	

<span class="token function">xQueueSendToBackFromISR</span><span class="token punctuation">(</span>g_xQueuePlatform<span class="token punctuation">,</span> <span class="token operator">&amp;</span>idata<span class="token punctuation">,</span> <span class="token constant">NULL</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

挡球板任务从队列g_xQueuePlatform中读取数据，操作挡球板。代码如下：

<span class="token number">01</span> <span class="token comment">/* 挡球板任务 */</span>

<span class="token number">02</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">platform_task</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>params<span class="token punctuation">)</span>

<span class="token number">03</span> <span class="token punctuation">{</span>

<span class="token number">04</span>   byte platformXtmp <span class="token operator">=</span> platformX<span class="token punctuation">;</span>   

<span class="token number">05</span>   <span class="token class-name">uint8_t</span> dev<span class="token punctuation">,</span> data<span class="token punctuation">,</span> last_data<span class="token punctuation">;</span>

<span class="token number">06</span>	 <span class="token keyword">struct</span> <span class="token class-name">input_data</span> idata<span class="token punctuation">;</span>

<span class="token number">07</span>

<span class="token number">08</span>  <span class="token comment">// Draw platform</span>

<span class="token number">09</span>  <span class="token function">draw_bitmap</span><span class="token punctuation">(</span>platformXtmp<span class="token punctuation">,</span> g_yres <span class="token operator">-</span> <span class="token number">8</span><span class="token punctuation">,</span> platform<span class="token punctuation">,</span> <span class="token number">12</span><span class="token punctuation">,</span> <span class="token number">8</span><span class="token punctuation">,</span> NOINVERT<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">10</span>  <span class="token function">draw_flushArea</span><span class="token punctuation">(</span>platformXtmp<span class="token punctuation">,</span> g_yres <span class="token operator">-</span> <span class="token number">8</span><span class="token punctuation">,</span> <span class="token number">12</span><span class="token punctuation">,</span> <span class="token number">8</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">11</span>  

<span class="token number">12</span>  <span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>

<span class="token number">13</span>  <span class="token punctuation">{</span>

<span class="token number">14</span>    <span class="token comment">/* 读取红外遥控器 */</span>

<span class="token number">15</span>		<span class="token comment">//if (0 == IRReceiver_Read(&amp;dev, &amp;data))</span>

<span class="token number">16</span>		<span class="token keyword">if</span> <span class="token punctuation">(</span>pdPASS <span class="token operator">==</span> <span class="token function">xQueueReceive</span><span class="token punctuation">(</span>g_xQueuePlatform<span class="token punctuation">,</span> <span class="token operator">&amp;</span>idata<span class="token punctuation">,</span> portMAX_DELAY<span class="token punctuation">)</span><span class="token punctuation">)</span>

<span class="token number">17</span>		<span class="token punctuation">{</span>

<span class="token number">18</span>					 data <span class="token operator">=</span> idata<span class="token punctuation">.</span>val<span class="token punctuation">;</span>

<span class="token number">19</span>      <span class="token keyword">if</span> <span class="token punctuation">(</span>data <span class="token operator">==</span> <span class="token number">0x00</span><span class="token punctuation">)</span>

<span class="token number">20</span>      <span class="token punctuation">{</span>

<span class="token number">21</span>        data <span class="token operator">=</span> last_data<span class="token punctuation">;</span>

<span class="token number">22</span>      <span class="token punctuation">}</span>

<span class="token number">23</span>      

<span class="token number">24</span>      <span class="token keyword">if</span> <span class="token punctuation">(</span>data <span class="token operator">==</span> <span class="token number">0xe0</span><span class="token punctuation">)</span> <span class="token comment">/* Left */</span>

<span class="token number">25</span>      <span class="token punctuation">{</span>

<span class="token number">26</span>        <span class="token function">btnLeft</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">27</span>      <span class="token punctuation">}</span>

<span class="token number">28</span>

<span class="token number">29</span>      <span class="token keyword">if</span> <span class="token punctuation">(</span>data <span class="token operator">==</span> <span class="token number">0x90</span><span class="token punctuation">)</span>  <span class="token comment">/* Right */</span>

<span class="token number">30</span>      <span class="token punctuation">{</span>

<span class="token number">31</span>        <span class="token function">btnRight</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">32</span>      <span class="token punctuation">}</span>

<span class="token number">33</span>      last_data <span class="token operator">=</span> data<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>第15行是原来的代码，它使用轮询的方式读取遥控键值，效率很低。</p><p>第16行开始改为读取队列，如果没有数据，挡球板任务阻塞，在第16行的函数里不出来；当IRReceiver_IRQ_Callback中断回调函数把数据写入队列后，挡球板任务马上被唤醒，从第16行的函数里出来，继续执行后续代码。</p><h3 id="_11-3-3-上机实验" tabindex="-1"><a class="header-anchor" href="#_11-3-3-上机实验" aria-hidden="true">#</a> 11.3.3 上机实验</h3><p>烧录程序后，使用红外遥控器的左、右按键移动挡球板。</p><h2 id="_11-4-示例-使用队列实现多设备输入" tabindex="-1"><a class="header-anchor" href="#_11-4-示例-使用队列实现多设备输入" aria-hidden="true">#</a> 11.4 示例: 使用队列实现多设备输入</h2><p>本节代码为：14_queue_game_multi_input。</p><h2 id="_11-5-队列集" tabindex="-1"><a class="header-anchor" href="#_11-5-队列集" aria-hidden="true">#</a> 11.5 队列集</h2><p>假设有2个输入设备：红外遥控器、旋转编码器，它们的驱动程序应该专注于“产生硬件数据”，不应该跟“业务有任何联系”。比如：红外遥控器驱动程序里，它只应该把键值记录下来、写入某个队列，它不应该把键值转换为游戏的控制键。在红外遥控器的驱动程序里，不应该有游戏相关的代码，这样，切换使用场景时，这个驱动程序还可以继续使用。</p><p>把红外遥控器的按键转换为游戏的控制键，应该在游戏的任务里实现。</p><p>要支持多个输入设备时，我们需要实现一个“InputTask”，它读取各个设备的队列，得到数据后再分别转换为游戏的控制键。</p><p>InputTask如何及时读取到多个队列的数据？要使用队列集。</p><p>队列集的本质也是队列，只不过里面存放的是“队列句柄”。使用过程如下：</p><ul><li>创建队列A，它的长度是n1</li><li>创建队列B，它的长度是n2</li><li>创建队列集S，它的长度是“n1+n2”</li><li>把队列A、B加入队列集S</li><li>这样，写队列A的时候，会顺便把队列A的句柄写入队列集S</li><li>这样，写队列B的时候，会顺便把队列B的句柄写入队列集S</li><li>InputTask先读取队列集S，它的返回值是一个队列句柄，这样就可以知道哪个队列有有数据了；然后InputTask再读取这个队列句柄得到数据。</li></ul><h3 id="_11-5-1-创建队列集" tabindex="-1"><a class="header-anchor" href="#_11-5-1-创建队列集" aria-hidden="true">#</a> 11.5.1 创建队列集</h3><p>函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code>QueueSetHandle_t <span class="token function">xQueueCreateSet</span><span class="token punctuation">(</span> <span class="token keyword">const</span> UBaseType_t uxEventQueueLength <span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><table><thead><tr><th><strong>参数</strong></th><th><strong>说明</strong></th></tr></thead><tbody><tr><td>uxQueueLength</td><td>队列集长度，最多能存放多少个数据(队列句柄)</td></tr><tr><td>返回值</td><td>非0：成功，返回句柄，以后使用句柄来操作队列NULL：失败，因为内存不足</td></tr></tbody></table><h3 id="_11-5-2-把队列加入队列集" tabindex="-1"><a class="header-anchor" href="#_11-5-2-把队列加入队列集" aria-hidden="true">#</a> 11.5.2 把队列加入队列集</h3><p>函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code>BaseType_t <span class="token function">xQueueAddToSet</span><span class="token punctuation">(</span> QueueSetMemberHandle_t xQueueOrSemaphore<span class="token punctuation">,</span>

                QueueSetHandle_t xQueueSet <span class="token punctuation">)</span><span class="token punctuation">;</span>

 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><table><thead><tr><th><strong>参数</strong></th><th><strong>说明</strong></th></tr></thead><tbody><tr><td>xQueueOrSemaphore</td><td>队列句柄，这个队列要加入队列集</td></tr><tr><td>xQueueSet</td><td>队列集句柄</td></tr><tr><td>返回值</td><td>pdTRUE：成功pdFALSE：失败</td></tr></tbody></table><h3 id="_11-5-3-读取队列集" tabindex="-1"><a class="header-anchor" href="#_11-5-3-读取队列集" aria-hidden="true">#</a> 11.5.3 读取队列集</h3><p>函数原型如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code>QueueSetMemberHandle_t <span class="token function">xQueueSelectFromSet</span><span class="token punctuation">(</span> QueueSetHandle_t xQueueSet<span class="token punctuation">,</span>

                        TickType_t <span class="token keyword">const</span> xTicksToWait <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><table><thead><tr><th><strong>参数</strong></th><th><strong>说明</strong></th></tr></thead><tbody><tr><td>xQueueSet</td><td>队列集句柄</td></tr><tr><td>xTicksToWait</td><td>如果队列集空则无法读出数据，可以让任务进入阻塞状态，xTicksToWait表示阻塞的最大时间(Tick Count)。如果被设为0，无法读出数据时函数会立刻返回；如果被设为portMAX_DELAY，则会一直阻塞直到有数据可写</td></tr><tr><td>返回值</td><td>NULL：失败，队列句柄：成功</td></tr></tbody></table><h2 id="_11-6-示例-使用队列集改善程序框架" tabindex="-1"><a class="header-anchor" href="#_11-6-示例-使用队列集改善程序框架" aria-hidden="true">#</a> 11.6 示例: 使用队列集改善程序框架</h2><p>本节代码为：15_queueset_game。</p><h2 id="_11-7-示例12-遥控器数据分发给多个任务" tabindex="-1"><a class="header-anchor" href="#_11-7-示例12-遥控器数据分发给多个任务" aria-hidden="true">#</a> 11.7 示例12: 遥控器数据分发给多个任务</h2><p>本节代码为：17_queue_car_dispatch。</p><h3 id="_11-7-1-程序框架" tabindex="-1"><a class="header-anchor" href="#_11-7-1-程序框架" aria-hidden="true">#</a> 11.7.1 程序框架</h3><p>17_queue_car_dispatch实现了另一个游戏：使用红外遥控器的1、2、3分别控制3辆汽车。</p><p>框架如下：</p><p><img src="`+l+`" alt=""></p><p>car1_task、car2_task、car3_task：创建自己的队列，并注册给devices\\irda\\dev_irda.c；读取队列，根据遥控器键值移动汽车。</p><p>IRReceiver_IRQ_Callback解析出遥控器键值后，写多个队列。</p><h3 id="_11-7-2-源码分析" tabindex="-1"><a class="header-anchor" href="#_11-7-2-源码分析" aria-hidden="true">#</a> 11.7.2 源码分析</h3><p>从上往上分析，任务入口函数代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token number">01</span> <span class="token keyword">static</span> <span class="token keyword">void</span> <span class="token function">CarTask</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>params<span class="token punctuation">)</span>

<span class="token number">02</span> <span class="token punctuation">{</span>

<span class="token number">03</span>	<span class="token keyword">struct</span> <span class="token class-name">car</span> <span class="token operator">*</span>pcar <span class="token operator">=</span> params<span class="token punctuation">;</span>

<span class="token number">04</span>	<span class="token keyword">struct</span> <span class="token class-name">ir_data</span> idata<span class="token punctuation">;</span>

<span class="token number">05</span>	

<span class="token number">06</span>	<span class="token comment">/* 创建自己的队列 */</span>

<span class="token number">07</span>	QueueHandle_t xQueueIR <span class="token operator">=</span> <span class="token function">xQueueCreate</span><span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">,</span> <span class="token keyword">sizeof</span><span class="token punctuation">(</span><span class="token keyword">struct</span> <span class="token class-name">ir_data</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">08</span>	

<span class="token number">09</span>	<span class="token comment">/* 注册队列 */</span>

<span class="token number">10</span>	<span class="token function">RegisterQueueHandle</span><span class="token punctuation">(</span>xQueueIR<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">11</span>

<span class="token number">12</span>	<span class="token comment">/* 显示汽车 */</span>

<span class="token number">13</span>	<span class="token function">ShowCar</span><span class="token punctuation">(</span>pcar<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">14</span>	

<span class="token number">15</span>	<span class="token keyword">while</span> <span class="token punctuation">(</span><span class="token number">1</span><span class="token punctuation">)</span>

<span class="token number">16</span>	<span class="token punctuation">{</span>

<span class="token number">17</span>		<span class="token comment">/* 读取按键值:读队列 */</span>

<span class="token number">18</span>		<span class="token function">xQueueReceive</span><span class="token punctuation">(</span>xQueueIR<span class="token punctuation">,</span> <span class="token operator">&amp;</span>idata<span class="token punctuation">,</span> portMAX_DELAY<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">19</span>		

<span class="token number">20</span>		<span class="token comment">/* 控制汽车往右移动 */</span>

<span class="token number">21</span>		<span class="token keyword">if</span> <span class="token punctuation">(</span>idata<span class="token punctuation">.</span>val <span class="token operator">==</span> pcar<span class="token operator">-&gt;</span>control_key<span class="token punctuation">)</span>

<span class="token number">22</span>		<span class="token punctuation">{</span>

<span class="token number">23</span>			<span class="token keyword">if</span> <span class="token punctuation">(</span>pcar<span class="token operator">-&gt;</span>x <span class="token operator">&lt;</span> g_xres <span class="token operator">-</span> CAR_LENGTH<span class="token punctuation">)</span>

<span class="token number">24</span>			<span class="token punctuation">{</span>

<span class="token number">25</span>				<span class="token comment">/* 隐藏汽车 */</span>

<span class="token number">26</span>				<span class="token function">HideCar</span><span class="token punctuation">(</span>pcar<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">27</span>				

<span class="token number">28</span>				<span class="token comment">/* 调整位置 */</span>

<span class="token number">29</span>				pcar<span class="token operator">-&gt;</span>x <span class="token operator">+=</span> <span class="token number">20</span><span class="token punctuation">;</span>

<span class="token number">30</span>				<span class="token keyword">if</span> <span class="token punctuation">(</span>pcar<span class="token operator">-&gt;</span>x <span class="token operator">&gt;</span> g_xres <span class="token operator">-</span> CAR_LENGTH<span class="token punctuation">)</span>

<span class="token number">31</span>				<span class="token punctuation">{</span>

<span class="token number">32</span>					pcar<span class="token operator">-&gt;</span>x <span class="token operator">=</span> g_xres <span class="token operator">-</span> CAR_LENGTH<span class="token punctuation">;</span>

<span class="token number">33</span>				<span class="token punctuation">}</span>

<span class="token number">34</span>				

<span class="token number">35</span>				<span class="token comment">/* 重新显示汽车 */</span>

<span class="token number">36</span>				<span class="token function">ShowCar</span><span class="token punctuation">(</span>pcar<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token number">37</span>		  <span class="token punctuation">}</span>

<span class="token number">38</span>	  <span class="token punctuation">}</span>

<span class="token number">39</span>   <span class="token punctuation">}</span>

<span class="token number">40</span> <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>第07行创建自己的队列，第10行把这个队列注册进底层的红外驱动。</p><p>红外驱动程序解析出按键值后，把数据写入多个队列，代码如下：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>	/* 创建3个汽车任务 */

\\#if 0	

	for (i = 0; i &lt; 3; i++)

	{

		draw_bitmap(g_cars[i].x, g_cars[i].y, carImg, 15, 16, NOINVERT, 0);

		draw_flushArea(g_cars[i].x, g_cars[i].y, 15, 16);

	}

\\#endif

  xTaskCreate(CarTask, &quot;car1&quot;, 128, &amp;g_cars[0], osPriorityNormal, NULL);

  xTaskCreate(CarTask, &quot;car2&quot;, 128, &amp;g_cars[1], osPriorityNormal, NULL);

  xTaskCreate(CarTask, &quot;car3&quot;, 128, &amp;g_cars[2], osPriorityNormal, NULL);	

}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_11-7-3-上机实验" tabindex="-1"><a class="header-anchor" href="#_11-7-3-上机实验" aria-hidden="true">#</a> 11.7.3 上机实验</h3><p>烧录程序后，使用红外遥控器的1、2、3按键分别移动三辆汽车。</p>`,122),o=[u];function d(r,v){return s(),a("div",null,o)}const k=n(c,[["render",d],["__file","chapter11.html.vue"]]);export{k as default};
