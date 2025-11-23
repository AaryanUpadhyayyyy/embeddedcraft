# New Components Usage Examples

## Quick Reference Guide for 6 New Components

---

## 1. ProgressBar

### Basic Usage
```tsx
import ProgressBar from './components/ProgressBar';

<ProgressBar 
  value={150}
  max={300}
  showPercentage={true}
  color="#10B981"
  animated={true}
/>
```

### With Milestones (Dunzo-style)
```tsx
<ProgressBar 
  value={150}
  max={300}
  showPercentage={true}
  milestones={[
    { value: 100, label: '₹50 off', color: '#10B981' },
    { value: 200, label: '₹100 off', color: '#3B82F6' },
    { value: 300, label: '₹200 off', color: '#8B5CF6' },
  ]}
/>
```

### Real-World Example: Cart Progress
```tsx
const cartValue = 150;
const freeShippingThreshold = 200;
const remaining = freeShippingThreshold - cartValue;

<ProgressBar 
  value={cartValue}
  max={freeShippingThreshold}
  milestones={[
    { 
      value: freeShippingThreshold, 
      label: `₹${remaining} more for FREE shipping!`, 
      color: '#10B981' 
    }
  ]}
  showPercentage={false}
  animated={true}
/>
```

---

## 2. ProgressCircle

### Basic Usage
```tsx
import ProgressCircle from './components/ProgressCircle';

<ProgressCircle 
  value={65}
  max={100}
  showPercentage={true}
  label="Daily Goal"
/>
```

### Custom Styling
```tsx
<ProgressCircle 
  value={7}
  max={10}
  size={150}
  strokeWidth={12}
  color="#8B5CF6"
  backgroundColor="#E5E7EB"
  showPercentage={true}
  label="7/10 Tasks Completed"
/>
```

### Headway-style Reading Goal
```tsx
<ProgressCircle 
  value={12}  // 12 minutes read today
  max={20}    // 20 minute daily goal
  size={120}
  strokeWidth={8}
  color="#3B82F6"
  showPercentage={false}
  label="12 min read today"
/>
```

---

## 3. Stepper

### Basic Horizontal Stepper
```tsx
import Stepper from './components/Stepper';

<Stepper 
  steps={[
    { label: 'Sign Up', description: 'Create your account', completed: true },
    { label: 'Verify', description: 'Verify your email', completed: false },
    { label: 'Complete', description: 'Setup complete', completed: false },
  ]}
  currentStep={1}
  orientation="horizontal"
/>
```

### Vertical Stepper (Khatabook-style)
```tsx
<Stepper 
  steps={[
    { label: 'Business Details', description: 'Enter shop name', completed: true },
    { label: 'KYC Verification', description: 'Upload documents', completed: true },
    { label: 'Bank Account', description: 'Add bank details', completed: false },
  ]}
  currentStep={2}
  orientation="vertical"
/>
```

### Checkout Process Stepper
```tsx
const checkoutSteps = [
  { label: 'Cart', description: 'Review items', completed: true },
  { label: 'Shipping', description: 'Enter address', completed: true },
  { label: 'Payment', description: 'Pay securely', completed: false },
  { label: 'Confirm', description: 'Order complete', completed: false },
];

<Stepper 
  steps={checkoutSteps}
  currentStep={2}
  orientation="horizontal"
/>
```

---

## 4. List

### Checkmark List (Slack-style)
```tsx
import List from './components/List';

<List 
  items={[
    { text: 'Free cancellation up to 24 hours before check-in' },
    { text: 'Best price guarantee - We'll match any lower price' },
    { text: 'Instant confirmation on your booking' },
  ]}
  type="checkmark"
  style="default"
  iconColor="#10B981"
/>
```

### Numbered List
```tsx
<List 
  items={[
    { text: 'Download the app from Play Store', subtext: 'Available on Android 5.0+' },
    { text: 'Create your account', subtext: 'Just email and password' },
    { text: 'Complete your profile', subtext: 'Get personalized offers' },
  ]}
  type="numbered"
  style="spaced"
/>
```

### Custom Icon List
```tsx
import { Star, Shield, Zap } from 'lucide-react';

<List 
  items={[
    { text: 'Premium features unlocked', icon: Star, iconColor: '#FBBF24' },
    { text: '100% secure transactions', icon: Shield, iconColor: '#10B981' },
    { text: 'Lightning fast delivery', icon: Zap, iconColor: '#3B82F6' },
  ]}
  type="icon"
  style="default"
/>
```

### Compact Bullet List
```tsx
<List 
  items={[
    { text: 'Valid for first-time users only' },
    { text: 'Cannot be combined with other offers' },
    { text: 'Terms and conditions apply' },
  ]}
  type="bullet"
  style="compact"
  iconColor="#6B7280"
/>
```

---

## 5. CountdownTimer

### Basic Countdown (MakeMyTrip-style)
```tsx
import CountdownTimer from './components/CountdownTimer';

<CountdownTimer 
  targetDate="2024-12-31T23:59:59"
  format="short"
  showIcon={true}
/>
// Output: "⏰ Ends in 2d 14h 35m"
```

### Flash Sale Timer
```tsx
const flashSaleEnd = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now

<CountdownTimer 
  targetDate={flashSaleEnd.toISOString()}
  format="compact"
  urgentThreshold={30}  // Turn red when <30 minutes left
  showIcon={true}
  onExpire={() => console.log('Sale ended!')}
/>
```

### Limited Offer with Full Format
```tsx
<CountdownTimer 
  targetDate="2024-12-25T00:00:00"
  format="full"
  urgentThreshold={60}
  showIcon={true}
/>
// Output: "Ends in 5d 12h 30m 45s"
```

### Compact Format (Shows Only 2 Units)
```tsx
<CountdownTimer 
  targetDate="2024-12-31T23:59:59"
  format="compact"
  showIcon={false}
/>
// If 2 days 14 hours left: "2d 14h"
// If only 45 minutes left: "45m 30s"
```

---

## 6. Link

### Basic Link
```tsx
import Link from './components/Link';

<Link 
  text="Learn more"
  href="/features"
  variant="primary"
/>
```

### Link with Arrow Icon (Slack-style)
```tsx
<Link 
  text="View all features"
  href="/features"
  variant="primary"
  size="md"
  showIcon={true}
  iconType="arrow"
  iconPosition="right"
/>
// Output: "View all features →"
```

### External Link with Icon
```tsx
<Link 
  text="Read documentation"
  href="https://docs.example.com"
  variant="default"
  size="sm"
  showIcon={true}
  iconType="external"
  iconPosition="right"
  external={true}
/>
// Output: "Read documentation ↗" (opens in new tab)
```

### Footer Link (Muted)
```tsx
<Link 
  text="Privacy Policy"
  href="/privacy"
  variant="muted"
  size="sm"
  showIcon={false}
/>
```

### CTA Link with Chevron
```tsx
<Link 
  text="See all offers"
  href="/offers"
  variant="primary"
  size="lg"
  showIcon={true}
  iconType="chevron"
  iconPosition="right"
/>
// Output: "See all offers ›"
```

---

## Complete Example: Bottom Sheet Template

Here's a complete bottom sheet using **all 6 new components**:

```tsx
import React from 'react';
import ProgressBar from './components/ProgressBar';
import ProgressCircle from './components/ProgressCircle';
import Stepper from './components/Stepper';
import List from './components/List';
import CountdownTimer from './components/CountdownTimer';
import Link from './components/Link';

const CompleteBottomSheet = () => {
  const cartValue = 150;
  const freeShippingThreshold = 200;

  return (
    <div className="p-6 bg-white rounded-t-3xl">
      {/* Header with Countdown */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Special Offer!</h2>
        <CountdownTimer 
          targetDate={new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()}
          format="compact"
          urgentThreshold={60}
          showIcon={true}
        />
      </div>

      {/* Cart Progress with Milestone */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Your Cart Progress</h3>
        <ProgressBar 
          value={cartValue}
          max={freeShippingThreshold}
          milestones={[
            { 
              value: freeShippingThreshold, 
              label: `₹${freeShippingThreshold - cartValue} more for FREE shipping!`, 
              color: '#10B981' 
            }
          ]}
          showPercentage={false}
          animated={true}
        />
      </div>

      {/* Profile Completion Ring */}
      <div className="flex justify-center mb-6">
        <ProgressCircle 
          value={65}
          max={100}
          size={120}
          strokeWidth={8}
          color="#3B82F6"
          showPercentage={true}
          label="Profile Complete"
        />
      </div>

      {/* Checkout Steps */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3">Checkout Progress</h3>
        <Stepper 
          steps={[
            { label: 'Cart', completed: true },
            { label: 'Shipping', completed: true },
            { label: 'Payment', completed: false },
          ]}
          currentStep={2}
          orientation="horizontal"
        />
      </div>

      {/* Benefits List */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-2">Your Benefits</h3>
        <List 
          items={[
            { text: 'Free cancellation up to 24 hours' },
            { text: 'Best price guarantee' },
            { text: 'Instant confirmation' },
          ]}
          type="checkmark"
          style="default"
          iconColor="#10B981"
        />
      </div>

      {/* Footer Link */}
      <div className="text-center">
        <Link 
          text="View all terms and conditions"
          href="/terms"
          variant="muted"
          size="sm"
          showIcon={true}
          iconType="arrow"
          iconPosition="right"
        />
      </div>
    </div>
  );
};

export default CompleteBottomSheet;
```

---

## Integration with BottomSheetV2 Editor

### Adding Components Programmatically

```tsx
import { useStore } from '@/store/useStore';

const MyComponent = () => {
  const { addComponent } = useStore();

  const handleAddProgressBar = () => {
    addComponent({
      id: generateId(),
      type: 'progressbar',
      content: {
        value: 150,
        max: 300,
        showPercentage: true,
        milestones: [
          { value: 100, label: '₹50 off', color: '#10B981' },
          { value: 200, label: '₹100 off', color: '#3B82F6' },
          { value: 300, label: '₹200 off', color: '#8B5CF6' },
        ],
      },
      style: {
        color: '#10B981',
        height: 8,
        borderRadius: 4,
      },
      position: {
        type: 'absolute',
        x: 20,
        y: 20,
        width: 335,
        height: 40,
        zIndex: 1,
        rotation: 0,
      },
    });
  };

  return (
    <button onClick={handleAddProgressBar}>
      Add Progress Bar
    </button>
  );
};
```

---

## Common Patterns

### Pattern 1: Milestone Rewards (E-commerce)
```tsx
// Show cart value progress with discount unlocks
<ProgressBar 
  value={userCartValue}
  max={500}
  milestones={[
    { value: 200, label: '₹50 off', color: '#10B981' },
    { value: 350, label: '₹100 off', color: '#3B82F6' },
    { value: 500, label: '₹200 off', color: '#8B5CF6' },
  ]}
/>
```

### Pattern 2: Onboarding Flow (SaaS)
```tsx
// Multi-step onboarding with progress indicator
<ProgressCircle value={2} max={5} label="2 of 5 steps" />
<Stepper 
  steps={[
    { label: 'Sign Up', completed: true },
    { label: 'Verify Email', completed: true },
    { label: 'Add Company', completed: false },
    { label: 'Invite Team', completed: false },
    { label: 'Complete', completed: false },
  ]}
  currentStep={2}
/>
```

### Pattern 3: Urgency + Benefits (Travel/E-commerce)
```tsx
// Countdown + checkmark list for conversion
<CountdownTimer targetDate={offerExpiry} urgentThreshold={60} />
<List 
  items={[
    { text: 'Free cancellation' },
    { text: 'Best price guarantee' },
    { text: 'Instant confirmation' },
  ]}
  type="checkmark"
/>
```

### Pattern 4: Educational Progress (EdTech)
```tsx
// Circular progress + numbered steps
<ProgressCircle value={7} max={10} label="7/10 lessons" />
<List 
  items={[
    { text: 'Introduction to React', subtext: 'Completed' },
    { text: 'State Management', subtext: 'In Progress' },
    { text: 'Advanced Hooks', subtext: 'Not Started' },
  ]}
  type="numbered"
/>
```

---

## Styling Customization

### Custom Colors
```tsx
// Override default colors
<ProgressBar color="#FF6B6B" />
<ProgressCircle color="#4ECDC4" backgroundColor="#F7F7F7" />
<List iconColor="#FF6B6B" />
<Link style={{ color: '#FF6B6B' }} />
```

### Custom Sizes
```tsx
<ProgressCircle size={150} strokeWidth={12} />
<Link size="lg" />
```

### Custom Animations
```tsx
<ProgressBar animated={true} />  // Smooth fill animation
<ProgressCircle />  // Auto-animated (1s duration)
<CountdownTimer />  // Live updates every second
```

---

## Props Reference

### ProgressBar Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | number | 0 | Current progress value |
| max | number | 100 | Maximum value |
| milestones | Milestone[] | [] | Array of milestone objects |
| showPercentage | boolean | true | Show percentage text |
| color | string | '#10B981' | Progress bar color |
| animated | boolean | true | Enable smooth animations |

### ProgressCircle Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | number | 0 | Current progress value |
| max | number | 100 | Maximum value |
| size | number | 120 | Circle diameter (px) |
| strokeWidth | number | 8 | Ring thickness (px) |
| color | string | '#3B82F6' | Progress ring color |
| backgroundColor | string | '#E5E7EB' | Empty ring color |
| showPercentage | boolean | true | Show center percentage |
| label | string | '' | Text below percentage |

### Stepper Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| steps | Step[] | [] | Array of step objects |
| currentStep | number | 0 | Index of current step |
| orientation | 'horizontal' \| 'vertical' | 'horizontal' | Layout direction |

### List Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| items | ListItem[] | [] | Array of list items |
| type | 'bullet' \| 'numbered' \| 'icon' \| 'checkmark' | 'bullet' | List type |
| style | 'default' \| 'spaced' \| 'compact' \| 'bordered' | 'default' | Item spacing |
| iconColor | string | '#3B82F6' | Icon color |

### CountdownTimer Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| targetDate | string \| Date | - | Target date/time (ISO string) |
| format | 'full' \| 'short' \| 'compact' | 'short' | Display format |
| urgentThreshold | number | 60 | Minutes until urgency state |
| showIcon | boolean | true | Show clock icon |
| onExpire | () => void | - | Callback when timer reaches 0 |

### Link Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| text | string | 'Click here' | Link text |
| href | string | '#' | URL destination |
| variant | 'default' \| 'primary' \| 'secondary' \| 'underline' \| 'muted' | 'default' | Visual style |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Text size |
| showIcon | boolean | false | Show trailing icon |
| iconType | 'external' \| 'chevron' \| 'arrow' | 'arrow' | Icon type |
| iconPosition | 'left' \| 'right' | 'right' | Icon position |
| external | boolean | false | Open in new tab |

---

## TypeScript Interfaces

```typescript
// ProgressBar
interface Milestone {
  value: number;
  label: string;
  color: string;
}

// Stepper
interface Step {
  label: string;
  description?: string;
  completed?: boolean;
}

// List
interface ListItem {
  text: string;
  subtext?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
}
```

---

## Best Practices

1. **ProgressBar**: Use milestones for gamification (Dunzo-style rewards)
2. **ProgressCircle**: Perfect for goal tracking (Headway-style daily goals)
3. **Stepper**: Great for multi-step flows (Khatabook onboarding)
4. **List**: Use checkmarks for benefits (Slack feature lists)
5. **CountdownTimer**: Create urgency for offers (MakeMyTrip flash sales)
6. **Link**: Always add icons to CTAs for better UX

---

## Next Steps

1. ✅ Components created and integrated
2. ⏳ Add properties panel controls
3. ⏳ Create templates using new components
4. ⏳ Implement dynamic variables system
5. ⏳ Add real-time data binding
