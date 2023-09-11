# 第一章 FreeRTOS概述与体验

## 1.1 FreeRTOS目录结构

以Keil工具下STM32F103芯片为例，它的FreeRTOS的目录如下:

![image-20210727184941737](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-1/01_dir_file.png)


主要涉及2个目录：

* Demo
  * Demo目录下是工程文件，以"芯片和编译器"组合成一个名字
  * 比如：CORTEX_STM32F103_Keil
* Source
  * 根目录下是核心文件，这些文件是通用的
  * portable目录下是移植时需要实现的文件
    * 目录名为：[compiler]/[architecture]
    * 比如：RVDS/ARM_CM3，这表示cortexM3架构在RVDS工具上的移植文件



## 1.2 核心文件

FreeRTOS的最核心文件只有2个：

* FreeRTOS/Source/tasks.c
* FreeRTOS/Source/list.c

其他文件的作用也一起列表如下：

| FreeRTOS/Source/下的文件 | 作用                                          |
| ------------------------ | --------------------------------------------- |
| tasks.c                  | 必需，任务操作                                |
| list.c                   | 必须，列表                                    |
| queue.c                  | 基本必需，提供队列操作、信号量(semaphore)操作 |
| timer.c                  | 可选，software timer                          |
| event_groups.c           | 可选，提供event group功能                     |
| croutine.c               | 可选，过时了                                  |



## 1.3 移植时涉及的文件

移植FreeRTOS时涉及的文件放在`FreeRTOS/Source/portable/[compiler]/[architecture]`目录下，

比如：RVDS/ARM_CM3，这表示cortexM3架构在RVDS或Keil工具上的移植文件。

里面有2个文件：

* port.c
* portmacro.h



## 1.4 头文件相关

### 1.4.1 头文件目录

FreeRTOS需要3个头文件目录：

* FreeRTOS本身的头文件：FreeRTOS/Source/include
* 移植时用到的头文件：FreeRTOS/Source/portable/[compiler]/[architecture]  
* 含有配置文件FreeRTOSConfig.h的目录



### 1.4.2 头文件

列表如下：

| 头文件           | 作用                                                         |
| ---------------- | ------------------------------------------------------------ |
| FreeRTOSConfig.h | FreeRTOS的配置文件，比如选择调度算法：configUSE_PREEMPTION<br />每个demo都必定含有FreeRTOSConfig.h<br />建议去修改demo中的FreeRTOSConfig.h，而不是从头写一个 |
| FreeRTOS.h       | 使用FreeRTOS API函数时，必须包含此文件。<br />在FreeRTOS.h之后，再去包含其他头文件，比如：<br />task.h、queue.h、semphr.h、event_group.h |




## 1.5 内存管理

文件在`FreeRTOS/Source/portable/MemMang`下，它也是放在`portable`目录下，表示你可以提供自己的函数。

源码中默认提供了5个文件，对应内存管理的5种方法。

参考文章：[FreeRTOS说明书吐血整理【适合新手+入门】](https://blog.csdn.net/qq_43212092/article/details/104845158)

后续章节会详细讲解。

| 文件     | 优点                           | 缺点                     |
| -------- | ------------------------------ | ------------------------ |
| heap_1.c | 分配简单，时间确定             | 只分配、不回收           |
| heap_2.c | 动态分配、最佳匹配             | 碎片、时间不定           |
| heap_3.c | 调用标准库函数                 | 速度慢、时间不定         |
| heap_4.c | 相邻空闲内存可合并             | 可解决碎片问题、时间不定 |
| heap_5.c | 在heap_4基础上支持分隔的内存块 | 可解决碎片问题、时间不定 |



## 1.6 Demo

Demo目录下是预先配置好的、没有编译错误的工程。目的是让你可以基于它进行修改，以适配你的单板。

这些Demo还可以继续精简：

* `Demo/Common`中的文件可以完全删除
* main函数中只需要保留2个函数：
  * prvSetupHardware()
  * vTaskStartScheduler()
  * 如下图所示

![image-20210727193404198](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-1/02_simple_main.c.png)



## 1.7 数据类型和编程规范

### 1.7.1 数据类型

每个移植的版本都含有自己的`portmacro.h`头文件，里面定义了2个数据类型：

* TickType_t：
  * FreeRTOS配置了一个周期性的时钟中断：Tick Interrupt
  * 每发生一次中断，中断次数累加，这被称为tick count
  * tick count这个变量的类型就是TickType_t
  * TickType_t可以是16位的，也可以是32位的
  * FreeRTOSConfig.h中定义configUSE_16_BIT_TICKS时，TickType_t就是uint16_t
  * 否则TickType_t就是uint32_t
  * 对于32位架构，建议把TickType_t配置为uint32_t
* BaseType_t：
  * 这是该架构最高效的数据类型
  * 32位架构中，它就是uint32_t
  * 16位架构中，它就是uint16_t
  * 8位架构中，它就是uint8_t
  * BaseType_t通常用作简单的返回值的类型，还有逻辑值，比如`pdTRUE/pdFALSE`



### 1.7.2 变量名

变量名有前缀：

| 变量名前缀 | 含义                                                         |
| ---------- | ------------------------------------------------------------ |
| c          | char                                                         |
| s          | int16_t，short                                               |
| l          | int32_t，long                                                |
| x          | BaseType_t，<br />其他非标准的类型：结构体、task handle、queue handle等 |
| u          | unsigned                                                     |
| p          | 指针                                                         |
| uc         | uint8_t，unsigned char                                       |
| pc         | char指针                                                     |



### 1.7.3 函数名

函数名的前缀有2部分：返回值类型、在哪个文件定义。

| 函数名前缀        | 含义                                            |
| ----------------- | ----------------------------------------------- |
| vTaskPrioritySet  | 返回值类型：void<br />在task.c中定义            |
| xQueueReceive     | 返回值类型：BaseType_t<br />在queue.c中定义     |
| pvTimerGetTimerID | 返回值类型：pointer to void<br />在tmer.c中定义 |



### 1.7.4 宏的名

宏的名字是大小，可以添加小写的前缀。前缀是用来表示：宏在哪个文件中定义。

| 宏的前缀                          | 含义：在哪个文件里定义  |
| --------------------------------- | ----------------------- |
| port (比如portMAX_DELAY)          | portable.h或portmacro.h |
| task (比如taskENTER_CRITICAL())   | task.h                  |
| pd (比如pdTRUE)                   | projdefs.h              |
| config (比如configUSE_PREEMPTION) | FreeRTOSConfig.h        |
| err (比如errQUEUE_FULL)           | projdefs.h              |



通用的宏定义如下：

| 宏      | 值   |
| ------- | ---- |
| pdTRUE  | 1    |
| pdFALSE | 0    |
| pdPASS  | 1    |
| pdFAIL  | 0    |





## 1.8 安装Keil

本教程的所有程序，都是使用Keil开发，运行在Keil的模拟器上。

### 1.8.1 下载Keil

Keil-MDK（Keil ARM Microcontroller Development Kit）前生是德国Keil公司，后被ARM收购，是ARM官方的集成开发环境。

打开Keil官网（https://www.keil.com/download/product/），点击“MDK-Arm”进行下载。

![image-20210727193404198](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-1/03_download_MDK.png)



随后进入个人信息完善页面，按提示填写所有的信息，如下图所示，填写完后，点击“Submit”提交。

![image-20210727193404198](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-1/04_submit.png)



随后进入下载页面，点击“MDK532.EXE”即可下载。

![image-20210727193404198](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-1/05_MDK532.png)



### 1.8.2 安装Keil

下载完后，点击运行该文件，进入安装界面，选择“Next >>”。

![image-20210727193404198](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-1/06_setup1.png)



接着进入用户协议界面，勾选同意协议，点击“Next >>”。

![image-20210727193404198](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-1/07_setup2.png)



然后设置安装路径，如下图所示：

* 第一个“Core”是软件的安装路径，

* 第二个“Pack”是芯片的硬件支持包的安装路径，

保持默认路径或者设置为如下图所示一样的即可。

如果是自定义设置，建议为全英文路径，**不建议为包含有中文的路径**。

选择好之后点击“Next >>”。

![image-20210727193404198](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-1/08_setup3.png)



随后需要设置个人信息，随便填写即可，如下图所示。

![image-20210727193404198](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-1/09_setup4.png)



之后便进入安装进度界面，等待安装完成。

安装过程中，回弹出驱动安装界面，勾选“始终信任来自‘ARM Ltd’的软件”，然后点击“安装”，如下图。

![image-20210727193404198](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-1/10_setup5.png)



之后会自动进入“Pack Installer”界面，这里会检查安装的编译器、CMSIS等是否是最新的，由于我们安装的是官网提供的最新的MDK，所以这里一般情况下都是不需要更新的。

### 1.8.3 安装Pack

一个Keil的开发环境，除了Keil软件，还需要安装对应的Pack。

比如这里目标机的MCU是STM32F103ZET6，就需要下载该系列的的Pack，如果是STM32F4系列，就需要下其它系列Pack。

使用“Pack Installer”可以方便的对Pack安装和管理。

在左上角搜索框输入“STM32F103”，展开搜索结果，可以看到STM32F103ZE，点击右边的简介链接即可跳转到Pack下载页面。

![image-20210727193404198](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-1/11_setup6.png)

![image-20210727193404198](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-1/12_setup7.png)



下载完成得到“Keil.STM32F1xx_DFP.2.3.0.pack”。

直接双击该文件，随后弹出如下图所示界面，点击“Next”进行安装。

![image-20210727193404198](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-1/13_setup8.png)



至此，Keil和Pack就安装完成了。



## 1.9 使用模拟器运行第1个程序

先获取配套示例代码。

双击"FreeRTOS_01_create_task\FreeRTOS\Demo\CORTEX_STM32F103_Keil\RTOSDemo.uvprojx"打开第一个示例。

打开之后，首先要**编译工程**，才能使用模拟器运行，点击"Build"图标进行编译，如下图所示：

![image-20210727193404198](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-1/14_build_RTOSDemo.png)



编译完成后，点击"Debug"按钮进行仿真，如下图所示：

![image-20210727193404198](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-1/15_debug_RTOSDemo.png)



第一个程序里面创建了两个任务，两个任务一直打印各自的信息。

这里需要打开串口显示模拟窗口，显示任务的打印内容。

点击左上角菜单的“View”，然后选择“Serial Windows”，点击“UART #1”，如下图所示：

![image-20210727193404198](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-1/16_debug_Uart1.png)



最后，点击“Run”运行程序，右下角串口显示窗口将打印两个任务的信息。

![image-20210727193404198](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-1/17_debug_Run.png)



如果想退出模拟器仿真，再次"Debug"按钮退出，如下图所示：

![image-20210810071038121](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-1/22_exit_debug.png)



## 1.10 使用逻辑分析仪

本课程的程序有两种输出方式：

* 串口：查看打印信息
* 逻辑分析仪：观察全局变量的波形，根据波形解析任务调度情况

下面举例说明逻辑分析仪的用法。

双击"FreeRTOS_06_taskdelay\FreeRTOS\Demo\CORTEX_STM32F103_Keil\RTOSDemo.uvprojx"打开该示例。

打开之后，首先要**编译工程**，点击"Build"图标进行编译。

编译完成后，点击"Debug"按钮进行仿真。

本实例使用模拟器的逻辑分析仪观察现象。

首先在“main.c”的主函数加入断点，在代码行前的灰色处，点击一下就会有一个红色小点，就是设置的“断点”。

![image-20210727193404198](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-1/18_debug_Point.png)



然后点击“Run”运行，程序运行到断点位置，就会停下来等待下一步操作：

* 在代码中找到全局变量flag

* 鼠标选中flag，然后点击鼠标右键，在弹出的菜单里选择"Add ‘flag’ to…"，选择“Analyzer”，

  如下图所示：

![image-20210727193404198](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-1/19_debug_Analyzer.png)



此时在代码框上面，就会出现逻辑分析仪“Logic Analyzer”显示窗口，里面分析的就是变量flag。

点击这个flag，然后右键，选择“Bit”，以便观察，如下图所示：

![image-20210727193404198](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-1/20_debug_Bit.png)



再点击一下“Run”，继续运行，此时逻辑分析仪窗口显示变量flag的bit值变化，如下图所示：

![image-20210727193404198](http://photos.100ask.net/rtos-docs/freeRTOS/simulator/chapter-1/21_debug_Analyzer_Show.png)



在逻辑分析仪窗口，可以使用鼠标滚轮放大、缩小波形。



## 技术答疑交流

在学习中遇到任何问题，请前往我们的技术交流社区留言： [https://forums.100ask.net](https://forums.100ask.net)


---
<center>本章完</center>


