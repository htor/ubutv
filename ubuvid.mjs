#!/usr/bin/env node

import { writeFileSync } from 'fs'
import { exit } from 'process'
import { spawnSync } from 'child_process'
import { Readable } from 'stream'
import { JSDOM } from 'jsdom'

const cache = {}
const url = 'https://www.ubu.com/film/index.html'
const videoUrls = []
let videoUrl

function rand(val) {
  return Math.floor(Math.random() * val)
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function crawl(href) {
  const url = new URL(href)
  if (!url.pathname.startsWith('/film')) return null
  let document = cache[href]
  if (!document) {
    const res = await fetch(url.href)
    const html = await res.text()
    const dom = new JSDOM(html, { url: url.href })
    cache[href] = document = dom.window.document
  }
  const links = Array.from(document.querySelectorAll(':any-link'))
  const htmlLinks = links.filter(a => a.href.endsWith('.html') && a.pathname !== '/index.html')
  const videoLinks = links.filter(a => a.href.match(/.(m4a|mp4|mkv|m4v)$/g))
  if (videoLinks.length) return videoLinks[rand(videoLinks.length)].href
  if (htmlLinks.length) return crawl(htmlLinks[rand(htmlLinks.length)].href)
  return null
}

async function main() {
  while (videoUrls.length < 5) {
    videoUrl = await crawl(url)
    while (!videoUrl) {
      await sleep(3000)
      videoUrl = await crawl(url)
    }
    videoUrls.push(videoUrl)
  }
  writeFileSync('/tmp/ubu.m3u', videoUrls.join('\n'))
  const cmd = spawnSync('vlc --random -f /tmp/ubu.m3u', { shell: true })
  Readable.from(cmd.stdout).pipe(process.stdout)
  Readable.from(cmd.stderr).pipe(process.stderr)

  if (cmd.status !== 0) {
    throw new Error(cmd.error ? cmd.error : '')
  }
}

main()
