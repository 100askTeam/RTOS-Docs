---
title: 第 9 课：旋转编码器与按键
---

import KitExplorer from '@site/src/components/KitExplorer';

# 第 9 课：旋转编码器与按键

本课下载预编译固件 [`09_rotary_encoder_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/09_rotary_encoder_demo.zip)（解压得 `09_rotary_encoder_demo.hex`）并通过 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录，快速体验底板正中下方的 **M13** EC11 旋转编码器模块，验证顺/逆时针快速旋转无丢步正交计数与按压复位归零。

## 硬件准备与接线

<KitExplorer focus="m13" />

将 EC11 旋转编码器旋钮插入底板下方中央的 **M13** 插座（如果已焊接/插接好即可直接使用）：

| 模块信号 | 底板 M13 插座 | STM32F407 引脚 | 说明 |
| --- | --- | --- | --- |
| `VCC / GND` | `3.3V / GND` | `3.3V / GND` | 供电与共地 |
| `S1`（A 相） | `S1 / CLK` | **PF8** (`EXTI8`) | 双边沿中断捕获 A 相变化 |
| `S2`（B 相） | `S2 / DT` | **PF7** (`EXTI7`) | 双边沿中断捕获 B 相变化 |
| `KEY`（按压） | `KEY / SW` | **PF6** (`EXTI6`) | 旋钮下压动作检测与计数值归零 |

## 下载并烧录体验固件

1. **下载并解压预编译固件**：点击下载 [`09_rotary_encoder_demo.zip`](https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware/09_rotary_encoder_demo.zip)，解压得到 `09_rotary_encoder_demo.hex`；
2. **使用 [`DshanPI USBToolBox`](https://dl.100ask.net/Tools/usbtoolsbox/) 烧录**：按图选择 **`ST / STM32`** -> **`STM32F4`** -> 加载 `09_rotary_encoder_demo.hex` -> 点击 **`开始烧录`**：

![使用 DshanPI USBToolBox 烧录体验固件的步骤图解](../p1-00-认识实验套件/images/usbtoolbox-flash-steps.jpg)

> 如需查阅编码器 CubeMX 引脚配置与外部中断代码解析，请见 **[5.12 旋转编码器模块驱动使用方法](../../chapter5.md#512-旋转编码器模块驱动使用方法)**。

## 预期现象与串口日志

烧录并运行后，转动并按压 M13 旋转编码器，观察 M1 OLED 屏幕与串口终端（`115200 8-N-1`）：

1. **快速正反转计数不丢步**：体验固件在 `PF8` 与 `PF7` 均启用了双边沿四状态格雷码正交解码状态机，无论慢速微调还是快速甩转，屏幕大字号位置值（如 `+12` / `-8`）均会精确顺加逆减，方向栏同步显示 **`DIR:CW (+)`** 或 **`DIR:CCW(-)`**；
2. **中心双向进度条**：底部横向条以正中 `0` 为原点，顺时针向右伸展、逆时针向左伸展（自带防过饱和限幅，快速反向旋转可立即回拉）；
3. **按压归零**：垂直按下编码器转轴，右侧状态显示 `BTN:DOWN`，顶部短暂闪烁 `EC11 [RESET]` 并将计数器与进度条立即归零；
4. **串口日志示例**：

```text
rotary_encoder_demo: M13 (PF8=S1 EXTI8, PF7=S2 EXTI7, PF6=KEY EXTI6). Press knob to reset.
[EC11] pos=+1 bar=+1 dir=CW
[EC11] pos=+2 bar=+2 dir=CW
[EC11] pos=+1 bar=+1 dir=CCW
[EC11] button pressed -> counter reset to 0
```

## 常见问题排查

| 现象 | 排查方向 |
| --- | --- |
| 转动方向显示和预期相反 | 不同批次 EC11 A/B 相线序定义不同；本体验固件按标配模组正交相位适配，能准确区分正反转各加减 1 即可 |
| 旋转后计数器完全不动 | 检查 M13 旋钮焊盘/排针是否插牢、未悬空 |

---

[上一课：光敏电阻亮度采集](../p1-08-光敏电阻亮度采集/README.md) · [下一课：红外对管避障检测](../p1-10-红外对管避障检测/README.md) · [课程首页](../../README.md)
