#!/bin/bash

echo "🔐 Setting up iOS code signing..."

# 1. Generate a unique bundle identifier
YOUR_NAME="jaygautam"  # Change this to your name
BUNDLE_ID="com.$YOUR_NAME.studentcompanion"
echo "📦 Setting Bundle ID: $BUNDLE_ID"

# 2. Update the Xcode project with new bundle ID
/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier $BUNDLE_ID" "ios/Runner/Info.plist"

# 3. Clean the project
flutter clean
rm -rf ios/Pods ios/Podfile.lock

# 4. Get dependencies
flutter pub get
cd ios
pod install
cd ..

# 5. Open Xcode to finish setup
echo "🚀 Opening Xcode... Please complete these steps:"
echo "1. Select 'Runner' in left sidebar"
echo "2. Go to 'Signing & Capabilities' tab"
echo "3. Make sure 'Automatically manage signing' is checked"
echo "4. Select your Apple ID as the team"
echo "5. Close Xcode and run: flutter run"
open ios/Runner.xcworkspace
