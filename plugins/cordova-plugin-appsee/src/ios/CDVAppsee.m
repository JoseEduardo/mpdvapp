//
//  CDVAppsee.m
//
//  Copyright (c) 2014 Shift 6 LTD. All rights reserved.
//

#import "CDVAppsee.h"
#import <Appsee/Appsee.h>
#import <Foundation/NSException.h>

@implementation CDVAppsee

-(void)start:(CDVInvokedUrlCommand *)command
{
    NSString *key = [command.arguments objectAtIndex:0];
 
    NSLog(@"Start: %@", key);
    
    [Appsee start:key];
//    [Appsee setDebugToNSLog:YES];
}

-(void)stop:(CDVInvokedUrlCommand *)command
{
    [Appsee stop];
}

-(void)stopAndUpload:(CDVInvokedUrlCommand *)command
{
    [Appsee stopAndUpload];
}

-(void)pause:(CDVInvokedUrlCommand *)command
{
    [Appsee pause];
}

-(void)resume:(CDVInvokedUrlCommand *)command
{
    [Appsee resume];
}

-(void)addEvent:(CDVInvokedUrlCommand *)command
{
    NSString *eventName = [command.arguments objectAtIndex:0];
    
    [Appsee addEvent:eventName];
}

-(void)addEventWithProperties:(CDVInvokedUrlCommand *)command
{
    NSString *eventName = [command.arguments objectAtIndex:0];
    NSDictionary *props = [command.arguments objectAtIndex:1];
    
    [Appsee addEvent:eventName withProperties:props];
}

-(void)startScreen:(CDVInvokedUrlCommand *)command
{
    NSString *screenName = [command.arguments objectAtIndex:0];
    
    [Appsee startScreen:screenName];
}

-(void)setUserId:(CDVInvokedUrlCommand *)command
{
    NSString *userId = [command.arguments objectAtIndex:0];
    
    [Appsee setUserID:userId];
}

-(void)setLocation:(CDVInvokedUrlCommand *)command
{
    double lat   = [[command.arguments objectAtIndex:0]doubleValue];
    double lng  = [[command.arguments objectAtIndex:1]doubleValue];
    float  hAcc = [[command.arguments objectAtIndex:2]floatValue];
    float  vAcc   = [[command.arguments objectAtIndex:3]floatValue];
    
    [Appsee setLocation:lat longitude:lng horizontalAccuracy:hAcc verticalAccuracy:vAcc];
}

-(void)setLocationDescription:(CDVInvokedUrlCommand *)command
{
    NSString *desc = [command.arguments objectAtIndex:0];
    
    [Appsee setLocationDescription:desc];
}

-(void)generate3rdPartyID:(CDVInvokedUrlCommand *)command
{
    NSString *systemName = [command.arguments objectAtIndex:0];
    BOOL isPersistent = [[command.arguments objectAtIndex:1] boolValue];
    
    NSString* externalId = [Appsee generate3rdPartyID:systemName persistent:isPersistent];
    
    [self.commandDelegate sendPluginResult:[CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:externalId] callbackId:command.callbackId];
}

-(void)set3rdPartyID:(CDVInvokedUrlCommand *)command
{
    NSString *externalId = [command.arguments objectAtIndex:0];
    NSString *systemName = [command.arguments objectAtIndex:1];
    BOOL isPersistent = [[command.arguments objectAtIndex:2] boolValue];
    
    [Appsee set3rdPartyID:externalId forSystem:systemName persistent:isPersistent];
}


@end
