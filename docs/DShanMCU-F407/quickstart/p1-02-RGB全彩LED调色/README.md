---
title: 第 2 课：RGB 全彩 LED 调色
---

import KitExplorer from '@site/src/components/KitExplorer';

# 第 2 课：RGB 全彩 LED 调色

本课下载预编译固件 [`02_rgb_led_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/02_rgb_led_demo.zip)（解压得 `02_rgb_led_demo.hex`）并通过 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录，快速体验底板 **M3** 插座上的共阳极 RGB 全彩 LED 模块，利用 `TIM2` 三路 PWM 混色自动轮换 8 种颜色并支持按键手动切色。

## 硬件准备与接线

<KitExplorer focus="m3" />

将 RGB 全彩 LED 模块插入底板 **M3** 插座（3.3V 共阳极，PWM 占空比越高对应颜色越亮）：

| 模块信号 | 底板 M3 插座 | STM32F407 引脚 | 定时器通道 |
| --- | --- | --- | --- |
| `VCC / GND` | `3.3V / GND` | `3.3V / GND` | 供电与共地 |
| `G`（绿） | M3-G | **PA5** | `TIM2_CH1` |
| `B`（蓝） | M3-B | **PA1** | `TIM2_CH2` |
| `R`（红） | M3-R | **PA2** | `TIM2_CH3` |

:::warning[与舵机接口 J6 / J7 / J8 共用引脚]
**M3** 与底板内侧的 **J6 / J7 / J8（舵机 1~3）** 共用 `PA5 / PA1 / PA2 (TIM2_CH1~3)`。测试 RGB 全彩 LED 时请确保 **J6～J8 上未接舵机**。
:::

## 下载并烧录体验固件

1. **下载并解压预编译固件**：点击下载 [`02_rgb_led_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/02_rgb_led_demo.zip)，解压得到 `02_rgb_led_demo.hex`；
2. **使用 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录**：按图选择 **`ST / STM32`** -> **`STM32F4`** -> 加载 `02_rgb_led_demo.hex` -> 点击 **`开始烧录`**：

![使用 DshanPI USBToolBox 烧录体验固件的步骤图解](../p1-00-认识实验套件/images/usbtoolbox-flash-steps.jpg)

> 如需查阅 `TIM2` 三通道 PWM 参数与驱动代码解析，请见 **[5.15 RGB 全彩 LED 模块驱动使用方法](../../chapter5.md#515-rgb全彩led模块驱动使用方法)**。

## 预期现象与串口日志

烧录并运行后，观察底板 M3 LED、M1 OLED 屏幕与串口终端（`115200 8-N-1`）：

1. **自动循环混色**：M3 模块每秒自动切换一次颜色，顺序为 `RED` -> `GREEN` -> `BLUE` -> `YELLOW` -> `CYAN` -> `MAGENTA` -> `WHITE` -> `OFF`；每次切色核心板 `LED1` 翻转一次；
2. **按键手动切色**：按下底板 **`K1 (PB1)`** 或核心板 **`KEY0 (PE3)`**，会切换为手动步进模式（M1 OLED 顶部标题由 `RGB PWM LED` 变为 `RGB [MANUAL]`），每按一次切换下一组配色；
3. **M1 OLED 联动仪表盘**：大字号居中显示当前颜色英文名（如 `CYAN`），下方分别绘制 `R`、`G`、`B` 三行百分比进度条；
4. **串口日志示例**：

```text
rgb_led_demo: M3 TIM2 PWM (PA2=R, PA5=G, PA1=B), press K1/KEY0 to step
[RGB] color=RED     (R=100% G=0% B=0%) mode=AUTO
[RGB] color=GREEN   (R=0% G=100% B=0%) mode=AUTO
[RGB] color=BLUE    (R=0% G=0% B=100%) mode=AUTO
[RGB] color=YELLOW  (R=100% G=100% B=0%) mode=MANUAL
```

## 常见问题排查

| 现象 | 排查方向 |
| --- | --- |
| 只亮一两种颜色或某色常灭 | 检查 M3 模块排针是否插满插紧，不要出现错位一针 |
| 颜色异常昏暗或伴随异常抖动 | 确认 `J6 / J7 / J8` 没有同时插接舵机拉低 PWM 引脚电平 |
| OLED 提示 `RGB [MANUAL]` 后不再自动变色 | 属正常设计（按下 `K1` 或 `KEY0` 后进入手动步进调试模式），按一次核心板 `RESET` 键即可恢复 `AUTO` 自动轮播 |

---

[上一课：OLED 双色屏显示](../p1-01-OLED双色屏显示/README.md) · [下一课：有源/无源蜂鸣器](../p1-03-有源无源蜂鸣器/README.md) · [课程首页](../../README.md)
