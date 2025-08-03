# 🛒 Real-World Tutorial: Testing Amazon's Shopping Flow with Semantest

## The Scenario

It's Black Friday. Your e-commerce client just called in a panic:

> "We need to make sure our checkout flow works perfectly! Can you test it? Oh, and we changed the UI last night... again."

Sound familiar? Let's see how Semantest handles this real-world scenario by testing Amazon's shopping flow - one of the most complex UIs on the web.

## What We'll Build

By the end of this tutorial, you'll have a test that:
1. Searches for a product
2. Adds it to the cart
3. Proceeds to checkout
4. Verifies each step works correctly

All in about 20 lines of natural language code.

## Chapter 1: The Setup (2 minutes)

First, let's create our test file:

```javascript
// amazon-shopping-test.js
import { Semantest } from '@semantest/client';

// Initialize Semantest with some context
const test = new Semantest({
  name: "Amazon Black Friday Shopping Test",
  viewport: { width: 1280, height: 720 },
  slowMo: 100 // Slow down actions so we can see what's happening
});

// Our test starts here
async function testAmazonShopping() {
  console.log("🛍️ Starting Amazon shopping test...");
  
  // We'll write our test here
}

testAmazonShopping();
```

## Chapter 2: The Search (Your First "Aha!" Moment)

Let's search for a laptop. Watch how Semantest handles Amazon's complex search:

```javascript
async function testAmazonShopping() {
  // Navigate to Amazon
  await test.navigate("Go to amazon.com");
  
  // Here's where the magic happens
  await test.type(
    "Search for a product in the search box",
    "laptop under $500"
  );
  
  await test.click("Click the search button or press Enter");
  
  // Verify we're seeing results
  await test.see("Verify search results appear for laptops");
}
```

**What just happened?**
- Semantest found Amazon's search box (even though it has crazy class names)
- It typed our search query
- It figured out how to submit the search
- It verified results appeared

No selectors. No IDs. Just intent.

## Chapter 3: The Product Selection Challenge

Amazon's product listings are notoriously complex. Let's see Semantest navigate them:

```javascript
// Continuing our function...

// Filter and select a product
await test.click("Click on '4 stars & up' filter");
await test.waitFor("Wait for filtered results to load");

// This is where traditional automation breaks
// Amazon's product cards have dynamic classes, nested divs, etc.
// But watch this:
await test.click(
  "Click on the first laptop that's Prime eligible and under $500"
);

// Semantest understands:
// - "first" means position
// - "Prime eligible" means looking for the Prime badge
// - "under $500" means checking the price text
```

## Chapter 4: The Add to Cart Dance

Here's where things get interesting. Amazon has multiple "Add to Cart" scenarios:

```javascript
// On the product page now
await test.waitFor("Wait for product page to fully load");

// Handle Amazon's various add-to-cart scenarios
await test.trySequence([
  // Scenario 1: Direct "Add to Cart" button
  {
    action: "click",
    target: "Click 'Add to Cart' button",
    fallback: "continue"
  },
  // Scenario 2: Must select options first
  {
    action: "click",
    target: "Select the first available configuration",
    then: "Click 'Add to Cart'"
  },
  // Scenario 3: Coverage options popup
  {
    action: "handle",
    target: "If protection plan popup appears, click 'No Thanks'",
    optional: true
  }
]);

// Verify item was added
await test.see("Verify 'Added to Cart' confirmation appears");
```

**Pro Learning**: The `trySequence` method shows how Semantest handles real-world complexity - different products have different flows!

## Chapter 5: The Checkout Challenge

The moment of truth - can we navigate checkout without hard-coded selectors?

```javascript
// Go to cart
await test.click("Click 'Cart' or 'View Cart' button");

// In the cart
await test.see("Verify our laptop is in the cart");
await test.see("Verify the price is under $500");

// Proceed to checkout
await test.click("Click 'Proceed to checkout' button");

// Here's where we'd handle login
// For demo purposes, we'll stop here
await test.see("Verify we reached the sign-in page");

console.log("✅ Test completed successfully!");
```

## The Complete Test

Here's everything together:

```javascript
import { Semantest } from '@semantest/client';

const test = new Semantest({
  name: "Amazon Shopping Flow Test",
  viewport: { width: 1280, height: 720 },
  slowMo: 100
});

async function testAmazonShopping() {
  try {
    console.log("🛍️ Starting Amazon shopping test...");
    
    // Search Phase
    await test.navigate("Go to amazon.com");
    await test.type("Search for a product", "laptop under $500");
    await test.click("Submit the search");
    
    // Filter & Select Phase
    await test.click("Click on '4 stars & up' filter");
    await test.waitFor("Wait for filtered results");
    await test.click("Click the first Prime eligible laptop under $500");
    
    // Add to Cart Phase
    await test.waitFor("Wait for product page to load");
    await test.trySequence([
      {
        action: "click",
        target: "Click 'Add to Cart' button"
      },
      {
        action: "handle",
        target: "If protection plan popup appears, click 'No Thanks'",
        optional: true
      }
    ]);
    
    // Checkout Phase
    await test.click("Go to Cart");
    await test.see("Verify laptop is in cart");
    await test.see("Verify price is under $500");
    await test.click("Proceed to checkout");
    await test.see("Verify sign-in page appears");
    
    console.log("✅ All tests passed!");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    await test.screenshot("failure-screenshot.png");
  } finally {
    await test.close();
  }
}

testAmazonShopping();
```

## Running Your Test

```bash
# Run it!
node amazon-shopping-test.js

# Or with npm script
npm run test:amazon
```

## What Makes This Special?

### 1. It's Readable
Show this test to a non-developer. They'll understand it. Try that with Selenium.

### 2. It's Maintainable
When Amazon changes their UI (and they will), this test will likely still work because it focuses on intent, not implementation.

### 3. It's Realistic
This isn't a toy example. This is how real e-commerce testing works - complex flows, dynamic content, edge cases.

## Debugging Like a Pro

When things go wrong (and they will), Semantest helps:

```javascript
// Enable debug mode
const test = new Semantest({
  debug: true,  // Shows what Semantest is thinking
  screenshots: 'on-failure',
  video: true   // Records the entire session
});

// Add context to your commands
await test.click("Click 'Add to Cart' button", {
  context: "This is the main CTA on the product page",
  timeout: 10000,  // Wait up to 10 seconds
  retries: 3       // Try 3 times before failing
});

// Use assertions for better error messages
await test.assert({
  condition: "The price is less than $500",
  errorMessage: "Product price exceeded budget"
});
```

## Real-World Tips from the Trenches

### Tip 1: Be Specific When Needed
```javascript
// Too vague
await test.click("Click the button");

// Just right
await test.click("Click the blue 'Continue' button");

// Even better with context
await test.click("Click 'Continue' in the shipping section");
```

### Tip 2: Handle Dynamic Content
```javascript
// Amazon loads content dynamically
await test.waitFor("Wait for product recommendations to load", {
  timeout: 5000,
  optional: true  // Don't fail if they don't appear
});
```

### Tip 3: Think in User Journeys
```javascript
// Structure your tests like user stories
describe("As a bargain hunter", () => {
  it("I want to find the best deals", async () => {
    await test.click("Navigate to Today's Deals");
    await test.click("Filter by 50% off or more");
    await test.see("Verify deals are showing 50%+ discount");
  });
});
```

## Challenge Yourself

Now that you've seen the basics, try these challenges:

### 🏆 Challenge 1: The Wishlist Warrior
Can you modify the test to add items to a wishlist instead of the cart?

### 🏆 Challenge 2: The Comparison Shopper
Make Semantest compare prices between two similar products.

### 🏆 Challenge 3: The Review Reader
Have Semantest read and verify product reviews, looking for specific keywords.

## Common Pitfalls and Solutions

### Pitfall 1: "Element Not Found"
```javascript
// Problem: Page hasn't loaded
await test.click("Click Add to Cart");  // Fails!

// Solution: Always wait for page state
await test.waitFor("Wait for product page to load completely");
await test.click("Click Add to Cart");  // Works!
```

### Pitfall 2: "Multiple Matches"
```javascript
// Problem: Multiple "Buy Now" buttons
await test.click("Click Buy Now");  // Which one?

// Solution: Add context
await test.click("Click Buy Now for the first search result");
```

### Pitfall 3: "Dynamic Pricing"
```javascript
// Problem: Prices change
await test.see("Verify price is $499.99");  // Brittle!

// Solution: Use ranges or patterns
await test.see("Verify price is under $500");
await test.see("Verify price matches pattern $xxx.xx");
```

## Taking It Further

Ready for more? Here's how to extend this test:

### Add Data-Driven Testing
```javascript
const products = [
  "laptop under $500",
  "wireless mouse",
  "USB-C hub"
];

for (const product of products) {
  await test.type("Search for", product);
  // ... rest of test
}
```

### Add Parallel Testing
```javascript
const browsers = ['chrome', 'firefox', 'safari'];

await Promise.all(browsers.map(browser => 
  testAmazonShopping({ browser })
));
```

### Add Visual Testing
```javascript
await test.snapshot("Product page layout");
// Compares against baseline image
```

## Your Homework

1. **Run this test** against Amazon (or your favorite e-commerce site)
2. **Modify it** to test a different flow (like filtering by brand)
3. **Share your experience** in our Discord community
4. **Challenge yourself** with the advanced scenarios

## The Mindset Shift

Remember: You're not writing code to find elements. You're describing what a user would do. That's the Semantest way.

When you find yourself thinking "What's the selector for this button?" - stop. Instead ask: "How would I describe this button to someone over the phone?"

That's your Semantest command.

## What's Next?

You've just tested one of the most complex UIs on the internet with simple, natural language. You're ready for:

1. [**Testing Single Page Applications**](./spa-testing.md) - Handle React, Vue, and Angular
2. [**API and UI Integration Tests**](./api-ui-testing.md) - Full stack testing
3. [**CI/CD Integration**](./cicd-integration.md) - Automate your Semantest tests

## Need Help?

- 🤔 **Stuck?** Check our [Troubleshooting Guide](../troubleshooting.md)
- 💬 **Questions?** Join our [Discord](https://discord.gg/semantest)
- 🎥 **Visual learner?** Watch the [video version](https://youtube.com/semantest)

---

*Remember: Every expert was once a beginner. The difference? They kept practicing. Now it's your turn. Happy testing! 🚀*