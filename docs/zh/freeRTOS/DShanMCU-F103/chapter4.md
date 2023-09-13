# 第4章 开发板使用

## 4.1 硬件连接

### 4.1.1 连接ST-Link

本课程使用ST-Link给开发板供电、烧录、调试。

DshanMCU-103上有4个插针，它们分别是GND、SWCLK、SWDIO、3.3V。ST-Link上有10个插针，它们的功能在外壳上有标注。接线方法如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image1.png) 

连接好的实物图像如下（ST-Link的USB口要插到电脑上）：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image2.png) 

### 4.1.2 连接USB串口

本课程后面部分会使用串口来打印信息，请按照下图连线：底板的TXD、RXD和USB串口RXD、TXD交叉连接，GND要互相连接。

注意：ST-Link也要保持连接，我们使用ST-Link进行供电、烧录、调试。

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image3.png) 

## 4.2 编译、下载、运行

### 4.2.1 编译工程

把开发板配套资料中如下程序复制到“目录名里没有空格、没有中文字符”的目录下并解压开：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image4.png)  

在工程的“MDK-ARM”目录下，双击如下文件，就会使用Keil打开工程：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image5.png)  

在Keil界面，点击一下红框中任意一个按钮即可编译程序：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image6.png)  

左边的按钮名为“Build”，点击这个按钮后，这些文件将会被编译：

- 所有没有被编译过的C文件
- 所被修改了但是尚未再次编译的C文件

如果你曾经编译过工程，但是只是修改了某些文件，使用“Buld”按钮时，只会编译这些被修改的文件，这会加快编译速度。

右边的按钮名为“Rebuild”，点击这个按钮后，所有的文件都会被再次编译。

### 4.2.2 配置调试器

先点击如下图所示按钮：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image7.png)  

然后如下图依次点击“Debug”，选择“ST-Link Debugger”，点击“Setting”（可能会一是升级固件，见本节后面部分）：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image8.png)  

如一切正常，ST-Link会自动识别出芯片，如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image9.png)  

然后入下图选择：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image10.png)  

注意：如果你的ST-Link是第1次使用，它的固件可能已经很老了。设置调试器时可能会提示升级固件。如下图所示：点击“Yes”表示升级：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image11.png)  

然后会弹出升级界面，点击“Device Connect”，表示连接设备；再点击“Yes”开始升级。如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image12.png)  

### 4.2.3 烧录运行

点击如下按钮，即可烧写、运行程序：

 ![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image13.png) 

如果一切正常，可以看到DshanMCU-103上的LED闪烁。

## 4.3 修改代码

“01_freertos_template”里已经支持了所有的模块，这些模块不能同时测试。要测试哪个模块，需要如下图修改代码：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image14.png)  

## 4.4 注意事项

有些模块的引脚是共用的，所以它们要么不能同时接，要么不能同时使用。打开底板原理图，里面有说明：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image15.png)  

为方便大家使用，列表如下：

| ***\*模块1\****  | ***\*模块2\****      | ***\*备注\****               |
| ---------------- | -------------------- | ---------------------------- |
| M2(DS18B20)      | M10(DHT11温湿度模块) | 不能同时接                   |
| M4(红外发射模块) | M9(蜂鸣器)           | 不能同时接                   |
| M6(超声波模块)   | M12(Flash模块)       | 可以同时接，但是不能同时访问 |

图示如下：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image16.png)  

 