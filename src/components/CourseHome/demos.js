/**
 * DshanMCU-F407 外设 Demo 与预编译固件统一配置入口。
 *
 * 后续补充预编译 `.zip` 固件时，只需设置 `FIRMWARE_BASE_URL`
 * （如 'https://dl.100ask.net/Hardware/MCU/DShanMCU-F407/firmware' 或 '/files/f407'）
 * 并在 `DEMO_FIRMWARE` 中填写对应文件名（如 '01_led_demo.zip'）或完整下载 URL，
 * `KitExplorer` 等组件会自动启用下载按钮。
 */
const CHAPTER5 = '/docs/DShanMCU-F407/chapter5';

export const FIRMWARE_BASE_URL = '';

export const DEMO_FIRMWARE = {
  led: null,
  oled: null,
  key: null,
  active_buzzer: null,
  passive_buzzer: null,
  dht11: null,
  ds18b20: null,
  ir_obstacle: null,
  sr04: null,
  rotary_encoder: null,
  ir_receiver: null,
  ir_sender: null,
  color_led: null,
  light_sensor: null,
  mpu6050: null,
  w25q64: null,
  motor: null,
  servo: null,
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

  return {
    fileName,
    label: `下载体验固件 (${fileName})`,
    url,
  };
}

export const QUICK_DEMOS = [
  {
    no: '01',
    key: 'led',
    title: '板载 LED 闪烁',
    desc: 'LED1 / LED2 交替闪烁，验证工程配置、编译与下载链路是否打通。',
    module: '板载 LED1/2',
    pin: 'PF9 / PF10',
    doc: `${CHAPTER5}#53-led驱动使用方法`,
    firmware: resolveFirmwareDownload('led')?.url || null,
  },
  {
    no: '02',
    key: 'oled',
    title: 'IIC OLED 显示',
    desc: '点亮 0.96 寸 SSD1306 屏，显示字符、图形与自定义字库。',
    module: 'IIC OLED SSD1306',
    pin: 'PB8 / PB9 · I2C1',
    doc: `${CHAPTER5}#54-iic-oled屏驱动使用方法`,
    firmware: resolveFirmwareDownload('oled')?.url || null,
  },
  {
    no: '03',
    key: 'key',
    title: '按键输入与消抖',
    desc: '轮询与中断两种方式读取 BOOT0 按键，配合软件消抖。',
    module: '按键（Boot0）',
    pin: 'PE3',
    doc: `${CHAPTER5}#55-按键驱动使用方法`,
    firmware: resolveFirmwareDownload('key')?.url || null,
  },
  {
    no: '04',
    key: 'active_buzzer',
    title: '有源蜂鸣器',
    desc: 'GPIO 电平直接驱动，实现鸣叫、节奏与报警提示音。',
    module: '有源蜂鸣器',
    pin: 'PA7',
    doc: `${CHAPTER5}#56-有源蜂鸣器模块驱动使用方法`,
    firmware: resolveFirmwareDownload('active_buzzer')?.url || null,
  },
  {
    no: '05',
    key: 'passive_buzzer',
    title: '无源蜂鸣器',
    desc: 'TIM3 PWM 变频输出，播放音阶与简单旋律。',
    module: '无源蜂鸣器',
    pin: 'PA7 · TIM3_CH2',
    doc: `${CHAPTER5}#57-无源蜂鸣器模块驱动使用方法`,
    firmware: resolveFirmwareDownload('passive_buzzer')?.url || null,
  },
  {
    no: '06',
    key: 'dht11',
    title: 'DHT11 温湿度',
    desc: '单总线时序采集温湿度，串口与 OLED 实时显示。',
    module: 'DHT11 温湿度',
    pin: 'PC2 · 单总线',
    doc: `${CHAPTER5}#58-dht11温湿度模块驱动使用方法`,
    firmware: resolveFirmwareDownload('dht11')?.url || null,
  },
  {
    no: '07',
    key: 'ds18b20',
    title: 'DS18B20 测温',
    desc: '1-Wire 协议读取 12 位温度，精度 0.0625℃。',
    module: 'DS18B20 温度',
    pin: 'PC2 · 1-Wire',
    doc: `${CHAPTER5}#59-ds18b20温度模块驱动使用方法`,
    firmware: resolveFirmwareDownload('ds18b20')?.url || null,
  },
  {
    no: '08',
    key: 'ir_obstacle',
    title: '红外避障检测',
    desc: 'LM393 比较器输出，完成遮挡检测与计数。',
    module: '红外避障 LM393',
    pin: 'PC5',
    doc: `${CHAPTER5}#510-红外避障模块驱动使用方法`,
    firmware: resolveFirmwareDownload('ir_obstacle')?.url || null,
  },
  {
    no: '09',
    key: 'sr04',
    title: 'HC-SR04 测距',
    desc: 'GPIO 触发 + 回响脉宽计时，实现厘米级测距。',
    module: '超声波 HC-SR04',
    pin: 'PE2 / PE4',
    doc: `${CHAPTER5}#511-超声波测距模块驱动使用方法`,
    firmware: resolveFirmwareDownload('sr04')?.url || null,
  },
  {
    no: '10',
    key: 'rotary_encoder',
    title: '旋转编码器',
    desc: 'EC11 正反转计数、按下事件与硬件消抖处理。',
    module: '旋转编码器 EC11',
    pin: 'PF8 / PF7 / PF6',
    doc: `${CHAPTER5}#512-旋转编码器模块驱动使用方法`,
    firmware: resolveFirmwareDownload('rotary_encoder')?.url || null,
  },
  {
    no: '11',
    key: 'ir_receiver',
    title: '红外接收解码',
    desc: '1838 接收头配合外部中断，解析 NEC 遥控键码。',
    module: '红外接收 1838',
    pin: 'PA6 · EXTI',
    doc: `${CHAPTER5}#513-红外接收模块驱动使用方法`,
    firmware: resolveFirmwareDownload('ir_receiver')?.url || null,
  },
  {
    no: '12',
    key: 'ir_sender',
    title: '红外发射',
    desc: '38kHz 载波调制，发射自定义红外编码。',
    module: '红外发射 38KHz',
    pin: 'PA7 · TIM3_CH2',
    doc: `${CHAPTER5}#514-红外发射模块驱动使用方法`,
    firmware: resolveFirmwareDownload('ir_sender')?.url || null,
  },
  {
    no: '13',
    key: 'color_led',
    title: 'RGB 全彩 LED',
    desc: 'TIM2 三通道 PWM 调色，实现呼吸灯与渐变。',
    module: 'RGB 全彩 LED',
    pin: 'PA5 / PA1 / PA2 · TIM2',
    doc: `${CHAPTER5}#515-rgb全彩led模块驱动使用方法`,
    firmware: resolveFirmwareDownload('color_led')?.url || null,
  },
  {
    no: '14',
    key: 'light_sensor',
    title: '光敏电阻采集',
    desc: 'ADC 采集环境亮度，串口输出并可联动 OLED。',
    module: '光敏电阻',
    pin: 'PA3 · ADC1_IN3',
    doc: `${CHAPTER5}#516-光敏电阻模块驱动使用方法`,
    firmware: resolveFirmwareDownload('light_sensor')?.url || null,
  },
  {
    no: '15',
    key: 'mpu6050',
    title: 'MPU6050 姿态',
    desc: 'I2C 读取六轴加速度与角速度，输出姿态角。',
    module: 'IIC 陀螺仪 MPU6050',
    pin: 'PB8 / PB9 · I2C1',
    doc: `${CHAPTER5}#517-iic-陀螺仪加速度计模块驱动使用方法`,
    firmware: resolveFirmwareDownload('mpu6050')?.url || null,
  },
  {
    no: '16',
    key: 'w25q64',
    title: 'W25Q64 读写',
    desc: 'SPI 读取 Flash ID、擦写扇区并校验数据。',
    module: 'SPI FLASH W25Q64',
    pin: 'PB3~5 / PC1 · SPI1',
    doc: `${CHAPTER5}#518-spi-flash模块驱动使用方法`,
    firmware: resolveFirmwareDownload('w25q64')?.url || null,
  },
  {
    no: '17',
    key: 'motor',
    title: '直流电机驱动',
    desc: 'DRV8833 双通道驱动，实现正反转与 PWM 调速。',
    module: '直流电机 DRV8833',
    pin: 'PE5 · TIM9_CH1 / PF0~2',
    doc: `${CHAPTER5}#519-直流电机驱动使用方法`,
    firmware: resolveFirmwareDownload('motor')?.url || null,
  },
];
