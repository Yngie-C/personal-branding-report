/**
 * Share Utilities
 * 클립보드 복사 및 SNS 공유 기능
 */

/**
 * 클립보드에 텍스트 복사
 * @param text 복사할 텍스트
 * @returns 성공 여부
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // 최신 Clipboard API 사용 (HTTPS 환경에서만 동작)
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback: execCommand 사용 (deprecated but works in more browsers)
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch (error) {
    console.error('클립보드 복사 실패:', error);
    return false;
  }
}

/**
 * Twitter/X 공유 URL 생성
 * @param text 공유할 텍스트
 * @param url 포함할 URL (선택)
 * @returns Twitter 공유 URL
 */
export function getTwitterShareUrl(text: string, url?: string): string {
  const params = new URLSearchParams();

  let shareText = text;
  if (url) {
    shareText = `${text}\n\n${url}`;
  }

  params.set('text', shareText);

  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

/**
 * LinkedIn 공유 URL 생성
 * @param url 공유할 URL
 * @returns LinkedIn 공유 URL
 */
export function getLinkedInShareUrl(url: string): string {
  const params = new URLSearchParams();
  params.set('url', url);

  return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`;
}

/**
 * 공유 URL 새 창에서 열기
 * @param url 공유 URL
 * @param windowName 창 이름
 */
export function openShareWindow(url: string, windowName: string = 'share'): void {
  const width = 600;
  const height = 500;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;

  window.open(
    url,
    windowName,
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`
  );
}
