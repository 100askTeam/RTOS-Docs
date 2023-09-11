# 第十章 软件定时器(software timer)

软件定时器就是"闹钟"，你可以设置闹钟，

* 在30分钟后让你起床工作
* 每隔1小时让你例行检查机器运行情况

软件定时器也可以完成两类事情：

* 在"未来"某个时间点，运行函数
* 周期性地运行函数

日常生活中我们可以定无数个"闹钟"，这无数的"闹钟"要基于一个真实的闹钟。

在FreeRTOS里，我们也可以设置无数个"软件定时器"，它们都是基于系统滴答中断(Tick Interrupt)。


本章涉及如下内容：

* 软件定时器的特性
* Daemon Task
* 定时器命令队列
* 一次性定时器、周期性定时器的差别
* 怎么操作定时器：创建、启动、复位、修改周期


## 10.1 软件定时器的特性

我们在手机上添加闹钟时，需要指定时间、指定类型(一次性的，还是周期性的)、指定做什么事；还有一些过时的、不再使用的闹钟。如下图所示：

![image-20210808210924700](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-10/01_real_clock.png)



使用定时器跟使用手机闹钟是类似的：

* 指定时间：启动定时器和运行回调函数，两者的间隔被称为定时器的周期(period)。
* 指定类型，定时器有两种类型：
  * 一次性(One-shot timers)：
    这类定时器启动后，它的回调函数只会被调用一次；
    可以手工再次启动它，但是不会自动启动它。
  * 自动加载定时器(Auto-reload timers )：
    这类定时器启动后，时间到之后它会自动启动它；
    这使得回调函数被周期性地调用。
* 指定要做什么事，就是指定回调函数



实际的闹钟分为：有效、无效两类。软件定时器也是类似的，它由两种状态：

* 运行(Running、Active)：运行态的定时器，当指定时间到达之后，它的回调函数会被调用
* 冬眠(Dormant)：冬眠态的定时器还可以通过句柄来访问它，但是它不再运行，它的回调函数不会被调用



定时器运行情况示例如下：

* Timer1：它是一次性的定时器，在t1启动，周期是6个Tick。经过6个tick后，在t7执行回调函数。它的回调函数只会被执行一次，然后该定时器进入冬眠状态。
* Timer2：它是自动加载的定时器，在t1启动，周期是5个Tick。每经过5个tick它的回调函数都被执行，比如在t6、t11、t16都会执行。

![image-20210809141001775](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-10/02_timer_type.png)



## 10.2 软件定时器的上下文

### 10.2.1 守护任务

要理解软件定时器API函数的参数，特别是里面的`xTicksToWait`，需要知道定时器执行的过程。

FreeRTOS中有一个Tick中断，软件定时器基于Tick来运行。在哪里执行定时器函数？第一印象就是在Tick中断里执行：

* 在Tick中断中判断定时器是否超时
* 如果超时了，调用它的回调函数

FreeRTOS是RTOS，它不允许在内核、在中断中执行不确定的代码：如果定时器函数很耗时，会影响整个系统。

所以，FreeRTOS中，不在Tick中断中执行定时器函数。

在哪里执行？在某个任务里执行，这个任务就是：RTOS Damemon Task，RTOS守护任务。以前被称为"Timer server"，但是这个任务要做并不仅仅是定时器相关，所以改名为：RTOS Damemon Task。

当FreeRTOS的配置项`configUSE_TIMERS`被设置为1时，在启动调度器时，会自动创建RTOS Damemon Task。

我们自己编写的任务函数要使用定时器时，是通过"定时器命令队列"(timer command queue)和守护任务交互，如下图所示：

![image-20210809193524596](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-10/10_api_to_queue.png)

守护任务的优先级为：configTIMER_TASK_PRIORITY；定时器命令队列的长度为configTIMER_QUEUE_LENGTH。



### 10.2.2 守护任务的调度

守护任务的调度，跟普通的任务并无差别。当守护任务是当前优先级最高的就绪态任务时，它就可以运行。它的工作有两类：

* 处理命令：从命令队列里取出命令、处理
* 执行定时器的回调函数

能否及时处理定时器的命令、能否及时执行定时器的回调函数，严重依赖于守护任务的优先级。下面使用2个例子来演示。

例子1：守护任务的优先性级较低

* t1：Task1处于运行态，守护任务处于阻塞态。
  守护任务在这两种情况下会退出阻塞态切换为就绪态：命令队列中有数据、某个定时器超时了。
  至于守护任务能否马上执行，取决于它的优先级。

* t2：Task1调用`xTimerStart()`
  要注意的是，`xTimerStart()`只是把"start timer"的命令发给"定时器命令队列"，使得守护任务退出阻塞态。
  在本例中，Task1的优先级高于守护任务，所以守护任务无法抢占Task1。
* t3：Task1执行完`xTimerStart()`
  但是定时器的启动工作由守护任务来实现，所以`xTimerStart()`返回并不表示定时器已经被启动了。
* t4：Task1由于某些原因进入阻塞态，现在轮到守护任务运行。
  守护任务从队列中取出"start timer"命令，启动定时器。
* t5：守护任务处理完队列中所有的命令，再次进入阻塞态。Idel任务时优先级最高的就绪态任务，它执行。
* 注意：假设定时器在后续某个时刻tX超时了，超时时间是"tX-t2"，而非"tX-t4"，从`xTimerStart()`函数被调用时算起。

![image-20210809155305138](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-10/04_demon_task_priority_lower.png)



例子2：守护任务的优先性级较高

* t1：Task1处于运行态，守护任务处于阻塞态。
  守护任务在这两种情况下会退出阻塞态切换为就绪态：命令队列中有数据、某个定时器超时了。
  至于守护任务能否马上执行，取决于它的优先级。

* t2：Task1调用`xTimerStart()`
  要注意的是，`xTimerStart()`只是把"start timer"的命令发给"定时器命令队列"，使得守护任务退出阻塞态。
  在本例中，守护任务的优先级高于Task1，所以守护任务抢占Task1，守护任务开始处理命令队列。
  Task1在执行`xTimerStart()`的过程中被抢占，这时它无法完成此函数。
* t3：守护任务处理完命令队列中所有的命令，再次进入阻塞态。
  此时Task1是优先级最高的就绪态任务，它开始执行。
* t4：Task1之前被守护任务抢占，对`xTimerStart()`的调用尚未返回。现在开始继续运行次函数、返回。
* t5：Task1由于某些原因进入阻塞态，进入阻塞态。Idel任务时优先级最高的就绪态任务，它执行。

![image-20210809161518141](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-10/05_demon_task_priority_higher.png)



注意，定时器的超时时间是基于调用`xTimerStart()`的时刻tX，而不是基于守护任务处理命令的时刻tY。假设超时时间是10个Tick，超时时间是"tX+10"，而非"tY+10"。



### 10.2.3 回调函数

定时器的回调函数的原型如下：

```c
void ATimerCallback( TimerHandle_t xTimer );
```

定时器的回调函数是在守护任务中被调用的，守护任务不是专为某个定时器服务的，它还要处理其他定时器。

所以，定时器的回调函数不要影响其他人：

* 回调函数要尽快实行，不能进入阻塞状态

* 不要调用会导致阻塞的API函数，比如`vTaskDelay()`

* 可以调用`xQueueReceive()`之类的函数，但是超时时间要设为0：即刻返回，不可阻塞

  



## 10.3 软件定时器的函数

根据定时器的状态转换图，就可以知道所涉及的函数：

![image-20210809142036095](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-10/03_timer_state_transfer.png)



### 10.3.1 创建

要使用定时器，需要先创建它，得到它的句柄。

有两种方法创建定时器：动态分配内存、静态分配内存。函数原型如下：

```c
/* 使用动态分配内存的方法创建定时器
 * pcTimerName:定时器名字, 用处不大, 尽在调试时用到
 * xTimerPeriodInTicks: 周期, 以Tick为单位
 * uxAutoReload: 类型, pdTRUE表示自动加载, pdFALSE表示一次性
 * pvTimerID: 回调函数可以使用此参数, 比如分辨是哪个定时器
 * pxCallbackFunction: 回调函数
 * 返回值: 成功则返回TimerHandle_t, 否则返回NULL
 */
TimerHandle_t xTimerCreate( const char * const pcTimerName, 
							const TickType_t xTimerPeriodInTicks,
							const UBaseType_t uxAutoReload,
							void * const pvTimerID,
							TimerCallbackFunction_t pxCallbackFunction );

/* 使用静态分配内存的方法创建定时器
 * pcTimerName:定时器名字, 用处不大, 尽在调试时用到
 * xTimerPeriodInTicks: 周期, 以Tick为单位
 * uxAutoReload: 类型, pdTRUE表示自动加载, pdFALSE表示一次性
 * pvTimerID: 回调函数可以使用此参数, 比如分辨是哪个定时器
 * pxCallbackFunction: 回调函数
 * pxTimerBuffer: 传入一个StaticTimer_t结构体, 将在上面构造定时器
 * 返回值: 成功则返回TimerHandle_t, 否则返回NULL
 */
TimerHandle_t xTimerCreateStatic(const char * const pcTimerName,
                                 TickType_t xTimerPeriodInTicks,
                                 UBaseType_t uxAutoReload,
                                 void * pvTimerID,
                                 TimerCallbackFunction_t pxCallbackFunction,
                                 StaticTimer_t *pxTimerBuffer );
```



回调函数的类型是：

```c
void ATimerCallback( TimerHandle_t xTimer );

typedef void (* TimerCallbackFunction_t)( TimerHandle_t xTimer );
```



### 10.3.2 删除

动态分配的定时器，不再需要时可以删除掉以回收内存。删除函数原型如下：

```c
/* 删除定时器
 * xTimer: 要删除哪个定时器
 * xTicksToWait: 超时时间
 * 返回值: pdFAIL表示"删除命令"在xTicksToWait个Tick内无法写入队列
 *        pdPASS表示成功
 */
BaseType_t xTimerDelete( TimerHandle_t xTimer, TickType_t xTicksToWait );
```

定时器的很多API函数，都是通过发送"命令"到命令队列，由守护任务来实现。

如果队列满了，"命令"就无法即刻写入队列。我们可以指定一个超时时间`xTicksToWait`，等待一会。



### 10.3.3 启动/停止

启动定时器就是设置它的状态为运行态(Running、Active)。

停止定时器就是设置它的状态为冬眠(Dormant)，让它不能运行。

涉及的函数原型如下：

```c
/* 启动定时器
 * xTimer: 哪个定时器
 * xTicksToWait: 超时时间
 * 返回值: pdFAIL表示"启动命令"在xTicksToWait个Tick内无法写入队列
 *        pdPASS表示成功
 */
BaseType_t xTimerStart( TimerHandle_t xTimer, TickType_t xTicksToWait );

/* 启动定时器(ISR版本)
 * xTimer: 哪个定时器
 * pxHigherPriorityTaskWoken: 向队列发出命令使得守护任务被唤醒,
 *                            如果守护任务的优先级比当前任务的高,
 *                            则"*pxHigherPriorityTaskWoken = pdTRUE",
 *                            表示需要进行任务调度
 * 返回值: pdFAIL表示"启动命令"无法写入队列
 *        pdPASS表示成功
 */
BaseType_t xTimerStartFromISR(   TimerHandle_t xTimer,
                                 BaseType_t *pxHigherPriorityTaskWoken );

/* 停止定时器
 * xTimer: 哪个定时器
 * xTicksToWait: 超时时间
 * 返回值: pdFAIL表示"停止命令"在xTicksToWait个Tick内无法写入队列
 *        pdPASS表示成功
 */
BaseType_t xTimerStop( TimerHandle_t xTimer, TickType_t xTicksToWait );

/* 停止定时器(ISR版本)
 * xTimer: 哪个定时器
 * pxHigherPriorityTaskWoken: 向队列发出命令使得守护任务被唤醒,
 *                            如果守护任务的优先级比当前任务的高,
 *                            则"*pxHigherPriorityTaskWoken = pdTRUE",
 *                            表示需要进行任务调度
 * 返回值: pdFAIL表示"停止命令"无法写入队列
 *        pdPASS表示成功
 */
BaseType_t xTimerStopFromISR(    TimerHandle_t xTimer,
                                 BaseType_t *pxHigherPriorityTaskWoken );
```

注意，这些函数的`xTicksToWait`表示的是，把命令写入命令队列的超时时间。命令队列可能已经满了，无法马上把命令写入队列里，可以等待一会。

`xTicksToWait`不是定时器本身的超时时间，不是定时器本身的"周期"。

创建定时器时，设置了它的周期(period)。`xTimerStart()`函数是用来启动定时器。假设调用`xTimerStart()`的时刻是tX，定时器的周期是n，那么在`tX+n`时刻定时器的回调函数被调用。

如果定时器已经被启动，但是它的函数尚未被执行，再次执行`xTimerStart()`函数相当于执行`xTimerReset()`，重新设定它的启动时间。



### 10.3.4 复位

从定时器的状态转换图可以知道，使用`xTimerReset()`函数可以让定时器的状态从冬眠态转换为运行态，相当于使用`xTimerStart()`函数。

如果定时器已经处于运行态，使用`xTimerReset()`函数就相当于重新确定超时时间。假设调用`xTimerReset()`的时刻是tX，定时器的周期是n，那么`tX+n`就是重新确定的超时时间。

复位函数的原型如下：

```c
/* 复位定时器
 * xTimer: 哪个定时器
 * xTicksToWait: 超时时间
 * 返回值: pdFAIL表示"复位命令"在xTicksToWait个Tick内无法写入队列
 *        pdPASS表示成功
 */
BaseType_t xTimerReset( TimerHandle_t xTimer, TickType_t xTicksToWait );

/* 复位定时器(ISR版本)
 * xTimer: 哪个定时器
 * pxHigherPriorityTaskWoken: 向队列发出命令使得守护任务被唤醒,
 *                            如果守护任务的优先级比当前任务的高,
 *                            则"*pxHigherPriorityTaskWoken = pdTRUE",
 *                            表示需要进行任务调度
 * 返回值: pdFAIL表示"停止命令"无法写入队列
 *        pdPASS表示成功
 */
BaseType_t xTimerResetFromISR(   TimerHandle_t xTimer,
                                 BaseType_t *pxHigherPriorityTaskWoken );
```



### 10.3.5 修改周期

从定时器的状态转换图可以知道，使用`xTimerChangePeriod()`函数，处理能修改它的周期外，还可以让定时器的状态从冬眠态转换为运行态。

修改定时器的周期时，会使用新的周期重新计算它的超时时间。假设调用`xTimerChangePeriod()`函数的时间tX，新的周期是n，则`tX+n`就是新的超时时间。

相关函数的原型如下：

```c
/* 修改定时器的周期
 * xTimer: 哪个定时器
 * xNewPeriod: 新周期
 * xTicksToWait: 超时时间, 命令写入队列的超时时间 
 * 返回值: pdFAIL表示"修改周期命令"在xTicksToWait个Tick内无法写入队列
 *        pdPASS表示成功
 */
BaseType_t xTimerChangePeriod(   TimerHandle_t xTimer,
                                 TickType_t xNewPeriod,
                                 TickType_t xTicksToWait );

/* 修改定时器的周期
 * xTimer: 哪个定时器
 * xNewPeriod: 新周期
 * pxHigherPriorityTaskWoken: 向队列发出命令使得守护任务被唤醒,
 *                            如果守护任务的优先级比当前任务的高,
 *                            则"*pxHigherPriorityTaskWoken = pdTRUE",
 *                            表示需要进行任务调度
 * 返回值: pdFAIL表示"修改周期命令"在xTicksToWait个Tick内无法写入队列
 *        pdPASS表示成功
 */
BaseType_t xTimerChangePeriodFromISR( TimerHandle_t xTimer,
                                      TickType_t xNewPeriod,
                                      BaseType_t *pxHigherPriorityTaskWoken );
```



### 10.3.6 定时器ID

定时器的结构体如下，里面有一项`pvTimerID`，它就是定时器ID：

![image-20210809173702155](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-10/06_timer_structure.png)

怎么使用定时器ID，完全由程序来决定：

* 可以用来标记定时器，表示自己是什么定时器
* 可以用来保存参数，给回调函数使用



它的初始值在创建定时器时由`xTimerCreate()`这类函数传入，后续可以使用这些函数来操作：

* 更新ID：使用`vTimerSetTimerID()`函数
* 查询ID：查询`pvTimerGetTimerID()`函数

这两个函数不涉及命令队列，它们是直接操作定时器结构体。



函数原型如下：

```c
/* 获得定时器的ID
 * xTimer: 哪个定时器
 * 返回值: 定时器的ID
 */
void *pvTimerGetTimerID( TimerHandle_t xTimer );

/* 设置定时器的ID
 * xTimer: 哪个定时器
 * pvNewID: 新ID
 * 返回值: 无
 */
void vTimerSetTimerID( TimerHandle_t xTimer, void *pvNewID );
```



## 10.4 示例24: 一般使用

本节程序为`FreeRTOS_24_software_timer`。

要使用定时器，需要做些准备工作：

```c
/* 1. 工程中 */
添加 timer.c

/* 2. 配置文件FreeRTOSConfig.h中 */
#define configUSE_TIMERS			 1   /* 使能定时器 */
#define configTIMER_TASK_PRIORITY    31  /* 守护任务的优先级, 尽可能高一些 */
#define configTIMER_QUEUE_LENGTH     5   /* 命令队列长度 */
#define configTIMER_TASK_STACK_DEPTH 32  /* 守护任务的栈大小 */
    
/* 3. 源码中 */
#include "timers.h"
```



main函数中创建、启动了2个定时器：一次性的、周期

```c
static volatile uint8_t flagONEShotTimerRun = 0;
static volatile uint8_t flagAutoLoadTimerRun = 0;

static void vONEShotTimerFunc( TimerHandle_t xTimer );
static void vAutoLoadTimerFunc( TimerHandle_t xTimer );

/*-----------------------------------------------------------*/

#define mainONE_SHOT_TIMER_PERIOD pdMS_TO_TICKS( 10 )
#define mainAUTO_RELOAD_TIMER_PERIOD pdMS_TO_TICKS( 20 )

int main( void )
{
	TimerHandle_t xOneShotTimer;
	TimerHandle_t xAutoReloadTimer;
	
	prvSetupHardware();

	xOneShotTimer = xTimerCreate(	
		"OneShot",                 /* 名字, 不重要 */
		mainONE_SHOT_TIMER_PERIOD, /* 周期 */
		pdFALSE,                   /* 一次性 */
		0,                         /* ID */
		vONEShotTimerFunc          /* 回调函数 */
	);	

	xAutoReloadTimer = xTimerCreate(	
		"AutoReload",                 /* 名字, 不重要 */
		mainAUTO_RELOAD_TIMER_PERIOD, /* 周期 */
		pdTRUE,                       /* 自动加载 */
		0,                            /* ID */
		vAutoLoadTimerFunc            /* 回调函数 */
	);	
	
	if (xOneShotTimer && xAutoReloadTimer)
	{
		/* 启动定时器 */
		xTimerStart(xOneShotTimer, 0);
		xTimerStart(xAutoReloadTimer, 0);
		
		/* 启动调度器 */
		vTaskStartScheduler();
	}

	/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
	return 0;
}
```



这两个定时器的回调函数比较简单：

```c
static void vONEShotTimerFunc( TimerHandle_t xTimer )
{
	static int cnt = 0;
	flagONEShotTimerRun = !flagONEShotTimerRun;
	printf("run vONEShotTimerFunc %d\r\n", cnt++);
}

static void vAutoLoadTimerFunc( TimerHandle_t xTimer )
{
	static int cnt = 0;
	flagAutoLoadTimerRun = !flagAutoLoadTimerRun;
	printf("run vAutoLoadTimerFunc %d\r\n", cnt++);
}
```



逻辑分析仪如下图所示：

![image-20210809183915424](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-10/07_timer_wave.png)



运行结果如下图所示：

![image-20210809183237531](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-10/08_timer_result1.png)



## 10.5 示例25: 消除抖动

本节程序为`FreeRTOS_25_software_timer_readkey`。

在嵌入式开发中，我们使用机械开关时经常碰到抖动问题：引脚电平在短时间内反复变化。

怎么读到确定的按键状态？

* 连续读很多次，知道数值稳定：浪费CPU资源
* 使用定时器：要结合中断来使用

对于第2种方法，处理方法如下图所示，按下按键后：

* 在t1产生中断，这时不马上确定按键，而是复位定时器，假设周期时20ms，超时时间为"t1+20ms"
* 由于抖动，在t2再次产生中断，再次复位定时器，超时时间变为"t2+20ms"
* 由于抖动，在t3再次产生中断，再次复位定时器，超时时间变为"t3+20ms"
* 在"t3+20ms"处，按键已经稳定，读取按键值

![image-20210809185808136](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-10/09_filting_key.png)



main函数中创建了一个一次性的定时器，从来处理抖动；创建了一个任务，用来模拟产生抖动。代码如下：

```c
/*-----------------------------------------------------------*/

static void vKeyFilteringTimerFunc( TimerHandle_t xTimer );
void vEmulateKeyTask( void *pvParameters );

static TimerHandle_t xKeyFilteringTimer;

/*-----------------------------------------------------------*/

#define KEY_FILTERING_PERIOD pdMS_TO_TICKS( 20 )

int main( void )
{
	
	prvSetupHardware();

	xKeyFilteringTimer = xTimerCreate(	
		"KeyFiltering",            /* 名字, 不重要 */
		KEY_FILTERING_PERIOD,      /* 周期 */
		pdFALSE,                   /* 一次性 */
		0,                         /* ID */
		vKeyFilteringTimerFunc          /* 回调函数 */
	);
	
    /* 在这个任务中多次调用xTimerReset来模拟按键抖动 */
	xTaskCreate( vEmulateKeyTask, "EmulateKey", 1000, NULL, 1, NULL );
			
	/* 启动调度器 */
	vTaskStartScheduler();

	/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
	return 0;
}
```



模拟产生按键：每个循环里调用3次xTimerReset，代码如下：

```c
void vEmulateKeyTask( void *pvParameters )
{
	int cnt = 0;
	const TickType_t xDelayTicks = pdMS_TO_TICKS( 200UL );
	
	for( ;; )
	{
		/* 模拟按键抖动, 多次调用xTimerReset */		
		xTimerReset(xKeyFilteringTimer, 0); cnt++;
		xTimerReset(xKeyFilteringTimer, 0); cnt++;
		xTimerReset(xKeyFilteringTimer, 0); cnt++;

		printf("Key jitters %d\r\n", cnt);
		
		vTaskDelay(xDelayTicks);
	}
}
```



定时器回调函数代码如下：

```c
static void vKeyFilteringTimerFunc( TimerHandle_t xTimer )
{
	static int cnt = 0;
	printf("vKeyFilteringTimerFunc %d\r\n", cnt++);
}
```



在人户函数中多次调用xTimerReset，只触发1次定时器回调函数，运行结果如下图所示：

![image-20210809191550154](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-10/11_timer_result2.png)


## 技术答疑交流

在学习中遇到任何问题，请前往我们的技术交流社区留言： [https://forums.100ask.net](https://forums.100ask.net)


---
<center>本章完</center>

