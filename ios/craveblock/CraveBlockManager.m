#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RCT_EXTERN_MODULE(CraveBlockManager, NSObject)

RCT_EXTERN_METHOD(requestAuthorization:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(selectApps:(RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(configureSchedule:(NSDictionary *)weekdayStart
                  weekdayEnd:(NSDictionary *)weekdayEnd
                  weekendStart:(NSDictionary *)weekendStart
                  weekendEnd:(NSDictionary *)weekendEnd
                  cheatStart:(NSDictionary *)cheatStart
                  cheatEnd:(NSDictionary *)cheatEnd
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(setBlockLevel:(NSInteger)level)

RCT_EXTERN_METHOD(startMonitoring:(RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(stopMonitoring)

RCT_EXTERN_METHOD(tryOverrideBlock:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(subscribeToEvents:(RCTResponseSenderBlock)callback)

@end
