//
//  AppDelegate.h
//  picc
//
//  Created by tangtian on 2019/3/19.
//  Copyright © 2019 tangtian. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <Foundation/Foundation.h>

@interface AppDelegate : UIResponder <UIApplicationDelegate>

@property (strong, nonatomic) UIWindow *window;

@property (strong, nonatomic) DFNavigationController *navigationController;

+ (AppDelegate *)sharedInstance;

@end

