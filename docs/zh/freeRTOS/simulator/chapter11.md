# 第十一章 中断管理(Interrupt Management)

在RTOS中，需要应对各类事件。这些事件很多时候是通过硬件中断产生，怎么处理中断呢？

假设当前系统正在运行Task1时，用户按下了按键，触发了按键中断。这个中断的处理流程如下：

* CPU跳到固定地址去执行代码，这个固定地址通常被称为中断向量，这个跳转时硬件实现的
* 执行代码做什么？

  * 保存现场：Task1被打断，需要先保存Task1的运行环境，比如各类寄存器的值
  * 分辨中断、调用处理函数(这个函数就被称为ISR，interrupt service routine)
  * 恢复现场：继续运行Task1，或者运行其他优先级更高的任务


你要注意到，ISR是在内核中被调用的，ISR执行过程中，用户的任务无法执行。ISR要尽量快，否则：

* 其他低优先级的中断无法被处理：实时性无法保证
* 用户任务无法被执行：系统显得很卡顿 


如果这个硬件中断的处理，就是非常耗费时间呢？对于这类中断的处理就要分为2部分：

* ISR：尽快做些清理、记录工作，然后触发某个任务
* 任务：更复杂的事情放在任务中处理
* 所以：需要ISR和任务之间进行通信


要在FreeRTOS中熟练使用中断，有几个原则要先说明：

* FreeRTOS把任务认为是硬件无关的，任务的优先级由程序员决定，任务何时运行由调度器决定
* ISR虽然也是使用软件实现的，但是它被认为是硬件特性的一部分，因为它跟硬件密切相关
  * 何时执行？由硬件决定
  * 哪个ISR被执行？由硬件决定
* ISR的优先级高于任务：即使是优先级最低的中断，它的优先级也高于任务。任务只有在没有中断的情况下，才能执行。



本章涉及如下内容：

* FreeRTOS的哪些API函数能在ISR中使用
* 怎么把中断的处理分为两部分：ISR、任务
* ISR和任务之间的通信


## 11.1 两套API函数

### 11.1.1 为什么需要两套API

在任务函数中，我们可以调用各类API函数，比如队列操作函数：xQueueSendToBack。但是在ISR中使用这个函数会导致问题，应该使用另一个函数：xQueueSendToBackFromISR，它的函数名含有后缀"FromISR"，表示"从ISR中给队列发送数据"。

FreeRTOS中很多API函数都有两套：一套在任务中使用，另一套在ISR中使用。后者的函数名含有"FromISR"后缀。

为什么要引入两套API函数？

* 很多API函数会导致任务计入阻塞状态：
  * 运行这个函数的**任务**进入阻塞状态
  * 比如写队列时，如果队列已满，可以进入阻塞状态等待一会
* ISR调用API函数时，ISR不是"任务"，ISR不能进入阻塞状态
* 所以，在任务中、在ISR中，这些函数的功能是有差别的



为什么不使用同一套函数，比如在函数里面分辨当前调用者是任务还是ISR呢？示例代码如下：

```c
BaseType_t xQueueSend(...)
{
    if (is_in_isr())
    {
    	/* 把数据放入队列 */
        
        /* 不管是否成功都直接返回 */
    }
    else /* 在任务中 */
    {
    	/* 把数据放入队列 */
        /* 不成功就等待一会再重试 */
    }
}
```

FreeRTOS使用两套函数，而不是使用一套函数，是因为有如下好处：

* 使用同一套函数的话，需要增加额外的判断代码、增加额外的分支，是的函数更长、更复杂、难以测试

* 在任务、ISR中调用时，需要的参数不一样，比如：

  * 在任务中调用：需要指定超时时间，表示如果不成功就阻塞一会
  * 在ISR中调用：不需要指定超时时间，无论是否成功都要即刻返回
  * 如果强行把两套函数揉在一起，会导致参数臃肿、无效

* 移植FreeRTOS时，还需要提供监测上下文的函数，比如`is_in_isr()`

* 有些处理器架构没有办法轻易分辨当前是处于任务中，还是处于ISR中，就需要额外添加更多、更复杂的代码



使用两套函数可以让程序更高效，但是也有一些缺点，比如你要使用第三方库函数时，即会在任务中调用它，也会在ISR总调用它。这个第三方库函数用到了FreeRTOS的API函数，你无法修改库函数。这个问题可以解决：

* 把中断的处理推迟到任务中进行(Defer interrupt  processing)，在任务中调用库函数
* 尝试在库函数中使用"FromISR"函数：
  * 在任务中、在ISR中都可以调用"FromISR"函数
  * 反过来就不行，非FromISR函数无法在ISR中使用
* 第三方库函数也许会提供OS抽象层，自行判断当前环境是在任务还是在ISR中，分别调用不同的函数



### 11.1.2 两套API函数列表

| 类型                        | 在任务中           | 在ISR中                   |
| --------------------------- | ------------------ | ------------------------- |
| 队列(queue)                 | xQueueSendToBack   | xQueueSendToBackFromISR   |
|                             | xQueueSendToFront  | xQueueSendToFrontFromISR  |
|                             | xQueueReceive      | xQueueReceiveFromISR      |
|                             | xQueueOverwrite    | xQueueOverwriteFromISR    |
|                             | xQueuePeek         | xQueuePeekFromISR         |
| 信号量(semaphore)           | xSemaphoreGive     | xSemaphoreGiveFromISR     |
|                             | xSemaphoreTake     | xSemaphoreTakeFromISR     |
| 事件组(event group)         | xEventGroupSetBits | xEventGroupSetBitsFromISR |
|                             | xEventGroupGetBits | xEventGroupGetBitsFromISR |
| 任务通知(task notification) | xTaskNotifyGive    | vTaskNotifyGiveFromISR    |
|                             | xTaskNotify        | xTaskNotifyFromISR        |
| 软件定时器(software timer)  | xTimerStart        | xTimerStartFromISR        |
|                             | xTimerStop         | xTimerStopFromISR         |
|                             | xTimerReset        | xTimerResetFromISR        |
|                             | xTimerChangePeriod | xTimerChangePeriodFromISR |



### 11.1.3 xHigherPriorityTaskWoken参数

xHigherPriorityTaskWoken的含义是：是否有更高优先级的任务被唤醒了。如果为pdTRUE，则意味着后面要进行任务切换。

还是以写队列为例。

任务A调用`xQueueSendToBack()`写队列，有几种情况发生：

* 队列满了，任务A阻塞等待，另一个任务B运行
* 队列没满，任务A成功写入队列，但是它导致另一个任务B被唤醒，任务B的优先级更高：任务B先运行
* 队列没满，任务A成功写入队列，即刻返回

可以看到，在任务中调用API函数可能导致任务阻塞、任务切换，这叫做"context switch"，上下文切换。这个函数可能很长时间才返回，在函数的内部实现了任务切换。



`xQueueSendToBackFromISR()`函数也可能导致任务切换，但是不会在函数内部进行切换，而是返回一个参数：表示是否需要切换，函数原型与用法如下：

```c
/* 
 * 往队列尾部写入数据，此函数可以在中断函数中使用，不可阻塞
 */
BaseType_t xQueueSendToBackFromISR(
                                      QueueHandle_t xQueue,
                                      const void *pvItemToQueue,
                                      BaseType_t *pxHigherPriorityTaskWoken
                                   );

/* 用法示例 */

BaseType_t xHigherPriorityTaskWoken = pdFALSE;
xQueueSendToBackFromISR(xQueue, pvItemToQueue, &xHigherPriorityTaskWoken);

if (xHigherPriorityTaskWoken == pdTRUE)
{
    /* 任务切换 */    
}
```

pxHigherPriorityTaskWoken参数，就是用来保存函数的结果：是否需要切换

* *pxHigherPriorityTaskWoken等于pdTRUE：函数的操作导致更高优先级的任务就绪了，ISR应该进行任务切换
* *pxHigherPriorityTaskWoken等于pdFALSE：没有进行任务切换的必要



为什么不在"FromISR"函数内部进行任务切换，而只是标记一下而已呢？为了效率！示例代码如下：

```c
void XXX_ISR()
{
    int i;
    for (i = 0; i < N; i++)
    {
        xQueueSendToBackFromISR(...); /* 被多次调用 */
    }
}
```

ISR中有可能多次调用"FromISR"函数，如果在"FromISR"内部进行任务切换，会浪费时间。解决方法是：

* 在"FromISR"中标记是否需要切换
* 在ISR返回之前再进行任务切换
* 示例代码如下

```c
void XXX_ISR()
{
    int i;
    BaseType_t xHigherPriorityTaskWoken = pdFALSE;
    
    for (i = 0; i < N; i++)
    {
        xQueueSendToBackFromISR(..., &xHigherPriorityTaskWoken); /* 被多次调用 */
    }
	
    /* 最后再决定是否进行任务切换 */
    if (xHigherPriorityTaskWoken == pdTRUE)
	{
    	/* 任务切换 */    
	}
}
```

上述的例子很常见，比如UART中断：在UART的ISR中读取多个字符，发现收到回车符时才进行任务切换。



在ISR中调用API时不进行任务切换，而只是在"xHigherPriorityTaskWoken"中标记一下，除了效率，还有多种好处：

* 效率高：避免不必要的任务切换
* 让ISR更可控：中断随机产生，在API中进行任务切换的话，可能导致问题更复杂
* 可移植性
* 在Tick中断中，调用`vApplicationTickHook()`：它运行与ISR，只能使用"FromISR"的函数



使用"FromISR"函数时，如果不想使用xHigherPriorityTaskWoken参数，可以设置为NULL。



### 11.1.4 怎么切换任务

FreeRTOS的ISR函数中，使用两个宏进行任务切换：

```c
portEND_SWITCHING_ISR( xHigherPriorityTaskWoken );
或
portYIELD_FROM_ISR( xHigherPriorityTaskWoken );
```

这两个宏做的事情是完全一样的，在老版本的FreeRTOS中，

* `portEND_SWITCHING_ISR`使用汇编实现
* `portYIELD_FROM_ISR`使用C语言实现

新版本都统一使用`portYIELD_FROM_ISR`。

使用示例如下：

```c
void XXX_ISR()
{
    int i;
    BaseType_t xHigherPriorityTaskWoken = pdFALSE;
    
    for (i = 0; i < N; i++)
    {
        xQueueSendToBackFromISR(..., &xHigherPriorityTaskWoken); /* 被多次调用 */
    }
	
    /* 最后再决定是否进行任务切换 
     * xHigherPriorityTaskWoken为pdTRUE时才切换
     */
    portYIELD_FROM_ISR(xHigherPriorityTaskWoken);
}
```



## 11.2 中断的延迟处理

前面讲过，ISR要尽量快，否则：

* 其他低优先级的中断无法被处理：实时性无法保证
* 用户任务无法被执行：系统显得很卡顿 
* 如果运行中断嵌套，这会更复杂，ISR越快执行约有助于中断嵌套



如果这个硬件中断的处理，就是非常耗费时间呢？对于这类中断的处理就要分为2部分：

* ISR：尽快做些清理、记录工作，然后触发某个任务
* 任务：更复杂的事情放在任务中处理

这种处理方式叫"中断的延迟处理"(Deferring interrupt processing)，处理流程如下图所示：

* t1：任务1运行，任务2阻塞
* t2：发生中断，
  * 该中断的ISR函数被执行，任务1被打断
  * ISR函数要尽快能快速地运行，它做一些必要的操作(比如清除中断)，然后唤醒任务2
* t3：在创建任务时设置任务2的优先级比任务1高(这取决于设计者)，所以ISR返回后，运行的是任务2，它要完成中断的处理。任务2就被称为"deferred processing task"，中断的延迟处理任务。
* t4：任务2处理完中断后，进入阻塞态以等待下一个中断，任务1重新运行

![image-20210810092418499](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-11/01_defer_interrupt.png)



## 11.3 中断与任务间的通信

前面讲解过的队列、信号量、互斥量、事件组、任务通知等等方法，都可使用。

要注意的是，在ISR中使用的函数要有"FromISR"后缀。


## 技术答疑交流

在学习中遇到任何问题，请前往我们的技术交流社区留言： [https://forums.100ask.net](https://forums.100ask.net)


---
<center>本章完</center>

