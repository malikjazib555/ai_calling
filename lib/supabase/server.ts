import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  // Check if Supabase env vars are set, otherwise return a mock client
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials not configured. Using mock client.')
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
      },
      from: (table: string) => {
        // Create a chainable query builder that supports multiple .eq() calls
        const createChainable = () => {
          const baseMethods = {
            order: async (column: string, options?: any) => ({ data: [], error: null }),
            limit: async (count: number) => ({ data: [], error: null }),
            single: async () => ({ data: null, error: null }),
          }
          
          const createEq = (): any => ({
            eq: (column: string, value: any) => createEq(), // Chainable .eq()
            in: (column: string, values: any[]) => ({
              order: async (column: string, options?: any) => ({ data: [], error: null }),
              single: async () => ({ data: null, error: null }),
              eq: (column2: string, value: any) => ({
                order: async (column: string, options?: any) => ({ data: [], error: null }),
                single: async () => ({ data: null, error: null }),
              }),
            }),
            ...baseMethods,
          })
          
          return {
            eq: (column: string, value: any) => createEq(), // First .eq() call
            in: (column: string, values: any[]) => ({
              order: async (column: string, options?: any) => ({ data: [], error: null }),
              single: async () => ({ data: null, error: null }),
              eq: (column2: string, value: any) => ({
                order: async (column: string, options?: any) => ({ data: [], error: null }),
                single: async () => ({ data: null, error: null }),
              }),
            }),
            ...baseMethods,
          }
        }
        
        return {
          select: (columns?: string) => createChainable(),
          insert: (values: any) => ({
          select: (columns?: string) => ({
            single: async () => ({
              data: {
                id: `demo-${Date.now()}`,
                ...values,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        }),
        upsert: (values: any, options?: any) => {
          // Return a chainable object that can be awaited or chained with .select()
          const result = {
            data: {
              id: values.id || `demo-${Date.now()}`,
              ...values,
              updated_at: new Date().toISOString(),
            },
            error: null,
          }
          
          // Return an object that can be awaited directly or chained
          const chainable: any = Promise.resolve(result)
          
          // Add .select() method for chaining
          chainable.select = (columns?: string) => Promise.resolve(result)
          
          return chainable
        },
        update: (values: any) => ({
          eq: (column: string, value: any) => ({
            eq: (column2: string, value2: any) => ({
              select: (columns?: string) => ({
                single: async () => ({
                  data: {
                    id: value,
                    ...values,
                    updated_at: new Date().toISOString(),
                  },
                  error: null,
                }),
              }),
            }),
            select: (columns?: string) => ({
              single: async () => ({
                data: {
                  id: value,
                  ...values,
                  updated_at: new Date().toISOString(),
                },
                error: null,
              }),
            }),
          }),
        }),
        delete: () => ({
          eq: (column: string, value: any) => ({
            eq: (column2: string, value2: any) => Promise.resolve({ error: null }),
          }),
        }),
        }
      }
    } as any
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}


