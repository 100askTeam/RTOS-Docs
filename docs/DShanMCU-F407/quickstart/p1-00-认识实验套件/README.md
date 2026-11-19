---
title: 认识实验套件与固件汇总
---

import KitExplorer from '@site/src/components/KitExplorer';

# 认识实验套件与固件汇总

先通过下方交互式底板图认识 DshanMCU-F407 核心板（STM32F407ZGT6）及底板各插座布局与引脚冲突；本阶段无需安装 STM32CubeMX 或 Keil，接好 [SWD 调试烧录硬件连接](../p1-00-SWD调试烧录硬件连接/README.md) 后，下载预编译 `.hex` 固件配合 DshanPI USBToolBox 即可一键烧录体验。

<KitExplorer mode="explorer" />

## 引脚复用与互斥插拔总表

底板将多个外设插座集中引出至同一颗 STM32F407ZGT6 核心板，少数插座共用了相同的 MCU 引脚，切换实验模块时请按下方关系插拔：

| 涉及插座 | 共用引脚 | 关系 | 处理方式 |
| --- | --- | --- | --- |
| M4 红外发射 / M9 蜂鸣器 | `PA7` (`TIM3_CH2`) | **严禁同插** | 做第 11 课前拔掉 M9；做第 3 课前拔掉 M4（否则 M4 会拉低 PA7 导致蜂鸣器持续通电发热） |
| M10 DHT11 / M2 DS18B20 | `PC2`（单总线） | **不可同插** | 做第 4 课（DHT11）前拔掉 M2；做第 5 课（DS18B20）前拔掉 M10 |
| M3 RGB 全彩 LED / J6–J8 舵机 | `PA5 / PA1 / PA2` | **不可同插** | 做第 2 课（RGB 调色）时勿接舵机；做第 14 课（舵机）前先拔掉 M3 全彩 LED |
| M14 + J5 直流电机 / 核心板 SRAM | `PF0 / PF1 / PF2` | **软件避让** | 第 13 课固件 `13_motor_demo.hex` 已自动跳过 FSMC SRAM 初始化，直接使用即可 |
| M1 OLED / M11 MPU6050 | `PB8 / PB9` (`I2C1`) | **总线共存** | 从机地址独立（`0x3C` / `0x68`），可同时插在底板上实现 2D 电子水平仪联动 |

:::tip[建议常驻保留 M1 OLED]
M1（0.96 寸 OLED）与底板所有其他外设均无引脚冲突：第 1 课点亮后可全程保留在底板上，第 2～14 课固件都会同步刷新该屏幕显示实时状态；未接屏幕时固件也会自动降级为仅串口输出。
:::

## 预编译体验固件汇总（14 课）

:::info[全套打包下载]
可一次性下载全套合集 [00_f407_firmware_all.zip](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/00_f407_firmware_all.zip)（或访问 [预编译固件下载目录](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/) 统一获取）。下载 `.zip` 压缩包后请先解压出内部的 `.hex` 文件，再在 DshanPI USBToolBox 中选择 `.hex` 烧录。
:::

| 体验课程 | 插座 | 预编译固件 | CubeMX 源码参考 |
| --- | --- | --- | --- |
| [第 1 课：OLED 双色屏显示](../p1-01-OLED双色屏显示/README.md) | M1 | [01_oled_demo.zip](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/01_oled_demo.zip) | [5.4 IIC OLED 屏](../../chapter5.md#54-iic-oled屏驱动使用方法) |
| [第 2 课：RGB 全彩 LED 调色](../p1-02-RGB全彩LED调色/README.md) | M3 | [02_rgb_led_demo.zip](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/02_rgb_led_demo.zip) | [5.15 RGB 全彩 LED](../../chapter5.md#515-rgb全彩led模块驱动使用方法) |
| [第 3 课：有源/无源蜂鸣器](../p1-03-有源无源蜂鸣器/README.md) | M9 | [03_buzzer_demo.zip](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/03_buzzer_demo.zip) | [5.6 / 5.7 蜂鸣器](../../chapter5.md#57-无源蜂鸣器模块驱动使用方法) |
| [第 4 课：DHT11 温湿度采集](../p1-04-DHT11温湿度采集/README.md) | M10 | [04_dht11_demo.zip](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/04_dht11_demo.zip) | [5.8 DHT11 温湿度](../../chapter5.md#58-dht11温湿度模块驱动使用方法) |
| [第 5 课：DS18B20 单总线测温](../p1-05-DS18B20单总线测温/README.md) | M2 | [05_ds18b20_demo.zip](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/05_ds18b20_demo.zip) | [5.9 DS18B20 温度](../../chapter5.md#59-ds18b20温度模块驱动使用方法) |
| [第 6 课：HC-SR04 超声波测距](../p1-06-HC-SR04超声波测距/README.md) | M6 | [06_hc_sr04_demo.zip](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/06_hc_sr04_demo.zip) | [5.11 超声波测距](../../chapter5.md#511-超声波测距模块驱动使用方法) |
| [第 7 课：MPU6050 六轴姿态采集](../p1-07-MPU6050六轴姿态采集/README.md) | M11 | [07_mpu6050_demo.zip](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/07_mpu6050_demo.zip) | [5.17 MPU6050 驱动](../../chapter5.md#517-iic-陀螺仪加速度计模块驱动使用方法) |
| [第 8 课：光敏电阻亮度采集](../p1-08-光敏电阻亮度采集/README.md) | M7 | [08_light_sensor_demo.zip](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/08_light_sensor_demo.zip) | [5.16 光敏电阻](../../chapter5.md#516-光敏电阻模块驱动使用方法) |
| [第 9 课：旋转编码器与按键](../p1-09-旋转编码器与按键/README.md) | M13 | [09_rotary_encoder_demo.zip](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/09_rotary_encoder_demo.zip) | [5.12 旋转编码器](../../chapter5.md#512-旋转编码器模块驱动使用方法) |
| [第 10 课：红外对管避障检测](../p1-10-红外对管避障检测/README.md) | M5 | [10_ir_obstacle_demo.zip](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/10_ir_obstacle_demo.zip) | [5.10 红外避障](../../chapter5.md#510-红外避障模块驱动使用方法) |
| [第 11 课：红外发射与接收通信](../p1-11-红外发射与接收通信/README.md) | M4 + M8 | [11_ir_tx_rx_demo.zip](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/11_ir_tx_rx_demo.zip) | [5.13 / 5.14 红外收发](../../chapter5.md#514-红外发射模块驱动使用方法) |
| [第 12 课：W25Q64 外部 Flash 读写](../p1-12-W25Q64外部Flash读写/README.md) | M12 | [12_w25q64_demo.zip](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/12_w25q64_demo.zip) | [5.18 SPI Flash](../../chapter5.md#518-spi-flash模块驱动使用方法) |
| [第 13 课：DRV8833 直流电机驱动](../p1-13-DRV8833直流电机驱动/README.md) | M14 + J5 | [13_motor_demo.zip](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/13_motor_demo.zip) | [5.19 直流电机](../../chapter5.md#519-直流电机驱动使用方法) |
| [第 14 课：SG90 舵机角度控制](../p1-14-SG90舵机角度控制/README.md) | J6–J8 | [14_servo_demo.zip](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/14_servo_demo.zip) | [5.15 TIM2 PWM 参考](../../chapter5.md#515-rgb全彩led模块驱动使用方法) |

## 使用 USBToolBox 烧录固件

首次使用请先按 [SWD 调试烧录硬件连接](../p1-00-SWD调试烧录硬件连接/README.md) 完成调试器接线、`DEBUG` Type-C 供电与驱动安装，再打开 [DshanPI USBToolBox](https://dl.100ask.net/Tools/usbtoolsbox/) 按图中 `①`～`⑥` 步骤烧录 `.hex` 固件：

![使用 DshanPI USBToolBox 烧录 F407 体验固件的步骤图解](./images/usbtoolbox-flash-steps.jpg)

1. **① 确认设备连接**：软件左下角显示绿色「DshanPI USBToolBox 已授权」；
2. **② 进入烧录页面**：左侧点击「JTAG/SWD 工具」，顶部保持在「固件烧录」页签；
3. **③ 选择芯片平台**：下拉选择 `ST / STM32`；
4. **④ 选择目标配置**：下拉选择 `STM32F4`（保持 SWD 模式与 `1 MHz`，勾选「烧录后运行」）；
5. **⑤ 导入固件文件**：点击「选择文件」，导入解压得到的 `.hex` 文件（`.hex` 自带 `0x08000000` 起始地址，无需手填）；
6. **⑥ 检测并烧录**：可先点「检测连接」确认出现 `SWD DPIDR 0x2ba01477` 与 `Examination succeed`，再点击「开始烧录」，校验完成后会自动复位运行。

---

[上一篇：DShanMCU-F407 · FreeRTOS](../../README.md) · [下一篇：SWD 调试烧录硬件连接](../p1-00-SWD调试烧录硬件连接/README.md) · [直接开始第 1 课](../p1-01-OLED双色屏显示/README.md)
