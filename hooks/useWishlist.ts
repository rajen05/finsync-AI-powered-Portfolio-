import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { WishlistItem, AssetType } from '../types'
import { useAuth } from '../context/AuthContext'

export const useWishlist = () => {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch wishlist from database
  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false })

      if (error) throw error

      // Transform database format to app format
      const transformedWishlist: WishlistItem[] = (data || []).map(item => ({
        id: item.id,
        ticker: item.ticker,
        assetType: item.asset_type as AssetType,
        targetPrice: item.target_price ? parseFloat(item.target_price) : undefined,
        notes: item.notes || undefined,
        addedAt: item.added_at,
      }))

      setWishlist(transformedWishlist)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching wishlist:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Add item to wishlist
  const addWishlistItem = async (item: Omit<WishlistItem, 'id' | 'addedAt'>) => {
    if (!user) {
      setError('User not authenticated')
      return
    }

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .insert({
          user_id: user.id,
          ticker: item.ticker,
          asset_type: item.assetType,
          target_price: item.targetPrice || null,
          notes: item.notes || null,
        })
        .select()
        .single()

      if (error) throw error

      // Refresh wishlist
      await fetchWishlist()
    } catch (err: any) {
      console.error('Error adding wishlist item:', err)
      setError(err.message)
      throw err
    }
  }

  // Remove item from wishlist
  const removeWishlistItem = async (id: string) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      // Refresh wishlist
      await fetchWishlist()
    } catch (err: any) {
      console.error('Error removing wishlist item:', err)
      setError(err.message)
      throw err
    }
  }

  // Update wishlist item
  const updateWishlistItem = async (id: string, updates: Partial<WishlistItem>) => {
    if (!user) return

    try {
      const dbUpdates: any = {}
      if (updates.ticker) dbUpdates.ticker = updates.ticker
      if (updates.assetType) dbUpdates.asset_type = updates.assetType
      if (updates.targetPrice !== undefined) dbUpdates.target_price = updates.targetPrice
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes

      const { error } = await supabase
        .from('wishlist')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      // Refresh wishlist
      await fetchWishlist()
    } catch (err: any) {
      console.error('Error updating wishlist item:', err)
      setError(err.message)
      throw err
    }
  }

  // Fetch wishlist when user changes
  useEffect(() => {
    fetchWishlist()
  }, [user])

  return {
    wishlist,
    loading,
    error,
    addWishlistItem,
    removeWishlistItem,
    updateWishlistItem,
    refetch: fetchWishlist,
  }
}
