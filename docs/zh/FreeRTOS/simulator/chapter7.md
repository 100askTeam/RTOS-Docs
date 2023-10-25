# 第七章 互斥量(mutex)

怎么独享厕所？自己开门上锁，完事了自己开锁。

你当然可以进去后，让别人帮你把门：但是，命运就掌握在别人手上了。

使用队列、信号量，都可以实现互斥访问，以信号量为例：

* 信号量初始值为1
* 任务A想上厕所，"take"信号量成功，它进入厕所
* 任务B也想上厕所，"take"信号量不成功，等待
* 任务A用完厕所，"give"信号量；轮到任务B使用

这需要有2个前提：

* 任务B很老实，不撬门(一开始不"give"信号量)
* 没有坏人：别的任务不会"give"信号量

可以看到，使用信号量确实也可以实现互斥访问，但是不完美。


使用互斥量可以解决这个问题，互斥量的名字取得很好：

* 量：值为0、1
* 互斥：用来实现互斥访问

它的核心在于：谁上锁，就只能由谁开锁。

很奇怪的是，FreeRTOS的互斥锁，并没有在代码上实现这点：

* 即使任务A获得了互斥锁，任务B竟然也可以释放互斥锁。
* 谁上锁、谁释放：只是约定。


本章涉及如下内容：

* 为什么要实现互斥操作
* 怎么使用互斥量
* 互斥量导致的优先级反转、优先级继承




## 7.1 互斥量的使用场合

在多任务系统中，任务A正在使用某个资源，还没用完的情况下任务B也来使用的话，就可能导致问题。

比如对于串口，任务A正使用它来打印，在打印过程中任务B也来打印，客户看到的结果就是A、B的信息混杂在一起。

这种现象很常见：

* 访问外设：刚举的串口例子

* 读、修改、写操作导致的问题
  对于同一个变量，比如`int a`，如果有两个任务同时写它就有可能导致问题。
  对于变量的修改，C代码只有一条语句，比如：`a=a+8;`，它的内部实现分为3步：读出原值、修改、写入。
  ![image-20210805160212640](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-7/01_modify_val.png)

  我们想让任务A、B都执行add_a函数，a的最终结果是`1+8+8=17`。
  假设任务A运行完代码①，在执行代码②之前被任务B抢占了：现在任务A的R0等于1。
  任务B执行完add_a函数，a等于9。
  任务A继续运行，在代码②处R0仍然是被抢占前的数值1，执行完②③的代码，a等于9，这跟预期的17不符合。

* 对变量的非原子化访问
  修改变量、设置结构体、在16位的机器上写32位的变量，这些操作都是非原子的。也就是它们的操作过程都可能被打断，如果被打断的过程有其他任务来操作这些变量，就可能导致冲突。

* 函数重入
  "可重入的函数"是指：多个任务同时调用它、任务和中断同时调用它，函数的运行也是安全的。可重入的函数也被称为"线程安全"(thread safe)。
  每个任务都维持自己的栈、自己的CPU寄存器，如果一个函数只使用局部变量，那么它就是线程安全的。
  函数中一旦使用了全局变量、静态变量、其他外设，它就不是"可重入的"，如果改函数正在被调用，就必须阻止其他任务、中断再次调用它。



上述问题的解决方法是：任务A访问这些全局变量、函数代码时，独占它，就是上个锁。这些全局变量、函数代码必须被独占地使用，它们被称为临界资源。

互斥量也被称为互斥锁，使用过程如下：

* 互斥量初始值为1
* 任务A想访问临界资源，先获得并占有互斥量，然后开始访问
* 任务B也想访问临界资源，也要先获得互斥量：被别人占有了，于是阻塞
* 任务A使用完毕，释放互斥量；任务B被唤醒、得到并占有互斥量，然后开始访问临界资源
* 任务B使用完毕，释放互斥量

正常来说：在任务A占有互斥量的过程中，任务B、任务C等等，都无法释放互斥量。

但是FreeRTOS未实现这点：任务A占有互斥量的情况下，任务B也可释放互斥量。



## 7.2 互斥量函数

### 7.2.1 创建

互斥量是一种特殊的二进制信号量。

使用互斥量时，先创建、然后去获得、释放它。使用句柄来表示一个互斥量。

创建互斥量的函数有2种：动态分配内存，静态分配内存，函数原型如下：

```c
/* 创建一个互斥量，返回它的句柄。
 * 此函数内部会分配互斥量结构体 
 * 返回值: 返回句柄，非NULL表示成功
 */
SemaphoreHandle_t xSemaphoreCreateMutex( void );

/* 创建一个互斥量，返回它的句柄。
 * 此函数无需动态分配内存，所以需要先有一个StaticSemaphore_t结构体，并传入它的指针
 * 返回值: 返回句柄，非NULL表示成功
 */
SemaphoreHandle_t xSemaphoreCreateMutexStatic( StaticSemaphore_t *pxMutexBuffer );
```



要想使用互斥量，需要在配置文件FreeRTOSConfig.h中定义：

```c
#define configUSE_MUTEXES 1
```





### 7.2.2 其他函数

要注意的是，互斥量不能在ISR中使用。

各类操作函数，比如删除、give/take，跟一般是信号量是一样的。

```c
/*
 * xSemaphore: 信号量句柄，你要删除哪个信号量, 互斥量也是一种信号量
 */
void vSemaphoreDelete( SemaphoreHandle_t xSemaphore );

/* 释放 */
BaseType_t xSemaphoreGive( SemaphoreHandle_t xSemaphore );

/* 释放(ISR版本) */
BaseType_t xSemaphoreGiveFromISR(
                       SemaphoreHandle_t xSemaphore,
                       BaseType_t *pxHigherPriorityTaskWoken
                   );

/* 获得 */
BaseType_t xSemaphoreTake(
                   SemaphoreHandle_t xSemaphore,
                   TickType_t xTicksToWait
               );
/* 获得(ISR版本) */
xSemaphoreGiveFromISR(
                       SemaphoreHandle_t xSemaphore,
                       BaseType_t *pxHigherPriorityTaskWoken
                   );
```



## 7.3 示例15: 互斥量基本使用

本节代码为： `FreeRTOS_15_mutex` 。

使用互斥量时有如下特点：

* 刚创建的互斥量可以被成功"take"
* "take"互斥量成功的任务，被称为"holder"，只能由它"give"互斥量；别的任务"give"不成功
* 在ISR中不能使用互斥量

本程序创建2个发送任务：故意发送大量的字符。可以做2个实验：

* 使用互斥量：可以看到任务1、任务2打印的字符串没有混杂在一起
* 不使用互斥量：任务1、任务2打印的字符串混杂在一起



main函数代码如下：

```c
/* 互斥量句柄 */
SemaphoreHandle_t xMutex;

int main( void )
{
	prvSetupHardware();
	
    /* 创建互斥量 */
    xMutex = xSemaphoreCreateMutex( );


	if( xMutex != NULL )
	{
		/* 创建2个任务: 都是打印
		 * 优先级相同
		 */
		xTaskCreate( vSenderTask, "Sender1", 1000, (void *)1, 1, NULL );
		xTaskCreate( vSenderTask, "Sender2", 1000, (void *)2, 1, NULL );

		/* 启动调度器 */
		vTaskStartScheduler();
	}
	else
	{
		/* 无法创建互斥量 */
	}

	/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
	return 0;
}
```



发送任务的函数如下：

```c
static void vSenderTask( void *pvParameters )
{
	const TickType_t xTicksToWait = pdMS_TO_TICKS( 10UL );	
	int cnt = 0;
	int task = (int)pvParameters;
	int i;
	char c;
	
	/* 无限循环 */
	for( ;; )
	{	
		/* 获得互斥量: 上锁 */
		xSemaphoreTake(xMutex, portMAX_DELAY);
		
		printf("Task %d use UART count: %d, ", task, cnt++);
		c = (task == 1 ) ? 'a' : 'A';
		for (i = 0; i < 26; i++)
			printf("%c", c + i);
		printf("\r\n");
		
		/* 释放互斥量: 开锁 */
		xSemaphoreGive(xMutex);
		
		vTaskDelay(xTicksToWait);
	}
}
```

可以做两个实验：vSenderTask函数的for循环中xSemaphoreTake和xSemaphoreGive这2句代码保留、不保留

* 保留：实验现象如下图左边，任务1、任务2的打印信息没有混在一起
* 不保留：实验现象如下图右边，打印信息混杂在一起



程序运行结果如下图所示：

![image-20210806213047410](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-7/02_mutex_result1.png)



## 7.4 示例16: 谁上锁就由谁解锁？

互斥量、互斥锁，本来的概念确实是：谁上锁就得由谁解锁。

但是FreeRTOS并没有实现这点，只是要求程序员按照这样的惯例写代码。

本节代码为： `FreeRTOS_16_mutex_who_give` 。



main函数创建了2个任务：

* 任务1：高优先级，一开始就获得互斥锁，永远不释放。
* 任务2：任务1阻塞时它开始执行，它先尝试获得互斥量，失败的话就监守自盗(释放互斥量、开锁)，然后再上锁

代码如下：

```c
int main( void )
{
	prvSetupHardware();
	
    /* 创建互斥量 */
    xMutex = xSemaphoreCreateMutex( );

	if( xMutex != NULL )
	{
		/* 创建2个任务: 一个上锁, 另一个自己监守自盗(开别人的锁自己用)
		 */
		xTaskCreate( vTakeTask, "Task1", 1000, NULL, 2, NULL );
		xTaskCreate( vGiveAndTakeTask, "Task2", 1000, NULL, 1, NULL );

		/* 启动调度器 */
		vTaskStartScheduler();
	}
	else
	{
		/* 无法创建互斥量 */
	}

	/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
	return 0;
}
```



两个任务的代码和执行流程如下图所示：

* A：任务1的优先级高，先运行，立刻上锁
* B：任务1阻塞
* C：任务2开始执行，尝试获得互斥量(上锁)，超时时间设为0。根据返回值打印出：上锁失败
* D：任务2监守自盗，开锁，成功！
* E：任务2成功获得互斥量
* F：任务2阻塞

可见，任务1上的锁，被任务2解开了。所以，FreeRTOS并没有实现"谁上锁就得由谁开锁"的功能。

![image-20210807002428420](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-7/03_mutex_code2.png)

程序运行结果如下图所示：

![image-20210807001351677](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-7/04_mutex_result2.png)



## 7.5 示例17: 优先级反转

假设任务A、B都想使用串口，A优先级比较低：

* 任务A获得了串口的互斥量
* 任务B也想使用串口，它将会阻塞、等待A释放互斥量
* 高优先级的任务，被低优先级的任务延迟，这被称为"优先级反转"(priority inversion)

如果涉及3个任务，可以让"优先级反转"的后果更加恶劣。

本节代码为： `FreeRTOS_17_mutex_inversion` 。

互斥量可以通过"优先级继承"，可以很大程度解决"优先级反转"的问题，这也是FreeRTOS中互斥量和二级制信号量的差别。

本节程序使用二级制信号量来演示"优先级反转"的恶劣后果。

main函数创建了3个任务：LPTask/MPTask/HPTask(低/中/高优先级任务)，代码如下：

```c
/* 互斥量/二进制信号量句柄 */
SemaphoreHandle_t xLock;

int main( void )
{
	prvSetupHardware();
	
    /* 创建互斥量/二进制信号量 */
    xLock = xSemaphoreCreateBinary( );


	if( xLock != NULL )
	{
		/* 创建3个任务: LP,MP,HP(低/中/高优先级任务)
		 */
		xTaskCreate( vLPTask, "LPTask", 1000, NULL, 1, NULL );
		xTaskCreate( vMPTask, "MPTask", 1000, NULL, 2, NULL );
		xTaskCreate( vHPTask, "HPTask", 1000, NULL, 3, NULL );

		/* 启动调度器 */
		vTaskStartScheduler();
	}
	else
	{
		/* 无法创建互斥量/二进制信号量 */
	}

	/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
	return 0;
}
```



LPTask/MPTask/HPTask三个任务的代码和运行过程如下图所示：

* A：HPTask优先级最高，它最先运行。在这里故意打印，这样才可以观察到flagHPTaskRun的脉冲。
* HP Delay：HPTask阻塞
* B：MPTask开始运行。在这里故意打印，这样才可以观察到flagMPTaskRun的脉冲。
* MP Delay：MPTask阻塞
* C：LPTask开始运行，获得二进制信号量，然后故意打印很多字符
* D：HP Delay时间到，HPTask恢复运行，它无法获得二进制信号量，一直阻塞等待
* E：MP Delay时间到，MPTask恢复运行，它比LPTask优先级高，一直运行。导致LPTask无法运行，自然无法释放二进制信号量，于是HPTask用于无法运行。

总结：

* LPTask先持有二进制信号量，
* 但是MPTask抢占LPTask，是的LPTask一直无法运行也就无法释放信号量，
* 导致HPTask任务无法运行
* 优先级最高的HPTask竟然一直无法运行！

![image-20210807022840044](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-7/05_semaphore_priority_inversion.png)



程序运行的时序图如下：

![image-20210807024154678](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-7/06_semaphore_priority_inversion_result.png)



## 7.6 示例18: 优先级继承

本节代码为： `FreeRTOS_18_mutex_inheritance` 。

示例17的问题在于，LPTask低优先级任务获得了锁，但是它优先级太低而无法运行。

如果能提升LPTask任务的优先级，让它能尽快运行、释放锁，"优先级反转"的问题不就解决了吗？

把LPTask任务的优先级提升到什么水平？

优先级继承：

* 假设持有互斥锁的是任务A，如果更高优先级的任务B也尝试获得这个锁
* 任务B说：你既然持有宝剑，又不给我，那就继承我的愿望吧
* 于是任务A就继承了任务B的优先级
* 这就叫：优先级继承
* 等任务A释放互斥锁时，它就恢复为原来的优先级
* 互斥锁内部就实现了优先级的提升、恢复

本节源码是在`FreeRTOS_17_mutex_inversion` 的代码上做了一些简单修改：

```c
int main( void )
{
	prvSetupHardware();
	
    /* 创建互斥量/二进制信号量 */
    //xLock = xSemaphoreCreateBinary( );
	xLock = xSemaphoreCreateMutex( );

```



运行时序图如下图所示：

* A：HPTask执行`xSemaphoreTake(xLock, portMAX_DELAY);`，它的优先级被LPTask继承
* B：LPTask抢占MPTask，运行
* C：LPTask执行`xSemaphoreGive(xLock);`，它的优先级恢复为原来值
* D：HPTask得到互斥锁，开始运行
* 互斥锁的"优先级继承"，可以减小"优先级反转"的影响

![image-20210807030831302](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-7/07_semaphore_priority_inversion_result2.png)



## 7.7 递归锁

### 7.7.1 死锁的概念

日常生活的死锁：我们只招有工作经验的人！我没有工作经验怎么办？那你就去找工作啊！

假设有2个互斥量M1、M2，2个任务A、B：

* A获得了互斥量M1
* B获得了互斥量M2
* A还要获得互斥量M2才能运行，结果A阻塞
* B还要获得互斥量M1才能运行，结果B阻塞
* A、B都阻塞，再无法释放它们持有的互斥量
* 死锁发生！



### 7.7.2 自我死锁

假设这样的场景：

* 任务A获得了互斥锁M
* 它调用一个库函数
* 库函数要去获取同一个互斥锁M，于是它阻塞：任务A休眠，等待任务A来释放互斥锁！
* 死锁发生！



### 7.7.3 函数

怎么解决这类问题？可以使用递归锁(Recursive Mutexes)，它的特性如下：

* 任务A获得递归锁M后，它还可以多次去获得这个锁
* "take"了N次，要"give"N次，这个锁才会被释放



递归锁的函数根一般互斥量的函数名不一样，参数类型一样，列表如下：

|      | 递归锁                         | 一般互斥量            |
| ---- | ------------------------------ | --------------------- |
| 创建 | xSemaphoreCreateRecursiveMutex | xSemaphoreCreateMutex |
| 获得 | xSemaphoreTakeRecursive        | xSemaphoreTake        |
| 释放 | xSemaphoreGiveRecursive        | xSemaphoreGive        |

  

函数原型如下：

```c
/* 创建一个递归锁，返回它的句柄。
 * 此函数内部会分配互斥量结构体 
 * 返回值: 返回句柄，非NULL表示成功
 */
SemaphoreHandle_t xSemaphoreCreateRecursiveMutex( void );


/* 释放 */
BaseType_t xSemaphoreGiveRecursive( SemaphoreHandle_t xSemaphore );

/* 获得 */
BaseType_t xSemaphoreTakeRecursive(
                   SemaphoreHandle_t xSemaphore,
                   TickType_t xTicksToWait
               );
```



### 7.7.4 示例19: 递归锁

本节代码为： `FreeRTOS_19_mutex_recursive` 。

递归锁实现了：谁上锁就由谁解锁。

本程序从`FreeRTOS_16_mutex_who_give`修改得来，它的main函数里创建了2个任务

* 任务1：高优先级，一开始就获得递归锁，然后故意等待很长时间，让任务2运行
* 任务2：低优先级，看看能否操作别人持有的锁



main函数代码如下：

```c
/* 递归锁句柄 */
SemaphoreHandle_t xMutex;

int main( void )
{
	prvSetupHardware();
	
    /* 创建递归锁 */
    xMutex = xSemaphoreCreateRecursiveMutex( );

	if( xMutex != NULL )
	{
		/* 创建2个任务: 一个上锁, 另一个自己监守自盗(看看能否开别人的锁自己用)
		 */
		xTaskCreate( vTakeTask, "Task1", 1000, NULL, 2, NULL );
		xTaskCreate( vGiveAndTakeTask, "Task2", 1000, NULL, 1, NULL );

		/* 启动调度器 */
		vTaskStartScheduler();
	}
	else
	{
		/* 无法创建递归锁 */
	}

	/* 如果程序运行到了这里就表示出错了, 一般是内存不足 */
	return 0;
}
```



两个任务经过精细设计，代码和运行流程如下图所示：

* A：任务1优先级最高，先运行，获得递归锁

* B：任务1阻塞，让任务2得以运行

* C：任务2运行，看看能否获得别人持有的递归锁：不能

* D：任务2故意执行"give"操作，看看能否释放别人持有的递归锁：不能

* E：任务2等待递归锁

* F：任务1阻塞时间到后继续运行，使用循环多次获得、释放递归锁

* 递归锁在代码上实现了：谁持有递归锁，必须由谁释放。

  

![image-20210807045027754](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-7/08_recursive_mutex_code.png)



程序运行结果如下图所示：

![image-20210807042932296](http://photos.100ask.net/rtos-docs/FreeRTOS/simulator/chapter-7/09_recursive_mutex_result.png)



## 7.8 常见问题

使用互斥量的两个任务是相同优先级时的注意事项。


## 技术答疑交流

在学习中遇到任何问题，请前往我们的技术交流社区留言： [https://forums.100ask.net](https://forums.100ask.net)


---
<center>本章完</center>

