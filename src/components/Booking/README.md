# BookingFilter Component

A reusable booking filter component for the hotel booking system.

## Features

- Date selection with calendar popup (Check In / Check Out)
- Number inputs for Adults and Children
- Responsive design for all screen sizes
- Configurable submit button
- Form validation

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onSubmit` | `(values: any) => void` | - | Callback function when form is submitted |
| `showButton` | `boolean` | `true` | Whether to display the "BOOK NOW" submit button |

## Usage

### Basic Usage

```tsx
import BookingFilter from '@/components/booking/BookingFilter';

const MyPage = () => {
  const handleBooking = (values: any) => {
    console.log('Booking data:', values);
    // Handle booking logic here
  };

  return (
    <BookingFilter onSubmit={handleBooking} />
  );
};
```

### Without Submit Button

```tsx
<BookingFilter 
  onSubmit={handleBooking} 
  showButton={false} 
/>
```

## Form Values

The component returns the following values when submitted:

```typescript
{
  checkIn: Dayjs,      // Check-in date
  checkOut: Dayjs,     // Check-out date
  adults: number,      // Number of adults (1-10)
  children: number     // Number of children (0-10)
}
```

## Validation Rules

- **Check In**: Cannot be before today
- **Check Out**: Must be after Check In date
- **Adults**: Between 1 and 10
- **Children**: Between 0 and 10

## Default Values

- Check In: Today
- Check Out: Tomorrow
- Adults: 2
- Children: 1

## Styling

The component uses the following CSS files:
- `BookingFilter.css` - Component-specific styles

To customize the appearance, you can override the CSS classes:
- `.book-now-form` - Main form container
- `.form-group` - Individual form field wrapper
- `.form-submit` - Submit button

## Examples

### Home Page

```tsx
<div className="book-now-area">
  <div className="container">
    <Row justify="center">
      <Col xs={24} lg={20}>
        <BookingFilter onSubmit={handleBookNow} showButton={true} />
      </Col>
    </Row>
  </div>
</div>
```

### Rooms Page

```tsx
<div className="book-now-area">
  <div className="container">
    <Row justify="center">
      <Col xs={24} lg={20}>
        <BookingFilter onSubmit={handleBookNow} showButton={true} />
      </Col>
    </Row>
  </div>
</div>
```

## Dependencies

- `antd` - For Form, DatePicker, and InputNumber components
- `dayjs` - For date manipulation
- React 19+

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 991px
- Desktop: 992px - 1199px
- Large Desktop: >= 1200px
