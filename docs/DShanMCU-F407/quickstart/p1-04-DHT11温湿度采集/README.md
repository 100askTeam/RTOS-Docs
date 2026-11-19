---
title: 第 4 课：DHT11 温湿度采集
---

import KitExplorer from '@site/src/components/KitExplorer';

# 第 4 课：DHT11 温湿度采集

本课下载预编译固件 [`04_dht11_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/04_dht11_demo.zip)（解压得 `04_dht11_demo.hex`）并通过 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录，快速体验底板 **M10** 插座上 DHT11 模块的单总线温湿度采集。

:::warning[实验前请拔除 M2 (DS18B20)]
底板 **M10 (DHT11)** 与左侧 **M2 (DS18B20)** 共用单总线引脚 **`PC2`**！插着 M2 时会干扰 PC2 电平握手，实验前请先拔除 M2 模块。
:::

## 硬件准备与接线

<KitExplorer focus="m10" />

将 DHT11 温湿度传感器模块（蓝色外壳，3 针接口）插入底板 **M10** 插座（`3.3V` 供电）：

| 模块引脚 | 底板 M10 插座 | STM32F407 引脚 | 说明 |
| --- | --- | --- | --- |
| `VCC` | `3.3V` | `3.3V` | 模块供电 |
| `GND` | `GND` | `GND` | 公共地 |
| `DATA` | `1-Wire` | **PC2** | 单总线双向通信（内部上拉 + 开漏输出） |

## 下载并烧录体验固件

1. **下载并解压预编译固件**：点击下载 [`04_dht11_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/04_dht11_demo.zip)，解压得到 `04_dht11_demo.hex`；
2. **使用 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录**：按图选择 **`ST / STM32`** -> **`STM32F4`** -> 加载 `04_dht11_demo.hex` -> 点击 **`开始烧录`**：

![使用 DshanPI USBToolBox 烧录体验固件的步骤图解](../p1-00-认识实验套件/images/usbtoolbox-flash-steps.jpg)

> 如需查阅 `PC2` 开漏单总线与微秒级时序读取源码，请见 **[5.8 DHT11 温湿度模块驱动使用方法](../../chapter5.md#58-dht11温湿度模块驱动使用方法)**。

## 预期现象与串口日志

烧录并运行后（固件每 `2 秒` 采样一次，期间核心板 `LED1` 闪烁），观察 M1 OLED 与串口终端（`115200 8-N-1`）：

1. **M1 OLED 双卡片仪表盘**：顶部黄区显示 `M10` 徽章与 `DHT11 ENV`；底部蓝区左右分栏显示 **`TEMP °C`**（`0~50℃` 量程进度条）与 **`HUMI %RH`**（`0~100%` 湿度条）。用手指轻捏或对着模块哈一口气，约 `2~4 秒` 内即可看到温度和湿度明显升高；
2. **串口日志示例**：

```text
dht11_demo: M10 on PC2 (keep M2 DS18B20 unplugged)
[DHT11] temp=24.6 C, RH=46.0 %
[DHT11] temp=25.2 C, RH=58.0 %
```

## 常见问题排查

| 现象 | 排查方向 |
| --- | --- |
| OLED 提示 `READ FAILED / Unplug M2 DS18B20`，串口打印 `read failed` | 1. 优先检查左侧 **M2（DS18B20）** 是否仍插在底板上；<br/>2. 检查 M10 排针接触是否牢靠、方向未反 |
| 刚上电头 1～2 秒数值未立即刷新 | DHT11 上电后需约 1～2 秒稳定期，OLED 会先显示 `Sampling DHT11... Wait 2s`，随后自动恢复正常读数 |

---

[上一课：有源/无源蜂鸣器](../p1-03-有源无源蜂鸣器/README.md) · [下一课：DS18B20 单总线测温](../p1-05-DS18B20单总线测温/README.md) · [课程首页](../../README.md)
