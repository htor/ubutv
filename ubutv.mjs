#!/usr/bin/env node

import { writeFileSync } from 'fs'
import { exit } from 'process'
import { spawnSync } from 'child_process'
import { Readable } from 'stream'
import { JSDOM } from 'jsdom'

const cache = {}
const videoUrls = []
const URL = 'https://www.ubu.com/film/index.html'
const PLAYLIST_FILE = '/tmp/ubutv.m3u'
const MAX_VIDEOS = 5

function rand(val) {
  return Math.floor(Math.random() * val)
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function crawl(href) {
  await sleep(3000)
  const url = new URL(href)
  if (!url.pathname.startsWith('/film')) {
    return null
  }
  console.log('CRAWLING:', href)
  let document = cache[href]
  if (!document) {
    let res
    try {
      res = await fetch(url.href)
    } catch (err) {
      return crawl(href)
    }
    const html = await res.text()
    const dom = new JSDOM(html, { url: url.href })
    cache[href] = document = dom.window.document
  }
  const links = Array.from(document.querySelectorAll(':any-link'))
  const htmlLinks = links.filter(a => 
    a.href.endsWith('.html') && a.pathname !== '/index.html')
  const videoLinks = links.filter(a => 
    a.href.match(/.(m4a|mp4|mkv|m4v)$/g))
  if (videoLinks.length) {
    return videoLinks[rand(videoLinks.length)].href
  }
  if (htmlLinks.length) {
    return crawl(htmlLinks[rand(htmlLinks.length)].href)
  }
  return null
}

async function main() {
  while (videoUrls.length < MAX_VIDEOS) {
    let videoUrl
    while (!(videoUrl = await crawl(URL))) {
      console.log('RECRAWLING')
    }
    videoUrls.push(videoUrl)
    const videoIndex = videoUrls.indexOf(videoUrl) + 1
    console.log(`FOUND VIDEO (${videoIndex}/${MAX_VIDEOS}): ${videoUrl}`)
  }
  writeFileSync(PLAYLIST_FILE, videoUrls.join('\n'))
  console.log(`LOOPING ${MAX_VIDEOS} VIDEOS`)
  spawnSync('killall vlc', { shell: true })
  const cmd = spawnSync(`vlc --random -f ${PLAYLIST_FILE}`, { shell: true })
  Readable.from(cmd.stdout).pipe(process.stdout)
  Readable.from(cmd.stderr).pipe(process.stderr)
  if (cmd.status !== 0) throw new Error(cmd.error ? cmd.error : '')
  exit(0)
}

main()
