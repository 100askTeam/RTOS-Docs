import{_ as l,r as a,o as t,c as d,a as s,b as n,d as e,w as o,e as p}from"./app-a3aa5aa8.js";const u={},r=p(`<h1 id="第十二章-资源管理-resource-management" tabindex="-1"><a class="header-anchor" href="#第十二章-资源管理-resource-management" aria-hidden="true">#</a> 第十二章 资源管理(Resource Management)</h1><p>在前面讲解互斥量时，引入过临界资源的概念。在前面课程里，已经实现了临界资源的互斥访问。</p><p>本章节的内容比较少，只是引入两个功能：屏蔽/使能中断、暂停/恢复调度器。</p><p>要独占式地访问临界资源，有3种方法：</p><ul><li>公平竞争：比如使用互斥量，谁先获得互斥量谁就访问临界资源，这部分内容前面讲过。</li><li>谁要跟我抢，我就灭掉谁： <ul><li>中断要跟我抢？我屏蔽中断</li><li>其他任务要跟我抢？我禁止调度器，不运行任务切换</li></ul><h2 id="_12-1-屏蔽中断" tabindex="-1"><a class="header-anchor" href="#_12-1-屏蔽中断" aria-hidden="true">#</a> 12.1 屏蔽中断</h2></li></ul><p>屏蔽中断有两套宏：任务中使用、ISR中使用：</p><ul><li>任务中使用：<code>taskENTER_CRITICA()/taskEXIT_CRITICAL()</code></li><li>ISR中使用：<code>taskENTER_CRITICAL_FROM_ISR()/taskEXIT_CRITICAL_FROM_ISR()</code></li></ul><h3 id="_12-1-1-在任务中屏蔽中断" tabindex="-1"><a class="header-anchor" href="#_12-1-1-在任务中屏蔽中断" aria-hidden="true">#</a> 12.1.1 在任务中屏蔽中断</h3><p>在任务中屏蔽中断的示例代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 在任务中，当前时刻中断是使能的
 * 执行这句代码后，屏蔽中断
 */</span>
<span class="token function">taskENTER_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 访问临界资源 */</span>

<span class="token comment">/* 重新使能中断 */</span>
<span class="token function">taskEXIT_CRITICAL</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在<code>taskENTER_CRITICA()/taskEXIT_CRITICAL()</code>之间：</p><ul><li>低优先级的中断被屏蔽了：优先级低于、等于<code>configMAX_SYSCALL_INTERRUPT_PRIORITY</code></li><li>高优先级的中断可以产生：优先级高于<code>configMAX_SYSCALL_INTERRUPT_PRIORITY</code><ul><li>但是，这些中断ISR里，不允许使用FreeRTOS的API函数</li></ul></li><li>任务调度依赖于中断、依赖于API函数，所以：这两段代码之间，不会有任务调度产生</li></ul><p>这套<code>taskENTER_CRITICA()/taskEXIT_CRITICAL()</code>宏，是可以递归使用的，它的内部会记录嵌套的深度，只有嵌套深度变为0时，调用<code>taskEXIT_CRITICAL()</code>才会重新使能中断。</p><p>使用<code>taskENTER_CRITICA()/taskEXIT_CRITICAL()</code>来访问临界资源是很粗鲁的方法：</p><ul><li>中断无法正常运行</li><li>任务调度无法进行</li><li>所以，之间的代码要尽可能快速地执行</li></ul><h3 id="_12-1-2-在isr中屏蔽中断" tabindex="-1"><a class="header-anchor" href="#_12-1-2-在isr中屏蔽中断" aria-hidden="true">#</a> 12.1.2 在ISR中屏蔽中断</h3><p>要使用含有&quot;FROM_ISR&quot;后缀的宏，示例代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">vAnInterruptServiceRoutine</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token punctuation">)</span>
<span class="token punctuation">{</span>
    <span class="token comment">/* 用来记录当前中断是否使能 */</span>
    UBaseType_t uxSavedInterruptStatus<span class="token punctuation">;</span>
    
    <span class="token comment">/* 在ISR中，当前时刻中断可能是使能的，也可能是禁止的
     * 所以要记录当前状态, 后面要恢复为原先的状态
     * 执行这句代码后，屏蔽中断
     */</span>
    uxSavedInterruptStatus <span class="token operator">=</span> <span class="token function">taskENTER_CRITICAL_FROM_ISR</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    
    <span class="token comment">/* 访问临界资源 */</span>

    <span class="token comment">/* 恢复中断状态 */</span>
    <span class="token function">taskEXIT_CRITICAL_FROM_ISR</span><span class="token punctuation">(</span> uxSavedInterruptStatus <span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">/* 现在，当前ISR可以被更高优先级的中断打断了 */</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在<code>taskENTER_CRITICA_FROM_ISR()/taskEXIT_CRITICAL_FROM_ISR()</code>之间：</p><ul><li>低优先级的中断被屏蔽了：优先级低于、等于<code>configMAX_SYSCALL_INTERRUPT_PRIORITY</code></li><li>高优先级的中断可以产生：优先级高于<code>configMAX_SYSCALL_INTERRUPT_PRIORITY</code><ul><li>但是，这些中断ISR里，不允许使用FreeRTOS的API函数</li></ul></li><li>任务调度依赖于中断、依赖于API函数，所以：这两段代码之间，不会有任务调度产生</li></ul><h2 id="_12-2-暂停调度器" tabindex="-1"><a class="header-anchor" href="#_12-2-暂停调度器" aria-hidden="true">#</a> 12.2 暂停调度器</h2><p>如果有别的任务来跟你竞争临界资源，你可以把中断关掉：这当然可以禁止别的任务运行，但是这代价太大了。它会影响到中断的处理。</p><p>如果只是禁止别的任务来跟你竞争，不需要关中断，暂停调度器就可以了：在这期间，中断还是可以发生、处理。</p><p>使用这2个函数来暂停、恢复调度器：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token comment">/* 暂停调度器 */</span>
<span class="token keyword">void</span> <span class="token function">vTaskSuspendAll</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 恢复调度器
 * 返回值: pdTRUE表示在暂定期间有更高优先级的任务就绪了
 *        可以不理会这个返回值
 */</span>
BaseType_t <span class="token function">xTaskResumeAll</span><span class="token punctuation">(</span> <span class="token keyword">void</span> <span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>示例代码如下：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token function">vTaskSuspendScheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">/* 访问临界资源 */</span>

<span class="token function">xTaskResumeScheduler</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这套<code>vTaskSuspendScheduler()/xTaskResumeScheduler()</code>宏，是可以递归使用的，它的内部会记录嵌套的深度，只有嵌套深度变为0时，调用<code>taskEXIT_CRITICAL()</code>才会重新使能中断。</p><h2 id="技术答疑交流" tabindex="-1"><a class="header-anchor" href="#技术答疑交流" aria-hidden="true">#</a> 技术答疑交流</h2>`,29),v={href:"https://forums.100ask.net",target:"_blank",rel:"noopener noreferrer"},m=s("hr",null,null,-1);function k(I,_){const i=a("ExternalLinkIcon"),c=a("center");return t(),d("div",null,[r,s("p",null,[n("在学习中遇到任何问题，请前往我们的技术交流社区留言： "),s("a",v,[n("https://forums.100ask.net"),e(i)])]),m,e(c,null,{default:o(()=>[n("本章完")]),_:1})])}const T=l(u,[["render",k],["__file","chapter12.html.vue"]]);export{T as default};