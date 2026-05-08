#!/usr/bin/env node
/**
 * Prepend NODE_OPTIONS with an absolute --require so every Node child (Next workers)
 * loads baseline-env-preload.cjs.
 */
const { spawnSync } = require('node:child_process')
const path = require('node:path')

const preload = path.join(__dirname, 'baseline-env-preload.cjs')
const flag = `--require ${preload}`
process.env.NODE_OPTIONS = process.env.NODE_OPTIONS ? `${process.env.NODE_OPTIONS} ${flag}` : flag

const nextBin = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next')
const result = spawnSync(process.execPath, [nextBin, 'build', '--webpack'], {
  stdio: 'inherit',
  env: process.env,
  cwd: path.join(__dirname, '..'),
})

process.exit(result.status ?? 1)
