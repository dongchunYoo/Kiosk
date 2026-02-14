#!/bin/bash

# App_React 빌드 스크립트

echo "🚀 AI Kiosk App Build Script"
echo "=============================="
echo ""

# 1. 환경 확인
echo "📋 환경 확인..."
node --version
npm --version
echo ""

# 2. 의존성 설치
echo "📦 의존성 확인..."
npm install
echo ""

# 3. 테스트 실행
echo "🧪 테스트 실행..."
npm test -- --run
if [ $? -ne 0 ]; then
    echo "❌ 테스트 실패!"
    exit 1
fi
echo ""

# 4. TypeScript 컴파일 체크
echo "🔍 TypeScript 체크..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "⚠️  TypeScript 오류가 있지만 계속 진행합니다..."
fi
echo ""

# 5. 빌드 옵션 선택
echo "빌드 옵션을 선택하세요:"
echo "1) 개발 서버 시작 (npm start)"
echo "2) 웹 빌드 (expo export:web)"
echo "3) Android 빌드 (로컬 - Gradle 필요)"
echo "4) EAS Android 빌드 (클라우드)"
echo ""

read -p "선택 (1-4): " choice

case $choice in
  1)
    echo "🌐 개발 서버 시작..."
    npm start
    ;;
  2)
    echo "🌐 웹 빌드 시작..."
    npx expo export --platform web
    echo "✅ 웹 빌드 완료! dist/ 폴더를 확인하세요."
    ;;
  3)
    echo "📱 Android 로컬 빌드..."
    cd android
    ./gradlew assembleRelease
    echo "✅ APK 생성 완료!"
    echo "위치: android/app/build/outputs/apk/release/app-release.apk"
    ;;
  4)
    echo "☁️  EAS Build 시작..."
    npx eas build --platform android --profile production
    ;;
  *)
    echo "❌ 잘못된 선택입니다."
    exit 1
    ;;
esac
