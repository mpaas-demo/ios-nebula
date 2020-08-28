//
//  MPBootLoaderImpl.m
//  Portal
//
//  Created by yemingyu on 2019/6/24.
//  Copyright © 2019 Alibaba. All rights reserved.
//

#import "MPBootLoaderImpl.h"
#import "AppDelegate.h"

@implementation MPBootLoaderImpl

- (UINavigationController *)createNavigationController
{
    return [AppDelegate sharedInstance].navigationController;
}

- (UIWindow *)createWindow
{
    return [AppDelegate sharedInstance].window;
}

@end
