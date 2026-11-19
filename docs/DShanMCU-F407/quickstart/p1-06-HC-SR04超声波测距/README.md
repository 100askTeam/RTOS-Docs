---
title: 第 6 课：HC-SR04 超声波测距
---

import KitExplorer from '@site/src/components/KitExplorer';

# 第 6 课：HC-SR04 超声波测距

本课下载预编译固件 [`06_hc_sr04_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/06_hc_sr04_demo.zip)（解压得 `06_hc_sr04_demo.hex`）并通过 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录，快速体验底板 **M6** 插座上的 HC-SR04 超声波测距模块，实时测量 `2～400 cm` 距离。

## 硬件准备与接线

<KitExplorer focus="m6" />

将 HC-SR04 超声波模块插入底板正下方的 **M6** 4 针母座（探头朝前下方外侧）：

| 模块引脚 | 底板 M6 插座 | STM32F407 引脚 | 说明 |
| --- | --- | --- | --- |
| `VCC` | `VCC_5V` | `5V` | **模块需 5V 供电，请务必插接核心板 Type-C 线** |
| `GND` | `GND` | `GND` | 公共地 |
| `Trig` | 触发信号 | **PE2** | 输出 `>= 10 us` 高电平脉冲启动测距 |
| `Echo` | 回响信号 | **PE4** | 根据高电平持续时间换算距离 |

:::tip[务必接入核心板 USB Type-C 提供 5V 供电]
HC-SR04 工作电源接在底板 **`VCC_5V`** 上。如果只连接 SWD 调试器的 `3.3V` 供电而未插核心板 Type-C 线，会导致 `VCC_5V` 无电、超声波不工作并提示 `no echo`。
:::

## 下载并烧录体验固件

1. **下载并解压预编译固件**：点击下载 [`06_hc_sr04_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/06_hc_sr04_demo.zip)，解压得到 `06_hc_sr04_demo.hex`；
2. **使用 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录**：按图选择 **`ST / STM32`** -> **`STM32F4`** -> 加载 `06_hc_sr04_demo.hex` -> 点击 **`开始烧录`**：

![使用 DshanPI USBToolBox 烧录体验固件的步骤图解](../p1-00-认识实验套件/images/usbtoolbox-flash-steps.jpg)

> 如需查阅 `PE2 / PE4` 时序驱动与测距公式代码，请见 **[5.11 超声波测距模块驱动使用方法](../../chapter5.md#511-超声波测距模块驱动使用方法)**。

## 预期现象与串口日志

烧录并运行后（固件每 `500 ms` 测距一次，核心板 `LED1` 同步闪烁），观察 M1 OLED 与串口终端（`115200 8-N-1`）：

1. **M1 OLED 实时测距仪表盘**：顶部黄区显示 `M6` 徽章与 `HC-SR04`，底部蓝区居中大字号实时显示厘米距离（如 `18.45cm`），下方绘制 `0cm ～ 100cm` 距离比例条；
2. **超出范围提示**：若前方遮挡过近（`< 2 cm`）、无平坦反射面或未插 `5V` 电源，OLED 显示 `OUT OF RANGE / Target 2 - 400 cm`；
3. **串口日志示例**：

```text
hc_sr04_demo: M6 Ultrasonic Trig=PE2 Echo=PE4
[HC-SR04] distance=18.45 cm
[HC-SR04] distance=12.30 cm
[HC-SR04] no echo (check M6 & 5V USB power)
```

## 常见问题排查

| 现象 | 排查方向 |
| --- | --- |
| 一直打印 `no echo`、OLED 显示 `OUT OF RANGE` | 1. 确认已连接核心板 **USB Type-C 线** 提供 `5V` 供电；<br/>2. 用平整物体（笔记本封面、手掌）正对超声波双探头距离 `10~50 cm` 测试（柔软衣物会吸收超声波导致回波过弱） |
| 近距离或倾斜角度测量跳变明显 | 超声波波束约 `15°` 夹角，斜对着墙角/桌面容易发生多次反射，保持遮挡物尽量正对探头即可稳定 |

---

[上一课：DS18B20 单总线测温](../p1-05-DS18B20单总线测温/README.md) · [下一课：MPU6050 六轴姿态采集](../p1-07-MPU6050六轴姿态采集/README.md) · [课程首页](../../README.md)
