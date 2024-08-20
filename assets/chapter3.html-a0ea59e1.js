import{_ as r,r as s,o as h,c as o,a as t,b as e,d as c,e as a}from"./app-a3aa5aa8.js";const n={},i=a('<h1 id="第3章-搭建开发环境安装" tabindex="-1"><a class="header-anchor" href="#第3章-搭建开发环境安装" aria-hidden="true">#</a> 第3章 搭建开发环境安装</h1><h2 id="_3-1-安装keil-mdk" tabindex="-1"><a class="header-anchor" href="#_3-1-安装keil-mdk" aria-hidden="true">#</a> 3.1 安装Keil MDK</h2><h3 id="_3-1-1-软件下载" tabindex="-1"><a class="header-anchor" href="#_3-1-1-软件下载" aria-hidden="true">#</a> 3.1.1 软件下载</h3><p>开发板配套资料里有Keil MDK软件包：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image1.png" alt=""></p><p>也可以（但是不建议）在Keil官网（https://www.keil.com/download/product/）直接下载“MDK-Arm”，如图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image2.png" alt=""></p><h3 id="_3-1-2-软件安装" tabindex="-1"><a class="header-anchor" href="#_3-1-2-软件安装" aria-hidden="true">#</a> 3.1.2 软件安装</h3><p>双击运行“MDK532.EXE”，进入安装界面，选择“Next &gt;&gt;”，如图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image3.png" alt=""></p><p>接着进入用户协议界面，勾选同意协议，点击“Next &gt;&gt;”，如图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image4.png" alt=""></p><p>然后设置安装路径，第一个“Core”是软件的安装路径，第二个“Pack”是芯片的硬件支持包的安装路径，读者保持默认路径或者设置为如下图图所示一样的即可，如果是自定义设置，建议为全英文路径，不建议为包含有中文的路径。选择好之后点击“Next &gt;&gt;”后：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image5.png" alt=""></p><p>随后需要设置个人信息，随便填写即可，如图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image6.png" alt=""></p><p>之后便进入安装进度界面，如下图所示，等待安装完成。</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image7.png" alt=""></p><p>安装过程中，回弹出驱动安装界面，勾选“始终信任来自‘ARM Ltd’的软件”，然后点击“安装”，如下图所示。</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image8.png" alt=""></p><p>如下图所示即安装完成，“Show Release Notes”为查看当前版版本说明，可以不勾选，最后点击“Filash”。</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image9.png" alt=""></p><p>之后会自动进入“Pack Installer”界面，这里会检查安装的编译器、CMSIS等是否是最新的，由于我们安装的是官网提供的最新的MDK，所以这里一般情况下都是不需要更新的。</p><p>至此Keil就安装完成了，但这不是Keil开发环境的全部。一个Keil的开发环境，除了Keil软件，还需要安装对应的Pack，比如这里目标机的MCU是STM32F103C8T6，就需要下载该系列的的Pack，如果是STM32F4系列，就需要下其它系列Pack。</p><h3 id="_3-1-3-pack安装" tabindex="-1"><a class="header-anchor" href="#_3-1-3-pack安装" aria-hidden="true">#</a> 3.1.3 PACK安装</h3><p>Keil只是一个开发工具，它里面有一些芯片的软件包；但是它肯定不会事先安装好所有芯片的软件包。我们要开发某款芯片，就需要先安装这款芯片的软件包，这被称为“Pack”。</p><p>可以双击运行开发板配套资料中的Pack安装包：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image10.png" alt=""></p><p>也可以在线安装，下面演示一下如何在线安装。</p><p>打开Keil之后，点击如下按钮启动“Pack Installer”：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image11.png" alt=""></p><p>使用“Pack Installer”可以方便的对Pack安装和管理。在左上角搜索框输入“STM32F103”，展开搜索结果，可以看到STM32F103ZE，点击右边的简介链接即可跳转到Pack下载页面，如下图所示。</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image12.png" alt=""></p>',33),g={href:"http://www.keil.com/dd2/Pack/",target:"_blank",rel:"noopener noreferrer"},d=a('<img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image13.png" style="zoom:80%;"><p>下载之前会弹出Pack用户协议，点击“Accept”即可：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image14.png" alt=""></p><p>下载完成得到“Keil.STM32F1xx_DFP.2.3.0.pack”，直接双击该文件，随后弹出如图所示界面，点击“Next”进行安装。</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image15.png" alt=""></p><h2 id="_3-2-安装stm32cubemx" tabindex="-1"><a class="header-anchor" href="#_3-2-安装stm32cubemx" aria-hidden="true">#</a> 3.2 安装STM32CubeMX</h2><p>STM32CubeMX是ST意法半导体推出的STM32系列芯片可视化的图形配置工具，用户可以通过图形化向导为Cortex-M系列MCU生成含有初始化代码的工程模板。</p><p>使用STM32CubeMX创建STM32的工程，步骤少、上手快。</p><p>在开发板配套资料里，有STM32CubeMX的安装软件：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image16.png" alt=""></p><p>也可以从ST官网（https://www.st.com/zh/development-tools/stm32cubemx.html）下载STM32CubeMX。</p><p>解压安装包后，即可安装，如下图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image17.png" alt=""></p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image18.png" alt=""></p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image19.png" alt=""></p><h2 id="_3-3-安装stm32cubeprogrammer" tabindex="-1"><a class="header-anchor" href="#_3-3-安装stm32cubeprogrammer" aria-hidden="true">#</a> 3.3 安装STM32CubeProgrammer</h2><p>STM32CubeProgrammer是烧写工具，用户可以通过此工具使用ST-Link、UART、USB等通信接口往STM32处理器烧录Hex、Bin文件。也可以使用Keil通过ST-Link烧写程序，无需使用STM32CubeProgrammer。</p><p>开发板配套的资料里有安装软件：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image20.png" alt=""></p><p>也可以从ST官网（https://www.st.com/zh/development-tools/stm32cubeprog.html）下载。</p><p>把软件包解压后即可安装，安装步骤如下面的组图所示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image21.png" alt=""></p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image22.png" alt=""></p><p>在安装STM32CubeProgrammer过程中会弹出安装ST-Link驱动，根据提示点击下一页或者完成即可：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image23.png" alt=""></p><p>最后等待安装完成即可：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image24.png" alt=""></p><h2 id="_3-4-安装st-link驱动" tabindex="-1"><a class="header-anchor" href="#_3-4-安装st-link驱动" aria-hidden="true">#</a> 3.4 安装ST-Link驱动</h2><p>本开发板使用ST-Link进行下载调试程序，还需要安装ST-Link驱动。</p><p>在开发板配套资料里有该驱动：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image25.png" alt=""></p><p>解压“en.stsw-link009.zip”，双击运行“dpinst_amd64.exe”（如果电脑为32位系统，运行“dpinst_x86.exe”），出现如图所示安装界面，点击“下一步”。</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image26.png" alt=""></p><p>在安装过程中，出现如图所示的Windows安全警告，选择“安装”</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image27.png" alt=""></p><p>最后安装完成提示如图所示，点击“完成”退出安装程序。</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image28.png" alt=""></p><h2 id="_3-5-安装ch340驱动" tabindex="-1"><a class="header-anchor" href="#_3-5-安装ch340驱动" aria-hidden="true">#</a> 3.5 安装CH340驱动</h2><p>在开发板配套资料中，有如下安装包：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image29.png" alt=""></p><p>双击运行，直接点击“安装”即可：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image30.png" alt=""></p><p>安装成功会有提示：</p><p><img src="http://photos.100ask.net/rtos-docs/FreeRTOS/DShanMCU-F103/chapter-3/image31.png" alt=""></p>',44);function m(S,l){const p=s("ExternalLinkIcon");return h(),o("div",null,[i,t("p",null,[e("如果跳转网页无法打开，可直接打开Pack下载总入口（"),t("a",g,[e("www.keil.com/dd2/Pack/"),c(p)]),e("）。进入Pack下载总入口后，找到“STMicroelectronics STM32F1 Series Device Support, Drivers and”，点击右边的下载图标即可，如下图所示（实测部分网络环境打开该链接无Pack列表，请尝试换个网络环境测试，仍旧不行则使用配套资料Pack）。")]),d])}const F=r(n,[["render",m],["__file","chapter3.html.vue"]]);export{F as default};