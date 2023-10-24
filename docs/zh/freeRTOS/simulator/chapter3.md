# 第三章 任务管理

在本章中，会涉及如下内容：

* FreeRTOS如何给每个任务分配CPU时间
* 如何选择某个任务来运行
* 任务优先级如何起作用
* 任务有哪些状态
* 如何实现任务
* 如何使用任务参数
* 怎么修改任务优先级
* 怎么删除任务
* 怎么实现周期性的任务
* 如何使用空闲任务

## 3.1 基本概念

对于整个单片机程序，我们称之为application，应用程序。

使用FreeRTOS时，我们可以在application中创建多个任务(task)，有些文档把任务也称为线程(thread)。

![](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-3/01_mother_do_jobs.png)

以日常生活为例，比如这个母亲要同时做两件事：

* 喂饭：这是一个任务
* 回信息：这是另一个任务

这可以引入很多概念：

* 任务状态(State)：
  * 当前正在喂饭，它是running状态；另一个"回信息"的任务就是"not running"状态
  * "not running"状态还可以细分：
    * ready：就绪，随时可以运行
    * blocked：阻塞，卡住了，母亲在等待同事回信息
    * suspended：挂起，同事废话太多，不管他了
* 优先级(Priority)
  * 我工作生活兼顾：喂饭、回信息优先级一样，轮流做
  * 我忙里偷闲：还有空闲任务，休息一下
  * 厨房着火了，什么都别说了，先灭火：优先级更高
* 栈(Stack)
  * 喂小孩时，我要记得上一口喂了米饭，这口要喂青菜了
  * 回信息时，我要记得刚才聊的是啥
  * 做不同的任务，这些细节不一样
  * 对于人来说，当然是记在脑子里
  * 对于程序，是记在栈里
  * 每个任务有自己的栈
* 事件驱动
  * 孩子吃饭太慢：先休息一会，等他咽下去了、等他提醒我了，再喂下一口
* 协助式调度(Co-operative Scheduling)
  * 你在给同事回信息
    * 同事说：好了，你先去给小孩喂一口饭吧，你才能离开
    * 同事不放你走，即使孩子哭了你也不能走
  * 你好不容易可以给孩子喂饭了
    * 孩子说：好了，妈妈你去处理一下工作吧，你才能离开
    * 孩子不放你走，即使同事连发信息你也不能走

这涉及很多概念，后续章节详细分析。



## 3.2 任务创建与删除

### 3.2.1 什么是任务

在FreeRTOS中，任务就是一个函数，原型如下：

```c
void ATaskFunction( void *pvParameters );
```

要注意的是：

* 这个函数不能返回
* 同一个函数，可以用来创建多个任务；换句话说，多个任务可以运行同一个函数
* 函数内部，尽量使用局部变量：
  * 每个任务都有自己的栈
  * 每个任务运行这个函数时
    * 任务A的局部变量放在任务A的栈里、任务B的局部变量放在任务B的栈里
    * 不同任务的局部变量，有自己的副本
  * 函数使用全局变量、静态变量的话
    * 只有一个副本：多个任务使用的是同一个副本
    * 要防止冲突(后续会讲)

下面是一个示例：

```c
void ATaskFunction( void *pvParameters )
{
	/* 对于不同的任务，局部变量放在任务的栈里，有各自的副本 */
	int32_t lVariableExample = 0;
	
    /* 任务函数通常实现为一个无限循环 */
	for( ;; )
	{
		/* 任务的代码 */
	}

    /* 如果程序从循环中退出，一定要使用vTaskDelete删除自己
     * NULL表示删除的是自己
     */
	vTaskDelete( NULL );
    
    /* 程序不会执行到这里, 如果执行到这里就出错了 */
}
```



### 3.2.2 创建任务

创建任务时使用的函数如下：

```c
BaseType_t xTaskCreate( TaskFunction_t pxTaskCode, // 函数指针, 任务函数
                        const char * const pcName, // 任务的名字
                        const configSTACK_DEPTH_TYPE usStackDepth, // 栈大小,单位为word,10表示40字节
                        void * const pvParameters, // 调用任务函数时传入的参数
                        UBaseType_t uxPriority,    // 优先级
                        TaskHandle_t * const pxCreatedTask ); // 任务句柄, 以后使用它来操作这个任务
```



参数说明：

| 参数          | 描述                                                         |
| ------------- | ------------------------------------------------------------ |
| pvTaskCode    | 函数指针，可以简单地认为任务就是一个C函数。<br />它稍微特殊一点：永远不退出，或者退出时要调用"vTaskDelete(NULL)" |
| pcName        | 任务的名字，FreeRTOS内部不使用它，仅仅起调试作用。<br />长度为：configMAX_TASK_NAME_LEN |
| usStackDepth  | 每个任务都有自己的栈，这里指定栈大小。<br />单位是word，比如传入100，表示栈大小为100 word，也就是400字节。<br />最大值为uint16_t的最大值。<br />怎么确定栈的大小，并不容易，很多时候是估计。<br />精确的办法是看反汇编码。 |
| pvParameters  | 调用pvTaskCode函数指针时用到：pvTaskCode(pvParameters)       |
| uxPriority    | 优先级范围：0~(configMAX_PRIORITIES – 1)<br />数值越小优先级越低，<br />如果传入过大的值，xTaskCreate会把它调整为(configMAX_PRIORITIES – 1) |
| pxCreatedTask | 用来保存xTaskCreate的输出结果：task handle。<br />以后如果想操作这个任务，比如修改它的优先级，就需要这个handle。<br />如果不想使用该handle，可以传入NULL。 |
| 返回值        | 成功：pdPASS；<br />失败：errCOULD_NOT_ALLOCATE_REQUIRED_MEMORY(失败原因只有内存不足)<br />注意：文档里都说失败时返回值是pdFAIL，这不对。<br />pdFAIL是0，errCOULD_NOT_ALLOCATE_REQUIRED_MEMORY是-1。 |



### 3.2.3 示例1: 创建任务

代码为：`FreeRTOS_01_create_task`

使用2个函数分别创建2个任务。

任务1的代码：

```c
void vTask1( void *pvParameters )
{
	const char *pcTaskName = "T1 run\r\n";
	volatile uint32_t ul; /* volatile用来避免被优化掉 */
	
	/* 任务函数的主体一般都是无限循环 */
	for( ;; )
	{
		/* 打印任务1的信息 */
		printf( pcTaskName );
		
		/* 延迟一会(比较简单粗暴) */
		for( ul = 0; ul < mainDELAY_LOOP_COUNT; ul++ )
		{
		}
	}
}
```



任务2的代码：

```c
void vTask2( void *pvParameters )
{
	const char *pcTaskName = "T2 run\r\n";
	volatile uint32_t ul; /* volatile用来避免被优化掉 */
	
	/* 任务函数的主体一般都是无限循环 */
	for( ;; )
	{
		/* 打印任务1的信息 */
		printf( pcTaskName );
		
		/* 延迟一会(比较简单粗暴) */
		for( ul = 0; ul < mainDELAY_LOOP_COUNT; ul++ )
		{
		}
	}
}
```



main函数：

```c
int main( void )
{
	prvSetupHardware();
	
	xTaskCreate(vTask1, "Task 1", 1000, NULL, 1, NULL);
	xTaskCreate(vTask2, "Task 2", 1000, NULL, 1, NULL);

	/* 启动调度器 */
	vTaskStartScheduler();

	/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
	return 0;
}
```

运行结果如下：

![image-20210729170906116](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-3/04_create_two_task.png)

注意：

* task 2先运行！
* 要分析xTaskCreate的代码才能知道原因：更高优先级的、或者后面创建的任务先运行。



任务运行图：

* 在t1：Task2进入运行态，一直运行直到t2
* 在t2：Task1进入运行态，一直运行直到t3；在t3，Task2重新进入运行态

![image-20210729172213224](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-3/05_task_schedul.png)

### 3.2.4 示例2: 使用任务参数

代码为：`FreeRTOS_02_create_task_use_params`

我们说过，多个任务可以使用同一个函数，怎么体现它们的差别？

* 栈不同
* 创建任务时可以传入不同的参数

我们创建2个任务，使用同一个函数，代码如下：

```c
void vTaskFunction( void *pvParameters )
{
	const char *pcTaskText = pvParameters;
	volatile uint32_t ul; /* volatile用来避免被优化掉 */
	
	/* 任务函数的主体一般都是无限循环 */
	for( ;; )
	{
		/* 打印任务的信息 */
		printf(pcTaskText);
		
		/* 延迟一会(比较简单粗暴) */
		for( ul = 0; ul < mainDELAY_LOOP_COUNT; ul++ )
		{
		}
	}
}
```

上述代码中的`pcTaskText`来自参数`pvParameters`，`pvParameters`来自哪里？创建任务时传入的。

代码如下：

* 使用xTaskCreate创建2个任务时，第4个参数就是pvParameters
* 不同的任务，pvParameters不一样

```c
static const char *pcTextForTask1 = "T1 run\r\n";
static const char *pcTextForTask2 = "T2 run\r\n";

int main( void )
{
	prvSetupHardware();
	
	xTaskCreate(vTaskFunction, "Task 1", 1000, (void *)pcTextForTask1, 1, NULL);
	xTaskCreate(vTaskFunction, "Task 2", 1000, (void *)pcTextForTask2, 1, NULL);

	/* 启动调度器 */
	vTaskStartScheduler();

	/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
	return 0;
}
```



### 3.2.5 任务的删除

删除任务时使用的函数如下：

```c
void vTaskDelete( TaskHandle_t xTaskToDelete );
```

参数说明：

| 参数       | 描述                                                         |
| ---------- | ------------------------------------------------------------ |
| pvTaskCode | 任务句柄，使用xTaskCreate创建任务时可以得到一个句柄。<br />也可传入NULL，这表示删除自己。 |

怎么删除任务？举个不好的例子：

* 自杀：`vTaskDelete(NULL)`
* 被杀：别的任务执行`vTaskDelete(pvTaskCode)`，pvTaskCode是自己的句柄
* 杀人：执行`vTaskDelete(pvTaskCode)`，pvTaskCode是别的任务的句柄



### 3.2.6 示例3: 删除任务

代码为：`FreeRTOS_03_delete_task`

本节代码会涉及优先级的知识，可以只看vTaskDelete的用法，忽略优先级的讲解。

我们要做这些事情：

* 创建任务1：任务1的大循环里，创建任务2，然后休眠一段时间
* 任务2：打印一句话，然后就删除自己

任务1的代码如下：

```c
void vTask1( void *pvParameters )
{
	const TickType_t xDelay100ms = pdMS_TO_TICKS( 100UL );		
	BaseType_t ret;
	
	/* 任务函数的主体一般都是无限循环 */
	for( ;; )
	{
		/* 打印任务的信息 */
		printf("Task1 is running\r\n");
		
		ret = xTaskCreate( vTask2, "Task 2", 1000, NULL, 2, &xTask2Handle );
		if (ret != pdPASS)
			printf("Create Task2 Failed\r\n");
		
		// 如果不休眠的话, Idle任务无法得到执行
		// Idel任务会清理任务2使用的内存
		// 如果不休眠则Idle任务无法执行, 最后内存耗尽
		vTaskDelay( xDelay100ms );
	}
```



任务2的代码如下：

```c
void vTask2( void *pvParameters )
{	
	/* 打印任务的信息 */
	printf("Task2 is running and about to delete itself\r\n");

	// 可以直接传入参数NULL, 这里只是为了演示函数用法
	vTaskDelete(xTask2Handle);
}
```



main函数代码如下：

```c
int main( void )
{
	prvSetupHardware();
	
	xTaskCreate(vTask1, "Task 1", 1000, NULL, 1, NULL);

	/* 启动调度器 */
	vTaskStartScheduler();

	/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
	return 0;
}
```

运行结果如下：

![image-20210731110531625](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-3/04_delete_task.png)



任务运行图：

* main函数中创建任务1，优先级为1。任务1运行时，它创建任务2，任务2的优先级是2。
* 任务2的优先级最高，它马上执行。
* 任务2打印一句话后，就删除了自己。
* 任务2被删除后，任务1的优先级最高，轮到任务1继续运行，它调用`vTaskDelay()  `进入Block状态
* 任务1 Block期间，轮到Idle任务执行：它释放任务2的内存(TCB、栈)
* 时间到后，任务1变为最高优先级的任务继续执行。
* 如此循环。

![image-20210731111929008](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-3/06_task_schedul_for_delete.png)



在任务1的函数中，如果不调用vTaskDelay，则Idle任务用于没有机会执行，它就无法释放创建任务2是分配的内存。

而任务1在不断地创建任务，不断地消耗内存，最终内存耗尽再也无法创建新的任务。

现象如下：

![image-20210731112826679](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-3/07_create_task_fail.png)



任务1的代码中，需要注意的是：xTaskCreate的返回值。

* 很多手册里说它失败时返回值是pdFAIL，这个宏是0
* 其实失败时返回值是errCOULD_NOT_ALLOCATE_REQUIRED_MEMORY，这个宏是-1
* 为了避免混淆，我们使用返回值跟pdPASS来比较，这个宏是1



## 3.3 任务优先级和Tick

### 3.3.1 任务优先级

在上个示例中我们体验过优先级的使用：高优先级的任务先运行。

优先级的取值范围是：0~(configMAX_PRIORITIES – 1)，数值越大优先级越高。

FreeRTOS的调度器可以使用2种方法来快速找出优先级最高的、可以运行的任务。使用不同的方法时，configMAX_PRIORITIES 的取值有所不同。

* 通用方法
  使用C函数实现，对所有的架构都是同样的代码。对configMAX_PRIORITIES的取值没有限制。但是configMAX_PRIORITIES的取值还是尽量小，因为取值越大越浪费内存，也浪费时间。
  configUSE_PORT_OPTIMISED_TASK_SELECTION被定义为0、或者未定义时，使用此方法。
* 架构相关的优化的方法
  架构相关的汇编指令，可以从一个32位的数里快速地找出为1的最高位。使用这些指令，可以快速找出优先级最高的、可以运行的任务。
  使用这种方法时，configMAX_PRIORITIES的取值不能超过32。
  configUSE_PORT_OPTIMISED_TASK_SELECTION被定义为1时，使用此方法。

在学习调度方法之前，你只要初略地知道：

* FreeRTOS会确保最高优先级的、可运行的任务，马上就能执行
* 对于相同优先级的、可运行的任务，轮流执行

这无需记忆，就像我们举的例子：

* 厨房着火了，当然优先灭火
* 喂饭、回复信息同样重要，轮流做



### 3.3.2 Tick

对于同优先级的任务，它们“轮流”执行。怎么轮流？你执行一会，我执行一会。

"一会"怎么定义？

人有心跳，心跳间隔基本恒定。

FreeRTOS中也有心跳，它使用定时器产生固定间隔的中断。这叫Tick、滴答，比如每10ms发生一次时钟中断。

如下图：

* 假设t1、t2、t3发生时钟中断
* 两次中断之间的时间被称为时间片(time slice、tick period)
* 时间片的长度由configTICK_RATE_HZ 决定，假设configTICK_RATE_HZ为100，那么时间片长度就是10ms

![image-20210731130348561](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-3/08_time_tick.png)



相同优先级的任务怎么切换呢？请看下图：

* 任务2从t1执行到t2
* 在t2发生tick中断，进入tick中断处理函数：
  * 选择下一个要运行的任务
  * 执行完中断处理函数后，切换到新的任务：任务1
* 任务1从t2执行到t3
* 从下图中可以看出，任务运行的时间并不是严格从t1,t2,t3哪里开始

![image-20210731130720669](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-3/09_tick_interrtups.png)

有了Tick的概念后，我们就可以使用Tick来衡量时间了，比如：

```c
vTaskDelay(2);  // 等待2个Tick，假设configTICK_RATE_HZ=100, Tick周期时10ms, 等待20ms

// 还可以使用pdMS_TO_TICKS宏把ms转换为tick
vTaskDelay(pdMS_TO_TICKS(100));	 // 等待100ms
```



注意，基于Tick实现的延时并不精确，比如`vTaskDelay(2)`的本意是延迟2个Tick周期，有可能经过1个Tick多一点就返回了。

如下图：

![image-20210731133559155](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-3/10_taskdelay.png)

使用vTaskDelay函数时，建议以ms为单位，使用pdMS_TO_TICKS把时间转换为Tick。

这样的代码就与configTICK_RATE_HZ无关，即使配置项configTICK_RATE_HZ改变了，我们也不用去修改代码。



### 3.3.3 示例4: 优先级实验

代码为：`FreeRTOS_04_task_priority`

本程序会创建3个任务：

* 任务1、任务2：优先级相同，都是1
* 任务3：优先级最高，是2



任务1、2代码如下：

```c
void vTask1( void *pvParameters )
{
	/* 任务函数的主体一般都是无限循环 */
	for( ;; )
	{
		/* 打印任务的信息 */
		printf("T1\r\n");				
	}
}

void vTask2( void *pvParameters )
{	
	/* 任务函数的主体一般都是无限循环 */
	for( ;; )
	{
		/* 打印任务的信息 */
		printf("T2\r\n");				
	}
}
```



任务3代码如下：

```c
void vTask3( void *pvParameters )
{	
	const TickType_t xDelay3000ms = pdMS_TO_TICKS( 3000UL );		
	
	/* 任务函数的主体一般都是无限循环 */
	for( ;; )
	{
		/* 打印任务的信息 */
		printf("T3\r\n");				

		// 如果不休眠的话, 其他任务无法得到执行
		vTaskDelay( xDelay3000ms );
	}
}
```



main函数代码如下：

```c
{
	prvSetupHardware();
	
	xTaskCreate(vTask1, "Task 1", 1000, NULL, 1, NULL);
	xTaskCreate(vTask2, "Task 2", 1000, NULL, 1, NULL);
	xTaskCreate(vTask3, "Task 3", 1000, NULL, 2, NULL);

	/* 启动调度器 */
	vTaskStartScheduler();

	/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
	return 0;
}
```



运行情况如下图所示：

* 任务3优先执行，直到它调用vTaskDelay主动放弃运行
* 任务1、任务2：轮流执行

![image-20210731140405148](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-3/11_priority_result.png)

调度情况如下图所示：

![image-20210731143751639](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-3/12_priority_scheduler.png)



### 3.3.4 示例5: 修改优先级

本节代码为：`FreeRTOS_05_change_priority`。

使用uxTaskPriorityGet来获得任务的优先级：

```c
UBaseType_t uxTaskPriorityGet( const TaskHandle_t xTask );
```

使用参数xTask来指定任务，设置为NULL表示获取自己的优先级。



使用vTaskPrioritySet 来设置任务的优先级：

```c
void vTaskPrioritySet( TaskHandle_t xTask,
                       UBaseType_t uxNewPriority );
```

使用参数xTask来指定任务，设置为NULL表示设置自己的优先级；
参数uxNewPriority表示新的优先级，取值范围是0~(configMAX_PRIORITIES – 1)。



main函数的代码如下，它创建了2个任务：任务1的优先级更高，它先执行：

```c
int main( void )
{
	prvSetupHardware();
	
	/* Task1的优先级更高, Task1先执行 */
	xTaskCreate( vTask1, "Task 1", 1000, NULL, 2, NULL );
	xTaskCreate( vTask2, "Task 2", 1000, NULL, 1, &xTask2Handle );

	/* 启动调度器 */
	vTaskStartScheduler();

	/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
	return 0;
}
```



任务1的代码如下：

```c
void vTask1( void *pvParameters )
{
	UBaseType_t uxPriority;
	
	/* Task1,Task2都不会进入阻塞或者暂停状态
	 * 根据优先级决定谁能运行
	 */
	
	/* 得到Task1自己的优先级 */
	uxPriority = uxTaskPriorityGet( NULL );
	
	for( ;; )
	{
		printf( "Task 1 is running\r\n" );

		printf("About to raise the Task 2 priority\r\n" );
		
		/* 提升Task2的优先级高于Task1
		 * Task2会即刻执行
 		 */
		vTaskPrioritySet( xTask2Handle, ( uxPriority + 1 ) );
		
		/* 如果Task1能运行到这里，表示它的优先级比Task2高
		* 那就表示Task2肯定把自己的优先级降低了
 		 */
	}
}
```



任务2的代码如下：

```c
void vTask2( void *pvParameters )
{
	UBaseType_t uxPriority;

	/* Task1,Task2都不会进入阻塞或者暂停状态
	 * 根据优先级决定谁能运行
	 */
	
	/* 得到Task2自己的优先级 */
	uxPriority = uxTaskPriorityGet( NULL );
	
	for( ;; )
	{
		/* 能运行到这里表示Task2的优先级高于Task1
		 * Task1提高了Task2的优先级
		 */
		printf( "Task 2 is running\r\n" );
		
		printf( "About to lower the Task 2 priority\r\n" );

		/* 降低Task2自己的优先级，让它小于Task1
		 * Task1得以运行
 		 */
		vTaskPrioritySet( NULL, ( uxPriority - 2 ) );
	}
}
```



调度情况如下图所示：

* 1：一开始Task1优先级最高，它先执行。它提升了Task2的优先级。
* 2：Task2的优先级最高，它执行。它把自己的优先级降低了。
* 3：Task1的优先级最高，再次执行。它提升了Task2的优先级。
* 如此循环。
* 注意：Task1的优先级一直是2，Task2的优先级是3或1，都大于0。所以Idel任务没有机会执行。

![image-20210731220350206](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-3/15_change_priority.png)



## 3.4 任务状态

以前我们很简单地把任务的状态分为2中：运行(Runing)、非运行(Not Running)。

对于非运行的状态，还可以继续细分，比如前面的`FreeRTOS_04_task_priority`中：

* Task3执行vTaskDelay后：处于非运行状态，要过3秒种才能再次运行
* Task3运行期间，Task1、Task2也处于非运行状态，但是它们**随时可以运行**
* 这两种"非运行"状态就不一样，可以细分为：
  * 阻塞状态(Blocked)
  * 暂停状态(Suspended)
  * 就绪状态(Ready)



### 3.4.1 阻塞状态(Blocked)

在日常生活的例子中，母亲在电脑前跟同事沟通时，如果同事一直没回复，那么母亲的工作就被卡住了、被堵住了、处于阻塞状态(Blocked)。重点在于：母亲在**等待**。



在`FreeRTOS_04_task_priority`实验中，如果把任务3中的vTaskDelay调用注释掉，那么任务1、任务2根本没有执行的机会，任务1、任务2被"饿死"了(starve)。

在实际产品中，我们不会让一个任务一直运行，而是使用"事件驱动"的方法让它运行：

* 任务要等待某个事件，事件发生后它才能运行
* 在等待事件过程中，它不消耗CPU资源
* 在等待事件的过程中，这个任务就处于阻塞状态(Blocked)

在阻塞状态的任务，它可以等待两种类型的事件：

* 时间相关的事件
  * 可以等待一段时间：我等2分钟
  * 也可以一直等待，直到某个绝对时间：我等到下午3点
* 同步事件：这事件由别的任务，或者是中断程序产生
  * 例子1：任务A等待任务B给它发送数据
  * 例子2：任务A等待用户按下按键
  * 同步事件的来源有很多(这些概念在后面会细讲)：
    * 队列(queue)
    * 二进制信号量(binary semaphores)
    * 计数信号量(counting semaphores)
    * 互斥量(mutexes)
    * 递归互斥量、递归锁(recursive mutexes)
    * 事件组(event groups)
    * 任务通知(task notifications)



在等待一个同步事件时，可以加上超时时间。比如等待队里数据，超时时间设为10ms：

* 10ms之内有数据到来：成功返回
* 10ms到了，还是没有数据：超时返回



### 3.4.2 暂停状态(Suspended)

在日常生活的例子中，母亲正在电脑前跟同事沟通，母亲可以暂停：

* 好烦啊，我暂停一会
* 领导说：你暂停一下



FreeRTOS中的任务也可以进入暂停状态，唯一的方法是通过vTaskSuspend函数。函数原型如下：

```c
void vTaskSuspend( TaskHandle_t xTaskToSuspend );
```

参数xTaskToSuspend表示要暂停的任务，如果为NULL，表示暂停自己。



要退出暂停状态，只能由**别人**来操作：

* 别的任务调用：vTaskResume  
* 中断程序调用：xTaskResumeFromISR  

实际开发中，暂停状态用得不多。



### 3.4.3 就绪状态(Ready)

这个任务完全准备好了，随时可以运行：只是还轮不到它。这时，它就处于就绪态(Ready)。



### 3.4.4 完整的状态转换图

![image-20210731155223985](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-3/13_full_task_state_machine.png)



## 3.5 Delay函数

### 3.5.1 两个Delay函数

有两个Delay函数：

* vTaskDelay：至少等待指定个数的Tick Interrupt才能变为就绪状态
* vTaskDelayUntil：等待到指定的绝对时刻，才能变为就绪态。

这2个函数原型如下：

```c
void vTaskDelay( const TickType_t xTicksToDelay ); /* xTicksToDelay: 等待多少给Tick */

/* pxPreviousWakeTime: 上一次被唤醒的时间
 * xTimeIncrement: 要阻塞到(pxPreviousWakeTime + xTimeIncrement)
 * 单位都是Tick Count
 */
BaseType_t xTaskDelayUntil( TickType_t * const pxPreviousWakeTime,
                            const TickType_t xTimeIncrement );
```



下面画图说明：

* 使用vTaskDelay(n)时，进入、退出vTaskDelay的时间间隔至少是n个Tick中断
* 使用xTaskDelayUntil(&Pre, n)时，前后两次退出xTaskDelayUntil的时间至少是n个Tick中断
  * 退出xTaskDelayUntil时任务就进入的就绪状态，一般都能得到执行机会
  * 所以可以使用xTaskDelayUntil来让任务周期性地运行

![image-20210731205236939](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-3/14_delay_functions.png)



### 3.5.2 示例6: Delay

本节代码为：`FreeRTOS_06_taskdelay`。

本程序会创建2个任务：

* Task1：
  * 高优先级
  * 设置变量flag为1，然后调用`vTaskDelay(xDelay50ms);`或`vTaskDelayUntil(&xLastWakeTime, xDelay50ms);`
* Task2：
  * 低优先级
  * 设置变量flag为0



main函数代码如下：

```c
int main( void )
{
	prvSetupHardware();
	
	/* Task1的优先级更高, Task1先执行 */
	xTaskCreate( vTask1, "Task 1", 1000, NULL, 2, NULL );
	xTaskCreate( vTask2, "Task 2", 1000, NULL, 1, NULL );

	/* 启动调度器 */
	vTaskStartScheduler();

	/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
	return 0;
}
```



Task1的代码中使用条件开关来选择Delay函数，把`#if 1`改为`#if 0`就可以使用`vTaskDelayUntil`，代码如下：

```c
void vTask1( void *pvParameters )
{
	const TickType_t xDelay50ms = pdMS_TO_TICKS( 50UL );
	TickType_t xLastWakeTime;
	int i;
	
	/* 获得当前的Tick Count */
	xLastWakeTime = xTaskGetTickCount();
			
	for( ;; )
	{
		flag = 1;
		
		/* 故意加入多个循环，让程序运行时间长一点 */
		for (i = 0; i <5; i++)
			printf( "Task 1 is running\r\n" );

#if 1		
		vTaskDelay(xDelay50ms);
#else		
		vTaskDelayUntil(&xLastWakeTime, xDelay50ms);
#endif		
	}
}
```



Task2的代码如下：

```c
void vTask2( void *pvParameters )
{
	for( ;; )
	{
		flag = 0;
		printf( "Task 2 is running\r\n" );
	}
}
```



使用Keil的逻辑分析观察flag变量的bit波形，如下：

* flag为1时表示Task1在运行，flag为0时表示Task2在运行，也就是Task1处于阻塞状态
* vTaskDelay：指定的是阻塞的时间
* vTaskDelayUntil：指定的是任务执行的间隔、周期

![image-20210731233309265](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-3/16_delay_time.png)



## 3.6 空闲任务及其钩子函数

### 3.6.1 介绍

在`FreeRTOS_03_delete_task`的实验里，我们体验过空闲任务(Idle任务)的作用：释放被删除的任务的内存。

除了上述目的之外，为什么必须要有空闲任务？一个良好的程序，它的任务都是事件驱动的：平时大部分时间处于阻塞状态。有可能我们自己创建的所有任务都无法执行，但是调度器必须能找到一个可以运行的任务：所以，我们要提供空闲任务。在使用`vTaskStartScheduler() `函数来创建、启动调度器时，这个函数内部会创建空闲任务：

* 空闲任务优先级为0：它不能阻碍用户任务运行
* 空闲任务要么处于就绪态，要么处于运行态，永远不会阻塞

空闲任务的优先级为0，这意味着一旦某个用户的任务变为就绪态，那么空闲任务马上被切换出去，让这个用户任务运行。在这种情况下，我们说用户任务"抢占"(pre-empt)了空闲任务，这是由调度器实现的。

要注意的是：如果使用`vTaskDelete() `来删除任务，那么你就要确保空闲任务有机会执行，否则就无法释放被删除任务的内存。



我们可以添加一个空闲任务的钩子函数(Idle Task Hook Functions)，空闲任务的循环每执行一次，就会调用一次钩子函数。钩子函数的作用有这些：

* 执行一些低优先级的、后台的、需要连续执行的函数
* 测量系统的空闲时间：空闲任务能被执行就意味着所有的高优先级任务都停止了，所以测量空闲任务占据的时间，就可以算出处理器占用率。
* 让系统进入省电模式：空闲任务能被执行就意味着没有重要的事情要做，当然可以进入省电模式了。



空闲任务的钩子函数的限制：

* 不能导致空闲任务进入阻塞状态、暂停状态
* 如果你会使用`vTaskDelete() `来删除任务，那么钩子函数要非常高效地执行。如果空闲任务移植卡在钩子函数里的话，它就无法释放内存。



### 3.6.2 使用钩子函数的前提

在`FreeRTOS\Source\tasks.c`中，可以看到如下代码，所以前提就是：

* 把这个宏定义为1：configUSE_IDLE_HOOK
* 实现`vApplicationIdleHook`函数

![image-20210801005130872](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-3/17_idle_hook.png)



## 3.7 调度算法

### 3.7.1 重要概念

这些知识在前面都提到过了，这里总结一下。

正在运行的任务，被称为"正在使用处理器"，它处于运行状态。在单处理系统中，任何时间里只能有一个任务处于运行状态。

非运行状态的任务，它处于这3中状态之一：阻塞(Blocked)、暂停(Suspended)、就绪(Ready)。就绪态的任务，可以被调度器挑选出来切换为运行状态，调度器永远都是挑选最高优先级的就绪态任务并让它进入运行状态。

阻塞状态的任务，它在等待"事件"，当事件发生时任务就会进入就绪状态。事件分为两类：时间相关的事件、同步事件。所谓时间相关的事件，就是设置超时时间：在指定时间内阻塞，时间到了就进入就绪状态。使用时间相关的事件，可以实现周期性的功能、可以实现超时功能。同步事件就是：某个任务在等待某些信息，别的任务或者中断服务程序会给它发送信息。怎么"发送信息"？方法很多，有：任务通知(task notification)、队列(queue)、事件组(event group)、信号量(semaphoe)、互斥量(mutex)等。这些方法用来发送同步信息，比如表示某个外设得到了数据。



### 3.7.2 配置调度算法

所谓调度算法，就是怎么确定哪个就绪态的任务可以切换为运行状态。

通过配置文件FreeRTOSConfig.h的两个配置项来配置调度算法：configUSE_PREEMPTION、configUSE_TIME_SLICING。

还有第三个配置项：configUSE_TICKLESS_IDLE，它是一个高级选项，用于关闭Tick中断来实现省电，后续单独讲解。现在我们假设configUSE_TICKLESS_IDLE被设为0，先不使用这个功能。

调度算法的行为主要体现在两方面：高优先级的任务先运行、同优先级的就绪态任务如何被选中。调度算法要确保同优先级的就绪态任务，能"轮流"运行，策略是"轮转调度"(Round Robin Scheduling)。轮转调度并不保证任务的运行时间是公平分配的，我们还可以细化时间的分配方法。

从3个角度统一理解多种调度算法：

* 可否抢占？高优先级的任务能否优先执行(配置项: configUSE_PREEMPTION)
  * 可以：被称作"可抢占调度"(Pre-emptive)，高优先级的就绪任务马上执行，下面再细化。
  * 不可以：不能抢就只能协商了，被称作"合作调度模式"(Co-operative Scheduling)
    * 当前任务执行时，更高优先级的任务就绪了也不能马上运行，只能等待当前任务主动让出CPU资源。
    * 其他同优先级的任务也只能等待：更高优先级的任务都不能抢占，平级的更应该老实点

* 可抢占的前提下，同优先级的任务是否轮流执行(配置项：configUSE_TIME_SLICING)
  * 轮流执行：被称为"时间片轮转"(Time Slicing)，同优先级的任务轮流执行，你执行一个时间片、我再执行一个时间片
  * 不轮流执行：英文为"without Time Slicing"，当前任务会一直执行，直到主动放弃、或者被高优先级任务抢占

* 在"可抢占"+"时间片轮转"的前提下，进一步细化：空闲任务是否让步于用户任务(配置项：configIDLE_SHOULD_YIELD)
  * 空闲任务低人一等，每执行一次循环，就看看是否主动让位给用户任务
  * 空闲任务跟用户任务一样，大家轮流执行，没有谁更特殊

列表如下：

| 配置项                  | A    | B      | C      | D      | E        |
| ----------------------- | ---- | ------ | ------ | ------ | -------- |
| configUSE_PREEMPTION    | 1    | 1      | 1      | 1      | 0        |
| configUSE_TIME_SLICING  | 1    | 1      | 0      | 0      | x        |
| configIDLE_SHOULD_YIELD | 1    | 0      | 1      | 0      | x        |
| 说明                    | 常用 | 很少用 | 很少用 | 很少用 | 几乎不用 |

注：

* A：可抢占+时间片轮转+空闲任务让步
* B：可抢占+时间片轮转+空闲任务不让步
* C：可抢占+非时间片轮转+空闲任务让步
* D：可抢占+非时间片轮转+空闲任务不让步
* E：合作调度



### 3.7.3 示例7: 调度

本节代码为：`FreeRTOS_07_scheduler`。后续的实验都是基于这个程序，通过修改配置项来观察效果。

代码里创建了3个任务：Task1、Task2的优先级都是0，跟空闲任务一样，Task3优先级最高为2。程序里定义了4个全局变量，当某个的任务执行时，对应的变量就被设为1，可以通过Keil的逻辑分析仪查看任务切换情况：

```c
static volatile int flagIdleTaskrun = 0;  // 空闲任务运行时flagIdleTaskrun=1
static volatile int flagTask1run = 0;     // 任务1运行时flagTask1run=1
static volatile int flagTask2run = 0;     // 任务2运行时flagTask2run=1
static volatile int flagTask3run = 0;     // 任务3运行时flagTask3run=1
```



main函数代码如下：

```c
int main( void )
{
	prvSetupHardware();
	
	xTaskCreate(vTask1, "Task 1", 1000, NULL, 0, NULL);
	xTaskCreate(vTask2, "Task 2", 1000, NULL, 0, NULL);
	xTaskCreate(vTask3, "Task 3", 1000, NULL, 2, NULL);

	/* 启动调度器 */
	vTaskStartScheduler();

	/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
	return 0;
}
```



任务1、任务2代码如下，它们是"连续任务"(continuous  task)：

```c
void vTask1( void *pvParameters )
{
	/* 任务函数的主体一般都是无限循环 */
	for( ;; )
	{
		flagIdleTaskrun = 0;
		flagTask1run = 1;
		flagTask2run = 0;
		flagTask3run = 0;
		
		/* 打印任务的信息 */
		printf("T1\r\n");				
	}
}

void vTask2( void *pvParameters )
{	
	/* 任务函数的主体一般都是无限循环 */
	for( ;; )
	{
		flagIdleTaskrun = 0;
		flagTask1run = 0;
		flagTask2run = 1;
		flagTask3run = 0;
		
		/* 打印任务的信息 */
		printf("T2\r\n");				
	}
}
```



任务3代码如下，它会调用`vTaskDelay`，这样别的任务才可以运行：

```c
void vTask3( void *pvParameters )
{	
	const TickType_t xDelay5ms = pdMS_TO_TICKS( 5UL );		
	
	/* 任务函数的主体一般都是无限循环 */
	for( ;; )
	{
		flagIdleTaskrun = 0;
		flagTask1run = 0;
		flagTask2run = 0;
		flagTask3run = 1;
		
		/* 打印任务的信息 */
		printf("T3\r\n");				

		// 如果不休眠的话, 其他任务无法得到执行
		vTaskDelay( xDelay5ms );
	}
}
```



提供了一个空闲任务的钩子函数：

```c
void vApplicationIdleHook(void)
{
	flagIdleTaskrun = 1;
	flagTask1run = 0;
	flagTask2run = 0;
	flagTask3run = 0;	
	
	/* 故意加入打印让flagIdleTaskrun变为1的时间维持长一点 */
	printf("Id\r\n");				
}
```



### 3.7.4 对比效果: 抢占与否
在`FreeRTOSConfig.h`中，定义这样的宏，对比逻辑分析仪的效果：

```c
// 实验1：抢占
#define configUSE_PREEMPTION		1
#define configUSE_TIME_SLICING      1
#define configIDLE_SHOULD_YIELD		1

// 实验2：不抢占
#define configUSE_PREEMPTION		0
#define configUSE_TIME_SLICING      1
#define configIDLE_SHOULD_YIELD		1
```



从下面的对比图可以知道：

* 抢占时：高优先级任务就绪时，就可以马上执行
* 不抢占时：优先级失去意义了，既然不能抢占就只能协商了，图中任务1一直在运行(一点都没有协商精神)，其他任务都无法执行。即使任务3的`vTaskDelay`已经超时、即使它的优先级更高，都没办法执行。

![image-20210802000142854](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-3/18_pre-emptive_or_not.png)



### 3.7.5 对比效果: 时间片轮转与否
在`FreeRTOSConfig.h`中，定义这样的宏，对比逻辑分析仪的效果：

```c
// 实验1：时间片轮转
#define configUSE_PREEMPTION		1
#define configUSE_TIME_SLICING      1
#define configIDLE_SHOULD_YIELD		1

// 实验2：时间片不轮转
#define configUSE_PREEMPTION		1
#define configUSE_TIME_SLICING      0
#define configIDLE_SHOULD_YIELD		1
```



从下面的对比图可以知道：

* 时间片轮转：在Tick中断中会引起任务切换
* 时间片不轮转：高优先级任务就绪时会引起任务切换，高优先级任务不再运行时也会引起任务切换。可以看到任务3就绪后可以马上执行，它运行完毕后导致任务切换。其他时间没有任务切换，可以看到任务1、任务2都运行了很长时间。

![image-20210802000056846](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-3/19_time_slicing_or_not.png)




### 3.7.6 对比效果: 空闲任务让步

在`FreeRTOSConfig.h`中，定义这样的宏，对比逻辑分析仪的效果：

```c
// 实验1：空闲任务让步
#define configUSE_PREEMPTION		1
#define configUSE_TIME_SLICING      1
#define configIDLE_SHOULD_YIELD		1

// 实验2：空闲任务不让步
#define configUSE_PREEMPTION		1
#define configUSE_TIME_SLICING      1
#define configIDLE_SHOULD_YIELD		0
```



从下面的对比图可以知道：

* 让步时：在空闲任务的每个循环中，会主动让出处理器，从图中可以看到flagIdelTaskrun的波形很小
* 不让步时：空闲任务跟任务1、任务2同等待遇，它们的波形宽度是差不多的

![image-20210802000255899](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-3/20_yield_or_not.png)


## 技术答疑交流

在学习中遇到任何问题，请前往我们的技术交流社区留言： [https://forums.100ask.net](https://forums.100ask.net)


---
<center>本章完</center>




