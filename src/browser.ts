export function isChrome(): boolean {
    return /Chrome/.test(navigator.userAgent);
}

export function isFirefox(): boolean {
    return /Firefox/.test(navigator.userAgent);
}
