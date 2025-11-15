# API Layer Templates

This module provides templates for different API layer implementations in generated scaffolds.

## Overview

The API templates support three different API architectures:
1. **REST API** (fetch or axios-based)
2. **tRPC** (type-safe RPC)
3. **GraphQL** (with Apollo Client)

## REST API Templates

### Fetch-based Client (`rest-fetch`)

Generates a lightweight API client using native `fetch` with:
- Automatic retry logic (3 attempts with exponential backoff)
- Error handling with custom `ApiError` class
- Support for GET, POST, PUT, PATCH, DELETE methods
- Type-safe responses

**Generated Files:**
- `src/lib/api-client.ts` - API client with retry logic
- `src/app/api/users/route.ts` - Example CRUD endpoints
- `src/app/api/users/[id]/route.ts` - Single resource endpoints

### Axios-based Client (`rest-axios`)

Generates an axios-based API client with:
- Request/response interceptors
- Automatic token injection from localStorage
- Retry logic for 5xx errors
- Centralized error handling

**Generated Files:**
- `src/lib/api-client.ts` - Axios instance with interceptors
- `src/app/api/users/route.ts` - Example CRUD endpoints
- `src/app/api/users/[id]/route.ts` - Single resource endpoints

**Dependencies Added:**
- `axios: ^1.6.0`

## tRPC Templates

Generates a fully type-safe API layer using tRPC with:
- Type-safe procedures (queries and mutations)
- Zod schema validation
- React Query integration
- Automatic type inference

**Generated Files:**
- `src/lib/trpc/router.ts` - tRPC router with example procedures
- `src/app/api/trpc/[trpc]/route.ts` - tRPC API handler
- `src/lib/trpc/client.ts` - tRPC client configuration
- `src/lib/trpc/provider.tsx` - React provider component
- `src/app/users/page.tsx` - Example usage component

**Dependencies Added:**
- `@trpc/server: ^10.45.0`
- `@trpc/client: ^10.45.0`
- `@trpc/react-query: ^10.45.0`
- `@tanstack/react-query: ^5.17.0`
- `zod: ^3.22.0`

**Example Usage:**
```typescript
// Query
const { data: users } = trpc.getUsers.useQuery();

// Mutation
const createUser = trpc.createUser.useMutation({
  onSuccess: () => {
    trpc.useContext().getUsers.invalidate();
  },
});
```

## GraphQL Templates

Generates a GraphQL API with Apollo Client:
- Type-safe schema definitions
- Resolvers with database integration
- Apollo Client setup for both server and client components
- Example queries and mutations

**Generated Files:**
- `src/lib/graphql/schema.ts` - GraphQL schema and resolvers
- `src/app/api/graphql/route.ts` - GraphQL API handler
- `src/lib/graphql/client.ts` - Apollo Client configuration
- `src/lib/graphql/provider.tsx` - Apollo Provider component
- `src/lib/graphql/queries.ts` - Example queries and mutations
- `src/app/users/page.tsx` - Example usage component

**Dependencies Added:**
- `@apollo/client: ^3.8.0`
- `graphql: ^16.8.0`
- `@apollo/server: ^4.0.0`
- `@as-integrations/next: ^3.0.0`
- `graphql-tag: ^2.12.0`

**Example Usage:**
```typescript
// Query
const { data, loading } = useQuery(GET_USERS);

// Mutation
const [createUser] = useMutation(CREATE_USER, {
  onCompleted: () => refetch(),
});
```

## Database Integration

All API templates automatically integrate with the selected database:
- **Prisma**: Uses `db.user.findMany()`, `db.user.create()`, etc.
- **Drizzle**: Uses Drizzle ORM query methods
- **Supabase**: Uses Supabase client methods
- **None**: Provides mock data examples

## Error Handling

### REST API
- Custom `ApiError` class with status codes
- Automatic retry for 5xx errors
- Network error handling

### tRPC
- `TRPCError` with semantic error codes
- Zod validation errors
- Type-safe error responses

### GraphQL
- GraphQL error formatting
- Apollo error policies
- Network error handling

## Monorepo Support

For monorepo configurations, API templates:
- Use `NEXT_PUBLIC_API_URL` environment variable
- Generate files in `apps/web/src` directory
- Support cross-app communication

## Testing

Each API layer includes example endpoints that can be tested:

**REST:**
```bash
curl http://localhost:3000/api/users
```

**tRPC:**
```bash
curl http://localhost:3000/api/trpc/getUsers
```

**GraphQL:**
```bash
curl -X POST http://localhost:3000/api/graphql \
  -H "Content-Type: application/json" \
  -d '{"query": "{ users { id name email } }"}'
```

## Requirements Satisfied

- **Requirement 2.4**: Generate package.json with all required dependencies
- **Requirement 7.3**: tRPC validation warning for Express-only configs

## Future Enhancements

- WebSocket support for real-time features
- API rate limiting templates
- API documentation generation (Swagger/OpenAPI)
- Authentication middleware templates
