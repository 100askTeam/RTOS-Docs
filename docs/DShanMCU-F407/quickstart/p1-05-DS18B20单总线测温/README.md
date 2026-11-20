---
title: 第 5 课：DS18B20 单总线测温
---

import KitExplorer from '@site/src/components/KitExplorer';

# 第 5 课：DS18B20 单总线测温

本课下载预编译固件 [`05_ds18b20_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/05_ds18b20_demo.zip)（解压得 `05_ds18b20_demo.hex`）并通过 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录，快速体验底板 **M2** 插座上 DS18B20 数字温度传感器的 1-Wire 12 位高精度测温（分辨率 `0.0625℃`）。

:::warning[实验前请拔除 M10 (DHT11)]
底板 **M2 (DS18B20)** 与右侧 **M10 (DHT11)** 共用单总线引脚 **`PC2`**！插着 M10 会下拉干扰 1-Wire 复位脉冲，请先拔除 M10 后再插接 M2。
:::

## 硬件准备与接线

<KitExplorer focus="m2" />

将 DS18B20 温度传感器模块插入底板 **M2** 插座：

| 模块引脚 | 底板 M2 插座 | STM32F407 引脚 | 说明 |
| --- | --- | --- | --- |
| `VCC` | `3.3V` | `3.3V` | 模块供电 |
| `GND` | `GND` | `GND` | 公共地 |
| `DQ` | `1-Wire` | **PC2** | 1-Wire 单总线数据线（开漏输出 + 上拉） |

## 下载并烧录体验固件

1. **下载并解压预编译固件**：点击下载 [`05_ds18b20_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/05_ds18b20_demo.zip)，解压得到 `05_ds18b20_demo.hex`；
2. **使用 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录**：按图选择 **`ST / STM32`** -> **`STM32F4`** -> 加载 `05_ds18b20_demo.hex` -> 点击 **`开始烧录`**：

![使用 DshanPI USBToolBox 烧录体验固件的步骤图解](../p1-00-认识实验套件/images/usbtoolbox-flash-steps.jpg)

> 如需查阅 `PC2` 微秒级 1-Wire 复位与读写时序代码，请见 **[5.9 DS18B20 温度模块驱动使用方法](../../chapter5.md#59-ds18b20温度模块驱动使用方法)**。
> 若使用 CMake 原生 FreeRTOS 工程编译修改源码，应用入口见 `applications/ds18b20_demo/src/main.c`，驱动代码见 `platform/modules/mod_ds18b20.c`（详见 [ds18b20_demo 源码解析](../../cmake/demos/d09-ds18b20/README.md) 与 [编译、烧录与调试](../../cmake/c02-build-flash-debug/README.md)）。

## 预期现象与串口日志

烧录并运行后（固件每 `1.2 秒` 采集一次，期间核心板 `LED1` 闪烁），观察 M1 OLED 与串口终端（`115200 8-N-1`）：

1. **M1 OLED 实时仪表盘**：顶部黄区显示 `M2` 徽章与 `DS18B20`，底部蓝区居中大字号显示实时温度（如 `26.31 °C`），中排显示 12 位完整精度 `12-bit: 26.312 C`，底排为 `0~50℃` 温度条；
2. **手感验证**：用手指捏住黑色 TO-92 封装的 DS18B20 温度探头，数秒内即可看到温度平稳攀升到 `30℃` 以上，精度变化至千分之一摄氏度；
3. **串口日志示例**：

```text
ds18b20_demo: M2 on PC2 (keep M10 DHT11 unplugged)
[DS18B20] temp=26.312 C
[DS18B20] temp=28.562 C
```

## 常见问题排查

| 现象 | 排查方向 |
| --- | --- |
| OLED 提示 `NO SENSOR / Unplug M10 DHT11`，串口打印 `read failed` | 1. 检查右侧 **M10（DHT11）** 是否忘记拔掉；<br/>2. 确认 M2 模块插紧，方向无误（切勿反插以免传感器发热损坏） |
| 读数短暂显示 `85.000 C` | `85℃` 是 DS18B20 内部暂存器上电默认值，通常下一个转换周期（`1.2 秒` 后）即更新为实际室温 |

---

[上一课：DHT11 温湿度采集](../p1-04-DHT11温湿度采集/README.md) · [下一课：HC-SR04 超声波测距](../p1-06-HC-SR04超声波测距/README.md) · [课程首页](../../README.md)
