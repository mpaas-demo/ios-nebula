//
//  DemoViewController.m
//  test
//
//  Created by mPaaS on 16/11/21.
//  Copyright © 2016年 Alibaba. All rights reserved.
//

#import "TestDemoViewController.h"
#import "MPNebulaViewController.h"
#import "MPOthersViewController.h"
#import "MPParamsViewController.h"

@interface TestDemoViewController ()

@end

@implementation TestDemoViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view, typically from a nib.
    
    self.title = @"H5容器与离线包";
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
}

- (void)openOnline {
    [[MPNebulaAdapterInterface shareInstance] startH5ViewControllerWithParams:@{@"url": @"https://tech.antfin.com"}];
}

- (void)openNebulaPage
{
    MPNebulaViewController *vc = [[MPNebulaViewController alloc] init];
    [self.navigationController pushViewController:vc animated:YES];
}

- (void)customJsApi
{
//    [[MPNebulaAdapterInterface shareInstance] startH5ViewControllerWithNebulaApp:@{@"appId":@"70000000"}];
    
    [MPNebulaAdapterInterface startTinyAppWithId:@"2018080616290001" params:nil];
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
}
@end
