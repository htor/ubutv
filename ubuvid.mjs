#!/usr/bin/env node

import { exit } from 'node:process'
import { execSync } from 'node:child_process'
import { JSDOM } from 'jsdom'

function rand(val) {
  return Math.floor(Math.random() * val)
}

async function crawl(href) {
  console.log('CRAWLING:', href)
  const url = new URL(href)
  if (!url.pathname.startsWith('/film')) throw new Error()
  const res = await fetch(url.href)
  const html = await res.text()
  const dom = new JSDOM(html, { url: url.href })
  const document = dom.window.document
  const links = Array.from(document.querySelectorAll(':any-link'))
  const htmlLinks = links.filter(a => a.href.endsWith('.html') && a.href !== 'https://www.ubu.com/index.html')
  const videoLinks = links.filter(a => a.href.match(/.(m4a|mp4|mkv|m4v)$/g))
  if (videoLinks.length) return videoLinks[rand(videoLinks.length)].href
  if (htmlLinks.length) return crawl(htmlLinks[rand(htmlLinks.length)].href)
  throw new Error()
}

const url = 'https://www.ubu.com/film/index.html'
let videoUrl

try {
  videoUrl = await crawl(url)
  console.log('FOUND VIDEO:', videoUrl)
} catch (_) {
  console.log('NO VIDEO FOUND')
  exit(1)
}

try {
  execSync(`open -a /Applications/VLC.app ${videoUrl}`)
} catch (e) {
  console.log('FAILED TO OPEN VIDEO')
  exit(1)
}
