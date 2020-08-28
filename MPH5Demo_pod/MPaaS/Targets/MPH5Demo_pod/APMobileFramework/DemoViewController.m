//
//  DemoViewController.m
//  test
//
//  Created by mPaaS on 16/11/21.
//  Copyright © 2016年 Alibaba. All rights reserved.
//

#define ANTUI_UI_textfields_AUSecurityCodeBox

#import "DemoViewController.h"
#import "MPNebulaViewController.h"
#import "MPOthersViewController.h"
#import "MPParamsViewController.h"
#import <mPaas/MPJSONKit.h>
#import <MPDataCenter/MPDataCenter.h>
//#import <AntUI/AUTextCodeInputBox.h>


@interface DemoViewController ()

@end

@implementation DemoViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view, typically from a nib.
    
    self.title = @"小程序";
    self.view.backgroundColor = [UIColor whiteColor];
    
    UIButton *button = [UIButton buttonWithType:UIButtonTypeCustom];
    button.frame = CGRectMake(30, 150, [UIScreen mainScreen].bounds.size.width-60, 44);
    button.backgroundColor = [UIColor blueColor];
    [button setTitle:@"在线页面" forState:UIControlStateNormal];
    [button addTarget:self action:@selector(openOnline) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:button];
    
    UIButton *button1 = [UIButton buttonWithType:UIButtonTypeCustom];
    button1.frame = CGRectOffset(button.frame, 0, 80);
    button1.backgroundColor = [UIColor blueColor];
    [button1 setTitle:@"离线包" forState:UIControlStateNormal];
    [button1 addTarget:self action:@selector(openNebulaPage) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:button1];
    
    UIButton *button2 = [UIButton buttonWithType:UIButtonTypeCustom];
    button2.frame = CGRectOffset(button1.frame, 0, 80);
    button2.backgroundColor = [UIColor blueColor];
    [button2 setTitle:@"自定义 JsApi" forState:UIControlStateNormal];
    [button2 addTarget:self action:@selector(customJsApi) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:button2];
    
    UIButton *button3 = [UIButton buttonWithType:UIButtonTypeCustom];
    button3.frame = CGRectOffset(button2.frame, 0, 80);
    button3.backgroundColor = [UIColor blueColor];
    [button3 setTitle:@"H5页面传递自定义参数" forState:UIControlStateNormal];
    [button3 addTarget:self action:@selector(transportParams) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:button3];
    
    UIButton *button4 = [UIButton buttonWithType:UIButtonTypeCustom];
    button4.frame = CGRectOffset(button3.frame, 0, 80);
    button4.backgroundColor = [UIColor blueColor];
    [button4 setTitle:@"其他功能" forState:UIControlStateNormal];
    [button4 addTarget:self action:@selector(otherFunction) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:button4];
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(appDidBecomeActive)
                                                 name:UIApplicationDidBecomeActiveNotification
                                               object:nil];
}

- (void)appDidBecomeActive
{
    
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
}

- (void)viewDidAppear:(BOOL)animated
{
    [super viewDidAppear:animated];
}

- (void)openOnline {
//    [[MPNebulaAdapterInterface shareInstance] startH5ViewControllerWithParams:@{@"url": @"https://tech.antfin.com"}];
    
//    [[MPNebulaAdapterInterface shareInstance] startH5ViewControllerWithParams:@{@"url":@"https://m.amap.com"}];
    [[MPNebulaAdapterInterface shareInstance] startH5ViewControllerWithParams:@{@"url":@"https://www.ximalaya.com"}];
}

- (void)openNebulaPage
{
    MPNebulaViewController *vc = [[MPNebulaViewController alloc] init];
    [self.navigationController pushViewController:vc animated:YES];    
}

- (void)customJsApi
{
//    [[MPNebulaAdapterInterface shareInstance] startH5ViewControllerWithNebulaApp:@{@"appId":@"2018080616290001"}];
    
    [MPNebulaAdapterInterface startTinyAppWithId:@"2018080616290001" params:nil];
    
//    AUTextCodeInputBox *box;
}

- (void)transportParams
{
    MPParamsViewController *vc = [[MPParamsViewController alloc] init];
    [self.navigationController pushViewController:vc animated:YES];
}

- (void)otherFunction
{
    MPOthersViewController *vc = [[MPOthersViewController alloc] init];
    [self.navigationController pushViewController:vc animated:YES];
    
//    [APCommonPreferences setString:@"12313123" forKey:@"KDS_HEADERS3" business:@"biz"];
//    NSString *value3 = [APCommonPreferences stringForKey:@"KDS_HEADERS3" business:@"biz" extension:NULL];
//    NSLog(@"yyyyyyyyyy0 %@",value3);

//    [APCommonPreferences setObject:[NSMutableString stringWithString:@"12313123"] forKey:@"KDS_HEADERS1" business:@"biz"];
//    [APCommonPreferences setObject:[NSString stringWithFormat:@"12313123"] forKey:@"KDS_HEADERS2" business:@"biz"];
//    [APCommonPreferences setObject:@"12313123" forKey:@"KDS_HEADERS3" business:@"biz"];
    
//    [APCommonPreferences setString:@"12312123" forKey:@"KDS_HEADERS5" business:@"biz"];
//    [APCommonPreferences setObject:@{@"hexi_name":@"hexi_test"} forKey:@"activePTJYUser" business:@"biz"];
    [APCommonPreferences setString:[@{@"hexi_name":@"hexi_test"} JSONString_mp] forKey:@"activePTJYUser1" business:@"biz"];
//    HXDataTest *dataTest = [[HXDataTest alloc]init];
//    dataTest.name =@"hexi";
//    dataTest.password = @"test";
//    [APCommonPreferences setObject:dataTest forKey:@"activePTJYUser2" business:@"biz"];

    
//    NSString *value1 = [APCommonPreferences stringForKey:@"KDS_HEADERS1" business:@"biz" extension:NULL];
//    NSString *value2 = [APCommonPreferences stringForKey:@"KDS_HEADERS2" business:@"biz" extension:NULL];
//    NSString *value3 = [APCommonPreferences stringForKey:@"KDS_HEADERS3" business:@"biz" extension:NULL];
//    NSString *value6 = [APCommonPreferences stringForKey:@"KDS_HEADERS5" business:@"biz" extension:NULL];
    NSString *value7 = [APCommonPreferences stringForKey:@"activePTJYUser" business:@"biz" extension:NULL];
    NSString *value8 = [APCommonPreferences stringForKey:@"activePTJYUser1" business:@"biz" extension:NULL];
//    NSString *value9 = [APCommonPreferences stringForKey:@"activePTJYUser2" business:@"biz" extension:NULL];
    NSString *value10 = [APCommonPreferences objectForKey:@"activePTJYUser" business:@"biz" extension:NULL];
//    NSLog(@"yyyyyyyyyy1 %@",value1);
    
    NSData *data = [NSPropertyListSerialization dataWithPropertyList:@"12313123" format:NSPropertyListBinaryFormat_v1_0 options:(NSPropertyListWriteOptions)0 error:nil];
    NSString *result = [[NSString alloc] initWithData:data encoding:NSUTF8StringEncoding];
    NSLog(@"yyyyyyyyyy1 %@",result);
    
    
    
    
//    NSString *value = [APCommonPreferences stringForKey:@"KDS_HEADERS" business:@"biz" extension:NULL];
    
//    NSLog(@"yyyyyyyyyy %@",value);
}


@end
