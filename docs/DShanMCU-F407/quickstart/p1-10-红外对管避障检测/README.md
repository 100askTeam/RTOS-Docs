---
title: 第 10 课：红外对管避障检测
---

import KitExplorer from '@site/src/components/KitExplorer';

# 第 10 课：红外对管避障检测

本课下载预编译固件 [`10_ir_obstacle_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/10_ir_obstacle_demo.zip)（解压得 `10_ir_obstacle_demo.hex`）并通过 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录，快速体验底板左下方 **M5** 插座上的双灯头红外对管避障模块（LM393 比较器，遮挡输出低电平触发 `PC5 EXTI5`）。

## 硬件准备与接线

<KitExplorer focus="m5" />

将双灯头（透明发射管 + 黑色接收管并排）的红外对管避障模块插入底板左下角的 **M5** 插座：

| 模块引脚 | 底板 M5 插座 | STM32F407 引脚 | 说明 |
| --- | --- | --- | --- |
| `VCC` | `3.3V` | `3.3V` | 模块供电 |
| `GND` | `GND` | `GND` | 公共地 |
| `OUT (DO)` | `DO` | **PC5** (`EXTI5` 中断) | 无遮挡高电平；检测到近距反射障碍物输出低电平 |

:::tip[区分双管「M5 红外避障」与单头「M8 红外接收」]
套件里有两个外观带黑色接收管的红外类小板：
- **带发射+接收两颗灯珠、带蓝色十字电位器**的是 **红外避障模块** -> 插本课 **M5**（`PC5`）；
- **只有 1 颗黑色一体化接收头（VS1838B/HS0038）**的是 **红外接收模块** -> 用于下一课 **M8**（`PA6`）。
:::

## 下载并烧录体验固件

1. **下载并解压预编译固件**：点击下载 [`10_ir_obstacle_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/10_ir_obstacle_demo.zip)，解压得到 `10_ir_obstacle_demo.hex`；
2. **使用 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录**：按图选择 **`ST / STM32`** -> **`STM32F4`** -> 加载 `10_ir_obstacle_demo.hex` -> 点击 **`开始烧录`**：

![使用 DshanPI USBToolBox 烧录体验固件的步骤图解](../p1-00-认识实验套件/images/usbtoolbox-flash-steps.jpg)

> 如需查阅 `PC5` 引脚配置与驱动源码，请见 **[5.10 红外避障模块驱动使用方法](../../chapter5.md#510-红外避障模块驱动使用方法)**。

## 预期现象与串口日志

烧录并运行后，观察 M5 模块指示灯、核心板 `LED1`、M1 OLED 屏幕与串口终端（`115200 8-N-1`）：

1. **遮挡实时响应**：
   - 将手掌或白纸靠近 M5 双灯头前方几厘米时，M5 板载绿色信号灯与核心板 `LED1` 同时点亮，M1 OLED 中央框反白显示 **`DETECTED`**，右下角触发计数 **`Hits:001`** 递增；
   - 移开遮挡物后恢复白底线框 **`CLEAR`**；
2. **串口日志示例**：

```text
ir_obstacle_demo: M5 on PC5 EXTI5 (LOW = obstacle/IR pulse detected)
[OBSTACLE] CLEAR (hits=0)
[OBSTACLE] DETECTED (hits=1)
[OBSTACLE] CLEAR (hits=1)
```

## 常见问题排查

| 现象 | 排查方向 |
| --- | --- |
| 无人/物体靠近却长期卡在 `DETECTED` 一直亮 | 1. 用小螺丝刀逆时针微调 M5 模块上的**蓝色电位器**降低发射/比较灵敏度；<br/>2. 避免将模块正对桌面强反光物体或阳光直射（会误触发接收管） |
| 靠近很近才亮或完全不响应 | 顺时针适度调高蓝色电位器灵敏度；确认没有把 M8 接收头误插到了 M5 上 |

---

[上一课：旋转编码器与按键](../p1-09-旋转编码器与按键/README.md) · [下一课：红外发射与接收通信](../p1-11-红外发射与接收通信/README.md) · [课程首页](../../README.md)
