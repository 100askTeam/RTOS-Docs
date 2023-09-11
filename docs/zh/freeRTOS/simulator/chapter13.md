# 第十三章 调试方法（调试与优化）

本节视频源码为：`28_freertos_example_stats`

## 13.1 调试

FreeRTOS提供了很多调试手段：

* 打印
* 断言：`configASSERT  `
* Trace
* Hook函数(回调函数)


### 13.1.1 打印

printf：FreeRTOS工程里使用了microlib，里面实现了printf函数。

我们只需实现一下函数即可使用printf：

```c
int fputc( int ch, FILE *f );
```



### 13.1.2 断言

一般的C库里面，断言就是一个函数：

```c
void assert(scalar expression);
```

它的作用是：确认expression必须为真，如果expression为假的话就中止程序。

在FreeRTOS里，使用`configASSERT()`，比如：

```c
#define configASSERT(x)  if (!x) while(1);
```

我们可以让它提供更多信息，比如：

```c
#define configASSERT(x)  \
	if (!x) \
	{
		printf("%s %s %d\r\n", __FILE__, __FUNCTION__, __LINE__); \
        while(1); \
 	}
```



configASSERT(x)中，如果x为假，表示发生了很严重的错误，必须停止系统的运行。

它用在很多场合，比如：

* 队列操作

  ```c
  BaseType_t xQueueGenericSend( QueueHandle_t xQueue,
                                const void * const pvItemToQueue,
                                TickType_t xTicksToWait,
                                const BaseType_t xCopyPosition )
  {
      BaseType_t xEntryTimeSet = pdFALSE, xYieldRequired;
      TimeOut_t xTimeOut;
      Queue_t * const pxQueue = xQueue;
  
      configASSERT( pxQueue );
      configASSERT(!((pvItemToQueue == NULL) && (pxQueue->uxItemSize != (UBaseType_t)0U)));
      configASSERT( !((xCopyPosition == queueOVERWRITE) && (pxQueue->uxLength != 1 )));
  ```

  

* 中断级别的判断

  ```c
  void vPortValidateInterruptPriority( void )
  {
  	uint32_t ulCurrentInterrupt;
  	uint8_t ucCurrentPriority;
  
  	/* Obtain the number of the currently executing interrupt. */
  	ulCurrentInterrupt = vPortGetIPSR();
  
  	/* Is the interrupt number a user defined interrupt? */
  	if( ulCurrentInterrupt >= portFIRST_USER_INTERRUPT_NUMBER )
  	{
  		/* Look up the interrupt's priority. */
  		ucCurrentPriority = pcInterruptPriorityRegisters[ ulCurrentInterrupt ];
  
  		configASSERT( ucCurrentPriority >= ucMaxSysCallPriority );
  	}
  ```

  



### 13.1.3 Trace

FreeRTOS中定义了很多trace开头的宏，这些宏被放在系统个关键位置。

它们一般都是空的宏，这不会影响代码：不影响编程处理的程序大小、不影响运行时间。

我们要调试某些功能时，可以修改宏：修改某些标记变量、打印信息等待。

| trace宏                                     | 描述                                                         |
| ------------------------------------------- | ------------------------------------------------------------ |
| traceTASK_INCREMENT_TICK(xTickCount)        | 当tick计数自增之前此宏函数被调用。参数xTickCount当前的Tick值，它还没有增加。 |
| traceTASK_SWITCHED_OUT()                    | vTaskSwitchContext中，把当前任务切换出去之前调用此宏函数。   |
| traceTASK_SWITCHED_IN()                     | vTaskSwitchContext中，新的任务已经被切换进来了，就调用此函数。 |
| traceBLOCKING_ON_QUEUE_RECEIVE(pxQueue)     | 当正在执行的当前任务因为试图去读取一个空的队列、信号或者互斥量而进入阻塞状态时，此函数会被立即调用。参数pxQueue保存的是试图读取的目标队列、信号或者互斥量的句柄，传递给此宏函数。 |
| traceBLOCKING_ON_QUEUE_SEND(pxQueue)        | 当正在执行的当前任务因为试图往一个已经写满的队列或者信号或者互斥量而进入了阻塞状态时，此函数会被立即调用。参数pxQueue保存的是试图写入的目标队列、信号或者互斥量的句柄，传递给此宏函数。 |
| traceQUEUE_SEND(pxQueue)                    | 当一个队列或者信号发送成功时，此宏函数会在内核函数xQueueSend(),xQueueSendToFront(),xQueueSendToBack(),以及所有的信号give函数中被调用，参数pxQueue是要发送的目标队列或信号的句柄，传递给此宏函数。 |
| traceQUEUE_SEND_FAILED(pxQueue)             | 当一个队列或者信号发送失败时，此宏函数会在内核函数xQueueSend(),xQueueSendToFront(),xQueueSendToBack(),以及所有的信号give函数中被调用，参数pxQueue是要发送的目标队列或信号的句柄，传递给此宏函数。 |
| traceQUEUE_RECEIVE(pxQueue)                 | 当读取一个队列或者接收信号成功时，此宏函数会在内核函数xQueueReceive()以及所有的信号take函数中被调用，参数pxQueue是要接收的目标队列或信号的句柄，传递给此宏函数。 |
| traceQUEUE_RECEIVE_FAILED(pxQueue)          | 当读取一个队列或者接收信号失败时，此宏函数会在内核函数xQueueReceive()以及所有的信号take函数中被调用，参数pxQueue是要接收的目标队列或信号的句柄，传递给此宏函数。 |
| traceQUEUE_SEND_FROM_ISR(pxQueue)           | 当在中断中发送一个队列成功时，此函数会在xQueueSendFromISR()中被调用。参数pxQueue是要发送的目标队列的句柄。 |
| traceQUEUE_SEND_FROM_ISR_FAILED(pxQueue)    | 当在中断中发送一个队列失败时，此函数会在xQueueSendFromISR()中被调用。参数pxQueue是要发送的目标队列的句柄。 |
| traceQUEUE_RECEIVE_FROM_ISR(pxQueue)        | 当在中断中读取一个队列成功时，此函数会在xQueueReceiveFromISR()中被调用。参数pxQueue是要发送的目标队列的句柄。 |
| traceQUEUE_RECEIVE_FROM_ISR_FAILED(pxQueue) | 当在中断中读取一个队列失败时，此函数会在xQueueReceiveFromISR()中被调用。参数pxQueue是要发送的目标队列的句柄。 |
| traceTASK_DELAY_UNTIL()                     | 当一个任务因为调用了vTaskDelayUntil()进入了阻塞状态的前一刻此宏函数会在vTaskDelayUntil()中被立即调用。 |
| traceTASK_DELAY()                           | 当一个任务因为调用了vTaskDelay()进入了阻塞状态的前一刻此宏函数会在vTaskDelay中被立即调用。 |






### 13.1.4 Malloc Hook函数

编程时，一般的逻辑错误都容易解决。难以处理的是内存越界、栈溢出等。

内存越界经常发生在堆的使用过程总：堆，就是使用malloc得到的内存。

并没有很好的方法检测内存越界，但是可以提供一些回调函数：

* 使用pvPortMalloc失败时，如果在FreeRTOSConfig.h里配置`configUSE_MALLOC_FAILED_HOOK`为1，会调用：

  ```c
  void vApplicationMallocFailedHook( void );
  ```



### 13.1.5 栈溢出Hook函数

在切换任务(vTaskSwitchContext)时调用taskCHECK_FOR_STACK_OVERFLOW来检测栈是否溢出，如果溢出会调用：

```c
void vApplicationStackOverflowHook( TaskHandle_t xTask, char * pcTaskName );
```



怎么判断栈溢出？有两种方法：

* 方法1：

  * 当前任务被切换出去之前，它的整个运行现场都被保存在栈里，这时**很可能**就是它对栈的使用到达了峰值。
  * 这方法很高效，但是并不精确
  * 比如：任务在运行过程中调用了函数A大量地使用了栈，调用完函数A后才被调度。

  ![image-20211201140733494](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-13/01_stack_overflow_1.png)



* 方法2：

  * 创建任务时，它的栈被填入固定的值，比如：0xa5

  * 检测栈里最后16字节的数据，如果不是0xa5的话表示栈即将、或者已经被用完了

  * 没有方法1快速，但是也足够快

  * 能捕获**几乎所有**的栈溢出

  * 为什么是几乎所有？可能有些函数使用栈时，非常凑巧地把栈设置为0xa5：几乎不可能

    ![image-20211201142000612](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-13/02_stack_overflow_2.png)



## 13.2 优化

在Windows中，当系统卡顿时我们可以查看任务管理器找到最消耗CPU资源的程序。

在FreeRTOS中，我们也可以查看任务使用CPU的情况、使用栈的情况，然后针对性地进行优化。

这就是查看"任务的统计"信息。



### 13.2.1 栈使用情况

在创建任务时分配了栈，可以填入固定的数值比如0xa5，以后可以使用以下函数查看"栈的高水位"，也就是还有多少空余的栈空间：

```c
UBaseType_t uxTaskGetStackHighWaterMark( TaskHandle_t xTask );
```

原理是：从栈底往栈顶逐个字节地判断，它们的值持续是0xa5就表示它是空闲的。

函数说明：

| 参数/返回值 | 说明                                                         |
| ----------- | ------------------------------------------------------------ |
| xTask       | 哪个任务                                                     |
| 返回值      | 任务运行时、任务被切换时，都会用到栈。栈里原来值(0xa5)就会被覆盖。<br />逐个函数从栈的尾部判断栈的值连续为0xa5的个数，<br />它就是任务运行过程中空闲内存容量的最小值。<br />注意：假设从栈尾开始连续为0xa5的栈空间是N字节，返回值是N/4。 |



### 13.2.2 任务运行时间统计

对于同优先级的任务，它们按照时间片轮流运行：你执行一个Tick，我执行一个Tick。

是否可以在Tick中断函数中，统计当前任务的累计运行时间？

不行！很不精确，因为有更高优先级的任务就绪时，当前任务还没运行一个完整的Tick就被抢占了。

我们需要比Tick更快的时钟，比如Tick周期时1ms，我们可以使用另一个定时器，让它发生中断的周期时0.1ms甚至更短。

使用这个定时器来衡量一个任务的运行时间，原理如下图所示：

![image-20211201150333865](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-13/03_task_statistics.png)



* 切换到Task1时，使用更快的定时器记录当前时间T1
* Task1被切换出去时，使用更快的定时器记录当前时间T4
* (T4-T1)就是它运行的时间，累加起来
* 关键点：在`vTaskSwitchContext`函数中，使用**更快的定时器**统计运行时间



### 13.2.3 涉及的代码

* 配置

  ```c
  #define configGENERATE_RUN_TIME_STATS 1
  #define configUSE_TRACE_FACILITY    1
  #define configUSE_STATS_FORMATTING_FUNCTIONS  1
  ```

* 实现宏`portCONFIGURE_TIMER_FOR_RUN_TIME_STATS()`，它用来初始化更快的定时器

* 实现这两个宏之一，它们用来返回当前时钟值(更快的定时器)
  * portGET_RUN_TIME_COUNTER_VALUE()：直接返回时钟值
  * portALT_GET_RUN_TIME_COUNTER_VALUE(Time)：设置Time变量等于时钟值



代码执行流程：

* 初始化更快的定时器：启动调度器时

  ![image-20211201152037316](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-13/04_init_timer.png)

  

* 在任务切换时统计运行时间
  ![image-20211201152339799](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-13/05_cal_runtime.png)



* 获得统计信息，可以使用下列函数
  * uxTaskGetSystemState：对于每个任务它的统计信息都放在一个TaskStatus_t结构体里
  * vTaskList：得到的信息是可读的字符串，比如
  * vTaskGetRunTimeStats：  得到的信息是可读的字符串，比如
    

### 13.2.4 函数说明

* uxTaskGetSystemState：获得任务的统计信息

```c
UBaseType_t uxTaskGetSystemState( TaskStatus_t * const pxTaskStatusArray,
                                        const UBaseType_t uxArraySize,
                                        uint32_t * const pulTotalRunTime );
```

| 参数              | 描述                                                         |
| ----------------- | ------------------------------------------------------------ |
| pxTaskStatusArray | 指向一个TaskStatus_t结构体数组，用来保存任务的统计信息。<br />有多少个任务？可以用`uxTaskGetNumberOfTasks()`来获得。 |
| uxArraySize       | 数组大小、数组项个数，必须大于或等于`uxTaskGetNumberOfTasks()` |
| pulTotalRunTime   | 用来保存当前总的运行时间(更快的定时器)，可以传入NULL         |
| 返回值            | 传入的pxTaskStatusArray数组，被设置了几个数组项。<br />注意：如果传入的uxArraySize小于`uxTaskGetNumberOfTasks()`，返回值就是0 |



* vTaskList ：获得任务的统计信息，形式为可读的字符串。注意，pcWriteBuffer必须足够大。

```c
  void vTaskList( signed char *pcWriteBuffer );
```

可读信息格式如下：

  ![image-20211201152918891](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-13/06_task_list.png)

* vTaskGetRunTimeStats：获得任务的运行信息，形式为可读的字符串。注意，pcWriteBuffer必须足够大。

```c
void vTaskGetRunTimeStats( signed char *pcWriteBuffer );
```

  可读信息格式如下：

![image-20211201153040395](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-13/07_task_runtimestats.png)



### 13.2.5 上机实验



## 技术答疑交流

在学习中遇到任何问题，请前往我们的技术交流社区留言： [https://forums.100ask.net](https://forums.100ask.net)


---
<center>本章完</center>

