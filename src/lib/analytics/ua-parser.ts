/**
 * Lightweight, zero-dependency User-Agent Parser
 * Designed for Cloudflare Edge Runtime and Node.js environments.
 */

export interface ParsedUserAgent {
  device: 'Mobile' | 'Tablet' | 'Desktop';
  os: string;
  browser: string;
  deviceModel: string;
  combination: string; // e.g. "iPhone • Safari", "Windows • Chrome"
}

export function parseUserAgent(ua: string = ''): ParsedUserAgent {
  if (!ua || typeof ua !== 'string') {
    return {
      device: 'Desktop',
      os: 'Unknown OS',
      browser: 'Unknown Browser',
      deviceModel: 'Generic Device',
      combination: 'Other • Unknown',
    };
  }

  const lower = ua.toLowerCase();

  // 1. Determine Device Type & Model
  let device: 'Mobile' | 'Tablet' | 'Desktop' = 'Desktop';
  let deviceModel = 'Desktop PC';

  if (/ipad|tablet|(android(?!.*mobi))|playbook|silk/i.test(lower)) {
    device = 'Tablet';
    if (/ipad/i.test(lower)) {
      deviceModel = 'iPad';
    } else {
      deviceModel = 'Tablet';
    }
  } else if (/iphone|ipod|android.*mobile|blackberry|iemobile|opera mini|mobile/i.test(lower)) {
    device = 'Mobile';
    if (/iphone/i.test(lower)) {
      deviceModel = 'iPhone';
    } else if (/android/i.test(lower)) {
      deviceModel = 'Android Phone';
    } else {
      deviceModel = 'Mobile';
    }
  } else if (/macintosh|mac os x/i.test(lower)) {
    device = 'Desktop';
    deviceModel = 'Mac';
  } else if (/windows/i.test(lower)) {
    device = 'Desktop';
    deviceModel = 'Windows PC';
  } else if (/cros/i.test(lower)) {
    device = 'Desktop';
    deviceModel = 'Chromebook';
  } else if (/linux/i.test(lower)) {
    device = 'Desktop';
    deviceModel = 'Linux Desktop';
  }

  // 2. Determine OS
  let os = 'Unknown OS';
  if (/iphone|ipad|ipod/i.test(lower)) {
    const match = ua.match(/OS (\d+[._]\d+)/i);
    const version = match ? match[1].replace('_', '.') : '';
    os = version ? `iOS ${version}` : 'iOS';
  } else if (/android/i.test(lower)) {
    const match = ua.match(/Android (\d+(\.\d+)?)/i);
    const version = match ? match[1] : '';
    os = version ? `Android ${version}` : 'Android';
  } else if (/macintosh|mac os x/i.test(lower)) {
    os = 'macOS';
  } else if (/windows nt 10\.0/i.test(lower)) {
    os = 'Windows 10/11';
  } else if (/windows nt 6\.3/i.test(lower)) {
    os = 'Windows 8.1';
  } else if (/windows nt 6\.1/i.test(lower)) {
    os = 'Windows 7';
  } else if (/windows/i.test(lower)) {
    os = 'Windows';
  } else if (/cros/i.test(lower)) {
    os = 'ChromeOS';
  } else if (/linux/i.test(lower)) {
    os = 'Linux';
  }

  // 3. Determine Browser
  let browser = 'Unknown Browser';
  if (/edg\/|edge\//i.test(lower)) {
    browser = 'Edge';
  } else if (/samsungbrowser\//i.test(lower)) {
    browser = 'Samsung Internet';
  } else if (/opr\/|opera\//i.test(lower)) {
    browser = 'Opera';
  } else if (/crios\/|chrome\//i.test(lower)) {
    browser = 'Chrome';
  } else if (/fxios\/|firefox\//i.test(lower)) {
    browser = 'Firefox';
  } else if (/version\/.*safari\//i.test(lower) || (/safari\//i.test(lower) && !/chrome\//i.test(lower))) {
    browser = 'Safari';
  } else {
    browser = 'Other';
  }

  // 4. Clean Combination Label (e.g. "iPhone • Safari", "Windows • Chrome")
  let baseDevice = deviceModel;
  if (deviceModel === 'Desktop PC') {
    baseDevice = os.startsWith('Windows') ? 'Windows' : os;
  } else if (deviceModel === 'Android Phone') {
    baseDevice = 'Android';
  }

  const combination = `${baseDevice} • ${browser}`;

  return {
    device,
    os,
    browser,
    deviceModel,
    combination,
  };
}
