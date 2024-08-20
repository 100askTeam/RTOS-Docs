import{_ as n,o as s,c as a,e}from"./app-a3aa5aa8.js";const t={},i=e(`<h1 id="第5章-模块使用说明与stm32cubemx配置" tabindex="-1"><a class="header-anchor" href="#第5章-模块使用说明与stm32cubemx配置" aria-hidden="true">#</a> 第5章 模块使用说明与STM32CubeMX配置</h1><h2 id="_5-1-硬件模块和驱动对应关系" tabindex="-1"><a class="header-anchor" href="#_5-1-硬件模块和驱动对应关系" aria-hidden="true">#</a> 5.1 硬件模块和驱动对应关系</h2><p>对于每一个模块，我们都编写了驱动程序。这些驱动程序依赖于STM32CubeMX提供的初始化代码。比如driver_oled.c里面要使用I2C1通道，I2C1的初始化代码是STM32CubeMX生成的：MX_I2C1_Init被用来初始I2C1本身，HAL_I2C_MspInit被用来初始化I2C引脚。driver_oled.c只使用I2C1的函数收发数据，它不涉及I2C1的初始化。换句话说，你要在自己的工程里使用driver_oled.c，还需要初始化相应的I2C通道、引脚。</p><p>观看模块的头文件就可以知道接口函数的用法，每个驱动文件里都有一个测试函数，参考测试函数也可以知道怎么使用这个驱动。硬件模块和驱动文件对应关系如下表所示：</p><table><thead><tr><th>模块</th><th>驱动</th></tr></thead><tbody><tr><td>板载单色LED</td><td>driver_led.cdriver_led.h</td></tr><tr><td>按键(K1)</td><td>driver_key.cdriver_key.h</td></tr><tr><td>蜂鸣器模块（有源）</td><td>driver_active_buzzer.cdriver_active_buzzer.h</td></tr><tr><td>蜂鸣器模块（无源）</td><td>driver_passive_buzzer.cdriver_passive_buzzer.h</td></tr><tr><td>温湿度模块（DHT11）</td><td>driver_dht11.cdriver_dht11.h</td></tr><tr><td>温度模块（DS18B20）</td><td>driver_ds18b20.cdriver_ds18b20.h</td></tr><tr><td>红外避障模块（LM393）</td><td>driver_ir_obstacle.cdriver_ir_obstacle.h</td></tr><tr><td>超声波测距模块（HC-SR04）</td><td>driver_ultrasonic_sr04.cdriver_ultrasonic_sr04.h</td></tr><tr><td>旋转编码器模块（EC11）</td><td>driver_rotary_encoder.cdriver_rotary_encoder.h</td></tr><tr><td>红外接收模块（1838）</td><td>driver_ir_receiver.cdriver_ir_receiver.h</td></tr><tr><td>红外发射模块（38KHz）</td><td>driver_ir_sender.cdriver_ir_sender.h</td></tr><tr><td>RGB全彩LED模块</td><td>driver_color_led.cdriver_color_led.h</td></tr><tr><td>光敏电阻模块</td><td>driver_light_sensor.cdriver_light_sensor.h</td></tr><tr><td>舵机（SG90）</td><td></td></tr><tr><td>IIC OLED屏幕（SSD1306）</td><td>driver_oled.cdriver_oled.h</td></tr><tr><td>IIC 陀螺仪加速度计模块（MPU6050）</td><td>driver_mpu6050.cdriver_mpu6050.h</td></tr><tr><td>SPI FLASH模块（W25Q64）</td><td>driver_spiflash_w25q64.cdriver_spiflash_w25q64.h</td></tr><tr><td>直流电机（DRV8833）</td><td>driver_motor.cdriver_motor.h</td></tr><tr><td>步进电机（ULN2003）</td><td></td></tr></tbody></table><h2 id="_5-2-调试引脚与定时器" tabindex="-1"><a class="header-anchor" href="#_5-2-调试引脚与定时器" aria-hidden="true">#</a> 5.2 调试引脚与定时器</h2><p>DshanMCU-103使用SWD调试接口，可以节省出TDI（PA15）、TDO（PB3）、TRST（PB4）三个引脚。其中PA15、PB3用于全彩LED，PB4用于直流电机。所以需要在STM32CubeMX里配置调试接口为SWD，否则全彩LED、直流电机无法使用。</p><p>DshanMCU-103中使用PA8来控制红外发射模块、无源蜂鸣器，PA8作为TIM1_CH1时用到TIMER1；全彩LED使用PA15、PB3、PA2作为绿色（G）、蓝色（B）、红色（R）的驱动线，这3个引脚被分别配置为TIM2_CHN1、TIM2_CHN2、TIM2_CHN3，用到TIMER2；直流电机的通道B使用PB4作为PWM引脚（TM3_CHN1），用到TIMER3。所以TIMER1、2、3都被使用了，只剩下TIMER4作为HAL时钟。</p><p>如下配置：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image1.png" alt=""></p><h2 id="_5-3-led驱动使用方法" tabindex="-1"><a class="header-anchor" href="#_5-3-led驱动使用方法" aria-hidden="true">#</a> 5.3 LED驱动使用方法</h2><p>本节介绍板载LED灯驱动的使用方法，最终实现控制LED灯的亮灭。</p><h3 id="_5-3-1-硬件接线" tabindex="-1"><a class="header-anchor" href="#_5-3-1-硬件接线" aria-hidden="true">#</a> 5.3.1 硬件接线</h3><p>这里我们不需要进行额外接模块的操作，因为DShanMCU-F103板载了一颗LED灯，其位于正面，丝印名称是PC13，如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image2.png" alt=""></p><h3 id="_5-3-2-stm32cubemx配置" tabindex="-1"><a class="header-anchor" href="#_5-3-2-stm32cubemx配置" aria-hidden="true">#</a> 5.3.2 STM32CubeMX配置</h3><p>LED使用PC13引脚，配置如下：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image3.png" alt=""></p><h3 id="_5-3-3-代码调用" tabindex="-1"><a class="header-anchor" href="#_5-3-3-代码调用" aria-hidden="true">#</a> 5.3.3 代码调用</h3><p>这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_led.c” 和 “Drivers/DShanMCU-F103/driver_led.h” 中。其中，<strong>Led_Test</strong> 函数完成了 led 灯的初始化与测试工作。</p><p><strong>Led_Test</strong> 函数在 “Core/Src/freertos.c” 文件中被 <strong>StartDefaultTask</strong> 函数调用。</p><p>打开 “Core/Src/freertos.c” 文件，将 <strong>StartDefaultTask</strong> 函数中的 <strong>Led_Test</strong> 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">StartDefaultTask</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>argument<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
  <span class="token comment">/* USER CODE BEGIN StartDefaultTask */</span>
  <span class="token comment">/* Infinite loop */</span>
  <span class="token function">LCD_Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token function">LCD_Clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  
  <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span>
  <span class="token punctuation">{</span>
    <span class="token function">Led_Test</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">//LCD_Test();</span>
    <span class="token comment">//MPU6050_Test(); </span>
    <span class="token comment">//DS18B20_Test();</span>
    <span class="token comment">//DHT11_Test();</span>
    <span class="token comment">//ActiveBuzzer_Test();</span>
    <span class="token comment">//PassiveBuzzer_Test();</span>
    <span class="token comment">//ColorLED_Test();</span>
    <span class="token comment">//IRReceiver_Test();</span>
    <span class="token comment">//IRSender_Test();</span>
    <span class="token comment">//LightSensor_Test();</span>
    <span class="token comment">//Obstacle_Test();</span>
    <span class="token comment">//SR04_Test();</span>
    <span class="token comment">//W25Q64_Test();</span>
    <span class="token comment">//RotaryEncoder_Test();</span>
    <span class="token comment">//Motor_Test();</span>
    <span class="token comment">//Key_Test();</span>
    <span class="token comment">//UART_Test();</span>
  <span class="token punctuation">}</span>
  <span class="token comment">/* USER CODE END StartDefaultTask */</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-3-4-机实验" tabindex="-1"><a class="header-anchor" href="#_5-3-4-机实验" aria-hidden="true">#</a> 5.3.4 机实验</h3><p>会看到板载的LED灯亮500毫秒之后灭500毫秒，不停的重复这个过程。</p><h2 id="_5-4-iic-oled屏驱动使用方法" tabindex="-1"><a class="header-anchor" href="#_5-4-iic-oled屏驱动使用方法" aria-hidden="true">#</a> 5.4 IIC OLED屏驱动使用方法</h2><p>本节介绍OLED屏幕驱动的使用方法，最终实现通过OLED屏幕显示字符或字符串。</p><h3 id="_5-4-1-硬件接线" tabindex="-1"><a class="header-anchor" href="#_5-4-1-硬件接线" aria-hidden="true">#</a> 5.4.1 硬件接线</h3><p>将OLED屏幕接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有 “OLED(SSD1036)”丝印的排母接口，如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image4.png" alt=""></p><h3 id="_5-4-2-stm32cubemx配置" tabindex="-1"><a class="header-anchor" href="#_5-4-2-stm32cubemx配置" aria-hidden="true">#</a> 5.4.2 STM32CubeMX配置</h3><p>OLED屏幕使用I2C1通道，I2C1使用PB6、PB7作为SCL、SDA引脚，配置如下：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image5.png" alt=""></p><h3 id="_5-4-3-代码调用" tabindex="-1"><a class="header-anchor" href="#_5-4-3-代码调用" aria-hidden="true">#</a> 5.4.3 代码调用</h3><p>这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_oled.c” 和 “Drivers/DShanMCU-F103/driver_oled.h” 中。其中，<strong>OLED_Test</strong> 函数完成了 OLED 屏幕的初始化与测试工作。</p><p><strong>OLED_Test</strong> 函数在 “Core/Src/freertos.c” 文件中被 <strong>StartDefaultTask</strong> 函数调用。</p><p>打开 “Core/Src/freertos.c” 文件，将 <strong>StartDefaultTask</strong> 函数中的 <strong>OLED_Test</strong> 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">StartDefaultTask</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>argument<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
  <span class="token comment">/* USER CODE BEGIN StartDefaultTask */</span>
  <span class="token comment">/* Infinite loop */</span>
  <span class="token function">LCD_Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token function">LCD_Clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  
  <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span>
  <span class="token punctuation">{</span>
    <span class="token comment">//Led_Test();</span>
    <span class="token function">LCD_Test</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">//MPU6050_Test(); </span>
    <span class="token comment">//DS18B20_Test();</span>
    <span class="token comment">//DHT11_Test();</span>
    <span class="token comment">//ActiveBuzzer_Test();</span>
    <span class="token comment">//PassiveBuzzer_Test();</span>
    <span class="token comment">//ColorLED_Test();</span>
    <span class="token comment">//IRReceiver_Test();</span>
    <span class="token comment">//IRSender_Test();</span>
    <span class="token comment">//LightSensor_Test();</span>
    <span class="token comment">//Obstacle_Test();</span>
    <span class="token comment">//SR04_Test();</span>
    <span class="token comment">//W25Q64_Test();</span>
    <span class="token comment">//RotaryEncoder_Test();</span>
    <span class="token comment">//Motor_Test();</span>
    <span class="token comment">//Key_Test();</span>
    <span class="token comment">//UART_Test();</span>
  <span class="token punctuation">}</span>
  <span class="token comment">/* USER CODE END StartDefaultTask */</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-4-4-上机实验" tabindex="-1"><a class="header-anchor" href="#_5-4-4-上机实验" aria-hidden="true">#</a> 5.4.4 上机实验</h3><p>会看到OLED屏幕上显示 <strong>OLED_Test</strong> 函数中指定的字符或字符串。</p><h2 id="_5-5-按键驱动使用方法" tabindex="-1"><a class="header-anchor" href="#_5-5-按键驱动使用方法" aria-hidden="true">#</a> 5.5 按键驱动使用方法</h2><p>本节介绍按键驱动的使用方法，最终实现通过按键控制LED灯。</p><h3 id="_5-5-1-硬件接线" tabindex="-1"><a class="header-anchor" href="#_5-5-1-硬件接线" aria-hidden="true">#</a> 5.5.1 硬件接线</h3><p>这里我们不需要进行额外接模块的操作，因为DShanMCU-F103 Base Board底板板载了一个按键，如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image6.png" alt=""></p><h3 id="_5-5-2-stm32cubemx配置" tabindex="-1"><a class="header-anchor" href="#_5-5-2-stm32cubemx配置" aria-hidden="true">#</a> 5.5.2 STM32CubeMX配置</h3><p>按键使用PB14引脚，配置如下：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image7.png" alt=""></p><h3 id="_5-5-3-代码调用" tabindex="-1"><a class="header-anchor" href="#_5-5-3-代码调用" aria-hidden="true">#</a> 5.5.3 代码调用</h3><p>这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_key.c” 和 “Drivers/DShanMCU-F103/driver_key.h” 中。其中，<strong>Key_Test</strong> 函数完成了按键和LED灯的初始化与测试工作。</p><p><strong>Key_Test</strong> 函数在 “Core/Src/freertos.c” 文件中被 <strong>StartDefaultTask</strong> 函数调用。</p><p>打开 “Core/Src/freertos.c” 文件，将 <strong>StartDefaultTask</strong> 函数中的 <strong>Key_Test</strong> 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">StartDefaultTask</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>argument<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
  <span class="token comment">/* USER CODE BEGIN StartDefaultTask */</span>
  <span class="token comment">/* Infinite loop */</span>
  <span class="token function">LCD_Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token function">LCD_Clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  
  <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span>
  <span class="token punctuation">{</span>
    <span class="token comment">//Led_Test();</span>
    <span class="token comment">//LCD_Test();</span>
    <span class="token comment">//MPU6050_Test(); </span>
    <span class="token comment">//DS18B20_Test();</span>
    <span class="token comment">//DHT11_Test();</span>
    <span class="token comment">//ActiveBuzzer_Test();</span>
    <span class="token comment">//PassiveBuzzer_Test();</span>
    <span class="token comment">//ColorLED_Test();</span>
    <span class="token comment">//IRReceiver_Test();</span>
    <span class="token comment">//IRSender_Test();</span>
    <span class="token comment">//LightSensor_Test();</span>
    <span class="token comment">//Obstacle_Test();</span>
    <span class="token comment">//SR04_Test();</span>
    <span class="token comment">//W25Q64_Test();</span>
    <span class="token comment">//RotaryEncoder_Test();</span>
    <span class="token comment">//Motor_Test();</span>
    <span class="token function">Key_Test</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">//UART_Test();</span>
  <span class="token punctuation">}</span>
  <span class="token comment">/* USER CODE END StartDefaultTask */</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-5-4-上机实验" tabindex="-1"><a class="header-anchor" href="#_5-5-4-上机实验" aria-hidden="true">#</a> 5.5.4 上机实验</h3><p>按下或者松开按键，会看到OLED屏幕上按键的当前状态（按下或松开）；同时，可以通过按键控制LED灯的亮灭，按下按键LED灯亮起，松开按键LED灯熄灭。。</p><h2 id="_5-6-有源蜂鸣器模块驱动使用方法" tabindex="-1"><a class="header-anchor" href="#_5-6-有源蜂鸣器模块驱动使用方法" aria-hidden="true">#</a> 5.6 有源蜂鸣器模块驱动使用方法</h2><p>本节介绍有源蜂鸣器模块驱动的使用方法，最终实现让有源蜂鸣器发出声音。</p><h3 id="_5-6-1-硬件接线" tabindex="-1"><a class="header-anchor" href="#_5-6-1-硬件接线" aria-hidden="true">#</a> 5.6.1 硬件接线</h3><p>将有源蜂鸣器模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“蜂鸣器”丝印的排母接口，如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image8.png" alt=""></p><h3 id="_5-6-2-stm32cubemx配置" tabindex="-1"><a class="header-anchor" href="#_5-6-2-stm32cubemx配置" aria-hidden="true">#</a> 5.6.2 STM32CubeMX配置</h3><p>有源蜂鸣器使用PA8，把它配置为推挽输出引脚即可。但是无源蜂鸣器也使用PA8，需要把它配置为TIM1_CH1引脚。我们的程序可以既使用有源蜂鸣器，也使用无源蜂鸣器。所以需要使用代码来配置PA8。</p><p>在driver_active_buzzer.c文件的ActiveBuzzer_Init函数里，已经把PA8配置为推挽输出。</p><p>在driver_passive_buzzer.c文件的PassiveBuzzer_Init函数里，已经把PA8配置为TIM1_CH1。</p><p>无需在STM32CubeMX里配置PA8。</p><h3 id="_5-6-3-代码调用" tabindex="-1"><a class="header-anchor" href="#_5-6-3-代码调用" aria-hidden="true">#</a> 5.6.3 代码调用</h3><p>这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_active_buzzer.c” 和 “Drivers/DShanMCU-F103/driver_active_buzzer.h” 中。其中，<strong>ActiveBuzzer_Test</strong> 函数完成了有源蜂鸣器模块的初始化与测试工作。</p><p><strong>ActiveBuzzer_Test</strong> 函数在 “Core/Src/freertos.c” 文件中被 <strong>StartDefaultTask</strong> 函数调用。</p><p>打开 “Core/Src/freertos.c” 文件，将 <strong>StartDefaultTask</strong> 函数中的 <strong>ActiveBuzzer_Test</strong> 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">StartDefaultTask</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>argument<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
  <span class="token comment">/* USER CODE BEGIN StartDefaultTask */</span>
  <span class="token comment">/* Infinite loop */</span>
  <span class="token function">LCD_Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token function">LCD_Clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  
  <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span>
  <span class="token punctuation">{</span>
    <span class="token comment">//Led_Test();</span>
    <span class="token comment">//LCD_Test();</span>
    <span class="token comment">//MPU6050_Test(); </span>
    <span class="token comment">//DS18B20_Test();</span>
    <span class="token comment">//DHT11_Test();</span>
    <span class="token function">ActiveBuzzer_Test</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">//PassiveBuzzer_Test();</span>
    <span class="token comment">//ColorLED_Test();</span>
    <span class="token comment">//IRReceiver_Test();</span>
    <span class="token comment">//IRSender_Test();</span>
    <span class="token comment">//LightSensor_Test();</span>
    <span class="token comment">//Obstacle_Test();</span>
    <span class="token comment">//SR04_Test();</span>
    <span class="token comment">//W25Q64_Test();</span>
    <span class="token comment">//RotaryEncoder_Test();</span>
    <span class="token comment">//Motor_Test();</span>
    <span class="token comment">//Key_Test();</span>
    <span class="token comment">//UART_Test();</span>
  <span class="token punctuation">}</span>
  <span class="token comment">/* USER CODE END StartDefaultTask */</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-6-4-上机实验" tabindex="-1"><a class="header-anchor" href="#_5-6-4-上机实验" aria-hidden="true">#</a> 5.6.4 上机实验</h3><p>有源蜂鸣器保持响1秒之后保持不响1秒，不停的重复这个过程；同时会看到OLED屏幕上显示有源蜂鸣器的状态(ON/OFF)。</p><h2 id="_5-7-无源蜂鸣器模块驱动使用方法" tabindex="-1"><a class="header-anchor" href="#_5-7-无源蜂鸣器模块驱动使用方法" aria-hidden="true">#</a> 5.7 无源蜂鸣器模块驱动使用方法</h2><p>本节介绍无源蜂鸣器模块驱动的使用方法，最终实现让无源蜂鸣器发出声音。</p><h3 id="_5-7-1-硬件接线" tabindex="-1"><a class="header-anchor" href="#_5-7-1-硬件接线" aria-hidden="true">#</a> 5.7.1 硬件接线</h3><p>将无源蜂鸣器模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“蜂鸣器”丝印的排母接口，如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image9.png" alt=""></p><h3 id="_5-7-2-stm32cubemx配置" tabindex="-1"><a class="header-anchor" href="#_5-7-2-stm32cubemx配置" aria-hidden="true">#</a> 5.7.2 STM32CubeMX配置</h3><p>有源蜂鸣器使用PA8，把它配置为推挽输出引脚即可。但是无源蜂鸣器也使用PA8，需要把它配置为TIM1_CH1引脚。我们的程序可以既使用有源蜂鸣器，也使用无源蜂鸣器。所以需要使用代码来配置PA8。</p><p>在driver_active_buzzer.c文件的ActiveBuzzer_Init函数里，已经把PA8配置为推挽输出。</p><p>在driver_passive_buzzer.c文件的PassiveBuzzer_Init函数里，已经把PA8配置为TIM1_CH1。</p><p>无需在STM32CubeMX里配置PA8。</p><p>下图仅仅是一个示例，演示如何配置TIMER1、如何把PA8配置为TIM1_CH1：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image10.png" alt=""></p><h3 id="_5-7-3-代码调用" tabindex="-1"><a class="header-anchor" href="#_5-7-3-代码调用" aria-hidden="true">#</a> 5.7.3 代码调用</h3><p>这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_passive_buzzer.c” 和 “Drivers/DShanMCU-F103/driver_passive_buzzer.h” 中。其中，<strong>PassiveBuzzer_Test</strong> 函数完成了无源蜂鸣器模块的初始化与测试工作。</p><p><strong>PassiveBuzzer_Test</strong> 函数在 “Core/Src/freertos.c” 文件中被 <strong>StartDefaultTask</strong> 函数调用。</p><p>打开 “Core/Src/freertos.c” 文件，将 <strong>StartDefaultTask</strong> 函数中的 <strong>PassiveBuzzer_Test</strong> 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">StartDefaultTask</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>argument<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
  <span class="token comment">/* USER CODE BEGIN StartDefaultTask */</span>
  <span class="token comment">/* Infinite loop */</span>
  <span class="token function">LCD_Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token function">LCD_Clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  
  <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span>
  <span class="token punctuation">{</span>
    <span class="token comment">//Led_Test();</span>
    <span class="token comment">//LCD_Test();</span>
    <span class="token comment">//MPU6050_Test(); </span>
    <span class="token comment">//DS18B20_Test();</span>
    <span class="token comment">//DHT11_Test();</span>
    <span class="token comment">//ActiveBuzzer_Test();</span>
    <span class="token function">PassiveBuzzer_Test</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">//ColorLED_Test();</span>
    <span class="token comment">//IRReceiver_Test();</span>
    <span class="token comment">//IRSender_Test();</span>
    <span class="token comment">//LightSensor_Test();</span>
    <span class="token comment">//Obstacle_Test();</span>
    <span class="token comment">//SR04_Test();</span>
    <span class="token comment">//W25Q64_Test();</span>
    <span class="token comment">//RotaryEncoder_Test();</span>
    <span class="token comment">//Motor_Test();</span>
    <span class="token comment">//Key_Test();</span>
    <span class="token comment">//UART_Test();</span>
  <span class="token punctuation">}</span>
  <span class="token comment">/* USER CODE END StartDefaultTask */</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-7-4-上机实验" tabindex="-1"><a class="header-anchor" href="#_5-7-4-上机实验" aria-hidden="true">#</a> 5.7.4 上机实验</h3><p>有源蜂鸣器保持响1秒之后保持不响1秒，不停的重复这个过程；同时会看到OLED屏幕上显示有源蜂鸣器的状态(ON/OFF)。</p><h2 id="_5-8-dht11温湿度模块驱动使用方法" tabindex="-1"><a class="header-anchor" href="#_5-8-dht11温湿度模块驱动使用方法" aria-hidden="true">#</a> 5.8 DHT11温湿度模块驱动使用方法</h2><p>本节介绍DHT11温湿度模块驱动的使用方法，最终实现通过DHT11温湿度模块采集温湿度信息。</p><h3 id="_5-8-1-硬件接线" tabindex="-1"><a class="header-anchor" href="#_5-8-1-硬件接线" aria-hidden="true">#</a> 5.8.1 硬件接线</h3><p>将DHT11温湿度模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“DHT11温湿度模块” 丝印的排母接口，如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image11.png" alt=""></p><h3 id="_5-8-2-stm32cubemx配置" tabindex="-1"><a class="header-anchor" href="#_5-8-2-stm32cubemx配置" aria-hidden="true">#</a> 5.8.2 STM32CubeMX配置</h3><p>DHT11使用PA1，初始状态为“open drain，pull-up”，如下图：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image12.png" alt=""></p><h3 id="_5-8-3-代码调用" tabindex="-1"><a class="header-anchor" href="#_5-8-3-代码调用" aria-hidden="true">#</a> 5.8.3 代码调用</h3><p>这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_dht11.c” 和 “Drivers/DShanMCU-F103/driver_dht11.h” 中。其中，<strong>DHT11_Test</strong> 函数完成了DHT11温湿度模块的初始化与测试工作。</p><p><strong>DHT11_Test</strong> 函数在 “Core/Src/freertos.c” 文件中被 <strong>StartDefaultTask</strong> 函数调用。</p><p>打开 “Core/Src/freertos.c” 文件，将 <strong>StartDefaultTask</strong> 函数中的 <strong>DHT11_Test</strong> 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">StartDefaultTask</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>argument<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
  <span class="token comment">/* USER CODE BEGIN StartDefaultTask */</span>
  <span class="token comment">/* Infinite loop */</span>
  <span class="token function">LCD_Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token function">LCD_Clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  
  <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span>
  <span class="token punctuation">{</span>
    <span class="token comment">//Led_Test();</span>
    <span class="token comment">//LCD_Test();</span>
    <span class="token comment">//MPU6050_Test(); </span>
    <span class="token comment">//DS18B20_Test();</span>
    <span class="token function">DHT11_Test</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">//ActiveBuzzer_Test();</span>
    <span class="token comment">//PassiveBuzzer_Test();</span>
    <span class="token comment">//ColorLED_Test();</span>
    <span class="token comment">//IRReceiver_Test();</span>
    <span class="token comment">//IRSender_Test();</span>
    <span class="token comment">//LightSensor_Test();</span>
    <span class="token comment">//Obstacle_Test();</span>
    <span class="token comment">//SR04_Test();</span>
    <span class="token comment">//W25Q64_Test();</span>
    <span class="token comment">//RotaryEncoder_Test();</span>
    <span class="token comment">//Motor_Test();</span>
    <span class="token comment">//Key_Test();</span>
    <span class="token comment">//UART_Test();</span>
  <span class="token punctuation">}</span>
  <span class="token comment">/* USER CODE END StartDefaultTask */</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>会看到OLED屏幕上显示DHT11温湿度模块实时采集的温度与湿度信息。</p><h2 id="_5-9-ds18b20温度模块驱动使用方法" tabindex="-1"><a class="header-anchor" href="#_5-9-ds18b20温度模块驱动使用方法" aria-hidden="true">#</a> 5.9 DS18B20温度模块驱动使用方法</h2><p>本节介绍DS18B20温度模块驱动的使用方法，最终实现通过DS18B20温度模块采集温度信息。</p><h3 id="_5-9-1-硬件接线" tabindex="-1"><a class="header-anchor" href="#_5-9-1-硬件接线" aria-hidden="true">#</a> 5.9.1 硬件接线</h3><p>将有DS18B20温度模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“DS18B20” 丝印的排母接口，如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image13.png" alt=""></p><h3 id="_5-9-2-stm32cubemx配置" tabindex="-1"><a class="header-anchor" href="#_5-9-2-stm32cubemx配置" aria-hidden="true">#</a> 5.9.2 STM32CubeMX配置</h3><p>DS18B20使用PA1，初始状态为“open drain，pull-up”，如下图：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image14.png" alt=""></p><h3 id="_5-9-3-代码调用" tabindex="-1"><a class="header-anchor" href="#_5-9-3-代码调用" aria-hidden="true">#</a> 5.9.3 代码调用</h3><p>这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_ds18b20.c” 和 “Drivers/DShanMCU-F103/driver_ds18b20.h” 中。其中，<strong>DS18B20_Test</strong> 函数完成了DS18B20温度模块的初始化与测试工作。</p><p><strong>DS18B20_Test</strong> 函数在 “Core/Src/freertos.c” 文件中被 <strong>StartDefaultTask</strong> 函数调用。</p><p>打开 “Core/Src/freertos.c” 文件，将 <strong>StartDefaultTask</strong> 函数中的 <strong>DS18B20_Test</strong> 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">StartDefaultTask</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>argument<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
  <span class="token comment">/* USER CODE BEGIN StartDefaultTask */</span>
  <span class="token comment">/* Infinite loop */</span>
  <span class="token function">LCD_Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token function">LCD_Clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  
  <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span>
  <span class="token punctuation">{</span>
    <span class="token comment">//Led_Test();</span>
    <span class="token comment">//LCD_Test();</span>
    <span class="token comment">//MPU6050_Test(); </span>
    <span class="token function">DS18B20_Test</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">//DHT11_Test();</span>
    <span class="token comment">//ActiveBuzzer_Test();</span>
    <span class="token comment">//PassiveBuzzer_Test();</span>
    <span class="token comment">//ColorLED_Test();</span>
    <span class="token comment">//IRReceiver_Test();</span>
    <span class="token comment">//IRSender_Test();</span>
    <span class="token comment">//LightSensor_Test();</span>
    <span class="token comment">//Obstacle_Test();</span>
    <span class="token comment">//SR04_Test();</span>
    <span class="token comment">//W25Q64_Test();</span>
    <span class="token comment">//RotaryEncoder_Test();</span>
    <span class="token comment">//Motor_Test();</span>
    <span class="token comment">//Key_Test();</span>
    <span class="token comment">//UART_Test();</span>
  <span class="token punctuation">}</span>
  <span class="token comment">/* USER CODE END StartDefaultTask */</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-9-4-上机实验" tabindex="-1"><a class="header-anchor" href="#_5-9-4-上机实验" aria-hidden="true">#</a> 5.9.4 上机实验</h3><p>会看到OLED屏幕上显示DS18B20温度模块实时采集的温度信息。</p><h2 id="_5-10-红外避障模块驱动使用方法" tabindex="-1"><a class="header-anchor" href="#_5-10-红外避障模块驱动使用方法" aria-hidden="true">#</a> 5.10 红外避障模块驱动使用方法</h2><p>本节介绍红外避障模块驱动的使用方法，最终实现碰撞检测功能。</p><h3 id="_5-10-1-硬件接线" tabindex="-1"><a class="header-anchor" href="#_5-10-1-硬件接线" aria-hidden="true">#</a> 5.10.1 硬件接线</h3><p>将红外避障模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“红外对管避障模块” 丝印的排母接口，如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image15.png" alt=""></p><h3 id="_5-10-2-stm32cubemx配置" tabindex="-1"><a class="header-anchor" href="#_5-10-2-stm32cubemx配置" aria-hidden="true">#</a> 5.10.2 STM32CubeMX配置</h3><p>红外避障模块使用PB13，把它配置为输入引脚即可，如下图：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image16.png" alt=""></p><h3 id="_5-10-3-代码调用" tabindex="-1"><a class="header-anchor" href="#_5-10-3-代码调用" aria-hidden="true">#</a> 5.10.3 代码调用</h3><p>这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_ir_obstacle.c” 和 “Drivers/DShanMCU-F103/driver_ir_obstacle.h” 中。其中，<strong>IRObstacle_Test</strong> 函数完成了红外避障模块的初始化与测试工作。</p><p><strong>IRObstacle_Test</strong> 函数在 “Core/Src/freertos.c” 文件中被<strong>StartDefaultTask</strong> 函数调用。</p><p>打开 “Core/Src/freertos.c” 文件，将 <strong>StartDefaultTask</strong> 函数中的 <strong>IRObstacle_Test</strong> 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">StartDefaultTask</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>argument<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
  <span class="token comment">/* USER CODE BEGIN StartDefaultTask */</span>
  <span class="token comment">/* Infinite loop */</span>
  <span class="token function">LCD_Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token function">LCD_Clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  
  <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span>
  <span class="token punctuation">{</span>
    <span class="token comment">//Led_Test();</span>
    <span class="token comment">//LCD_Test();</span>
    <span class="token comment">//MPU6050_Test(); </span>
    <span class="token comment">//DS18B20_Test();</span>
    <span class="token comment">//DHT11_Test();</span>
    <span class="token comment">//ActiveBuzzer_Test();</span>
    <span class="token comment">//PassiveBuzzer_Test();</span>
    <span class="token comment">//ColorLED_Test();</span>
    <span class="token comment">//IRReceiver_Test();</span>
    <span class="token comment">//IRSender_Test();</span>
    <span class="token comment">//LightSensor_Test();</span>
    <span class="token function">Obstacle_Test</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">//SR04_Test();</span>
    <span class="token comment">//W25Q64_Test();</span>
    <span class="token comment">//RotaryEncoder_Test();</span>
    <span class="token comment">//Motor_Test();</span>
    <span class="token comment">//Key_Test();</span>
    <span class="token comment">//UART_Test();</span>
  <span class="token punctuation">}</span>
  <span class="token comment">/* USER CODE END StartDefaultTask */</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>会看到OLED屏幕上显示红外避障模块实时检测的状态信息(是否碰撞到障碍物)。</p><h2 id="_5-11-超声波测距模块驱动使用方法" tabindex="-1"><a class="header-anchor" href="#_5-11-超声波测距模块驱动使用方法" aria-hidden="true">#</a> 5.11 超声波测距模块驱动使用方法</h2><p>本节介绍超声波测距模块驱动的使用方法，最终实现测距功能。</p><h3 id="_5-11-1-硬件接线" tabindex="-1"><a class="header-anchor" href="#_5-11-1-硬件接线" aria-hidden="true">#</a> 5.11.1 硬件接线</h3><p>将超声波测距模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“超声波模块” 丝印的排母接口，如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image17.png" alt=""></p><h3 id="_5-11-2-stm32cubemx配置" tabindex="-1"><a class="header-anchor" href="#_5-11-2-stm32cubemx配置" aria-hidden="true">#</a> 5.11.2 STM32CubeMX配置</h3><p>超声测距模块SR04使用 PB9 作为 Trig 引脚，使用 PB8 作为 Echo 引脚。把 PB9 设置为输出、把PB8设置为输入即可。如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image18.png" alt=""></p><h3 id="_5-11-3-代码调用" tabindex="-1"><a class="header-anchor" href="#_5-11-3-代码调用" aria-hidden="true">#</a> 5.11.3 代码调用</h3><p>这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_ultrasonic_sr04.c” 和 “Drivers/DShanMCU-F103/driver_ultrasonic_sr04.h” 中。其中，<strong>SR04_Test</strong> 函数完成了超声波测距模块的初始化与测试工作。</p><p><strong>SR04_Test</strong> 函数在 “Core/Src/freertos.c” 文件中被 <strong>StartDefaultTask</strong> 函数调用。</p><p>打开 “Core/Src/freertos.c” 文件，将 <strong>StartDefaultTask</strong> 函数中的 <strong>SR04_Test</strong> 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">StartDefaultTask</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>argument<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
  <span class="token comment">/* USER CODE BEGIN StartDefaultTask */</span>
  <span class="token comment">/* Infinite loop */</span>
  <span class="token function">LCD_Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token function">LCD_Clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  
  <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span>
  <span class="token punctuation">{</span>
    <span class="token comment">//Led_Test();</span>
    <span class="token comment">//LCD_Test();</span>
    <span class="token comment">//MPU6050_Test(); </span>
    <span class="token comment">//DS18B20_Test();</span>
    <span class="token comment">//DHT11_Test();</span>
    <span class="token comment">//ActiveBuzzer_Test();</span>
    <span class="token comment">//PassiveBuzzer_Test();</span>
    <span class="token comment">//ColorLED_Test();</span>
    <span class="token comment">//IRReceiver_Test();</span>
    <span class="token comment">//IRSender_Test();</span>
    <span class="token comment">//LightSensor_Test();</span>
    <span class="token comment">//Obstacle_Test();</span>
    <span class="token function">SR04_Test</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">//W25Q64_Test();</span>
    <span class="token comment">//RotaryEncoder_Test();</span>
    <span class="token comment">//Motor_Test();</span>
    <span class="token comment">//Key_Test();</span>
    <span class="token comment">//UART_Test();</span>
  <span class="token punctuation">}</span>
  <span class="token comment">/* USER CODE END StartDefaultTask */</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-11-4-上机实验" tabindex="-1"><a class="header-anchor" href="#_5-11-4-上机实验" aria-hidden="true">#</a> 5.11.4 上机实验</h3><p>会看到OLED屏幕上显示超声波测距模块实时检测的距离信息(单位cm)。</p><h2 id="_5-12-旋转编码器模块驱动使用方法" tabindex="-1"><a class="header-anchor" href="#_5-12-旋转编码器模块驱动使用方法" aria-hidden="true">#</a> 5.12 旋转编码器模块驱动使用方法</h2><p>本节介绍旋转编码器模块驱动的使用方法，最终实现旋转编码器的操作功能(正反转、按下)。</p><h3 id="_5-12-1-硬件接线" tabindex="-1"><a class="header-anchor" href="#_5-12-1-硬件接线" aria-hidden="true">#</a> 5.12.1 硬件接线</h3><p>将旋转编码器模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“旋转编码器” 丝印的排母接口，如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image19.png" alt=""></p><h3 id="_5-12-2-stm32cubemx配置" tabindex="-1"><a class="header-anchor" href="#_5-12-2-stm32cubemx配置" aria-hidden="true">#</a> 5.12.2 STM32CubeMX配置</h3><p>旋转编码器使用PB12作为S1引脚（作为中断引脚，上升沿触发），使用PB0作为S2引脚（作为输入引脚），使用PB1作为Key引脚（作为输入引脚）。配置如下：</p><p>PB0、PB1：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image20.png" alt=""></p><p>PB12:</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image21.png" alt=""></p><h3 id="_5-12-3-代码调用" tabindex="-1"><a class="header-anchor" href="#_5-12-3-代码调用" aria-hidden="true">#</a> 5.12.3 代码调用</h3><p>这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_rotary_encoder.c” 和 “Drivers/DShanMCU-F103/driver_rotary_encoder.h” 中。其中，<strong>RotaryEncoder_Test</strong> 函数完成了旋转编码器模块的初始化与测试工作。</p><p><strong>RotaryEncoder_Test</strong> 函数在 “Core/Src/freertos.c” 文件中被 <strong>StartDefaultTask</strong> 函数调用。</p><p>打开 “Core/Src/freertos.c” 文件，将 <strong>StartDefaultTask</strong> 函数中的 <strong>RotaryEncoder_Test</strong> 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">StartDefaultTask</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>argument<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
  <span class="token comment">/* USER CODE BEGIN StartDefaultTask */</span>
  <span class="token comment">/* Infinite loop */</span>
  <span class="token function">LCD_Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token function">LCD_Clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  
  <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span>
  <span class="token punctuation">{</span>
    <span class="token comment">//Led_Test();</span>
    <span class="token comment">//LCD_Test();</span>
    <span class="token comment">//MPU6050_Test(); </span>
    <span class="token comment">//DS18B20_Test();</span>
    <span class="token comment">//DHT11_Test();</span>
    <span class="token comment">//ActiveBuzzer_Test();</span>
    <span class="token comment">//PassiveBuzzer_Test();</span>
    <span class="token comment">//ColorLED_Test();</span>
    <span class="token comment">//IRReceiver_Test();</span>
    <span class="token comment">//IRSender_Test();</span>
    <span class="token comment">//LightSensor_Test();</span>
    <span class="token comment">//Obstacle_Test();</span>
    <span class="token comment">//SR04_Test();</span>
    <span class="token comment">//W25Q64_Test();</span>
    <span class="token function">RotaryEncoder_Test</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">//Motor_Test();</span>
    <span class="token comment">//Key_Test();</span>
    <span class="token comment">//UART_Test();</span>
  <span class="token punctuation">}</span>
  <span class="token comment">/* USER CODE END StartDefaultTask */</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-12-4-上机实验" tabindex="-1"><a class="header-anchor" href="#_5-12-4-上机实验" aria-hidden="true">#</a> 5.12.4 上机实验</h3><p>会看到OLED屏幕上显示旋转编码器模块的状态信息(正反转及计数、按下)。</p><h2 id="_5-13-红外接收模块驱动使用方法" tabindex="-1"><a class="header-anchor" href="#_5-13-红外接收模块驱动使用方法" aria-hidden="true">#</a> 5.13 红外接收模块驱动使用方法</h2><p>本节介绍红外接收模块驱动的使用方法，最终实现红外接收模块的接收功能。</p><h3 id="_5-13-1-硬件接线" tabindex="-1"><a class="header-anchor" href="#_5-13-1-硬件接线" aria-hidden="true">#</a> 5.13.1 硬件接线</h3><p>将红外接收模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“红外接收管(IR Receiver)” 丝印的排母接口，如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image22.png" alt=""></p><h3 id="_5-13-2-stm32cubemx配置" tabindex="-1"><a class="header-anchor" href="#_5-13-2-stm32cubemx配置" aria-hidden="true">#</a> 5.13.2 STM32CubeMX配置</h3><p>红外接收模块使用PB10作为中断引脚，双边沿触发。要使能内部上拉，因为没有外部上拉电阻。配置如下：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image23.png" alt=""></p><h3 id="_5-13-3-代码调用" tabindex="-1"><a class="header-anchor" href="#_5-13-3-代码调用" aria-hidden="true">#</a> 5.13.3 代码调用</h3><p>这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_ir_receiver.c” 和 “Drivers/DShanMCU-F103/driver_ir_receiver.h” 中。其中，<strong>IRReceiver_Test</strong> 函数完成了红外接收模块的初始化与测试工作。</p><p><strong>IRReceiver_Test</strong> 函数在 “Core/Src/freertos.c” 文件中被 <strong>StartDefaultTask</strong> 函数调用。</p><p>打开 “Core/Src/freertos.c” 文件，将 <strong>StartDefaultTask</strong> 函数中的 <strong>IRReceiver_Test</strong> 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">StartDefaultTask</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>argument<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
  <span class="token comment">/* USER CODE BEGIN StartDefaultTask */</span>
  <span class="token comment">/* Infinite loop */</span>
  <span class="token function">LCD_Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token function">LCD_Clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  
  <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span>
  <span class="token punctuation">{</span>
    <span class="token comment">//Led_Test();</span>
    <span class="token comment">//LCD_Test();</span>
    <span class="token comment">//MPU6050_Test(); </span>
    <span class="token comment">//DS18B20_Test();</span>
    <span class="token comment">//DHT11_Test();</span>
    <span class="token comment">//ActiveBuzzer_Test();</span>
    <span class="token comment">//PassiveBuzzer_Test();</span>
    <span class="token comment">//ColorLED_Test();</span>
    <span class="token function">IRReceiver_Test</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">//IRSender_Test();</span>
    <span class="token comment">//LightSensor_Test();</span>
    <span class="token comment">//Obstacle_Test();</span>
    <span class="token comment">//SR04_Test();</span>
    <span class="token comment">//W25Q64_Test();</span>
    <span class="token comment">//RotaryEncoder_Test();</span>
    <span class="token comment">//Motor_Test();</span>
    <span class="token comment">//Key_Test();</span>
    <span class="token comment">//UART_Test();</span>
  <span class="token punctuation">}</span>
  <span class="token comment">/* USER CODE END StartDefaultTask */</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-13-4-上机实验" tabindex="-1"><a class="header-anchor" href="#_5-13-4-上机实验" aria-hidden="true">#</a> 5.13.4 上机实验</h3><p>会看到OLED屏幕上显示红外接收模块接收到的信息(发送方的哪个按键被按下)。</p><h2 id="_5-14-红外发射模块驱动使用方法" tabindex="-1"><a class="header-anchor" href="#_5-14-红外发射模块驱动使用方法" aria-hidden="true">#</a> 5.14 红外发射模块驱动使用方法</h2><p>本节介绍红外发射模块驱动的使用方法，最终实现红外发射模块的发射功能。</p><h3 id="_5-14-1-硬件接线" tabindex="-1"><a class="header-anchor" href="#_5-14-1-硬件接线" aria-hidden="true">#</a> 5.14.1 硬件接线</h3><p>将红外发射模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“红外发射管(IR Transmitter)” 丝印的排母接口，如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image24.png" alt=""></p><h3 id="_5-14-2-stm32cubemx配置" tabindex="-1"><a class="header-anchor" href="#_5-14-2-stm32cubemx配置" aria-hidden="true">#</a> 5.14.2 STM32CubeMX配置</h3><p>红外发射模块、有源蜂鸣器、无源蜂鸣器共用PA8。</p><p>有源蜂鸣器驱动driver_active_buzzer.c文件的ActiveBuzzer_Init函数里，已经把PA8配置为推挽输出。</p><p>无源蜂鸣器驱动driver_passive_buzzer.c文件的PassiveBuzzer_Init函数里，已经把PA8配置为TIM1_CH1。</p><p>红外发射模块驱动driver_ir_sender.c文件的IRSender_Init函数里，已经把PA8配置为TIM1_CH1。</p><p>无需使用STM32CubeMX来配置PA8。</p><h3 id="_5-14-3-代码调用" tabindex="-1"><a class="header-anchor" href="#_5-14-3-代码调用" aria-hidden="true">#</a> 5.14.3 代码调用</h3><p>这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_ir_sender.c” 和 “Drivers/DShanMCU-F103/driver_ir_sender.h” 中。其中，<strong>IRSender_Test</strong> 函数完成了红外发射模块的初始化与测试工作。</p><p><strong>IRSender_Test</strong> 函数在 “Core/Src/freertos.c” 文件中被<strong>StartDefaultTask</strong> 函数调用。</p><p>打开 “Core/Src/freertos.c” 文件，将 <strong>StartDefaultTask</strong> 函数中的 <strong>IRSender_Test</strong> 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">StartDefaultTask</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>argument<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
  <span class="token comment">/* USER CODE BEGIN StartDefaultTask */</span>
  <span class="token comment">/* Infinite loop */</span>
  <span class="token function">LCD_Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token function">LCD_Clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  
  <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span>
  <span class="token punctuation">{</span>
    <span class="token comment">//Led_Test();</span>
    <span class="token comment">//LCD_Test();</span>
    <span class="token comment">//MPU6050_Test(); </span>
    <span class="token comment">//DS18B20_Test();</span>
    <span class="token comment">//DHT11_Test();</span>
    <span class="token comment">//ActiveBuzzer_Test();</span>
    <span class="token comment">//PassiveBuzzer_Test();</span>
    <span class="token comment">//ColorLED_Test();</span>
    <span class="token comment">//IRReceiver_Test();</span>
    <span class="token function">IRSender_Test</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">//LightSensor_Test();</span>
    <span class="token comment">//Obstacle_Test();</span>
    <span class="token comment">//SR04_Test();</span>
    <span class="token comment">//W25Q64_Test();</span>
    <span class="token comment">//RotaryEncoder_Test();</span>
    <span class="token comment">//Motor_Test();</span>
    <span class="token comment">//Key_Test();</span>
    <span class="token comment">//UART_Test();</span>
  <span class="token punctuation">}</span>
  <span class="token comment">/* USER CODE END StartDefaultTask */</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-14-4-上机实验" tabindex="-1"><a class="header-anchor" href="#_5-14-4-上机实验" aria-hidden="true">#</a> 5.14.4 上机实验</h3><p>会看到OLED屏幕上显示红外发射模块发送的信息(哪个按键信息被发射出去)。</p><h2 id="_5-15-rgb全彩led模块驱动使用方法" tabindex="-1"><a class="header-anchor" href="#_5-15-rgb全彩led模块驱动使用方法" aria-hidden="true">#</a> 5.15 RGB全彩LED模块驱动使用方法</h2><p>本节介绍RGB全彩LED模块驱动的使用方法，最终实现让RGB全彩LED模块显示不同的颜色。</p><h3 id="_5-15-1-硬件接线" tabindex="-1"><a class="header-anchor" href="#_5-15-1-硬件接线" aria-hidden="true">#</a> 5.15.1 硬件接线</h3><p>将RGB全彩LED模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“全彩LED”丝印的排母接口，如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image25.png" alt=""></p><h3 id="_5-15-2-stm32cubemx配置" tabindex="-1"><a class="header-anchor" href="#_5-15-2-stm32cubemx配置" aria-hidden="true">#</a> 5.15.2 STM32CubeMX配置</h3><p>全彩LED使用PA15、PB3、PA2作为绿色（G）、蓝色（B）、红色（R）的驱动线，这3个引脚被分别配置为TIM2_CHN1、TIM2_CHN2、TIM2_CHN3。TIMER2的配置如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image26.png" alt=""></p><h3 id="_5-15-3-代码调用" tabindex="-1"><a class="header-anchor" href="#_5-15-3-代码调用" aria-hidden="true">#</a> 5.15.3 代码调用</h3><p>这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_color_led.c” 和 “Drivers/DShanMCU-F103/driver_color_led.h” 中。其中，<strong>ColorLED_Test</strong> 函数完成了RGB全彩LED模块的初始化与测试工作。</p><p><strong>ColorLED_Test</strong> 函数在 “Core/Src/freertos.c” 文件中被 <strong>StartDefaultTask</strong> 函数调用。</p><p>打开 “Core/Src/freertos.c” 文件，将 <strong>StartDefaultTask</strong> 函数中的 *<strong>ColorLED_Test</strong> 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">StartDefaultTask</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>argument<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
  <span class="token comment">/* USER CODE BEGIN StartDefaultTask */</span>
  <span class="token comment">/* Infinite loop */</span>
  <span class="token function">LCD_Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token function">LCD_Clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  
  <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span>
  <span class="token punctuation">{</span>
    <span class="token comment">//Led_Test();</span>
    <span class="token comment">//LCD_Test();</span>
    <span class="token comment">//MPU6050_Test(); </span>
    <span class="token comment">//DS18B20_Test();</span>
    <span class="token comment">//DHT11_Test();</span>
    <span class="token comment">//ActiveBuzzer_Test();</span>
    <span class="token comment">//PassiveBuzzer_Test();</span>
    <span class="token function">ColorLED_Test</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">//IRReceiver_Test();</span>
    <span class="token comment">//IRSender_Test();</span>
    <span class="token comment">//LightSensor_Test();</span>
    <span class="token comment">//Obstacle_Test();</span>
    <span class="token comment">//SR04_Test();</span>
    <span class="token comment">//W25Q64_Test();</span>
    <span class="token comment">//RotaryEncoder_Test();</span>
    <span class="token comment">//Motor_Test();</span>
    <span class="token comment">//Key_Test();</span>
    <span class="token comment">//UART_Test();</span>
  <span class="token punctuation">}</span>
  <span class="token comment">/* USER CODE END StartDefaultTask */</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-15-4-上机实验" tabindex="-1"><a class="header-anchor" href="#_5-15-4-上机实验" aria-hidden="true">#</a> 5.15.4 上机实验</h3><p>会看到RGB全彩LED模块每隔1秒切换为不同的颜色；同时会看到OLED屏幕上显示当前颜色的hex值。</p><h2 id="_5-16-光敏电阻模块驱动使用方法" tabindex="-1"><a class="header-anchor" href="#_5-16-光敏电阻模块驱动使用方法" aria-hidden="true">#</a> 5.16 光敏电阻模块驱动使用方法</h2><p>本节介绍光敏电阻模块驱动的使用方法，最终实现通过光敏电阻模块采集亮度信息。</p><h3 id="_5-16-1-硬件接线" tabindex="-1"><a class="header-anchor" href="#_5-16-1-硬件接线" aria-hidden="true">#</a> 5.16.1 硬件接线</h3><p>将有光敏电阻模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“光敏电阻模块” 丝印的排母接口，如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image27.png" alt=""></p><h3 id="_5-16-2-stm32cubemx配置" tabindex="-1"><a class="header-anchor" href="#_5-16-2-stm32cubemx配置" aria-hidden="true">#</a> 5.16.2 STM32CubeMX配置</h3><p>光敏电阻模块使用PA3作为ADC引脚，配置如下：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image28.png" alt=""></p><h3 id="_5-16-3-代码调用" tabindex="-1"><a class="header-anchor" href="#_5-16-3-代码调用" aria-hidden="true">#</a> 5.16.3 代码调用</h3><p>这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_light_sensor.c” 和 “Drivers/DShanMCU-F103/driver_light_sensor.h” 中。其中，<strong>LightSensor_Test</strong> 函数完成了光敏电阻模块的初始化与测试工作。</p><p><strong>LightSensor_Test</strong> 函数在 “Core/Src/freertos.c” 文件中被<strong>StartDefaultTask</strong> 函数调用。</p><p>打开 “Core/Src/freertos.c” 文件，将 <strong>StartDefaultTask</strong> 函数中的 <strong>LightSensor_Test</strong> 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">StartDefaultTask</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>argument<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
  <span class="token comment">/* USER CODE BEGIN StartDefaultTask */</span>
  <span class="token comment">/* Infinite loop */</span>
  <span class="token function">LCD_Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token function">LCD_Clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  
  <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span>
  <span class="token punctuation">{</span>
    <span class="token comment">//Led_Test();</span>
    <span class="token comment">//LCD_Test();</span>
    <span class="token comment">//MPU6050_Test(); </span>
    <span class="token comment">//DS18B20_Test();</span>
    <span class="token comment">//DHT11_Test();</span>
    <span class="token comment">//ActiveBuzzer_Test();</span>
    <span class="token comment">//PassiveBuzzer_Test();</span>
    <span class="token comment">//ColorLED_Test();</span>
    <span class="token comment">//IRReceiver_Test();</span>
    <span class="token comment">//IRSender_Test();</span>
    <span class="token function">LightSensor_Test</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">//Obstacle_Test();</span>
    <span class="token comment">//SR04_Test();</span>
    <span class="token comment">//W25Q64_Test();</span>
    <span class="token comment">//RotaryEncoder_Test();</span>
    <span class="token comment">//Motor_Test();</span>
    <span class="token comment">//Key_Test();</span>
    <span class="token comment">//UART_Test();</span>
  <span class="token punctuation">}</span>
  <span class="token comment">/* USER CODE END StartDefaultTask */</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-16-4-上机实验" tabindex="-1"><a class="header-anchor" href="#_5-16-4-上机实验" aria-hidden="true">#</a> 5.16.4 上机实验</h3><p>会看到OLED屏幕上显示光敏电阻模块实时采集的亮度信息。</p><h2 id="_5-17-sg90舵机驱动使用方法" tabindex="-1"><a class="header-anchor" href="#_5-17-sg90舵机驱动使用方法" aria-hidden="true">#</a> 5.17 SG90舵机驱动使用方法</h2><h2 id="_5-18-iic-陀螺仪加速度计模块驱动使用方法" tabindex="-1"><a class="header-anchor" href="#_5-18-iic-陀螺仪加速度计模块驱动使用方法" aria-hidden="true">#</a> 5.18 IIC 陀螺仪加速度计模块驱动使用方法</h2><p>本节介绍IIC 陀螺仪加速度计模块驱动的使用方法，最终实现通过IIC 陀螺仪加速度计模块采集X/Y/Z轴的加速度与角速度信息。</p><h3 id="_5-18-1-硬件接线" tabindex="-1"><a class="header-anchor" href="#_5-18-1-硬件接线" aria-hidden="true">#</a> 5.18.1 硬件接线</h3><p>将有IIC 陀螺仪加速度计模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“陀螺仪加速度计” 丝印的排母接口，如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image29.png" alt=""></p><h3 id="_5-18-2-stm32cubemx配置" tabindex="-1"><a class="header-anchor" href="#_5-18-2-stm32cubemx配置" aria-hidden="true">#</a> 5.18.2 STM32CubeMX配置</h3><p>陀螺仪使用I2C1通道，I2C1使用PB6、PB7作为SCL、SDA引脚，配置如下：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image30.png" alt=""></p><h3 id="_5-18-3-代码调用" tabindex="-1"><a class="header-anchor" href="#_5-18-3-代码调用" aria-hidden="true">#</a> 5.18.3 代码调用</h3><p>这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_mpu6050.c” 和 “Drivers/DShanMCU-F103/driver_mpu6050.h” 中。其中，<strong>MPU6050_Test</strong> 函数完成了IIC 陀螺仪加速度计模块的初始化与测试工作。</p><p><strong>MPU6050_Test</strong> 函数在 “Core/Src/freertos.c” 文件中被<strong>StartDefaultTask</strong> 函数调用。</p><p>打开 “Core/Src/freertos.c” 文件，将 <strong>StartDefaultTask</strong> 函数中的 <strong>MPU6050_Test</strong> 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">StartDefaultTask</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>argument<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
  <span class="token comment">/* USER CODE BEGIN StartDefaultTask */</span>
  <span class="token comment">/* Infinite loop */</span>
  <span class="token function">LCD_Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token function">LCD_Clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  
  <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span>
  <span class="token punctuation">{</span>
    <span class="token comment">//Led_Test();</span>
    <span class="token comment">//LCD_Test();</span>
    <span class="token function">MPU6050_Test</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span> 
    <span class="token comment">//DS18B20_Test();</span>
    <span class="token comment">//DHT11_Test();</span>
    <span class="token comment">//ActiveBuzzer_Test();</span>
    <span class="token comment">//PassiveBuzzer_Test();</span>
    <span class="token comment">//ColorLED_Test();</span>
    <span class="token comment">//IRReceiver_Test();</span>
    <span class="token comment">//IRSender_Test();</span>
    <span class="token comment">//LightSensor_Test();</span>
    <span class="token comment">//Obstacle_Test();</span>
    <span class="token comment">//SR04_Test();</span>
    <span class="token comment">//W25Q64_Test();</span>
    <span class="token comment">//RotaryEncoder_Test();</span>
    <span class="token comment">//Motor_Test();</span>
    <span class="token comment">//Key_Test();</span>
    <span class="token comment">//UART_Test();</span>
  <span class="token punctuation">}</span>
  <span class="token comment">/* USER CODE END StartDefaultTask */</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-18-4-上机实验" tabindex="-1"><a class="header-anchor" href="#_5-18-4-上机实验" aria-hidden="true">#</a> 5.18.4 上机实验</h3><p>会看到OLED屏幕上显示IIC 陀螺仪加速度计模块实时采集的X/Y/Z轴的加速度与角速度信息。</p><h2 id="_5-19-spi-flash模块驱动使用方法" tabindex="-1"><a class="header-anchor" href="#_5-19-spi-flash模块驱动使用方法" aria-hidden="true">#</a> 5.19 SPI FLASH模块驱动使用方法</h2><p>本节介绍SPI FLASH模块驱动的使用方法，最终实现通过SPI FLASH模块采集亮度信息。</p><h3 id="_5-19-1-硬件接线" tabindex="-1"><a class="header-anchor" href="#_5-19-1-硬件接线" aria-hidden="true">#</a> 5.19.1 硬件接线</h3><p>将有SPI FLASH模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“FLASH模块” 丝印的排母接口，如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image31.png" alt=""></p><h3 id="_5-19-2-stm32cubemx配置" tabindex="-1"><a class="header-anchor" href="#_5-19-2-stm32cubemx配置" aria-hidden="true">#</a> 5.19.2 STM32CubeMX配置</h3><p>SPI Flash模块使用SPI1通道，PA7作为SPI1_MOSI、PA5作为SPI1_SCK、PA6作为SPI1_MISO。另外使用PB9作为片选引脚。</p><p>SPI1配置如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image32.png" alt=""></p><p>PB9配置如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image33.png" alt=""></p><h3 id="_5-19-3-代码调用" tabindex="-1"><a class="header-anchor" href="#_5-19-3-代码调用" aria-hidden="true">#</a> 5.19.3 代码调用</h3><p>这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_spiflash_w25q64.c” 和 “Drivers/DShanMCU-F103/driver_spiflash_w25q64.h” 中。其中，<strong>W25Q64_Test</strong> 函数完成了SPI FLASH模块的初始化与测试工作。</p><p><strong>W25Q64_Test</strong> 函数在 “Core/Src/freertos.c” 文件中被<strong>StartDefaultTask</strong> 函数调用。</p><p>打开 “Core/Src/freertos.c” 文件，将 <strong>StartDefaultTask</strong> 函数中的 <strong>W25Q64_Test</strong> 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">StartDefaultTask</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>argument<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
  <span class="token comment">/* USER CODE BEGIN StartDefaultTask */</span>
  <span class="token comment">/* Infinite loop */</span>
  <span class="token function">LCD_Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token function">LCD_Clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  
  <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span>
  <span class="token punctuation">{</span>
    <span class="token comment">//Led_Test();</span>
    <span class="token comment">//LCD_Test();</span>
    <span class="token comment">//MPU6050_Test(); </span>
    <span class="token comment">//DS18B20_Test();</span>
    <span class="token comment">//DHT11_Test();</span>
    <span class="token comment">//ActiveBuzzer_Test();</span>
    <span class="token comment">//PassiveBuzzer_Test();</span>
    <span class="token comment">//ColorLED_Test();</span>
    <span class="token comment">//IRReceiver_Test();</span>
    <span class="token comment">//IRSender_Test();</span>
    <span class="token comment">//LightSensor_Test();</span>
    <span class="token comment">//Obstacle_Test();</span>
    <span class="token comment">//SR04_Test();</span>
    <span class="token function">W25Q64_Test</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">//RotaryEncoder_Test();</span>
    <span class="token comment">//Motor_Test();</span>
    <span class="token comment">//Key_Test();</span>
    <span class="token comment">//UART_Test();</span>
  <span class="token punctuation">}</span>
  <span class="token comment">/* USER CODE END StartDefaultTask */</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-19-4-上机实验" tabindex="-1"><a class="header-anchor" href="#_5-19-4-上机实验" aria-hidden="true">#</a> 5.19.4 上机实验</h3><p>会看到OLED屏幕上显示SPI FLASH模块的工作状态信息。</p><h2 id="_5-20-直流电机驱动使用方法" tabindex="-1"><a class="header-anchor" href="#_5-20-直流电机驱动使用方法" aria-hidden="true">#</a> 5.20 直流电机驱动使用方法</h2><p>本节介绍直流电机驱动的使用方法，最终实现通过直流电机驱动模块驱动直流电机。</p><h3 id="_5-20-1-硬件接线" tabindex="-1"><a class="header-anchor" href="#_5-20-1-硬件接线" aria-hidden="true">#</a> 5.20.1 硬件接线</h3><p>将有直流电机驱动模块接到配套的DShanMCU-F103 Base Board学习底板上即可，具体位置是印有“直流电机驱动模块板” 丝印的排母接口，如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image34.png" alt=""></p><h3 id="_5-20-2-stm32cubemx配置" tabindex="-1"><a class="header-anchor" href="#_5-20-2-stm32cubemx配置" aria-hidden="true">#</a> 5.20.2 STM32CubeMX配置</h3><p>直流电机驱动模块的通道A使用PA4、PA0来控制，这2个引脚没有PWM功能，所以只需要配置为输出即可。</p><p>通道B使用PB4、PB15来控制，PB4可以配置为PWM引脚（TM3_CHN1），PB15仍然配置为输出引脚。</p><p>这3个输出引脚配置如下：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image35.png" alt=""></p><p>PB4配置为PWM引脚（TM3_CHN1），如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-5/image36.png" alt=""></p><h3 id="_5-20-3-代码调用" tabindex="-1"><a class="header-anchor" href="#_5-20-3-代码调用" aria-hidden="true">#</a> 5.20.3 代码调用</h3><p>这里使用到的驱动以及测试代码位于 “Drivers/DShanMCU-F103/driver_motor.c” 和 “Drivers/DShanMCU-F103/driver_motor.h” 中。其中，<strong>Motor_Test</strong> 函数完成了直流电机驱动模块的初始化与测试工作。</p><p><strong>Motor_Test</strong> 函数在 “Core/Src/freertos.c” 文件中被<strong>StartDefaultTask</strong> 函数调用。</p><p>打开 “Core/Src/freertos.c” 文件，将<strong>StartDefaultTask</strong> 函数中的 <strong>Moto_Test</strong> 前面的注释去掉，并检查是否有其他函数未被注释(因为每个测试函数中都使用到死循环，所以每次只能运行位于最前面的测试项)，如下所示：</p><div class="language-c line-numbers-mode" data-ext="c"><pre class="language-c"><code><span class="token keyword">void</span> <span class="token function">StartDefaultTask</span><span class="token punctuation">(</span><span class="token keyword">void</span> <span class="token operator">*</span>argument<span class="token punctuation">)</span>
<span class="token punctuation">{</span>
  <span class="token comment">/* USER CODE BEGIN StartDefaultTask */</span>
  <span class="token comment">/* Infinite loop */</span>
  <span class="token function">LCD_Init</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  <span class="token function">LCD_Clear</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
  
  <span class="token keyword">for</span><span class="token punctuation">(</span><span class="token punctuation">;</span><span class="token punctuation">;</span><span class="token punctuation">)</span>
  <span class="token punctuation">{</span>
    <span class="token comment">//Led_Test();</span>
    <span class="token comment">//LCD_Test();</span>
    <span class="token comment">//MPU6050_Test(); </span>
    <span class="token comment">//DS18B20_Test();</span>
    <span class="token comment">//DHT11_Test();</span>
    <span class="token comment">//ActiveBuzzer_Test();</span>
    <span class="token comment">//PassiveBuzzer_Test();</span>
    <span class="token comment">//ColorLED_Test();</span>
    <span class="token comment">//IRReceiver_Test();</span>
    <span class="token comment">//IRSender_Test();</span>
    <span class="token comment">//LightSensor_Test();</span>
    <span class="token comment">//Obstacle_Test();</span>
    <span class="token comment">//SR04_Test();</span>
    <span class="token comment">//W25Q64_Test();</span>
    <span class="token comment">//RotaryEncoder_Test();</span>
    <span class="token function">Motor_Test</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token comment">//Key_Test();</span>
    <span class="token comment">//UART_Test();</span>
  <span class="token punctuation">}</span>
  <span class="token comment">/* USER CODE END StartDefaultTask */</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-20-4-上机实验" tabindex="-1"><a class="header-anchor" href="#_5-20-4-上机实验" aria-hidden="true">#</a> 5.20.4 上机实验</h3><p>会看到OLED屏幕上显示直流电机的工作状态信息。</p><h2 id="_5-21-步进电机驱动使用方法" tabindex="-1"><a class="header-anchor" href="#_5-21-步进电机驱动使用方法" aria-hidden="true">#</a> 5.21 步进电机驱动使用方法</h2>`,284),c=[i];function p(o,r){return s(),a("div",null,c)}const d=n(t,[["render",p],["__file","chapter5.html.vue"]]);export{d as default};
