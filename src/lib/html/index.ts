/**
 * HTML processing utilities
 * Pure utility functions for HTML manipulation
 */

/* eslint-disable no-param-reassign */
function processHtml(html: string) {
  if (!html) return '';

  html = html.replace(/style="[^"]*"/g, '');
  html = html.replace(/<br[^>]*>/g, '');
  html = html.replace(/<img[^>]*>/g, '');
  html = html.replace(/<!--[^>]*-->/g, '');
  html = html.replace(/<script[^>]*>[^<]*<\/script>/g, '');
  return html.replace(/<link[^>]*>/g, '');
}

export function stripHtmlToText(html: string) {
  if (!html) return '';

  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default processHtml;
