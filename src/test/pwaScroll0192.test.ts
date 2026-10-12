import { expect, it } from 'vitest'
import fs from 'node:fs'

const css = fs.readFileSync(new URL('../styles/app.css', import.meta.url), 'utf8')

it('keeps the document vertically scrollable in installed standalone mode', () => {
  expect(css).not.toContain('overscroll-behavior-y: none')
  expect(css).toMatch(/@media\s*\(display-mode:\s*standalone\)[\s\S]*html, body\s*\{[\s\S]*overflow-y:\s*auto/)
  expect(css).toMatch(/@media\s*\(display-mode:\s*standalone\)[\s\S]*overscroll-behavior-y:\s*auto/)
  expect(css).toMatch(/body, #root, \.app-shell\s*\{\s*min-height:\s*100dvh/)
})

it('does not trade page scrolling for a fixed-height or touch-locked root', () => {
  const appShellBlock = css.match(/\.app-shell\s*\{([^}]*)\}/)?.[1] ?? ''

  expect(appShellBlock).not.toMatch(/(?:^|;)\s*height\s*:\s*100(?:d)?vh(?:\s*;|$)/)
  expect(css).not.toMatch(/body\s*\{[^}]*overflow:\s*hidden/)
  expect(css).not.toMatch(/body\s*\{[^}]*touch-action:\s*none/)
})

it('preserves mobile navigation clearance and independent Tools scrolling', () => {
  expect(css).toMatch(/\.mobile-bottom-nav\s*\{[\s\S]*position:\s*fixed/)
  expect(css).toMatch(/\.content\s*\{\s*padding:\s*18px 12px calc\(96px \+ env\(safe-area-inset-bottom\)\)/)
  expect(css).toMatch(/\.mobile-tools-sheet\s*\{[\s\S]*overflow-y:\s*auto/)
})
