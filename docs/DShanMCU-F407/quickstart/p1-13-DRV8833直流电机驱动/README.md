---
title: 第 13 课：DRV8833 直流电机驱动
---

import KitExplorer from '@site/src/components/KitExplorer';

# 第 13 课：DRV8833 直流电机驱动

本课下载预编译固件 [`13_motor_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/13_motor_demo.zip)（解压得 `13_motor_demo.hex`）并通过 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录，快速体验底板右内侧 **M14（红色 DRV8833 双通道直流电机驱动板）** 及紧邻 4 针排针 **J5 (`Motor`)** 的正反转与多档 PWM 调速控制。

## 硬件准备与接线

<KitExplorer focus="motor" />

### 1. 确认红色驱动板 `M14` 插接方向
正面看底板时，将红色 **`DRV8833`** 驱动小板插入右下内圈双排母 **`M14`**，小板正面的**黄色大块贴片电容（`106C`）应朝下**（靠近 `M8` 方向），切勿倒插。

### 2. 两线直流小马达接在 `J5`（丝印 `Motor`）的哪两针？
紧挨着红色 **`M14`** 模块右侧的 4 针排针即 **`J5`**，**正面看底板从上到下** 丝印与功能如下：

| `J5` 排针位置（从上到下） | 板载丝印 | 控制引脚 | 功能与推荐程度 |
| --- | --- | --- | --- |
| **第 1 针（最上面）** | **`BO1`** | **通道 B**：`PE5 (TIM9_CH1 PWM)` + `PF2` | **推荐优先接最上面两针（`BO1 + BO2`）！支持 `+50% / +85%` 正反转多档调速** |
| **第 2 针** | **`BO2`** | 通道 B 输出 | 与 `BO1` 成对接 1 个 2 线直流小马达（**不分正负**，接反仅转向对调） |
| **第 3 针** | **`AO2`** | **通道 A**：`PF1 / PF0` (普通 GPIO) | 与 `AO1` 成对接直流电机，仅支持**全速正转 / 全速反转 / 停止**（无 PWM 调速档位） |
| **第 4 针（最下面）** | **`AO1`** | 通道 A 输出 | — |

:::tip[务必接核心板 USB Type-C 提供 5V 供电]
`M14` 驱动芯片 `DRV8833` 的电机供电 `VM` 与使能脚 `STBY` 接在底板 **`VCC_5V`** 上！如果只连接 SWD 4 针线供 `3.3V`，电机会完全不转，请务必插好核心板 `DEBUG`（或 `OTG`）Type-C 数据线提供 `5V` 供电。
:::

## 下载并烧录体验固件

1. **下载并解压预编译固件**：点击下载 [`13_motor_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/13_motor_demo.zip)，解压得到 `13_motor_demo.hex`；
2. **使用 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录**：按图选择 **`ST / STM32`** -> **`STM32F4`** -> 加载 `13_motor_demo.hex` -> 点击 **`开始烧录`**：

![使用 DshanPI USBToolBox 烧录体验固件的步骤图解](../p1-00-认识实验套件/images/usbtoolbox-flash-steps.jpg)

> 注：由于 `M14` 占用了 `PF0~PF2`（与核心板 FSMC 外部 SRAM 地址线 `A0~A2` 复用），本体验固件已主动跳过 FSMC 初始化，避免引脚冲突。详细源码解析见 **[5.19 直流电机驱动使用方法](../../chapter5.md#519-直流电机驱动使用方法)**。

## 预期现象与串口日志

烧录并运行后，观察电机运转、M1 OLED 屏幕、核心板 LED 与串口终端（`115200 8-N-1`）：

1. **自动循环多档调速与换向**：固件循环执行 6 个阶段：`STOP (Coast)` (1.2s) -> **`FWD +50%`** (2s) -> **`FWD +85%`** (2s) -> `BRAKE / STOP` (1.2s) -> **`REV -50%`** (2s) -> **`REV -85%`** (2s)；正转时 `LED1` 亮，反转时 `LED2` 亮；
2. **一键急停暂停/恢复**：随时按下底板 **`K1 (PB1)`** 或核心板 **`KEY0 (PE3)`** 可立即停转并保持 `PAUSED`（M1 OLED 显示 `MOTOR [PAUSED]`）；再按一次立即恢复运行；
3. **OLED 与串口日志示例**：

```text
motor_demo: M14 DRV8833 (AO1/AO2 & BO1/BO2), press K1/KEY0 to pause/resume
[MOTOR] STOP (Coast) (duty=+0%)
[MOTOR] FWD  +50% (duty=+50%)
[MOTOR] FWD  +85% (duty=+85%)
[MOTOR] REV  -50% (duty=-50%)
[MOTOR] pause=ON
```

## 常见问题排查

| 现象 | 排查方向 |
| --- | --- |
| OLED 数值在正常跳变、LED 也正常亮，但电机完全不转 | 1. 优先确认是否插上核心板 **USB Type-C 线**（必须给底板 `VCC_5V` 供电）；<br/>2. 检查 2 根电机线是否同接在了 `BO1+BO2`（或 `AO1+AO2`）上，切勿一根插 `B` 一根插 `A` |
| 感觉 `50%` 和 `85%` 转速一样最快 | 可能插到了下两针 `AO2 + AO1`（通道 A 硬件上为普通 GPIO，无 PWM 调速）；换到**最上面两针 `BO1 + BO2`**（通道 B）即可看到清晰的快慢调速对比 |

---

[上一课：W25Q64 外部 Flash 读写](../p1-12-W25Q64外部Flash读写/README.md) · [下一课：SG90 舵机角度控制](../p1-14-SG90舵机角度控制/README.md) · [课程首页](../../README.md)
