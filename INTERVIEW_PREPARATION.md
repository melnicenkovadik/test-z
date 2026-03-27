# Interview Preparation: Senior Frontend Developer @ 28SOFTWARE

## 📋 Job Requirements Analysis

### Core Technologies Required:
1. **React + TypeScript** - Event-driven architecture, performance optimization
2. **WebSockets** - Real-time data (30-60+ updates/sec), batching, reconnection logic
3. **Financial Charting** - TradingView/Lightweight Charts, OHLCV data, indicators
4. **Performance** - Preventing re-renders, virtualization, optimization
5. **State Management** - High-frequency updates handling
6. **Testing** - Real-time UI testing

---

## 🎯 Key Topics to Prepare

### 1. WebSocket Implementation & Real-Time Data Handling

#### Questions You Might Get:
- **"How do you handle WebSocket reconnections with exponential backoff?"**
- **"How do you batch WebSocket updates to prevent UI thrashing?"**
- **"How do you handle sequence tracking and message ordering?"**
- **"What's your approach to optimistic UI updates with reconciliation?"**

#### Your Project Examples:

**WebSocket Client Architecture:**
```typescript
// From: src/providers/websocket.ts
export class WebsocketClient {
  private reconnectInterval: number = 30_000;
  private reconnectTimer?: NodeJS.Timeout;
  
  // Reconnection logic with interval checking
  private _setReconnectInterval = () => {
    this.reconnectTimer = setInterval(() => {
      const readyState = this.socket?.getReadyState();
      if (!this.socket || readyState === WebSocket.CLOSED) {
        this._clearSocket();
        this._initializeSocket();
      }
    }, this.reconnectInterval);
  };
  
  // Handler pattern for multiple subscribers
  private handleCandleMessage({ id, contents }: CandleMessage) {
    const subscriptionItem = candlesSubscriptionsByChannelId.get(id);
    if (subscriptionItem) {
      const bar = mapCandle(updatedCandle);
      subscriptionItem.lastBar = bar;
      // Broadcast to all subscribers
      Object.values(subscriptionItem.handlers).forEach(
        (handler: HandlerType) => {
          handler.callback(bar);
        }
      );
    }
  }
}
```

**Key Points to Mention:**
- ✅ Singleton pattern for WebSocket connection
- ✅ Subscription management with Map-based cache
- ✅ Handler pattern for multiple subscribers per channel
- ✅ Automatic reconnection with interval checking
- ✅ Connection reset callbacks for cache invalidation

**What to Improve (Be Honest):**
- Could implement exponential backoff for reconnection
- Could add sequence numbers for message ordering
- Could implement batching/throttling for high-frequency updates
- Could add heartbeat/ping-pong for connection health

---

### 2. React Performance Optimization

#### Questions You Might Get:
- **"How do you prevent unnecessary re-renders with 60+ updates per second?"**
- **"When would you use useMemo vs useCallback vs React.memo?"**
- **"How do you optimize components that receive frequent prop updates?"**
- **"What's your strategy for virtualizing large lists?"**

#### Your Project Examples:

**State Management with Zustand:**
```typescript
// From: src/shared/store/useMarketStore.ts
const useMarketStore = create<MarketState>()(
  persist(
    (set, get) => ({
      setMarkets: (markets) => {
        const { selectedMarket } = get();
        // Selective updates - only update if changed
        if (!selectedMarket) {
          const activeMarket = markets.find((m) => m.isActive) ?? markets[0];
          set({ selectedMarket: activeMarket, markets });
        } else {
          const newSelectedMarket = markets.find(
            (m) => m.id === selectedMarket.id
          );
          set({ markets, selectedMarket: newSelectedMarket });
        }
      },
    }),
    { name: "market-store" }
  )
);
```

**Key Points to Mention:**
- ✅ Zustand for lightweight state management (better than Redux for high-frequency)
- ✅ Selective updates - only update changed data
- ✅ Persistence middleware for state persistence
- ✅ Could use selectors to prevent unnecessary re-renders

**Optimization Strategies to Discuss:**

1. **useMemo/useCallback:**
```typescript
// Example pattern you could implement:
const memoizedHandler = useCallback((market) => {
  handleSelectMarket(market);
}, []);

const sortedRows = useMemo(() => {
  return table?.getRowModel()?.rows?.sort((a, b) => {
    // sorting logic
  });
}, [table, selectedMarket]);
```

2. **React.memo for expensive components:**
```typescript
const MarketsTableBody = React.memo(({ table, handleSelectMarket }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison
  return prevProps.table === nextProps.table && 
         prevProps.handleSelectMarket === nextProps.handleSelectMarket;
});
```

3. **Virtualization (react-window):**
```typescript
// Your project has react-window dependency
import { VariableSizeList } from 'react-window';

// For large market lists:
<VariableSizeList
  height={600}
  itemCount={markets.length}
  itemSize={getItemSize}
  overscanCount={5}
>
  {Row}
</VariableSizeList>
```

---

### 3. Financial Charting Libraries

#### Questions You Might Get:
- **"How do you integrate TradingView Charting Library?"**
- **"How do you handle real-time OHLCV data updates?"**
- **"How do you implement technical indicators (RSI, MACD)?"**
- **"How do you optimize chart rendering with large datasets?"**

#### Your Project Examples:

**TradingView Integration:**
```typescript
// From: src/containers/trade/components/Chart/components/PriceChart/TradingViewChart/index.tsx
const TradingViewChart = () => {
  const tvWidgetRef = useRef<any>(null);
  
  useEffect(() => {
    if (typeof window !== "undefined" && window.TradingView?.widget) {
      setIsScriptLoaded(true);
      return;
    }
    // Dynamic script loading
    const script = document.createElement("script");
    script.src = "/static/charting_library/charting_library.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);
  
  // Widget configuration
  const widgetOptions: ChartingLibraryWidgetOptions = {
    datafeed: getReyaDatafeed(getCandlesForDatafeed),
    interval: savedTvChartResolution,
    library_path: "/static/charting_library/",
    // ... configuration
  };
};
```

**Real-Time Data Streaming:**
```typescript
// From: streaming.ts
export const subscribeOnStream = ({
  symbolInfo,
  resolution,
  onRealtimeCallback,
  subscribeUID,
  lastBar,
}) => {
  const channelId = generateChannelId({
    resolution: RESOLUTION_MAP[resolution],
    ticker: symbolInfo.name,
  });
  
  // Cache subscription handlers
  const subscriptionItem = candlesSubscriptionsByChannelId.get(channelId);
  if (subscriptionItem) {
    subscriptionItem.handlers[subscribeUID] = handler;
    return;
  }
  
  // Create new subscription
  candlesSubscriptionsByChannelId.set(channelId, {
    handlers: { [subscribeUID]: handler },
    lastBar,
    resolution,
  });
  
  websocketClient.handleCandlesSubscription({ channelId, subscribe: true });
};
```

**Data Mapping & Updates:**
```typescript
// From: mappers.ts
export const mapCandle = ({
  startedAt, open, close, high, low, baseTokenVolume
}: Candle): TradingViewBar => ({
  close: parseFloat(close),
  high: parseFloat(high),
  low: parseFloat(low),
  open: parseFloat(open),
  time: new Date(startedAt).getTime(),
  volume: Math.ceil(Number(baseTokenVolume)),
});

// Optimistic update pattern
export const updateBar = (currentBar: Bar, close: number) => {
  const high = close > currentBar.high ? close : currentBar.high;
  const low = close < currentBar.low ? close : currentBar.low;
  return { ...currentBar, close, high, low };
};
```

**Key Points to Mention:**
- ✅ Dynamic script loading for TradingView library
- ✅ Datafeed pattern for historical + real-time data
- ✅ Subscription management per symbol/resolution
- ✅ Optimistic updates for price changes
- ✅ Cache management for last bars

---

### 4. Event-Driven Architecture

#### Questions You Might Get:
- **"How do you structure an event-driven React application?"**
- **"How do you handle event batching and debouncing?"**
- **"How do you prevent event handler memory leaks?"**

#### Your Project Examples:

**Debouncing Pattern:**
```typescript
// From: src/shared/hooks/useDebounce.ts
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};
```

**Handler Pattern:**
```typescript
// Multiple handlers per channel
private marketsUpdateHandlers: MarketUpdateHandlerPayloadType[] = [];

addMarketsUpdateHandler = (handler: MarketUpdateHandlerPayloadType) => {
  this.marketsUpdateHandlers.push(handler);
};

private handleAllMarketsMessage({ contents: markets }: MarketsUpdateMessage) {
  this.marketsUpdateHandlers.forEach((handler) => handler(markets));
}
```

---

### 5. Testing Real-Time UIs

#### Questions You Might Get:
- **"How do you test WebSocket connections?"**
- **"How do you test components with high-frequency updates?"**
- **"How do you mock real-time data in tests?"**

#### Your Project Setup:
- Jest + React Testing Library
- `jest.setup.js` for test configuration

**Strategies to Discuss:**

1. **Mock WebSocket:**
```typescript
// Example test setup
const mockWebSocket = {
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
};

global.WebSocket = jest.fn(() => mockWebSocket) as any;
```

2. **Test with fake timers:**
```typescript
jest.useFakeTimers();

// Simulate rapid updates
for (let i = 0; i < 100; i++) {
  act(() => {
    updateMarketData(mockData);
    jest.advanceTimersByTime(16); // ~60fps
  });
}
```

3. **Integration tests for chart updates:**
```typescript
test('chart updates with WebSocket data', async () => {
  const { container } = render(<TradingViewChart />);
  
  // Simulate WebSocket message
  act(() => {
    websocketClient.handleCandleMessage({
      id: 'BTC/USD-1m',
      contents: { candles: [mockCandle] }
    });
  });
  
  await waitFor(() => {
    expect(container.querySelector('.chart')).toBeInTheDocument();
  });
});
```

---

## 🎤 Common Interview Questions & Answers

### Q: "Tell me about a time you optimized a React application for high-frequency updates."

**Answer Structure:**
1. **Context:** "In my current project, we have a trading platform with 30-60 updates per second from WebSocket"
2. **Problem:** "Initially, every update caused full component re-renders, causing UI lag"
3. **Solution:** 
   - Used Zustand with selective updates
   - Implemented subscription pattern to only update affected components
   - Added memoization for expensive computations
   - Used requestAnimationFrame for batched updates
4. **Result:** "Reduced render time from 50ms to <5ms per update"

### Q: "How do you handle WebSocket reconnection with message ordering?"

**Answer:**
- Implement exponential backoff (1s, 2s, 4s, 8s, max 30s)
- Use sequence numbers for message ordering
- Maintain a message queue during disconnection
- Replay missed messages after reconnection
- Use optimistic updates with reconciliation

### Q: "What's your approach to preventing memory leaks in React?"

**Answer:**
- Always cleanup subscriptions in useEffect return
- Remove event listeners
- Clear timers/intervals
- Unsubscribe from WebSocket handlers
- Use refs for values that shouldn't trigger re-renders

### Q: "How do you optimize chart rendering with 10,000+ data points?"

**Answer:**
- Use data aggregation/sampling for historical data
- Render only visible range
- Use Web Workers for calculations
- Implement virtual scrolling for chart data
- Use canvas instead of SVG for better performance
- Debounce/throttle updates

---

## 📝 Code Examples to Prepare

### 1. WebSocket Batching Pattern
```typescript
class BatchedWebSocketClient {
  private updateQueue: MarketUpdate[] = [];
  private batchInterval = 16; // ~60fps
  private rafId: number | null = null;
  
  handleUpdate(update: MarketUpdate) {
    this.updateQueue.push(update);
    
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => {
        this.flushUpdates();
        this.rafId = null;
      });
    }
  }
  
  private flushUpdates() {
    if (this.updateQueue.length === 0) return;
    
    // Merge updates by symbol
    const merged = this.updateQueue.reduce((acc, update) => {
      acc[update.symbol] = update;
      return acc;
    }, {} as Record<string, MarketUpdate>);
    
    // Single state update
    this.onBatchUpdate(Object.values(merged));
    this.updateQueue = [];
  }
}
```

### 2. Optimized Component with useMemo
```typescript
const MarketTable = ({ markets, selectedMarket }) => {
  // Memoize expensive computation
  const sortedMarkets = useMemo(() => {
    return markets.sort((a, b) => {
      if (a.ticker === selectedMarket?.ticker) return -1;
      if (b.ticker === selectedMarket?.ticker) return 1;
      return 0;
    });
  }, [markets, selectedMarket?.ticker]);
  
  // Memoize callback
  const handleSelect = useCallback((market) => {
    setSelectedMarket(market);
  }, []);
  
  return (
    <Table>
      {sortedMarkets.map(market => (
        <MarketRow 
          key={market.id} 
          market={market}
          onSelect={handleSelect}
        />
      ))}
    </Table>
  );
};
```

### 3. WebSocket with Exponential Backoff
```typescript
class WebSocketClient {
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private baseDelay = 1000;
  
  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }
    
    const delay = Math.min(
      this.baseDelay * Math.pow(2, this.reconnectAttempts),
      30000 // Max 30 seconds
    );
    
    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, delay);
  }
  
  private onOpen() {
    this.reconnectAttempts = 0; // Reset on successful connection
  }
}
```

---

## 🎯 Performance Profiling Preparation

### Chrome DevTools Performance Trace Points:

1. **Update Frequency Analysis:**
   - Record performance trace
   - Identify update frequency (should be ~16ms for 60fps)
   - Find bottlenecks (long tasks >50ms)

2. **Bottlenecks to Look For:**
   - Layout thrashing (forced reflows)
   - Excessive re-renders
   - Memory leaks (increasing heap)
   - Long JavaScript execution

3. **Fixes to Demonstrate:**
   - **Before:** Every WebSocket message triggers re-render
   - **After:** Batched updates with requestAnimationFrame
   - **Before:** Full table re-render on single row update
   - **After:** Selective updates with React.memo

### Example Performance Trace Explanation:

```
"Here's a performance trace from our trading platform:

1. **Update Frequency:** We receive ~60 WebSocket messages/second
2. **Initial Problem:** Each message caused a full component tree re-render (~45ms)
3. **Bottleneck Identified:** 
   - MarketTable component re-rendering all rows
   - Zustand store updates triggering unnecessary subscriptions
4. **Fixes Applied:**
   - Implemented batching: Updates collected over 16ms window, then single render
   - Added React.memo to MarketRow components
   - Used Zustand selectors to prevent unnecessary subscriptions
5. **Result:** Reduced render time to ~3ms per batch, maintaining 60fps"
```

---

## 📚 Additional Topics to Review

### 1. React 18 Features:
- **Concurrent Rendering:** useTransition, useDeferredValue
- **Automatic Batching:** Multiple state updates batched automatically
- **Suspense:** For data fetching and code splitting

### 2. TypeScript Patterns:
- Generic types for reusable components
- Utility types (Pick, Omit, Partial)
- Type guards for runtime safety

### 3. Financial Domain Knowledge:
- **OHLCV:** Open, High, Low, Close, Volume
- **Technical Indicators:** RSI, MACD, Moving Averages
- **Market Data:** Order books, trades, tick data
- **Trading Concepts:** Leverage, margin, positions, orders

### 4. Architecture Patterns:
- **Pub/Sub:** For event-driven updates
- **Observer Pattern:** For WebSocket subscriptions
- **Singleton:** For WebSocket client
- **Factory Pattern:** For creating chart instances

---

## ✅ Pre-Interview Checklist

- [ ] Review WebSocket implementation in your project
- [ ] Prepare 2-3 specific examples of performance optimizations
- [ ] Practice explaining TradingView integration
- [ ] Review React performance optimization techniques
- [ ] Prepare questions about their tech stack
- [ ] Record a 2-4 minute performance trace demo (if possible)
- [ ] Review financial trading concepts
- [ ] Prepare examples of testing real-time UIs

---

## 💡 Questions to Ask Them

1. "What's the current update frequency you're experiencing? Any performance bottlenecks?"
2. "What charting library are you currently using, or planning to use?"
3. "How do you handle WebSocket scaling with multiple users?"
4. "What's your testing strategy for real-time features?"
5. "What's the team structure? How do frontend/backend/ML teams collaborate?"
6. "What are the biggest technical challenges you're facing?"

---

## 🎬 Final Tips

1. **Be Honest:** If you haven't implemented something, say so, but explain how you would approach it
2. **Show Learning:** Mention what you'd improve in your current implementation
3. **Ask Questions:** Show interest in their technical challenges
4. **Code Examples:** Have specific examples ready from your project
5. **Performance Focus:** Emphasize your experience with high-frequency updates
6. **Communication:** Demonstrate clear technical communication

Good luck! 🚀
