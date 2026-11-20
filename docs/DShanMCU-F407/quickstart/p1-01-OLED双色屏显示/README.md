---
title: 第 1 课：OLED 双色屏显示
---

import KitExplorer from '@site/src/components/KitExplorer';

# 第 1 课：OLED 双色屏显示

本课下载预编译固件 [`01_oled_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/01_oled_demo.zip)（解压得 `01_oled_demo.hex`）并通过 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录，快速点亮底板 **M1** 插座上的 0.96 寸 128×64 黄蓝双色 OLED（SSD1306），展示分区仪表盘界面并自检核心板 1 MiB 外部 FSMC SRAM。

:::tip[建议全程保留 M1 OLED 在底板上]
**M1（OLED）与底板所有其他外设均无引脚冲突**：第 1 课插上验证后无需拔下，**第 2～14 课的体验固件也会自动联动这块屏幕实时显示传感器数值、状态徽章或进度条**，实验效果比只看串口日志更加直观。
:::

## 硬件准备与接线

<KitExplorer focus="m1" />

将 0.96 寸 OLED 模块（I2C 地址 `0x3C`，4 针接口）插入底板 **M1** 插座：

| 模块引脚 | 底板 M1 插座 | STM32F407 引脚 | 说明 |
| --- | --- | --- | --- |
| `VCC` | `3.3V` | `3.3V` | 模块供电 |
| `GND` | `GND` | `GND` | 公共地 |
| `SCL` | `I2C1_SCL` | **PB8** | I2C1 时钟 |
| `SDA` | `I2C1_SDA` | **PB9** | I2C1 数据 |

:::tip[可与第 7 课 MPU6050 共插共用 I2C1]
M1（OLED，地址 `0x3C`）与第 7 课的 M11（MPU6050，地址 `0x68`）共用 `I2C1 (PB8/PB9)` 总线，从机地址相互独立，**可同时插在底板上实现 2D 电子水平仪同屏联动**。
:::

## 下载并烧录体验固件

1. **下载并解压预编译固件**：点击下载 [`01_oled_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/01_oled_demo.zip)，解压得到 `01_oled_demo.hex`；
2. **使用 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录**：打开上位机，按图中 `①`～`⑥` 步骤烧录：

![使用 DshanPI USBToolBox 烧录体验固件的步骤图解](../p1-00-认识实验套件/images/usbtoolbox-flash-steps.jpg)

1. **① 确认设备授权连接**：连接好核心板与调试器，左下角显示绿色 **`DshanPI USBToolBox 已授权`**；
2. **② 打开 JTAG/SWD 工具**：点击左侧 **`JTAG/SWD 工具`**，保持在 **`固件烧录`** 页签；
3. **③ 选择芯片平台**：选择 **`ST / STM32`**；
4. **④ 选择目标配置**：选择 **`STM32F4`**（保持 `1 MHz`，勾选 **`烧录后运行`**）；
5. **⑤ 加载固件**：点击 **`选择文件`**，导入解压得到的 `01_oled_demo.hex`；
6. **⑥ 检测并烧录**：可先点 **`检测连接`**，再点击 **`开始烧录`**；校验完成后自动启动。

> 如需了解 CubeMX 配置 I2C1 及 SSD1306 驱动原理，请见 **[5.4 IIC OLED 屏驱动使用方法](../../chapter5.md#54-iic-oled屏驱动使用方法)**。
> 若使用 CMake 原生 FreeRTOS 工程编译修改源码，应用入口见 `applications/oled_demo/src/main.c`，驱动代码见 `platform/bsp/oled_ui.c`（详见 [oled_demo 源码解析](../../cmake/demos/d05-oled-demo/README.md) 与 [编译、烧录与调试](../../cmake/c02-build-flash-debug/README.md)）。

## 预期现象与串口日志

烧录完成后观察 M1 OLED 屏幕、核心板 LED 与 `DEBUG` Type-C 串口（`115200 8-N-1`）：

1. **OLED 仪表盘效果**：0.96 寸黄蓝双色屏以 5 Hz 频率流畅刷新：
   - **顶部黄区（上 16 行）**：左侧反白圆角徽章 **`M1`** + 标题 **`F407 OLED`** + 右上角 4 帧动态旋转指示器；
   - **底部蓝区（下 48 行）**：圆角卡片内部居中大字号显示 **`100ASK.NET`**，中排左右对齐显示 **`CM4F 168MHz`** 与 **`SRAM:1M`**（1 MB FSMC SRAM 快速自检通过结果），底排为往复平滑进度条与 **`MM:SS`** 实时计时；
2. **心跳灯**：核心板双 LED（`LED1 / PF9`、`LED2 / PF10`）每秒交替闪烁一次；
3. **串口日志示例**：

```text
oled_demo: SRAM=OK, probing M1 OLED (PB8/PB9 @ 0x3C)
display: ssd1306@3c 128x64 dashboard active (5 Hz)
[OLED] up=0s tick=0
[OLED] up=5s tick=25
```

## 常见问题排查

| 现象 | 排查方向 |
| --- | --- |
| 串口打印 `ERROR: M1 OLED display not ready (check M1 socket & 0x3C)` | 1. 确认 OLED 插在 **M1** 且 `GND/VCC/SCL/SDA` 顺序没有插反或错位；<br/>2. 若使用第三方 SSD1306 屏，确认背面 I2C 地址电阻设为 `0x3C`（而非 `0x3D`） |
| 屏幕全黑且串口无任何打印 | 确认固件烧录成功；按一次核心板 `RESET` 键或重新上电后重开串口 |
| 画面横向偏移或右边缘有花点 | 确认使用的是 0.96 寸 `SSD1306` 控制器屏幕（部分 1.3 寸 `SH1106` 列偏移不同） |

---

[上一篇：SWD 调试烧录硬件连接](../p1-00-SWD调试烧录硬件连接/README.md) · [下一课：RGB 全彩 LED 调色](../p1-02-RGB全彩LED调色/README.md) · [课程首页](../../README.md)
