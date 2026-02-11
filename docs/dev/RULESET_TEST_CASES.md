# AutoProxy RuleSet Test Cases

This document provides test cases and sample RuleSet URLs for testing the AutoProxy RuleSet functionality in Oasis.

## Test RuleSet Files

### 1. Basic AutoProxy Format

**File**: `test-ruleset-basic.txt`

```
[AutoProxy 0.2.9]
! Title: Basic Test RuleSet
! Last Modified: 2026-01-30
! Homepage: https://github.com/example/test-ruleset

! Google domains
||google.com
||googleapis.com
||gstatic.com

! Social media
||facebook.com
||twitter.com
||instagram.com

! Video streaming
||youtube.com
||youtu.be
||vimeo.com
```

**Expected Behavior**:

- Should parse 9 domain rules
- All rules should be converted to wildcard patterns
- Example: `||google.com` → `*.google.com*`

---

### 2. Mixed Rule Types

**File**: `test-ruleset-mixed.txt`

```
[AutoProxy 0.2.9]
! Title: Mixed Rule Types Test
! Description: Tests different AutoProxy rule formats

! Domain anchors
||example.com
||test.org

! URL anchors
|https://api.example.com/v1/

! Regex patterns
/^https?:\/\/.*\.cdn\.example\.com\//
/\.m3u8$/

! Wildcard patterns
*analytics*
*tracking*

! Keyword matches
ads
tracker
```

**Expected Behavior**:

- Domain anchors → wildcard patterns
- URL anchors → regex patterns
- Regex patterns → preserved as regex
- Wildcard patterns → wildcard type
- Keywords → wildcard patterns

---

### 3. Base64 Encoded (gfwlist format)

**File**: `test-ruleset-base64.txt`

```
W0F1dG9Qcm94eSAwLjIuOV0KISBUaXRsZTogQmFzZTY0IFRlc3QgUnVsZVNldAohIExhc3QgTW9kaWZpZWQ6IDIwMjYtMDEtMzAKCnx8Z29vZ2xlLmNvbQp8fGZhY2Vib29rLmNvbQp8fHR3aXR0ZXIuY29tCnx8eW91dHViZS5jb20=
```

**Decoded Content**:

```
[AutoProxy 0.2.9]
! Title: Base64 Test RuleSet
! Last Modified: 2026-01-30

||google.com
||facebook.com
||twitter.com
||youtube.com
```

**Expected Behavior**:

- Should auto-detect Base64 encoding
- Should decode and parse correctly
- Should show 4 domain rules

---

### 4. Whitelist Rules (Currently Skipped)

**File**: `test-ruleset-whitelist.txt`

```
[AutoProxy 0.2.9]
! Title: Whitelist Test

! Blacklist rules
||blocked.com
||restricted.org

! Whitelist rules (should be skipped)
@@||allowed.com
@@||exception.org
```

**Expected Behavior**:

- Should parse 2 blacklist rules
- Should skip 2 whitelist rules (@@)
- Total rules in PAC: 2

---

### 5. Comments and Empty Lines

**File**: `test-ruleset-comments.txt`

```
[AutoProxy 0.2.9]
! Title: Comments Test
! This is a comment

||example.com

! Another comment
! Multiple comment lines

||test.com

! Empty lines below


||demo.org
```

**Expected Behavior**:

- Should ignore all comment lines (starting with !)
- Should ignore empty lines
- Should parse 3 domain rules

---

### 6. Large RuleSet (Performance Test)

**File**: `test-ruleset-large.txt`

Contains 1000+ rules for performance testing.

**Expected Behavior**:

- Should handle large files without freezing UI
- Should show loading indicator during fetch
- Should parse all rules correctly
- Should generate valid PAC script

---

## Test Scenarios

### Scenario 1: Add New RuleSet Rule

**Steps**:

1. Create a new Normal Rule
2. Change Type to "Rule Set"
3. Enter a test RuleSet URL
4. Blur the input field

**Expected**:

- Loading icon appears immediately
- Content is fetched from URL
- Loading icon changes back to eye icon
- Click eye icon to view content
- Content is displayed in modal

---

### Scenario 2: Type Change Trigger

**Steps**:

1. Create a new Normal Rule with Type "Wildcard"
2. Enter a RuleSet URL in the pattern field
3. Change Type from "Wildcard" to "Rule Set"

**Expected**:

- Loading icon appears immediately
- Content is fetched automatically
- No need to blur input

---

### Scenario 3: Manual Update

**Steps**:

1. Open RuleSet content modal (eye icon)
2. Click "Manual Update" button

**Expected**:

- Loading spinner appears on button
- Content is re-fetched
- Last updated timestamp is refreshed
- Content in modal is updated

---

### Scenario 4: PAC Export

**Steps**:

1. Add multiple RuleSet rules
2. Export PAC script from dropdown menu
3. Open exported PAC file

**Expected**:

- RuleSet rules are expanded into individual PAC conditions
- Each rule from RuleSet has its own `if` statement
- Proxy assignment matches the rule's proxyId
- PAC script is valid JavaScript

---

### Scenario 5: Error Handling

**Steps**:

1. Enter an invalid URL (e.g., `http://invalid-domain-12345.com/rules.txt`)
2. Blur the input

**Expected**:

- Loading icon appears
- After timeout, loading icon disappears
- Error is stored in `rule.ruleSet.fetchError`
- User can still click eye icon to see previous content (if any)

---

## Sample Test URLs

### Public RuleSet URLs (for testing)

```
# gfwlist (Base64 encoded)
https://raw.githubusercontent.com/gfwlist/gfwlist/master/gfwlist.txt

# Plain text format
https://raw.githubusercontent.com/example/rules/main/proxy-rules.txt
```

### Local Test Server

For local testing, you can create a simple HTTP server:

```bash
# Create test file
cat > test-ruleset.txt << 'EOF'
[AutoProxy 0.2.9]
! Test RuleSet
||google.com
||facebook.com
||twitter.com
EOF

# Start HTTP server (Python 3)
python3 -m http.server 8000

# Use URL in Oasis
http://localhost:8000/test-ruleset.txt
```

---

## Validation Checklist

### UI Validation

- [ ] Loading icon rotates smoothly
- [ ] Loading icon appears on blur
- [ ] Loading icon appears on type change
- [ ] Eye icon is clickable during loading
- [ ] Eye icon is clickable after loading
- [ ] Modal shows correct content
- [ ] Last updated timestamp is displayed
- [ ] Manual update button works

### Data Validation

- [ ] Base64 content is decoded
- [ ] Plain text content is parsed
- [ ] Comments are ignored
- [ ] Empty lines are ignored
- [ ] Whitelist rules are skipped
- [ ] Domain anchors are converted correctly
- [ ] Regex patterns are preserved
- [ ] URL anchors are converted to regex

### PAC Generation

- [ ] RuleSet rules are expanded
- [ ] Each rule generates a PAC condition
- [ ] Proxy assignment is correct
- [ ] PAC script is valid JavaScript
- [ ] PAC script works in browser

### Error Handling

- [ ] Invalid URLs show error
- [ ] Network errors are handled
- [ ] Timeout errors are handled
- [ ] Error messages are stored
- [ ] Loading state clears on error

---

## Known Issues

1. **Whitelist Rules**: Currently skipped, not implemented
2. **IPv6 in AutoProxy**: May need additional testing
3. **Special Characters**: Some special characters in patterns may need escaping

---

## Future Enhancements

1. Support for whitelist rules (@@)
2. Rule conflict detection
3. Automatic update scheduling
4. Rule statistics in modal
5. Search/filter in RuleSet content modal
