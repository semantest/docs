# Consent Popup Messaging Guide

## Core Messaging Principles

### 1. Transparency First
- Be completely honest about what we collect
- Use simple, non-technical language
- Avoid marketing speak or persuasion tactics

### 2. User Empowerment
- Make it clear users have full control
- "No Thanks" is equally prominent as "Accept"
- Settings can be changed anytime

### 3. Value Exchange
- Explain how data helps improve the extension
- Focus on community benefit, not company benefit
- Show respect for user's choice

## Primary Messaging

### Header
**Title**: "Your Privacy Matters"
- Personal, caring tone
- Immediately establishes trust
- Not "We need your data"

**Subtitle**: "Help us improve Semantest with anonymous analytics"
- Clear purpose
- Emphasizes "anonymous"
- Collaborative tone ("us")

### Introduction
"We'd like to collect anonymous usage data to understand how you use Semantest and make it better for everyone."
- Polite request, not demand
- Reinforces anonymity
- Community-focused benefit

### What We Collect
Clear, specific list with plain language:
1. **Feature Usage** - "Which features you use most (no content)"
2. **Performance Metrics** - "Load times and response speeds"
3. **Error Reports** - "Crashes and bugs (no personal data)"

### Privacy Promises
Visual grid showing commitments:
- 🚫 **No Personal Data** - Never collect names, emails, IDs
- 🔒 **No Chat Content** - Your conversations stay private
- 🌍 **GDPR Compliant** - Following global privacy standards
- 🔄 **Change Anytime** - Full control in settings

## Button Copy

### Primary Action
"Accept & Help Improve" →
- Positive framing
- Shows mutual benefit
- Arrow suggests progress

### Secondary Action
"No Thanks"
- Respectful decline option
- No guilt or negative framing
- Equal visual weight

## Alternative Copy Options

### For A/B Testing

**Version A - Community Focus**
- Title: "Join Our Privacy-First Community"
- CTA: "Count Me In" / "Maybe Later"

**Version B - Improvement Focus**
- Title: "Help Make Semantest Better"
- CTA: "Yes, Improve Semantest" / "Not Now"

**Version C - Control Focus**
- Title: "You're In Control"
- CTA: "Enable Analytics" / "Keep Private"

## Accessibility Copy

### Screen Reader Announcements
- Dialog: "Privacy consent dialog. Your privacy matters."
- Accept: "Accept anonymous analytics to help improve Semantest"
- Decline: "Continue without sharing analytics"

### ARIA Labels
- Icons have `aria-hidden="true"`
- Buttons have descriptive `aria-label`
- Dialog has proper role and labeling

## Legal Compliance Copy

### GDPR Requirements
- ✅ Clear purpose stated
- ✅ Specific data types listed
- ✅ Voluntary consent
- ✅ Easy withdrawal option
- ✅ Link to full privacy policy

### CCPA Compliance
- ✅ Right to opt-out prominent
- ✅ No data selling mentioned
- ✅ Clear data usage

## Trust Indicators

### Security Badge
"🔐 Security Score: 90/100"
- Shows commitment to security
- Concrete metric
- Visual trust signal

### Footer Links
- "Privacy Policy" - Full legal details
- "Learn More" - Detailed telemetry info

## Implementation Notes

### First-Time vs Returning
First time: Full dialog as designed
Returning: Simplified reminder if needed

### Post-Consent Messages
Accept: "Thank you for helping improve Semantest!"
Decline: "No problem! Enjoy Semantest."

### Settings Description
"Analytics: Help improve Semantest with anonymous usage data"
- Toggle: On/Off
- Link: "What data is collected?"

## Copy Don'ts
- ❌ "We need your data"
- ❌ "Please accept to continue"
- ❌ "Limited functionality without consent"
- ❌ Technical jargon
- ❌ Lengthy explanations
- ❌ Dark patterns

## Copy Do's
- ✅ "Your privacy matters"
- ✅ "Help us improve"
- ✅ "Anonymous analytics"
- ✅ "You're in control"
- ✅ "Change anytime"
- ✅ Clear, simple language