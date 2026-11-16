// ==============================================================================
// Unit Tests: applicationMapper.js (Phase 4 Gate: T4.1 - T4.2)
// Uses Node's built-in test runner (node:test)
// ==============================================================================

import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  appToDB,
  appFromDB,
  createLegacyFallbackPayload,
} from './applicationMapper.js'

describe('Phase 4: Application Mapper Unit Tests', () => {
  test('T4.1: appToDB includes source & utm_campaign, and appFromDB round-trips correctly', () => {
    const original = {
      id: 'app-12345',
      fullName: 'Aarav Sharma',
      email: 'aarav@galgotiasuniversity.edu.in',
      rollNumber: '22SCSE101001',
      course: 'B.Tech',
      branch: 'CSE',
      year: '3rd Year',
      branchYear: 'B.Tech · CSE · 3rd Year',
      domain: 'Compute',
      github: 'https://github.com/aarav',
      linkedin: 'https://linkedin.com/in/aarav',
      projects: 'CUDA raytracer with BVH acceleration',
      motivation: 'Want to optimize GPU kernels on DGX',
      status: 'Pending',
      source: 'instagram',
      utmCampaign: 'kickstart26',
    }

    const dbRow = appToDB(original)

    // Check DB mapping
    assert.equal(dbRow.source, 'instagram')
    assert.equal(dbRow.utm_campaign, 'kickstart26')
    assert.equal(dbRow.full_name, 'Aarav Sharma')
    assert.equal(dbRow.roll_number, '22SCSE101001')

    // Check round-trip through appFromDB
    const roundTripped = appFromDB(dbRow)
    assert.equal(roundTripped.fullName, original.fullName)
    assert.equal(roundTripped.email, original.email)
    assert.equal(roundTripped.rollNumber, original.rollNumber)
    assert.equal(roundTripped.course, original.course)
    assert.equal(roundTripped.branch, original.branch)
    assert.equal(roundTripped.year, original.year)
    assert.equal(roundTripped.domain, original.domain)
    assert.equal(roundTripped.projects, original.projects)
    assert.equal(roundTripped.motivation, original.motivation)
    assert.equal(roundTripped.source, 'instagram')
    assert.equal(roundTripped.utmCampaign, 'kickstart26')

    // Check missing source becomes null consistently
    const noSourceApp = { ...original, source: undefined, utmCampaign: undefined }
    const noSourceDB = appToDB(noSourceApp)
    assert.equal(noSourceDB.source, null)
    assert.equal(noSourceDB.utm_campaign, null)
  })

  test('T4.2: createLegacyFallbackPayload contains core required fields', () => {
    const app = {
      id: 'app-999',
      fullName: 'Neha Patel',
      email: 'neha@example.com',
      rollNumber: '23EC01',
      course: 'B.Tech',
      branch: 'ECE',
      year: '2nd Year',
      domain: 'Applied AI',
      github: 'https://github.com/neha',
      linkedin: 'https://linkedin.com/in/neha',
      projects: 'Jetson Nano obstacle avoidance',
      motivation: 'Robotics team member',
      status: 'Pending',
      source: 'whatsapp',
      utmCampaign: 'poster_canteen',
    }

    const fallback = createLegacyFallbackPayload(app)

    assert.equal(fallback.id, 'app-999')
    assert.equal(fallback.full_name, 'Neha Patel')
    assert.equal(fallback.email, 'neha@example.com')
    assert.equal(fallback.roll_number, '23EC01')
    assert.equal(fallback.domain, 'Applied AI')
    assert.ok(fallback.branch_year.includes('ECE'))
    assert.ok(fallback.motivation.includes('Jetson Nano'))
    assert.equal(fallback.status, 'Pending')

    // Confirms omitted new columns so remote schema retry succeeds
    assert.equal(fallback.source, undefined)
    assert.equal(fallback.utm_campaign, undefined)
  })
})
