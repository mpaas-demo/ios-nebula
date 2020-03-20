# H5容器和离线包

<a name="UgzsB"></a>
## 功能介绍
本 Demo 主要配合官网 [文档](https://help.aliyun.com/document_detail/129797.html?spm=a2c4g.11186623.6.1038.4dfb624bQzp0wz)，介绍 iOS H5容器和离线包能力，功能如下：

- 加载容器
- 自定义 JsApi 和 Plugin
- 自定义导航栏
- 离线包管理

本 Demo 支持的基线范围：>= 10.1.60

<a name="jFPNB"></a>
## 运行Demo
<a name="teHcF"></a>
### Cocoa Pod 接入：MPH5Demo_pod

1. 执行以下命令，安装 cocoapods-mPaaS 插件 
```shell
sh <(curl -s http://mpaas-ios.oss-cn-hangzhou.aliyuncs.com/cocoapods/installmPaaSCocoaPodsPlugin.sh)
```

2. 修改Podfile，设置基线号，支持设置为 10.1.60、10.1.68-beta

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/271/1584683006252-99eb78eb-c84c-4e70-965b-16677a837aa7.png#align=left&display=inline&height=203&name=image.png&originHeight=406&originWidth=1332&size=178450&status=done&style=none&width=666)

3. 执行以下命令，拉取依赖库
```shell
1、pod mpaas update all
2、pod update
```

<a name="zlIkG"></a>
### Extension 插件接入

1. 执行以下命令，安装 mPaaS Extension插件，并确认插件版本 >= 1.1.3
```shell
curl -sSL https://mpaas-ios.oss-cn-hangzhou.aliyuncs.com/mpaaskit/Xcode-extension/install.sh | sh
```

2. 点击 “Xcode - Editor - mPaaS - 编辑工程 ” 打开插件面板，切换到“工程概览” TAB，点击安装按钮，拉取依赖

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/271/1584697775625-1dd4eddb-a546-47e7-936d-64bf47d3869c.png#align=left&display=inline&height=301&name=image.png&originHeight=1202&originWidth=1800&size=572760&status=done&style=none&width=450)

3. 此 demo 默认为 10.1.60基线，您可以切换到 “升级基线” Tab，选择需要的基线

![image.png](https://intranetproxy.alipay.com/skylark/lark/0/2020/png/271/1584697976214-dcac8f48-58ad-4d74-9f32-cc65a6825780.png#align=left&display=inline&height=301&name=image.png&originHeight=1202&originWidth=1800&size=649170&status=done&style=none&width=450)
