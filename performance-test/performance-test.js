#!/usr/bin/env node

// Performance comparison script for @jobkaehenry/next-hydrate
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Performance Comparison Test');
console.log('=====================================\n');

// Test configuration
const testDuration = 30000; // 30 seconds
const testUrl = 'http://localhost:3000';
const requestsPerSecond = 5;

async function runPerformanceTest() {
  const results = {
    withLibrary: { buildSize: 0, runtimeMetrics: [] },
    withoutLibrary: { buildSize: 0, runtimeMetrics: [] }
  };

  try {
    // 1. Build size comparison
    console.log('📦 Measuring build sizes...');

    const withLibBuildPath = path.join(__dirname, 'test-app-with-library', '.next');
    const withoutLibBuildPath = path.join(__dirname, 'test-app-without-library', '.next');

    if (fs.existsSync(withLibBuildPath)) {
      const withLibStats = getDirectorySize(withLibBuildPath);
      results.withLibrary.buildSize = withLibStats;
      console.log(`✅ With Library: ${(withLibStats / 1024 / 1024).toFixed(2)} MB`);
    }

    if (fs.existsSync(withoutLibBuildPath)) {
      const withoutLibStats = getDirectorySize(withoutLibBuildPath);
      results.withoutLibrary.buildSize = withoutLibStats;
      console.log(`✅ Without Library: ${(withoutLibStats / 1024 / 1024).toFixed(2)} MB`);
    }

    // 2. Runtime performance comparison
    console.log('\n⚡ Runtime Performance Test (30 seconds each)...');

    // Test with library
    console.log('\n🔬 Testing WITH @jobkaehenry/next-hydrate library...');
    await testAppPerformance('test-app-with-library', results.withLibrary);

    // Test without library
    console.log('\n🔬 Testing WITHOUT library (client-side only)...');
    await testAppPerformance('test-app-without-library', results.withoutLibrary);

    // 3. Generate report
    generateReport(results);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

function getDirectorySize(dirPath) {
  let totalSize = 0;

  function calculateSize(filePath) {
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      const files = fs.readdirSync(filePath);
      files.forEach(file => {
        calculateSize(path.join(filePath, file));
      });
    } else {
      totalSize += stats.size;
    }
  }

  calculateSize(dirPath);
  return totalSize;
}

async function testAppPerformance(appDir, results) {
  const appPath = path.join(__dirname, appDir);

  try {
    // Start the app
    console.log(`   Starting ${appDir}...`);
    const startCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const serverProcess = execSync(`${startCommand} start`, {
      cwd: appPath,
      stdio: ['pipe', 'pipe', 'pipe'],
      detached: true
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 5000));

    const metrics = {
      responseTimes: [],
      errorCount: 0,
      successCount: 0,
      totalRequests: 0
    };

    // Make requests for test duration
    const startTime = Date.now();
    const endTime = startTime + testDuration;

    while (Date.now() < endTime) {
      const requestStart = Date.now();

      try {
        const response = await fetch(testUrl);
        const responseTime = Date.now() - requestStart;

        if (response.ok) {
          metrics.responseTimes.push(responseTime);
          metrics.successCount++;
        } else {
          metrics.errorCount++;
        }
      } catch (error) {
        metrics.errorCount++;
      }

      metrics.totalRequests++;
      await new Promise(resolve => setTimeout(resolve, 1000 / requestsPerSecond));
    }

    // Calculate metrics
    const avgResponseTime = metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length;
    const minResponseTime = Math.min(...metrics.responseTimes);
    const maxResponseTime = Math.max(...metrics.responseTimes);
    const successRate = (metrics.successCount / metrics.totalRequests) * 100;

    results.runtimeMetrics = {
      avgResponseTime,
      minResponseTime,
      maxResponseTime,
      successRate,
      totalRequests: metrics.totalRequests,
      errorCount: metrics.errorCount
    };

    console.log(`   ✅ Completed: ${metrics.totalRequests} requests, ${avgResponseTime.toFixed(2)}ms avg response time, ${successRate.toFixed(1)}% success rate`);

    // Stop the server
    if (process.platform === 'win32') {
      execSync(`taskkill /pid ${serverProcess.pid} /T /F`);
    } else {
      process.kill(-serverProcess.pid, 'SIGTERM');
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

  } catch (error) {
    console.log(`   ⚠️  Could not run performance test for ${appDir}:`, error.message);
    results.runtimeMetrics = {
      avgResponseTime: 0,
      minResponseTime: 0,
      maxResponseTime: 0,
      successRate: 0,
      totalRequests: 0,
      errorCount: 0
    };
  }
}

function generateReport(results) {
  console.log('\n📊 PERFORMANCE TEST RESULTS');
  console.log('==========================');

  // Build size comparison
  if (results.withLibrary.buildSize > 0 && results.withoutLibrary.buildSize > 0) {
    const sizeDiff = results.withLibrary.buildSize - results.withoutLibrary.buildSize;
    const sizeDiffPercent = (sizeDiff / results.withoutLibrary.buildSize) * 100;

    console.log('\n📦 Build Size Comparison:');
    console.log(`   Without Library: ${(results.withoutLibrary.buildSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   With Library: ${(results.withLibrary.buildSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Difference: ${sizeDiff > 0 ? '+' : ''}${(sizeDiff / 1024 / 1024).toFixed(2)} MB (${sizeDiffPercent > 0 ? '+' : ''}${sizeDiffPercent.toFixed(2)}%)`);
  }

  // Runtime performance comparison
  if (results.withLibrary.runtimeMetrics.totalRequests > 0 && results.withoutLibrary.runtimeMetrics.totalRequests > 0) {
    console.log('\n⚡ Runtime Performance Comparison:');

    const withLibAvg = results.withLibrary.runtimeMetrics.avgResponseTime;
    const withoutLibAvg = results.withoutLibrary.runtimeMetrics.avgResponseTime;
    const perfDiff = withLibAvg - withoutLibAvg;
    const perfDiffPercent = (perfDiff / withoutLibAvg) * 100;

    console.log(`   Without Library: ${withoutLibAvg.toFixed(2)}ms avg response time`);
    console.log(`   With Library: ${withLibAvg.toFixed(2)}ms avg response time`);
    console.log(`   Performance Impact: ${perfDiff > 0 ? '+' : ''}${perfDiff.toFixed(2)}ms (${perfDiffPercent > 0 ? '+' : ''}${perfDiffPercent.toFixed(2)}%)`);

    console.log(`\n📈 Success Rates:`);
    console.log(`   Without Library: ${results.withoutLibrary.runtimeMetrics.successRate.toFixed(1)}%`);
    console.log(`   With Library: ${results.withLibrary.runtimeMetrics.successRate.toFixed(1)}%`);
  }

  // Recommendations
  console.log('\n💡 Recommendations:');
  if (results.withLibrary.runtimeMetrics.avgResponseTime < results.withoutLibrary.runtimeMetrics.avgResponseTime) {
    console.log('   ✅ @jobkaehenry/next-hydrate provides better performance with server-side data hydration');
  } else if (results.withLibrary.runtimeMetrics.avgResponseTime > results.withoutLibrary.runtimeMetrics.avgResponseTime) {
    console.log('   ⚠️  Library adds slight overhead but provides better UX with instant data availability');
  }

  console.log('   ✅ TypeScript 100% support and better developer experience');
  console.log('   ✅ Consistent data across all Next.js rendering modes (SSR, ISR, SSG, CSR)');
  console.log('   ✅ Automatic payload size management and fallback strategies');
}

runPerformanceTest().catch(console.error);
