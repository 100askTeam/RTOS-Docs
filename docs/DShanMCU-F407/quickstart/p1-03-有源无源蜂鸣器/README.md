---
title: 第 3 课：有源/无源蜂鸣器
---

import KitExplorer from '@site/src/components/KitExplorer';

# 第 3 课：有源/无源蜂鸣器

本课下载预编译固件 [`03_buzzer_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/03_buzzer_demo.zip)（解压得 `03_buzzer_demo.hex`）并通过 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录，快速体验底板 **M9** 插座上的无源/有源蜂鸣器驱动，利用 `PA7 (TIM3_CH2)` 输出三段变频提示音并支持一键静音。

:::danger[实验前务必确认已拔除 M4 红外发射模块！]
底板 **M9（蜂鸣器）** 与左侧 **M4（红外发射管）** **共用同一引脚 `PA7`**！
如果两者同时插在底板上，M4 红外灯珠回路会将 `PA7` 对地拉低，导致低电平触发的蜂鸣器模块在 MCU 静音或空闲时仍**持续微导通并出现明显发热**。请务必先拔下 **M4** 后再插接 **M9**！
:::

## 硬件准备与接线

<KitExplorer focus="m9" />

将有源或无源蜂鸣器模块（3 针低电平有效，背面可见绿色 PCB 为无源蜂鸣器，背面灌封黑胶为有源蜂鸣器）插入底板 **M9** 插座：

| 模块引脚 | 底板 M9 插座 | STM32F407 引脚 | 说明 |
| --- | --- | --- | --- |
| `VCC` | `3.3V` | `3.3V` | 模块供电 |
| `GND` | `GND` | `GND` | 公共地 |
| `I/O` | `PWM / IO` | **PA7** (`TIM3_CH2`) | 无源需不同频率 PWM 驱动，有源拉低即可长鸣 |

## 下载并烧录体验固件

1. **下载并解压预编译固件**：点击下载 [`03_buzzer_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/03_buzzer_demo.zip)，解压得到 `03_buzzer_demo.hex`；
2. **使用 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录**：按图选择 **`ST / STM32`** -> **`STM32F4`** -> 加载 `03_buzzer_demo.hex` -> 点击 **`开始烧录`**：

![使用 DshanPI USBToolBox 烧录体验固件的步骤图解](../p1-00-认识实验套件/images/usbtoolbox-flash-steps.jpg)

> 如需查阅无源与有源蜂鸣器两种独立工程配置与驱动源码，请见 **[5.6 有源蜂鸣器驱动](../../chapter5.md#56-有源蜂鸣器模块驱动使用方法)** 与 **[5.7 无源蜂鸣器驱动](../../chapter5.md#57-无源蜂鸣器模块驱动使用方法)**。

## 预期现象与串口日志

烧录并运行后，观察蜂鸣器发声、M1 OLED 屏幕与串口终端（`115200 8-N-1`）：

1. **变频提示音循环**：固件连续输出低/中/高三音节（`2000 Hz` 150 ms -> `2500 Hz` 150 ms -> `3000 Hz` 350 ms，期间核心板 `LED1` 点亮），随后静默休息 `2 s`（期间关闭 `PA7` 设为高阻态防发热），循环往复；
2. **按键静音开关**：按下底板 **`K1 (PB1)`** 或核心板 **`KEY0 (PE3)`**，可随时切换静音（M1 OLED 顶部切换为 `BUZZER [MUTE]`，中间大字号显示 `MUTED`）；再按一次立即恢复发声；
3. **OLED 与串口输出示例**：

```text
buzzer_demo: M9 on PA7 TIM3_CH2 (press K1/KEY0 to mute)
[BUZZER] pattern #1
[BUZZER] pattern #2
[BUZZER] mute=ON
[BUZZER] mute=OFF
```

## 常见问题排查

| 现象 | 排查方向 |
| --- | --- |
| 蜂鸣器发烫或不响的时候仍有微弱“滋滋”电流声 | 立即检查左侧 **M4 红外发射模块** 是否忘拔！拔掉 M4 即可彻底断开下拉回路 |
| 有源蜂鸣器听起来音调都一样 | 有源蜂鸣器内部自带固定频率振荡源，三声响声均同音属正常现象；换用背面带绿色 PCB 的无源蜂鸣器可听出低/中/高三种音调 |
| 确认插对且未静音却完全不响 | 检查 M9 3 针排母顺序（`VCC/GND/IO` 切勿反插）；可按一下 `K1` 确认没有误触静音状态 |

---

[上一课：RGB 全彩 LED 调色](../p1-02-RGB全彩LED调色/README.md) · [下一课：DHT11 温湿度采集](../p1-04-DHT11温湿度采集/README.md) · [课程首页](../../README.md)
