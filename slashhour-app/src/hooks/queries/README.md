# TanStack Query Migration Guide

## 🎯 Why TanStack Query?

### Before (Manual API Calls)
```tsx
const [deals, setDeals] = useState([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchDeals = async () => {
    setIsLoading(true);
    try {
      const data = await dealService.getDeals();
      setDeals(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  fetchDeals();
}, []);
```

### After (TanStack Query)
```tsx
const { data: deals, isLoading, error } = useDeals();
```

**50% less code, automatic caching, background refetching, and more!**

---

## 📚 Available Query Hooks

### Deals
```tsx
import { useDeals, useDeal, useCreateDeal, useInfiniteDeals } from '../hooks/queries/useDealsQuery';

// List all deals
const { data: deals, isLoading } = useDeals({ category: 'food' });

// Single deal
const { data: deal } = useDeal('deal-id');

// Infinite scroll
const { data, fetchNextPage, hasNextPage } = useInfiniteDeals();

// Create deal
const { mutate: createDeal, isPending } = useCreateDeal();
createDeal(dealData);
```

### Businesses
```tsx
import { useBusinessProfile, useMyBusinesses } from '../hooks/queries/useBusinessQuery';

// Business profile
const { data: business } = useBusinessProfile('business-id');

// My businesses
const { data: myBusinesses } = useMyBusinesses();
```

---

## 🔄 Migration Examples

### Example 1: Simple Data Fetching

**Before:**
```tsx
function DealsList() {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeals = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await dealService.getDeals();
        setDeals(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeals();
  }, []);

  if (isLoading) return <Loading />;
  if (error) return <Error message={error} />;

  return <DealsGrid deals={deals} />;
}
```

**After:**
```tsx
import { useDeals } from '../hooks/queries/useDealsQuery';

function DealsList() {
  const { data: deals, isLoading, error } = useDeals();

  if (isLoading) return <Loading />;
  if (error) return <Error message={error.message} />;

  return <DealsGrid deals={deals} />;
}
```

---

### Example 2: Refetching & Pagination

**Before:**
```tsx
function FeedScreen() {
  const [deals, setDeals] = useState([]);
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDeals = async () => {
    const data = await dealService.getDeals({ page });
    setDeals(prev => [...prev, ...data]);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setPage(1);
    const data = await dealService.getDeals({ page: 1 });
    setDeals(data);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchDeals();
  }, [page]);

  return (
    <FlatList
      data={deals}
      onRefresh={handleRefresh}
      refreshing={isRefreshing}
      onEndReached={() => setPage(p => p + 1)}
    />
  );
}
```

**After:**
```tsx
import { useInfiniteDeals } from '../hooks/queries/useDealsQuery';

function FeedScreen() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useInfiniteDeals();

  const deals = data?.pages.flatMap(page => page.deals) ?? [];

  return (
    <FlatList
      data={deals}
      onRefresh={refetch}
      refreshing={isRefetching}
      onEndReached={() => hasNextPage && fetchNextPage()}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isFetchingNextPage ? <ActivityIndicator /> : null
      }
    />
  );
}
```

---

### Example 3: Mutations (Create/Update)

**Before:**
```tsx
function CreateDealForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (dealData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await dealService.createDeal(dealData);
      navigation.goBack();
      // Manual refetch on previous screen...
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Error message={error} />}
      <Button loading={isSubmitting}>Create</Button>
    </Form>
  );
}
```

**After:**
```tsx
import { useCreateDeal } from '../hooks/queries/useDealsQuery';

function CreateDealForm() {
  const { mutate: createDeal, isPending, error } = useCreateDeal();

  const handleSubmit = (dealData) => {
    createDeal(dealData, {
      onSuccess: () => {
        navigation.goBack();
        // Automatically refetches deals list!
      },
    });
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <Error message={error.message} />}
      <Button loading={isPending}>Create</Button>
    </Form>
  );
}
```

---

## 🎁 Key Benefits

### 1. Automatic Caching
```tsx
// First call - fetches from API
const { data } = useDeals();

// Second call elsewhere - returns cached data instantly!
const { data } = useDeals();
```

### 2. Background Refetching
```tsx
// Data refetches automatically:
// - When app comes to foreground
// - When internet reconnects
// - After stale time expires
```

### 3. Optimistic Updates
```tsx
const { mutate } = useUpdateDeal(dealId);

mutate(updates, {
  // Update UI immediately
  onMutate: async (newData) => {
    await queryClient.cancelQueries({ queryKey: ['deals', dealId] });
    const previous = queryClient.getQueryData(['deals', dealId]);
    queryClient.setQueryData(['deals', dealId], newData);
    return { previous };
  },
  // Rollback on error
  onError: (err, newData, context) => {
    queryClient.setQueryData(['deals', dealId], context.previous);
  },
});
```

### 4. Intelligent Retries
```tsx
// Automatically retries failed requests
// with exponential backoff
// 1st retry: 1s
// 2nd retry: 2s
// 3rd retry: 4s
```

### 5. Dependent Queries
```tsx
// Only fetch deal details if we have dealId
const { data: deal } = useDeal(dealId, {
  enabled: !!dealId,
});

// Only fetch reviews if we have the deal
const { data: reviews } = useReviews(deal?.id, {
  enabled: !!deal?.id,
});
```

---

## 🚀 Next Steps

1. **Migrate one screen at a time**
   - Start with FeedScreen (simple list)
   - Then DealDetailScreen (single item)
   - Then CreateDealScreen (mutations)

2. **Create more query hooks**
   - `useUserProfile`
   - `useFollowing`
   - `useConversations`

3. **Add DevTools (Development only)**
   ```tsx
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
   import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

   <QueryClientProvider client={queryClient}>
     <App />
     {__DEV__ && <ReactQueryDevtools />}
   </QueryClientProvider>
   ```

---

## 📖 Documentation

- Official docs: https://tanstack.com/query/latest
- Examples: https://tanstack.com/query/latest/docs/examples/react/basic
- Community: https://discord.com/invite/tanstack

---

**Your API calls are now 50% less code and 100% more powerful!** 🎉
