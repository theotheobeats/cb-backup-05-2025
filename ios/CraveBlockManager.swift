import Foundation
import SwiftUI
import FamilyControls
import DeviceActivity
import ManagedSettings
import React

// MARK: - Picker View
struct PickerView: View {
    @Binding var selection: FamilyActivitySelection
    var onConfirm: () -> Void
    var onCancel: () -> Void
    
    var body: some View {
        NavigationView {
            FamilyActivityPicker(selection: $selection)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Cancel", action: onCancel)
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Confirm", action: onConfirm)
                    }
                }
        }
    }
}

// MARK: - Device Activity Monitor
class CraveBlockMonitor: DeviceActivityMonitor {
    private let blockLevel: CraveBlockManager.BlockLevel
    private let eventCallback: RCTResponseSenderBlock?
    
    init(blockLevel: CraveBlockManager.BlockLevel, eventCallback: RCTResponseSenderBlock? = nil) {
        self.blockLevel = blockLevel
        self.eventCallback = eventCallback
    }
    
    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)
        eventCallback?(["intervalStart", blockLevel.rawValue])
    }
    
    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)
        eventCallback?(["intervalEnd"])
    }
    
    override func eventDidReachThreshold(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
        super.eventDidReachThreshold(event, activity: activity)
        eventCallback?(["thresholdReached", blockLevel.rawValue])
    }
}

// MARK: - Main Module
@objc(CraveBlockManager)
class CraveBlockManager: NSObject {
    static let shared = CraveBlockManager()
    
    private let authorizationCenter = AuthorizationCenter.shared
    private let deviceActivityCenter = DeviceActivityCenter()
    private let store = ManagedSettingsStore()
    private var selection = FamilyActivitySelection()
    private var monitor: CraveBlockMonitor?
    
    private var currentSchedule: DeviceActivitySchedule?
    private var blockLevel: BlockLevel = .gentle
    private var cheatWindow: DateInterval?
    private var eventCallback: RCTResponseSenderBlock?
    
    @objc enum BlockLevel: Int {
        case gentle
        case balanced
        case strict
        case lockdown
        
        var overrideDelayMinutes: Int {
            switch self {
            case .gentle: return 15
            case .balanced: return 30
            case .strict: return 45
            case .lockdown: return 0
            }
        }
        
        var message: String {
            switch self {
            case .gentle: return "Pause for 15 minutes. Still want it? You can override after reflecting."
            case .balanced: return "You've set a 30-minute pause. Take a breather, then decide."
            case .strict: return "45-minute block in place. Confirm you really want to override."
            case .lockdown: return "App is locked until your scheduled period ends. No override allowed."
            }
        }
    }
    
    // MARK: - Authorization
    @objc func requestAuthorization(_ resolve: @escaping RCTPromiseResolveBlock,
                                  rejecter reject: @escaping RCTPromiseRejectBlock) {
        Task {
            do {
                try await authorizationCenter.requestAuthorization(for: .individual)
                resolve(true)
            } catch {
                reject("AUTH_ERROR", "Authorization failed", error)
            }
        }
    }
    
    // MARK: - App Selection
    @objc func selectApps(_ callback: @escaping RCTResponseSenderBlock) {
        DispatchQueue.main.async {
            guard let rootVC = UIApplication.shared.keyWindow?.rootViewController else {
                callback(["Failed to get root view controller"])
                return
            }
            
            let pickerView = PickerView(
                selection: Binding(
                    get: { self.selection },
                    set: { self.selection = $0 }
                ),
                onConfirm: {
                    let bundleIDs = self.selection.applications.compactMap { $0.bundleIdentifier }
                    callback([NSNull(), bundleIDs])
                    rootVC.dismiss(animated: true)
                },
                onCancel: {
                    callback(["User cancelled"])
                    rootVC.dismiss(animated: true)
                }
            )
            
            let hostingController = UIHostingController(rootView: pickerView)
            rootVC.present(hostingController, animated: true)
        }
    }
    
    // MARK: - Schedule Configuration
    @objc func configureSchedule(weekdayStart: NSDictionary,
                                weekdayEnd: NSDictionary,
                                weekendStart: NSDictionary,
                                weekendEnd: NSDictionary,
                                cheatStart: NSDictionary?,
                                cheatEnd: NSDictionary?,
                                resolver resolve: @escaping RCTPromiseResolveBlock,
                                rejecter reject: @escaping RCTPromiseRejectBlock) {
        do {
            let weekdayStartComponents = try validateDateComponents(weekdayStart)
            let weekdayEndComponents = try validateDateComponents(weekdayEnd)
            let weekendStartComponents = try validateDateComponents(weekendStart)
            let weekendEndComponents = try validateDateComponents(weekendEnd)
            
            // For simplicity, we'll use weekday schedule for all days
            // In a real app, you might want to handle weekends differently
            self.currentSchedule = DeviceActivitySchedule(
                intervalStart: weekdayStartComponents,
                intervalEnd: weekdayEndComponents,
                repeats: true
            )
            
            if let cheatStart = cheatStart, let cheatEnd = cheatEnd {
                let start = try validateDateComponents(cheatStart)
                let end = try validateDateComponents(cheatEnd)
                
                if let startDate = Calendar.current.date(from: start),
                   let endDate = Calendar.current.date(from: end) {
                    self.cheatWindow = DateInterval(start: startDate, end: endDate)
                }
            }
            
            resolve(true)
        } catch {
            reject("SCHEDULE_ERROR", "Invalid schedule configuration", error)
        }
    }
    
    private func validateDateComponents(_ dict: NSDictionary) throws -> DateComponents {
        guard let hour = dict["hour"] as? Int, (0...23).contains(hour),
              let minute = dict["minute"] as? Int, (0...59).contains(minute) else {
            throw NSError(domain: "InvalidDateComponents", code: 0, userInfo: nil)
        }
        return DateComponents(hour: hour, minute: minute)
    }
    
    // MARK: - Block Level Configuration
    @objc func setBlockLevel(_ level: Int) {
        self.blockLevel = BlockLevel(rawValue: level) ?? .gentle
    }
    
    // MARK: - Monitoring Control
    @objc func startMonitoring(_ callback: @escaping RCTResponseSenderBlock) {
        guard let schedule = currentSchedule else {
            callback(["No schedule configured"])
            return
        }
        
        // Check if we're in cheat window
        if let cheatWindow = cheatWindow, cheatWindow.contains(Date()) {
            callback(["In cheat window - blocking not activated"])
            return
        }
        
        let activityName = DeviceActivityName("craveBlocking")
        let eventName = DeviceActivityEvent.Name("blockingEvent")
        
        let event = DeviceActivityEvent(
            applications: selection.applicationTokens,
            threshold: DateComponents(minute: blockLevel.overrideDelayMinutes)
        )
        
        self.eventCallback = callback
        self.monitor = CraveBlockMonitor(blockLevel: blockLevel, eventCallback: callback)
        
        do {
            try deviceActivityCenter.startMonitoring(
                activityName,
                during: schedule,
                events: [eventName: event]
            )
            applyShieldRestrictions()
            callback(["Monitoring started"])
        } catch {
            callback(["Error starting monitoring: \(error.localizedDescription)"])
        }
    }
    
    @objc func stopMonitoring() {
        let activityName = DeviceActivityName("craveBlocking")
        deviceActivityCenter.stopMonitoring([activityName])
        store.clearAllSettings()
        self.monitor = nil
    }
    
    // MARK: - Override Handling
    @objc func tryOverrideBlock(_ resolve: @escaping RCTPromiseResolveBlock,
                              rejecter reject: @escaping RCTPromiseRejectBlock) {
        switch blockLevel {
        case .lockdown:
            reject("BLOCKED", blockLevel.message, nil)
        default:
            resolve(blockLevel.message)
        }
    }
    
  private func applyShieldRestrictions() {
      store.shield.applications = selection.applicationTokens.isEmpty ? nil : selection.applicationTokens
      store.shield.applicationCategories = ShieldSettings.ActivityCategoryPolicy.specific(selection.categoryTokens)
      
      switch blockLevel {
      case .lockdown:
          store.shield.webDomainCategories = nil
      
      default:
          store.shield.webDomainCategories = nil
          store.shield.webDomains = nil
      }
  }
    
    // MARK: - Event Subscription
    @objc func subscribeToEvents(_ callback: @escaping RCTResponseSenderBlock) {
        self.eventCallback = callback
    }
}
