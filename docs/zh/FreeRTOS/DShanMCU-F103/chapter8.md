# 第8章 内存管理

## 8.1 为什么要自己实现内存管理

后续的章节涉及这些内核对象：task、queue、semaphores和event group等。为了让FreeRTOS更容易使用，这些内核对象一般都是动态分配：用到时分配，不使用时释放。使用内存的动态管理功能，简化了程序设计：不再需要小心翼翼地提前规划各类对象，简化API函数的涉及，甚至可以减少内存的使用。

内存的动态管理是C程序的知识范畴，并不属于FreeRTOS的知识范畴，但是它跟FreeRTOS关系是如此紧密，所以我们先讲解它。

在C语言的库函数中，有mallc、free等函数，但是在FreeRTOS中，它们不适用：

- 不适合用在资源紧缺的嵌入式系统中
- 这些函数的实现过于复杂、占据的代码空间太大
- 并非线程安全的(thread- safe)
- 运行有不确定性：每次调用这些函数时花费的时间可能都不相同
- 内存碎片化
- 使用不同的编译器时，需要进行复杂的配置
- 有时候难以调试

注意：我们经常"堆栈"混合着说，其实它们不是同一个东西：
- 堆，heap，就是一块空闲的内存，需要提供管理函数
  - malloc：从堆里划出一块空间给程序使用
  - free：用完后，再把它标记为"空闲"的，可以再次使用
- 栈，stack，函数调用时局部变量保存在栈中，当前程序的环境也是保存在栈中
  - 可以从堆中分配一块空间用作栈

<img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-8/image1.png" style="zoom:33%;" />

## 8.2 FreeRTOS的5中内存管理方法

FreeRTOS中内存管理的接口函数为：pvPortMalloc 、vPortFree，对应于C库的malloc、free。
文件在FreeRTOS/Source/portable/MemMang下，它也是放在portable目录下，表示你可以提供自己的函数。

源码中默认提供了5个文件，对应内存管理的5种方法。

参考文章：[FreeRTOS说明书吐血整理【适合新手+入门】](https://blog.csdn.net/qq_43212092/article/details/104845158)

| **文件** | **优点**                       | **缺点**                 |
| -------- | ------------------------------ | ------------------------ |
| heap_1.c | 分配简单，时间确定             | 只分配、不回收           |
| heap_2.c | 动态分配、最佳匹配             | 碎片、时间不定           |
| heap_3.c | 调用标准库函数                 | 速度慢、时间不定         |
| heap_4.c | 相邻空闲内存可合并             | 可解决碎片问题、时间不定 |
| heap_5.c | 在heap_4基础上支持分隔的内存块 | 可解决碎片问题、时间不定 |

### 8.2.1 Heap_1

它只实现了pvPortMalloc，没有实现vPortFree。

如果你的程序不需要删除内核对象，那么可以使用heap_1：

- 实现最简单
- 没有碎片问题
- 一些要求非常严格的系统里，不允许使用动态内存，就可以使用heap_1

它的实现原理很简单，首先定义一个大数组：

```c
/* Allocate the memory for the heap. */
##if ( configAPPLICATION_ALLOCATED_HEAP == 1 )

/* The application writer has already defined the array used for the RTOS
* heap -  probably so it can be placed in a special segment or address. */
    extern uint8_t ucHeap[ configTOTAL_HEAP_SIZE ];
##else
    static uint8_t ucHeap[ configTOTAL_HEAP_SIZE ];
##endif /* configAPPLICATION_ALLOCATED_HEAP */
```

然后，对于pvPortMalloc调用时，从这个数组中分配空间。

FreeRTOS在创建任务时，需要2个内核对象：task control block(TCB)、stack。
使用heap_1时，内存分配过程如下图所示：

- A：创建任务之前整个数组都是空闲的
- B：创建第1个任务之后，蓝色区域被分配出去了
- C：创建3个任务之后的数组使用情况

<img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-8/image3.png" alt="image3" style="zoom: 67%;" />

### 8.2.2 Heap_2

Heap_2之所以还保留，只是为了兼容以前的代码。新设计中不再推荐使用Heap_2。建议使用Heap_4来替代Heap_2，更加高效。

Heap_2也是在数组上分配内存，跟Heap_1不一样的地方在于：

- Heap_2使用最佳匹配算法(best fit)来分配内存
- 它支持vPortFree

最佳匹配算法：

- 假设heap有3块空闲内存：5字节、25字节、100字节
- pvPortMalloc想申请20字节
- 找出最小的、能满足pvPortMalloc的内存：25字节
- 把它划分为20字节、5字节
  - 返回这20字节的地址
  - 剩下的5字节仍然是空闲状态，留给后续的pvPortMalloc使用

与Heap_4相比，Heap_2不会合并相邻的空闲内存，所以Heap_2会导致严重的"碎片化"问题。

但是，如果申请、分配内存时大小总是相同的，这类场景下Heap_2没有碎片化的问题。所以它适合这种场景：频繁地创建、删除任务，但是任务的栈大小都是相同的(创建任务时，需要分配TCB和栈，TCB总是一样的)。

虽然不再推荐使用heap_2，但是它的效率还是远高于malloc、free。

使用heap_2时，内存分配过程如下图所示：

-  A：创建了3个任务
-  B：删除了一个任务，空闲内存有3部分：顶层的、被删除任务的TCB空间、被删除任务的Stack空间
-  C：创建了一个新任务，因为TCB、栈大小跟前面被删除任务的TCB、栈大小一致，所以刚好分配到原来的内存

<img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-8/image4.png" alt="image43" style="zoom: 67%;" />

### 8.2.3 Heap_3

Heap_3使用标准C库里的malloc、free函数，所以堆大小由链接器的配置决定，配置项configTOTAL_HEAP_SIZE不再起作用。

C库里的malloc、free函数并非线程安全的，Heap_3中先暂停FreeRTOS的调度器，再去调用这些函数，使用这种方法实现了线程安全。

### 8.2.4 Heap_4

跟Heap_1、Heap_2一样，Heap_4也是使用大数组来分配内存。

Heap_4使用 **首次适应算法(first fit)来分配内存** 。它还会把相邻的空闲内存合并为一个更大的空闲内存，这有助于较少内存的碎片问题。

首次适应算法：

- 假设堆中有3块空闲内存：5字节、200字节、100字节
- pvPortMalloc想申请20字节
- 找出第1个能满足pvPortMalloc的内存：200字节
- 把它划分为20字节、180字节
- 返回这20字节的地址
- 剩下的180字节仍然是空闲状态，留给后续的pvPortMalloc使用

Heap_4会把相邻空闲内存合并为一个大的空闲内存，可以较少内存的碎片化问题。适用于这种场景：频繁地分配、释放不同大小的内存。

Heap_4的使用过程举例如下：

- A：创建了3个任务
- B：删除了一个任务，空闲内存有2部分：
- 顶层的
- 被删除任务的TCB空间、被删除任务的Stack空间合并起来的
- C：分配了一个Queue，从第1个空闲块中分配空间
- D：分配了一个User数据，从Queue之后的空闲块中分配
- E：释放的Queue，User前后都有一块空闲内存
- F：释放了User数据，User前后的内存、User本身占据的内存，合并为一个大的空闲内存

<img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-8/image5.png" alt="image5" style="zoom:67%;" />

Heap_4执行的时间是不确定的，但是它的效率高于标准库的malloc、free。

### 8.2.5  Heap_5

Heap_5分配内存、释放内存的算法跟Heap_4是一样的。

相比于Heap_4，Heap_5并不局限于管理一个大数组：它可以管理多块、分隔开的内存。

在嵌入式系统中，内存的地址可能并不连续，这种场景下可以使用Heap_5。

既然内存是分隔开的，那么就需要进行初始化：确定这些内存块在哪、多大：

- 在使用pvPortMalloc之前，必须先指定内存块的信息
- 使用vPortDefineHeapRegions来指定这些信息

怎么指定一块内存？使用如下结构体：

```c
typedef struct HeapRegion
{
    uint8_t * pucStartAddress; // 起始地址
    size_t xSizeInBytes;       // 大小
} HeapRegion_t;
```

怎么指定多块内存？使用一个HeapRegion_t数组，在这个数组中，低地址在前、高地址在后。
比如：

```c
HeapRegion_t xHeapRegions[] =
{
  { ( uint8_t * ) 0x80000000UL, 0x10000 }, // 起始地址0x80000000，大小0x10000
  { ( uint8_t * ) 0x90000000UL, 0xa0000 }, // 起始地址0x90000000，大小0xa0000
  { NULL, 0 } // 表示数组结束
 };
```

vPortDefineHeapRegions函数原型如下：

```c
void vPortDefineHeapRegions( const HeapRegion_t * const pxHeapRegions );
​```c

把xHeapRegions数组传给vPortDefineHeapRegions函数，即可初始化Heap_5。


## 8.3 Heap相关的函数

### 8.3.1 pvPortMalloc/vPortFree

函数原型：

​```c
void * pvPortMalloc( size_t xWantedSize );
void vPortFree( void * pv );
```

## 8.3 Heap相关的函数

### 8.3.1 pvPortMalloc/vPortFree

函数原型：

```c
void * pvPortMalloc( size_t xWantedSize );
void vPortFree( void * pv );
```

作用：分配内存、释放内存。

如果分配内存不成功，则返回值为NULL。

### 8.3.2 xPortGetFreeHeapSize

函数原型：

```c
size_t xPortGetFreeHeapSize( void );
```

当前还有多少空闲内存，这函数可以用来优化内存的使用情况。比如当所有内核对象都分配好后，执行此函数返回2000，那么configTOTAL_HEAP_SIZE就可减小2000。

注意：在heap_3中无法使用。

### 8.3.3 xPortGetMinimumEverFreeHeapSize

函数原型：

```c
size_t xPortGetMinimumEverFreeHeapSize( void );
```

返回：程序运行过程中，空闲内存容量的最小值。

注意：只有heap_4、heap_5支持此函数。

### 8.3.4 malloc失败的钩子函数

在pvPortMalloc函数内部：

```c
void * pvPortMalloc( size_t xWantedSize )vPortDefineHeapRegions
{
    ......
    #if ( configUSE_MALLOC_FAILED_HOOK == 1 )
        {
            if( pvReturn == NULL )
            {
                extern void vApplicationMallocFailedHook( void );
                vApplicationMallocFailedHook();
            }
        }
    #endif
    
    return pvReturn;        
}
```


所以，如果想使用这个钩子函数：

- 在FreeRTOSConfig.h中，把configUSE_MALLOC_FAILED_HOOK定义为1
- 提供vApplicationMallocFailedHook函数
- pvPortMalloc失败时，才会调用此函数