//
//  DTFrameworkInterface+MPH5Demo_pod.m
//  MPH5Demo_pod
//
//  Created by yangwei on 2019/03/28. All rights reserved.
//

#import "DTFrameworkInterface+MPH5Demo_pod.h"
#import "MPH5WebViewController.h"
#import "MPH5WKWebView.h"
#import "MPBootLoaderImpl.h"

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-protocol-method-implementation"

@implementation DTFrameworkInterface (MPH5Demo_pod)

- (BOOL)shouldLogReportActive
{
    return YES;
}

- (NSTimeInterval)logReportActiveMinInterval
{
    return 0;
}

- (BOOL)shouldLogStartupConsumption
{
    return YES;
}

- (BOOL)shouldAutoactivateBandageKit
{
    return YES;
}

- (BOOL)shouldAutoactivateShareKit
{
    return YES;
}

- (DTNavigationBarBackTextStyle)navigationBarBackTextStyle
{
    return DTNavigationBarBackTextStyleAlipay;
}

- (void)application:(UIApplication *)application beforeDidFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    // 初始化 rpc
    [MPRpcInterface initRpc];
    
    // 初始化容器
    //    [MPNebulaAdapterInterface initNebula];
    
    // 自定义jsapi路径和预置离线包信息
    NSString *presetApplistPath = [[NSBundle mainBundle] pathForResource:[NSString stringWithFormat:@"DemoCustomPresetApps.bundle/NebulaApplist.plist"] ofType:nil];
    NSString *appPackagePath = [[NSBundle mainBundle] pathForResource:[NSString stringWithFormat:@"DemoCustomPresetApps.bundle"] ofType:nil];
    NSString *pluginsJsapisPath = [[NSBundle mainBundle] pathForResource:[NSString stringWithFormat:@"DemoCustomPlugins.bundle/Poseidon-UserDefine-Extra-Config.plist"] ofType:nil];
    [MPNebulaAdapterInterface initNebulaWithCustomPresetApplistPath:presetApplistPath customPresetAppPackagePath:appPackagePath customPluginsJsapisPath:pluginsJsapisPath];
}

- (void)application:(UIApplication *)application afterDidFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
    // 定制容器
    [MPNebulaAdapterInterface shareInstance].nebulaVeiwControllerClass = [MPH5WebViewController class]; //设置H5容器基类
    [MPNebulaAdapterInterface shareInstance].nebulaWebViewClass = [MPH5WKWebView class];
    [MPNebulaAdapterInterface shareInstance].nebulaUserAgent = @"mPaaS/Portal";//设置H5容器UserAgent
    [MPNebulaAdapterInterface shareInstance].nebulaUseWKArbitrary = YES; //开启 WKWebview
    [MPNebulaAdapterInterface shareInstance].nebulaCommonResourceAppList = @[@"77777777"];// 设置全局资源包
    [MPNebulaAdapterInterface shareInstance].nebulaNeedVerify = NO; // 关闭离线包验签，正式版本请开启验签
    
    // 更新离线包
    [[MPNebulaAdapterInterface shareInstance] requestAllNebulaApps:^(NSDictionary *data, NSError *error) {
        NSLog(@"[mpaas] nebula rpc data :%@", data);
    }];
}

#pragma mark 非框架托管配置
- (DTBootLoader *)bootLoader {
    static MPBootLoaderImpl *_bootLoader;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        _bootLoader = [[MPBootLoaderImpl alloc] init];
    });
    return _bootLoader;
}

- (BOOL)shouldWindowMakeVisable {
    return NO;
}

- (BOOL)shouldShowLauncher {
    return NO;
}

@end

#pragma clang diagnostic pop

