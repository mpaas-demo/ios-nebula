//
//  MPParamsViewController.m
//  MPH5Demo_plugin
//
//  Created by yangwei on 2020/2/10.
//  Copyright © 2020 Alibaba. All rights reserved.
//

#import "MPParamsViewController.h"

@interface MPParamsViewController ()

@end

@implementation MPParamsViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
    
    self.title = @"H5Demo";
    self.view.backgroundColor = [UIColor whiteColor];
    
    UIButton *button = [UIButton buttonWithType:UIButtonTypeCustom];
    button.frame = CGRectMake(30, 150, [UIScreen mainScreen].bounds.size.width-60, 44);
    button.backgroundColor = [UIColor blueColor];
    [button setTitle:@"native - H5" forState:UIControlStateNormal];
    [button addTarget:self action:@selector(nativeToH5) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:button];
    
    UIButton *button1 = [UIButton buttonWithType:UIButtonTypeCustom];
    button1.frame = CGRectOffset(button.frame, 0, 80);
    button1.backgroundColor = [UIColor blueColor];
    [button1 setTitle:@"H5 - H5（pushWindow）" forState:UIControlStateNormal];
    [button1 addTarget:self action:@selector(H5ToH5) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:button1];
    
    UIButton *button2 = [UIButton buttonWithType:UIButtonTypeCustom];
    button2.frame = CGRectOffset(button1.frame, 0, 80);
    button2.backgroundColor = [UIColor blueColor];
    [button2 setTitle:@"native - 离线包" forState:UIControlStateNormal];
    [button2 addTarget:self action:@selector(nativeToNebula) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:button2];
    
    UIButton *button3 = [UIButton buttonWithType:UIButtonTypeCustom];
    button3.frame = CGRectOffset(button2.frame, 0, 80);
    button3.backgroundColor = [UIColor blueColor];
    [button3 setTitle:@"离线包 - 离线包（startApp）" forState:UIControlStateNormal];
    [button3 addTarget:self action:@selector(NebulaToNebula) forControlEvents:UIControlEventTouchUpInside];
    [self.view addSubview:button3];
}

- (void)nativeToH5
{
    [[MPNebulaAdapterInterface shareInstance] startH5ViewControllerWithParams:@{@"url": @"https://tech.antfin.com", @"key1":@"value1"}];
}

- (void)H5ToH5
{
    [[MPNebulaAdapterInterface shareInstance] startH5ViewControllerWithParams:@{@"url": @"https://tech.antfin.com"}];
}

- (void)nativeToNebula
{
    [[MPNebulaAdapterInterface shareInstance] startH5ViewControllerWithNebulaApp:@{@"appId":@"70000000",@"key2":@"value2"}];
}

- (void)NebulaToNebula
{
    [[MPNebulaAdapterInterface shareInstance] startH5ViewControllerWithNebulaApp:@{@"appId":@"70000000"}];
}

@end
