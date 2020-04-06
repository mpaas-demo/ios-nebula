# H5容器和离线包

<a name="UgzsB"></a>
## 功能介绍
本 Demo 主要配合官网 [文档](https://help.aliyun.com/document_detail/129797.html?spm=a2c4g.11186623.6.1038.4dfb624bQzp0wz)，介绍 iOS H5容器和离线包能力，功能如下：

- 加载容器
- 自定义 JsApi 和 Plugin
- 自定义导航栏
- 离线包管理

<br />本 Demo 支持的基线范围：>= 10.1.60（默认使用 10.1.60）。<br />

## 分支说明
- `master`：mPaaS框架托管方式。适用于新建一个 mPaaS 工程的场景。
- `none_mpaas_framework`：非 mPaaS 框架托管方式。适用于已有工程接入 H5 容器和离线包的场景，详情请参考 [初始化 - 非框架托管](https://help.aliyun.com/document_detail/112873.html?spm=a2c4g.11186623.6.1033.56694bdch2yOYL#h2-u521Du59CBu5316u5BB9u56681)

<a name="jFPNB"></a>
## 运行Demo
<a name="teHcF"></a>
### Cocoa Pod 接入

1. 执行以下命令，安装 cocoapods-mPaaS 插件。详情请参考 [基于 Cocoa Pod 接入](https://help.aliyun.com/document_detail/106682.html?spm=a2c4g.11186623.6.621.7b5b1ef4nR62il)

	```shell
	sh <(curl -s http://mpaas-ios.oss-cn-hangzhou.aliyuncs.com/cocoapods/installmPaaSCocoaPodsPlugin.sh)
	```

2. 进入 MPH5Demo_pod 目录，执行以下命令，拉取依赖库

	```shell
	1、pod mpaas update --all
	2、pod update
	```

3. 直接打开 .workspace 文件，您就可以运行此 demo了
4.  此 demo 默认连接 mPaaS 公有云的 Demo应用，若您需切换到您自己的 App，请替换 [meta.config 文件](https://tech.antfin.com/docs/2/87321#h2-u4E0Bu8F7Du914Du7F6Eu6587u4EF63)后，重新 pod update
5.  此 demo 默认为 10.1.60基线，若您需要切换基线，打开 Podfile文件，修改 mPaaS_baseline 基线号，支持设置为 10.1.60、10.1.68-beta


<br />

<a name="zlIkG"></a>
### Extension 插件接入

1. 执行以下命令，安装 mPaaS Extension插件，并确认插件版本 >= 1.1.3。详情请参考 [安装 mPaaS Extension](https://help.aliyun.com/document_detail/140597.html?spm=a2c4g.11186623.6.634.4c8765e35GKDkX)

	```shell
	curl -sSL https://mpaas-ios.oss-cn-hangzhou.aliyuncs.com/mpaaskit/Xcode-extension/install.sh | sh
	```

2. 进入 MPH5Demo_plugin 目录打开工程，点击 “Xcode - Editor - mPaaS - 编辑工程 ” 打开插件面板，切换到“工程概览” TAB，点击安装按钮，拉取依赖。拉取时间比较长，请您耐心等待。
![image.png](http://mpaas-demo.oss-cn-hangzhou.aliyuncs.com/readme_images/1.png)<br />

3. 拉取依赖完成后，您就可以运行此 demo了
4. 此 demo 默认连接 mPaaS 公有云的 Demo应用，若您需切换到您自己的 App，请重新导入您的 [meta.config 文件](https://tech.antfin.com/docs/2/87321#h2-u4E0Bu8F7Du914Du7F6Eu6587u4EF63)。
![image.png](http://mpaas-demo.oss-cn-hangzhou.aliyuncs.com/readme_images/meta_config.png)<br />

5. 此 demo 默认为 10.1.60基线，您可以切换到 “升级基线” Tab，选择需要的基线
![image.png](http://mpaas-demo.oss-cn-hangzhou.aliyuncs.com/readme_images/update_baseline.png)
