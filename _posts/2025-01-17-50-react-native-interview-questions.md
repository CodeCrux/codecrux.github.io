---
title: Top 50 React Native interview questions
description: Here’s a comprehensive list of 50 React Native interview questions
  for a 3-year experienced developer, covering basic to advanced topics, with
  hands-on coding examples where needed
image: /img/blogs/top-50-react-native-interview-questions.webp
layout: post
permalink: blog/:title
author: Shyam Mohan
category: ReactNative
date: 2025-01-17T01:04:00.000Z
---
Here’s the **complete list of 50 React Native interview questions and answers**, from **basic to advanced**, with **hands-on coding examples** where needed.  

---

# **🟢 Basic React Native Questions and Answers**  

## **1. What is React Native?**  
React Native is a framework developed by Facebook for building **cross-platform mobile applications** using JavaScript and React. Unlike traditional hybrid frameworks, React Native **renders native UI components**, resulting in better performance and user experience.

---

## **2. How does React Native differ from React.js?**  

| Feature | React Native | React.js |
|---------|-------------|----------|
| **Platform** | Mobile (iOS & Android) | Web Applications |
| **UI Components** | Native Components (`View`, `Text`) | HTML Elements (`div`, `span`) |
| **Styling** | Uses `StyleSheet.create()` | Uses CSS |
| **Navigation** | Uses `react-navigation` | Uses `react-router` |
| **Rendering** | Uses Native UI Components | Uses Virtual DOM |

---

## **3. How do you set up a React Native project?**  
### Using React Native CLI:
```bash
npx react-native init MyApp
cd MyApp
npx react-native start
npx react-native run-android  # OR
npx react-native run-ios
```
### Using Expo:
```bash
npx create-expo-app MyApp
cd MyApp
npm start
```

---

## **4. How does React Native render components?**  
React Native renders using native components instead of HTML elements.  

```javascript
import { View, Text } from 'react-native';

export default function App() {
  return (
    <View>
      <Text>Hello, React Native!</Text>
    </View>
  );
}
```

---

## **5. What are the core components in React Native?**  
- `View` (like `<div>`)
- `Text` (like `<p>`)
- `Image` (for displaying images)
- `ScrollView` (for scrolling views)
- `FlatList` (for optimized lists)

---

## **6. How do you handle styling in React Native?**  
```javascript
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Styled Text</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: 'blue', fontSize: 20 }
});
```

---

## **7. How do you handle user input with `TextInput`?**  
```javascript
import { useState } from 'react';
import { View, TextInput, Text } from 'react-native';

export default function App() {
  const [text, setText] = useState('');
  return (
    <View>
      <TextInput placeholder="Type here" onChangeText={setText} />
      <Text>You typed: {text}</Text>
    </View>
  );
}
```

---

## **8. What is `useState` and how do you use it in React Native?**  
`useState` is a **React Hook** that allows functional components to have state.  

```javascript
const [count, setCount] = useState(0);
```

---

## **9. How do you implement a button in React Native?**  
```javascript
import { Button, Alert } from 'react-native';

<Button title="Click Me" onPress={() => Alert.alert('Hello!')} />
```

---

## **10. What is `FlatList` and how do you use it?**  
`FlatList` is an optimized component for rendering large lists efficiently.  

```javascript
import { FlatList, Text } from 'react-native';

const data = [{ id: '1', name: 'Apple' }, { id: '2', name: 'Banana' }];

export default function App() {
  return (
    <FlatList
      data={data}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <Text>{item.name}</Text>}
    />
  );
}
```

---

Here are the answers to the **React Native interview questions (11-20)**:

---

## **11. How do you handle navigation in React Native?**  
Navigation in React Native is typically handled using the `react-navigation` library.

### **Installation:**
```bash
npm install @react-navigation/native
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated react-native-vector-icons
npm install @react-navigation/stack
```

### **Example using Stack Navigation:**
```javascript
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

Other types of navigation:
- **Bottom Tabs:** `@react-navigation/bottom-tabs`
- **Drawer Navigation:** `@react-navigation/drawer`

---

## **12. What is Redux and how is it used in React Native?**  
Redux is a **state management library** that helps manage global state in React Native applications.

### **Installation:**
```bash
npm install redux react-redux @reduxjs/toolkit
```

### **Steps to use Redux in React Native:**
1. **Create a Redux Store** (`store.js`)
```javascript
import { configureStore, createSlice } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: state => { state.value += 1; },
    decrement: state => { state.value -= 1; }
  }
});

export const { increment, decrement } = counterSlice.actions;

export const store = configureStore({
  reducer: { counter: counterSlice.reducer }
});
```

2. **Provide the Store to the App** (`App.js`)
```javascript
import { Provider } from 'react-redux';
import { store } from './store';
import CounterScreen from './CounterScreen';

export default function App() {
  return (
    <Provider store={store}>
      <CounterScreen />
    </Provider>
  );
}
```

3. **Use Redux State in Components** (`CounterScreen.js`)
```javascript
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from './store';
import { View, Button, Text } from 'react-native';

export default function CounterScreen() {
  const count = useSelector(state => state.counter.value);
  const dispatch = useDispatch();

  return (
    <View>
      <Text>Count: {count}</Text>
      <Button title="+" onPress={() => dispatch(increment())} />
      <Button title="-" onPress={() => dispatch(decrement())} />
    </View>
  );
}
```

---

## **13. How do you fetch API data in React Native?**  
React Native uses the `fetch` API or `axios` for network requests.

### **Using Fetch**
```javascript
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts/1')
      .then(response => response.json())
      .then(json => { setData(json); setLoading(false); });
  }, []);

  return (
    <View>
      {loading ? <ActivityIndicator size="large" /> : <Text>{data.title}</Text>}
    </View>
  );
}
```

### **Using Axios**
```bash
npm install axios
```
```javascript
import axios from 'axios';

axios.get('https://jsonplaceholder.typicode.com/posts/1')
  .then(response => console.log(response.data));
```

---

## **14. How do you handle push notifications in React Native?**  
You can use **Firebase Cloud Messaging (FCM)** with `react-native-firebase`.

### **Installation:**
```bash
npm install @react-native-firebase/app
npm install @react-native-firebase/messaging
```

### **Request Permissions & Receive Notifications**
```javascript
import messaging from '@react-native-firebase/messaging';

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
}

messaging().onMessage(async remoteMessage => {
  console.log('New Notification:', remoteMessage);
});
```

---

## **15. What is Hermes in React Native?**  
**Hermes** is a lightweight JavaScript engine optimized for React Native applications.

### **Benefits:**
- Faster **app startup time**
- Lower **memory usage**
- Reduced **bundle size**

### **How to Enable Hermes in React Native?**
1. Open `android/app/build.gradle`
2. Set `enableHermes: true`
```gradle
project.ext.react = [
    enableHermes: true
]
```
3. Rebuild the app:
```bash
cd android && ./gradlew clean && cd ..
npx react-native run-android
```

---

## **16. What are Native Modules in React Native?**  
Native Modules allow integrating **native code (Java/Kotlin, Swift/Objective-C)** with React Native.

Example: Writing a **Native Module for Android**
```java
package com.example;

import android.widget.Toast;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class ToastModule extends ReactContextBaseJavaModule {
    ToastModule(ReactApplicationContext context) { super(context); }
    
    @Override public String getName() { return "ToastExample"; }

    @ReactMethod
    public void showToast(String message) {
        Toast.makeText(getReactApplicationContext(), message, Toast.LENGTH_SHORT).show();
    }
}
```

Use in React Native:
```javascript
import { NativeModules } from 'react-native';
NativeModules.ToastExample.showToast('Hello from Native!');
```

---

## **17. How do you debug React Native applications?**  
- **React Native Debugger** (Best for Redux & Network logs)
- **Flipper** (Integrated debugging tool)
- **Console Logs** (`console.log()`)
- **Chrome DevTools** (`debugger;` inside JS code)

---

## **18. How do you optimize React Native performance?**  
- Use **FlatList** for large lists
- Optimize images with `react-native-fast-image`
- Use **Memoization** (`useMemo`, `useCallback`)
- Avoid unnecessary re-renders (`React.memo`)
- Use **Hermes Engine** for better JavaScript execution

---

## **19. How does Code Splitting work in React Native?**  
Code splitting helps **load components dynamically** instead of bundling everything at once.

### **Using Dynamic Imports**
```javascript
const LazyComponent = React.lazy(() => import('./LazyComponent'));

function App() {
  return (
    <Suspense fallback={<Text>Loading...</Text>}>
      <LazyComponent />
    </Suspense>
  );
}
```

---

## **20. How do you test React Native applications?**  
- **Unit Testing** (`jest`, `react-test-renderer`)
- **Integration Testing** (`react-native-testing-library`)
- **End-to-End (E2E) Testing** (`detox`)

### **Example: Unit Testing with Jest**
```bash
npm install --save-dev jest react-test-renderer
```
```javascript
import React from 'react';
import renderer from 'react-test-renderer';
import App from '../App';

test('renders correctly', () => {
  const tree = renderer.create(<App />).toJSON();
  expect(tree).toMatchSnapshot();
});
```

---
### **21. What is the difference between `useEffect` and `componentDidMount`?**  
Both are used for side effects in React Native, but they have different usage.

| Feature | `componentDidMount` | `useEffect` |
|---------|---------------------|-------------|
| Type | Lifecycle method (Class components) | Hook (Functional components) |
| When it runs | After the first render | Runs after every render (can be controlled) |
| Cleanup | Uses `componentWillUnmount` | Uses cleanup function in `useEffect` |

### **Example: Using `componentDidMount` in a Class Component**
```javascript
class Example extends React.Component {
  componentDidMount() {
    console.log("Component Mounted");
  }
  
  render() {
    return <Text>Hello</Text>;
  }
}
```

### **Example: Using `useEffect` in a Functional Component**
```javascript
import { useEffect } from 'react';

const Example = () => {
  useEffect(() => {
    console.log("Component Mounted");
  }, []); // Empty dependency array = Runs once like componentDidMount

  return <Text>Hello</Text>;
};
```

---

### **22. How do you handle deep linking in React Native?**  
Deep linking allows users to open specific screens in your app via a URL.

### **Step 1: Install React Navigation and Linking**
```bash
npm install @react-navigation/native react-native-screens react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-vector-icons
```

### **Step 2: Configure Deep Linking**
```javascript
import { NavigationContainer } from '@react-navigation/native';

const linking = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      Home: 'home',
      Profile: 'user/:id'
    }
  }
};

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      {/* Rest of navigation */}
    </NavigationContainer>
  );
}
```

---

### **23. How do you implement dark mode in a React Native app?**  
Use `react-native-appearance` or React Native's `useColorScheme()` hook.

### **Example Using `useColorScheme`**
```javascript
import { useColorScheme, View, Text, StyleSheet } from 'react-native';

export default function App() {
  const scheme = useColorScheme();
  
  return (
    <View style={scheme === 'dark' ? styles.darkContainer : styles.lightContainer}>
      <Text style={scheme === 'dark' ? styles.darkText : styles.lightText}>Hello</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  darkContainer: { backgroundColor: '#000', flex: 1 },
  lightContainer: { backgroundColor: '#fff', flex: 1 },
  darkText: { color: '#fff' },
  lightText: { color: '#000' },
});
```

---

### **24. What is Fast Refresh in React Native, and how does it work?**  
Fast Refresh is a **hot reloading mechanism** that enables instant updates without reloading the app.

### **How it works:**
- Keeps the component state intact
- Automatically re-runs code upon changes
- Enabled by default in React Native **0.61+**

---

### **25. How does React Native Bridge work?**  
The React Native bridge allows communication between JavaScript and native code (Java/Kotlin for Android, Swift/Objective-C for iOS).

- **JS thread** executes JavaScript code
- **Native thread** runs platform-specific code
- The **bridge** transfers data between them asynchronously

### **Example: Calling Native Module**
```javascript
import { NativeModules } from 'react-native';
NativeModules.ToastExample.showToast('Hello from Native!');
```

---

### **26. What is Gesture Handler in React Native, and how do you use it?**  
`react-native-gesture-handler` is an improved gesture system for handling touch events.

### **Installation**
```bash
npm install react-native-gesture-handler
```

### **Example: Swipe Gesture**
```javascript
import { GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';

const App = () => (
  <GestureHandlerRootView>
    <PanGestureHandler onGestureEvent={() => console.log("Swiped!")}>
{% raw %}      <View style={{ width: 100, height: 100, backgroundColor: 'blue' }} />{% endraw %}
    </PanGestureHandler>
  </GestureHandlerRootView>
);
```

---

### **27. How do you persist data locally in React Native?**  
You can use:
- `AsyncStorage` (For simple key-value storage)
- `react-native-mmkv` (Faster alternative)
- `SQLite` (For structured storage)

### **Example: Using AsyncStorage**
```bash
npm install @react-native-async-storage/async-storage
```
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const storeData = async () => {
  await AsyncStorage.setItem('username', 'JohnDoe');
};

const getData = async () => {
  const value = await AsyncStorage.getItem('username');
  console.log(value);
};
```

---

### **28. What are the best libraries for animations in React Native?**  
1. **`react-native-reanimated`** (Highly performant)
2. **`react-native-animatable`** (Simple pre-built animations)
3. **`Lottie`** (For complex animations)

---

### **29. How do you create a custom hook in React Native?**  
Custom hooks allow you to **reuse logic** across components.

### **Example: Custom Hook for Fetching Data**
```javascript
import { useState, useEffect } from 'react';

const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(json => { setData(json); setLoading(false); });
  }, [url]);

  return { data, loading };
};

export default useFetch;
```

### **Usage:**
```javascript
const { data, loading } = useFetch('https://jsonplaceholder.typicode.com/posts/1');
```

---

### **30. How do you handle background tasks in React Native?**  
Use `react-native-background-fetch` or `react-native-worker-threads`.

### **Example: Running a Background Task**
```bash
npm install react-native-background-fetch
```
```javascript
import BackgroundFetch from 'react-native-background-fetch';

const MyTask = async () => {
  console.log("Background Task Running...");
  BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
};

BackgroundFetch.configure({ minimumFetchInterval: 15 }, MyTask);
```

---

### **31. What are different types of state management solutions in React Native?**  
State management helps manage data across components in a React Native app. Some popular solutions are:

1. **React Context API** – Built-in, suitable for small apps.
2. **Redux** – Centralized store, useful for complex apps.
3. **MobX** – Reactive, less boilerplate than Redux.
4. **Recoil** – Lightweight, atomic state management.
5. **Zustand** – Minimalist, fast, easy to use.
6. **Jotai** – Simplified Recoil alternative.
7. **React Query** – Manages async state and caching.

### **Example: Using React Context API**
```javascript
import React, { createContext, useState, useContext } from 'react';

const MyContext = createContext();

export const MyProvider = ({ children }) => {
  const [state, setState] = useState("Hello World");
{% raw %}
  return <MyContext.Provider value={{ state, setState }}>{children}</MyContext.Provider>;
{% endraw %}
};

export const useMyContext = () => useContext(MyContext);
```
---

### **32. How do you use Firebase Authentication in React Native?**  
Firebase Authentication allows users to log in using email/password, Google, Facebook, etc.

### **Step 1: Install Firebase**
```bash
npm install @react-native-firebase/auth
```

### **Step 2: Initialize Firebase Auth**
```javascript
import auth from '@react-native-firebase/auth';

// Sign up user
const signUp = async (email, password) => {
  try {
    await auth().createUserWithEmailAndPassword(email, password);
  } catch (error) {
    console.error(error);
  }
};

// Sign in user
const signIn = async (email, password) => {
  try {
    await auth().signInWithEmailAndPassword(email, password);
  } catch (error) {
    console.error(error);
  }
};
```
---

### **33. How do you implement lazy loading in React Native?**  
Lazy loading loads components **only when needed**, reducing initial load time.

### **Example: Using `React.lazy()`**
```javascript
import React, { Suspense, lazy } from 'react';
const LazyComponent = lazy(() => import('./LazyComponent'));

const App = () => (
  <Suspense fallback={<Text>Loading...</Text>}>
    <LazyComponent />
  </Suspense>
);
```

For images, use `react-native-fast-image`:
```bash
npm install react-native-fast-image
```
```javascript
import FastImage from 'react-native-fast-image';
{% raw %}
<FastImage source={{ uri: 'https://example.com/image.jpg' }} style={{ width: 100, height: 100 }} />;
{% endraw %}
```
---

### **34. What are the main differences between React Native CLI and Expo?**  

| Feature | React Native CLI | Expo |
|---------|-----------------|------|
| Custom Native Modules | ✅ Yes | ❌ No |
| Performance | ⚡ Faster | 🚀 Good |
| OTA Updates | ❌ No | ✅ Yes |
| Setup Complexity | ⚙️ Manual | 🔥 Easy |
| App Store Deployment | 🛠️ Manual | ⚡ Simplified |

**Expo is better for beginners**; React Native CLI is best for **custom native code**.

---

### **35. How do you handle large lists efficiently in React Native?**  
Use `FlatList` or `SectionList` with optimization techniques:

1. **Use `keyExtractor`** to improve rendering.
2. **Enable `windowSize` & `initialNumToRender`** for rendering efficiency.
3. **Use `getItemLayout`** for faster scrolling.
4. **Avoid inline functions in `renderItem`**.
5. **Use `PureComponent` or `React.memo`** for performance.

### **Example: Optimized FlatList**
```javascript
import { FlatList, Text } from 'react-native';

const renderItem = ({ item }) => <Text>{item.title}</Text>;

<FlatList
  data={data}
  renderItem={renderItem}
  keyExtractor={(item) => item.id.toString()}
  initialNumToRender={10}
  windowSize={5}
/>;
```
---

### **36. What are VirtualizedLists in React Native?**  
VirtualizedLists **only render items on the screen**, improving performance.

**Example: Using `VirtualizedList`**
```javascript
import { VirtualizedList, Text } from 'react-native';

const getItem = (data, index) => data[index];

<VirtualizedList
  data={Array.from({ length: 10000 })}
  renderItem={({ item }) => <Text>{item}</Text>}
  getItemCount={(data) => data.length}
  getItem={getItem}
/>;
```
---

### **37. How do you optimize React Native images for performance?**  
1. **Use smaller, optimized images (WebP, PNG)**
2. **Use `react-native-fast-image` for caching**
3. **Lazy-load images using `FastImage`**
4. **Optimize network requests using CDN**

**Example using `react-native-fast-image`**
```javascript
import FastImage from 'react-native-fast-image';
{% raw %}
<FastImage
  source={{ uri: 'https://example.com/image.jpg', priority: FastImage.priority.high }}
  style={{ width: 200, height: 200 }}
/>;
{% endraw %}
```
---

### **38. What is the difference between `useMemo` and `useCallback`?**  

| Feature | `useMemo` | `useCallback` |
|---------|----------|--------------|
| Purpose | Memoizes values | Memoizes functions |
| Returns | Cached result | Cached function |
| Use Case | Expensive calculations | Prevents unnecessary re-renders |

### **Example: `useMemo`**
```javascript
import { useMemo } from 'react';

const sum = useMemo(() => expensiveFunction(a, b), [a, b]);
```

### **Example: `useCallback`**
```javascript
import { useCallback } from 'react';

const handleClick = useCallback(() => console.log("Clicked"), []);
```
---

### **39. How do you implement biometric authentication in React Native?**  
Use `react-native-biometrics` for Face ID and Fingerprint.

### **Installation**
```bash
npm install react-native-biometrics
```

### **Example:**
```javascript
import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

rnBiometrics.simplePrompt({ promptMessage: 'Confirm fingerprint' })
  .then(result => console.log(result.success ? "Success" : "Failed"));
```
---

### **40. How does dynamic theming work in React Native?**  
Dynamic theming allows users to switch between themes (light/dark).

### **Step 1: Create Theme Context**
```javascript
import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  return (
{% raw %}    <ThemeContext.Provider value={{ theme, setTheme }}>{% endraw %}
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

### **Step 2: Use Theme in Components**
```javascript
import { useTheme } from './ThemeContext';

const ThemedComponent = () => {
{% raw %}  const { theme, setTheme } = useTheme();{% endraw %}

  return (
{% raw %}    <View style={{ backgroundColor: theme === 'dark' ? '#000' : '#fff' }}>{% endraw %}
      <Text onPress={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Toggle Theme</Text>
    </View>
  );
};
```

---

## **41. How do you use Reanimated for smooth animations?**  
`react-native-reanimated` provides better performance than the default Animated API.  

### **Installation**  
```bash
npm install react-native-reanimated
```
Enable Reanimated in `babel.config.js`:  
```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: ['react-native-reanimated/plugin'],
};
```

### **Example: Simple Fade Animation**  
```javascript
import { View } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

const FadeInView = () => {
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(opacity.value, { duration: 1000 }),
  }));

  return <Animated.View style={[{ width: 100, height: 100, backgroundColor: 'blue' }, animatedStyle]} />;
};
```

---

## **42. What are the different ways to handle global state in React Native?**  
1. **Context API** – Simple, built-in.  
2. **Redux** – Centralized state, suitable for complex apps.  
3. **MobX** – Less boilerplate than Redux.  
4. **Recoil** – Lightweight atomic state management.  
5. **Zustand** – Minimalist and fast.  
6. **Jotai** – Simplified Recoil alternative.  
7. **React Query** – Async state management, great for APIs.

### **Example: Using Redux**  
```javascript
import { createStore } from 'redux';
import { Provider, useSelector, useDispatch } from 'react-redux';

const reducer = (state = { count: 0 }, action) => {
  if (action.type === 'INCREMENT') return { count: state.count + 1 };
  return state;
};

const store = createStore(reducer);

const Counter = () => {
  const count = useSelector(state => state.count);
  const dispatch = useDispatch();
  return <Button title={`Count: ${count}`} onPress={() => dispatch({ type: 'INCREMENT' })} />;
};

const App = () => (
  <Provider store={store}>
    <Counter />
  </Provider>
);
```

---

## **43. How do you deploy a React Native app to the App Store and Google Play?**  
### **For iOS**  
1. Create an Apple Developer Account.  
2. Use Xcode to configure signing and provisioning.  
3. Run `npx react-native run-ios --release`.  
4. Archive and upload the app via Xcode.  
5. Submit for App Store review.

### **For Android**  
1. Generate a signed APK:  
```bash
cd android && ./gradlew assembleRelease
```
2. Upload to Google Play Console.  
3. Set up store listing and review.  

---

## **44. How do you optimize app size in React Native?**  
1. **Enable Hermes** for Android:  
   - Add this to `android/app/build.gradle`:  
     ```gradle
     enableHermes: true
     ```
2. **Optimize image sizes** (use WebP).  
3. **Reduce dependencies** (avoid unused packages).  
4. **Enable Proguard** (Android) for code shrinking.  
5. **Use react-native-fast-image** for image caching.  
6. **Bundle assets efficiently** using Metro bundler.  

---

## **45. How do you implement infinite scrolling in React Native?**  
Use `FlatList` with `onEndReached`.

```javascript
import { FlatList, Text } from 'react-native';
import { useState } from 'react';

const App = () => {
  const [data, setData] = useState([...Array(20).keys()]);

  const loadMore = () => setData([...data, ...Array(10).keys().map(i => i + data.length)]);

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => <Text>{item}</Text>}
      keyExtractor={(item) => item.toString()}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
    />
  );
};
```

---

## **46. How does React Native handle accessibility (a11y)?**  
React Native provides built-in accessibility features:

1. **Accessible Components**:  
   ```javascript
   <Text accessibilityLabel="Submit Button">Submit</Text>
   ```
2. **VoiceOver & TalkBack Support**  
3. **Keyboard Navigation (`accessible` prop)**  
4. **Dynamic Font Scaling (`allowFontScaling`)**  

---

## **47. How do you implement real-time chat using WebSockets in React Native?**  
Use `react-native-websocket`.

```bash
npm install react-native-websocket
```

### **Example WebSocket Client**
```javascript
import { useEffect, useState } from 'react';
import { Text, Button } from 'react-native';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const ws = new WebSocket('wss://yourserver.com');

  useEffect(() => {
    ws.onmessage = event => setMessages([...messages, event.data]);
  }, [messages]);

  return (
    <Button title="Send" onPress={() => ws.send('Hello!')} />
  );
};
```

---

## **48. What is the difference between Native Components and React Native Components?**  
| Feature | Native Components | React Native Components |
|---------|------------------|------------------------|
| Written in | Swift, Kotlin | JavaScript |
| Performance | Faster | Slower |
| Flexibility | Full access to platform | Cross-platform |

---

## **49. How do you implement offline mode in React Native applications?**  
Use `AsyncStorage` or `react-native-mmkv` for local data storage.

```bash
npm install @react-native-async-storage/async-storage
```

### **Example: Storing Data Locally**
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const storeData = async (key, value) => {
  await AsyncStorage.setItem(key, value);
};

const getData = async (key) => {
  const value = await AsyncStorage.getItem(key);
  return value;
};
```

---

## **50. How do you integrate GraphQL with React Native using Apollo?**  
### **Step 1: Install Apollo Client**  
```bash
npm install @apollo/client graphql
```

### **Step 2: Create Apollo Client**  
```javascript
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://your-graphql-server.com',
  cache: new InMemoryCache(),
});
```

### **Step 3: Query Data**  
```javascript
import { useQuery } from '@apollo/client';
import { Text } from 'react-native';

const GET_USERS = gql`
  query {
    users {
      id
      name
    }
  }
`;

const Users = () => {
  const { loading, data } = useQuery(GET_USERS);

  return loading ? <Text>Loading...</Text> : <Text>{data.users[0].name}</Text>;
};
```

---


