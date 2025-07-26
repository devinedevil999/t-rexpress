// Global variables
let activityLog = [];
let currentRegex = null;
let regexHistory = [];
let activeHistoryIndex = -1;
let currentTheme = 'kiro';
let explanationExpanded = false;

// Initialize the app
document.addEventListener('DOMContentLoaded', async function () {
    try {
        logActivity('🦖 T-ReXpress awakened', 'The regex T-Rex is ready to hunt patterns!');

        // Set up keyboard shortcuts
        setupKeyboardShortcuts();

        // Load history from localStorage
        loadHistory();

        // Load theme preference
        loadTheme();

        // Test Puter API availability
        await testPuterAPI();

        logActivity('🦖 T-ReXpress ready', 'All systems roaring and ready to devour text patterns!');
    } catch (error) {
        console.error('Initialization error:', error);
        logActivity('Initialization error', error.message);
    }
});

// Set up keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey) {
            switch (e.key.toLowerCase()) {
                case 'g':
                    e.preventDefault();
                    generateRegex();
                    break;
                case 't':
                    e.preventDefault();
                    testPuterAPI();
                    break;
                case 'r':
                    e.preventDefault();
                    clearAll();
                    break;
                case 'd':
                    e.preventDefault();
                    downloadLog();
                    break;
            }
        }
    });

    logActivity('🦖 T-Rex shortcuts activated', 'Ctrl+G: Hunt patterns, Ctrl+T: Test claws, Ctrl+R: Reset hunt, Ctrl+D: Save trophy');
}

// Main function to generate regex
async function generateRegex() {
    const englishInput = document.getElementById('englishInput').value.trim();
    const sampleInput = document.getElementById('sampleInput').value.trim();

    if (!englishInput && !sampleInput) {
        showStatus('Please provide either an English description or sample text.', 'error');
        return;
    }

    showStatus('🦖 T-ReXpress is hunting your pattern...', 'success');
    logActivity('🦖 Pattern hunt started', `T-Rex is stalking: "${englishInput || sampleInput}"`);

    try {
        let regex;
        let description;

        if (sampleInput) {
            // Use Puter AI to analyze sample and generate regex
            const result = await generateRegexWithPuter(
                `Analyze this sample text and generate a regex pattern that would match similar content: "${sampleInput}". Return only the regex pattern without delimiters.`
            );
            regex = result.regex;
            description = result.description || 'Pattern detected from sample';
            logActivity('Sample analysis completed', `Pattern detected: ${description}`);
        } else {
            // Use Puter AI to convert English to regex
            const result = await generateRegexWithPuter(
                `Convert this English description to a regex pattern: "${englishInput}". Return only the regex pattern without delimiters.`
            );
            regex = result.regex;
            description = englishInput;
        }

        if (regex) {
            currentRegex = regex;
            displayRegex(regex, description);
            await generateTestCases(regex, description);

            // Add to history
            addToHistory(englishInput || sampleInput, regex, description);

            // Generate explanation
            await generateExplanation(regex, description);

            logActivity('🦖 Pattern captured!', `T-Rex caught: ${regex}`);
        } else {
            showStatus('🦖 T-ReXpress couldn\'t catch that pattern!', 'error');
            logActivity('🦖 Hunt failed', 'T-Rex lost the scent - no valid pattern detected');
        }

    } catch (error) {
        showStatus(`Error: ${error.message}`, 'error');
        logActivity('Error occurred', error.message);
    }
}

// Analyze sample text to generate regex
function analyzeSample(sample) {
    const patterns = [
        {
            name: 'Email addresses',
            regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
            test: (text) => /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(text)
        },
        {
            name: 'Phone numbers (US format)',
            regex: /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
            test: (text) => /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text)
        },
        {
            name: 'URLs',
            regex: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g,
            test: (text) => /https?:\/\//.test(text)
        },
        {
            name: 'IP addresses',
            regex: /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g,
            test: (text) => /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/.test(text)
        },
        {
            name: 'Credit card numbers',
            regex: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
            test: (text) => /\b(?:\d{4}[-\s]?){3}\d{4}\b/.test(text)
        },
        {
            name: 'Dates (MM/DD/YYYY)',
            regex: /\b(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}\b/g,
            test: (text) => /\b(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/\d{4}\b/.test(text)
        },
        {
            name: 'Social Security Numbers',
            regex: /\b\d{3}-\d{2}-\d{4}\b/g,
            test: (text) => /\b\d{3}-\d{2}-\d{4}\b/.test(text)
        },
        {
            name: 'Hexadecimal colors',
            regex: /#[0-9A-Fa-f]{6}\b/g,
            test: (text) => /#[0-9A-Fa-f]{6}\b/.test(text)
        }
    ];

    for (let pattern of patterns) {
        if (pattern.test(sample)) {
            return {
                regex: pattern.regex.source,
                description: pattern.name
            };
        }
    }

    // If no specific pattern found, try to create a basic pattern
    const words = sample.split(/\s+/);
    if (words.length === 1) {
        return {
            regex: escapeRegex(sample),
            description: 'Exact match for provided text'
        };
    }

    return {
        regex: words.map(escapeRegex).join('\\s+'),
        description: 'Word sequence match'
    };
}

// Test Puter API availability
async function testPuterAPI() {
    try {
        // Wait for Puter to be available
        if (typeof puter === 'undefined') {
            logActivity('Puter API Status', 'Puter API not yet loaded, waiting...');

            // Wait a bit for the script to load
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (typeof puter === 'undefined') {
                throw new Error('Puter API not available after waiting');
            }
        }

        // Test a simple API call
        const testResponse = await puter.ai.chat([
            {
                role: 'user',
                content: 'Say "Hello" if you can hear me.'
            }
        ]);

        logActivity('Puter API Status', `✓ Connected successfully. Response: ${testResponse.message.content}`);
        showStatus('🦖 T-ReXpress AI brain is online and roaring!', 'success');

        return true;

    } catch (error) {
        logActivity('Puter API Status', `✗ Connection failed: ${error.message}`);
        showStatus('🦖 T-ReXpress AI sleeping - using prehistoric instincts', 'error');

        return false;
    }
}

// Use Puter AI to generate regex
async function generateRegexWithPuter(prompt) {
    try {
        // Check if Puter is available
        if (typeof puter === 'undefined') {
            throw new Error('Puter API not available');
        }

        logActivity('Puter AI Request', `Sending prompt: ${prompt.substring(0, 100)}...`);

        // Use Puter's AI service to generate regex
        const response = await puter.ai.chat([
            {
                role: 'system',
                content: 'You are a regex expert. Generate accurate regular expressions based on user descriptions. Return only the regex pattern without delimiters or explanations. Make sure the regex is properly escaped for JavaScript.'
            },
            {
                role: 'user',
                content: prompt
            }
        ]);

        let regexPattern = response.message.content.trim();
        logActivity('Puter AI Response', `Raw response: ${regexPattern}`);

        // Clean up the response - remove common delimiters if present
        regexPattern = regexPattern.replace(/^\/|\/[gimuy]*$/g, '');
        regexPattern = regexPattern.replace(/^`|`$/g, '');
        regexPattern = regexPattern.replace(/^```|```$/g, '');

        // Validate the regex
        try {
            new RegExp(regexPattern);
            logActivity('Regex Validation', `✓ Valid regex: ${regexPattern}`);
        } catch (e) {
            throw new Error(`Invalid regex generated: ${e.message}`);
        }

        return {
            regex: regexPattern,
            description: 'Generated by Puter AI'
        };

    } catch (error) {
        logActivity('Puter AI Error', error.message);

        // Fallback to basic pattern matching if Puter fails
        const fallbackRegex = generateFallbackRegex(prompt);
        return {
            regex: fallbackRegex,
            description: 'Prehistoric pattern (T-ReXpress AI hibernating)'
        };
    }
}

// Fallback regex generation when Puter AI is unavailable
function generateFallbackRegex(prompt) {
    const lower = prompt.toLowerCase();

    if (lower.includes('comma') && lower.includes('separated')) {
        return '[^,]+(?:\\s*,\\s*[^,]+)*';
    }
    if (lower.includes('email')) {
        return '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}';
    }
    if (lower.includes('phone')) {
        return '\\d{3}[-.]?\\d{3}[-.]?\\d{4}';
    }
    if (lower.includes('url')) {
        return 'https?:\\/\\/[^\\s]+';
    }
    if (lower.includes('number')) {
        return '\\d+';
    }
    if (lower.includes('word')) {
        return '\\w+';
    }

    // Very basic fallback
    return '.*';
}

// Escape special regex characters
function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
}

// Display the generated regex
function displayRegex(regex, description) {
    document.getElementById('regexDisplay').textContent = `/${regex}/g`;
    document.getElementById('outputSection').style.display = 'block';
}

// Generate test cases for the regex using Puter AI
async function generateTestCases(regexPattern, description) {
    try {
        // Use Puter AI to generate relevant test cases
        const testCases = await generateTestCasesWithPuter(regexPattern, description);
        const regex = new RegExp(regexPattern, 'g');

        const testInputsDiv = document.getElementById('testInputs');
        const testOutputsDiv = document.getElementById('testOutputs');

        testInputsDiv.innerHTML = '';
        testOutputsDiv.innerHTML = '';

        testCases.forEach((testCase) => {
            // Display input
            const inputDiv = document.createElement('div');
            inputDiv.className = 'test-item';
            inputDiv.textContent = testCase;
            testInputsDiv.appendChild(inputDiv);

            // Test and display output
            const matches = testCase.match(regex);
            const outputDiv = document.createElement('div');
            outputDiv.className = `test-item ${matches ? 'match' : 'no-match'}`;

            if (matches) {
                outputDiv.innerHTML = `<strong>✓ Match:</strong> ${matches.join(', ')}`;
            } else {
                outputDiv.innerHTML = '<strong>✗ No match</strong>';
            }

            testOutputsDiv.appendChild(outputDiv);

            // Log the test
            logActivity('Test case', `Input: "${testCase}", Result: ${matches ? matches.join(', ') : 'No match'}`);
        });

    } catch (error) {
        logActivity('Test generation error', error.message);
        // Fallback to basic test cases
        generateBasicTestCases(regexPattern, description);
    }
}

// Generate test cases using Puter AI
async function generateTestCasesWithPuter(regexPattern, description) {
    try {
        if (typeof puter === 'undefined') {
            throw new Error('Puter API not available');
        }

        logActivity('Puter Test Generation', `Generating test cases for: ${regexPattern}`);

        const response = await puter.ai.chat([
            {
                role: 'system',
                content: 'Generate 7 test cases for the given regex pattern. Include both matching and non-matching examples. Return only the test strings, one per line, without explanations or numbering.'
            },
            {
                role: 'user',
                content: `Generate test cases for this regex pattern: /${regexPattern}/g
Description: ${description}

Please provide diverse examples that would test the pattern effectively.`
            }
        ]);

        logActivity('Puter Test Response', `Raw test cases: ${response.message.content.substring(0, 200)}...`);

        const testCases = response.message.content
            .trim()
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .slice(0, 7); // Limit to 7 test cases

        logActivity('Puter Test Cases', `Generated ${testCases.length} test cases`);

        return testCases.length > 0 ? testCases : generateFallbackTestCases(description);

    } catch (error) {
        logActivity('Puter test generation failed', error.message);
        return generateFallbackTestCases(description);
    }
}

// Fallback test case generation
function generateFallbackTestCases(description) {
    const lower = description.toLowerCase();

    if (lower.includes('comma') && lower.includes('separated')) {
        return [
            'apple, banana, cherry',
            'red,green,blue',
            'single',
            'one, two, three, four',
            'No commas here',
            'item1,item2,item3',
            'first, second'
        ];
    }

    return [
        'Sample text for testing',
        'Another test string',
        'Different content here',
        'Test case number four',
        'Fifth test example',
        'Sixth sample text',
        'Final test case'
    ];
}

// Basic test case generation (fallback)
function generateBasicTestCases(regexPattern, description) {
    const testCases = generateFallbackTestCases(description);
    const regex = new RegExp(regexPattern, 'g');

    const testInputsDiv = document.getElementById('testInputs');
    const testOutputsDiv = document.getElementById('testOutputs');

    testInputsDiv.innerHTML = '';
    testOutputsDiv.innerHTML = '';

    testCases.forEach((testCase) => {
        // Display input
        const inputDiv = document.createElement('div');
        inputDiv.className = 'test-item';
        inputDiv.textContent = testCase;
        testInputsDiv.appendChild(inputDiv);

        // Test and display output
        const matches = testCase.match(regex);
        const outputDiv = document.createElement('div');
        outputDiv.className = `test-item ${matches ? 'match' : 'no-match'}`;

        if (matches) {
            outputDiv.innerHTML = `<strong>✓ Match:</strong> ${matches.join(', ')}`;
        } else {
            outputDiv.innerHTML = '<strong>✗ No match</strong>';
        }

        testOutputsDiv.appendChild(outputDiv);

        // Log the test
        logActivity('Test case', `Input: "${testCase}", Result: ${matches ? matches.join(', ') : 'No match'}`);
    });
}

// Generate sample inputs based on description
function generateSampleInputs(description) {
    const lower = description.toLowerCase();

    // Comma-separated patterns
    if (lower.includes('comma') && (lower.includes('separated') || lower.includes('delimited'))) {
        if (lower.includes('string') || lower.includes('text') || lower.includes('word')) {
            return [
                'apple, banana, cherry, date',
                'red,green,blue,yellow',
                'first, second, third',
                'single',
                'one,two,three,four,five',
                'Not comma separated text here',
                'item1, item2, item3, item4'
            ];
        }
        if (lower.includes('number') || lower.includes('digit')) {
            return [
                '1, 2, 3, 4, 5',
                '10,20,30,40',
                '100, 200, 300',
                '42',
                '1,2,3,4,5,6,7,8,9,10',
                'Not numbers here',
                '0, 1, 2'
            ];
        }
        return [
            'value1, value2, value3',
            'a,b,c,d',
            'item one, item two, item three',
            'single value',
            'alpha, beta, gamma, delta',
            'No commas in this text',
            'CSV: name, age, city, country'
        ];
    }

    // Pipe-separated patterns
    if (lower.includes('pipe') && (lower.includes('separated') || lower.includes('delimited'))) {
        return [
            'value1|value2|value3',
            'apple | banana | cherry',
            'first|second|third|fourth',
            'single',
            'data1 | data2 | data3',
            'No pipes here',
            'column1|column2|column3'
        ];
    }

    // Tab-separated patterns
    if (lower.includes('tab') && (lower.includes('separated') || lower.includes('delimited'))) {
        return [
            'value1\tvalue2\tvalue3',
            'apple\tbanana\tcherry',
            'first\tsecond\tthird',
            'single',
            'data1\tdata2\tdata3\tdata4',
            'No tabs here',
            'col1\tcol2\tcol3'
        ];
    }

    // Semicolon-separated patterns
    if (lower.includes('semicolon') && (lower.includes('separated') || lower.includes('delimited'))) {
        return [
            'value1; value2; value3',
            'apple;banana;cherry',
            'first; second; third',
            'single',
            'item1; item2; item3; item4',
            'No semicolons here',
            'data1;data2;data3'
        ];
    }

    // List patterns
    if (lower.includes('list') && lower.includes('item')) {
        if (lower.includes('comma')) {
            return [
                'Shopping list: milk, bread, eggs, butter',
                'Colors: red, green, blue',
                'Tasks: work, exercise, read',
                'single item',
                'Numbers: 1, 2, 3, 4, 5'
            ];
        }
        return [
            'Item 1\nItem 2\nItem 3',
            'First line\nSecond line',
            'Single line',
            'Multiple\nlines\nof\ntext',
            'List:\nApple\nBanana\nCherry'
        ];
    }

    if (lower.includes('email')) {
        return [
            'Contact us at john.doe@example.com for more info',
            'Send email to admin@company.org',
            'Invalid email: notanemail',
            'Multiple emails: alice@test.com and bob@demo.net',
            'user123+tag@domain.co.uk'
        ];
    }

    if (lower.includes('phone')) {
        return [
            'Call me at (555) 123-4567',
            'Phone: 555-123-4567',
            'Contact: 555.123.4567',
            'Invalid: 123-45-6789',
            'International: +1-555-123-4567'
        ];
    }

    if (lower.includes('url')) {
        return [
            'Visit https://www.example.com for details',
            'Check out http://demo.org/page',
            'Invalid: not-a-url',
            'Secure site: https://secure.bank.com/login',
            'Simple: www.google.com'
        ];
    }

    if (lower.includes('number') || lower.includes('digit')) {
        return [
            'The price is 123.45 dollars',
            'Count: 42',
            'No numbers here',
            'Multiple: 1, 2, 3.14, 999',
            'Negative: -123'
        ];
    }

    if (lower.includes('date')) {
        return [
            'Born on 12/25/1990',
            'Meeting: 01/15/2024',
            'Invalid: 13/45/2023',
            'Today is 3/7/2024',
            'Not a date: abc/def/ghij'
        ];
    }

    if (lower.includes('ip')) {
        return [
            'Server IP: 192.168.1.1',
            'Connect to 10.0.0.1',
            'Invalid: 999.999.999.999',
            'Localhost: 127.0.0.1',
            'Not an IP: 192.168.1'
        ];
    }

    // Default test cases
    return [
        'Sample text with various content',
        'Another test string',
        'No match here',
        'Multiple words and numbers 123',
        'Special characters: !@#$%'
    ];
}

// Show status message
function showStatus(message, type) {
    const statusDiv = document.getElementById('statusMessage');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
}

// Log activity
function logActivity(action, details) {
    const timestamp = new Date().toLocaleString();
    const logEntry = `[${timestamp}] ${action}: ${details}`;
    activityLog.push(logEntry);

    const logContent = document.getElementById('logContent');
    logContent.textContent = activityLog.join('\\n');
    logContent.scrollTop = logContent.scrollHeight;
}

// History management functions
function addToHistory(input, regex, description) {
    const historyItem = {
        id: Date.now(),
        input: input,
        regex: regex,
        description: description,
        timestamp: new Date().toLocaleString()
    };

    regexHistory.unshift(historyItem);

    // Keep only last 20 items
    if (regexHistory.length > 20) {
        regexHistory = regexHistory.slice(0, 20);
    }

    saveHistory();
    updateHistoryDisplay();
    logActivity('🦖 Trophy added to collection', `T-Rex stored: "${input.substring(0, 50)}..."`);
}

function loadHistory() {
    try {
        const saved = localStorage.getItem('regexHistory');
        if (saved) {
            regexHistory = JSON.parse(saved);
            updateHistoryDisplay();
        }
    } catch (error) {
        logActivity('History load error', error.message);
    }
}

function saveHistory() {
    try {
        localStorage.setItem('regexHistory', JSON.stringify(regexHistory));
    } catch (error) {
        logActivity('History save error', error.message);
    }
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');

    if (regexHistory.length === 0) {
        historyList.innerHTML = `
            <div style="text-align: center; color: var(--text-light); padding: 20px;">
                No history yet.<br>
                Generate your first regex!
            </div>
        `;
        return;
    }

    historyList.innerHTML = regexHistory.map((item, index) => `
        <div class="history-item ${index === activeHistoryIndex ? 'active' : ''}" 
             onclick="loadHistoryItem(${index})" 
             title="${item.timestamp}">
            <button class="history-delete" onclick="deleteHistoryItem(event, ${index})" title="Delete">×</button>
            <div class="history-input">${item.input}</div>
            <div class="history-regex">${item.regex}</div>
        </div>
    `).join('');
}

function loadHistoryItem(index) {
    const item = regexHistory[index];
    if (!item) return;

    activeHistoryIndex = index;

    // Load the input
    document.getElementById('englishInput').value = item.input;
    document.getElementById('sampleInput').value = '';

    // Display the regex and generate test cases
    currentRegex = item.regex;
    displayRegex(item.regex, item.description);
    generateTestCases(item.regex, item.description);

    updateHistoryDisplay();
    logActivity('History item loaded', `Pattern: ${item.regex}`);
}

// Clear all inputs and outputs
function clearAll() {
    document.getElementById('englishInput').value = '';
    document.getElementById('sampleInput').value = '';
    document.getElementById('outputSection').style.display = 'none';
    currentRegex = null;
    activeHistoryIndex = -1;
    updateHistoryDisplay();
    logActivity('🦖 T-Rex reset', 'Hunting ground cleared, ready for new prey!');
}

// Download log file
async function downloadLog() {
    try {
        const logText = activityLog.join('\\n');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `regex-generator-log-${timestamp}.txt`;

        // Create blob and download
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        logActivity('🦖 Hunt log preserved', `T-Rex diary saved: ${filename}`);
        showStatus('🦖 T-ReXpress hunt log downloaded successfully!', 'success');

    } catch (error) {
        logActivity('Download failed', error.message);
        showStatus('Failed to download log file.', 'error');
    }
}

// Delete history item
function deleteHistoryItem(event, index) {
    event.stopPropagation(); // Prevent triggering loadHistoryItem

    if (confirm('Delete this history item?')) {
        regexHistory.splice(index, 1);

        // Adjust activeHistoryIndex if needed
        if (activeHistoryIndex === index) {
            activeHistoryIndex = -1;
        } else if (activeHistoryIndex > index) {
            activeHistoryIndex--;
        }

        saveHistory();
        updateHistoryDisplay();
        logActivity('History deleted', `Deleted item at index ${index}`);
    }
}

// Theme management
function setTheme(theme) {
    try {
        currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);

        // Update active theme button
        document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.remove('active'));

        // Find and activate the correct button
        const targetBtn = Array.from(document.querySelectorAll('.theme-btn')).find(btn =>
            btn.textContent.toLowerCase() === theme.toLowerCase()
        );
        if (targetBtn) {
            targetBtn.classList.add('active');
        }

        // Save theme preference
        localStorage.setItem('theme', theme);
        logActivity('Theme changed', `Switched to ${theme} theme`);
    } catch (error) {
        console.error('Theme error:', error);
        logActivity('Theme error', error.message);
    }
}

function loadTheme() {
    try {
        const savedTheme = localStorage.getItem('theme') || 'kiro';
        currentTheme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);

        // Update active theme button
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase() === savedTheme) {
                btn.classList.add('active');
            }
        });

        logActivity('Theme loaded', `Loaded ${savedTheme} theme`);
    } catch (error) {
        console.error('Load theme error:', error);
        logActivity('Load theme error', error.message);
    }
}

// Explanation functionality
function toggleExplanation() {
    explanationExpanded = !explanationExpanded;
    const content = document.getElementById('explanationContent');
    const icon = document.getElementById('explanationIcon');

    if (explanationExpanded) {
        content.classList.add('expanded');
        icon.textContent = '▼';
    } else {
        content.classList.remove('expanded');
        icon.textContent = '▶';
    }

    logActivity('Explanation toggled', explanationExpanded ? 'Expanded' : 'Collapsed');
}

async function generateExplanation(regex, description) {
    const explanationDiv = document.getElementById('explanationText');

    try {
        if (typeof puter !== 'undefined') {
            // Use Puter AI to generate explanation
            const response = await puter.ai.chat([
                {
                    role: 'system',
                    content: 'You are a regex expert. Explain regex patterns in simple, clear terms. Break down each component and provide examples. Use HTML formatting with <h4>, <p>, and <code> tags.'
                },
                {
                    role: 'user',
                    content: `Explain this regex pattern in detail: ${regex}
                    
Context: ${description}

Please provide:
1. What this pattern matches
2. Breakdown of each component
3. Examples of matching and non-matching strings`
                }
            ]);

            explanationDiv.innerHTML = response.message.content;
            logActivity('Explanation generated', 'AI-powered explanation created');

        } else {
            // Fallback explanation
            explanationDiv.innerHTML = generateFallbackExplanation(regex, description);
            logActivity('Explanation generated', 'Fallback explanation created');
        }

    } catch (error) {
        explanationDiv.innerHTML = generateFallbackExplanation(regex, description);
        logActivity('Explanation error', `Fallback used: ${error.message}`);
    }
}

function generateFallbackExplanation(regex, description) {
    return `
        <h4>Pattern Analysis</h4>
        <p><strong>Regex:</strong> <code>${regex}</code></p>
        <p><strong>Description:</strong> ${description}</p>
        
        <h4>Basic Breakdown</h4>
        <p>This regular expression pattern is designed to match text based on the description: "${description}"</p>
        
        <h4>Common Components</h4>
        <p>• <code>\\d</code> - Matches any digit (0-9)</p>
        <p>• <code>\\w</code> - Matches any word character (letters, digits, underscore)</p>
        <p>• <code>\\s</code> - Matches any whitespace character</p>
        <p>• <code>+</code> - Matches one or more of the preceding character</p>
        <p>• <code>*</code> - Matches zero or more of the preceding character</p>
        <p>• <code>?</code> - Matches zero or one of the preceding character</p>
        <p>• <code>[^x]</code> - Matches any character except x</p>
        
        <h4>Usage</h4>
        <p>Use this pattern in your code to find and match text that fits the specified criteria. Test it with the provided examples to ensure it works as expected.</p>
    `;
}