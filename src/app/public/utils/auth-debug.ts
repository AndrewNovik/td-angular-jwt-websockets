export class AuthDebug {
  /**
   * Полная диагностика состояния авторизации
   */
  static diagnoseAuthState(): void {
    console.log('🔍 [AUTH DEBUG] === DIAGNOSIS START ===');
    
    // Проверяем куки
    console.log('🔍 [AUTH DEBUG] Cookies check:');
    console.log('🔍 [AUTH DEBUG] - Raw cookies:', document.cookie);
    console.log('🔍 [AUTH DEBUG] - Has token in cookies:', document.cookie.includes('token') || document.cookie.includes('jwt'));
    
    // Проверяем localStorage
    console.log('🔍 [AUTH DEBUG] LocalStorage check:');
    const userState = localStorage.getItem('user_state');
    const lastPath = localStorage.getItem('last_path');
    console.log('🔍 [AUTH DEBUG] - User state exists:', !!userState);
    console.log('🔍 [AUTH DEBUG] - Last path exists:', !!lastPath);
    
    if (userState) {
      try {
        const parsed = JSON.parse(userState);
        console.log('🔍 [AUTH DEBUG] - User isAuthenticated:', parsed.isAuthenticated);
        console.log('🔍 [AUTH DEBUG] - User data:', parsed);
      } catch (e) {
        console.error('🔍 [AUTH DEBUG] - Error parsing user state:', e);
      }
    }
    
    // Проверяем текущий URL
    console.log('🔍 [AUTH DEBUG] Current URL:', window.location.pathname);
    
    console.log('🔍 [AUTH DEBUG] === DIAGNOSIS END ===');
  }
  
  /**
   * Проверка проблем с CORS и куками
   */
  static checkCorsIssues(): void {
    console.log('🔍 [AUTH DEBUG] === CORS CHECK ===');
    
    // Проверяем, есть ли проблемы с CORS
    const currentOrigin = window.location.origin;
    console.log('🔍 [AUTH DEBUG] Current origin:', currentOrigin);
    
    // Проверяем, работает ли с куками
    const hasCookies = document.cookie.length > 0;
    console.log('🔍 [AUTH DEBUG] Has any cookies:', hasCookies);
    
    if (!hasCookies) {
      console.warn('🔍 [AUTH DEBUG] ⚠️ No cookies found - possible CORS issue');
      console.warn('🔍 [AUTH DEBUG] ⚠️ Backend might not be setting cookies properly');
    }
    
    console.log('🔍 [AUTH DEBUG] === CORS CHECK END ===');
  }
  
  /**
   * Рекомендации по исправлению
   */
  static getRecommendations(): void {
    console.log('🔍 [AUTH DEBUG] === RECOMMENDATIONS ===');
    
    const hasTokenInCookies = document.cookie.includes('token') || 
                             document.cookie.includes('jwt') || 
                             document.cookie.includes('access_token') ||
                             document.cookie.includes('auth_check');
    
    if (!hasTokenInCookies) {
      console.log('🔍 [AUTH DEBUG] 🚨 ISSUE: No auth token in cookies');
      console.log('🔍 [AUTH DEBUG] 📋 BACKEND FIXES NEEDED:');
      console.log('🔍 [AUTH DEBUG] 1. Ensure CORS is configured with credentials: true');
      console.log('🔍 [AUTH DEBUG] 2. Set proper Set-Cookie header in login response');
      console.log('🔍 [AUTH DEBUG] 3. Check cookie settings (httpOnly, secure, sameSite)');
      console.log('🔍 [AUTH DEBUG] 4. Verify domain and path settings for cookies');
    } else {
      console.log('🔍 [AUTH DEBUG] ✅ SUCCESS: Auth cookies are properly set!');
      console.log('🔍 [AUTH DEBUG] 🎉 Backend configuration is working correctly');
      
      // Проверяем конкретные куки
      if (document.cookie.includes('access_token')) {
        console.log('🔍 [AUTH DEBUG] ✅ access_token cookie found');
      }
      if (document.cookie.includes('auth_check')) {
        console.log('🔍 [AUTH DEBUG] ✅ auth_check cookie found');
      }
    }
    
    console.log('🔍 [AUTH DEBUG] === RECOMMENDATIONS END ===');
  }
} 