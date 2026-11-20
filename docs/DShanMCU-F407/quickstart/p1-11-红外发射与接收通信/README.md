---
title: 第 11 课：红外发射与接收通信
---

import KitExplorer from '@site/src/components/KitExplorer';

# 第 11 课：红外发射与接收通信

本课下载预编译固件 [`11_ir_tx_rx_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/11_ir_tx_rx_demo.zip)（解压得 `11_ir_tx_rx_demo.hex`）并通过 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录，同时打通底板右侧 **M8 红外接收模块**（`PA6 EXTI6`）与左侧 **M4 红外发射模块**（`PA7 TIM3_CH2` 38 kHz 载波），支持任意 NEC 红外遥控器按键解码与双模块本地漫反射自发自收。

:::danger[实验前务必确认已拔除 M9 蜂鸣器模块！]
底板左侧 **M4（红外发射）** 与右侧 **M9（蜂鸣器）** **共用引脚 `PA7`**！做本课实验前必须先把 M9 蜂鸣器从底板上拔除，避免通信冲突或蜂鸣器意外长鸣发烫。
:::

## 硬件准备与接线

<KitExplorer focus="ir_tx_rx" />

将 **1 颗透明红外发射管模块** 插入左侧 **M4** 插座，将 **仅含 1 颗黑色一体化接收头模块** 插入右侧 **M8** 插座：

| 模块与方向 | 底板插座 | STM32F407 引脚 | 说明 |
| --- | --- | --- | --- |
| `M4` 红外发射 | 左下侧 `M4` | **PA7** (`TIM3_CH2`) | 输出 `38 kHz` 调制的标准 NEC 编码波形 |
| `M8` 红外接收 | 右下侧 `M8` | **PA6** (`EXTI6` 双边沿) | 解析 `32-bit` NEC 地址与键码，并带错误插座诊断提示 |
| 供电与共地 | `3.3V / GND` | `3.3V / GND` | 两插座供电相互独立 |

## 下载并烧录体验固件

1. **下载并解压预编译固件**：点击下载 [`11_ir_tx_rx_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/11_ir_tx_rx_demo.zip)，解压得到 `11_ir_tx_rx_demo.hex`；
2. **使用 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录**：按图选择 **`ST / STM32`** -> **`STM32F4`** -> 加载 `11_ir_tx_rx_demo.hex` -> 点击 **`开始烧录`**：

![使用 DshanPI USBToolBox 烧录体验固件的步骤图解](../p1-00-认识实验套件/images/usbtoolbox-flash-steps.jpg)

> 如需查阅 `PA6 EXTI6` 解码逻辑与 `PA7 TIM3_CH2 38kHz` 调制驱动源码，请见 **[5.13 红外接收驱动](../../chapter5.md#513-红外接收模块驱动使用方法)** 与 **[5.14 红外发射驱动](../../chapter5.md#514-红外发射模块驱动使用方法)**。
> 若使用 CMake 原生 FreeRTOS 工程编译修改源码，应用入口见 `applications/ir_tx_rx_demo/src/main.c`，驱动代码见 `platform/modules/mod_ir.c`（详见 [ir_tx_rx_demo 源码解析](../../cmake/demos/d15-ir-tx-rx/README.md) 与 [编译、烧录与调试](../../cmake/c02-build-flash-debug/README.md)）。

## 预期现象与串口日志

本固件支持两种体验方式，均可在 M1 OLED 与串口终端（`115200 8-N-1`）实时看到解码过程：

1. **方式一：直接用红外遥控器测试 `M8` 接收（上电默认状态）**：
   - 上电默认暂停 M4 自动发射（M1 OLED 显示 `Press Remote -> M8` 与 `M4 TX:PAUSED K1:On`），以免空发射盲扫抑制 AGC；
   - 拿起常见电视/空调/套件配带 NEC 红外遥控器对准 **M8** 按键，M1 OLED 立刻大字号显示键值名称（如 `POWER 45`、`OK 1C`、`CMD 0x10`），底部显示地址 `ADR:...` 与接收次数 `RX:...`；
2. **方式二：`M4 -> M8` 自发自收漫反射测试**：
   - 按一下底板 **`K1 (PB1)`** 或核心板 **`KEY0 (PE3)`** 启动 M4 自动定时发射（每 `450 ms` 发送一次地址 `0x0022` 指令）；
   - 将一张白纸或手掌放在底板正上方约 `8 cm` 处（让左侧 M4 发出的红外线漫反射进右侧 M8），M1 OLED 立即刷新 **`PING 10` / `VOL+ 11` / `VOL- 12`**、`ADR:0022` 以及同步累计的 `TX` / `RX` 计数；再按 `K1` 可暂停发射；
3. **内置诊断防错提醒**：若误将接收头插到了 `M4(PA7)` / `M5(PC5)` / `M2(PC2)`，屏幕会自动告警提示 `WRONG SOCKET / Pulse on M5(PC5) / Need M8 -> PA6`；
4. **串口日志示例**：

```text
ir_tx_rx_demo: M8(PA6) RX + M4(PA7) TX [DIAGNOSTIC MODE]
[IR-DIAG] Ready! Idle levels: PA6(M8)=1 PA7(M4)=1 PC5(M5)=1 PC2(M2/10)=1
[IR TX] M4 auto-TX ENABLED (press K1/KEY0 to toggle)
[IR RX #1] addr=0x0022 cmd=0x10 (PING) raw=0xEF10DF22
[IR RX #2] addr=0x0022 cmd=0x11 (VOL+) raw=0xEE11DF22
```

## 常见问题排查

| 现象 | 排查方向 |
| --- | --- |
| 开启 `M4` 自发后收不到反射信号 | 1. 确认白纸/手掌放在核心板正上方约 `5~10 cm` 倾角漫反射（M4/M8 均朝斜外侧安装，不遮反射面很难直接射入）；<br/>2. 检查右侧 **M9 蜂鸣器** 是否已拔下 |
| 按遥控器屏幕显示 `WRONG SOCKET` | 检查红外接收头是否错插到其他插座，必须插在 **M8** |

---

[上一课：红外对管避障检测](../p1-10-红外对管避障检测/README.md) · [下一课：W25Q64 外部 Flash 读写](../p1-12-W25Q64外部Flash读写/README.md) · [课程首页](../../README.md)
