// Simple UI Overflow Detection Tool for View Details Modal
// This script identifies the specific overflow issues in the course assignment section

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

class OverflowDetector {
    constructor() {
        this.findings = [];
        this.screenshots = [];
    }

    log(message) {
        console.log(message);
        this.findings.push(message);
    }

    async detectOverflow() {
        console.log('🔍 UI OVERFLOW DETECTION TOOL');
        console.log('=============================');
        console.log('Target: View Details Modal - Course Assignment Section');
        console.log('');

        let browser;
        try {
            browser = await puppeteer.launch({
                headless: false,
                defaultViewport: null,
                args: ['--start-maximized']
            });

            const page = await browser.newPage();
            
            // Set a standard viewport to test responsiveness
            await page.setViewport({ width: 1366, height: 768 });

            this.log('📱 Testing on 1366x768 resolution (common laptop size)');

            // Try to connect to the development server
            try {
                await page.goto('http://localhost:3000/admin/user-management', { 
                    waitUntil: 'networkidle0', 
                    timeout: 10000 
                });
                this.log('✅ Connected to development server');
            } catch (error) {
                this.log('❌ Cannot connect to localhost:3000');
                this.log('💡 Solution: Run "npm run dev" in another terminal');
                return;
            }

            // Take initial screenshot
            await page.screenshot({ path: 'overflow-test-initial.png', fullPage: true });
            this.screenshots.push('overflow-test-initial.png');

            // Check page-level overflow
            const pageOverflow = await page.evaluate(() => {
                return {
                    hasOverflow: document.body.scrollWidth > window.innerWidth,
                    pageWidth: document.body.scrollWidth,
                    viewportWidth: window.innerWidth,
                    ratio: (document.body.scrollWidth / window.innerWidth * 100).toFixed(1)
                };
            });

            if (pageOverflow.hasOverflow) {
                this.log(`🚨 PAGE OVERFLOW DETECTED: ${pageOverflow.pageWidth}px > ${pageOverflow.viewportWidth}px (${pageOverflow.ratio}%)`);
            } else {
                this.log(`✅ No page-level overflow: ${pageOverflow.pageWidth}px fits in ${pageOverflow.viewportWidth}px`);
            }

            // Simulate modal opening (we'll inject the modal directly for testing)
            this.log('🎭 Simulating View Details modal...');
            
            const modalHTML = `
                <div id="test-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style="display: block;">
                    <div class="bg-white rounded-lg p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto mx-4">
                        <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
                            <!-- Personal Information -->
                            <div class="xl:col-span-1 border rounded-lg p-4">
                                <h3 class="font-bold mb-4">Personal Information</h3>
                                <div class="space-y-3">
                                    <div><label class="text-sm font-medium text-gray-600">Full Name</label><p class="text-lg">John Doe Student Name</p></div>
                                    <div><label class="text-sm font-medium text-gray-600">Email</label><p>john.doe.student@example.com</p></div>
                                    <div><label class="text-sm font-medium text-gray-600">IC Number</label><p>123456-78-9012</p></div>
                                    <div><label class="text-sm font-medium text-gray-600">Phone</label><p>+60123456789</p></div>
                                    <div><label class="text-sm font-medium text-gray-600">Address</label><p>123 Main Street, Kuala Lumpur, Malaysia</p></div>
                                </div>
                            </div>
                            
                            <!-- Course Management (POTENTIAL OVERFLOW AREA) -->
                            <div class="xl:col-span-1 border rounded-lg p-4">
                                <h3 class="font-bold mb-4">Course Management</h3>
                                <div class="space-y-4">
                                    <!-- Course Assignment -->
                                    <div>
                                        <h4 class="font-medium mb-2">Assign New Course</h4>
                                        <div class="flex gap-2">
                                            <select class="flex-1 border rounded px-3 py-2" style="min-width: 200px;">
                                                <option>Select Course to Assign</option>
                                                <option>Advanced English Speaking Course for Business Professionals - RM 2500</option>
                                                <option>Intensive IELTS Preparation Course with Speaking Practice - RM 3200</option>
                                                <option>Professional Business Communication and Presentation Skills - RM 2800</option>
                                                <option>English Grammar and Writing Fundamentals for Beginners - RM 1800</option>
                                            </select>
                                            <button class="bg-blue-500 text-white px-4 py-2 rounded">Assign</button>
                                        </div>
                                    </div>
                                    
                                    <!-- Enrolled Courses -->
                                    <div>
                                        <h4 class="font-medium mb-2">Enrolled Courses (3)</h4>
                                        <div class="space-y-2 max-h-60 overflow-y-auto">
                                            <div class="flex items-center justify-between p-3 bg-gray-50 rounded">
                                                <div class="flex-1">
                                                    <p class="font-medium">Advanced English Speaking Course for Business Professionals</p>
                                                    <p class="text-sm text-gray-600">Enrolled: 15/01/2024</p>
                                                    <p class="text-sm text-gray-600">Price: RM 2500</p>
                                                </div>
                                                <div class="flex items-center gap-2">
                                                    <span class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">active</span>
                                                    <button class="text-red-500">🗑️</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Payment Management -->
                            <div class="xl:col-span-1 border rounded-lg p-4">
                                <h3 class="font-bold mb-4">Payment Management</h3>
                                <div class="space-y-4">
                                    <div>
                                        <h4 class="font-medium mb-2">Add Manual Payment</h4>
                                        <div class="space-y-3">
                                            <div class="flex gap-2">
                                                <input placeholder="Amount (RM)" type="number" class="flex-1 border rounded px-3 py-2" />
                                                <select class="border rounded px-3 py-2">
                                                    <option>Cash</option>
                                                    <option>Bank Transfer</option>
                                                </select>
                                            </div>
                                            <input placeholder="Admin notes (optional)" class="w-full border rounded px-3 py-2" />
                                            <button class="w-full bg-blue-500 text-white px-4 py-2 rounded">Add Payment</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Inject the modal
            await page.evaluate((html) => {
                document.body.insertAdjacentHTML('beforeend', html);
            }, modalHTML);

            await page.waitForTimeout(1000);

            // Take screenshot with modal
            await page.screenshot({ path: 'overflow-test-modal.png', fullPage: true });
            this.screenshots.push('overflow-test-modal.png');

            // Analyze modal overflow
            const modalAnalysis = await page.evaluate(() => {
                const modal = document.querySelector('#test-modal > div');
                const courseSelect = document.querySelector('#test-modal select');
                const modalContent = document.querySelector('#test-modal .grid');
                
                if (!modal) return { error: 'Modal not found' };

                const modalRect = modal.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;

                const analysis = {
                    modal: {
                        width: modalRect.width,
                        height: modalRect.height,
                        x: modalRect.x,
                        y: modalRect.y,
                        overflowsRight: modalRect.right > viewportWidth,
                        overflowsBottom: modalRect.bottom > viewportHeight,
                        className: modal.className
                    },
                    viewport: {
                        width: viewportWidth,
                        height: viewportHeight
                    },
                    courseSelect: null,
                    gridLayout: null
                };

                if (courseSelect) {
                    const selectRect = courseSelect.getBoundingClientRect();
                    analysis.courseSelect = {
                        width: selectRect.width,
                        height: selectRect.height,
                        x: selectRect.x,
                        y: selectRect.y,
                        overflowsRight: selectRect.right > viewportWidth,
                        scrollWidth: courseSelect.scrollWidth,
                        offsetWidth: courseSelect.offsetWidth
                    };
                }

                if (modalContent) {
                    const contentRect = modalContent.getBoundingClientRect();
                    analysis.gridLayout = {
                        width: contentRect.width,
                        height: contentRect.height,
                        gridTemplateColumns: getComputedStyle(modalContent).gridTemplateColumns,
                        gap: getComputedStyle(modalContent).gap,
                        overflowsRight: contentRect.right > viewportWidth
                    };
                }

                return analysis;
            });

            // Report findings
            this.log('\n📊 MODAL ANALYSIS RESULTS:');
            if (modalAnalysis.error) {
                this.log(`❌ ${modalAnalysis.error}`);
                return;
            }

            const { modal, viewport, courseSelect, gridLayout } = modalAnalysis;

            this.log(`📐 Modal Dimensions: ${modal.width.toFixed(0)}px × ${modal.height.toFixed(0)}px`);
            this.log(`📱 Viewport: ${viewport.width}px × ${viewport.height}px`);

            if (modal.overflowsRight) {
                this.log(`🚨 MODAL OVERFLOW: Modal extends ${(modal.width - viewport.width).toFixed(0)}px beyond right edge!`);
                this.log(`   Modal right edge: ${modal.x + modal.width}px`);
                this.log(`   Viewport width: ${viewport.width}px`);
            } else {
                this.log(`✅ Modal fits horizontally with ${(viewport.width - modal.width).toFixed(0)}px margin`);
            }

            if (courseSelect) {
                this.log(`\n🎯 COURSE SELECT ANALYSIS:`);
                this.log(`   Select width: ${courseSelect.width.toFixed(0)}px`);
                this.log(`   Scroll width: ${courseSelect.scrollWidth}px`);
                
                if (courseSelect.overflowsRight) {
                    this.log(`🚨 COURSE SELECT OVERFLOW: Extends beyond viewport!`);
                } else {
                    this.log(`✅ Course select fits within viewport`);
                }

                if (courseSelect.scrollWidth > courseSelect.offsetWidth) {
                    this.log(`⚠️ Course select has internal overflow (long option text)`);
                }
            }

            if (gridLayout) {
                this.log(`\n📊 GRID LAYOUT ANALYSIS:`);
                this.log(`   Grid width: ${gridLayout.width.toFixed(0)}px`);
                this.log(`   Grid columns: ${gridLayout.gridTemplateColumns}`);
                this.log(`   Grid gap: ${gridLayout.gap}`);
                
                if (gridLayout.overflowsRight) {
                    this.log(`🚨 GRID OVERFLOW: Grid layout extends beyond viewport!`);
                } else {
                    this.log(`✅ Grid layout fits within viewport`);
                }
            }

            // Test different viewport sizes
            this.log('\n📱 RESPONSIVE TESTING:');
            
            const testSizes = [
                { width: 1920, height: 1080, name: 'Desktop Large' },
                { width: 1366, height: 768, name: 'Laptop Standard' },
                { width: 1024, height: 768, name: 'Tablet Landscape' },
                { width: 768, height: 1024, name: 'Tablet Portrait' }
            ];

            for (const size of testSizes) {
                await page.setViewport(size);
                await page.waitForTimeout(500);

                const sizeTest = await page.evaluate(() => {
                    const modal = document.querySelector('#test-modal > div');
                    if (!modal) return null;

                    const rect = modal.getBoundingClientRect();
                    return {
                        modalWidth: rect.width,
                        viewportWidth: window.innerWidth,
                        overflows: rect.right > window.innerWidth,
                        margin: window.innerWidth - rect.width
                    };
                });

                if (sizeTest) {
                    const status = sizeTest.overflows ? '🚨 OVERFLOW' : '✅ OK';
                    const margin = sizeTest.overflows ? 
                        `Exceeds by ${(sizeTest.modalWidth - sizeTest.viewportWidth).toFixed(0)}px` :
                        `Margin: ${sizeTest.margin.toFixed(0)}px`;
                    
                    this.log(`   ${size.name} (${size.width}px): ${status} - ${margin}`);
                }

                // Screenshot for each size
                await page.screenshot({ path: `overflow-test-${size.width}x${size.height}.png` });
                this.screenshots.push(`overflow-test-${size.width}x${size.height}.png`);
            }

            // Generate recommendations
            this.generateRecommendations(modalAnalysis);

        } catch (error) {
            this.log(`❌ Test failed: ${error.message}`);
        } finally {
            if (browser) {
                await browser.close();
            }
        }

        // Save report
        this.saveReport();
    }

    generateRecommendations(analysis) {
        this.log('\n💡 OVERFLOW FIX RECOMMENDATIONS:');
        this.log('================================');

        if (analysis.modal?.overflowsRight || analysis.gridLayout?.overflowsRight) {
            this.log('🔧 PRIMARY FIXES:');
            this.log('   1. Change max-w-6xl to max-w-4xl or max-w-5xl in modal');
            this.log('   2. Add responsive grid: grid-cols-1 md:grid-cols-2 xl:grid-cols-3');
            this.log('   3. Ensure modal has proper margin: mx-4 md:mx-8');
        }

        if (analysis.courseSelect?.scrollWidth > analysis.courseSelect?.offsetWidth) {
            this.log('🎯 COURSE SELECT FIXES:');
            this.log('   1. Add text truncation: truncate or text-ellipsis');
            this.log('   2. Set max-width on select element');
            this.log('   3. Use shorter course names or abbreviations');
        }

        this.log('\n📝 CSS FIXES TO IMPLEMENT:');
        this.log('```tsx');
        this.log('// Replace the modal div with:');
        this.log('<div className="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto mx-4 md:mx-8">');
        this.log('  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">');
        this.log('    {/* content */}');
        this.log('  </div>');
        this.log('</div>');
        this.log('');
        this.log('// For the course select:');
        this.log('<select className="flex-1 border rounded px-3 py-2 max-w-full truncate">');
        this.log('```');
    }

    saveReport() {
        const report = {
            timestamp: new Date().toISOString(),
            findings: this.findings,
            screenshots: this.screenshots,
            testTarget: 'View Details Modal - Course Assignment Overflow'
        };

        fs.writeFileSync('overflow-detection-report.json', JSON.stringify(report, null, 2));

        this.log('\n📄 REPORT SAVED:');
        this.log('   - overflow-detection-report.json');
        this.log(`   - ${this.screenshots.length} screenshots captured`);
        this.log('\n🎯 Next: Apply the recommended CSS fixes to resolve overflow issues');
    }
}

// Run the overflow detection
const detector = new OverflowDetector();
detector.detectOverflow().catch(console.error);
