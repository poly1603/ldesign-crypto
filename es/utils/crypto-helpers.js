/*!
 * ***********************************
 * @ldesign/crypto v0.1.0          *
 * Built with rollup               *
 * Build time: 2024-10-21 14:32:48 *
 * Build mode: production          *
 * Minified: No                    *
 * ***********************************
 */
import CryptoJS from 'crypto-js';

function getCryptoJSMode(mode) {
  const modeMap = {
    CBC: CryptoJS.mode.CBC,
    CFB: CryptoJS.mode.CFB,
    CTR: CryptoJS.mode.CTR,
    OFB: CryptoJS.mode.OFB,
    ECB: CryptoJS.mode.ECB
  };
  return modeMap[mode.toUpperCase()] || CryptoJS.mode.CBC;
}
function getCryptoJSPadding(padding) {
  const paddingMap = {
    Pkcs7: CryptoJS.pad.Pkcs7,
    AnsiX923: CryptoJS.pad.AnsiX923,
    Iso10126: CryptoJS.pad.Iso10126,
    Iso97971: CryptoJS.pad.Iso97971,
    ZeroPadding: CryptoJS.pad.ZeroPadding,
    NoPadding: CryptoJS.pad.NoPadding
  };
  return paddingMap[padding] || CryptoJS.pad.Pkcs7;
}
function createCryptoJSConfig(options) {
  const config = {
    mode: getCryptoJSMode(options.mode || "CBC")
  };
  if (options.padding) {
    config.padding = getCryptoJSPadding(options.padding);
  }
  if (options.iv && options.mode !== "ECB") {
    config.iv = CryptoJS.enc.Utf8.parse(options.iv);
  }
  return config;
}
function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return String(error);
}

export { createCryptoJSConfig, getCryptoJSMode, getCryptoJSPadding, getErrorMessage };
//# sourceMappingURL=crypto-helpers.js.map
