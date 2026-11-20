---
title: 第 12 课：W25Q64 外部 Flash 读写
---

import KitExplorer from '@site/src/components/KitExplorer';

# 第 12 课：W25Q64 外部 Flash 读写

本课下载预编译固件 [`12_w25q64_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/12_w25q64_demo.zip)（解压得 `12_w25q64_demo.hex`）并通过 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录，快速体验底板内侧 **M12** 插座上的 W25Q64 SPI NOR Flash（8 MB）读取 JEDEC ID、擦除 4 KB 扇区、页编程及 256 字节回读比对校验。

## 硬件准备与接线

<KitExplorer focus="m12" />

将 W25Q64 SPI Flash 模块插入底板左侧内圈的 **M12** 排母插座（`3.3V` 供电）：

| 模块引脚 | 底板 M12 插座 | STM32F407 引脚 | 说明 |
| --- | --- | --- | --- |
| `VCC / GND` | `3.3V / GND` | `3.3V / GND` | 模块供电与共地 |
| `CLK`（时钟） | `SPI1_SCK` | **PB3** | SPI1 时钟（SWD 模式下自动释放） |
| `DI / MOSI` | `SPI1_MOSI` | **PB4** | SPI1 主发从收 |
| `DO / MISO` | `SPI1_MISO` | **PB5** | SPI1 主收从发 |
| `CS`（片选） | `FLASH_CS` | **PC1** | 独立片选（与核心板 `GD25Q256 CS=PB14` 隔离不冲突） |

:::tip[为何 F407 上需启用 SWD 模式]
`PB3` 和 `PB4` 上电默认为 JTAG 引脚；本体验固件与 CubeMX 推荐工程统一开启 **Serial Wire (`SWD`)** 模式以释放 `PB3/PB4` 给 `SPI1`，同时将核心板自带 SPI Flash (`GD25Q256`) 的 `PB14` 片选持续保持高电平，保证与 M12 共享 SPI1 总线时互不打架。
:::

## 下载并烧录体验固件

1. **下载并解压预编译固件**：点击下载 [`12_w25q64_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/12_w25q64_demo.zip)，解压得到 `12_w25q64_demo.hex`；
2. **使用 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录**：按图选择 **`ST / STM32`** -> **`STM32F4`** -> 加载 `12_w25q64_demo.hex` -> 点击 **`开始烧录`**：

![使用 DshanPI USBToolBox 烧录体验固件的步骤图解](../p1-00-认识实验套件/images/usbtoolbox-flash-steps.jpg)

> 如需查阅 `SPI1` 配置及 W25Q64 驱动源码讲解，请见 **[5.18 SPI FLASH 模块驱动使用方法](../../chapter5.md#518-spi-flash模块驱动使用方法)**。
> 若使用 CMake 原生 FreeRTOS 工程编译修改源码，应用入口见 `applications/w25q64_demo/src/main.c`，驱动代码见 `platform/modules/mod_w25q64.c`（详见 [w25q64_demo 源码解析](../../cmake/demos/d16-w25q64/README.md) 与 [编译、烧录与调试](../../cmake/c02-build-flash-debug/README.md)）。

## 预期现象与串口日志

烧录并运行后（固件每 `3 秒` 对扇区 0 执行一次「4KB 擦除 -> 256B 页写入 -> 回读校验」，核心板 `LED1` 随之闪烁），观察 M1 OLED 与串口终端（`115200 8-N-1`）：

1. **M1 OLED 实时校验面板**：顶部显示 `M12` 徽章与 `W25Q64 SPI`，主卡第一行显示芯片 JEDEC ID（正常为 `ID:EF4017  4KB Sec0`），中间提示 `Erase > Write > Read`，底部反白徽章显示 **`PASS`** 及递增序号 `Seq #001`；
2. **串口日志示例**：

```text
w25q64_demo: M12 SPI1 CS=PC1 JEDEC=EF 40 17 present=1
[W25Q64] PASS seq=1 256B data=57363401...
[W25Q64] PASS seq=2 256B data=57363402...
```

## 常见问题排查

| 现象 | 排查方向 |
| --- | --- |
| OLED 显示 `NO FLASH CHIP / JEDEC: 00 00 00` 或 `FF FF FF` | 1. 确认 W25Q64 小板插在底板左内侧 **M12** 插座且排针没有反插或歪斜；<br/>2. 如果在自建 CubeMX 工程中遇到同样现象，检查是否忘记在 `SYS -> Debug` 中选 `Serial Wire`（释放 `PB3/PB4`） |

---

[上一课：红外发射与接收通信](../p1-11-红外发射与接收通信/README.md) · [下一课：DRV8833 直流电机驱动](../p1-13-DRV8833直流电机驱动/README.md) · [课程首页](../../README.md)
