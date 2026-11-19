---
title: 第 7 课：MPU6050 六轴姿态采集
---

import KitExplorer from '@site/src/components/KitExplorer';

# 第 7 课：MPU6050 六轴姿态采集

本课下载预编译固件 [`07_mpu6050_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/07_mpu6050_demo.zip)（解压得 `07_mpu6050_demo.hex`）并通过 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录，快速体验底板 **M11** 插座上 MPU6050 模块的三轴加速度 + 三轴角速度采集，并与 **M1 OLED** 同屏联动绘制 **2D 电子水平仪**。

## 硬件准备与接线

<KitExplorer focus="m11" />

将 MPU6050 模块插入底板右上方的 **M11** 插座（可同时保留左上方 **M1** 插座上的 0.96 寸 OLED 屏幕）：

| 模块引脚 | 底板 M11 插座 | STM32F407 引脚 | 说明 |
| --- | --- | --- | --- |
| `VCC` | `3.3V` | `3.3V` | 模块供电 |
| `GND` | `GND` | `GND` | 公共地 |
| `SCL` | `I2C1_SCL` | **PB8** | 与 M1 OLED 共用 I2C1 时钟 |
| `SDA` | `I2C1_SDA` | **PB9** | 与 M1 OLED 共用 I2C1 数据 |
| `AD0` | 默认接地 | — | 从机地址为 `0x68`（与 OLED `0x3C` 不冲突） |

:::tip[与 M1 OLED 共用 I2C1 同屏联动]
M11（MPU6050，`0x68`）与 M1（SSD1306，`0x3C`）挂在同一组 `I2C1 (PB8/PB9)` 总线上互不干扰，同时插接即可在 M1 屏幕上以 `5 Hz` 流畅查看倾斜实时水平仪效果。
:::

## 下载并烧录体验固件

1. **下载并解压预编译固件**：点击下载 [`07_mpu6050_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/07_mpu6050_demo.zip)，解压得到 `07_mpu6050_demo.hex`；
2. **使用 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录**：按图选择 **`ST / STM32`** -> **`STM32F4`** -> 加载 `07_mpu6050_demo.hex` -> 点击 **`开始烧录`**：

![使用 DshanPI USBToolBox 烧录体验固件的步骤图解](../p1-00-认识实验套件/images/usbtoolbox-flash-steps.jpg)

> 如需查阅 `I2C1` 寄存器读写与 MPU6050 灵敏度换算源码，请见 **[5.17 IIC 陀螺仪加速度计模块驱动使用方法](../../chapter5.md#517-iic-陀螺仪加速度计模块驱动使用方法)**。

## 预期现象与串口日志

烧录并运行后（OLED `5 Hz` 刷新、串口每 `1 秒` 打印一次完整六轴数值，期间核心板 `LED1` 闪烁），观察以下现象：

1. **M1 OLED 2D 电子水平仪**：
   - **左侧四行数值**：依次实时显示三轴加速度 `AX`、`AY`、`AZ`（单位 `m/s²`）以及芯片温度 + Z 轴角速度（如 `27.4C Z:+0.0`）；
   - **右侧水平仪方框**：十字准星中央带一个实时移动的 5×5 实心小方点——前后左右倾斜开发板底板，小方点立即随之滑动并可落入中心目标框；
2. **串口日志示例**：

```text
mpu6050_demo: M11 on I2C1 (0x68) ready=1 WHO_AM_I=0x68
[MPU6050] accel[mm/s^2]: 142 -215 9780 | gyro[mrad/s]: 12 -5 3 | temp[mC]: 27420
[MPU6050] accel[mm/s^2]: -3120 1840 9120 | gyro[mrad/s]: 245 -180 42 | temp[mC]: 27450
```

## 常见问题排查

| 现象 | 排查方向 |
| --- | --- |
| 串口打印 `ready=0 WHO_AM_I=0x00` 或 OLED 显示 `READ FAILED / Check M11 socket` | 1. 确认 MPU6050 模块插紧在 **M11** 且排针位置没有反插或错位；<br/>2. 如从其他实验切换而来、I2C1 曾锁死，按一次核心板 `RESET` 键即可自动释放总线重探设备 |
| 静止平放时 `AX / AY` 仍有几百 `mm/s²` 小偏移 | 属于 MEMS 传感器的常见零偏误差与模块微倾斜，摇动/倾斜底板看趋势变化即可 |

---

[上一课：HC-SR04 超声波测距](../p1-06-HC-SR04超声波测距/README.md) · [下一课：光敏电阻亮度采集](../p1-08-光敏电阻亮度采集/README.md) · [课程首页](../../README.md)
