export interface CookieInfo {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  expires?: string;
  secure?: boolean;
  httpOnly?: boolean;
}

export class CookieUtils {
  /**
   * Получить все куки в удобном формате
   */
  static getAllCookies(): CookieInfo[] {
    if (!document.cookie) {
      return [];
    }

    return document.cookie.split(';').map(cookie => {
      const [name, value] = cookie.trim().split('=');
      return { name, value };
    });
  }

  /**
   * Получить конкретную куку по имени
   */
  static getCookie(name: string): string | null {
    const cookies = this.getAllCookies();
    const cookie = cookies.find(c => c.name === name);
    return cookie ? cookie.value : null;
  }

  /**
   * Проверить наличие токена в куках
   */
  static hasToken(): boolean {
    const cookies = this.getAllCookies();
    return cookies.some(cookie => 
      cookie.name.toLowerCase().includes('token') || 
      cookie.name.toLowerCase().includes('jwt') ||
      cookie.name.toLowerCase().includes('auth') ||
      cookie.name.toLowerCase().includes('access')
    );
  }

  /**
   * Получить информацию о токене
   */
  static getTokenInfo(): { hasToken: boolean; tokenNames: string[] } {
    const cookies = this.getAllCookies();
    const tokenNames = cookies
      .filter(cookie => 
        cookie.name.toLowerCase().includes('token') || 
        cookie.name.toLowerCase().includes('jwt') ||
        cookie.name.toLowerCase().includes('auth') ||
        cookie.name.toLowerCase().includes('access')
      )
      .map(cookie => cookie.name);

    return {
      hasToken: tokenNames.length > 0,
      tokenNames
    };
  }

  /**
   * Логировать информацию о куках
   */
  static logCookieInfo(context: string): void {
    console.log(`🍪 [COOKIES] ${context}:`);
    console.log(`🍪 [COOKIES] Raw cookies:`, document.cookie);
    
    const cookies = this.getAllCookies();
    console.log(`🍪 [COOKIES] Parsed cookies:`, cookies);
    
    const tokenInfo = this.getTokenInfo();
    console.log(`🍪 [COOKIES] Token info:`, tokenInfo);
  }
} 