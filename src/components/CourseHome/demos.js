/**
 * DshanMCU-F407 外设 Demo 与预编译固件统一配置入口。
 */
const CHAPTER5 = '/docs/DShanMCU-F407/chapter5';
const QUICKSTART = '/docs/DShanMCU-F407/quickstart';

export const FIRMWARE_BASE_URL =
  'https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware';

export const USBTOOLBOX_DOWNLOAD_URL =
  'https://dl.100ask.net/Tools/usbtoolsbox/';

export const DEMO_FIRMWARE = {
  led: null,
  oled: '01_oled_demo.zip',
  key: null,
  active_buzzer: '03_buzzer_demo.zip',
  passive_buzzer: '03_buzzer_demo.zip',
  dht11: '04_dht11_demo.zip',
  ds18b20: '05_ds18b20_demo.zip',
  ir_obstacle: '10_ir_obstacle_demo.zip',
  sr04: '06_hc_sr04_demo.zip',
  rotary_encoder: '09_rotary_encoder_demo.zip',
  ir_receiver: '11_ir_tx_rx_demo.zip',
  ir_sender: '11_ir_tx_rx_demo.zip',
  ir_tx_rx: '11_ir_tx_rx_demo.zip',
  color_led: '02_rgb_led_demo.zip',
  light_sensor: '08_light_sensor_demo.zip',
  mpu6050: '07_mpu6050_demo.zip',
  w25q64: '12_w25q64_demo.zip',
  motor: '13_motor_demo.zip',
  servo: '14_servo_demo.zip',
};

export function resolveFirmwareDownload(demoKey) {
  if (!demoKey) {
    return null;
  }
  const entry = DEMO_FIRMWARE[demoKey];
  if (!entry) {
    return null;
  }
  const trimmed = String(entry).trim();
  if (!trimmed) {
    return null;
  }
  const isAbsOrRoot = /^https?:\/\//i.test(trimmed) || trimmed.startsWith('/');
  const base = FIRMWARE_BASE_URL.replace(/\/+$/, '');
  const url = isAbsOrRoot
    ? trimmed
    : base
      ? `${base}/${trimmed.replace(/^\/+/, '')}`
      : trimmed;
  const parts = url.split('/');
  const fileName = parts[parts.length - 1] || trimmed;
  const hexName = fileName.replace(/\.zip$/i, '.hex');

  return {
    fileName,
    hexName,
    label: `下载体验固件 (${fileName})`,
    url,
  };
}

export const QUICK_DEMOS = [
  {
    no: '01',
    key: 'oled',
    title: 'OLED 双色屏显示',
    desc: '点亮 0.96 寸 SSD1306 屏，展示 100ASK.NET 仪表盘（第 2~14 课共用联动屏）。',
    module: 'M1 · 0.96 OLED',
    pin: 'PB8 / PB9 · I2C1',
    doc: `${QUICKSTART}/p1-01-OLED双色屏显示/`,
    cubeDoc: `${CHAPTER5}#54-iic-oled屏驱动使用方法`,
    firmware: resolveFirmwareDownload('oled')?.url || null,
  },
  {
    no: '02',
    key: 'color_led',
    title: 'RGB 全彩 LED 调色',
    desc: 'TIM2 三通道 PWM 混色呼吸渐变，支持 K1/KEY0 手动切色。',
    module: 'M3 · RGB 全彩 LED',
    pin: 'PA5 / PA1 / PA2 · TIM2',
    doc: `${QUICKSTART}/p1-02-RGB全彩LED调色/`,
    cubeDoc: `${CHAPTER5}#515-rgb全彩led模块驱动使用方法`,
    firmware: resolveFirmwareDownload('color_led')?.url || null,
  },
  {
    no: '03',
    key: 'passive_buzzer',
    title: '有源/无源蜂鸣器',
    desc: 'TIM3_CH2 输出多频段脉冲提示音，K1/KEY0 静音/恢复（注意拔除 M4）。',
    module: 'M9 · 蜂鸣器',
    pin: 'PA7 · TIM3_CH2',
    doc: `${QUICKSTART}/p1-03-有源无源蜂鸣器/`,
    cubeDoc: `${CHAPTER5}#57-无源蜂鸣器模块驱动使用方法`,
    firmware: resolveFirmwareDownload('passive_buzzer')?.url || null,
  },
  {
    no: '04',
    key: 'dht11',
    title: 'DHT11 温湿度采集',
    desc: 'PC2 单总线读取温湿度，双卡片实时显示在 M1 OLED 与串口。',
    module: 'M10 · DHT11 温湿度',
    pin: 'PC2 · 单总线',
    doc: `${QUICKSTART}/p1-04-DHT11温湿度采集/`,
    cubeDoc: `${CHAPTER5}#58-dht11温湿度模块驱动使用方法`,
    firmware: resolveFirmwareDownload('dht11')?.url || null,
  },
  {
    no: '05',
    key: 'ds18b20',
    title: 'DS18B20 单总线测温',
    desc: '1-Wire 读取 12-bit 精度温度（0.0625℃），联动 M1 OLED 显示。',
    module: 'M2 · DS18B20 测温',
    pin: 'PC2 · 1-Wire',
    doc: `${QUICKSTART}/p1-05-DS18B20单总线测温/`,
    cubeDoc: `${CHAPTER5}#59-ds18b20温度模块驱动使用方法`,
    firmware: resolveFirmwareDownload('ds18b20')?.url || null,
  },
  {
    no: '06',
    key: 'sr04',
    title: 'HC-SR04 超声波测距',
    desc: 'PE2 触发 + PE4 回响脉宽计时，实现 2~400 cm 厘米级测距。',
    module: 'M6 · HC-SR04 超声波',
    pin: 'PE2 / PE4',
    doc: `${QUICKSTART}/p1-06-HC-SR04超声波测距/`,
    cubeDoc: `${CHAPTER5}#511-超声波测距模块驱动使用方法`,
    firmware: resolveFirmwareDownload('sr04')?.url || null,
  },
  {
    no: '07',
    key: 'mpu6050',
    title: 'MPU6050 六轴姿态',
    desc: 'I2C1 与 M1 OLED 共存联动，5 Hz 刷新三轴加速度、角速度与 2D 水平仪。',
    module: 'M11 · MPU6050',
    pin: 'PB8 / PB9 · I2C1 (0x68)',
    doc: `${QUICKSTART}/p1-07-MPU6050六轴姿态采集/`,
    cubeDoc: `${CHAPTER5}#517-iic-陀螺仪加速度计模块驱动使用方法`,
    firmware: resolveFirmwareDownload('mpu6050')?.url || null,
  },
  {
    no: '08',
    key: 'light_sensor',
    title: '光敏电阻亮度采集',
    desc: 'PA3 光照采集 + PC0 EXTI0 阈值中断检测，联动 OLED 亮暗状态与进度条。',
    module: 'M7 · 光敏传感器',
    pin: 'PA3 (AO) / PC0 (DO)',
    doc: `${QUICKSTART}/p1-08-光敏电阻亮度采集/`,
    cubeDoc: `${CHAPTER5}#516-光敏电阻模块驱动使用方法`,
    firmware: resolveFirmwareDownload('light_sensor')?.url || null,
  },
  {
    no: '09',
    key: 'rotary_encoder',
    title: '旋转编码器与按键',
    desc: 'PF8/PF7 四状态正交解码防丢步计数 + PF6 按压归零。',
    module: 'M13 · EC11 编码器',
    pin: 'PF8 / PF7 / PF6',
    doc: `${QUICKSTART}/p1-09-旋转编码器与按键/`,
    cubeDoc: `${CHAPTER5}#512-旋转编码器模块驱动使用方法`,
    firmware: resolveFirmwareDownload('rotary_encoder')?.url || null,
  },
  {
    no: '10',
    key: 'ir_obstacle',
    title: '红外对管避障检测',
    desc: 'PC5 EXTI5 外部中断捕捉遮挡触发与累计次数，支持蓝色电位器调灵敏度。',
    module: 'M5 · 红外避障 LM393',
    pin: 'PC5 · EXTI5',
    doc: `${QUICKSTART}/p1-10-红外对管避障检测/`,
    cubeDoc: `${CHAPTER5}#510-红外避障模块驱动使用方法`,
    firmware: resolveFirmwareDownload('ir_obstacle')?.url || null,
  },
  {
    no: '11',
    key: 'ir_tx_rx',
    title: '红外发射与接收通信',
    desc: 'M4 (38kHz 载波) + M8 (PA6 NEC 解码) 本地漫反射自发自收与遥控器解码。',
    module: 'M4 + M8 · 红外收发',
    pin: 'PA7 (TX) / PA6 (RX)',
    doc: `${QUICKSTART}/p1-11-红外发射与接收通信/`,
    cubeDoc: `${CHAPTER5}#514-红外发射模块驱动使用方法`,
    firmware: resolveFirmwareDownload('ir_tx_rx')?.url || null,
  },
  {
    no: '12',
    key: 'w25q64',
    title: 'W25Q64 外部 Flash',
    desc: 'SPI1 读取 JEDEC ID (EF 40 17)、擦除 4KB 扇区 0、页编程与 256B 回读校验。',
    module: 'M12 · W25Q64 Flash',
    pin: 'PB3~5 / PC1 · SPI1',
    doc: `${QUICKSTART}/p1-12-W25Q64外部Flash读写/`,
    cubeDoc: `${CHAPTER5}#518-spi-flash模块驱动使用方法`,
    firmware: resolveFirmwareDownload('w25q64')?.url || null,
  },
  {
    no: '13',
    key: 'motor',
    title: 'DRV8833 直流电机驱动',
    desc: 'J5 BO1/BO2 通道 B 正反转与 ±50%/±85% PWM 调速（需插 Type-C 5V 供电）。',
    module: 'M14 + J5 · DRV8833',
    pin: 'PE5 · TIM9_CH1 / PF0~2',
    doc: `${QUICKSTART}/p1-13-DRV8833直流电机驱动/`,
    cubeDoc: `${CHAPTER5}#519-直流电机驱动使用方法`,
    firmware: resolveFirmwareDownload('motor')?.url || null,
  },
  {
    no: '14',
    key: 'servo',
    title: 'SG90 舵机角度控制',
    desc: 'J6~J8 三路 50Hz PWM (500~2500 us) 自动扫角 0°~180°，K1/KEY0 切换手动步进。',
    module: 'J6~J8 · 舵机接口',
    pin: 'PA5 / PA1 / PA2 · TIM2',
    doc: `${QUICKSTART}/p1-14-SG90舵机角度控制/`,
    cubeDoc: `${CHAPTER5}#515-rgb全彩led模块驱动使用方法`,
    firmware: resolveFirmwareDownload('servo')?.url || null,
  },
];
