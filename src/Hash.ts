export function md5sum(text: string) {
    return gethash(text, Utilities.DigestAlgorithm.MD5)
}
export function sha1sum(text: string) {
    return gethash(text, Utilities.DigestAlgorithm.SHA_1)
}
export function sha256sum(text: string) {
    return gethash(text, Utilities.DigestAlgorithm.SHA_256)
}
export function sha384sum(text: string) {
    return gethash(text, Utilities.DigestAlgorithm.SHA_384)
}
export function sha512sum(text: string) {
    return gethash(text, Utilities.DigestAlgorithm.SHA_512)
}

export function gethash(text: string, algorithm: GoogleAppsScript.Utilities.DigestAlgorithm) {
    return Utilities.computeDigest(algorithm, text, Utilities.Charset.UTF_8).map(h => {
        if (h < 0) { h += 256; }
        const t = h.toString(16)
        return t.length === 1 ? '0' + t : t;
    }).join('');
}