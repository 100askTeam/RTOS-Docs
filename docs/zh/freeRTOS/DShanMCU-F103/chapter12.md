# 第12章 信号量(semaphore)

前面介绍的队列(queue)可以用于传输数据：在任务之间、任务和中断之间。

消息队列用于传输多个数据，但是有时候我们只需要传递状态，这个状态值需要用一个数值表示，比如：

- 卖家：做好了1个包子！做好了2个包子！做好了3个包子！
- 买家：买了1个包子，包子数量减1
- 这个停车位我占了，停车位减1
- 我开车走了，停车位加1

在这种情况下我们只需要维护一个数值，使用信号量效率更高、更节省内存
本章涉及如下内容：

- 怎么创建、删除信号量
- 怎么发送、获得信号量
- 什么是计数型信号量？什么是二进制信号量？

## 12.1 信号量的特性

### 12.1.1 信号量的常规操作

信号量这个名字很恰当：

- 信号：起通知作用
- 量：还可以用来表示资源的数量
  - 当"量"没有限制时，它就是"计数型信号量"(Counting Semaphores)
  - 当"量"只有0、1两个取值时，它就是"二进制信号量"(Binary Semaphores)
- 支持的动作："give"给出资源，计数值加1；"take"获得资源，计数值减1

计数型信号量的典型场景是：

- 计数：事件产生时"give"信号量，让计数值加1；处理事件时要先"take"信号量，就是获得信号量，让计数值减1。
- 资源管理：要想访问资源需要先"take"信号量，让计数值减1；用完资源后"give"信号量，让计数值加1。
信号量的"give"、"take"双方并不需要相同，可以用于生产者-消费者场合：
- 生产者为任务A、B，消费者为任务C、D
- 一开始信号量的计数值为0，如果任务C、D想获得信号量，会有两种结果：
  - 阻塞：买不到东西咱就等等吧，可以定个闹钟(超时时间)
  - 即刻返回失败：不等
- 任务A、B可以生产资源，就是让信号量的计数值增加1，并且把等待这个资源的顾客唤醒
- 唤醒谁？谁优先级高就唤醒谁，如果大家优先级一样就唤醒等待时间最长的人

二进制信号量跟计数型的唯一差别，就是计数值的最大值被限定为1。

![](http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-12/image1.png)

### 12.1.2 信号量跟队列的对比

差异列表如下：

| 队列                                                         | 信号量                                                       |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| 可以容纳多个数据， 创建队列时有2部分内存: 队列结构体、存储数据的空间 | 只有计数值，无法容纳其他数据。 创建信号量时，只需要分配信号量结构体 |
| 生产者：没有空间存入数据时可以阻塞                           | 生产者：用于不阻塞，计数值已经达到最大时返回失败             |
| 消费者：没有数据时可以阻塞                                   | 消费者：没有资源时可以阻塞                                   |

### 12.1.3 两种信号量的对比

信号量的计数值都有限制：限定了最大值。如果最大值被限定为1，那么它就是二进制信号量；如果最大值不是1，它就是计数型信号量。

差别列表如下：

| 二进制信号量      | 技术型信号量           |
| ----------------- | ---------------------- |
| 被创建时初始值为0 | 被创建时初始值可以设定 |
| 其他操作是一样的  | 其他操作是一样的       |

## 12.2 信号量函数
使用信号量时，先创建、然后去添加资源、获得资源。使用句柄来表示一个信号量。

### 12.2.1 创建

使用信号量之前，要先创建，得到一个句柄；使用信号量时，要使用句柄来表明使用哪个信号量。
对于二进制信号量、计数型信号量，它们的创建函数不一样：

|          | 二进制信号量                                   | 计数型信号量                   |
| -------- | ---------------------------------------------- | ------------------------------ |
| 动态创建 | xSemaphoreCreateBinary 计数值初始值为0         | xSemaphoreCreateCounting       |
|          | vSemaphoreCreateBinary(过时了) 计数值初始值为1 |                                |
| 静态创建 | xSemaphoreCreateBinaryStatic                   | xSemaphoreCreateCountingStatic |

创建二进制信号量的函数原型如下：

```c
/* 创建一个二进制信号量，返回它的句柄。
 * 此函数内部会分配信号量结构体 
 * 返回值: 返回句柄，非NULL表示成功
 */
SemaphoreHandle_t xSemaphoreCreateBinary( void );

/* 创建一个二进制信号量，返回它的句柄。
 * 此函数无需动态分配内存，所以需要先有一个StaticSemaphore_t结构体，并传入它的指针
 * 返回值: 返回句柄，非NULL表示成功
 */
SemaphoreHandle_t xSemaphoreCreateBinaryStatic( StaticSemaphore_t *pxSemaphoreBuffer );
```

创建计数型信号量的函数原型如下：

```c
/* 创建一个计数型信号量，返回它的句柄。
 * 此函数内部会分配信号量结构体 
 * uxMaxCount: 最大计数值
 * uxInitialCount: 初始计数值
 * 返回值: 返回句柄，非NULL表示成功
 */
SemaphoreHandle_t xSemaphoreCreateCounting(UBaseType_t uxMaxCount, UBaseType_t uxInitialCount);

/* 创建一个计数型信号量，返回它的句柄。
 * 此函数无需动态分配内存，所以需要先有一个StaticSemaphore_t结构体，并传入它的指针
 * uxMaxCount: 最大计数值
 * uxInitialCount: 初始计数值
 * pxSemaphoreBuffer: StaticSemaphore_t结构体指针
 * 返回值: 返回句柄，非NULL表示成功
 */
SemaphoreHandle_t xSemaphoreCreateCountingStatic( UBaseType_t uxMaxCount, 
                                                 UBaseType_t uxInitialCount, 
                                                 StaticSemaphore_t *pxSemaphoreBuffer );
```

### 12.2.2 删除

对于动态创建的信号量，不再需要它们时，可以删除它们以回收内存。

vSemaphoreDelete可以用来删除二进制信号量、计数型信号量，函数原型如下：

```c
/*
 * xSemaphore: 信号量句柄，你要删除哪个信号量
 */
void vSemaphoreDelete( SemaphoreHandle_t xSemaphore );
```

### 12.2.3 give/take

二进制信号量、计数型信号量的give、take操作函数是一样的。这些函数也分为2个版本：给任务使用，给ISR使用。列表如下：

|      | 在任务中使用   | 在ISR中使用           |
| ---- | -------------- | --------------------- |
| give | xSemaphoreGive | xSemaphoreGiveFromISR |
| take | xSemaphoreTake | xSemaphoreTakeFromISR |

xSemaphoreGive的函数原型如下：

```c
BaseType_t xSemaphoreGive( SemaphoreHandle_t xSemaphore );
```

xSemaphoreGive函数的参数与返回值列表如下：

| 参数       | 说明                                                         |
| ---------- | ------------------------------------------------------------ |
| xSemaphore | 信号量句柄，释放哪个信号量                                   |
| 返回值     | pdTRUE表示成功, 如果二进制信号量的计数值已经是1，再次调用此函数则返回失败； 如果计数型信号量的计数值已经是最大值，再次调用此函数则返回失败 |

pxHigherPriorityTaskWoken的函数原型如下：

```c
BaseType_t xSemaphoreGiveFromISR(
                        SemaphoreHandle_t xSemaphore,
                        BaseType_t *pxHigherPriorityTaskWoken
                    );
```

xSemaphoreGiveFromISR函数的参数与返回值列表如下：

| 参数                      | 说明                                                         |
| ------------------------- | ------------------------------------------------------------ |
| xSemaphore                | 信号量句柄，释放哪个信号量                                   |
| pxHigherPriorityTaskWoken | 如果释放信号量导致更高优先级的任务变为了就绪态， 则*pxHigherPriorityTaskWoken = pdTRUE |
| 返回值                    | pdTRUE表示成功, 如果二进制信号量的计数值已经是1，再次调用此函数则返回失败； 如果计数型信号量的计数值已经是最大值，再次调用此函数则返回失败 |

xSemaphoreTake的函数原型如下：

```c
BaseType_t xSemaphoreTake(
                   SemaphoreHandle_t xSemaphore,
                   TickType_t xTicksToWait
               );
```

xSemaphoreTake函数的参数与返回值列表如下：

| 参数         | 说明                                                         |
| ------------ | ------------------------------------------------------------ |
| xSemaphore   | 信号量句柄，获取哪个信号量                                   |
| xTicksToWait | 如果无法马上获得信号量，阻塞一会： 0：不阻塞，马上返回 portMAX_DELAY: 一直阻塞直到成功 其他值: 阻塞的Tick个数，可以使用*pdMS_TO_TICKS()*来指定阻塞时间为若干ms |
| 返回值       | pdTRUE表示成功                                               |

xSemaphoreTakeFromISR的函数原型如下：

```c
BaseType_t xSemaphoreTakeFromISR(
                        SemaphoreHandle_t xSemaphore,
                        BaseType_t *pxHigherPriorityTaskWoken
                    );
```

xSemaphoreTakeFromISR函数的参数与返回值列表如下：

| 参数                      | 说明                                                         |
| ------------------------- | ------------------------------------------------------------ |
| xSemaphore                | 信号量句柄，获取哪个信号量                                   |
| pxHigherPriorityTaskWoken | 如果获取信号量导致更高优先级的任务变为了就绪态， 则*pxHigherPriorityTaskWoken = pdTRUE |
| 返回值                    | pdTRUE表示成功                                               |
