---
title: 有源/无源蜂鸣器
description: 深入解析 buzzer_demo 的双任务高优先级抢占静音架构、TIM3 动态 ARR 变频驱动与停音高阻态隔离兼容有源/无源模块的工程设计。
---

# 有源/无源蜂鸣器（buzzer_demo）

新手刚做报警提示音时，常把音节表写成一段包含许多 `vTaskDelay` 的长函数，结果想按下消音键时非要等这串旋律奏完才闭嘴。`buzzer_demo` 给出了一套标准的多任务解法：**用一个高优先级任务专门守候按键开关实现瞬时强行静音，同时用动态改写定时器重载值的技巧奏出可编程变频旋律**，并在休眠期把引脚切回高阻态，一套驱动兼容有源和无源两类模块。

通过本篇源码解析，你将掌握：
- **高优先级任务瞬时抢占**：理解为何只多加 1 个 `prio+2` 任务，就能在发声任务的任意毫秒断点处立刻秒停报警。
- **硬件定时器的动态调频公式**：弄清在固定占空比 50% 的前提下，如何通过同时改写 `ARR`（周期）和 `CCR`（脉宽）无缝切音高，以及为什么改之前要先清零计数器。
- **有源 vs 无源双兼容硬件思维**：搞懂为什么暂停时只拉低或只拉高电平总有一类蜂鸣器会误响，而切回 `GPIO_MODE_INPUT` 高阻态能同时完美静音。

## 工程结构与烧录

```powershell
.\.venv\Scripts\f407.exe flash buzzer_demo
```

| 项目 | 说明 |
| --- | --- |
| 应用入口 | `applications/buzzer_demo/src/main.c`（107 行） |
| 构建脚本 | `applications/buzzer_demo/CMakeLists.txt`、`cmake/f407_app.cmake` |
| 核心驱动 | `platform/modules/mod_buzzer.c`、`platform/bsp/bsp_key.c`、`platform/bsp/oled_ui.c` |
| 硬件引脚与外设 | 底板 `M9` 插座：`PA7 (TIM3_CH2)`；核心板 `LED1 (PF9)`；`K1/KEY0` 静音键 |
| FreeRTOS 机制 | 双任务优先抢占（`buz_key` `+2` 永久等 `bsp_key_wait_event` vs `buzzer` `+1` 循环演奏） |
| 硬件互斥提醒 | `M9 (蜂鸣器)` 与 `M4 (红外发射)` 共用 **`PA7`**，跑蜂鸣器请拔掉 `M4` 以免乱发红外载波 |

## 运行原理与流程

![buzzer_demo 抢占静音任务与动态 ARR 调频流程图](./images/d07-buzzer-flow.svg)

1. **按优先级创建双任务**：`main()` 创建优先级 `+2`、仅需 `256` 字栈的 `key_mute_task`，以及优先级 `+1`、带完整 OLED 绘制的 `buzzer_task`。
2. **`buz_key` 零开销睡眠并瞬时抢占**：启动后 `key_mute_task` 先一步跑进 `bsp_key_wait_event(UINT32_MAX)` 永远阻塞让出 CPU。一旦 `TIM4` 按键中断发来信号量，它立刻凭借高优先级抢占正在执行延时的 `buzzer_task`，翻转 `s_muted` 并立即调 `mod_buzzer_off()` 闭嘴。
3. **结构体查表动态演奏**：`buzzer_task` 遍历 `k_pattern[]` 数组（2000 → 2500 → 3000 Hz），非静音时按表调高音调，每音结束后休止 150 ms。
4. **切分休息延时维持界面活性**：每一轮三音奏完需要停顿 `2 秒`，代码把它拆成 `10 × 200 ms` 小循环顺便重绘 OLED 动画和核对最新静音标题（`PWM BUZZER` ↔ `BUZZER [MUTE]`）。

## 源码逐段精讲（main.c）

### 1. 瞬时响应静音的高优先级任务

```c
static volatile bool s_muted = false;
...
static void key_mute_task(void *arg)
{
    (void)arg;
    for (;;) {
        (void)bsp_key_wait_event(UINT32_MAX);
        uint32_t presses = bsp_key_take_presses(BSP_KEY_K1) + bsp_key_take_presses(BSP_KEY0);
        if ((presses & 1U) != 0U) {
            s_muted = !s_muted;
            if (s_muted) {
                mod_buzzer_off();
            }
            printf("[BUZZER] mute=%s\r\n", s_muted ? "ON" : "OFF");
        }
    }
}
```

- **必须修饰为 `volatile bool s_muted`**：因为 `key_mute_task` 会改写它，而 `buzzer_task` 的循环在高频读取它。加上 `volatile` 强制编译器每次判断都老老实实从 SRAM 内存读最新值，杜绝编译器优化把 `s_muted` 缓存在寄存器里导致静音失效。
- **为什么不在主任务顺便扫按键？**：假设主任务正卡在 `vTaskDelay(350)` 里演奏高音，如果是单任务轮询，按下去可能还得嘶鸣三百毫秒；有了 `+2` 优先级的专职抢占任务，按键抖动一过，**中断退出刹那立刻进入 `key_mute_task` 执行 `mod_buzzer_off()`**，完全感觉不到延迟。

### 2. 三音节旋律循环与切片休息界面

```c
typedef struct {
    uint32_t freq_hz;
    uint32_t duration_ms;
    const char *label;
} tone_step_t;

static const tone_step_t k_pattern[] = {
    {2000U, 150U, "LOW"},
    {2500U, 150U, "MID"},
    {3000U, 350U, "HIGH"},
};
```

```c
        render_buzzer_oled("Rest 2s...", 0U, s_muted, ++tick);
        for (int s = 0; s < 10; ++s) {
            vTaskDelay(pdMS_TO_TICKS(200));
            render_buzzer_oled("Rest 2s...", 0U, s_muted, ++tick);
        }
```

- **切片等待（Chunked Delay）小技巧**：虽然 `buzzer_task` 中也有 `s_muted` 判断，如果在 2 秒停顿期直接写 `vTaskDelay(2000)`，用户按下静音键后虽声音早就停了，但 OLED 顶部的 `BUZZER [MUTE]` 要等满 2 秒才刷出来。切分成 `10` 个 `200 ms` 小等待，几乎不占总线又能让屏幕反馈 200 ms 内同步就位。

## 底层驱动与硬件解析

来看 `platform/modules/mod_buzzer.c` 如何靠一颗 `TIM3` 实现变频输出和双模块兼容静音：

### 1. 有源与无源蜂鸣器区别及 Hi-Z 静音黑科技

| 对比维度 | 有源蜂鸣器（内部自带震荡源） | 无源蜂鸣器（需要外部方波推动） |
| --- | --- | --- |
| 发声要求 | 给固定导通直流电平就会按出厂固定频率响 | 引脚必须接一定频率（典型 2~4 kHz）的脉冲才响 |
| 本驱动应对 | 收到任意有效频率后以 50% 占空比驱动，可稳定发声 | 直接按 `freq_hz` 奏出真正对应音高的音符 |
| 停振难点 | 部分模块低电平触发、部分高电平触发，死设高或低总会响一种 | 只关占空比若遇特定硬件上/下拉仍可能有细微直流底噪 |

为此，代码干脆把关闭引脚封装成了 **高阻悬浮输入（`GPIO_MODE_INPUT` + `GPIO_NOPULL`）**：

```c
static void buzzer_pin_af(void)
{
    GPIO_InitTypeDef gpio = {0};

    gpio.Pin = GPIO_PIN_7;
    gpio.Mode = GPIO_MODE_AF_PP;
    gpio.Pull = GPIO_NOPULL;
    gpio.Speed = GPIO_SPEED_FREQ_HIGH;
    gpio.Alternate = GPIO_AF2_TIM3;
    HAL_GPIO_Init(GPIOA, &gpio);
}

static void buzzer_pin_hiz(void)
{
    GPIO_InitTypeDef gpio = {0};

    gpio.Pin = GPIO_PIN_7;
    gpio.Mode = GPIO_MODE_INPUT;
    gpio.Pull = GPIO_NOPULL;
    HAL_GPIO_Init(GPIOA, &gpio);
}
```

### 2. 动态改频公式与计数器清零时机

```c
    /* TIM3 clock = 84 MHz: PSC=83 -> 1 MHz tick */
    s_htim3_buz.Instance = TIM3;
    s_htim3_buz.Init.Prescaler = 83U;
    s_htim3_buz.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_ENABLE;
...
void mod_buzzer_tone(uint32_t freq_hz)
{
    if (freq_hz < 100U) {
        mod_buzzer_off();
        return;
    }
    if (freq_hz > 20000U) {
        freq_hz = 20000U;
    }

    uint32_t period = (1000000U / freq_hz) - 1U;
    __HAL_TIM_SET_AUTORELOAD(&s_htim3_buz, period);
    __HAL_TIM_SET_COMPARE(&s_htim3_buz, TIM_CHANNEL_2, (period + 1U) / 2U);
    __HAL_TIM_SET_COUNTER(&s_htim3_buz, 0U);
    buzzer_pin_af();
}
```

- **动态算频手算过程**：`TIM3` 挂于 `APB1`，内部时钟 `84 MHz`。预分频 `PSC = 83` 分频出整整 `1 MHz`（`1,000,000` 次/秒）基准节拍。假设要发 `2000 Hz`：`period = (1,000,000 / 2000) - 1 = 499`，计满 500 下耗时 `0.5 ms`，比较值 `(499 + 1) / 2 = 250` 保证前后各占 `250 us`（**恒定 50% 对称方波**，响度最大、失真最小）。
- **为什么要手动执行 `__HAL_TIM_SET_COUNTER(&s_htim3_buz, 0U)`**：`mod_buzzer_init()` 开启了 `AUTORELOAD_PRELOAD`。假设上一个较低频率 `2000 Hz` 计数器恰好已经数到了 `450`，此刻突然切成更高的 `3000 Hz`（`period = 332`），如果不把当前计数值归零，可能会出现计数器跨过新周期上限直到 65535 才溢出的诡异延迟噪音。清零计数能保住第一个脉冲周期精确干净。

### 公开驱动 API 速查（`mod_buzzer.h`）

| 函数原型 | 参数说明 | 作用与返回值 |
| --- | --- | --- |
| `void mod_buzzer_init(void)` | 无参数 | 配好 `TIM3` 1 MHz 基准与通道 2，并调用 `mod_buzzer_off()` 静音初始化 |
| `void mod_buzzer_tone(freq)` | `freq`: 目标频率（限幅 `100~20000 Hz`，低于 100 即停） | 动态算周期、设 50% 占空比并把 `PA7` 切为复用推挽输出 |
| `void mod_buzzer_off(void)` | 无参数 | 清零比较寄存器并把 `PA7` 切回高阻输入彻底断开驱动 |

## 运行现象与常见问题

将无源（或有源）蜂鸣器插进底板 `M9`，上电即循环响起 `LOW (2000 Hz) → MID (2500 Hz) → HIGH (3000 Hz)` 三连音与 `2 s` 歇息；按一次 `K1` 或 `KEY0` 秒停发声并把 OLED 右上角标为 `BUZZER [MUTE]`：

```text
buzzer_demo: M9 on PA7 TIM3_CH2 (press K1/KEY0 to mute)
[BUZZER] pattern #1
[BUZZER] pattern #2
[BUZZER] mute=ON
[BUZZER] mute=OFF
```

| 现象 | 可能原因 | 排查方法 |
| --- | --- | --- |
| 三声听起来几乎一个音调，只是略变调一点点 | 手上插的是**有源蜂鸣器**（背面常封黑胶、通直流电自震荡） | 有源蜂鸣器自带内部震荡源只能固定在 ~2.3 kHz 发音；换用背面能看见绿色 PCB 和线圈的**无源蜂鸣器**即可清晰听出音阶变化 |
| 静音后按复位瞬间偶尔听到一声极短“咔”响 | 复位瞬间尚未进入 `mod_buzzer_init()` 前电平浮空，或误将 `M4` 插在旁边 | 检查 `M4 (PA7)` 保持空置；如有源模块受浮空上电干扰，属于模块自带驱动三极管的微秒级瞬态 |
| 无源蜂鸣器声音微弱或音色哑 | 误改小了占空比或插反防反接排针（正负极错位） | 确保模块 `I/O` 信号脚与底板 `M9` 引脚丝印对齐，占空比保持 50% 驱动效率最高 |

## 进阶改造练习

### 练习 1：把三音警报改造成《小星星》欢迎旋律

只要利用上面调频特性表，把 `k_pattern[]` 换成中音区真实乐理频率表，就能奏出完整的开机欢快旋律：

```c
#define NOTE_C5  523U
#define NOTE_D5  587U
#define NOTE_E5  659U
#define NOTE_F5  698U
#define NOTE_G5  784U
#define NOTE_A5  880U

static const tone_step_t k_pattern[] = {
    {NOTE_C5, 220U, "DO"},
    {NOTE_C5, 220U, "DO"},
    {NOTE_G5, 220U, "SOL"},
    {NOTE_G5, 220U, "SOL"},
    {NOTE_A5, 220U, "LA"},
    {NOTE_A5, 220U, "LA"},
    {NOTE_G5, 440U, "SOL-"},
};
```

### 练习 2：对比去除清零计数器或改成静态高低电平停音的区别

把 `mod_buzzer_off()` 里的 `buzzer_pin_hiz()` 暂改为推挽输出低电平或高电平，分别插入套件里的有源与无源两种蜂鸣器测试对比，亲身验证为什么工程里要用“高阻态断开”。

---

[上一篇：RGB 全彩 LED（rgb_led_demo）](../d06-rgb-led/README.md) · [下一篇：DHT11 温湿度（dht11_demo）](../d08-dht11/README.md) · [硬件接线与现象（第 3 课）](../../../quickstart/p1-03-有源无源蜂鸣器/README.md) · [内置示例汇总](../../c09-apps-index-and-pitfalls/README.md)
