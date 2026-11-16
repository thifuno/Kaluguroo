import { ScrollViewStyleReset, useServerDocumentContext } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// Web-only document shell for every rendered page (static export + dev server).
// This file runs in Node during static rendering, so it must not touch the DOM.

const THEME_COLOR = '#FF7043';
const BACKGROUND_COLOR = '#FAF7F3';

export default function Root({ children }: PropsWithChildren) {
  const { headNodes, bodyNodes, htmlAttributes, bodyAttributes } = useServerDocumentContext();

  return (
    <html lang="th" {...htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="color-scheme" content="light" />
        <meta
          name="description"
          content="Kaluguroo — นับแคลอรี่ สแกนอาหารด้วย AI และติดตามสุขภาพในแอปเดียว"
        />
        <meta name="theme-color" content={THEME_COLOR} />

        {/* Installable web app (PWA). Relative URLs keep it working under a
            GitHub Pages project path such as /Kaluguroo/. */}
        <link rel="manifest" href="manifest.json" />
        <link rel="apple-touch-icon" href="apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kaluguroo" />

        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: documentStyles }} />
        {headNodes}
      </head>
      <body {...bodyAttributes}>
        {children}
        {bodyNodes}
      </body>
    </html>
  );
}

const documentStyles = `
  html, body { background-color: ${BACKGROUND_COLOR}; }
`;
