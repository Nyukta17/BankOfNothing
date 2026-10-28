function isTokenExpired(token: string): boolean {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const { exp } = JSON.parse(jsonPayload);
    // Токен протух, если текущее время больше времени exp (exp указан в секундах, поэтому * 1000)
    // Лучше брать запас в 10-15 секунд (Buffer), чтобы запрос не упал в полете
    return Date.now() >= (exp * 1000) - 10000; 
  } catch {
    return true; // Если токен «битый», считаем его просроченным
  }
}

export default isTokenExpired