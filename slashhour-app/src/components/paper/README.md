# React Native Paper Components Guide

React Native Paper is now integrated with your Slashhour design system! This guide shows you how to use Paper components in your app.

## 🎨 Available Components

### Buttons
```tsx
import { Button } from 'react-native-paper';

// Primary button
<Button mode="contained" onPress={handlePress}>
  Save Changes
</Button>

// Outlined button
<Button mode="outlined" onPress={handlePress}>
  Cancel
</Button>

// Text button
<Button mode="text" onPress={handlePress}>
  Learn More
</Button>

// With icon
<Button mode="contained" icon="camera" onPress={handlePress}>
  Upload Photo
</Button>

// Loading state
<Button mode="contained" loading={isLoading}>
  Submitting...
</Button>
```

### Text Inputs
```tsx
import { TextInput } from 'react-native-paper';

// Outlined input (recommended)
<TextInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  mode="outlined"
  keyboardType="email-address"
/>

// With icon
<TextInput
  label="Password"
  value={password}
  onChangeText={setPassword}
  mode="outlined"
  secureTextEntry
  right={<TextInput.Icon icon="eye" />}
/>

// With helper text
<TextInput
  label="Username"
  value={username}
  onChangeText={setUsername}
  mode="outlined"
  error={hasError}
/>
<HelperText type="error" visible={hasError}>
  Username is required
</HelperText>
```

### Cards
```tsx
import { Card, Text } from 'react-native-paper';

<Card mode="elevated">
  <Card.Cover source={{ uri: 'https://...' }} />
  <Card.Title
    title="Deal Title"
    subtitle="Business Name"
    left={(props) => <Avatar.Icon {...props} icon="store" />}
  />
  <Card.Content>
    <Text variant="bodyMedium">Deal description...</Text>
  </Card.Content>
  <Card.Actions>
    <Button>Cancel</Button>
    <Button mode="contained">Redeem</Button>
  </Card.Actions>
</Card>
```

### Chips
```tsx
import { Chip } from 'react-native-paper';

// Filter chip
<Chip
  selected={isSelected}
  onPress={handlePress}
  icon="check"
>
  Electronics
</Chip>

// Removable chip
<Chip
  onClose={handleRemove}
  icon="tag"
>
  Sale
</Chip>
```

### FAB (Floating Action Button)
```tsx
import { FAB } from 'react-native-paper';

<FAB
  icon="plus"
  style={styles.fab}
  onPress={handleCreate}
/>

// FAB Group
<FAB.Group
  open={isOpen}
  icon={isOpen ? 'close' : 'plus'}
  actions={[
    { icon: 'star', label: 'Favorite', onPress: () => {} },
    { icon: 'email', label: 'Email', onPress: () => {} },
  ]}
  onStateChange={({ open }) => setIsOpen(open)}
/>
```

### Snackbar (Toast Notifications)
```tsx
import { Snackbar } from 'react-native-paper';

<Snackbar
  visible={visible}
  onDismiss={() => setVisible(false)}
  duration={3000}
  action={{
    label: 'Undo',
    onPress: handleUndo,
  }}
>
  Deal saved successfully!
</Snackbar>
```

### Dialog (Modal)
```tsx
import { Dialog, Portal, Text } from 'react-native-paper';

<Portal>
  <Dialog visible={visible} onDismiss={hideDialog}>
    <Dialog.Title>Confirm Delete</Dialog.Title>
    <Dialog.Content>
      <Text variant="bodyMedium">
        Are you sure you want to delete this deal?
      </Text>
    </Dialog.Content>
    <Dialog.Actions>
      <Button onPress={hideDialog}>Cancel</Button>
      <Button onPress={handleDelete}>Delete</Button>
    </Dialog.Actions>
  </Dialog>
</Portal>
```

### Activity Indicator
```tsx
import { ActivityIndicator } from 'react-native-paper';

<ActivityIndicator animating={true} color={COLORS.primary} />
<ActivityIndicator animating={true} size="large" />
```

### Divider
```tsx
import { Divider } from 'react-native-paper';

<Divider />
<Divider bold />
```

### List Items
```tsx
import { List } from 'react-native-paper';

<List.Item
  title="Settings"
  description="Manage your preferences"
  left={props => <List.Icon {...props} icon="cog" />}
  right={props => <List.Icon {...props} icon="chevron-right" />}
  onPress={handlePress}
/>

// Accordion
<List.Accordion
  title="Categories"
  left={props => <List.Icon {...props} icon="folder" />}
>
  <List.Item title="Electronics" />
  <List.Item title="Fashion" />
</List.Accordion>
```

### Badge
```tsx
import { Badge } from 'react-native-paper';

<Badge>3</Badge>
<Badge size={20}>New</Badge>
```

### Avatar
```tsx
import { Avatar } from 'react-native-paper';

<Avatar.Image size={48} source={{ uri: avatarUrl }} />
<Avatar.Text size={48} label="JD" />
<Avatar.Icon size={48} icon="account" />
```

### Switch & Checkbox
```tsx
import { Switch, Checkbox } from 'react-native-paper';

<Switch value={isSwitchOn} onValueChange={setIsSwitchOn} />
<Checkbox
  status={checked ? 'checked' : 'unchecked'}
  onPress={() => setChecked(!checked)}
/>
```

### Radio Button
```tsx
import { RadioButton } from 'react-native-paper';

<RadioButton.Group onValueChange={setValue} value={value}>
  <RadioButton.Item label="Option 1" value="first" />
  <RadioButton.Item label="Option 2" value="second" />
</RadioButton.Group>
```

### Progress Bar
```tsx
import { ProgressBar } from 'react-native-paper';

<ProgressBar progress={0.7} color={COLORS.primary} />
```

### Surface (Elevated Container)
```tsx
import { Surface } from 'react-native-paper';

<Surface style={styles.surface} elevation={2}>
  <Text>Content here</Text>
</Surface>
```

### Typography (Text Variants)
```tsx
import { Text } from 'react-native-paper';

<Text variant="displayLarge">Display Large</Text>
<Text variant="displayMedium">Display Medium</Text>
<Text variant="headlineLarge">Headline Large</Text>
<Text variant="titleLarge">Title Large</Text>
<Text variant="bodyLarge">Body Large</Text>
<Text variant="labelMedium">Label Medium</Text>
```

## 🎯 Usage Examples

### Example: Login Form
```tsx
import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, HelperText, Text } from 'react-native-paper';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  return (
    <View style={styles.form}>
      <Text variant="headlineMedium" style={styles.title}>
        Welcome Back
      </Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        left={<TextInput.Icon icon="email" />}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry={!showPassword}
        left={<TextInput.Icon icon="lock" />}
        right={
          <TextInput.Icon
            icon={showPassword ? "eye-off" : "eye"}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />

      <HelperText type="error" visible={!!error}>
        {error}
      </HelperText>

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        style={styles.button}
      >
        Sign In
      </Button>

      <Button mode="text" onPress={handleForgotPassword}>
        Forgot Password?
      </Button>
    </View>
  );
}
```

### Example: Filter Chips
```tsx
import { ScrollView, View } from 'react-native';
import { Chip } from 'react-native-paper';

function CategoryFilters({ selected, onSelect }) {
  const categories = [
    'Electronics', 'Fashion', 'Food', 'Beauty', 'Home'
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.chipContainer}>
        {categories.map((category) => (
          <Chip
            key={category}
            selected={selected === category}
            onPress={() => onSelect(category)}
            style={styles.chip}
          >
            {category}
          </Chip>
        ))}
      </View>
    </ScrollView>
  );
}
```

## 📚 Best Practices

1. **Use Paper components for interactive elements** - Buttons, inputs, dialogs
2. **Mix with existing custom components** - Keep your DealCard, but use Paper for buttons inside
3. **Consistent theming** - Paper automatically uses your theme colors
4. **Accessibility built-in** - Paper components have better accessibility
5. **Portal for overlays** - Always wrap dialogs/modals in `<Portal>`

## 🔗 Documentation

Full Paper documentation: https://callstack.github.io/react-native-paper/

## 💡 Quick Wins

Replace these common patterns:

### Before (Custom)
```tsx
<TouchableOpacity style={styles.button} onPress={handlePress}>
  <Text style={styles.buttonText}>Submit</Text>
</TouchableOpacity>
```

### After (Paper)
```tsx
<Button mode="contained" onPress={handlePress}>
  Submit
</Button>
```

This gives you:
- ✅ Ripple effect
- ✅ Loading state
- ✅ Disabled state
- ✅ Icons support
- ✅ Accessibility
- ✅ Consistent theming
