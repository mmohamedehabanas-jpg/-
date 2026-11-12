@echo off
setlocal
set APP_HOME=%~dp0
set WRAPPER_JAR=%APP_HOME%gradle\wrapper\gradle-wrapper.jar

if exist "%WRAPPER_JAR%" (
    java -Xmx2048m -jar "%WRAPPER_JAR%" %*
) else (
    where gradle >nul 2>nul
    if %errorlevel%==0 (
        gradle %*
    ) else (
        echo Error: Neither gradle-wrapper.jar nor system gradle found.
        echo Open the android/ folder in Android Studio or run "gradle wrapper".
        exit /b 1
    )
)
