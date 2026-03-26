@echo off
title Moshrif Enterprise Control Panel
color 0B

echo ===================================================
echo       Moshrif System - Smart Startup 🚀
echo ===================================================
echo.

:: [1] تشغيل الباك إند (سيرفر API) في وضع مصغر
echo [1/4] Starting Backend Server...
start "Moshrif_Backend" /MIN cmd /c "cd 02_Backend_API && python main.py"
timeout /t 2 /nobreak >nul

:: [2] تشغيل محرك الذكاء الاصطناعي (الكاميرا) في وضع مصغر
echo [2/4] Starting AI Face Recognition Engine...
start "Moshrif_Camera" /MIN cmd /c "cd 01_AI_Engine && python face_processor.py"
timeout /t 2 /nobreak >nul

:: [3] تشغيل واجهة الويب (React) - سيتم فتح المتصفح تلقائياً
echo [3/4] Starting React Frontend UI (Opening Browser)...
:: 🔥 شيلنا set BROWSER=none عشان المتصفح يفتح
start "Moshrif_React" /MIN cmd /c "cd 04_Frontend_Web && npm start"

:: ننتظر 5 ثواني عشان ندي فرصة للمتصفح يفتح قبل ما نفتح البرنامج
timeout /t 5 /nobreak >nul

:: [4] تشغيل تطبيق سطح المكتب (Electron) من الفولدر الرئيسي
echo [4/4] Launching Desktop Application (Electron)...
start "Moshrif_Electron" cmd /c "npm start"

echo.
echo ===========================================================
echo ✅ All systems launched successfully!
echo 🌐 Chrome Browser and Desktop App are opening...
echo 🛑 Press ANY KEY in THIS WINDOW to SHUTDOWN all systems...
echo ===========================================================
:: الانتظار لضغط أي زرار للإغلاق
pause >nul

echo.
echo ⚠️ Shutting down all systems... Please wait.

:: إنهاء كل العمليات لمنع بقاء أي ملفات في الخلفية
taskkill /F /FI "WINDOWTITLE eq Moshrif_Backend*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Moshrif_Camera*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Moshrif_React*" /T >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq Moshrif_Electron*" /T >nul 2>&1
:: التأكيد على إغلاق نافذة البرنامج نفسه
taskkill /F /IM electron.exe /T >nul 2>&1

echo ✅ All systems stopped. Goodbye!
timeout /t 2 >nul
exit