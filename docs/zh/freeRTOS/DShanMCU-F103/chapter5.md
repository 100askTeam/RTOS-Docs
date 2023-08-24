# 第5章 模块使用说明与STM32CubeMX配置

## 5.1 硬件模块和驱动对应关系

对于每一个模块，我们都编写了驱动程序。这些驱动程序依赖于STM32CubeMX提供的初始化代码。比如driver_oled.c里面要使用I2C1通道，I2C1的初始化代码是STM32CubeMX生成的：MX_I2C1_Init被用来初始I2C1本身，HAL_I2C_MspInit被用来初始化I2C引脚。driver_oled.c只使用I2C1的函数收发数据，它不涉及I2C1的初始化。换句话说，你要在自己的工程里使用driver_oled.c，还需要初始化相应的I2C通道、引脚。

观看模块的头文件就可以知道接口函数的用法，每个驱动文件里都有一个测试函数，参考测试函数也可以知道怎么使用这个驱动。硬件模块和驱动文件对应关系如下表所示：

| 模块                              | 驱动                                             |
| --------------------------------- | ------------------------------------------------ |
| 板载单色LED                       | driver_led.cdriver_led.h                         |
| 按键(K1)                          | driver_key.cdriver_key.h                         |
| 蜂鸣器模块（有源）                | driver_active_buzzer.cdriver_active_buzzer.h     |
| 蜂鸣器模块（无源）                | driver_passive_buzzer.cdriver_passive_buzzer.h   |
| 温湿度模块（DHT11）               | driver_dht11.cdriver_dht11.h                     |
| 温度模块（DS18B20）               | driver_ds18b20.cdriver_ds18b20.h                 |
| 红外避障模块（LM393）             | driver_ir_obstacle.cdriver_ir_obstacle.h         |
| 超声波测距模块（HC-SR04）         | driver_ultrasonic_sr04.cdriver_ultrasonic_sr04.h |
| 旋转编码器模块（EC11）            | driver_rotary_encoder.cdriver_rotary_encoder.h   |
| 红外接收模块（1838）              | driver_ir_receiver.cdriver_ir_receiver.h         |
| 红外发射模块（38KHz）             | driver_ir_sender.cdriver_ir_sender.h             |
| RGB全彩LED模块                    | driver_color_led.cdriver_color_led.h             |
| 光敏电阻模块                      | driver_light_sensor.cdriver_light_sensor.h       |
| 舵机（SG90）                      |                                                  |
| IIC OLED屏幕（SSD1306）           | driver_oled.cdriver_oled.h                       |
| IIC 陀螺仪加速度计模块（MPU6050） | driver_mpu6050.cdriver_mpu6050.h                 |
| SPI FLASH模块（W25Q64）           | driver_spiflash_w25q64.cdriver_spiflash_w25q64.h |
| 直流电机（DRV8833）               | driver_motor.cdriver_motor.h                     |
| 步进电机（ULN2003）               |                                                  |

## 5.2 调试引脚与定时器

DshanMCU-103使用SWD调试接口，可以节省出TDI（PA15）、TDO（PB3）、TRST（PB4）三个引脚。其中PA15、PB3用于全彩LED，PB4用于直流电机。所以需要在STM32CubeMX里配置调试接口为SWD，否则全彩LED、直流电机无法使用。

DshanMCU-103中使用PA8来控制红外发射模块、无源蜂鸣器，PA8作为TIM1_CH1时用到TIMER1；全彩LED使用PA15、PB3、PA2作为绿色（G）、蓝色（B）、红色（R）的驱动线，这3个引脚被分别配置为TIM2_CHN1、TIM2_CHN2、TIM2_CHN3，用到TIMER2；直流电机的通道B使用PB4作为PWM引脚（TM3_CHN1），用到TIMER3。所以TIMER1、2、3都被使用了，只剩下TIMER4作为HAL时钟。

如下配置：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image1.png) 

## 5.3 LED驱动使用方法

本节介绍板载LED灯驱动的使用方法，最终实现控制LED灯的亮灭。

### 5.3.1 硬件接线

这里我们不需要进行额外接模块的操作，因为DShanMCU-F103板载了一颗LED灯，其位于正面，丝印名称是PC13，如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image2.png)  

### 5.3.2 STM32CubeMX配置

LED使用PC13引脚，配置如下：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image3.png)  

### 5.3.3 代码调用

这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_led.c” 和 “Drivers/DShanMCU-F103/driver_led.h” 中。其中，**Led_Test** 函数完成了 led 灯的初始化与测试工作。

**Led_Test** 函数在 “Core/Src/freertos.c” 文件中被 **StartDefaultTask** 函数调用。

打开 “Core/Src/freertos.c” 文件，将 **StartDefaultTask** 函数中的 **Led_Test** 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：

```c
void StartDefaultTask(void *argument)
{
  /* USER CODE BEGIN StartDefaultTask */
  /* Infinite loop */
  LCD_Init();
  LCD_Clear();
  
  for(;;)
  {
    Led_Test();
    //LCD_Test();
    //MPU6050_Test(); 
    //DS18B20_Test();
    //DHT11_Test();
    //ActiveBuzzer_Test();
    //PassiveBuzzer_Test();
    //ColorLED_Test();
    //IRReceiver_Test();
    //IRSender_Test();
    //LightSensor_Test();
    //Obstacle_Test();
    //SR04_Test();
    //W25Q64_Test();
    //RotaryEncoder_Test();
    //Motor_Test();
    //Key_Test();
    //UART_Test();
  }
  /* USER CODE END StartDefaultTask */
}
```

### 5.3.4 机实验

会看到板载的LED灯亮500毫秒之后灭500毫秒，不停的重复这个过程。

## 5.4 IIC OLED屏驱动使用方法

本节介绍OLED屏幕驱动的使用方法，最终实现通过OLED屏幕显示字符或字符串。

### 5.4.1 硬件接线

将OLED屏幕接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有 “OLED(SSD1036)”丝印的排母接口，如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image4.png)  

### 5.4.2 STM32CubeMX配置

OLED屏幕使用I2C1通道，I2C1使用PB6、PB7作为SCL、SDA引脚，配置如下：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image5.png)  

 

### 5.4.3 代码调用

这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_oled.c” 和 “Drivers/DShanMCU-F103/driver_oled.h” 中。其中，**OLED_Test** 函数完成了 OLED 屏幕的初始化与测试工作。

**OLED_Test** 函数在 “Core/Src/freertos.c” 文件中被 **StartDefaultTask** 函数调用。

打开 “Core/Src/freertos.c” 文件，将 **StartDefaultTask** 函数中的 **OLED_Test** 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：

```c
void StartDefaultTask(void *argument)
{
  /* USER CODE BEGIN StartDefaultTask */
  /* Infinite loop */
  LCD_Init();
  LCD_Clear();
  
  for(;;)
  {
    //Led_Test();
    LCD_Test();
    //MPU6050_Test(); 
    //DS18B20_Test();
    //DHT11_Test();
    //ActiveBuzzer_Test();
    //PassiveBuzzer_Test();
    //ColorLED_Test();
    //IRReceiver_Test();
    //IRSender_Test();
    //LightSensor_Test();
    //Obstacle_Test();
    //SR04_Test();
    //W25Q64_Test();
    //RotaryEncoder_Test();
    //Motor_Test();
    //Key_Test();
    //UART_Test();
  }
  /* USER CODE END StartDefaultTask */
}
```

### 5.4.4 上机实验

会看到OLED屏幕上显示 **OLED_Test** 函数中指定的字符或字符串。

## 5.5 按键驱动使用方法

本节介绍按键驱动的使用方法，最终实现通过按键控制LED灯。

### 5.5.1 硬件接线

这里我们不需要进行额外接模块的操作，因为DShanMCU-F103 Base Board底板板载了一个按键，如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image6.png)  

 

### 5.5.2 STM32CubeMX配置

LED使用PB14引脚，配置如下：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image7.png)  

### 5.5.3 代码调用

这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_key.c” 和 “Drivers/DShanMCU-F103/driver_key.h” 中。其中，**Key_Test** 函数完成了按键和 LED灯的初始化与测试工作。

**Key_Test** 函数在 “Core/Src/freertos.c” 文件中被 **StartDefaultTask** 函数调用。

打开 “Core/Src/freertos.c” 文件，将 **StartDefaultTask** 函数中的 **Key_Test** 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：

```c
void StartDefaultTask(void *argument)
{
  /* USER CODE BEGIN StartDefaultTask */
  /* Infinite loop */
  LCD_Init();
  LCD_Clear();
  
  for(;;)
  {
    //Led_Test();
    //LCD_Test();
    //MPU6050_Test(); 
    //DS18B20_Test();
    //DHT11_Test();
    //ActiveBuzzer_Test();
    //PassiveBuzzer_Test();
    //ColorLED_Test();
    //IRReceiver_Test();
    //IRSender_Test();
    //LightSensor_Test();
    //Obstacle_Test();
    //SR04_Test();
    //W25Q64_Test();
    //RotaryEncoder_Test();
    //Motor_Test();
    Key_Test();
    //UART_Test();
  }
  /* USER CODE END StartDefaultTask */
}
```

### 5.5.4 上机实验

按下或者松开按键，会看到OLED屏幕上按键的当前状态（按下或松开）；同时，可以通过按键控制LED灯的亮灭，按下按键LED灯亮起，松开按键LED灯熄灭。。

## 5.6 有源蜂鸣器模块驱动使用方法

本节介绍有源蜂鸣器模块驱动的使用方法，最终实现让有源蜂鸣器发出声音。

### 5.6.1 硬件接线

将有源蜂鸣器模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“蜂鸣器”丝印的排母接口，如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image8.png)  

### 5.6.2 STM32CubeMX配置

有源蜂鸣器使用PA8，把它配置为推挽输出引脚即可。但是无源蜂鸣器也使用PA8，需要把它配置为TIM1_CH1引脚。我们的程序可以既使用有源蜂鸣器，也使用无源蜂鸣器。所以需要使用代码来配置PA8。

在driver_active_buzzer.c文件的ActiveBuzzer_Init函数里，已经把PA8配置为推挽输出。

在driver_passive_buzzer.c文件的PassiveBuzzer_Init函数里，已经把PA8配置为TIM1_CH1。

无需在STM32CubeMX里配置PA8。

### 5.6.3 代码调用

这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_active_buzzer.c” 和 “Drivers/DShanMCU-F103/driver_active_buzzer.h” 中。其中，**ActiveBuzzer_Test** 函数完成了有源蜂鸣器模块的初始化与测试工作。

**ActiveBuzzer_Test** 函数在 “Core/Src/freertos.c” 文件中被 **StartDefaultTask**  函数调用。

打开 “Core/Src/freertos.c” 文件，将 **StartDefaultTask** 函数中的 **ActiveBuzzer_Test** 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：

```c
void StartDefaultTask(void *argument)
{
  /* USER CODE BEGIN StartDefaultTask */
  /* Infinite loop */
  LCD_Init();
  LCD_Clear();
  
  for(;;)
  {
    //Led_Test();
    //LCD_Test();
    //MPU6050_Test(); 
    //DS18B20_Test();
    //DHT11_Test();
    ActiveBuzzer_Test();
    //PassiveBuzzer_Test();
    //ColorLED_Test();
    //IRReceiver_Test();
    //IRSender_Test();
    //LightSensor_Test();
    //Obstacle_Test();
    //SR04_Test();
    //W25Q64_Test();
    //RotaryEncoder_Test();
    //Motor_Test();
    //Key_Test();
    //UART_Test();
  }
  /* USER CODE END StartDefaultTask */
}
```

### 5.6.4 上机实验

有源蜂鸣器保持响1秒之后保持不响1秒，不停的重复这个过程；同时会看到OLED屏幕上显示有源蜂鸣器的状态(ON/OFF)。

## 5.7 无源蜂鸣器模块驱动使用方法

本节介绍无源蜂鸣器模块驱动的使用方法，最终实现让无源蜂鸣器发出声音。

### 5.7.1 硬件接线

将无源蜂鸣器模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“蜂鸣器”丝印的排母接口，如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image9.png)  

### 5.7.2 STM32CubeMX配置

有源蜂鸣器使用PA8，把它配置为推挽输出引脚即可。但是无源蜂鸣器也使用PA8，需要把它配置为TIM1_CH1引脚。我们的程序可以既使用有源蜂鸣器，也使用无源蜂鸣器。所以需要使用代码来配置PA8。

在driver_active_buzzer.c文件的ActiveBuzzer_Init函数里，已经把PA8配置为推挽输出。

在driver_passive_buzzer.c文件的PassiveBuzzer_Init函数里，已经把PA8配置为TIM1_CH1。

无需在STM32CubeMX里配置PA8。

下图仅仅是一个示例，演示如何配置TIMER1、如何把PA8配置为TIM1_CH1：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image10.png)  

### 5.7.3 代码调用

这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_passive_buzzer.c” 和 “Drivers/DShanMCU-F103/driver_passive_buzzer.h” 中。其中，**PassiveBuzzer_Test** 函数完成了无源蜂鸣器模块的初始化与测试工作。

**PassiveBuzzer_Test** 函数在 “Core/Src/freertos.c” 文件中被 **StartDefaultTask** 函数调用。

打开 “Core/Src/freertos.c” 文件，将 **StartDefaultTask** 函数中的 **PassiveBuzzer_Test** 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：

```c
void StartDefaultTask(void *argument)
{
  /* USER CODE BEGIN StartDefaultTask */
  /* Infinite loop */
  LCD_Init();
  LCD_Clear();
  
  for(;;)
  {
    //Led_Test();
    //LCD_Test();
    //MPU6050_Test(); 
    //DS18B20_Test();
    //DHT11_Test();
    //ActiveBuzzer_Test();
    PassiveBuzzer_Test();
    //ColorLED_Test();
    //IRReceiver_Test();
    //IRSender_Test();
    //LightSensor_Test();
    //Obstacle_Test();
    //SR04_Test();
    //W25Q64_Test();
    //RotaryEncoder_Test();
    //Motor_Test();
    //Key_Test();
    //UART_Test();
  }
  /* USER CODE END StartDefaultTask */
}
```

### 5.7.4 上机实验

有源蜂鸣器保持响1秒之后保持不响1秒，不停的重复这个过程；同时会看到OLED屏幕上显示有源蜂鸣器的状态(ON/OFF)。

## 5.8 DHT11温湿度模块驱动使用方法

本节介绍DHT11温湿度模块驱动的使用方法，最终实现通过DHT11温湿度模块采集温湿度信息。

### 5.8.1 硬件接线

将DHT11温湿度模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“DHT11温湿度模块” 丝印的排母接口，如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image11.png)  

### 5.8.2 STM32CubeMX配置

DHT11使用PA1，初始状态为“open drain，pull-up”，如下图：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image12.png)  

### 5.8.3 代码调用

这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_dht11.c” 和 “Drivers/DShanMCU-F103/driver_dht11.h” 中。其中，**DHT11_Test** 函数完成了DHT11温湿度模块的初始化与测试工作。

**DHT11_Test** 函数在 “Core/Src/freertos.c” 文件中被 **StartDefaultTask** 函数调用。

打开 “Core/Src/freertos.c” 文件，将 **StartDefaultTask** 函数中的 **DHT11_Test** 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：

```c
void StartDefaultTask(void *argument)
{
  /* USER CODE BEGIN StartDefaultTask */
  /* Infinite loop */
  LCD_Init();
  LCD_Clear();
  
  for(;;)
  {
    //Led_Test();
    //LCD_Test();
    //MPU6050_Test(); 
    //DS18B20_Test();
    DHT11_Test();
    //ActiveBuzzer_Test();
    //PassiveBuzzer_Test();
    //ColorLED_Test();
    //IRReceiver_Test();
    //IRSender_Test();
    //LightSensor_Test();
    //Obstacle_Test();
    //SR04_Test();
    //W25Q64_Test();
    //RotaryEncoder_Test();
    //Motor_Test();
    //Key_Test();
    //UART_Test();
  }
  /* USER CODE END StartDefaultTask */
}
```

会看到OLED屏幕上显示DHT11温湿度模块实时采集的温度与湿度信息。

## 5.9 DS18B20温度模块驱动使用方法

本节介绍DS18B20温度模块驱动的使用方法，最终实现通过DS18B20温度模块采集温度信息。

### 5.9.1 硬件接线

将有DS18B20温度模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“DS18B20” 丝印的排母接口，如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image13.png)  

### 5.9.2 STM32CubeMX配置

DS18B20使用PA1，初始状态为“open drain，pull-up”，如下图：

 ![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image14.png)

### 5.9.3 代码调用

这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_ds18b20.c” 和 “Drivers/DShanMCU-F103/driver_ds18b20.h” 中。其中，**DS18B20_Test** 函数完成了DS18B20温度模块的初始化与测试工作。

**DS18B20_Test** 函数在 “Core/Src/freertos.c” 文件中被 **StartDefaultTask** 函数调用。

打开 “Core/Src/freertos.c” 文件，将 **StartDefaultTask** 函数中的 **DS18B20_Test** 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：

```c
void StartDefaultTask(void *argument)
{
  /* USER CODE BEGIN StartDefaultTask */
  /* Infinite loop */
  LCD_Init();
  LCD_Clear();
  
  for(;;)
  {
    //Led_Test();
    //LCD_Test();
    //MPU6050_Test(); 
    DS18B20_Test();
    //DHT11_Test();
    //ActiveBuzzer_Test();
    //PassiveBuzzer_Test();
    //ColorLED_Test();
    //IRReceiver_Test();
    //IRSender_Test();
    //LightSensor_Test();
    //Obstacle_Test();
    //SR04_Test();
    //W25Q64_Test();
    //RotaryEncoder_Test();
    //Motor_Test();
    //Key_Test();
    //UART_Test();
  }
  /* USER CODE END StartDefaultTask */
}
```

### 5.9.4 上机实验

会看到OLED屏幕上显示DS18B20温度模块实时采集的温度信息。

## 5.10 红外避障模块驱动使用方法

本节介绍红外避障模块驱动的使用方法，最终实现碰撞检测功能。

### 5.10.1 硬件接线

将红外避障模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“红外对管避障模块” 丝印的排母接口，如下图所示：

 ![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image15.png) 

### 5.10.2 STM32CubeMX配置

红外避障模块使用PB13，把它配置为输入引脚即可，如下图：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image16.png) 

### 5.10.3 代码调用

这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_ir_obstacle.c” 和 “Drivers/DShanMCU-F103/driver_ir_obstacle.h” 中。其中，**IRObstacle_Test** 函数完成了红外避障模块的初始化与测试工作。

**IRObstacle_Test** 函数在 “Core/Src/freertos.c” 文件中被**StartDefaultTask** 函数调用。

打开 “Core/Src/freertos.c” 文件，将 **StartDefaultTask** 函数中的 **IRObstacle_Test** 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：

```c
void StartDefaultTask(void *argument)
{
  /* USER CODE BEGIN StartDefaultTask */
  /* Infinite loop */
  LCD_Init();
  LCD_Clear();
  
  for(;;)
  {
    //Led_Test();
    //LCD_Test();
    //MPU6050_Test(); 
    //DS18B20_Test();
    //DHT11_Test();
    //ActiveBuzzer_Test();
    //PassiveBuzzer_Test();
    //ColorLED_Test();
    //IRReceiver_Test();
    //IRSender_Test();
    //LightSensor_Test();
    Obstacle_Test();
    //SR04_Test();
    //W25Q64_Test();
    //RotaryEncoder_Test();
    //Motor_Test();
    //Key_Test();
    //UART_Test();
  }
  /* USER CODE END StartDefaultTask */
}
```

会看到OLED屏幕上显示红外避障模块实时检测的状态信息(是否碰撞到障碍物)。

## 5.11 超声波测距模块驱动使用方法

本节介绍超声波测距模块驱动的使用方法，最终实现测距功能。

### 5.11.1 硬件接线

将超声波测距模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“超声波模块” 丝印的排母接口，如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image17.png) 

### 5.11.2 STM32CubeMX配置

超声测距模块SR04使用PB9最为Trig引脚，使用PB8作为Echo引脚。把PB9设置为输出、把PB8设置为输入即可。如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image18.png) 

### 5.11.3 代码调用

这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_ultrasonic_sr04.c” 和 “Drivers/DShanMCU-F103/driver_ultrasonic_sr04.h” 中。其中，**SR04_Test** 函数完成了超声波测距模块的初始化与测试工作。

**SR04_Test** 函数在 “Core/Src/freertos.c” 文件中被 **StartDefaultTask** 函数调用。

打开 “Core/Src/freertos.c” 文件，将 **StartDefaultTask** 函数中的 **SR04_Test** 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：

```c
void StartDefaultTask(void *argument)
{
  /* USER CODE BEGIN StartDefaultTask */
  /* Infinite loop */
  LCD_Init();
  LCD_Clear();
  
  for(;;)
  {
    //Led_Test();
    //LCD_Test();
    //MPU6050_Test(); 
    //DS18B20_Test();
    //DHT11_Test();
    //ActiveBuzzer_Test();
    //PassiveBuzzer_Test();
    //ColorLED_Test();
    //IRReceiver_Test();
    //IRSender_Test();
    //LightSensor_Test();
    //Obstacle_Test();
    SR04_Test();
    //W25Q64_Test();
    //RotaryEncoder_Test();
    //Motor_Test();
    //Key_Test();
    //UART_Test();
  }
  /* USER CODE END StartDefaultTask */
}
```

### 5.11.4 上机实验

会看到OLED屏幕上显示超声波测距模块实时检测的距离信息(单位cm)。

## 5.12 旋转编码器模块驱动使用方法

本节介绍旋转编码器模块驱动的使用方法，最终实现旋转编码器的操作功能(正反转、按下)。

### 5.12.1 硬件接线

将旋转编码器模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“旋转编码器” 丝印的排母接口，如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image19.png) 

### 5.12.2 STM32CubeMX配置

旋转编码器使用PB12作为S1引脚（作为中断引脚，上升沿触发），使用PB0作为S2引脚（作为输入引脚），使用PB1作为Key引脚（作为输入引脚）。配置如下：

PB0、PB1：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image20.png) 

PB12:

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image21.png) 

### 5.12.3 代码调用

这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_rotary_encoder.c” 和 “Drivers/DShanMCU-F103/driver_rotary_encoder.h” 中。其中，**RotaryEncoder_Test** 函数完成了旋转编码器模块的初始化与测试工作。

**RotaryEncoder_Test** 函数在 “Core/Src/freertos.c” 文件中被 **StartDefaultTask** 函数调用。

打开 “Core/Src/freertos.c” 文件，将 **StartDefaultTask** 函数中的 **RotaryEncoder_Test** 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：

```c
void StartDefaultTask(void *argument)
{
  /* USER CODE BEGIN StartDefaultTask */
  /* Infinite loop */
  LCD_Init();
  LCD_Clear();
  
  for(;;)
  {
    //Led_Test();
    //LCD_Test();
    //MPU6050_Test(); 
    //DS18B20_Test();
    //DHT11_Test();
    //ActiveBuzzer_Test();
    //PassiveBuzzer_Test();
    //ColorLED_Test();
    //IRReceiver_Test();
    //IRSender_Test();
    //LightSensor_Test();
    //Obstacle_Test();
    //SR04_Test();
    //W25Q64_Test();
    RotaryEncoder_Test();
    //Motor_Test();
    //Key_Test();
    //UART_Test();
  }
  /* USER CODE END StartDefaultTask */
}
```

### 5.12.4 上机实验

会看到OLED屏幕上显示旋转编码器模块的状态信息(正反转及计数、按下)。

## 5.13 红外接收模块驱动使用方法

本节介绍红外接收模块驱动的使用方法，最终实现红外接收模块的接收功能。

### 5.13.1 硬件接线

将红外接收模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“红外接收管(IR Receiver)” 丝印的排母接口，如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image22.png) 

### 5.13.2 STM32CubeMX配置

红外接收模块使用PB10作为中断引脚，双边沿触发。要使能内部上拉，因为没有外部上拉电阻。配置如下：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image23.png) 

### 5.13.3 代码调用

这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_ir_receiver.c” 和 “Drivers/DShanMCU-F103/driver_ir_receiver.h” 中。其中，**IRReceiver_Test** 函数完成了红外接收模块的初始化与测试工作。

**IRReceiver_Test** 函数在 “Core/Src/freertos.c” 文件中被 **StartDefaultTask** 函数调用。

打开 “Core/Src/freertos.c” 文件，将 **StartDefaultTask** 函数中的 **IRReceiver_Test** 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：

```c
void StartDefaultTask(void *argument)
{
  /* USER CODE BEGIN StartDefaultTask */
  /* Infinite loop */
  LCD_Init();
  LCD_Clear();
  
  for(;;)
  {
    //Led_Test();
    //LCD_Test();
    //MPU6050_Test(); 
    //DS18B20_Test();
    //DHT11_Test();
    //ActiveBuzzer_Test();
    //PassiveBuzzer_Test();
    //ColorLED_Test();
    IRReceiver_Test();
    //IRSender_Test();
    //LightSensor_Test();
    //Obstacle_Test();
    //SR04_Test();
    //W25Q64_Test();
    //RotaryEncoder_Test();
    //Motor_Test();
    //Key_Test();
    //UART_Test();
  }
  /* USER CODE END StartDefaultTask */
}
```

### 5.13.4 上机实验

会看到OLED屏幕上显示红外接收模块接收到的信息(发送方的哪个按键被按下)。

## 5.14 红外发射模块驱动使用方法

本节介绍红外发射模块驱动的使用方法，最终实现红外发射模块的发射功能。

### 5.14.1 硬件接线

将红外发射模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“红外发射管(IR Transmitter)” 丝印的排母接口，如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image24.png) 

### 5.14.2 STM32CubeMX配置

红外发射模块、有源蜂鸣器、无源蜂鸣器共用PA8。

有源蜂鸣器驱动driver_active_buzzer.c文件的ActiveBuzzer_Init函数里，已经把PA8配置为推挽输出。

无源蜂鸣器驱动driver_passive_buzzer.c文件的PassiveBuzzer_Init函数里，已经把PA8配置为TIM1_CH1。

红外发射模块驱动driver_ir_sender.c文件的IRSender_Init函数里，已经把PA8配置为TIM1_CH1。

无需使用STM32CubeMX来配置PA8。

### 5.14.3 代码调用

这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_ir_sender.c” 和 “Drivers/DShanMCU-F103/driver_ir_sender.h” 中。其中，**IRSender_Test** 函数完成了红外发射模块的初始化与测试工作。

**IRSender_Test** 函数在 “Core/Src/freertos.c” 文件中被**StartDefaultTask** 函数调用。

打开 “Core/Src/freertos.c” 文件，将 **StartDefaultTask** 函数中的 **IRSender_Test** 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：

```c
void StartDefaultTask(void *argument)
{
  /* USER CODE BEGIN StartDefaultTask */
  /* Infinite loop */
  LCD_Init();
  LCD_Clear();
  
  for(;;)
  {
    //Led_Test();
    //LCD_Test();
    //MPU6050_Test(); 
    //DS18B20_Test();
    //DHT11_Test();
    //ActiveBuzzer_Test();
    //PassiveBuzzer_Test();
    //ColorLED_Test();
    //IRReceiver_Test();
    IRSender_Test();
    //LightSensor_Test();
    //Obstacle_Test();
    //SR04_Test();
    //W25Q64_Test();
    //RotaryEncoder_Test();
    //Motor_Test();
    //Key_Test();
    //UART_Test();
  }
  /* USER CODE END StartDefaultTask */
}
```

### 5.14.4 上机实验

会看到OLED屏幕上显示红外发射模块发送的信息(哪个按键信息被发射出去)。

## 5.15 RGB全彩LED模块驱动使用方法

本节介绍RGB全彩LED模块驱动的使用方法，最终实现让RGB全彩LED模块显示不同的颜色。

### 5.15.1 硬件接线

将RGB全彩LED模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“全彩LED”丝印的排母接口，如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image25.png) 

### 5.15.2 STM32CubeMX配置

全彩LED使用PA15、PB3、PA2作为绿色（G）、蓝色（B）、红色（R）的驱动线，这3个引脚被分别配置为TIM2_CHN1、TIM2_CHN2、TIM2_CHN3。TIMER2的配置如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image26.png) 

### 5.15.3 代码调用

这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_color_led.c” 和 “Drivers/DShanMCU-F103/driver_color_led.h” 中。其中，**ColorLED_Test** 函数完成了RGB全彩LED模块的初始化与测试工作。

**ColorLED_Test** 函数在 “Core/Src/freertos.c” 文件中被 **StartDefaultTask** 函数调用。

打开 “Core/Src/freertos.c” 文件，将 **StartDefaultTask** 函数中的 ***ColorLED_Test** 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：

```c
void StartDefaultTask(void *argument)
{
  /* USER CODE BEGIN StartDefaultTask */
  /* Infinite loop */
  LCD_Init();
  LCD_Clear();
  
  for(;;)
  {
    //Led_Test();
    //LCD_Test();
    //MPU6050_Test(); 
    //DS18B20_Test();
    //DHT11_Test();
    //ActiveBuzzer_Test();
    //PassiveBuzzer_Test();
    ColorLED_Test();
    //IRReceiver_Test();
    //IRSender_Test();
    //LightSensor_Test();
    //Obstacle_Test();
    //SR04_Test();
    //W25Q64_Test();
    //RotaryEncoder_Test();
    //Motor_Test();
    //Key_Test();
    //UART_Test();
  }
  /* USER CODE END StartDefaultTask */
}
```

### 5.15.4 上机实验

会看到RGB全彩LED模块每隔1秒切换为不同的颜色；同时会看到OLED屏幕上显示当前颜色的hex值。

## 5.16 光敏电阻模块驱动使用方法

本节介绍光敏电阻模块驱动的使用方法，最终实现通过光敏电阻模块采集亮度信息。

### 5.16.1 硬件接线

将有光敏电阻模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“光敏电阻模块” 丝印的排母接口，如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image27.png) 

### 5.16.2 STM32CubeMX配置

光敏电阻模块使用PA3作为ADC引脚，配置如下：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image28.png) 

### 5.16.3 代码调用

这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_light_sensor.c” 和 “Drivers/DShanMCU-F103/driver_light_sensor.h” 中。其中，**LightSensor_Test** 函数完成了光敏电阻模块的初始化与测试工作。

**LightSensor_Test** 函数在 “Core/Src/freertos.c” 文件中被**StartDefaultTask** 函数调用。

打开 “Core/Src/freertos.c” 文件，将 **StartDefaultTask** 函数中的 **LightSensor_Test** 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：

```c
void StartDefaultTask(void *argument)
{
  /* USER CODE BEGIN StartDefaultTask */
  /* Infinite loop */
  LCD_Init();
  LCD_Clear();
  
  for(;;)
  {
    //Led_Test();
    //LCD_Test();
    //MPU6050_Test(); 
    //DS18B20_Test();
    //DHT11_Test();
    //ActiveBuzzer_Test();
    //PassiveBuzzer_Test();
    //ColorLED_Test();
    //IRReceiver_Test();
    //IRSender_Test();
    LightSensor_Test();
    //Obstacle_Test();
    //SR04_Test();
    //W25Q64_Test();
    //RotaryEncoder_Test();
    //Motor_Test();
    //Key_Test();
    //UART_Test();
  }
  /* USER CODE END StartDefaultTask */
}
```

### 5.16.4 上机实验

会看到OLED屏幕上显示光敏电阻模块实时采集的亮度信息。

## 5.17 SG90舵机驱动使用方法

## 5.18 IIC 陀螺仪加速度计模块驱动使用方法

本节介绍IIC 陀螺仪加速度计模块驱动的使用方法，最终实现通过IIC 陀螺仪加速度计模块采集X/Y/Z轴的加速度与角速度信息。

### 5.18.1 硬件接线

将有IIC 陀螺仪加速度计模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“陀螺仪加速度计” 丝印的排母接口，如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image29.png) 

### 5.18.2 STM32CubeMX配置

陀螺仪使用I2C1通道，I2C1使用PB6、PB7作为SCL、SDA引脚，配置如下：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image30.png) 

### 5.18.3 代码调用

这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_mpu6050.c” 和 “Drivers/DShanMCU-F103/driver_mpu6050.h” 中。其中，**MPU6050_Test** 函数完成了IIC 陀螺仪加速度计模块的初始化与测试工作。

**MPU6050_Test** 函数在 “Core/Src/freertos.c” 文件中被**StartDefaultTask** 函数调用。

打开 “Core/Src/freertos.c” 文件，将 **StartDefaultTask** 函数中的 **MPU6050_Test** 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：

```c
void StartDefaultTask(void *argument)
{
  /* USER CODE BEGIN StartDefaultTask */
  /* Infinite loop */
  LCD_Init();
  LCD_Clear();
  
  for(;;)
  {
    //Led_Test();
    //LCD_Test();
    MPU6050_Test(); 
    //DS18B20_Test();
    //DHT11_Test();
    //ActiveBuzzer_Test();
    //PassiveBuzzer_Test();
    //ColorLED_Test();
    //IRReceiver_Test();
    //IRSender_Test();
    //LightSensor_Test();
    //Obstacle_Test();
    //SR04_Test();
    //W25Q64_Test();
    //RotaryEncoder_Test();
    //Motor_Test();
    //Key_Test();
    //UART_Test();
  }
  /* USER CODE END StartDefaultTask */
}
```

### 5.18.4 上机实验

会看到OLED屏幕上显示IIC 陀螺仪加速度计模块实时采集的X/Y/Z轴的加速度与角速度信息。

## 5.19 SPI FLASH模块驱动使用方法

本节介绍SPI FLASH模块驱动的使用方法，最终实现通过SPI FLASH模块采集亮度信息。

### 5.19.1 硬件接线

将有SPI FLASH模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“FLASH模块” 丝印的排母接口，如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image31.png)  

### 5.19.2 STM32CubeMX配置

SPI Flash模块使用SPI1通道，PA7作为SPI1_MOSI、PA5作为SPI1_SCK、PA6作为SPI1_MISO。另外使用PB9作为片选引脚。

SPI1配置如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image32.png)  

PB9配置如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image33.png)  

### 5.19.3 代码调用

这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_spiflash_w25q64.c” 和 “Drivers/DShanMCU-F103/driver_spiflash_w25q64.h” 中。其中，**W25Q64_Test** 函数完成了SPI FLASH模块的初始化与测试工作。

**W25Q64_Test** 函数在 “Core/Src/freertos.c” 文件中被**StartDefaultTask** 函数调用。

打开 “Core/Src/freertos.c” 文件，将 **StartDefaultTask** 函数中的 **W25Q64_Test** 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：

```c
void StartDefaultTask(void *argument)
{
  /* USER CODE BEGIN StartDefaultTask */
  /* Infinite loop */
  LCD_Init();
  LCD_Clear();
  
  for(;;)
  {
    //Led_Test();
    //LCD_Test();
    //MPU6050_Test(); 
    //DS18B20_Test();
    //DHT11_Test();
    //ActiveBuzzer_Test();
    //PassiveBuzzer_Test();
    //ColorLED_Test();
    //IRReceiver_Test();
    //IRSender_Test();
    //LightSensor_Test();
    //Obstacle_Test();
    //SR04_Test();
    W25Q64_Test();
    //RotaryEncoder_Test();
    //Motor_Test();
    //Key_Test();
    //UART_Test();
  }
  /* USER CODE END StartDefaultTask */
}
```

### 5.19.4 上机实验

会看到OLED屏幕上显示SPI FLASH模块的工作状态信息。

## 5.20 直流电机驱动使用方法

本节介绍直流电机驱动的使用方法，最终实现通过直流电机驱动模块驱动直流电机。

### 5.20.1 硬件接线

将有直流电机驱动模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“直流电机驱动模块板” 丝印的排母接口，如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image34.png)  

### 5.20.2 STM32CubeMX配置

直流电机驱动模块的通道A使用PA4、PA0来控制，这2个引脚没有PWM功能，所以只需要配置为输出即可。

通道B使用PB4、PB15来控制，PB4可以配置为PWM引脚（TM3_CHN1），PB15仍然配置为输出引脚。

这3个输出引脚配置如下：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image35.png)  

PB4配置为PWM引脚（TM3_CHN1），如下图所示：

![](http://photos.100ask.net/rtos-docs/freeRTOS/DShanMCU-F103/chapter-4\image36.png)  

### 5.20.3 代码调用

这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_motor.c” 和 “Drivers/DShanMCU-F103/driver_motor.h” 中。其中，**Motor_Test** 函数完成了直流电机驱动模块的初始化与测试工作。

**Motor_Test** 函数在 “Core/Src/freertos.c” 文件中被**StartDefaultTask** 函数调用。

打开 “Core/Src/freertos.c” 文件，将**StartDefaultTask** 函数中的 **Moto_Test** 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：

```c
void StartDefaultTask(void *argument)
{
  /* USER CODE BEGIN StartDefaultTask */
  /* Infinite loop */
  LCD_Init();
  LCD_Clear();
  
  for(;;)
  {
    //Led_Test();
    //LCD_Test();
    //MPU6050_Test(); 
    //DS18B20_Test();
    //DHT11_Test();
    //ActiveBuzzer_Test();
    //PassiveBuzzer_Test();
    //ColorLED_Test();
    //IRReceiver_Test();
    //IRSender_Test();
    //LightSensor_Test();
    //Obstacle_Test();
    //SR04_Test();
    //W25Q64_Test();
    //RotaryEncoder_Test();
    Motor_Test();
    //Key_Test();
    //UART_Test();
  }
  /* USER CODE END StartDefaultTask */
}
```

### 5.20.4 上机实验

会看到OLED屏幕上显示直流电机的工作状态信息。

## 5.21 步进电机驱动使用方法