//
//  DTBootPhase+Category.m
//  CSMPaaS
//
//  Created by account on 2019/12/26.
//  Copyright © 2019 xzb. All rights reserved.
//

#import "DTBootPhase+Category.h"
#import <NebulaSDK/NBContext.h>
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-protocol-method-implementation"

@implementation DTBootPhase (Category)

+ (DTBootPhase *)setupNavigationController {

    return [DTBootPhase phaseWithName:@"setupNavigationController" block:^{

        UINavigationController *navControl = [[[DTFrameworkInterface sharedInstance] bootLoader] createNavigationController];
        DTContextGet().navigationController = navControl;
        
        //设置容器的window和navigationController
        NBContextGet().navigationController = navControl;
    }];

}

@end

#pragma clang diagnostic pop
