功能介绍
本 Demo 主要配合官网 文档，介绍 iOS H5容器和离线包能力，包含内容如下：
• 容器
• 离线包管理
• 自定义 JsApi 和 Plugin
• 自定义导航栏
本 Demo 支持的基线范围：>= 10.1.60
运行Demo
Cocoa Pod 接入：MPH5Demo_pod
1. 执行以下命令，安装 cocoapods-mPaaS 插件 
sh <(curl -s http://mpaas-ios.oss-cn-hangzhou.aliyuncs.com/cocoapods/installmPaaSCocoaPodsPlugin.sh)
2. 修改Podfile，设置基线号，支持设置为 10.1.60、10.1.68-beta
3. 执行以下命令，拉取依赖库
1、pod mpaas update all
2、pod update
Extension 插件接入
运行结果# ios-nebula
